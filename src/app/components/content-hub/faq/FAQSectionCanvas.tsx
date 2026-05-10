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

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  GripVertical, ChevronDown, ChevronRight, Trash2, Plus,
  AlertTriangle, XCircle, CheckCircle2,
  ArrowUp, ArrowDown, Sparkles, MessageSquare, Layers,
  Undo2, Redo2, ZoomIn, ZoomOut,
  CheckCircle, CircleDashed,
  CalendarDays, UserCircle2,
  Activity, History, MessageCircle,
  Bookmark, BookmarkCheck, Layers2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiCopilot } from '../AiCopilot';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle.v1';
import { EditorScorePanel } from '../editor/EditorScorePanel';
import { EDITOR_CONFIGS } from '../editor/editorConfig';
import { scoreColor } from '../shared/scoreColors';
import type { FAQSection } from './FAQInlineCreationFlow';
import { FAQPublishModal } from './FAQPublishModal';
import { SaveToSavedModal } from './SaveToSavedModal';
import { addSavedBlock } from '../shared/savedBlocksStore';
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
}

export interface FAQSectionCanvasProps {
  sections: FAQSection[];
  generationLabel?: string;
  onEditSettings?: () => void;
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

// ── Left panel tab items ──────────────────────────────────────────────────────

const LEFT_TAB_ITEMS = [
  {
    value: 'ai' as const,
    label: 'AI',
    icon: <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-[#7c3aed]" />,
  },
  { value: 'manual' as const, label: 'Manual' },
];

// ── Score bar (matches EditorContentCard) ─────────────────────────────────────

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
      <div className="w-16 h-1.5 bg-border/70 rounded-full overflow-hidden">
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

// ── FAQ Manual panel ──────────────────────────────────────────────────────────

function FAQManualContent({
  onAddQuestion,
  onAddSection,
}: {
  onAddQuestion: () => void;
  onAddSection: () => void;
}) {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        Add content directly to your FAQ canvas.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onAddQuestion}
          className="flex flex-col items-center gap-2.5 py-6 px-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all group"
        >
          <div className="size-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-[12px] font-medium text-foreground text-center group-hover:text-primary transition-colors leading-tight">
            Add question
          </span>
        </button>
        <button
          type="button"
          onClick={onAddSection}
          className="flex flex-col items-center gap-2.5 py-6 px-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all group"
        >
          <div className="size-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Layers size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-[12px] font-medium text-foreground text-center group-hover:text-primary transition-colors leading-tight">
            Add section
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Question row ──────────────────────────────────────────────────────────────

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
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Question text */}
          {editingQ ? (
            <input
              autoFocus
              className="w-full text-[13px] font-medium text-foreground bg-transparent border-b border-primary outline-none pb-0.5"
              value={question.question}
              onChange={e => onUpdate({ question: e.target.value })}
              onBlur={() => setEditingQ(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingQ(false); }}
            />
          ) : (
            <p
              className="text-[13px] font-medium text-foreground cursor-text hover:text-primary transition-colors"
              onClick={() => setEditingQ(true)}
            >
              {question.question}
            </p>
          )}

          {/* Answer — shimmer while fixing, editable otherwise */}
          <div>
            {isBeingFixed ? (
              <div className="space-y-2 py-1 animate-pulse">
                <div className="h-2.5 w-full rounded-full bg-muted" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                <div className="h-2.5 w-4/5 rounded-full bg-muted" />
              </div>
            ) : editingA ? (
              <textarea
                autoFocus
                className="w-full text-[13px] text-muted-foreground bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-primary"
                rows={4}
                value={question.answer}
                onChange={e => onUpdate({ answer: e.target.value })}
                onBlur={() => setEditingA(false)}
              />
            ) : (
              <p
                className="text-[13px] text-muted-foreground cursor-text hover:text-foreground transition-colors leading-relaxed"
                onClick={() => setEditingA(true)}
              >
                {question.answer}
              </p>
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
}

function SectionBlock({
  section, sectionIndex, totalSections,
  onUpdate, onDelete, onMoveUp, onMoveDown, onAddQuestion, onSaveToSaved, fixingAll,
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
    <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
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
            onBlur={() => setEditingTitle(false)}
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
            className="w-full flex items-center gap-2 px-6 py-2.5 text-[12.5px] text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors border-t border-border"
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

export function FAQSectionCanvas({ sections, generationLabel, onEditSettings }: FAQSectionCanvasProps) {
  const [sectionData, setSectionData] = useState<FAQSectionData[]>(() =>
    generateMockFAQs(sections)
  );
  const [leftTab, setLeftTab] = useState<'ai' | 'manual'>('ai');
  const [zoom, setZoom] = useState(1);
  const [scorePanelOpen, setScorePanelOpen] = useState(true);
  const [fixingAll, setFixingAll] = useState(false);
  const [panelBump, setPanelBump] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Card metadata state
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
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
  // Canvas health contributes up to 78 pts; panel improvements add the remaining 22 to reach 100
  const canvasScore  = Math.round((readyCount / Math.max(1, totalQuestions)) * 78);
  const setScore     = Math.min(100, canvasScore + panelBump);

  const faqConfig = EDITOR_CONFIGS['faq'];

  const updateSection = useCallback((sId: string, patch: Partial<FAQSectionData>) => {
    setData(prev => prev.map(s => s.id === sId ? { ...s, ...patch } : s));
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

  const addQuestion = useCallback((sId: string) => {
    const newQ: FAQQuestion = {
      id: makeQId(),
      question: 'New question',
      answer: 'Write your answer here.',
      expanded: true,
      status: 'warning',
      warningText: 'This question needs a proper answer.',
    };
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

  // Manual panel callbacks — add to last section, or create one first
  const handleManualAddQuestion = useCallback(() => {
    if (sectionData.length === 0) {
      const id = `sec-${Date.now()}`;
      const newQ: FAQQuestion = {
        id: makeQId(),
        question: 'New question',
        answer: 'Write your answer here.',
        expanded: true,
        status: 'warning',
        warningText: 'This question needs a proper answer.',
      };
      setData([{ id, title: 'New section', questions: [newQ], collapsed: false }]);
    } else {
      addQuestion(sectionData[sectionData.length - 1].id);
    }
  }, [sectionData, addQuestion, setData]);

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden border-r border-border"
        style={{ width: 280 }}
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
            <AiCopilot
              editorContext="editing"
              wizardSummary={generationLabel}
            />
          ) : (
            <FAQManualContent
              onAddQuestion={handleManualAddQuestion}
              onAddSection={addSection}
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

          {/* FAQ card container — padding stays fixed, only the card scales */}
          <div className="px-8 py-6 pb-10">
            <div style={{ zoom }}>
            <div className={cn(
              'rounded-xl border bg-background transition-shadow',
              scorePanelOpen ? 'border-primary/30' : 'border-border hover:border-primary/30',
            )}>

              {/* Card header */}
              <div className="flex items-center gap-2 px-4 h-12 border-b border-border">

                {/* LEFT: icon + name + score */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="size-6 rounded-md bg-primary/[0.07] flex items-center justify-center flex-none">
                    <MessageSquare size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/70" />
                  </div>
                  <span className="text-[13px] font-medium text-foreground truncate">
                    FAQ page
                  </span>
                  <ScoreBar
                    score={setScore}
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

                  {/* Save to Saved — full FAQ */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSavingTarget('all')}
                        className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <BookmarkCheck size={14} strokeWidth={1.6} absoluteStrokeWidth />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Save entire FAQ to reuse in blogs and landing pages</TooltipContent>
                  </Tooltip>

                </div>
              </div>

              {/* Section sub-cards with visual separation */}
              <div className="p-4 flex flex-col gap-3">
                {sectionData.map((section, idx) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    sectionIndex={idx}
                    totalSections={sectionData.length}
                    onUpdate={patch => updateSection(section.id, patch)}
                    onDelete={() => deleteSection(section.id)}
                    onMoveUp={() => moveSection(section.id, 'up')}
                    onMoveDown={() => moveSection(section.id, 'down')}
                    onAddQuestion={() => addQuestion(section.id)}
                    onSaveToSaved={() => setSavingTarget(section)}
                    fixingAll={fixingAll}
                  />
                ))}

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
        </div>
      </div>

      {/* ── Right score panel ─────────────────────────────────────────── */}
      <EditorScorePanel
        open={scorePanelOpen}
        onClose={() => setScorePanelOpen(false)}
        config={faqConfig}
        score={setScore}
        onItemFixed={handleItemFixed}
        onFixAll={handleFixAll}
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
