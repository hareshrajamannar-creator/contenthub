import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  X, ChevronRight, ChevronLeft, Minus, Plus,
  MessageSquare, FileText, Share2, Mail, Monitor,
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { MODAL_OVERLAY_VISUAL_CLASS } from '@/app/components/ui/modalOverlayClasses';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuickCreateMode = 'faq' | 'blog' | 'project';

export interface QuickCreateModalProps {
  mode: QuickCreateMode | null;
  onClose: () => void;
  onGenerate: (mode: QuickCreateMode) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BRAND_KIT = { name: 'LushGreen Brand Kit', locations: 10 };

const FAQ_Q_OPTIONS  = [5, 10, 15, 20];
const BLOG_CT_OPTIONS = [1, 2, 3, 5];

const DEFAULT_FAQ_IDEA =
  'Property appraisal FAQs for Dubbo real estate, covering valuation methods, timelines, and what to expect from the process.';

const DEFAULT_BLOG_IDEAS = [
  'Dubbo property appraisal: a complete guide for homeowners in 2025',
  'Top 5 things to know before getting a property appraisal',
  'Common property appraisal mistakes and how to avoid them',
  'How to choose a qualified property appraiser in Dubbo',
  'Property appraisal vs market appraisal: what is the difference?',
];

const TITLE: Record<QuickCreateMode, string> = {
  faq:     'Create FAQ page',
  blog:    'Create blog post',
  project: 'Create project',
};

const STEP_LABELS: Record<QuickCreateMode, string[]> = {
  faq:     ['Brand kit & details', 'Review content idea'],
  blog:    ['Brand kit & details', 'Review content ideas'],
  project: ['Brand kit & details', 'Select content types', 'Review content ideas'],
};

// ── Project content types ─────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { id: 'blog'    as const, label: 'Blog post',    icon: FileText,      defaultCount: 1, defaultOn: true  },
  { id: 'social'  as const, label: 'Social posts', icon: Share2,        defaultCount: 3, defaultOn: true  },
  { id: 'email'   as const, label: 'Email',        icon: Mail,          defaultCount: 1, defaultOn: true  },
  { id: 'faq'     as const, label: 'FAQ page',     icon: MessageSquare, defaultCount: 1, defaultOn: false },
  { id: 'landing' as const, label: 'Landing page', icon: Monitor,       defaultCount: 1, defaultOn: false },
];
type ProjectTypeId = typeof PROJECT_TYPES[number]['id'];

interface ProjectTypeEntry {
  id: ProjectTypeId;
  selected: boolean;
  count: number;
  ideas: string[];
}

function defaultIdeas(id: ProjectTypeId, count: number): string[] {
  const pools: Record<ProjectTypeId, string[]> = {
    blog:    DEFAULT_BLOG_IDEAS,
    social:  [
      'Before and after: our spring lawn transformation',
      'Spring garden checklist for a fresh start',
      'Now is the best time to book your garden cleanup',
      'Three signs your garden needs professional care this season',
      'Behind the scenes: a day in the life of our lawn team',
    ],
    email:   [
      'Spring offer: book your cleanup this week for 20% off',
      'Seasonal reminder: get your garden ready before the rush',
    ],
    faq:     [DEFAULT_FAQ_IDEA],
    landing: ['Spring garden services: book now and save'],
  };
  return Array.from({ length: count }, (_, i) => pools[id][i] ?? `${id} idea ${i + 1}`);
}

function makeDefaultProjectTypes(): ProjectTypeEntry[] {
  return PROJECT_TYPES.map(t => ({
    id:       t.id,
    selected: t.defaultOn,
    count:    t.defaultCount,
    ideas:    t.defaultOn ? defaultIdeas(t.id, t.defaultCount) : [],
  }));
}

// ── Small primitives ──────────────────────────────────────────────────────────

function BrandKitCard() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 shrink-0" />
        <div>
          <p className="text-[13px] font-medium text-foreground">{BRAND_KIT.name}</p>
          <p className="text-[11px] text-muted-foreground">{BRAND_KIT.locations} locations</p>
        </div>
      </div>
      <button type="button" className="text-[12px] text-primary hover:underline">Change</button>
    </div>
  );
}

function CountPills({ options, value, onChange }: { options: number[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'h-8 px-4 rounded-full text-[13px] font-medium transition-colors',
            value === opt
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CountStepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
      >
        <Minus size={12} strokeWidth={1.6} absoluteStrokeWidth />
      </button>
      <span className="w-5 text-center text-[13px] font-medium text-foreground tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
      >
        <Plus size={12} strokeWidth={1.6} absoluteStrokeWidth />
      </button>
    </div>
  );
}

function IdeaBox({ label, value, onChange, rows = 2 }: { label?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function QuickCreateModal({ mode, onClose, onGenerate }: QuickCreateModalProps) {
  const totalSteps = mode === 'project' ? 3 : 2;
  const [step, setStep] = useState(1);

  // FAQ state
  const [faqTopic,   setFaqTopic]   = useState('');
  const [faqCount,   setFaqCount]   = useState(10);
  const [faqIdea,    setFaqIdea]    = useState(DEFAULT_FAQ_IDEA);

  // Blog state
  const [blogTopic,    setBlogTopic]    = useState('');
  const [blogKeywords, setBlogKeywords] = useState('');
  const [blogCount,    setBlogCount]    = useState(1);
  const [blogIdeas,    setBlogIdeas]    = useState<string[]>([DEFAULT_BLOG_IDEAS[0]]);

  // Project state
  const [projectName,    setProjectName]    = useState('Spring campaign 2025');
  const [projectContext, setProjectContext] = useState('');
  const [projectTypes,   setProjectTypes]   = useState<ProjectTypeEntry[]>(makeDefaultProjectTypes);

  // Reset when mode changes
  useEffect(() => {
    setStep(1);
    setFaqTopic('');
    setFaqCount(10);
    setFaqIdea(DEFAULT_FAQ_IDEA);
    setBlogTopic('');
    setBlogKeywords('');
    setBlogCount(1);
    setBlogIdeas([DEFAULT_BLOG_IDEAS[0]]);
    setProjectName('Spring campaign 2025');
    setProjectContext('');
    setProjectTypes(makeDefaultProjectTypes());
  }, [mode]);

  // Sync blog ideas length when count changes
  useEffect(() => {
    setBlogIdeas(prev =>
      Array.from({ length: blogCount }, (_, i) => prev[i] ?? DEFAULT_BLOG_IDEAS[i] ?? `Blog post idea ${i + 1}`)
    );
  }, [blogCount]);

  // Project type helpers
  function updateProjectType(id: ProjectTypeId, patch: { selected?: boolean; count?: number }) {
    setProjectTypes(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, ...patch };
      if (!next.selected) return { ...next, ideas: [] };
      const newCount = next.count;
      const pool = defaultIdeas(id, newCount);
      next.ideas = Array.from({ length: newCount }, (_, i) => t.ideas[i] ?? pool[i] ?? '');
      return next;
    }));
  }

  function updateProjectIdea(id: ProjectTypeId, index: number, value: string) {
    setProjectTypes(prev => prev.map(t => {
      if (t.id !== id) return t;
      const ideas = [...t.ideas];
      ideas[index] = value;
      return { ...t, ideas };
    }));
  }

  const isLastStep = step === totalSteps;

  function handleContinue() {
    if (isLastStep) {
      onGenerate(mode!);
    } else {
      setStep(s => s + 1);
    }
  }

  // ── Step renderers ─────────────────────────────────────────────────────────

  function renderFaqStep1() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Brand kit</p>
          <BrandKitCard />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground">What should the FAQ cover?</label>
          <textarea
            value={faqTopic}
            onChange={e => setFaqTopic(e.target.value)}
            placeholder="e.g. Property appraisals for homeowners in Dubbo"
            rows={3}
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-foreground">Number of questions</label>
          <CountPills options={FAQ_Q_OPTIONS} value={faqCount} onChange={setFaqCount} />
        </div>
      </div>
    );
  }

  function renderFaqStep2() {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          This is the content idea your FAQ will be built around. Edit to refine.
        </p>
        <IdeaBox value={faqIdea} onChange={setFaqIdea} rows={5} />
      </div>
    );
  }

  function renderBlogStep1() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Brand kit</p>
          <BrandKitCard />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground">What should this blog be about?</label>
          <textarea
            value={blogTopic}
            onChange={e => setBlogTopic(e.target.value)}
            placeholder="e.g. Property appraisal guide for Dubbo homeowners"
            rows={2}
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground">
            Target keywords <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            value={blogKeywords}
            onChange={e => setBlogKeywords(e.target.value)}
            placeholder="e.g. property appraisal, Dubbo real estate"
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
          <p className="text-[11px] text-muted-foreground">Separate multiple keywords with commas.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-foreground">Number of blog posts</label>
          <CountPills options={BLOG_CT_OPTIONS} value={blogCount} onChange={setBlogCount} />
        </div>
      </div>
    );
  }

  function renderBlogStep2() {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {blogCount === 1
            ? 'AI has suggested a content idea. Edit to refine before generating.'
            : `${blogCount} content ideas based on your topic. Edit any of them to refine.`}
        </p>
        {blogIdeas.map((idea, i) => (
          <IdeaBox
            key={i}
            label={blogCount > 1 ? `Blog post ${i + 1}` : undefined}
            value={idea}
            onChange={v => setBlogIdeas(prev => prev.map((x, j) => (j === i ? v : x)))}
            rows={2}
          />
        ))}
      </div>
    );
  }

  function renderProjectStep1() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Brand kit</p>
          <BrandKitCard />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground">Project name</label>
          <input
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-foreground">
            What is this project about? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={projectContext}
            onChange={e => setProjectContext(e.target.value)}
            placeholder="e.g. Spring season campaign to promote garden cleanup services"
            rows={3}
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
        </div>
      </div>
    );
  }

  function renderProjectStep2() {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-muted-foreground mb-1">
          Select what to create and how many of each.
        </p>
        {PROJECT_TYPES.map(ct => {
          const entry = projectTypes.find(t => t.id === ct.id)!;
          const Icon = ct.icon;
          return (
            <div
              key={ct.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                entry.selected ? 'border-primary/30 bg-primary/[0.03]' : 'border-border bg-background',
              )}
            >
              <button
                type="button"
                onClick={() => updateProjectType(ct.id, { selected: !entry.selected })}
                className="flex items-center gap-3 flex-1 text-left min-w-0"
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  entry.selected ? 'bg-primary/10' : 'bg-muted',
                )}>
                  <Icon size={14} strokeWidth={1.6} absoluteStrokeWidth className={entry.selected ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <span className={cn('text-[13px] font-medium', entry.selected ? 'text-foreground' : 'text-muted-foreground')}>
                  {ct.label}
                </span>
              </button>
              {entry.selected && (
                <CountStepper
                  value={entry.count}
                  onChange={v => updateProjectType(ct.id, { count: v })}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderProjectStep3() {
    const selected = projectTypes.filter(t => t.selected);
    return (
      <div className="flex flex-col gap-6">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          AI has prefilled one idea per piece. Edit to refine before generating.
        </p>
        {selected.map(entry => {
          const ct = PROJECT_TYPES.find(c => c.id === entry.id)!;
          return (
            <div key={entry.id} className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold text-foreground">
                {ct.label}{entry.count > 1 ? ` (${entry.count})` : ''}
              </p>
              {entry.ideas.map((idea, i) => (
                <IdeaBox
                  key={i}
                  value={idea}
                  onChange={v => updateProjectIdea(entry.id, i, v)}
                  rows={2}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  function renderStep() {
    if (mode === 'faq')     return step === 1 ? renderFaqStep1()     : renderFaqStep2();
    if (mode === 'blog')    return step === 1 ? renderBlogStep1()    : renderBlogStep2();
    if (mode === 'project') {
      if (step === 1) return renderProjectStep1();
      if (step === 2) return renderProjectStep2();
      return renderProjectStep3();
    }
    return null;
  }

  const stepLabel    = mode ? STEP_LABELS[mode][step - 1] : '';
  const continueLabel = isLastStep ? 'Generate' : 'Continue';

  return (
    <DialogPrimitive.Root open={mode !== null} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            MODAL_OVERLAY_VISUAL_CLASS,
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[520px] max-h-[85vh]',
            'bg-background rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.16)]',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div>
              <DialogPrimitive.Title className="text-[15px] font-semibold text-foreground">
                {mode ? TITLE[mode] : ''}
              </DialogPrimitive.Title>
              <p className="text-[12px] text-muted-foreground mt-0.5">{stepLabel}</p>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={15} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep(s => s - 1))}
              className="flex items-center gap-1 h-8 px-3 rounded-lg text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} strokeWidth={1.6} absoluteStrokeWidth />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {continueLabel}
              {!isLastStep && <ChevronRight size={14} strokeWidth={1.6} absoluteStrokeWidth />}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
