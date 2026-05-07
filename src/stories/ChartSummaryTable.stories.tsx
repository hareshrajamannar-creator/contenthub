import type { Meta, StoryObj } from "@storybook/react";
import { ChartSummaryTable } from "@/app/components/ChartSummaryTable";

const meta: Meta<typeof ChartSummaryTable> = {
  title: "UI/ChartSummaryTable",
  component: ChartSummaryTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Channel × metric summary under **Profile performance** area charts ([`Dashboard.v1.tsx`](../app/components/Dashboard.v1.tsx)). Built on **`table.v1`** only — **not** `AppDataTable` (no column sheet, resize handles, or persistence). **13px** type, **no top border**, **Channels** left-aligned, metric columns **right-aligned**.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChartSummaryTable>;

export const SingleMetric: Story = {
  args: {
    metricHeaders: ["Engagement"],
    rows: [
      { channel: "YouTube", values: [{ value: "11,200", change: "1.2%" }] },
      { channel: "LinkedIn", values: [{ value: "6,700", change: "0.3%" }] },
    ],
  },
};

export const TwoMetrics: Story = {
  args: {
    metricHeaders: ["Total audience", "Net audience growth"],
    rows: [
      { channel: "YouTube", values: [{ value: "12,487", change: "4.2%" }, { value: "537", change: "4.2%" }] },
      { channel: "LinkedIn", values: [{ value: "10,713", change: "2.3%" }, { value: "232", change: "2.3%" }] },
    ],
  },
};
