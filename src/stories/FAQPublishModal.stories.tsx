import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQPublishModal } from '@/app/components/content-hub/faq/FAQPublishModal';
import { Button } from '@/app/components/ui/button';
import { getFAQs } from '@/app/components/content-hub/faq/faqStore';

const FAQS = getFAQs();

const meta: Meta<typeof FAQPublishModal> = {
  title: 'App/FAQPublishModal',
  component: FAQPublishModal,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FAQPublishModal>;

export const Default: Story = {
  name: 'Trigger button',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Publish ready (5)</Button>
        <FAQPublishModal open={open} onClose={() => setOpen(false)} faqs={FAQS} overallScore={95} />
      </>
    );
  },
};

export const Open: Story = {
  name: 'Modal open — Birdeye tab',
  render: () => (
    <FAQPublishModal open onClose={() => {}} faqs={FAQS} overallScore={95} />
  ),
};

export const LowScore: Story = {
  name: 'Low AEO score warning',
  render: () => (
    <FAQPublishModal open onClose={() => {}} faqs={FAQS} overallScore={58} />
  ),
};
