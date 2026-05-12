import type { Meta, StoryObj } from '@storybook/react';
import { BlogGenerationProgress } from '@/app/components/content-hub/blog/BlogGenerationProgress';

const SAMPLE_SECTIONS = [
  { id: 's1', heading: 'Introduction', description: 'Set the context', wordCount: 150 },
  { id: 's2', heading: 'Why local visibility matters', description: 'Explain search intent', wordCount: 300 },
  { id: 's3', heading: 'How to improve content', description: 'Give practical guidance', wordCount: 450 },
];

const meta: Meta<typeof BlogGenerationProgress> = {
  title: 'App/BlogGenerationProgress',
  component: BlogGenerationProgress,
  layout: 'fullscreen',
  decorators: [
    Story => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BlogGenerationProgress>;

export const Default: Story = {
  args: {
    sections: SAMPLE_SECTIONS,
    brandKit: 'Olive Garden corporate',
    topic: 'Local SEO content strategy',
    onComplete: () => console.log('Generation complete'),
  },
};

export const SingleSection: Story = {
  name: 'Single section',
  args: {
    sections: [
      {
        id: 's1',
        heading: 'Visibility basics',
        description: 'Short focused draft',
        wordCount: 450,
      },
    ],
    topic: 'Restaurant weekend hours',
    onComplete: () => console.log('Generation complete'),
  },
};
