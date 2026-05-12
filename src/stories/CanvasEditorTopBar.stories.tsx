import type { Meta, StoryObj } from '@storybook/react';
import { CanvasEditorTopBar } from '@/app/components/content-hub/shared/CanvasEditorTopBar';

const meta: Meta<typeof CanvasEditorTopBar> = {
  title: 'App/CanvasEditorTopBar',
  component: CanvasEditorTopBar,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className="w-[1120px] bg-[var(--color-canvas,#F7F8FA)] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CanvasEditorTopBar>;

export const Default: Story = {
  args: {
    score: 61,
    scoreLabel: 'Content score',
    scorePanelOpen: false,
    canUndo: true,
    canRedo: false,
    zoom: 0.75,
    onScoreClick: () => {},
    onUndo: () => {},
    onRedo: () => {},
    onZoomOut: () => {},
    onZoomIn: () => {},
    onVersionHistory: () => {},
    onActivity: () => {},
    onSave: () => {},
    onChat: () => {},
  },
};

export const ScorePanelOpen: Story = {
  name: 'Score panel open',
  args: {
    ...Default.args,
    scorePanelOpen: true,
  },
};
