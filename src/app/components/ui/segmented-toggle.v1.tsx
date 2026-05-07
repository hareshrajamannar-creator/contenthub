"use client";

import * as React from "react";

export type SegmentedToggleItem<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export interface SegmentedToggleProps<T extends string> {
  items: SegmentedToggleItem<T>[];
  value: T;
  onChange: (value: T) => void;
  iconOnly?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  items,
  value,
  onChange,
  iconOnly = false,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex h-[var(--button-height)] items-stretch bg-[#f0f1f5] dark:bg-[#262b35] rounded-md p-[2px] ${className ?? ""}`}
    >
      {items.map((item) => {
        const active = item.value === value;
        const sizing = iconOnly ? "h-full aspect-square" : "h-full px-3";
        const stateClasses = active
          ? "bg-white dark:bg-[#333a47] shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-[#212121] dark:text-[#e4e4e4]"
          : "text-[#888] dark:text-[#6b7280] hover:text-[#555] dark:hover:text-[#c0c6d4]";
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={active}
            aria-label={iconOnly ? item.label : undefined}
            title={iconOnly ? item.label : undefined}
            className={`flex items-center justify-center gap-1 rounded-md text-[12px] transition-all duration-200 ${sizing} ${stateClasses}`}
          >
            {item.icon}
            {!iconOnly && <span>{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
