import { Building2, Info, Search, Download } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

export function ListingsCitationsPanel() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title={
          <span className="inline-flex items-center gap-2">
            Citations
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="mt-0.5 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track your business citations across directories.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <Search size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs">
              <Download size={14} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
              Export
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Building2 className="text-muted-foreground" size={24} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Citations report</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Detailed citation tracking and analysis will appear here. This section is currently under development.
          </p>
        </div>
      </div>
    </div>
  );
}
