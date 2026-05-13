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
  ContentFlowCountStepper,
  ContentFlowLocationFlatList,
  ContentFlowMultiSelect,
  ContentFlowRadioCard,
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
  contentName: string;
  brandKit: string;
  locations: string[];
  blogType: string;
  topic: string;
  keywords: string;
  wordTarget: number;
  signalSources: string[];
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

const BLOG_TEMPLATES = [
  { id: 'seo',       label: 'SEO blog post',             description: 'Optimized for search rankings with targeted keywords and structure' },
  { id: 'howto',     label: 'How-to guide',               description: 'Step-by-step instructions that help customers take action' },
  { id: 'listicle',  label: 'Listicle',                   description: 'Scannable numbered or bulleted list of tips, tools, or ideas' },
  { id: 'casestudy', label: 'Case study / success story', description: 'Real-world results and outcomes that build trust and credibility' },
  { id: 'spotlight', label: 'Product / service spotlight', description: 'Deep-dive into a specific offer, feature, or service you provide' },
  { id: 'custom',    label: 'Custom',                     description: 'Configure the blog post type manually with your own parameters' },
];

const WORD_COUNT_OPTIONS: { label: string; value: number }[] = [
  { label: 'Short (~600 words)',      value: 600 },
  { label: 'Medium (~1,200 words)',   value: 1200 },
  { label: 'Long (~2,000 words)',     value: 2000 },
  { label: 'In-depth (~3,500 words)', value: 3500 },
];

const SIGNAL_SOURCES = [
  { id: 'reviews',    label: 'Reviews data' },
  { id: 'website',    label: 'Website content' },
  { id: 'tickets',    label: 'Ticketing data' },
  { id: 'helpcenter', label: 'Help center articles' },
  { id: 'social',     label: 'Social media posts' },
  { id: 'keywords',   label: 'Keyword research' },
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
        <p className="text-[13px] text-muted-foreground">
          Content will be created from the selected brand identity and location context.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Blog name <span className="text-destructive">*</span></label>
          <ContentFlowTextInput
            value={contentName}
            onChange={e => onChange(e.target.value, brandKit, locations)}
            placeholder="e.g. Restaurant dining guide series"
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

// ── Step 2: Blog setup ────────────────────────────────────────────────────────

interface Step2Props {
  blogType: string;
  topic: string;
  keywords: string;
  wordTarget: number;
  signalSources: string[];
  attachments: string[];
  blogCount: number;
  onChange: (patch: Partial<Pick<BlogFlowData, 'blogType' | 'topic' | 'keywords' | 'wordTarget' | 'signalSources' | 'attachments' | 'blogCount'>>) => void;
}

function Step2Setup({ blogType, topic, keywords, wordTarget, signalSources, attachments, blogCount, onChange }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).filter(f => f.type === 'application/pdf').map(f => f.name);
    if (names.length) onChange({ attachments: [...attachments, ...names] });
  };

  const removeAttachment = (name: string) => {
    onChange({ attachments: attachments.filter(a => a !== name) });
  };

  const selectedWordCount = WORD_COUNT_OPTIONS.find(o => o.value === wordTarget);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Blog setup</h2>
        <p className="text-[13px] text-muted-foreground">
          Configure the blog type, topic, length, and supporting signals.
        </p>
      </div>

      {/* Blog type */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">What kind of blog post are you creating?</label>
        <div className="flex flex-col gap-2">
          {BLOG_TEMPLATES.map(t => (
            <ContentFlowRadioCard
              key={t.id}
              selected={blogType === t.id}
              onClick={() => onChange({ blogType: t.id })}
              title={t.label}
              description={t.description}
            />
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">What should the blog posts be about? <span className="text-destructive">*</span></label>
        <ContentFlowTextarea
          value={topic}
          onChange={e => onChange({ topic: e.target.value })}
          placeholder="e.g. How to improve customer experience at your restaurant"
          rows={3}
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
      <div className="flex items-center justify-between gap-4 rounded-[8px] border border-border bg-background px-4 py-3">
        <div>
          <label className="text-[13px] font-medium text-foreground">How many blog posts do you want?</label>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Each post will be generated as a separate piece of content.</p>
        </div>
        <ContentFlowCountStepper
          value={blogCount}
          min={1}
          max={10}
          ariaLabel="blog posts"
          onChange={value => onChange({ blogCount: value })}
        />
      </div>

      {/* Word count target */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">Word count target</label>
        <ContentFlowSelect
          value={selectedWordCount?.value.toString() ?? ''}
          options={WORD_COUNT_OPTIONS.map(o => ({ value: o.value.toString(), label: o.label }))}
          onChange={val => onChange({ wordTarget: Number(val) })}
          placeholder="Select word count"
        />
      </div>

      {/* Pull signals from */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Pull signals from</label>
        <ContentFlowMultiSelect
          values={signalSources}
          onChange={values => onChange({ signalSources: values })}
          options={SIGNAL_SOURCES.map(src => ({ value: src.id, label: src.label }))}
          placeholder="Select signal sources"
        />
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
          className="flex w-full flex-col items-center gap-2 rounded-[8px] border border-dashed border-border bg-background px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/25"
        >
          <Paperclip size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">Attach PDFs for more context</span>
          <span className="text-[11px] text-muted-foreground/70">Drag and drop or click to browse</span>
        </button>
        {attachments.length > 0 && (
          <div className="space-y-1.5">
            {attachments.map(name => (
              <div key={name} className="flex items-center gap-2 rounded-[8px] border border-border bg-background px-3 py-2">
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
  const [contentName, setContentName] = useState('');
  const [brandKit, setBrandKit]       = useState('olive-garden');
  const [locations, setLocations]     = useState<string[]>(LOCATIONS.map(l => l.id));

  // Step 2 state
  const [blogType, setBlogType]       = useState('');
  const [topic, setTopic]             = useState('');
  const [keywords, setKeywords]       = useState('');
  const [wordTarget, setWordTarget]   = useState(1200);
  const [signalSources, setSignalSources] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [blogCount, setBlogCount]     = useState(1);

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

  const handleStep2Change = (patch: Partial<Pick<BlogFlowData, 'blogType' | 'topic' | 'keywords' | 'wordTarget' | 'signalSources' | 'attachments' | 'blogCount'>>) => {
    if (patch.blogType !== undefined) setBlogType(patch.blogType);
    if (patch.topic !== undefined) setTopic(patch.topic);
    if (patch.keywords !== undefined) setKeywords(patch.keywords);
    if (patch.wordTarget !== undefined) setWordTarget(patch.wordTarget);
    if (patch.signalSources !== undefined) setSignalSources(patch.signalSources);
    if (patch.attachments !== undefined) setAttachments(patch.attachments);
    if (patch.blogCount !== undefined) setBlogCount(patch.blogCount);
  };

  const canAdvance = [
    contentName.trim() !== '' && brandKit !== '' && locations.length > 0,
    topic.trim() !== '',
    sections.length > 0 && sections.every(section => section.description.trim() !== ''),
  ][step];

  const handleGenerate = useCallback(() => {
    onComplete({
      contentName, brandKit, locations, blogType, topic, keywords,
      wordTarget, signalSources, publishTo: ['library'],
      attachments, blogCount,
      contentBrief: sections.map(section => `${section.heading}: ${section.description}`).join('\n\n'),
      sections,
    });
  }, [attachments, blogCount, blogType, brandKit, contentName, keywords, locations, onComplete, sections, signalSources, topic, wordTarget]);

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
              contentName={contentName}
              brandKit={brandKit}
              locations={locations}
              onChange={(name, bk, locs) => { setContentName(name); setBrandKit(bk); setLocations(locs); }}
            />
          )}

          {step === 1 && (
            <Step2Setup
              blogType={blogType}
              topic={topic}
              keywords={keywords}
              wordTarget={wordTarget}
              signalSources={signalSources}
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
