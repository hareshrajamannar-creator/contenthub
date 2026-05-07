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
import { Plus, Trash2, Minus, Check, Paperclip, X, FileText, Zap, Wrench, MessageSquare, MapPin, Settings } from 'lucide-react';
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
  sourceUrl: string;
  additionalContext: string;
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

const BRAND_KIT_CHIPS = [
  'Friendly, professional tone',
  'Family dining audience',
  'Core brand images loaded',
  'Guardrails: no competitor mentions',
  'Style: concise answers',
];

const TEMPLATES: { id: string; label: string; description: string; Icon: React.FC<{ size: number; strokeWidth: number; absoluteStrokeWidth?: boolean; className?: string }> }[] = [
  { id: 'aeo',      label: 'AEO optimized',        description: 'Win answer-engine visibility for specific queries',  Icon: Zap },
  { id: 'newpage',  label: 'New page FAQ builder',  description: 'Generate FAQs for a new page or service',           Icon: FileText },
  { id: 'existing', label: 'Optimize existing',     description: 'Improve existing FAQs on a page',                   Icon: Wrench },
  { id: 'support',  label: 'Customer support FAQs', description: 'From tickets, reviews, queries',                    Icon: MessageSquare },
  { id: 'location', label: 'Location-specific',     description: 'FAQs tailored to a specific location',              Icon: MapPin },
  { id: 'custom',   label: 'Custom',                description: 'Configure everything manually',                     Icon: Settings },
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
  { id: 's1', title: 'Emergency basics', description: 'Common urgent questions customers ask when they need help fast', count: 5 },
  { id: 's2', title: 'Appointments and costs', description: 'Pricing, booking, and scheduling questions', count: 5 },
  { id: 's3', title: 'Special cases', description: 'Edge cases, exceptions, and unusual situations', count: 4 },
];

let sectionCounter = 4;
function makeSection(): FAQSection {
  const id = `s${sectionCounter++}`;
  return { id, title: 'New section', description: 'Describe what this section covers', count: 4 };
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
                {done ? <Check size={12} strokeWidth={2.2} /> : i + 1}
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
        <h2 className="text-base font-semibold text-foreground mb-1">Select brand kit and location</h2>
        <p className="text-[13px] text-muted-foreground">
          Your brand kit handles tone, audience, style, and guardrails automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand kit</label>
          <Select value={brandKit} onValueChange={v => onChange(v, location)}>
            <SelectTrigger className="w-full h-9 text-[13px]">
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
            <SelectTrigger className="w-full h-9 text-[13px]">
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

      {brandKit && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Loaded from brand kit
          </p>
          <div className="flex flex-wrap gap-2">
            {BRAND_KIT_CHIPS.map(chip => (
              <div key={chip} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border">
                <Check size={11} strokeWidth={2} className="text-primary flex-shrink-0" />
                <span className="text-[12px] text-foreground">{chip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Content setup ─────────────────────────────────────────────────────

interface Step2Props {
  template: string;
  sourceUrl: string;
  additionalContext: string;
  signalSources: string[];
  attachments: string[];
  onChange: (patch: Partial<Pick<FAQFlowData, 'template' | 'sourceUrl' | 'additionalContext' | 'signalSources' | 'attachments'>>) => void;
}

function Step2Setup({ template, sourceUrl, additionalContext, signalSources, attachments, onChange }: Step2Props) {
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
        <h2 className="text-base font-semibold text-foreground mb-1">Content setup</h2>
        <p className="text-[13px] text-muted-foreground">
          Configure what to generate and how to enrich it.
        </p>
      </div>

      {/* Template */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">What kind of FAQ are you creating?</label>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map(t => {
            const selected = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ template: t.id })}
                className={cn(
                  'text-left rounded-lg border p-3 transition-colors flex flex-col gap-2',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/40',
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', selected ? 'bg-primary/10' : 'bg-muted')}>
                  <t.Icon size={15} strokeWidth={1.6} absoluteStrokeWidth className={selected ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground leading-snug">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Source URL */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Source URL</label>
        <Input
          value={sourceUrl}
          onChange={e => onChange({ sourceUrl: e.target.value })}
          placeholder="https://yourwebsite.com/faq"
          className="h-9 text-[13px]"
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
          className="text-[13px] resize-none"
          rows={2}
        />
      </div>

      {/* Signal sources */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Pull signals from</label>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_SOURCES.map(src => {
            const on = signalSources.includes(src.id);
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => toggleSignal(src.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] border transition-colors',
                  on
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/60',
                )}
              >
                {src.label}
              </button>
            );
          })}
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
          className="w-full flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors"
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

function Step3Sections({ sections, onChange }: Step3Props) {
  const updateSection = (id: string, patch: Partial<FAQSection>) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const addSection = () => {
    onChange([...sections, makeSection()]);
  };

  const totalQuestions = sections.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Review topics</h2>
        <p className="text-[13px] text-muted-foreground">
          Adjust topic titles, descriptions, and question counts before generating.
          <span className="ml-1 font-medium text-foreground">{totalQuestions} questions total.</span>
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-background p-4 space-y-3"
          >
            <div className="space-y-1.5">
              <Input
                value={section.title}
                onChange={e => updateSection(section.id, { title: e.target.value })}
                className="h-8 text-[13px] font-medium"
                placeholder="Topic title"
              />
              <Textarea
                value={section.description}
                onChange={e => updateSection(section.id, { description: e.target.value })}
                className="text-[12px] text-muted-foreground resize-none"
                placeholder="What does this topic cover?"
                rows={2}
              />
            </div>

            {/* Footer row: count stepper + delete */}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">Questions:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { count: Math.max(1, section.count - 1) })}
                    className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <span className="text-[13px] font-semibold text-foreground w-6 text-center">
                    {section.count}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { count: Math.min(20, section.count + 1) })}
                    className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteSection(section.id)}
                disabled={sections.length <= 1}
                className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
              >
                <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
      >
        <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
        Add topic
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FAQInlineCreationFlow({ onComplete, onCancel, controlRef, onNavStateChange }: FAQInlineCreationFlowProps) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);

  // Step 1 state
  const [brandKit, setBrandKit]   = useState('olive-garden');
  const [location, setLocation]   = useState('all');

  // Step 2 state
  const [template, setTemplate]         = useState('aeo');
  const [sourceUrl, setSourceUrl]       = useState('');
  const [additionalContext, setContext] = useState('');
  const [signalSources, setSignals]     = useState<string[]>(['reviews', 'website']);
  const [attachments, setAttachments]   = useState<string[]>([]);

  // Step 3 state
  const [sections, setSections] = useState<FAQSection[]>(DEFAULT_SECTIONS);

  const handleStep2Change = (patch: Partial<Pick<FAQFlowData, 'template' | 'sourceUrl' | 'additionalContext' | 'signalSources' | 'attachments'>>) => {
    if (patch.template !== undefined) setTemplate(patch.template);
    if (patch.sourceUrl !== undefined) setSourceUrl(patch.sourceUrl);
    if (patch.additionalContext !== undefined) setContext(patch.additionalContext);
    if (patch.signalSources !== undefined) setSignals(patch.signalSources);
    if (patch.attachments !== undefined) setAttachments(patch.attachments);
  };

  const canAdvance = [
    brandKit !== '' && location !== '',
    template !== '',
    sections.length > 0,
  ][step];

  const handleGenerate = () => {
    onComplete({
      brandKit, location, template, sourceUrl,
      additionalContext, signalSources, attachments, sections,
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
    <div className="flex flex-col h-full bg-background">
      {/* Step bar */}
      <div className="flex-none px-8 py-4 border-b border-border bg-background flex justify-center">
        <StepIndicator current={step} />
      </div>

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
              sourceUrl={sourceUrl}
              additionalContext={additionalContext}
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
