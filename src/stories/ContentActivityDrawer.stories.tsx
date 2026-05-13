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

function ContentActivityDrawerToggle({ contentType }: { contentType: 'faq' | 'blog' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F8FA] p-4 gap-2 items-start justify-end">
      <div className="flex-1 flex items-center justify-center">
        <Button type="button" onClick={() => setOpen(v => !v)}>
          {open ? 'Close activity' : 'Open activity'}
        </Button>
      </div>
      <ContentActivityDrawer
        open={open}
        onClose={() => setOpen(false)}
        contentType={contentType}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ContentActivityDrawerToggle contentType="faq" />,
};

export const FaqActivity: Story = {
  name: 'FAQ activity',
  render: () => <ContentActivityDrawerToggle contentType="faq" />,
};

export const BlogActivity: Story = {
  name: 'Blog activity',
  render: () => <ContentActivityDrawerToggle contentType="blog" />,
};
