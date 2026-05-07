import type { Meta, StoryObj } from "@storybook/react";
import { Store, Star, Webhook, LayoutGrid } from "lucide-react";
import { SettingsItemRow } from "@/app/components/settings/SettingsItemRow";

const ICON_CLS = "text-muted-foreground shrink-0";

const meta: Meta<typeof SettingsItemRow> = {
  title: "App/Settings/SettingsItemRow",
  component: SettingsItemRow,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-64 bg-card rounded-lg border border-border p-4">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SettingsItemRow>;

export const Default: Story = {
  args: {
    label: "Business",
    description: "Manage business locations, hours, services, and contact details across every channel.",
    icon: () => <Store size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
  },
};

export const WithStatusConnected: Story = {
  args: {
    label: "Google Merchant Center",
    description: "Sync product listings so reviews and shopping data stay in step.",
    icon: () => <Store size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
    status: { type: "connected", label: "Connected" },
  },
};

export const WithStatusDisconnected: Story = {
  args: {
    label: "Google",
    description: "Connect Google Business profiles to sync reviews, posts, and Q&A.",
    icon: () => <Store size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
    status: { type: "disconnected", label: "7 pages disconnected" },
  },
};

export const WithStatusPartial: Story = {
  args: {
    label: "Yelp",
    description: "Sync Yelp listings to monitor and respond to reviews in one inbox.",
    icon: () => <Star size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
    status: { type: "partial", label: "2 of 171 connected" },
  },
};

export const WithNewBadge: Story = {
  args: {
    label: "All apps",
    description: "Browse the full integration catalog and connect new tools in minutes.",
    icon: () => <LayoutGrid size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
    badge: "new",
  },
};

export const WithAgentLive: Story = {
  args: {
    label: "Review response agent",
    description: "Auto-reply to reviews using your brand voice and approval rules.",
    icon: () => <Star size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
    agentStatus: "live",
  },
};

export const LongDescriptionClamp: Story = {
  args: {
    label: "API",
    description: "Build fully custom integrations and automation workflows using Birdeye REST endpoints, webhooks, and event-based triggers to connect any external system.",
    icon: () => <Webhook size={16} strokeWidth={1.6} absoluteStrokeWidth className={ICON_CLS} />,
  },
};
