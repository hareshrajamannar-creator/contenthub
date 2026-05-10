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
};

export const Library: Story = {
  name: "Library",
  args: {
    initialTab: "library",
    onNavigate: () => {},
  },
};
