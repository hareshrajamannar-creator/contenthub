import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ProjectWizardStep1 } from '@/app/components/content-hub/wizard/ProjectWizardStep1';
import { ProjectWizardStep2 } from '@/app/components/content-hub/wizard/ProjectWizardStep2';
import { ProjectWizardStep3 } from '@/app/components/content-hub/wizard/ProjectWizardStep3';

const meta: Meta<typeof ProjectWizardStep1> = {
  title: 'App/ProjectWizardSteps',
  component: ProjectWizardStep1,
  parameters: {
    docs: {
      description: {
        component: 'Project wizard steps with source helper copy moved into info tooltips.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProjectWizardStep1>;

export const ProjectType: Story = {
  name: 'Step 1 — project type',
  render: () => {
    const [data, setData] = useState<Record<string, unknown>>({ projectType: 'campaign', agent: 'balanced' });
    return (
      <div className="w-[560px] border border-border rounded-xl bg-background">
        <ProjectWizardStep1 data={data} onChange={setData} />
      </div>
    );
  },
};

export const ProjectSource: Story = {
  name: 'Step 2 — source & context',
  render: () => {
    const [data, setData] = useState<Record<string, unknown>>({ sources: ['reviews'] });
    return (
      <div className="w-[560px] border border-border rounded-xl bg-background">
        <ProjectWizardStep2 step1Data={{ projectType: 'campaign' }} data={data} onChange={setData} />
      </div>
    );
  },
};

export const ProjectTune: Story = {
  name: 'Step 3 — tune & publish',
  render: () => {
    const [data, setData] = useState<Record<string, unknown>>({
      objective: 'visibility',
      tone: 'Professional',
      approvalFlow: 'review',
    });
    return (
      <div className="w-[560px] border border-border rounded-xl bg-background">
        <ProjectWizardStep3 step1Data={{ projectType: 'campaign' }} data={data} onChange={setData} />
      </div>
    );
  },
};
