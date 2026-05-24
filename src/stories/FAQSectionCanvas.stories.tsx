import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FAQSectionCanvas } from '@/app/components/content-hub/faq/FAQSectionCanvas';

const THREE_SECTIONS = [
  { id: 's1', title: 'Emergency basics', description: 'Urgent questions customers ask', count: 5 },
  { id: 's2', title: 'Appointments and costs', description: 'Pricing, booking, and scheduling', count: 5 },
  { id: 's3', title: 'Special cases', description: 'Edge cases and unusual situations', count: 4 },
];

const TWO_SECTIONS = [
  { id: 's1', title: 'Getting started', description: 'Intro and onboarding questions', count: 6 },
  { id: 's2', title: 'Advanced usage', description: 'Power user questions', count: 4 },
];

const meta: Meta<typeof FAQSectionCanvas> = {
  title: 'App/FAQSectionCanvas',
  component: FAQSectionCanvas,
  layout: 'fullscreen',
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FAQSectionCanvas>;

export const Default: Story = {
  args: {
    sections: THREE_SECTIONS,
    generationLabel: 'AEO optimized · 14 FAQs · 3 sections',
    onEditSettings: () => console.log('Edit settings'),
  },
};

export const TwoSections: Story = {
  args: {
    sections: TWO_SECTIONS,
    generationLabel: 'AEO optimized · 10 FAQs · 2 sections',
    onEditSettings: () => console.log('Edit settings'),
  },
};

export const LargeSet: Story = {
  args: {
    sections: [
      { id: 's1', title: 'Getting started', description: 'Basics', count: 5 },
      { id: 's2', title: 'Pricing', description: 'Costs and billing', count: 5 },
      { id: 's3', title: 'Emergency service', description: 'Urgent help', count: 5 },
      { id: 's4', title: 'Maintenance', description: 'Ongoing care', count: 5 },
      { id: 's5', title: 'Warranty and guarantees', description: 'Coverage details', count: 4 },
    ],
    generationLabel: 'AEO optimized · 24 FAQs · 5 sections',
    onEditSettings: () => console.log('Edit settings'),
  },
};

export const GeneratingInDocument: Story = {
  name: 'Generating in document',
  args: {
    sections: TWO_SECTIONS,
    generationLabel: 'AEO optimized · 10 FAQs',
    initialGenerating: true,
    onEditSettings: () => console.log('Edit settings'),
  },
};

export const RecommendationImprovement: Story = {
  name: 'Recommendation improvement',
  args: {
    sections: [],
    generationLabel: 'AEO optimized · 5 FAQs',
    initialScore: 95,
    initialQuestions: [
      {
        question: 'What is a property appraisal and why do I need one?',
        answer: "A property appraisal is a professional assessment of your property's current market value based on comparable sales, location, condition, and local demand.",
      },
      {
        question: 'How much does a property appraisal in Dubbo cost?',
        answer: 'A standard market appraisal from a local agency is typically free of charge. Formal bank valuations usually carry a separate fee.',
      },
      {
        question: 'How long does a property appraisal take?',
        answer: 'An in-person appraisal walk-through generally takes 20-40 minutes, followed by a written report within 24-48 hours.',
      },
    ],
    onEditSettings: () => console.log('Edit settings'),
  },
};

export const TextEditingToolbar: Story = {
  name: 'Shared text editing toolbar',
  args: {
    sections: THREE_SECTIONS,
    generationLabel: 'AEO optimized · 14 FAQs · 3 sections',
    onEditSettings: () => console.log('Edit settings'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('How quickly can you respond to an emergency?'));
  },
};

export const ManualBlockTabs: Story = {
  name: 'Manual block tabs',
  args: {
    sections: THREE_SECTIONS,
    generationLabel: 'AEO optimized · 14 FAQs · 3 sections',
    onEditSettings: () => console.log('Edit settings'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Manual' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Pre-built' }));
  },
};

export const ManualStandaloneQuestion: Story = {
  name: 'Manual standalone question',
  args: {
    sections: [],
    generationLabel: 'Manual FAQ draft',
    onEditSettings: () => console.log('Edit settings'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Manual' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Question' }));
  },
};
