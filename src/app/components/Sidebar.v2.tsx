import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { BirdeyeLogoMark } from "@/app/components/brand/BirdeyeLogoMark";
import { usePersistedState } from "@/app/hooks/usePersistedState";
import {
  ChevronDown, ChevronUp, Settings, Camera, Moon, Sun, Monitor, ChevronLeft, ExternalLink, Plus, Info,
} from "lucide-react";
import {
  FigmaIconBirdAI, FigmaIconOverview, FigmaIconInbox, FigmaIconListings,
  FigmaIconReviews, FigmaIconReferrals, FigmaIconPayments, FigmaIconAppointments,
  FigmaIconSocial, FigmaIconSurveys, FigmaIconTicketing, FigmaIconContacts,
  FigmaIconCampaigns, FigmaIconCompetitors, FigmaIconInsights, FigmaIconReports,
  FigmaIconContentHub,
} from "./l1Icons";
import svgPaths from "../../imports/svg-y1gexucine";
import type { AppView } from "../App";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { APP_SHELL_RAIL_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
import { FLOATING_PANEL_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "./l1StripIconTokens";
import { MonitorNotificationsTrigger } from "./MonitorNotificationsTrigger";
import { AccountSettingsSheet } from "./settings/AccountSettingsSheet";
import { useTheme, type ThemePreference } from "./useTheme";
import { IconRail } from "@/app/components/IconRail";
import type { RailGroup } from "@/app/components/IconRail.types";
import {
  L2NavLayout,
  PANEL,
  PANEL_INBOX_L2,
  ROW,
  HOVER,
  CHILD_ACTIVE,
  CHILD_INACTIVE,
  FOOTER_ROW_CLS,
  SECTION_HEADER,
  L2_HEADER_PLUS_WRAPPER_BLUE,
  L2_HEADER_PLUS_GLYPH_BLUE,
  L2_HEADER_PLUS_STROKE_PX,
} from "./L2NavLayout";

/** How long to show the Reports-row shimmer before opening the tab (~sub-second “micro” handoff). */
export const REPORTS_EXTERNAL_SHIMMER_MS = 480;

/** Opens the full Reporting module in a new tab. Set `VITE_REPORTING_MODULE_URL` in the host app when known. */
export function openReportingModuleInNewTab() {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const envUrl = (env?.VITE_REPORTING_MODULE_URL ?? "").trim();
  const url = envUrl || `${window.location.origin}${window.location.pathname}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1617853701628-bfcf8b81d13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHNtaWxlJTIwc3R1ZGlvJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzczMjE4MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

/** Search AI — lightbulb icon, matching Figma icon style */
function FigmaIconSearchAI({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `shrink-0 ${className}` : "shrink-0"}
      aria-hidden
    >
      <path d="M7.5 15.833h5M10 2.5a4.583 4.583 0 0 1 2.917 8.125c-.584.5-.917 1.208-.917 1.958V13.5a.833.833 0 0 1-.833.833H8.833A.833.833 0 0 1 8 13.5v-.917c0-.75-.333-1.458-.917-1.958A4.583 4.583 0 0 1 10 2.5Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Icon-strip items — Figma "Visual Uplift 2.0" icons ─── */
const iconStripItems: { label: string; Icon: React.ElementType }[] = [
  { label: "Agents",       Icon: FigmaIconBirdAI      },
  { label: "Inbox",        Icon: FigmaIconInbox       },
  { label: "Listings",     Icon: FigmaIconListings    },
  { label: "Search AI",    Icon: FigmaIconSearchAI    }, // bulb icon, above Reviews
  { label: "Reviews",      Icon: FigmaIconReviews     },
  { label: "Referrals",    Icon: FigmaIconReferrals   },
  { label: "Payments",     Icon: FigmaIconPayments    },
  { label: "Appointments", Icon: FigmaIconAppointments},
  { label: "Social",       Icon: FigmaIconSocial      },
  { label: "Content Hub",  Icon: FigmaIconContentHub  }, // file-with-lines icon
  { label: "Surveys",      Icon: FigmaIconSurveys     },
  { label: "Ticketing",    Icon: FigmaIconTicketing   },
  { label: "Contacts",     Icon: FigmaIconContacts    },
  { label: "Campaigns",    Icon: FigmaIconCampaigns   },
  { label: "Competitors",  Icon: FigmaIconCompetitors },
  { label: "Insights",     Icon: FigmaIconInsights    },
  { label: "Reports",      Icon: FigmaIconReports     },
];

/* ═══════════════════════════════════════════
   Icon Strip (L1 nav rail) – exported separately
   (sizes / stroke: `l1StripIconTokens`)
   ═══════════════════════════════════════════ */

interface IconStripProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  /** Icon size in px. Defaults to `L1_STRIP_ICON_SIZE` (16.2). */
  iconSize?: number;
  onOpenKeyboardShortcuts?: () => void;
  /** Demo auth: clear session and show login (wired from App). */
  onSignOut?: () => void;
}

// ─── view ↔ rail-id mapping ─────────────────────────────────────────────────

function viewToActiveId(view: AppView): string {
  if (!view) return "agents-monitor";
  if (view === "inbox") return "inbox";
  if (view === "listings") return "listings";
  if (view === "searchai" || view === "recommendations") return "searchai";
  if (view === "reviews") return "reviews";
  if (view === "referrals") return "referrals";
  if (view === "payments") return "payments";
  if (view === "appointments") return "appointments";
  if (view === "social") return "social";
  if (view.startsWith("content-hub")) return "content-hub";
  if (view === "surveys") return "surveys";
  if (view === "ticketing") return "ticketing";
  if (view === "contacts") return "contacts";
  if (view === "campaigns") return "campaigns";
  if (view === "competitors") return "competitors";
  if (view === "insights") return "insights";
  if (view === "dashboard" || view === "shared-by-me" || view === "birdai-reports" || view === "birdai-journeys") return "reports";
  // agents / bird-ai
  return "agents-monitor";
}

function activeIdToView(id: string): AppView {
  const map: Record<string, AppView> = {
    "inbox":          "inbox",
    "listings":       "listings",
    "searchai":       "recommendations",
    "reviews":        "reviews",
    "referrals":      "referrals",
    "payments":       "payments",
    "appointments":   "appointments",
    "social":         "social",
    "content-hub":    "content-hub",
    "surveys":        "surveys",
    "ticketing":      "ticketing",
    "contacts":       "contacts",
    "campaigns":      "campaigns",
    "competitors":    "competitors",
    "insights":       "insights",
    "reports":        "dashboard",
    "agents-monitor": "agents-monitor",
  };
  return map[id] ?? "agents-monitor";
}

const RAIL_GROUPS: RailGroup[] = [
  {
    id: "main",
    items: [
      { id: "agents-monitor", label: "Agents",       kind: "element", icon: <FigmaIconBirdAI      size={18} /> },
      { id: "inbox",          label: "Inbox",        kind: "element", icon: <FigmaIconInbox       size={18} /> },
      { id: "listings",       label: "Listings",     kind: "element", icon: <FigmaIconListings    size={18} /> },
      { id: "searchai",       label: "Search AI",    kind: "element", icon: <FigmaIconSearchAI    size={18} /> },
      { id: "reviews",        label: "Reviews",      kind: "element", icon: <FigmaIconReviews     size={18} /> },
      { id: "referrals",      label: "Referrals",    kind: "element", icon: <FigmaIconReferrals   size={18} /> },
      { id: "payments",       label: "Payments",     kind: "element", icon: <FigmaIconPayments    size={18} /> },
      { id: "appointments",   label: "Appointments", kind: "element", icon: <FigmaIconAppointments size={18} /> },
      { id: "social",         label: "Social",       kind: "element", icon: <FigmaIconSocial      size={18} /> },
      { id: "content-hub",    label: "Content Hub",  kind: "element", icon: <FigmaIconContentHub  size={18} /> },
      { id: "surveys",        label: "Surveys",      kind: "element", icon: <FigmaIconSurveys     size={18} /> },
      { id: "ticketing",      label: "Ticketing",    kind: "element", icon: <FigmaIconTicketing   size={18} /> },
      { id: "contacts",       label: "Contacts",     kind: "element", icon: <FigmaIconContacts    size={18} /> },
      { id: "campaigns",      label: "Campaigns",    kind: "element", icon: <FigmaIconCampaigns   size={18} /> },
      { id: "competitors",    label: "Competitors",  kind: "element", icon: <FigmaIconCompetitors size={18} /> },
      { id: "insights",       label: "Insights",     kind: "element", icon: <FigmaIconInsights    size={18} /> },
      { id: "reports",        label: "Reports",      kind: "element", icon: <FigmaIconReports     size={18} /> },
    ],
  },
];

export function IconStrip({ currentView, onViewChange, onOpenKeyboardShortcuts, onSignOut }: IconStripProps) {
  return (
    <IconRail
      logoElement={<BirdeyeLogoMark sizePxHeight={22} />}
      brand="Birdeye"
      groups={RAIL_GROUPS}
      activeId={viewToActiveId(currentView)}
      onSelect={(id) => onViewChange(activeIdToView(id))}
      userName="John Doe"
      userEmail="john.doe@acmecorp.com"
      onProfileAction={(action) => {
        if (action === "sign-out") onSignOut?.();
        if (action === "keyboard-shortcuts") onOpenKeyboardShortcuts?.();
        if (action === "shared-by-me") onViewChange("shared-by-me");
        if (action === "scheduled-deliveries") onViewChange("scheduled-deliveries");
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   L2 Nav Panels – all unchanged below
   ═══════════════════════════════════════════ */

export function L2NavPanel({ currentView: _currentView, onViewChange }: L2NavPanelProps) {
  // Active item tracked internally
  const [activeItem, setActiveItem] = useState("Created by me/Palo Alto performance");

  const activate = (key: string) => {
    setActiveItem(key);
    onViewChange("dashboard");
  };

  const dashboardExpandedInit = Object.fromEntries(
    dashboardSections.map(s => [s.label, s.label === "Created by me"])
  );
  const reportExpandedInit = Object.fromEntries(
    reportCatalogSections.map(s => [s.label, s.label === "Listings"])
  );

  const [dashboardExpanded, setDashboardExpanded] = useState<Record<string, boolean>>(() => dashboardExpandedInit);
  const [reportExpanded, setReportExpanded] = useState<Record<string, boolean>>(() => reportExpandedInit);

  const toggleDashboard = (label: string) =>
    setDashboardExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  const toggleReport = (label: string) =>
    setReportExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const renderDashboardSection = (section: { label: string; children: string[] }) => {
    const isExp = dashboardExpanded[section.label];
    return (
      <div key={section.label}>
        <button
          type="button"
          onClick={() => toggleDashboard(section.label)}
          className={SECTION_HEADER}
          style={{ fontWeight: 400 }}
        >
          <span>{section.label}</span>
          {isExp
            ? <ChevronUp className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
          }
        </button>
        {isExp && section.children.map(child => {
          const key = `${section.label}/${child}`;
          const isActive = activeItem === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              {child}
            </button>
          );
        })}
      </div>
    );
  };

  const renderReportSection = (section: { label: string; children: string[] }) => {
    const isExp = reportExpanded[section.label];
    return (
      <div key={section.label}>
        <button
          type="button"
          onClick={() => toggleReport(section.label)}
          className={SECTION_HEADER}
          style={{ fontWeight: 400 }}
        >
          <span>{section.label}</span>
          {isExp
            ? <ChevronUp className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
          }
        </button>
        {isExp && section.children.map(child => {
          const key = `${section.label}/${child}`;
          const isActive = activeItem === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              {child}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={PANEL} data-no-print>
      <div className="flex-1 overflow-y-auto px-[8px] pt-3 pb-4">
        {/* Create dashboard button */}
        <button
          type="button"
          className={`${FOOTER_ROW_CLS} mb-2`}
          style={{ fontSize: 14 }}
          onClick={() => onViewChange("dashboard")}
        >
          <span className="text-[14px]">Create dashboard</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Dashboard sections */}
        {dashboardSections.map(renderDashboardSection)}

        {/* Create report button */}
        <button
          type="button"
          className={`${FOOTER_ROW_CLS} mt-2 mb-2`}
          style={{ fontSize: 14 }}
          onClick={() => onViewChange("dashboard")}
        >
          <span className="text-[14px]">Create report</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Product report catalogs (Listings, Social, …) — no Agent Reports parent */}
        <div className="mt-2 flex flex-col gap-1">
          {reportCatalogSections.map(renderReportSection)}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reviews L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */

const reviewsConfig = {
  headerAction: { label: "Send a review request" },
  defaultExpandedSections: ["Actions"],
  sections: [
    {
      label: "Actions",
      children: [
        "View all reviews",
        "Respond to reviews",
        "Approve replies",
        "Fix rejected replies",
        "View scheduled replies",
        "Fix failed replies",
      ],
    },
    {
      label: "Reports",
      children: [
        "Overview",
        "Volume and ratings",
        "Leaderboard",
        "Distribution",
        "Responses",
        "NPS",
        "Tags",
        "QR Codes",
        "Review impressions",
      ],
    },
    {
      label: "Competitors",
      children: ["Benchmarking", "Head to head", "Reviews"],
    },
    {
      label: "Agents",
      children: ["Review generation agents", "Review response agents"],
    },
    {
      label: "Settings",
      children: [
        "Review sites",
        "Request templates",
        "Reply templates",
        "Approvals",
        "QR codes",
        "Widgets",
        "Rating display",
        "Auto share rules",
        "Auto reply rules",
        "AI prompts",
      ],
    },
  ],
  footerLink: { label: "Reports", external: true },
};

export function ReviewsL2NavPanel() {
  return <L2NavLayout {...reviewsConfig} storageKey="nav:l2:reviews" data-no-print />;
}

/* ═══════════════════════════════════════════
   Social L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const socialConfig = {
  sections: [
    { label: "Publish", children: ["Calendar", "View drafts", "Approve posts", "Fix failed posts", "Fix rejected posts", "Expired posts"] },
    { label: "Engage", children: ["View all engagements", "Assigned to me", "Approve replies", "Fix rejected replies", "View spam"] },
    { label: "Reports", children: ["All channels", "Post performance", "Response trends", "Best time to post"] },
    { label: "Competitors", children: ["Benchmarking", "Posts"] },
    { label: "Libraries", children: ["Post library", "Media library", "Reply templates"] },
    { label: "Agents", children: ["Publishing agent", "Engagement agent"] },
    { label: "Settings", children: ["Approvals", "Link in bio", "Tags", "AI posts", "AI prompts"] },
  ],
};

export type SocialL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
};

export function SocialL2NavPanel({ activeItem, onActiveItemChange }: SocialL2NavPanelProps) {
  return (
    <L2NavLayout
      {...socialConfig}
      headerAction={{ label: "Create post", onClick: () => onActiveItemChange("Create post") }}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Search AI L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const searchAIConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Track progress"] },
    { label: "Reports", children: ["Citations", "Visibility", "Rankings", "Accuracy", "Sentiment"] },
    { label: "Agents", children: ["Monitor", "Performance", "Builder"] },
    { label: "Settings", children: ["Prompts", "Locations", "Competitors"] },
  ],
};

export type SearchAIL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
};

export function SearchAIL2NavPanel({ activeItem, onActiveItemChange }: SearchAIL2NavPanelProps) {
  return (
    <L2NavLayout
      {...searchAIConfig}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Contacts L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const contactsNavSections = [
  { label: "Settings", children: ["Custom fields", "Tags"] },
];

function ContactsL2UsageFooter() {
  return (
    <Card className="gap-2 border-border bg-card py-0 shadow-none">
      <CardContent className="flex flex-col gap-2 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-muted-foreground text-xs leading-snug">7/50 Reachable contacts added</p>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-1"
            title="Illustrative usage for the prototype"
            aria-label="Usage information"
          >
            <Info className="size-4" aria-hidden />
          </button>
        </div>
        <Progress value={14} />
        <button type="button" className="text-primary text-left text-xs font-medium hover:underline">
          View usage
        </button>
      </CardContent>
    </Card>
  );
}

export type ContactsL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
  onAddContact: () => void;
};

export function ContactsL2NavPanel({ activeItem, onActiveItemChange, onAddContact }: ContactsL2NavPanelProps) {
  return (
    <L2NavLayout
      headerAction={{ label: "Add a contact", onClick: onAddContact }}
      standaloneItems={["All contacts", "Lists & segments"]}
      sections={contactsNavSections}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      defaultActive="standalone/All contacts"
      defaultExpandedSections={[]}
      footerSlot={<ContactsL2UsageFooter />}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Listings L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const listingsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Suppress duplicates", "Google suggestions"] },
    { label: "Ranking reports", children: ["Keywords", "Citations", "Rankings"] },
    { label: "Search performance", children: ["All sites", "Google", "Apple", "Facebook", "Bing", "Yelp"] },
    { label: "Accuracy", children: ["Core sites", "Other sites"] },
    { label: "Publish status", children: ["All listings", "By location", "By site"] },
    { label: "Agents", children: ["Listing optimization agent"] },
    { label: "Settings", children: ["Profiles", "Keywords", "Ranking report", "FAQs", "Products", "Google services"] },
  ],
};

export function ListingsL2NavPanel() {
  return <L2NavLayout {...listingsConfig} storageKey="nav:l2:listings" data-no-print />;
}

/* ═══════════════════════════════════════════
   Ticketing L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const ticketingConfig = {
  headerAction: { label: "Create ticket" },
  sections: [
    { label: "Actions", children: ["My tickets", "View all tickets"] },
    { label: "Reports", children: ["Resolution time", "Volume"] },
    { label: "Agents", children: ["Ticket resolution agent"] },
  ],
};

export function TicketingL2NavPanel() {
  return <L2NavLayout {...ticketingConfig} storageKey="nav:l2:ticketing" data-no-print />;
}

/* ═══════════════════════════════════════════
   Campaigns L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const campaignsConfig = {
  sections: [
    { label: "Actions", children: ["Manage automations", "Manage campaigns"] },
    { label: "Libraries", children: ["Templates", "Landing pages"] },
    { label: "Reports", children: ["Review campaigns", "Referral campaigns", "CX campaigns", "Custom campaigns"] },
    { label: "Settings", children: ["Workflow tags", "Communication restriction"] },
  ],
};

export function CampaignsL2NavPanel() {
  return <L2NavLayout {...campaignsConfig} storageKey="nav:l2:campaigns" data-no-print />;
}

/* ═══════════════════════════════════════════
   Surveys L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const surveysConfig = {
  headerAction: { label: "Create survey" },
  sections: [
    { label: "Actions", children: ["Respond to surveys"] },
    { label: "Surveys", children: ["All surveys", "Standard surveys", "Pulse surveys"] },
    { label: "Agents", children: ["Survey distribution agent", "Survey tagging agent"] },
    { label: "Libraries", children: ["Request templates"] },
  ],
  footerLink: { label: "Reports", external: true },
};

export function SurveysL2NavPanel() {
  return <L2NavLayout {...surveysConfig} storageKey="nav:l2:surveys" data-no-print />;
}

/* ═══════════════════════════════════════════
   Insights L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const insightsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Track progress"] },
    { label: "Analysis", children: ["All signals", "Reviews", "Listings", "Calls"] },
    { label: "Settings", children: ["Categories & keywords", "Birdeye score"] },
  ],
};

export function InsightsL2NavPanel() {
  return <L2NavLayout {...insightsConfig} storageKey="nav:l2:insights" data-no-print />;
}

/* ═══════════════════════════════════════════
   Competitors L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const competitorsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Track progress"] },
    { label: "Analysis", children: ["All signals", "Reviews", "Social"] },
    {
      label: "Benchmarking",
      children: [
        "You vs Industry",
        "You vs Peach Tree Dental",
        "You vs Coast Dental",
        "You vs Altima Dental",
        "You vs Tooth Works",
        "You vs White Teeth",
      ],
    },
    { label: "Settings", children: ["Brands & locations", "Categories & keywords", "Birdeye score"] },
  ],
};

export function CompetitorsL2NavPanel() {
  return <L2NavLayout {...competitorsConfig} storageKey="nav:l2:competitors" data-no-print />;
}

/* ═══════════════════════════════════════════
   Appointments L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const appointmentsConfig = {
  panelTitle: "Appointments",
  defaultExpandedSections: ["Actions", "Settings"],
  sections: [
    { label: "Actions", children: ["View calendar", "View schedule"] },
    { label: "Settings", children: ["Widget", "Notifications & alerts"] },
  ],
};

export function AppointmentsL2NavPanel() {
  return <L2NavLayout {...appointmentsConfig} storageKey="nav:l2:appointments" data-no-print />;
}

/* ═══════════════════════════════════════════
   Inbox L2 Nav Panel – custom (not using L2NavLayout)
   ═══════════════════════════════════════════ */


const inboxSections = [
  {
    label: "Assignment",
    children: ["Assigned to me", "Assigned to AI Agents", "Assigned to others", "Unassigned", "Spam"],
  },
  {
    label: "Leads",
    children: ["Inquiries", "Missed calls", "Voicemails", "Appointments", "Service inquiry", "Insurance", "Billing", "Lost"],
  },
  {
    label: "Feedback",
    children: ["Reviews", "Surveys"],
  },
  {
    label: "Saved filters",
    children: ["My Filter 1", "My Filter 2", "My Filter 3"],
  },
  {
    label: "Reports",
    children: ["Over time", "Location", "Users", "Channels"],
  },
  {
    label: "Agents",
    children: ["Lead generation agents"],
  },
  {
    label: "Settings",
    children: ["Chatbot", "Receptionist"],
  },
];

const teamSections = [
  {
    label: "Sales Team",
    children: ["Assigned to me", "Assigned to AI Agents", "Assigned to others", "Unassigned", "Spam"],
  },
  {
    label: "Customer Service Team",
    children: ["Assigned to me", "Assigned to AI Agents", "Assigned to others", "Unassigned", "Spam"],
  },
];

export function InboxL2NavPanel() {
  const [activeItem, setActiveItem] = usePersistedState("nav:l2:inbox", "standalone/All messages");

  const activate = (key: string) => setActiveItem(key);

  // Inbox sections: "Assignment" expanded by default
  const [inboxExpanded, setInboxExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(inboxSections.map(s => [s.label, s.label === "Assignment"]))
  );
  // Team sections: all expanded by default
  const [teamExpanded, setTeamExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(teamSections.map(s => [s.label, false]))
  );

  const toggleInbox = (label: string) =>
    setInboxExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  const toggleTeam = (label: string) =>
    setTeamExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const renderChildren = (sectionLabel: string, children: string[], prefix: string) =>
    children.map(child => {
      const key = `${prefix}/${sectionLabel}/${child}`;
      const isActive = activeItem === key;
      return (
        <button
          key={key}
          onClick={() => activate(key)}
          className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
          style={{ fontWeight: isActive ? 400 : 300 }}
        >
          {child}
        </button>
      );
    });

  return (
    <div className={PANEL_INBOX_L2} data-no-print>
      <div className="flex-1 overflow-y-auto px-[8px] pt-3 pb-4">

        {/* Header: New message */}
        <button className={`${FOOTER_ROW_CLS} mb-[6px]`} style={{ fontSize: 14 }}>
          <span className="text-[14px]">New message</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Flat item: All messages */}
        {(() => {
          const key = "standalone/All messages";
          const isActive = activeItem === key;
          return (
            <button
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              All messages
            </button>
          );
        })()}

        {/* Inbox sections */}
        {inboxSections.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggleInbox(section.label)}
              className={SECTION_HEADER}
              style={{ fontWeight: 400 }}
            >
              <span>{section.label}</span>
              {inboxExpanded[section.label]
                ? <ChevronUp className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
              }
            </button>
            {inboxExpanded[section.label] && renderChildren(section.label, section.children, "inbox")}
          </div>
        ))}

        {/* Internal team chat header */}
        <button className={`${FOOTER_ROW_CLS} mb-[6px]`} style={{ fontSize: 14 }}>
          <span className="text-[14px]">Internal team chat</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Team sections */}
        {teamSections.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggleTeam(section.label)}
              className={SECTION_HEADER}
              style={{ fontWeight: 400 }}
            >
              <span>{section.label}</span>
              {teamExpanded[section.label]
                ? <ChevronUp className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
              }
            </button>
            {teamExpanded[section.label] && renderChildren(section.label, section.children, "team")}
          </div>
        ))}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Agents L2 Nav Panel – re-exported from versioned file
   ═══════════════════════════════════════════ */
export { AgentsL2NavPanel } from "./AgentsL2NavPanel";

export { MynaConversationsL2NavPanel } from "./MynaConversationsL2NavPanel";

/* ═══════════════════════════════════════════
   Recommendations L2 Nav Panel
   ═══════════════════════════════════════════ */
const recommendationsL2Config = {
  sections: [
    { label: "Actions", children: ["Recommendations"] },
    { label: "Reports", children: ["Citations", "Visibility", "Rankings", "Accuracy", "Sentiment"] },
    { label: "Agents", children: [] },
    { label: "Settings", children: ["Prompts", "Locations", "Competitors"] },
  ],
};

export function RecommendationsL2NavPanel() {
  return <L2NavLayout {...recommendationsL2Config} storageKey="nav:l2:recommendations" data-no-print />;
}

/* ═══════════════════════════════════════════
   Legacy combined Sidebar export (backward compat)
   ═══════════════════════════════════════════ */
interface SidebarProps {
  hideL2Nav?: boolean;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Sidebar({ hideL2Nav = false, currentView, onViewChange }: SidebarProps) {
  return (
    <div className="flex h-full shrink-0" data-no-print>
      <IconStrip currentView={currentView} onViewChange={onViewChange} />
      {!hideL2Nav && <L2NavPanel currentView={currentView} onViewChange={onViewChange} />}
    </div>
  );
}
