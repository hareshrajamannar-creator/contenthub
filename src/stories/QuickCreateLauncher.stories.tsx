import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QuickCreateLauncher } from "@/app/components/QuickCreateLauncher";

const meta: Meta<typeof QuickCreateLauncher> = {
  title: "App/QuickCreateLauncher",
  component: QuickCreateLauncher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "**Create** launcher (TopBar +): **Radix `Popover`** (`modal={false}`) — anchored under the + with **no dim/blur overlay**; **no title row** (`aria-label=\"Create actions\"`). Actions are grouped into **Engage**, **Programs**, **Automation**, and **Analytics** (sentence-case section labels). `layout`: **`cards`** — two-column bordered tiles with a full-width band label above each group; **`list`** and **`appGrid`** — the same **grouped vertical list** (icon + title per row, band headings); **`appGrid`** is what the TopBar uses. **List / appGrid** panel padding follows the **8px grid**: **16px** top and bottom, **16px** left, **24px** right (matches Storybook canvas rhythm). Icons match the **L1 rail**: **`L1_STRIP_ICON_STROKE_PX`** + **`absoluteStrokeWidth`**, **`L1_STRIP_ICON_SIZE`**, default **`text-muted-foreground`** on the well and **`text-primary`** on hover (no icon scale, so stroke weight stays visually constant). **Hover darkens the icon well only** (no full-row wash). `cardVariant` applies to **`cards`**, **`list`**, and **`appGrid`**.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "inline-radio",
      options: ["cards", "list", "appGrid"],
      description: "Cards, grouped list (`list`), or same list via TopBar alias (`appGrid`)",
    },
    cardVariant: {
      control: "inline-radio",
      options: ["noSubtext", "withSubtext"],
      description: "Title-only vs title + description",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[460px] w-full max-w-[1200px] p-8">
        <div className="mb-4 flex items-center justify-end gap-2 rounded-lg border border-[#e5e9f0] bg-app-shell-rail p-4">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickCreateLauncher>;

export const Default: Story = {
  name: "Cards — no subtext",
  args: {
    layout: "cards",
    cardVariant: "noSubtext",
    onActionSelect: fn(),
  },
};

export const WithSubtext: Story = {
  name: "Cards — with subtext",
  args: {
    layout: "cards",
    cardVariant: "withSubtext",
    onActionSelect: fn(),
  },
};

export const ListLayout: Story = {
  name: "List (L2-style)",
  args: {
    layout: "list",
    cardVariant: "noSubtext",
    onActionSelect: fn(),
  },
};

export const ListWithSubtext: Story = {
  name: "List — with subtext",
  args: {
    layout: "list",
    cardVariant: "withSubtext",
    onActionSelect: fn(),
  },
};

export const AppGrid: Story = {
  name: "App grid (TopBar) — grouped list",
  args: {
    layout: "appGrid",
    cardVariant: "noSubtext",
    onActionSelect: fn(),
  },
};
