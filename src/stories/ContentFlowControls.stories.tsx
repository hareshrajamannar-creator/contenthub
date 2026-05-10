import { useState } from 'react';
import { FileText, MessageSquare, Zap } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ContentFlowChip,
  ContentFlowChoiceCard,
  ContentFlowCountStepper,
} from '@/app/components/content-hub/shared/ContentFlowControls';

const ContentFlowControlsDemo = () => {
  const [chip, setChip] = useState('professional');
  const [choice, setChoice] = useState('aeo');
  const [count, setCount] = useState(14);

  return (
    <div className="flex max-w-[720px] flex-col gap-6 bg-muted/20 p-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-[14px] font-medium text-foreground">Chips</h2>
        <div className="flex flex-wrap gap-2">
          {['professional', 'warm', 'direct'].map(option => (
            <ContentFlowChip
              key={option}
              label={option[0].toUpperCase() + option.slice(1)}
              selected={chip === option}
              onClick={() => setChip(option)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[14px] font-medium text-foreground">Choice cards</h2>
        <ContentFlowChoiceCard
          selected={choice === 'aeo'}
          onClick={() => setChoice('aeo')}
          icon={Zap}
          title="AEO optimized"
          description="Win answer-engine visibility for specific queries"
        />
        <ContentFlowChoiceCard
          selected={choice === 'support'}
          onClick={() => setChoice('support')}
          icon={MessageSquare}
          title="Customer support FAQs"
          description="Create questions from tickets, reviews, and customer queries"
        />
      </section>

      <section className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-4">
        <div className="flex items-center gap-2">
          <FileText size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">Number of questions</span>
        </div>
        <ContentFlowCountStepper value={count} min={3} max={30} ariaLabel="questions" onChange={setCount} />
      </section>
    </div>
  );
};

const meta: Meta<typeof ContentFlowChoiceCard> = {
  title: 'App/ContentFlowControls',
  component: ContentFlowChoiceCard,
};

export default meta;
type Story = StoryObj<typeof ContentFlowChoiceCard>;

export const Default: Story = {
  render: () => <ContentFlowControlsDemo />,
};

export const SelectorStates: Story = {
  name: 'Selector states',
  render: () => <ContentFlowControlsDemo />,
};
