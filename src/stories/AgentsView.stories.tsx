import type { Meta, StoryObj } from "@storybook/react";
import { AgentsMonitorView } from "@/app/components/AgentsMonitorView";
import { AgentsBuilderView } from "@/app/components/AgentsBuilderView";
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
} from "@/app/components/layout/appShellClasses";
import { MonitorNotificationsProvider } from "@/app/context/MonitorNotificationsContext";

const viewMeta: Meta = {
  title: "App/Views/Agents",
  parameters: { layout: "fullscreen" },
};

export default viewMeta;
type Story = StoryObj;

function MonitorShell(props: { userDisplayName?: string }) {
  return (
    <MonitorNotificationsProvider onNavigateToMonitor={() => {}}>
      <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
        <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
          <AgentsMonitorView onBack={() => {}} userDisplayName={props.userDisplayName} />
        </div>
      </div>
    </MonitorNotificationsProvider>
  );
}

export const AgentsMonitor: Story = {
  args: {
    userDisplayName: "John",
  },
  argTypes: {
    userDisplayName: { control: "text", name: "Display name" },
  },
  render: (args) => <MonitorShell userDisplayName={args.userDisplayName} />,
};

/** Same layout with a custom greeting for design review. */
export const AgentsMonitorPersonalized: Story = {
  args: {
    userDisplayName: "Alex",
  },
  argTypes: AgentsMonitor.argTypes,
  render: (args) => <MonitorShell userDisplayName={args.userDisplayName} />,
};

export const AgentsBuilder: Story = {
  render: () => (
    <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
      <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
        <AgentsBuilderView onBack={() => {}} />
      </div>
    </div>
  ),
};
