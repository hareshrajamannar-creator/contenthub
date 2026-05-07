import type { Meta, StoryObj } from '@storybook/react';
import { SocialWizard } from '@/app/components/content-hub/social/SocialWizard';

const meta: Meta<typeof SocialWizard> = {
  title: 'App/SocialWizard',
  component: SocialWizard,
  parameters: { layout: 'fullscreen' },
  args: { onExit: () => {}, onComplete: (s) => console.log('complete', s) },
};
export default meta;
type Story = StoryObj<typeof SocialWizard>;
export const Default: Story = {};
