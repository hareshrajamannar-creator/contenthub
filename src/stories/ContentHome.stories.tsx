import type { Meta, StoryObj } from '@storybook/react';
import { ContentHome } from '@/app/components/content-hub/ContentHome';

const meta: Meta<typeof ContentHome> = {
  title: 'App/ContentHome',
  component: ContentHome,
};
export default meta;
type Story = StoryObj<typeof ContentHome>;

export const Default: Story = {
  args: {
    onNavigate: () => {},
    onOpenProjects: () => {},
  },
};
