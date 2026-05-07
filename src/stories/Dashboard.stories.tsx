import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard } from "@/app/components/Dashboard";

const meta: Meta<typeof Dashboard> = {
  title: "App/Views/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Profile performance uses **32px** horizontal inset (`px-8`) on the header (`MainCanvasViewHeader` with `!px-8`) and scroll body so the page title and widget stack align. Widget cards use **`px-6`** inside the border so content is not flush to the card edge. Widget columns use `items-stretch` for full-width headers. Each chart’s footer table is **`ChartSummaryTable`** (`table.v1`, 13px, no top border, metrics right-aligned) — see **UI/ChartSummaryTable**. Titles and header icon buttons use **`font-normal`** for a regular-weight report surface.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const Default: Story = {
  args: {
    aiPanelOpen: false,
    onAiPanelChange: () => {},
    editingDraft: null,
  },
};

export const WithAIPanel: Story = {
  args: {
    aiPanelOpen: true,
    onAiPanelChange: () => {},
    editingDraft: null,
  },
};
