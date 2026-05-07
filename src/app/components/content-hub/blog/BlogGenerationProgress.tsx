/**
 * BlogGenerationProgress
 *
 * Animated 4-step generation loading card shown between the inline flow
 * and the final blog canvas. Matches the FAQ equivalent design but uses
 * blue brand colors for the blog content type.
 *
 * Steps animate: pending -> active (spinner) -> done (green check), 1.5 s apart.
 * After all steps complete + 600 ms grace period, calls onComplete().
 */

import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogSection } from './BlogInlineCreationFlow';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlogGenerationProgressProps {
  sections: BlogSection[];
  brandKit?: string;
  topic?: string;
  onComplete: () => void;
}

type StepStatus = 'pending' | 'active' | 'done';

interface GenStep {
  id: string;
  label: string;
  sublabel: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEP_DURATION_MS = 1500;
const DONE_GRACE_MS = 600;

const GEN_STEPS: GenStep[] = [
  { id: 'profile',  label: 'Analyzing business profile',   sublabel: 'Reading brand kit, tone settings, and audience signals' },
  { id: 'outline',  label: 'Building blog outline',         sublabel: 'Structuring headings, sections, and content flow' },
  { id: 'writing',  label: 'Writing content sections',      sublabel: 'Drafting paragraphs, bullets, images, and callouts' },
  { id: 'seo',      label: 'Optimizing for SEO',            sublabel: 'Inserting keywords, meta tags, and internal link suggestions' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StepRow({ step, status }: { step: GenStep; status: StepStatus }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {/* Status icon */}
      <div className={cn(
        'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300',
        status === 'pending' && 'border-border bg-background',
        status === 'active'  && 'border-[#1E5BE5] bg-background',
        status === 'done'    && 'border-[#1D9E75] bg-[#1D9E75]',
      )}>
        {status === 'active' && (
          <Loader2
            size={14}
            strokeWidth={1.6}
            absoluteStrokeWidth
            className="text-[#1E5BE5] animate-spin"
          />
        )}
        {status === 'done' && (
          <Check size={13} strokeWidth={2.4} className="text-white" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-medium transition-colors',
          status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
        )}>
          {step.label}
        </p>
        <p className={cn(
          'text-[12px] mt-0.5 transition-colors',
          status === 'pending' ? 'text-muted-foreground/60' : 'text-muted-foreground',
        )}>
          {step.sublabel}
        </p>
      </div>

      {/* Done badge */}
      {status === 'done' && (
        <span className="flex-shrink-0 text-[11px] text-[#1D9E75] font-medium mt-0.5">Done</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BlogGenerationProgress({
  sections,
  brandKit,
  topic,
  onComplete,
}: BlogGenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);

  useEffect(() => {
    // Advance one step every STEP_DURATION_MS
    const timers: ReturnType<typeof setTimeout>[] = [];

    GEN_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i + 1); // moves step i from 'active' to 'done', i+1 becomes 'active'
        }, STEP_DURATION_MS * (i + 1))
      );
    });

    // After all steps done, call onComplete
    timers.push(
      setTimeout(() => {
        onComplete();
      }, STEP_DURATION_MS * GEN_STEPS.length + DONE_GRACE_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progressPercent = Math.round((currentStep / GEN_STEPS.length) * 100);

  const getStatus = (idx: number): StepStatus => {
    if (idx < currentStep) return 'done';
    if (idx === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col h-full items-center justify-center bg-[var(--color-canvas,#F7F8FA)] px-6 py-12">
      <div className={cn(
        'w-full max-w-[520px] rounded-2xl border-[1.5px] border-[#A0B8F5] bg-background',
        'shadow-[0_4px_32px_rgba(30,91,229,0.10)]',
      )}>
        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 rounded-full bg-[#EDF3FF] border border-[#BFD0FF]">
                <span className="text-[11px] font-semibold text-[#1E5BE5] tracking-wide">BLOG</span>
              </div>
              <span className="text-[13px] font-medium text-foreground">Generating your blog post</span>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {totalWords} words · {sections.length} sections
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1E5BE5] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-muted-foreground">
              {brandKit ? `Brand kit: ${brandKit}` : 'Processing...'}
            </span>
            <span className="text-[11px] text-[#1E5BE5] font-medium">{progressPercent}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="px-6 divide-y divide-border">
          {GEN_STEPS.map((step, idx) => (
            <StepRow key={step.id} step={step} status={getStatus(idx)} />
          ))}
        </div>

        {/* Footer note */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[12px] text-muted-foreground text-center">
            This usually takes 15-20 seconds. Your blog will appear automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
