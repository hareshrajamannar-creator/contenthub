"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Settings, MessageSquare } from "lucide-react";
import {
  FigmaIconBirdAI, FigmaIconOverview, FigmaIconInbox, FigmaIconListings,
  FigmaIconReviews, FigmaIconReferrals, FigmaIconAppointments,
  FigmaIconSocial, FigmaIconSurveys, FigmaIconTicketing,
  FigmaIconCampaigns, FigmaIconInsights, FigmaIconReports,
} from "./l1Icons";
import svgPaths from "../../imports/svg-y1gexucine";
import { APP_SHELL_RAIL_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "./l1StripIconTokens";
import { useSidebarHoverExpand } from "@/app/hooks/useSidebarHoverExpand";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

/* ─────────────────────────────────────────────────────────────
   Sectioned sidebar — variation of IconStrip with grouped items,
   badges, and chevron affordances. Same rail + hover-panel
   interaction as IconStrip; only the item structure differs.
   ───────────────────────────────────────────────────────────── */

type NavBadge =
  | { kind: "pill"; text: string; tone: "new" }
  | { kind: "dot"; tone: "red" | "blue" };

type NavItem = {
  label: string;
  Icon: React.ElementType;
  /** Optional right-side affordances shown in the expanded panel only. */
  badge?: NavBadge;
};

type NavSection = {
  /** Header label; omit for the top ungrouped block. */
  title?: string;
  items: NavItem[];
};

const DEFAULT_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Overview", Icon: FigmaIconOverview },
      { label: "Agents", Icon: FigmaIconBirdAI, badge: { kind: "pill", text: "New", tone: "new" } },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Reviews", Icon: FigmaIconReviews },
      { label: "Listings", Icon: FigmaIconListings },
      { label: "Social", Icon: FigmaIconSocial },
      { label: "Referrals", Icon: FigmaIconReferrals },
      { label: "Marketing automations", Icon: FigmaIconCampaigns },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inbox", Icon: FigmaIconInbox, badge: { kind: "dot", tone: "blue" } },
      { label: "Appointments", Icon: FigmaIconAppointments },
      { label: "Chatbot", Icon: MessageSquare },
      { label: "Reports", Icon: FigmaIconReports },
      { label: "Insights", Icon: FigmaIconInsights },
    ],
  },
  {
    title: "Customer experience",
    items: [
      { label: "Ticketing", Icon: FigmaIconTicketing },
      { label: "Surveys", Icon: FigmaIconSurveys },
    ],
  },
];

const FOOTER_ITEM: NavItem = { label: "Settings", Icon: Settings };

interface SidebarSectionedProps {
  sections?: NavSection[];
  activeLabel?: string;
  onActiveChange?: (label: string) => void;
  iconSize?: number;
  defaultExpanded?: boolean;
}

export function SidebarSectioned({
  sections = DEFAULT_SECTIONS,
  activeLabel,
  onActiveChange,
  iconSize = L1_STRIP_ICON_SIZE,
  defaultExpanded = false,
}: SidebarSectionedProps) {
  const [internalActive, setInternalActive] = useState<string>(activeLabel ?? "Agents");
  const current = activeLabel ?? internalActive;
  const setCurrent = onActiveChange ?? setInternalActive;

  const [hoverExpandEnabled] = useSidebarHoverExpand();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const onEnter = useCallback(() => {
    if (!hoverExpandEnabled) return;
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = window.setTimeout(() => { setExpanded(true); openTimerRef.current = null; }, 160);
  }, [hoverExpandEnabled]);

  const onLeave = useCallback(() => {
    if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null; }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => { setExpanded(false); closeTimerRef.current = null; }, 200);
  }, []);

  useEffect(() => {
    if (!hoverExpandEnabled && expanded) setExpanded(false);
  }, [hoverExpandEnabled, expanded]);

  useEffect(() => () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const activeBg = "bg-[#e8effe] dark:bg-[#1e2d5e]";
  const hoverBg = "hover:bg-[#f3f4f6] dark:hover:bg-[#262b35]";

  const railButton = (item: NavItem, keyPrefix = "") => {
    const isActive = item.label === current;
    const btn = (
      <button
        key={`${keyPrefix}${item.label}`}
        type="button"
        aria-label={item.label}
        onClick={() => setCurrent(item.label)}
        className={`group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0 transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#2552ED]/40 ${
          isActive ? activeBg : `bg-transparent ${hoverBg} hover:scale-110 active:scale-95`
        }`}
      >
        <item.Icon
          size={iconSize}
          strokeWidth={L1_STRIP_ICON_STROKE_PX}
          className={`transition-colors duration-200 ${
            isActive ? "text-[#2552ED] dark:text-[#6b9bff]" : "text-[#505050] dark:text-[#9ba2b0] group-hover:text-[#2552ED]"
          }`}
        />
        {item.badge?.kind === "dot" && (
          <span
            className={`absolute top-[3px] right-[3px] w-[6px] h-[6px] rounded-full ring-2 ring-app-shell-rail ${
              item.badge.tone === "red" ? "bg-[#e53935]" : "bg-[#2552ED]"
            }`}
          />
        )}
      </button>
    );
    if (hoverExpandEnabled) return btn;
    return (
      <Tooltip key={`${keyPrefix}${item.label}`}>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  const panelButton = (item: NavItem, keyPrefix = "") => {
    const isActive = item.label === current;
    return (
      <button
        key={`${keyPrefix}${item.label}`}
        type="button"
        aria-label={item.label}
        onClick={() => setCurrent(item.label)}
        className={`group w-full h-[32px] flex items-center rounded-[10px] shrink-0 outline-none transition-colors duration-150 ${
          isActive ? activeBg : `bg-transparent ${hoverBg}`
        }`}
      >
        <span className="flex w-[32px] h-[32px] items-center justify-center shrink-0">
          <item.Icon
            size={iconSize}
            strokeWidth={L1_STRIP_ICON_STROKE_PX}
            className={`${
              isActive ? "text-[#2552ED] dark:text-[#6b9bff]" : "text-[#505050] dark:text-[#9ba2b0]"
            }`}
          />
        </span>
        <span className={`ml-3 flex-1 text-left text-[13px] whitespace-nowrap ${
          isActive ? "text-[#2552ED] dark:text-[#6b9bff] font-medium" : "text-[#303030] dark:text-[#c0c6d4]"
        }`}>
          {item.label}
        </span>
        {item.badge?.kind === "dot" && (
          <span className={`mr-2 w-[6px] h-[6px] rounded-full shrink-0 ${
            item.badge.tone === "red" ? "bg-[#e53935]" : "bg-[#2552ED]"
          }`} />
        )}
        {item.badge?.kind === "pill" && (
          <span className="mr-2 inline-flex items-center px-[6px] py-[1px] text-[10px] font-medium rounded-md bg-[#d1f4d9] text-[#1f7a2f] dark:bg-[#1f4a28] dark:text-[#6be78b]">
            {item.badge.text}
          </span>
        )}
      </button>
    );
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="relative w-[66px] shrink-0 h-full text-base" data-no-print>
        {/* ── Rail — static, always visible ── */}
        <div
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          aria-expanded={expanded}
          className={`absolute inset-0 flex flex-col ${APP_SHELL_RAIL_SURFACE_CLASS}`}
        >
          {/* Logo */}
          <div className="h-[48px] w-[55px] flex items-center justify-center shrink-0 self-center">
            <svg width="17.55" height="16.875" viewBox="0 0 19.5 18.75" fill="none">
              <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
            </svg>
          </div>

          {/* Sections as grouped icon list */}
          <div className="flex flex-col items-center pb-2 pt-0 flex-1 overflow-y-auto overflow-x-hidden px-[12px] gap-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((sec, i) => (
              <div key={sec.title ?? `top-${i}`} className="flex flex-col items-center gap-[2px] w-full">
                {sec.items.map((item) => railButton(item, `rail-${i}-`))}
              </div>
            ))}
          </div>

          {/* Footer: Settings only */}
          <div className="flex flex-col items-center pb-3 pt-2 shrink-0">
            {railButton(FOOTER_ITEM, "rail-footer-")}
          </div>
        </div>

        {/* ── Floating panel — sectioned labeled list ── */}
        <div
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          aria-hidden={!expanded}
          className={`absolute top-2 bottom-2 left-2 w-[272px] flex flex-col rounded-xl border border-white/45 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_60px_rgba(17,24,39,0.14)] dark:border-white/10 dark:bg-[#151922]/72 z-30 transition-[opacity,transform] duration-200 ease-out ${
            expanded
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-2 pointer-events-none"
          }`}
        >
          {/* Header — logo + Birdeye + collapse chevron */}
          <div className="h-[48px] pl-[17px] pr-3 flex items-center gap-2 shrink-0">
            <svg width="17.55" height="16.875" viewBox="0 0 19.5 18.75" fill="none" className="shrink-0">
              <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
            </svg>
            <span className="text-[15px] font-medium text-[#212121] dark:text-[#e4e4e4] flex-1">Birdeye</span>
            <button
              type="button"
              aria-label="Collapse sidebar"
              className="flex w-[24px] h-[24px] items-center justify-center rounded-md text-[#8b92a5] dark:text-[#6b7280] hover:bg-white/55 dark:hover:bg-white/10"
              onClick={() => setExpanded(false)}
            >
              <ChevronLeft className="size-[14px]" />
            </button>
          </div>

          {/* Scrollable sections */}
          <div className="flex flex-col flex-1 overflow-y-auto px-[12px] pt-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((sec, i) => (
              <div key={sec.title ?? `top-${i}`} className="flex flex-col">
                {sec.title && (
                  <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-[0.6px] text-[#9298a8] dark:text-[#6b7280]">
                    {sec.title}
                  </div>
                )}
                <div className="flex flex-col gap-[2px]">
                  {sec.items.map((item) => panelButton(item, `panel-${i}-`))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer: Settings */}
          <div className="px-[12px] py-2 shrink-0">
            {panelButton(FOOTER_ITEM, "panel-footer-")}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
