import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  IconStrip,
  L2NavPanel,
  ReviewsL2NavPanel,
  SocialL2NavPanel,
  ContactsL2NavPanel,
  ListingsL2NavPanel,
  TicketingL2NavPanel,
  CampaignsL2NavPanel,
  SurveysL2NavPanel,
  CompetitorsL2NavPanel,
  InboxL2NavPanel,
  AeoProductListing1L2NavPanel,
  AeoSearchAiL2NavPanel,
} from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";
import { MonitorNotificationsProvider } from "@/app/context/MonitorNotificationsContext";
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_BELOW_TOPBAR_CARD_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
} from "@/app/components/layout/appShellClasses";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import { AppShellL2Placeholder } from "@/app/components/layout/AppShellL2Placeholder";
import { birdAiShellShowsL2Placeholder } from "@/app/components/layout/birdAiShellRoutes";
import type { AppView } from "@/app/App";
import { CONTACTS_L2_KEY_ALL } from "@/app/components/ContactsView";

function ContactsL2ForAppShell() {
  const [activeItem, setActiveItem] = useState(CONTACTS_L2_KEY_ALL);
  return (
    <ContactsL2NavPanel
      activeItem={activeItem}
      onActiveItemChange={setActiveItem}
      onAddContact={() => {}}
    />
  );
}

/* ─── View metadata for the view switcher ─── */
const VIEWS: { value: AppView; label: string; group: string }[] = [
  { value: "agents-monitor",       label: "BirdAI — Monitor", group: "BirdAI" },
  { value: "birdai-journeys",      label: "BirdAI — Journeys placeholder", group: "BirdAI" },
  { value: "birdai-reports",       label: "BirdAI — Reports (in-app)", group: "BirdAI" },
  { value: "dashboard",            label: "Reports — Dashboard",     group: "Reports" },
  { value: "shared-by-me",         label: "Reports — Shared by me",  group: "Reports" },
  { value: "reviews",              label: "Reviews",                 group: "Modules" },
  { value: "social",               label: "Social AI",               group: "Modules" },
  { value: "searchai",             label: "Chatbot",                 group: "Modules" },
  { value: "listings",             label: "Listings",                group: "Modules" },
  { value: "contacts",             label: "Contacts",                group: "Modules" },
  { value: "inbox",                label: "Inbox",                   group: "Modules" },
  { value: "surveys",              label: "Surveys",                 group: "Modules" },
  { value: "ticketing",            label: "Ticketing",               group: "Modules" },
  { value: "campaigns",            label: "Manage Automations",      group: "Modules" },
  { value: "insights",             label: "Insights",                group: "Modules" },
  { value: "competitors",          label: "Competitors",             group: "Modules" },
  { value: "aeo-product-listing-1", label: "AEO — Listings", group: "Modules" },
  { value: "aeo-search-ai",        label: "AEO — Search AI",         group: "Modules" },
];

/* ─── Resolve which L2 panel to show for a given view ─── */
function L2Panel({ view, onViewChange }: { view: AppView; onViewChange: (v: AppView) => void }) {
  if (view === "business-overview") return null;
  if (view === "reviews")     return <ReviewsL2NavPanel />;
  if (view === "social")      return <SocialL2NavPanel />;
  if (view === "searchai")    return <AppShellL2Placeholder />;
  if (view === "contacts")    return <ContactsL2ForAppShell />;
  if (view === "listings")    return <ListingsL2NavPanel />;
  if (view === "surveys")     return <SurveysL2NavPanel />;
  if (view === "ticketing")   return <TicketingL2NavPanel />;
  if (view === "campaigns")   return <CampaignsL2NavPanel />;
  if (view === "insights") {
    return (
      <AppShellL2Placeholder caption="Insights is not hosted in this shell — secondary nav is a preview only." />
    );
  }
  if (view === "competitors") return <CompetitorsL2NavPanel />;
  if (view === "aeo-product-listing-1") return <AeoProductListing1L2NavPanel />;
  if (view === "aeo-search-ai") return <AeoSearchAiL2NavPanel />;
  if (view === "inbox")       return <InboxL2NavPanel />;
  if (view === "agents-builder") return null;
  if (birdAiShellShowsL2Placeholder(view)) {
    return (
      <AppShellL2Placeholder caption="BirdAI is not hosted in this shell — secondary nav is a preview only." />
    );
  }
  if (["scheduled-deliveries","storybook","shared-by-me"].includes(view))
    return null;
  return <L2NavPanel currentView={view} onViewChange={onViewChange} />;
}

/* ─── View switcher bar (only visible in Storybook for demo) ─── */
function ViewSwitcher({
  current,
  onChange,
}: {
  current: AppView;
  onChange: (v: AppView) => void;
}) {
  const groups = [...new Set(VIEWS.map(v => v.group))];
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white dark:bg-[#22262f] border border-black/10 dark:border-white/10 rounded-full px-2 py-1 shadow-lg">
      <span className="text-[11px] text-muted-foreground mr-2">Switch view:</span>
      {groups.map(group => {
        const groupViews = VIEWS.filter(v => v.group === group);
        const anyActive = groupViews.some(v => v.value === current);
        return (
          <div key={group} className="flex items-center gap-0.5">
            {groupViews.map(v => (
              <button
                key={v.value}
                onClick={() => onChange(v.value)}
                className={`px-2 py-1 rounded-full text-[11px] transition-all ${
                  current === v.value
                    ? "bg-[#2552ED] text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {v.label.split(" — ")[1] ?? v.label}
              </button>
            ))}
            <span className="text-muted-foreground/30 text-[10px] mx-1">|</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STORIES
   ═══════════════════════════════════════════════════ */

const meta: Meta = {
  title: "App/AppShell",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Canonical app chrome: L1 icon strip, TopBar (`rounded-tr-lg`), then a gutter row (`bg-app-shell-gutter`, `pr-[10px] pb-[10px]`) wrapping `APP_SHELL_BELOW_TOPBAR_CARD_CLASS` (1px `border-app-shell-border`). Inside: L2 `PANEL` (`bg-app-shell-l2-surface`, `border-r border-app-shell-border`), main `APP_MAIN_CONTENT_SHELL_CLASS` (`bg-app-shell-main`). L1 + TopBar use `bg-app-shell-rail`. See Design System → Tokens → Colours → App chrome.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "App Shell — interactive",
  render: () => {
    const [view, setView] = useState<AppView>("agents-monitor");

    return (
      <MonitorNotificationsProvider onNavigateToMonitor={() => setView("agents-monitor")}>
        <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
          {/* L1 Icon Strip */}
          <IconStrip currentView={view} onViewChange={setView} />

          {/* Right of icon strip */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* TopBar */}
            <TopBar currentView={view} onViewChange={setView} />

            {/* L2 nav + main content */}
            <div
              className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}
            >
              <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
                <L2Panel view={view} onViewChange={setView} />
                <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                  <AppShellContentPlaceholder view={view} />
                </div>
              </div>
            </div>
          </div>

          {/* Floating view switcher for Storybook demo */}
          <ViewSwitcher current={view} onChange={setView} />
        </div>
      </MonitorNotificationsProvider>
    );
  },
};

export const StartingWithAgents: Story = {
  name: "App Shell — start: BirdAI",
  render: () => {
    const [view, setView] = useState<AppView>("agents-monitor");

    return (
      <MonitorNotificationsProvider onNavigateToMonitor={() => setView("agents-monitor")}>
        <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
          <IconStrip currentView={view} onViewChange={setView} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar currentView={view} onViewChange={setView} />
            <div
              className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}
            >
              <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
                <L2Panel view={view} onViewChange={setView} />
                <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                  <AppShellContentPlaceholder view={view} />
                </div>
              </div>
            </div>
          </div>
          <ViewSwitcher current={view} onChange={setView} />
        </div>
      </MonitorNotificationsProvider>
    );
  },
};

export const StartingWithReviews: Story = {
  name: "App Shell — start: Reviews",
  render: () => {
    const [view, setView] = useState<AppView>("reviews");

    return (
      <MonitorNotificationsProvider onNavigateToMonitor={() => setView("agents-monitor")}>
        <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
          <IconStrip currentView={view} onViewChange={setView} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar currentView={view} onViewChange={setView} />
            <div
              className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}
            >
              <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
                <L2Panel view={view} onViewChange={setView} />
                <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                  <AppShellContentPlaceholder view={view} />
                </div>
              </div>
            </div>
          </div>
          <ViewSwitcher current={view} onChange={setView} />
        </div>
      </MonitorNotificationsProvider>
    );
  },
};

export const NoL2Panel: Story = {
  name: "App Shell — no L2 (Inbox layout)",
  render: () => {
    const [view, setView] = useState<AppView>("inbox");

    return (
      <MonitorNotificationsProvider onNavigateToMonitor={() => setView("agents-monitor")}>
        <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
          <IconStrip currentView={view} onViewChange={setView} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar currentView={view} onViewChange={setView} />
            <div
              className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}
            >
              <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
                <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                  <AppShellContentPlaceholder view={view} />
                </div>
              </div>
            </div>
          </div>
          <ViewSwitcher current={view} onChange={setView} />
        </div>
      </MonitorNotificationsProvider>
    );
  },
};
