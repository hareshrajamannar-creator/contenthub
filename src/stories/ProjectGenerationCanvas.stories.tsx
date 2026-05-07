import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProjectGenerationCanvas } from '@/app/components/content-hub/ProjectGenerationCanvas';

const BRIEF = {
  name: 'Spring campaign',
  goal: 'Drive spring bookings across all locations',
  locations: ['Downtown Chicago', 'Miami Beach', 'Los Angeles'],
  suggestedMix: [],
};

const meta: Meta<typeof ProjectGenerationCanvas> = {
  title: 'App/ProjectGenerationCanvas',
  component: ProjectGenerationCanvas,
  parameters: { layout: 'fullscreen' },
  args: {
    brief: BRIEF,
    contentTypes: ['faq', 'social', 'email'],
    onAllComplete: () => console.log('all complete'),
  },
};
export default meta;
type Story = StoryObj<typeof ProjectGenerationCanvas>;

export const Default: Story = {};

export const FaqAndSocial: Story = {
  args: { contentTypes: ['faq', 'social'] },
};

export const AllTypes: Story = {
  args: { contentTypes: ['faq', 'social', 'email', 'blog', 'ads'] },
};
