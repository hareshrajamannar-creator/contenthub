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
      story: 'View all contents list with the review-style list/grid/calendar switcher in the header.',
    },
  },
};

export const Grid: Story = {
  name: 'Grid',
  args: {
    initialViewMode: 'grid',
  },
};

export const Calendar: Story = {
  name: 'Calendar',
  args: {
    initialViewMode: 'calendar',
  },
};

export const Library: Story = {
  name: 'Library',
  args: {
    initialTab: 'library',
  },
};
