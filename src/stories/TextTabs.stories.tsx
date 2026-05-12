import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextTabsRow } from "@/app/components/ui/text-tabs";
import { Badge } from "@/app/components/ui/badge";

const meta: Meta<typeof TextTabsRow> = {
  title: "UI/TextTabs",
  component: TextTabsRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Text tabs for main-canvas toolbars. The default underline variant uses a full-width baseline plus a 2px active indicator; the plain variant keeps the text treatment without lines.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextTabsRow>;

export const Default: Story = {
  render: function TextTabsDefault() {
    const [value, setValue] = useState<"a" | "b" | "c">("a");
    return (
      <div className="flex max-w-md flex-col gap-4">
        <TextTabsRow
          ariaLabel="Demo sections"
          value={value}
          onChange={setValue}
          items={[
            { id: "a", label: "Overview" },
            { id: "b", label: "Analytics" },
            { id: "c", label: "Reports" },
          ]}
        />
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};

export const WithBadges: Story = {
  render: function TextTabsWithBadges() {
    const [value, setValue] = useState<"saved" | "ai">("ai");
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <TextTabsRow
          ariaLabel="List source"
          value={value}
          onChange={setValue}
          items={[
            {
              id: "saved",
              label: "Saved",
              suffix: (
                <Badge variant="secondary" className="font-normal">
                  56
                </Badge>
              ),
            },
            {
              id: "ai",
              label: "AI recommendations",
              suffix: (
                <Badge variant="secondary" className="font-normal">
                  19
                </Badge>
              ),
            },
          ]}
        />
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};

export const PlainWithBadges: Story = {
  name: "Plain with badges",
  render: function TextTabsPlainWithBadges() {
    const [value, setValue] = useState<"saved" | "library">("saved");
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <TextTabsRow
          ariaLabel="Projects tabs"
          value={value}
          onChange={setValue}
          variant="plain"
          items={[
            {
              id: "saved",
              label: "Saved",
              suffix: (
                <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal">
                  50
                </Badge>
              ),
            },
            {
              id: "library",
              label: "Library",
              suffix: (
                <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal">
                  40
                </Badge>
              ),
            },
          ]}
        />
        <p className="text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};

export const NarrowWrap: Story = {
  render: function TextTabsNarrow() {
    const [value, setValue] = useState<"one" | "two" | "three">("one");
    return (
      <div className="w-[220px] rounded-lg border border-border bg-background p-4">
        <TextTabsRow
          ariaLabel="Wrapped row"
          value={value}
          onChange={setValue}
          items={[
            { id: "one", label: "First" },
            { id: "two", label: "Second tab" },
            { id: "three", label: "Third" },
          ]}
        />
      </div>
    );
  },
};
