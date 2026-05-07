import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AppEntryWithSplash } from "@/app/components/layout/AppEntryWithSplash";
import { IconStrip } from "@/app/components/Sidebar";
import { Button } from "@/app/components/ui/button";
import { MonitorNotificationsProvider } from "@/app/context/MonitorNotificationsContext";

const meta: Meta<typeof AppEntryWithSplash> = {
  title: "UI/AppEntryWithSplash",
  component: AppEntryWithSplash,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Post-auth entry: centered Birdeye mark, then the overlay fades out (no move to the L1 rail). Use **Replay** to see the sequence again. `forceEntryDone` skips the sequence.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[100dvh] w-full bg-background">
        <MonitorNotificationsProvider onNavigateToMonitor={() => {}}>
          <Story />
        </MonitorNotificationsProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppEntryWithSplash>;

function AppEntryDemoShell({ forceEntryDone, replayKey }: { forceEntryDone: boolean; replayKey: number }) {
  return (
    <AppEntryWithSplash key={replayKey} forceEntryDone={forceEntryDone}>
      <div className="flex h-screen w-screen min-h-0 min-w-0 overflow-hidden">
        <IconStrip currentView="reviews" onViewChange={() => {}} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
          <p className="text-sm text-muted-foreground">Shell preview after the overlay fades.</p>
        </div>
      </div>
    </AppEntryWithSplash>
  );
}

export const PlayIntro: Story = {
  name: "Center then fade",
  render: function PlayIntro() {
    const [replay, setReplay] = useState(0);
    return (
      <div className="flex h-full w-full flex-col">
        <div className="shrink-0 p-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setReplay((k) => k + 1)}>
            Replay entry
          </Button>
        </div>
        <div className="min-h-0 min-w-0 flex-1">
          <AppEntryDemoShell forceEntryDone={false} replayKey={replay} />
        </div>
      </div>
    );
  },
};

export const ForcedComplete: Story = {
  name: "forceEntryDone (no animation)",
  render: function Forced() {
    return <AppEntryDemoShell forceEntryDone={true} replayKey={0} />;
  },
};
