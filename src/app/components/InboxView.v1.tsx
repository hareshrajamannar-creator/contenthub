import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CallRecordingPlayer } from "@/app/components/CallRecordingPlayer";
import { CALL_BY_ID } from "@/app/components/callRecordingData";
import { Button } from "@/app/components/ui/button";
import {
  INBOX_SHORTCUT_EVENT,
  type InboxShortcutAction,
} from "@/app/shortcuts/events";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Phone,
  Image as ImageIcon,
  AtSign,
  ArrowUp,
  Reply,
  MessageSquarePlus,
  Mail,
  User,
  Users,
} from "lucide-react";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { HOVER } from "./L2NavLayout";
import { HorizontalResizeHandle } from "@/app/components/layout/HorizontalResizeHandle";
import {
  clampInboxListWidth,
  INBOX_LIST_WIDTH_DEFAULT,
  INBOX_LIST_WIDTH_MIN,
  maxInboxListWidth,
  useInboxListPanelWidth,
} from "@/app/hooks/useInboxListPanelWidth";

/* ─── Types ─── */
interface Conversation {
  id: string;
  name: string;
  preview: string;
  lastMessage: string;
  date: string;
  location: string;
  team: string;
  teamIcon: "us" | "kelsy";
  unread: boolean;
  hasReply?: boolean;
  replyTime?: string;
  type?: "call-recording";
  callDuration?: string;
  callOutcome?: "resolved" | "escalated" | "follow-up";
}

interface ChatMessage {
  id: string;
  sender: "customer" | "agent";
  text: string;
  time: string;
  sentVia?: string;
}

interface ConversationDetail {
  contactName: string;
  assignedTo: string;
  assignedAvatar: string;
  dateSeparator: string;
  messages: ChatMessage[];
}

/* ─── Mock data ─── */
const conversations: Conversation[] = [
  {
    id: "alex-k",
    name: "Alex K.",
    preview: "I received size 8 but I ordered size 9 — order #58421",
    lastMessage: "I received size 8 but I ordered size 9 — order #58421",
    date: "Today",
    location: "Los Angeles, CA",
    team: "Sarah M.",
    teamIcon: "kelsy",
    unread: true,
    type: "call-recording",
    callDuration: "3:30",
    callOutcome: "resolved",
  },
  {
    id: "maria-torres",
    name: "Maria Torres",
    preview: "I was billed twice for my subscription this month",
    lastMessage: "I was billed twice for my subscription this month",
    date: "Yesterday",
    location: "Miami, FL",
    team: "David R.",
    teamIcon: "kelsy",
    unread: false,
    type: "call-recording",
    callDuration: "4:15",
    callOutcome: "resolved",
  },
  {
    id: "james-chen",
    name: "James Chen",
    preview: "I shipped back a jacket 3 weeks ago — still no refund",
    lastMessage: "I shipped back a jacket 3 weeks ago — still no refund",
    date: "2 days ago",
    location: "Seattle, WA",
    team: "David R.",
    teamIcon: "us",
    unread: true,
    type: "call-recording",
    callDuration: "2:48",
    callOutcome: "escalated",
  },
  {
    id: "sarah-williams",
    name: "Sarah Williams",
    preview: "My order hasn't arrived — it's been 10 days",
    lastMessage: "My order hasn't arrived — it's been 10 days",
    date: "3 days ago",
    location: "Chicago, IL",
    team: "Sarah M.",
    teamIcon: "kelsy",
    unread: false,
    type: "call-recording",
    callDuration: "5:12",
    callOutcome: "follow-up",
  },
  {
    id: "1",
    name: "Annette Black",
    preview: "Kelsy Hiltz: yes",
    lastMessage: "Kelsy Hiltz: yes",
    date: "Dec 31, 2022",
    location: "San Francisco",
    team: "Kelsy Hiltz",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "2",
    name: "Wade Warren",
    preview: "Robin: Was your question answered?",
    lastMessage: "Robin: Was your question answered?",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "3",
    name: "Cameron Williamson",
    preview: "You can find more details here: https://birdeye.com",
    lastMessage: "You can find more details here: https://birdeye.com",
    date: "",
    location: "Austin",
    team: "Savannah",
    teamIcon: "kelsy",
    unread: false,
    hasReply: true,
    replyTime: "03:25 PM",
  },
  {
    id: "4",
    name: "Floyd Miles",
    preview: "Robin: Was your question answered?",
    lastMessage: "Robin: Was your question answered?",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "5",
    name: "Brooklyn Simmons",
    preview: "Robin: Was your question answered?",
    lastMessage: "Robin: Was your question answered?",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "6",
    name: "Marvin McKinney",
    preview: "Robin: Was your question answered?",
    lastMessage: "Robin: Was your question answered?",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "7",
    name: "Floyd Miles",
    preview: "Please don't hesitate to reach out to us",
    lastMessage: "Please don't hesitate to reach out to us",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: true,
  },
  {
    id: "8",
    name: "Jerome Bell",
    preview: "Robin: Was your question answered?",
    lastMessage: "Robin: Was your question answered?",
    date: "Dec 11, 2022",
    location: "San Francisco",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "9",
    name: "Kristin Watson",
    preview: "Thanks — we will follow up tomorrow morning.",
    lastMessage: "Thanks — we will follow up tomorrow morning.",
    date: "Jan 4, 2026",
    location: "Denver",
    team: "USA - Sales",
    teamIcon: "us",
    unread: true,
  },
  {
    id: "10",
    name: "Jacob Jones",
    preview: "Can someone reschedule my appointment?",
    lastMessage: "Can someone reschedule my appointment?",
    date: "Jan 3, 2026",
    location: "Chicago",
    team: "Kelsy Hiltz",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "11",
    name: "Eleanor Pena",
    preview: "Sent the invoice — let me know if it looks correct.",
    lastMessage: "Sent the invoice — let me know if it looks correct.",
    date: "Jan 2, 2026",
    location: "Seattle",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "12",
    name: "Ralph Edwards",
    preview: "Is there a discount for annual billing?",
    lastMessage: "Is there a discount for annual billing?",
    date: "Jan 2, 2026",
    location: "Phoenix",
    team: "USA - Sales",
    teamIcon: "us",
    unread: true,
  },
  {
    id: "13",
    name: "Jenny Wilson",
    preview: "Appreciate the quick turnaround on this ticket.",
    lastMessage: "Appreciate the quick turnaround on this ticket.",
    date: "Jan 1, 2026",
    location: "Miami",
    team: "Savannah",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "14",
    name: "Courtney Henry",
    preview: "Please confirm the address on file.",
    lastMessage: "Please confirm the address on file.",
    date: "Dec 30, 2025",
    location: "Portland",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "15",
    name: "Devon Lane",
    preview: "Voice mail: callback requested after 3pm PT.",
    lastMessage: "Voice mail: callback requested after 3pm PT.",
    date: "Dec 29, 2025",
    location: "Los Angeles",
    team: "Kelsy Hiltz",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "16",
    name: "Arlene McCoy",
    preview: "Link to the survey is broken on mobile Safari.",
    lastMessage: "Link to the survey is broken on mobile Safari.",
    date: "Dec 28, 2025",
    location: "Austin",
    team: "USA - Sales",
    teamIcon: "us",
    unread: true,
  },
  {
    id: "17",
    name: "Darrell Steward",
    preview: "Robin: sharing notes from the call.",
    lastMessage: "Robin: sharing notes from the call.",
    date: "Dec 27, 2025",
    location: "San Diego",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "18",
    name: "Cody Fisher",
    preview: "We are ready to sign — what are next steps?",
    lastMessage: "We are ready to sign — what are next steps?",
    date: "Dec 26, 2025",
    location: "Boston",
    team: "Savannah",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "19",
    name: "Jane Cooper",
    preview: "Quick question about SMS opt-in wording.",
    lastMessage: "Quick question about SMS opt-in wording.",
    date: "Dec 25, 2025",
    location: "Dallas",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "20",
    name: "Leslie Alexander",
    preview: "Can you merge these two locations in the dashboard?",
    lastMessage: "Can you merge these two locations in the dashboard?",
    date: "Dec 24, 2025",
    location: "Atlanta",
    team: "Kelsy Hiltz",
    teamIcon: "kelsy",
    unread: true,
  },
  {
    id: "21",
    name: "Guy Hawkins",
    preview: "Thanks, issue resolved on our side.",
    lastMessage: "Thanks, issue resolved on our side.",
    date: "Dec 23, 2025",
    location: "Nashville",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "22",
    name: "Annette Porter",
    preview: "Forwarding this thread to billing.",
    lastMessage: "Forwarding this thread to billing.",
    date: "Dec 22, 2025",
    location: "Salt Lake City",
    team: "Savannah",
    teamIcon: "kelsy",
    unread: false,
  },
  {
    id: "23",
    name: "Robert Fox",
    preview: "Do you integrate with Salesforce?",
    lastMessage: "Do you integrate with Salesforce?",
    date: "Dec 21, 2025",
    location: "Minneapolis",
    team: "USA - Sales",
    teamIcon: "us",
    unread: false,
  },
  {
    id: "24",
    name: "Dianne Russell",
    preview: "Please escalate — customer is waiting on site.",
    lastMessage: "Please escalate — customer is waiting on site.",
    date: "Dec 20, 2025",
    location: "Houston",
    team: "USA - Sales",
    teamIcon: "us",
    unread: true,
  },
];

const conversationDetails: Record<string, ConversationDetail> = {
  "alex-k": {
    contactName: "Alex K.",
    assignedTo: "Sarah M.",
    assignedAvatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMjE3MDIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    dateSeparator: "Today · Call Recording",
    messages: [],
  },
  "3": {
    contactName: "Cameron Williamson",
    assignedTo: "Savannah",
    assignedAvatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMjE3MDIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    dateSeparator: "Thu • Dec 17",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "I've sent you my preferred date and time through the appointment scheduling tool. Additionally, can you guide me through the payment options available?",
        time: "09:12 PM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "No problem! I have sent the survey link to your email address. Your feedback is very valuable to us, and we appreciate you taking the time to share it. If you have any further questions or concerns, please don't hesitate to reach out to us. Have a great day!",
        time: "09:12 PM",
        sentVia: "Sent via Birdeye",
      },
    ],
  },
  "1": {
    contactName: "Annette Black",
    assignedTo: "Kelsy Hiltz",
    assignedAvatar:
      "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzIwNDIwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    dateSeparator: "Fri • Dec 30",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Hi, I'd like to check on the status of my recent order. Can you help me with that?",
        time: "10:30 AM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Of course! Let me pull up your order details. Could you provide me with your order number?",
        time: "10:32 AM",
      },
      {
        id: "m3",
        sender: "customer",
        text: "Yes, it's #ORD-2847391. I placed it last week.",
        time: "10:33 AM",
      },
      {
        id: "m4",
        sender: "agent",
        text: "I found your order. It's currently being processed and should ship within the next 24 hours. You'll receive a tracking number via email once it's dispatched.",
        time: "10:35 AM",
        sentVia: "Sent via Birdeye",
      },
      {
        id: "m5",
        sender: "customer",
        text: "yes",
        time: "10:45 AM",
      },
    ],
  },
  "9": {
    contactName: "Kristin Watson",
    assignedTo: "Robin",
    assignedAvatar:
      "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzIwNDIwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    dateSeparator: "Sat • Jan 4",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "We need a written confirmation for the renewal before end of week.",
        time: "08:10 AM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Thanks — we will follow up tomorrow morning with the contract draft.",
        time: "08:22 AM",
        sentVia: "Sent via Birdeye",
      },
    ],
  },
  "10": {
    contactName: "Jacob Jones",
    assignedTo: "Kelsy Hiltz",
    assignedAvatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMjE3MDIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    dateSeparator: "Fri • Jan 3",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Can someone reschedule my appointment to Thursday afternoon?",
        time: "03:40 PM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Absolutely — I sent three open slots. Pick one and we will lock it in.",
        time: "03:52 PM",
        sentVia: "Sent via Birdeye",
      },
      {
        id: "m3",
        sender: "customer",
        text: "Thursday 2pm works. Thank you!",
        time: "04:01 PM",
      },
    ],
  },
};

// Generate default detail for conversations without specific detail
function getDetail(id: string): ConversationDetail {
  if (conversationDetails[id]) return conversationDetails[id];
  const conv = conversations.find((c) => c.id === id);
  return {
    contactName: conv?.name ?? "Unknown",
    assignedTo: "Robin",
    assignedAvatar:
      "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzIwNDIwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    dateSeparator: "Mon • Dec 11",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Hi, I have a question about your services. Could you help me understand the different plans available?",
        time: "02:15 PM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Was your question answered? Please let us know if you need any further assistance.",
        time: "02:45 PM",
        sentVia: "Sent via Birdeye",
      },
    ],
  };
}

/* ═════════════════════════════════════
   Conversation List Item
   ═════════════════════════════════════ */
function ConversationItem({
  conv,
  isSelected,
  onClick,
}: {
  conv: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-sans font-medium w-full rounded-none border-0 text-left transition-colors duration-150 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-inset ${
        isSelected
          ? "bg-[#f0f4ff] dark:bg-[#252a3a]"
          : `bg-transparent ${HOVER}`
      }`}
    >
      {/* Full-bleed row surface; px-4 matches list header — equal inset left/right of text block */}
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="flex min-h-8 items-center gap-2">
          <div
            className="flex min-h-8 w-2 shrink-0 items-center justify-center"
            aria-hidden={!conv.unread}
          >
            {conv.unread ? (
              <span
                className="size-1.5 shrink-0 rounded-full bg-primary"
                title="Unread"
                aria-label="Unread"
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="min-w-0 truncate text-base text-foreground">
              {conv.name}
            </span>
            <span className="flex shrink-0 items-center gap-2 tabular-nums">
              {conv.hasReply && (
                <Reply className="size-3 shrink-0 text-muted-foreground -scale-x-100" />
              )}
              <span className="whitespace-nowrap text-right text-sm text-muted-foreground">
                {conv.hasReply ? conv.replyTime : conv.date}
              </span>
            </span>
          </div>
        </div>

        {conv.type === "call-recording" ? (
          <div className="flex items-center gap-1.5 pl-4">
            <Phone className="size-3 shrink-0 text-primary" aria-label="Call recording" />
            <span className="text-[12px] tabular-nums text-[#666] dark:text-[#9ba2b0]">{conv.callDuration}</span>
            <span className="text-[#ccc] dark:text-[#444]">·</span>
            {conv.callOutcome === "resolved"   && <span className="rounded-md border-0 bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Resolved</span>}
            {conv.callOutcome === "escalated"  && <span className="rounded-md border-0 bg-red-50 px-2 py-0.5 text-[12px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">Escalated</span>}
            {conv.callOutcome === "follow-up"  && <span className="rounded-md border-0 bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Follow-up</span>}
          </div>
        ) : (
          <p className="truncate pl-4 text-base text-muted-foreground">{conv.preview}</p>
        )}

        <div className="-mt-1 flex min-w-0 items-center gap-1 pl-4 text-sm text-muted-foreground">
          <span className="shrink-0">{conv.location}</span>
          <span aria-hidden>•</span>
          <span className="inline-flex min-w-0 items-center gap-1">
            {conv.teamIcon === "us" ? (
              <Users
                className="size-3 shrink-0 text-muted-foreground"
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
                aria-hidden
              />
            ) : (
              <User
                className="size-3 shrink-0 text-muted-foreground"
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
                aria-hidden
              />
            )}
            <span className="truncate" title={conv.team}>
              {conv.team}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

/* ═════════════════════════════════════
   Chat Bubble
   ═════════════════════════════════════ */
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAgent = msg.sender === "agent";

  return (
    <div
      className={`flex flex-col ${isAgent ? "items-end" : "items-start"} mb-2`}
    >
      <div
        className={`max-w-[420px] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
          isAgent
            ? "bg-[#e3f0ff] dark:bg-[#1e3a5f] text-[#212121] dark:text-[#e4e4e4] rounded-br-md"
            : "bg-white dark:bg-[#262b35] text-[#212121] dark:text-[#e4e4e4] rounded-bl-md"
        }`}
        style={{ fontWeight: 400 }}
      >
        {msg.text}
      </div>
      <div className="flex items-center gap-2 mt-1.5 px-1">
        {msg.sentVia && (
          <span
            className="text-[11px] text-[#b0b0b0] dark:text-[#5a6170] italic"
            style={{ fontWeight: 400 }}
          >
            {msg.sentVia}
          </span>
        )}
        <span
          className="text-[11px] text-[#999] dark:text-[#5a6170]"
          style={{ fontWeight: 400 }}
        >
          {msg.time}
        </span>
      </div>
    </div>
  );
}

function InboxDetailMessagesSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="mb-6 flex justify-center">
        <div className="inbox-proto-shimmer-block h-4 w-32 rounded-full" />
      </div>
      <div className="flex flex-col gap-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={i % 2 === 0 ? "flex justify-start" : "flex justify-end"}>
            <div
              className={`inbox-proto-shimmer-block rounded-2xl ${
                i % 2 === 0
                  ? "h-14 w-[min(100%,260px)] rounded-bl-md"
                  : "h-24 w-[min(100%,300px)] rounded-br-md"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   Composer Bar
   ═════════════════════════════════════ */
function Composer({ textareaRef }: { textareaRef: RefObject<HTMLTextAreaElement | null> }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message, textareaRef]);

  const canSend = Boolean(message.trim());

  return (
    <div className="bg-transparent px-4 py-4 transition-colors duration-300">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/40">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything, use @ to tag files and collections"
          rows={1}
          className="w-full bg-transparent text-[14px] text-[#212121] dark:text-[#e4e4e4] placeholder:text-[#b0b0b0] dark:placeholder:text-[#4d5568] outline-none resize-none"
          style={{ fontWeight: 400 }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#eaecef] dark:hover:bg-[#2e3340]"
              title="Attach"
            >
              <Paperclip className="w-[14px] h-[14px] text-[#212121] dark:text-[#c0c6d4]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#eaecef] dark:hover:bg-[#2e3340]"
              title="Image"
            >
              <ImageIcon className="w-[14px] h-[14px] text-[#212121] dark:text-[#c0c6d4]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#eaecef] dark:hover:bg-[#2e3340]"
              title="Mention"
            >
              <AtSign className="w-[14px] h-[14px] text-[#212121] dark:text-[#c0c6d4]" />
            </Button>
            <div
              className="mx-1 h-4 w-px shrink-0 bg-[#e5e9f0] dark:bg-[#333a47]"
              aria-hidden
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-[#eaecef] dark:hover:bg-[#2e3340]"
              title="Settings"
            >
              <SlidersHorizontal className="w-[14px] h-[14px] text-[#212121] dark:text-[#c0c6d4]" />
            </Button>
          </div>

          <Button
            type="button"
            aria-label="Send"
            className={`h-10 w-10 shrink-0 rounded-[10px] p-0 text-white ${
              canSend
                ? "bg-[#2552ED] hover:bg-[#1E44CC]"
                : "bg-[#2552ED]/70 hover:bg-[#2552ED]/75 dark:bg-[#2552ED]/50 dark:hover:bg-[#2552ED]/55"
            }`}
          >
            <ArrowUp className="mx-auto h-4 w-4" strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   Inbox Left Nav Panel
   ═════════════════════════════════════ */
function InboxNav() {
  const [activeItem, setActiveItem] = useState("All messages");
  const [assignmentOpen, setAssignmentOpen] = useState(true);
  const [leadsOpen, setLeadsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const assignmentItems = [
    "Assigned to me",
    "Assigned to AI agents",
    "Assigned to others",
    "Unassigned",
  ];

  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-lg flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300">
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-0.5">
          {/* New message */}
          <button className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]">
            <span>New message</span>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <MessageSquarePlus className="w-[15px] h-[15px] text-[#2552ED]" />
            </div>
          </button>

          {/* All messages */}
          <button
            onClick={() => setActiveItem("All messages")}
            className={`flex items-center gap-2.5 px-2 py-1.5 w-full text-[14px] rounded-[4px] transition-colors tracking-[-0.28px] ${
              activeItem === "All messages"
                ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
            }`}
          >
            
            All messages
          </button>

          {/* Assignment section */}
          <div>
            <button
              onClick={() => setAssignmentOpen(!assignmentOpen)}
              className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]"
            >
              <span>Assignment</span>
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                {assignmentOpen ? (
                  <ChevronDown className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                )}
              </div>
            </button>
            {assignmentOpen && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {assignmentItems.map((label) => (
                  <button
                    key={label}
                    onClick={() => setActiveItem(label)}
                    className={`text-left px-2 py-1.5 text-[13px] rounded-[4px] transition-colors tracking-[-0.26px] ${
                      activeItem === label
                        ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                        : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spam */}
          <button
            onClick={() => setActiveItem("Spam")}
            className={`text-left px-2 py-1.5 text-[14px] rounded-[4px] transition-colors tracking-[-0.28px] ${
              activeItem === "Spam"
                ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
            }`}
          >
            Spam
          </button>

          {/* Leads */}
          <button
            onClick={() => setLeadsOpen(!leadsOpen)}
            className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]"
          >
            <span>Leads</span>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
            </div>
          </button>

          {/* Feedback */}
          <button
            onClick={() => setFeedbackOpen(!feedbackOpen)}
            className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]"
          >
            <span>Feedback</span>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
            </div>
          </button>

          {/* Saved filters */}
          <button className="text-left px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]">
            Saved filters
          </button>

          {/* Agents */}
          <button className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]">
            <span>Agents</span>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
            </div>
          </button>

          {/* Lead generation agents */}
          <button className="text-left px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]">
            Lead generation agents
          </button>

          {/* Settings */}
          <button className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]">
            <span>Settings</span>
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════
   Main Inbox View
   ═════════════════════════════════════ */
export function InboxView() {
  const [selectedId, setSelectedId] = useState("alex-k");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailLoadNonce, setDetailLoadNonce] = useState(0);
  const [statusOpen, setStatusOpen] = useState(false);
  const [chatHeaderElevated, setChatHeaderElevated] = useState(false);
  const [listScrollShimmer, setListScrollShimmer] = useState(false);
  const detail = getDetail(selectedId);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const listShimmerClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composeTextareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Resizable conversation list ── */
  const listContainerRef = useRef<HTMLDivElement>(null);
  const resizeDraggingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWRef = useRef(0);

  const rowWidth =
    listContainerRef.current?.parentElement?.clientWidth ?? 1200;
  const { width: listWidth, setWidth: setListWidth, widthRef: listWidthRef } =
    useInboxListPanelWidth(rowWidth);
  const maxListW = maxInboxListWidth(rowWidth);

  const onResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      resizeDraggingRef.current = true;
      resizeStartXRef.current = e.clientX;
      resizeStartWRef.current = listWidthRef.current;
      e.currentTarget.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (!resizeDraggingRef.current) return;
        const delta = ev.clientX - resizeStartXRef.current;
        const rW =
          listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
        const next = clampInboxListWidth(resizeStartWRef.current + delta, rW);
        listWidthRef.current = next;
        const el = listContainerRef.current;
        if (el) el.style.width = `${next}px`;
      };

      const onUp = (ev: PointerEvent) => {
        resizeDraggingRef.current = false;
        try {
          e.currentTarget.releasePointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        const rW =
          listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
        const finalW = clampInboxListWidth(listWidthRef.current, rW);
        listWidthRef.current = finalW;
        setListWidth(finalW);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [rowWidth, setListWidth, listWidthRef]
  );

  const onResizeHandleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rW =
        listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
      const target = clampInboxListWidth(INBOX_LIST_WIDTH_DEFAULT, rW);
      listWidthRef.current = target;
      setListWidth(target);
      const el = listContainerRef.current;
      if (el) el.style.width = `${target}px`;
    },
    [rowWidth, setListWidth, listWidthRef]
  );

  const selectConversation = useCallback((id: string) => {
    setDetailLoading(true);
    setSelectedId(id);
    setDetailLoadNonce((n) => n + 1);
  }, []);

  const onConversationListScroll = useCallback(() => {
    setListScrollShimmer(true);
    if (listShimmerClearRef.current) window.clearTimeout(listShimmerClearRef.current);
    listShimmerClearRef.current = window.setTimeout(() => {
      setListScrollShimmer(false);
      listShimmerClearRef.current = null;
    }, 400);
  }, []);

  useEffect(() => {
    const onShortcut = (e: Event) => {
      const detail = (e as CustomEvent<{ action: InboxShortcutAction }>).detail;
      if (!detail) return;
      if (detail.action === "focus-compose") {
        composeTextareaRef.current?.focus();
      }
    };
    window.addEventListener(INBOX_SHORTCUT_EVENT, onShortcut);
    return () => window.removeEventListener(INBOX_SHORTCUT_EVENT, onShortcut);
  }, []);

  useEffect(() => {
    if (detailLoading) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, detailLoading]);

  useEffect(() => {
    if (!detailLoading) return;
    const t = window.setTimeout(() => setDetailLoading(false), 900);
    return () => window.clearTimeout(t);
  }, [selectedId, detailLoadNonce, detailLoading]);

  useEffect(() => {
    const el = chatMessagesRef.current;
    if (!el) return;
    const onScroll = () => {
      setChatHeaderElevated(el.scrollTop > 2);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedId, detailLoading]);

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f8f9fa] transition-colors duration-300 dark:bg-[#13161b]">
      <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* ═══ CENTER-LEFT: Conversation list (resizable) ═══ */}
      <div
        ref={listContainerRef}
        className="relative flex shrink-0 flex-col border-l border-r border-[#eaeaea] bg-white transition-colors duration-300 dark:border-[#333a47] dark:bg-[#1e2229]"
        style={{ width: listWidth }}
      >
        <HorizontalResizeHandle
          side="right"
          aria-label="Resize conversation list"
          aria-valuenow={Math.round(listWidth)}
          aria-valuemin={INBOX_LIST_WIDTH_MIN}
          aria-valuemax={Math.round(maxListW)}
          onPointerDown={onResizePointerDown}
          onDoubleClick={onResizeHandleDoubleClick}
        />
        {/* List header — same left rail + horizontal rhythm as conversation rows; icons align with title row */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="w-2 shrink-0" aria-hidden />
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => setStatusOpen(!statusOpen)}
                    className="flex min-h-8 items-center gap-1 rounded-md text-left hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                    aria-expanded={statusOpen}
                  >
                    <span
                      className="text-[12px] text-[#212121] dark:text-[#e4e4e4] uppercase tracking-[0.5px]"
                      style={{ fontWeight: 400 }}
                    >
                      Open
                    </span>
                    <ChevronDown className="size-3 shrink-0 text-[#555] dark:text-[#8b92a5]" />
                  </button>

                  {statusOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-[#e5e9f0] bg-white py-1 shadow-lg dark:border-[#333a47] dark:bg-[#262b35]">
                      {["Open", "Closed", "Snoozed", "All"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusOpen(false)}
                          className="w-full px-4 py-2 text-left text-[13px] text-[#212121] hover:bg-[#f5f5f5] dark:text-[#e4e4e4] dark:hover:bg-[#2e3340]"
                          style={{ fontWeight: 400 }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {[
                  { Icon: Search, label: "Search" },
                  { Icon: SlidersHorizontal, label: "Filter" },
                  { Icon: ArrowUpDown, label: "Sort" },
                  { Icon: MoreVertical, label: "More" },
                ].map(({ Icon, label }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                    title={label}
                  >
                    <Icon className="size-[14px] text-[#555] dark:text-[#8b92a5]" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 shrink-0" aria-hidden />
              <p className="mt-0.5 text-xs text-muted-foreground">
                19.2K total messages · {unreadCount} unread
              </p>
            </div>
          </div>
        </div>

        {/* Conversation list — horizontal gutter + row radius match L2NavLayout scroll area */}
        <div className="relative min-h-0 flex-1">
          {listScrollShimmer ? (
            <div
              aria-hidden
              className="inbox-proto-shimmer-overlay pointer-events-none absolute inset-x-0 top-0 z-20 h-16 opacity-95"
            />
          ) : null}
          <div
            onScroll={onConversationListScroll}
            className="h-full overflow-y-auto pb-4 [scrollbar-gutter:stable]"
          >
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={conv.id === selectedId}
                onClick={() => selectConversation(conv.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Conversation detail ═══ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f5f6f8] transition-colors duration-300 dark:bg-[#13161b]">
        <div
          className={`relative z-10 flex h-[60px] shrink-0 items-center justify-between bg-[#f5f6f8] px-5 transition-[box-shadow,colors] duration-200 dark:bg-[#13161b] ${
            chatHeaderElevated
              ? "shadow-[0_2px_10px_-4px_rgba(15,23,42,0.1)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.28)]"
              : "shadow-none"
          }`}
        >
          <h2
            className="text-[16px] text-[#212121] dark:text-[#e4e4e4]"
            style={{ fontWeight: 400 }}
          >
            {detail.contactName}
          </h2>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-[8px] px-2 py-1 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
              <div className="size-6 overflow-hidden rounded-full ring-1 ring-[#e8eaed] dark:ring-[#3d4555]">
                <img
                  src={detail.assignedAvatar}
                  alt={detail.assignedTo}
                  className="size-full object-cover"
                />
              </div>
              <span
                className="text-[13px] text-[#212121] dark:text-[#e4e4e4]"
                style={{ fontWeight: 400 }}
              >
                {detail.assignedTo}
              </span>
              <ChevronDown className="size-3.5 text-[#999] dark:text-[#6b7280]" />
            </button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
              aria-label="More options"
            >
              <MoreVertical className="h-[14px] w-[14px] text-[#212121] dark:text-[#c0c6d4]" />
            </Button>
          </div>
        </div>

        {/* Chat messages */}
        <div ref={chatMessagesRef} className="min-h-0 flex-1 overflow-y-auto">
          {CALL_BY_ID[selectedId] ? (
            <CallRecordingPlayer record={CALL_BY_ID[selectedId]} />
          ) : detailLoading ? (
            <InboxDetailMessagesSkeleton />
          ) : (
            <div className="px-6 py-5">
              <div className="mb-6 flex items-center justify-center">
                <span
                  className="relative z-10 bg-[#f5f6f8] px-3 text-[12px] text-[#999] dark:bg-[#13161b] dark:text-[#6b7280]"
                  style={{ fontWeight: 400 }}
                >
                  {detail.dateSeparator}
                </span>
              </div>

              {detail.messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <Composer textareaRef={composeTextareaRef} />
      </div>
      </div>
    </div>
  );
}