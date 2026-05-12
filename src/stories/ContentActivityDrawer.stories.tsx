import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ContentActivityDrawer } from '@/app/components/content-hub/shared/ContentActivityDrawer';

const meta: Meta<typeof ContentActivityDrawer> = {
  title: 'App/ContentActivityDrawer',
  component: ContentActivityDrawer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ContentActivityDrawer>;

function ContentActivityDrawerLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-8">
      <Button type="button" onClick={() => setOpen(true)}>
        Open activity
      </Button>
      <ContentActivityDrawer open={open} onClose={() => setOpen(false)} contentType="faq" />
    </div>
  );
}

export const Default: Story = {
  render: () => <ContentActivityDrawerLauncher />,
};

export const FaqActivity: Story = {
  name: 'FAQ activity',
  args: {
    open: true,
    onClose: () => {},
    contentType: 'faq',
  },
};

export const BlogActivity: Story = {
  name: 'Blog activity',
  args: {
    open: true,
    onClose: () => {},
    contentType: 'blog',
  },
};
