import { useState, useId } from "react";
import { Clock, Filter, Info, MoreVertical, Palette, Share2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShareModal } from "./ShareModal";
import { AICustomizePanel } from "./AICustomizePanel";
import { ScheduleModal } from "./ScheduleModal";
import { type DraftReport } from "./draftStore";
import svgPaths from "../../imports/svg-mh0ycv9qll";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import {
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
  MAIN_VIEW_SUBHEADING_CLASS,
} from "@/app/components/layout/mainViewTitleClasses";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ChartSummaryTable, type ChartSummaryRow } from "@/app/components/ChartSummaryTable";

// ─── Generate chart data for Mar 1–28 ───
function generateChartData(series: { key: string; base: number; variance: number }[]) {
  return Array.from({ length: 28 }, (_, i) => {
    const day = `Mar ${i + 1}`;
    const point: Record<string, string | number> = { day };
    series.forEach(s => {
      point[s.key] = Math.max(0, s.base + (Math.sin(i * 0.7 + s.base) * s.variance) + (Math.random() - 0.5) * s.variance * 0.5);
    });
    return point;
  });
}

const audienceData = generateChartData([
  { key: "youtube", base: 7000, variance: 2000 },
  { key: "linkedin", base: 5500, variance: 1500 },
]);

const messagingData = generateChartData([
  { key: "youtube", base: 6000, variance: 3000 },
  { key: "linkedin", base: 4000, variance: 2000 },
]);

const impressionsData = generateChartData([
  { key: "youtube", base: 5000, variance: 2500 },
  { key: "linkedin", base: 3500, variance: 1800 },
]);

const engagementData = generateChartData([
  { key: "youtube", base: 5000, variance: 2500 },
  { key: "linkedin", base: 3000, variance: 1500 },
]);

const engagementRateData = generateChartData([
  { key: "youtube", base: 50, variance: 15 },
  { key: "linkedin", base: 40, variance: 10 },
]);

const videoViewsData = generateChartData([
  { key: "youtube", base: 3000, variance: 2000 },
  { key: "linkedin", base: 1500, variance: 1000 },
]);

const publishedPostsData = generateChartData([
  { key: "youtube", base: 3000, variance: 2000 },
  { key: "linkedin", base: 1200, variance: 800 },
]);

// ─── Reusable SVG icons matching Figma ───
function QuestionIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g />
      </svg>
      <div className="absolute inset-[12.5%]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <path clipRule="evenodd" d={svgPaths.p2fb1e00} fill="#8F8F8F" fillRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function EqualizerIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={svgPaths.p3f857700} className="fill-[#212121] dark:fill-[#c0c6d4]" />
      </svg>
    </div>
  );
}

function ThreeDotIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <div className="absolute flex inset-[14.81%_42.24%_14.88%_42.24%] items-center justify-center">
        <div className="flex-none h-[2.484px] rotate-90 w-[11.25px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.25 2.48438">
            <path clipRule="evenodd" d={svgPaths.p23a25380} className="fill-[#212121] dark:fill-[#c0c6d4]" fillRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UpArrowIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <div className="absolute bottom-[18.75%] flex items-center justify-center left-1/4 right-1/4 top-[18.75%]">
        <div className="flex-none h-[8px] rotate-90 w-[10px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 8">
            <path d={svgPaths.p327991f0} fill="#4EAC5D" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Legend dot ───
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex gap-[6px] items-center shrink-0">
      <div className="relative shrink-0 size-[12px]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 12 12">
          <circle cx="6" cy="6" fill={color} r="6" />
        </svg>
      </div>
      <p className="text-[11px] text-[#8a8a8a] dark:text-[#8b92a5] whitespace-nowrap" style={{ fontWeight: 400 }}>{label}</p>
    </div>
  );
}

// ─── KPI value with change ───
function KpiValue({ value, change, label, large }: { value: string; change: string; label: string; large?: boolean }) {
  return (
    <div className="flex flex-col gap-[2px] items-start shrink-0">
      <div className="flex gap-[4px] items-center">
        <p
          className={cn(
            "whitespace-nowrap text-[#222] dark:text-[#e4e4e4] !font-normal",
            large ? "text-[30px] leading-[42px]" : "text-[20px] leading-[22px]",
          )}
        >
          {value}
        </p>
        {change && (
          <div className="flex items-center pt-[6px]">
            <UpArrowIcon />
            <p className="text-[13px] font-normal text-[#4eac5d] whitespace-nowrap">{change}</p>
          </div>
        )}
      </div>
      <p
        className={cn(
          "whitespace-nowrap text-[12px] font-normal",
          large ? "text-[#555] dark:text-[#9ba2b0] leading-[18px]" : "text-[#8f8f8f] dark:text-[#7d849a] uppercase leading-[16px]",
        )}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Widget header ───
function WidgetHeader({ title, showActions = true }: { title: string; showActions?: boolean }) {
  return (
    <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
      <div className="flex w-full items-start justify-between py-4">
        <div className="flex min-w-0 flex-col gap-1 items-start justify-center">
          <div className="flex min-w-0 items-center gap-1">
            <h3 className={cn(MAIN_VIEW_PRIMARY_HEADING_CLASS, "min-w-0 truncate font-normal")}>{title}</h3>
            <QuestionIcon />
          </div>
          <p className={cn(MAIN_VIEW_SUBHEADING_CLASS, "!mt-0 max-w-full")}>
            This month <span className="text-muted-foreground/80">vs</span> previous period
          </p>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="font-normal" title="Chart layout" aria-label="Chart layout">
              <EqualizerIcon />
            </Button>
            <Button type="button" variant="outline" size="icon" className="font-normal" title="More options" aria-label="More options">
              <ThreeDotIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart widget card ───
interface ChartWidgetProps {
  title: string;
  kpis: { value: string; change: string; label: string }[];
  data: Record<string, string | number>[];
  series: { key: string; color: string; label: string }[];
  yDomain?: [number, number];
  yTickFormatter?: (v: number) => string;
  tableHeaders?: string[];
  tableRows?: ChartSummaryRow[];
}

function ChartWidget({ title, kpis, data, series, yDomain, yTickFormatter, tableHeaders, tableRows }: ChartWidgetProps) {
  const chartId = useId();
  const defaultFormatter = (v: number) => {
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  };
  const formatter = yTickFormatter || defaultFormatter;

  return (
    <div className="flex w-full flex-col items-stretch gap-6 rounded-lg border border-[#e5e9f0] bg-white px-6 pb-6 transition-colors duration-300 dark:border-[#333a47] dark:bg-[#1e2229]">
      <WidgetHeader title={title} />

      {/* KPIs */}
      <div className="flex w-full items-end gap-6">
        {kpis.map(kpi => (
          <KpiValue key={kpi.label} value={kpi.value} change={kpi.change} label={kpi.label} />
        ))}
      </div>

      {/* Chart */}
      <div className="w-full px-[0px]">
        <div className="flex gap-[16px] items-center w-full">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs key="defs">
                {series.map(s => (
                  <linearGradient key={`grad-${s.key}`} id={`gradient-${chartId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop key="stop-0" offset="0%" stopColor={s.color} stopOpacity={0.1} />
                    <stop key="stop-1" offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid key="grid" horizontal={true} vertical={false} stroke="#eaeaea" />
              <XAxis
                key="xaxis"
                dataKey="day"
                tick={{ fontSize: 11, fill: "#555" }}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={(v: string) => v.replace("Mar ", "")}
              />
              <YAxis
                key="yaxis"
                tick={{ fontSize: 11, fill: "#555" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatter}
                domain={yDomain}
                width={36}
              />
              <Tooltip
                key="tooltip"
                contentStyle={{ fontSize: 12, fontWeight: 400, borderRadius: 8, border: "1px solid #eaeaea" }}
                labelStyle={{ fontWeight: 400 }}
                itemStyle={{ fontWeight: 400 }}
              />
              {series.map(s => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${chartId}-${s.key})`}
                  name={s.label}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legends */}
        <div className="flex gap-[24px] items-center mt-[8px] ml-[36px]">
          {series.map(s => (
            <LegendDot key={s.key} color={s.color} label={s.label} />
          ))}
        </div>
      </div>

      {tableHeaders && tableRows ? (
        <ChartSummaryTable metricHeaders={tableHeaders} rows={tableRows} />
      ) : null}
    </div>
  );
}

// ─── Chart widget configs ───
const chartWidgets: ChartWidgetProps[] = [
  {
    title: "Audience growth",
    kpis: [
      { value: "23.2K", change: "4.6%", label: "Total audience" },
      { value: "11.2K", change: "4.2%", label: "Audience gained" },
    ],
    data: audienceData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Total audience", "Net audience growth"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "12,487", change: "4.2%" }, { value: "537", change: "4.2%" }] },
      { channel: "LinkedIn", values: [{ value: "10,713", change: "2.3%" }, { value: "232", change: "2.3%" }] },
    ],
  },
  {
    title: "Messaging volume",
    kpis: [
      { value: "21.9K", change: "12.6%", label: "Total messages" },
      { value: "18K", change: "11.2%", label: "Messages received" },
    ],
    data: messagingData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Messages received", "Messages sent"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "12,487", change: "4.2%" }, { value: "537", change: "4.2%" }] },
      { channel: "LinkedIn", values: [{ value: "10,713", change: "2.3%" }, { value: "232", change: "2.3%" }] },
    ],
  },
  {
    title: "Impressions",
    kpis: [
      { value: "17.9K", change: "1.6%", label: "Total impressions" },
    ],
    data: impressionsData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Impressions"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "10,215", change: "4.2%" }] },
      { channel: "LinkedIn", values: [{ value: "7,685", change: "1.3%" }] },
    ],
  },
  {
    title: "Engagement",
    kpis: [
      { value: "17.9K", change: "10.6%", label: "Total engagements" },
    ],
    data: engagementData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Engagement"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "11,200", change: "1.2%" }] },
      { channel: "LinkedIn", values: [{ value: "6,700", change: "0.3%" }] },
    ],
  },
  {
    title: "Engagement rate",
    kpis: [
      { value: "49.4%", change: "15.6%", label: "Engagement rate" },
    ],
    data: engagementRateData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    yDomain: [0, 100],
    yTickFormatter: (v: number) => `${v}%`,
    tableHeaders: ["Engagement rate"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "52.3%", change: "4.2%" }] },
      { channel: "LinkedIn", values: [{ value: "46.5%", change: "2.3%" }] },
    ],
  },
  {
    title: "Video views",
    kpis: [
      { value: "7.9K", change: "140.6%", label: "Total video views" },
    ],
    data: videoViewsData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Video views"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "5,400", change: "2.2%" }] },
      { channel: "LinkedIn", values: [{ value: "2,500", change: "2.1%" }] },
    ],
  },
  {
    title: "Published posts",
    kpis: [
      { value: "7.9K", change: "140.6%", label: "Total published posts" },
    ],
    data: publishedPostsData,
    series: [
      { key: "youtube", color: "#FF6A4D", label: "YouTube" },
      { key: "linkedin", color: "#0A66C2", label: "LinkedIn" },
    ],
    tableHeaders: ["Published posts"],
    tableRows: [
      { channel: "YouTube", values: [{ value: "4,800", change: "2.2%" }] },
      { channel: "LinkedIn", values: [{ value: "3,100", change: "2.1%" }] },
    ],
  },
];

// ─── Main Dashboard ───
export function Dashboard({ aiPanelOpen, onAiPanelChange, editingDraft }: { aiPanelOpen: boolean; onAiPanelChange: (open: boolean) => void; editingDraft?: DraftReport | null }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [aiEntryMode, setAiEntryMode] = useState<"share" | "schedule">("share");
  const [themeColor, setThemeColor] = useState("#2552ED");
  const [showSummaryPage, setShowSummaryPage] = useState(false);

  // ─── AI Customize Panel (page-level, replaces dashboard) ───
  if (aiPanelOpen) {
    return (
      <AICustomizePanel
        onClose={() => { onAiPanelChange(false); setAiEntryMode("share"); }}
        themeColor={themeColor}
        onThemeColorChange={setThemeColor}
        showSummaryPage={showSummaryPage}
        onToggleSummaryPage={setShowSummaryPage}
        editingDraft={editingDraft}
        entryMode={aiEntryMode}
      />
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-[#13161b] overflow-auto flex flex-col transition-colors duration-300">
      <div className="sticky top-0 z-10 shrink-0 bg-white transition-colors duration-300 dark:bg-[#13161b]">
        <MainCanvasViewHeader
          className="!px-8"
          title="Profile performance"
          titleClassName="font-normal"
          actions={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="font-normal"
                title="Actions"
                aria-label="Actions"
              >
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem
                className="text-[13px] font-normal"
                onSelect={() => setShareModalOpen(true)}
              >
                <Share2 className="size-3.5 text-muted-foreground" />
                Share report
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[13px] font-normal"
                onSelect={() => {
                  setAiEntryMode("share");
                  onAiPanelChange(true);
                }}
              >
                <Palette className="size-3.5 text-muted-foreground" />
                Customize & share
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[13px] font-normal"
                onSelect={() => setScheduleModalOpen(true)}
              >
                <Clock className="size-3.5 text-muted-foreground" />
                Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" variant="outline" size="icon" className="font-normal" title="Filter" aria-label="Filter">
            <Filter className="size-4 text-muted-foreground" aria-hidden />
          </Button>
        </div>
          }
        />
      </div>

      {/* Content — px-8 matches header band override so titles and cards share one inset */}
      <div className="flex flex-1 flex-col gap-6 px-8 pb-8 pt-0">
        {/* Performance Summary */}
        <div className="flex w-full flex-col items-stretch gap-6 rounded-lg border border-[#e5e9f0] bg-white px-6 pb-6 transition-colors duration-300 dark:border-[#333a47] dark:bg-[#1e2229]">
          <WidgetHeader title="Performance summary" showActions={false} />
          <div className="flex w-full flex-wrap items-start gap-[80px_80px]">
            {[
              { value: "19.1K", change: "8.2%", label: "Impressions" },
              { value: "11.9K", change: "6.2%", label: "Engagement" },
              { value: "2.4%", change: "1.2%", label: "Engagement rate" },
              { value: "9.2K", change: "3.2%", label: "Post link clicks" },
            ].map((kpi) => (
              <KpiValue key={kpi.label} value={kpi.value} change={kpi.change} label={kpi.label} large />
            ))}
          </div>
        </div>

        {/* Chart widgets */}
        {chartWidgets.map((widget) => (
          <ChartWidget key={widget.title} {...widget} />
        ))}
      </div>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onCustomize={() => { setShareModalOpen(false); setAiEntryMode("share"); onAiPanelChange(true); }}
        themeColor={themeColor}
        showSummaryPage={showSummaryPage}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onCustomize={() => { setScheduleModalOpen(false); setAiEntryMode("schedule"); onAiPanelChange(true); }}
        themeColor={themeColor}
        showSummaryPage={showSummaryPage}
      />
    </div>
  );
}