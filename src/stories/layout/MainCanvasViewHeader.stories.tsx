import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";

const meta: Meta<typeof MainCanvasViewHeader> = {
  title: "Layout/Main canvas view header",
  component: MainCanvasViewHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shared **title band** for main canvas views (Appointments, Payments, Listings, …): `px-6 pt-5 pb-4`, `text-lg` title, optional `text-xs` muted subline, optional right **actions**. Tokens: [`mainViewTitleClasses.ts`](../../app/components/layout/mainViewTitleClasses.ts). Radix **Dialog** / **Sheet** / **Drawer** / **AlertDialog** titles default to the same primary heading class.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MainCanvasViewHeader>;

export const TitleAndDescription: Story = {
  args: {
    title: "Appointments",
    description: "Schedule, manage, and track patient appointments.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Payments",
    description: "Manage payment requests, track collections, and process refunds.",
    actions: (
      <Button size="sm" className="gap-1.5 text-xs">
        <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        Request a payment
      </Button>
    ),
  },
};

/** Same tokens as default, but **`font-normal`** on the title (Profile performance dashboard). */
export const RegularWeightTitle: Story = {
  args: {
    title: "Profile performance",
    titleClassName: "font-normal",
    description: "9 active · 58,386 total sent",
  },
};
