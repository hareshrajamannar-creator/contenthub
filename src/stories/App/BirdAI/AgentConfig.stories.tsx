import type { Meta, StoryObj } from "@storybook/react";
import { AgentConfigView } from "@/app/components/AgentConfigView";
import { APP_MAIN_CONTENT_SHELL_CLASS, APP_SHELL_GUTTER_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";

function ConfigShell() {
  return (
    <div className={`h-screen flex flex-col min-h-0 overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
      <div className={`${APP_MAIN_CONTENT_SHELL_CLASS} min-h-0 overflow-hidden`}>
        <AgentConfigView />
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "App/BirdAI/AgentConfig",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const FullPage: Story = {
  name: "Agent Configuration — Full page (9 sections)",
  render: () => <ConfigShell />,
};
