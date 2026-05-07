import { ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";
import { useReportActions, buildReportContext } from "./useReportActions";
import { ShareReportModal } from "./ShareReportModal";
import { ScheduleReportModal } from "./ScheduleReportModal";
import { CustomizeShareDrawer } from "./CustomizeShareDrawer";
import { trackReportAction, buildEvent } from "./services";
import type { ReportContext, ReportActionId } from "./types";

/* ─── Props ─── */
interface ReportActionsButtonProps {
  /** Pre-built context or use buildReportContext() helper */
  context: ReportContext;
  /** Which actions to offer */
  actions: ReportActionId[];
  /** Override the button label (defaults to "Actions") */
  label?: string;
  /** Custom handler for "customizeShare" — e.g. Dashboard opens its AI panel instead */
  onCustomize?: () => void;
}

/**
 * Report actions — same **DropdownMenu** shell as profile / header menus (`FLOATING_PANEL_SURFACE_CLASSNAME`, no outer border).
 */
export function ReportActionsButton({
  context,
  actions,
  label = "Actions",
  onCustomize,
}: ReportActionsButtonProps) {
  const { openAction, closeAction, activeAction, availableActions } = useReportActions(context, actions);

  const handleActionClick = (actionId: ReportActionId) => {
    trackReportAction(buildEvent("report_action_clicked", context, actionId));

    if (actionId === "customizeShare" && onCustomize) {
      onCustomize();
      return;
    }

    openAction(actionId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("gap-1 text-[13px] font-normal tracking-[-0.26px]")}
          >
            {label}
            <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          {availableActions.map((action) => {
            const disabled = action.isEnabled ? !action.isEnabled(context) : false;
            return (
              <DropdownMenuItem
                key={action.id}
                disabled={disabled}
                className="text-[13px] font-normal"
                onSelect={(e) => {
                  e.preventDefault();
                  if (!disabled) handleActionClick(action.id);
                }}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-3.5">
                  {action.icon}
                </span>
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareReportModal
        open={activeAction === "share"}
        onClose={closeAction}
        context={context}
      />
      <ScheduleReportModal
        open={activeAction === "schedule"}
        onClose={closeAction}
        context={context}
      />
      <CustomizeShareDrawer
        open={activeAction === "customizeShare"}
        onClose={closeAction}
        context={context}
      />
    </>
  );
}

/* Re-export helpers for convenience */
export { buildReportContext } from "./useReportActions";
export type { ReportContext, ReportActionId } from "./types";
