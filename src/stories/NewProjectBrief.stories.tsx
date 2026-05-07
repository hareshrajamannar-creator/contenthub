import type { Meta, StoryObj } from '@storybook/react';
import { NewProjectBrief } from '@/app/components/content-hub/NewProjectBrief';

const meta: Meta<typeof NewProjectBrief> = {
  title: 'App/NewProjectBrief',
  component: NewProjectBrief,
  parameters: { layout: 'fullscreen' },
  args: { onBack: () => {}, onComplete: (b) => console.log('complete', b) },
};
export default meta;
type Story = StoryObj<typeof NewProjectBrief>;

export const Default: Story = {};
export const ContentMixStep: Story = { name: 'Content mix step' };
