import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "@/app/components/ui/button";
import {
  ColumnSettingsSheet,
  type ColumnSettingsSheetColumn,
} from "@/app/components/ui/ColumnSettingsSheet";

const referralStyleColumns: ColumnSettingsSheetColumn[] = [
  { id: "sentTo", label: "Sent to", visible: true, canHide: true },
  { id: "sentVia", label: "Sent via", visible: true, canHide: true },
  { id: "referralCode", label: "Referral code", visible: true, canHide: true },
  { id: "sentOn", label: "Sent on", visible: true, canHide: true },
];

const manualDnDChecklist =
  "Manual QA: (1) Open sheet. (2) Drag a **grip** vertically — dashed **DropSlot** and dimmed sibling rows should track. (3) Release over another row — order updates. (4) Drag across **switches** — insert line should not disappear mid-drag. (5) Drop at **end of list** (below last row). (6) Release **outside** the sheet — order unchanged. (7) **Alt+Arrow** on focused grip still moves a row.";

const reorderSpy = fn<(ids: string[]) => void>();

const meta: Meta<typeof ColumnSettingsSheet> = {
  title: "UI/ColumnSettingsSheet",
  component: ColumnSettingsSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Column visibility + **HTML5 drag reorder** used by **`AppDataTable`** (Columns sheet). Pure reorder helper: [`columnSettingsReorder.ts`](../app/components/ui/columnSettingsReorder.ts). " +
          manualDnDChecklist,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColumnSettingsSheet>;

function ColumnSettingsSheetPlayground() {
  const [open, setOpen] = useState(true);
  const [orderIds, setOrderIds] = useState<string[]>(() => referralStyleColumns.map((c) => c.id));
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(referralStyleColumns.map((c) => [c.id, c.visible])),
  );

  const columns = useMemo(
    () =>
      orderIds.map((id) => {
        const base = referralStyleColumns.find((c) => c.id === id)!;
        return { ...base, visible: visibility[id] ?? base.visible };
      }),
    [orderIds, visibility],
  );

  const onReorder = (ids: string[]) => {
    reorderSpy(ids);
    setOrderIds(ids);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Open columns sheet
      </Button>
      <p className="max-w-md text-sm text-muted-foreground">
        Current order: <code className="rounded bg-muted px-1 py-0.5 text-xs">{orderIds.join(" → ")}</code>
      </p>
      <ColumnSettingsSheet
        open={open}
        onOpenChange={setOpen}
        title="Columns"
        columns={columns}
        onReorder={onReorder}
        onToggleVisibility={(id, visible) => {
          setVisibility((v) => ({ ...v, [id]: visible }));
        }}
        onReset={() => {
          setOrderIds(referralStyleColumns.map((c) => c.id));
          setVisibility(Object.fromEntries(referralStyleColumns.map((c) => [c.id, c.visible])));
        }}
      />
    </div>
  );
}

export const ReferralsStyleReorder: Story = {
  name: "Referrals-style columns (DnD)",
  render: () => <ColumnSettingsSheetPlayground />,
};
