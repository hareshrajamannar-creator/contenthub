import type { Meta, StoryObj } from '@storybook/react';
import { BlogInlineCreationFlow } from '@/app/components/content-hub/blog/BlogInlineCreationFlow';

const meta: Meta<typeof BlogInlineCreationFlow> = {
  title: 'App/BlogInlineCreationFlow',
  component: BlogInlineCreationFlow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Inline blog setup flow with a fixed-height scroll container and per-blog content brief summaries.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BlogInlineCreationFlow>;

export const Default: Story = {
  args: {
    onComplete: (data) => console.log('Blog flow complete', data),
    onCancel: () => console.log('Cancelled'),
  },
};

export const HiddenProgress: Story = {
  name: 'Hidden progress',
  args: {
    hideProgress: true,
    onComplete: (data) => console.log('Blog flow complete', data),
    onCancel: () => console.log('Cancelled'),
  },
};
