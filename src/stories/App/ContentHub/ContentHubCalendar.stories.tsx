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

export const Default: Story = {};
export const MonthView: Story = {};
