import type { Meta, StoryObj } from "@storybook/react";
import { FAQGenerationAgentsView } from "@/app/components/content-hub/FAQGenerationAgentsView";

const meta: Meta<typeof FAQGenerationAgentsView> = {
  title: "App/FAQGenerationAgentsView",
  component: FAQGenerationAgentsView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "FAQ Generation Agents dashboard with Agents/Templates tabs and a full " +
          "workflow builder. Click any agent row to open the 3-column builder " +
          "(LHS node palette + canvas + RHS node details panel).",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FAQGenerationAgentsView>;

/** Default list view — agents table with metrics bar */
export const Default: Story = {};

/**
 * Workflow builder — visible after clicking an agent row.
 * Storybook renders the list; interact with a row to enter builder mode.
 */
export const WorkflowBuilder: Story = {};
