import { useLayoutEffect, useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { BirdeyeLogoMark } from "@/app/components/brand/BirdeyeLogoMark";
import { cn } from "@/app/components/ui/utils";

const CENTER_LOGO_PX = 56;
/** Time the centered (pulsing) logo is shown before the overlay fades. */
const DWELL_MS = 2000;
/** Center overlay opacity → 0; shell stays under (no logo fly to the rail). */
const FADE_OUT_S = 0.32;
/** One calm breathing cycle on the center mark. */
const PULSE_DURATION_S = 1.55;
const PULSE_SCALE = { rest: 1, peak: 1.045 } as const;

export interface AppEntryWithSplashProps {
  children: ReactNode;
  /** Fires when the intro is skipped (reduced motion) or the fade has finished. */
  onEntryComplete?: () => void;
  /** Force skip intro (e.g. Storybook / tests). */
  forceEntryDone?: boolean;
  className?: string;
}

type IntroPhase = "center" | "exiting" | "done";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Post-auth entry: Birdeye mark stays centered, then the overlay eases out. No in-viewport
 * move to the L1 rail. Respects `prefers-reduced-motion: reduce` and `forceEntryDone`.
 */
export function AppEntryWithSplash({
  children,
  onEntryComplete,
  forceEntryDone = false,
  className,
}: AppEntryWithSplashProps) {
  const [phase, setPhase] = useState<IntroPhase>(() => {
    if (forceEntryDone) return "done";
    if (typeof window !== "undefined" && prefersReducedMotion()) return "done";
    return "center";
  });

  const dwellTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  const runComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onEntryComplete?.();
  }, [onEntryComplete]);

  useLayoutEffect(() => {
    if (phase === "done" && !completedRef.current) {
      runComplete();
    }
  }, [phase, runComplete]);

  useLayoutEffect(() => {
    if (forceEntryDone) {
      setPhase("done");
      return;
    }
    if (phase !== "center" || typeof window === "undefined") return;
    if (prefersReducedMotion()) {
      setPhase("done");
      return;
    }
    dwellTimeoutRef.current = setTimeout(() => {
      setPhase("exiting");
      dwellTimeoutRef.current = null;
    }, DWELL_MS);
    return () => {
      if (dwellTimeoutRef.current) {
        clearTimeout(dwellTimeoutRef.current);
        dwellTimeoutRef.current = null;
      }
    };
  }, [phase, forceEntryDone]);

  // After fade, mark done (timer aligned with `FADE_OUT_S` on the overlay).
  useEffect(() => {
    if (phase !== "exiting") return;
    if (prefersReducedMotion()) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setPhase("done"), FADE_OUT_S * 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const showEntry = phase === "center" || phase === "exiting";
  const fadeOut = phase === "exiting" && !prefersReducedMotion();

  return (
    <div className={cn("relative h-screen w-screen min-h-0 min-w-0", className)}>
      <div
        className={cn("flex h-full min-h-0 min-w-0 flex-1", showEntry && "pointer-events-none")}
        aria-busy={showEntry || undefined}
      >
        {children}
      </div>
      {showEntry && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeOut ? 0 : 1 }}
          transition={
            fadeOut
              ? { duration: FADE_OUT_S, ease: [0.4, 0, 0.2, 1] }
              : { duration: 0 }
          }
        >
          <div className="flex flex-1 items-center justify-center" aria-hidden>
            <motion.div
              className="will-change-transform"
              initial={false}
              animate={
                phase === "center"
                  ? { scale: [PULSE_SCALE.rest, PULSE_SCALE.peak, PULSE_SCALE.rest] }
                  : { scale: 1 }
              }
              transition={
                phase === "center"
                  ? {
                      duration: PULSE_DURATION_S,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                    }
                  : { duration: 0.2, ease: "easeOut" as const }
              }
            >
              <BirdeyeLogoMark className="shrink-0" sizePxHeight={CENTER_LOGO_PX} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {showEntry && (
        <div
          className="pointer-events-none fixed bottom-0 left-0 z-[55] w-full p-4"
          aria-live="polite"
          role="status"
        >
          <span className="sr-only">Loading workspace</span>
        </div>
      )}
    </div>
  );
}
