import type { Meta, StoryObj } from '@storybook/react';
import { ProjectsView } from '@/app/components/content-hub/ProjectsView';

const meta: Meta<typeof ProjectsView> = {
  title: 'App/ProjectsView',
  component: ProjectsView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onNavigate: (view) => console.log('navigate to', view),
  },
};
export default meta;

type Story = StoryObj<typeof ProjectsView>;

export const Default: Story = {};
Default.parameters = {
  docs: {
    description: {
      story: 'Saved projects view with the review-style list/grid switcher in the header.',
    },
  },
};

export const Library: Story = {
  name: 'Library',
  args: {
    initialTab: 'library',
  },
};
