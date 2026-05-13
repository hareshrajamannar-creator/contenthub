import type { Meta, StoryObj } from "@storybook/react";
import { FAQAgentsDashboardView } from "@/app/components/content-hub/FAQAgentsDashboardView";

const meta: Meta<typeof FAQAgentsDashboardView> = {
  title: "App/FAQAgentsDashboardView",
  component: FAQAgentsDashboardView,
  parameters: { layout: "fullscreen" },
  args: {
    onOpenAgent: () => {},
    onCreateAgent: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof FAQAgentsDashboardView>;

export const Default: Story = {};

export const LibraryTab: Story = {
  play: async ({ canvasElement }) => {
    const libraryBtn = canvasElement.querySelector('[role="tab"][aria-selected="false"]') as HTMLButtonElement | null;
    libraryBtn?.click();
  },
};
