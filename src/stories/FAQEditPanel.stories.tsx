/**
 * FAQEditPanel stories — retired component.
 *
 * The FAQ right-panel editing experience has moved to the inline `EditFAQPanel`
 * in CreateView.tsx. This story file is kept as a placeholder to avoid broken
 * imports; it now demonstrates ContentScorePanel instead.
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  ContentScorePanel,
  DEFAULT_AEO_DIMS,
  DEFAULT_OVERALL_SCORE,
  DEFAULT_QUICK_WINS,
} from '@/app/components/content-hub/shared/ContentScorePanel';

const meta: Meta<typeof ContentScorePanel> = {
  title: 'App/ContentScorePanel',
  component: ContentScorePanel,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof ContentScorePanel>;

export const Default: Story = {
  name: 'AEO score — strong (95)',
  args: {
    score: DEFAULT_OVERALL_SCORE,
    dimensions: DEFAULT_AEO_DIMS,
    quickWins: DEFAULT_QUICK_WINS,
  },
  render: (args) => (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'flex-end' }}>
      <div style={{ width: 300, borderLeft: '1px solid #e5e9f0' }}>
        <ContentScorePanel {...args} />
      </div>
    </div>
  ),
};

export const NeedsWork: Story = {
  name: 'AEO score — needs work (62)',
  args: {
    score: 62,
    dimensions: [
      { label: 'Brand voice',         score: 70, weight: 30 },
      { label: 'Factual accuracy',    score: 58, weight: 30 },
      { label: 'Content readability', score: 65, weight: 25 },
      { label: 'Originality',         score: 55, weight: 15 },
    ],
    quickWins: DEFAULT_QUICK_WINS,
  },
  render: (args) => (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'flex-end' }}>
      <div style={{ width: 300, borderLeft: '1px solid #e5e9f0' }}>
        <ContentScorePanel {...args} />
      </div>
    </div>
  ),
};

export const WithClose: Story = {
  name: 'With close button',
  args: {
    score: 87,
    dimensions: DEFAULT_AEO_DIMS,
    showClose: true,
    onClose: () => alert('Close clicked'),
  },
  render: (args) => (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'flex-end' }}>
      <div style={{ width: 300, borderLeft: '1px solid #e5e9f0' }}>
        <ContentScorePanel {...args} />
      </div>
    </div>
  ),
};
