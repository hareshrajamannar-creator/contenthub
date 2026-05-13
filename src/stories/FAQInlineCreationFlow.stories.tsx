import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FAQInlineCreationFlow } from '@/app/components/content-hub/faq/FAQInlineCreationFlow';
import type { FAQFlowData, FlowNavControls, FlowNavState } from '@/app/components/content-hub/faq/FAQInlineCreationFlow';
import { Button } from '@/app/components/ui/button';

const meta: Meta<typeof FAQInlineCreationFlow> = {
  title: 'App/FAQInlineCreationFlow',
  component: FAQInlineCreationFlow,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FAQInlineCreationFlow>;

function FlowPreview() {
  const flowNavRef = useRef<FlowNavControls>(null);
  const [navState, setNavState] = useState<FlowNavState>({ step: 0, totalSteps: 3, canAdvance: false });
  const [completed, setCompleted] = useState<FAQFlowData | null>(null);

  if (completed) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="rounded-xl border border-border bg-background p-6 space-y-2 text-sm max-w-md">
          <p className="font-semibold text-foreground">Flow completed</p>
          <p className="text-muted-foreground">Name: {completed.contentName}</p>
          <p className="text-muted-foreground">Brand: {completed.brandKit}</p>
          <p className="text-muted-foreground">Locations: {completed.locations.length} selected</p>
          {completed.sourceUrl && <p className="text-muted-foreground">URL: {completed.sourceUrl}</p>}
          {completed.customAgent && <p className="text-muted-foreground">Agent: {completed.customAgent}</p>}
          <button
            type="button"
            onClick={() => setCompleted(null)}
            className="mt-2 text-primary text-xs hover:underline"
          >
            Restart flow
          </button>
        </div>
      </div>
    );
  }

  const isLast = navState.step === navState.totalSteps - 1;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header — mirrors ContentEditorShell setup header */}
      <div className="flex shrink-0 items-center justify-between px-4 h-14 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <span className="text-[16px] font-semibold text-foreground">Create FAQs</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => flowNavRef.current?.back()}
            disabled={navState.step === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (isLast) flowNavRef.current?.generate();
              else flowNavRef.current?.advance();
            }}
            disabled={!navState.canAdvance}
          >
            {isLast ? 'Generate' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Flow body */}
      <div className="flex-1 min-h-0">
        <FAQInlineCreationFlow
          onComplete={setCompleted}
          onCancel={() => {}}
          controlRef={flowNavRef}
          onNavStateChange={setNavState}
          hideProgress
        />
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <FlowPreview />,
};

export const StepOne: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <FAQInlineCreationFlow
        onComplete={(data) => console.log('FAQ flow complete', data)}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  ),
};
