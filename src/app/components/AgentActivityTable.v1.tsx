import { useState } from "react";
import {
  Search, SlidersHorizontal, ChevronRight,
  CheckCircle2, Clock, Zap, ArrowUpRight, XCircle, Pencil,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  type ActivityRow, type ActivityState, ACTIVITY_ROWS,
} from "./agentConfigData";

/* ─── State chip ─────────────────────────────────────────────────────── */
const STATE_CONFIG: Record<ActivityState, { label: string; icon: React.ElementType; cls: string }> = {
  "auto-sent":  { label: "Auto-sent",  icon: Zap,          cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  "queued":     { label: "Queued",     icon: Clock,        cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  "approved":   { label: "Approved",   icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  "edited":     { label: "Edited",     icon: Pencil,       cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" },
  "escalated":  { label: "Escalated",  icon: ArrowUpRight, cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  "rejected":   { label: "Rejected",   icon: XCircle,      cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

function StateChip({ state }: { state: ActivityState }) {
  const { label, icon: Icon, cls } = STATE_CONFIG[state];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border-0 px-2 py-0.5 text-[12px] font-medium", cls)}>
      <Icon className="size-2.5 shrink-0" />
      {label}
    </span>
  );
}

/* ─── Confidence bar ─────────────────────────────────────────────────── */
function ConfBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.85 ? "bg-emerald-500" :
    value >= 0.70 ? "bg-amber-400"   : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-[#eaeaea] dark:bg-[#2e3340]">
        <div className={cn("absolute inset-y-0 left-0 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-[11px] tabular-nums font-medium", value === 0 ? "text-[#999]" : value >= 0.85 ? "text-emerald-600 dark:text-emerald-400" : value >= 0.70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
        {value === 0 ? "—" : value.toFixed(2)}
      </span>
    </div>
  );
}

/* ─── Star rating ────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[12px] tracking-[-1px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-[#ddd] dark:text-[#444]"}>★</span>
      ))}
    </span>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ initials, hue, size = 28 }: { initials: string; hue: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: hue }}
    >
      {initials}
    </div>
  );
}

/* ─── Filter pills ───────────────────────────────────────────────────── */
const FILTERS: { label: string; value: ActivityState | "all" }[] = [
  { label: "All",         value: "all" },
  { label: "Queued",      value: "queued" },
  { label: "Auto-sent",   value: "auto-sent" },
  { label: "Escalated",   value: "escalated" },
  { label: "Approved",    value: "approved" },
];

/* ─── Main component ─────────────────────────────────────────────────── */
export interface AgentActivityTableProps {
  rows?: ActivityRow[];
  onRowClick?: (row: ActivityRow) => void;
  selectedId?: string | null;
}

export function AgentActivityTable({
  rows = ACTIVITY_ROWS,
  onRowClick,
  selectedId = null,
}: AgentActivityTableProps) {
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<ActivityState | "all">("all");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = rows.filter((r) => {
    const matchFilter = filter === "all" || r.state === filter;
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#eaeaea] dark:border-[#2e3340] px-5 py-2.5">
        {showSearch ? (
          <div className="flex flex-1 items-center gap-2 rounded-md border border-[#e0e4ea] dark:border-[#333a47] bg-white dark:bg-[#1e2229] px-3 py-1.5">
            <Search className="size-3.5 shrink-0 text-[#999]" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, ID, location…"
              className="flex-1 bg-transparent text-[13px] text-[#212121] dark:text-[#e4e4e4] placeholder:text-[#bbb] dark:placeholder:text-[#555] outline-none"
            />
            <button
              type="button"
              onClick={() => { setSearch(""); setShowSearch(false); }}
              className="cursor-pointer text-[#999] hover:text-[#555] dark:hover:text-[#ccc]"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-1 items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                    filter === f.value
                      ? "bg-[#2552ED] text-white"
                      : "text-[#555] dark:text-[#8b92a5] hover:bg-[#f0f1f5] dark:hover:bg-[#2e3340]",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowSearch(true)}
                aria-label="Search"
              >
                <Search className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Filter">
                <SlidersHorizontal className="size-3.5" />
              </Button>
            </div>
          </>
        )}
        <span className="shrink-0 text-[11px] text-[#999] dark:text-[#6b7280] tabular-nums">
          {filtered.length.toLocaleString()} actions
        </span>
      </div>

      {/* Table header */}
      <div className="grid shrink-0 grid-cols-[120px_1fr_110px_1fr_90px_110px_28px] gap-2 border-b border-[#eaeaea] dark:border-[#2e3340] bg-[#fafafa] dark:bg-[#1a1d23] px-5 py-2">
        {["WHEN", "CUSTOMER", "SOURCE", "DRAFT", "CONF.", "STATUS", ""].map((h) => (
          <span key={h} className="text-[length:var(--table-label-size)] font-semibold uppercase tracking-wide text-[#999] dark:text-[#6b7280]">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-[#999] dark:text-[#6b7280]">
            <Search className="size-8 opacity-30" />
            <span className="text-[13px]">No actions match this filter</span>
          </div>
        ) : (
          filtered.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onRowClick?.(row)}
              className={cn(
                "grid w-full grid-cols-[120px_1fr_110px_1fr_90px_110px_28px] gap-2 px-5 py-3 text-left transition-colors duration-100",
                "border-b border-[#f0f1f5] dark:border-[#1e2229]",
                selectedId === row.id
                  ? "bg-[#f0f4ff] dark:bg-[#1e2a4a]"
                  : "hover:bg-[#fafafa] dark:hover:bg-[#1a1d23]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2552ED]/40 focus-visible:ring-inset",
              )}
            >
              {/* When + ID */}
              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                <span className="text-[12px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{row.when}</span>
                <span className="font-mono text-[10px] text-[#999] dark:text-[#6b7280]">#{row.id}</span>
              </div>

              {/* Customer */}
              <div className="flex min-w-0 items-center gap-2">
                <Avatar initials={row.initials} hue={row.hue} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{row.name}</p>
                  <p className="truncate text-[11px] text-[#999] dark:text-[#6b7280]">{row.location}</p>
                </div>
              </div>

              {/* Source + rating */}
              <div className="flex flex-col justify-center gap-0.5">
                <span className="text-[12px] text-[#555] dark:text-[#9ba2b0]">{row.source}</span>
                <Stars rating={row.rating} />
              </div>

              {/* Draft */}
              <div className="flex min-w-0 items-center">
                {row.draft ? (
                  <p className="line-clamp-2 text-[12px] leading-snug text-[#666] dark:text-[#9ba2b0]">
                    "{row.draft}"
                  </p>
                ) : (
                  <span className="text-[12px] italic text-[#bbb] dark:text-[#555]">No draft — escalated</span>
                )}
              </div>

              {/* Confidence */}
              <div className="flex items-center">
                <ConfBar value={row.conf} />
              </div>

              {/* State */}
              <div className="flex items-center">
                <StateChip state={row.state} />
              </div>

              {/* Chevron */}
              <div className="flex items-center justify-center">
                <ChevronRight className="size-3.5 text-[#ccc] dark:text-[#444]" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
