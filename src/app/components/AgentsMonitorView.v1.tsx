import { useState, useRef, useCallback, useMemo, useEffect, useLayoutEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Activity,
  X,
  RotateCcw,
  UserCheck,
  PauseCircle,
  Pencil,
  Sparkles,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  monitorActivities,
  type MonitorActivity,
  type ActivityStatus,
  type ActivityCategory,
} from "@/app/data/agentsMonitorMock";
import {
  AGENTS_MONITOR_FILTER_IDS,
  AGENTS_MONITOR_FILTERS_STORAGE_KEY,
  createInitialAgentsMonitorFilters,
} from "@/app/data/agentsMonitorFilters";
import { filterValue } from "@/app/data/filterUtils";
import { useMonitorNotifications } from "@/app/context/MonitorNotificationsContext";
import {
  FilterPane,
  FilterPaneTriggerButton,
} from "@/app/components/FilterPane";
import { L2_CONTENT_MUTED_BAND } from "@/app/components/L2NavLayout";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";

/** Selected activity row: blue highlight on the title (agent name) only. */
const ACTIVITY_ROW_TITLE_SELECTED =
  "text-[#1E44CC] dark:text-[#6b9bff]";

/** Default share of the feed/detail row for the activity list (~⅓ list, ~⅔ detail). */
const DEFAULT_ACTIVITY_LIST_FRACTION = 1 / 3;

function clampActivityListDividerLeft(
  containerWidth: number,
  leftPx: number,
  minLeft: number,
  minRight: number,
): number {
  const maxLeft = containerWidth - minRight;
  return Math.min(maxLeft, Math.max(minLeft, leftPx));
}

/* ─── Mock Data ─── */
const monitorMetrics = [
  { label: "Agent actions today", value: "342", icon: Activity, color: "#2552ED" },
  { label: "Successful actions", value: "318", icon: CheckCircle2, color: "#4caf50" },
  { label: "Automation rate", value: "93%", icon: Zap, color: "#9970D7" },
  { label: "Avg response time", value: "4.2s", icon: Clock, color: "#F59E0B" },
];

/* ─── Status / category labels (text badges; design tokens via UI Badge) ─── */
function statusLabel(status: ActivityStatus) {
  if (status === "success") return "Success";
  if (status === "warning") return "Needs review";
  if (status === "processing") return "Processing";
  return "Failed";
}

function ActivityCategoryBadge({ category }: { category: ActivityCategory }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-muted text-muted-foreground h-5 min-h-0 px-2 py-0 text-[10px] font-normal tracking-tight shrink-0 rounded-md"
    >
      {category}
    </Badge>
  );
}

function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const label = statusLabel(status);
  if (status === "warning") {
    return (
      <Badge
        variant="outline"
        className="border-transparent h-5 min-h-0 bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 px-2 py-0 text-[10px] font-normal shrink-0 rounded-md"
      >
        {label}
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge
        variant="destructive"
        className="h-5 min-h-0 px-2 py-0 text-[10px] font-normal shrink-0 rounded-md"
      >
        {label}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-muted text-muted-foreground h-5 min-h-0 px-2 py-0 text-[10px] font-normal shrink-0 rounded-md"
    >
      {label}
    </Badge>
  );
}

/* ─── Confidence Meter ─── */
function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#4caf50" : pct >= 50 ? "#F59E0B" : "#ef5350";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[4px] bg-[#f0f1f5] dark:bg-[#262b35] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] tabular-nums" style={{ fontWeight: 400, color }}>{pct}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Inspection Panel (Right Side)
   ═══════════════════════════════════════════ */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("w-2.5 h-2.5", i < rating ? "fill-amber-400 text-amber-400" : "text-[#ddd] dark:text-[#444]")}
        />
      ))}
    </span>
  );
}

function InspectionPanel({ activity, onClose, onNavigateToReviews }: {
  activity: MonitorActivity;
  onClose: () => void;
  onNavigateToReviews?: () => void;
}) {
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-[#1e2229] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-end px-5 py-3.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 rounded-[4px] text-[#999] dark:text-[#6b7280]"
          aria-label="Close activity details"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ActivityCategoryBadge category={activity.category} />
            <ActivityStatusBadge status={activity.status} />
          </div>
          <p className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px]" style={{ fontWeight: 400 }}>
            {activity.agentName}
          </p>
          <p className="text-[13px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>
            {activity.action}
          </p>
          {activity.detail && (
            <p className="text-[11px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>{activity.detail}</p>
          )}
        </div>

        {/* Conversation Timeline */}
        {activity.timeline && activity.timeline.length > 0 && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-3 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Timeline</h4>
            <div className="relative pl-4">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#E5E7EB] dark:bg-[#2e3340]" />
              <div className="space-y-3">
                {activity.timeline.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-4 top-[5px] w-[10px] h-[10px] rounded-full border-2 ${
                      i === activity.timeline!.length - 1
                        ? "border-[#2552ED] bg-[#2552ED]"
                        : "border-[#E5E7EB] dark:border-[#4d5568] bg-white dark:bg-[#1e2229]"
                    }`} />
                    <div>
                      <span className="text-[10px] text-[#999] dark:text-[#6b7280] tabular-nums" style={{ fontWeight: 300 }}>{step.time}</span>
                      <p className="text-[12px] text-[#212121] dark:text-[#e4e4e4] mt-0.5" style={{ fontWeight: 400 }}>{step.label}</p>
                      {step.detail && (
                        <p className="text-[11px] text-[#777] dark:text-[#6b7280] mt-0.5 italic" style={{ fontWeight: 300 }}>{step.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agent Reasoning */}
        {activity.reasoning && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-2 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Agent reasoning</h4>
            <div className="bg-[#f8f9fa] dark:bg-[#1a1e26] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[8px] px-4 py-3 space-y-2">
              {activity.reasoning.sentiment && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Sentiment</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.sentiment}</span>
                </div>
              )}
              {activity.reasoning.topic && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Topic detected</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.topic}</span>
                </div>
              )}
              {activity.reasoning.customerHistory && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Customer history</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.customerHistory}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="text-[11px] text-[#888] dark:text-[#6b7280] block mb-1" style={{ fontWeight: 400 }}>Confidence score</span>
                <ConfidenceMeter value={activity.reasoning.confidence} />
              </div>
            </div>
          </div>
        )}

        {/* Draft Preview */}
        {activity.hasDraft && activity.draftText && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-2 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Response draft</h4>
            <div className="bg-[#fffbf0] dark:bg-[#2a2618] border border-[#f0e6c8] dark:border-[#4a3f20] rounded-[8px] px-4 py-3">
              <p className="text-[12px] text-[#555] dark:text-[#9ba2b0] italic" style={{ fontWeight: 300 }}>
                "{activity.draftText}"
              </p>
            </div>
          </div>
        )}

        {/* Linked Review */}
        {activity.reviewLink && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-2 tracking-[-0.24px]" style={{ fontWeight: 400 }}>
              Linked review
            </h4>
            <div className="border border-[#E5E7EB] dark:border-[#2e3340] rounded-[8px] overflow-hidden">
              {/* Review content */}
              <div className="px-4 py-3 space-y-2 bg-[#f8f9fa] dark:bg-[#1a1e26]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#e8f0fe] text-[#2552ED] dark:bg-[#1e2d5e] dark:text-[#6b9bff] rounded-[3px] font-medium">
                    {activity.reviewLink.platform}
                  </span>
                  <StarRating rating={activity.reviewLink.rating} />
                </div>
                <p className="text-[11px] text-[#555] dark:text-[#9ba2b0] italic" style={{ fontWeight: 300 }}>
                  "{activity.reviewLink.reviewText}"
                </p>
              </div>
              {/* Generated response */}
              <div className="px-4 py-3 border-t border-[#E5E7EB] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] space-y-1.5">
                <p className="text-[10px] text-[#888] dark:text-[#6b7280] uppercase tracking-wide" style={{ fontWeight: 400 }}>
                  {activity.status === "warning" ? "Drafted response" : "Response sent"}
                </p>
                <p className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 300 }}>
                  "{activity.reviewLink.generatedResponse}"
                </p>
              </div>
              {/* Navigate link */}
              {onNavigateToReviews && (
                <button
                  onClick={onNavigateToReviews}
                  className="w-full flex items-center justify-between px-4 py-2.5 border-t border-[#E5E7EB] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] hover:bg-[#f0f4ff] dark:hover:bg-[#1a2040] transition-colors group"
                >
                  <span className="text-[11px] text-[#2552ED] dark:text-[#6b9bff]" style={{ fontWeight: 400 }}>
                    View in Reviews
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#2552ED] dark:text-[#6b9bff] group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Explain */}
        <div>
          <button
            onClick={() => setExplainOpen(!explainOpen)}
            className="flex items-center gap-1.5 text-[12px] text-[#2552ED] dark:text-[#6b9bff] hover:underline transition-colors"
            style={{ fontWeight: 400 }}
          >
            <Sparkles className="w-3 h-3" />
            Explain this activity
          </button>
          {explainOpen && (
            <div className="mt-2 bg-[#f0f4ff] dark:bg-[#1a2040] border border-[#d0dbf8] dark:border-[#2e3a5e] rounded-[8px] px-4 py-3 space-y-1">
              {activity.status === "success" && activity.reasoning && activity.reasoning.confidence >= 0.85 && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action was auto-approved because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    {activity.reasoning.sentiment && <li>Sentiment was {activity.reasoning.sentiment.toLowerCase()}</li>}
                    <li>Response confidence {">"} 0.85 ({Math.round(activity.reasoning.confidence * 100)}%)</li>
                    <li>Auto-reply policy enabled for this agent</li>
                  </ul>
                </>
              )}
              {activity.status === "warning" && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action was flagged for review because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    <li>Confidence score below auto-approval threshold</li>
                    {activity.reasoning && <li>Current confidence: {Math.round(activity.reasoning.confidence * 100)}%</li>}
                    <li>Human review required per policy</li>
                  </ul>
                </>
              )}
              {activity.status === "error" && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action failed because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    <li>External API returned an authentication error</li>
                    <li>Retry attempts exhausted</li>
                    <li>Manual intervention is required to resolve</li>
                  </ul>
                </>
              )}
              {activity.status === "success" && activity.reasoning && activity.reasoning.confidence < 0.85 && (
                <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>
                  This action completed successfully. The agent processed the task according to its configured workflow rules.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intervention Controls */}
      <div className="px-5 py-3 shrink-0">
        {activity.status === "warning" && activity.hasDraft ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-white bg-[#4caf50] hover:bg-[#43a047] rounded-[8px] transition-colors" style={{ fontWeight: 400 }}>
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
          </div>
        ) : activity.status === "error" ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <UserCheck className="w-3 h-3" />
              Escalate
            </button>
          </div>
        ) : activity.status === "warning" ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <UserCheck className="w-3 h-3" />
              Escalate
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-white bg-[#4caf50] hover:bg-[#43a047] rounded-[8px] transition-colors" style={{ fontWeight: 400 }}>
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <PauseCircle className="w-3 h-3" />
              Pause agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Monitor View
   ═══════════════════════════════════════════ */

const DEFAULT_MONITOR_USER_DISPLAY_NAME = "John";

export type AgentsMonitorViewProps = {
  onBack: () => void;
  onNavigateToReviews?: () => void;
  /** First name or short name for the greeting row (demo default matches shell profile). */
  userDisplayName?: string;
};

export function AgentsMonitorView({
  onBack,
  onNavigateToReviews,
  userDisplayName = DEFAULT_MONITOR_USER_DISPLAY_NAME,
}: AgentsMonitorViewProps) {
  void onBack;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(() =>
    createInitialAgentsMonitorFilters(),
  );
  const [searchExpanded, setSearchExpanded] = useState(false);

  const { selectedActivityId, setSelectedActivityId } = useMonitorNotifications();

  /** On landing with no selection (e.g. from L2 Monitor), highlight the top feed row and open the details pane. Preserve ID when coming from notifications. */
  useEffect(() => {
    setSelectedActivityId(prev => (prev == null ? monitorActivities[0]?.id ?? null : prev));
  }, [setSelectedActivityId]);

  const selectedActivity = useMemo((): MonitorActivity | null => {
    if (!selectedActivityId) return null;
    return monitorActivities.find(a => a.id === selectedActivityId) ?? null;
  }, [selectedActivityId]);

  /* ── Resizable pane state ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividerPos, setDividerPos] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPos = useRef(0);

  const MIN_LEFT = 320;
  const MIN_RIGHT = 300;

  /** When a row is selected and there is no explicit split yet (or reset via double-click), default list ≈⅓ width. */
  useLayoutEffect(() => {
    if (!selectedActivity || dividerPos !== null) return;
    const container = containerRef.current;
    if (!container) return;
    const apply = () => {
      const w = container.getBoundingClientRect().width;
      if (w <= 0) return;
      const target = Math.round(w * DEFAULT_ACTIVITY_LIST_FRACTION);
      setDividerPos(clampActivityListDividerLeft(w, target, MIN_LEFT, MIN_RIGHT));
    };
    apply();
    const id = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(id);
  }, [selectedActivity, dividerPos]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsResizing(true);
    startX.current = e.clientX;
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const w = containerRect.width;
    const fallback = clampActivityListDividerLeft(
      w,
      Math.round(w * DEFAULT_ACTIVITY_LIST_FRACTION),
      MIN_LEFT,
      MIN_RIGHT,
    );
    startPos.current = dividerPos ?? fallback;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [dividerPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxLeft = containerRect.width - MIN_RIGHT;
    const delta = e.clientX - startX.current;
    const newPos = Math.min(maxLeft, Math.max(MIN_LEFT, startPos.current + delta));
    setDividerPos(newPos);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setIsResizing(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setDividerPos(null);
  }, []);

  const agentFilter =
    filterValue(appliedFilters, AGENTS_MONITOR_FILTER_IDS.agent) ?? "All agents";
  const statusFilter =
    filterValue(appliedFilters, AGENTS_MONITOR_FILTER_IDS.status) ?? "All statuses";
  const categoryFilter =
    filterValue(appliedFilters, AGENTS_MONITOR_FILTER_IDS.category) ??
    "All categories";

  const filteredActivities = monitorActivities.filter((a) => {
    if (
      searchQuery &&
      !a.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (agentFilter !== "All agents" && a.agentName !== agentFilter) return false;
    if (statusFilter === "Success" && a.status !== "success") return false;
    if (statusFilter === "Needs review" && a.status !== "warning") return false;
    if (statusFilter === "Failed" && a.status !== "error") return false;
    if (statusFilter === "Processing" && a.status !== "processing") return false;
    if (categoryFilter !== "All categories" && a.category !== categoryFilter)
      return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#13161b] transition-colors duration-300">
      {/* ─── Greeting + hero (metrics) ─── */}
      <div className="flex shrink-0 flex-col gap-6 px-6 pb-0 pt-5">
        <MainCanvasViewHeader
          title="Monitor"
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {searchExpanded ? (
                <div className="flex w-[220px] min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 transition-all">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setSearchExpanded(false);
                    }}
                    placeholder="Search activities..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                    style={{ fontWeight: 400 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchExpanded(false);
                    }}
                    className="shrink-0"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  variant="outline"
                  size="icon"
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
              <FilterPaneTriggerButton
                open={filterOpen}
                onOpenChange={setFilterOpen}
              />
            </div>
          }
        />

        <div className={cn("rounded-xl p-6", L2_CONTENT_MUTED_BAND)}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0 max-w-md shrink-0 space-y-2">
              <p className="text-base text-foreground/80" style={{ fontWeight: 300 }}>
                Hi, {userDisplayName}!
              </p>
              <p className="text-sm text-muted-foreground" style={{ fontWeight: 400 }}>
                Track what your agents did today, spot items that need review, and dig into each run from one place.
              </p>
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {monitorMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-border bg-card px-6 py-4 transition-colors"
                >
                  <div className="mb-1 flex items-baseline gap-2">
                    <p className="text-2xl tabular-nums tracking-tight text-foreground" style={{ fontWeight: 400 }}>
                      {m.value}
                    </p>
                    <m.icon className="h-4 w-4 self-center" style={{ color: m.color }} />
                  </div>
                  <span className="text-xs text-muted-foreground" style={{ fontWeight: 400 }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Feed / details + right filter pane ─── */}
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <div
          className={`flex min-h-0 flex-1 overflow-hidden ${isResizing ? "select-none" : ""}`}
          ref={containerRef}
        >
        {/* Activity Feed (Left) */}
        <div
          className="overflow-y-auto min-w-0"
          style={
            selectedActivity && dividerPos !== null
              ? { width: `${dividerPos}px`, flexShrink: 0 }
              : { flex: 1 }
          }
        >
          <div className="px-6 pt-4 pb-4">
            <div className="rounded-lg p-2">
              {filteredActivities.map((item) => {
                const isSelected = selectedActivity?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedActivityId(isSelected ? null : item.id)}
                    className={cn(
                      "group w-full flex cursor-pointer items-start gap-2 rounded-[4px] px-2 py-4 text-left",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E44CC]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#13161b]",
                    )}
                  >
                    <span
                      className="text-[11px] text-[#999] dark:text-[#6b7280] whitespace-nowrap mt-0.5 w-[65px] shrink-0 tabular-nums"
                      style={{ fontWeight: 300 }}
                    >
                      {item.time}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          className={cn(
                            "text-[13px] transition-colors duration-200",
                            isSelected
                              ? ACTIVITY_ROW_TITLE_SELECTED
                              : "text-[#212121] dark:text-[#e4e4e4] group-hover:text-[#1E44CC] dark:group-hover:text-[#6b9bff] group-focus-visible:text-[#1E44CC] dark:group-focus-visible:text-[#6b9bff]",
                          )}
                          style={{ fontWeight: 400 }}
                        >
                          {item.agentName}
                        </span>
                        <ActivityCategoryBadge category={item.category} />
                        <ActivityStatusBadge status={item.status} />
                      </div>
                      <span className="text-[13px] text-[#555] dark:text-[#9ba2b0] block" style={{ fontWeight: 300 }}>
                        {item.action}
                      </span>
                      {item.detail && (
                        <p className="text-[11px] text-[#999] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredActivities.length === 0 && (
                <div className="text-center py-12 text-[13px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>No activities match your filters</div>
              )}
            </div>
          </div>
        </div>

        {/* Figma-style resize handle */}
        {selectedActivity && (
          <div
            className="relative shrink-0 group"
            style={{ width: '9px' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          >
            {/* Visible line with vertical gradient fade */}
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px transition-all duration-150 group-hover:w-[3px] group-hover:rounded-full group-active:w-[3px] group-active:rounded-full"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, rgba(229,231,235,0.8) 12%, rgba(229,231,235,1) 25%, rgba(229,231,235,1) 75%, rgba(229,231,235,0.8) 88%, transparent 100%)",
              }}
            />
            {/* Invisible grab area */}
            <div className="absolute inset-0 cursor-col-resize z-10" />
          </div>
        )}

        {/* Inspection Panel (Right) */}
        {selectedActivity && (
          <InspectionPanel
            activity={selectedActivity}
            onClose={() => setSelectedActivityId(null)}
            onNavigateToReviews={selectedActivity.reviewLink ? onNavigateToReviews : undefined}
          />
        )}
        </div>
        <FilterPane
          initialFilters={appliedFilters}
          open={filterOpen}
          onOpenChange={setFilterOpen}
          onFiltersChange={setAppliedFilters}
          motion="static"
          dock="right"
          storageKey={AGENTS_MONITOR_FILTERS_STORAGE_KEY}
        />
      </div>
    </div>
  );
}
