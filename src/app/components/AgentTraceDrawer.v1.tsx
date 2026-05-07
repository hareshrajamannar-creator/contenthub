import { useState } from "react";
import {
  CheckCircle2, AlertTriangle, Sparkles, Settings2,
  RotateCcw, ArrowUpRight, XCircle, Pencil,
  ChevronRight, BookOpen,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/app/components/ui/utils";
import { Textarea } from "@/app/components/ui/textarea";
import {
  type ActivityRow, type TraceStepKind,
  TRACE_STEPS, POLICY_RULES,
} from "./agentConfigData";

/* ─── Trace step dot ─────────────────────────────────────────────────── */
const STEP_DOT: Record<TraceStepKind, { dot: string; label: string }> = {
  ok:     { dot: "bg-emerald-500",  label: "OK"     },
  warn:   { dot: "bg-amber-400",    label: "WARN"   },
  ai:     { dot: "bg-violet-500",   label: "AI"     },
  policy: { dot: "bg-blue-500",     label: "POLICY" },
  system: { dot: "bg-[#999]",       label: "SYSTEM" },
};

function TraceStepRow({ step, isLast }: { step: typeof TRACE_STEPS[0]; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const s = STEP_DOT[step.kind];

  return (
    <div className="flex gap-3">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div className={cn("mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-[#1e2229]", s.dot)} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-[#eaeaea] dark:bg-[#2e3340]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <button
          type="button"
          onClick={() => setOpen((x) => !x)}
          className="flex w-full cursor-pointer items-start justify-between gap-2 text-left"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", s.dot.replace("bg-", "text-"))}>{s.label}</span>
              <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{step.name}</span>
            </div>
            <span className="text-[11px] leading-snug text-[#666] dark:text-[#9ba2b0]">{step.detail}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-[10px] text-[#999]">{step.time}</span>
            <ChevronRight className={cn("size-3 text-[#ccc] transition-transform", open && "rotate-90")} />
          </div>
        </button>

        {open && step.kv && (
          <div className="mt-2 rounded-md bg-[#f5f6f8] dark:bg-[#13161b] px-3 py-2 font-mono text-[11px] text-[#444] dark:text-[#9ba2b0]">
            {Object.entries(step.kv).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-[#999] dark:text-[#6b7280]">{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}
        {open && step.cite && (
          <div className="mt-2 flex flex-col gap-1">
            {step.cite.map((c) => (
              <div key={c} className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
                <BookOpen className="size-3 shrink-0" />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Rubric ─────────────────────────────────────────────────────────── */
type RubricScore = "poor" | "ok" | "good";
function RubricRow({ label, value, onChange }: { label: string; value: RubricScore; onChange: (v: RubricScore) => void }) {
  const opts: RubricScore[] = ["poor", "ok", "good"];
  const colors: Record<RubricScore, string> = {
    poor: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    ok:   "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[#212121] dark:text-[#e4e4e4]">{label}</span>
      <div className="flex gap-1">
        {opts.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "cursor-pointer rounded px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
              value === o
                ? cn("border-0", colors[o])
                : "border border-[#eaeaea] dark:border-[#333a47] text-[#666] dark:text-[#9ba2b0] hover:bg-[#f0f1f5] dark:hover:bg-[#2e3340]",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Stars ──────────────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] tracking-[-1px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-[#ddd] dark:text-[#444]"}>★</span>
      ))}
    </span>
  );
}

/* ─── Drawer component ───────────────────────────────────────────────── */
export interface AgentTraceDrawerProps {
  activity: ActivityRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApprove?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function AgentTraceDrawer({
  activity,
  open,
  onOpenChange,
  onApprove,
  onEscalate,
  onReject,
}: AgentTraceDrawerProps) {
  const [draft, setDraft]   = useState(activity?.draft ?? "");
  const [rubric, setRubric] = useState<Record<string, RubricScore>>({ tone: "ok", accuracy: "good", brand: "good" });
  const [rules, setRules]   = useState(["Never mention competitor names", "Never promise refunds without approval"]);
  const [newRule, setNewRule] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!activity) return null;

  const handleAction = (action: "approve" | "escalate" | "reject") => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      if (action === "approve") onApprove?.(activity.id);
      if (action === "escalate") onEscalate?.(activity.id);
      if (action === "reject") onReject?.(activity.id);
    }, 800);
  };

  const conf = activity.conf;
  const confColor = conf >= 0.85 ? "text-emerald-600 dark:text-emerald-400" : conf >= 0.70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="lg"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title={`Activity #${activity.id}`}
          description={`${activity.ts} · ${activity.location} · ${activity.source}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                disabled={submitting}
                onClick={() => handleAction("escalate")}
              >
                <ArrowUpRight className="size-3.5" />
                Escalate
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/40"
                  disabled={submitting}
                  onClick={() => handleAction("reject")}
                >
                  <XCircle className="size-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={submitting || !activity.draft}
                  onClick={() => handleAction("approve")}
                >
                  <CheckCircle2 className="size-3.5" />
                  {submitting ? "Sending…" : "Approve & Send"}
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-6 px-6 py-5">

            {/* Incoming review */}
            <section>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">
                Incoming Review
              </p>
              <div className="rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: activity.hue }}
                  >
                    {activity.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{activity.name}</span>
                      <Stars rating={activity.rating} />
                      <span className="text-[11px] text-[#999]">{activity.source}</span>
                    </div>
                    <p className="text-[11px] text-[#999]">{activity.location} · {activity.when}</p>
                  </div>
                </div>
                {activity.draft ? (
                  <p className="text-[13px] leading-relaxed text-[#444] dark:text-[#b0b7c3] italic">
                    "{activity.draft.slice(0, 180)}…"
                  </p>
                ) : (
                  <p className="text-[13px] italic text-[#999]">Review content not available for escalated items.</p>
                )}
              </div>
            </section>

            <Separator />

            {/* Execution trace */}
            <section>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">
                Execution Trace
              </p>
              <div className="flex flex-col">
                {TRACE_STEPS.map((step, i) => (
                  <TraceStepRow key={step.id} step={step} isLast={i === TRACE_STEPS.length - 1} />
                ))}
              </div>
            </section>

            <Separator />

            {/* Draft reply */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">
                  Draft Reply
                </p>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-violet-500" />
                  <span className="text-[11px] text-[#666] dark:text-[#9ba2b0]">
                    BirdAI · confidence{" "}
                    <span className={cn("font-semibold", confColor)}>
                      {conf > 0 ? conf.toFixed(2) : "—"}
                    </span>
                  </span>
                </div>
              </div>
              {activity.draft ? (
                <>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    className="text-[13px] resize-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <RotateCcw className="size-3" /> Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Pencil className="size-3" /> Rewrite warmer
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-[13px] text-red-700 dark:text-red-400">
                  No draft generated — hard rule triggered. Review manually before responding.
                </div>
              )}
            </section>

            <Separator />

            {/* Rubric */}
            <section>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#6b7280]">Rubric</p>
              <div className="flex flex-col gap-2.5 rounded-xl border border-[#eaeaea] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] px-4 py-3">
                <RubricRow label="Tone"     value={rubric.tone}     onChange={(v) => setRubric((r) => ({ ...r, tone: v }))}     />
                <Separator />
                <RubricRow label="Accuracy" value={rubric.accuracy} onChange={(v) => setRubric((r) => ({ ...r, accuracy: v }))} />
                <Separator />
                <RubricRow label="Brand fit" value={rubric.brand}   onChange={(v) => setRubric((r) => ({ ...r, brand: v }))}    />
              </div>
            </section>

            <Separator />

            {/* Rules */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <XCircle className="size-3.5 text-red-500" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                  Never do this
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-[#fafafa] dark:bg-[#1a1d23] px-3 py-2">
                    <span className="flex-1 text-[12px] text-[#444] dark:text-[#9ba2b0]">{rule}</span>
                    <button
                      type="button"
                      onClick={() => setRules((rs) => rs.filter((_, j) => j !== i))}
                      className="cursor-pointer text-[#ccc] hover:text-red-400 transition-colors"
                    >
                      <XCircle className="size-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newRule.trim()) {
                        setRules((rs) => [...rs, newRule.trim()]);
                        setNewRule("");
                      }
                    }}
                    placeholder="Add a rule… (Enter to save)"
                    className="flex-1 rounded-md border border-[#e0e4ea] dark:border-[#333a47] bg-white dark:bg-[#1e2229] px-3 py-1.5 text-[12px] text-[#212121] dark:text-[#e4e4e4] placeholder:text-[#bbb] dark:placeholder:text-[#555] outline-none focus:border-[#2552ED]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { if (newRule.trim()) { setRules((rs) => [...rs, newRule.trim()]); setNewRule(""); } }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </section>

          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}
