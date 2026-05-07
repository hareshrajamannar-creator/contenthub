import type { Meta, StoryObj } from "@storybook/react";
import { WorkspacePlaceholderSkeleton } from "@/app/components/layout/WorkspacePlaceholderSkeleton";

const meta: Meta<typeof WorkspacePlaceholderSkeleton> = {
  title: "App/WorkspacePlaceholderSkeleton",
  component: WorkspacePlaceholderSkeleton,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen min-h-0 w-full flex-col bg-background">
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkspacePlaceholderSkeleton>;

export const Default: Story = {
  args: {
    caption: "Overview workspace is loading for this section.",
  },
};

export const SocialPublishing: Story = {
  name: "Social publishing",
  args: {
    caption: "Publishing workspace is loading for this section.",
  },
};
