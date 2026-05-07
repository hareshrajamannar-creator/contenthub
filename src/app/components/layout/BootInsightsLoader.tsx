import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/app/components/ui/utils";
import type { BootInsightSlide, BootInsightTag } from "./bootInsightTypes";

function tagLabel(tag: BootInsightTag | undefined): string | null {
  if (!tag) return null;
  if (tag === "shortcut") return "Keyboard shortcut";
  if (tag === "automation") return "Automation";
  if (tag === "product") return "Product";
  return tag;
}

export interface BootInsightsLoaderProps {
  slides: BootInsightSlide[];
  /** Milliseconds between slides when auto-advancing. */
  intervalMs?: number;
  className?: string;
  /** Controlled index (e.g. Storybook). Pair with `onIndexChange` for dot navigation; omit both for auto-advance. */
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}

const MAX_METRICS = 3;

export function BootInsightsLoader({
  slides,
  intervalMs = 3200,
  className,
  activeIndex: activeIndexControlled,
  onIndexChange,
}: BootInsightsLoaderProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = activeIndexControlled !== undefined;
  const activeIndex = isControlled ? (activeIndexControlled ?? 0) : internalIndex;
  const safeIndex = slides.length === 0 ? 0 : ((activeIndex % slides.length) + slides.length) % slides.length;
  const slide = slides[safeIndex];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || isControlled) return;
    const id = window.setInterval(() => {
      setInternalIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, isControlled]);

  const transitionDuration = reduceMotion ? 0 : 0.32;

  const goTo = useCallback(
    (i: number) => {
      if (slides.length === 0) return;
      const next = ((i % slides.length) + slides.length) % slides.length;
      if (isControlled && onIndexChange) onIndexChange(next);
      else if (!isControlled) setInternalIndex(next);
    },
    [isControlled, onIndexChange, slides.length],
  );

  if (!slide) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground", className)}>
        No slides
      </div>
    );
  }

  const tagText = tagLabel(slide.tag);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="mb-4 flex min-h-[20px] items-center justify-between gap-4">
          {tagText ? (
            <span className="inline-flex max-w-full shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {tagText}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {safeIndex + 1} / {slides.length}
          </span>
        </div>

        <div className="relative min-h-[120px] flex-1">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
              className="motion-reduce:transition-none"
            >
              {slide.kind === "metrics" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {slide.columns.slice(0, MAX_METRICS).map((col) => (
                    <div
                      key={`${slide.id}-${col.label}`}
                      className="rounded-lg border border-border bg-background/60 px-4 py-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground">{col.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                        {col.value}
                      </p>
                      {col.hint ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{col.hint}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-xl space-y-2">
                  <p className="text-base font-semibold leading-snug text-foreground">{slide.title}</p>
                  {slide.body ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{slide.body}</p>
                  ) : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {slides.length > 1 ? (
          <div className="mt-6 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Show insight ${i + 1}`}
                aria-current={i === safeIndex ? "step" : undefined}
                className={cn(
                  "size-2 rounded-full transition-colors motion-reduce:transition-none",
                  i === safeIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
