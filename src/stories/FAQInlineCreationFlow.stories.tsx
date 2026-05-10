import type { Meta, StoryObj } from '@storybook/react';
import { FAQInlineCreationFlow } from '@/app/components/content-hub/faq/FAQInlineCreationFlow';

const meta: Meta<typeof FAQInlineCreationFlow> = {
  title: 'App/FAQInlineCreationFlow',
  component: FAQInlineCreationFlow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Inline FAQ setup flow opened from Content Hub Home. Uses flat native selectors and stable parent navigation sync.',
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

type Story = StoryObj<typeof FAQInlineCreationFlow>;

export const Default: Story = {
  args: {
    onComplete: (data) => console.log('FAQ flow complete', data),
    onCancel: () => console.log('Cancelled'),
  },
};

export const WithCancel: Story = {
  args: {
    onComplete: (data) => alert(JSON.stringify(data, null, 2)),
    onCancel: () => alert('Cancelled'),
  },
};
