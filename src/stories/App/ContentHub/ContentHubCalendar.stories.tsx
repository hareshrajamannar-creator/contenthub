import type { Meta, StoryObj } from "@storybook/react";
import { CalendarView } from "@/app/components/content-hub/CalendarView";

const meta: Meta<typeof CalendarView> = {
  title: "App/ContentHub/Calendar",
  component: CalendarView,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof CalendarView>;

export const Default: Story = {
  args: {
    initialView: "week",
  },
};

export const WeekView: Story = {
  name: "Week view",
  args: {
    initialView: "week",
  },
};

export const MonthView: Story = {
  name: "Month view",
  args: {
    initialView: "month",
  },
};

export const ListView: Story = {
  name: "List view",
  args: {
    initialView: "list",
  },
};

export const EmbeddedWeekView: Story = {
  name: "Embedded week view",
  args: {
    initialView: "week",
    embedded: true,
  },
};
