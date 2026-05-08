/**
 * ContentEditorShell
 *
 * The ONE unified shell for all content creation and editing.
 * Replaces: BlogEditor, EmailEditor, SocialEditor, FAQEditor,
 *           InfiniteCanvas, ProjectGenerationCanvas, UnifiedReviewCanvas,
 *           and the NewProjectBrief screen.
 *
 * Two levels:
 *  - level="project"  multi-content canvas (blog + social + email + FAQ + …)
 *  - level="item"     single-content deep editor (drill down from a card)
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │ Header: ← name  [Draft ▾]  brand · N locations  [Publish▾]  [⋮] │
 *  ├────────────┬─────────────────────────────────────┬───────────────┤
 *  │ Left panel │         Center canvas               │  Score panel  │
 *  │  280px     │  scrollable, flex-1                 │  272px (lazy) │
 *  └────────────┴─────────────────────────────────────┴───────────────┘
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft, ChevronDown, ChevronRight, Sparkles, Edit2,
  FileText, Share2, Mail, MessageSquare, Monitor, Video, FolderPlus,
  Plus, ChevronUp, Grid, List, Calendar, ZoomIn, ZoomOut,
  Undo2, Redo2, ArrowDown, ArrowRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';

import { cn } from '@/lib/utils';
import { AiCopilot } from '../AiCopilot';
import { EditorContentCard, type ContentCardData, type CardStatus } from './EditorContentCard';
import { EditorScorePanel } from './EditorScorePanel';
import { ManualPanel } from './EditorLeftPanel';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle.v1';
import { BlockCanvas } from './BlockCanvas';
import { BlockEditorProvider } from './BlockEditorContext';
import { BlockLibraryPanel } from './BlockLibraryPanel';
import { BlockSettingsPanel } from './BlockSettingsPanel';
import { InlineCreationFlow } from '../inline/InlineCreationFlow';
import type { InlineFlowData } from '../inline/InlineCreationFlow';
import type { GenerationInfo } from '../wizard/wizardTypes';
import { FAQInlineCreationFlow } from '../faq/FAQInlineCreationFlow';
import type { FAQFlowData, FlowNavControls, FlowNavState } from '../faq/FAQInlineCreationFlow';
import { Button } from '@/app/components/ui/button';
import { FAQGenerationProgress } from '../faq/FAQGenerationProgress';
import { FAQSectionCanvas } from '../faq/FAQSectionCanvas';
import { FAQPublishModal } from '../faq/FAQPublishModal';
import { BlogInlineCreationFlow } from '../blog/BlogInlineCreationFlow';
import type { BlogFlowData } from '../blog/BlogInlineCreationFlow';
import { BlogGenerationProgress } from '../blog/BlogGenerationProgress';
import { BlogSectionCanvas } from '../blog/BlogSectionCanvas';
import { ProjectGenerationProgress } from '../ProjectGenerationProgress';
import { ContentFlowStepper, type ContentFlowStep } from '../shared/ContentFlowControls';
// Note: FAQCanvas is kept for the project review canvas path (UnifiedReviewCanvas)
import {
  type ContentMode,
  type ContentItemType,
  type EditorTemplate,
  EDITOR_CONFIGS,
  ITEM_TYPE_LABEL,
  ITEM_TYPE_ICON,
} from './editorConfig';

/** Modes that use the block-based WYSIWYG canvas */
const BLOCK_MODES = new Set<ContentMode>(['blog', 'landing', 'faq']);
const CARD_CANVAS_GAP = 100;
const CARD_CANVAS_PADDING = 120;
const DEFAULT_CARD_WIDTH = 520;
const DEFAULT_CARD_HEIGHT = 520;
const CARD_MIN_WIDTH = 360;
const CARD_MIN_HEIGHT = 260;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentEditorShellProps {
  /** Which mode was used to open the editor */
  mode: ContentMode;
  /** 'project' = multi-card canvas; 'item' = single-content editor */
  level?: 'project' | 'item';
  /** Back navigation callback */
  onBack: () => void;
  /** Skip the setup wizard and land directly on the generation loading screen (e.g. from Recommendations) */
  skipSetupPhase?: boolean;
  /** Override the default title shown in the editor header */
  initialTitle?: string;
}

interface CanvasCardLayout {
  x: number;
  y: number;
  width: number;
  height?: number;
}

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left';

// ── Default FAQ flow data used when skipping the setup wizard ────────────────

const DEFAULT_REC_FAQ_FLOW_DATA: FAQFlowData = {
  brandKit: 'olive-garden',
  location: 'all',
  template: 'general',
  sourceUrl: '',
  additionalContext: '',
  questionCount: 14,
  signalSources: [],
  objective: 'aeo',
  publishTo: [],
  sections: [
    { id: 'sec-rec-1', title: 'General questions',        description: '', count: 5 },
    { id: 'sec-rec-2', title: 'Pricing and appointments', description: '', count: 5 },
    { id: 'sec-rec-3', title: 'Special cases',            description: '', count: 4 },
  ],
};

const DEFAULT_REC_BLOG_FLOW_DATA: BlogFlowData = {
  brandKit: 'olive-garden',
  location: 'all',
  topic: 'Dubbo property appraisal guide 2025',
  keywords: 'property appraisal Dubbo, house valuation, real estate Dubbo',
  tone: 'professional',
  audience: 'homeowners',
  wordTarget: 1200,
  publishTo: [],
  sections: [
    { id: 'blog-sec-1', heading: 'Introduction',                             description: '', wordCount: 150 },
    { id: 'blog-sec-2', heading: 'Why property appraisals matter in Dubbo',  description: '', wordCount: 200 },
    { id: 'blog-sec-3', heading: 'Key factors that affect property value',   description: '', wordCount: 250 },
    { id: 'blog-sec-4', heading: 'How to choose a qualified appraiser',      description: '', wordCount: 200 },
    { id: 'blog-sec-5', heading: 'How to get started',                       description: '', wordCount: 150 },
  ],
};


// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  FolderPlus, FileText, Share2, Mail, MessageSquare, Monitor, Video,
};

const SETUP_STEPS_BY_MODE: Record<ContentMode, ContentFlowStep[]> = {
  project: [
    { id: 'brand-kit', label: 'Brand kit' },
    { id: 'setup', label: 'Project setup' },
    { id: 'review-topics', label: 'Review topics' },
  ],
  faq: [
    { id: 'brand-kit', label: 'Brand kit' },
    { id: 'setup', label: 'Content setup' },
    { id: 'review-topics', label: 'Review topics' },
  ],
  blog: [
    { id: 'brand-kit', label: 'Brand kit' },
    { id: 'setup', label: 'Blog setup' },
    { id: 'review-topics', label: 'Review topics' },
  ],
  landing: [
    { id: 'goal', label: 'Goal' },
    { id: 'template', label: 'Template' },
    { id: 'fine-tune', label: 'Fine-tune' },
    { id: 'review-topics', label: 'Review topics' },
  ],
  social: [],
  email: [],
  video: [],
};

// ── Left panel tab items ──────────────────────────────────────────────────────

const LEFT_TAB_ITEMS = [
  {
    value: 'ai'     as const,
    label: 'AI',
    icon:  <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-[#7c3aed]" />,
  },
  { value: 'manual' as const, label: 'Manual' },
];

// ── Mock seed data per content type ──────────────────────────────────────────

function makeMockCard(itemType: ContentItemType, idx: number): ContentCardData {
  const typeScore: Record<ContentItemType, number> = {
    blog: 87, social: 82, email: 85, faq: 79, landing: 76, video: 80,
  };
  const names: Record<ContentItemType, string> = {
    blog:    'How local businesses are winning with AI-powered review responses',
    social:  'Spring outdoor seating announcement',
    email:   'Your table is waiting this spring',
    faq:     'Frequently asked questions — Olive Garden',
    landing: 'Spring dining experience landing page',
    video:   'Behind the scenes — Olive Garden kitchen',
  };
  return {
    id: `${itemType}-${idx}`,
    itemType,
    name: idx === 0 ? names[itemType] : `${ITEM_TYPE_LABEL[itemType]} #${idx + 1}`,
    status: (idx === 0 ? 'Ready' : 'Draft') as CardStatus,
    score: typeScore[itemType] - (idx * 4),
    approved: false,
  };
}

function defaultCardSize(itemType: ContentItemType): Pick<CanvasCardLayout, 'width' | 'height'> {
  if (itemType === 'blog') return { width: 560, height: 640 };
  if (itemType === 'landing') return { width: 560, height: 680 };
  if (itemType === 'email') return { width: 560, height: 420 };
  if (itemType === 'social') return { width: 480, height: 560 };
  return { width: DEFAULT_CARD_WIDTH, height: DEFAULT_CARD_HEIGHT };
}

function arrangeCardLayouts(
  cards: ContentCardData[],
  direction: 'vertical' | 'horizontal',
  existing: Record<string, CanvasCardLayout> = {},
  measuredHeights: Record<string, number> = {},
): Record<string, CanvasCardLayout> {
  let cursorX = CARD_CANVAS_PADDING;
  let cursorY = CARD_CANVAS_PADDING;

  return cards.reduce<Record<string, CanvasCardLayout>>((layouts, card) => {
    const size = existing[card.id] ?? defaultCardSize(card.itemType);
    const measuredHeight = measuredHeights[card.id] ?? defaultCardSize(card.itemType).height;
    layouts[card.id] = {
      x: cursorX,
      y: cursorY,
      width: size.width,
      height: existing[card.id]?.height,
    };

    if (direction === 'horizontal') cursorX += size.width + CARD_CANVAS_GAP;
    else cursorY += Math.max(existing[card.id]?.height ?? 0, measuredHeight) + CARD_CANVAS_GAP;

    return layouts;
  }, {});
}

/** For project mode, generate cards from selected content types */
function generateProjectCards(answers: Record<string, string | string[]>): ContentCardData[] {
  const selected = answers['content_types'];
  const typeMap: Record<string, ContentItemType> = {
    'Blog post': 'blog',
    'Social post': 'social',
    'Email campaign': 'email',
    'FAQ page': 'faq',
    'Landing page': 'landing',
    'Video post': 'video',
  };

  let types: ContentItemType[];
  if (Array.isArray(selected) && selected.length > 0) {
    types = selected.map(s => typeMap[s]).filter(Boolean) as ContentItemType[];
  } else {
    types = ['blog', 'social', 'email', 'faq'];
  }

  return types.map((type, i) => makeMockCard(type, i));
}

/** For single content-type modes, seed one card */
function seedSingleCard(mode: ContentMode): ContentCardData[] {
  if (mode === 'project') return [];
  return [makeMockCard(mode as ContentItemType, 0)];
}

// ── Left panel skeleton (shown while FAQ is generating) ──────────────────────

function LeftPanelSkeleton() {
  return (
    <div className="flex flex-col h-full" style={{ width: 300, borderRight: '1px solid #e5e9f0' }}>
      {/* Tab bar skeleton */}
      <div className="flex-none px-4 py-3 border-b border-border">
        <div className="flex gap-1 bg-muted rounded-lg p-1 animate-pulse">
          <div className="flex-1 h-7 rounded-md bg-background" />
          <div className="flex-1 h-7 rounded-md bg-muted/60" />
        </div>
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 min-h-0 overflow-hidden px-4 py-4 flex flex-col gap-4">
        {/* AI message */}
        <div className="flex gap-2 animate-pulse" style={{ animationDelay: '0s' }}>
          <div className="size-6 rounded-full bg-primary/20 flex-none mt-0.5" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-5/6 rounded-full bg-muted" />
            <div className="h-3 w-4/5 rounded-full bg-muted" />
            <div className="h-3 w-3/5 rounded-full bg-muted" />
          </div>
        </div>
        {/* User message */}
        <div className="flex gap-2 justify-end animate-pulse" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col gap-2 items-end" style={{ maxWidth: '80%' }}>
            <div className="h-8 w-full rounded-lg bg-muted" />
          </div>
          <div className="size-6 rounded-full bg-muted flex-none mt-0.5" />
        </div>
        {/* AI message 2 */}
        <div className="flex gap-2 animate-pulse" style={{ animationDelay: '0.2s' }}>
          <div className="size-6 rounded-full bg-primary/20 flex-none mt-0.5" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-full rounded-full bg-muted" />
            <div className="h-3 w-4/6 rounded-full bg-muted" />
          </div>
        </div>
        {/* Typing indicator */}
        <div className="flex gap-2 animate-pulse" style={{ animationDelay: '0.3s' }}>
          <div className="size-6 rounded-full bg-primary/20 flex-none mt-0.5" />
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted h-8 w-16">
            <div className="size-1.5 rounded-full bg-muted-foreground/40" />
            <div className="size-1.5 rounded-full bg-muted-foreground/40" />
            <div className="size-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      </div>

      {/* Prompt input skeleton */}
      <div className="flex-none px-4 py-3 border-t border-border animate-pulse">
        <div className="rounded-xl border border-border bg-background p-3 flex flex-col gap-2">
          <div className="h-3 w-3/4 rounded-full bg-muted" />
          <div className="h-3 w-2/5 rounded-full bg-muted/60" />
          <div className="flex items-center justify-between mt-1">
            <div className="flex gap-1.5">
              <div className="size-6 rounded-md bg-muted" />
              <div className="size-6 rounded-md bg-muted" />
              <div className="size-6 rounded-md bg-muted" />
            </div>
            <div className="size-6 rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generating skeleton ───────────────────────────────────────────────────────

function GeneratingSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-primary animate-pulse" />
        <span className="text-[13px] font-medium text-foreground">Generating your content…</span>
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-background overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <div className="h-12 border-b border-border bg-muted/40 px-4 flex items-center gap-3">
            <div className="size-6 rounded-md bg-muted" />
            <div className="h-3 w-48 rounded-full bg-muted" />
          </div>
          <div className="px-6 py-6 space-y-3">
            <div className="h-4 w-3/4 rounded-full bg-muted" />
            <div className="h-3 w-full rounded-full bg-muted" />
            <div className="h-3 w-5/6 rounded-full bg-muted" />
            <div className="h-3 w-2/3 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Editor mockup illustration ────────────────────────────────────────────────

function EditorIllustration() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer card */}
      <rect x="4" y="4" width="212" height="152" rx="10" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1"/>
      {/* Left panel */}
      <rect x="12" y="12" width="68" height="136" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.75"/>
      {/* AI+ badge in left panel */}
      <rect x="18" y="18" width="24" height="10" rx="3" fill="hsl(var(--primary) / 0.15)"/>
      <text x="30" y="26" textAnchor="middle" fontSize="6" fontWeight="700" fill="hsl(var(--primary))">AI+</text>
      {/* Left panel text lines */}
      <rect x="18" y="32" width="55" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.25)"/>
      <rect x="18" y="39" width="48" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.15)"/>
      {/* Chip buttons in left panel */}
      <rect x="18" y="48" width="52" height="10" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.75"/>
      <rect x="18" y="62" width="42" height="10" rx="3" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.75"/>
      <rect x="18" y="76" width="48" height="10" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.75"/>
      {/* Text input in left panel */}
      <rect x="18" y="116" width="56" height="26" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.75"/>
      <rect x="22" y="121" width="36" height="2.5" rx="1.25" fill="hsl(var(--muted-foreground) / 0.2)"/>
      <rect x="22" y="127" width="28" height="2.5" rx="1.25" fill="hsl(var(--muted-foreground) / 0.12)"/>
      {/* Right / canvas panel */}
      <rect x="88" y="12" width="124" height="136" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.75"/>
      {/* Image placeholder */}
      <rect x="94" y="18" width="112" height="52" rx="4" fill="hsl(var(--primary) / 0.08)"/>
      <rect x="136" y="36" width="28" height="3" rx="1.5" fill="hsl(var(--primary) / 0.2)"/>
      <rect x="130" y="43" width="40" height="3" rx="1.5" fill="hsl(var(--primary) / 0.12)"/>
      {/* Content lines */}
      <rect x="94" y="78" width="112" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.2)"/>
      <rect x="94" y="85" width="96" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.14)"/>
      <rect x="94" y="92" width="104" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.1)"/>
      <rect x="94" y="104" width="112" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.2)"/>
      <rect x="94" y="111" width="80" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.14)"/>
      {/* Score pill */}
      <rect x="152" y="130" width="50" height="12" rx="6" fill="hsl(var(--primary))"/>
      <rect x="156" y="134" width="30" height="4" rx="2" fill="white" opacity="0.7"/>
    </svg>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: EditorTemplate;
  onSelect: (t: EditorTemplate) => void;
}) {
  // Muted, low-saturation tint for the header strip inside the white frame
  const headerBg = `hsl(${template.hue},30%,55%)`;
  const accentBg = `hsl(${template.hue},25%,92%)`;

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-md transition-all group text-left w-full"
    >
      {/* Gray container — 20px padding, white screenshot frame inside */}
      <div className="w-full bg-zinc-100 p-5 relative overflow-hidden">
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-black/[0.07]" style={{ height: 120 }}>
          {/* Muted colored header strip */}
          <div className="h-[42px] w-full flex items-center gap-2 px-2.5" style={{ background: headerBg }}>
            {/* Logo circle */}
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center shrink-0 text-white font-bold" style={{ fontSize: 7 }}>
              {template.title[0]}
            </div>
            <div className="flex flex-col gap-[3px] flex-1">
              <div className="h-[2.5px] w-full bg-white/70 rounded-full" />
              <div className="h-[2px] w-3/4 bg-white/40 rounded-full" />
            </div>
            {/* Emoji top-right */}
            <div className="text-sm leading-none">{template.emoji}</div>
          </div>
          {/* Body lines */}
          <div className="px-2.5 pt-2 pb-1.5 flex flex-col gap-[5px]">
            <div className="h-[3px] w-full bg-zinc-200 rounded-full" />
            <div className="h-[3px] w-4/5 bg-zinc-200 rounded-full" />
            <div className="h-[10px] w-full rounded-[3px] mt-0.5" style={{ background: accentBg }} />
            <div className="h-[3px] w-full bg-zinc-100 rounded-full" />
            <div className="h-[3px] w-2/3 bg-zinc-100 rounded-full" />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/45 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <span className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground shadow-sm">
            Use template
          </span>
        </div>
      </div>
      {/* Footer */}
      <div className="px-3 py-2.5">
        <p className="text-[12.5px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {template.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Types: {template.typesLabel}
        </p>
      </div>
    </button>
  );
}

// ── Empty canvas state ────────────────────────────────────────────────────────

const INITIAL_SHOW = 5;

function EmptyCanvas({
  mode,
  onAddCard,
  onSelectTemplate,
}: {
  mode: ContentMode;
  onAddCard: (t: ContentItemType) => void;
  onSelectTemplate: (t: EditorTemplate) => void;
}) {
  const config = EDITOR_CONFIGS[mode];
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visibleTemplates = showAll ? config.templates : config.templates.slice(0, INITIAL_SHOW);

  return (
    <div className="flex flex-col items-center px-8 py-10 gap-6 min-h-full">
      {/* Illustration */}
      <EditorIllustration />

      {/* Prompt text */}
      <div className="text-center space-y-1">
        <p className="text-[14px] font-medium text-foreground">
          Chat with our AI Copilot to generate content for your {mode === 'project' ? 'project' : config.label.toLowerCase()}
        </p>
        <p className="text-[13px] text-muted-foreground">or</p>
        <button
          type="button"
          onClick={() => setLibraryOpen(v => !v)}
          className="text-[13px] font-medium text-primary hover:underline flex items-center gap-1 mx-auto"
        >
          Select from library
          {libraryOpen
            ? <ChevronUp size={13} strokeWidth={1.6} absoluteStrokeWidth />
            : <ChevronDown size={13} strokeWidth={1.6} absoluteStrokeWidth />
          }
        </button>
      </div>

      {/* Template cards — 5-column grid */}
      {libraryOpen && (
        <div className="w-full">
          <div className="grid grid-cols-5 gap-3">
            {visibleTemplates.map(t => (
              <TemplateCard key={t.id} template={t} onSelect={onSelectTemplate} />
            ))}
          </div>
          {!showAll && config.templates.length > INITIAL_SHOW && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-4 text-[13px] font-medium text-primary hover:underline mx-auto block"
            >
              Show more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add content button (between groups) ──────────────────────────────────────

function AddContentButton({ mode, onAdd }: { mode: ContentMode; onAdd: (t: ContentItemType) => void }) {
  const addable = EDITOR_CONFIGS[mode].addableTypes ?? [];
  if (addable.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-colors text-[12.5px] text-muted-foreground hover:text-foreground mx-auto"
        >
          <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
          Add content
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[200px]">
        {addable.map(type => {
          const IconEl = ICON_MAP[ITEM_TYPE_ICON[type]] ?? FileText;
          return (
            <DropdownMenuItem key={type} onClick={() => onAdd(type)} className="gap-3">
              <div className="size-6 rounded-md bg-primary/[0.07] flex items-center justify-center flex-none">
                <IconEl size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/70" />
              </div>
              {ITEM_TYPE_LABEL[type]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function ContentEditorShell({ mode, level = 'project', onBack, skipSetupPhase = false, initialTitle }: ContentEditorShellProps) {
  const config = EDITOR_CONFIGS[mode];

  // ── Header state
  const [title, setTitle] = useState(
    initialTitle ?? (mode === 'project' ? 'New project' : `New ${config.label.toLowerCase()}`)
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // ── Left panel tab state
  const [leftTab, setLeftTab] = useState<'ai' | 'manual'>('ai');

  // ── Setup phase state (inline flow instead of modal)
  // 'setup'      → InlineCreationFlow fills the canvas, left pane is hidden
  // 'generating' → shimmer cards
  // 'done'       → normal canvas + left pane visible
  const needsSetup = !skipSetupPhase && (BLOCK_MODES.has(mode) || mode === 'project');
  type SetupPhase = 'setup' | 'generating' | 'done';
  const [setupPhase, setSetupPhase] = useState<SetupPhase>(
    skipSetupPhase && (mode === 'faq' || mode === 'blog') ? 'generating' : (needsSetup ? 'setup' : 'done')
  );
  const [flowData, setFlowData]         = useState<InlineFlowData | null>(null);
  const [generationInfo, setGenerationInfo] = useState<GenerationInfo | null>(
    skipSetupPhase && mode === 'faq'
      ? { label: 'AEO optimized · 14 FAQs · 3 sections', wizardData: null as unknown as import('../wizard/wizardTypes').WizardData }
      : skipSetupPhase && mode === 'blog'
      ? { label: 'SEO + AEO optimized · 1,200 words · 5 sections', wizardData: null as unknown as import('../wizard/wizardTypes').WizardData }
      : null
  );
  const [faqFlowData, setFaqFlowData] = useState<FAQFlowData | null>(
    skipSetupPhase && mode === 'faq' ? DEFAULT_REC_FAQ_FLOW_DATA : null
  );
  const [blogFlowData, setBlogFlowData] = useState<BlogFlowData | null>(
    skipSetupPhase && mode === 'blog' ? DEFAULT_REC_BLOG_FLOW_DATA : null
  );

  // ── Wizard navigation state (drives the setup-phase header)
  const flowNavRef = useRef<FlowNavControls | null>(null);
  const [wizardNavState, setWizardNavState] = useState<FlowNavState>({
    step: 0,
    totalSteps: SETUP_STEPS_BY_MODE[mode].length || 1,
    canAdvance: true,
  });

  // True when the user clicks "Edit settings" on an already-generated canvas
  const isEditingSettings = generationInfo !== null && setupPhase === 'setup';
  const [regenConfirmOpen, setRegenConfirmOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  function buildGenerationLabel(data: InlineFlowData): string {
    const goalLabel: Record<string, string> = {
      seo: 'SEO traffic', authority: 'Thought leadership', education: 'Product education',
      story: 'Customer story', leads: 'Lead generation', showcase: 'Product showcase',
      event: 'Event registration', service: 'Service promotion',
      bookings: 'Drive bookings', reviews: 'Generate reviews', product: 'Product promotion',
      awareness: 'Brand awareness',
    };
    if (data.mode === 'faq') {
      const goal = goalLabel[data.goal ?? 'seo'] ?? 'FAQ';
      return `${goal} · ${data.tone ?? 'Professional'} · ${data.count ?? 12} FAQs`;
    }
    if (data.mode === 'project') {
      const typeLabels: Record<string, string> = {
        campaign: 'Campaign pack', location: 'Location rollout',
        product: 'Product launch', reviews: 'Review series', custom: 'Custom',
      };
      return `${typeLabels[data.projectType ?? 'campaign']} · ${data.tone ?? 'Professional'}`;
    }
    return `${goalLabel[data.goal ?? 'seo'] ?? data.goal ?? 'Content'} · ${data.tone ?? 'Professional'} · ${data.length ?? 'medium'}`;
  }

  function handleInlineFlowComplete(data: InlineFlowData) {
    setFlowData(data);
    const label = buildGenerationLabel(data);
    setGenerationInfo({ label, wizardData: null as unknown as import('../wizard/wizardTypes').WizardData });

    // Determine cards to generate from the ideas in the flow data
    const newCards: ContentCardData[] = data.ideas && data.ideas.length > 0
      ? data.ideas.map((idea, i) => ({
          id: `${idea.type}-${i}`,
          itemType: idea.type as ContentItemType,
          name: idea.title,
          status: 'Draft' as CardStatus,
          score: 84 - (i * 3),
          approved: false,
        }))
      : mode === 'project'
        ? generateProjectCards({})
        : [makeMockCard(mode as ContentItemType, 0)];

    if (data.mode === 'project') {
      // Store cards in ref; ProjectGenerationProgress will call handleProjectGenerationComplete
      pendingProjectCardsRef.current = newCards;
      setSetupPhase('generating');
      setCards([]);
      setGenerateCount(newCards.length);
    } else {
      setSetupPhase('generating');
      setCards([]);
      setGenerateCount(newCards.length);
      setTimeout(() => {
        setSetupPhase('done');
        setCards(newCards);
      }, newCards.length * 420 + 900);
    }
  }

  function handleProjectGenerationComplete() {
    setSetupPhase('done');
    setCards(pendingProjectCardsRef.current);
  }

  function handleFAQFlowComplete(data: FAQFlowData) {
    setFaqFlowData(data);
    const totalQ = data.sections.reduce((s, sec) => s + sec.count, 0);
    const label = `AEO optimized · ${totalQ} FAQs · ${data.sections.length} sections`;
    setGenerationInfo({ label, wizardData: null as unknown as import('../wizard/wizardTypes').WizardData });
    setSetupPhase('generating');
  }

  function handleFAQGenerationComplete() {
    setSetupPhase('done');
  }

  function handleBlogFlowComplete(data: BlogFlowData) {
    setBlogFlowData(data);
    const totalWords = data.sections.reduce((s, sec) => s + sec.wordCount, 0);
    const label = `${data.tone} · ${totalWords} words · ${data.sections.length} sections`;
    setGenerationInfo({ label, wizardData: null as unknown as import('../wizard/wizardTypes').WizardData });
    setSetupPhase('generating');
  }

  function handleBlogGenerationComplete() {
    setSetupPhase('done');
  }

  function handleEditSettings() {
    setSetupPhase('setup');
  }

  // ── Canvas state
  const [cards, setCards] = useState<ContentCardData[]>(() => needsSetup ? [] : seedSingleCard(mode));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(4);
  const pendingProjectCardsRef = useRef<ContentCardData[]>([]);

  // ── Floating toolbar state (canvas)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [zoom, setZoom] = useState(1);
  const [layoutDirection, setLayoutDirection] = useState<'vertical' | 'horizontal'>('horizontal');
  const [cardLayouts, setCardLayouts] = useState<Record<string, CanvasCardLayout>>({});
  const [measuredCardHeights, setMeasuredCardHeights] = useState<Record<string, number>>({});
  const cardResizeObserverRef = useRef<ResizeObserver | null>(null);
  const cardElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStateRef = useRef<{
    type: 'move' | 'resize';
    cardId: string;
    edge?: ResizeEdge;
    startX: number;
    startY: number;
    initial: CanvasCardLayout;
    initialHeight: number;
  } | null>(null);

  // ── Undo / redo history (tracks card list snapshots)
  const historyRef = useRef<ContentCardData[][]>([]);
  const historyIdxRef = useRef(-1);
  const pushHistory = useCallback((snapshot: ContentCardData[]) => {
    // Trim any forward history then push
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);
  const [historyVersion, setHistoryVersion] = useState(0); // triggers re-render on history change
  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    setCards(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    setCards(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (cards.length === 0) {
      setCardLayouts({});
      return;
    }

    setCardLayouts(prev => {
      let changed = false;
      const next: Record<string, CanvasCardLayout> = {};
      const fallback = arrangeCardLayouts(cards, layoutDirection, prev, measuredCardHeights);

      cards.forEach(card => {
        if (prev[card.id]) next[card.id] = prev[card.id];
        else {
          next[card.id] = fallback[card.id];
          changed = true;
        }
      });

      if (Object.keys(prev).length !== cards.length) changed = true;
      return changed ? next : prev;
    });
  }, [cards, layoutDirection, measuredCardHeights]);

  useEffect(() => () => {
    cardResizeObserverRef.current?.disconnect();
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = dragStateRef.current;
      if (!drag) return;

      event.preventDefault();
      const dx = (event.clientX - drag.startX) / zoom;
      const dy = (event.clientY - drag.startY) / zoom;

      setCardLayouts(prev => {
        const current = prev[drag.cardId] ?? drag.initial;
        if (drag.type === 'resize') {
          const nextLayout = { ...current };
          if (drag.edge === 'right') {
            nextLayout.width = Math.max(CARD_MIN_WIDTH, drag.initial.width + dx);
          }
          if (drag.edge === 'left') {
            const nextWidth = Math.max(CARD_MIN_WIDTH, drag.initial.width - dx);
            nextLayout.width = nextWidth;
            nextLayout.x = drag.initial.x + (drag.initial.width - nextWidth);
          }
          if (drag.edge === 'bottom') {
            nextLayout.height = Math.max(CARD_MIN_HEIGHT, drag.initialHeight + dy);
          }
          if (drag.edge === 'top') {
            const nextHeight = Math.max(CARD_MIN_HEIGHT, drag.initialHeight - dy);
            nextLayout.height = nextHeight;
            nextLayout.y = Math.max(0, drag.initial.y + (drag.initialHeight - nextHeight));
          }

          return {
            ...prev,
            [drag.cardId]: nextLayout,
          };
        }

        return {
          ...prev,
          [drag.cardId]: {
            ...current,
            x: Math.max(0, drag.initial.x + dx),
            y: Math.max(0, drag.initial.y + dy),
          },
        };
      });
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [zoom]);

  // Wrap setCards so every mutation is recorded in history
  const setCardsWithHistory = useCallback((updater: ContentCardData[] | ((prev: ContentCardData[]) => ContentCardData[])) => {
    setCards(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      setHistoryVersion(v => v + 1);
      return next;
    });
  }, [pushHistory]);

  // ── Score panel state
  const [activeScoreCardId, setActiveScoreCardId] = useState<string | null>(null);

  // ── Handlers

  const handleGenerate = useCallback((answers: Record<string, string | string[]>) => {
    // Project: generate cards from selected types; single: show one card
    const newCards = mode === 'project'
      ? generateProjectCards(answers)
      : [makeMockCard(mode as ContentItemType, 0)];

    setGenerateCount(newCards.length);
    setIsGenerating(true);
    setCards([]);

    // Mock generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setCards(newCards);
    }, newCards.length * 400 + 800);
  }, [mode]);

  const handleAddCard = useCallback((itemType: ContentItemType) => {
    setCards(prev => [...prev, makeMockCard(itemType, prev.filter(c => c.itemType === itemType).length)]);
  }, []);

  const handleAddAnother = useCallback((itemType: ContentItemType) => {
    setCards(prev => [...prev, makeMockCard(itemType, prev.filter(c => c.itemType === itemType).length)]);
  }, []);

  const handleScoreClick = useCallback((cardId: string) => {
    setActiveScoreCardId(prev => prev === cardId ? null : cardId);
  }, []);

  const handleEdit = useCallback((_cardId: string) => {
    // TODO: drill down to item-level editor
  }, []);

  const handleSelectTemplate = useCallback((template: EditorTemplate) => {
    // Seed a card for each type implied by the template
    // For now: add a single card matching the mode, named after the template
    const itemType = mode === 'project' ? 'blog' : mode as ContentItemType;
    const card = makeMockCard(itemType, 0);
    setCards([{ ...card, name: template.title }]);
  }, [mode]);

  const handleArrangeCards = useCallback((direction: 'vertical' | 'horizontal') => {
    setLayoutDirection(direction);
    setCardLayouts(prev => arrangeCardLayouts(cards, direction, prev, measuredCardHeights));
  }, [cards, measuredCardHeights]);

  const handleCanvasWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const nextZoom = zoom - event.deltaY * 0.002;
    setZoom(Math.min(2, Math.max(0.5, +nextZoom.toFixed(2))));
  }, [zoom]);

  const handleCardPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>, cardId: string) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button,input,textarea,select,a,[role="menuitem"],[data-no-card-drag="true"],[data-card-resize-edge]')) return;

    const layout = cardLayouts[cardId];
    if (!layout) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      type: 'move',
      cardId,
      startX: event.clientX,
      startY: event.clientY,
      initial: layout,
      initialHeight: measuredCardHeights[cardId] ?? layout.height ?? CARD_MIN_HEIGHT,
    };
  }, [cardLayouts, measuredCardHeights]);

  const handleResizePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>, cardId: string, edge: ResizeEdge) => {
    event.preventDefault();
    event.stopPropagation();
    const layout = cardLayouts[cardId];
    if (!layout) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      type: 'resize',
      cardId,
      edge,
      startX: event.clientX,
      startY: event.clientY,
      initial: layout,
      initialHeight: measuredCardHeights[cardId] ?? layout.height ?? CARD_MIN_HEIGHT,
    };
  }, [cardLayouts, measuredCardHeights]);

  const handleCardMeasureRef = useCallback((cardId: string, node: HTMLDivElement | null) => {
    const previousNode = cardElementRefs.current[cardId];
    if (previousNode && previousNode !== node) {
      cardResizeObserverRef.current?.unobserve(previousNode);
    }

    cardElementRefs.current[cardId] = node;
    if (!node) return;

    if (!cardResizeObserverRef.current) {
      cardResizeObserverRef.current = new ResizeObserver(entries => {
        setMeasuredCardHeights(prev => {
          let changed = false;
          const next = { ...prev };

          entries.forEach(entry => {
            const id = (entry.target as HTMLElement).dataset.cardId;
            if (!id) return;
            const height = Math.ceil(entry.contentRect.height);
            if (next[id] !== height) {
              next[id] = height;
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      });
    }

    node.dataset.cardId = cardId;
    cardResizeObserverRef.current.observe(node);
  }, []);

  const canvasBounds = cards.reduce(
    (bounds, card) => {
      const layout = cardLayouts[card.id];
      if (!layout) return bounds;
      const measuredHeight = measuredCardHeights[card.id] ?? defaultCardSize(card.itemType).height;
      const cardHeight = Math.max(layout.height ?? 0, measuredHeight);
      return {
        width: Math.max(bounds.width, layout.x + layout.width + CARD_CANVAS_PADDING),
        height: Math.max(bounds.height, layout.y + cardHeight + CARD_CANVAS_PADDING),
      };
    },
    { width: 1800, height: 1200 },
  );

  // ── Active card config for score panel
  const activeCard = cards.find(c => c.id === activeScoreCardId);
  const scorePanelConfig = activeCard
    ? EDITOR_CONFIGS[activeCard.itemType as ContentMode] ?? config
    : config;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Header — shared by setup, generation, and editor states ── */}
      <div className="w-full bg-background border-b border-border h-[52px] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">

          {/* Left cluster: back + editable title + Draft pill + subtitle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-none"
            >
              <ArrowLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </button>

            <div className="flex flex-col">
              {/* Title row: text + pencil + Draft pill */}
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false); }}
                    className="text-[14px] font-semibold text-foreground bg-transparent border-b border-primary outline-none leading-tight min-w-[120px] max-w-[260px]"
                  />
                ) : (
                  <span className="text-[14px] font-semibold text-foreground leading-tight truncate max-w-[240px]">
                    {title}
                  </span>
                )}
                {!isEditingTitle && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Rename"
                  >
                    <Edit2 size={14} strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                )}
                {/* Static Draft pill */}
                <div className="bg-muted px-2 py-0.5 rounded-md">
                  <span className="text-xs text-muted-foreground">Draft</span>
                </div>
              </div>
              {/* Subtitle row */}
              <span className="text-xs text-primary">
                Olive garden corporate · 10 locations
              </span>
            </div>
          </div>

          {/* Right cluster: setup navigation or editor actions */}
          <div className="flex items-center gap-2">
            {setupPhase === 'setup' ? (
              <>
                {wizardNavState.step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => flowNavRef.current?.back()}
                  >
                    Back
                  </Button>
                )}
                {isEditingSettings && wizardNavState.step === wizardNavState.totalSteps - 1 ? (
                  <Button
                    onClick={() => setRegenConfirmOpen(true)}
                    disabled={!wizardNavState.canAdvance}
                  >
                    Regenerate
                    <ChevronRight size={14} strokeWidth={1.6} absoluteStrokeWidth />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const isLast = wizardNavState.step === wizardNavState.totalSteps - 1;
                      if (isLast) flowNavRef.current?.generate();
                      else flowNavRef.current?.advance();
                    }}
                    disabled={!wizardNavState.canAdvance}
                  >
                    {wizardNavState.step === wizardNavState.totalSteps - 1 ? 'Generate' : 'Continue'}
                    <ChevronRight size={14} strokeWidth={1.6} absoluteStrokeWidth />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExportOpen(true)}
                >
                  Export
                </Button>

                <DropdownMenu>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      className="rounded-r-none"
                    >
                      Save
                    </Button>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        aria-label="Save options"
                        className="rounded-l-none border-l border-primary-foreground/20 px-2"
                      >
                        <ChevronDown size={13} strokeWidth={1.6} absoluteStrokeWidth />
                      </Button>
                    </DropdownMenuTrigger>
                  </div>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2">Save</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">Add to library</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

      {/* ── Generation info bar — hidden while in setup/edit-settings phase ── */}
      {generationInfo && setupPhase !== 'setup' && (
        <div className="flex items-center justify-between px-6 h-9 bg-muted border-b border-border flex-shrink-0">
          <span className="text-[12px] text-muted-foreground">
            Generated with&nbsp;
            <span className="font-medium text-foreground">{generationInfo.label}</span>
          </span>
          <button
            type="button"
            onClick={handleEditSettings}
            className="text-[12px] text-primary hover:underline"
          >
            Edit settings
          </button>
        </div>
      )}

      {/* ── Inline creation flow — same shell as the editor, with stepper in the left pane ─────────── */}
      {setupPhase === 'setup' && (
        <div className="flex-1 min-h-0 flex">
          <aside className="flex-shrink-0 bg-background" style={{ width: 300, borderRight: '1px solid #e5e9f0' }}>
            <div className="px-4 py-4">
              <ContentFlowStepper
                steps={SETUP_STEPS_BY_MODE[mode]}
                currentStep={wizardNavState.step}
              />
            </div>
          </aside>
          <div className="flex-1 min-w-0 min-h-0 bg-[var(--color-canvas,#F7F8FA)]">
            {mode === 'faq' ? (
              <FAQInlineCreationFlow
                onComplete={handleFAQFlowComplete}
                onCancel={onBack}
                controlRef={flowNavRef}
                onNavStateChange={setWizardNavState}
                hideProgress
              />
            ) : mode === 'blog' ? (
              <BlogInlineCreationFlow
                onComplete={handleBlogFlowComplete}
                onCancel={onBack}
                controlRef={flowNavRef}
                onNavStateChange={setWizardNavState}
                hideProgress
              />
            ) : (
              <InlineCreationFlow
                mode={BLOCK_MODES.has(mode) ? mode as 'faq' | 'blog' | 'landing' : 'project'}
                onComplete={handleInlineFlowComplete}
                onCancel={onBack}
                controlRef={flowNavRef}
                onNavStateChange={setWizardNavState}
                hideProgress
              />
            )}
          </div>
        </div>
      )}

      {/* ── Generating: FAQ progress card or generic shimmer ────────────── */}
      {setupPhase === 'generating' && mode === 'faq' && faqFlowData && (
        <div className="flex-1 min-h-0 flex">
          <LeftPanelSkeleton />
          <div className="flex-1 min-w-0 min-h-0">
            <FAQGenerationProgress
              sections={faqFlowData.sections}
              brandKit={faqFlowData.brandKit}
              sourceUrl={faqFlowData.sourceUrl}
              onComplete={handleFAQGenerationComplete}
            />
          </div>
        </div>
      )}
      {setupPhase === 'generating' && mode === 'blog' && blogFlowData && (
        <div className="flex-1 min-h-0 flex">
          <LeftPanelSkeleton />
          <div className="flex-1 min-w-0 min-h-0">
            <BlogGenerationProgress
              sections={blogFlowData.sections}
              brandKit={blogFlowData.brandKit}
              topic={blogFlowData.topic}
              onComplete={handleBlogGenerationComplete}
            />
          </div>
        </div>
      )}
      {setupPhase === 'generating' && mode === 'project' && flowData && (
        <div className="flex-1 min-h-0 flex">
          <LeftPanelSkeleton />
          <div className="flex-1 min-w-0 min-h-0">
            <ProjectGenerationProgress
              flowData={flowData}
              onComplete={handleProjectGenerationComplete}
            />
          </div>
        </div>
      )}
      {setupPhase === 'generating' && mode !== 'faq' && mode !== 'blog' && mode !== 'project' && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-canvas,#F7F8FA)]">
          <GeneratingSkeleton count={generateCount} />
        </div>
      )}

      {/* ── FAQ section canvas (done phase, FAQ mode) ─────────────────── */}
      {setupPhase === 'done' && mode === 'faq' && faqFlowData && (
        <FAQSectionCanvas
          sections={faqFlowData.sections}
          generationLabel={generationInfo?.label}
          onEditSettings={handleEditSettings}
        />
      )}

      {/* ── Blog section canvas (done phase, blog mode) ───────────────── */}
      {setupPhase === 'done' && mode === 'blog' && blogFlowData && (
        <BlogSectionCanvas
          sections={blogFlowData.sections}
          generationLabel={generationInfo?.label}
          onEditSettings={handleEditSettings}
        />
      )}

      {/* ── Body (left + center + right) — only when done (non-FAQ, non-blog) ── */}
      {setupPhase === 'done' && mode !== 'faq' && mode !== 'blog' && (BLOCK_MODES.has(mode) ? (
        /* ── Block editor — wraps all 3 panels in a shared store context ── */
        <BlockEditorProvider>
          <div className="flex flex-1 min-h-0">
            {/* Left panel */}
            <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{ width: 300, borderRight: '1px solid #e5e9f0' }}>
              <div className="flex-none px-4 py-3 border-b border-border">
                <SegmentedToggle ariaLabel="Create mode" items={LEFT_TAB_ITEMS} value={leftTab} onChange={setLeftTab} />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {leftTab === 'ai' ? (
                  <AiCopilot
                    editorContext="editing"
                    wizardSummary={generationInfo?.label}
                  />
                ) : (
                  <BlockLibraryPanel mode={mode as 'blog' | 'landing' | 'faq'} />
                )}
              </div>
            </div>

            {/* Center — block canvas with zoom toolbar */}
            <div className="flex flex-1 min-w-0 overflow-hidden relative">
              {/* Floating toolbar — zoom + undo/redo */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-background rounded-lg shadow-sm border border-border pointer-events-auto">
                  <div className="flex items-center px-4 py-2 gap-3">
                    {/* Undo / redo */}
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      title="Undo"
                      className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-30"
                    >
                      <Undo2 size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      title="Redo"
                      className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-30"
                    >
                      <Redo2 size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                    </button>

                    <div className="w-px h-4 bg-border" />

                    {/* Zoom */}
                    <button
                      type="button"
                      onClick={() => setZoom(z => Math.max(0.25, +(z - 0.1).toFixed(2)))}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      <ZoomOut size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                    </button>
                    <span className="text-[13px] text-muted-foreground text-nowrap min-w-[40px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      <ZoomIn size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              <BlockCanvas
                mode={mode as 'blog' | 'landing' | 'faq'}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </div>

            {/* Right — block settings panel (slides in when a block is selected) */}
            <BlockSettingsPanel />
          </div>
        </BlockEditorProvider>
      ) : (
        /* ── Card-based modes — social / email / video / project ── */
        <div className="flex flex-1 min-h-0">
          {/* Left panel */}
          <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{ width: 300, borderRight: '1px solid #e5e9f0' }}>
            <div className="flex-none px-4 py-3 border-b border-border">
              <SegmentedToggle ariaLabel="Create mode" items={LEFT_TAB_ITEMS} value={leftTab} onChange={setLeftTab} />
            </div>
            <div className="flex-1 min-h-0">
              {leftTab === 'ai' ? (
                <AiCopilot
                  onStartGenerating={() => setIsGenerating(true)}
                  onGenerationComplete={() => {
                    const newCards = mode === 'project'
                      ? generateProjectCards({})
                      : [makeMockCard(mode as ContentItemType, 0)];
                    setGenerateCount(newCards.length);
                    setIsGenerating(false);
                    setCards(newCards);
                  }}
                  initialContentType={mode === 'project' ? 'project' : mode as 'faq' | 'social' | 'email' | 'blog'}
                  editorContext={cards.length > 0 ? 'editing' : 'setup'}
                />
              ) : (
                <ManualPanel mode={mode} onAddCard={handleAddCard} />
              )}
            </div>
          </div>

          {/* ── Center canvas ── */}
            {/* Center canvas — card-based modes: social / email / video / project */}
            <div className={cn(
              'flex-1 min-w-0 bg-[var(--color-canvas,#F7F8FA)] relative',
              'overflow-auto',
            )}
            onWheel={handleCanvasWheel}
            >

              {/* Floating toolbar — always visible when canvas has cards */}
              {!isGenerating && cards.length > 0 && (
                <div className="sticky top-4 z-20 flex justify-center pointer-events-none">
                  <div className="bg-background rounded-lg shadow-sm border border-border pointer-events-auto">
                    <div className="flex items-center px-4 py-2 gap-4">
                      {/* Undo / redo */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={!canUndo}
                          title="Undo"
                          className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-30"
                        >
                          <Undo2 size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRedo}
                          disabled={!canRedo}
                          title="Redo"
                          className="p-1.5 hover:bg-muted rounded-md transition-colors disabled:opacity-30"
                        >
                          <Redo2 size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                        </button>
                      </div>

                      <div className="w-px h-4 bg-border" />

                      {/* Layout direction — vertical / horizontal stacking */}
                      {mode === 'project' && (
                        <>
                          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                            <button
                              type="button"
                              title="Arrange vertically"
                              onClick={() => handleArrangeCards('vertical')}
                              className={cn(
                                'flex items-center justify-center px-2 py-1 rounded-md transition-colors',
                                layoutDirection === 'vertical' ? 'bg-background shadow-sm' : 'hover:bg-background/50',
                              )}
                            >
                              <ArrowDown
                                size={16}
                                strokeWidth={1.6}
                                absoluteStrokeWidth
                                className={layoutDirection === 'vertical' ? 'text-foreground' : 'text-muted-foreground'}
                              />
                            </button>
                            <button
                              type="button"
                              title="Arrange horizontally"
                              onClick={() => handleArrangeCards('horizontal')}
                              className={cn(
                                'flex items-center justify-center px-2 py-1 rounded-md transition-colors',
                                layoutDirection === 'horizontal' ? 'bg-background shadow-sm' : 'hover:bg-background/50',
                              )}
                            >
                              <ArrowRight
                                size={16}
                                strokeWidth={1.6}
                                absoluteStrokeWidth
                                className={layoutDirection === 'horizontal' ? 'text-foreground' : 'text-muted-foreground'}
                              />
                            </button>
                          </div>
                          <div className="w-px h-4 bg-border" />
                        </>
                      )}

                      {/* View toggle */}
                      <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                        {(['grid', 'list', 'calendar'] as const).map((v) => {
                          const Icon = v === 'grid' ? Grid : v === 'list' ? List : Calendar;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setViewMode(v)}
                              className={cn(
                                'flex items-center justify-center px-2 py-1 rounded-md transition-colors',
                                viewMode === v
                                  ? 'bg-background shadow-sm'
                                  : 'hover:bg-background/50',
                              )}
                            >
                              <Icon
                                size={16}
                                strokeWidth={1.6}
                                absoluteStrokeWidth
                                className={viewMode === v ? 'text-foreground' : 'text-muted-foreground'}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Zoom controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                        >
                          <ZoomOut size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                        </button>
                        <span className="text-[13px] text-muted-foreground text-nowrap">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                        >
                          <ZoomIn size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGenerating ? (
                <GeneratingSkeleton count={generateCount} />
              ) : cards.length === 0 ? (
                <EmptyCanvas mode={mode} onAddCard={handleAddCard} onSelectTemplate={handleSelectTemplate} />
              ) : (
                <div
                  className="relative"
                  style={{
                    width: canvasBounds.width,
                    height: canvasBounds.height,
                    minWidth: '100%',
                    minHeight: '100%',
                    zoom,
                  }}
                >
                  {cards.map((card, idx) => (
                    <div
                      key={card.id}
                      onPointerDown={event => handleCardPointerDown(event, card.id)}
                      className={cn(
                        'absolute group/card select-none',
                        dragStateRef.current?.cardId === card.id && 'cursor-grabbing',
                      )}
                      style={{
                        left: cardLayouts[card.id]?.x ?? CARD_CANVAS_PADDING,
                        top: cardLayouts[card.id]?.y ?? CARD_CANVAS_PADDING,
                        width: cardLayouts[card.id]?.width ?? defaultCardSize(card.itemType).width,
                        minHeight: cardLayouts[card.id]?.height,
                      }}
                    >
                      <div
                        ref={node => handleCardMeasureRef(card.id, node)}
                        className="rounded-xl"
                        style={{ minHeight: cardLayouts[card.id]?.height }}
                      >
                        <EditorContentCard
                          card={card}
                          onScoreClick={handleScoreClick}
                          scoreActive={activeScoreCardId === card.id}
                          onEdit={handleEdit}
                          onAddAnother={handleAddAnother}
                          showAddAnother={idx === cards.length - 1}
                        />
                      </div>
                      {(['top', 'right', 'bottom', 'left'] as ResizeEdge[]).map(edge => (
                        <div
                          key={edge}
                          aria-label={`Resize ${card.name} from ${edge}`}
                          role="button"
                          tabIndex={-1}
                          data-card-resize-edge={edge}
                          onPointerDown={event => handleResizePointerDown(event, card.id, edge)}
                          className={cn(
                            'absolute z-10',
                            edge === 'top' && '-top-1 left-2 right-2 h-2 cursor-ns-resize',
                            edge === 'right' && 'bottom-2 -right-1 top-2 w-2 cursor-ew-resize',
                            edge === 'bottom' && '-bottom-1 left-2 right-2 h-2 cursor-ns-resize',
                            edge === 'left' && 'bottom-2 -left-1 top-2 w-2 cursor-ew-resize',
                          )}
                        />
                      ))}
                    </div>
                  ))}
                  {/* Add more content button */}
                  <div
                    className="absolute"
                    style={{
                      left: CARD_CANVAS_PADDING,
                      top: Math.max(...cards.map(card => {
                        const layout = cardLayouts[card.id];
                        if (!layout) return 0;
                        const measuredHeight = measuredCardHeights[card.id] ?? defaultCardSize(card.itemType).height;
                        return layout.y + Math.max(layout.height ?? 0, measuredHeight);
                      }), CARD_CANVAS_PADDING) + CARD_CANVAS_GAP,
                    }}
                  >
                    <AddContentButton mode={mode} onAdd={handleAddCard} />
                  </div>
                </div>
              )}
            </div>

            {/* Right score panel — slides in on card score click */}
            <EditorScorePanel
              open={activeScoreCardId !== null}
              onClose={() => setActiveScoreCardId(null)}
              config={scorePanelConfig}
              score={activeCard?.score ?? 87}
            />
          </div>
      ))}

      {/* ── Regenerate confirmation dialog ───────────────────────────── */}
      <Dialog open={regenConfirmOpen} onOpenChange={setRegenConfirmOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Regenerate FAQ set?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground leading-relaxed -mt-1">
            A new version will be created based on your updated settings. Your existing FAQ content will be replaced and cannot be recovered.
          </p>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegenConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setRegenConfirmOpen(false);
                flowNavRef.current?.generate();
              }}
            >
              Yes, regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export modal */}
      <FAQPublishModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        faqs={[]}
        overallScore={72}
      />
    </div>
  );
}
