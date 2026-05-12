import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ContentShareModal } from '@/app/components/content-hub/shared/ContentShareModal';

const meta: Meta<typeof ContentShareModal> = {
  title: 'App/ContentShareModal',
  component: ContentShareModal,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ContentShareModal>;

function ContentShareModalLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Share
      </Button>
      <ContentShareModal
        open={open}
        onClose={() => setOpen(false)}
        contentTitle="New FAQ page"
      />
    </>
  );
}

export const Default: Story = {
  render: () => <ContentShareModalLauncher />,
};

export const Open: Story = {
  render: () => (
    <ContentShareModal
      open
      onClose={() => {}}
      contentTitle="Olive Garden FAQ"
    />
  ),
};

export const ShareLink: Story = {
  name: 'Share link',
  render: () => (
    <ContentShareModal
      open
      onClose={() => {}}
      contentTitle="Olive Garden FAQ"
      initialTab="link"
    />
  ),
};

export const Download: Story = {
  render: () => (
    <ContentShareModal
      open
      onClose={() => {}}
      contentTitle="Olive Garden FAQ"
      initialTab="download"
    />
  ),
};

export const Embed: Story = {
  render: () => (
    <ContentShareModal
      open
      onClose={() => {}}
      contentTitle="Olive Garden FAQ"
      initialTab="embed"
    />
  ),
};
