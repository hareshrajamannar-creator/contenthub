import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Globe, MoreHorizontal, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export interface Site {
  id: string;
  name: string;
  category: string;
  locationsListed: number;
  locationsTotal: number;
  avgAccuracy: number;
  lastSynced: string;
}

const siteColumnHelper = createColumnHelper<Site>();

export const MOCK_SITES: Site[] = [
  { id: "google",      name: "Google Business",   category: "Search",    locationsListed: 6, locationsTotal: 6, avgAccuracy: 96, lastSynced: "2h ago" },
  { id: "yelp",        name: "Yelp",               category: "Reviews",   locationsListed: 6, locationsTotal: 6, avgAccuracy: 88, lastSynced: "4h ago" },
  { id: "facebook",    name: "Facebook",            category: "Social",    locationsListed: 5, locationsTotal: 6, avgAccuracy: 82, lastSynced: "6h ago" },
  { id: "apple",       name: "Apple Maps",          category: "Maps",      locationsListed: 6, locationsTotal: 6, avgAccuracy: 91, lastSynced: "1d ago" },
  { id: "bing",        name: "Bing Places",         category: "Search",    locationsListed: 4, locationsTotal: 6, avgAccuracy: 74, lastSynced: "2d ago" },
  { id: "foursquare",  name: "Foursquare",          category: "Discovery", locationsListed: 5, locationsTotal: 6, avgAccuracy: 79, lastSynced: "3d ago" },
  { id: "tripadvisor", name: "TripAdvisor",         category: "Reviews",   locationsListed: 3, locationsTotal: 6, avgAccuracy: 68, lastSynced: "4d ago" },
  { id: "yahoo",       name: "Yahoo Local",         category: "Search",    locationsListed: 4, locationsTotal: 6, avgAccuracy: 71, lastSynced: "5d ago" },
];

export function AccuracyBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const color = value >= 90 ? "bg-emerald-500" : value >= 70 ? "bg-amber-400" : "bg-red-400";
  const textColor = value >= 90 ? "text-emerald-700 dark:text-emerald-400" : value >= 70 ? "text-amber-700 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`font-medium ${textColor}`}>{value}%</span>
    </div>
  );
}

function coveragePct(s: Site) {
  return Math.round((s.locationsListed / s.locationsTotal) * 100);
}

export function ListingsAllSitesPanel({
  search,
  columnSheetOpen,
  onColumnSheetOpenChange,
}: {
  search: string;
  columnSheetOpen?: boolean;
  onColumnSheetOpenChange?: (open: boolean) => void;
}) {
  const columnSheetControlled =
    columnSheetOpen !== undefined && onColumnSheetOpenChange !== undefined;
  const filtered = MOCK_SITES.filter((s) =>
    [s.name, s.category].some((f) => f.toLowerCase().includes(search.toLowerCase())),
  );

  const columns = useMemo(
    () => [
      siteColumnHelper.accessor("name", {
        id: "directory",
        header: "Directory",
        meta: { settingsLabel: "Directory" },
        size: 220,
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Globe size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
            </div>
            <span className="font-medium text-foreground">{info.getValue()}</span>
          </div>
        ),
      }),
      siteColumnHelper.accessor("category", {
        id: "category",
        header: "Category",
        meta: { settingsLabel: "Category" },
        size: 112,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      siteColumnHelper.accessor((row) => coveragePct(row), {
        id: "coverage",
        header: "Coverage",
        meta: { settingsLabel: "Coverage" },
        size: 168,
        sortingFn: "basic",
        cell: ({ row }) => {
          const site = row.original;
          const pct = coveragePct(site);
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 66 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-muted-foreground">
                {site.locationsListed}/{site.locationsTotal}
              </span>
            </div>
          );
        },
      }),
      siteColumnHelper.accessor("avgAccuracy", {
        id: "avgAccuracy",
        header: "Avg. accuracy",
        meta: { settingsLabel: "Avg. accuracy" },
        size: 152,
        enableSorting: true,
        cell: (info) => <AccuracyBar value={info.getValue()} />,
      }),
      siteColumnHelper.accessor("lastSynced", {
        id: "lastSynced",
        header: "Last synced",
        meta: { settingsLabel: "Last synced" },
        size: 128,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      siteColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: () => (
          <div className="text-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem className="cursor-pointer text-xs">
                  <RefreshCcw size={12} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                  Sync now
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs">
                  <ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                  View directory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="mx-6 mt-6 mb-6 flex min-h-0 flex-1 overflow-y-auto bg-background">
      <AppDataTable<Site>
        tableId="listings.allSites"
        data={filtered}
        columns={columns}
        initialSorting={[{ id: "directory", desc: false }]}
        getRowId={(s) => s.id}
        columnSheetTitle="Directory columns"
        className="min-h-0 min-w-0 px-0"
        hideColumnsButton={columnSheetControlled}
        columnSheetOpen={columnSheetControlled ? columnSheetOpen : undefined}
        onColumnSheetOpenChange={columnSheetControlled ? onColumnSheetOpenChange : undefined}
      />
    </div>
  );
}
