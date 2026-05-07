/**
 * blockTypes.ts
 *
 * Central type definitions, block catalog, and default content factory
 * for the block-based WYSIWYG editor used by Blog, Landing page, and FAQ.
 */

// ── Block types ────────────────────────────────────────────────────────────────

export type BlockType =
  // ─ Shared ─────────────────────────────────────────────────────────────────
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'divider'
  | 'list'
  | 'quote'
  | 'cta'
  // ─ Blog ───────────────────────────────────────────────────────────────────
  | 'author-bar'
  | 'code'
  | 'video-embed'
  // ─ Landing ────────────────────────────────────────────────────────────────
  | 'hero'
  | 'feature-grid'
  | 'stats-row'
  | 'image-text'
  | 'testimonials'
  // ─ FAQ ────────────────────────────────────────────────────────────────────
  | 'faq-section'
  | 'faq-qa';

export type BlockCategory = 'text' | 'media' | 'layout' | 'content';

export type BlockEditorMode = 'blog' | 'landing' | 'faq';

export interface BlockSettings {
  alignment?: 'left' | 'center' | 'right';
  width?: 'full' | 'contained';
  paddingTop?: 'sm' | 'md' | 'lg';
  paddingBottom?: 'sm' | 'md' | 'lg';
  background?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  /** Type-specific content fields — each block owns its own shape */
  content: Record<string, unknown>;
  settings: BlockSettings;
}

// ── Props shared by all block renderer components ─────────────────────────────

export interface BlockComponentProps<C extends Record<string, unknown> = Record<string, unknown>> {
  blockId: string;
  content: C;
  settings: BlockSettings;
  focused: boolean;
  onChange: (patch: Partial<C>) => void;
}

// ── Catalog ────────────────────────────────────────────────────────────────────

export interface BlockCatalogEntry {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory;
  /** Modes this block appears in. Undefined = all modes. */
  modes?: BlockEditorMode[];
}

export const BLOCK_CATALOG: BlockCatalogEntry[] = [
  // ── Shared text ────────────────────────────────────────────────────────────
  { type: 'heading',      label: 'Heading',      description: 'H1 / H2 / H3 title',       icon: 'T',   category: 'text' },
  { type: 'paragraph',    label: 'Paragraph',    description: 'Body text',                 icon: '¶',   category: 'text' },
  { type: 'list',         label: 'List',         description: 'Bullet or numbered list',   icon: '•',   category: 'text' },
  { type: 'quote',        label: 'Quote',        description: 'Pull quote or callout',     icon: '"',   category: 'text' },
  { type: 'cta',          label: 'CTA button',   description: 'Call-to-action button',     icon: '→',   category: 'text' },
  // ── Shared media ───────────────────────────────────────────────────────────
  { type: 'image',        label: 'Image',        description: 'Upload or paste a URL',     icon: '🖼',  category: 'media' },
  // ── Layout ─────────────────────────────────────────────────────────────────
  { type: 'divider',      label: 'Divider',      description: 'Horizontal separator',      icon: '—',   category: 'layout' },
  // ── Blog ───────────────────────────────────────────────────────────────────
  { type: 'author-bar',   label: 'Author bar',   description: 'Name · date · tags',        icon: '👤',  category: 'content', modes: ['blog'] },
  { type: 'code',         label: 'Code block',   description: 'Syntax-highlighted code',   icon: '</>',  category: 'content', modes: ['blog'] },
  { type: 'video-embed',  label: 'Video embed',  description: 'YouTube or Vimeo',          icon: '▶',   category: 'media',   modes: ['blog'] },
  // ── Landing ────────────────────────────────────────────────────────────────
  { type: 'hero',         label: 'Hero section', description: 'Headline + sub + CTA',      icon: '★',   category: 'content', modes: ['landing'] },
  { type: 'feature-grid', label: 'Feature grid', description: '2–4 feature cards',         icon: '⊞',   category: 'content', modes: ['landing'] },
  { type: 'stats-row',    label: 'Stats row',    description: 'Key numbers side by side',  icon: '📊',  category: 'content', modes: ['landing'] },
  { type: 'image-text',   label: 'Image + text', description: 'Side-by-side layout',       icon: '⬚T',  category: 'content', modes: ['landing'] },
  { type: 'testimonials', label: 'Testimonials', description: 'Customer review cards',     icon: '⭐',  category: 'content', modes: ['landing'] },
  // ── FAQ ────────────────────────────────────────────────────────────────────
  { type: 'faq-section',  label: 'FAQ section',  description: 'Grouped category + Q&As',   icon: '📂',  category: 'content', modes: ['faq'] },
  { type: 'faq-qa',       label: 'Q&A pair',     description: 'Single question + answer',  icon: '❓',  category: 'content', modes: ['faq'] },
];

// Blocks visible in a given mode (shared + mode-specific)
export function catalogForMode(mode: BlockEditorMode): BlockCatalogEntry[] {
  return BLOCK_CATALOG.filter(b => !b.modes || b.modes.includes(mode));
}

// ── Default content factory ────────────────────────────────────────────────────

export function defaultContent(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'heading':
      return { text: '', level: 'h2' };
    case 'paragraph':
      return { text: '' };
    case 'list':
      return { items: [''], ordered: false };
    case 'quote':
      return { text: '', attribution: '' };
    case 'cta':
      return { label: 'Book now', url: '', variant: 'primary' };
    case 'image':
      return { src: '', alt: '', caption: '' };
    case 'divider':
      return {};
    case 'author-bar':
      return { name: '', date: new Date().toISOString().split('T')[0], tags: [] };
    case 'code':
      return { language: 'javascript', code: '' };
    case 'video-embed':
      return { url: '', caption: '' };
    case 'hero':
      return { headline: '', subheadline: '', ctaLabel: 'Get started', ctaUrl: '' };
    case 'feature-grid':
      return {
        features: [
          { icon: '⚡', title: '', description: '' },
          { icon: '🎯', title: '', description: '' },
          { icon: '✨', title: '', description: '' },
        ],
      };
    case 'stats-row':
      return {
        stats: [
          { value: '', label: '' },
          { value: '', label: '' },
          { value: '', label: '' },
        ],
      };
    case 'image-text':
      return { src: '', alt: '', headline: '', body: '', imagePosition: 'left' };
    case 'testimonials':
      return { items: [{ quote: '', author: '', role: '' }] };
    case 'faq-section':
      return { title: 'General questions', items: [{ id: crypto.randomUUID(), question: '', answer: '' }] };
    case 'faq-qa':
      return { question: '', answer: '' };
    default:
      return {};
  }
}
