/**
 * BlogSectionCanvas
 *
 * Post-generation canvas for the blog flow.
 * Layout mirrors FAQSectionCanvas exactly:
 *  ┌──────────────────────┬──────────────────────────────────────────────┬────────────┐
 *  │  Left panel (280px)  │  Center canvas (flex-1)                      │ Score panel│
 *  │  AI / Manual tabs    │  Floating toolbar (undo + zoom)              │ (300px)    │
 *  │                      │  Blog card (ONE container)                   │            │
 *  │                      │    ├─ Card header (identical to FAQ)         │            │
 *  │                      │    └─ Rich content blocks                    │            │
 *  └──────────────────────┴──────────────────────────────────────────────┴────────────┘
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  GripVertical, ChevronDown, Trash2, Plus,
  AlertTriangle, XCircle, CheckCircle2,
  ArrowUp, ArrowDown, Sparkles, Layers,
  Undo2, Redo2, ZoomIn, ZoomOut,
  CheckCircle, CircleDashed,
  CalendarDays, UserCircle2,
  Activity, History, MessageCircle,
  BookmarkCheck, FileText,
  AlignLeft, Type, List, Image as ImageIcon, Lightbulb, Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiCopilot } from '../AiCopilot';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle.v1';
import { EditorScorePanel } from '../editor/EditorScorePanel';
import { EDITOR_CONFIGS } from '../editor/editorConfig';
import { scoreColor } from '../shared/scoreColors';
import type { BlogSection } from './BlogInlineCreationFlow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlockType = 'hero' | 'heading' | 'paragraph' | 'bullets' | 'image' | 'callout' | 'quote' | 'faq-section';

export interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSectionData {
  id: string;
  title: string;
  questions: FaqQuestion[];
}

export interface BlogBlock {
  id: string;
  type: BlockType;
  // hero
  heroTitle?: string;
  heroSubtitle?: string;
  heroTag?: string;
  // heading
  level?: 2 | 3;
  headingText?: string;
  // paragraph
  body?: string;
  // bullets
  items?: string[];
  // image
  alt?: string;
  caption?: string;
  // callout
  calloutVariant?: 'info' | 'success' | 'warning';
  calloutText?: string;
  calloutTitle?: string;
  // quote
  quoteText?: string;
  quoteAuthor?: string;
  // faq-section
  faqSection?: FaqSectionData;
  // shared
  status?: 'ready' | 'warning' | 'blocked';
  warningText?: string;
}

export interface BlogSectionCanvasProps {
  sections: BlogSection[];
  generationLabel?: string;
  onEditSettings?: () => void;
}

// ── Block generation ──────────────────────────────────────────────────────────

let blockIdCounter = 2000;
function makeBlockId() { return `blk${blockIdCounter++}`; }

function generateBlogBlocks(sections: BlogSection[]): BlogBlock[] {
  const blocks: BlogBlock[] = [];

  // Hero block
  blocks.push({
    id: makeBlockId(),
    type: 'hero',
    heroTag: 'Blog post',
    heroTitle: 'The Complete Guide to Building Exceptional Customer Experiences',
    heroSubtitle: 'Proven strategies that leading brands use to turn every interaction into a loyalty-building moment',
    status: 'ready',
  });

  // Intro paragraph
  blocks.push({
    id: makeBlockId(),
    type: 'paragraph',
    body: 'In today\'s hyper-competitive landscape, the quality of your customer experience is the single greatest differentiator available to any business. Customers who feel genuinely valued don\'t just return — they become advocates, recommending your brand to friends, family, and colleagues without any prompting. This guide distills the tactics that high-performing businesses use every day to create those moments.',
    status: 'ready',
  });

  // Generate blocks per section
  sections.forEach((section, sectionIdx) => {
    // H2 heading for main sections, H3 for sub-content variety
    blocks.push({
      id: makeBlockId(),
      type: 'heading',
      level: 2,
      headingText: section.heading,
      status: 'ready',
    });

    // Section intro paragraph from description
    blocks.push({
      id: makeBlockId(),
      type: 'paragraph',
      body: section.description.length > 60
        ? section.description + '. Understanding this area deeply allows businesses to make targeted improvements that customers immediately notice and appreciate.'
        : `${section.description}. Every customer interaction is an opportunity to reinforce your brand promise and deepen the relationship. Businesses that consistently deliver on this create compounding loyalty effects that protect them from competitive pressure.`,
      status: 'ready',
    });

    // Vary the third block type based on section index
    const blockVariant = sectionIdx % 4;

    if (blockVariant === 0) {
      // Bullets block
      blocks.push({
        id: makeBlockId(),
        type: 'bullets',
        items: [
          'Acknowledge the customer within the first 30 seconds of any interaction',
          'Use their name at least once during the conversation',
          'Confirm their needs before proposing solutions',
          'Follow up proactively after service is delivered',
          'Make it easy to escalate if the first resolution does not satisfy',
        ],
        status: 'ready',
      });
    } else if (blockVariant === 1) {
      // Callout info block
      blocks.push({
        id: makeBlockId(),
        type: 'callout',
        calloutVariant: 'info',
        calloutTitle: 'Key insight',
        calloutText: 'According to research across thousands of service interactions, customers who receive a proactive follow-up are 3× more likely to leave a five-star review than those who do not — even when the original service was identical in quality.',
        status: 'ready',
      });
    } else if (blockVariant === 2) {
      // Quote block
      blocks.push({
        id: makeBlockId(),
        type: 'quote',
        quoteText: 'The customer experience is the next competitive battleground. Companies that invest in genuine connection with their customers today will be the ones standing five years from now.',
        quoteAuthor: 'Customer Experience Research Institute',
        status: 'ready',
      });
    } else {
      // Image placeholder
      blocks.push({
        id: makeBlockId(),
        type: 'image',
        alt: `Illustration for ${section.heading}`,
        caption: `Visual overview of ${section.heading.toLowerCase()} strategies and their impact on customer retention.`,
        status: 'ready',
      });
    }

    // Add a sub-section heading + content for longer sections
    if (sectionIdx % 3 === 0 && sectionIdx > 0) {
      blocks.push({
        id: makeBlockId(),
        type: 'heading',
        level: 3,
        headingText: 'Practical application in your business',
        status: 'ready',
      });
      blocks.push({
        id: makeBlockId(),
        type: 'paragraph',
        body: 'Translating strategy into daily operations requires clear ownership and measurable checkpoints. Start by identifying the top three moments in your customer journey where expectations frequently go unmet. These are your highest-leverage improvement opportunities.',
        status: sectionIdx === 3 ? 'warning' : 'ready',
        warningText: sectionIdx === 3 ? 'This section lacks specific metrics — add 1–2 measurable outcomes to strengthen credibility.' : undefined,
      });
    }
  });

  // Callout success block — action plan
  blocks.push({
    id: makeBlockId(),
    type: 'callout',
    calloutVariant: 'success',
    calloutTitle: '30-day action plan',
    calloutText: 'Week 1: Audit your top three customer touchpoints. Week 2: Implement at least one improvement per touchpoint. Week 3: Collect feedback systematically. Week 4: Review results and set targets for the next cycle.',
    status: 'ready',
  });

  // Bullets — common mistakes
  blocks.push({
    id: makeBlockId(),
    type: 'bullets',
    items: [
      'Treating customer experience as a department rather than a company-wide commitment',
      'Collecting feedback without closing the loop with customers',
      'Optimising for satisfaction scores at the expense of genuine relationships',
      'Underinvesting in frontline staff training and empowerment',
    ],
    status: 'warning',
    warningText: 'These points need supporting evidence or statistics to meet publishing standards.',
  });

  // Closing paragraph
  blocks.push({
    id: makeBlockId(),
    type: 'paragraph',
    body: 'Building an exceptional customer experience is not a project with an end date — it is a continuous operating discipline. The businesses that commit to this mindset see measurable improvements in retention, referrals, and lifetime customer value within the first 90 days. Start with one section from this guide, implement it thoroughly, then build from there.',
    status: 'ready',
  });

  // Closing quote
  blocks.push({
    id: makeBlockId(),
    type: 'quote',
    quoteText: 'Your most unhappy customers are your greatest source of learning — but your most loyal customers are your greatest source of growth.',
    quoteAuthor: 'Adapted from service excellence research',
    status: 'blocked',
    warningText: 'Attribution source is missing. Add a verifiable citation or replace with an internal case study.',
  });

  return blocks;
}

// ── Left panel tab items ──────────────────────────────────────────────────────

const LEFT_TAB_ITEMS = [
  {
    value: 'ai' as const,
    label: 'AI',
    icon: <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-[#7c3aed]" />,
  },
  { value: 'manual' as const, label: 'Manual' },
];

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score, active, onClick }: { score: number; active: boolean; onClick: () => void }) {
  const { bg, text } = scoreColor(score);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Content score: ${score}. Click to ${active ? 'close' : 'open'} score panel.`}
      className={cn(
        'flex items-center gap-2 h-7 px-2.5 rounded-lg border transition-colors flex-none',
        active
          ? 'border-border bg-muted'
          : 'border-transparent hover:border-border hover:bg-muted/50',
      )}
    >
      <span className="text-[11px] text-muted-foreground font-medium select-none">Score</span>
      <div className="w-16 h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: text }}
        />
      </div>
      <span
        className="inline-flex items-center justify-center h-5 min-w-[26px] px-1.5 rounded text-[12px] font-bold tabular-nums leading-none"
        style={{ backgroundColor: bg, color: text }}
      >
        {score}
      </span>
    </button>
  );
}

// ── Manual panel (blog-specific) ──────────────────────────────────────────────

const BLOCK_PALETTE = [
  { type: 'paragraph' as BlockType, label: 'Paragraph', Icon: AlignLeft },
  { type: 'heading'   as BlockType, label: 'Heading',   Icon: Type       },
  { type: 'bullets'   as BlockType, label: 'Bullet list',Icon: List      },
  { type: 'image'     as BlockType, label: 'Image',      Icon: ImageIcon  },
  { type: 'callout'   as BlockType, label: 'Callout',    Icon: Lightbulb  },
  { type: 'quote'     as BlockType, label: 'Quote',      Icon: Quote      },
];

const LIBRARY_FAQ_SECTIONS: FaqSectionData[] = [
  {
    id: 'lib-sec-1',
    title: 'Emergency basics',
    questions: [
      { id: 'lq1', question: 'How quickly can you respond to an emergency?', answer: 'Our team is available 24/7 and typically responds to emergency calls within 30–60 minutes. We prioritize urgent situations to minimize disruption and ensure your safety.' },
      { id: 'lq2', question: 'Do you offer same-day service?', answer: 'Yes, we offer same-day service for most requests submitted before 2 PM local time. Availability may vary during peak periods or holidays.' },
      { id: 'lq3', question: 'Are you licensed and insured?', answer: 'We are fully licensed, bonded, and insured. Our technicians carry all required certifications and our work is backed by a 1-year service guarantee.' },
    ],
  },
  {
    id: 'lib-sec-2',
    title: 'Appointments and costs',
    questions: [
      { id: 'lq4', question: 'How do I book an appointment?', answer: 'You can book online at our website, call us directly, or use our app. Online bookings are available 24/7 and confirmed instantly.' },
      { id: 'lq5', question: 'How much does a standard service call cost?', answer: 'Standard service calls start at $85 for the first hour, with materials billed separately. We provide a detailed estimate before any work begins.' },
      { id: 'lq6', question: 'Do you offer free estimates?', answer: 'Yes, we offer free estimates for all new projects. Estimates are provided within 24 hours of your initial inquiry.' },
    ],
  },
  {
    id: 'lib-sec-3',
    title: 'Special cases',
    questions: [
      { id: 'lq7', question: 'Do you service commercial properties?', answer: 'Yes, we serve both residential and commercial clients. For commercial properties, we offer volume pricing and dedicated account managers.' },
      { id: 'lq8', question: 'What if I need service outside normal hours?', answer: 'We offer after-hours and weekend service at a premium rate. Contact us directly to arrange and confirm availability.' },
    ],
  },
];

interface BlogManualContentProps {
  onAddBlock: (type: BlockType) => void;
  onDropFaqSection: (section: FaqSectionData) => void;
}

function BlogManualContent({ onAddBlock, onDropFaqSection }: BlogManualContentProps) {
  const [manualTab, setManualTab] = useState<'blocks' | 'saved'>('blocks');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex-none flex items-center gap-1 px-4 pt-3 pb-2 border-b border-border">
        <button
          type="button"
          onClick={() => setManualTab('blocks')}
          className={cn(
            'h-7 px-3 rounded-md text-[12px] font-medium transition-colors',
            manualTab === 'blocks'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
        >
          Content blocks
        </button>
        <button
          type="button"
          onClick={() => setManualTab('saved')}
          className={cn(
            'h-7 px-3 rounded-md text-[12px] font-medium transition-colors',
            manualTab === 'saved'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
        >
          Saved blocks
        </button>
      </div>

      {manualTab === 'blocks' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Add content blocks directly to your blog canvas.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_PALETTE.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddBlock(type)}
                className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all group"
              >
                <div className="size-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[12px] font-medium text-foreground text-center group-hover:text-primary transition-colors leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {manualTab === 'saved' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            FAQ sections saved from your FAQ canvas. Drop them directly into this blog post.
          </p>
          {LIBRARY_FAQ_SECTIONS.map(section => (
            <SavedFaqCard
              key={section.id}
              section={section}
              onDrop={() => onDropFaqSection(section)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedFaqCard({ section, onDrop }: { section: FaqSectionData; onDrop: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
      {/* Section header — matches FAQSectionCanvas section style */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 border-b border-border">
        <Layers size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
        <span className="flex-1 min-w-0 text-[12px] font-semibold text-foreground truncate">
          {section.title}
        </span>
        <span className="text-[11px] text-muted-foreground flex-none">
          {section.questions.length} Qs
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="p-0.5 rounded text-muted-foreground hover:bg-muted transition-colors flex-none"
        >
          <ChevronDown
            size={12}
            strokeWidth={1.6}
            absoluteStrokeWidth
            className={cn('transition-transform', collapsed && '-rotate-90')}
          />
        </button>
      </div>

      {/* Questions list */}
      {!collapsed && (
        <div className="divide-y divide-border">
          {section.questions.map((q, qi) => (
            <div key={q.id} className="px-3 py-2.5">
              <p className="text-[11px] font-medium text-foreground leading-snug mb-1">
                {qi + 1}. {q.question}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {q.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Drop in CTA */}
      <div className="px-3 py-2 border-t border-border bg-muted/20">
        <button
          type="button"
          onClick={onDrop}
          className="w-full flex items-center justify-center gap-1.5 h-7 rounded-md text-[12px] font-medium text-primary bg-primary/[0.06] hover:bg-primary/[0.11] transition-colors"
        >
          <Plus size={12} strokeWidth={1.6} absoluteStrokeWidth />
          Drop into blog
        </button>
      </div>
    </div>
  );
}

// ── Individual block renderers ────────────────────────────────────────────────

interface BlockRowProps {
  block: BlogBlock;
  index: number;
  total: number;
  onUpdate: (patch: Partial<BlogBlock>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  fixingAll?: boolean;
}

function BlockRow({ block, index, total, onUpdate, onDelete, onMoveUp, onMoveDown, fixingAll }: BlockRowProps) {
  const [fixing, setFixing] = useState(false);
  const isBeingFixed = fixing || (!!fixingAll && block.status !== 'ready');

  function handleFixThis() {
    setFixing(true);
    setTimeout(() => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        onUpdate({
          status: 'ready',
          warningText: undefined,
          body: block.body
            ? block.body + ' Supporting data: according to a 2024 CX Benchmarks report, businesses implementing structured follow-up programs see a 34% increase in customer satisfaction scores within six months.'
            : block.body,
        });
      } else if (block.type === 'bullets') {
        onUpdate({ status: 'ready', warningText: undefined });
      } else if (block.type === 'quote') {
        onUpdate({
          status: 'ready',
          warningText: undefined,
          quoteText: block.quoteText,
          quoteAuthor: 'Bill Gates, co-founder of Microsoft',
        });
      } else {
        onUpdate({ status: 'ready', warningText: undefined });
      }
      setFixing(false);
    }, 1600);
  }

  const statusRing = cn(
    'rounded-xl overflow-hidden transition-all',
    block.status === 'blocked' && 'ring-1 ring-destructive/30 bg-destructive/[0.02]',
    block.status === 'warning' && 'ring-1 ring-amber-300/60 bg-amber-50/40',
  );

  return (
    <div className={cn('group relative', statusRing)}>
      {/* Drag handle + actions overlay */}
      <div className="absolute left-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-1">
        <GripVertical size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/40 cursor-grab" />
      </div>
      <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1 bg-background/90 rounded-lg border border-border px-1.5 py-1 shadow-sm">
        {block.status === 'warning' && (
          <AlertTriangle size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-amber-500" />
        )}
        {block.status === 'blocked' && (
          <XCircle size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-destructive" />
        )}
        {block.status === 'ready' && (
          <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-[#1D9E75]" />
        )}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move up"
          className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
        >
          <ArrowUp size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Move down"
          className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
        >
          <ArrowDown size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete block"
          className="p-0.5 rounded hover:bg-muted hover:text-destructive transition-colors text-muted-foreground"
        >
          <Trash2 size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      {/* Block content */}
      <div className="pl-6 pr-8">
        {renderBlockContent(block, onUpdate, isBeingFixed)}
      </div>

      {/* Warning / blocked inline feedback */}
      {block.warningText && !isBeingFixed && (
        <div className={cn(
          'mx-6 mb-3 flex items-start gap-1.5',
          block.status === 'warning' && 'text-amber-600',
          block.status === 'blocked' && 'text-destructive',
        )}>
          {block.status === 'warning'
            ? <AlertTriangle size={12} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-shrink-0" />
            : <XCircle size={12} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-shrink-0" />
          }
          <span className="text-[12px] leading-relaxed">
            {block.warningText}{' '}
            <button
              type="button"
              onClick={handleFixThis}
              className="text-primary font-medium hover:underline"
            >
              Fix this
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

function renderBlockContent(
  block: BlogBlock,
  onUpdate: (patch: Partial<BlogBlock>) => void,
  isBeingFixed: boolean,
) {
  if (isBeingFixed) {
    return (
      <div className="py-4 space-y-2 animate-pulse">
        <div className="h-2.5 w-full rounded-full bg-muted" />
        <div className="h-2.5 w-5/6 rounded-full bg-muted" />
        <div className="h-2.5 w-4/5 rounded-full bg-muted" />
      </div>
    );
  }

  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} onUpdate={onUpdate} />;
    case 'heading':
      return <HeadingBlock block={block} onUpdate={onUpdate} />;
    case 'paragraph':
      return <ParagraphBlock block={block} onUpdate={onUpdate} />;
    case 'bullets':
      return <BulletsBlock block={block} onUpdate={onUpdate} />;
    case 'image':
      return <ImageBlock block={block} onUpdate={onUpdate} />;
    case 'callout':
      return <CalloutBlock block={block} onUpdate={onUpdate} />;
    case 'quote':
      return <QuoteBlock block={block} onUpdate={onUpdate} />;
    case 'faq-section':
      return <FaqSectionBlock block={block} />;
    default:
      return null;
  }
}

// ── FAQ section block (dropped from library) ──────────────────────────────────

function FaqSectionBlock({ block }: { block: BlogBlock }) {
  const [collapsed, setCollapsed] = useState(false);
  const section = block.faqSection;
  if (!section) return null;

  return (
    <div className="my-2 rounded-xl border border-border overflow-hidden">
      {/* Section header — identical style to FAQSectionCanvas SectionBlock */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
        <Layers size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
        <span className="flex-1 min-w-0 text-[13px] font-semibold text-foreground truncate">
          {section.title}
        </span>
        <span className="text-[11px] text-muted-foreground flex-none">
          {section.questions.length} questions
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronDown
            size={13}
            strokeWidth={1.6}
            absoluteStrokeWidth
            className={cn('transition-transform', collapsed && '-rotate-90')}
          />
        </button>
      </div>

      {/* Questions — exactly like FAQSectionCanvas question rows */}
      {!collapsed && (
        <div>
          {section.questions.map((q, qi) => (
            <div key={q.id} className="border-b border-border last:border-b-0 px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-[12px] text-muted-foreground/60 mt-0.5 w-5 text-right select-none flex-none">
                  {qi + 1}.
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[13px] font-medium text-foreground">{q.question}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{q.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hero block ────────────────────────────────────────────────────────────────

function HeroBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden mb-4 mt-4"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}
    >
      <div className="px-8 py-10">
        {/* Tag chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border border-indigo-200/60 mb-4">
          <FileText size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-indigo-500" />
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
            {block.heroTag ?? 'Blog post'}
          </span>
        </div>

        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            className="w-full text-[22px] font-bold text-foreground bg-transparent border-b border-primary outline-none pb-1 mb-3"
            value={block.heroTitle ?? ''}
            onChange={e => onUpdate({ heroTitle: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false); }}
          />
        ) : (
          <h1
            className="text-[22px] font-bold text-foreground leading-tight mb-3 cursor-text hover:text-primary transition-colors"
            onClick={() => setEditingTitle(true)}
          >
            {block.heroTitle}
          </h1>
        )}

        {/* Subtitle */}
        {editingSubtitle ? (
          <textarea
            autoFocus
            rows={2}
            className="w-full text-sm text-muted-foreground bg-transparent border border-primary/40 rounded-lg p-2 outline-none resize-none"
            value={block.heroSubtitle ?? ''}
            onChange={e => onUpdate({ heroSubtitle: e.target.value })}
            onBlur={() => setEditingSubtitle(false)}
          />
        ) : (
          <p
            className="text-sm text-muted-foreground leading-relaxed max-w-2xl cursor-text hover:text-foreground transition-colors"
            onClick={() => setEditingSubtitle(true)}
          >
            {block.heroSubtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Heading block ─────────────────────────────────────────────────────────────

function HeadingBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editing, setEditing] = useState(false);
  const isH2 = block.level === 2;

  return (
    <div className="group/heading pt-6 pb-2">
      {isH2 && <div className="border-t border-border mb-4" />}
      <div className="flex items-center gap-2">
        <GripVertical
          size={13}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className="text-muted-foreground/0 group-hover/heading:text-muted-foreground/30 transition-colors cursor-grab flex-shrink-0"
        />
        {editing ? (
          <input
            autoFocus
            className={cn(
              'flex-1 bg-transparent border-b border-primary outline-none',
              isH2 ? 'text-[18px] font-bold tracking-tight text-foreground' : 'text-[15px] font-semibold text-foreground',
            )}
            value={block.headingText ?? ''}
            onChange={e => onUpdate({ headingText: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
          />
        ) : (
          <p
            className={cn(
              'flex-1 cursor-text hover:text-primary transition-colors',
              isH2 ? 'text-[18px] font-bold tracking-tight text-foreground' : 'text-[15px] font-semibold text-foreground',
            )}
            onClick={() => setEditing(true)}
          >
            {block.headingText}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Paragraph block ───────────────────────────────────────────────────────────

function ParagraphBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="py-2">
      {editing ? (
        <textarea
          autoFocus
          rows={5}
          className="w-full text-[14px] leading-relaxed text-foreground bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-primary"
          value={block.body ?? ''}
          onChange={e => onUpdate({ body: e.target.value })}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <p
          className="text-[14px] leading-relaxed text-foreground cursor-text hover:text-foreground/90 transition-colors"
          onClick={() => setEditing(true)}
        >
          {block.body}
        </p>
      )}
    </div>
  );
}

// ── Bullets block ─────────────────────────────────────────────────────────────

function BulletsBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const items = block.items ?? [];

  const updateItem = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onUpdate({ items: next });
  };

  const deleteItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
  };

  const addItem = () => {
    onUpdate({ items: [...items, 'New bullet point'] });
  };

  return (
    <div className="py-3 space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="group/item flex items-start gap-2">
          <span className="mt-[5px] text-primary flex-shrink-0 text-[10px]">&#x25CF;</span>
          <input
            className="flex-1 text-[14px] leading-relaxed text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none transition-colors"
            value={item}
            onChange={e => updateItem(idx, e.target.value)}
          />
          <button
            type="button"
            onClick={() => deleteItem(idx)}
            className="opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted hover:text-destructive text-muted-foreground flex-shrink-0 mt-0.5"
          >
            <Trash2 size={11} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        <Plus size={12} strokeWidth={1.6} absoluteStrokeWidth />
        Add item
      </button>
    </div>
  );
}

// ── Image block ───────────────────────────────────────────────────────────────

function ImageBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingCaption, setEditingCaption] = useState(false);

  return (
    <div className="py-3 space-y-2">
      <div className="h-52 bg-muted/60 rounded-xl border border-border flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <ImageIcon size={36} strokeWidth={1.6} absoluteStrokeWidth />
          <span className="text-[12px]">{block.alt ?? 'Image placeholder'}</span>
        </div>
      </div>
      {editingCaption ? (
        <input
          autoFocus
          className="w-full text-[12px] text-muted-foreground text-center bg-transparent border-b border-primary outline-none"
          value={block.caption ?? ''}
          onChange={e => onUpdate({ caption: e.target.value })}
          onBlur={() => setEditingCaption(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingCaption(false); }}
        />
      ) : (
        <p
          className="text-[12px] text-muted-foreground text-center cursor-text hover:text-foreground transition-colors"
          onClick={() => setEditingCaption(true)}
        >
          {block.caption ?? 'Add a caption'}
        </p>
      )}
    </div>
  );
}

// ── Callout block ─────────────────────────────────────────────────────────────

const CALLOUT_STYLES: Record<NonNullable<BlogBlock['calloutVariant']>, string> = {
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-[#EAF3DE] border-[#3B6D11]/20 text-[#3B6D11]',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

function CalloutBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingText, setEditingText] = useState(false);
  const variant = block.calloutVariant ?? 'info';
  const styleClass = CALLOUT_STYLES[variant];

  return (
    <div className={cn('my-3 rounded-xl border p-4', styleClass)}>
      {block.calloutTitle && (
        <p className="text-[13px] font-semibold mb-1.5">{block.calloutTitle}</p>
      )}
      {editingText ? (
        <textarea
          autoFocus
          rows={3}
          className="w-full text-[13px] bg-transparent outline-none resize-none"
          value={block.calloutText ?? ''}
          onChange={e => onUpdate({ calloutText: e.target.value })}
          onBlur={() => setEditingText(false)}
        />
      ) : (
        <p
          className="text-[13px] leading-relaxed cursor-text"
          onClick={() => setEditingText(true)}
        >
          {block.calloutText}
        </p>
      )}
    </div>
  );
}

// ── Quote block ───────────────────────────────────────────────────────────────

function QuoteBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingQuote, setEditingQuote] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);

  return (
    <div className="my-4 pl-5 border-l-4 border-primary/30 space-y-2">
      {editingQuote ? (
        <textarea
          autoFocus
          rows={3}
          className="w-full text-[14px] italic text-foreground/80 bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-primary"
          value={block.quoteText ?? ''}
          onChange={e => onUpdate({ quoteText: e.target.value })}
          onBlur={() => setEditingQuote(false)}
        />
      ) : (
        <p
          className="text-[14px] italic text-foreground/80 leading-relaxed cursor-text hover:text-foreground/90 transition-colors"
          onClick={() => setEditingQuote(true)}
        >
          &ldquo;{block.quoteText}&rdquo;
        </p>
      )}
      {editingAuthor ? (
        <input
          autoFocus
          className="text-[12px] text-muted-foreground bg-transparent border-b border-primary outline-none"
          value={block.quoteAuthor ?? ''}
          onChange={e => onUpdate({ quoteAuthor: e.target.value })}
          onBlur={() => setEditingAuthor(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingAuthor(false); }}
        />
      ) : (
        <p
          className="text-[12px] text-muted-foreground font-medium cursor-text hover:text-foreground transition-colors"
          onClick={() => setEditingAuthor(true)}
        >
          &mdash; {block.quoteAuthor}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BlogSectionCanvas({ sections, generationLabel, onEditSettings }: BlogSectionCanvasProps) {
  const [blocks, setBlocksState] = useState<BlogBlock[]>(() => generateBlogBlocks(sections));
  const [leftTab, setLeftTab] = useState<'ai' | 'manual'>('ai');
  const [zoom, setZoom] = useState(1);
  const [scorePanelOpen, setScorePanelOpen] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);
  const [panelBump, setPanelBump] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Card metadata state
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);

  // Pinch-to-zoom via trackpad (ctrl+wheel)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(z => {
        const next = z - e.deltaY * 0.004;
        return Math.min(2, Math.max(0.5, +next.toFixed(2)));
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // ── Undo / redo history ────────────────────────────────────────────────────
  const historyRef    = useRef<BlogBlock[][]>([]);
  const historyIdxRef = useRef(-1);
  const [, setHistoryVersion] = useState(0);
  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((snapshot: BlogBlock[]) => {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    historyIdxRef.current = historyRef.current.length - 1;
    setHistoryVersion(v => v + 1);
  }, []);

  const setBlocks = useCallback((updater: BlogBlock[] | ((prev: BlogBlock[]) => BlogBlock[])) => {
    setBlocksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    setBlocksState(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    setBlocksState(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  // ── Derived score ──────────────────────────────────────────────────────────
  const totalBlocks  = blocks.length;
  const readyBlocks  = blocks.filter(b => b.status === 'ready').length;
  const canvasScore  = Math.round((readyBlocks / Math.max(1, totalBlocks)) * 78);
  const finalScore   = Math.min(100, canvasScore + panelBump);

  const blogConfig = EDITOR_CONFIGS['blog'];

  // ── Block CRUD ─────────────────────────────────────────────────────────────
  const updateBlock = useCallback((id: string, patch: Partial<BlogBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }, [setBlocks]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, [setBlocks]);

  const moveBlock = useCallback((id: string, dir: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, [setBlocks]);

  const addBlock = useCallback((type: BlockType) => {
    const base: BlogBlock = { id: makeBlockId(), type, status: 'warning', warningText: 'New block added — review and edit content.' };
    switch (type) {
      case 'heading':    Object.assign(base, { level: 2, headingText: 'New section heading' }); break;
      case 'paragraph':  Object.assign(base, { body: 'Write your paragraph content here.' }); break;
      case 'bullets':    Object.assign(base, { items: ['First point', 'Second point', 'Third point'] }); break;
      case 'image':      Object.assign(base, { alt: 'Image', caption: 'Add a caption for this image' }); break;
      case 'callout':    Object.assign(base, { calloutVariant: 'info', calloutTitle: 'Key point', calloutText: 'Add your callout content here.' }); break;
      case 'quote':      Object.assign(base, { quoteText: 'Add a compelling quote here.', quoteAuthor: 'Source' }); break;
      default: break;
    }
    setBlocks(prev => [...prev, base]);
  }, [setBlocks]);

  const addFaqSection = useCallback((section: FaqSectionData) => {
    const block: BlogBlock = {
      id: makeBlockId(),
      type: 'faq-section',
      faqSection: section,
      status: 'ready',
    };
    setBlocks(prev => [...prev, block]);
  }, [setBlocks]);

  const handleItemFixed = useCallback((bump: number) => {
    setPanelBump(p => p + bump);
  }, []);

  const handleFixAll = useCallback(() => {
    setFixingAll(true);
    setTimeout(() => {
      setBlocks(prev => prev.map(b =>
        b.status !== 'ready'
          ? { ...b, status: 'ready' as const, warningText: undefined }
          : b,
      ));
      setFixingAll(false);
    }, 1800);
  }, [setBlocks]);

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden border-r border-border"
        style={{ width: 280 }}
      >
        <div className="flex-none px-4 py-3 border-b border-border">
          <SegmentedToggle
            ariaLabel="Blog panel mode"
            items={LEFT_TAB_ITEMS}
            value={leftTab}
            onChange={setLeftTab}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {leftTab === 'ai' ? (
            <AiCopilot
              editorContext="editing"
              wizardSummary={generationLabel}
            />
          ) : (
            <BlogManualContent
              onAddBlock={addBlock}
              onDropFaqSection={addFaqSection}
            />
          )}
        </div>
      </div>

      {/* ── Center canvas ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-[var(--color-canvas,#F7F8FA)]">
        <div ref={canvasRef} className="flex-1 min-h-0 overflow-y-auto relative">

          {/* Floating toolbar — undo/redo + zoom */}
          <div className="sticky top-4 z-20 flex justify-center pointer-events-none">
            <div className="bg-background rounded-lg shadow-sm border border-border pointer-events-auto">
              <div className="flex items-center px-4 py-2 gap-3">
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

                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <ZoomOut size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                </button>
                <span className="text-[13px] text-muted-foreground text-nowrap min-w-[40px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <ZoomIn size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Blog card container — padding stays fixed, only the card scales */}
          <div className="px-8 py-6 pb-10">
            <div style={{ zoom }}>
              <div className={cn(
                'rounded-xl border bg-background transition-shadow',
                scorePanelOpen ? 'border-primary/30 shadow-sm' : 'border-border hover:shadow-sm',
              )}>

                {/* Card header */}
                <div className="flex items-center gap-2 px-4 h-12 border-b border-border">

                  {/* LEFT: icon + name + score */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="size-6 rounded-md bg-primary/[0.07] flex items-center justify-center flex-none">
                      <FileText size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/70" />
                    </div>
                    <span className="text-[13px] font-medium text-foreground truncate">
                      Blog post
                    </span>
                    <ScoreBar
                      score={finalScore}
                      active={scorePanelOpen}
                      onClick={() => setScorePanelOpen(v => !v)}
                    />
                  </div>

                  {/* RIGHT: metadata dropdowns + action icons */}
                  <div className="flex items-center gap-1 flex-none">

                    {/* Assign dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex items-center gap-1 h-7 px-2 rounded-md text-[12px] transition-colors',
                            assignee
                              ? 'text-primary bg-primary/[0.07] hover:bg-primary/[0.11]'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <UserCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                          <span className="max-w-[72px] truncate">{assignee ?? 'Assign'}</span>
                          <ChevronDown size={10} strokeWidth={1.6} absoluteStrokeWidth className="opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {['Haresh R.', 'Priya K.', 'Arjun M.', 'Balaji K.'].map(name => (
                          <DropdownMenuItem key={name} onSelect={() => setAssignee(name)}>
                            <UserCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2 text-muted-foreground flex-none" />
                            {name}
                            {assignee === name && (
                              <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="ml-auto text-primary flex-none" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        {assignee && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setAssignee(null)} className="text-muted-foreground">
                              Unassign
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Approval dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex items-center gap-1 h-7 px-2 rounded-md text-[12px] transition-colors',
                            approvalStatus === 'Approved'
                              ? 'text-[#1D9E75] bg-[#1D9E75]/[0.07] hover:bg-[#1D9E75]/[0.12]'
                              : approvalStatus === 'Needs review' || approvalStatus === 'Pending'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : approvalStatus === 'Rejected'
                              ? 'text-destructive bg-destructive/[0.07] hover:bg-destructive/[0.12]'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          {approvalStatus === 'Approved'
                            ? <CheckCircle size={13} strokeWidth={1.6} absoluteStrokeWidth />
                            : approvalStatus === 'Rejected'
                            ? <XCircle size={13} strokeWidth={1.6} absoluteStrokeWidth />
                            : <CircleDashed size={13} strokeWidth={1.6} absoluteStrokeWidth />
                          }
                          <span className="max-w-[72px] truncate">{approvalStatus ?? 'Approval'}</span>
                          <ChevronDown size={10} strokeWidth={1.6} absoluteStrokeWidth className="opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {['Approved', 'Needs review', 'Pending', 'Rejected'].map(status => (
                          <DropdownMenuItem key={status} onSelect={() => setApprovalStatus(status)}>
                            {status}
                            {approvalStatus === status && (
                              <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="ml-auto text-primary flex-none" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        {approvalStatus && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setApprovalStatus(null)} className="text-muted-foreground">
                              Clear
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Schedule dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex items-center gap-1 h-7 px-2 rounded-md text-[12px] transition-colors',
                            scheduleDate
                              ? 'text-primary bg-primary/[0.07] hover:bg-primary/[0.11]'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <CalendarDays size={13} strokeWidth={1.6} absoluteStrokeWidth />
                          <span className="max-w-[72px] truncate">{scheduleDate ?? 'Schedule'}</span>
                          <ChevronDown size={10} strokeWidth={1.6} absoluteStrokeWidth className="opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {['Today', 'Tomorrow', 'This Friday', 'May 15', 'May 22'].map(date => (
                          <DropdownMenuItem key={date} onSelect={() => setScheduleDate(date)}>
                            {date}
                            {scheduleDate === date && (
                              <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="ml-auto text-primary flex-none" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        {scheduleDate && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setScheduleDate(null)} className="text-muted-foreground">
                              Clear
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-4 bg-border mx-0.5" />

                    {/* Activity */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Activity size={14} strokeWidth={1.6} absoluteStrokeWidth />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Activity</TooltipContent>
                    </Tooltip>

                    {/* Version history */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <History size={14} strokeWidth={1.6} absoluteStrokeWidth />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Version history</TooltipContent>
                    </Tooltip>

                    {/* Add comment */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <MessageCircle size={14} strokeWidth={1.6} absoluteStrokeWidth />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Add comment</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border mx-0.5" />

                    {/* Save */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <BookmarkCheck size={14} strokeWidth={1.6} absoluteStrokeWidth />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Save blog post to content library</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Block list */}
                <div className="divide-y divide-border/40">
                  {blocks.map((block, idx) => (
                    <BlockRow
                      key={block.id}
                      block={block}
                      index={idx}
                      total={blocks.length}
                      onUpdate={patch => updateBlock(block.id, patch)}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, 'up')}
                      onMoveDown={() => moveBlock(block.id, 'down')}
                      fixingAll={fixingAll}
                    />
                  ))}
                </div>

                {/* Add block footer */}
                <div className="px-6 py-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => addBlock('paragraph')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20 transition-colors"
                  >
                    <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
                    Add block
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right score panel ─────────────────────────────────────────── */}
      <EditorScorePanel
        open={scorePanelOpen}
        onClose={() => setScorePanelOpen(false)}
        config={blogConfig}
        score={finalScore}
        onItemFixed={handleItemFixed}
        onFixAll={handleFixAll}
      />
    </div>
  );
}
