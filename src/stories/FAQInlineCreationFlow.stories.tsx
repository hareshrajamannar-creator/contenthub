import type { Meta, StoryObj } from '@storybook/react';
import { FAQInlineCreationFlow } from '@/app/components/content-hub/faq/FAQInlineCreationFlow';

const meta: Meta<typeof FAQInlineCreationFlow> = {
  title: 'App/FAQInlineCreationFlow',
  component: FAQInlineCreationFlow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Inline FAQ setup flow with a fixed-height scroll container and one detailed FAQ content brief.',
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
