import type { Meta, StoryObj } from '@storybook/react';
import { CreateBlogPage } from '@/app/components/content-hub/CreateBlogPage';

const meta: Meta<typeof CreateBlogPage> = {
  title: 'App/CreateBlogPage',
  component: CreateBlogPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onCancel: () => {},
    onGenerate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CreateBlogPage>;

export const Default: Story = {};

export const IdeaPanelOpen: Story = {
  name: 'Idea panel open',
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Help me pick a topic"]');
    btn?.click();
  },
};
