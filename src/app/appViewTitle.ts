import type { AppView } from "./App";

/** Single source of truth for the top bar / Myna context label for each route. */
export function getAppViewTitle(view: AppView): string {
  switch (view) {
    case "business-overview":
      return "Overview";
    case "inbox":
      return "Inbox";
    case "storybook":
      return "Component showcase";
    case "reviews":
      return "Reviews";
    case "social":
      return "Social";
    case "searchai":
      return "Chatbot";
    case "contacts":
      return "Contacts";
    case "listings":
      return "Listings";
    case "surveys":
      return "Surveys";
    case "ticketing":
      return "Ticketing";
    case "campaigns":
      return "Manage Automations";
    case "insights":
      return "Insights";
    case "competitors":
      return "Competitors";
    case "referrals":
      return "Referrals";
    case "payments":
      return "Payments";
    case "appointments":
      return "Appointments";
    case "recommendations":
      return "Search AI";
    case "content-hub":
    case "content-hub-home":
    case "content-hub-projects":
    case "content-hub-templates":
    case "content-hub-calendar":
    case "content-hub-create":
    case "content-hub-assigned":
    case "content-hub-approve":
    case "content-hub-agents-faq":
    case "content-hub-agents-blog":
      return "Content Hub";
    case "dashboard":
      return "Reports";
    case "shared-by-me":
      return "Shared by me";
    case "scheduled-deliveries":
    case "schedule-builder":
      return "Scheduled deliveries";
    case "agents-monitor":
    case "agents-analyze-performance":
    case "agents-builder":
    case "agent-detail":
    case "birdai-reports":
      return "BirdAI";
    case "agents-onboarding":
      return "BirdAI setup";
    case "birdai-journeys":
      return "BirdAI";
    case "conversation-stream":
      return "Conversation Stream";
    case "agent-activity":
      return "Activity Log";
    case "agent-config":
      return "Agent Configuration";
    case "aeo-product-listing-1":
      return "Listings";
    case "aeo-search-ai":
      return "Search AI";
    default:
      return "Reports";
  }
}

/** Browser tab titles when logged out — rotate on each sign-out (see App.tsx). */
export const LOGIN_TAB_TITLES = [
  "Welcome – Birdeye",
  "Hey there – Birdeye",
  "Sign in – Birdeye",
  "Hello – Birdeye",
  "Welcome back – Birdeye",
  "Good to see you – Birdeye",
  "Glad you're here – Birdeye",
  "Hi there – Birdeye",
  "Log in – Birdeye",
  "Let's get started – Birdeye",
  "Continue – Birdeye",
  "Almost there – Birdeye",
  "Jump back in – Birdeye",
  "Nice to see you – Birdeye",
  "Ready when you are – Birdeye",
  "Let's go – Birdeye",
  "Your workspace awaits – Birdeye",
  "Sign in to continue – Birdeye",
  "Secure sign-in – Birdeye",
  "Account access – Birdeye",
  "Back again – Birdeye",
  "Step inside – Birdeye",
  "Come on in – Birdeye",
  "Resume – Birdeye",
  "See you inside – Birdeye",
] as const;

export const LOGIN_TAB_TITLE_COUNT = LOGIN_TAB_TITLES.length;
