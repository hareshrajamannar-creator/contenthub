import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { AppView } from "@/app/App";
import { ShortcutsModal } from "@/app/shortcuts/ShortcutsModal";
import { Button } from "@/app/components/ui/button";

const meta: Meta<typeof ShortcutsModal> = {
  title: "App/Shortcuts/Keyboard shortcuts",
  component: ShortcutsModal,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: fn(),
    currentView: "reviews" satisfies AppView,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "In-app **keyboard shortcuts** help (`ShortcutsModal`). Open with **?** or **⌘K** / **Ctrl+K**. **Navigation** lists all global shortcuts (open panel + G-then-letter jumps). When the route has scoped shortcuts, a second column shows the view name (e.g. Reviews). Rows: **action left**, **keycaps right**; alternatives use **/**. Data: `SHORTCUT_REGISTRY` (`modalGroup`: `navigation` | `current-view`). Uses Radix **Dialog** — same Aero overlay as **UI/Dialog** (`MODAL_OVERLAY_VISUAL_CLASS`, light blur + semantic tint).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutsModal>;

export const Reviews: Story = {
  args: {
    currentView: "reviews" satisfies AppView,
  },
};

/** No view-specific section; only “Everywhere” shortcuts. */
export const GlobalOnly: Story = {
  args: {
    currentView: "storybook" satisfies AppView,
  },
};

export const BirdAI: Story = {
  args: {
    currentView: "agents-monitor" satisfies AppView,
  },
};

export const Inbox: Story = {
  args: {
    currentView: "inbox" satisfies AppView,
  },
};

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Open keyboard shortcuts
        </Button>
        <ShortcutsModal {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
