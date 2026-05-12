import type { Meta, StoryObj } from '@storybook/react';
import { ContentEditorShell } from '@/app/components/content-hub/editor/ContentEditorShell';

const meta: Meta<typeof ContentEditorShell> = {
  title: 'App/ContentEditorShell',
  component: ContentEditorShell,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentEditorShell>;

export const CreateFAQ: Story = {
  name: 'Create FAQ',
  args: {
    mode: 'faq',
    onBack: () => console.log('cancel create FAQ'),
  },
};

export const CreateBlogPost: Story = {
  name: 'Create Blog post',
  args: {
    mode: 'blog',
    onBack: () => console.log('cancel create blog post'),
  },
};

export const GeneratingFAQ: Story = {
  name: 'Generating FAQ',
  args: {
    mode: 'faq',
    skipSetupPhase: true,
    initialTitle: 'Add FAQ schema for "property appraisals"',
    onBack: () => console.log('back from generating FAQ'),
  },
};

export const GeneratingBlogPost: Story = {
  name: 'Generating Blog post',
  args: {
    mode: 'blog',
    skipSetupPhase: true,
    initialTitle: 'How local visibility drives bookings',
    onBack: () => console.log('back from generating blog post'),
  },
};

export const CreateProject: Story = {
  name: 'Create project',
  args: {
    mode: 'project',
    onBack: () => console.log('cancel create project'),
  },
};
