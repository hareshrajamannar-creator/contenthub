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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CONTENT_FLOW_STEP_TITLE_CLASS,
  ContentFlowInfoLabel,
  ContentFlowLocationFlatList,
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
  contentName: string;
  brandKit: string;
  locations: string[];
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
  { id: 'loc-1001', label: '1001 - Mountain View, CA' },
  { id: 'loc-1002', label: '1002 - Seattle, WA' },
  { id: 'loc-1003', label: '1003 - Dallas, TX' },
  { id: 'loc-1004', label: '1004 - Chicago, IL' },
  { id: 'loc-1005', label: '1005 - Los Angeles, CA' },
  { id: 'loc-1006', label: '1006 - Las Vegas, NV' },
  { id: 'loc-1007', label: '1007 - Austin, TX' },
  { id: 'loc-1008', label: '1008 - Houston, TX' },
  { id: 'loc-1009', label: '1009 - Phoenix, AZ' },
  { id: 'loc-1010', label: '1010 - Denver, CO' },
  { id: 'loc-1011', label: '1011 - New York, NY' },
  { id: 'loc-1012', label: '1012 - Miami, FL' },
  { id: 'loc-1013', label: '1013 - Atlanta, GA' },
  { id: 'loc-1014', label: '1014 - Boston, MA' },
  { id: 'loc-1015', label: '1015 - Portland, OR' },
  { id: 'loc-1016', label: '1016 - San Diego, CA' },
  { id: 'loc-1017', label: '1017 - Nashville, TN' },
  { id: 'loc-1018', label: '1018 - San Antonio, TX' },
  { id: 'loc-1019', label: '1019 - Minneapolis, MN' },
  { id: 'loc-1020', label: '1020 - Charlotte, NC' },
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
  contentName: string;
  brandKit: string;
  locations: string[];
  onChange: (contentName: string, brandKit: string, locations: string[]) => void;
}

function Step1BrandKit({ contentName, brandKit, locations, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Select brand identity and location</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">FAQ name <span className="text-destructive">*</span></label>
          <ContentFlowTextInput
            value={contentName}
            onChange={e => onChange(e.target.value, brandKit, locations)}
            placeholder="e.g. Customer service FAQ 2025"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Brand identity <span className="text-destructive">*</span></label>
          <ContentFlowSelect
            value={brandKit}
            onChange={value => onChange(contentName, value, locations)}
            options={BRAND_KITS.map(bk => ({ value: bk.id, label: bk.label }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Locations <span className="text-destructive">*</span></label>
          <ContentFlowLocationFlatList
            values={locations}
            options={LOCATIONS.map(loc => ({ value: loc.id, label: loc.label }))}
            onChange={locs => onChange(contentName, brandKit, locs)}
            description="Choose the locations this content will apply to."
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Content setup ─────────────────────────────────────────────────────

interface Step2Props {
  customAgent: string;
  sourceUrl: string;
  additionalContext: string;
  onChange: (patch: Partial<Pick<FAQFlowData, 'customAgent' | 'sourceUrl' | 'additionalContext'>>) => void;
}

function Step2Setup({ customAgent, sourceUrl, additionalContext, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Content setup</h2>
      </div>

      {/* Website URL */}
      <div className="space-y-1.5">
        <ContentFlowInfoLabel
          required
          tooltip="We'll crawl this page to understand your offerings and generate relevant FAQs."
        >
          Website URL
        </ContentFlowInfoLabel>
        <ContentFlowTextInput
          required
          value={sourceUrl}
          onChange={e => onChange({ sourceUrl: e.target.value })}
          placeholder="https://yourwebsite.com"
        />
      </div>

      {/* Agent */}
      <div className="space-y-1.5">
        <ContentFlowInfoLabel tooltip="Each agent is optimized for a different FAQ style and goal.">
          Agent
        </ContentFlowInfoLabel>
        <ContentFlowSelect
          value={customAgent}
          onChange={value => onChange({ customAgent: value })}
          placeholder="Choose an agent..."
          options={CUSTOM_AGENTS.map(a => ({ value: a.id, label: a.label }))}
        />
      </div>

      {/* Additional context */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Anything specific you want covered?</label>
        <ContentFlowTextarea
          value={additionalContext}
          onChange={e => onChange({ additionalContext: e.target.value })}
          placeholder="e.g. Focus on pricing questions, cover our new service offering, avoid mentioning competitors..."
          rows={3}
        />
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
      </div>

      {generating ? (
        <div className="px-4 py-3 rounded-[8px] border border-border bg-background animate-pulse">
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
  const [contentName, setContentName] = useState('');
  const [brandKit, setBrandKit]       = useState('olive-garden');
  const [locations, setLocations]     = useState<string[]>(LOCATIONS.map(l => l.id));

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

  const handleStep2Change = (patch: Partial<Pick<FAQFlowData, 'customAgent' | 'sourceUrl' | 'additionalContext'>>) => {
    if (patch.customAgent !== undefined) setCustomAgent(patch.customAgent);
    if (patch.sourceUrl !== undefined) setSourceUrl(patch.sourceUrl);
    if (patch.additionalContext !== undefined) setContext(patch.additionalContext);
  };

  const canAdvance = [
    contentName.trim() !== '' && brandKit !== '' && locations.length > 0,
    sourceUrl.trim() !== '',
    contentBrief.trim() !== '',
  ][step];

  const handleGenerate = useCallback(() => {
    const briefSections = sections.map((section, index) => index === 0 ? { ...section, description: contentBrief } : section);
    const distributedSections = distributeQuestionCount(briefSections, questionCount);
    onComplete({
      contentName, brandKit, locations, template, customAgent, sourceUrl,
      additionalContext, questionCount, signalSources, attachments, contentBrief, sections: distributedSections,
    });
  }, [
    additionalContext,
    attachments,
    brandKit,
    contentBrief,
    contentName,
    customAgent,
    locations,
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
              contentName={contentName}
              brandKit={brandKit}
              locations={locations}
              onChange={(name, bk, locs) => { setContentName(name); setBrandKit(bk); setLocations(locs); }}
            />
          )}

          {step === 1 && (
            <Step2Setup
              customAgent={customAgent}
              sourceUrl={sourceUrl}
              additionalContext={additionalContext}
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
