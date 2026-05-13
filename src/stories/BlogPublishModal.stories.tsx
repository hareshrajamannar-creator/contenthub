import type { Meta, StoryObj } from "@storybook/react";
import { BlogPublishModal } from "@/app/components/content-hub/blog/BlogPublishModal";

const meta: Meta<typeof BlogPublishModal> = {
  title: "App/BlogPublishModal",
  component: BlogPublishModal,
};
export default meta;
type Story = StoryObj<typeof BlogPublishModal>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
};
