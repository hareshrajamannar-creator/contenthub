import type { Meta, StoryObj } from "@storybook/react";
import { InboxView } from "@/app/components/InboxView";

const meta: Meta<typeof InboxView> = {
  title: "App/Views/InboxView",
  component: InboxView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The Inbox module uses a **footer composer** at the bottom of the **middle thread column**. In fullscreen Storybook you may need to **scroll that column** to see it.

The composer is a single rounded field with an AI-style placeholder (“Ask anything, use @ to tag files and collections”), a toolbar row (**attach**, **image**, **@**, a divider, then **sliders**), and a square **Send** control with an **up arrow**.

Use the Storybook **Theme** toolbar (light / dark) to verify the composer in both themes.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InboxView>;

export const Default: Story = {};
