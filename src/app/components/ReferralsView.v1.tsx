import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Mail, Smartphone, Share2, Link2, Globe,
  Search, MapPin,
  CheckCircle2, Send, Gift,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Progress } from "@/app/components/ui/progress";
import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/app/components/ui/sheet";

/* ─── Types ─── */
type Channel = "email" | "sms" | "facebook" | "link" | "other";

interface ChannelBreakdown { channel: Channel; count: number; pct: number; }

interface StatCard {
  label: string;
  count: number;
  channels: ChannelBreakdown[];
}

interface SentRow {
  id: string; sentTo: string; via: Channel; code: string; sentOn: string;
}
interface SharedRow {
  id: string; sharedBy: string; via: Channel[]; code: string; sharedOn: string;
}
interface LeadRow {
  id: string; name: string; location: string;
  referredBy: string; code: string; createdOn: string;
  thanksSent: boolean; response: string;
}

const sentColumnHelper = createColumnHelper<SentRow>();
const sharedColumnHelper = createColumnHelper<SharedRow>();
const leadColumnHelper = createColumnHelper<LeadRow>();

/* ─── Mock data ─── */
const STATS: StatCard[] = [
  {
    label: "Referrals sent",
    count: 247,
    channels: [
      { channel: "email",    count: 104, pct: 42 },
      { channel: "sms",      count: 77,  pct: 31 },
      { channel: "facebook", count: 37,  pct: 15 },
      { channel: "link",     count: 20,  pct:  8 },
      { channel: "other",    count:  9,  pct:  4 },
    ],
  },
  {
    label: "Referrals shared",
    count: 89,
    channels: [
      { channel: "facebook", count: 46, pct: 52 },
      { channel: "email",    count: 21, pct: 24 },
      { channel: "sms",      count: 13, pct: 15 },
      { channel: "link",     count:  9, pct: 10 },
    ],
  },
  {
    label: "Leads generated",
    count: 34,
    channels: [
      { channel: "facebook", count: 18, pct: 53 },
      { channel: "email",    count: 10, pct: 29 },
      { channel: "sms",      count:  6, pct: 18 },
    ],
  },
];

const SENT_ROWS: SentRow[] = [
  { id: "1", sentTo: "John Smith",        via: "email",    code: "REF-2024-001", sentOn: "Mar 15, 2024" },
  { id: "2", sentTo: "Sarah Johnson",     via: "sms",      code: "REF-2024-002", sentOn: "Mar 14, 2024" },
  { id: "3", sentTo: "Michael Chen",      via: "email",    code: "REF-2024-003", sentOn: "Mar 14, 2024" },
  { id: "4", sentTo: "Emily Rodriguez",   via: "facebook", code: "REF-2024-004", sentOn: "Mar 13, 2024" },
  { id: "5", sentTo: "David Kim",         via: "sms",      code: "REF-2024-005", sentOn: "Mar 13, 2024" },
  { id: "6", sentTo: "Jennifer Lee",      via: "email",    code: "REF-2024-006", sentOn: "Mar 12, 2024" },
  { id: "7", sentTo: "Robert Martinez",   via: "link",     code: "REF-2024-007", sentOn: "Mar 12, 2024" },
  { id: "8", sentTo: "Amanda Taylor",     via: "facebook", code: "REF-2024-008", sentOn: "Mar 11, 2024" },
  { id: "9", sentTo: "Chris Patel",       via: "sms",      code: "REF-2024-009", sentOn: "Mar 10, 2024" },
  { id: "10", sentTo: "Monica Reyes",     via: "email",    code: "REF-2024-010", sentOn: "Mar 10, 2024" },
  { id: "11", sentTo: "Steven Brooks",    via: "link",     code: "REF-2024-011", sentOn: "Mar 9, 2024" },
  { id: "12", sentTo: "Hannah Scott",     via: "facebook", code: "REF-2024-012", sentOn: "Mar 9, 2024" },
  { id: "13", sentTo: "Brian O'Connor",   via: "email",    code: "REF-2024-013", sentOn: "Mar 8, 2024" },
  { id: "14", sentTo: "Priya Sharma",     via: "sms",      code: "REF-2024-014", sentOn: "Mar 8, 2024" },
  { id: "15", sentTo: "Ethan Woods",      via: "facebook", code: "REF-2024-015", sentOn: "Mar 7, 2024" },
  { id: "16", sentTo: "Laura Bennett",    via: "email",    code: "REF-2024-016", sentOn: "Mar 7, 2024" },
  { id: "17", sentTo: "Marcus Hale",      via: "link",     code: "REF-2024-017", sentOn: "Mar 6, 2024" },
  { id: "18", sentTo: "Sandra Lewis",     via: "sms",      code: "REF-2024-018", sentOn: "Mar 6, 2024" },
  { id: "19", sentTo: "Tyler Cross",      via: "email",    code: "REF-2024-019", sentOn: "Mar 5, 2024" },
  { id: "20", sentTo: "Nina Wallace",     via: "facebook", code: "REF-2024-020", sentOn: "Mar 5, 2024" },
];

const SHARED_ROWS: SharedRow[] = [
  { id: "1", sharedBy: "Lisa Park",       via: ["facebook", "email"], code: "REF-2024-001", sharedOn: "Mar 16, 2024" },
  { id: "2", sharedBy: "Tom Wilson",      via: ["facebook"],          code: "REF-2024-002", sharedOn: "Mar 15, 2024" },
  { id: "3", sharedBy: "Rachel Brown",    via: ["email"],             code: "REF-2024-003", sharedOn: "Mar 15, 2024" },
  { id: "4", sharedBy: "James Garcia",    via: ["sms"],               code: "REF-2024-004", sharedOn: "Mar 14, 2024" },
  { id: "5", sharedBy: "Megan Thompson",  via: ["facebook", "link"],  code: "REF-2024-005", sharedOn: "Mar 14, 2024" },
  { id: "6", sharedBy: "Kevin Anderson",  via: ["email", "sms"],      code: "REF-2024-006", sharedOn: "Mar 13, 2024" },
  { id: "7", sharedBy: "Olivia Tran",     via: ["link", "email"],     code: "REF-2024-007", sharedOn: "Mar 12, 2024" },
  { id: "8", sharedBy: "Daniel Price",    via: ["sms", "facebook"],   code: "REF-2024-008", sharedOn: "Mar 12, 2024" },
  { id: "9", sharedBy: "Grace Nolan",     via: ["facebook"],          code: "REF-2024-009", sharedOn: "Mar 11, 2024" },
  { id: "10", sharedBy: "Ryan Cooper",    via: ["email"],             code: "REF-2024-010", sharedOn: "Mar 11, 2024" },
  { id: "11", sharedBy: "Paula Nguyen",    via: ["sms", "link"],       code: "REF-2024-011", sharedOn: "Mar 10, 2024" },
  { id: "12", sharedBy: "Felix Morgan",    via: ["facebook", "sms"],   code: "REF-2024-012", sharedOn: "Mar 10, 2024" },
  { id: "13", sharedBy: "Tanya Ellis",     via: ["email", "facebook"], code: "REF-2024-013", sharedOn: "Mar 9, 2024" },
  { id: "14", sharedBy: "Jordan Miles",    via: ["link"],              code: "REF-2024-014", sharedOn: "Mar 9, 2024" },
];

const LEAD_ROWS: LeadRow[] = [
  { id: "1", name: "Alex Martinez",    location: "Austin, TX",      referredBy: "Lisa Park",      code: "REF-2024-001", createdOn: "Mar 17, 2024", thanksSent: true,  response: "" },
  { id: "2", name: "Rachel Brown",     location: "Houston, TX",     referredBy: "Tom Wilson",     code: "REF-2024-002", createdOn: "Mar 16, 2024", thanksSent: false, response: "Very interested in the service" },
  { id: "3", name: "Nicole Davis",     location: "Dallas, TX",      referredBy: "Rachel Brown",   code: "REF-2024-003", createdOn: "Mar 16, 2024", thanksSent: true,  response: "Love the product" },
  { id: "4", name: "Mark Johnson",     location: "San Antonio, TX", referredBy: "James Garcia",   code: "REF-2024-004", createdOn: "Mar 15, 2024", thanksSent: false, response: "" },
  { id: "5", name: "Jessica Williams", location: "Austin, TX",      referredBy: "Megan Thompson", code: "REF-2024-005", createdOn: "Mar 15, 2024", thanksSent: true,  response: "Can't wait to get started" },
  { id: "6", name: "Chris Patel",      location: "Fort Worth, TX",  referredBy: "Olivia Tran",    code: "REF-2024-007", createdOn: "Mar 14, 2024", thanksSent: false, response: "Asked about pricing tiers" },
  { id: "7", name: "Monica Reyes",     location: "Plano, TX",       referredBy: "Daniel Price",   code: "REF-2024-008", createdOn: "Mar 14, 2024", thanksSent: true,  response: "" },
  { id: "8", name: "Steven Brooks",    location: "Irving, TX",      referredBy: "Grace Nolan",    code: "REF-2024-009", createdOn: "Mar 13, 2024", thanksSent: false, response: "" },
  { id: "9", name: "Hannah Scott",     location: "McKinney, TX",    referredBy: "Ryan Cooper",    code: "REF-2024-010", createdOn: "Mar 13, 2024", thanksSent: true,  response: "Prefers weekday calls" },
  { id: "10", name: "Brian O'Connor",   location: "Frisco, TX",      referredBy: "Paula Nguyen",   code: "REF-2024-011", createdOn: "Mar 12, 2024", thanksSent: false, response: "" },
  { id: "11", name: "Priya Sharma",     location: "El Paso, TX",     referredBy: "Felix Morgan",   code: "REF-2024-012", createdOn: "Mar 12, 2024", thanksSent: true,  response: "" },
  { id: "12", name: "Ethan Woods",      location: "Arlington, TX",   referredBy: "Tanya Ellis",    code: "REF-2024-013", createdOn: "Mar 11, 2024", thanksSent: false, response: "Follow up next quarter" },
];

export type ReferralsSection = "sent" | "shared" | "leads";

export function referralsL2KeyToSection(l2Key: string): ReferralsSection {
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/leads`) return "leads";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/shared`) return "shared";
  return "sent";
}

/* ─── Helpers ─── */
const CHANNEL_META: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  email:    { label: "Email",    icon: Mail,        color: "text-foreground" },
  sms:      { label: "SMS",      icon: Smartphone,  color: "text-foreground" },
  facebook: { label: "Facebook", icon: Share2,      color: "text-foreground" },
  link:     { label: "Link",     icon: Link2,       color: "text-foreground" },
  other:    { label: "Other",    icon: Globe,       color: "text-foreground" },
};

function channelLabel(ch: Channel) {
  return CHANNEL_META[ch].label;
}

function channelLabelsList(channels: Channel[]) {
  return channels.map((ch) => channelLabel(ch)).join(", ");
}

/** Plain referral code text (matches table styling; no badge chrome). */
function ReferralCodeText({ code }: { code: string }) {
  return (
    <span className="font-mono text-[14px] tabular-nums text-[#2552ED] dark:text-[#2952E3]">
      {code}
    </span>
  );
}

/* ─── Stat card ─── */
function StatCard({ card }: { card: StatCard }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 flex-1 min-w-0">
      <div>
        <p className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
          {card.count.toLocaleString()}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">{card.label}</p>
      </div>
      <div className="flex flex-col gap-2">
        {card.channels.map(({ channel, count, pct }) => {
          const { icon: Icon, color } = CHANNEL_META[channel];
          return (
            <div key={channel} className="flex items-center gap-2">
              <Icon size={13} className={`shrink-0 ${color}`} strokeWidth={1} absoluteStrokeWidth />
              <Progress value={pct} className="h-1.5 flex-1 bg-muted" />
              <span className="text-[11px] tabular-nums text-muted-foreground w-[26px] text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Lead detail sheet ─── */
function LeadDetailSheet({ lead, open, onClose }: { lead: LeadRow | null; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[420px] sm:max-w-[420px] flex flex-col gap-6">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {lead.name}
                <Gift size={14} className="text-[#1E44CC]" strokeWidth={1} absoluteStrokeWidth />
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1 text-sm">
                <MapPin size={12} strokeWidth={1} absoluteStrokeWidth />
                {lead.location}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Referred by</span>
                <span className="text-foreground">{lead.referredBy}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Referral code</span>
                <ReferralCodeText code={lead.code} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created on</span>
                <span className="text-foreground">{lead.createdOn}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Thanks note</span>
                {lead.thanksSent ? (
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 size={14} strokeWidth={1} absoluteStrokeWidth />
                    Note sent
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="w-fit gap-1.5">
                    <Send size={13} strokeWidth={1} absoluteStrokeWidth />
                    Send thanks note
                  </Button>
                )}
              </div>
              {lead.response && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response</span>
                  <p className="text-foreground leading-relaxed">{lead.response}</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type ReferralsViewProps = {
  /** Driven by shell L2 (`ReferralsL2NavPanel`). */
  activeSection: ReferralsSection;
};

/* ═══════════════════════════════════════════
   ReferralsView — main export
   ═══════════════════════════════════════════ */
export function ReferralsView({ activeSection }: ReferralsViewProps) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  const columnSheetTitle = useMemo(() => {
    if (activeSection === "shared") return "Shared columns";
    if (activeSection === "leads") return "Lead columns";
    return "Sent columns";
  }, [activeSection]);

  useEffect(() => {
    setColumnSheetOpen(false);
  }, [activeSection]);
  const searchLc = search.toLowerCase();
  const filteredSent = SENT_ROWS.filter((r) => {
    if (!searchLc) return true;
    return (
      r.sentTo.toLowerCase().includes(searchLc) ||
      r.code.toLowerCase().includes(searchLc) ||
      channelLabel(r.via).toLowerCase().includes(searchLc)
    );
  });
  const filteredShared = SHARED_ROWS.filter((r) => {
    if (!searchLc) return true;
    const viaText = channelLabelsList(r.via).toLowerCase();
    return (
      r.sharedBy.toLowerCase().includes(searchLc) ||
      r.code.toLowerCase().includes(searchLc) ||
      viaText.includes(searchLc)
    );
  });
  const filteredLeads = LEAD_ROWS.filter((r) => {
    if (!searchLc) return true;
    return (
      r.name.toLowerCase().includes(searchLc) ||
      r.referredBy.toLowerCase().includes(searchLc) ||
      r.code.toLowerCase().includes(searchLc) ||
      r.location.toLowerCase().includes(searchLc)
    );
  });

  const openLead = useCallback((r: LeadRow) => {
    setSelectedLead(r);
  }, []);

  const sentColumns = useMemo(
    () => [
      sentColumnHelper.accessor("sentTo", {
        id: "sentTo",
        header: "Sent to",
        meta: { settingsLabel: "Sent to" },
        size: 220,
        enableSorting: true,
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      sentColumnHelper.accessor("via", {
        id: "via",
        header: "Sent via",
        meta: { settingsLabel: "Sent via" },
        size: 140,
        cell: (info) => (
          <span className="text-muted-foreground">{channelLabel(info.getValue())}</span>
        ),
      }),
      sentColumnHelper.accessor("code", {
        id: "code",
        header: "Referral code",
        meta: { settingsLabel: "Referral code" },
        size: 168,
        cell: (info) => <ReferralCodeText code={info.getValue()} />,
      }),
      sentColumnHelper.accessor("sentOn", {
        id: "sentOn",
        header: "Sent on",
        meta: { settingsLabel: "Sent on" },
        size: 160,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  const sharedColumns = useMemo(
    () => [
      sharedColumnHelper.accessor("sharedBy", {
        id: "sharedBy",
        header: "Shared by",
        meta: { settingsLabel: "Shared by" },
        size: 220,
        enableSorting: true,
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      sharedColumnHelper.accessor((row) => [...row.via].sort().join("|"), {
        id: "via",
        header: "Shared via",
        meta: { settingsLabel: "Shared via" },
        size: 200,
        sortingFn: "alphanumeric",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{channelLabelsList(row.original.via)}</span>
        ),
      }),
      sharedColumnHelper.accessor("code", {
        id: "code",
        header: "Referral code",
        meta: { settingsLabel: "Referral code" },
        size: 168,
        cell: (info) => <ReferralCodeText code={info.getValue()} />,
      }),
      sharedColumnHelper.accessor("sharedOn", {
        id: "sharedOn",
        header: "Shared on",
        meta: { settingsLabel: "Shared on" },
        size: 160,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  const leadColumns = useMemo(
    () => [
      leadColumnHelper.accessor("name", {
        id: "lead",
        header: "Lead",
        meta: { settingsLabel: "Lead" },
        size: 208,
        sortingFn: "alphanumeric",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 font-medium text-foreground">
                {r.name}
                <Gift size={11} className="text-[#1E44CC] dark:text-[#2952E3]" strokeWidth={1} absoluteStrokeWidth />
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={10} strokeWidth={1} absoluteStrokeWidth />
                {r.location}
              </span>
            </div>
          );
        },
      }),
      leadColumnHelper.accessor("referredBy", {
        id: "referredBy",
        header: "Referred by",
        meta: { settingsLabel: "Referred by" },
        size: 160,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      leadColumnHelper.accessor("code", {
        id: "code",
        header: "Referral code",
        meta: { settingsLabel: "Referral code" },
        size: 168,
        cell: (info) => <ReferralCodeText code={info.getValue()} />,
      }),
      leadColumnHelper.accessor("createdOn", {
        id: "createdOn",
        header: "Created on",
        meta: { settingsLabel: "Created on" },
        size: 144,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      leadColumnHelper.accessor((row) => (row.thanksSent ? 1 : 0), {
        id: "thanks",
        header: "Thanks note",
        meta: { settingsLabel: "Thanks note" },
        size: 128,
        sortingFn: "basic",
        cell: ({ row }) => {
          const r = row.original;
          return r.thanksSent ? (
            <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 size={13} strokeWidth={1} absoluteStrokeWidth />
              Sent
            </span>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 font-medium text-[#1E44CC] hover:underline dark:text-[#2952E3]"
              onClick={(e) => {
                e.stopPropagation();
                openLead(r);
              }}
            >
              <Send size={11} strokeWidth={1} absoluteStrokeWidth />
              Send note
            </button>
          );
        },
      }),
      leadColumnHelper.accessor("response", {
        id: "response",
        header: "Response",
        meta: { settingsLabel: "Response" },
        size: 200,
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className="block max-w-[200px] truncate text-muted-foreground">
              {v || <span className="text-muted-foreground/40">—</span>}
            </span>
          );
        },
      }),
    ],
    [openLead],
  );

  const referralsEmpty = (message: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const referralsSubline = `${STATS[0].count.toLocaleString()} referrals sent · ${STATS[1].count.toLocaleString()} shared · ${STATS[2].count.toLocaleString()} leads`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MainCanvasViewHeader
        title="Referrals"
        description={referralsSubline}
        actions={
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative h-[var(--button-height)] w-[240px]">
                <Search
                  className="pointer-events-none absolute left-2 top-1/2 size-[14px] -translate-y-1/2 text-[#303030] dark:text-[#8b92a5]"
                  strokeWidth={1}
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
                  placeholder="Search referrals"
                  className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#8b92a5]"
                  aria-label="Search referrals"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Open search"
                aria-expanded={false}
                title="Search referrals"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-[14px] w-[14px] text-[#303030] dark:text-[#8b92a5]" strokeWidth={1} absoluteStrokeWidth aria-hidden />
              </Button>
            )}
            <AppDataTableColumnSettingsTrigger
              sheetTitle={columnSheetTitle}
              onClick={() => setColumnSheetOpen(true)}
            />
          </div>
        }
      />

      {/* ─── Scrollable content ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

        {/* Stat cards */}
        <div className="flex gap-4">
          {STATS.map((card) => <StatCard key={card.label} card={card} />)}
        </div>

        {/* Table (section from L2) */}
        <div className="min-w-0 overflow-hidden">
          {activeSection === "sent" ? (
            <AppDataTable<SentRow>
              tableId="referrals.sent"
              data={filteredSent}
              columns={sentColumns}
              initialSorting={[{ id: "sentOn", desc: true }]}
              getRowId={(r) => r.id}
              emptyState={referralsEmpty("No referrals match your search.")}
              columnSheetTitle="Sent columns"
              className="min-w-0 px-0"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          ) : null}
          {activeSection === "shared" ? (
            <AppDataTable<SharedRow>
              tableId="referrals.shared"
              data={filteredShared}
              columns={sharedColumns}
              initialSorting={[{ id: "sharedOn", desc: true }]}
              getRowId={(r) => r.id}
              emptyState={referralsEmpty("No referrals match your search.")}
              columnSheetTitle="Shared columns"
              className="min-w-0 px-0"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          ) : null}
          {activeSection === "leads" ? (
            <AppDataTable<LeadRow>
              tableId="referrals.leads"
              data={filteredLeads}
              columns={leadColumns}
              initialSorting={[{ id: "createdOn", desc: true }]}
              getRowId={(r) => r.id}
              onRowClick={openLead}
              emptyState={referralsEmpty("No leads match your search.")}
              columnSheetTitle="Lead columns"
              className="min-w-0 px-0"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          ) : null}
        </div>
      </div>

      {/* Lead detail sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
