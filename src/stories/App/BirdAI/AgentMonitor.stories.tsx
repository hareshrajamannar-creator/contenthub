import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AgentActivityTable } from "@/app/components/AgentActivityTable";
import { AgentTraceDrawer } from "@/app/components/AgentTraceDrawer";
import { APP_MAIN_CONTENT_SHELL_CLASS, APP_SHELL_GUTTER_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
import {
  Sparkles, PauseCircle, Settings2, Zap, TrendingUp, CheckCircle2, Pencil, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { ACTIVITY_ROWS, type ActivityRow } from "@/app/components/agentConfigData";

/* ─── Agent header + metrics strip ───────────────────────────────────── */
const METRICS = [
  { label: "Actions (7d)", value: "1,284", delta: "+4%", up: true,  spark: [20,32,28,45,38,55,49] },
  { label: "Auto-send",    value: "73%",   delta: "+2%", up: true,  spark: [60,65,68,70,72,73,73] },
  { label: "Approval",     value: "94%",   delta: "+1%", up: true,  spark: [90,91,93,92,94,94,94] },
  { label: "Edit rate",    value: "18%",   delta: "–",   up: null,  spark: [20,19,18,18,17,18,18] },
  { label: "Avg. conf.",   value: "0.87",  delta: "→",   up: null,  spark: [85,86,87,87,88,87,87] },
  { label: "Escalations",  value: "5",     delta: "–1",  up: false, spark: [8,7,6,6,5,5,5] },
];

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => max === min ? 10 : 20 - ((v - min) / (max - min)) * 18;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 120},${norm(v)}`).join(" ");
  return (
    <svg width="120" height="20" className="opacity-60">
      <polyline fill="none" stroke="#2552ED" strokeWidth="1.5" points={pts} />
    </svg>
  );
}

function AgentMonitorShell() {
  const [selectedRow, setSelectedRow]   = useState<ActivityRow | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [autonomy, setAutonomy]         = useState<"manual"|"hybrid"|"auto">("hybrid");

  const handleRowClick = (row: ActivityRow) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  return (
    <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
      <div className={`${APP_MAIN_CONTENT_SHELL_CLASS} flex flex-col`}>

        {/* Agent header strip */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-6 py-3">
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
              {(["manual","hybrid","auto"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAutonomy(m)}
                  className={cn("cursor-pointer rounded-md px-3 py-1.5 text-[11px] font-medium capitalize transition-colors", autonomy === m ? "bg-white dark:bg-[#262b35] text-[#212121] dark:text-[#e4e4e4] shadow-sm" : "text-[#666] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e4e4]")}
                >
                  {m === "manual" ? "Human in loop" : m === "hybrid" ? "Hybrid" : "Full auto"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5"><PauseCircle className="size-3.5" />Pause</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Settings2 className="size-3.5" />Configure</Button>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid shrink-0 grid-cols-6 divide-x divide-[#f0f1f5] dark:divide-[#1e2229] border-b border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229]">
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
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f6f8] dark:bg-[#13161b]">
          <AgentActivityTable
            rows={ACTIVITY_ROWS}
            selectedId={selectedRow?.id ?? null}
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* Trace drawer */}
      <AgentTraceDrawer
        activity={selectedRow}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onApprove={(id) => console.log("Approved", id)}
        onEscalate={(id) => console.log("Escalated", id)}
        onReject={(id) => console.log("Rejected", id)}
      />
    </div>
  );
}

/* ─── Storybook meta ─────────────────────────────────────────────────── */
const meta: Meta = {
  title: "App/BirdAI/AgentMonitor",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "Agent Monitor — Activity table + Trace drawer",
  render: () => <AgentMonitorShell />,
};

export const TraceDrawerOpen: Story = {
  name: "Trace drawer — Queued (open by default)",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
        <div className={`${APP_MAIN_CONTENT_SHELL_CLASS} flex flex-col`}>
          <AgentActivityTable rows={ACTIVITY_ROWS} selectedId="A4829" onRowClick={() => {}} />
        </div>
        <AgentTraceDrawer
          activity={ACTIVITY_ROWS[0]}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    );
  },
};

export const TraceDrawerEscalated: Story = {
  name: "Trace drawer — Escalated (hard rule triggered)",
  render: () => {
    const [open, setOpen] = useState(true);
    const escalated = ACTIVITY_ROWS.find((r) => r.state === "escalated" && r.conf === 0)!;
    return (
      <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
        <div className={`${APP_MAIN_CONTENT_SHELL_CLASS} flex flex-col`}>
          <AgentActivityTable rows={ACTIVITY_ROWS} selectedId={escalated.id} onRowClick={() => {}} />
        </div>
        <AgentTraceDrawer activity={escalated} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
