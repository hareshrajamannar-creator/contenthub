import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQShareModal } from '@/app/components/content-hub/faq/FAQShareModal';
import { Button } from '@/app/components/ui/button';

const meta: Meta<typeof FAQShareModal> = {
  title: 'App/FAQShareModal',
  component: FAQShareModal,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FAQShareModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open share modal</Button>
        <FAQShareModal open={open} onClose={() => setOpen(false)} faqSetId="landscaping-faq-001" />
      </>
    );
  },
};

export const CopyLink: Story = {
  name: 'Copy link tab open',
  render: () => <FAQShareModal open onClose={() => {}} faqSetId="landscaping-faq-001" />,
};
