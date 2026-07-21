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

export const SearchAIRecommendationsOpen: Story = {
  name: 'Search AI recommendations open',
  play: async ({ canvasElement }) => {
    const nameInput = canvasElement.querySelector<HTMLInputElement>(
      'input[placeholder="e.g. Restaurant dining guide series"]',
    );
    if (nameInput) {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setValue?.call(nameInput, 'Dental care blog');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const continueBtn = Array.from(canvasElement.querySelectorAll('button'))
      .find(b => b.textContent === 'Continue');
    continueBtn?.click();

    const recommendationsBtn = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Insert a Search AI recommendation"]',
    );
    recommendationsBtn?.click();
  },
};
