import type { Meta, StoryObj } from '@storybook/react';
import { InlineCreationFlow } from '@/app/components/content-hub/inline/InlineCreationFlow';

const meta: Meta<typeof InlineCreationFlow> = {
  title: 'App/InlineCreationFlow',
  component: InlineCreationFlow,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InlineCreationFlow>;

export const ProjectFlow: Story = {
  name: 'Project flow',
  args: {
    mode: 'project',
    onComplete: (data) => console.log('complete', data),
    onCancel:   () => console.log('cancel'),
  },
};

export const FAQFlow: Story = {
  name: 'FAQ flow',
  args: {
    mode: 'faq',
    onComplete: (data) => console.log('complete', data),
    onCancel:   () => console.log('cancel'),
  },
};

export const BlogFlow: Story = {
  name: 'Blog flow',
  args: {
    mode: 'blog',
    onComplete: (data) => console.log('complete', data),
    onCancel:   () => console.log('cancel'),
  },
};

export const LandingFlow: Story = {
  name: 'Landing page flow',
  args: {
    mode: 'landing',
    onComplete: (data) => console.log('complete', data),
    onCancel:   () => console.log('cancel'),
  },
};
