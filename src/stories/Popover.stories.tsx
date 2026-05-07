import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/components/ui/utils";
import { FLOATING_PANEL_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import { CalendarDays, ChevronDown, Settings2 } from "lucide-react";

const meta: Meta = {
  title: "UI/Popover",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `**Popover** panels use the same floating shell as the L1 profile menu and other overlays: \`FLOATING_PANEL_SURFACE_CLASSNAME\` in [\`floatingPanelSurface.ts\`](src/app/components/ui/floatingPanelSurface.ts) — \`rounded-2xl\`, **no** outer **border** (shadow-only depth), \`bg-popover\`. **DropdownMenu**, **Select**, **ContextMenu**, and **Menubar** content use the same surface. Override padding with \`className\` (e.g. \`p-2\` for dense lists, default content uses \`p-4\`).`,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const DATE_RANGE_OPTIONS = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "This week",
  "This month",
  "Custom range",
];

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium text-foreground">
            Review Request Status
          </h4>
          <p className="text-xs text-muted-foreground">
            Your last campaign reached 148 contacts with a 62% open rate and 18
            new reviews generated.
          </p>
          <Button size="sm" className="w-full">
            View Campaign Details
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Text-only list: same shell + inset pill rows as profile / date-range pickers. */
export const DateRangeMenu: Story = {
  name: "Date range menu (surface + dense list)",
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("Last 30 days");
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-56 justify-between border-primary text-primary hover:bg-primary/5"
          >
            <span>{value}</span>
            <ChevronDown className="size-4 opacity-70" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start" sideOffset={8}>
          <div className="flex flex-col gap-1">
            {DATE_RANGE_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setValue(label);
                  setOpen(false);
                }}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150",
                  value === label
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

/** Token reference — same classes as \`PopoverContent\` default shell. */
export const SurfaceToken: Story = {
  name: "Floating panel surface (token)",
  render: () => (
    <div
      className={cn(
        FLOATING_PANEL_SURFACE_CLASSNAME,
        "w-72 p-4 text-sm text-popover-foreground",
      )}
    >
      <p className="text-muted-foreground text-xs">
        This box uses only <code className="text-xs">FLOATING_PANEL_SURFACE_CLASSNAME</code>{" "}
        (no Radix popover). Compare shadow and radius to open popovers above.
      </p>
    </div>
  ),
};

export const DatePickerStyle: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-48 justify-start gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Pick a date…</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium text-foreground">
            Select Report Date Range
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Apply
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Settings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="right">
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium text-foreground">
            Widget Dimensions
          </h4>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width" className="text-right text-xs">
                Width
              </Label>
              <Input
                id="width"
                defaultValue="320"
                className="col-span-2 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height" className="text-right text-xs">
                Height
              </Label>
              <Input
                id="height"
                defaultValue="240"
                className="col-span-2 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="max-reviews" className="text-right text-xs">
                Max Reviews
              </Label>
              <Input
                id="max-reviews"
                defaultValue="10"
                type="number"
                min={1}
                max={50}
                className="col-span-2 h-8 text-xs"
              />
            </div>
          </div>
          <Button size="sm" className="w-full">
            Save Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
