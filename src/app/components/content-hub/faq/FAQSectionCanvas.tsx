/**
 * FAQSectionCanvas
 *
 * Post-generation canvas for the FAQ flow.
 * Layout:
 *  ┌──────────────────────┬──────────────────────────────────────┬─────────┐
 *  │  Left panel (280px)  │  Center canvas (flex-1)              │  Score  │
 *  │  AI / Manual tabs    │  Floating toolbar (undo + zoom)      │  panel  │
 *  │                      │  Single FAQ card                     │ (280px) │
 *  │                      │    ├─ card header (score pill)       │         │
 *  │                      │    └─ section sub-cards + add btn    │         │
 *  └──────────────────────┴──────────────────────────────────────┴─────────┘
 */

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import {
  GripVertical, GripHorizontal, ChevronDown, ChevronRight, Trash2, Plus,
  AlertTriangle, XCircle, CheckCircle2,
  ArrowUp, ArrowDown, Sparkles, Layers,
  Bookmark, BookmarkX, MessageSquare,
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
import type { FAQSection } from './FAQInlineCreationFlow';
import { FAQPublishModal } from './FAQPublishModal';
import { SaveToSavedModal } from './SaveToSavedModal';
import {
  addSavedBlock,
  getSavedBlocks,
  removeSavedBlock,
  subscribeSavedBlocks,
  type SavedBlock,
} from '../shared/savedBlocksStore';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestionStatus = 'ready' | 'warning' | 'blocked';

export interface FAQQuestion {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
  status: QuestionStatus;
  warningText?: string;
}

export interface FAQSectionData {
  id: string;
  title: string;
  questions: FAQQuestion[];
  collapsed: boolean;
  standalone?: boolean;
}

export interface FAQSectionCanvasProps {
  sections: FAQSection[];
  generationLabel?: string;
  onEditSettings?: () => void;
  onVersionHistory?: () => void;
  /** Pre-loaded Q&As from a recommendation — bypasses mock generation */
  initialQuestions?: { question: string; answer: string }[];
  /** AEO score from the recommendation — used as the starting content score */
  initialScore?: number;
}

// ── Build section data from preloaded questions ───────────────────────────────

function buildSectionDataFromQuestions(questions: { question: string; answer: string }[]): FAQSectionData[] {
  return [{
    id: 'sec-preloaded-1',
    title: 'AI-generated FAQs',
    collapsed: false,
    questions: questions.map((q, i) => ({
      id: makeQId(),
      question: q.question,
      answer: q.answer,
      expanded: i === 0,
      status: 'ready' as QuestionStatus,
    })),
  }];
}

// ── Mock FAQ generation ───────────────────────────────────────────────────────

const MOCK_QA: Record<string, { question: string; answer: string; status: QuestionStatus; warningText?: string }[]> = {
  default: [
    {
      question: 'How quickly can you respond to an emergency?',
      answer: 'Our team is available 24/7 and typically responds to emergency calls within 30–60 minutes. We prioritize urgent situations to minimize disruption and ensure your safety.',
      status: 'ready',
    },
    {
      question: 'Do you offer same-day service?',
      answer: 'Yes, we offer same-day service for most requests submitted before 2 PM local time. Availability may vary during peak periods or holidays.',
      status: 'ready',
    },
    {
      question: 'Are you licensed and insured?',
      answer: 'We are fully licensed, bonded, and insured. Our technicians carry all required certifications and our work is backed by a 1-year service guarantee.',
      status: 'ready',
    },
    {
      question: 'What areas do you serve?',
      answer: 'We currently serve the greater metropolitan area and surrounding suburbs within a 50-mile radius. Contact us to confirm service availability for your location.',
      status: 'warning',
      warningText: 'Answer may be too generic — add location-specific detail for AEO.',
    },
    {
      question: 'What happens if the issue recurs after service?',
      answer: 'We stand behind our work. If the same issue recurs within 30 days of service, we will return and resolve it at no additional charge.',
      status: 'ready',
    },
  ],
  appointments: [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book online at our website, call us directly, or use our app. Online bookings are available 24/7 and confirmed instantly.',
      status: 'ready',
    },
    {
      question: 'How much does a standard service call cost?',
      answer: 'Standard service calls start at $85 for the first hour, with materials billed separately. We provide a detailed estimate before any work begins.',
      status: 'ready',
    },
    {
      question: 'Do you offer free estimates?',
      answer: 'Yes, we offer free estimates for all new projects. Estimates are provided within 24 hours of your initial inquiry.',
      status: 'ready',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, cash, check, and digital payments including Apple Pay and Google Pay.',
      status: 'ready',
    },
    {
      question: 'Can I reschedule or cancel my appointment?',
      answer: 'Yes, appointments can be rescheduled or cancelled up to 24 hours in advance at no charge. Same-day cancellations may incur a $25 fee.',
      status: 'warning',
      warningText: 'Consider adding a direct booking link for better AEO performance.',
    },
  ],
  special: [
    {
      question: 'Do you service commercial properties?',
      answer: 'Yes, we serve both residential and commercial clients. For commercial properties, we offer volume pricing and dedicated account managers.',
      status: 'ready',
    },
    {
      question: 'Can you handle large or complex jobs?',
      answer: 'Absolutely. Our team is equipped for projects of all sizes. For large-scale work, we perform a site visit before providing a comprehensive proposal.',
      status: 'ready',
    },
    {
      question: 'What if I need service outside normal hours?',
      answer: 'We offer after-hours and weekend service at a premium rate. Contact us directly to arrange and confirm availability.',
      status: 'ready',
    },
    {
      question: 'Do you provide written warranties?',
      answer: 'Yes, all work comes with a written warranty. Terms vary by service type — ask your technician for details when work is completed.',
      status: 'blocked',
      warningText: 'Missing: specific warranty duration and what is covered. This may hurt trust signals.',
    },
  ],
};

function getQAPool(sectionTitle: string): typeof MOCK_QA['default'] {
  const lower = sectionTitle.toLowerCase();
  if (lower.includes('appoint') || lower.includes('cost') || lower.includes('pric') || lower.includes('book')) {
    return MOCK_QA['appointments'];
  }
  if (lower.includes('special') || lower.includes('case') || lower.includes('complex') || lower.includes('large')) {
    return MOCK_QA['special'];
  }
  return MOCK_QA['default'];
}

let qIdCounter = 1000;
function makeQId() { return `q${qIdCounter++}`; }

function createNewFAQQuestion(): FAQQuestion {
  return {
    id: makeQId(),
    question: 'New question',
    answer: 'Write your answer here.',
    expanded: true,
    status: 'warning',
    warningText: 'This question needs a proper answer.',
  };
}

function generateMockFAQs(sections: FAQSection[]): FAQSectionData[] {
  return sections.map(section => {
    const pool = getQAPool(section.title);
    const questions: FAQQuestion[] = Array.from({ length: section.count }, (_, i) => {
      const qa = pool[i % pool.length];
      return {
        id: makeQId(),
        question: qa.question,
        answer: qa.answer,
        expanded: true,
        status: qa.status,
        warningText: qa.warningText,
      };
    });
    return {
      id: section.id,
      title: section.title,
      questions,
      collapsed: false,
    };
  });
}

// ── FAQ canvas template definitions ──────────────────────────────────────────

interface FAQCanvasTemplate {
  id: string;
  title: string;
  description: string;
  hue: number;
  sections: FAQSection[];
}

const FAQ_CANVAS_TEMPLATES: FAQCanvasTemplate[] = [
  {
    id: 'general',
    title: 'General business',
    description: 'Common questions any local business gets asked',
    hue: 210,
    sections: [
      { id: 'gen-1', title: 'General questions', description: '', count: 5 },
      { id: 'gen-2', title: 'Pricing and appointments', description: '', count: 4 },
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Menu, hours, reservations, dietary options',
    hue: 30,
    sections: [
      { id: 'rest-1', title: 'Menu and dining', description: '', count: 5 },
      { id: 'rest-2', title: 'Reservations and hours', description: '', count: 4 },
    ],
  },
  {
    id: 'home-services',
    title: 'Home services',
    description: 'Service area, availability, pricing, guarantees',
    hue: 145,
    sections: [
      { id: 'hs-1', title: 'General questions', description: '', count: 5 },
      { id: 'hs-2', title: 'Special cases', description: '', count: 4 },
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Appointments, insurance, new patient info',
    hue: 180,
    sections: [
      { id: 'hc-1', title: 'Appointments and booking', description: '', count: 5 },
      { id: 'hc-2', title: 'Pricing and appointments', description: '', count: 4 },
    ],
  },
  {
    id: 'real-estate',
    title: 'Real estate',
    description: 'Buying, selling, listings, and market info',
    hue: 280,
    sections: [
      { id: 're-1', title: 'Buying and selling', description: '', count: 5 },
      { id: 're-2', title: 'Pricing and appointments', description: '', count: 4 },
    ],
  },
];

// ── Empty-canvas helper components ────────────────────────────────────────────

function FAQTemplateCard({
  template,
  onSelect,
}: {
  template: FAQCanvasTemplate;
  onSelect: (id: string) => void;
}) {
  const headerBg = `hsl(${template.hue}, 28%, 52%)`;
  const accentBg = `hsl(${template.hue}, 25%, 92%)`;

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 hover:shadow-md transition-all group text-left"
    >
      <div className="relative w-full bg-zinc-100 p-4">
        <div
          className="w-full bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-black/[0.07]"
          style={{ height: 90 }}
        >
          <div className="h-7 w-full flex items-center gap-2 px-2" style={{ background: headerBg }}>
            <div className="size-3.5 rounded bg-white/30 shrink-0" />
            <div className="flex flex-col gap-[2px] flex-1">
              <div className="h-[2px] w-full bg-white/70 rounded-full" />
              <div className="h-[2px] w-2/3 bg-white/40 rounded-full" />
            </div>
          </div>
          <div className="px-2 py-1.5 flex flex-col gap-[4px]">
            <div className="h-[2.5px] w-full rounded-full bg-zinc-200" />
            <div className="h-[5px] rounded-[2px] w-full" style={{ background: accentBg }} />
            <div className="h-[2.5px] w-4/5 rounded-full bg-zinc-200" />
            <div className="h-[5px] rounded-[2px] w-full" style={{ background: accentBg }} />
          </div>
        </div>
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-t-xl">
          <span className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground shadow-sm">
            Use template
          </span>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {template.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
}

function EmptyFAQCanvasState({ onSelectTemplate }: { onSelectTemplate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-8 px-8 py-10">
      <div className="text-center space-y-2">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
          <MessageSquare size={22} strokeWidth={1.6} absoluteStrokeWidth className="text-primary" />
        </div>
        <p className="text-[15px] font-semibold text-foreground">Your FAQ canvas is ready</p>
        <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
          Use the AI Copilot on the left to generate FAQs, or start from a template below.
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-muted-foreground shrink-0">or choose a template</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {FAQ_CANVAS_TEMPLATES.map(tmpl => (
            <FAQTemplateCard key={tmpl.id} template={tmpl} onSelect={onSelectTemplate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQGeneratingState() {
  return (
    <div className="px-8 py-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-primary animate-pulse" />
        <span className="text-[13px] font-medium text-foreground">Generating your FAQs…</span>
      </div>
      {Array.from({ length: 3 }).map((_, si) => (
        <div
          key={si}
          className="rounded-xl border border-border/60 bg-background overflow-hidden"
        >
          <div
            className="h-10 border-b border-border bg-muted/30 px-4 flex items-center gap-3 animate-pulse"
            style={{ animationDelay: `${si * 0.1}s` }}
          >
            <div className="size-5 rounded-md bg-muted" />
            <div className="h-3 w-40 rounded-full bg-muted" />
          </div>
          {Array.from({ length: 3 }).map((_, qi) => (
            <div
              key={qi}
              className="border-b border-border last:border-b-0 px-6 py-3 animate-pulse"
              style={{ animationDelay: `${(si * 3 + qi) * 0.08}s` }}
            >
              <div className="h-3 w-2/3 rounded-full bg-muted mb-2" />
              <div className="h-2.5 w-full rounded-full bg-muted/60" />
              <div className="h-2.5 w-4/5 rounded-full bg-muted/60 mt-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
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

// ── FAQ Manual panel ──────────────────────────────────────────────────────────

type FAQManualTab = 'basic' | 'prebuilt' | 'saved';

const FAQ_PREBUILT_SECTIONS = [
  {
    id: 'faq-prebuilt-emergency',
    title: 'Emergency service FAQ',
    description: 'Response time, same-day service, and urgent requests',
    questions: [
      {
        question: 'How quickly can you respond to an emergency?',
        answer: 'Our team is available 24/7 and prioritizes urgent requests. Most emergency calls receive a response within 30-60 minutes depending on location and technician availability.',
      },
      {
        question: 'Do you offer same-day service?',
        answer: 'Yes, same-day service is available for many requests submitted before 2 PM local time. Availability may vary by service area and appointment volume.',
      },
    ],
  },
  {
    id: 'faq-prebuilt-pricing',
    title: 'Pricing and appointments',
    description: 'Booking, estimates, payment, and service fees',
    questions: [
      {
        question: 'How do I book an appointment?',
        answer: 'You can book online, call our team, or request a callback. We confirm appointment windows and service details before dispatching a technician.',
      },
      {
        question: 'Do you provide estimates before work begins?',
        answer: 'Yes. We review the issue, explain the recommended service, and provide an estimate before any billable work begins.',
      },
    ],
  },
  {
    id: 'faq-prebuilt-local',
    title: 'Local coverage FAQ',
    description: 'Service areas, nearby locations, and availability',
    questions: [
      {
        question: 'What areas do you serve?',
        answer: 'We serve the primary metro area and nearby communities. Contact us with your address to confirm availability for your specific location.',
      },
      {
        question: 'Can I choose a nearby location?',
        answer: 'Yes. If multiple locations serve your area, we can route your request to the location with the best availability.',
      },
    ],
  },
];

function ManualSubTabs({
  value,
  onChange,
}: {
  value: FAQManualTab;
  onChange: (value: FAQManualTab) => void;
}) {
  const tabs: { value: FAQManualTab; label: string }[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'prebuilt', label: 'Pre-built' },
    { value: 'saved', label: 'Saved' },
  ];

  return (
    <div className="flex rounded-lg border border-border bg-background p-1">
      {tabs.map(tab => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'h-8 flex-1 rounded-md text-[12px] font-medium transition-colors',
            value === tab.value
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FAQManualActionCard({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
    >
      <GripHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/50" />
      <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-[12px] font-medium text-foreground">{label}</p>
    </button>
  );
}

function FAQTemplatePreview({
  title,
  questions,
  score = 95,
}: {
  title: string;
  questions: string[];
  score?: number;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-2 py-1">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <MessageSquare size={11} strokeWidth={1.6} absoluteStrokeWidth />
        </div>
        <span className="min-w-0 flex-1 truncate text-[8px] font-medium text-foreground">FAQ page</span>
        <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-4/5 rounded-full bg-[#1D9E75]" />
        </div>
        <span className="rounded bg-[#1D9E75]/10 px-1 text-[7px] font-medium text-[#1D9E75]">{score}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 py-2">
        <p className="truncate text-[8px] font-medium text-foreground">{title}</p>
        {questions.slice(0, 4).map((question, index) => (
          <div key={`${question}-${index}`} className="space-y-1">
            <p className="truncate text-[7px] text-foreground/70">{question}</p>
            <div className="h-1 w-11/12 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQSuggestedStyleCard({
  label,
  title,
  description,
  questions,
  onClick,
  onRemove,
}: {
  label: string;
  title: string;
  description: string;
  questions: string[];
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-background transition-colors hover:border-primary/30">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="border-b border-border bg-muted/60 p-4">
          <div className="h-[116px]">
            <FAQTemplatePreview title={title} questions={questions} />
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

function FAQManualContent({
  onAddQuestion,
  onAddSection,
  onAddPrebuiltSection,
  onInsertSavedBlock,
}: {
  onAddQuestion: () => void;
  onAddSection: () => void;
  onAddPrebuiltSection: (template: typeof FAQ_PREBUILT_SECTIONS[number]) => void;
  onInsertSavedBlock: (block: SavedBlock) => void;
}) {
  const [manualTab, setManualTab] = useState<FAQManualTab>('basic');
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>(() => getSavedBlocks());

  useEffect(() => subscribeSavedBlocks(setSavedBlocks), []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none p-4">
        <ManualSubTabs value={manualTab} onChange={setManualTab} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {manualTab === 'basic' && (
          <div className="grid grid-cols-2 gap-2">
            <FAQManualActionCard
              label="Question"
              icon={<Plus size={18} strokeWidth={1.6} absoluteStrokeWidth />}
              onClick={onAddQuestion}
            />
            <FAQManualActionCard
              label="Section"
              icon={<Layers size={18} strokeWidth={1.6} absoluteStrokeWidth />}
              onClick={onAddSection}
            />
          </div>
        )}

        {manualTab === 'prebuilt' && (
          <div className="space-y-2 pt-1">
            {FAQ_PREBUILT_SECTIONS.map(template => (
              <FAQSuggestedStyleCard
                key={template.id}
                label="FAQ suggestion"
                title={template.title}
                description={template.description}
                questions={template.questions.map(item => item.question)}
                onClick={() => onAddPrebuiltSection(template)}
              />
            ))}
          </div>
        )}

        {manualTab === 'saved' && (
          savedBlocks.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <BookmarkX size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-foreground">No saved blocks yet</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Save FAQ sections from the canvas and reuse them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {savedBlocks.map(block => (
                <FAQSuggestedStyleCard
                  key={block.id}
                  label="Saved block"
                  title={block.name}
                  description={`${block.preview.snippets.length} saved questions from ${block.preview.title}.`}
                  questions={block.preview.snippets}
                  onClick={() => onInsertSavedBlock(block)}
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

// ── Question row ──────────────────────────────────────────────────────────────

function shouldCloseTextEditor(_event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return true;
}

function EditableFAQField({
  value,
  onChange,
  editing,
  onEditingChange,
  variant,
}: {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  variant: 'question' | 'answer';
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placedCaretRef = useRef(false);
  const [richStyle, setRichStyle] = useState<React.CSSProperties>({});
  const isQuestion = variant === 'question';
  const textClass = isQuestion
    ? 'text-[13px] font-medium text-foreground'
    : 'text-[13px] leading-relaxed text-muted-foreground';
  const sharedClass = cn(
    'w-full border-b bg-transparent px-0 py-0.5 text-left transition-colors',
    textClass,
  );

  // Persist rich styles (font size, color, etc.) applied by EditorChromeToolbar
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setRichStyle(prev => ({ ...prev, ...(e as CustomEvent<React.CSSProperties>).detail }));
    };
    el.addEventListener('richstylechange', handler);
    return () => el.removeEventListener('richstylechange', handler);
  }, [editing]);

  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!editing) {
      placedCaretRef.current = false;
      return;
    }
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
    if (!placedCaretRef.current) {
      node.focus();
      node.setSelectionRange(value.length, value.length);
      placedCaretRef.current = true;
    }
  }, [editing, value]);

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        rows={1}
        style={richStyle}
        className={cn(
          sharedClass,
          'overflow-hidden border-primary outline-none resize-none',
        )}
        value={value}
        onChange={event => onChange(event.target.value)}
        onBlur={event => { if (shouldCloseTextEditor(event)) onEditingChange(false); }}
        onKeyDown={event => {
          if (event.key === 'Escape' || (isQuestion && event.key === 'Enter' && !event.shiftKey)) {
            event.preventDefault();
            onEditingChange(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      style={richStyle}
      onClick={() => onEditingChange(true)}
      className={cn(
        sharedClass,
        'border-transparent hover:border-border/60 focus-visible:border-primary focus-visible:outline-none',
      )}
    >
      {value}
    </button>
  );
}

interface QuestionRowProps {
  question: FAQQuestion;
  index: number;
  totalInSection: number;
  onUpdate: (patch: Partial<FAQQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  fixingAll?: boolean;
}

function QuestionRow({ question, index, totalInSection, onUpdate, onDelete, onMoveUp, onMoveDown, fixingAll }: QuestionRowProps) {
  const [editingQ, setEditingQ] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [fixing, setFixing] = useState(false);

  const isBeingFixed = fixing || (!!fixingAll && question.status !== 'ready');

  function handleFixThis() {
    setFixing(true);
    setTimeout(() => {
      let improved = question.answer;
      if (question.warningText?.includes('location')) {
        improved = 'We serve Austin, Cedar Park, Round Rock, and surrounding communities within a 40-mile radius. Visit our website or call us to confirm same-day availability in your area.';
      } else if (question.warningText?.includes('booking')) {
        improved = question.answer.replace(/\.$/, '') + '. Book directly at our website or call (512) 555-0100 — same-day slots available.';
      } else if (question.warningText?.includes('warranty')) {
        improved = 'Yes, all work comes with a written 1-year warranty covering parts and labor. For specialized services, extended warranties of up to 3 years are available — ask your technician at time of service.';
      } else {
        improved = question.answer + ' For further details, contact our team directly.';
      }
      onUpdate({ answer: improved, status: 'ready', warningText: undefined });
      setFixing(false);
    }, 1600);
  }

  return (
    <div className={cn(
      'group relative border-b border-border last:border-b-0',
      question.status === 'blocked' && 'bg-destructive/[0.03]',
      question.status === 'warning' && 'bg-amber-50/40',
    )}>
      <div className="flex items-start gap-2 px-4 py-3">
        {/* Drag handle */}
        <GripVertical
          size={14}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className="text-muted-foreground/30 mt-1 flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Number */}
        <span className="text-[12px] text-muted-foreground/60 mt-1 flex-shrink-0 w-5 text-right select-none">
          {index + 1}.
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <EditableFAQField
            value={question.question}
            onChange={value => onUpdate({ question: value })}
            editing={editingQ}
            onEditingChange={setEditingQ}
            variant="question"
          />

          {/* Answer — shimmer while fixing, editable otherwise */}
          <div>
            {isBeingFixed ? (
              <div className="space-y-2 py-1 animate-pulse">
                <div className="h-2.5 w-full rounded-full bg-muted" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                <div className="h-2.5 w-4/5 rounded-full bg-muted" />
              </div>
            ) : (
              <EditableFAQField
                value={question.answer}
                onChange={value => onUpdate({ answer: value })}
                editing={editingA}
                onEditingChange={setEditingA}
                variant="answer"
              />
            )}
          </div>

          {/* Warning / blocked — inline text + "Fix this" blue link */}
          {question.warningText && !isBeingFixed && (
            <div className={cn(
              'flex items-start gap-1.5',
              question.status === 'warning' && 'text-amber-600',
              question.status === 'blocked' && 'text-destructive',
            )}>
              {question.status === 'warning'
                ? <AlertTriangle size={12} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-shrink-0" />
                : <XCircle size={12} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-shrink-0" />
              }
              <span className="text-[12px] leading-relaxed">
                {question.warningText}{' '}
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

        {/* Right side actions */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
          {question.status !== 'ready' && (
            question.status === 'warning'
              ? <AlertTriangle size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-amber-500" />
              : <XCircle size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-destructive" />
          )}
          {question.status === 'ready' && (
            <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-[#1D9E75]" />
          )}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
          >
            <ArrowUp size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalInSection - 1}
            title="Move down"
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
          >
            <ArrowDown size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="p-1 rounded hover:bg-muted hover:text-destructive transition-colors text-muted-foreground"
          >
            <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────

interface SectionBlockProps {
  section: FAQSectionData;
  sectionIndex: number;
  totalSections: number;
  onUpdate: (patch: Partial<FAQSectionData>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddQuestion: () => void;
  onSaveToSaved: () => void;
  fixingAll?: boolean;
  entranceDelay?: number;
}

function SectionBlock({
  section, sectionIndex, totalSections,
  onUpdate, onDelete, onMoveUp, onMoveDown, onAddQuestion, onSaveToSaved, fixingAll,
  entranceDelay = 0,
}: SectionBlockProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  const readyCount   = section.questions.filter(q => q.status === 'ready').length;
  const blockedCount = section.questions.filter(q => q.status === 'blocked').length;
  const warnCount    = section.questions.filter(q => q.status === 'warning').length;

  const updateQuestion = useCallback((qId: string, patch: Partial<FAQQuestion>) => {
    onUpdate({
      questions: section.questions.map(q => q.id === qId ? { ...q, ...patch } : q),
    });
  }, [section.questions, onUpdate]);

  const deleteQuestion = useCallback((qId: string) => {
    onUpdate({ questions: section.questions.filter(q => q.id !== qId) });
  }, [section.questions, onUpdate]);

  const moveQuestion = useCallback((qId: string, dir: 'up' | 'down') => {
    const idx = section.questions.findIndex(q => q.id === qId);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === section.questions.length - 1) return;
    const next = [...section.questions];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onUpdate({ questions: next });
  }, [section.questions, onUpdate]);

  return (
    <div
      className="rounded-xl border border-border/60 bg-background overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDuration: '400ms', animationDelay: `${entranceDelay}ms` }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
        <GripVertical
          size={14}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className="text-muted-foreground/30 flex-shrink-0 cursor-grab"
        />

        {/* Editable title + inline issue chips */}
        {editingTitle ? (
          <input
            autoFocus
            className="flex-1 min-w-0 text-[13px] font-semibold text-foreground bg-transparent border-b border-primary outline-none"
            value={section.title}
            onChange={e => onUpdate({ title: e.target.value })}
            onBlur={e => { if (shouldCloseTextEditor(e)) setEditingTitle(false); }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false); }}
          />
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-left text-[13px] font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {section.title}
            </button>
            {warnCount > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 flex-shrink-0">
                <AlertTriangle size={10} strokeWidth={1.6} absoluteStrokeWidth className="text-amber-600" />
                <span className="text-[11px] text-amber-600">{warnCount}</span>
              </div>
            )}
            {blockedCount > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-destructive/10 flex-shrink-0">
                <XCircle size={10} strokeWidth={1.6} absoluteStrokeWidth className="text-destructive" />
                <span className="text-[11px] text-destructive">{blockedCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Move / collapse / delete */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={sectionIndex === 0}
            title="Move section up"
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
          >
            <ArrowUp size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={sectionIndex === totalSections - 1}
            title="Move section down"
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground disabled:opacity-25"
          >
            <ArrowDown size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ collapsed: !section.collapsed })}
            title={section.collapsed ? 'Expand section' : 'Collapse section'}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            {section.collapsed
              ? <ChevronRight size={13} strokeWidth={1.6} absoluteStrokeWidth />
              : <ChevronDown size={13} strokeWidth={1.6} absoluteStrokeWidth />
            }
          </button>
          <button
            type="button"
            onClick={onSaveToSaved}
            title="Save section to Saved"
            className="p-1 rounded hover:bg-muted hover:text-primary transition-colors text-muted-foreground"
          >
            <Bookmark size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete section"
            className="p-1 rounded hover:bg-muted hover:text-destructive transition-colors text-muted-foreground"
          >
            <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      </div>

      {/* Questions list */}
      {!section.collapsed && (
        <>
          {section.questions.map((q, qi) => (
            <QuestionRow
              key={q.id}
              question={q}
              index={qi}
              totalInSection={section.questions.length}
              onUpdate={patch => updateQuestion(q.id, patch)}
              onDelete={() => deleteQuestion(q.id)}
              onMoveUp={() => moveQuestion(q.id, 'up')}
              onMoveDown={() => moveQuestion(q.id, 'down')}
              fixingAll={fixingAll}
            />
          ))}

          {/* Add question — clearly inside this section */}
          <button
            type="button"
            onClick={onAddQuestion}
            className="w-full flex items-center gap-2 px-6 py-2.5 text-[12.5px] text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors"
          >
            <Plus size={13} strokeWidth={1.6} absoluteStrokeWidth />
            Add question
          </button>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FAQSectionCanvas({ sections, generationLabel, onVersionHistory, initialQuestions, initialScore }: FAQSectionCanvasProps) {
  const [sectionData, setSectionData] = useState<FAQSectionData[]>(() =>
    initialQuestions && initialQuestions.length > 0
      ? buildSectionDataFromQuestions(initialQuestions)
      : generateMockFAQs(sections)
  );
  const [leftTab, setLeftTab] = useState<'ai' | 'manual'>('ai');
  const [zoom, setZoom] = useState(1);
  const [scorePanelOpen, setScorePanelOpen] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);
  const [panelBump, setPanelBump] = useState(0);
  const baseScore = initialScore;
  const [isGeneratingFromCopilot, setIsGeneratingFromCopilot] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [richTextVisible, setRichTextVisible] = useState(false);
  const [canvasToolbarPosition, setCanvasToolbarPosition] = useState<EditorToolbarPosition>({ top: 96, left: 640 });
  const [richTextPosition, setRichTextPosition] = useState<EditorToolbarPosition | undefined>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const activeTextTargetRef = useRef<HTMLElement | null>(null);

  // Card metadata state
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Save to Saved — null = closed, 'all' = save full FAQ, FAQSectionData = save one section
  const [savingTarget, setSavingTarget] = useState<FAQSectionData | 'all' | null>(null);

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
  const historyRef    = useRef<FAQSectionData[][]>([]);
  const historyIdxRef = useRef(-1);
  const [, setHistoryVersion] = useState(0);
  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((snapshot: FAQSectionData[]) => {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    historyIdxRef.current = historyRef.current.length - 1;
    setHistoryVersion(v => v + 1);
  }, []);

  const setData = useCallback((updater: FAQSectionData[] | ((prev: FAQSectionData[]) => FAQSectionData[])) => {
    setSectionData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    setSectionData(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    setSectionData(historyRef.current[historyIdxRef.current]);
    setHistoryVersion(v => v + 1);
  }, []);

  // Derived stats
  const totalQuestions = sectionData.reduce((s, sec) => s + sec.questions.length, 0);
  const readyCount     = sectionData.flatMap(s => s.questions).filter(q => q.status === 'ready').length;
  // When a rec score is provided, use it as the base; otherwise derive from Q&A health
  const canvasScore  = Math.round((readyCount / Math.max(1, totalQuestions)) * 78);
  const setScore     = Math.min(100, (baseScore !== undefined ? baseScore : canvasScore) + panelBump);

  const faqConfig = EDITOR_CONFIGS['faq'];
  const visibleSections = sectionData.filter(section => !section.standalone);

  const updateSection = useCallback((sId: string, patch: Partial<FAQSectionData>) => {
    setData(prev => prev.map(s => s.id === sId ? { ...s, ...patch } : s));
  }, [setData]);

  const updateQuestionInSection = useCallback((sId: string, qId: string, patch: Partial<FAQQuestion>) => {
    setData(prev => prev.map(section =>
      section.id === sId
        ? { ...section, questions: section.questions.map(q => q.id === qId ? { ...q, ...patch } : q) }
        : section,
    ));
  }, [setData]);

  const deleteQuestionFromSection = useCallback((sId: string, qId: string) => {
    setData(prev => prev
      .map(section =>
        section.id === sId
          ? { ...section, questions: section.questions.filter(q => q.id !== qId) }
          : section,
      )
      .filter(section => !section.standalone || section.questions.length > 0));
  }, [setData]);

  const moveQuestionInSection = useCallback((sId: string, qId: string, dir: 'up' | 'down') => {
    setData(prev => prev.map(section => {
      if (section.id !== sId) return section;
      const idx = section.questions.findIndex(q => q.id === qId);
      if (dir === 'up' && idx === 0) return section;
      if (dir === 'down' && idx === section.questions.length - 1) return section;
      const next = [...section.questions];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...section, questions: next };
    }));
  }, [setData]);

  const deleteSection = useCallback((sId: string) => {
    setData(prev => prev.filter(s => s.id !== sId));
  }, [setData]);

  const moveSection = useCallback((sId: string, dir: 'up' | 'down') => {
    setData(prev => {
      const idx = prev.findIndex(s => s.id === sId);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, [setData]);

  const addSection = useCallback(() => {
    const id = `sec-${Date.now()}`;
    setData(prev => [
      ...prev,
      { id, title: 'New section', questions: [], collapsed: false },
    ]);
  }, [setData]);

  const addQuestionToSection = useCallback((sId: string) => {
    const newQ = createNewFAQQuestion();
    setData(prev => prev.map(s =>
      s.id === sId ? { ...s, questions: [...s.questions, newQ] } : s
    ));
  }, [setData]);

  const handleItemFixed = useCallback((bump: number) => {
    setPanelBump(p => p + bump);
  }, []);

  const handleFixAll = useCallback(() => {
    setFixingAll(true);
    setTimeout(() => {
      setData(prev => prev.map(section => ({
        ...section,
        questions: section.questions.map(q =>
          q.status !== 'ready'
            ? { ...q, status: 'ready' as QuestionStatus, warningText: undefined }
            : q
        ),
      })));
      setFixingAll(false);
    }, 1800);
  }, [setData]);

  // Manual panel callback — standalone Q&As are not forced into a section.
  const handleManualAddQuestion = useCallback(() => {
    const newQ = createNewFAQQuestion();
    setData(prev => {
      const standaloneIndex = prev.findIndex(section => section.standalone);
      if (standaloneIndex >= 0) {
        return prev.map((section, index) =>
          index === standaloneIndex
            ? { ...section, questions: [...section.questions, newQ] }
            : section,
        );
      }
      return [
        {
          id: `standalone-${Date.now()}`,
          title: 'Standalone questions',
          questions: [newQ],
          collapsed: false,
          standalone: true,
        },
        ...prev,
      ];
    });
  }, [setData]);

  const handleAddPrebuiltSection = useCallback((template: typeof FAQ_PREBUILT_SECTIONS[number]) => {
    setData(prev => [
      ...prev,
      {
        id: `${template.id}-${Date.now()}`,
        title: template.title,
        collapsed: false,
        questions: template.questions.map(item => ({
          id: makeQId(),
          question: item.question,
          answer: item.answer,
          expanded: true,
          status: 'ready' as QuestionStatus,
        })),
      },
    ]);
  }, [setData]);

  const handleInsertSavedBlock = useCallback((block: SavedBlock) => {
    setData(prev => [
      ...prev,
      {
        id: `${block.id}-${Date.now()}`,
        title: block.preview.title || block.name,
        collapsed: false,
        questions: block.preview.snippets.map((question, index) => ({
          id: makeQId(),
          question,
          answer: 'Review and update this saved answer for the current page.',
          expanded: true,
          status: index === 0 ? 'warning' as QuestionStatus : 'ready' as QuestionStatus,
          warningText: index === 0 ? 'Saved block inserted — review answer for this page.' : undefined,
        })),
      },
    ]);
  }, [setData]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    const tmpl = FAQ_CANVAS_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setSectionData(generateMockFAQs(tmpl.sections));
  }, []);

  const handleCopilotStartGenerating = useCallback(() => {
    setIsGeneratingFromCopilot(true);
    window.setTimeout(() => {
      const copilotSections: FAQSection[] = [
        { id: `ai-${Date.now()}-1`, title: 'General questions', description: '', count: 5 },
        { id: `ai-${Date.now()}-2`, title: 'Pricing and appointments', description: '', count: 5 },
        { id: `ai-${Date.now()}-3`, title: 'Special cases', description: '', count: 4 },
      ];
      setSectionData(generateMockFAQs(copilotSections));
      setIsGeneratingFromCopilot(false);
    }, 3200);
  }, []);

  return (
    <div className="flex flex-1 min-h-0 gap-2 bg-[var(--color-canvas,#F7F8FA)] p-2 animate-in fade-in duration-150">
      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background animate-in fade-in slide-in-from-left-6 fill-mode-both"
        style={{ width: 300, animationDuration: '400ms', animationDelay: '0ms' }}
      >
        <div className="flex-none px-4 py-3 border-b border-border">
          <SegmentedToggle
            ariaLabel="FAQ panel mode"
            items={LEFT_TAB_ITEMS}
            value={leftTab}
            onChange={setLeftTab}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {leftTab === 'ai' ? (
            sectionData.length === 0 ? (
              <AiCopilot
                editorContext="setup"
                initialContentType="faq"
                onStartGenerating={handleCopilotStartGenerating}
              />
            ) : (
              <AiCopilot
                editorContext="editing"
                wizardSummary={generationLabel}
              />
            )
          ) : (
            <FAQManualContent
              onAddQuestion={handleManualAddQuestion}
              onAddSection={addSection}
              onAddPrebuiltSection={handleAddPrebuiltSection}
              onInsertSavedBlock={handleInsertSavedBlock}
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
            score={setScore}
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
            onSave={() => setSavingTarget('all')}
            onChat={() => { setCommentsOpen(v => !v); setScorePanelOpen(false); setActivityOpen(false); }}
          />
        </div>

        {richTextVisible && (
          <div className="relative z-10 animate-in fade-in slide-in-from-top-1 duration-150 fill-mode-both">
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
              mode="faq"
            />
          </div>
        )}

        <div ref={canvasRef} className="relative min-h-0 flex-1 overflow-y-auto rounded-xl bg-transparent">

          {sectionData.length === 0 && !isGeneratingFromCopilot ? (
            <EmptyFAQCanvasState onSelectTemplate={handleSelectTemplate} />
          ) : isGeneratingFromCopilot ? (
            <FAQGeneratingState />
          ) : (
          /* FAQ card container — padding stays fixed, only the card scales */
          <div className="px-8 py-6 pb-10">
            <div style={{ zoom }}>
            <div
              className="rounded-xl border border-border/60 bg-background animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDuration: '380ms', animationDelay: '160ms' }}
            >

              {/* Section sub-cards with visual separation */}
              <div className="p-4 flex flex-col gap-3">
                {sectionData.map(section => {
                  if (section.standalone) {
                    return section.questions.map((question, qi) => (
                      <QuestionRow
                        key={question.id}
                        question={question}
                        index={qi}
                        totalInSection={section.questions.length}
                        onUpdate={patch => updateQuestionInSection(section.id, question.id, patch)}
                        onDelete={() => deleteQuestionFromSection(section.id, question.id)}
                        onMoveUp={() => moveQuestionInSection(section.id, question.id, 'up')}
                        onMoveDown={() => moveQuestionInSection(section.id, question.id, 'down')}
                        fixingAll={fixingAll}
                      />
                    ));
                  }

                  const sectionIndex = visibleSections.findIndex(visible => visible.id === section.id);
                  return (
                    <SectionBlock
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      totalSections={visibleSections.length}
                      onUpdate={patch => updateSection(section.id, patch)}
                      onDelete={() => deleteSection(section.id)}
                      onMoveUp={() => moveSection(section.id, 'up')}
                      onMoveDown={() => moveSection(section.id, 'down')}
                      onAddQuestion={() => addQuestionToSection(section.id)}
                      onSaveToSaved={() => setSavingTarget(section)}
                      fixingAll={fixingAll}
                      entranceDelay={260 + sectionIndex * 90}
                    />
                  );
                })}

                {/* Add section */}
                <button
                  type="button"
                  onClick={addSection}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20 transition-colors"
                >
                  <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
                  Add section
                </button>
              </div>
            </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* ── Right score panel ─────────────────────────────────────────── */}
      <EditorScorePanel
        open={scorePanelOpen && sectionData.length > 0 && !isGeneratingFromCopilot}
        onClose={() => setScorePanelOpen(false)}
        config={faqConfig}
        dimensions={faqConfig.scoreDimensions.map(d =>
          d.label === 'AEO score' ? { ...d, score: baseScore ?? d.score } : d
        )}
        score={setScore}
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
        contentType="faq"
      />

      {/* ── Save to Saved modal ──────────────────────────────────────── */}
      {savingTarget !== null && (() => {
        const isFull = savingTarget === 'all';
        const previewTitle = isFull ? 'Full FAQ page' : (savingTarget as FAQSectionData).title;
        const snippets = isFull
          ? sectionData.flatMap(s => s.questions.map(q => q.question)).slice(0, 3)
          : (savingTarget as FAQSectionData).questions.map(q => q.question).slice(0, 3);
        const defaultName = isFull ? 'FAQ content' : (savingTarget as FAQSectionData).title;

        return (
          <SaveToSavedModal
            open
            onClose={() => setSavingTarget(null)}
            defaultName={defaultName}
            previewTitle={previewTitle}
            previewSnippets={snippets}
            sourceType={isFull ? 'faq-full' : 'faq-section'}
            onSave={name => {
              addSavedBlock({
                name,
                createdBy: 'Haresh R.',
                sourceType: isFull ? 'faq-full' : 'faq-section',
                preview: { title: previewTitle, snippets },
              });
              setSavingTarget(null);
            }}
          />
        );
      })()}

      {/* ── Publish / Export modal ────────────────────────────────────── */}
      <FAQPublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        faqs={sectionData.flatMap(sec =>
          sec.questions.map(q => ({
            faq_id: q.id,
            question: q.question,
            answer: q.answer,
            intent: 'informational' as const,
            funnel_stage: 'awareness' as const,
            editorialScore: q.status === 'ready' ? 82 : 45,
            lowestDimension: q.status === 'ready' ? '' : 'Answer depth',
            status: q.status === 'ready' ? 'ready' : ('needs-work' as const),
            warnings: q.warningText ? [q.warningText] : [],
            hardBlock: q.status === 'blocked',
          }))
        )}
        overallScore={setScore}
      />
    </div>
  );
}
