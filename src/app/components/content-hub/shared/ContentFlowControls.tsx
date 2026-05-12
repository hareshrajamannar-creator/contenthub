import React from 'react';
import { Check, ChevronDown, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Input } from '@/app/components/ui/input';
import { InlineSelectField } from '@/app/components/ui/inline-select-field';
import { Textarea } from '@/app/components/ui/textarea';

export interface ContentFlowStep {
  id: string;
  label: string;
}

export const CONTENT_FLOW_STEP_TITLE_CLASS = 'text-[18px] font-semibold leading-7 text-foreground';
export const CONTENT_FLOW_FIELD_CLASS =
  'h-10 rounded-[8px] border-[#e5e9f0] bg-white px-4 text-[13px] font-normal text-[#212121] placeholder:text-[#a3a3a3] transition-[color,box-shadow,border-color] hover:border-[#c0c6d4] focus-visible:border-[#2552ED] focus-visible:ring-[3px] focus-visible:ring-[#2552ED]/10 dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#4d5568] dark:hover:border-[#4d5568]';
export const CONTENT_FLOW_TEXTAREA_CLASS =
  'min-h-28 rounded-[8px] border-[#e5e9f0] bg-white px-4 py-2 text-[14px] md:text-[14px] font-medium leading-6 text-[#212121] placeholder:text-[#a3a3a3] transition-[color,box-shadow,border-color] hover:border-[#c0c6d4] focus-visible:border-[#2552ED] focus-visible:ring-[3px] focus-visible:ring-[#2552ED]/10 dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#4d5568] dark:hover:border-[#4d5568]';

export function ContentFlowTextInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn(CONTENT_FLOW_FIELD_CLASS, className)} {...props} />;
}

export function ContentFlowTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return <Textarea className={cn(CONTENT_FLOW_TEXTAREA_CLASS, className)} {...props} />;
}

export function ContentFlowStepper({
  steps,
  currentStep,
  onStepChange,
}: {
  steps: ContentFlowStep[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}) {
  return (
    <nav aria-label="Content creation steps" className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        const clickable = Boolean(onStepChange);

        return (
          <div key={step.id} className="relative">
            <button
              type="button"
              onClick={() => onStepChange?.(index)}
              disabled={!clickable}
              className={cn(
                'relative z-10 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] transition-colors',
                clickable && 'hover:bg-muted/70',
                !clickable && 'cursor-default',
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
            </button>
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
        'flex w-full items-start gap-4 rounded-[8px] border bg-background px-4 py-4 text-left transition-colors',
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

export function ContentFlowRadioCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-start gap-2 rounded-[8px] border bg-background px-4 py-4 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/[0.03]'
          : 'border-border hover:border-primary/40 hover:bg-background',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-primary' : 'border-border',
        )}
      >
        {selected && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-snug text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block text-[12px] leading-relaxed text-muted-foreground">{description}</span>
        ) : null}
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
    <div className="inline-flex h-9 items-center rounded-[8px] border border-border bg-background">
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

export function ContentFlowSelect({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label ?? placeholder ?? 'Select';

  const handleChange = (nextLabel: string) => {
    const nextOption = options.find(option => option.label === nextLabel);
    if (!nextOption) return;
    onChange(nextOption.value);
  };

  return (
    <InlineSelectField
      size="md"
      value={displayValue}
      options={options.map(option => option.label)}
      onChange={handleChange}
    />
  );
}

export function ContentFlowMultiSelect({
  values,
  options,
  onChange,
  placeholder = 'Select options',
}: {
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const toggleValue = (value: string) => {
    onChange(values.includes(value)
      ? values.filter(item => item !== value)
      : [...values, value]);
  };

  const removeValue = (value: string) => {
    onChange(values.filter(item => item !== value));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-background px-4 py-2 text-left transition-[color,box-shadow]',
            'focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15',
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-2">
            {values.length > 0 ? (
              values.map(value => {
                const label = options.find(option => option.value === value)?.label ?? value;
                return (
                  <span
                    key={value}
                    className="inline-flex h-8 items-center gap-1 rounded-md bg-muted px-4 text-[13px] font-medium text-foreground"
                  >
                    {label}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${label}`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeValue(value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          removeValue(value);
                        }
                      }}
                      className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <X size={20} strokeWidth={1.6} absoluteStrokeWidth />
                    </span>
                  </span>
                );
              })
            ) : (
              <span className="py-1 text-[13px] text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown size={20} strokeWidth={1.6} absoluteStrokeWidth className="size-5 shrink-0 text-[#888] dark:text-[#6b7280]" />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <div className="flex flex-col gap-1">
          {options.map(option => {
            const selected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleValue(option.value)}
                className={cn(
                  'flex h-9 w-full items-center gap-2 rounded-lg px-4 text-left text-[13px] transition-colors',
                  selected ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded border',
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background',
                  )}
                >
                  {selected && <Check size={11} strokeWidth={1.6} absoluteStrokeWidth />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
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
