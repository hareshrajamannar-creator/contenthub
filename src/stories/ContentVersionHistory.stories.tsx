import type { Meta, StoryObj } from '@storybook/react';
import { ContentVersionHistory } from '@/app/components/content-hub/shared/ContentVersionHistory';

const meta: Meta<typeof ContentVersionHistory> = {
  title: 'App/ContentVersionHistory',
  component: ContentVersionHistory,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ContentVersionHistory>;

export const FAQVersion: Story = {
  args: {
    contentType: 'faq',
    onClose: () => {},
  },
};

export const BlogVersion: Story = {
  args: {
    contentType: 'blog',
    onClose: () => {},
  },
};
