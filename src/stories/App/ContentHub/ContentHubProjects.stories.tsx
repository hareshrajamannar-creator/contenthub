import type { Meta, StoryObj } from "@storybook/react";
import { ProjectsView } from "@/app/components/content-hub/ProjectsView";

const meta: Meta<typeof ProjectsView> = {
  title: "App/ContentHub/Projects",
  component: ProjectsView,
};
export default meta;
type Story = StoryObj<typeof ProjectsView>;

export const Default: Story = {
  args: { onNavigate: () => {} },
};
