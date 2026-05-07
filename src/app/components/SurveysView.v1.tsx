import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Search, MoreHorizontal, Download, Copy, Trash2, BarChart2,
  Filter, Users, Send, TrendingUp, Star, Eye,
  CheckCircle2, Clock, XCircle, Edit3,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/app/components/ui/tooltip";
import { Progress } from "@/app/components/ui/progress";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";

/* ─── Types ─── */
type SurveyType = "nps" | "standard" | "custom";
type SurveyStatus = "active" | "draft" | "closed";

interface Survey {
  id: string;
  name: string;
  type: SurveyType;
  status: SurveyStatus;
  sent: number;
  responses: number;
  npsScore: number | null; // null for non-NPS
  completionRate: number;
  lastUpdated: string;
  owner: string;
  questions: Question[];
  recentResponses: SurveyResponse[];
}

interface Question {
  id: string;
  text: string;
  type: "nps" | "rating" | "multiple_choice" | "text";
  options?: { label: string; count: number; pct: number }[];
}

interface SurveyResponse {
  id: string;
  respondentName: string;
  score: number | null;
  comment: string;
  respondedOn: string;
}

/* ─── Mock data ─── */
const SURVEY_SEEDS: Survey[] = [
  {
    id: "s1",
    name: "Post-Visit Patient Satisfaction",
    type: "nps",
    status: "active",
    sent: 1_840,
    responses: 742,
    npsScore: 68,
    completionRate: 91,
    lastUpdated: "Apr 13, 2026",
    owner: "Sarah Chen",
    questions: [
      {
        id: "q1", text: "How likely are you to recommend us to a friend?", type: "nps",
        options: [
          { label: "Promoters (9–10)", count: 478, pct: 64 },
          { label: "Passives (7–8)",   count: 178, pct: 24 },
          { label: "Detractors (0–6)", count:  86, pct: 12 },
        ],
      },
      {
        id: "q2", text: "How was the cleanliness of our facility?", type: "rating",
        options: [
          { label: "5 – Excellent", count: 320, pct: 43 },
          { label: "4 – Good",      count: 260, pct: 35 },
          { label: "3 – Average",   count: 115, pct: 16 },
          { label: "1–2 – Poor",    count:  47, pct:  6 },
        ],
      },
      {
        id: "q3", text: "How would you rate your wait time?", type: "rating",
        options: [
          { label: "Very short",    count: 195, pct: 26 },
          { label: "Acceptable",    count: 370, pct: 50 },
          { label: "Too long",      count: 177, pct: 24 },
        ],
      },
    ],
    recentResponses: [
      { id: "r1", respondentName: "Lisa Monroe",     score: 10, comment: "Absolutely love this clinic. The staff is so kind and professional.", respondedOn: "Apr 13" },
      { id: "r2", respondentName: "Tom Harrington",  score: 8,  comment: "Great experience overall, just a bit long of a wait.", respondedOn: "Apr 12" },
      { id: "r3", respondentName: "Aisha Rahman",    score: 3,  comment: "Scheduling was difficult and I felt rushed during my appointment.", respondedOn: "Apr 11" },
      { id: "r4", respondentName: "Carlos Vega",     score: 9,  comment: "Dr. Chen was phenomenal. Would highly recommend.", respondedOn: "Apr 10" },
    ],
  },
  {
    id: "s2",
    name: "Service Quality Check-in",
    type: "standard",
    status: "active",
    sent: 960,
    responses: 388,
    npsScore: null,
    completionRate: 84,
    lastUpdated: "Apr 10, 2026",
    owner: "Marcus Webb",
    questions: [
      {
        id: "q1", text: "How satisfied were you with our service?", type: "multiple_choice",
        options: [
          { label: "Very satisfied",  count: 180, pct: 46 },
          { label: "Satisfied",       count: 140, pct: 36 },
          { label: "Neutral",         count:  48, pct: 12 },
          { label: "Dissatisfied",    count:  20, pct:  6 },
        ],
      },
      {
        id: "q2", text: "Which area needs the most improvement?", type: "multiple_choice",
        options: [
          { label: "Communication",   count: 145, pct: 37 },
          { label: "Wait times",      count: 118, pct: 30 },
          { label: "Staff attitude",  count:  66, pct: 17 },
          { label: "Facility",        count:  59, pct: 15 },
        ],
      },
    ],
    recentResponses: [
      { id: "r1", respondentName: "Fiona Blake",   score: null, comment: "Communication could be improved but the team was friendly.", respondedOn: "Apr 10" },
      { id: "r2", respondentName: "David Park",    score: null, comment: "Everything was smooth and on time. Great job!", respondedOn: "Apr 9"  },
      { id: "r3", respondentName: "Maria Santos",  score: null, comment: "Had to call 3 times to get an appointment confirmed.", respondedOn: "Apr 8"  },
    ],
  },
  {
    id: "s3",
    name: "Annual Brand Perception Survey",
    type: "custom",
    status: "active",
    sent: 3_200,
    responses: 1_104,
    npsScore: null,
    completionRate: 78,
    lastUpdated: "Apr 5, 2026",
    owner: "Priya Nair",
    questions: [
      {
        id: "q1", text: "How would you describe our brand in one word?", type: "text",
        options: [],
      },
      {
        id: "q2", text: "How often do you interact with our services?", type: "multiple_choice",
        options: [
          { label: "Weekly",          count: 340, pct: 31 },
          { label: "Monthly",         count: 420, pct: 38 },
          { label: "Quarterly",       count: 220, pct: 20 },
          { label: "Rarely",          count: 124, pct: 11 },
        ],
      },
    ],
    recentResponses: [
      { id: "r1", respondentName: "Nina Petrov",   score: null, comment: "Innovative. Always pushing the boundary.", respondedOn: "Apr 5" },
      { id: "r2", respondentName: "Oliver Grant",  score: null, comment: "Trustworthy and reliable.", respondedOn: "Apr 4" },
    ],
  },
  {
    id: "s4",
    name: "Employee Engagement Q1",
    type: "nps",
    status: "closed",
    sent: 210,
    responses: 198,
    npsScore: 52,
    completionRate: 95,
    lastUpdated: "Mar 31, 2026",
    owner: "James Osei",
    questions: [
      {
        id: "q1", text: "Would you recommend working here to a friend?", type: "nps",
        options: [
          { label: "Promoters (9–10)", count: 102, pct: 52 },
          { label: "Passives (7–8)",   count:  65, pct: 33 },
          { label: "Detractors (0–6)", count:  31, pct: 16 },
        ],
      },
    ],
    recentResponses: [
      { id: "r1", respondentName: "Elena Watts",  score: 10, comment: "Great culture and leadership support.", respondedOn: "Mar 30" },
      { id: "r2", respondentName: "Ben Nakamura", score: 6,  comment: "Work-life balance could be better.", respondedOn: "Mar 29" },
    ],
  },
  {
    id: "s5",
    name: "New Patient Onboarding Experience",
    type: "standard",
    status: "draft",
    sent: 0,
    responses: 0,
    npsScore: null,
    completionRate: 0,
    lastUpdated: "Apr 12, 2026",
    owner: "Sarah Chen",
    questions: [],
    recentResponses: [],
  },
  {
    id: "s6",
    name: "Follow-Up Care Quality",
    type: "nps",
    status: "active",
    sent: 520,
    responses: 214,
    npsScore: 74,
    completionRate: 88,
    lastUpdated: "Apr 8, 2026",
    owner: "Marcus Webb",
    questions: [
      {
        id: "q1", text: "How likely are you to return for follow-up care?", type: "nps",
        options: [
          { label: "Promoters (9–10)", count: 142, pct: 66 },
          { label: "Passives (7–8)",   count:  58, pct: 27 },
          { label: "Detractors (0–6)", count:  14, pct:  7 },
        ],
      },
    ],
    recentResponses: [
      { id: "r1", respondentName: "Clara Hughes",  score: 10, comment: "Will definitely be back. You have my complete trust.", respondedOn: "Apr 8" },
      { id: "r2", respondentName: "Devon King",    score: 7,  comment: "Good care but the reminders were excessive.", respondedOn: "Apr 7" },
    ],
  },
];

const SURVEY_GENERATION_OWNERS = [
  "Sarah Chen", "Marcus Webb", "Priya Nair", "James Osei", "Jordan Lee", "Alex Rivera", "Taylor Brooks", "Casey Morgan",
] as const;

const SURVEY_SUBJECTS = [
  "Patient intake experience",
  "Referral pathway feedback",
  "Billing and statements clarity",
  "Front desk courtesy",
  "Clinical wait times",
  "Facility cleanliness",
  "Telehealth session quality",
  "Pharmacy pickup experience",
  "Lab results communication",
  "Discharge instruction clarity",
  "Care team coordination",
  "Follow-up scheduling ease",
  "Insurance benefits literacy",
] as const;

function createGeneratedSurvey(index: number): Survey {
  const i = index - 7;
  const types: SurveyType[] = ["nps", "standard", "custom"];
  const statuses: SurveyStatus[] = ["active", "active", "active", "draft", "closed"];
  const type = types[i % 3];
  const status = statuses[i % 5];
  const subject = SURVEY_SUBJECTS[i % SURVEY_SUBJECTS.length];
  const wave = Math.floor(i / SURVEY_SUBJECTS.length) + 1;
  const name = wave > 1 ? `${subject} (${wave})` : subject;
  const sent = 120 + (i * 37) % 4_200;
  const responses = Math.floor(sent * (0.35 + (i % 5) * 0.08));
  const completionRate = Math.min(98, 62 + (i % 11) * 3);
  const npsScore = type === "nps" ? 35 + (i % 48) : null;
  const owner = SURVEY_GENERATION_OWNERS[i % SURVEY_GENERATION_OWNERS.length];
  const lastUpdated = ["Apr 13, 2026", "Apr 11, 2026", "Apr 8, 2026", "Apr 4, 2026", "Mar 28, 2026", "Mar 15, 2026"][i % 6];

  const questions: Question[] =
    type === "nps"
      ? [
          {
            id: "q1",
            text: "How likely are you to recommend us to a friend or colleague?",
            type: "nps",
            options: [],
          },
        ]
      : type === "standard"
        ? [
            {
              id: "q1",
              text: "How satisfied were you with your overall experience?",
              type: "rating",
              options: [],
            },
          ]
        : [
            {
              id: "q1",
              text: "What is the single biggest improvement we could make?",
              type: "text",
              options: [],
            },
          ];

  return {
    id: `s${index}`,
    name,
    type,
    status,
    sent,
    responses,
    npsScore,
    completionRate,
    lastUpdated,
    owner,
    questions,
    recentResponses: [
      {
        id: "r1",
        respondentName: "Jamie Quinn",
        score: type === "nps" ? 9 : null,
        comment: "Clear questions and quick to complete.",
        respondedOn: "Apr 12",
      },
    ],
  };
}

/** 6 hand-authored seeds + 44 generated rows → 50 directory surveys. */
const SURVEY_CATALOG: Survey[] = [
  ...SURVEY_SEEDS,
  ...Array.from({ length: 44 }, (_, k) => createGeneratedSurvey(7 + k)),
];

const SURVEYS_PAGE_SIZE = 12;

function SurveysLoadMoreShimmer() {
  return (
    <div
      className="flex flex-col gap-2 border-t border-border px-6 py-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading more surveys</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex min-h-[52px] items-center gap-4">
          <div className="inbox-proto-shimmer-block h-4 max-w-[220px] flex-1 rounded-md" />
          <div className="inbox-proto-shimmer-block h-6 w-20 shrink-0 rounded-full" />
          <div className="inbox-proto-shimmer-block h-6 w-24 shrink-0 rounded-full" />
          <div className="inbox-proto-shimmer-block h-4 w-16 shrink-0 rounded-md" />
          <div className="inbox-proto-shimmer-block h-4 w-20 shrink-0 rounded-md" />
          <div className="inbox-proto-shimmer-block h-2 w-24 shrink-0 rounded-full" />
        </div>
      ))}
      <div className="inbox-proto-shimmer-block mx-auto mt-2 h-3 w-40 rounded-full" />
    </div>
  );
}

/* ─── Config ─── */
const TYPE_CONFIG: Record<SurveyType, { label: string; className: string }> = {
  nps:      { label: "NPS",      className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
  standard: { label: "Standard", className: "bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-400"   },
  custom:   { label: "Custom",   className: "bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-400"  },
};

const STATUS_CONFIG: Record<SurveyStatus, { label: string; className: string; icon: React.ElementType }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", icon: CheckCircle2 },
  draft:  { label: "Draft",  className: "bg-slate-50  text-slate-600  dark:bg-slate-800/40  dark:text-slate-400",  icon: Clock },
  closed: { label: "Closed", className: "bg-red-50    text-red-600    dark:bg-red-950/40    dark:text-red-400",    icon: XCircle },
};

const NPS_COLOR_CLASS = (score: number) =>
  score >= 50 ? "text-emerald-600 dark:text-emerald-400" :
  score >= 0  ? "text-amber-600 dark:text-amber-400" :
                "text-red-600 dark:text-red-400";

/* ─── NPS gauge bar ─── */
function NPSBreakdownBar({ promoters, passives, detractors }: { promoters: number; passives: number; detractors: number }) {
  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "Promoters",  pct: promoters,  color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400" },
        { label: "Passives",   pct: passives,   color: "bg-slate-400",   textColor: "text-slate-600 dark:text-slate-400" },
        { label: "Detractors", pct: detractors, color: "bg-red-400",     textColor: "text-red-600 dark:text-red-400" },
      ].map(({ label, pct, color, textColor }) => (
        <div key={label} className="flex items-center gap-3">
          <span className={`text-xs font-medium w-20 shrink-0 ${textColor}`}>{label}</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Question bar chart ─── */
function QuestionBars({ question }: { question: Question }) {
  const BAR_COLORS = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4"];
  if (question.type === "text") {
    return (
      <div className="bg-muted/30 rounded-lg px-4 py-3 text-xs text-muted-foreground italic">
        Open-ended responses — text analysis available in full reports.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {(question.options ?? []).map((opt, i) => (
        <div key={opt.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-36 shrink-0 truncate">{opt.label}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all`} style={{ width: `${opt.pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-16 text-right">{opt.count.toLocaleString()} ({opt.pct}%)</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Survey Reports Sheet ─── */
function SurveyReportsSheet({
  survey,
  open,
  onClose,
}: {
  survey: Survey | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!survey) return null;
  const typeCfg    = TYPE_CONFIG[survey.type];
  const statusCfg  = STATUS_CONFIG[survey.status];
  const StatusIcon = statusCfg.icon;

  const npsPromoters  = survey.questions.find((q) => q.type === "nps")?.options?.[0]?.pct ?? 0;
  const npsPassives   = survey.questions.find((q) => q.type === "nps")?.options?.[1]?.pct ?? 0;
  const npsDetractors = survey.questions.find((q) => q.type === "nps")?.options?.[2]?.pct ?? 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title={survey.name}
          description={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={typeCfg.className}>{typeCfg.label}</Badge>
              <Badge variant="outline" className={`gap-1 ${statusCfg.className}`}>
                <StatusIcon size={10} strokeWidth={1.6} absoluteStrokeWidth />
                {statusCfg.label}
              </Badge>
            </div>
          }
          classNames={{
            footer:
              "flex w-full flex-row flex-wrap justify-start gap-2 border-t border-border sm:justify-start",
          }}
          footer={
            <>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs">
                <Download size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Export responses
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs">
                <Send size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Send survey
              </Button>
            </>
          }
        >
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Send,     label: "Sent",            value: survey.sent.toLocaleString() },
            { icon: Users,    label: "Responses",        value: survey.responses.toLocaleString() },
            { icon: TrendingUp, label: "Completion",    value: `${survey.completionRate}%` },
            ...(survey.npsScore !== null
              ? [{ icon: Star, label: "NPS Score", value: `${survey.npsScore > 0 ? "+" : ""}${survey.npsScore}` }]
              : []),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-muted/30 rounded-xl px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon size={12} strokeWidth={1.6} absoluteStrokeWidth />
                <span className="text-xs">{label}</span>
              </div>
              <span className={`text-xl font-semibold ${label === "NPS Score" && survey.npsScore !== null ? NPS_COLOR_CLASS(survey.npsScore) : "text-foreground"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* NPS breakdown */}
        {survey.type === "nps" && survey.npsScore !== null && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground mb-3">NPS breakdown</p>
            <div className="bg-muted/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-3xl font-bold ${NPS_COLOR_CLASS(survey.npsScore)}`}>
                  {survey.npsScore > 0 ? "+" : ""}{survey.npsScore}
                </span>
                <div>
                  <p className="text-xs font-medium text-foreground">Net Promoter Score</p>
                  <p className="text-xs text-muted-foreground">{survey.responses} respondents</p>
                </div>
              </div>
              <NPSBreakdownBar
                promoters={npsPromoters}
                passives={npsPassives}
                detractors={npsDetractors}
              />
            </div>
          </div>
        )}

        {/* Questions */}
        {survey.questions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground mb-3">Question breakdown</p>
            <div className="flex flex-col gap-5">
              {survey.questions.filter((q) => q.type !== "nps").map((q, idx) => (
                <div key={q.id}>
                  <p className="text-xs text-foreground font-medium mb-2">
                    <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                    {q.text}
                  </p>
                  <QuestionBars question={q} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent responses */}
        {survey.recentResponses.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Recent responses</p>
            <div className="flex flex-col gap-3">
              {survey.recentResponses.map((r) => (
                <div key={r.id} className="bg-muted/20 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">{r.respondentName}</span>
                    <div className="flex items-center gap-2">
                      {r.score !== null && (
                        <span className={`text-xs font-semibold ${r.score >= 9 ? "text-emerald-600 dark:text-emerald-400" : r.score >= 7 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                          {r.score}/10
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{r.respondedOn}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {survey.responses === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart2 size={28} strokeWidth={1.4} absoluteStrokeWidth className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No responses yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {survey.status === "draft" ? "Publish the survey to start collecting responses." : "Responses will appear here once collected."}
            </p>
          </div>
        )}
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Row actions ─── */
function SurveyRowActions({ onViewReports }: { onViewReports: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer">
          <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem className="text-xs cursor-pointer" onClick={onViewReports}>
          <BarChart2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          View reports
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Eye size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Edit3 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Edit survey
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Send size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Distribute
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Copy size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Clone survey
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Copy size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-destructive cursor-pointer focus:text-destructive">
          <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const surveyColumnHelper = createColumnHelper<Survey>();

/* ─── Main view ─── */
export function SurveysView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | "all">("all");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(SURVEYS_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);

  const filtered = useMemo(
    () =>
      SURVEY_CATALOG.filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.owner.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter],
  );

  useEffect(() => {
    loadMoreLockRef.current = false;
    setVisibleCount(Math.min(SURVEYS_PAGE_SIZE, Math.max(filtered.length, 0)));
  }, [search, statusFilter, filtered.length]);

  useEffect(() => {
    const root = listScrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || filtered.length === 0 || visibleCount >= filtered.length || isLoadingMore) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting ||
          isLoadingMore ||
          loadMoreLockRef.current ||
          visibleCount >= filtered.length
        ) {
          return;
        }
        loadMoreLockRef.current = true;
        setIsLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount((c) => Math.min(c + SURVEYS_PAGE_SIZE, filtered.length));
          setIsLoadingMore(false);
          loadMoreLockRef.current = false;
        }, 780);
      },
      { root, rootMargin: "96px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, isLoadingMore, visibleCount]);

  const pagedSurveys = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const openReports = useCallback((survey: Survey) => {
    setSelectedSurvey(survey);
    setSheetOpen(true);
  }, []);

  const STATUS_OPTS: { label: string; value: SurveyStatus | "all" }[] = [
    { label: "All status", value: "all" },
    { label: "Active",     value: "active" },
    { label: "Draft",      value: "draft" },
    { label: "Closed",     value: "closed" },
  ];

  const activeSurveys = SURVEY_CATALOG.filter((s) => s.status === "active").length;
  const totalResponses = SURVEY_CATALOG.reduce((sum, s) => sum + s.responses, 0);

  const surveyColumns = useMemo(
    () => [
      surveyColumnHelper.accessor("name", {
        id: "name",
        header: "Survey name",
        meta: { settingsLabel: "Survey name" },
        size: 220,
        enableSorting: true,
        cell: (info) => (
          <p className="font-medium text-foreground">{info.getValue()}</p>
        ),
      }),
      surveyColumnHelper.accessor("type", {
        id: "type",
        header: "Type",
        meta: { settingsLabel: "Type" },
        size: 96,
        enableSorting: true,
        cell: (info) => {
          const typeCfg = TYPE_CONFIG[info.getValue()];
          return (
            <Badge variant="outline" className={typeCfg.className}>
              {typeCfg.label}
            </Badge>
          );
        },
      }),
      surveyColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 96,
        enableSorting: true,
        cell: (info) => {
          const statusCfg = STATUS_CONFIG[info.getValue()];
          const RowStatusIcon = statusCfg.icon;
          return (
            <Badge variant="outline" className={`gap-1 ${statusCfg.className}`}>
              <RowStatusIcon size={10} strokeWidth={1.6} absoluteStrokeWidth />
              {statusCfg.label}
            </Badge>
          );
        },
      }),
      surveyColumnHelper.accessor("sent", {
        id: "sent",
        header: "Sent",
        meta: { settingsLabel: "Sent" },
        size: 88,
        enableSorting: true,
        cell: (info) => {
          const n = info.getValue();
          return (
            <span className="block text-left text-muted-foreground tabular-nums">
              {n ? n.toLocaleString() : "—"}
            </span>
          );
        },
      }),
      surveyColumnHelper.accessor("responses", {
        id: "responses",
        header: "Responses",
        meta: { settingsLabel: "Responses" },
        size: 104,
        enableSorting: true,
        cell: (info) => {
          const n = info.getValue();
          return (
            <span className="block text-left text-muted-foreground tabular-nums">
              {n ? n.toLocaleString() : "—"}
            </span>
          );
        },
      }),
      surveyColumnHelper.accessor("completionRate", {
        id: "completion",
        header: "Completion",
        meta: { settingsLabel: "Completion" },
        size: 120,
        enableSorting: true,
        cell: (info) => {
          const survey = info.row.original;
          return survey.completionRate > 0 ? (
            <div className="flex items-center justify-start gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${survey.completionRate}%` }}
                />
              </div>
              <span className="text-muted-foreground tabular-nums">{survey.completionRate}%</span>
            </div>
          ) : (
            <span className="block text-left text-muted-foreground">—</span>
          );
        },
      }),
      surveyColumnHelper.accessor("npsScore", {
        id: "nps",
        header: () => (
          <Tooltip>
            <TooltipTrigger className="cursor-default">NPS score</TooltipTrigger>
            <TooltipContent className="text-xs">Net Promoter Score (NPS surveys only)</TooltipContent>
          </Tooltip>
        ),
        meta: { settingsLabel: "NPS score" },
        size: 96,
        enableSorting: true,
        cell: (info) => {
          const score = info.getValue();
          return score !== null ? (
            <span className={`block text-left font-semibold ${NPS_COLOR_CLASS(score)}`}>
              {score > 0 ? "+" : ""}
              {score}
            </span>
          ) : (
            <span className="block text-left text-muted-foreground">—</span>
          );
        },
      }),
      surveyColumnHelper.accessor("lastUpdated", {
        id: "lastUpdated",
        header: "Last updated",
        meta: { settingsLabel: "Last updated" },
        size: 128,
        enableSorting: true,
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      surveyColumnHelper.accessor("owner", {
        id: "owner",
        header: "Owner",
        meta: { settingsLabel: "Owner" },
        size: 128,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      surveyColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-left">
            <SurveyRowActions onViewReports={() => openReports(row.original)} />
          </div>
        ),
      }),
    ],
    [openReports],
  );

  const surveysEmpty = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">No surveys match your search.</p>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <MainCanvasViewHeader
          title="Surveys"
          description={`${activeSurveys} active · ${totalResponses.toLocaleString()} total responses`}
        />

        {/* ── Table card ── */}
        <div className="mx-6 mb-6 flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <div ref={listScrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <AppDataTable<Survey>
              tableId="surveys.directory"
              data={pagedSurveys}
              columns={surveyColumns}
              initialSorting={[{ id: "lastUpdated", desc: true }]}
              onRowClick={openReports}
              getRowId={(row) => row.id}
              emptyState={surveysEmpty}
              columnSheetTitle="Survey columns"
              className="min-h-0 min-w-0 px-0"
              stickyToolbar
              toolbarLeft={
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <div className="relative max-w-xs flex-1">
                    <Search
                      size={13}
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search surveys…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Survey status: ${STATUS_OPTS.find((o) => o.value === statusFilter)?.label ?? "All status"}`}
                        title={`Survey status: ${STATUS_OPTS.find((o) => o.value === statusFilter)?.label ?? "All status"}`}
                      >
                        <Filter className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                      {STATUS_OPTS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          className="cursor-pointer text-xs"
                          onClick={() => setStatusFilter(opt.value)}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      aria-label="Export surveys"
                      title="Export surveys"
                    >
                      <Download className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    </Button>
                  </div>
                </div>
              }
            />
            {isLoadingMore ? <SurveysLoadMoreShimmer /> : null}
            {visibleCount < filtered.length && !isLoadingMore ? (
              <div ref={sentinelRef} className="h-2 w-full shrink-0" aria-hidden />
            ) : null}
            {visibleCount >= filtered.length && filtered.length > 0 ? (
              <p className="px-6 pb-4 text-center text-xs text-muted-foreground">
                All {filtered.length} matching survey{filtered.length !== 1 ? "s" : ""} loaded
              </p>
            ) : null}
          </div>
        </div>

        {/* ── Reports Sheet ── */}
        <SurveyReportsSheet
          survey={selectedSurvey}
          open={sheetOpen}
          onClose={() => { setSheetOpen(false); setSelectedSurvey(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
