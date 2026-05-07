/** Stable ids for inbox conversation classification (detail “Select status” dropdown). Labels are sentence case. Sorted A–Z by label (matches Inbox L2 **Status**). */
export const INBOX_CONVERSATION_CLASSIFICATION_OPTIONS = [
  { id: "follow_up", label: "Follow up" },
  { id: "lost", label: "Lost" },
  { id: "missed_call", label: "Missed call" },
  { id: "new_lead", label: "New lead" },
  { id: "new_voicemails", label: "New voicemails" },
  { id: "scheduling_request", label: "Scheduling request" },
  { id: "service", label: "Service" },
  { id: "unqualified", label: "Unqualified" },
  { id: "won", label: "Won" },
] as const;

export type InboxConversationClassificationId =
  (typeof INBOX_CONVERSATION_CLASSIFICATION_OPTIONS)[number]["id"];

export function inboxClassificationLabel(id: string): string {
  const row = INBOX_CONVERSATION_CLASSIFICATION_OPTIONS.find((o) => o.id === id);
  return row?.label ?? id;
}
