/**
 * FAQInlineCreationFlow
 *
 * 3-step inline creation flow for FAQ generation inside ContentEditorShell.
 * Replaces InlineCreationFlow for mode === 'faq'.
 *
 * Steps:
 *  1. brand-kit — Select brand identity + business location
 *  2. setup     — Template, source URL, signal sources, objective, publish destinations
 *  3. brief     — Review / edit the content brief
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Paperclip, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CONTENT_FLOW_STEP_TITLE_CLASS,
  ContentFlowBrandKitSummary,
  ContentFlowCountStepper,
  ContentFlowMultiSelect,
  ContentFlowRadioCard,
  ContentFlowSelect,
  ContentFlowTextarea,
  ContentFlowTextInput,
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
  contentBrief?: string;
  sections: FAQSection[];
}

export interface FlowNavControls {
  advance: () => void;
  back: () => void;
  generate: () => void;
  goTo?: (step: number) => void;
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
  { id: 'local-seo', label: 'Local SEO identity' },
];

const LOCATIONS = [
  { id: 'all', label: 'All locations (10)' },
  { id: 'dallas', label: 'Dallas, TX' },
  { id: 'austin', label: 'Austin, TX' },
  { id: 'houston', label: 'Houston, TX' },
  { id: 'chicago', label: 'Chicago, IL' },
];

const TEMPLATES = [
  { id: 'aeo',      label: 'AEO optimized',        description: 'Win answer-engine visibility for specific queries' },
  { id: 'newpage',  label: 'New page FAQ builder',  description: 'Generate FAQs for a new page or service' },
  { id: 'existing', label: 'Optimize existing',     description: 'Improve existing FAQs on a page' },
  { id: 'support',  label: 'Customer support FAQs', description: 'From tickets, reviews, queries' },
  { id: 'location', label: 'Location-specific',     description: 'FAQs tailored to a specific location' },
  { id: 'custom',   label: 'Custom',                description: 'Configure everything manually' },
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

const STEP_LABELS = ['Brand identity', 'Content setup', 'Content brief'];

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

// ── Step 1: Brand identity + location ──────────────────────────────────────────────

interface Step1Props {
  brandKit: string;
  location: string;
  onChange: (brandKit: string, location: string) => void;
}

function Step1BrandKit({ brandKit, location, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Select brand identity and location</h2>
        <p className="text-[13px] text-muted-foreground">
          Content will be created from the selected brand identity and location context.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand identity</label>
          <ContentFlowSelect
            value={brandKit}
            onChange={value => onChange(value, location)}
            options={BRAND_KITS.map(bk => ({ value: bk.id, label: bk.label }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Location</label>
          <ContentFlowSelect
            value={location}
            onChange={value => onChange(brandKit, value)}
            options={LOCATIONS.map(loc => ({ value: loc.id, label: loc.label }))}
          />
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
            <ContentFlowRadioCard
              key={t.id}
              selected={template === t.id}
              onClick={() => onChange({ template: t.id })}
              title={t.label}
              description={t.description}
            />
          ))}
        </div>

        {template === 'custom' && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-medium text-foreground">Select agent</label>
            <ContentFlowSelect
              value={customAgent}
              onChange={value => onChange({ customAgent: value })}
              placeholder="Choose a custom agent..."
              options={CUSTOM_AGENTS.map(a => ({ value: a.id, label: a.label }))}
            />
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
        <ContentFlowTextInput
          value={sourceUrl}
          onChange={e => onChange({ sourceUrl: e.target.value })}
          placeholder="https://yourwebsite.com/faq"
        />
        <p className="text-[12px] text-muted-foreground">
          We will crawl this page to extract existing Q&amp;A content.
        </p>
      </div>

      {/* Signal sources */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Pull signals from</label>
        <ContentFlowMultiSelect
          values={signalSources}
          onChange={values => onChange({ signalSources: values })}
          options={SIGNAL_SOURCES.map(src => ({ value: src.id, label: src.label }))}
          placeholder="Select signal sources"
        />
      </div>

      {/* Additional context */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Additional context <span className="text-muted-foreground font-normal">(optional)</span></label>
        <ContentFlowTextarea
          value={additionalContext}
          onChange={e => onChange({ additionalContext: e.target.value })}
          placeholder="Anything specific you want covered or avoided..."
          rows={2}
        />
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
              <div key={name} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
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

// ── Step 3: Content brief ─────────────────────────────────────────────────────

interface Step3Props {
  value: string;
  onChange: (value: string) => void;
}

function Step3ContentBrief({ value, onChange }: Step3Props) {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Content brief</h2>
        <p className="text-[13px] text-muted-foreground">
          Review the detailed brief for what this FAQ set will generate.
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
      ) : (
        <div className="animate-in fade-in duration-500">
          <ContentFlowTextarea
            value={value}
            onChange={event => onChange(event.target.value)}
            rows={5}
            className="text-[14px] md:text-[14px] font-medium leading-6"
          />
        </div>
      )}
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
  const [contentBrief, setContentBrief] = useState('Create an AEO-ready FAQ set that answers the most common customer questions about pricing, bookings, services, locations, response times, and edge cases. Use the selected brand identity and location context, pull supporting signals from reviews and website content, and keep answers clear, direct, and useful for search and AI-generated responses.');
  const [sections] = useState<FAQSection[]>(DEFAULT_SECTIONS);

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
    contentBrief.trim() !== '',
  ][step];

  const handleGenerate = useCallback(() => {
    const briefSections = sections.map((section, index) => index === 0 ? { ...section, description: contentBrief } : section);
    const distributedSections = distributeQuestionCount(briefSections, questionCount);
    onComplete({
      brandKit, location, template, customAgent, sourceUrl,
      additionalContext, questionCount, signalSources, attachments, contentBrief, sections: distributedSections,
    });
  }, [
    additionalContext,
    attachments,
    brandKit,
    contentBrief,
    customAgent,
    location,
    onComplete,
    questionCount,
    sections,
    signalSources,
    sourceUrl,
    template,
  ]);

  // Keep external navigation controls fresh without notifying parent state.
  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        advance:  () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)),
        back:     () => { if (step === 0) onCancel(); else setStep(s => s - 1); },
        generate: handleGenerate,
        goTo:     (nextStep: number) => setStep(Math.max(0, Math.min(nextStep, TOTAL_STEPS - 1))),
      };
    }
  });

  // Notify parent navigation state only when the visible step state changes.
  useEffect(() => {
    onNavStateChange?.({ step, totalSteps: TOTAL_STEPS, canAdvance });
  }, [canAdvance, onNavStateChange, step]);

  return (
    <div className="flex flex-col h-full bg-background">
      {!hideProgress && (
        <div className="flex-none px-8 py-4 border-b border-border bg-background flex justify-center">
          <StepIndicator current={step} />
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-hidden py-4 pl-4 pr-6">
        <div className="h-full overflow-y-auto rounded-lg border border-border bg-background px-[30px] pb-[30px] pt-[30px]">
          <div className="w-1/2 min-w-[520px] max-w-[720px]">

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
            <Step3ContentBrief
              value={contentBrief}
              onChange={setContentBrief}
            />
          )}
          </div>
        </div>
      </div>

    </div>
  );
}
