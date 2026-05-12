/**
 * ProjectGenerationProgress
 *
 * Animated 4-step generation loading card shown between the project inline
 * flow and the final canvas. Matches the FAQ/Blog equivalent design.
 *
 * Steps animate: pending -> active (spinner) -> done (green check), 1.4 s apart.
 * After all steps complete + 500 ms grace period, calls onComplete().
 */

import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InlineFlowData } from './inline/InlineCreationFlow';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProjectGenerationProgressProps {
  flowData: InlineFlowData;
  onComplete: () => void;
}

type StepStatus = 'pending' | 'active' | 'done';

interface GenStep {
  id: string;
  label: string;
  sublabel: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEP_DURATION_MS = 1400;
const DONE_GRACE_MS = 500;

const GEN_STEPS: GenStep[] = [
  { id: 'brand',    label: 'Analyzing brand identity',   sublabel: 'Reading tone settings, audience signals, and location data' },
  { id: 'brief',    label: 'Processing project brief',   sublabel: 'Mapping goals, objectives, and content requirements' },
  { id: 'content',  label: 'Generating content pieces',  sublabel: 'Drafting blog posts, social copy, email campaigns, and FAQs' },
  { id: 'finalize', label: 'Applying brand voice',       sublabel: 'Reviewing consistency, scoring each piece, and finalizing output' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StepRow({ step, status }: { step: GenStep; status: StepStatus }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn(
        'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300',
        status === 'pending' && 'border-border bg-background',
        status === 'active'  && 'border-primary bg-background',
        status === 'done'    && 'border-[#1D9E75] bg-[#1D9E75]',
      )}>
        {status === 'active' && (
          <Loader2 size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-primary animate-spin" />
        )}
        {status === 'done' && (
          <Check size={13} strokeWidth={2.4} className="text-white" />
        )}
      </div>

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

      {status === 'done' && (
        <span className="flex-shrink-0 text-[11px] text-[#1D9E75] font-medium mt-0.5">Done</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectGenerationProgress({ flowData, onComplete }: ProjectGenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalItems = flowData.ideas?.length
    ?? flowData.contentMix?.reduce((s, m) => s + m.count, 0)
    ?? 4;
  const brandKitLabel = flowData.brandKit
    ? flowData.brandKit.charAt(0).toUpperCase() + flowData.brandKit.slice(1)
    : 'Brand identity';

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    GEN_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentStep(i + 1), STEP_DURATION_MS * (i + 1)));
    });
    timers.push(setTimeout(onComplete, STEP_DURATION_MS * GEN_STEPS.length + DONE_GRACE_MS));
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
      <div className="w-full max-w-[520px] rounded-2xl border border-border bg-background shadow-[0_4px_24px_rgba(0,0,0,0.07)]">

        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 rounded-full bg-primary/[0.08] border border-primary/20">
                <span className="text-[11px] font-semibold text-primary tracking-wide">PROJECT</span>
              </div>
              <span className="text-[13px] font-medium text-foreground">Generating your project</span>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {totalItems} piece{totalItems !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-muted-foreground">Brand identity: {brandKitLabel}</span>
            <span className="text-[11px] text-primary font-medium">{progressPercent}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="px-6 divide-y divide-border">
          {GEN_STEPS.map((step, idx) => (
            <StepRow key={step.id} step={step} status={getStatus(idx)} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[12px] text-muted-foreground text-center">
            This usually takes 15–20 seconds. Your content will appear automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
