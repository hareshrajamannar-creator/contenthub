import type { Meta, StoryObj } from '@storybook/react';
import { AiCopilot } from '@/app/components/content-hub/AiCopilot';

const meta: Meta<typeof AiCopilot> = {
  title: 'App/AiCopilot',
  component: AiCopilot,
};
export default meta;
type Story = StoryObj<typeof AiCopilot>;

export const Default: Story = { args: {} };
export const StartWithFAQ: Story = { args: { initialContentType: 'faq' } };
export const StartWithSocial: Story = { args: { initialContentType: 'social' } };

/** Editing mode — shown in the left panel after content has been generated.
 *  Focuses on content quality rather than setup questions. */
export const EditorMode: Story = {
  name: 'Editor mode (post-generation)',
  args: {
    editorContext: 'editing',
    wizardSummary: 'AEO template · Professional · 12 FAQs',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 600, border: '1px solid hsl(var(--border))', borderRadius: 8, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};
