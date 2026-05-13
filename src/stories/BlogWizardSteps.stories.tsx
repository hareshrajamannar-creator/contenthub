import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BlogWizardStep1 } from '@/app/components/content-hub/wizard/BlogWizardStep1';
import { BlogWizardStep2 } from '@/app/components/content-hub/wizard/BlogWizardStep2';
import { BlogWizardStep3 } from '@/app/components/content-hub/wizard/BlogWizardStep3';

// ── Step 1 ────────────────────────────────────────────────────────────────────

const meta1: Meta<typeof BlogWizardStep1> = {
  title: 'App/BlogWizardStep1',
  component: BlogWizardStep1,
  parameters: {
    docs: {
      description: {
        component: 'Blog wizard steps with agent and source helper copy moved into info tooltips.',
      },
    },
  },
};
export default meta1;
type Story1 = StoryObj<typeof BlogWizardStep1>;

function Step1Wrapper(props: { mode: 'blog' | 'landing' }) {
  const [data, setData] = useState<Record<string, unknown>>({ goal: 'seo', agent: 'balanced' });
  return (
    <div className="w-[560px] border border-border rounded-xl bg-background">
      <BlogWizardStep1 {...props} data={data} onChange={setData} />
    </div>
  );
}

export const BlogGoal: Story1 = {
  name: 'Blog — goal step',
  render: () => <Step1Wrapper mode="blog" />,
};

export const LandingGoal: Story1 = {
  name: 'Landing — goal step',
  render: () => <Step1Wrapper mode="landing" />,
};

// ── Step 2 ────────────────────────────────────────────────────────────────────

export const BlogSource: Story1 = {
  name: 'Blog — source step',
  render: () => {
    const [data, setData] = useState<Record<string, unknown>>({});
    return (
      <div className="w-[560px] border border-border rounded-xl bg-background">
        <BlogWizardStep2 mode="blog" step1Data={{ goal: 'seo' }} data={data} onChange={setData} />
      </div>
    );
  },
};

// ── Step 3 ────────────────────────────────────────────────────────────────────

export const BlogTune: Story1 = {
  name: 'Blog — tune & publish',
  render: () => {
    const [data, setData] = useState<Record<string, unknown>>({ tone: 'Professional', length: 'medium', sections: ['intro', 'cta'], destinations: ['library'], approvalFlow: 'review' });
    return (
      <div className="w-[560px] border border-border rounded-xl bg-background">
        <BlogWizardStep3 mode="blog" step1Data={{ goal: 'seo' }} data={data} onChange={setData} />
      </div>
    );
  },
};
