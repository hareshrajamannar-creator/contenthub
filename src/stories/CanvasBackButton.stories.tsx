import type { Meta, StoryObj } from '@storybook/react';
import { CanvasBackButton } from '@/app/components/content-hub/shared/CanvasBackButton';

const meta: Meta<typeof CanvasBackButton> = {
  title: 'UI/CanvasBackButton',
  component: CanvasBackButton,
  args: {
    label: 'Back to review',
    onClick: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CanvasBackButton>;

export const Default: Story = {};

export const BackToRecommendation: Story = {
  args: { label: 'Back to recommendation' },
};

export const BackToGenerating: Story = {
  args: { label: 'Back to generating' },
};
