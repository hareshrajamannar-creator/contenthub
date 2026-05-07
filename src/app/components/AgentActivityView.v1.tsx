import { useState } from "react";
import { PauseCircle, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { AgentActivityTable } from "@/app/components/AgentActivityTable";
import { AgentTraceDrawer } from "@/app/components/AgentTraceDrawer";
import { ACTIVITY_ROWS, type ActivityRow } from "@/app/components/agentConfigData";
import type { AppView } from "@/app/App";

/* ─── Sparkline ──────────────────────────────────────────────────────── */
function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => max === min ? 10 : 20 - ((v - min) / (max - min)) * 18;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 120},${norm(v)}`).join(" ");
  return (
    <svg width="120" height="20" className="opacity-50">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts} className="text-[#2552ED]" />
    </svg>
  );
}

const METRICS = [
  { label: "Actions (7d)",  value: "1,284", delta: "+4%",  up: true  as const, spark: [20,32,28,45,38,55,49] },
  { label: "Auto-send",     value: "73%",   delta: "+2%",  up: true  as const, spark: [60,65,68,70,72,73,73] },
  { label: "Approval rate", value: "94%",   delta: "+1%",  up: true  as const, spark: [90,91,93,92,94,94,94] },
  { label: "Edit rate",     value: "18%",   delta: "–",    up: null,           spark: [20,19,18,18,17,18,18] },
  { label: "Avg. conf.",    value: "0.87",  delta: "→",    up: null,           spark: [85,86,87,87,88,87,87] },
  { label: "Escalations",   value: "5",     delta: "–1",   up: false as const, spark: [8,7,6,6,5,5,5] },
];

export interface AgentActivityViewProps {
  onConfigure?: () => void;
}

export function AgentActivityView({ onConfigure }: AgentActivityViewProps) {
  const [selectedRow, setSelectedRow] = useState<ActivityRow | null>(null);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [autonomy,    setAutonomy]    = useState<"manual" | "hybrid" | "auto">("hybrid");

  return (
    <div className="flex flex-col min-h-0 overflow-hidden flex-1">
      {/* Agent header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-6 py-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
            <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#212121] dark:text-[#e4e4e4]">Review Response Agent</p>
            <p className="text-[11px] text-[#999] dark:text-[#6b7280]">Automatically drafts and sends review replies across all channels</p>
          </div>
          <span className="ml-2 rounded-md border-0 bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            ● Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#eaeaea] dark:border-[#333a47] bg-[#fafafa] dark:bg-[#1a1d23] p-0.5">
            {(["manual", "hybrid", "auto"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAutonomy(m)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
                  autonomy === m
                    ? "bg-white dark:bg-[#262b35] text-[#212121] dark:text-[#e4e4e4] shadow-sm"
                    : "text-[#666] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e4e4]",
                )}
              >
                {m === "manual" ? "Human in loop" : m === "hybrid" ? "Hybrid" : "Full auto"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <PauseCircle className="size-3.5" /> Pause
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onConfigure}>
            <Settings2 className="size-3.5" /> Configure
          </Button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid shrink-0 grid-cols-6 divide-x divide-[#f0f1f5] dark:divide-[#1e2229] border-b border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] transition-colors">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col gap-1 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999] dark:text-[#6b7280]">{m.label}</p>
            <div className="flex items-end justify-between gap-2">
              <p className="text-[20px] font-semibold tabular-nums text-[#212121] dark:text-[#e4e4e4]">{m.value}</p>
              <Sparkline data={m.spark} />
            </div>
            <p className={cn("text-[11px] font-medium", m.up === true ? "text-emerald-600" : m.up === false ? "text-red-500" : "text-[#999]")}>
              {m.up === true && "↑"}{m.up === false && "↓"} {m.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Activity table */}
      <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f6f8] dark:bg-[#13161b] transition-colors">
        <AgentActivityTable
          rows={ACTIVITY_ROWS}
          selectedId={selectedRow?.id ?? null}
          onRowClick={(row) => { setSelectedRow(row); setDrawerOpen(true); }}
        />
      </div>

      {/* Trace drawer */}
      <AgentTraceDrawer
        activity={selectedRow}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
