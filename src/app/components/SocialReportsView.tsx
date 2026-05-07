import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AlertTriangle, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
  MAIN_VIEW_SUBHEADING_CLASS,
} from "./layout/mainViewTitleClasses";
import { buildReportRows, type SocialReportRow } from "./social/socialTableFixtures";

type TableState = "live" | "loading" | "error" | "empty";

const reportColumn = createColumnHelper<SocialReportRow>();

const reportColumns = [
  reportColumn.accessor("channel", {
    id: "channel",
    header: "Channel",
    size: 180,
    enableSorting: true,
    cell: (info) => <span className="truncate font-medium">{info.getValue()}</span>,
  }),
  reportColumn.accessor("postsPublished", {
    id: "postsPublished",
    header: "Posts",
    size: 120,
    enableSorting: true,
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
  reportColumn.accessor("engagementRate", {
    id: "engagementRate",
    header: "Engagement",
    size: 140,
    enableSorting: true,
    cell: (info) => <span className="tabular-nums">{info.getValue()}%</span>,
  }),
  reportColumn.accessor("responseRate", {
    id: "responseRate",
    header: "Response rate",
    size: 150,
    enableSorting: true,
    cell: (info) => <span className="tabular-nums">{info.getValue()}%</span>,
  }),
  reportColumn.accessor("avgResponseMins", {
    id: "avgResponseMins",
    header: "Avg. response",
    size: 160,
    enableSorting: true,
    cell: (info) => <span className="tabular-nums">{info.getValue()} min</span>,
  }),
  reportColumn.accessor("lastUpdated", {
    id: "lastUpdated",
    header: "Last updated",
    size: 150,
    enableSorting: true,
  }),
];

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2">
      <p className="text-sm text-foreground">{title}</p>
      <p className="max-w-[420px] text-center text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

export function SocialReportsView({ reportKey }: { reportKey: string }) {
  const [query, setQuery] = useState("");
  const [tableState, setTableState] = useState<TableState>("live");
  const showStateControls = import.meta.env.DEV;
  const allRows = useMemo(() => buildReportRows(7, 26), []);
  const baseRows = tableState === "empty" ? [] : allRows;
  const filtered = baseRows.filter((row) => row.channel.toLowerCase().includes(query.toLowerCase()));

  const title = reportKey.replace("Reports/", "");
  const isFilteredEmpty = tableState === "live" && baseRows.length > 0 && filtered.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className={`${MAIN_VIEW_HEADER_BAND_CLASS} border-b border-border`}>
        <div>
          <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>{title}</h1>
          <p className={MAIN_VIEW_SUBHEADING_CLASS}>
            {baseRows.length} rows across seeded channels
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm sm:w-[220px]"
              placeholder="Search channel..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {showStateControls ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setTableState("live")}>Live</Button>
              <Button variant="outline" size="sm" onClick={() => setTableState("loading")}>Loading</Button>
              <Button variant="outline" size="sm" onClick={() => setTableState("error")}>Error</Button>
              <Button variant="outline" size="sm" onClick={() => setTableState("empty")}>Empty</Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-muted/20 py-4">
        {tableState === "loading" ? (
          <EmptyState title="Loading report rows..." body="Fetching seeded prototype rows for this report." />
        ) : tableState === "error" ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-2">
            <Badge variant="destructive"><AlertTriangle size={12} />Failed to load</Badge>
            <p className="max-w-[440px] text-center text-xs text-muted-foreground">
              Prototype error state: report rows could not be loaded. Try again to restore live data.
            </p>
            <Button size="sm" onClick={() => setTableState("live")}>Retry</Button>
          </div>
        ) : isFilteredEmpty ? (
          <EmptyState title="No rows match your search" body="Try a different channel filter or clear the search query." />
        ) : (
          <AppDataTable<SocialReportRow>
            tableId={`social.reports.${title.toLowerCase().replaceAll(" ", "-")}`}
            persist={false}
            rowDensity="default"
            columns={reportColumns}
            data={filtered}
            stickyLeadingColumnCount={1}
            emptyState={<EmptyState title="No report rows available" body="This report has no generated rows yet." />}
          />
        )}
      </div>
    </div>
  );
}
