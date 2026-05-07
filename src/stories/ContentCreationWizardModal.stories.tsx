import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ContentCreationWizardModal } from '@/app/components/content-hub/wizard/ContentCreationWizardModal';
import type { WizardData } from '@/app/components/content-hub/wizard/wizardTypes';

const meta: Meta<typeof ContentCreationWizardModal> = {
  title: 'App/ContentCreationWizardModal',
  component: ContentCreationWizardModal,
};
export default meta;
type Story = StoryObj<typeof ContentCreationWizardModal>;

function WithState(props: Omit<React.ComponentProps<typeof ContentCreationWizardModal>, 'open' | 'onCancel' | 'onComplete'>) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium"
      >
        Open wizard
      </button>
      <ContentCreationWizardModal
        {...props}
        open={open}
        onCancel={() => setOpen(false)}
        onComplete={(data: WizardData) => { console.log('Wizard complete', data); setOpen(false); }}
      />
    </div>
  );
}

export const FaqCreation: Story = {
  name: 'FAQ creation',
  render: () => <WithState mode="faq" />,
};

export const BlogCreation: Story = {
  name: 'Blog creation',
  render: () => <WithState mode="blog" />,
};

export const LandingCreation: Story = {
  name: 'Landing page creation',
  render: () => <WithState mode="landing" />,
};

export const ProjectCreation: Story = {
  name: 'Project creation',
  render: () => <WithState mode="project" />,
};

export const RegenerateMode: Story = {
  name: 'Regenerate (edit settings)',
  render: () => (
    <WithState
      mode="faq"
      isRegenerateMode
      initialData={{
        mode: 'faq',
        step1: { template: 'aeo', agent: 'balanced' },
        step2: { urlValue: 'https://lushgreen.com/services', urlScraped: true },
        step3: {
          goalData: { objective: 'visibility', persona: 'Homeowners in suburban US', tone: 'Professional', readingLevel: 'general', faqCount: 12 },
          outputData: { destinations: ['library', 'searchai'], schemaMarkup: 'jsonld', approvalFlow: 'review' },
        },
      }}
    />
  ),
};
