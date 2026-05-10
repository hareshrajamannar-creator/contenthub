/**
 * FAQInlineCreationFlow
 *
 * 3-step inline creation flow for FAQ generation inside ContentEditorShell.
 * Replaces InlineCreationFlow for mode === 'faq'.
 *
 * Steps:
 *  1. brand-kit — Select brand kit + business location
 *  2. setup     — Template, source URL, signal sources, objective, publish destinations
 *  3. sections  — Review / edit section titles, descriptions, question counts
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, Paperclip, X, FileText, Zap, Wrench, MessageSquare, MapPin, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  CONTENT_FLOW_STEP_TITLE_CLASS,
  CONTENT_FLOW_FIELD_CLASS,
  CONTENT_FLOW_TEXTAREA_CLASS,
  ContentFlowBrandKitSummary,
  ContentFlowChip,
  ContentFlowCountStepper,
  ContentFlowChoiceCard,
} from '../shared/ContentFlowControls';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FAQSection {
  id: string;
  title: string;
  description: string;
  count: number;
}

export interface FAQFlowData {
  brandKit: string;
  location: string;
  template: string;
  customAgent?: string;
  sourceUrl: string;
  additionalContext: string;
  questionCount: number;
  signalSources: string[];
  attachments: string[];
  sections: FAQSection[];
}

export interface FlowNavControls {
  advance: () => void;
  back: () => void;
  generate: () => void;
}

export interface FlowNavState {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
}

export interface FAQInlineCreationFlowProps {
  onComplete: (data: FAQFlowData) => void;
  onCancel: () => void;
  controlRef?: React.MutableRefObject<FlowNavControls | null>;
  onNavStateChange?: (state: FlowNavState) => void;
  hideProgress?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BRAND_KITS = [
  { id: 'olive-garden', label: 'Olive Garden corporate' },
  { id: 'birdeye-demo', label: 'Birdeye demo brand' },
  { id: 'local-seo', label: 'Local SEO brand kit' },
];

const LOCATIONS = [
  { id: 'all', label: 'All locations (10)' },
  { id: 'dallas', label: 'Dallas, TX' },
  { id: 'austin', label: 'Austin, TX' },
  { id: 'houston', label: 'Houston, TX' },
  { id: 'chicago', label: 'Chicago, IL' },
];

const TEMPLATES: { id: string; label: string; description: string; Icon: React.FC<{ size: number; strokeWidth: number; absoluteStrokeWidth?: boolean; className?: string }> }[] = [
  { id: 'aeo',      label: 'AEO optimized',        description: 'Win answer-engine visibility for specific queries',  Icon: Zap },
  { id: 'newpage',  label: 'New page FAQ builder',  description: 'Generate FAQs for a new page or service',           Icon: FileText },
  { id: 'existing', label: 'Optimize existing',     description: 'Improve existing FAQs on a page',                   Icon: Wrench },
  { id: 'support',  label: 'Customer support FAQs', description: 'From tickets, reviews, queries',                    Icon: MessageSquare },
  { id: 'location', label: 'Location-specific',     description: 'FAQs tailored to a specific location',              Icon: MapPin },
  { id: 'custom',   label: 'Custom',                description: 'Configure everything manually',                     Icon: Settings },
];

const CUSTOM_AGENTS = [
  { id: 'faq-pro',     label: 'FAQ Pro — deep Q&A structuring' },
  { id: 'local-seo',  label: 'Local SEO Agent — geo-targeted FAQs' },
  { id: 'support-ai', label: 'Support AI — ticket-driven FAQs' },
  { id: 'voice-opt',  label: 'Voice Optimizer — voice-search phrasing' },
  { id: 'brand-gpt',  label: 'Brand GPT — on-voice, on-brand answers' },
];

const SIGNAL_SOURCES = [
  { id: 'reviews', label: 'Reviews data' },
  { id: 'tickets', label: 'Ticketing data' },
  { id: 'website', label: 'Website content' },
  { id: 'helpcenter', label: 'Help center articles' },
  { id: 'social', label: 'Social media posts' },
  { id: 'competitor', label: 'Competitor FAQs' },
];


const DEFAULT_SECTIONS: FAQSection[] = [
  { id: 's1', title: 'FAQ overview', description: 'Cover the most common questions customers have about pricing, bookings, services, locations, and any edge cases worth addressing upfront', count: 14 },
];

function distributeQuestionCount(sections: FAQSection[], total: number): FAQSection[] {
  if (sections.length === 0) return sections;
  const base = Math.floor(total / sections.length);
  const remainder = total % sections.length;
  return sections.map((section, index) => ({
    ...section,
    count: Math.max(1, base + (index < remainder ? 1 : 0)),
  }));
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Brand kit', 'Content setup', 'Review topics'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors flex-shrink-0',
                done || active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}>
                {done ? <Check size={12} strokeWidth={1.6} absoluteStrokeWidth /> : i + 1}
              </div>
              <span className={cn(
                'text-[13px] transition-colors',
                active ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn(
                'w-[75px] h-px shrink-0 transition-colors',
                done ? 'bg-primary' : 'bg-border',
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Brand kit + location ──────────────────────────────────────────────

interface Step1Props {
  brandKit: string;
  location: string;
  onChange: (brandKit: string, location: string) => void;
}

function Step1BrandKit({ brandKit, location, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Select brand kit and location</h2>
        <p className="text-[13px] text-muted-foreground">
          Content will be created from the selected brand identity and location context.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand kit</label>
          <Select value={brandKit} onValueChange={v => onChange(v, location)}>
            <SelectTrigger className="h-10 w-full rounded-xl bg-background text-[13px]">
              <SelectValue placeholder="Select brand kit" />
            </SelectTrigger>
            <SelectContent>
              {BRAND_KITS.map(bk => (
                <SelectItem key={bk.id} value={bk.id} className="text-[13px]">{bk.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Location</label>
          <Select value={location} onValueChange={v => onChange(brandKit, v)}>
            <SelectTrigger className="h-10 w-full rounded-xl bg-background text-[13px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(loc => (
                <SelectItem key={loc.id} value={loc.id} className="text-[13px]">{loc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {brandKit && <ContentFlowBrandKitSummary contentLabel="FAQ content" />}
    </div>
  );
}

// ── Step 2: Content setup ─────────────────────────────────────────────────────

interface Step2Props {
  template: string;
  customAgent: string;
  sourceUrl: string;
  additionalContext: string;
  questionCount: number;
  signalSources: string[];
  attachments: string[];
  onChange: (patch: Partial<Pick<FAQFlowData, 'template' | 'customAgent' | 'sourceUrl' | 'additionalContext' | 'questionCount' | 'signalSources' | 'attachments'>>) => void;
}

function Step2Setup({ template, customAgent, sourceUrl, additionalContext, questionCount, signalSources, attachments, onChange }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSignal = (id: string) => {
    const next = signalSources.includes(id)
      ? signalSources.filter(s => s !== id)
      : [...signalSources, id];
    onChange({ signalSources: next });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files)
      .filter(f => f.type === 'application/pdf')
      .map(f => f.name);
    if (names.length) onChange({ attachments: [...attachments, ...names] });
  };

  const removeAttachment = (name: string) => {
    onChange({ attachments: attachments.filter(a => a !== name) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Content setup</h2>
        <p className="text-[13px] text-muted-foreground">
          Configure the FAQ type, question count, source material, and enrichment signals.
        </p>
      </div>

      {/* Template */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">What kind of FAQ are you creating?</label>
        <div className="flex flex-col gap-2">
          {TEMPLATES.map(t => (
            <ContentFlowChoiceCard
              key={t.id}
              selected={template === t.id}
              onClick={() => onChange({ template: t.id })}
              icon={t.Icon}
              title={t.label}
              description={t.description}
            />
          ))}
        </div>

        {template === 'custom' && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-medium text-foreground">Select agent</label>
            <Select value={customAgent} onValueChange={v => onChange({ customAgent: v })}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-background text-[13px]">
                <SelectValue placeholder="Choose a custom agent..." />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_AGENTS.map(a => (
                  <SelectItem key={a.id} value={a.id} className="text-[13px]">{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
        <div>
          <label className="text-[13px] font-medium text-foreground">Number of questions</label>
          <p className="mt-0.5 text-[12px] text-muted-foreground">We will distribute these across your review topics.</p>
        </div>
        <ContentFlowCountStepper
          value={questionCount}
          min={3}
          max={30}
          ariaLabel="questions"
          onChange={value => onChange({ questionCount: value })}
        />
      </div>

      {/* Source URL */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Source URL</label>
        <Input
          value={sourceUrl}
          onChange={e => onChange({ sourceUrl: e.target.value })}
          placeholder="https://yourwebsite.com/faq"
          className={CONTENT_FLOW_FIELD_CLASS}
        />
        <p className="text-[12px] text-muted-foreground">
          We will crawl this page to extract existing Q&amp;A content.
        </p>
      </div>

      {/* Additional context */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Additional context <span className="text-muted-foreground font-normal">(optional)</span></label>
        <Textarea
          value={additionalContext}
          onChange={e => onChange({ additionalContext: e.target.value })}
          placeholder="Anything specific you want covered or avoided..."
          className={CONTENT_FLOW_TEXTAREA_CLASS}
          rows={2}
        />
      </div>

      {/* Signal sources */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Pull signals from</label>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_SOURCES.map(src => (
            <ContentFlowChip
              key={src.id}
              label={src.label}
              selected={signalSources.includes(src.id)}
              onClick={() => toggleSignal(src.id)}
            />
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Attachments <span className="text-muted-foreground font-normal">(optional)</span></label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/25"
        >
          <Paperclip size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">Attach PDFs for more context</span>
          <span className="text-[11px] text-muted-foreground/70">Drag and drop or click to browse</span>
        </button>
        {attachments.length > 0 && (
          <div className="space-y-1.5">
            {attachments.map(name => (
              <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <FileText size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground shrink-0" />
                <span className="text-[13px] text-foreground flex-1 truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(name)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={14} strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Section review ────────────────────────────────────────────────────

interface Step3Props {
  sections: FAQSection[];
  onChange: (sections: FAQSection[]) => void;
}

function FAQDescriptionCard({
  section,
  onDescriptionChange,
}: {
  section: FAQSection;
  onDescriptionChange: (description: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localDesc, setLocalDesc] = useState(section.description);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onDescriptionChange(localDesc);
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border bg-background cursor-text transition-colors',
        editing ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border hover:border-border/80',
      )}
      onClick={() => !editing && setEditing(true)}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          value={localDesc}
          onChange={e => setLocalDesc(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Escape') commit(); }}
          rows={3}
          className="w-full resize-none bg-transparent outline-none text-[13px] text-foreground leading-relaxed"
        />
      ) : (
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
          {localDesc}
        </p>
      )}
    </div>
  );
}

function Step3Sections({ sections, onChange }: Step3Props) {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const section = sections[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Review topics</h2>
        <p className="text-[13px] text-muted-foreground">
          Click to edit what this FAQ should cover before generating.
        </p>
      </div>

      {generating ? (
        <div className="px-4 py-3 rounded-xl border border-border bg-background animate-pulse">
          <div className="space-y-2">
            <div className="h-2.5 rounded-full bg-muted w-[90%]" />
            <div className="h-2.5 rounded-full bg-muted w-full" />
            <div className="h-2.5 rounded-full bg-muted w-[70%]" />
          </div>
        </div>
      ) : section ? (
        <div className="animate-in fade-in duration-500">
          <FAQDescriptionCard
            section={section}
            onDescriptionChange={desc => onChange(sections.map(s => s.id === section.id ? { ...s, description: desc } : s))}
          />
        </div>
      ) : null}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FAQInlineCreationFlow({ onComplete, onCancel, controlRef, onNavStateChange, hideProgress = false }: FAQInlineCreationFlowProps) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);

  // Step 1 state
  const [brandKit, setBrandKit]   = useState('olive-garden');
  const [location, setLocation]   = useState('all');

  // Step 2 state
  const [template, setTemplate]           = useState('aeo');
  const [customAgent, setCustomAgent]     = useState('');
  const [sourceUrl, setSourceUrl]         = useState('');
  const [additionalContext, setContext]   = useState('');
  const [questionCount, setQuestionCount] = useState(14);
  const [signalSources, setSignals]       = useState<string[]>(['reviews', 'website']);
  const [attachments, setAttachments]     = useState<string[]>([]);

  // Step 3 state
  const [sections, setSections] = useState<FAQSection[]>(DEFAULT_SECTIONS);

  const handleStep2Change = (patch: Partial<Pick<FAQFlowData, 'template' | 'customAgent' | 'sourceUrl' | 'additionalContext' | 'questionCount' | 'signalSources' | 'attachments'>>) => {
    if (patch.template !== undefined) setTemplate(patch.template);
    if (patch.customAgent !== undefined) setCustomAgent(patch.customAgent);
    if (patch.sourceUrl !== undefined) setSourceUrl(patch.sourceUrl);
    if (patch.additionalContext !== undefined) setContext(patch.additionalContext);
    if (patch.questionCount !== undefined) setQuestionCount(patch.questionCount);
    if (patch.signalSources !== undefined) setSignals(patch.signalSources);
    if (patch.attachments !== undefined) setAttachments(patch.attachments);
  };

  const canAdvance = [
    brandKit !== '' && location !== '',
    template !== '',
    sections.length > 0,
  ][step];

  const handleGenerate = () => {
    const distributedSections = distributeQuestionCount(sections, questionCount);
    onComplete({
      brandKit, location, template, customAgent, sourceUrl,
      additionalContext, questionCount, signalSources, attachments, sections: distributedSections,
    });
  };

  // Keep controlRef and parent nav state in sync
  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        advance:  () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)),
        back:     () => { if (step === 0) onCancel(); else setStep(s => s - 1); },
        generate: handleGenerate,
      };
    }
    onNavStateChange?.({ step, totalSteps: TOTAL_STEPS, canAdvance });
  });

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas,#F7F8FA)]">
      {!hideProgress && (
        <div className="flex-none px-8 py-4 border-b border-border bg-background flex justify-center">
          <StepIndicator current={step} />
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[560px] mx-auto px-8 py-8">

          {step === 0 && (
            <Step1BrandKit
              brandKit={brandKit}
              location={location}
              onChange={(bk, loc) => { setBrandKit(bk); setLocation(loc); }}
            />
          )}

          {step === 1 && (
            <Step2Setup
              template={template}
              customAgent={customAgent}
              sourceUrl={sourceUrl}
              additionalContext={additionalContext}
              questionCount={questionCount}
              signalSources={signalSources}
              attachments={attachments}
              onChange={handleStep2Change}
            />
          )}

          {step === 2 && (
            <Step3Sections
              sections={sections}
              onChange={setSections}
            />
          )}
        </div>
      </div>

    </div>
  );
}
