import type { Meta, StoryObj } from '@storybook/react';
import { ContentWizardShell } from '@/app/components/content-hub/shared/ContentWizardShell';

const meta: Meta<typeof ContentWizardShell> = {
  title: 'App/ContentWizardShell',
  component: ContentWizardShell,
  parameters: { layout: 'fullscreen' },
  args: {
    contentType: 'Social post',
    steps: ['Platforms', 'Source & context', 'Tune & publish'],
    currentStep: 0,
    canAdvance: true,
    isFinalStep: false,
    onNext: () => {},
    onBack: () => {},
    onExit: () => {},
    children: (
      <div className="flex items-center justify-center h-full text-muted-foreground text-[13px]">
        Step content renders here
      </div>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof ContentWizardShell>;

export const Default: Story = {};

export const Step2: Story = { args: { currentStep: 1 } };

export const FinalStep: Story = {
  args: { currentStep: 2, isFinalStep: true },
};

export const Blocked: Story = {
  args: { canAdvance: false },
};
