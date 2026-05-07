import type { Meta, StoryObj } from '@storybook/react';
import { QuickCreateModal } from '@/app/components/content-hub/QuickCreateModal';

const meta: Meta<typeof QuickCreateModal> = {
  title: 'App/QuickCreateModal',
  component: QuickCreateModal,
};
export default meta;
type Story = StoryObj<typeof QuickCreateModal>;

export const FaqMode: Story = {
  args: { mode: 'faq', onClose: () => {}, onGenerate: () => {} },
};

export const BlogMode: Story = {
  args: { mode: 'blog', onClose: () => {}, onGenerate: () => {} },
};

export const ProjectMode: Story = {
  args: { mode: 'project', onClose: () => {}, onGenerate: () => {} },
};

export const Closed: Story = {
  args: { mode: null, onClose: () => {}, onGenerate: () => {} },
};
