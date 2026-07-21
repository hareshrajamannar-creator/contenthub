import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/test';
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

export const CreateLandingPage: Story = {
  name: 'Create landing page',
  args: {
    mode: 'landing',
    onBack: () => console.log('cancel create landing page'),
  },
};

export const GeneratingFAQ: Story = {
  name: 'Generating FAQ inside editor',
  args: {
    mode: 'faq',
    skipSetupPhase: true,
    initialTitle: 'Add FAQ schema for "property appraisals"',
    onBack: () => console.log('back from generating FAQ'),
  },
};

export const RecommendationFAQ: Story = {
  name: 'Recommendation FAQ',
  args: {
    mode: 'faq',
    skipSetupPhase: true,
    hideHeaderContext: true,
    initialTitle: 'Add Rental FAQ Section to Raine & Horne Dubbo Property Management Page',
    preloadedFAQs: [
      {
        question: 'What is a property appraisal and why do I need one?',
        answer: "A property appraisal is a professional assessment of your property's current market value.",
      },
      {
        question: 'How much does a property appraisal in Dubbo cost?',
        answer: 'A standard market appraisal from a local agency is typically free of charge.',
      },
    ],
    recAeoScore: 95,
    onBack: () => console.log('back to recommendation'),
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

export const EditCardFromProject: Story = {
  name: 'Edit card from project',
  args: {
    mode: 'project',
    onBack: () => console.log('cancel create project'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameInput = await canvas.findByPlaceholderText(/Spring promotion/i);
    await userEvent.type(nameInput, 'Spring promotion — Olive Garden');

    // Advance through the setup wizard to the generated multi-card canvas
    for (let i = 0; i < 3; i++) {
      const continueBtn = canvas.queryByRole('button', { name: /^Continue$/ });
      if (!continueBtn) break;
      await userEvent.click(continueBtn);
    }

    const generateBtn = await canvas.findByRole('button', { name: /^Generate$/ });
    await userEvent.click(generateBtn);

    // Click Edit on the first generated card — drills into the full single-item
    // editor (own header, score panel, Publish button) without losing this
    // project canvas underneath; "Go back" returns here with cards intact.
    const editButtons = await canvas.findAllByTitle('Edit', {}, { timeout: 20000 });
    await userEvent.click(editButtons[0]);
  },
};
