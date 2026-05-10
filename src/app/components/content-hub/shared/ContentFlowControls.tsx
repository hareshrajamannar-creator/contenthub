import React from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContentFlowStep {
  id: string;
  label: string;
}

export const CONTENT_FLOW_STEP_TITLE_CLASS = 'text-[18px] font-semibold leading-7 text-foreground';
export const CONTENT_FLOW_FIELD_CLASS =
  'h-10 rounded-xl border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/55 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:border-primary/50';
export const CONTENT_FLOW_TEXTAREA_CLASS =
  'min-h-20 rounded-xl border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/55 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:border-primary/50';

export function ContentFlowStepper({
  steps,
  currentStep,
}: {
  steps: ContentFlowStep[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Content creation steps" className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;

        return (
          <div key={step.id} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-7 bottom-[-4px] w-px bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-9 items-center gap-2 rounded-md px-2 text-[13px] transition-colors',
                active && 'bg-muted text-foreground',
                !active && 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && !done && 'border-primary bg-primary text-primary-foreground',
                  !active && !done && 'border-border bg-background text-muted-foreground',
                )}
              >
                {done ? <Check size={12} strokeWidth={1.6} absoluteStrokeWidth /> : index + 1}
              </span>
              <span className={cn(active && 'font-medium')}>{step.label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function ContentFlowChip({
  label,
  selected,
  onClick,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      {selected && <Check size={12} strokeWidth={1.6} absoluteStrokeWidth />}
      {label}
    </button>
  );
}

export function ContentFlowChoiceCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  tags,
  selectionMode = 'single',
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  tags?: string[];
  selectionMode?: 'single' | 'multi';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-start gap-4 rounded-lg border bg-background px-4 py-4 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/20'
          : 'border-border hover:border-primary/30 hover:bg-muted/30',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
          selected ? 'bg-primary/10' : 'bg-muted',
        )}
      >
        <Icon
          size={16}
          strokeWidth={1.6}
          absoluteStrokeWidth
          className={selected ? 'text-primary' : 'text-foreground/60'}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{title}</span>
          {tags?.map(tag => (
            <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          'mt-1 flex size-5 shrink-0 items-center justify-center border transition-colors',
          selectionMode === 'single' ? 'rounded-full' : 'rounded-md',
          selected ? 'border-primary bg-primary' : 'border-border bg-background',
        )}
      >
        {selected && <Check size={10} strokeWidth={1.6} absoluteStrokeWidth className="text-primary-foreground" />}
      </span>
    </button>
  );
}

export function ContentFlowCountStepper({
  value,
  min = 1,
  max = 20,
  onChange,
  ariaLabel,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-xl border border-border bg-background">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex size-9 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus size={14} strokeWidth={1.6} absoluteStrokeWidth />
      </button>
      <span className="min-w-8 px-1 text-center text-[13px] font-medium text-foreground">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex size-9 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus size={14} strokeWidth={1.6} absoluteStrokeWidth />
      </button>
    </div>
  );
}

const DEFAULT_BRAND_KIT_SUMMARY_ITEMS = [
  { label: 'Source material', description: 'Approved docs, locations, services, and business context' },
  { label: 'Brand profile', description: 'Positioning, tone, personality, and core brand facts' },
  { label: 'Target customers', description: 'Audience segments, local context, and customer needs' },
  { label: 'Style and voice', description: 'Writing style, vocabulary, formatting, and answer depth' },
  { label: 'Media', description: 'Approved images, banners, visual direction, and reusable assets' },
  { label: 'Guardrails', description: 'Claims, competitor rules, compliance notes, and topics to avoid' },
];

export function ContentFlowBrandKitSummary({
  contentLabel = 'Generated content',
  items = DEFAULT_BRAND_KIT_SUMMARY_ITEMS,
}: {
  contentLabel?: string;
  items?: { label: string; description: string }[];
}) {
  return (
    <section className="space-y-2">
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{contentLabel}</span> will be generated using the selected
        brand identity.
      </p>

      <ul className="flex flex-wrap gap-2">
        {items.map(item => (
          <li
            key={item.label}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/80 px-2.5 text-[12px] text-muted-foreground"
            title={item.description}
          >
            <Check size={11} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-primary" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
