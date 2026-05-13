import type { Meta, StoryObj } from "@storybook/react";
import { ProjectsView } from "@/app/components/content-hub/ProjectsView";

const meta: Meta<typeof ProjectsView> = {
  title: "App/ContentHub/Projects",
  component: ProjectsView,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof ProjectsView>;

export const Default: Story = {
  args: { onNavigate: () => {} },
  parameters: {
    docs: {
      description: {
        story: "View all contents list with the review-style list/grid switcher in the header.",
      },
    },
  },
};

export const Library: Story = {
  name: "Library",
  args: {
    initialTab: "library",
    onNavigate: () => {},
  },
};
