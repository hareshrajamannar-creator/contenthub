import type { Meta, StoryObj } from '@storybook/react';
import { FAQRichToolbar } from '@/app/components/content-hub/faq/FAQRichToolbar';

const meta: Meta<typeof FAQRichToolbar> = {
  title: 'App/FAQRichToolbar',
  component: FAQRichToolbar,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FAQRichToolbar>;

export const Default: Story = {
  args: { visible: true },
};

export const Hidden: Story = {
  name: 'Hidden (invisible but takes space)',
  args: { visible: false },
};
