import type { Meta, StoryObj } from '@storybook/react';
import { TemplateGallery } from '@/app/components/content-hub/TemplateGallery';

const meta: Meta<typeof TemplateGallery> = {
  title: 'App/TemplateGallery',
  component: TemplateGallery,
  parameters: { layout: 'fullscreen' },
  args: {
    onBack: () => {},
    onSelectTemplate: (t) => console.log('selected', t),
  },
};
export default meta;
type Story = StoryObj<typeof TemplateGallery>;

export const Default: Story = {};
