/**
 * InlineCreationFlow
 *
 * Replaces the ContentCreationWizardModal with a seamless, full-canvas
 * guided setup experience. Renders directly inside the ContentEditorShell
 * canvas area — no modal backdrop, no dialog chrome.
 *
 * The left panel is hidden while this component is active; it is restored
 * by the parent once generation completes.
 *
 * Flow by mode:
 *  project  →  project-type → goal → template → fine-tune → summary
 *  faq      →  goal → template → fine-tune → summary
 *  blog     →  goal → template → fine-tune → summary
 *  landing  →  goal → template → fine-tune → summary
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FlowNavControls, FlowNavState } from '../faq/FAQInlineCreationFlow';
import {
  ChevronRight, Check, Sparkles,
  FileText, Share2, Mail, MessageSquare, Monitor,
  MapPin, Package, Star, Layers, Pencil,
  Target, BookOpen, Megaphone, Users, Zap,
  Trash2, Plus,
} from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ContentMode } from '../editor/editorConfig';

// ── Types ──────────────────────────────────────────────────────────────────────

export type InlineFlowMode = 'faq' | 'blog' | 'landing' | 'project';

export interface ContentMixItem {
  type: string;
  label: string;
  count: number;
}

export interface SummaryIdea {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  description: string;
}

export interface InlineFlowData {
  mode: InlineFlowMode;
  projectType?: string;
  agent?: string;
  brandKit?: string;
  location?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  audience?: string;
  duration?: string;
  templateId?: string;
  tone?: string;
  count?: number;
  length?: string;
  contentMix?: ContentMixItem[];
  ideas: SummaryIdea[];
}

type StepId = 'project-type' | 'goal' | 'template' | 'fine-tune' | 'summary';

const STEPS_BY_MODE: Record<InlineFlowMode, StepId[]> = {
  project: ['project-type', 'goal', 'fine-tune', 'summary'],
  faq:     ['goal', 'template', 'fine-tune', 'summary'],
  blog:    ['goal', 'template', 'fine-tune', 'summary'],
  landing: ['goal', 'template', 'fine-tune', 'summary'],
};

const STEP_LABEL: Record<StepId, string> = {
  'project-type': 'Brand kit',
  goal:           'Project setup',
  template:       'Template',
  'fine-tune':    'Content mix',
  summary:        'Review topics',
};

// ── Pill radio ─────────────────────────────────────────────────────────────────

function PillRadio({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 h-8 rounded-full text-[13px] border transition-all',
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border bg-background text-foreground hover:border-primary/40',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Selection card ─────────────────────────────────────────────────────────────

function SelectionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  tags,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  tags?: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-start gap-4 px-4 py-4 rounded-xl border transition-all',
        selected
          ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/20'
          : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30',
      )}
    >
      <div
        className={cn(
          'size-9 rounded-lg flex items-center justify-center flex-none mt-0.5',
          selected ? 'bg-primary/10' : 'bg-muted',
        )}
      >
        <Icon
          size={16}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className={selected ? 'text-primary' : 'text-foreground/60'}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-foreground">{title}</span>
          {tags?.map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <div
        className={cn(
          'size-5 rounded-full border-2 flex items-center justify-center flex-none mt-1 transition-all',
          selected ? 'border-primary bg-primary' : 'border-border',
        )}
      >
        {selected && <Check size={10} strokeWidth={2.5} className="text-primary-foreground" />}
      </div>
    </button>
  );
}

// ── Step 1: Brand kit ──────────────────────────────────────────────────────────

const PROJECT_BRAND_KITS = [
  { value: 'lushgreen', label: 'LushGreen Brand Kit' },
  { value: 'evergreen', label: 'Evergreen Gardens' },
  { value: 'metro',     label: 'Metro Lawn Co.' },
];

const PROJECT_LOCATIONS = [
  { value: 'all',         label: 'All locations (10)' },
  { value: 'austin',      label: 'Austin, TX' },
  { value: 'houston',     label: 'Houston, TX' },
  { value: 'dallas',      label: 'Dallas, TX' },
  { value: 'san-antonio', label: 'San Antonio, TX' },
];

const BRAND_KIT_CHIPS = [
  'Friendly tone',
  'Suburban homeowners',
  '10 locations',
  'Lawn care & landscaping',
];

function StepProjectType({
  data,
  onChange,
}: {
  data: Partial<InlineFlowData>;
  onChange: (d: Partial<InlineFlowData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">Select your brand kit</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Your brand kit sets tone, audience, and guardrails for all generated content.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Brand kit</label>
          <div className="relative">
            <select
              value={data.brandKit ?? 'lushgreen'}
              onChange={e => onChange({ ...data, brandKit: e.target.value })}
              className="w-full h-10 pl-3 pr-9 rounded-xl border border-border bg-background text-[13px] text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            >
              {PROJECT_BRAND_KITS.map(bk => (
                <option key={bk.value} value={bk.value}>{bk.label}</option>
              ))}
            </select>
            <ChevronRight
              size={14}
              strokeWidth={1.6}
              absoluteStrokeWidth
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Location</label>
          <div className="relative">
            <select
              value={data.location ?? 'all'}
              onChange={e => onChange({ ...data, location: e.target.value })}
              className="w-full h-10 pl-3 pr-9 rounded-xl border border-border bg-background text-[13px] text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            >
              {PROJECT_LOCATIONS.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
            <ChevronRight
              size={14}
              strokeWidth={1.6}
              absoluteStrokeWidth
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {BRAND_KIT_CHIPS.map(chip => (
          <span
            key={chip}
            className="px-3 h-7 flex items-center rounded-full bg-muted border border-border text-[12px] text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Goal ───────────────────────────────────────────────────────────────

const PROJECT_GOALS = [
  { value: 'bookings',     label: 'Drive more bookings' },
  { value: 'reviews',      label: 'Generate customer reviews' },
  { value: 'product',      label: 'Promote a new product or offer' },
  { value: 'awareness',    label: 'Grow brand awareness' },
  { value: 're-engage',    label: 'Re-engage past customers' },
];

const FAQ_GOALS = [
  { value: 'seo',      icon: Target,   title: 'AEO / SEO ranking',       description: 'Optimised to appear in AI-generated answers and search results' },
  { value: 'support',  icon: Users,    title: 'Support & helpdesk',       description: 'Reduce inbound support tickets by answering common questions' },
  { value: 'voice',    icon: Zap,      title: 'Voice assistant',          description: 'Short, direct answers structured for voice queries' },
  { value: 'location', icon: MapPin,   title: 'Location-specific',        description: 'FAQs per location — hours, parking, services, local info' },
  { value: 'custom',   icon: Pencil,   title: 'Custom',                   description: 'Define your own goal and content strategy' },
];

const BLOG_GOALS = [
  { value: 'seo',       icon: Target,   title: 'SEO traffic',           description: 'Long-form article targeting search keywords' },
  { value: 'authority', icon: BookOpen, title: 'Thought leadership',     description: 'Position your brand as an industry expert' },
  { value: 'education', icon: Layers,   title: 'Product education',      description: 'Help customers understand your product or service' },
  { value: 'story',     icon: Star,     title: 'Customer story',         description: 'Feature a real customer success or transformation' },
];

const LANDING_GOALS = [
  { value: 'leads',    icon: Target,   title: 'Lead generation',        description: 'Capture contact info with a compelling offer or form' },
  { value: 'showcase', icon: Package,  title: 'Product showcase',       description: 'Highlight a product with features and social proof' },
  { value: 'event',    icon: Megaphone,title: 'Event registration',     description: 'Drive sign-ups for an event, class, or promotion' },
  { value: 'service',  icon: Layers,   title: 'Service promotion',      description: 'Promote a specific service with CTA and benefits' },
];

const OBJECTIVES = [
  { value: 'awareness',   label: 'Brand awareness' },
  { value: 'conversions', label: 'Drive conversions' },
  { value: 'engagement',  label: 'Boost engagement' },
  { value: 'retention',   label: 'Customer retention' },
  { value: 'traffic',     label: 'Increase traffic' },
];

const PROJECT_AUDIENCES = [
  { value: 'homeowners',   label: 'Homeowners' },
  { value: 'businesses',   label: 'Businesses' },
  { value: 'new-visitors', label: 'New visitors' },
  { value: 'returning',    label: 'Returning customers' },
  { value: 'families',     label: 'Families' },
  { value: 'seniors',      label: 'Seniors' },
];

const DURATIONS = [
  { value: '1w',      label: '1 week' },
  { value: '2w',      label: '2 weeks' },
  { value: '1m',      label: '1 month' },
  { value: '3m',      label: '3 months' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'custom',  label: 'Custom' },
];

function StepGoal({
  mode,
  data,
  onChange,
}: {
  mode: InlineFlowMode;
  data: Partial<InlineFlowData>;
  onChange: (d: Partial<InlineFlowData>) => void;
}) {
  if (mode === 'project') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Project setup</h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Set your goal, objective, audience, and campaign duration.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Goal</label>
          <div className="flex flex-col gap-2">
            {PROJECT_GOALS.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => onChange({ ...data, goal: g.value })}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border text-[13px] font-medium transition-all',
                  data.goal === g.value
                    ? 'border-primary bg-primary/[0.04] text-foreground ring-1 ring-primary/20'
                    : 'border-border bg-background text-foreground hover:border-primary/30',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Objective</label>
          <PillRadio
            options={OBJECTIVES}
            value={data.objective ?? ''}
            onChange={v => onChange({ ...data, objective: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Target audience</label>
          <PillRadio
            options={PROJECT_AUDIENCES}
            value={data.audience ?? ''}
            onChange={v => onChange({ ...data, audience: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Campaign duration</label>
          <PillRadio
            options={DURATIONS}
            value={data.duration ?? '1m'}
            onChange={v => onChange({ ...data, duration: v })}
          />
          {data.duration === 'custom' && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[11px] text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={data.startDate ?? ''}
                  onChange={e => onChange({ ...data, startDate: e.target.value })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[11px] text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={data.endDate ?? ''}
                  onChange={e => onChange({ ...data, endDate: e.target.value })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const goalOptions = mode === 'faq' ? FAQ_GOALS : mode === 'blog' ? BLOG_GOALS : LANDING_GOALS;
  const selected = data.goal ?? goalOptions[0].value;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">
          What's the primary goal for this {mode === 'faq' ? 'FAQ page' : mode === 'blog' ? 'blog post' : 'landing page'}?
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          This shapes the tone, structure, and optimisation strategy.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {goalOptions.map(g => (
          <SelectionCard
            key={g.value}
            selected={selected === g.value}
            onClick={() => onChange({ ...data, goal: g.value })}
            icon={g.icon}
            title={g.title}
            description={g.description}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
          Target audience
        </label>
        <input
          type="text"
          value={data.audience ?? ''}
          onChange={e => onChange({ ...data, audience: e.target.value })}
          placeholder={
            mode === 'faq'     ? 'e.g. Homeowners in suburban areas' :
            mode === 'blog'    ? 'e.g. Restaurant managers, SMB owners' :
                                 'e.g. New visitors, local families'
          }
          className="h-10 px-3 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
        />
      </div>
    </div>
  );
}

// ── Step 3: Template ───────────────────────────────────────────────────────────

interface TemplateOption {
  id: string;
  title: string;
  typesLabel: string;
  hue: number;
}

const TEMPLATES_BY_MODE: Record<InlineFlowMode, TemplateOption[]> = {
  project: [
    { id: 'p-new-product',   title: 'New product launch',        typesLabel: 'Social posts & 5 more', hue: 160 },
    { id: 'p-customer',      title: 'Customer stories',          typesLabel: 'Social posts & 5 more', hue: 260 },
    { id: 'p-seasonal',      title: 'Seasonal promotion',        typesLabel: 'Social posts & 5 more', hue: 120 },
    { id: 'p-brand',         title: 'Brand awareness campaign',  typesLabel: 'Social posts & 5 more', hue: 140 },
    { id: 'p-loyalty',       title: 'Loyalty program launch',    typesLabel: 'Email & 4 more',        hue: 30  },
    { id: 'p-grand-opening', title: 'Grand opening',             typesLabel: 'Social posts & 5 more', hue: 340 },
  ],
  faq: [
    { id: 'f-restaurant',   title: 'Restaurant dining FAQ',       typesLabel: 'FAQ page', hue: 160 },
    { id: 'f-reservations', title: 'Reservations & bookings FAQ', typesLabel: 'FAQ page', hue: 210 },
    { id: 'f-menu',         title: 'Menu & dietary options FAQ',  typesLabel: 'FAQ page', hue: 120 },
    { id: 'f-locations',    title: 'Locations & hours FAQ',       typesLabel: 'FAQ page', hue: 30  },
  ],
  blog: [
    { id: 'b-seo-tips',   title: 'Local SEO tips for restaurants',  typesLabel: 'Blog post', hue: 200 },
    { id: 'b-ai-reviews', title: 'AI-powered review responses',      typesLabel: 'Blog post', hue: 250 },
    { id: 'b-guest-exp',  title: 'Improving the guest experience',   typesLabel: 'Blog post', hue: 30  },
    { id: 'b-sustain',    title: 'Our sustainability commitment',    typesLabel: 'Blog post', hue: 130 },
  ],
  landing: [
    { id: 'l-spring',   title: 'Spring dining experience', typesLabel: 'Landing page', hue: 330 },
    { id: 'l-catering', title: 'Catering & events page',   typesLabel: 'Landing page', hue: 280 },
    { id: 'l-promo',    title: 'Limited-time offer page',  typesLabel: 'Landing page', hue: 40  },
    { id: 'l-local',    title: 'Location-specific page',   typesLabel: 'Landing page', hue: 190 },
  ],
};

function InlineTemplateCard({
  template,
  selected,
  onClick,
}: {
  template: TemplateOption;
  selected: boolean;
  onClick: () => void;
}) {
  const headerBg = `hsl(${template.hue},28%,52%)`;
  const accentBg = `hsl(${template.hue},20%,92%)`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col rounded-xl border overflow-hidden text-left transition-all group',
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:shadow-sm',
      )}
    >
      <div className="w-full bg-zinc-100 p-4 relative">
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-black/[0.06]" style={{ height: 96 }}>
          <div className="h-9 w-full flex items-center gap-2 px-2.5" style={{ background: headerBg }}>
            <div className="size-4 rounded-full bg-white/30 flex-none" />
            <div className="flex flex-col gap-[3px] flex-1">
              <div className="h-[2px] w-full bg-white/70 rounded-full" />
              <div className="h-[2px] w-3/4 bg-white/40 rounded-full" />
            </div>
          </div>
          <div className="px-2.5 pt-2 flex flex-col gap-[4px]">
            <div className="h-[3px] w-full bg-zinc-200 rounded-full" />
            <div className="h-[3px] w-4/5 bg-zinc-200 rounded-full" />
            <div className="h-[8px] w-full rounded-[3px] mt-0.5" style={{ background: accentBg }} />
          </div>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
            <Check size={10} strokeWidth={2.5} className="text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className={cn('text-[12px] font-medium truncate', selected ? 'text-primary' : 'text-foreground')}>
          {template.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{template.typesLabel}</p>
      </div>
    </button>
  );
}

function StepTemplate({
  mode,
  data,
  onChange,
}: {
  mode: InlineFlowMode;
  data: Partial<InlineFlowData>;
  onChange: (d: Partial<InlineFlowData>) => void;
}) {
  const templates = TEMPLATES_BY_MODE[mode];
  const selected = data.templateId ?? '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">Choose a template</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Templates give AI a proven structure to start from. You can always edit everything.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {templates.map(t => (
          <InlineTemplateCard
            key={t.id}
            template={t}
            selected={selected === t.id}
            onClick={() => onChange({ ...data, templateId: selected === t.id ? '' : t.id })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...data, templateId: '' })}
        className={cn(
          'w-full h-10 rounded-xl border text-[13px] font-medium transition-all',
          selected === ''
            ? 'border-primary bg-primary/[0.04] text-primary ring-1 ring-primary/20'
            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
        )}
      >
        Start from scratch
      </button>
    </div>
  );
}

// ── Step 4: Fine tuning ────────────────────────────────────────────────────────

const TONES = [
  { value: 'Professional',    label: 'Professional' },
  { value: 'Friendly',        label: 'Friendly' },
  { value: 'Authoritative',   label: 'Authoritative' },
  { value: 'Conversational',  label: 'Conversational' },
  { value: 'Concise',         label: 'Concise' },
];

const BLOG_LENGTHS = [
  { value: 'short',  label: 'Short (300–500w)' },
  { value: 'medium', label: 'Medium (700–1,000w)' },
  { value: 'long',   label: 'Long (1,500+w)' },
];

const FAQ_COUNTS = [
  { value: '5',  label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: '30', label: '30+' },
];

const CONTENT_MIX_TYPES = [
  { type: 'blog',    label: 'Blog post',      icon: FileText    },
  { type: 'social',  label: 'Social post',    icon: Share2      },
  { type: 'email',   label: 'Email campaign', icon: Mail        },
  { type: 'faq',     label: 'FAQ page',       icon: MessageSquare },
  { type: 'landing', label: 'Landing page',   icon: Monitor     },
];

function ContentMixRow({
  item,
  onIncrement,
  onDecrement,
}: {
  item: ContentMixItem;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const TypeDef = CONTENT_MIX_TYPES.find(t => t.type === item.type);
  const Icon = TypeDef?.icon ?? FileText;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-none">
          <Icon size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/60" />
        </div>
        <span className="text-[13px] font-medium text-foreground">{item.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={item.count <= 0}
          className="size-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-[15px] text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="text-[13px] font-medium text-foreground w-4 text-center">{item.count}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={item.count >= 5}
          className="size-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-[15px] text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function getDefaultMix(): ContentMixItem[] {
  return CONTENT_MIX_TYPES.map(t => ({ type: t.type, label: t.label, count: 1 }));
}

function StepFineTune({
  mode,
  data,
  onChange,
}: {
  mode: InlineFlowMode;
  data: Partial<InlineFlowData>;
  onChange: (d: Partial<InlineFlowData>) => void;
}) {
  // Initialise content mix for project mode
  const initMix = useCallback(
    () => data.contentMix ?? getDefaultMix(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [mix, setMix] = useState<ContentMixItem[]>(initMix);

  // Ensure contentMix is always in data even if user never changes counts
  useEffect(() => {
    if (!data.contentMix) {
      onChange({ ...data, contentMix: mix });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMix = (updated: ContentMixItem[]) => {
    setMix(updated);
    onChange({ ...data, contentMix: updated });
  };

  if (mode === 'project') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Content mix</h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Set how many of each content type to generate. Set to 0 to skip.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {mix.map((item, i) => (
            <ContentMixRow
              key={item.type}
              item={item}
              onIncrement={() => {
                const updated = mix.map((m, idx) => idx === i ? { ...m, count: m.count + 1 } : m);
                updateMix(updated);
              }}
              onDecrement={() => {
                const updated = mix.map((m, idx) => idx === i ? { ...m, count: Math.max(0, m.count - 1) } : m);
                updateMix(updated);
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'faq') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Fine-tune the FAQ</h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Set the number of questions and the tone of the answers.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Number of questions</label>
          <PillRadio
            options={FAQ_COUNTS}
            value={String(data.count ?? 12)}
            onChange={v => onChange({ ...data, count: Number(v) })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Tone</label>
          <PillRadio
            options={TONES}
            value={data.tone ?? 'Professional'}
            onChange={v => onChange({ ...data, tone: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Reading level</label>
          <PillRadio
            options={[
              { value: 'general',    label: 'General audience' },
              { value: 'informed',   label: 'Informed readers' },
              { value: 'expert',     label: 'Expert / technical' },
            ]}
            value={(data as Record<string, unknown>).readingLevel as string ?? 'general'}
            onChange={v => onChange({ ...data, readingLevel: v } as Partial<InlineFlowData>)}
          />
        </div>
      </div>
    );
  }

  // blog / landing
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">
          Fine-tune your {mode === 'blog' ? 'blog post' : 'landing page'}
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          These settings shape the content AI produces.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Tone</label>
        <PillRadio
          options={TONES}
          value={data.tone ?? 'Professional'}
          onChange={v => onChange({ ...data, tone: v })}
        />
      </div>

      {mode === 'blog' && (
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Length</label>
          <PillRadio
            options={BLOG_LENGTHS}
            value={data.length ?? 'medium'}
            onChange={v => onChange({ ...data, length: v })}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
          Key focus or keywords
        </label>
        <input
          type="text"
          value={(data as Record<string, unknown>).keywords as string ?? ''}
          onChange={e => onChange({ ...data, keywords: e.target.value } as Partial<InlineFlowData>)}
          placeholder={
            mode === 'blog'
              ? 'e.g. local SEO, review management, customer trust'
              : 'e.g. seasonal menu, outdoor seating, private events'
          }
          className="h-10 px-3 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
        />
      </div>
    </div>
  );
}

// ── Step 5: Summary / Idea review ──────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  blog: 'Blog post', social: 'Social post', email: 'Email',
  faq: 'FAQ page', landing: 'Landing page',
};

function buildIdeas(data: Partial<InlineFlowData>): SummaryIdea[] {
  const { mode, contentMix } = data;

  if (mode === 'project' && contentMix) {
    const ideas: SummaryIdea[] = [];
    contentMix.forEach(({ type, label, count }) => {
      for (let i = 0; i < count; i++) {
        const titles: Record<string, string[]> = {
          blog:    ['How LushGreen became the top-rated landscaping service', 'Spring lawn care tips from our experts', '5 reasons customers choose LushGreen'],
          social:  ['Spring is the perfect time to refresh your lawn', 'Meet our team of certified landscapers', 'Customer spotlight: before & after transformation'],
          email:   ['Your spring lawn care checklist is ready', 'Exclusive offer: spring clean-up package'],
          faq:     ['LushGreen services FAQ'],
          landing: ['Spring lawn care — book now and save 20%'],
        };
        const hintsByType: Record<string, string[]> = {
          blog:    [
            `In-depth guide helping homeowners choose the right ${projectGoalHint === 'bookings' ? 'landscaping service' : 'lawn care approach'} for their property`,
            'Expert seasonal tips and best practices covering maintenance, common problems, and professional solutions',
            '5 key reasons why customers consistently rate LushGreen above competitors in their area',
          ],
          social:  [
            'Before & after transformation post showcasing a recent customer project with local hashtags',
            'Team spotlight introducing the certified landscapers behind every LushGreen service',
            'Customer testimonial carousel highlighting seasonal promotions and 5-star reviews',
          ],
          email:   [
            'Seasonal promotion email with a spring clean-up package offer and limited-time CTA',
            'Loyalty reward email for returning customers with an exclusive discount and referral link',
          ],
          faq:     [
            'SEO-structured FAQ covering pricing, scheduling windows, and service coverage areas',
          ],
          landing: [
            'Conversion-focused page with hero imagery, 3-step booking process, social proof, and seasonal CTA',
          ],
        };
        const hintList = hintsByType[type] ?? ['AI-generated content piece'];
        const hint = hintList[i] ?? hintList[hintList.length - 1];
        ideas.push({
          id:          `${type}-${i}`,
          type,
          typeLabel:   label,
          title:       (titles[type] ?? ['Content piece'])[i] ?? `${label} #${i + 1}`,
          description: hint,
        });
      }
    });
    return ideas;
  }

  if (mode === 'faq') {
    return [
      { id: 'faq-1', type: 'faq', typeLabel: 'FAQ section', title: 'Pricing & packages',        description: '6 questions covering rates, bundled services, and payment options' },
      { id: 'faq-2', type: 'faq', typeLabel: 'FAQ section', title: 'Booking & availability',    description: '5 questions about scheduling, lead times, and service windows' },
      { id: 'faq-3', type: 'faq', typeLabel: 'FAQ section', title: 'Services & coverage areas', description: "4 questions on what's included and which locations we serve" },
    ];
  }

  if (mode === 'blog') {
    return [
      { id: 'blog-1', type: 'blog', typeLabel: 'Blog post', title: 'How LushGreen uses AI to deliver a better lawn care experience', description: 'Covers customer trust signals, AI-powered scheduling, and review management — targeting long-tail SEO' },
    ];
  }

  // landing
  return [
    { id: 'landing-1', type: 'landing', typeLabel: 'Landing page', title: 'Spring lawn care — book now and save', description: 'Hero with before/after imagery, 3-step booking process, social proof section, and seasonal CTA' },
  ];
}

function IdeaCard({
  idea,
  onTitleChange,
}: {
  idea: SummaryIdea;
  onTitleChange: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(idea.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  return (
    <div className="px-4 py-4 rounded-xl border border-border bg-background">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onBlur={() => { setEditing(false); onTitleChange(idea.id, localTitle); }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              setEditing(false);
              onTitleChange(idea.id, localTitle);
            }
          }}
          className="text-[13px] font-medium text-foreground bg-transparent border-b border-primary outline-none w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[13px] font-medium text-foreground text-left hover:text-primary transition-colors group flex items-center gap-1"
        >
          {localTitle}
          <Pencil
            size={11}
            strokeWidth={1.6}
            absoluteStrokeWidth
            className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors ml-1 flex-none"
          />
        </button>
      )}
      <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{idea.description}</p>
    </div>
  );
}

function StepSummary({
  mode,
  data,
  onChange,
}: {
  mode: InlineFlowMode;
  data: Partial<InlineFlowData>;
  onChange: (d: Partial<InlineFlowData>) => void;
}) {
  const [thinking, setThinking] = useState(true);
  const [ideas, setIdeas] = useState<SummaryIdea[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      const generated = buildIdeas(data);
      setIdeas(generated);
      onChange({ ...data, ideas: generated });
      setThinking(false);
    }, 1400);
    return () => clearTimeout(t);
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTitleChange = (id: string, title: string) => {
    const updated = ideas.map(idea => idea.id === id ? { ...idea, title } : idea);
    setIdeas(updated);
    onChange({ ...data, ideas: updated });
  };

  if (thinking) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="size-12 rounded-xl bg-primary/[0.08] flex items-center justify-center">
          <Sparkles size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-foreground">Reviewing your brief…</p>
          <p className="text-[13px] text-muted-foreground mt-1">AI is drafting content ideas based on your settings</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="size-2 rounded-full bg-primary/40 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const updateTitle = (id: string, title: string) => {
    const updated = ideas.map(idea => idea.id === id ? { ...idea, title } : idea);
    setIdeas(updated);
    onChange({ ...data, ideas: updated });
  };

  const updateDesc = (id: string, description: string) => {
    const updated = ideas.map(idea => idea.id === id ? { ...idea, description } : idea);
    setIdeas(updated);
    onChange({ ...data, ideas: updated });
  };

  const removeIdea = (id: string) => {
    const updated = ideas.filter(idea => idea.id !== id);
    setIdeas(updated);
    onChange({ ...data, ideas: updated });
  };

  const addIdea = () => {
    const newIdea: SummaryIdea = {
      id: `custom-${Date.now()}`,
      type: 'blog',
      typeLabel: 'Blog post',
      title: '',
      description: '',
    };
    const updated = [...ideas, newIdea];
    setIdeas(updated);
    onChange({ ...data, ideas: updated });
  };

  if (mode === 'project') {
    const typeGroups = CONTENT_MIX_TYPES.reduce<{ type: string; label: string; items: SummaryIdea[] }[]>((acc, t) => {
      const items = ideas.filter(idea => idea.type === t.type);
      if (items.length > 0) acc.push({ type: t.type, label: t.label + (items.length > 1 ? 's' : ''), items });
      return acc;
    }, []);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Review topics</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Review and edit each piece before generating.
          </p>
        </div>

        <div className="space-y-6">
          {typeGroups.map((group, gi) => (
            <div key={group.type} className="space-y-3">
              {gi > 0 && <div className="border-t border-border" />}
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{group.label}</p>
              {group.items.map(idea => (
                <div key={idea.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Input
                      value={idea.title}
                      onChange={e => updateTitle(idea.id, e.target.value)}
                      className="h-8 text-[13px] font-medium"
                      placeholder="Content title"
                    />
                    <Textarea
                      value={idea.description}
                      onChange={e => updateDesc(idea.id, e.target.value)}
                      className="text-[12px] text-muted-foreground resize-none"
                      placeholder="What should this cover? (optional)"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => removeIdea(idea.id)}
                      className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIdea}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[13px] text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
        >
          <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
          Add topic
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">Review topics</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Click any title to rename it before generating.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onTitleChange={handleTitleChange} />
        ))}
      </div>
    </div>
  );
}

// ── Step progress indicator ────────────────────────────────────────────────────

function StepProgress({
  steps,
  currentIndex,
}: {
  steps: StepId[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((stepId, i) => (
        <React.Fragment key={stepId}>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all flex-shrink-0',
                i <= currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {i < currentIndex ? (
                <Check size={12} strokeWidth={2.2} />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                'text-[13px] transition-colors',
                i === currentIndex ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {STEP_LABEL[stepId]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'w-[75px] h-px shrink-0 transition-colors',
                i < currentIndex ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface InlineCreationFlowProps {
  mode: InlineFlowMode;
  onComplete: (data: InlineFlowData) => void;
  onCancel: () => void;
  controlRef?: React.MutableRefObject<FlowNavControls | null>;
  onNavStateChange?: (state: FlowNavState) => void;
}

export function InlineCreationFlow({ mode, onComplete, onCancel, controlRef, onNavStateChange }: InlineCreationFlowProps) {
  const steps = STEPS_BY_MODE[mode];
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<InlineFlowData>>({ mode, agent: 'balanced', tone: 'Professional' });
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function navigate(dir: 'forward' | 'back') {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      if (dir === 'forward') setStepIndex(i => i + 1);
      else setStepIndex(i => i - 1);
      setAnimating(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  }

  function handleComplete() {
    onComplete({
      mode,
      projectType: data.projectType,
      agent: data.agent ?? 'balanced',
      brandKit: data.brandKit,
      location: data.location,
      objective: data.objective,
      startDate: data.startDate,
      endDate: data.endDate,
      goal: data.goal,
      audience: data.audience,
      duration: data.duration,
      templateId: data.templateId,
      tone: data.tone ?? 'Professional',
      count: data.count,
      length: data.length,
      contentMix: data.contentMix,
      ideas: data.ideas ?? [],
    });
  }

  // Keep controlRef and parent nav state in sync (always re-run so closures stay fresh)
  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        advance:  () => { if (isLast) handleComplete(); else navigate('forward'); },
        back:     () => { if (stepIndex === 0) onCancel(); else navigate('back'); },
        generate: handleComplete,
      };
    }
    onNavStateChange?.({ step: stepIndex, totalSteps: steps.length, canAdvance: true });
  });

  function renderStep() {
    const stepProps = { mode, data, onChange: setData };
    switch (currentStep) {
      case 'project-type': return <StepProjectType {...stepProps} />;
      case 'goal':         return <StepGoal {...stepProps} />;
      case 'template':     return <StepTemplate {...stepProps} />;
      case 'fine-tune':    return <StepFineTune {...stepProps} />;
      case 'summary':      return <StepSummary {...stepProps} />;
      default:             return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas,#F7F8FA)]">

      {/* Progress bar */}
      <div className="flex-none px-8 py-4 border-b border-border bg-background flex justify-center">
        <StepProgress steps={steps} currentIndex={stepIndex} />
      </div>

      {/* Scrollable step content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'transition-all duration-[180ms] ease-out',
            animating && direction === 'forward' && 'opacity-0 translate-x-4',
            animating && direction === 'back'    && 'opacity-0 -translate-x-4',
            !animating && 'opacity-100 translate-x-0',
          )}
        >
          <div className="max-w-[560px] mx-auto px-8 py-8">
            {renderStep()}
          </div>
        </div>
      </div>

    </div>
  );
}
