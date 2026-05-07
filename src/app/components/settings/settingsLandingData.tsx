import type { ReactElement } from "react";
import {
  Building2, ClipboardCheck, QrCode,
  Image, HelpCircle, Link2, FileText,
  Globe, Facebook, Instagram, Linkedin, Youtube,
  MessageCircle, Music2, ShoppingBag, LayoutGrid,
  Utensils, Truck, Wrench, Building, Scale,
  Webhook, Fingerprint,
  Star, Share2,
  ListChecks, CheckSquare, BarChart3, TrendingUp, Tag,
  Bot, PhoneCall, CircleDollarSign,
  CalendarDays, Mail,
  ShieldOff, GitFork, LifeBuoy, Package, LayoutDashboard,
} from "lucide-react";
import type { SettingsStatusMeta } from "./settingsStatusConfig";

const ICON_CLS = "text-muted-foreground shrink-0";
const SZ = 16;
const SW = 1.6;

function i(Icon: React.ElementType): () => ReactElement {
  return () => <Icon size={SZ} strokeWidth={SW} absoluteStrokeWidth className={ICON_CLS} />;
}

export interface SettingsItem {
  key: string;
  label: string;
  description: string;
  icon: () => ReactElement;
  status?: SettingsStatusMeta;
  badge?: "new";
  agentStatus?: "live" | "inactive";
}

export interface SettingsSection {
  key: string;
  label: string;
  description: string;
  learnMore?: boolean;
  banner?: { message: string; linkLabel?: string };
  items: SettingsItem[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    key: "business-info",
    label: "Business info",
    description: "Add all your business locations and unlock the power of Birdeye.",
    learnMore: true,
    items: [
      { key: "business",      label: "Business",      description: "Manage business locations, hours, services, and contact details across every channel.",     icon: i(Building2) },
      { key: "setup-status",  label: "Setup status",  description: "Track your onboarding progress and finish remaining setup steps in one place.",              icon: i(ClipboardCheck) },
      { key: "qr-codes",      label: "QR codes",      description: "Generate branded QR codes that link customers to review and booking pages.",                 icon: i(QrCode) },
    ],
  },
  {
    key: "knowledge",
    label: "Knowledge",
    description: "One place to manage your AI ground truth across files, docs, images, and videos.",
    items: [
      { key: "media-library", label: "Media library", description: "Centralize images, videos, and brand assets that AI agents can reference.",                  icon: i(Image) },
      { key: "faqs",          label: "FAQs",          description: "Curate frequently asked questions so AI replies stay on-brand and accurate.",                icon: i(HelpCircle) },
      { key: "links",         label: "Links",         description: "Save canonical URLs your team and AI agents share most often.",                              icon: i(Link2) },
      { key: "files",         label: "Files",         description: "Upload PDFs, docs, and policies that ground AI responses in your truth.",                    icon: i(FileText) },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    description: "Connect your social media pages to help promote brand content.",
    learnMore: true,
    banner: {
      message: "Delegate the management of Apple Business Connect to Birdeye for faster business listing updates, reporting, and more.",
      linkLabel: "Learn more",
    },
    items: [
      { key: "google",       label: "Google",                description: "Connect Google Business profiles to sync reviews, posts, and Q&A.",                   icon: i(Globe),       status: { type: "disconnected", label: "7 pages disconnected" } },
      { key: "facebook",     label: "Facebook",              description: "Link Facebook pages to publish updates and capture reviews.",                          icon: i(Facebook),    status: { type: "disconnected", label: "3 pages disconnected" } },
      { key: "yelp",         label: "Yelp",                  description: "Sync Yelp listings to monitor and respond to reviews in one inbox.",                   icon: i(Star),        status: { type: "partial",       label: "2 of 171 connected" } },
      { key: "instagram",    label: "Instagram",             description: "Connect Instagram to schedule posts and reply to comments.",                           icon: i(Instagram),   status: { type: "disconnected", label: "2 pages disconnected" } },
      { key: "whatsapp",     label: "WhatsApp",              description: "Route WhatsApp inquiries into the unified inbox for faster responses.",                icon: i(MessageCircle), status: { type: "not_connected", label: "Not connected" } },
      { key: "linkedin",     label: "LinkedIn",              description: "Publish company updates and engage prospects from one workspace.",                     icon: i(Linkedin),    status: { type: "disconnected", label: "1 page disconnected" } },
      { key: "youtube",      label: "YouTube",               description: "Sync YouTube channels to manage comments alongside other reviews.",                    icon: i(Youtube),     status: { type: "disconnected", label: "1 page disconnected" } },
      { key: "tiktok",       label: "TikTok",                description: "Connect TikTok to schedule clips and pull engagement data.",                           icon: i(Music2),      status: { type: "disconnected", label: "1 page disconnected" } },
      { key: "gmc",          label: "Google Merchant Center",description: "Sync product listings so reviews and shopping data stay in step.",                    icon: i(ShoppingBag), status: { type: "connected",    label: "Connected" } },
      { key: "ms365",        label: "Microsoft Office 365",  description: "Connect calendars and email to keep customer comms synced.",                          icon: i(LayoutGrid),  status: { type: "partial",      label: "Partially connected" } },
      { key: "toast",        label: "TOAST",                 description: "Pull restaurant orders and guest data from TOAST POS.",                               icon: i(Utensils),    status: { type: "needs_attention", label: "Needs attention" } },
      { key: "olo",          label: "Olo",                   description: "Sync ordering and delivery data from Olo to drive review requests.",                  icon: i(Truck),       status: { type: "partial",      label: "Partially connected" } },
      { key: "servicetitan", label: "ServiceTitan",          description: "Trigger review requests from ServiceTitan jobs the moment they close.",               icon: i(Wrench),      status: { type: "partial",      label: "Partially connected" } },
      { key: "appfolio",     label: "AppFolio",              description: "Sync resident and property data from AppFolio to power outreach.",                    icon: i(Building),    status: { type: "partial",      label: "Partially connected" } },
      { key: "neos",         label: "NEOS",                  description: "Connect NEOS case management to message clients at the right moments.",               icon: i(Scale),       status: { type: "partial",      label: "Partially connected" } },
      { key: "all-apps",     label: "All apps",              description: "Browse the full integration catalog and connect new tools in minutes.",               icon: i(LayoutGrid),  badge: "new" },
      { key: "api",          label: "API",                   description: "Build custom workflows with REST endpoints and webhooks.",                             icon: i(Webhook) },
    ],
  },
  {
    key: "birdai",
    label: "BirdAI",
    description: "Optimize everyday tasks and boost your productivity with BirdAI.",
    learnMore: true,
    items: [
      { key: "brand-identity", label: "Brand Identity", description: "Define tone, voice, and brand rules so every AI reply sounds like you.", icon: i(Fingerprint) },
    ],
  },
  {
    key: "ai-agents",
    label: "AI agents",
    description: "Leverage AI agents to automate customer interactions and streamline business operations.",
    items: [
      { key: "review-response-agent",    label: "Review response agent",    description: "Auto-reply to reviews using your brand voice and approval rules.",                             icon: i(Star),  agentStatus: "live" },
      { key: "review-generation-agent",  label: "Review generation agent",  description: "Send automated review requests with AI optimization to generate more reviews.",               icon: i(Star) },
      { key: "social-engagement-agent",  label: "Social engagement agent",  description: "Engage followers with timely AI-drafted replies on every connected channel.",                icon: i(Share2) },
    ],
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Manage and cross-promote reviews on your social sites.",
    learnMore: true,
    items: [
      { key: "response-templates", label: "Response templates", description: "Save reusable replies and let AI personalize each response.",                        icon: i(FileText) },
      { key: "auto-reply-rules",   label: "Auto-reply rules",   description: "Set rules that decide when AI replies and when humans step in.",                    icon: i(ListChecks) },
      { key: "auto-share-rules",   label: "Auto-share rules",   description: "Automatically cross-post your best reviews to social channels.",                   icon: i(Share2) },
      { key: "ratings-display",    label: "Ratings display",    description: "Choose how star ratings and totals appear on your website widgets.",                icon: i(Star) },
      { key: "approval",           label: "Approval",           description: "Configure who reviews AI replies before they go live.",                             icon: i(CheckSquare) },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    description: "Reveal meaningful and actionable insights via customers' feedback.",
    learnMore: true,
    items: [
      { key: "categories-keywords", label: "Categories and keywords", description: "Tag review themes so trends and pain points surface automatically.",          icon: i(Tag) },
      { key: "birdeye-score",       label: "Birdeye Score",           description: "Customize how your composite reputation score is calculated.",               icon: i(TrendingUp) },
    ],
  },
  {
    key: "competitors",
    label: "Competitors",
    description: "Evaluate your competitors' strengths and weaknesses to reinforce your market strategy.",
    learnMore: true,
    items: [
      { key: "manage-competitors", label: "Manage competitors", description: "Add and remove the competitors you want to benchmark against.", icon: i(BarChart3) },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    description: "Convert inquiries over text, social, email, chatbot AI and voicemail into one unified inbox.",
    learnMore: true,
    items: [
      { key: "chatbot-ai",   label: "Chatbot AI",   description: "Train the chatbot's tone, knowledge, and escalation rules.",               icon: i(Bot) },
      { key: "receptionist", label: "Receptionist", description: "Set up the AI voice receptionist that answers calls 24/7.",                icon: i(PhoneCall) },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    description: "Get paid faster, improve customer satisfaction and track funds via Birdeye Payments.",
    learnMore: true,
    items: [
      { key: "set-up-payments", label: "Set up payments", description: "Connect a processor and start collecting payments via text and email.", icon: i(CircleDollarSign) },
    ],
  },
  {
    key: "appointments",
    label: "Appointments",
    description: "Make it easy for customers to book appointments on your website.",
    learnMore: true,
    items: [
      { key: "widget",               label: "Set up your widget",      description: "Embed a booking widget on your site and tailor the customer experience.",   icon: i(CalendarDays) },
      { key: "notifications-alerts", label: "Notifications and Alerts", description: "Choose when staff and customers get reminders and confirmations.",         icon: i(Mail) },
    ],
  },
  {
    key: "account",
    label: "Account",
    description: "Manage your account including users, employees, support and more!",
    learnMore: true,
    items: [
      { key: "blocked-keywords",    label: "Blocked keywords",     description: "Block specific terms from triggering AI replies or auto-shares.",               icon: i(ShieldOff) },
      { key: "groups",              label: "Groups",               description: "Organize locations and teams to control who sees what.",                       icon: i(GitFork) },
      { key: "support",             label: "Support",              description: "Reach the Birdeye support team or browse help articles.",                      icon: i(LifeBuoy) },
      { key: "timezone",            label: "Timezone",             description: "Set the default timezone used across reports and schedules.",                  icon: i(Globe) },
      { key: "products",            label: "Products",             description: "Enable or disable Birdeye products for this workspace.",                       icon: i(Package) },
      { key: "dashboard-appearance",label: "Dashboard appearance", description: "Tune theme, density, and default views for your dashboard.",                  icon: i(LayoutDashboard) },
    ],
  },
];

export const SETTINGS_SECTION_LABELS = SETTINGS_SECTIONS.map((s) => s.label);
