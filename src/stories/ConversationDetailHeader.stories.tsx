import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ConversationDetailHeader,
  type ConversationDetailHeaderProps,
} from "@/app/components/inbox/ConversationDetailHeader";

const meta: Meta<typeof ConversationDetailHeader> = {
  title: "App/Inbox/Conversation detail header",
  component: ConversationDetailHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Inbox thread chrome: **Select status** (`DropdownMenu` + fixed options, A–Z by label), assignee row, metadata + outcome + category badges. Options live in `inboxConversationClassification.ts` (sentence case).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[240px] bg-[#f5f6f8] dark:bg-app-shell-gutter">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConversationDetailHeader>;

function HeaderWithState(args: ConversationDetailHeaderProps) {
  const [classificationId, setClassificationId] = useState(args.classificationId);
  return (
    <ConversationDetailHeader
      {...args}
      classificationId={classificationId}
      onClassificationChange={setClassificationId}
    />
  );
}

export const Default: Story = {
  render: (args) => <HeaderWithState {...args} />,
  args: {
    contactName: "Alex K.",
    assignedTo: "Sarah M.",
    assignedAvatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    headerMetaLine: "Today, 2:14 PM · 3:30 · Agent: Sarah M.",
    categoryTag: "Wrong item",
    callOutcome: "resolved",
    classificationId: "service",
    chatHeaderElevated: false,
  },
};

export const SelectStatusEmpty: Story = {
  name: "Select status — empty",
  render: (args) => <HeaderWithState {...args} />,
  args: {
    ...Default.args,
    classificationId: "",
    headerMetaLine: undefined,
    categoryTag: undefined,
    callOutcome: undefined,
  },
};

export const ElevatedShadow: Story = {
  name: "Elevated header shadow",
  render: (args) => <HeaderWithState {...args} />,
  args: {
    ...Default.args,
    chatHeaderElevated: true,
  },
};
