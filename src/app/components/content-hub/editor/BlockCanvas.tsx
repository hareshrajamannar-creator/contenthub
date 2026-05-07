/**
 * BlockCanvas
 *
 * Main WYSIWYG block canvas for Blog, Landing, and FAQ.
 * - Reads/writes block state through BlockEditorContext
 * - Shows FAQRichToolbar at canvas top when a text element is focused
 * - Pinch-to-zoom (trackpad + Ctrl+scroll)
 * - Click-outside deselect
 * - Drag-to-reorder blocks
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { FileText, Layers, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockEditorMode, type Block } from './blockTypes';
import { useBlockEditorContext } from './BlockEditorContext';
import { BlockShell } from './BlockShell';
import { BlockPicker } from './BlockPicker';
import { FAQRichToolbar } from '../faq/FAQRichToolbar';

// Block component registry
import { HeadingBlock }      from './blocks/HeadingBlock';
import { ParagraphBlock }    from './blocks/ParagraphBlock';
import { DividerBlock }      from './blocks/DividerBlock';
import { ListBlock }         from './blocks/ListBlock';
import { QuoteBlock }        from './blocks/QuoteBlock';
import { CTABlock }          from './blocks/CTABlock';
import { ImageBlock }        from './blocks/ImageBlock';
import { AuthorBarBlock }    from './blocks/AuthorBarBlock';
import { CodeBlock }         from './blocks/CodeBlock';
import { VideoEmbedBlock }   from './blocks/VideoEmbedBlock';
import { HeroBlock }         from './blocks/HeroBlock';
import { FeatureGridBlock }  from './blocks/FeatureGridBlock';
import { StatsRowBlock }     from './blocks/StatsRowBlock';
import { ImageTextBlock }    from './blocks/ImageTextBlock';
import { TestimonialsBlock } from './blocks/TestimonialsBlock';
import { FAQQABlock }        from './blocks/FAQQABlock';
import { FAQSectionBlock }   from './blocks/FAQSectionBlock';

// ── Block renderer map ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_COMPONENTS: Record<string, React.FC<any>> = {
  heading:       HeadingBlock,
  paragraph:     ParagraphBlock,
  divider:       DividerBlock,
  list:          ListBlock,
  quote:         QuoteBlock,
  cta:           CTABlock,
  image:         ImageBlock,
  'author-bar':  AuthorBarBlock,
  code:          CodeBlock,
  'video-embed': VideoEmbedBlock,
  hero:          HeroBlock,
  'feature-grid':FeatureGridBlock,
  'stats-row':   StatsRowBlock,
  'image-text':  ImageTextBlock,
  testimonials:  TestimonialsBlock,
  'faq-qa':      FAQQABlock,
  'faq-section': FAQSectionBlock,
};

// ── Text block types — these show the rich text toolbar when focused ──────────

const TEXT_BLOCK_TYPES = new Set([
  'heading', 'paragraph', 'list', 'quote', 'hero',
  'feature-grid', 'image-text', 'faq-qa', 'faq-section',
  'testimonials', 'author-bar',
]);

// ── Empty state ───────────────────────────────────────────────────────────────

const MODE_META: Record<BlockEditorMode, { icon: React.ElementType; title: string; sub: string }> = {
  blog:    { icon: FileText,      title: 'Start building your blog post',   sub: 'Add a heading, write some text, or insert an image.' },
  landing: { icon: Layers,        title: 'Build your landing page',          sub: 'Start with a Hero block, then add features, stats, and a CTA.' },
  faq:     { icon: MessageSquare, title: 'Build your FAQ',                   sub: 'Add Q&A pairs or organise them into sections.' },
};

function EmptyState({ mode, onAdd }: { mode: BlockEditorMode; onAdd: (type: import('./blockTypes').BlockType) => void }) {
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[480px] gap-6 px-8 text-center">
      <div className="size-16 rounded-2xl bg-primary/8 flex items-center justify-center">
        <Icon size={28} strokeWidth={1.6} absoluteStrokeWidth className="text-primary/60" />
      </div>
      <div className="space-y-1.5">
        <p className="text-[16px] font-semibold text-foreground">{meta.title}</p>
        <p className="text-[13px] text-muted-foreground max-w-[340px] leading-relaxed">{meta.sub}</p>
      </div>
      <BlockPicker mode={mode} onAdd={onAdd} primary />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BlockCanvasProps {
  mode: BlockEditorMode;
  /** Controlled zoom level from the parent toolbar */
  zoom?: number;
  /** Called when trackpad/Ctrl+scroll changes zoom */
  onZoomChange?: (zoom: number) => void;
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export function BlockCanvas({ mode, zoom = 1, onZoomChange }: BlockCanvasProps) {
  const {
    blocks, focusedId,
    addBlock, updateBlock, removeBlock,
    focusBlock, moveUp, moveDown, duplicate, reorder,
  } = useBlockEditorContext();

  // Rich text toolbar visibility
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragSrcIdx = useRef<number | null>(null);

  // ── Track contentEditable focus for rich text toolbar
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement;
      if (el.isContentEditable) setToolbarVisible(true);
    }
    function onFocusOut(e: FocusEvent) {
      const related = (e as FocusEvent & { relatedTarget: Element | null }).relatedTarget;
      // Hide toolbar only if focus left the canvas entirely
      if (!container.contains(related as Node)) setToolbarVisible(false);
    }

    container.addEventListener('focusin', onFocusIn);
    container.addEventListener('focusout', onFocusOut);
    return () => {
      container.removeEventListener('focusin', onFocusIn);
      container.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // ── Pinch-to-zoom / Ctrl+Scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if ((e.ctrlKey || e.metaKey) && onZoomChange) {
      e.preventDefault();
      const delta = e.deltaY * -0.004;
      const next = Math.max(0.25, Math.min(3, parseFloat((zoom + delta).toFixed(2))));
      onZoomChange(next);
    }
  }, [zoom, onZoomChange]);

  // ── Drag-and-drop
  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    dragSrcIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragSrcIdx.current;
    if (fromIdx !== null && fromIdx !== toIdx) reorder(fromIdx, toIdx);
    dragSrcIdx.current = null;
  }, [reorder]);

  const handleDragEnd = useCallback(() => { dragSrcIdx.current = null; }, []);

  // ── Click outside blocks to deselect
  function handleCanvasClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-block-id]')) focusBlock(null);
  }

  return (
    <div
      ref={canvasRef}
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Rich text toolbar — fixed at top, fades in when text is selected */}
      <FAQRichToolbar visible={toolbarVisible} />

      {/* Scrollable canvas body */}
      <div
        className="flex-1 overflow-y-auto bg-[var(--color-canvas,#F7F8FA)]"
        onClick={handleCanvasClick}
      >
        {blocks.length === 0 ? (
          <EmptyState mode={mode} onAdd={type => addBlock(type, null)} />
        ) : (
          <div
            className="max-w-[760px] mx-auto px-12 py-8"
            style={{ zoom }}
          >
            {blocks.map((block: Block, idx: number) => {
              const BlockComponent = BLOCK_COMPONENTS[block.type];
              const isFocused = focusedId === block.id;

              return (
                <div key={block.id}>
                  {/* Insertion point above this block */}
                  <BlockPicker
                    mode={mode}
                    onAdd={type => addBlock(type, idx === 0 ? null : blocks[idx - 1].id)}
                  />

                  <BlockShell
                    blockId={block.id}
                    focused={isFocused}
                    onFocus={() => focusBlock(block.id)}
                    onBlur={() => {}}
                    onMoveUp={() => moveUp(block.id)}
                    onMoveDown={() => moveDown(block.id)}
                    onDuplicate={() => duplicate(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    {BlockComponent && (
                      <BlockComponent
                        blockId={block.id}
                        content={block.content}
                        settings={block.settings}
                        focused={isFocused}
                        onChange={(patch: Record<string, unknown>) => updateBlock(block.id, patch)}
                      />
                    )}
                  </BlockShell>
                </div>
              );
            })}

            {/* Final insertion point */}
            <BlockPicker
              mode={mode}
              onAdd={type => addBlock(type, blocks[blocks.length - 1]?.id ?? null)}
            />

            {/* Bottom breathing room */}
            <div className="h-24" />
          </div>
        )}
      </div>
    </div>
  );
}
