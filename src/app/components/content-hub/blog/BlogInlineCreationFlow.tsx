/**
 * BlogInlineCreationFlow
 *
 * 3-step inline creation flow for blog post generation inside ContentEditorShell.
 *
 * Steps:
 *  1. brand-kit — Select brand kit + business location
 *  2. setup     — Topic, keywords, tone, audience, blog count
 *  3. topics    — Review / edit one card per blog post
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Minus, Check, Paperclip, X, FileText as FileIcon } from 'lucide-react';
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
  sections: BlogSection[];
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

export interface BlogInlineCreationFlowProps {
  onComplete: (data: BlogFlowData) => void;
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

const TONE_OPTIONS = [
  'Conversational & friendly',
  'Expert & authoritative',
  'Educational & clear',
  'Storytelling-focused',
  'News & informative',
];

const AUDIENCE_OPTIONS = [
  'Local consumers',
  'Business owners',
  'Existing customers',
  'General audience',
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

const STEP_LABELS = ['Brand kit', 'Blog setup', 'Review topics'];

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

// ── Step 2: Blog setup ────────────────────────────────────────────────────────

interface Step2Props {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
  wordTarget: number;
  attachments: string[];
  blogCount: number;
  onChange: (patch: Partial<Pick<BlogFlowData, 'topic' | 'keywords' | 'tone' | 'audience' | 'wordTarget' | 'attachments' | 'blogCount'>>) => void;
}

function Step2Setup({ topic, keywords, tone, audience, wordTarget, attachments, blogCount, onChange }: Step2Props) {
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
        <h2 className="text-base font-semibold text-foreground mb-1">Blog setup</h2>
        <p className="text-[13px] text-muted-foreground">
          Configure the topic, tone, and audience for your blog posts.
        </p>
      </div>

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">What should the blog posts be about?</label>
        <Input
          value={topic}
          onChange={e => onChange({ topic: e.target.value })}
          placeholder="e.g. How to improve customer experience at your restaurant"
          className="h-9 text-[13px]"
        />
      </div>

      {/* Target keywords */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-foreground">
          Target keywords <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          value={keywords}
          onChange={e => onChange({ keywords: e.target.value })}
          placeholder="e.g. customer experience, restaurant reviews, local dining"
          className="h-9 text-[13px]"
        />
        <p className="text-[12px] text-muted-foreground">Separate multiple keywords with commas.</p>
      </div>

      {/* Blog count */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">How many blog posts do you want?</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ blogCount: Math.max(1, blogCount - 1) })}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus size={14} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <span className="text-[15px] font-semibold text-foreground w-6 text-center">{blogCount}</span>
          <button
            type="button"
            onClick={() => onChange({ blogCount: Math.min(10, blogCount + 1) })}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      </div>

      {/* Word count target */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Word count target</label>
        <div className="flex flex-wrap gap-2">
          {WORD_COUNT_CHIPS.map(chip => {
            const selected = wordTarget === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => onChange({ wordTarget: chip.value })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] border transition-colors',
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/60',
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(option => {
            const selected = tone === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ tone: option })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] border transition-colors',
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/60',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audience */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Target audience</label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_OPTIONS.map(option => {
            const selected = audience === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ audience: option })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] border transition-colors',
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/60',
                )}
              >
                {option}
              </button>
            );
          })}
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

// ── Step 3: Topic review ──────────────────────────────────────────────────────

interface Step3Props {
  sections: BlogSection[];
  onChange: (sections: BlogSection[]) => void;
}

function Step3Topics({ sections, onChange }: Step3Props) {
  const updateSection = (id: string, patch: Partial<BlogSection>) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const addSection = () => {
    onChange([...sections, makeSection(sections.length + 1)]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Review topics</h2>
        <p className="text-[13px] text-muted-foreground">
          Review and edit the title and description for each blog post before generating.
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
                value={section.heading}
                onChange={e => updateSection(section.id, { heading: e.target.value })}
                className="h-8 text-[13px] font-medium"
                placeholder="Blog post title"
              />
              <Textarea
                value={section.description}
                onChange={e => updateSection(section.id, { description: e.target.value })}
                className="text-[12px] text-muted-foreground resize-none"
                placeholder="What should this post cover? (optional)"
                rows={2}
              />
            </div>

            <div className="flex justify-end pt-1 border-t border-border">
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

export function BlogInlineCreationFlow({ onComplete, onCancel, controlRef, onNavStateChange }: BlogInlineCreationFlowProps) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);

  // Step 1 state
  const [brandKit, setBrandKit] = useState('olive-garden');
  const [location, setLocation] = useState('all');

  // Step 2 state
  const [topic, setTopic]           = useState('');
  const [keywords, setKeywords]     = useState('');
  const [tone, setTone]             = useState('');
  const [audience, setAudience]     = useState('');
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

  const handleStep2Change = (patch: Partial<Pick<BlogFlowData, 'topic' | 'keywords' | 'tone' | 'audience' | 'wordTarget' | 'attachments' | 'blogCount'>>) => {
    if (patch.topic !== undefined) setTopic(patch.topic);
    if (patch.keywords !== undefined) setKeywords(patch.keywords);
    if (patch.tone !== undefined) setTone(patch.tone);
    if (patch.audience !== undefined) setAudience(patch.audience);
    if (patch.wordTarget !== undefined) setWordTarget(patch.wordTarget);
    if (patch.attachments !== undefined) setAttachments(patch.attachments);
    if (patch.blogCount !== undefined) setBlogCount(patch.blogCount);
  };

  const canAdvance = [
    brandKit !== '' && location !== '',
    topic.trim() !== '' && tone !== '' && audience !== '',
    sections.length > 0,
  ][step];

  const handleGenerate = () => {
    onComplete({
      brandKit, location, topic, keywords,
      tone, audience, wordTarget, publishTo: ['library'],
      attachments, blogCount, sections,
    });
  };

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
              topic={topic}
              keywords={keywords}
              tone={tone}
              audience={audience}
              wordTarget={wordTarget}
              attachments={attachments}
              blogCount={blogCount}
              onChange={handleStep2Change}
            />
          )}

          {step === 2 && (
            <Step3Topics
              sections={sections}
              onChange={setSections}
            />
          )}
        </div>
      </div>
    </div>
  );
}
