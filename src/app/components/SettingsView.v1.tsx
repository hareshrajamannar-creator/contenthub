import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Search } from "lucide-react";
import { usePersistedState } from "@/app/hooks/usePersistedState";
import { Input } from "@/app/components/ui/input.v1";
import { SettingsSectionCard } from "./settings/SettingsSectionCard";
import { SETTINGS_SECTIONS } from "./settings/settingsLandingData";

interface SettingsViewProps {
  scrollTarget: string | null;
  onScrollTargetConsumed: () => void;
  activeSection: string;
  onActiveSectionChange: (label: string) => void;
}

export function SettingsView({
  scrollTarget,
  onScrollTargetConsumed,
  onActiveSectionChange,
}: SettingsViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Map<sectionKey, HTMLDivElement>
  const sectionEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingRef = useRef(false);
  const suppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll position persistence ──────────────────────────────────────────
  const [savedScrollY, setSavedScrollY] = usePersistedState<number>("settings:scrollY", 0);
  const [searchQuery, setSearchQuery] = usePersistedState<string>("settings:search", "");

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && savedScrollY > 0) el.scrollTop = savedScrollY;
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setSavedScrollY(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, [setSavedScrollY]);

  // ── Scroll-spy ────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const topVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!topVisible) return;
        const key = (topVisible.target as HTMLElement).dataset.settingsSection ?? "";
        const section = SETTINGS_SECTIONS.find((s) => s.key === key);
        if (section) onActiveSectionChange(section.label);
      },
      { root, rootMargin: "-8px 0px -70% 0px", threshold: 0 },
    );

    sectionEls.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onActiveSectionChange]);

  // ── Scroll to section when L2 is clicked ─────────────────────────────────
  useEffect(() => {
    if (!scrollTarget) return;
    const section = SETTINGS_SECTIONS.find((s) => s.label === scrollTarget);
    if (!section) { onScrollTargetConsumed(); return; }

    const el = sectionEls.current.get(section.key);
    if (!el) { onScrollTargetConsumed(); return; }

    isScrollingRef.current = true;
    if (suppressTimer.current) clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => { isScrollingRef.current = false; }, 600);

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    onScrollTargetConsumed();
  }, [scrollTarget, onScrollTargetConsumed]);

  // ── Callback ref per section ──────────────────────────────────────────────
  const makeSectionRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      if (el) sectionEls.current.set(key, el);
      else sectionEls.current.delete(key);
    },
    [],
  );

  // ── Search filter ─────────────────────────────────────────────────────────
  const q = searchQuery.trim().toLowerCase();
  const visibleSections = q
    ? SETTINGS_SECTIONS
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (it) =>
              it.label.toLowerCase().includes(q) ||
              it.description.toLowerCase().includes(q),
          ),
        }))
        .filter(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.items.length > 0,
        )
    : SETTINGS_SECTIONS;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Pinned search bar — outside the scroll container so it never scrolls away ── */}
      <div className="shrink-0 px-6 pt-5 pb-4 bg-card">
        <div className="relative max-w-2xl">
          <Search
            size={15}
            strokeWidth={1.6}
            absoluteStrokeWidth
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search settings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
            className="pl-9"
            aria-label="Search settings"
          />
        </div>
      </div>

      {/* ── Scrollable section list ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 pt-4">

        {visibleSections.length === 0 && (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            No settings match{" "}
            <span className="font-medium">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        )}

        {visibleSections.map((section) => (
          <SettingsSectionCard
            key={section.key}
            section={section}
            // Only attach scroll-spy refs when not searching (refs point to actual DOM positions)
            sectionRef={q === "" ? makeSectionRef(section.key) : undefined}
            onItemClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
