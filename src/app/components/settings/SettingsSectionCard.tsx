import { useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import {
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
  MAIN_VIEW_SUBHEADING_CLASS,
} from "@/app/components/layout/mainViewTitleClasses";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { SettingsItemRow } from "./SettingsItemRow";
import type { SettingsSection } from "./settingsLandingData";

interface SettingsSectionCardProps {
  section: SettingsSection;
  sectionRef?: (el: HTMLDivElement | null) => void;
  onItemClick?: (itemKey: string) => void;
}

export function SettingsSectionCard({ section, sectionRef, onItemClick }: SettingsSectionCardProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div
      ref={sectionRef}
      data-settings-section={section.key}
      className="rounded-lg border border-border bg-card px-6 py-5 flex flex-col gap-4"
    >
      {/* header */}
      <div>
        <h2 className={cn(MAIN_VIEW_PRIMARY_HEADING_CLASS, "text-base")}>{section.label}</h2>
        <p className={cn(MAIN_VIEW_SUBHEADING_CLASS, "mt-1")}>
          {section.description}
          {section.learnMore && (
            <>
              {" "}
              <a
                href="#"
                className="text-primary hover:underline focus-visible:underline outline-none"
                onClick={(e) => e.preventDefault()}
              >
                Learn more
              </a>
            </>
          )}
        </p>
      </div>

      {/* optional dismissable banner */}
      {section.banner && !bannerDismissed && (
        <div className="flex items-start gap-2 rounded-md bg-primary/5 px-4 py-2">
          <Info
            size={14}
            strokeWidth={L1_STRIP_ICON_STROKE_PX}
            absoluteStrokeWidth
            className="text-primary shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="flex-1 text-xs text-foreground leading-snug">
            {section.banner.message}
            {section.banner.linkLabel && (
              <>
                {" "}
                <a
                  href="#"
                  className="text-primary hover:underline focus-visible:underline outline-none"
                  onClick={(e) => e.preventDefault()}
                >
                  {section.banner.linkLabel}
                </a>
              </>
            )}
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            <X size={14} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
          </button>
        </div>
      )}

      {/* 3-col item grid — items-start so rows expand independently on hover */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-1 items-start">
        {section.items.map((item) => (
          <SettingsItemRow
            key={item.key}
            label={item.label}
            description={item.description}
            icon={item.icon}
            status={item.status}
            badge={item.badge}
            agentStatus={item.agentStatus}
            onClick={() => onItemClick?.(item.key)}
          />
        ))}
      </div>
    </div>
  );
}
