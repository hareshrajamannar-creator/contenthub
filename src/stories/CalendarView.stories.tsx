import type { Meta, StoryObj } from "@storybook/react";
import { CalendarView } from "@/app/components/CalendarView";

const meta: Meta<typeof CalendarView> = {
  title: "App/Views/CalendarView",
  component: CalendarView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Social **Publish/Calendar** week grid. Header includes **Actions** (Share report, Customize & share, Schedule) via `ReportActionsButton` for parity with Insights **Dashboard**. " +
          "QA: open each action, dismiss modals/drawer, outside-click the menu, check light/dark toolbar.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

export const Default: Story = {
  args: {
    onPostClick: () => {},
    onActivityClick: () => {},
  },
};
