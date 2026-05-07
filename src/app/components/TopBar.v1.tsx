import { Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  QuickCreateLauncher,
  type QuickCreateAction,
} from "@/app/components/QuickCreateLauncher";
import { APP_SHELL_RAIL_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
import type { AppView } from "../App";
import { getAppViewTitle } from "../appViewTitle";

interface TopBarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  mynaChatOpen?: boolean;
  onToggleMynaChat?: () => void;
}

export function TopBar({ currentView, onViewChange, onToggleMynaChat }: TopBarProps) {
  const handleQuickCreate = (action: QuickCreateAction) => {
    if (action.id === "review-request") onViewChange("reviews");
    else if (action.id === "new-message") onViewChange("inbox");
    else if (action.id === "create-post") onViewChange("social");
    else if (action.id === "custom-agent") onViewChange("agents-builder");
    else if (action.id === "add-contact") onViewChange("contacts");
    else if (action.id === "request-payment") onViewChange("payments");
    else if (action.id === "create-survey") onViewChange("surveys");
    else if (action.id === "create-ticket") onViewChange("ticketing");
    else if (action.id === "create-workflow") onViewChange("schedule-builder");
    else if (action.id === "create-report" || action.id === "create-dashboard") onViewChange("dashboard");
  };

  return (
    <div
      className={`h-[48px] flex items-center justify-between px-4 shrink-0 rounded-tr-lg ${APP_SHELL_RAIL_SURFACE_CLASS}`}
      data-no-print
    >
      {/* Left: current area (aligned with L1 rail / route) */}
      <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px]" style={{ fontWeight: 400 }}>
        {getAppViewTitle(currentView)}
      </p>

      {/* Right: design version (dev) + BirdAI */}
      <div className="flex items-center gap-2">
        <QuickCreateLauncher layout="appGrid" onActionSelect={handleQuickCreate} />
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleMynaChat}
          className="group ml-1 h-[30px] min-h-[30px] gap-1 rounded-lg border-0 bg-app-shell-l2-surface px-2 py-0 text-[12px] leading-none hover:bg-app-shell-l2-surface hover:text-inherit dark:bg-[#252a3a] dark:hover:bg-[#252a3a]"
        >
          <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
            <defs>
              <linearGradient id="ask-birdai-cta-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9970D7" />
                <stop offset="55%" stopColor="#7f87e8" />
                <stop offset="100%" stopColor="#2552ED" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="-1 0;1 0;-1 0"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>
          </svg>
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 group-hover:animate-[myna-cta-icon-tilt_360ms_ease-out_1] motion-reduce:group-hover:animate-none"
            style={{ stroke: "url(#ask-birdai-cta-gradient)" }}
          />
          <span className="bg-gradient-to-r from-[#9970D7] via-[#7f87e8] to-[#2552ED] bg-[length:220%_100%] bg-clip-text text-transparent leading-none animate-[l2-nav-shimmer_2.2s_linear_infinite] motion-reduce:animate-none">
            Ask BirdAI
          </span>
        </Button>
      </div>
    </div>
  );
}
