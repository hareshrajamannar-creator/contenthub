import type { Meta, StoryObj } from "@storybook/react";
import { BlogPublishModal } from "@/app/components/content-hub/blog/BlogPublishModal";

const meta: Meta<typeof BlogPublishModal> = {
  title: "App/BlogPublishModal",
  component: BlogPublishModal,
  parameters: {
    layout: "centered",
  },
};
export default meta;
type Story = StoryObj<typeof BlogPublishModal>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'First publish: WordPress / Wix destination picker.',
      },
    },
  },
};

export const ManageAfterPublish: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'After publishing (pick a site → Publish), close and reopen the modal: instead of the destination picker it now shows the Framer-style manage view — live link, last-updated/author, and an Update CTA to push new changes (plus "Publish to another site").',
      },
    },
  },
};
