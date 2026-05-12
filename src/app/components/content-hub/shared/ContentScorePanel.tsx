/**
 * ContentScorePanel — canonical AEO / content score right panel.
 *
 * ONE version, used everywhere: FAQ canvas, Blog editor, Landing page editor.
 *
 * Score is owned by the parent — this component reports bumps up via onItemFixed
 * so the parent can update the score displayed in both the card's ScoreBar and
 * this panel consistently.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scoreColor, scoreStrokeColor } from './scoreColors';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ScoreDim {
  label: string;
  score: number;
  weight?: number;
}

// Kept for backward compatibility
export interface QuickWin {
  label: string;
  description: string;
  action: string;
}

export interface ContentScorePanelProps {
  title?: string;
  /** Final display score (0–100), owned and computed by the parent */
  score: number;
  scoreLabel?: string;
  dimensions: ScoreDim[];
  quickWins?: QuickWin[];
  isRecalculating?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  /** Called when an item fix resolves — parent adds bump to its score state */
  onItemFixed?: (bump: number) => void;
  /** Called immediately when "Fix all" is clicked — triggers canvas shimmer */
  onFixAll?: () => void;
  className?: string;
}

// ── Improvement items ─────────────────────────────────────────────────────────

interface ImprovementItem {
  id: string;
  label: string;
  description: string;
  action: string;
  scoreBump: number;
}

const ALL_IMPROVEMENTS: ImprovementItem[] = [
  {
    id: 'location',
    label: 'Add location keywords',
    description: 'Mention 2–3 city names in your answers to lift local citation probability.',
    action: 'Make it local',
    scoreBump: 5,
  },
  {
    id: 'schema',
    label: 'Add FAQ schema markup',
    description: 'Structured data lets search engines display your answers directly in results, boosting click-through rate by up to 20%.',
    action: 'Add schema',
    scoreBump: 5,
  },
  {
    id: 'links',
    label: 'Link to service pages',
    description: 'Anchor 2–3 answers to relevant service pages. Internal links strengthen page authority and lower bounce rate.',
    action: 'Add links',
    scoreBump: 4,
  },
  {
    id: 'expand',
    label: 'Expand short answers',
    description: 'Answers under 40 words rank lower in AI-generated summaries.',
    action: 'Expand answers',
    scoreBump: 3,
  },
  {
    id: 'variants',
    label: 'Add conversational variants',
    description: 'Rewrite 3–4 questions in the phrasing users actually type ("how do I…", "what is the best…") to capture voice search.',
    action: 'Rewrite questions',
    scoreBump: 3,
  },
  {
    id: 'bullets',
    label: 'Format long answers as bullets',
    description: 'Answers with 4+ sentences are 30% more likely to be featured in AI summaries when restructured as bullet points.',
    action: 'Reformat',
    scoreBump: 2,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function ContentScorePanel({
  title = 'Content score',
  score,
  scoreLabel = 'AEO Content score',
  dimensions,
  isRecalculating = false,
  showClose = false,
  onClose,
  onItemFixed,
  onFixAll,
  className,
}: ContentScorePanelProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [fixingIds, setFixingIds] = useState<Set<string>>(new Set());
  const [fixingAll, setFixingAll] = useState(false);

  const pendingItems = ALL_IMPROVEMENTS.filter(item => !doneIds.has(item.id));

  const pct = Math.max(0, Math.min(score, 100));
  const color = scoreColor(score).text;
  const barColor = scoreStrokeColor(score);

  function handleFixItem(id: string) {
    if (fixingIds.has(id) || doneIds.has(id)) return;
    const item = ALL_IMPROVEMENTS.find(i => i.id === id)!;
    setFixingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setFixingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setDoneIds(prev => new Set([...prev, id]));
      onItemFixed?.(item.scoreBump);
    }, 1200);
  }

  function handleFixAll() {
    if (fixingAll || pendingItems.length === 0) return;
    const pendingIds = pendingItems.map(i => i.id);
    const totalBump = pendingItems.reduce((sum, i) => sum + i.scoreBump, 0);
    setFixingAll(true);
    setFixingIds(new Set(pendingIds));
    onFixAll?.();
    setTimeout(() => {
      setFixingIds(new Set());
      setDoneIds(prev => new Set([...prev, ...pendingIds]));
      setFixingAll(false);
      onItemFixed?.(totalBump);
    }, 1800);
  }

  return (
    <div className={cn('flex flex-col h-full min-h-0 bg-background', className)}>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-[#e5e9f0]">
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div
        className={cn(
          'flex-grow overflow-y-auto flex flex-col gap-4 px-5 py-5',
          isRecalculating && 'opacity-60 transition-opacity',
        )}
      >
        {/* Large score number — color matches progress bar */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[52px] font-semibold leading-none transition-all duration-700"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-[20px] text-muted-foreground font-normal leading-none">/ 100</span>
        </div>

        {/* Label + info icon */}
        <div className="flex items-center gap-1.5 -mt-2">
          <span className="text-[14px] text-muted-foreground font-normal leading-[20px]">{scoreLabel}</span>
          <div className="w-4 h-4 rounded-full border border-muted-foreground/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-muted-foreground leading-none">?</span>
          </div>
          {isRecalculating && (
            <span className="text-[11px] animate-pulse ml-1" style={{ color }}>Recalculating…</span>
          )}
        </div>

        {/* Progress bar — same color as the score number, no "You" pill */}
        <div
          className="overflow-hidden"
          aria-label={`${scoreLabel} progress: ${pct} percent`}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          style={{
            width: '100%',
            height: 10,
            minHeight: 10,
            borderRadius: 999,
            backgroundColor: '#E5E7EB',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              minWidth: pct > 0 ? 8 : 0,
              height: '100%',
              borderRadius: 999,
              backgroundColor: barColor,
              transition: 'width 700ms ease, background-color 700ms ease',
            }}
          />
        </div>

        {/* Dimension rows */}
        <div className="flex flex-col">
          {dimensions.map((dim, i) => (
            <div key={dim.label}>
              <div className="flex items-start justify-between gap-2 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-foreground font-medium leading-[18px]">{dim.label}</span>
                  {dim.weight !== undefined && (
                    <span className="text-[12px] text-muted-foreground leading-[16px]">Weights: {dim.weight}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                  <span className="text-[14px] text-foreground font-semibold leading-none">{dim.score}</span>
                  <span className="text-[12px] text-muted-foreground leading-none">/100</span>
                </div>
              </div>
              {i < dimensions.length - 1 && <div className="border-t border-border" />}
            </div>
          ))}
        </div>

        {/* Ways to improve — single unified section, hidden when all done */}
        {pendingItems.length > 0 && (
          <>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-foreground">Ways to improve</span>
                <button
                  type="button"
                  onClick={handleFixAll}
                  disabled={fixingAll}
                  className="text-[12px] font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Fix all
                </button>
              </div>

              {pendingItems.map(item => {
                const isFixing = fixingIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-background p-3 flex flex-col gap-1.5"
                  >
                    {isFixing ? (
                      <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-2.5 w-1/3 rounded-full bg-muted" />
                        <div className="h-3 w-3/4 rounded-full bg-muted" />
                        <div className="h-2.5 w-full rounded-full bg-muted" />
                        <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                        <div className="h-2.5 w-1/4 rounded-full bg-primary/20" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium text-foreground">{item.label}</span>
                          <span className="text-[11px] font-medium text-[#1D9E75] flex-none">+{item.scoreBump} pts</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                        <button
                          type="button"
                          onClick={() => handleFixItem(item.id)}
                          className="self-start text-[11px] font-medium text-primary hover:underline mt-0.5"
                        >
                          {item.action}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_AEO_DIMS: ScoreDim[] = [
  { label: 'Brand voice',         score: 96, weight: 30 },
  { label: 'Factual accuracy',    score: 95, weight: 30 },
  { label: 'Content readability', score: 94, weight: 25 },
  { label: 'Originality',         score: 93, weight: 15 },
];

export const DEFAULT_OVERALL_SCORE: number = Math.round(
  DEFAULT_AEO_DIMS.reduce((s, d) => s + d.score * (d.weight ?? 25), 0) /
  DEFAULT_AEO_DIMS.reduce((s, d) => s + (d.weight ?? 25), 0),
);

export const DEFAULT_QUICK_WINS: QuickWin[] = [
  {
    label: 'Add location keywords',
    description: 'Mention 2–3 city names in your answers to lift local citation probability.',
    action: 'Make it local',
  },
  {
    label: 'Expand short answers',
    description: 'Answers under 40 words rank lower in AI-generated summaries.',
    action: 'Expand answers',
  },
];
