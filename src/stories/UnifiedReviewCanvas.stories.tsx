import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedReviewCanvas } from '@/app/components/content-hub/UnifiedReviewCanvas';

const BRIEF = {
  name: 'Spring campaign',
  goal: 'Drive spring bookings across all locations',
  locations: ['Downtown Chicago', 'Miami Beach', 'Los Angeles'],
  suggestedMix: [],
};

const meta: Meta<typeof UnifiedReviewCanvas> = {
  title: 'App/UnifiedReviewCanvas',
  component: UnifiedReviewCanvas,
  parameters: { layout: 'fullscreen' },
  args: {
    brief: BRIEF,
    contentTypes: ['faq', 'social', 'email'],
    onPublish: () => console.log('publish'),
  },
};
export default meta;
type Story = StoryObj<typeof UnifiedReviewCanvas>;

export const Default: Story = {};

export const FaqOnly: Story = {
  args: { contentTypes: ['faq'] },
};

export const SocialAndEmail: Story = {
  args: { contentTypes: ['social', 'email'] },
};
