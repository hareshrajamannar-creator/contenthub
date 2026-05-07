import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ContactsView,
  CONTACTS_L2_KEY_ALL,
  CONTACTS_L2_KEY_LISTS,
  type ContactsAppBridge,
  type ContactsSheetMode,
} from "@/app/components/ContactsView";

const meta: Meta<typeof ContactsView> = {
  title: "App/Views/ContactsView",
  component: ContactsView,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ContactsView>;

export const Default: Story = {};

function shellStory(initial: {
  l2ActiveItem?: string;
  sheetMode?: ContactsSheetMode;
  detailContactId?: number | null;
  quickViewContactId?: number | null;
}): Story {
  return {
    render: function ShellRender() {
      const [l2, setL2] = useState(initial.l2ActiveItem ?? CONTACTS_L2_KEY_ALL);
      const [sheetMode, setSheetMode] = useState<ContactsSheetMode>(initial.sheetMode ?? "none");
      const [detailContactId, setDetailContactId] = useState<number | null>(
        initial.detailContactId ?? null,
      );
      const [quickViewContactId, setQuickViewContactId] = useState<number | null>(
        initial.quickViewContactId ?? null,
      );

      const app = useMemo<ContactsAppBridge>(
        () => ({
          l2ActiveItem: l2,
          onL2ActiveItemChange: setL2,
          sheetMode,
          onSheetModeChange: setSheetMode,
          detailContactId,
          onDetailContactIdChange: setDetailContactId,
          quickViewContactId,
          onQuickViewContactIdChange: setQuickViewContactId,
        }),
        [l2, sheetMode, detailContactId, quickViewContactId],
      );

      return <ContactsView app={app} />;
    },
  };
}

export const QuickViewOpen: Story = shellStory({
  sheetMode: "quickView",
  quickViewContactId: 42,
});

export const AddContactOpen: Story = shellStory({
  sheetMode: "addContact",
});

export const ListsAndSegments: Story = shellStory({
  l2ActiveItem: CONTACTS_L2_KEY_LISTS,
});

export const ContactDetails: Story = shellStory({
  detailContactId: 42,
});
