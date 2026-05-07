import type { Meta, StoryObj } from '@storybook/react';
import { FAQGroupCard } from '@/app/components/content-hub/faq/FAQGroupCard';
import { MOCK_FAQS } from '@/app/components/content-hub/faq/FAQReviewScreen';

const meta: Meta<typeof FAQGroupCard> = {
  title: 'App/FAQGroupCard',
  component: FAQGroupCard,
};
export default meta;
type Story = StoryObj<typeof FAQGroupCard>;

export const Default: Story = {
  args: {
    title: 'Olive Garden — FAQ page',
    locationCount: 500,
    faqs: MOCK_FAQS,
    schemaType: 'jsonld',
    publishStatus: 'draft',
    onEdit: () => {},
    onPublishAll: () => {},
    onExport: () => {},
  },
};

export const Published: Story = {
  args: {
    ...Default.args,
    publishStatus: 'published',
  },
};

export const NeedsWork: Story = {
  args: {
    ...Default.args,
    title: 'Draft FAQ',
    faqs: MOCK_FAQS.map(f => ({ ...f, editorialScore: Math.max(45, f.editorialScore - 30) })),
  },
};
