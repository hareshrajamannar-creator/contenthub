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
  GripVertical, GripHorizontal, ChevronDown, Trash2, Plus,
  AlertTriangle, XCircle, CheckCircle2,
  ArrowUp, ArrowDown, Sparkles, Layers,
  FileText,
  AlignLeft, Type, List, Image as ImageIcon, Lightbulb, Quote,
  BookmarkX, HelpCircle, MousePointerClick, Minus, Star, Code2,
  Share2, PanelBottom, SquarePlay,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiCopilot } from '../AiCopilot';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle.v1';
import { EditorScorePanel } from '../editor/EditorScorePanel';
import { CommentPanel } from '../editor/CommentPanel';
import { EDITOR_CONFIGS } from '../editor/editorConfig';
import { EditorChromeToolbar, type EditorToolbarPosition } from '../shared/EditorChromeToolbar';
import { CanvasEditorTopBar } from '../shared/CanvasEditorTopBar';
import { ContentActivityDrawer } from '../shared/ContentActivityDrawer';
import {
  getSavedBlocks,
  removeSavedBlock,
  subscribeSavedBlocks,
  type SavedBlock,
} from '../shared/savedBlocksStore';
import type { BlogSection } from './BlogInlineCreationFlow';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlockType = 'hero' | 'heading' | 'paragraph' | 'bullets' | 'image' | 'callout' | 'quote' | 'faq-section' | 'cta-banner';

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
  // cta-banner
  ctaHeadline?: string;
  ctaBody?: string;
  ctaButtonText?: string;
  ctaBgColor?: string;
  // shared
  status?: 'ready' | 'warning' | 'blocked';
  warningText?: string;
}

export interface BlogSectionCanvasProps {
  sections: BlogSection[];
  generationLabel?: string;
  onEditSettings?: () => void;
  onVersionHistory?: () => void;
  /** AEO score from the recommendation — used as the starting content score */
  initialScore?: number;
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

  // CTA banner — mid-article
  blocks.push({
    id: makeBlockId(),
    type: 'cta-banner',
    ctaHeadline: 'Take your customer experience to the next level',
    ctaBody: 'See how thousands of businesses use our platform to build loyalty and drive growth.',
    ctaButtonText: 'Start free trial',
    ctaBgColor: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
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

  // CTA banner — end of article
  blocks.push({
    id: makeBlockId(),
    type: 'cta-banner',
    ctaHeadline: 'Ready to transform your business?',
    ctaBody: 'Join over 100,000 businesses that trust our platform to deliver exceptional experiences at scale.',
    ctaButtonText: 'Book a demo',
    ctaBgColor: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
    status: 'ready',
  });

  return blocks;
}

// ── Left panel tab items ──────────────────────────────────────────────────────

const LEFT_TAB_ITEMS = [
  {
    value: 'ai' as const,
    label: 'AI',
    icon: <Sparkles size={11} strokeWidth={1.2} absoluteStrokeWidth className="text-[#7c3aed]" />,
  },
  { value: 'manual' as const, label: 'Manual' },
];

// ── Manual panel (blog-specific) ──────────────────────────────────────────────

type BlogManualTab = 'basic' | 'prebuilt' | 'saved';

const BLOCK_PALETTE = [
  { type: 'hero' as BlockType, label: 'Header', Icon: PanelBottom },
  { type: 'heading' as BlockType, label: 'Title', Icon: Type },
  { type: 'paragraph' as BlockType, label: 'Text', Icon: AlignLeft },
  { type: 'callout' as BlockType, label: 'Button', Icon: MousePointerClick },
  { type: 'image' as BlockType, label: 'Image', Icon: ImageIcon },
  { type: 'image' as BlockType, label: 'Video', Icon: SquarePlay },
  { type: 'bullets' as BlockType, label: 'Bullet list', Icon: List },
  { type: 'paragraph' as BlockType, label: 'Divider', Icon: Minus },
  { type: 'paragraph' as BlockType, label: 'Spacer', Icon: Minus },
  { type: 'faq-section' as BlockType, label: 'FAQ', Icon: HelpCircle },
  { type: 'quote' as BlockType, label: 'Review', Icon: Star },
  { type: 'callout' as BlockType, label: 'Callout', Icon: Lightbulb },
  { type: 'callout' as BlockType, label: 'Footer', Icon: PanelBottom },
  { type: 'paragraph' as BlockType, label: 'HTML', Icon: Code2 },
  { type: 'callout' as BlockType, label: 'Social links', Icon: Share2 },
];

const BLOG_PREBUILT_TEMPLATES = [
  {
    id: 'blog-template-how-to',
    title: 'How-to article',
    description: 'Intro, steps, proof point, and closing CTA',
    types: ['heading', 'paragraph', 'bullets', 'callout'] as BlockType[],
  },
  {
    id: 'blog-template-local-seo',
    title: 'Local SEO post',
    description: 'Location intro, services, FAQs, and internal links',
    types: ['heading', 'paragraph', 'bullets', 'faq-section'] as BlockType[],
  },
  {
    id: 'blog-template-thought-leadership',
    title: 'Thought leadership',
    description: 'Strong POV, customer proof, quote, and takeaway list',
    types: ['heading', 'paragraph', 'quote', 'bullets'] as BlockType[],
  },
  {
    id: 'blog-template-media-story',
    title: 'Image-led story',
    description: 'Hero image, section heading, supporting copy, and CTA',
    types: ['image', 'heading', 'paragraph', 'callout'] as BlockType[],
  },
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
  onInsertSavedBlock: (block: SavedBlock) => void;
}

function BlogTemplatePreview({
  label,
  title,
  score = 92,
}: {
  label: string;
  title: string;
  score?: number;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-2 py-1">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText size={11} strokeWidth={1.6} absoluteStrokeWidth />
        </div>
        <span className="min-w-0 flex-1 truncate text-[8px] font-medium text-foreground">{label}</span>
        <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-4/5 rounded-full bg-[#1D9E75]" />
        </div>
        <span className="rounded bg-[#1D9E75]/10 px-1 text-[7px] font-medium text-[#1D9E75]">{score}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 py-2">
        <p className="truncate text-[8px] font-medium text-foreground">{title}</p>
        <div className="h-1 w-full rounded-full bg-muted" />
        <div className="h-1 w-10/12 rounded-full bg-muted" />
        <div className="h-1 w-8/12 rounded-full bg-muted" />
        <div className="mt-1 h-1 w-11/12 rounded-full bg-muted" />
        <div className="h-1 w-7/12 rounded-full bg-muted" />
      </div>
    </div>
  );
}

function SuggestedStyleCard({
  label,
  title,
  description,
  onClick,
  onRemove,
  previewTitle,
}: {
  label: string;
  title: string;
  description: string;
  onClick: () => void;
  onRemove?: () => void;
  previewTitle?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-background transition-colors hover:border-primary/30">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="border-b border-border bg-muted/60 p-4">
          <div className="h-[116px]">
            <BlogTemplatePreview label={label} title={previewTitle ?? title} />
          </div>
        </div>
        <div className="space-y-1 p-4">
          <p className="text-[13px] font-medium leading-snug text-foreground">{title}</p>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </button>
      {onRemove && (
        <div className="border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            Remove saved block
          </button>
        </div>
      )}
    </div>
  );
}

function BlogManualContent({ onAddBlock, onDropFaqSection, onInsertSavedBlock }: BlogManualContentProps) {
  const [manualTab, setManualTab] = useState<BlogManualTab>('basic');
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>(() => getSavedBlocks());

  useEffect(() => subscribeSavedBlocks(setSavedBlocks), []);

  const manualTabs: { value: BlogManualTab; label: string }[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'prebuilt', label: 'Pre-built' },
    { value: 'saved', label: 'Saved' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex-none p-4">
        <div className="flex rounded-lg border border-border bg-background p-1">
          {manualTabs.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setManualTab(tab.value)}
              className={cn(
                'h-8 flex-1 rounded-md text-[12px] font-medium transition-colors',
                manualTab === tab.value
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {manualTab === 'basic' && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_PALETTE.map(({ type, label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => onAddBlock(type)}
                className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03] group"
              >
                <GripHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/50" />
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <Icon size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <span className="text-[12px] font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {manualTab === 'prebuilt' && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
          {BLOG_PREBUILT_TEMPLATES.map(template => (
            <SuggestedStyleCard
              key={template.id}
              label="Blog template"
              title={template.title}
              description={template.description}
              previewTitle={template.types.map(type => type.replace('-', ' ')).join(' + ')}
              onClick={() => template.types.forEach(type => {
                if (type === 'faq-section') {
                  onDropFaqSection(LIBRARY_FAQ_SECTIONS[0]);
                  return;
                }
                onAddBlock(type);
              })}
            />
          ))}
        </div>
      )}

      {manualTab === 'saved' && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          {savedBlocks.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <BookmarkX size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-foreground">No saved blocks yet</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Save FAQ sections and reuse them inside this blog.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {savedBlocks.map(block => (
                <SuggestedStyleCard
                  key={block.id}
                  label="Saved block"
                  title={block.name}
                  description={`${block.preview.snippets.length} saved questions from ${block.preview.title}.`}
                  previewTitle={block.preview.title}
                  onClick={() => onInsertSavedBlock(block)}
                  onRemove={() => removeSavedBlock(block.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Individual block renderers ────────────────────────────────────────────────

function shouldCloseTextEditor(_event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return true;
}

interface BlockRowProps {
  block: BlogBlock;
  index: number;
  total: number;
  onUpdate: (patch: Partial<BlogBlock>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  fixingAll?: boolean;
  entranceDelay?: number;
}

function BlockRow({ block, index, total, onUpdate, onDelete, onMoveUp, onMoveDown, fixingAll, entranceDelay = 0 }: BlockRowProps) {
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
    <div
      className={cn('group relative animate-in fade-in slide-in-from-bottom-3 fill-mode-both', statusRing)}
      style={{ animationDuration: '380ms', animationDelay: `${entranceDelay}ms` }}
    >
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
    case 'cta-banner':
      return <CtaBannerBlock block={block} onUpdate={onUpdate} />;
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
            onBlur={e => { if (shouldCloseTextEditor(e)) setEditingTitle(false); }}
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
            onBlur={e => { if (shouldCloseTextEditor(e)) setEditingSubtitle(false); }}
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
  const [richStyle, setRichStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const isH2 = block.level === 2;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setRichStyle(prev => ({ ...prev, ...(e as CustomEvent<React.CSSProperties>).detail }));
    };
    el.addEventListener('richstylechange', handler);
    return () => el.removeEventListener('richstylechange', handler);
  }, [editing]);

  return (
    <div className="group/heading pt-6 pb-2">
      <div className="flex items-center gap-2">
        <GripVertical
          size={13}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className="text-muted-foreground/0 group-hover/heading:text-muted-foreground/30 transition-colors cursor-grab flex-shrink-0"
        />
        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            style={richStyle}
            className={cn(
              'flex-1 bg-transparent border-b border-primary outline-none',
              isH2 ? 'text-[18px] font-bold tracking-tight text-foreground' : 'text-[15px] font-semibold text-foreground',
            )}
            value={block.headingText ?? ''}
            onChange={e => onUpdate({ headingText: e.target.value })}
            onBlur={e => { if (shouldCloseTextEditor(e)) setEditing(false); }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
          />
        ) : (
          <p
            style={richStyle}
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
  const [richStyle, setRichStyle] = useState<React.CSSProperties>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setRichStyle(prev => ({ ...prev, ...(e as CustomEvent<React.CSSProperties>).detail }));
    };
    el.addEventListener('richstylechange', handler);
    return () => el.removeEventListener('richstylechange', handler);
  }, [editing]);

  return (
    <div className="py-2">
      {editing ? (
        <textarea
          ref={textareaRef}
          autoFocus
          rows={5}
          style={richStyle}
          className="w-full text-[14px] leading-relaxed text-foreground bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-primary"
          value={block.body ?? ''}
          onChange={e => onUpdate({ body: e.target.value })}
          onBlur={e => { if (shouldCloseTextEditor(e)) setEditing(false); }}
        />
      ) : (
        <p
          style={richStyle}
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

const IMAGE_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function ImageBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingCaption, setEditingCaption] = useState(false);
  const gradientIndex = parseInt(block.id.replace(/\D/g, ''), 10) % IMAGE_GRADIENTS.length;
  const gradient = IMAGE_GRADIENTS[gradientIndex];

  return (
    <div className="py-3 space-y-2">
      <div className="h-52 rounded-xl flex items-center justify-center" style={{ background: gradient }}>
        <div className="flex flex-col items-center gap-2">
          <ImageIcon size={36} strokeWidth={1.6} absoluteStrokeWidth className="text-white/40" />
          <span className="text-[12px] text-white/60">{block.alt ?? 'Image placeholder'}</span>
        </div>
      </div>
      {editingCaption ? (
        <input
          autoFocus
          className="w-full text-[12px] text-muted-foreground text-center bg-transparent border-b border-primary outline-none"
          value={block.caption ?? ''}
          onChange={e => onUpdate({ caption: e.target.value })}
          onBlur={e => { if (shouldCloseTextEditor(e)) setEditingCaption(false); }}
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
          onBlur={e => { if (shouldCloseTextEditor(e)) setEditingText(false); }}
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
          onBlur={e => { if (shouldCloseTextEditor(e)) setEditingQuote(false); }}
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
          onBlur={e => { if (shouldCloseTextEditor(e)) setEditingAuthor(false); }}
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

// ── CTA banner block ──────────────────────────────────────────────────────────

function CtaBannerBlock({ block, onUpdate }: { block: BlogBlock; onUpdate: (p: Partial<BlogBlock>) => void }) {
  const [editingHeadline, setEditingHeadline] = useState(false);
  const bg = block.ctaBgColor ?? 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)';

  return (
    <div className="my-4 overflow-hidden rounded-xl" style={{ background: bg }}>
      <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
        {editingHeadline ? (
          <input
            autoFocus
            className="w-full text-center text-[22px] font-bold text-white bg-transparent border-b border-white/40 outline-none pb-1"
            value={block.ctaHeadline ?? ''}
            onChange={e => onUpdate({ ctaHeadline: e.target.value })}
            onBlur={() => setEditingHeadline(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingHeadline(false); }}
          />
        ) : (
          <h2
            className="text-[22px] font-bold text-white leading-tight cursor-text hover:opacity-80 transition-opacity"
            onClick={() => setEditingHeadline(true)}
          >
            {block.ctaHeadline ?? 'Ready to get started?'}
          </h2>
        )}
        <p className="text-[14px] text-white/80 max-w-md leading-relaxed">
          {block.ctaBody ?? 'Join thousands of businesses using our platform to deliver exceptional customer experiences.'}
        </p>
        <button
          type="button"
          className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-6 text-[13px] font-semibold text-[#1e3a5f] transition-opacity hover:opacity-90"
        >
          {block.ctaButtonText ?? 'Get started free'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BlogSectionCanvas({ sections, generationLabel, onVersionHistory, initialScore }: BlogSectionCanvasProps) {
  const [blocks, setBlocksState] = useState<BlogBlock[]>(() => generateBlogBlocks(sections));
  const [leftTab, setLeftTab] = useState<'ai' | 'manual'>('ai');
  const [zoom, setZoom] = useState(1);
  const [scorePanelOpen, setScorePanelOpen] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);
  const [panelBump, setPanelBump] = useState(0);
  const [activityOpen, setActivityOpen] = useState(false);
  const [richTextVisible, setRichTextVisible] = useState(false);
  const [canvasToolbarPosition, setCanvasToolbarPosition] = useState<EditorToolbarPosition>({ top: 96, left: 640 });
  const [richTextPosition, setRichTextPosition] = useState<EditorToolbarPosition | undefined>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const activeTextTargetRef = useRef<HTMLElement | null>(null);

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

  const updateCanvasToolbarPosition = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCanvasToolbarPosition({
      top: Math.max(64, rect.top + 16),
      left: rect.left + rect.width / 2,
    });
  }, []);

  const updateRichTextPosition = useCallback((target?: HTMLElement | null) => {
    const activeTarget = target ?? activeTextTargetRef.current;
    if (!activeTarget) return;
    const selection = window.getSelection();
    const selectionRect = selection && selection.rangeCount > 0 && !selection.isCollapsed
      ? selection.getRangeAt(0).getBoundingClientRect()
      : null;
    const rect = selectionRect && selectionRect.width > 0
      ? selectionRect
      : activeTarget.getBoundingClientRect();
    setRichTextPosition({
      top: Math.max(64, rect.top - 56),
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    function isTextEditor(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(target.closest('input, textarea, [contenteditable="true"]'));
    }

    function handleFocusIn(event: FocusEvent) {
      if (!isTextEditor(event.target)) return;
      activeTextTargetRef.current = event.target as HTMLElement;
      updateRichTextPosition(event.target as HTMLElement);
      setRichTextVisible(true);
    }

    function handleFocusOut() {
      window.setTimeout(() => {
        if (isTextEditor(document.activeElement)) return;
        activeTextTargetRef.current = null;
        setRichTextVisible(false);
      }, 0);
    }

    function handleSelectionChange() {
      if (!isTextEditor(document.activeElement)) return;
      updateRichTextPosition(document.activeElement as HTMLElement);
    }

    function handleScrollOrResize() {
      updateCanvasToolbarPosition();
      if (isTextEditor(document.activeElement)) {
        updateRichTextPosition(document.activeElement as HTMLElement);
      }
    }

    updateCanvasToolbarPosition();
    el.addEventListener('focusin', handleFocusIn);
    el.addEventListener('focusout', handleFocusOut);
    el.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      el.removeEventListener('focusin', handleFocusIn);
      el.removeEventListener('focusout', handleFocusOut);
      el.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateCanvasToolbarPosition, updateRichTextPosition]);

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
  const finalScore   = Math.min(100, (initialScore !== undefined ? initialScore : canvasScore) + panelBump);

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
      case 'hero':       Object.assign(base, { heroTag: 'Blog post', heroTitle: 'New blog header', heroSubtitle: 'Add a clear summary for this article.' }); break;
      case 'heading':    Object.assign(base, { level: 2, headingText: 'New section heading' }); break;
      case 'paragraph':  Object.assign(base, { body: 'Write your paragraph content here.' }); break;
      case 'bullets':    Object.assign(base, { items: ['First point', 'Second point', 'Third point'] }); break;
      case 'image':      Object.assign(base, { alt: 'Image', caption: 'Add a caption for this image' }); break;
      case 'callout':    Object.assign(base, { calloutVariant: 'info', calloutTitle: 'Key point', calloutText: 'Add your callout content here.' }); break;
      case 'quote':      Object.assign(base, { quoteText: 'Add a compelling quote here.', quoteAuthor: 'Source' }); break;
      case 'faq-section': Object.assign(base, { faqSection: LIBRARY_FAQ_SECTIONS[0], status: 'ready', warningText: undefined }); break;
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

  const insertSavedBlock = useCallback((block: SavedBlock) => {
    const section: FaqSectionData = {
      id: `${block.id}-${Date.now()}`,
      title: block.preview.title || block.name,
      questions: block.preview.snippets.map((question, index) => ({
        id: `saved-q-${Date.now()}-${index}`,
        question,
        answer: 'Review and update this saved answer for the current blog post.',
      })),
    };
    addFaqSection(section);
  }, [addFaqSection]);

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
    <div className="flex flex-1 min-h-0 gap-2 bg-[var(--color-canvas,#F7F8FA)] p-2 animate-in fade-in duration-150">
      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background animate-in fade-in slide-in-from-left-6 fill-mode-both"
        style={{ width: 300, animationDuration: '400ms', animationDelay: '0ms' }}
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
              onInsertSavedBlock={insertSavedBlock}
            />
          )}
        </div>
      </div>

      {/* ── Center canvas ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col gap-2">
        <div
          className="animate-in fade-in slide-in-from-top-2 fill-mode-both"
          style={{ animationDuration: '300ms', animationDelay: '80ms' }}
        >
          <CanvasEditorTopBar
            score={finalScore}
            scoreLabel="Content score"
            scorePanelOpen={scorePanelOpen}
            onScoreClick={() => { setScorePanelOpen(v => !v); setCommentsOpen(false); }}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoom={zoom}
            onZoomOut={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
            onZoomIn={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))}
            onVersionHistory={onVersionHistory}
            onActivity={() => { setActivityOpen(v => !v); setScorePanelOpen(false); setCommentsOpen(false); }}
            onChat={() => { setCommentsOpen(v => !v); setScorePanelOpen(false); setActivityOpen(false); }}
          />
        </div>

        {richTextVisible && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-150 fill-mode-both">
            <EditorChromeToolbar
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              zoom={zoom}
              onZoomOut={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
              onZoomIn={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))}
              richTextVisible={true}
              canvasPosition={canvasToolbarPosition}
              richTextPosition={richTextPosition}
              inlineMode
            />
          </div>
        )}

        <div ref={canvasRef} className="relative min-h-0 flex-1 overflow-y-auto rounded-xl bg-transparent">

          {/* Blog card container — padding stays fixed, only the card scales */}
          <div className="px-8 py-6 pb-10">
            <div style={{ zoom }}>
              <div
                className="rounded-xl bg-background animate-in fade-in zoom-in-95 fill-mode-both"
                style={{ animationDuration: '380ms', animationDelay: '160ms' }}
              >

                {/* Block list */}
                <div>
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
                      entranceDelay={260 + idx * 60}
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

      {/* ── Comment panel ─────────────────────────────────────────────── */}
      <CommentPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />

      {/* ── Activity panel ────────────────────────────────────────────── */}
      <ContentActivityDrawer
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        contentType="blog"
      />
    </div>
  );
}
