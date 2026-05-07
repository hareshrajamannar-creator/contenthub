/**
 * BlockLibraryPanel
 *
 * Left-panel "Manual" tab content for block modes (blog, landing, FAQ).
 * Mirrors the Birdeye Campaigns editor: Basic | Pre-built | Saved sub-tabs,
 * with a 3-column block grid. Clicking a block inserts it after the currently
 * focused block (or at the end).
 */

import React, { useState, useEffect } from 'react';
import { Search, BookmarkX, Sparkles, GripVertical, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { catalogForMode, type BlockEditorMode, type BlockType, BLOCK_CATALOG } from './blockTypes';
import { useBlockEditorContext } from './BlockEditorContext';
import {
  getSavedBlocks,
  removeSavedBlock,
  subscribeSavedBlocks,
  type SavedBlock,
} from '../shared/savedBlocksStore';

// ── Pre-built Birdeye-specific combinations ───────────────────────────────────

interface PrebuiltBlock {
  id: string;
  label: string;
  description: string;
  emoji: string;
  aiPowered?: boolean;
  types: BlockType[];
}

const PREBUILT_BLOCKS: Record<BlockEditorMode, PrebuiltBlock[]> = {
  blog: [
    {
      id: 'review-summary',
      label: 'Review summary',
      description: 'AI summary of recent customer reviews',
      emoji: '⭐',
      aiPowered: true,
      types: ['heading', 'paragraph', 'quote'],
    },
    {
      id: 'intro-with-author',
      label: 'Intro + author',
      description: 'Author bar followed by intro paragraph',
      emoji: '✍️',
      types: ['author-bar', 'heading', 'paragraph'],
    },
    {
      id: 'cta-section',
      label: 'CTA section',
      description: 'Heading, description and button',
      emoji: '🎯',
      types: ['heading', 'paragraph', 'cta'],
    },
    {
      id: 'image-story',
      label: 'Image story',
      description: 'Full-width image with heading and body',
      emoji: '🖼️',
      types: ['image', 'heading', 'paragraph'],
    },
  ],
  landing: [
    {
      id: 'hero-features',
      label: 'Hero + features',
      description: 'Hero block followed by feature grid',
      emoji: '🚀',
      types: ['hero', 'feature-grid'],
    },
    {
      id: 'social-proof',
      label: 'Social proof',
      description: 'Stats row and testimonials',
      emoji: '💬',
      types: ['stats-row', 'testimonials'],
    },
    {
      id: 'review-wall',
      label: 'Review wall',
      description: 'AI-curated customer testimonials',
      emoji: '⭐',
      aiPowered: true,
      types: ['heading', 'testimonials'],
    },
    {
      id: 'closing-cta',
      label: 'Closing CTA',
      description: 'Divider, headline, and action button',
      emoji: '🎯',
      types: ['divider', 'heading', 'cta'],
    },
  ],
  faq: [
    {
      id: 'full-faq',
      label: 'Full FAQ section',
      description: 'Section header + 5 Q&A pairs',
      emoji: '📋',
      aiPowered: true,
      types: ['faq-section'],
    },
    {
      id: 'top-questions',
      label: 'Top questions',
      description: 'AI-generated from your reviews',
      emoji: '🤖',
      aiPowered: true,
      types: ['heading', 'faq-qa', 'faq-qa', 'faq-qa'],
    },
    {
      id: 'intro-faq',
      label: 'Intro + FAQ',
      description: 'Short intro paragraph before Q&As',
      emoji: '💡',
      types: ['heading', 'paragraph', 'faq-section'],
    },
  ],
};

// ── SavedBlockCard ────────────────────────────────────────────────────────────

interface SavedBlockCardProps {
  block: SavedBlock;
  onInsert: () => void;
  onRemove: () => void;
}

function SavedBlockCard({ block, onInsert, onRemove }: SavedBlockCardProps) {
  const isFaq = block.sourceType === 'faq-section' || block.sourceType === 'faq-full';
  const Icon = block.sourceType === 'faq-full' ? MessageSquare : HelpCircle;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all group">
      {/* Drag handle row */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/30 border-b border-border">
        <GripVertical size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/30 cursor-grab" />
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          title="Remove from saved"
          className="p-0.5 rounded hover:bg-muted hover:text-destructive text-muted-foreground/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={11} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      {/* Preview area — click to insert */}
      <button
        type="button"
        onClick={onInsert}
        className="w-full text-left p-3"
      >
        {/* Mini preview thumbnail */}
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
            <span className="text-[11px] font-semibold text-foreground truncate">{block.preview.title}</span>
          </div>
          {block.preview.snippets.slice(0, 2).map((q, i) => (
            <div key={i} className="flex items-start gap-1 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-medium flex-none mt-px">Q{i + 1}</span>
              <span className="text-[10px] text-foreground/60 leading-snug line-clamp-1">{q}</span>
            </div>
          ))}
        </div>

        {/* Name + attribution */}
        <p className="text-[12px] font-medium text-foreground truncate">{block.name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Created by {block.createdBy}</p>
      </button>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

type SubTab = 'basic' | 'prebuilt' | 'saved';

interface BlockLibraryPanelProps {
  mode: BlockEditorMode;
}

export function BlockLibraryPanel({ mode }: BlockLibraryPanelProps) {
  const [tab, setTab] = useState<SubTab>('basic');
  const [query, setQuery] = useState('');
  const { addBlock, focusedId, blocks } = useBlockEditorContext();

  // Live saved blocks — subscribe so the panel updates immediately after saving from FAQ canvas
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>(() => getSavedBlocks());
  useEffect(() => {
    return subscribeSavedBlocks(blocks => setSavedBlocks(blocks));
  }, []);

  const catalog = catalogForMode(mode);

  // Category labels
  const categoryLabel: Record<string, string> = {
    text:    'Text',
    media:   'Media',
    layout:  'Layout',
    content: 'Content',
  };

  // Filter basic blocks by search
  const filtered = query
    ? catalog.filter(b =>
        b.label.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase()))
    : catalog;

  const groups = filtered.reduce<Record<string, typeof catalog>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  function insertBlock(type: BlockType) {
    // Insert after focused block, or at end
    const afterId = focusedId ?? blocks[blocks.length - 1]?.id ?? null;
    addBlock(type, afterId);
  }

  function insertPrebuilt(pb: PrebuiltBlock) {
    const afterId = focusedId ?? blocks[blocks.length - 1]?.id ?? null;
    // Insert all types in sequence
    pb.types.forEach((type, i) => {
      // Each subsequent block goes after the previous
      setTimeout(() => addBlock(type, afterId), i * 10);
    });
  }

  const prebuiltBlocks = PREBUILT_BLOCKS[mode] ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex-none flex border-b border-border">
        {(['basic', 'prebuilt', 'saved'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-[12px] font-medium capitalize transition-colors',
              tab === t
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'prebuilt' ? 'Pre-built' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Basic ──────────────────────────────────────────────────────────── */}
        {tab === 'basic' && (
          <div className="p-3 space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2 border border-border rounded-lg px-2.5 py-1.5 bg-background">
              <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search blocks…"
                className="flex-1 text-[12px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            {Object.entries(groups).length === 0 ? (
              <p className="text-center text-[12px] text-muted-foreground py-6">
                No blocks match "{query}"
              </p>
            ) : (
              Object.entries(groups).map(([cat, blocks]) => (
                <div key={cat}>
                  <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                    {categoryLabel[cat] ?? cat}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {blocks.map(b => (
                      <button
                        key={b.type}
                        type="button"
                        onClick={() => insertBlock(b.type)}
                        title={b.description}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] transition-all group/blk"
                      >
                        {/* 6-dot drag indicator (visual only) */}
                        <span className="text-muted-foreground/30 text-[8px] leading-none group-hover/blk:text-muted-foreground/60 transition-colors select-none">
                          ⠿
                        </span>
                        {/* Icon */}
                        <span className="text-[18px] leading-none">{b.icon}</span>
                        {/* Label */}
                        <span className="text-[10px] text-muted-foreground text-center leading-tight group-hover/blk:text-foreground transition-colors">
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Pre-built ──────────────────────────────────────────────────────── */}
        {tab === 'prebuilt' && (
          <div className="p-3 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2 border border-border rounded-lg px-2.5 py-1.5 bg-background">
              <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
              <input
                type="text"
                placeholder="Search pre-built…"
                className="flex-1 text-[12px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            {prebuiltBlocks.map(pb => (
              <button
                key={pb.id}
                type="button"
                onClick={() => insertPrebuilt(pb)}
                className="w-full flex flex-col gap-1 p-3 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all text-left group/pb"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{pb.emoji}</span>
                  <span className="text-[12px] font-medium text-foreground flex-1">{pb.label}</span>
                  {pb.aiPowered && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary bg-primary/8 px-1.5 py-0.5 rounded-full">
                      <Sparkles size={9} strokeWidth={1.6} absoluteStrokeWidth />
                      AI
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{pb.description}</p>
                {/* Block type chips */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {pb.types.slice(0, 4).map((t, i) => (
                    <span key={i} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded capitalize">
                      {t.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Saved ────────────────────────────────────────────────────────── */}
        {tab === 'saved' && (
          savedBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 px-6 text-center py-10">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                <BookmarkX size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-foreground">No saved blocks yet</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Use the bookmark icon on any FAQ section to save it here for reuse.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {savedBlocks.map(block => (
                <SavedBlockCard
                  key={block.id}
                  block={block}
                  onInsert={() => {
                    // Insert an faq-section block as a stand-in for the saved FAQ content
                    const afterId = focusedId ?? blocks[blocks.length - 1]?.id ?? null;
                    addBlock('faq-section', afterId);
                  }}
                  onRemove={() => removeSavedBlock(block.id)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
