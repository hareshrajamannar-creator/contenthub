import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Search, MoreHorizontal, Mail, Smartphone, BarChart2, Edit3,
  Copy, Trash2, Users, Send, MousePointerClick,
  PauseCircle, Clock, Calendar, Play,
  UserMinus, Star, RefreshCw, Tags, Filter,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/app/components/ui/tooltip";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";

/* ─── Types ─── */
type CampaignType = "review_request" | "referral" | "survey" | "promotional" | "customer_experience";
type CampaignStatus = "active" | "paused" | "draft" | "completed" | "scheduled";
type CampaignMedium = "email" | "sms" | "both";
type CampaignTab = "campaigns" | "automations";

interface ActivityRow {
  id: string;
  name: string;
  action: "Opened" | "Clicked" | "Unsubscribed";
  timestamp: string;
}

interface Campaign {
  id: string;
  name: string;
  tab: CampaignTab;
  medium: CampaignMedium;
  type: CampaignType;
  status: CampaignStatus;
  contacts: number;
  opened: number;
  openedPct: number;
  clicked: number;
  clickedPct: number;
  lastRun: string;
  createdBy: string;
  created: string;
  scheduleType: string;
  recentActivity: ActivityRow[];
  unsubscribed: number;
  unsubscribedPct: number;
}

/* ─── Mock data ─── */
const CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Spring Promo – 20% Off Services",
    tab: "campaigns",
    medium: "email",
    type: "promotional",
    status: "active",
    contacts: 1840,
    opened: 612,
    openedPct: 33,
    clicked: 287,
    clickedPct: 16,
    lastRun: "Apr 12, 2026",
    createdBy: "Sarah Chen",
    created: "Apr 8, 2026",
    scheduleType: "One-time",
    unsubscribed: 14,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Lisa Monroe",    action: "Opened",       timestamp: "Apr 12, 2:14 PM" },
      { id: "a2", name: "Tom Harrington", action: "Clicked",      timestamp: "Apr 12, 1:58 PM" },
      { id: "a3", name: "Aisha Rahman",   action: "Opened",       timestamp: "Apr 12, 1:33 PM" },
      { id: "a4", name: "Carlos Vega",    action: "Unsubscribed", timestamp: "Apr 12, 12:47 PM" },
      { id: "a5", name: "Nina Petrov",    action: "Clicked",      timestamp: "Apr 12, 11:22 AM" },
    ],
  },
  {
    id: "c2",
    name: "Review Request – Post Visit",
    tab: "campaigns",
    medium: "sms",
    type: "review_request",
    status: "active",
    contacts: 3200,
    opened: 1856,
    openedPct: 58,
    clicked: 924,
    clickedPct: 29,
    lastRun: "Apr 13, 2026",
    createdBy: "Marcus Webb",
    created: "Apr 11, 2026",
    scheduleType: "One-time",
    unsubscribed: 22,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Oliver Grant",  action: "Clicked",      timestamp: "Apr 13, 9:41 AM" },
      { id: "a2", name: "Fiona Blake",   action: "Opened",       timestamp: "Apr 13, 9:18 AM" },
      { id: "a3", name: "David Park",    action: "Opened",       timestamp: "Apr 13, 8:55 AM" },
      { id: "a4", name: "Maria Santos",  action: "Clicked",      timestamp: "Apr 13, 8:30 AM" },
      { id: "a5", name: "Ben Nakamura",  action: "Unsubscribed", timestamp: "Apr 13, 7:44 AM" },
    ],
  },
  {
    id: "c3",
    name: "Q1 Referral Drive",
    tab: "campaigns",
    medium: "both",
    type: "referral",
    status: "completed",
    contacts: 960,
    opened: 441,
    openedPct: 46,
    clicked: 182,
    clickedPct: 19,
    lastRun: "Mar 31, 2026",
    createdBy: "Priya Nair",
    created: "Mar 20, 2026",
    scheduleType: "One-time",
    unsubscribed: 6,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Devon King",   action: "Clicked",  timestamp: "Mar 31, 5:02 PM" },
      { id: "a2", name: "Clara Hughes", action: "Opened",   timestamp: "Mar 31, 4:39 PM" },
      { id: "a3", name: "Elena Watts",  action: "Opened",   timestamp: "Mar 31, 3:15 PM" },
      { id: "a4", name: "Sam Rivers",   action: "Clicked",  timestamp: "Mar 31, 2:44 PM" },
      { id: "a5", name: "Joy Okonkwo",  action: "Opened",   timestamp: "Mar 31, 1:20 PM" },
    ],
  },
  {
    id: "c4",
    name: "Patient Satisfaction Survey",
    tab: "campaigns",
    medium: "email",
    type: "survey",
    status: "draft",
    contacts: 0,
    opened: 0,
    openedPct: 0,
    clicked: 0,
    clickedPct: 0,
    lastRun: "—",
    createdBy: "James Osei",
    created: "Apr 10, 2026",
    scheduleType: "Not scheduled",
    unsubscribed: 0,
    unsubscribedPct: 0,
    recentActivity: [],
  },
  {
    id: "c5",
    name: "Win-Back Inactive Clients",
    tab: "campaigns",
    medium: "email",
    type: "customer_experience",
    status: "scheduled",
    contacts: 540,
    opened: 0,
    openedPct: 0,
    clicked: 0,
    clickedPct: 0,
    lastRun: "Apr 20, 2026",
    createdBy: "Sarah Chen",
    created: "Apr 13, 2026",
    scheduleType: "Scheduled – Apr 20, 2026",
    unsubscribed: 0,
    unsubscribedPct: 0,
    recentActivity: [],
  },
  {
    id: "a1",
    name: "Post-Appointment Review Request",
    tab: "automations",
    medium: "sms",
    type: "review_request",
    status: "active",
    contacts: 8420,
    opened: 4884,
    openedPct: 58,
    clicked: 2442,
    clickedPct: 29,
    lastRun: "Ongoing",
    createdBy: "Marcus Webb",
    created: "Jan 15, 2026",
    scheduleType: "Triggered – post-appointment",
    unsubscribed: 48,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Rachel Kim",    action: "Clicked",      timestamp: "Apr 14, 10:02 AM" },
      { id: "a2", name: "Luke Brennan",  action: "Opened",       timestamp: "Apr 14, 9:48 AM" },
      { id: "a3", name: "Sasha Patel",   action: "Opened",       timestamp: "Apr 14, 9:22 AM" },
      { id: "a4", name: "Meg Foster",    action: "Unsubscribed", timestamp: "Apr 14, 8:55 AM" },
      { id: "a5", name: "Finn Murphy",   action: "Clicked",      timestamp: "Apr 14, 8:31 AM" },
    ],
  },
  {
    id: "a2",
    name: "Birthday Offer",
    tab: "automations",
    medium: "email",
    type: "promotional",
    status: "active",
    contacts: 1140,
    opened: 570,
    openedPct: 50,
    clicked: 228,
    clickedPct: 20,
    lastRun: "Ongoing",
    createdBy: "Priya Nair",
    created: "Feb 1, 2026",
    scheduleType: "Triggered – birthday",
    unsubscribed: 9,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Zara Ahmed",   action: "Opened",  timestamp: "Apr 14, 7:00 AM" },
      { id: "a2", name: "Hugo Blanc",   action: "Clicked", timestamp: "Apr 13, 7:04 AM" },
      { id: "a3", name: "Isla Ramos",   action: "Opened",  timestamp: "Apr 12, 7:01 AM" },
      { id: "a4", name: "Chris Lane",   action: "Clicked", timestamp: "Apr 11, 7:02 AM" },
      { id: "a5", name: "Daisy Ford",   action: "Opened",  timestamp: "Apr 10, 7:00 AM" },
    ],
  },
  {
    id: "a3",
    name: "NPS Follow-Up",
    tab: "automations",
    medium: "email",
    type: "survey",
    status: "paused",
    contacts: 2600,
    opened: 1118,
    openedPct: 43,
    clicked: 0,
    clickedPct: 0,
    lastRun: "Apr 1, 2026",
    createdBy: "James Osei",
    created: "Mar 1, 2026",
    scheduleType: "Triggered – post-survey",
    unsubscribed: 31,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a1", name: "Ann Fischer",   action: "Opened",       timestamp: "Apr 1, 3:12 PM" },
      { id: "a2", name: "Raj Mehta",     action: "Opened",       timestamp: "Apr 1, 2:54 PM" },
      { id: "a3", name: "Tara Simmons",  action: "Unsubscribed", timestamp: "Apr 1, 1:30 PM" },
      { id: "a4", name: "Marco Silva",   action: "Opened",       timestamp: "Apr 1, 11:48 AM" },
      { id: "a5", name: "Beth Collins",  action: "Opened",       timestamp: "Apr 1, 10:22 AM" },
    ],
  },
  {
    id: "c6",
    name: "Summer re-engagement series",
    tab: "campaigns",
    medium: "email",
    type: "customer_experience",
    status: "completed",
    contacts: 4150,
    opened: 1826,
    openedPct: 44,
    clicked: 623,
    clickedPct: 15,
    lastRun: "Apr 8, 2026",
    createdBy: "Sarah Chen",
    created: "Mar 28, 2026",
    scheduleType: "Drip – 3 messages",
    unsubscribed: 41,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "c6-1", name: "Will Torres",   action: "Clicked",      timestamp: "Apr 8, 4:18 PM" },
      { id: "c6-2", name: "Emma Frost",    action: "Opened",       timestamp: "Apr 8, 3:52 PM" },
      { id: "c6-3", name: "Noah Briggs",   action: "Opened",       timestamp: "Apr 8, 2:30 PM" },
      { id: "c6-4", name: "Ivy Chen",      action: "Clicked",      timestamp: "Apr 8, 1:44 PM" },
      { id: "c6-5", name: "Paul Rhodes",   action: "Unsubscribed", timestamp: "Apr 8, 12:09 PM" },
    ],
  },
  {
    id: "c7",
    name: "SMS appointment reminders",
    tab: "campaigns",
    medium: "sms",
    type: "customer_experience",
    status: "active",
    contacts: 12880,
    opened: 7728,
    openedPct: 60,
    clicked: 3091,
    clickedPct: 24,
    lastRun: "Apr 14, 2026",
    createdBy: "Marcus Webb",
    created: "Jan 4, 2026",
    scheduleType: "Recurring – weekly",
    unsubscribed: 64,
    unsubscribedPct: 0,
    recentActivity: [
      { id: "c7-1", name: "Grace Holt",    action: "Clicked", timestamp: "Apr 14, 11:20 AM" },
      { id: "c7-2", name: "Theo Banks",    action: "Opened",  timestamp: "Apr 14, 10:58 AM" },
      { id: "c7-3", name: "Mia Ortiz",     action: "Opened",  timestamp: "Apr 14, 10:12 AM" },
      { id: "c7-4", name: "Jake Powell",   action: "Clicked", timestamp: "Apr 14, 9:41 AM" },
      { id: "c7-5", name: "Lena Brooks",   action: "Opened",  timestamp: "Apr 14, 9:05 AM" },
    ],
  },
  {
    id: "c8",
    name: "Loyalty tier upgrade offer",
    tab: "campaigns",
    medium: "both",
    type: "referral",
    status: "scheduled",
    contacts: 2100,
    opened: 0,
    openedPct: 0,
    clicked: 0,
    clickedPct: 0,
    lastRun: "Apr 25, 2026",
    createdBy: "Priya Nair",
    created: "Apr 14, 2026",
    scheduleType: "Scheduled – Apr 25, 2026",
    unsubscribed: 0,
    unsubscribedPct: 0,
    recentActivity: [],
  },
  {
    id: "c9",
    name: "Flash sale – weekend only",
    tab: "campaigns",
    medium: "email",
    type: "promotional",
    status: "draft",
    contacts: 0,
    opened: 0,
    openedPct: 0,
    clicked: 0,
    clickedPct: 0,
    lastRun: "—",
    createdBy: "Sarah Chen",
    created: "Apr 13, 2026",
    scheduleType: "Not scheduled",
    unsubscribed: 0,
    unsubscribedPct: 0,
    recentActivity: [],
  },
  {
    id: "c10",
    name: "Staff training feedback form",
    tab: "campaigns",
    medium: "email",
    type: "survey",
    status: "completed",
    contacts: 86,
    opened: 74,
    openedPct: 86,
    clicked: 52,
    clickedPct: 60,
    lastRun: "Apr 5, 2026",
    createdBy: "James Osei",
    created: "Mar 30, 2026",
    scheduleType: "One-time",
    unsubscribed: 0,
    unsubscribedPct: 0,
    recentActivity: [
      { id: "c10-1", name: "Kate Nguyen",   action: "Clicked", timestamp: "Apr 5, 2:10 PM" },
      { id: "c10-2", name: "Alex Ruiz",     action: "Opened",  timestamp: "Apr 5, 1:55 PM" },
      { id: "c10-3", name: "Sam Lee",       action: "Opened",  timestamp: "Apr 5, 1:22 PM" },
      { id: "c10-4", name: "Jordan Cole",   action: "Clicked", timestamp: "Apr 5, 12:48 PM" },
      { id: "c10-5", name: "Riley Stone",   action: "Opened",  timestamp: "Apr 5, 11:30 AM" },
    ],
  },
  {
    id: "c11",
    name: "Holiday hours announcement",
    tab: "campaigns",
    medium: "sms",
    type: "promotional",
    status: "active",
    contacts: 5100,
    opened: 2958,
    openedPct: 58,
    clicked: 1173,
    clickedPct: 23,
    lastRun: "Apr 11, 2026",
    createdBy: "Marcus Webb",
    created: "Apr 9, 2026",
    scheduleType: "One-time",
    unsubscribed: 18,
    unsubscribedPct: 0,
    recentActivity: [
      { id: "c11-1", name: "Casey Wu",      action: "Opened",  timestamp: "Apr 11, 6:12 PM" },
      { id: "c11-2", name: "Drew Hayes",    action: "Clicked", timestamp: "Apr 11, 5:50 PM" },
      { id: "c11-3", name: "Quinn Avery",   action: "Opened",  timestamp: "Apr 11, 5:18 PM" },
      { id: "c11-4", name: "Reese Morgan",  action: "Clicked", timestamp: "Apr 11, 4:44 PM" },
      { id: "c11-5", name: "Skyler Fox",    action: "Opened",  timestamp: "Apr 11, 4:02 PM" },
    ],
  },
  {
    id: "a4",
    name: "Abandoned booking recovery",
    tab: "automations",
    medium: "email",
    type: "promotional",
    status: "active",
    contacts: 3920,
    opened: 1921,
    openedPct: 49,
    clicked: 862,
    clickedPct: 22,
    lastRun: "Ongoing",
    createdBy: "Priya Nair",
    created: "Dec 10, 2025",
    scheduleType: "Triggered – abandoned cart",
    unsubscribed: 27,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a4-1", name: "Vanessa Cruz",  action: "Clicked", timestamp: "Apr 14, 3:40 PM" },
      { id: "a4-2", name: "Ethan Shaw",    action: "Opened",  timestamp: "Apr 14, 3:12 PM" },
      { id: "a4-3", name: "Nora Diaz",     action: "Opened",  timestamp: "Apr 14, 2:58 PM" },
      { id: "a4-4", name: "Ian Mercer",    action: "Clicked", timestamp: "Apr 14, 2:21 PM" },
      { id: "a4-5", name: "Paige Turner",  action: "Opened",  timestamp: "Apr 14, 1:47 PM" },
    ],
  },
  {
    id: "a5",
    name: "Annual wellness check-in",
    tab: "automations",
    medium: "both",
    type: "customer_experience",
    status: "paused",
    contacts: 1840,
    opened: 956,
    openedPct: 52,
    clicked: 0,
    clickedPct: 0,
    lastRun: "Mar 22, 2026",
    createdBy: "James Osei",
    created: "Feb 18, 2026",
    scheduleType: "Triggered – annual visit",
    unsubscribed: 12,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a5-1", name: "Wes Dalton",    action: "Opened",       timestamp: "Mar 22, 4:05 PM" },
      { id: "a5-2", name: "Tessa Boyd",    action: "Opened",       timestamp: "Mar 22, 3:18 PM" },
      { id: "a5-3", name: "Gabe Warren",   action: "Unsubscribed", timestamp: "Mar 22, 2:22 PM" },
      { id: "a5-4", name: "Hope Manning",  action: "Opened",       timestamp: "Mar 22, 1:50 PM" },
      { id: "a5-5", name: "Caleb Frost",   action: "Opened",       timestamp: "Mar 22, 12:33 PM" },
    ],
  },
  {
    id: "a6",
    name: "Welcome series – new clients",
    tab: "automations",
    medium: "email",
    type: "customer_experience",
    status: "active",
    contacts: 6720,
    opened: 4234,
    openedPct: 63,
    clicked: 2117,
    clickedPct: 32,
    lastRun: "Ongoing",
    createdBy: "Sarah Chen",
    created: "Nov 2, 2025",
    scheduleType: "Triggered – new signup",
    unsubscribed: 34,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a6-1", name: "Morgan Ellis",  action: "Opened",  timestamp: "Apr 14, 8:22 AM" },
      { id: "a6-2", name: "Blake Rowe",    action: "Clicked", timestamp: "Apr 14, 8:05 AM" },
      { id: "a6-3", name: "Cameron Vance", action: "Opened",  timestamp: "Apr 14, 7:48 AM" },
      { id: "a6-4", name: "Rowan Steele",  action: "Clicked", timestamp: "Apr 14, 7:31 AM" },
      { id: "a6-5", name: "Sydney Blake",  action: "Opened",  timestamp: "Apr 14, 7:10 AM" },
    ],
  },
  {
    id: "a7",
    name: "No-show follow-up",
    tab: "automations",
    medium: "sms",
    type: "review_request",
    status: "active",
    contacts: 2890,
    opened: 1734,
    openedPct: 60,
    clicked: 752,
    clickedPct: 26,
    lastRun: "Ongoing",
    createdBy: "Marcus Webb",
    created: "Mar 5, 2026",
    scheduleType: "Triggered – missed appointment",
    unsubscribed: 19,
    unsubscribedPct: 1,
    recentActivity: [
      { id: "a7-1", name: "Harper Reid",   action: "Clicked", timestamp: "Apr 14, 5:55 PM" },
      { id: "a7-2", name: "Logan Pierce",  action: "Opened",  timestamp: "Apr 14, 5:30 PM" },
      { id: "a7-3", name: "Parker James",  action: "Opened",  timestamp: "Apr 14, 5:02 PM" },
      { id: "a7-4", name: "Reagan Wells",  action: "Clicked", timestamp: "Apr 14, 4:38 PM" },
      { id: "a7-5", name: "Spencer Dale",  action: "Opened",  timestamp: "Apr 14, 4:11 PM" },
    ],
  },
];

/* ─── Config maps ─── */
const TYPE_CONFIG: Record<CampaignType, { label: string }> = {
  review_request:      { label: "Review Request" },
  referral:            { label: "Referral" },
  survey:              { label: "Survey" },
  promotional:         { label: "Promotional" },
  customer_experience: { label: "Customer Experience" },
};

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  active:    { label: "Active",    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  paused:    { label: "Paused",    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  draft:     { label: "Draft",     className: "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400" },
  completed: { label: "Completed", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  scheduled: { label: "Scheduled", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
};

const MEDIUM_CONFIG: Record<CampaignMedium, { label: string; icon: React.ElementType }> = {
  email: { label: "Email", icon: Mail },
  sms:   { label: "SMS",   icon: Smartphone },
  both:  { label: "Both",  icon: Mail },
};

const ACTIVITY_CONFIG: Record<ActivityRow["action"], { className: string; icon: React.ElementType }> = {
  Opened:       { className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",         icon: Mail },
  Clicked:      { className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", icon: MousePointerClick },
  Unsubscribed: { className: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",              icon: UserMinus },
};

const MEDIUM_ICON_CLASS = "size-4 shrink-0 text-muted-foreground";

/* ─── Channel icons (email / SMS) — icon-only, 1px stroke; labels via aria only ─── */
function MediumBadge({ medium }: { medium: CampaignMedium }) {
  if (medium === "both") {
    return (
      <span
        className="inline-flex items-center gap-1"
        role="img"
        aria-label={`${MEDIUM_CONFIG.email.label} and ${MEDIUM_CONFIG.sms.label}`}
      >
        <Mail className={MEDIUM_ICON_CLASS} strokeWidth={1} absoluteStrokeWidth aria-hidden />
        <Smartphone className={MEDIUM_ICON_CLASS} strokeWidth={1} absoluteStrokeWidth aria-hidden />
      </span>
    );
  }
  const cfg = MEDIUM_CONFIG[medium];
  const Icon = cfg.icon;
  return (
    <span role="img" aria-label={cfg.label} title={cfg.label}>
      <Icon className={MEDIUM_ICON_CLASS} strokeWidth={1} absoluteStrokeWidth aria-hidden />
    </span>
  );
}

/* ─── Stat tile ─── */
function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-muted/30 rounded-xl px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={12} strokeWidth={1.6} absoluteStrokeWidth />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xl font-semibold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

/* ─── Campaign Detail Sheet ─── */
function CampaignDetailSheet({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!campaign) return null;
  const typeCfg    = TYPE_CONFIG[campaign.type];
  const statusCfg  = STATUS_CONFIG[campaign.status];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title={campaign.name}
          description={
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{typeCfg.label}</span>
              <Badge variant="outline" className={statusCfg.className}>
                {statusCfg.label}
              </Badge>
              <MediumBadge medium={campaign.medium} />
            </div>
          }
          classNames={{
            footer:
              "flex w-full flex-row flex-wrap justify-start gap-2 border-t border-border sm:justify-start",
          }}
          footer={
            <>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs">
                <BarChart2 size={12} strokeWidth={1.6} absoluteStrokeWidth />
                View report
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs">
                <Edit3 size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Edit campaign
              </Button>
            </>
          }
        >
        {/* Summary tiles */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatTile
            icon={Users}
            label="Contacts Sent"
            value={campaign.contacts.toLocaleString()}
          />
          <StatTile
            icon={Mail}
            label="Opened"
            value={campaign.opened.toLocaleString()}
            sub={campaign.openedPct > 0 ? `${campaign.openedPct}% open rate` : undefined}
          />
          <StatTile
            icon={MousePointerClick}
            label="Clicked"
            value={campaign.clicked.toLocaleString()}
            sub={campaign.clickedPct > 0 ? `${campaign.clickedPct}% click rate` : undefined}
          />
          <StatTile
            icon={UserMinus}
            label="Unsubscribed"
            value={campaign.unsubscribed.toLocaleString()}
            sub={campaign.unsubscribedPct > 0 ? `${campaign.unsubscribedPct}% unsub rate` : undefined}
          />
        </div>

        {/* Timeline info */}
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-3">Timeline</p>
          <div className="bg-muted/20 rounded-xl px-4 py-3 flex flex-col gap-2">
            {[
              { label: "Created",       value: campaign.created,      icon: Clock },
              { label: "Last run",      value: campaign.lastRun,      icon: RefreshCw },
              { label: "Schedule type", value: campaign.scheduleType, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  <span className="text-xs">{label}</span>
                </div>
                <span className="text-xs text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        {campaign.recentActivity.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Recent activity</p>
            <div className="flex flex-col gap-2">
              {campaign.recentActivity.map((row) => {
                const actCfg = ACTIVITY_CONFIG[row.action];
                const ActIcon = actCfg.icon;
                return (
                  <div key={row.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{row.name}</p>
                        <Badge variant="outline" className={`gap-1 mt-0.5 ${actCfg.className}`}>
                          <ActIcon size={9} strokeWidth={1.6} absoluteStrokeWidth />
                          {row.action}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{row.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Send size={28} strokeWidth={1.4} absoluteStrokeWidth className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {campaign.status === "draft"
                ? "Publish this campaign to start sending."
                : "Activity will appear here once the campaign runs."}
            </p>
          </div>
        )}
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Row actions dropdown ─── */
function CampaignRowActions({
  campaign,
  onViewReport,
}: {
  campaign: Campaign;
  onViewReport: () => void;
}) {
  const isPaused  = campaign.status === "paused";
  const isActive  = campaign.status === "active";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="text-xs cursor-pointer" onClick={onViewReport}>
          <BarChart2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          View report
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Edit3 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Copy size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Clone
        </DropdownMenuItem>
        {(isActive || isPaused) && (
          <DropdownMenuItem className="text-xs cursor-pointer">
            {isActive ? (
              <>
                <PauseCircle size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
                Resume
              </>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs cursor-pointer text-destructive focus:text-destructive">
          <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const campaignColumnHelper = createColumnHelper<Campaign>();

const CAMPAIGN_TYPE_FILTER_OPTS: { label: string; value: CampaignType | "all" }[] = [
  { label: "All types", value: "all" },
  { label: "Review Request", value: "review_request" },
  { label: "Referral", value: "referral" },
  { label: "Survey", value: "survey" },
  { label: "Promotional", value: "promotional" },
  { label: "Customer Experience", value: "customer_experience" },
];

const CAMPAIGN_STATUS_FILTER_OPTS: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
  { label: "Scheduled", value: "scheduled" },
];

/* ─── Campaign table ─── */
function CampaignTable({
  campaigns,
  onRowClick,
  columnSheetOpen,
  onColumnSheetOpenChange,
}: {
  campaigns: Campaign[];
  onRowClick: (c: Campaign) => void;
  columnSheetOpen: boolean;
  onColumnSheetOpenChange: (open: boolean) => void;
}) {
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Send size={28} strokeWidth={1.4} absoluteStrokeWidth className="text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">No campaigns found</p>
      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
    </div>
  );

  const columns = useMemo(
    () => [
      campaignColumnHelper.accessor("name", {
        id: "name",
        header: "Campaign name",
        meta: { settingsLabel: "Campaign name" },
        size: 280,
        minSize: 200,
        enableSorting: true,
        cell: (info) => {
          const campaign = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">{campaign.name}</p>
              <MediumBadge medium={campaign.medium} />
            </div>
          );
        },
      }),
      campaignColumnHelper.accessor("type", {
        id: "type",
        header: "Type",
        meta: { settingsLabel: "Type" },
        size: 150,
        enableSorting: true,
        cell: (info) => (
          <span className="text-muted-foreground">{TYPE_CONFIG[info.getValue()].label}</span>
        ),
      }),
      campaignColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 120,
        enableSorting: true,
        cell: (info) => {
          const statusCfg = STATUS_CONFIG[info.getValue()];
          return (
            <Badge variant="outline" className={statusCfg.className}>
              {statusCfg.label}
            </Badge>
          );
        },
      }),
      campaignColumnHelper.accessor("contacts", {
        id: "contacts",
        header: "Contacts",
        meta: { settingsLabel: "Contacts" },
        size: 96,
        enableSorting: true,
        cell: (info) => {
          const n = info.getValue();
          return (
            <span className="block text-left text-muted-foreground tabular-nums">
              {n > 0 ? n.toLocaleString() : "—"}
            </span>
          );
        },
      }),
      campaignColumnHelper.accessor("opened", {
        id: "opened",
        header: "Opened",
        meta: { settingsLabel: "Opened" },
        size: 110,
        enableSorting: true,
        cell: (info) => {
          const campaign = info.row.original;
          return campaign.opened > 0 ? (
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium text-foreground tabular-nums">{campaign.opened.toLocaleString()}</span>
              <span className="text-muted-foreground tabular-nums">{campaign.openedPct}%</span>
            </div>
          ) : (
            <span className="block text-left text-muted-foreground">—</span>
          );
        },
      }),
      campaignColumnHelper.accessor("clicked", {
        id: "clicked",
        header: "Clicked",
        meta: { settingsLabel: "Clicked" },
        size: 110,
        enableSorting: true,
        cell: (info) => {
          const campaign = info.row.original;
          return campaign.clicked > 0 ? (
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium text-foreground tabular-nums">{campaign.clicked.toLocaleString()}</span>
              <span className="text-muted-foreground tabular-nums">{campaign.clickedPct}%</span>
            </div>
          ) : (
            <span className="block text-left text-muted-foreground">—</span>
          );
        },
      }),
      campaignColumnHelper.accessor("lastRun", {
        id: "lastRun",
        header: "Last run",
        meta: { settingsLabel: "Last run" },
        size: 128,
        enableSorting: true,
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      campaignColumnHelper.accessor("createdBy", {
        id: "createdBy",
        header: "Created by",
        meta: { settingsLabel: "Created by" },
        size: 140,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      campaignColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        minSize: 48,
        maxSize: 64,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: (info) => (
          <div className="text-left">
            <CampaignRowActions
              campaign={info.row.original}
              onViewReport={() => onRowClick(info.row.original)}
            />
          </div>
        ),
      }),
    ],
    [onRowClick],
  );

  return (
    <AppDataTable<Campaign>
      tableId="campaigns.directory"
      data={campaigns}
      columns={columns}
      initialSorting={[{ id: "name", desc: false }]}
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      emptyState={emptyState}
      columnSheetTitle="Campaign columns"
      className="min-h-0 min-w-0 flex-1 px-0"
      hideColumnsButton
      columnSheetOpen={columnSheetOpen}
      onColumnSheetOpenChange={onColumnSheetOpenChange}
    />
  );
}

/* ─── Main export ─── */
export function CampaignsView() {
  const [search, setSearch]             = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [typeFilter, setTypeFilter]     = useState<CampaignType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [selected, setSelected]         = useState<Campaign | null>(null);
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const openSheet = (campaign: Campaign) => {
    setSelected(campaign);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelected(null);
  };

  const filteredCampaigns = useMemo(
    () =>
      CAMPAIGNS.filter((c) => {
        const matchSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.createdBy.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || c.type === typeFilter;
        const matchStatus = statusFilter === "all" || c.status === statusFilter;
        return matchSearch && matchType && matchStatus;
      }),
    [search, typeFilter, statusFilter],
  );

  const activeCampaigns = CAMPAIGNS.filter((c) => c.status === "active").length;
  const totalSent       = CAMPAIGNS.reduce((sum, c) => sum + c.contacts, 0);

  const activeTypeLabel =
    CAMPAIGN_TYPE_FILTER_OPTS.find((o) => o.value === typeFilter)?.label ?? "All types";
  const activeStatusLabel =
    CAMPAIGN_STATUS_FILTER_OPTS.find((o) => o.value === statusFilter)?.label ?? "All statuses";

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <MainCanvasViewHeader
          title="Manage Automations"
          description={`${activeCampaigns} active · ${totalSent.toLocaleString()} total sent`}
          actions={
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <div className="relative h-[var(--button-height)] w-[min(100%,240px)] min-w-[200px] shrink">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2 size-[14px] -translate-y-1/2 text-[#303030] dark:text-[#8b92a5]"
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
                    placeholder="Search campaigns"
                    className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#8b92a5]"
                    aria-label="Search campaigns"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open search"
                  aria-expanded={false}
                  title="Search campaigns"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="size-[14px] text-[#303030] dark:text-[#8b92a5]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Campaign type: ${activeTypeLabel}`}
                    title={`Campaign type: ${activeTypeLabel}`}
                  >
                    <Tags className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {CAMPAIGN_TYPE_FILTER_OPTS.map((opt) => (
                    <DropdownMenuItem
                      key={String(opt.value)}
                      className="cursor-pointer text-xs"
                      onClick={() => setTypeFilter(opt.value)}
                    >
                      {opt.label}
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
                <DropdownMenuContent align="end" className="w-40">
                  {CAMPAIGN_STATUS_FILTER_OPTS.map((opt) => (
                    <DropdownMenuItem
                      key={String(opt.value)}
                      className="cursor-pointer text-xs"
                      onClick={() => setStatusFilter(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <AppDataTableColumnSettingsTrigger
                sheetTitle="Campaign columns"
                onClick={() => setColumnSheetOpen(true)}
              />
            </div>
          }
        />

        <div className="flex flex-1 min-h-0 flex-col">
          <div className="mx-6 mb-6 flex min-h-0 flex-1 flex-col">
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-0 bg-background">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-auto">
                  <CampaignTable
                    campaigns={filteredCampaigns}
                    onRowClick={openSheet}
                    columnSheetOpen={columnSheetOpen}
                    onColumnSheetOpenChange={setColumnSheetOpen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail sheet ── */}
        <CampaignDetailSheet
          campaign={selected}
          open={sheetOpen}
          onClose={closeSheet}
        />
      </div>
    </TooltipProvider>
  );
}
