/**
 * BlogInlineCreationFlow
 *
 * 3-step inline creation flow for blog post generation inside ContentEditorShell.
 *
 * Steps:
 *  1. brand-kit — Select brand identity + business location
 *  2. setup     — Topic, keywords, tone, blog count
 *  3. brief     — Review / edit the content brief
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Paperclip, X, FileText as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CONTENT_FLOW_STEP_TITLE_CLASS,
  ContentFlowBrandKitSummary,
  ContentFlowChip,
  ContentFlowCountStepper,
  ContentFlowSelect,
  ContentFlowTextarea,
  ContentFlowTextInput,
} from '../shared/ContentFlowControls';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlogSection {
  id: string;
  heading: string;
  description: string;
  wordCount: number;
}

export interface BlogFlowData {
  brandKit: string;
  location: string;
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
  wordTarget: number;
  publishTo: string[];
  attachments: string[];
  blogCount: number;
  contentBrief?: string;
  sections: BlogSection[];
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

export interface BlogInlineCreationFlowProps {
  onComplete: (data: BlogFlowData) => void;
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

const TONE_OPTIONS = [
  'Conversational & friendly',
  'Expert & authoritative',
  'Educational & clear',
  'Storytelling-focused',
  'News & informative',
];

const WORD_COUNT_CHIPS: { label: string; value: number }[] = [
  { label: 'Short (~600 words)',    value: 600 },
  { label: 'Medium (~1,200 words)', value: 1200 },
  { label: 'Long (~2,000 words)',   value: 2000 },
  { label: 'In-depth (~3,500 words)', value: 3500 },
];

const PUBLISH_DESTINATIONS = [
  { id: 'library',   label: 'Save to content library', alwaysOn: true },
  { id: 'website',   label: 'Publish to website' },
  { id: 'helpcenter',label: 'Add to help center' },
  { id: 'social',    label: 'Share to social media' },
];

const BLOG_DESCRIPTIONS = [
  'Explore key benefits, expert tips, and industry insights that matter most to your readers',
  'A detailed breakdown of best practices, common mistakes, and actionable recommendations',
  'Real-world examples, customer success stories, and practical advice for your target audience',
  'Step-by-step guidance to help your audience make informed decisions and take action',
  'A data-driven look at trends, opportunities, and strategies relevant to your market',
];

const DEFAULT_SECTIONS: BlogSection[] = [
  { id: 'b1', heading: 'Blog post 1', description: BLOG_DESCRIPTIONS[0], wordCount: 1200 },
  { id: 'b2', heading: 'Blog post 2', description: BLOG_DESCRIPTIONS[1], wordCount: 1200 },
  { id: 'b3', heading: 'Blog post 3', description: BLOG_DESCRIPTIONS[2], wordCount: 1200 },
];

let sectionCounter = 4;
function makeSection(idx: number): BlogSection {
  const id = `b${sectionCounter++}`;
  const desc = BLOG_DESCRIPTIONS[(idx - 1) % BLOG_DESCRIPTIONS.length];
  return { id, heading: `Blog post ${idx}`, description: desc, wordCount: 1200 };
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Brand identity', 'Blog setup', 'Content brief'];

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

      {brandKit && <ContentFlowBrandKitSummary contentLabel="Blog content" />}
    </div>
  );
}

// ── Step 2: Blog setup ────────────────────────────────────────────────────────

interface Step2Props {
  topic: string;
  keywords: string;
  tone: string;
  wordTarget: number;
  attachments: string[];
  blogCount: number;
  onChange: (patch: Partial<Pick<BlogFlowData, 'topic' | 'keywords' | 'tone' | 'wordTarget' | 'attachments' | 'blogCount'>>) => void;
}

function Step2Setup({ topic, keywords, tone, wordTarget, attachments, blogCount, onChange }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).filter(f => f.type === 'application/pdf').map(f => f.name);
    if (names.length) onChange({ attachments: [...attachments, ...names] });
  };

  const removeAttachment = (name: string) => {
    onChange({ attachments: attachments.filter(a => a !== name) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Blog setup</h2>
        <p className="text-[13px] text-muted-foreground">
          Configure the topic, tone, length, and supporting material for your blog posts.
        </p>
      </div>

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">What should the blog posts be about?</label>
        <ContentFlowTextInput
          value={topic}
          onChange={e => onChange({ topic: e.target.value })}
          placeholder="e.g. How to improve customer experience at your restaurant"
        />
      </div>

      {/* Target keywords */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">
          Target keywords <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <ContentFlowTextInput
          value={keywords}
          onChange={e => onChange({ keywords: e.target.value })}
          placeholder="e.g. customer experience, restaurant reviews, local dining"
        />
        <p className="text-[12px] text-muted-foreground">Separate multiple keywords with commas.</p>
      </div>

      {/* Blog count */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">How many blog posts do you want?</label>
        <ContentFlowCountStepper
          value={blogCount}
          min={1}
          max={10}
          ariaLabel="blog posts"
          onChange={value => onChange({ blogCount: value })}
        />
      </div>

      {/* Word count target */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Word count target</label>
        <div className="flex flex-wrap gap-2">
          {WORD_COUNT_CHIPS.map(chip => (
            <ContentFlowChip
              key={chip.value}
              label={chip.label}
              selected={wordTarget === chip.value}
              onClick={() => onChange({ wordTarget: chip.value })}
            />
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(option => (
            <ContentFlowChip
              key={option}
              label={option}
              selected={tone === option}
              onClick={() => onChange({ tone: option })}
            />
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Attachments <span className="text-muted-foreground font-normal">(optional)</span></label>
        <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
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
                <FileIcon size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground shrink-0" />
                <span className="text-[13px] text-foreground flex-1 truncate">{name}</span>
                <button type="button" onClick={() => removeAttachment(name)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
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
  sections: BlogSection[];
  onChange: (sections: BlogSection[]) => void;
}

function BlogSummaryCard({
  section,
  onDescriptionChange,
}: {
  section: BlogSection;
  onDescriptionChange: (id: string, description: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-muted-foreground">{section.heading}</p>
      <ContentFlowTextarea
        value={section.description}
        onChange={event => onDescriptionChange(section.id, event.target.value)}
        rows={3}
        className="text-[14px] leading-6"
      />
    </div>
  );
}

function BlogSummarySkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="px-4 py-3 rounded-xl border border-border bg-background animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-2">
        <div className="h-2.5 rounded-full bg-muted w-[90%]" />
        <div className="h-2.5 rounded-full bg-muted w-full" />
        <div className="h-2.5 rounded-full bg-muted w-[65%]" />
      </div>
    </div>
  );
}

function Step3ContentBrief({ sections, onChange }: Step3Props) {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const updateDescription = (id: string, description: string) => {
    onChange(sections.map(section => section.id === id ? { ...section, description } : section));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Content brief</h2>
        <p className="text-[13px] text-muted-foreground">
          Review the detailed brief for what these blog posts will generate.
        </p>
      </div>

      {generating ? (
        <div className="space-y-4">
          {sections.map((_, index) => <BlogSummarySkeleton key={index} index={index} />)}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          {sections.map(section => (
            <BlogSummaryCard
              key={section.id}
              section={section}
              onDescriptionChange={updateDescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BlogInlineCreationFlow({ onComplete, onCancel, controlRef, onNavStateChange, hideProgress = false }: BlogInlineCreationFlowProps) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);

  // Step 1 state
  const [brandKit, setBrandKit] = useState('olive-garden');
  const [location, setLocation] = useState('all');

  // Step 2 state
  const [topic, setTopic]           = useState('');
  const [keywords, setKeywords]     = useState('');
  const [tone, setTone]             = useState('');
  const [wordTarget, setWordTarget]   = useState(1200);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [blogCount, setBlogCount]   = useState(3);

  // Step 3 state — synced to blogCount
  const [sections, setSections] = useState<BlogSection[]>(DEFAULT_SECTIONS);

  // Sync section cards to blogCount whenever it changes
  useEffect(() => {
    setSections(prev => {
      if (prev.length === blogCount) return prev;
      if (prev.length > blogCount) return prev.slice(0, blogCount);
      const added = Array.from({ length: blogCount - prev.length }, (_, i) =>
        makeSection(prev.length + i + 1)
      );
      return [...prev, ...added];
    });
  }, [blogCount]);

  const handleStep2Change = (patch: Partial<Pick<BlogFlowData, 'topic' | 'keywords' | 'tone' | 'wordTarget' | 'attachments' | 'blogCount'>>) => {
    if (patch.topic !== undefined) setTopic(patch.topic);
    if (patch.keywords !== undefined) setKeywords(patch.keywords);
    if (patch.tone !== undefined) setTone(patch.tone);
    if (patch.wordTarget !== undefined) setWordTarget(patch.wordTarget);
    if (patch.attachments !== undefined) setAttachments(patch.attachments);
    if (patch.blogCount !== undefined) setBlogCount(patch.blogCount);
  };

  const canAdvance = [
    brandKit !== '' && location !== '',
    topic.trim() !== '' && tone !== '',
    sections.length > 0 && sections.every(section => section.description.trim() !== ''),
  ][step];

  const handleGenerate = useCallback(() => {
    onComplete({
      brandKit, location, topic, keywords,
      tone, audience: 'Target customers', wordTarget, publishTo: ['library'],
      attachments,
      blogCount,
      contentBrief: sections.map(section => `${section.heading}: ${section.description}`).join('\n\n'),
      sections,
    });
  }, [attachments, blogCount, brandKit, keywords, location, onComplete, sections, tone, topic, wordTarget]);

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
              topic={topic}
              keywords={keywords}
              tone={tone}
              wordTarget={wordTarget}
              attachments={attachments}
              blogCount={blogCount}
              onChange={handleStep2Change}
            />
          )}

          {step === 2 && (
            <Step3ContentBrief
              sections={sections}
              onChange={setSections}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
