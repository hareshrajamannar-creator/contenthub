import { useId } from "react";
import { cn } from "@/app/components/ui/utils";
import {
  STATUS_DOT_CLASS,
  STATUS_LABEL_CLASS,
} from "./settingsStatusConfig";
import type { SettingsItem } from "./settingsLandingData";

interface SettingsItemRowProps extends Pick<SettingsItem, "label" | "description" | "icon" | "status" | "badge" | "agentStatus"> {
  onClick?: () => void;
}

export function SettingsItemRow({ label, description, icon, status, badge, agentStatus, onClick }: SettingsItemRowProps) {
  const descId = useId();

  return (
    <button
      type="button"
      aria-describedby={descId}
      onClick={onClick}
      className={cn(
        "group w-full flex items-start gap-2 p-2 rounded-md text-left",
        "transition-colors duration-150",
        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "cursor-pointer",
      )}
    >
      {/* icon — top-aligned with mt-0.5 for optical alignment to cap-height */}
      <span className="mt-0.5 shrink-0">{icon()}</span>

      <span className="min-w-0 flex-1">
        {/* title row */}
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium text-foreground leading-snug">{label}</span>

          {/* agent live indicator */}
          {agentStatus === "live" && (
            <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" aria-label="Live" />
          )}
          {agentStatus === "inactive" && (
            <span className="size-1.5 rounded-full bg-slate-400 shrink-0" aria-label="Inactive" />
          )}

          {/* NEW badge */}
          {badge === "new" && (
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0 text-[10px] font-medium text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              New
            </span>
          )}
        </span>

        {/* connection status */}
        {status && (
          <span className="mt-0.5 flex items-center gap-1">
            <span className={cn("size-1.5 rounded-full shrink-0", STATUS_DOT_CLASS[status.type])} aria-hidden />
            <span className={cn("text-[11px] leading-snug", STATUS_LABEL_CLASS[status.type])}>{status.label}</span>
          </span>
        )}

        {/* hover/focus description — hidden by default, always visible on touch devices */}
        <span
          id={descId}
          className={cn(
            "block mt-1 text-xs text-muted-foreground leading-snug line-clamp-2",
            "hidden group-hover:block group-focus-visible:block",
            "[@media(hover:none)]:block",
          )}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
