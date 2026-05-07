import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Lock,
  Calendar,
  Filter,
  FileText,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  Printer,
  Copy,
  Ban,
  Tags,
} from "lucide-react";
import { getDrafts, deleteDraft, subscribeDrafts, type DraftReport } from "./draftStore";
import { toast } from "sonner";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type ShareStatus = "active" | "expired" | "revoked";
type ShareMethod = "link" | "email" | "download";
type ReportType = "profile_performance" | "review_summary" | "social_analytics" | "listing_audit" | "survey_results" | "campaign_report" | "competitor_analysis" | "custom_dashboard";

interface SharedItem {
  id: string;
  reportName: string;
  reportType: ReportType;
  sharedWith: string[];
  sharedVia: ShareMethod;
  sharedAt: string;
  expiresAt: string | null;
  status: ShareStatus;
  accessCount: number;
  uniqueViewers: number;
  lastAccessedAt: string | null;
  lastAccessedBy: string | null;
  shareLink: string | null;
  isPasswordProtected: boolean;
  downloadCount: number;
  locationCount: number;
  dateRange: string;
}

/* ─── Mock Data ─── */
const mockSharedItems: SharedItem[] = [
  {
    id: "sh-001",
    reportName: "Profile Performance Report - Q1 2026",
    reportType: "profile_performance",
    sharedWith: ["sarah.chen@acmecorp.com", "mike.jones@acmecorp.com", "team-leads@acmecorp.com"],
    sharedVia: "link",
    sharedAt: "2026-03-07T14:30:00Z",
    expiresAt: "2026-04-07T14:30:00Z",
    status: "active",
    accessCount: 24,
    uniqueViewers: 8,
    lastAccessedAt: "2026-03-09T09:15:00Z",
    lastAccessedBy: "sarah.chen@acmecorp.com",
    shareLink: "https://app.birdeye.com/shared/rpt-a1b2c3d4",
    isPasswordProtected: true,
    downloadCount: 3,
    locationCount: 30,
    dateRange: "Jan 1 - Mar 7, 2026",
  },
  {
    id: "sh-002",
    reportName: "Social Media Analytics - February",
    reportType: "social_analytics",
    sharedWith: ["lisa.park@clientco.com"],
    sharedVia: "email",
    sharedAt: "2026-03-05T10:00:00Z",
    expiresAt: null,
    status: "active",
    accessCount: 12,
    uniqueViewers: 1,
    lastAccessedAt: "2026-03-08T16:42:00Z",
    lastAccessedBy: "lisa.park@clientco.com",
    shareLink: null,
    isPasswordProtected: false,
    downloadCount: 1,
    locationCount: 12,
    dateRange: "Feb 1 - Feb 28, 2026",
  },
  {
    id: "sh-003",
    reportName: "Review Sites Overview - All Locations",
    reportType: "review_summary",
    sharedWith: ["operations@acmecorp.com", "regional-mgrs@acmecorp.com"],
    sharedVia: "link",
    sharedAt: "2026-02-20T08:45:00Z",
    expiresAt: "2026-03-20T08:45:00Z",
    status: "active",
    accessCount: 47,
    uniqueViewers: 10,
    lastAccessedAt: "2026-03-09T07:30:00Z",
    lastAccessedBy: "regional-mgrs@acmecorp.com",
    shareLink: "https://app.birdeye.com/shared/rpt-e5f6g7h8",
    isPasswordProtected: false,
    downloadCount: 8,
    locationCount: 45,
    dateRange: "Jan 1 - Feb 20, 2026",
  },
  {
    id: "sh-004",
    reportName: "Competitor Analysis - Downtown Region",
    reportType: "competitor_analysis",
    sharedWith: ["alex.rivera@acmecorp.com"],
    sharedVia: "download",
    sharedAt: "2026-02-15T13:20:00Z",
    expiresAt: null,
    status: "active",
    accessCount: 5,
    uniqueViewers: 1,
    lastAccessedAt: "2026-02-28T11:00:00Z",
    lastAccessedBy: "alex.rivera@acmecorp.com",
    shareLink: null,
    isPasswordProtected: false,
    downloadCount: 2,
    locationCount: 8,
    dateRange: "Dec 1, 2025 - Feb 15, 2026",
  },
  {
    id: "sh-005",
    reportName: "Listing Accuracy Audit - January",
    reportType: "listing_audit",
    sharedWith: ["seo-team@acmecorp.com", "john.kim@acmecorp.com", "anna.lee@acmecorp.com", "david.ng@acmecorp.com"],
    sharedVia: "email",
    sharedAt: "2026-02-01T09:00:00Z",
    expiresAt: "2026-03-01T09:00:00Z",
    status: "expired",
    accessCount: 32,
    uniqueViewers: 11,
    lastAccessedAt: "2026-02-28T23:58:00Z",
    lastAccessedBy: "john.kim@acmecorp.co",
    shareLink: null,
    isPasswordProtected: true,
    downloadCount: 6,
    locationCount: 30,
    dateRange: "Jan 1 - Jan 31, 2026",
  },
  {
    id: "sh-006",
    reportName: "Survey Results - Customer Satisfaction Q4 20",
    reportType: "survey_results",
    sharedWith: ["exec-team@acmecorp.com"],
    sharedVia: "link",
    sharedAt: "2026-01-10T15:00:00Z",
    expiresAt: "2026-02-10T15:00:00Z",
    status: "expired",
    accessCount: 18,
    uniqueViewers: 6,
    lastAccessedAt: "2026-02-09T14:22:00Z",
    lastAccessedBy: "exec-team@acmecorp.com",
    shareLink: "https://app.birdeye.com/shared/rpt-m9n0p1q2",
    isPasswordProtected: true,
    downloadCount: 4,
    locationCount: 30,
    dateRange: "Oct 1 - Dec 31, 2025",
  },
  {
    id: "sh-007",
    reportName: "Campaign Performance - Holiday Promo",
    reportType: "campaign_report",
    sharedWith: ["marketing@acmecorp.com", "cfo@acmecorp.com"],
    sharedVia: "email",
    sharedAt: "2026-01-05T11:30:00Z",
    expiresAt: null,
    status: "revoked",
    accessCount: 9,
    uniqueViewers: 3,
    lastAccessedAt: "2026-01-12T10:15:00Z",
    lastAccessedBy: "marketing@acmecorp.com",
    shareLink: null,
    isPasswordProtected: false,
    downloadCount: 1,
    locationCount: 15,
    dateRange: "Nov 15 - Dec 31, 2025",
  },
  {
    id: "sh-008",
    reportName: "Custom Dashboard - Executive Overview",
    reportType: "custom_dashboard",
    sharedWith: ["ceo@acmecorp.com", "coo@acmecorp.com", "vp-ops@acmecorp.com"],
    sharedVia: "link",
    sharedAt: "2025-12-20T09:00:00Z",
    expiresAt: null,
    status: "active",
    accessCount: 89,
    uniqueViewers: 5,
    lastAccessedAt: "2026-03-09T08:05:00Z",
    lastAccessedBy: "ceo@acmecorp.com",
    shareLink: "https://app.birdeye.com/shared/rpt-r3s4t5u6",
    isPasswordProtected: true,
    downloadCount: 12,
    locationCount: 45,
    dateRange: "Rolling 30 days",
  },
];

/* ─── Helpers ─── */
const reportTypeLabels: Record<ReportType, string> = {
  profile_performance: "Profile performance",
  review_summary: "Review summary",
  social_analytics: "Social analytics",
  listing_audit: "Listing audit",
  survey_results: "Survey results",
  campaign_report: "Campaign report",
  competitor_analysis: "Competitor analysis",
  custom_dashboard: "Custom dashboard",
};

/** Reference “now” for mock relative times (aligned with mock data). */
const REFERENCE_NOW = new Date("2026-03-09T12:00:00Z");

function formatFullCalendar(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Gmail-style: short relative when recent, otherwise “Mar 7, 2026”. */
function formatSmartTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = REFERENCE_NOW.getTime() - date.getTime();
  if (diffMs < 0) return formatFullCalendar(date);

  const minutesTotal = Math.floor(diffMs / 60000);
  if (minutesTotal < 1) return "Just now";
  if (minutesTotal < 60) {
    return minutesTotal === 1 ? "1 minute ago" : `${minutesTotal} minutes ago`;
  }
  const hours = Math.floor(minutesTotal / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
  if (days >= 7 && days < 14) return "1 week ago";
  return formatFullCalendar(date);
}

const shareMethodLabel: Record<ShareMethod, string> = {
  link: "Via link",
  email: "Via email",
  download: "Via download",
};

function formatExpiryColumn(item: SharedItem): string {
  if (!item.expiresAt) {
    if (item.status === "expired") return "Expired";
    return "—";
  }
  const exp = new Date(item.expiresAt);
  const expiredByDate = exp.getTime() < REFERENCE_NOW.getTime();
  if (item.status === "expired" || expiredByDate) {
    return `Expired ${formatFullCalendar(exp)}`;
  }
  return formatFullCalendar(exp);
}

const SHARE_STATUS_BADGE: Record<
  ShareStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  expired: {
    label: "Expired",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  },
  revoked: {
    label: "Revoked",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
};

function ShareStatusBadge({ status }: { status: ShareStatus }) {
  const cfg = SHARE_STATUS_BADGE[status];
  return (
    <Badge variant="outline" className={cn("font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

/* ─── Sort Types ─── */
type SortField = "reportName" | "sharedAt" | "status" | "accessCount";

/* ─── Main Component ─── */
interface SharedByMeProps {
  onEditDraft?: (draft: DraftReport) => void;
  onViewReport?: (reportName: string) => void;
}

export function SharedByMe({ onEditDraft, onViewReport }: SharedByMeProps) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("sharedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | ShareStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");
  const [timeRangeLabel, setTimeRangeLabel] = useState("All time");

  // Shared items — stateful so revoke / delete / reshare updates the list
  const [sharedItems, setSharedItems] = useState<SharedItem[]>(mockSharedItems);

  // Confirm-delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Drafts state
  const [drafts, setDrafts] = useState<DraftReport[]>(getDrafts());

  useEffect(() => {
    // Re-read drafts on store changes and on focus (cross-tab sync)
    const unsub = subscribeDrafts(() => setDrafts(getDrafts()));
    const handleFocus = () => setDrafts(getDrafts());
    window.addEventListener("focus", handleFocus);
    return () => {
      unsub();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const filtered = sharedItems
    .filter(item => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (typeFilter !== "all" && item.reportType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.reportName.toLowerCase().includes(q) ||
          item.sharedWith.some(r => r.toLowerCase().includes(q)) ||
          reportTypeLabels[item.reportType].toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "sharedAt") cmp = new Date(a.sharedAt).getTime() - new Date(b.sharedAt).getTime();
      else if (sortField === "accessCount") cmp = a.accessCount - b.accessCount;
      else if (sortField === "reportName") cmp = a.reportName.localeCompare(b.reportName);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "desc" ? -cmp : cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 text-muted-foreground/60" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3 text-primary" />
    ) : (
      <ArrowDown className="size-3 text-primary" />
    );
  };

  const totalActive = sharedItems.filter((i) => i.status === "active").length;
  const totalViews = sharedItems.reduce((s, i) => s + i.accessCount, 0);
  const totalUniqueViewers = sharedItems.reduce((s, i) => s + i.uniqueViewers, 0);
  const totalDownloads = sharedItems.reduce((s, i) => s + i.downloadCount, 0);

  const activeStatusLabel =
    statusFilter === "all"
      ? "All statuses"
      : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  const activeTypeLabel = typeFilter === "all" ? "All types" : reportTypeLabels[typeFilter];

  const metricCards = [
    { label: "Active shares", value: String(totalActive) },
    { label: "Total views", value: totalViews.toLocaleString() },
    { label: "Unique viewers", value: totalUniqueViewers.toLocaleString() },
    { label: "Downloads", value: totalDownloads.toLocaleString() },
  ] as const;

  const pendingDeleteReport =
    confirmDeleteId != null ? sharedItems.find((i) => i.id === confirmDeleteId) : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title="Shared by me"
        description={`${filtered.length.toLocaleString()} showing · ${sharedItems.length.toLocaleString()} shares`}
        actions={
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative h-[var(--button-height)] w-[min(100%,280px)] min-w-[200px] shrink">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2 size-[14px] -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => {
                    if (search === "") setSearchOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearch("");
                      setSearchOpen(false);
                    }
                  }}
                  autoFocus
                  placeholder="Search reports, recipients…"
                  className="h-full w-full rounded-lg border border-border bg-background py-0 pr-2 pl-8 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  aria-label="Search shared reports"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Open search"
                title="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-[14px] text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={`Date range: ${timeRangeLabel}`}
                  title={timeRangeLabel}
                >
                  <Calendar className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(["All time", "Last 90 days", "Last 30 days"] as const).map((label) => (
                  <DropdownMenuItem
                    key={label}
                    className="cursor-pointer text-xs"
                    onClick={() => setTimeRangeLabel(label)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={`Status: ${activeStatusLabel}`}
                  title={`Status: ${activeStatusLabel}`}
                >
                  <Filter className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(["all", "active", "expired", "revoked"] as const).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    className="cursor-pointer text-xs"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={`Type: ${activeTypeLabel}`}
                  title={`Type: ${activeTypeLabel}`}
                >
                  <FileText className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 w-56 overflow-y-auto">
                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => setTypeFilter("all")}>
                  All types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(Object.keys(reportTypeLabels) as ReportType[]).map((t) => (
                  <DropdownMenuItem key={t} className="cursor-pointer text-xs" onClick={() => setTypeFilter(t)}>
                    {reportTypeLabels[t]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label="Export" title="Export">
                  <Tags className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-xs"
                  onClick={() => toast.message("Export", { description: "Connect your workspace to export share activity." })}
                >
                  <Download size={13} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" aria-hidden />
                  Export list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metricCards.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className="text-xl font-semibold tabular-nums text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {drafts.length > 0 ? (
          <div className="bg-card overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span className="text-sm font-medium text-foreground">Drafts</span>
                <span className="text-xs text-muted-foreground">
                  {drafts.length} unsent {drafts.length === 1 ? "report" : "reports"}
                </span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                    <FileText className="size-4 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{draft.reportName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        Draft
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Last edited {formatSmartTime(draft.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mr-2 flex items-center gap-1.5">
                    <span
                      className="size-3 shrink-0 rounded-full border border-border shadow-sm"
                      style={{ backgroundColor: draft.themeColor }}
                    />
                    <span className="text-xs text-muted-foreground">{draft.selectedFont}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button type="button" size="sm" className="gap-1.5" onClick={() => onEditDraft?.(draft)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete draft"
                      onClick={() => {
                        deleteDraft(draft.id);
                        setDrafts(getDrafts());
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-background">
          <div className="overflow-x-auto border-b border-border">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-4 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("reportName")}
                      className="flex items-center gap-2 text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground"
                    >
                      Report <SortIcon field="reportName" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground">
                      Shared with
                    </span>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("sharedAt")}
                      className="flex items-center gap-2 text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground"
                    >
                      Shared <SortIcon field="sharedAt" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="flex items-center gap-2 text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground"
                    >
                      Status <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground">
                      Expires
                    </span>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort("accessCount")}
                      className="flex items-center gap-2 text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground"
                    >
                      Views <SortIcon field="accessCount" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground">
                      Last active
                    </span>
                  </th>
                  <th className="min-w-[200px] px-4 py-4 text-left">
                    <span className="text-[length:var(--table-label-size)] font-normal tracking-wide text-muted-foreground">
                      Last viewer
                    </span>
                  </th>
                  <th className="w-12 px-2 py-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="group border-b border-border transition-colors hover:bg-muted/40"
                  >
                    {/* Report */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.reportName}</p>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span>{reportTypeLabels[item.reportType]}</span>
                          <span aria-hidden className="text-border">
                            ·
                          </span>
                          <span>{shareMethodLabel[item.sharedVia]}</span>
                          {item.isPasswordProtected ? (
                            <span className="inline-flex items-center gap-1">
                              <span aria-hidden>·</span>
                              <Lock className="size-3 shrink-0" aria-hidden />
                              <span className="sr-only">Password protected</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Shared with */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground">
                          {item.sharedWith.length}{" "}
                          {item.sharedWith.length === 1 ? "recipient" : "recipients"}
                        </p>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground">{item.sharedWith[0]}</p>
                      </div>
                    </td>

                    {/* Shared */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-foreground">{formatSmartTime(item.sharedAt)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-top">
                      <ShareStatusBadge status={item.status} />
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-muted-foreground">{formatExpiryColumn(item)}</p>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm tabular-nums text-foreground">{item.accessCount}</span>
                    </td>

                    {/* Last active */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-foreground">
                        {item.lastAccessedAt ? formatSmartTime(item.lastAccessedAt) : "—"}
                      </p>
                    </td>

                    {/* Last viewer */}
                    <td className="min-w-[200px] px-4 py-4 align-top">
                      {item.lastAccessedBy ? (
                        <p className="truncate text-sm text-muted-foreground">{item.lastAccessedBy}</p>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-2 py-4 align-top text-right">
                      <div className="inline-flex justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px]">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() => {
                              const link = item.shareLink || `https://app.birdeye.com/shared/${item.id}`;
                              void navigator.clipboard
                                .writeText(link)
                                .then(() => toast.success("Link copied to clipboard"))
                                .catch(() => toast.error("Failed to copy link"));
                            }}
                          >
                            <Copy className="size-3.5 shrink-0" />
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() => onViewReport?.(item.reportName)}
                          >
                            <ExternalLink className="size-3.5 shrink-0" />
                            View report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() => {
                              onViewReport?.(item.reportName);
                              toast.info("Opening report editor — use Print from there");
                            }}
                          >
                            <Printer className="size-3.5 shrink-0" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() => {
                              setSharedItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? {
                                        ...i,
                                        status: "active" as ShareStatus,
                                        sharedAt: new Date().toISOString(),
                                        expiresAt: null,
                                      }
                                    : i,
                                ),
                              );
                              toast.success(`"${item.reportName}" reshared successfully`);
                            }}
                          >
                            <RotateCcw className="size-3.5 shrink-0" />
                            Reshare
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status === "revoked" ? (
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                              onClick={() => setConfirmDeleteId(item.id)}
                            >
                              <Trash2 className="size-3.5 shrink-0" />
                              Delete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                              onClick={() => {
                                setSharedItems((prev) =>
                                  prev.map((i) =>
                                    i.id === item.id ? { ...i, status: "revoked" as ShareStatus } : i,
                                  ),
                                );
                                toast.success(`Access revoked for "${item.reportName}"`);
                              }}
                            >
                              <Ban className="size-3.5 shrink-0" />
                              Revoke access
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDeleteId != null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shared report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{pendingDeleteReport?.reportName}&quot; from your shared reports. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId == null) return;
                setSharedItems((prev) => prev.filter((i) => i.id !== confirmDeleteId));
                toast.success(`"${pendingDeleteReport?.reportName}" deleted`);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}