import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Search, MoreVertical, CheckCircle2, XCircle, Info } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

export type GoogleSuggestion = {
  id: string;
  location: string;
  field: string;
  birdeyeData: string;
  suggestion: string;
  createdOn: string;
};

const suggestionColumnHelper = createColumnHelper<GoogleSuggestion>();

const MOCK_SUGGESTIONS: GoogleSuggestion[] = [
  {
    id: "s1",
    location: "Japan Test",
    field: "Hours of operation",
    birdeyeData: "Monday: Closed\nTuesday: 11:00 AM - 7:00 PM\nWednesday: 12:00 PM - 8:00 PM\nThursday: 10:00 AM - 6:00 PM\nFriday: Closed\nSaturday: 10:00 AM - 6:00 PM\nSunday: 2:00 PM - 3:30 PM",
    suggestion: "Monday: Closed\nTuesday: 11:00 AM - 7:00 PM\nWednesday: 12:00 PM - 8:00 PM\nThursday: 10:00 AM - 6:00 PM\nFriday: Closed\nSaturday: 10:00 AM - 6:00 PM\nSunday: 2:00 PM - 3:00 PM",
    createdOn: "Apr 20, 2026",
  },
  {
    id: "s2",
    location: "Japan Test",
    field: "Phone number",
    birdeyeData: "077383 80600",
    suggestion: "061489 58890",
    createdOn: "Apr 20, 2026",
  },
  {
    id: "s3",
    location: "Jennifer Smerek - Gershman Mortgage test",
    field: "Phone number",
    birdeyeData: "060271 81601",
    suggestion: "084461 26772",
    createdOn: "Apr 16, 2026",
  },
  {
    id: "s4",
    location: "Jennifer Smerek - Gershman Mortgage test",
    field: "Primary category",
    birdeyeData: "Restaurant",
    suggestion: "Indoor playground",
    createdOn: "Apr 16, 2026",
  },
  {
    id: "s5",
    location: "Japan Test",
    field: "Address",
    birdeyeData: "Plot 125B, Omega Green Park, Uattardhona Fleet Recreation Center, YOKOSUKA\nLucknow\nUttar Pradesh - 226028",
    suggestion: "Plot 125B\nUattardhona\nUttar Pradesh - 226028",
    createdOn: "Apr 01, 2026",
  },
  {
    id: "s6",
    location: "Aspen Dental - Roseville, MNa",
    field: "Hours of operation",
    birdeyeData: "Monday: 9:00 AM - 6:00 PM\nTuesday: 9:00 AM - 6:00 PM\nWednesday: 9:00 AM - 6:00 PM\nThursday: 9:00 AM - 6:00 PM\nFriday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: 9:00 AM - 6:00 PM",
    suggestion: "Monday: 8:00 AM - 11:00 AM, 1:00 PM - 5:00 PM\nTuesday: 8:00 AM - 6:00 PM\nWednesday: 8:00 AM - 6:00 PM\nThursday: 8:00 AM - 6:00 PM\nFriday: 8:00 AM - 6:00 PM\nSaturday: 8:00 AM - 5:00 PM\nSunday: 8:00 AM - 5:00 PM",
    createdOn: "Nov 21, 2025",
  },
];

export function GoogleSuggestionsPanel() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo(
    () => [
      suggestionColumnHelper.accessor("location", {
        id: "location",
        header: "Location",
        meta: { settingsLabel: "Location" },
        size: 220,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      suggestionColumnHelper.accessor("field", {
        id: "field",
        header: "Field",
        meta: { settingsLabel: "Field" },
        size: 168,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      suggestionColumnHelper.accessor("birdeyeData", {
        id: "birdeyeData",
        header: "Birdeye data",
        meta: { settingsLabel: "Birdeye data" },
        size: 256,
        cell: (info) => (
          <p className="leading-relaxed whitespace-pre-wrap text-foreground">{info.getValue()}</p>
        ),
      }),
      suggestionColumnHelper.accessor("suggestion", {
        id: "suggestion",
        header: "Suggestion",
        meta: { settingsLabel: "Suggestion" },
        size: 256,
        cell: (info) => (
          <p className="leading-relaxed whitespace-pre-wrap text-foreground">{info.getValue()}</p>
        ),
      }),
      suggestionColumnHelper.accessor("createdOn", {
        id: "createdOn",
        header: "Created on",
        meta: { settingsLabel: "Created on" },
        size: 144,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      suggestionColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: () => (
          <div className="text-left">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title={
          <span className="inline-flex items-center gap-2">
            Google suggestions
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="mt-0.5 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suggestions from Google users for your business profiles.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <AppDataTableColumnSettingsTrigger
              sheetTitle="Suggestion columns"
              onClick={() => setColumnSheetOpen(true)}
            />
            <Button variant="outline" size="icon" className="shrink-0">
              <Search size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-6">
        <div className="mx-auto flex w-full flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">6</span>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-foreground">Pending</span>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">0</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Accepted</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">0</span>
              <div className="flex items-center gap-2">
                <XCircle size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Rejected</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden">
            <AppDataTable<GoogleSuggestion>
              tableId="listings.googleSuggestions"
              data={MOCK_SUGGESTIONS}
              columns={columns}
              initialSorting={[{ id: "createdOn", desc: true }]}
              getRowId={(r) => r.id}
              columnSheetTitle="Suggestion columns"
              className="min-w-0 px-0"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
