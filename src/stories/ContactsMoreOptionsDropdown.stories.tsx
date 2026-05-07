import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import type {
  BulkImportHistoryRow,
  ContactsBulkImportStep,
} from "@/app/components/contacts/bulkImportTypes";
import { ContactsBulkImportWorkspace } from "@/app/components/contacts/ContactsBulkImportWorkspace";
import { ContactsMoreOptionsDropdown } from "@/app/components/contacts/ContactsMoreOptionsDropdown";
import { AppShellChromeStub } from "@/stories/appShellChromeStub";

const bulkShellDecorator = (Story: () => ReactNode) => (
  <AppShellChromeStub>
    <Story />
  </AppShellChromeStub>
);

const meta: Meta<typeof ContactsMoreOptionsDropdown> = {
  title: "App/Contacts/More options and bulk import",
  component: ContactsMoreOptionsDropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Contacts **More options** is a **dropdown** on the three-dot control (`ContactsMoreOptionsDropdown`). **Bulk import** opens `ContactsBulkImportWorkspace` in the app shell — use **Back** or the sidebar to revisit earlier steps (forward steps unlock after **Next**; removing the file resets progress). Bulk stories wrap **`AppShellChromeStub`**; use the **theme** toolbar for Light/Dark smoke.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContactsMoreOptionsDropdown>;

export const Default: Story = {
  name: "More options menu",
  render: function MenuRender() {
    return (
      <div className="flex w-full max-w-md justify-end p-6">
        <ContactsMoreOptionsDropdown
          onChooseBulkImport={() => toast.message("In the app, this opens the bulk import workspace.")}
        />
      </div>
    );
  },
};

function BulkWorkspaceStory({
  step: initialStep,
  importHistoryInitialRows,
}: {
  step: ContactsBulkImportStep;
  importHistoryInitialRows?: BulkImportHistoryRow[];
}) {
  const [step, setStep] = useState<ContactsBulkImportStep>(initialStep);
  return (
    <ContactsBulkImportWorkspace
      step={step}
      onStepChange={setStep}
      onCancel={() => toast.message("Cancel closes bulk import in the app.")}
      onFinish={() => toast.success("Finish")}
      {...(importHistoryInitialRows !== undefined ? { importHistoryInitialRows } : {})}
    />
  );
}

export const BulkImportUploadPopulated: StoryObj = {
  name: "Bulk import — upload (populated history)",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Uses **`AppShellChromeStub`** for shell-width context. After you pick a file, Upload shows a **white check on an emerald disc** (`bg-emerald-600` / `dark:bg-emerald-500`, `text-white` check) — no raw hex.",
      },
    },
  },
  decorators: [bulkShellDecorator],
  render: () => <BulkWorkspaceStory step="upload" />,
};

export const BulkImportUploadEmptyHistory: StoryObj = {
  name: "Bulk import — upload (empty history)",
  parameters: { layout: "fullscreen" },
  decorators: [bulkShellDecorator],
  render: () => <BulkWorkspaceStory step="upload" importHistoryInitialRows={[]} />,
};

export const BulkImportMatch: StoryObj = {
  name: "Bulk import — match",
  parameters: { layout: "fullscreen" },
  decorators: [bulkShellDecorator],
  render: () => <BulkWorkspaceStory step="match" />,
};

export const BulkImportImport: StoryObj = {
  name: "Bulk import — import",
  parameters: { layout: "fullscreen" },
  decorators: [bulkShellDecorator],
  render: () => <BulkWorkspaceStory step="import" />,
};
