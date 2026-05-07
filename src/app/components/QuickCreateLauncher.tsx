"use client";

import { Fragment, useId, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CircleDollarSign,
  FileBarChart2,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Plus,
  ReceiptText,
  ScanSearch,
  Ticket,
  UserPlus,
  Waypoints,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { cn } from "@/app/components/ui/utils";

/** IA band for Quick Create — four groups (Engage / Programs / Automation / Analytics). */
export type QuickCreateGroupId =
  | "engage"
  | "programs"
  | "automation"
  | "analytics";

export const QUICK_CREATE_GROUP_ORDER: QuickCreateGroupId[] = [
  "engage",
  "programs",
  "automation",
  "analytics",
];

const QUICK_CREATE_GROUP_LABEL: Record<QuickCreateGroupId, string> = {
  engage: "Engage",
  programs: "Programs",
  automation: "Automation",
  analytics: "Analytics",
};

export interface QuickCreateAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  shortcut?: string;
  group: QuickCreateGroupId;
}

/** Default create actions in band order (Engage → Programs → Automation → Analytics). */
export const QUICK_CREATE_ACTIONS: QuickCreateAction[] = [
  {
    id: "review-request",
    title: "Review request",
    description: "Ask customers for fresh feedback after a visit or service.",
    icon: MessageSquareQuote,
    shortcut: "R",
    group: "engage",
  },
  {
    id: "new-message",
    title: "New message",
    description: "Start a direct outreach thread from one global entry point.",
    icon: Mail,
    shortcut: "M",
    group: "engage",
  },
  {
    id: "create-post",
    title: "Create post",
    description: "Draft a social post without switching into the Social module first.",
    icon: ReceiptText,
    shortcut: "P",
    group: "engage",
  },
  {
    id: "add-contact",
    title: "Add a contact",
    description: "Create a CRM record for a new lead, customer, or business contact.",
    icon: UserPlus,
    shortcut: "C",
    group: "engage",
  },
  {
    id: "create-survey",
    title: "Create survey",
    description: "Start a customer survey with templates and distribution options.",
    icon: ScanSearch,
    shortcut: "S",
    group: "programs",
  },
  {
    id: "create-ticket",
    title: "Create ticket",
    description: "Open a support ticket and route it into the service workflow.",
    icon: Ticket,
    shortcut: "T",
    group: "programs",
  },
  {
    id: "request-payment",
    title: "Request payment",
    description: "Send a billing request from the same launcher instead of an L2 tile.",
    icon: CircleDollarSign,
    shortcut: "Y",
    group: "programs",
  },
  {
    id: "custom-agent",
    title: "Create custom agent",
    description: "Spin up a BirdAI worker for repeatable operational tasks.",
    icon: Bot,
    shortcut: "A",
    group: "automation",
  },
  {
    id: "create-workflow",
    title: "Create workflow",
    description: "Compose a multi-step automation that spans modules.",
    icon: Waypoints,
    shortcut: "W",
    group: "automation",
  },
  {
    id: "create-report",
    title: "Create report",
    description: "Generate a report artifact from shared metrics and saved views.",
    icon: FileBarChart2,
    shortcut: "G",
    group: "analytics",
  },
  {
    id: "create-dashboard",
    title: "Create dashboard",
    description: "Create a saved reporting surface with persistent widgets.",
    icon: LayoutDashboard,
    shortcut: "D",
    group: "analytics",
  },
];

export function groupQuickCreateActions(
  actions: QuickCreateAction[],
): { groupId: QuickCreateGroupId; label: string; actions: QuickCreateAction[] }[] {
  return QUICK_CREATE_GROUP_ORDER.map((groupId) => ({
    groupId,
    label: QUICK_CREATE_GROUP_LABEL[groupId],
    actions: actions.filter((a) => a.group === groupId),
  }));
}

/** Color transitions only — no scale on hover (scaling reads as heavier stroke with `absoluteStrokeWidth`). */
const iconGlyphClass = "transition-colors duration-200 ease-out";

function iconWellClass(size: "list" | "card"): string {
  const sizeCls = size === "list" ? "size-8 rounded-lg" : "size-10 rounded-lg";
  return cn(
    "flex shrink-0 items-center justify-center bg-primary/10 text-muted-foreground transition-colors duration-200 ease-out",
    "group-hover:bg-primary/25 dark:group-hover:bg-primary/30 group-hover:text-primary",
    sizeCls,
  );
}

/** Card layout: full title + description, or title only (description still used for `aria-label`). */
export type QuickCreateCardVariant = "withSubtext" | "noSubtext";

/**
 * `cards` — two-column bordered tiles (original).
 * `list` — single column, L2-style rows (no card chrome).
 * `appGrid` — same as **`list`**: grouped bands, each action is one **horizontal row** (icon + title). Kept for TopBar API compatibility.
 */
export type QuickCreateLayout = "cards" | "list" | "appGrid";

interface QuickCreateLauncherProps {
  actions?: QuickCreateAction[];
  /** Default `noSubtext` — icon + title only. Use `withSubtext` for the two-line rows (`list` / `appGrid`) or CTA cards. */
  cardVariant?: QuickCreateCardVariant;
  /** Default `cards`. Use `list` or `appGrid` (both grouped list rows; `appGrid` matches TopBar). */
  layout?: QuickCreateLayout;
  onActionSelect?: (action: QuickCreateAction) => void;
  className?: string;
}

export function QuickCreateLauncher({
  actions = QUICK_CREATE_ACTIONS,
  cardVariant = "noSubtext",
  layout = "cards",
  onActionSelect,
  className,
}: QuickCreateLauncherProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const grouped = useMemo(() => groupQuickCreateActions(actions), [actions]);

  function handleSelect(action: QuickCreateAction) {
    onActionSelect?.(action);
    setOpen(false);
  }

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open create actions"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? panelId : undefined}
          className={cn(
            "flex h-[30px] min-h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border-0 px-0 py-0",
            "bg-app-shell-l2-surface text-[12px] leading-none transition-colors",
            "hover:bg-app-shell-l2-row-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
        >
          <Plus
            className="pointer-events-none h-3.5 w-3.5 shrink-0 text-[#212121] dark:text-[#e4e4e4]"
            strokeWidth={L1_STRIP_ICON_STROKE_PX}
            absoluteStrokeWidth
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        id={panelId}
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        aria-label="Create actions"
        className={cn(
          "flex max-h-[min(90vh,720px)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 text-[13px]",
          layout === "list" || layout === "appGrid"
            ? "!w-[min(22rem,calc(100vw-2rem))]"
            : "!w-[min(56rem,calc(100vw-2rem))]",
        )}
      >
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            layout === "list" || layout === "appGrid"
              ? "pt-4 pb-4 pl-4 pr-6"
              : "px-6 pb-6 pt-2",
          )}
        >
          {layout === "list" || layout === "appGrid" ? (
            <div className="flex flex-col">
              {grouped.map((section) =>
                section.actions.length === 0 ? null : (
                  <Fragment key={section.groupId}>
                    <p className="mt-2 text-xs font-medium leading-none text-muted-foreground first:mt-0">
                      {section.label}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1" role="list">
                      {section.actions.map((action) => {
                        const Icon = action.icon;
                        const showSubtext = cardVariant === "withSubtext";
                        return (
                          <li key={action.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleSelect(action)}
                              aria-label={
                                showSubtext ? undefined : `${action.title}. ${action.description}`
                              }
                              className={cn(
                                "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] leading-normal tracking-[-0.26px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                showSubtext ? "items-start" : "items-center",
                              )}
                            >
                              <span className={cn(iconWellClass("list"))}>
                                <Icon
                                  className={iconGlyphClass}
                                  size={L1_STRIP_ICON_SIZE}
                                  strokeWidth={L1_STRIP_ICON_STROKE_PX}
                                  absoluteStrokeWidth
                                  aria-hidden
                                />
                              </span>
                              <span className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="text-[13px] font-medium leading-snug text-foreground">
                                  {action.title}
                                </span>
                                {showSubtext ? (
                                  <span className="text-[12px] font-normal leading-snug text-muted-foreground">
                                    {action.description}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </Fragment>
                ),
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grouped.map((section) =>
                section.actions.length === 0 ? null : (
                  <Fragment key={section.groupId}>
                    <div className="col-span-full mt-2 text-xs font-medium leading-none text-muted-foreground first:mt-0 sm:col-span-2">
                      {section.label}
                    </div>
                    {section.actions.map((action) => {
                      const Icon = action.icon;
                      const showSubtext = cardVariant === "withSubtext";
                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => handleSelect(action)}
                          aria-label={
                            showSubtext ? undefined : `${action.title}. ${action.description}`
                          }
                          className={cn(
                            "group flex min-h-0 flex-row gap-4 rounded-lg border border-border bg-card p-4 text-left text-[13px] leading-normal tracking-[-0.26px] transition-shadow hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            showSubtext ? "items-start" : "items-center",
                          )}
                        >
                          <span className={cn(iconWellClass("card"))}>
                            <Icon
                              className={iconGlyphClass}
                              size={L1_STRIP_ICON_SIZE}
                              strokeWidth={L1_STRIP_ICON_STROKE_PX}
                              absoluteStrokeWidth
                              aria-hidden
                            />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="text-[13px] font-medium leading-normal text-foreground">
                              {action.title}
                            </span>
                            {showSubtext ? (
                              <span className="text-[13px] font-normal leading-normal text-muted-foreground">
                                {action.description}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </Fragment>
                ),
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
