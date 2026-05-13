import type { Meta, StoryObj } from '@storybook/react';
import { ProjectGenerationProgress } from '@/app/components/content-hub/ProjectGenerationProgress';

const meta: Meta<typeof ProjectGenerationProgress> = {
  title: 'App/ProjectGenerationProgress',
  component: ProjectGenerationProgress,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen min-h-0 bg-[var(--color-canvas,#F7F8FA)]">
        <Story />
      </div>
    ),
  ],
  args: {
    flowData: {
      mode: 'project',
      projectName: 'Spring garden cleanup',
      brandKit: 'Brand identity',
      objective: 'Seasonal campaign',
      ideas: [
        {
          id: 'blog-1',
          type: 'blog',
          typeLabel: 'Blog',
          title: 'Spring garden cleanup checklist',
          description: 'A practical guide for seasonal lawn and garden maintenance.',
        },
        {
          id: 'faq-1',
          type: 'faq',
          typeLabel: 'FAQ',
          title: 'Spring cleanup FAQs',
          description: 'Common questions customers ask before booking a cleanup.',
        },
        {
          id: 'social-1',
          type: 'social',
          typeLabel: 'Social',
          title: 'Before and after showcase',
          description: 'Short social copy for visual transformation posts.',
        },
      ],
    },
    onComplete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ProjectGenerationProgress>;

export const Default: Story = {};

export const Exiting: Story = {
  args: {
    isExiting: true,
  },
};
