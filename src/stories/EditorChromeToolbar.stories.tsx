import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { EditorChromeToolbar } from '@/app/components/content-hub/shared/EditorChromeToolbar';

const meta: Meta<typeof EditorChromeToolbar> = {
  title: 'App/EditorChromeToolbar',
  component: EditorChromeToolbar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className="min-h-[240px] bg-[var(--color-canvas,#F7F8FA)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditorChromeToolbar>;

export const Default: Story = {
  args: {
    canUndo: true,
    canRedo: false,
    zoom: 1,
    onUndo: () => {},
    onRedo: () => {},
    onZoomOut: () => {},
    onZoomIn: () => {},
    canvasPosition: { top: 24, left: 360 },
  },
};

export const RichTextVisible: Story = {
  name: 'Rich text visible',
  args: {
    ...Default.args,
    richTextVisible: true,
    richTextPosition: { top: 84, left: 560 },
  },
};

export const ColorPaletteOpen: Story = {
  name: 'Color palette open',
  args: {
    ...RichTextVisible.args,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement.ownerDocument.body).getByTitle('Text color'));
  },
};

export const AiActionsOpen: Story = {
  name: 'AI actions open',
  args: {
    ...RichTextVisible.args,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement.ownerDocument.body).getByTitle('AI actions'));
  },
};
