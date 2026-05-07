import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createColumnHelper } from "@tanstack/react-table";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { Button } from "@/app/components/ui/button";

type DemoRow = {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  assets: number | null;
  access: string;
  addedBy: string;
  addedEmail: string;
};

const rows: DemoRow[] = [
  {
    id: "1",
    name: "Google Calendar",
    subtitle: "calendar@company.com",
    status: "Active",
    assets: 1,
    access: "Private",
    addedBy: "Alex Smith",
    addedEmail: "alexsmith@content-mobbin.com",
  },
  {
    id: "2",
    name: "Demo – Why AI Will Save the…",
    subtitle: "This is a demo website integration",
    status: "Active",
    assets: null,
    access: "Entire workspace",
    addedBy: "Alex Smith",
    addedEmail: "alexsmith@content-mobbin.com",
  },
  {
    id: "3",
    name: "Compass",
    subtitle: "compass.app",
    status: "Active",
    assets: 3,
    access: "Private",
    addedBy: "Alex Smith",
    addedEmail: "alexsmith@content-mobbin.com",
  },
];

const h = createColumnHelper<DemoRow>();

const referenceColumns = [
  h.accessor("name", {
    id: "name",
    header: "Name",
    meta: { settingsLabel: "Name" },
    size: 260,
    minSize: 180,
    enableSorting: true,
    cell: (info) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{info.getValue()}</span>
        <span className="text-muted-foreground">{info.row.original.subtitle}</span>
      </div>
    ),
  }),
  h.accessor("status", {
    id: "status",
    header: "Connection status",
    meta: { settingsLabel: "Connection status" },
    size: 160,
    enableSorting: true,
  }),
  h.accessor("assets", {
    id: "assets",
    header: "Assets",
    meta: { settingsLabel: "Assets" },
    size: 96,
    enableSorting: true,
    cell: (info) => {
      const v = info.getValue();
      return <span className="text-foreground tabular-nums">{v == null ? "—" : v}</span>;
    },
  }),
  h.accessor("access", {
    id: "access",
    header: "Access",
    meta: { settingsLabel: "Access" },
    size: 160,
    enableSorting: true,
  }),
  h.accessor("addedBy", {
    id: "addedBy",
    header: "Added by",
    meta: { settingsLabel: "Added by" },
    size: 200,
    enableSorting: true,
    cell: (info) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{info.getValue()}</span>
        <span className="text-muted-foreground">{info.row.original.addedEmail}</span>
      </div>
    ),
  }),
];

const twoColumnDemo = [
  h.accessor("name", {
    id: "name",
    header: "Name",
    meta: { settingsLabel: "Name" },
    enableSorting: true,
    cell: (info) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{info.getValue()}</span>
        <span className="text-muted-foreground">{info.row.original.subtitle}</span>
      </div>
    ),
  }),
  h.accessor("status", {
    id: "status",
    header: "Status",
    meta: { settingsLabel: "Status" },
    enableSorting: true,
  }),
];

const meta: Meta<typeof AppDataTable<DemoRow>> = {
  title: "UI/AppDataTable",
  component: AppDataTable,
  tags: ["autodocs"],
  argTypes: {
    rowDensity: {
      control: "select",
      options: ["default", "medium", "large"],
      description:
        "Directory row vertical padding. **default** = reference (Payments/Contacts); **medium** = legacy; **large** = comfort.",
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**TanStack Table v8** + [`table.v1`](../app/components/ui/table.v1.tsx): headers use **`--table-label-size` (12px)**; body cells use **`--font-size` (13px)**, **chevron** sort (`ChevronDown` when unsorted/desc, `ChevronUp` when asc), short resize handle, **weighted widths** vs container when `columnSizing` is empty (`ResizeObserver`). **`minWidth`** is the sum of column sizes (scroll when needed); **`width`** is at least the scrollport so row borders span the container. Persisted widths are not auto-redistributed after resize. **Columns** opens **Sheet**; `toolbarTitle` shows a labeled Columns button, otherwise **icon-only**. Isolated **drag-reorder QA**: **UI/ColumnSettingsSheet** (Referrals-style story + manual checklist). **`stickyFirstColumn`** (default true) pins the first **`stickyLeadingColumnCount`** visible columns on horizontal scroll (default **1**); cumulative `left` offsets stack. A right-edge shadow on the **last** pinned column appears when `scrollLeft > 0`. Set **`stickyLeadingColumnCount` to `0`** with **`stickyFirstColumn` true** to disable pinning. State persists when `persist` is true. Use the theme toolbar for light/dark.\n\n**`rowDensity`** — `default` (compact **8px** vertical padding; reference for Payments/Contacts), `medium` (legacy `py-4` body), `large` (roomier). Omit to keep **`medium`** for backward compatibility.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppDataTable<DemoRow>>;

export const ReferenceChrome: Story = {
  name: "Reference layout (composite cells)",
  args: {
    tableId: "storybook.appDataTable.reference",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
    rowDensity: "medium",
  },
};

export const RowDensityDefault: Story = {
  name: "Row density · default (reference)",
  args: {
    tableId: "storybook.appDataTable.rowDensity.default",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
    rowDensity: "default",
  },
};

export const RowDensityMedium: Story = {
  name: "Row density · medium (legacy)",
  args: {
    tableId: "storybook.appDataTable.rowDensity.medium",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
    rowDensity: "medium",
  },
};

export const RowDensityLarge: Story = {
  name: "Row density · large",
  args: {
    tableId: "storybook.appDataTable.rowDensity.large",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
    rowDensity: "large",
  },
};

export const WithToolbarTitle: Story = {
  name: "With toolbar title (Columns + label)",
  args: {
    tableId: "storybook.appDataTable.toolbarTitle",
    data: rows,
    columns: referenceColumns,
    persist: false,
    toolbarTitle: "Directory",
    columnSheetTitle: "Column preferences",
    initialSorting: [{ id: "status", desc: true }],
  },
};

export const TwoColumnsWeighted: Story = {
  name: "Two columns (default 62/38 weights)",
  args: {
    tableId: "storybook.appDataTable.twoCol",
    data: rows,
    columns: twoColumnDemo,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
  },
};

export const WithPersistence: Story = {
  name: "With session persistence",
  args: {
    tableId: "storybook.appDataTable.persisted",
    data: rows,
    columns: referenceColumns,
    persist: true,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "addedBy", desc: false }],
  },
};

export const ExternalColumnTrigger: Story = {
  name: "External column trigger (header-controlled sheet)",
  args: {
    tableId: "storybook.appDataTable.externalColumn",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Column preferences",
    initialSorting: [{ id: "name", desc: false }],
  },
  render: (args) => {
    const [columnSheetOpen, setColumnSheetOpen] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end gap-2 border-b border-border pb-4">
          <span className="mr-auto text-sm text-muted-foreground">Toolbar mimicking MainCanvasViewHeader.actions</span>
          <AppDataTableColumnSettingsTrigger
            sheetTitle={args.columnSheetTitle ?? "Columns"}
            onClick={() => setColumnSheetOpen(true)}
          />
          <Button type="button" size="sm" className="cursor-pointer" onClick={() => {}}>
            Primary CTA
          </Button>
        </div>
        <AppDataTable<DemoRow>
          {...args}
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={setColumnSheetOpen}
        />
      </div>
    );
  },
};

export const StickyLeadingColumns: Story = {
  name: "Sticky · first 3 visible columns",
  args: {
    tableId: "storybook.appDataTable.sticky.leading3",
    data: rows,
    columns: referenceColumns,
    persist: false,
    columnSheetTitle: "Columns",
    initialSorting: [{ id: "name", desc: false }],
    rowDensity: "default",
    stickyLeadingColumnCount: 3,
  },
};
