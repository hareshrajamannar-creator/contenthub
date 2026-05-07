"use client";

import * as React from "react";

import { cn } from "./utils";

export type TextTabItem<T extends string> = {
  id: T;
  label: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
};

export interface TextTabsRowProps<T extends string> {
  items: TextTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Optional `aria-label` for the tablist row. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Underline text tabs: the tablist has a full-width `border-b` baseline so gaps
 * between triggers do not break the rule; each tab uses a 2px bottom border
 * (primary or transparent) with `-mb-px` so the active indicator stacks on the baseline.
 */
export function TextTabsRow<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TextTabsRowProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-end gap-x-2 gap-y-2 border-b border-border", className)}
    >
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 px-2 pb-2 pt-1 text-sm font-medium transition-colors",
              isActive
                ? "border-b-2 border-primary text-primary hover:text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              item.disabled && "pointer-events-none opacity-50",
            )}
          >
            {item.label}
            {item.suffix != null ? item.suffix : null}
          </button>
        );
      })}
    </div>
  );
}
