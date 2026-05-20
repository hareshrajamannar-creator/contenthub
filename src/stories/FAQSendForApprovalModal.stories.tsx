import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQSendForApprovalModal } from '@/app/components/content-hub/faq/FAQSendForApprovalModal';
import { Button } from '@/app/components/ui/button';

const meta: Meta<typeof FAQSendForApprovalModal> = {
  title: 'App/FAQSendForApprovalModal',
  component: FAQSendForApprovalModal,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FAQSendForApprovalModal>;

export const Default: Story = {
  name: 'Trigger button',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Send for approval</Button>
        <FAQSendForApprovalModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
        />
      </>
    );
  },
};

export const Open: Story = {
  name: 'Modal open',
  render: () => (
    <FAQSendForApprovalModal open onClose={() => {}} onSubmit={() => {}} />
  ),
};
