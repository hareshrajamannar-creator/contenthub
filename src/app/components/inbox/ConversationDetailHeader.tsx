"use client";

import { ChevronDown, MoreVertical } from "lucide-react";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";
import {
  INBOX_CONVERSATION_CLASSIFICATION_OPTIONS,
  inboxClassificationLabel,
} from "@/app/components/inbox/inboxConversationClassification";

export type InboxCallOutcome = "resolved" | "escalated" | "follow-up";

function CallOutcomeBadge({ outcome }: { outcome?: InboxCallOutcome }) {
  if (outcome === "resolved") {
    return (
      <span className="rounded-md border-0 bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        Resolved
      </span>
    );
  }
  if (outcome === "escalated") {
    return (
      <span className="rounded-md border-0 bg-red-50 px-2 py-0.5 text-[12px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
        Escalated
      </span>
    );
  }
  if (outcome === "follow-up") {
    return (
      <span className="rounded-md border-0 bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        Follow-up
      </span>
    );
  }
  return null;
}

export interface ConversationDetailHeaderProps {
  contactName: string;
  assignedTo: string;
  assignedAvatar: string;
  /** Second row: muted metadata (timestamp · duration · agent). */
  headerMetaLine?: string;
  /** Outline-style tag, sentence case. */
  categoryTag?: string;
  callOutcome?: InboxCallOutcome;
  /** Selected classification id; empty = show “Select status”. */
  classificationId: string;
  onClassificationChange: (id: string) => void;
  chatHeaderElevated?: boolean;
}

export function ConversationDetailHeader({
  contactName,
  assignedTo,
  assignedAvatar,
  headerMetaLine,
  categoryTag,
  callOutcome,
  classificationId,
  onClassificationChange,
  chatHeaderElevated = false,
}: ConversationDetailHeaderProps) {
  const statusLabel = classificationId ? inboxClassificationLabel(classificationId) : null;

  return (
    <div
      className={cn(
        "relative z-10 shrink-0 bg-[#f5f6f8] px-5 transition-[box-shadow,colors] duration-200 dark:bg-app-shell-gutter",
        chatHeaderElevated
          ? "shadow-[0_2px_10px_-4px_rgba(15,23,42,0.1)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.28)]"
          : "shadow-none",
      )}
    >
      <div className="flex flex-col gap-2 py-4">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <h2
            className="min-w-0 text-[16px] text-[#212121] dark:text-foreground"
            style={{ fontWeight: 400 }}
          >
            {contactName}
          </h2>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {/* modal={false}: avoids RemoveScroll / focus trap fighting nested inbox overflow; Radix still closes on outside click. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 gap-2 font-normal text-[13px] text-muted-foreground",
                )}
                aria-label={statusLabel ? `Status: ${statusLabel}` : "Select status"}
              >
                <span className={cn(!statusLabel && "text-muted-foreground")}>
                  {statusLabel ?? "Select status"}
                </span>
                <ChevronDown
                  className="size-4 shrink-0 opacity-70"
                  strokeWidth={L1_STRIP_ICON_STROKE_PX}
                  absoluteStrokeWidth
                  aria-hidden
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4} className="min-w-[12rem]">
                {INBOX_CONVERSATION_CLASSIFICATION_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    className={cn(opt.id === classificationId && "bg-accent text-accent-foreground")}
                    onSelect={() => onClassificationChange(opt.id)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-muted"
            >
              <div className="size-6 overflow-hidden rounded-full ring-1 ring-[#e8eaed] dark:ring-[#3d4555]">
                <img src={assignedAvatar} alt={assignedTo} className="size-full object-cover" />
              </div>
              <span
                className="text-[13px] text-[#212121] dark:text-foreground"
                style={{ fontWeight: 400 }}
              >
                {assignedTo}
              </span>
              <ChevronDown
                className="size-3.5 text-[#999] dark:text-muted-foreground"
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
                aria-hidden
              />
            </button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-muted"
              aria-label="More options"
            >
              <MoreVertical
                className="size-[14px] text-[#212121] dark:text-muted-foreground"
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
              />
            </Button>
          </div>
        </div>

        {(headerMetaLine || callOutcome || categoryTag) && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {headerMetaLine ? (
              <span className="text-[12px] text-[#666] dark:text-muted-foreground">{headerMetaLine}</span>
            ) : null}
            {callOutcome ? <CallOutcomeBadge outcome={callOutcome} /> : null}
            {categoryTag ? (
              <Badge variant="outline" className="border-border font-normal text-[12px] text-foreground">
                {categoryTag}
              </Badge>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
