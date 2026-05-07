/**
 * BlockSettingsPanel
 *
 * Right-side slide-in settings panel for the selected block.
 * Renders type-specific settings (alignment, URL, etc.) and for FAQ Q&A
 * shows text-area editing + Generate with AI options — matching the existing
 * FAQEditPanel pattern.
 *
 * Reads/writes through the BlockEditorContext so no prop-drilling is needed.
 */

import React, { useState } from 'react';
import {
  X, AlignLeft, AlignCenter, AlignRight, Sparkles, RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Block, type BlockType } from './blockTypes';
import { useBlockEditorContext } from './BlockEditorContext';

// ── Label for block type ──────────────────────────────────────────────────────

const TYPE_LABEL: Partial<Record<BlockType, string>> = {
  heading:       'Heading',
  paragraph:     'Paragraph',
  list:          'List',
  quote:         'Quote',
  cta:           'CTA button',
  image:         'Image',
  divider:       'Divider',
  'author-bar':  'Author bar',
  code:          'Code block',
  'video-embed': 'Video embed',
  hero:          'Hero section',
  'feature-grid':'Feature grid',
  'stats-row':   'Stats row',
  'image-text':  'Image + text',
  testimonials:  'Testimonials',
  'faq-qa':      'Q&A pair',
  'faq-section': 'FAQ section',
};

// ── Generic settings group ────────────────────────────────────────────────────

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function AlignButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {(['left', 'center', 'right'] as const).map(a => {
        const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
        return (
          <button
            key={a}
            type="button"
            onClick={() => onChange(a)}
            className={cn(
              'flex-1 flex items-center justify-center py-1.5 rounded-md text-[11px] border transition-colors capitalize',
              value === a
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        );
      })}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'flex-1 py-1.5 rounded-md text-[11px] border transition-colors capitalize text-center',
            value === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── FAQ Q&A settings (special panel) ─────────────────────────────────────────

function FAQQASettings({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const { question, answer } = block.content as { question: string; answer: string };
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  function handleGenerate() {
    if (!prompt.trim() && !question.trim()) return;
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      onUpdate({
        answer: `${question ? `Based on "${question}", here's a comprehensive answer:` : ''} Our team provides exceptional service with attention to detail. We ensure every customer experience exceeds expectations through personalized care and prompt responses.`,
      });
      setGenerating(false);
    }, 1200);
  }

  return (
    <div className="space-y-4">
      {/* Question */}
      <SettingsGroup label="Question">
        <textarea
          value={question as string}
          onChange={e => onUpdate({ question: e.target.value })}
          placeholder="Type your question…"
          rows={3}
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground resize-none leading-relaxed"
        />
      </SettingsGroup>

      {/* Answer */}
      <SettingsGroup label="Answer">
        <textarea
          value={answer as string}
          onChange={e => onUpdate({ answer: e.target.value })}
          placeholder="Write a clear, helpful answer…"
          rows={5}
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground resize-none leading-relaxed"
        />
      </SettingsGroup>

      {/* Generate with AI */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-primary flex-none" />
          <span className="text-[12px] font-semibold text-primary">Generate with AI</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Describe what this answer should cover, or leave blank to generate from the question.
        </p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Include hours, pricing, and booking link…"
          rows={2}
          className="w-full text-[12px] border border-border rounded-lg px-2.5 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground resize-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {generating ? (
            <><RefreshCw size={12} strokeWidth={1.6} absoluteStrokeWidth className="animate-spin" />Generating…</>
          ) : (
            <><Sparkles size={12} strokeWidth={1.6} absoluteStrokeWidth />Generate answer</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── FAQ Section settings ──────────────────────────────────────────────────────

function FAQSectionSettings({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const { title } = block.content as { title: string };
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      onUpdate({
        items: [
          { id: crypto.randomUUID(), question: 'What are your hours of operation?', answer: 'We are open Monday–Saturday 10am–9pm and Sunday 11am–6pm.' },
          { id: crypto.randomUUID(), question: 'Do you offer reservations?', answer: 'Yes, reservations are available online or by phone.' },
          { id: crypto.randomUUID(), question: 'Is there parking available?', answer: 'Free parking is available in our lot behind the building.' },
        ],
      });
      setGenerating(false);
    }, 1400);
  }

  return (
    <div className="space-y-4">
      <SettingsGroup label="Section title">
        <input
          type="text"
          value={title as string}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="e.g. General questions"
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
        />
      </SettingsGroup>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-primary flex-none" />
          <span className="text-[12px] font-semibold text-primary">Generate Q&amp;As with AI</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          AI will generate relevant Q&amp;A pairs from your business data and reviews.
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {generating ? (
            <><RefreshCw size={12} strokeWidth={1.6} absoluteStrokeWidth className="animate-spin" />Generating…</>
          ) : (
            <><Sparkles size={12} strokeWidth={1.6} absoluteStrokeWidth />Generate Q&amp;As</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Type-specific settings ────────────────────────────────────────────────────

function BlockTypeSettings({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const c = block.content as Record<string, unknown>;

  switch (block.type) {

    case 'heading':
      return (
        <div className="space-y-4">
          <SettingsGroup label="Level">
            <ToggleGroup
              options={['h1', 'h2', 'h3']}
              value={String(c.level ?? 'h2')}
              onChange={v => onUpdate({ level: v })}
            />
          </SettingsGroup>
          <SettingsGroup label="Alignment">
            <AlignButtons value={String(c.align ?? 'left')} onChange={v => onUpdate({ align: v })} />
          </SettingsGroup>
        </div>
      );

    case 'paragraph':
      return (
        <SettingsGroup label="Alignment">
          <AlignButtons value={String(c.align ?? 'left')} onChange={v => onUpdate({ align: v })} />
        </SettingsGroup>
      );

    case 'list':
      return (
        <SettingsGroup label="List style">
          <ToggleGroup
            options={['• Bullets', '1. Numbers']}
            value={c.ordered ? '1. Numbers' : '• Bullets'}
            onChange={v => onUpdate({ ordered: v === '1. Numbers' })}
          />
        </SettingsGroup>
      );

    case 'quote':
      return (
        <SettingsGroup label="Alignment">
          <AlignButtons value={String(c.align ?? 'left')} onChange={v => onUpdate({ align: v })} />
        </SettingsGroup>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <SettingsGroup label="Variant">
            <ToggleGroup
              options={['primary', 'secondary', 'outline']}
              value={String(c.variant ?? 'primary')}
              onChange={v => onUpdate({ variant: v })}
            />
          </SettingsGroup>
          <SettingsGroup label="Button URL">
            <input
              type="url"
              value={String(c.url ?? '')}
              onChange={e => onUpdate({ url: e.target.value })}
              placeholder="https://…"
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
            />
          </SettingsGroup>
          <SettingsGroup label="Alignment">
            <AlignButtons value={String(c.align ?? 'left')} onChange={v => onUpdate({ align: v })} />
          </SettingsGroup>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <SettingsGroup label="Image URL">
            <input
              type="url"
              value={String(c.src ?? '')}
              onChange={e => onUpdate({ src: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
            />
          </SettingsGroup>
          <SettingsGroup label="Alt text">
            <input
              type="text"
              value={String(c.alt ?? '')}
              onChange={e => onUpdate({ alt: e.target.value })}
              placeholder="Describe the image…"
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
            />
          </SettingsGroup>
          <SettingsGroup label="Object fit">
            <ToggleGroup
              options={['cover', 'contain', 'fill']}
              value={String(c.objectFit ?? 'cover')}
              onChange={v => onUpdate({ objectFit: v })}
            />
          </SettingsGroup>
          {c.src && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={String(c.src)} alt="" className="w-full h-[100px] object-cover" />
              <button
                type="button"
                onClick={() => onUpdate({ src: '' })}
                className="w-full py-1.5 text-[11px] text-muted-foreground hover:text-destructive bg-muted/40 hover:bg-muted transition-colors"
              >
                Remove image
              </button>
            </div>
          )}
        </div>
      );

    case 'hero':
      return (
        <div className="space-y-4">
          <SettingsGroup label="Headline">
            <textarea
              value={String(c.headline ?? '')}
              onChange={e => onUpdate({ headline: e.target.value })}
              placeholder="Main headline…"
              rows={2}
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground resize-none"
            />
          </SettingsGroup>
          <SettingsGroup label="Subheadline">
            <textarea
              value={String(c.subheadline ?? '')}
              onChange={e => onUpdate({ subheadline: e.target.value })}
              placeholder="Supporting text…"
              rows={2}
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground resize-none"
            />
          </SettingsGroup>
          <SettingsGroup label="CTA label">
            <input
              type="text"
              value={String(c.ctaLabel ?? '')}
              onChange={e => onUpdate({ ctaLabel: e.target.value })}
              placeholder="Get started"
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
            />
          </SettingsGroup>
          <SettingsGroup label="CTA URL">
            <input
              type="url"
              value={String(c.ctaUrl ?? '')}
              onChange={e => onUpdate({ ctaUrl: e.target.value })}
              placeholder="https://…"
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
            />
          </SettingsGroup>
        </div>
      );

    case 'image-text':
      return (
        <SettingsGroup label="Image position">
          <ToggleGroup
            options={['left', 'right']}
            value={String(c.imagePosition ?? 'left')}
            onChange={v => onUpdate({ imagePosition: v })}
          />
        </SettingsGroup>
      );

    case 'faq-qa':
      return <FAQQASettings block={block} onUpdate={onUpdate} />;

    case 'faq-section':
      return <FAQSectionSettings block={block} onUpdate={onUpdate} />;

    case 'video-embed':
      return (
        <SettingsGroup label="Video URL">
          <input
            type="url"
            value={String(c.url ?? '')}
            onChange={e => onUpdate({ url: e.target.value })}
            placeholder="YouTube or Vimeo URL…"
            className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
          />
        </SettingsGroup>
      );

    case 'code':
      return (
        <SettingsGroup label="Language">
          <select
            value={String(c.language ?? 'javascript')}
            onChange={e => onUpdate({ language: e.target.value })}
            className="w-full text-[12px] border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors bg-background text-foreground"
          >
            {['javascript','typescript','python','html','css','json','bash','sql'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </SettingsGroup>
      );

    case 'divider':
      return <p className="text-[12px] text-muted-foreground text-center py-4">No settings for this block.</p>;

    default:
      return <p className="text-[12px] text-muted-foreground text-center py-4">Select a block to see its settings.</p>;
  }
}

// ── Block settings panel wrapper ──────────────────────────────────────────────

// Generic block-level settings (padding, background)
function GenericSettings({ block, onUpdate }: { block: Block; onUpdate: (p: Record<string, unknown>) => void }) {
  const s = block.settings;
  return (
    <div className="space-y-4 border-t border-border pt-4">
      <SettingsGroup label="Padding top">
        <ToggleGroup
          options={['sm', 'md', 'lg']}
          value={s.paddingTop ?? 'md'}
          onChange={v => onUpdate({ settings: { ...s, paddingTop: v } })}
        />
      </SettingsGroup>
      <SettingsGroup label="Padding bottom">
        <ToggleGroup
          options={['sm', 'md', 'lg']}
          value={s.paddingBottom ?? 'md'}
          onChange={v => onUpdate({ settings: { ...s, paddingBottom: v } })}
        />
      </SettingsGroup>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BlockSettingsPanel() {
  const { blocks, focusedId, updateBlock, focusBlock } = useBlockEditorContext();
  const block = blocks.find(b => b.id === focusedId) ?? null;
  const isOpen = focusedId !== null;

  return (
    <div
      className={cn(
        'flex-none flex flex-col border-l border-border transition-all duration-200 overflow-hidden bg-background',
        isOpen ? 'w-[300px]' : 'w-0',
      )}
      aria-hidden={!isOpen}
    >
      <div className="w-[300px] h-full flex flex-col overflow-hidden">
        {block && (
          <>
            {/* Header */}
            <div className="flex-none flex items-center justify-between px-4 h-12 border-b border-border">
              <span className="text-[13px] font-semibold text-foreground">
                {TYPE_LABEL[block.type] ?? 'Block'}
              </span>
              <button
                type="button"
                onClick={() => focusBlock(null)}
                aria-label="Close settings"
                className="flex items-center justify-center size-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={14} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </div>

            {/* Settings body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <BlockTypeSettings
                block={block}
                onUpdate={patch => updateBlock(block.id, patch)}
              />
              <GenericSettings
                block={block}
                onUpdate={patch => updateBlock(block.id, (patch as { settings: Record<string, unknown> }).settings ?? patch)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
