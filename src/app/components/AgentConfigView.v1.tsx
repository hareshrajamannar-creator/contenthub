import { useEffect, useRef, useState } from "react";
import {
  Mic2, ShieldCheck, Sliders, Database, MapPin,
  Puzzle, Users, FlaskConical, LayoutGrid,
  CheckCircle2, AlertTriangle, Zap, ToggleLeft,
  ChevronRight, Plus, MoreHorizontal, Sparkles,
  ExternalLink, Check, X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/app/components/ui/utils";
import {
  TONE_AXES, DO_DONTS, TRAINING_ROWS, POLICY_RULES, AUTONOMY_BUCKETS,
  KNOWLEDGE_SOURCES, INTEGRATIONS, LOCATION_ROWS, TEAM_MEMBERS, TEST_FIXTURES,
  type ToneAxis, type PolicyRule, type TestFixture,
} from "./agentConfigData";

/* ─── Shared section wrapper ─────────────────────────────────────────── */
function SectionWrap({
  id, title, desc, action, children,
}: {
  id: string; title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div id={id} data-section={id} className="scroll-mt-4 py-8 first:pt-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#212121] dark:text-[#e4e4e4]">{title}</h2>
          {desc && <p className="mt-0.5 text-[13px] text-[#666] dark:text-[#9ba2b0]">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">{children}</p>;
}

/* ─── Section: Overview ──────────────────────────────────────────────── */
function SecOverview() {
  const cards = [
    { icon: Mic2,       label: "Brand Voice",     value: "Warm · Concise",  sub: "4 axes configured · 4 examples" },
    { icon: Sliders,    label: "Autonomy",         value: "Hybrid · 0.80",   sub: "73% auto-send · 22% queue · 5% escalate" },
    { icon: ShieldCheck,label: "Policies",         value: "8 active rules",  sub: "3 hard · 3 soft · 2 escalation" },
    { icon: Database,   label: "Knowledge",        value: "6 sources",       sub: "3,540 chunks · 2,945 retrievals" },
    { icon: MapPin,     label: "Scope",            value: "4 locations",     sub: "2 with custom overrides" },
    { icon: Users,      label: "Team",             value: "5 members",       sub: "2 admins · 2 editors · 1 viewer" },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ icon: Icon, label, value, sub }) => (
        <button
          key={label}
          type="button"
          className="flex cursor-pointer flex-col gap-3 rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-4 text-left transition-colors hover:border-[#2552ED]/40 hover:bg-[#f8f9ff] dark:hover:bg-[#1e2a4a]"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#f0f4ff] dark:bg-[#1e2a4a]">
            <Icon className="size-4 text-[#2552ED]" />
          </div>
          <div>
            <p className="text-[12px] text-[#999] dark:text-[#6b7280]">{label}</p>
            <p className="text-[14px] font-semibold text-[#212121] dark:text-[#e4e4e4]">{value}</p>
            <p className="mt-0.5 text-[11px] text-[#999] dark:text-[#6b7280]">{sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Section: Brand Voice ───────────────────────────────────────────── */
function ToneSlider({ axis, onChange }: { axis: ToneAxis; onChange: (id: string, v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 shrink-0 text-right text-[12px] text-[#555] dark:text-[#9ba2b0]">{axis.left}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={0} max={100}
          value={axis.value}
          onChange={(e) => onChange(axis.id, Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#e0e4ea] dark:bg-[#2e3340] accent-[#2552ED] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2552ED] [&::-webkit-slider-thumb]:shadow-sm"
        />
        <div
          className="pointer-events-none absolute top-0 h-1 rounded-l-full bg-[#2552ED]"
          style={{ width: `${axis.value}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-[12px] text-[#555] dark:text-[#9ba2b0]">{axis.right}</span>
      <span className="w-8 shrink-0 text-right font-mono text-[11px] text-[#999]">{axis.value}</span>
    </div>
  );
}

function SecVoice() {
  const [axes, setAxes] = useState(TONE_AXES);
  const handleChange = (id: string, v: number) =>
    setAxes((prev) => prev.map((a) => (a.id === id ? { ...a, value: v } : a)));

  return (
    <div className="flex flex-col gap-8">
      {/* Tone sliders */}
      <div>
        <SectionLabel>Tone axes</SectionLabel>
        <div className="flex flex-col gap-4 rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-5 py-4">
          {axes.map((a) => <ToneSlider key={a.id} axis={a} onChange={handleChange} />)}
        </div>
      </div>

      {/* Do / Don't */}
      <div>
        <SectionLabel>Examples — Do / Don't</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {DO_DONTS.map((ex, i) => (
            <div key={i} className={cn("rounded-xl border p-4", ex.kind === "do" ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800")}>
              <div className="mb-2 flex items-center gap-1.5">
                {ex.kind === "do"
                  ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  : <X     className="size-3.5 text-red-600 dark:text-red-400" />
                }
                <span className={cn("text-[10px] font-bold uppercase tracking-wide", ex.kind === "do" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
                  {ex.kind === "do" ? "Do this" : "Not this"}
                </span>
              </div>
              <p className="mb-2 text-[11px] italic text-[#666] dark:text-[#9ba2b0]">Scenario: {ex.scenario}</p>
              <p className="text-[12px] leading-snug text-[#333] dark:text-[#ccc]">"{ex.response}"</p>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5"><Plus className="size-3.5" /> Add example</Button>
      </div>

      {/* Scenario playbook */}
      <div>
        <SectionLabel>Scenario playbook</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-[#eaeaea] dark:border-[#2e3340]">
          <table className="w-full">
            <thead className="bg-[#fafafa] dark:bg-[#1a1d23]">
              <tr>
                {["Scenario","How to respond","Matches","Last edited"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[length:var(--table-label-size)] font-semibold uppercase tracking-wide text-[#999]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f5] dark:divide-[#1e2229]">
              {TRAINING_ROWS.map((r) => (
                <tr key={r.id} className="bg-white dark:bg-[#1e2229] hover:bg-[#fafafa] dark:hover:bg-[#1a1d23] transition-colors">
                  <td className="px-4 py-3 text-[12px] font-medium text-[#212121] dark:text-[#e4e4e4]">{r.scenario}</td>
                  <td className="px-4 py-3 text-[12px] text-[#555] dark:text-[#9ba2b0]">{r.response}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#555] dark:text-[#9ba2b0]">{r.matches}</td>
                  <td className="px-4 py-3 text-[11px] text-[#999] dark:text-[#6b7280]">{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voice guide */}
      <div>
        <SectionLabel>Voice guide (free-form)</SectionLabel>
        <Textarea
          rows={4}
          defaultValue="Write in first-person plural (we/our). Always acknowledge the reviewer's experience before offering a solution. Keep replies under 100 words unless the situation requires more detail. Sign off with a warm, human closing."
          className="text-[13px]"
        />
      </div>
    </div>
  );
}

/* ─── Section: Policies ──────────────────────────────────────────────── */
const KIND_BADGE: Record<PolicyRule["kind"], { label: string; cls: string }> = {
  hard:      { label: "Hard",      cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
  soft:      { label: "Soft",      cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  escalation:{ label: "Escalation",cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" },
};

function RuleCard({ rule, onToggle }: { rule: PolicyRule; onToggle: (id: string) => void }) {
  const badge = KIND_BADGE[rule.kind];
  return (
    <div className={cn("flex gap-4 rounded-xl border p-4 transition-all", rule.active ? "border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229]" : "border-dashed border-[#e0e4ea] dark:border-[#2e3340] bg-[#fafafa] dark:bg-[#1a1d23] opacity-60")}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("rounded-md border-0 px-2 py-0.5 text-[12px] font-medium", badge.cls)}>{badge.label}</span>
          <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{rule.title}</span>
        </div>
        <p className="text-[12px] leading-snug text-[#666] dark:text-[#9ba2b0] mb-2">{rule.desc}</p>
        <code className="rounded bg-[#f5f6f8] dark:bg-[#13161b] px-2 py-0.5 font-mono text-[10px] text-[#555] dark:text-[#9ba2b0]">{rule.trigger}</code>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => onToggle(rule.id)}
          aria-label={rule.active ? "Disable rule" : "Enable rule"}
          className={cn("relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors", rule.active ? "bg-[#2552ED]" : "bg-[#ddd] dark:bg-[#444]")}
        >
          <span className={cn("inline-block size-4 translate-x-0.5 transform rounded-full bg-white shadow-sm transition-transform", rule.active && "translate-x-4")} />
        </button>
        <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button>
      </div>
    </div>
  );
}

function SecPolicies() {
  const [rules, setRules] = useState(POLICY_RULES);
  const toggle = (id: string) => setRules((rs) => rs.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  const groups = ["hard", "soft", "escalation"] as const;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((kind) => {
        const kindRules = rules.filter((r) => r.kind === kind);
        const badge = KIND_BADGE[kind];
        return (
          <div key={kind}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("rounded-md border-0 px-2 py-0.5 text-[12px] font-semibold", badge.cls)}>{badge.label} rules</span>
              <span className="font-mono text-[11px] text-[#999]">{kindRules.filter(r=>r.active).length} active</span>
            </div>
            <div className="flex flex-col gap-2">
              {kindRules.map((r) => <RuleCard key={r.id} rule={r} onToggle={toggle} />)}
            </div>
          </div>
        );
      })}
      <Button variant="outline" size="sm" className="self-start gap-1.5"><Plus className="size-3.5" /> Add rule</Button>
    </div>
  );
}

/* ─── Section: Autonomy ──────────────────────────────────────────────── */
function SecAutonomy() {
  const [floor, setFloor] = useState(80);
  const bucketColors = ["bg-emerald-500", "bg-amber-400", "bg-red-400"] as const;

  return (
    <div className="flex flex-col gap-8">
      {/* Visual confidence scale */}
      <div>
        <SectionLabel>Confidence floor — {(floor / 100).toFixed(2)}</SectionLabel>
        <div className="rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-6 py-5">
          {/* Gradient bar */}
          <div className="relative mb-3 h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #ef4444 0%, #f59e0b 30%, #10b981 70%)" }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-white border-2 border-[#2552ED] shadow-md cursor-pointer"
              style={{ left: `calc(${floor}% - 10px)` }}
            />
          </div>
          <input
            type="range" min={60} max={100} value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-transparent h-1 accent-[#2552ED]"
          />
          <div className="mt-2 flex justify-between text-[10px] font-mono text-[#999]">
            <span>0.60 — Escalate</span>
            <span className="font-bold text-[#2552ED]">{(floor / 100).toFixed(2)} — Floor</span>
            <span>1.00 — Auto-send</span>
          </div>
        </div>
      </div>

      {/* Buckets */}
      <div>
        <SectionLabel>Confidence buckets</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {AUTONOMY_BUCKETS.map((b, i) => (
            <div key={b.level} className="rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-4">
              <div className={cn("mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white", bucketColors[i])}>
                {b.level === "auto" && <Zap className="size-3" />}
                {b.level === "review" && <AlertTriangle className="size-3" />}
                {b.level === "escalate" && <ChevronRight className="size-3" />}
                {b.label}
              </div>
              <p className="mb-1 font-mono text-[13px] font-semibold text-[#212121] dark:text-[#e4e4e4]">{b.pct}</p>
              <p className="mb-2 text-[11px] text-[#999] dark:text-[#6b7280]">Threshold: {b.threshold}</p>
              <p className="text-[11px] leading-snug text-[#666] dark:text-[#9ba2b0]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Routing settings */}
      <div>
        <SectionLabel>Routing settings</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#444] dark:text-[#9ba2b0]">Review queue routes to</label>
            <Select defaultValue="inbox">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Birdeye Inbox</SelectItem>
                <SelectItem value="slack">Slack channel</SelectItem>
                <SelectItem value="email">Email digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#444] dark:text-[#9ba2b0]">SLA for human review</label>
            <Select defaultValue="4h">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="4h">4 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="none">No SLA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Knowledge ─────────────────────────────────────────────── */
const KN_TYPE_COLORS: Record<string, string> = {
  document: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  faq:      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  url:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  crm:      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  product:  "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

function SecKnowledge() {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#eaeaea] dark:border-[#2e3340]">
        <table className="w-full">
          <thead className="bg-[#fafafa] dark:bg-[#1a1d23]">
            <tr>
              {["Source","Type","Size","Retrievals","Last refreshed",""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[length:var(--table-label-size)] font-semibold uppercase tracking-wide text-[#999]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f1f5] dark:divide-[#1e2229]">
            {KNOWLEDGE_SOURCES.map((src) => (
              <tr key={src.id} className="bg-white dark:bg-[#1e2229] hover:bg-[#fafafa] dark:hover:bg-[#1a1d23] transition-colors">
                <td className="px-4 py-3 text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{src.name}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", KN_TYPE_COLORS[src.type])}>{src.type}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#555] dark:text-[#9ba2b0]">{src.items}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#555] dark:text-[#9ba2b0]">{src.used.toLocaleString()}</td>
                <td className="px-4 py-3 text-[11px] text-[#999] dark:text-[#6b7280]">{src.last}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" className="size-6"><MoreHorizontal className="size-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" className="mt-3 gap-1.5"><Plus className="size-3.5" /> Add source</Button>
    </div>
  );
}

/* ─── Section: Locations ─────────────────────────────────────────────── */
function SecLocations() {
  const [rows, setRows] = useState(LOCATION_ROWS);
  return (
    <div className="overflow-hidden rounded-xl border border-[#eaeaea] dark:border-[#2e3340]">
      <table className="w-full">
        <thead className="bg-[#fafafa] dark:bg-[#1a1d23]">
          <tr>
            {["Location","Autonomy","Floor","Always escalate",""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[length:var(--table-label-size)] font-semibold uppercase tracking-wide text-[#999]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f1f5] dark:divide-[#1e2229]">
          {rows.map((loc) => (
            <tr key={loc.id} className={cn("transition-colors", loc.override ? "bg-[#f0f4ff] dark:bg-[#1e2a4a]" : "bg-white dark:bg-[#1e2229] hover:bg-[#fafafa] dark:hover:bg-[#1a1d23]")}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {loc.override && <span className="size-1.5 shrink-0 rounded-full bg-[#2552ED]" />}
                  <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{loc.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#555] dark:text-[#9ba2b0]">{loc.autonomy}</td>
              <td className="px-4 py-3 font-mono text-[12px] text-[#555] dark:text-[#9ba2b0]">{loc.floor}</td>
              <td className="px-4 py-3 text-[12px] text-[#555] dark:text-[#9ba2b0]">{loc.escalate}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Section: Integrations ──────────────────────────────────────────── */
const STATE_STYLE: Record<string, string> = {
  connected: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  issue:     "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  available: "bg-muted/60 text-muted-foreground dark:bg-muted/30",
};

function SecIntegrations() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {INTEGRATIONS.map((ig) => (
        <div key={ig.id} className="flex flex-col gap-3 rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-4">
          <div className="flex items-start justify-between">
            <div className="flex size-9 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: ig.color }}>
              {ig.abbr}
            </div>
            <span className={cn("rounded-md border-0 px-2 py-0.5 text-[12px] font-medium capitalize", STATE_STYLE[ig.state])}>
              {ig.state === "connected" && <CheckCircle2 className="mr-0.5 inline size-2.5" />}
              {ig.state === "issue" && <AlertTriangle className="mr-0.5 inline size-2.5" />}
              {ig.state}
            </span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#212121] dark:text-[#e4e4e4]">{ig.name}</p>
            <p className="text-[11px] text-[#999] dark:text-[#6b7280]">{ig.desc}</p>
          </div>
          {ig.state === "available" && (
            <Button variant="outline" size="sm" className="gap-1.5"><ExternalLink className="size-3" /> Connect</Button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Section: Team ──────────────────────────────────────────────────── */
const PERM_STYLE: Record<string, string> = {
  admin: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  edit:  "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  view:  "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
};
const PERM_LABEL: Record<string, string> = { admin:"Admin", edit:"Can edit & approve", view:"View only" };

function SecTeam() {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#eaeaea] dark:border-[#2e3340]">
        <table className="w-full">
          <thead className="bg-[#fafafa] dark:bg-[#1a1d23]">
            <tr>
              {["Member","Role","Permission","Approvals / wk",""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[length:var(--table-label-size)] font-semibold uppercase tracking-wide text-[#999]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f1f5] dark:divide-[#1e2229]">
            {TEAM_MEMBERS.map((m) => (
              <tr key={m.id} className="bg-white dark:bg-[#1e2229] hover:bg-[#fafafa] dark:hover:bg-[#1a1d23] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: m.hue }}>{m.initials}</div>
                    <div>
                      <p className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{m.name}</p>
                      <p className="text-[11px] text-[#999]">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#555] dark:text-[#9ba2b0]">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-md border-0 px-2 py-0.5 text-[12px] font-medium", PERM_STYLE[m.perm])}>{PERM_LABEL[m.perm]}</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#555] dark:text-[#9ba2b0]">{m.approvals > 0 ? m.approvals : "—"}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" className="size-6"><MoreHorizontal className="size-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" className="mt-3 gap-1.5"><Plus className="size-3.5" /> Invite member</Button>
    </div>
  );
}

/* ─── Section: Sandbox ───────────────────────────────────────────────── */
function FixtureItem({ fixture, active, onSelect }: { fixture: TestFixture; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn("w-full rounded-xl border p-3 text-left transition-colors cursor-pointer", active ? "border-[#2552ED] bg-[#f0f4ff] dark:bg-[#1e2a4a]" : "border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] hover:border-[#2552ED]/40")}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[12px] tracking-[-1px]">{Array.from({length:5},(_,i)=><span key={i} className={i<fixture.rating?"text-amber-400":"text-[#ddd] dark:text-[#444]"}>★</span>)}</span>
        <span className="text-[11px] text-[#999]">{fixture.source}</span>
        <span className="text-[11px] text-[#999]">·</span>
        <span className="text-[11px] text-[#999]">{fixture.who}</span>
      </div>
      <p className="line-clamp-2 text-[12px] leading-snug text-[#444] dark:text-[#9ba2b0]">{fixture.text}</p>
    </button>
  );
}

function SecSandbox() {
  const [active, setActive] = useState(0);
  const fixture = TEST_FIXTURES[active];
  const conf = fixture.confidence ?? 0;
  const confColor = conf >= 0.85 ? "text-emerald-600 dark:text-emerald-400" : conf >= 0.70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <div className="grid grid-cols-2 gap-5 min-h-0">
      {/* Fixture list */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Test fixtures</SectionLabel>
        {TEST_FIXTURES.map((f, i) => (
          <FixtureItem key={f.id} fixture={f} active={i === active} onSelect={() => setActive(i)} />
        ))}
      </div>

      {/* Agent output */}
      <div className="flex flex-col gap-3">
        <SectionLabel>Agent output</SectionLabel>
        <div className="flex-1 rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-4">
          {/* Confidence */}
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-3.5 text-violet-500" />
            <span className="text-[11px] text-[#666] dark:text-[#9ba2b0]">BirdAI ·</span>
            <span className={cn("text-[11px] font-semibold tabular-nums", confColor)}>
              {conf > 0 ? `confidence ${conf.toFixed(2)}` : "Escalated — no draft"}
            </span>
          </div>
          {/* Preview text */}
          {conf > 0 ? (
            <p className="mb-4 whitespace-pre-wrap text-[13px] leading-relaxed text-[#333] dark:text-[#ccc]">
              {fixture.text.slice(0, 40).split(" ").slice(0, 3).join(" ")}… — Here is a sample AI response that would be generated for this fixture based on your current voice and policy settings. It would incorporate the tone sliders, do/don't examples, and relevant knowledge chunks to craft a contextually appropriate reply.
            </p>
          ) : (
            <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-[12px] text-red-700 dark:text-red-400">
              Hard rule triggered — escalated to human agent.
            </div>
          )}
          {/* Trace */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#999]">Trace</p>
            <div className="flex flex-col gap-1">
              {fixture.traces.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#555] dark:text-[#9ba2b0]">
                  <span className="text-[#bbb]">→</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Config nav ─────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  { id:"overview",     label:"Overview",          icon:LayoutGrid,   group:"Setup"  },
  { id:"voice",        label:"Brand voice",        icon:Mic2,         group:"Setup"  },
  { id:"policies",     label:"Policies & rules",   icon:ShieldCheck,  group:"Setup"  },
  { id:"autonomy",     label:"Autonomy & routing", icon:Sliders,      group:"Setup"  },
  { id:"knowledge",    label:"Knowledge sources",  icon:Database,     group:"Setup"  },
  { id:"locations",    label:"Location overrides", icon:MapPin,       group:"Scope"  },
  { id:"integrations", label:"Integrations",       icon:Puzzle,       group:"Scope"  },
  { id:"team",         label:"Team & permissions", icon:Users,        group:"Scope"  },
  { id:"sandbox",      label:"Testing sandbox",    icon:FlaskConical, group:"Launch" },
] as const;

type SectionId = typeof NAV_SECTIONS[number]["id"];

/* ─── Main export ─────────────────────────────────────────────────────── */
export function AgentConfigView() {
  const [active, setActive] = useState<SectionId>("overview");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const scrollTo = (id: SectionId) => {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scrollspy
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.getAttribute("data-section") as SectionId ?? "overview");
      },
      { root: container, threshold: 0.2 },
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const groups = ["Setup", "Scope", "Launch"] as const;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f5f6f8] dark:bg-[#13161b] transition-colors duration-300">
      {/* Left ConfigNav */}
      <nav className="flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-3 py-4">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">{group}</p>
            {NAV_SECTIONS.filter((s) => s.group === group).map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                    isActive
                      ? "bg-[#f0f4ff] dark:bg-[#1e2a4a] text-[#2552ED] font-medium"
                      : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#f5f6f8] dark:hover:bg-[#1a1d23]",
                  )}
                >
                  <s.icon className="size-3.5 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Content */}
      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-8 pb-16">
        {/* Agent header */}
        <div className="sticky top-0 z-10 -mx-8 mb-2 flex items-center justify-between border-b border-[#eaeaea] dark:border-[#2e3340] bg-[#f5f6f8] dark:bg-[#13161b] px-8 py-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#f0f4ff] dark:bg-[#1e2a4a]">
              <Sparkles className="size-4 text-[#2552ED]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#212121] dark:text-[#e4e4e4]">Review Response Agent</p>
              <p className="text-[11px] text-[#999] dark:text-[#6b7280]">Configuration · All locations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
          </div>
        </div>

        {/* Sections */}
        <div ref={(el) => { sectionRefs.current.overview = el; }}>
          <SectionWrap id="overview" title="Overview" desc="Summary of your agent's current configuration.">
            <SecOverview />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.voice = el; }}>
          <SectionWrap id="voice" title="Brand Voice" desc="Control how the agent communicates — tone, phrasing, and style."
            action={<Button variant="outline" size="sm">Preview voice</Button>}>
            <SecVoice />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.policies = el; }}>
          <SectionWrap id="policies" title="Policies & Rules" desc="Define hard constraints, soft preferences, and escalation triggers.">
            <SecPolicies />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.autonomy = el; }}>
          <SectionWrap id="autonomy" title="Autonomy & Routing" desc="Set the confidence floor that controls when the agent acts vs. defers.">
            <SecAutonomy />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.knowledge = el; }}>
          <SectionWrap id="knowledge" title="Knowledge Sources" desc="Documents and live feeds the agent references when crafting replies."
            action={<Button variant="outline" size="sm" className="gap-1.5"><Plus className="size-3.5" />Add source</Button>}>
            <SecKnowledge />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.locations = el; }}>
          <SectionWrap id="locations" title="Location Overrides" desc="Per-location autonomy levels that override the global setting.">
            <SecLocations />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.integrations = el; }}>
          <SectionWrap id="integrations" title="Integrations" desc="Connect your CRM, helpdesk, and review platforms.">
            <SecIntegrations />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.team = el; }}>
          <SectionWrap id="team" title="Team & Permissions" desc="Who can edit, approve, and monitor this agent."
            action={<Button variant="outline" size="sm" className="gap-1.5"><Plus className="size-3.5" />Invite</Button>}>
            <SecTeam />
          </SectionWrap>
        </div>
        <Separator />
        <div ref={(el) => { sectionRefs.current.sandbox = el; }}>
          <SectionWrap id="sandbox" title="Testing Sandbox" desc="Preview how the agent responds to real review fixtures before going live.">
            <SecSandbox />
          </SectionWrap>
        </div>
      </div>
    </div>
  );
}
