import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQQuickSetupDrawer } from '@/app/components/content-hub/faq/FAQQuickSetupDrawer';
import type { FAQQuickSetupData } from '@/app/components/content-hub/faq/FAQQuickSetupDrawer';

const meta: Meta<typeof FAQQuickSetupDrawer> = {
  title: 'App/FAQQuickSetupDrawer',
  component: FAQQuickSetupDrawer,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FAQQuickSetupDrawer>;

function DrawerDemo(args: Partial<typeof FAQQuickSetupDrawer>) {
  const [open, setOpen] = useState(true);
  const [submitted, setSubmitted] = useState<FAQQuickSetupData | null>(null);

  return (
    <div className="h-screen bg-muted/30 flex items-center justify-center">
      {submitted ? (
        <div className="rounded-xl border border-border bg-background p-6 space-y-2 text-sm">
          <p className="font-semibold text-foreground">Drawer submitted</p>
          <p className="text-muted-foreground">Name: {submitted.name}</p>
          <p className="text-muted-foreground">Brand: {submitted.brandKit}</p>
          <p className="text-muted-foreground">Locations: {submitted.locations.join(', ')}</p>
          <button
            type="button"
            onClick={() => { setSubmitted(null); setOpen(true); }}
            className="mt-2 text-primary text-xs hover:underline"
          >
            Reopen drawer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          Open drawer
        </button>
      )}
      <FAQQuickSetupDrawer
        open={open}
        onClose={() => setOpen(false)}
        onContinue={(data) => { setSubmitted(data); setOpen(false); }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DrawerDemo />,
};

export const ClosedState: Story = {
  args: {
    open: false,
    onClose: () => {},
    onContinue: () => {},
  },
};
