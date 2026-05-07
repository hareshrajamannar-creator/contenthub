import type { Meta, StoryObj } from "@storybook/react";
import { SocialView } from "@/app/components/SocialView";

const meta: Meta<typeof SocialView> = {
  title: "App/Views/SocialView",
  component: SocialView,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SocialView>;

export const Default: Story = {};
