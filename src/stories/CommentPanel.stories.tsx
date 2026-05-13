import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CommentPanel } from '@/app/components/content-hub/editor/CommentPanel';

const meta: Meta<typeof CommentPanel> = {
  title: 'App/CommentPanel',
  component: CommentPanel,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof CommentPanel>;

function PanelWrapper({ initialOpen = true }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div className="flex h-screen items-stretch bg-background">
      <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        Editor canvas area
      </div>
      <CommentPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: () => <PanelWrapper initialOpen />,
};

export const Closed: Story = {
  render: () => <PanelWrapper initialOpen={false} />,
};
