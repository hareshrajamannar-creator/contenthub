import { useCallback, useMemo, useState, type ElementType } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Search,
  MoreHorizontal,
  ListFilter,
  Mail,
  Phone,
  Globe,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  User,
  Tag,
  Paperclip,
  Archive,
  Flag,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import { cn } from "@/app/components/ui/utils";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/app/components/ui/tooltip";
import { Checkbox } from "@/app/components/ui/checkbox";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";

/* ─── Types ─── */
type TicketStatus   = "new" | "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "urgent" | "high" | "medium" | "low";
type TicketSource   = "email" | "phone" | "google" | "yelp" | "web_form" | "facebook";

interface TicketMessage {
  id: string;
  author: string;
  isAgent: boolean;
  body: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: TicketSource;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string | null;
  tags: string[];
  createdAt: string;
  lastActivity: string;
  replyCount: number;
  messages: TicketMessage[];
}

/* ─── Mock data ─── */
const TICKETS: Ticket[] = [
  {
    id: "TKT-1041",
    subject: "Unable to log into patient portal after password reset",
    contactName: "Lisa Monroe",
    contactEmail: "lisa.monroe@email.com",
    contactPhone: "(512) 555-0141",
    source: "email",
    status: "open",
    priority: "urgent",
    assignee: "Sarah Chen",
    tags: ["portal", "login"],
    createdAt: "Apr 13, 2026",
    lastActivity: "2h ago",
    replyCount: 3,
    messages: [
      { id: "m1", author: "Lisa Monroe",  isAgent: false, body: "Hi, I reset my password yesterday but still can't log in. It keeps saying 'invalid credentials' even though I'm sure the password is correct. I need access urgently as my prescription refill is due.", timestamp: "Apr 13, 9:14 am" },
      { id: "m2", author: "Sarah Chen",   isAgent: true,  body: "Hi Lisa, thanks for reaching out! I'm sorry to hear you're having trouble. Let me look into your account right away. Could you confirm which email address you used to register?", timestamp: "Apr 13, 9:32 am" },
      { id: "m3", author: "Lisa Monroe",  isAgent: false, body: "It's this email — lisa.monroe@email.com. I've tried resetting it twice now.", timestamp: "Apr 13, 10:05 am" },
      { id: "m4", author: "Sarah Chen",   isAgent: true,  body: "Thank you! I can see there was a sync issue with our auth system. I've manually cleared the session cache for your account. Please try logging in again now and let me know if it works.", timestamp: "Apr 13, 10:18 am" },
    ],
  },
  {
    id: "TKT-1040",
    subject: "Billing discrepancy on April invoice — overcharged by $240",
    contactName: "Tom Harrington",
    contactEmail: "t.harrington@company.com",
    contactPhone: "(512) 555-0182",
    source: "web_form",
    status: "in_progress",
    priority: "high",
    assignee: "Marcus Webb",
    tags: ["billing", "refund"],
    createdAt: "Apr 12, 2026",
    lastActivity: "5h ago",
    replyCount: 2,
    messages: [
      { id: "m1", author: "Tom Harrington", isAgent: false, body: "I just reviewed my April invoice (#INV-20041) and I was charged $480 when the agreed rate was $240. I've attached the original quote. Please advise on when I can expect a credit or refund.", timestamp: "Apr 12, 2:30 pm" },
      { id: "m2", author: "Marcus Webb",    isAgent: true,  body: "Hello Tom, I sincerely apologize for the billing error. I've flagged this to our finance team and they're reviewing invoice #INV-20041 now. We'll have an update for you within one business day.", timestamp: "Apr 12, 4:15 pm" },
    ],
  },
  {
    id: "TKT-1039",
    subject: "Google review removal request — fake 1-star review",
    contactName: "Aisha Rahman",
    contactEmail: "aisha.r@salon.com",
    contactPhone: "(512) 555-0109",
    source: "google",
    status: "new",
    priority: "high",
    assignee: null,
    tags: ["reviews", "google"],
    createdAt: "Apr 12, 2026",
    lastActivity: "8h ago",
    replyCount: 0,
    messages: [
      { id: "m1", author: "Aisha Rahman", isAgent: false, body: "We received a 1-star review from someone who has never visited our salon. The account was created the same day and has no other reviews. This appears to be a competitor attack. Can you help us flag this for removal through Google?", timestamp: "Apr 12, 11:00 am" },
    ],
  },
  {
    id: "TKT-1038",
    subject: "Appointment confirmation texts not being received",
    contactName: "Carlos Vega",
    contactEmail: "carlos@vegaauto.com",
    contactPhone: "(512) 555-0155",
    source: "phone",
    status: "open",
    priority: "medium",
    assignee: "Priya Nair",
    tags: ["sms", "appointments"],
    createdAt: "Apr 11, 2026",
    lastActivity: "1d ago",
    replyCount: 4,
    messages: [
      { id: "m1", author: "Carlos Vega", isAgent: false, body: "Our customers haven't been getting the appointment confirmation texts for the past 3 days. We've had 6 no-shows as a result. This is a major issue for our business.", timestamp: "Apr 11, 8:45 am" },
      { id: "m2", author: "Priya Nair",  isAgent: true,  body: "Hi Carlos, I completely understand the urgency. I'm checking the SMS delivery logs for your account now.", timestamp: "Apr 11, 9:00 am" },
      { id: "m3", author: "Carlos Vega", isAgent: false, body: "Please hurry — we have 12 appointments scheduled for tomorrow.", timestamp: "Apr 11, 9:30 am" },
      { id: "m4", author: "Priya Nair",  isAgent: true,  body: "I found the issue — your sending number was flagged by the carrier due to an unusual spike in outbound volume. I've submitted an appeal and updated your sending number to a clean long code. Texts should resume within the hour.", timestamp: "Apr 11, 10:15 am" },
    ],
  },
  {
    id: "TKT-1037",
    subject: "Feature request: bulk export for survey responses",
    contactName: "Fiona Blake",
    contactEmail: "fiona@cateringco.com",
    contactPhone: "(512) 555-0122",
    source: "email",
    status: "open",
    priority: "low",
    assignee: "James Osei",
    tags: ["feature-request", "surveys"],
    createdAt: "Apr 11, 2026",
    lastActivity: "1d ago",
    replyCount: 1,
    messages: [
      { id: "m1", author: "Fiona Blake", isAgent: false, body: "It would be incredibly helpful to be able to bulk export survey responses filtered by date range. Currently I have to export each survey individually which is very time-consuming. Is this something on the roadmap?", timestamp: "Apr 11, 3:00 pm" },
      { id: "m2", author: "James Osei",  isAgent: true,  body: "Hi Fiona, great feedback! I've logged this as a feature request with our product team. I'll make sure to follow up once we have a timeline for this.", timestamp: "Apr 11, 4:30 pm" },
    ],
  },
  {
    id: "TKT-1036",
    subject: "Yelp page showing wrong business hours",
    contactName: "David Park",
    contactEmail: "david@parkdentistry.com",
    contactPhone: "(512) 555-0177",
    source: "yelp",
    status: "resolved",
    priority: "medium",
    assignee: "Sarah Chen",
    tags: ["listings", "yelp"],
    createdAt: "Apr 9, 2026",
    lastActivity: "2d ago",
    replyCount: 3,
    messages: [
      { id: "m1", author: "David Park",  isAgent: false, body: "Our Yelp listing is showing we're open until 5pm on Saturdays but we actually close at 2pm. We've had customers showing up after hours and leaving negative reviews.", timestamp: "Apr 9, 9:00 am" },
      { id: "m2", author: "Sarah Chen",  isAgent: true,  body: "I've located your listing and can see the discrepancy. I'll push a correction through our listings sync tool now.", timestamp: "Apr 9, 9:30 am" },
      { id: "m3", author: "Sarah Chen",  isAgent: true,  body: "The update has been submitted to Yelp. Changes typically reflect within 24-48 hours. I'll monitor and confirm once it's live.", timestamp: "Apr 9, 10:00 am" },
    ],
  },
  {
    id: "TKT-1035",
    subject: "Account dashboard not loading — blank white screen",
    contactName: "Maria Santos",
    contactEmail: "maria@santoslegal.com",
    contactPhone: "(512) 555-0133",
    source: "facebook",
    status: "closed",
    priority: "urgent",
    assignee: "Marcus Webb",
    tags: ["bug", "dashboard"],
    createdAt: "Apr 8, 2026",
    lastActivity: "3d ago",
    replyCount: 5,
    messages: [
      { id: "m1", author: "Maria Santos", isAgent: false, body: "When I log in, the dashboard is just a blank white screen. I've tried Chrome and Firefox. This has been happening for 2 days.", timestamp: "Apr 8, 8:00 am" },
      { id: "m2", author: "Marcus Webb",  isAgent: true,  body: "Hi Maria, I'm sorry for the inconvenience. I've reproduced the issue on our end — it appears to be related to a recent browser cache conflict from our last deployment. Please try a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac).", timestamp: "Apr 8, 8:30 am" },
      { id: "m3", author: "Maria Santos", isAgent: false, body: "That worked! Thank you so much!", timestamp: "Apr 8, 9:00 am" },
    ],
  },
  {
    id: "TKT-1034",
    subject: "Request to add 3 new team members to account",
    contactName: "James Okafor",
    contactEmail: "james@okaforlaw.com",
    contactPhone: "(512) 555-0194",
    source: "email",
    status: "new",
    priority: "low",
    assignee: null,
    tags: ["account", "users"],
    createdAt: "Apr 13, 2026",
    lastActivity: "30m ago",
    replyCount: 0,
    messages: [
      { id: "m1", author: "James Okafor", isAgent: false, body: "We've grown our team and would like to add 3 new members to our Birdeye account. Their details are:\n1. Karen Hill — karen@okaforlaw.com — Manager\n2. Ben Foster — ben@okaforlaw.com — Staff\n3. Rita Osei — rita@okaforlaw.com — Staff\n\nPlease confirm once they've been added.", timestamp: "Apr 13, 11:30 am" },
    ],
  },
  {
    id: "TKT-1033",
    subject: "Duplicate charges appearing on patient statements",
    contactName: "Nina Patel",
    contactEmail: "nina.patel@wellspringclinic.org",
    contactPhone: "(512) 555-0201",
    source: "email",
    status: "in_progress",
    priority: "high",
    assignee: "Priya Nair",
    tags: ["billing", "statements"],
    createdAt: "Apr 13, 2026",
    lastActivity: "45m ago",
    replyCount: 2,
    messages: [
      { id: "m1", author: "Nina Patel", isAgent: false, body: "Several patients reported seeing the same line item twice on their emailed statements for visits on Apr 10. Can you confirm whether this is a display bug or actual double posting?", timestamp: "Apr 13, 10:10 am" },
      { id: "m2", author: "Priya Nair", isAgent: true, body: "Thanks Nina — I'm pulling ledger exports for Apr 10 now and will compare against the statement renderer. I'll update you within the hour.", timestamp: "Apr 13, 10:22 am" },
    ],
  },
  {
    id: "TKT-1032",
    subject: "Review widget not showing on Safari (iOS)",
    contactName: "Owen Fields",
    contactEmail: "owen@fieldsplumbing.com",
    contactPhone: "(512) 555-0208",
    source: "web_form",
    status: "open",
    priority: "medium",
    assignee: "James Osei",
    tags: ["widget", "safari"],
    createdAt: "Apr 12, 2026",
    lastActivity: "3h ago",
    replyCount: 1,
    messages: [
      { id: "m1", author: "Owen Fields", isAgent: false, body: "The embedded review widget loads fine on Chrome desktop but on Safari iOS it shows an empty box. Happens on our homepage and contact page.", timestamp: "Apr 12, 4:40 pm" },
    ],
  },
  {
    id: "TKT-1031",
    subject: "Wrong photo on Google Business Profile",
    contactName: "Helena Ruiz",
    contactEmail: "helena@ruizdental.com",
    contactPhone: "(512) 555-0214",
    source: "google",
    status: "new",
    priority: "low",
    assignee: null,
    tags: ["listings", "photos"],
    createdAt: "Apr 12, 2026",
    lastActivity: "6h ago",
    replyCount: 0,
    messages: [
      { id: "m1", author: "Helena Ruiz", isAgent: false, body: "Google is showing an old storefront photo from before our renovation. We've uploaded new photos in the dashboard but the cover image hasn't changed after 48 hours.", timestamp: "Apr 12, 1:15 pm" },
    ],
  },
  {
    id: "TKT-1030",
    subject: "Callback requested — unhappy patient (voicemail)",
    contactName: "Marcus Webb",
    contactEmail: "marcus.webb@birdeye.com",
    contactPhone: "(512) 555-0001",
    source: "phone",
    status: "open",
    priority: "urgent",
    assignee: "Sarah Chen",
    tags: ["escalation", "callback"],
    createdAt: "Apr 12, 2026",
    lastActivity: "20m ago",
    replyCount: 1,
    messages: [
      { id: "m1", author: "Marcus Webb", isAgent: true, body: "Internal note: front desk left voicemail for escalation — patient upset about survey timing after a root canal. Please call back before 5pm local.", timestamp: "Apr 12, 5:50 pm" },
    ],
  },
  {
    id: "TKT-1029",
    subject: "Facebook Messenger leads not syncing to CRM",
    contactName: "Priya Nair",
    contactEmail: "priya@example-auto.com",
    contactPhone: "(512) 555-0220",
    source: "facebook",
    status: "resolved",
    priority: "medium",
    assignee: "Marcus Webb",
    tags: ["integration", "crm"],
    createdAt: "Apr 11, 2026",
    lastActivity: "4d ago",
    replyCount: 4,
    messages: [
      { id: "m1", author: "Priya Nair", isAgent: false, body: "Messenger conversations from the last week are not appearing in HubSpot. Web form leads still sync normally.", timestamp: "Apr 11, 9:05 am" },
      { id: "m2", author: "Marcus Webb", isAgent: true, body: "I see the connector paused due to an expired page token. I've re-authorized the Facebook page and replayed the missed window.", timestamp: "Apr 11, 9:40 am" },
      { id: "m3", author: "Priya Nair", isAgent: false, body: "Confirmed — new tests are landing in HubSpot. Thank you!", timestamp: "Apr 11, 10:02 am" },
      { id: "m4", author: "Marcus Webb", isAgent: true, body: "Great — I'll close this out once you verify historical messages imported.", timestamp: "Apr 11, 10:08 am" },
    ],
  },
  {
    id: "TKT-1028",
    subject: "Yelp review response rejected — policy question",
    contactName: "Samir Khan",
    contactEmail: "samir@khanortho.com",
    contactPhone: "(512) 555-0226",
    source: "yelp",
    status: "in_progress",
    priority: "low",
    assignee: "James Osei",
    tags: ["reviews", "yelp"],
    createdAt: "Apr 10, 2026",
    lastActivity: "5d ago",
    replyCount: 2,
    messages: [
      { id: "m1", author: "Samir Khan", isAgent: false, body: "Yelp rejected our public response to a 2-star review citing 'solicitation'. We didn't include any links — can you help us revise wording to comply?", timestamp: "Apr 10, 11:20 am" },
      { id: "m2", author: "James Osei", isAgent: true, body: "I'll draft a neutral, HIPAA-safe reply and run it through our Yelp policy checklist before you publish.", timestamp: "Apr 10, 2:05 pm" },
    ],
  },
  {
    id: "TKT-1027",
    subject: "Email digest frequency — change to weekly",
    contactName: "Elena Vogt",
    contactEmail: "elena.vogt@northlakefit.com",
    contactPhone: "(512) 555-0231",
    source: "email",
    status: "closed",
    priority: "low",
    assignee: "Sarah Chen",
    tags: ["notifications", "preferences"],
    createdAt: "Apr 9, 2026",
    lastActivity: "1w ago",
    replyCount: 2,
    messages: [
      { id: "m1", author: "Elena Vogt", isAgent: false, body: "Please switch our executive summary emails from daily to weekly. Too noisy for our leadership team.", timestamp: "Apr 9, 8:30 am" },
      { id: "m2", author: "Sarah Chen", isAgent: true, body: "Updated your org preferences to weekly on Mondays 8am local. Let me know if you'd like a different day.", timestamp: "Apr 9, 8:45 am" },
    ],
  },
  {
    id: "TKT-1026",
    subject: "Web form spam spike from same IP range",
    contactName: "Jordan Lee",
    contactEmail: "jordan@leeinsurance.com",
    contactPhone: "(512) 555-0238",
    source: "web_form",
    status: "open",
    priority: "high",
    assignee: "Priya Nair",
    tags: ["spam", "security"],
    createdAt: "Apr 9, 2026",
    lastActivity: "2d ago",
    replyCount: 1,
    messages: [
      { id: "m1", author: "Jordan Lee", isAgent: false, body: "We're getting dozens of fake quote requests per hour from similar gibberish names. Can you enable stricter captcha or IP throttling on our public form?", timestamp: "Apr 9, 3:10 pm" },
    ],
  },
  {
    id: "TKT-1025",
    subject: "Google Q&A — outdated answer still pinned",
    contactName: "Riley Brooks",
    contactEmail: "riley@brooksspa.com",
    contactPhone: "(512) 555-0244",
    source: "google",
    status: "new",
    priority: "medium",
    assignee: null,
    tags: ["listings", "q-and-a"],
    createdAt: "Apr 8, 2026",
    lastActivity: "12h ago",
    replyCount: 0,
    messages: [
      { id: "m1", author: "Riley Brooks", isAgent: false, body: "Someone answered a question about parking with info from 2019. We've moved locations since then and it's confusing customers.", timestamp: "Apr 8, 2:00 pm" },
    ],
  },
  {
    id: "TKT-1024",
    subject: "Phone tree greeting transcript mismatch",
    contactName: "Casey Nguyen",
    contactEmail: "casey@nguyenlegal.com",
    contactPhone: "(512) 555-0250",
    source: "phone",
    status: "resolved",
    priority: "low",
    assignee: "Marcus Webb",
    tags: ["voice", "ivr"],
    createdAt: "Apr 7, 2026",
    lastActivity: "1w ago",
    replyCount: 3,
    messages: [
      { id: "m1", author: "Casey Nguyen", isAgent: false, body: "The transcript in the ticket shows our old office address in the auto-attendant script even though we updated it in the portal last month.", timestamp: "Apr 7, 10:00 am" },
      { id: "m2", author: "Marcus Webb", isAgent: true, body: "Found a cached audio asset on the carrier side. I've forced a refresh and validated the new greeting in staging.", timestamp: "Apr 7, 11:30 am" },
      { id: "m3", author: "Casey Nguyen", isAgent: false, body: "Sounds correct now on test calls. Appreciate the quick fix.", timestamp: "Apr 7, 12:05 pm" },
    ],
  },
];

/* ─── Config ─── */
/** Outline status pills aligned with campaign directory styling (text only, no icon). */
const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  new:         { label: "New",         className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  open:        { label: "Open",        className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  in_progress: { label: "In progress", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
  resolved:    { label: "Resolved",    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  closed:      { label: "Closed",      className: "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400" },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; dot: string }> = {
  urgent: { label: "Urgent", dot: "bg-red-500" },
  high:   { label: "High",   dot: "bg-orange-400" },
  medium: { label: "Medium", dot: "bg-blue-400" },
  low:    { label: "Low",    dot: "bg-slate-300" },
};

const SOURCE_CONFIG: Record<TicketSource, { icon: ElementType; label: string }> = {
  email:    { icon: Mail,          label: "Email" },
  phone:    { icon: Phone,         label: "Phone" },
  google:   { icon: Globe,         label: "Google" },
  yelp:     { icon: Star,          label: "Yelp" },
  web_form: { icon: Globe,         label: "Web form" },
  facebook: { icon: MessageSquare, label: "Facebook" },
};

function ticketPreview(body: string | undefined) {
  if (!body) return "—";
  return body.length > 120 ? `${body.slice(0, 120)}…` : body;
}

function ChannelBadge({ source }: { source: TicketSource }) {
  const cfg = SOURCE_CONFIG[source];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className="gap-1 bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
      <Icon size={9} strokeWidth={1.6} absoluteStrokeWidth />
      {cfg.label}
    </Badge>
  );
}

/* ─── Ticket detail sheet ─── */
function TicketDetailSheet({
  ticket,
  open,
  onClose,
}: {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
}) {
  const [reply, setReply] = useState("");

  if (!ticket) return null;
  const statusCfg   = STATUS_CONFIG[ticket.status];
  const priorityCfg = PRIORITY_CONFIG[ticket.priority];

  const replyComposer = (
    <div className="w-full">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply…"
        rows={3}
        className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <Paperclip size={14} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {ticket.status !== "resolved" && (
            <Button variant="outline" size="sm" className="h-7 cursor-pointer gap-2 text-xs">
              <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth />
              Resolve
            </Button>
          )}
          <Button size="sm" className="h-7 cursor-pointer gap-2 text-xs" disabled={!reply.trim()}>
            <Send size={12} strokeWidth={1.6} absoluteStrokeWidth />
            Send reply
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="lg"
        className={cn(FLOATING_SHEET_FRAME_CONTENT_CLASS, "flex flex-col")}
      >
        <FloatingSheetFrame
          title={
            <>
              <span className="block font-mono text-[11px] font-normal tracking-normal text-muted-foreground">
                {ticket.id}
              </span>
              <span className="mt-1 block text-base font-normal leading-snug tracking-normal text-foreground">
                {ticket.subject}
              </span>
              <span className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusCfg.className}>
                  {statusCfg.label}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${priorityCfg.dot}`} />
                  {priorityCfg.label}
                </span>
                <ChannelBadge source={ticket.source} />
                {ticket.assignee ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <User size={11} strokeWidth={1.6} absoluteStrokeWidth />
                    {ticket.assignee}
                  </span>
                ) : null}
              </span>
              {ticket.tags.length > 0 ? (
                <span className="mt-2 flex flex-wrap gap-2">
                  {ticket.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <Tag size={8} strokeWidth={1.6} absoluteStrokeWidth />
                      {t}
                    </span>
                  ))}
                </span>
              ) : null}
              <span className="sr-only">
                {`Contact ${ticket.contactName}, ${ticket.contactEmail}.`}
              </span>
            </>
          }
          classNames={{
            root: "min-h-0 flex-1",
            header: "border-b border-border",
            body: "px-6 pt-0 pb-4",
            footer:
              "flex w-full flex-col items-stretch justify-start gap-0 border-t border-border sm:flex-col",
          }}
          footer={replyComposer}
        >
          <div className="sticky top-0 z-[1] -mx-6 mb-4 border-b border-border bg-muted/20 px-6 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{ticket.contactName}</span>
              <span>{ticket.contactEmail}</span>
              <span>{ticket.contactPhone}</span>
              <span className="ml-auto">{ticket.createdAt}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${msg.isAgent ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={`font-medium ${msg.isAgent ? "text-primary" : "text-foreground"}`}
                  >
                    {msg.author}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.isAgent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

const ticketColumnHelper = createColumnHelper<Ticket>();

/* ─── Tickets directory table ─── */
function TicketsTable({
  tickets,
  selectedIds,
  allFilteredSelected,
  onToggleSelect,
  onToggleAll,
  onRowClick,
  columnSheetOpen,
  onColumnSheetOpenChange,
}: {
  tickets: Ticket[];
  selectedIds: Set<string>;
  allFilteredSelected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleAll: () => void;
  onRowClick: (t: Ticket) => void;
  columnSheetOpen: boolean;
  onColumnSheetOpenChange: (open: boolean) => void;
}) {
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare size={28} strokeWidth={1.4} absoluteStrokeWidth className="mb-3 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">No tickets found</p>
      <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters.</p>
    </div>
  );

  const columns = useMemo(
    () => [
      ticketColumnHelper.display({
        id: "select",
        header: () => (
          <Checkbox
            checked={
              allFilteredSelected
                ? true
                : tickets.length > 0 && tickets.some((t) => selectedIds.has(t.id))
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={() => onToggleAll()}
            className="cursor-pointer"
            aria-label="Select all tickets on this page"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        meta: { settingsLabel: "Select", stopRowClick: true },
        size: 44,
        minSize: 44,
        maxSize: 52,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => {
          const id = row.original.id;
          const checked = selectedIds.has(id);
          return (
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => onToggleSelect(id, v === true)}
              className="cursor-pointer"
              aria-label={`Select ticket ${id}`}
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
      }),
      ticketColumnHelper.display({
        id: "contact",
        header: "Contact",
        meta: { settingsLabel: "Contact & ID" },
        size: 200,
        minSize: 160,
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          rowA.original.contactName.localeCompare(rowB.original.contactName),
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium text-foreground">{t.contactName}</span>
              <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
            </div>
          );
        },
      }),
      ticketColumnHelper.display({
        id: "subject",
        header: "Subject",
        meta: { settingsLabel: "Subject & preview" },
        size: 320,
        minSize: 220,
        enableSorting: true,
        sortingFn: (rowA, rowB) => rowA.original.subject.localeCompare(rowB.original.subject),
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="line-clamp-2 text-sm font-medium text-foreground">{t.subject}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{ticketPreview(t.messages[0]?.body)}</span>
            </div>
          );
        },
      }),
      ticketColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 128,
        enableSorting: true,
        cell: (info) => {
          const statusCfg = STATUS_CONFIG[info.getValue()];
          return <Badge variant="outline" className={statusCfg.className}>{statusCfg.label}</Badge>;
        },
      }),
      ticketColumnHelper.accessor("source", {
        id: "channel",
        header: "Channel",
        meta: { settingsLabel: "Channel" },
        size: 132,
        enableSorting: true,
        cell: (info) => <ChannelBadge source={info.getValue()} />,
      }),
      ticketColumnHelper.accessor("assignee", {
        id: "assignee",
        header: "Assignee",
        meta: { settingsLabel: "Assignee" },
        size: 140,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.assignee ?? "";
          const b = rowB.original.assignee ?? "";
          return a.localeCompare(b);
        },
        cell: (info) => {
          const name = info.getValue();
          return name ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <User size={12} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" />
              <span className="truncate">{name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      }),
      ticketColumnHelper.display({
        id: "tags",
        header: "Tags",
        meta: { settingsLabel: "Tags" },
        size: 200,
        minSize: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const tags = row.original.tags;
          if (!tags.length) return <span className="text-muted-foreground">—</span>;
          const max = 4;
          const shown = tags.slice(0, max);
          const rest = tags.length - shown.length;
          return (
            <div className="flex min-w-0 flex-wrap gap-2">
              {shown.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex max-w-full items-center gap-1 truncate rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  <Tag size={8} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" />
                  {tag}
                </span>
              ))}
              {rest > 0 ? (
                <span className="text-[10px] text-muted-foreground">+{rest}</span>
              ) : null}
            </div>
          );
        },
      }),
      ticketColumnHelper.accessor("lastActivity", {
        id: "lastActivity",
        header: "Activity",
        meta: { settingsLabel: "Last activity" },
        size: 100,
        enableSorting: true,
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      ticketColumnHelper.accessor("replyCount", {
        id: "replies",
        header: "Replies",
        meta: { settingsLabel: "Replies" },
        size: 88,
        enableSorting: true,
        cell: (info) => {
          const n = info.getValue();
          return (
            <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
              <MessageSquare size={12} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" />
              {n}
            </span>
          );
        },
      }),
    ],
    [allFilteredSelected, onToggleAll, onToggleSelect, selectedIds],
  );

  return (
    <AppDataTable<Ticket>
      tableId="ticketing.directory"
      data={tickets}
      columns={columns}
      initialSorting={[{ id: "contact", desc: false }]}
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      isRowSelected={(row) => selectedIds.has(row.id)}
      emptyState={emptyState}
      columnSheetTitle="Ticket columns"
      className="min-h-0 min-w-0 flex-1 px-0"
      hideColumnsButton
      columnSheetOpen={columnSheetOpen}
      onColumnSheetOpenChange={onColumnSheetOpenChange}
      stickyLeadingColumnCount={2}
    />
  );
}

/* ─── Main view ─── */
export function TicketingView() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const filtered = useMemo(
    () =>
      TICKETS.filter((t) => {
        const q = search.toLowerCase();
        const matchesSearch =
          t.subject.toLowerCase().includes(q) ||
          t.contactName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q));
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [search, statusFilter, priorityFilter],
  );

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = filtered.length > 0 && filtered.every((t) => prev.has(t.id));
      if (allSelected) return new Set();
      return new Set(filtered.map((t) => t.id));
    });
  }, [filtered]);

  const openTicket = useCallback((t: Ticket) => {
    setSelectedTicket(t);
    setSheetOpen(true);
  }, []);

  const STATUS_OPTS: { label: string; value: TicketStatus | "all" }[] = [
    { label: "All status",  value: "all" },
    { label: "New",         value: "new" },
    { label: "Open",        value: "open" },
    { label: "In progress", value: "in_progress" },
    { label: "Resolved",    value: "resolved" },
    { label: "Closed",      value: "closed" },
  ];

  const PRIORITY_OPTS: { label: string; value: TicketPriority | "all" }[] = [
    { label: "All priority", value: "all" },
    { label: "Urgent",       value: "urgent" },
    { label: "High",         value: "high" },
    { label: "Medium",       value: "medium" },
    { label: "Low",          value: "low" },
  ];

  const newCount = TICKETS.filter((t) => t.status === "new").length;
  const openCount = TICKETS.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const activeStatusLabel =
    STATUS_OPTS.find((o) => o.value === statusFilter)?.label ?? "All status";
  const activePriorityLabel =
    PRIORITY_OPTS.find((o) => o.value === priorityFilter)?.label ?? "All priority";

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col overflow-hidden">
        <MainCanvasViewHeader
          title="Tickets"
          description={`${newCount} new · ${openCount} open`}
          actions={
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <div className="relative h-[var(--button-height)] w-[min(100%,240px)] min-w-[200px] shrink">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2 size-[14px] -translate-y-1/2 text-[#303030] dark:text-[#8b92a5]"
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => {
                      if (search === "") setSearchOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearch("");
                        setSearchOpen(false);
                      }
                    }}
                    autoFocus
                    placeholder="Search tickets"
                    className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#8b92a5]"
                    aria-label="Search tickets"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open search"
                  title="Search tickets"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="size-[14px] text-[#303030] dark:text-[#8b92a5]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Status: ${activeStatusLabel}`}
                    title={`Status: ${activeStatusLabel}`}
                  >
                    <ListFilter className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {STATUS_OPTS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      className="cursor-pointer text-xs"
                      onClick={() => setStatusFilter(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Priority: ${activePriorityLabel}`}
                    title={`Priority: ${activePriorityLabel}`}
                  >
                    <Flag className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {PRIORITY_OPTS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      className="cursor-pointer text-xs"
                      onClick={() => setPriorityFilter(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <AppDataTableColumnSettingsTrigger
                sheetTitle="Ticket columns"
                onClick={() => setColumnSheetOpen(true)}
              />
              <Button type="button" variant="outline" size="icon" aria-label="More options" title="More options">
                <MoreHorizontal className="size-[14px] text-[#303030] dark:text-[#8b92a5]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-6 mb-6 flex min-h-0 flex-1 flex-col">
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background">
              <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
                <Checkbox
                  checked={
                    allFilteredSelected
                      ? true
                      : filtered.length > 0 && filtered.some((t) => selectedIds.has(t.id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={() => toggleAll()}
                  className="cursor-pointer"
                  aria-label="Select all tickets on this page"
                />
                {selectedIds.size > 0 ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <CheckCircle2 className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <User className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                      Assign
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <Archive className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                      Close
                    </Button>
                  </div>
                ) : (
                  <span className="min-w-0 flex-1" aria-hidden />
                )}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-auto">
                  <TicketsTable
                    tickets={filtered}
                    selectedIds={selectedIds}
                    allFilteredSelected={allFilteredSelected}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleAll}
                    onRowClick={openTicket}
                    columnSheetOpen={columnSheetOpen}
                    onColumnSheetOpenChange={setColumnSheetOpen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ticket detail sheet ── */}
        <TicketDetailSheet
          ticket={selectedTicket}
          open={sheetOpen}
          onClose={() => { setSheetOpen(false); setSelectedTicket(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
