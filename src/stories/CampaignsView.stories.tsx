import type { Meta, StoryObj } from "@storybook/react";
import { CampaignsView } from "@/app/components/CampaignsView";

const meta: Meta<typeof CampaignsView> = {
  title: "App/Views/CampaignsView",
  component: CampaignsView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Manage Automations canvas (campaigns route). Migrated from `UI-web-2.0/src/app/pages/campaigns/`. " +
          "Search starts as an icon in `MainCanvasViewHeader` actions (Reviews-style); type/status filters and Columns sit beside it. " +
          "Single table: campaigns and automations (mock `tab` field) shown together. " +
          "Table columns: name + channel icons (email / SMS, icon-only), type badge, status badge, contacts, opened %, clicked %, last run, created by, ⋯ actions. " +
          "Row click opens a floating medium Sheet (FloatingSheetFrame) with stats, timeline, recent activity, and footer actions. " +
          "All data is mocked for prototype use.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CampaignsView>;

export const Default: Story = {};
