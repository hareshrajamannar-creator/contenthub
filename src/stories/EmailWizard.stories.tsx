import type { Meta, StoryObj } from '@storybook/react';
import { EmailWizard } from '@/app/components/content-hub/email/EmailWizard';

const meta: Meta<typeof EmailWizard> = {
  title: 'App/EmailWizard',
  component: EmailWizard,
  parameters: { layout: 'fullscreen' },
  args: {
    onExit: () => {},
    onComplete: (s) => console.log('complete', s),
  },
};
export default meta;
type Story = StoryObj<typeof EmailWizard>;

export const Default: Story = {};

export const PromoTemplate: Story = {
  render: (args) => <EmailWizard {...args} />,
};
