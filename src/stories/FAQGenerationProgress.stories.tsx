import type { Meta, StoryObj } from '@storybook/react';
import { FAQGenerationProgress } from '@/app/components/content-hub/faq/FAQGenerationProgress';

const SAMPLE_SECTIONS = [
  { id: 's1', title: 'Emergency basics', description: 'Urgent questions', count: 5 },
  { id: 's2', title: 'Appointments and costs', description: 'Booking and pricing', count: 5 },
  { id: 's3', title: 'Special cases', description: 'Edge cases', count: 4 },
];

const meta: Meta<typeof FAQGenerationProgress> = {
  title: 'App/FAQGenerationProgress',
  component: FAQGenerationProgress,
  layout: 'fullscreen',
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FAQGenerationProgress>;

export const Default: Story = {
  args: {
    sections: SAMPLE_SECTIONS,
    brandKit: 'Olive Garden corporate',
    sourceUrl: 'https://example.com/faq',
    onComplete: () => console.log('Generation complete'),
  },
};

export const SingleSection: Story = {
  args: {
    sections: [{ id: 's1', title: 'Getting started', description: 'Intro questions', count: 8 }],
    brandKit: 'Birdeye demo brand',
    onComplete: () => console.log('Complete'),
  },
};
