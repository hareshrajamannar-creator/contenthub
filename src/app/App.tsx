import {
  IconStrip, L2NavPanel, ReviewsL2NavPanel, SocialL2NavPanel, SearchAIL2NavPanel,
  ContactsL2NavPanel, AgentsL2NavPanel, ListingsL2NavPanel, TicketingL2NavPanel,
  CampaignsL2NavPanel, SurveysL2NavPanel, InsightsL2NavPanel, CompetitorsL2NavPanel,
  AppointmentsL2NavPanel, InboxL2NavPanel, MynaConversationsL2NavPanel,
  RecommendationsL2NavPanel,
} from "./components/Sidebar";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePersistedState } from "./hooks/usePersistedState";
import { Toaster } from "./components/ui/sonner.v1";
import { MonitorNotificationsProvider } from "./context/MonitorNotificationsContext";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { SharedByMe } from "./components/SharedByMe";
import { InboxView } from "./components/InboxView";
import { ComponentShowcase } from "./components/ComponentShowcase";
import { ReviewsView } from "./components/ReviewsView";
import { SocialView } from "./components/SocialView";
import { SearchAIView } from "./components/SearchAIView";
import {
  ContactsView,
  CONTACTS_L2_KEY_ALL,
  type ContactsAppBridge,
  type ContactsSheetMode,
} from "./components/ContactsView";
import { ScheduledDeliveriesView } from "./components/ScheduledDeliveriesView";
import { AgentsMonitorView } from "./components/AgentsMonitorView";
import { AnalyzePerformanceView } from "./components/AnalyzePerformanceView";
import { AgentsBuilderView } from "./components/AgentsBuilderView";
import { AgentDetailView } from "./components/AgentDetailView";
import { AgentOnboardingView } from "./components/AgentOnboardingView";
import { ScheduleBuilderView } from "./components/ScheduleBuilderView";
import { BirdAIReportsView } from "./components/BirdAIReportsView";
import { BirdAIJourneysPlaceholderView } from "./components/BirdAIJourneysPlaceholderView";
import { ReferralsView } from "./components/ReferralsView";
import { PaymentsView } from "./components/PaymentsView";
import { AppointmentsView } from "./components/AppointmentsView";
import { SurveysView } from "./components/SurveysView";
import { TicketingView } from "./components/TicketingView";
import { ListingsView } from "./components/ListingsView";
import { CampaignsView } from "./components/CampaignsView";
import { CompetitorsView } from "./components/CompetitorsView";
import { type DraftReport } from "./components/draftStore";
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_BELOW_TOPBAR_CARD_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
} from "./components/layout/appShellClasses";
import { ResizableRightChatPanel } from "./components/layout/ResizableRightChatPanel";
import { MynaChatPanel } from "./components/MynaChatPanel";
import BusinessOverviewDashboard from "./components/BusinessOverviewDashboard";
import {
  getAppViewTitle,
  LOGIN_TAB_TITLES,
  LOGIN_TAB_TITLE_COUNT,
} from "./appViewTitle";
import { l2KeyFromConversation } from "./myna/mynaL2NavKeys";
import { useMynaConversations } from "./myna/useMynaConversations";
import { ShortcutsModal } from "./shortcuts/ShortcutsModal";
import { useShortcuts } from "./shortcuts/useShortcuts";
import { BirdAILoginPage } from "./components/auth/BirdAILoginPage";
import { AppBootShimmer } from "./components/layout/AppBootShimmer";
import { SEARCH_AI_L2_DEFAULT_ACTIVE } from "./components/searchai/searchAIL2Keys";
import { ContentHubL2NavPanel } from "./components/ContentHubL2NavPanel";
import { ContentHome, type ContentHomeInitialMode } from "./components/content-hub/ContentHome";
import { ProjectsView } from "./components/content-hub/ProjectsView";
import { TemplateGallery, type TemplateItem } from "./components/content-hub/TemplateGallery";

// Thin adapter so TemplateGallery can be used as a standalone view (no "back" nav needed here — L2 provides it)
function ContentHubTemplatesView({ onSelectTemplate, onBack }: { onSelectTemplate: (t: TemplateItem) => void; onBack: () => void }) {
  return <TemplateGallery hideBack onBack={onBack} onSelectTemplate={onSelectTemplate} />;
}
import { CalendarView as ContentHubCalendarView } from "./components/content-hub/CalendarView";
import { CreateView as ContentHubCreateView } from "./components/content-hub/CreateView";
import { ContentEditorShell } from "./components/content-hub/editor/ContentEditorShell";
import type { ContentMode } from "./components/content-hub/editor/editorConfig";
import { FAQGenerationAgentsView } from "./components/content-hub/FAQGenerationAgentsView";
import { RecommendationsView } from "./components/recommendations/RecommendationsView";

const AUTH_STORAGE_KEY = "birdai_demo_authenticated";
const LOGIN_TAB_TITLE_INDEX_KEY = "auth:login_tab_title_index";

function parseStoredLoginTabIndex(raw: string | null): number {
  if (raw === null) return 0;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return ((n % LOGIN_TAB_TITLE_COUNT) + LOGIN_TAB_TITLE_COUNT) % LOGIN_TAB_TITLE_COUNT;
}

function readDemoAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Opt-in: missing key (fresh tab / new deployment) = not authenticated
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export type AppView =
  | "business-overview"
  | "dashboard"
  | "shared-by-me"
  | "inbox"
  | "storybook"
  | "reviews"
  | "social"
  | "searchai"
  | "contacts"
  | "scheduled-deliveries"
  | "agents-monitor"
  | "agents-analyze-performance"
  | "agents-builder"
  | "agent-detail"
  | "agents-onboarding"
  | "schedule-builder"
  | "birdai-reports"
  | "birdai-journeys"
  | "listings"
  | "surveys"
  | "ticketing"
  | "campaigns"
  | "insights"
  | "competitors"
  | "referrals"
  | "payments"
  | "appointments"
  | "content-hub"
  | "content-hub-home"
  | "content-hub-projects"
  | "content-hub-templates"
  | "content-hub-calendar"
  | "content-hub-create"
  | "content-hub-assigned"
  | "content-hub-approve"
  | "content-hub-agents-faq"
  | "content-hub-agents-blog"
  | "recommendations";

/** Brief shell shimmer after login so the first paint mirrors real app loading. */
const POST_LOGIN_BOOT_MS = 1200;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => readDemoAuthenticated());
  const [postLoginBoot, setPostLoginBoot] = useState(false);

  const signIn = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      // Always land on Reviews after login
      sessionStorage.setItem("nav:l1", JSON.stringify("reviews"));
    } catch {
      /* ignore */
    }
    setIsAuthenticated(true);
    setPostLoginBoot(true);
  }, []);

  useEffect(() => {
    if (!postLoginBoot) return;
    const t = window.setTimeout(() => setPostLoginBoot(false), POST_LOGIN_BOOT_MS);
    return () => window.clearTimeout(t);
  }, [postLoginBoot]);

  const signOut = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "false");
      const cur = parseStoredLoginTabIndex(sessionStorage.getItem(LOGIN_TAB_TITLE_INDEX_KEY));
      sessionStorage.setItem(
        LOGIN_TAB_TITLE_INDEX_KEY,
        String((cur + 1) % LOGIN_TAB_TITLE_COUNT),
      );
      // Clear nav state so next session starts fresh
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("nav:"))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
  }, []);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = usePersistedState<AppView>("nav:l1", "reviews");
  /** True while the FAQ agents embedded builder is open — hides the Content Hub L2 nav. */
  const [faqAgentBuilderOpen, setFaqAgentBuilderOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftReport | null>(null);
  const [selectedAgentSlug, setSelectedAgentSlug] = usePersistedState<string>("nav:l2:agents", "");
  const [selectedAnalyzeItem, setSelectedAnalyzeItem] = usePersistedState<string>("nav:l2:agents:analyze", "overview");
  /** Journeys L2 compound key — synced when navigating via `l2:` slug prefix in handleViewChange. */
  const [journeysL2ActiveKey, setJourneysL2ActiveKey] = usePersistedState<string>(
    "nav:journeys-l2-key",
    "Agents/workflow",
  );

  const [contactsL2Active, setContactsL2Active] = usePersistedState("nav:l2:contacts", CONTACTS_L2_KEY_ALL);
  const [contactsSheetMode, setContactsSheetMode] = useState<ContactsSheetMode>("none");
  const [contactsDetailId, setContactsDetailId] = useState<number | null>(null);
  const [contactsQuickViewId, setContactsQuickViewId] = useState<number | null>(null);

  const handleContactsL2Change = useCallback((key: string) => {
    setContactsL2Active(key);
    setContactsDetailId(null);
    setContactsSheetMode("none");
    setContactsQuickViewId(null);
  }, []);

  const handleContactsAddContact = useCallback(() => {
    setContactsSheetMode("addContact");
    setContactsQuickViewId(null);
  }, []);

  const contactsApp = useMemo<ContactsAppBridge>(
    () => ({
      l2ActiveItem: contactsL2Active,
      onL2ActiveItemChange: handleContactsL2Change,
      sheetMode: contactsSheetMode,
      onSheetModeChange: setContactsSheetMode,
      detailContactId: contactsDetailId,
      onDetailContactIdChange: setContactsDetailId,
      quickViewContactId: contactsQuickViewId,
      onQuickViewContactIdChange: setContactsQuickViewId,
    }),
    [
      contactsL2Active,
      handleContactsL2Change,
      contactsSheetMode,
      contactsDetailId,
      contactsQuickViewId,
    ],
  );

  useEffect(() => {
    if (currentView !== "contacts") {
      setContactsL2Active(CONTACTS_L2_KEY_ALL);
      setContactsSheetMode("none");
      setContactsDetailId(null);
      setContactsQuickViewId(null);
    }
  }, [currentView]);

  const [searchAIL2Active, setSearchAIL2Active] = usePersistedState("nav:l2:searchai", SEARCH_AI_L2_DEFAULT_ACTIVE);
  const handleSearchAIL2Change = useCallback((key: string) => {
    setSearchAIL2Active(key);
  }, []);

  useEffect(() => {
    if (currentView !== "searchai") {
      setSearchAIL2Active(SEARCH_AI_L2_DEFAULT_ACTIVE);
    }
  }, [currentView]);

  const [socialL2Active, setSocialL2Active] = usePersistedState("nav:l2:social", "Publish/Calendar");
  const [contentHubL2Active, setContentHubL2Active] = usePersistedState("nav:l2:content-hub", "Content/Home");
  const [createViewInitialMode, setCreateViewInitialMode] = useState<ContentHomeInitialMode | undefined>(undefined);
  const [createViewStartAtFAQCanvas, setCreateViewStartAtFAQCanvas] = useState(false);
  const [createViewStartAtBlogCanvas, setCreateViewStartAtBlogCanvas] = useState(false);
  // Recommendation context passed into CreateView
  const [createViewRecId, setCreateViewRecId] = useState<string | undefined>(undefined);
  const [createViewRecTitle, setCreateViewRecTitle] = useState<string | undefined>(undefined);
  const [createViewRecAeoScore, setCreateViewRecAeoScore] = useState<number | undefined>(undefined);
  const [createViewPreloadedQuestions, setCreateViewPreloadedQuestions] = useState<{ question: string; answer: string }[] | undefined>(undefined);
  // When the L1 Content Hub icon sets currentView = "content-hub", redirect
  // immediately to the FAQ agents page so ContentHome is never shown.
  useEffect(() => {
    if (currentView === "content-hub") {
      setCurrentView("content-hub-home");
      setContentHubL2Active("Content/Home");
    }
  }, [currentView]);

  const handleContentHubL2Change = useCallback((key: string, view: AppView) => {
    setContentHubL2Active(key);
    setCreateViewInitialMode(undefined);
    setCurrentView(view);
    // Reset FAQ builder state when navigating via L2
    setFaqAgentBuilderOpen(false);
  }, []);
  const handleSocialL2Change = useCallback((key: string) => {
    setSocialL2Active(key);
  }, []);

  const handleViewChange = useCallback((view: AppView, slug?: string) => {
    if (view !== currentView) {
      setMynaChatExpanded(false);
    }
    if (slug?.startsWith("l2:")) {
      setJourneysL2ActiveKey(slug.slice(3));
      setCurrentView(view);
      return;
    }
    setCurrentView(view);
    if (slug) {
      if (view === "agents-analyze-performance") {
        setSelectedAnalyzeItem(slug);
      } else {
        setSelectedAgentSlug(slug);
      }
    }
  }, [currentView]);

  const handleEditDraft = (draft: DraftReport) => {
    setEditingDraft(draft);
    setMynaChatExpanded(false);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleViewReport = (_reportName: string) => {
    setEditingDraft(null);
    setMynaChatExpanded(false);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleAiPanelChange = (open: boolean) => {
    setAiPanelOpen(open);
    if (!open) setEditingDraft(null);
  };

  const [mynaChatOpen, setMynaChatOpen] = useState(false);
  const [mynaChatExpanded, setMynaChatExpanded] = useState(false);
  const [mynaComposerFocusNonce, setMynaComposerFocusNonce] = useState(0);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    screenTitle,
    appendUserAndAssistant,
    createEmptyConversation,
  } = useMynaConversations(getAppViewTitle(currentView));

  useEffect(() => {
    if (aiPanelOpen) setMynaChatExpanded(false);
  }, [aiPanelOpen]);

  useEffect(() => {
    if (!mynaChatOpen) setMynaChatExpanded(false);
  }, [mynaChatOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      const idx = parseStoredLoginTabIndex(sessionStorage.getItem(LOGIN_TAB_TITLE_INDEX_KEY));
      document.title = LOGIN_TAB_TITLES[idx];
      return;
    }
    document.title = `${getAppViewTitle(currentView)} – Birdeye`;
  }, [isAuthenticated, currentView]);

  const mynaWorkspaceExpanded = mynaChatOpen && mynaChatExpanded && !aiPanelOpen;

  const activeL2NavKey = useMemo(() => {
    if (!activeConversation) return "";
    return l2KeyFromConversation(activeConversation);
  }, [activeConversation]);

  const { shortcutsModalOpen, setShortcutsModalOpen } = useShortcuts({
    currentView,
    onNavigate: handleViewChange,
    mynaChatOpen,
    onMynaChatOpenChange: setMynaChatOpen,
    aiPanelOpen,
  });

  /** ChatGPT-style: new thread opens in the side panel composer — no modal. */
  const startNewMynaChat = useCallback(() => {
    setMynaChatOpen(true);
    createEmptyConversation();
    setMynaComposerFocusNonce((n) => n + 1);
  }, [createEmptyConversation]);

  const mynaChatPanelEl = (
    <MynaChatPanel
      messages={activeConversation?.messages ?? []}
      onSend={appendUserAndAssistant}
      onClose={() => setMynaChatOpen(false)}
      expanded={mynaChatExpanded}
      onToggleExpand={() => setMynaChatExpanded((e) => !e)}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={setActiveConversationId}
      onOpenNewChat={startNewMynaChat}
      composerFocusNonce={mynaComposerFocusNonce}
    />
  );

  const chatLayoutRef = useRef<HTMLDivElement>(null);
  const [chatLayoutWidth, setChatLayoutWidth] = useState(0);

  useLayoutEffect(() => {
    const el = chatLayoutRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setChatLayoutWidth(el.clientWidth);
    });
    ro.observe(el);
    setChatLayoutWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Views that have their own L2 panels (not the default Reports L2NavPanel)
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <BirdAILoginPage onAuthenticated={signIn} />
      </>
    );
  }

  if (postLoginBoot) {
    return (
      <>
        <Toaster position="top-center" />
        <AppBootShimmer />
      </>
    );
  }

  const hasOwnL2Panel = (v: AppView) =>
    v === "business-overview" ||
    v === "inbox" ||
    v === "storybook" ||
    v === "reviews" ||
    v === "social" ||
    v === "searchai" ||
    v === "contacts" ||
    v === "scheduled-deliveries" ||
    v === "agents-monitor" ||
    v === "agents-analyze-performance" ||
    v === "agents-builder" ||
    v === "agent-detail" ||
    v === "agents-onboarding" ||
    v === "birdai-reports" ||
    v === "birdai-journeys" ||
    v === "listings" ||
    v === "surveys" ||
    v === "ticketing" ||
    v === "campaigns" ||
    v === "insights" ||
    v === "competitors" ||
    v === "referrals" ||
    v === "payments" ||
    v === "appointments" ||
    v === "content-hub" ||
    v === "content-hub-home" ||
    v === "content-hub-projects" ||
    v === "content-hub-templates" ||
    v === "content-hub-calendar" ||
    v === "content-hub-create" ||
    v === "content-hub-assigned" ||
    v === "content-hub-approve" ||
    v === "content-hub-agents-faq" ||
    v === "content-hub-agents-blog" ||
    v === "recommendations";

  return (
    <MonitorNotificationsProvider
      onNavigateToMonitor={() => {
        setMynaChatExpanded(false);
        setCurrentView("agents-monitor");
      }}
    >
    <div className="h-screen w-screen flex overflow-hidden">
      <ShortcutsModal
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
        currentView={currentView}
      />
      <Toaster position="top-center" />

      {/* L1 icon strip – full height on the far left */}
      <IconStrip
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenKeyboardShortcuts={() => setShortcutsModalOpen(true)}
        onSignOut={signOut}
      />

      {/* Everything to the right of the icon strip */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar spans above both L2 nav and content */}
        <TopBar
          currentView={currentView}
          onViewChange={handleViewChange}
          mynaChatOpen={mynaChatOpen}
          onToggleMynaChat={() => setMynaChatOpen((o) => !o)}
        />

        {/* Below TopBar: L2 nav + main content side by side */}
        <div
          className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}
        >
          <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>

          {/* Myna fullscreen: conversation L2 replaces product L2 */}
          {mynaWorkspaceExpanded && (
            <MynaConversationsL2NavPanel
              conversations={conversations}
              activeItem={activeL2NavKey}
              onSelectConversation={setActiveConversationId}
              onCreateNewChat={startNewMynaChat}
            />
          )}

          {/* Default Reports L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && !hasOwnL2Panel(currentView) && (
            <L2NavPanel currentView={currentView} onViewChange={handleViewChange} />
          )}

          {/* Reviews L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "reviews" && (
            <ReviewsL2NavPanel />
          )}
          {/* Social L2 nav panel — hidden on Create post (full-width composer) */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "social" && socialL2Active !== "Create post" && (
            <SocialL2NavPanel activeItem={socialL2Active} onActiveItemChange={handleSocialL2Change} />
          )}
          {/* Search AI L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "searchai" && (
            <SearchAIL2NavPanel
              activeItem={searchAIL2Active}
              onActiveItemChange={handleSearchAIL2Change}
            />
          )}
          {/* Contacts L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "contacts" && (
            <ContactsL2NavPanel
              activeItem={contactsL2Active}
              onActiveItemChange={handleContactsL2Change}
              onAddContact={handleContactsAddContact}
            />
          )}
          {/* Listings L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "listings" && (
            <ListingsL2NavPanel />
          )}
          {/* Surveys L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "surveys" && (
            <SurveysL2NavPanel />
          )}
          {/* Ticketing L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "ticketing" && (
            <TicketingL2NavPanel />
          )}
          {/* Campaigns L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "campaigns" && (
            <CampaignsL2NavPanel />
          )}
          {/* Insights L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "insights" && (
            <InsightsL2NavPanel />
          )}
          {/* Competitors L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "competitors" && (
            <CompetitorsL2NavPanel />
          )}
          {/* Appointments L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "appointments" && (
            <AppointmentsL2NavPanel />
          )}
          {/* Content Hub L2 nav panel — suppressed only on create view, or when the FAQ agent builder is open on the agents-faq page */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView?.startsWith("content-hub") && currentView !== "content-hub-create" && !(currentView === "content-hub-agents-faq" && faqAgentBuilderOpen) && (
            <ContentHubL2NavPanel
              activeItem={contentHubL2Active}
              onActiveItemChange={handleContentHubL2Change}
              onCreate={(mode) => {
                setCreateViewInitialMode(mode);
                setCurrentView("content-hub-create");
              }}
            />
          )}
          {/* Inbox L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "inbox" && (
            <InboxL2NavPanel />
          )}
          {/* Recommendations L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "recommendations" && (
            <RecommendationsL2NavPanel />
          )}
          {/* Agents L2 nav panel — suppressed for agents-builder (creation layout takes full width) */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && (currentView === "agents-monitor" || currentView === "agents-analyze-performance" || currentView === "agents-onboarding" || currentView === "agent-detail" || currentView === "birdai-reports" || currentView === "birdai-journeys") && (
            <AgentsL2NavPanel
              currentView={currentView}
              onViewChange={handleViewChange}
              selectedAgentSlug={selectedAgentSlug}
              selectedAnalyzeItem={selectedAnalyzeItem}
              journeysL2ActiveKey={journeysL2ActiveKey}
            />
          )}

          {/* Main content + optional Myna chat (flex row, main keeps ≥60% when possible) */}
          <div
            ref={chatLayoutRef}
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            {!mynaWorkspaceExpanded ? (
            <div
              className={`${APP_MAIN_CONTENT_SHELL_CLASS} min-h-0 min-w-[60%]`}
            >
            {currentView === "business-overview" ? (
              <BusinessOverviewDashboard />
            ) : currentView === "shared-by-me" ? (
              <SharedByMe onEditDraft={handleEditDraft} onViewReport={handleViewReport} />
            ) : currentView === "inbox" ? (
              <InboxView />
            ) : currentView === "storybook" ? (
              <ComponentShowcase />
            ) : currentView === "reviews" ? (
              <ReviewsView />
            ) : currentView === "social" ? (
              <SocialView activeItem={socialL2Active} onActiveItemChange={handleSocialL2Change} />
            ) : currentView === "searchai" ? (
              <SearchAIView l2ActiveItem={searchAIL2Active} />
            ) : currentView === "contacts" ? (
              <ContactsView app={contactsApp} />
            ) : currentView === "scheduled-deliveries" ? (
              <ScheduledDeliveriesView onCreateSchedule={() => handleViewChange("schedule-builder")} />
            ) : currentView === "agents-monitor" ? (
              <AgentsMonitorView
                onBack={() => setCurrentView("agents-monitor")}
                onNavigateToReviews={() => handleViewChange("reviews")}
              />
            ) : currentView === "agents-analyze-performance" ? (
              <AnalyzePerformanceView selectedItem={selectedAnalyzeItem} />
            ) : currentView === "agents-builder" ? (
              <AgentsBuilderView onBack={() => handleViewChange("agents-monitor")} />
            ) : currentView === "agent-detail" ? (
              <AgentDetailView
                agentSlug={selectedAgentSlug}
                onOpenBuilder={(_templateName) => {
                  if (selectedAgentSlug === "scheduled-reports") {
                    handleViewChange("schedule-builder");
                  } else {
                    handleViewChange("agents-builder");
                  }
                }}
              />
            ) : currentView === "agents-onboarding" ? (
              <AgentOnboardingView
                onComplete={() => handleViewChange("agents-monitor")}
                onSkip={() => handleViewChange("agents-monitor")}
                onGoToMonitor={() => handleViewChange("agents-monitor")}
              />
            ) : currentView === "schedule-builder" ? (
              <ScheduleBuilderView onBack={() => handleViewChange("agent-detail", "scheduled-reports")} />
            ) : currentView === "birdai-reports" ? (
              <BirdAIReportsView />
            ) : currentView === "birdai-journeys" ? (
              <BirdAIJourneysPlaceholderView journeysL2Key={journeysL2ActiveKey} />
            ) : currentView === "listings" ? (
              <ListingsView />
            ) : currentView === "surveys" ? (
              <SurveysView />
            ) : currentView === "ticketing" ? (
              <TicketingView />
            ) : currentView === "campaigns" ? (
              <CampaignsView />
            ) : currentView === "insights" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "competitors" ? (
              <CompetitorsView />
            ) : currentView === "referrals" ? (
              <ReferralsView />
            ) : currentView === "payments" ? (
              <PaymentsView />
            ) : currentView === "appointments" ? (
              <AppointmentsView />
            ) : currentView === "content-hub" || currentView === "content-hub-home" ? (
              <ContentHome
                onNavigate={(view, initialMode) => {
                  setCreateViewInitialMode(initialMode);
                  setCurrentView(view);
                }}
                onOpenCanvas={(mode) => {
                  if (mode === 'faq') setCreateViewStartAtFAQCanvas(true);
                  if (mode === 'blog') setCreateViewStartAtBlogCanvas(true);
                  setCurrentView("content-hub-create");
                }}
                onOpenProjects={() => {
                  setContentHubL2Active("standalone/Projects");
                  setCurrentView("content-hub-projects");
                }}
              />
            ) : currentView === "content-hub-projects" ? (
              <ProjectsView onNavigate={(view) => setCurrentView(view)} />
            ) : currentView === "content-hub-templates" ? (
              <ContentHubTemplatesView
                onSelectTemplate={(template) => {
                  // Route to CreateView with appropriate initial mode
                  const modeMap: Record<string, ContentHomeInitialMode> = {
                    faq: 'faq', social: 'social', email: 'email',
                    blog: 'brief', ads: 'brief', response: 'brief',
                  };
                  setCreateViewInitialMode(modeMap[template.type] ?? undefined);
                  setCurrentView("content-hub-create");
                }}
                onBack={() => {}}
              />
            ) : currentView === "content-hub-calendar" ? (
              <ContentHubCalendarView />
            ) : currentView === "content-hub-agents-faq" ? (
              <FAQGenerationAgentsView onBuilderModeChange={setFaqAgentBuilderOpen} />
            ) : currentView === "content-hub-agents-blog" ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Blog recommendation agents — coming soon</div>
            ) : currentView === "content-hub-create" ? (
              createViewStartAtFAQCanvas ? (
                <ContentEditorShell
                  mode="faq"
                  skipSetupPhase
                  initialTitle={createViewRecTitle ?? undefined}
                  onBack={() => {
                    setCreateViewInitialMode(undefined);
                    setCreateViewStartAtFAQCanvas(false);
                    setCreateViewRecId(undefined);
                    setCreateViewRecTitle(undefined);
                    setCreateViewRecAeoScore(undefined);
                    setCreateViewPreloadedQuestions(undefined);
                    setCurrentView("recommendations");
                  }}
                />
              ) : createViewStartAtBlogCanvas ? (
                <ContentEditorShell
                  mode="blog"
                  skipSetupPhase
                  onBack={() => {
                    setCreateViewStartAtBlogCanvas(false);
                    setCurrentView("content-hub-home");
                  }}
                />
              ) : (
                <ContentEditorShell
                  mode={(() => {
                    const m = createViewInitialMode;
                    if (m === 'project' || m === 'brief') return 'project';
                    if (m === 'blog' || m === 'blogEditor') return 'blog';
                    if (m === 'social' || m === 'socialEditor') return 'social';
                    if (m === 'email' || m === 'emailEditor') return 'email';
                    if (m === 'faq') return 'faq';
                    if (m === 'landing') return 'landing';
                    if (m === 'video') return 'video';
                    return 'project';
                  })() as ContentMode}
                  onBack={() => {
                    setCreateViewInitialMode(undefined);
                    setCreateViewStartAtFAQCanvas(false);
                    setCreateViewStartAtBlogCanvas(false);
                    setCreateViewRecId(undefined);
                    setCreateViewRecTitle(undefined);
                    setCreateViewRecAeoScore(undefined);
                    setCurrentView("content-hub");
                  }}
                />
              )
            ) : currentView === "recommendations" ? (
              <RecommendationsView
                onNavigateToContentHub={(recId, recTitle, recAeoScore, preloadedQuestions) => {
                  setCreateViewInitialMode('faq');
                  setCreateViewStartAtFAQCanvas(true);
                  setCreateViewRecId(recId);
                  setCreateViewRecTitle(recTitle);
                  setCreateViewRecAeoScore(recAeoScore);
                  setCreateViewPreloadedQuestions(preloadedQuestions);
                  setCurrentView("content-hub-create");
                }}
                onNavigateToBlogCanvas={(recId, recTitle) => {
                  setCreateViewInitialMode('blog');
                  setCreateViewStartAtBlogCanvas(true);
                  setCreateViewRecId(recId);
                  setCreateViewRecTitle(recTitle);
                  setCurrentView("content-hub-create");
                }}
              />
            ) : (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            )}
            </div>
            ) : null}
            <ResizableRightChatPanel
              open={mynaChatOpen}
              workspaceExpanded={mynaWorkspaceExpanded}
              layoutRowWidth={chatLayoutWidth}
            >
              {mynaChatPanelEl}
            </ResizableRightChatPanel>
          </div>
          </div>
        </div>
      </div>
    </div>
    </MonitorNotificationsProvider>
  );
}
