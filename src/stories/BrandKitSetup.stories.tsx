import type { Meta, StoryObj } from '@storybook/react';
import { BrandKitSetup } from '@/app/components/content-hub/BrandKitSetup';

const meta: Meta<typeof BrandKitSetup> = {
  title: 'App/BrandIdentitySetup',
  component: BrandKitSetup,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onOpenChange: () => {},
    onSave: () => {},
    initialKit: null,
  },
};
export default meta;
type Story = StoryObj<typeof BrandKitSetup>;

export const Default: Story = {};

export const WithExistingKit: Story = {
  args: {
    initialKit: {
      businessName: 'Olive Garden Corporate',
      tagline: "When you're here, you're family",
      brandVoice: 'friendly',
      toneNotes: 'Always warm, never salesy. Use first names.',
      primaryColor: '#1E44CC',
      locations: ['All 500 locations', 'Downtown Chicago'],
    },
  },
};
