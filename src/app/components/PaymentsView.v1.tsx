import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Download, Search, MoreVertical,
  CheckCircle2, X, RotateCcw, FileText, Tags, Filter,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/app/components/ui/dialog";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";

/* ─── Types ─── */
export type TxStatus = "received" | "requested" | "not_paid" | "refunded" | "cancelled";

export type PaymentsStatusFilter = TxStatus | "all";

export function paymentsL2KeyToStatusFilter(l2Key: string): PaymentsStatusFilter {
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/received`) return "received";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/requested`) return "requested";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/not_paid`) return "not_paid";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/refunded`) return "refunded";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/cancelled`) return "cancelled";
  return "all";
}

const PAYMENT_STATUS_FILTER_OPTS: { label: string; value: PaymentsStatusFilter }[] = [
  { label: "All statuses", value: "all" },
  { label: "Received", value: "received" },
  { label: "Requested", value: "requested" },
  { label: "Not paid", value: "not_paid" },
  { label: "Refunded", value: "refunded" },
  { label: "Cancelled", value: "cancelled" },
];

type PaymentTagsQuickFilter = "all" | "unsettled";
const PAYMENT_TAGS_QUICK_OPTS: { label: string; value: PaymentTagsQuickFilter }[] = [
  { label: "All payments", value: "all" },
  { label: "Unsettled only", value: "unsettled" },
];

interface Transaction {
  id: string;
  contactName: string;
  businessName: string;
  amount: number;
  status: TxStatus;
  date: string;
  description: string;
}

type ModalType = "cancel" | "mark_paid" | "refund" | "invoice" | null;

/* ─── Mock data ─── */
const PIE_DATA = [
  { name: "Received",  value: 68, color: "var(--chart-2)" },
  { name: "Not paid",  value: 21, color: "var(--chart-4)" },
  { name: "Refunded",  value: 11, color: "var(--chart-5)" },
];

const TOTAL_REQUESTED = 142_800;

const METRIC_BLOCKS: { label: string; value: string }[] = [
  { label: "Available balance", value: "$4,218.00" },
  { label: "Net earnings", value: "$97,104.00" },
  { label: "Paid out", value: "$92,886.00" },
  { label: "Monthly bill", value: "$349.00" },
];

const TRANSACTIONS: Transaction[] = [
  { id: "t1",  contactName: "Sarah Johnson",    businessName: "Johnson Dental",      amount: 320.00,  status: "received",   date: "Apr 12, 2026", description: "Teeth cleaning + X-ray" },
  { id: "t2",  contactName: "Marcus Webb",       businessName: "Webb Auto Repair",    amount: 1_450.00, status: "not_paid",  date: "Apr 11, 2026", description: "Engine diagnostic & repair" },
  { id: "t3",  contactName: "Priya Nair",        businessName: "Nair Law Group",      amount: 800.00,  status: "received",   date: "Apr 10, 2026", description: "Consultation retainer" },
  { id: "t4",  contactName: "Derek Osei",        businessName: "Osei Landscaping",    amount: 550.00,  status: "refunded",   date: "Apr 9, 2026",  description: "Spring lawn service" },
  { id: "t5",  contactName: "Amelia Torres",     businessName: "Torres HVAC",         amount: 2_200.00, status: "received",  date: "Apr 8, 2026",  description: "AC unit installation" },
  { id: "t6",  contactName: "Raj Patel",         businessName: "Patel Pharmacy",      amount: 145.00,  status: "requested",  date: "Apr 7, 2026",  description: "Prescription & vitamins" },
  { id: "t7",  contactName: "Linda Kraft",       businessName: "Kraft Catering",      amount: 3_800.00, status: "received",  date: "Apr 6, 2026",  description: "Corporate event catering" },
  { id: "t8",  contactName: "Noah Chambers",     businessName: "Chambers Plumbing",   amount: 420.00,  status: "cancelled",  date: "Apr 5, 2026",  description: "Pipe repair – guest bath" },
  { id: "t9",  contactName: "Fatima Al-Rashid",  businessName: "Al-Rashid Salon",     amount: 220.00,  status: "received",   date: "Apr 4, 2026",  description: "Hair colour & treatment" },
  { id: "t10", contactName: "George Brennan",    businessName: "Brennan Roofing",     amount: 6_500.00, status: "not_paid",  date: "Apr 3, 2026",  description: "Full roof replacement" },
  { id: "t11", contactName: "Mei-Ling Chen",     businessName: "Chen Acupuncture",    amount: 180.00,  status: "received",   date: "Apr 2, 2026",  description: "Initial assessment" },
  { id: "t12", contactName: "Samuel Okonkwo",    businessName: "Okonkwo Electric",    amount: 950.00,  status: "refunded",   date: "Apr 1, 2026",  description: "Panel upgrade – partial refund" },
  { id: "t13", contactName: "Elena Vasquez",     businessName: "Vasquez Realty",      amount: 275.00,  status: "received",   date: "Mar 31, 2026", description: "Listing photography package" },
  { id: "t14", contactName: "James Whitmore",    businessName: "Whitmore Fitness",    amount: 129.00,  status: "requested",  date: "Mar 30, 2026", description: "Annual membership renewal" },
  { id: "t15", contactName: "Sofia Nielsen",     businessName: "Nielsen Books",       amount: 88.50,   status: "received",   date: "Mar 29, 2026", description: "Inventory restock order" },
  { id: "t16", contactName: "Carlos Mendez",     businessName: "Mendez Tile",         amount: 3_120.00, status: "not_paid",  date: "Mar 28, 2026", description: "Kitchen backsplash install" },
  { id: "t17", contactName: "Yuki Tanaka",       businessName: "Tanaka Sushi",        amount: 412.00,  status: "received",   date: "Mar 27, 2026", description: "Corporate lunch catering" },
  { id: "t18", contactName: "Olivia Grant",      businessName: "Grant Interiors",     amount: 1_890.00, status: "received",  date: "Mar 26, 2026", description: "Design consultation + samples" },
  { id: "t19", contactName: "Hassan Ibrahim",    businessName: "Ibrahim Motors",      amount: 780.00,  status: "cancelled",  date: "Mar 25, 2026", description: "Brake service – cancelled" },
  { id: "t20", contactName: "Rachel Simmons",    businessName: "Simmons Pet Grooming", amount: 95.00,  status: "received",   date: "Mar 24, 2026", description: "Full groom – large breed" },
  { id: "t21", contactName: "Victor Nguyen",     businessName: "Nguyen Dental Lab",   amount: 560.00,  status: "requested",  date: "Mar 23, 2026", description: "Crown fabrication rush" },
  { id: "t22", contactName: "Denise Brooks",     businessName: "Brooks Cleaning Co.", amount: 340.00,  status: "received",   date: "Mar 22, 2026", description: "Deep clean – 3 BR home" },
  { id: "t23", contactName: "Ahmed Farouk",      businessName: "Farouk Electronics",  amount: 125.00,  status: "not_paid",   date: "Mar 21, 2026", description: "Phone screen repair" },
  { id: "t24", contactName: "Camille Dubois",    businessName: "Dubois Bakery",       amount: 210.00,  status: "received",   date: "Mar 20, 2026", description: "Wedding cake deposit" },
];

/* ─── Helpers ─── */
const STATUS_CONFIG: Record<TxStatus, { label: string; className: string }> = {
  received:   { label: "Received",   className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  requested:  { label: "Requested",  className: "bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-400" },
  not_paid:   { label: "Not paid",   className: "bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-400" },
  refunded:   { label: "Refunded",   className: "bg-slate-50  text-slate-600  dark:bg-slate-800/40  dark:text-slate-400" },
  cancelled:  { label: "Cancelled",  className: "bg-red-50    text-red-600    dark:bg-red-950/40    dark:text-red-400" },
};

function StatusBadge({ status }: { status: TxStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

function fmtAmount(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Muted summary copy in the payments strip (12px — collected line, Received / Not paid / Refunded, metric labels). */
const SUMMARY_STRIP_COPY = "text-[12px] font-medium leading-tight text-muted-foreground";

/* ─── Single summary strip (no donut / separate metric cards) ─── */
function PaymentsSummaryStrip() {
  const receivedPct = PIE_DATA[0].value;

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 shrink-0 lg:max-w-[min(100%,380px)]">
          <p className={SUMMARY_STRIP_COPY}>Total requested</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {fmtAmount(TOTAL_REQUESTED)}
          </p>
          <p className={`mt-1 ${SUMMARY_STRIP_COPY}`}>{receivedPct}% collected</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {PIE_DATA.map((d) => (
              <div
                key={d.name}
                className={`flex items-center gap-2 ${SUMMARY_STRIP_COPY}`}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: d.color }}
                  aria-hidden
                />
                <span>{d.name}</span>
                <span className="font-medium tabular-nums text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:justify-items-stretch lg:gap-x-8">
          {METRIC_BLOCKS.map((m) => (
            <div key={m.label} className="flex min-w-0 flex-col gap-1">
              <span className={`${SUMMARY_STRIP_COPY} min-w-0`}>{m.label}</span>
              <span className="text-xl font-semibold tabular-nums text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Transaction actions ─── */
function TxActions({
  tx,
  onAction,
}: {
  tx: Transaction;
  onAction: (type: ModalType, tx: Transaction) => void;
}) {
  const canCancel   = tx.status === "requested" || tx.status === "not_paid";
  const canMarkPaid = tx.status === "not_paid";
  const canRefund   = tx.status === "received";

  return (
    <div className="text-left">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Row actions"
        >
          <MoreVertical className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="text-xs cursor-pointer"
          onClick={() => onAction("invoice", tx)}
        >
          <FileText size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          View invoice
        </DropdownMenuItem>
        {canMarkPaid && (
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => onAction("mark_paid", tx)}
          >
            <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Mark as paid
          </DropdownMenuItem>
        )}
        {canRefund && (
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => onAction("refund", tx)}
          >
            <RotateCcw size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Issue refund
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem
            className="text-xs text-destructive cursor-pointer focus:text-destructive"
            onClick={() => onAction("cancel", tx)}
          >
            <X size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Cancel request
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}

/* ─── Confirmation dialogs ─── */
function ActionDialog({
  open,
  type,
  tx,
  onConfirm,
  onClose,
}: {
  open: boolean;
  type: ModalType;
  tx: Transaction | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!tx || !type || type === "invoice") return null;

  const CONFIG = {
    cancel: {
      title: "Cancel payment request?",
      desc: `This will cancel the $${tx.amount.toFixed(2)} request sent to ${tx.contactName}. They will be notified.`,
      cta: "Cancel request",
      variant: "destructive" as const,
    },
    mark_paid: {
      title: "Mark as paid?",
      desc: `Confirm that ${tx.contactName} has paid $${tx.amount.toFixed(2)} outside of Birdeye Payments.`,
      cta: "Mark as paid",
      variant: "default" as const,
    },
    refund: {
      title: `Issue refund of ${fmtAmount(tx.amount)}?`,
      desc: `A full refund will be issued to ${tx.contactName}. This may take 5–10 business days.`,
      cta: "Issue refund",
      variant: "destructive" as const,
    },
  };

  const cfg = CONFIG[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{cfg.title}</DialogTitle>
          <DialogDescription className="text-sm mt-1">{cfg.desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Go back
          </Button>
          <Button variant={cfg.variant} size="sm" onClick={onConfirm} className="cursor-pointer">
            {cfg.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Invoice sheet ─── */
function InvoiceSheet({
  open,
  tx,
  onClose,
}: {
  open: boolean;
  tx: Transaction | null;
  onClose: () => void;
}) {
  if (!tx) return null;

  const statusCfg = STATUS_CONFIG[tx.status];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Invoice detail"
          description={
            <span className="sr-only">Payment invoice for {tx.contactName}</span>
          }
          classNames={{
            footer:
              "flex w-full flex-row flex-wrap justify-start gap-2 border-t border-border sm:justify-start",
          }}
          footer={
            <>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
                <Download size={13} strokeWidth={1.6} absoluteStrokeWidth />
                Download PDF
              </Button>
              {tx.status === "not_paid" ? (
                <Button size="sm" className="cursor-pointer">
                  Send reminder
                </Button>
              ) : null}
            </>
          }
        >
          {/* Contact */}
          <div className="flex flex-col gap-1 mb-6">
            <p className="text-sm font-semibold text-foreground">{tx.contactName}</p>
            <p className="text-xs text-muted-foreground">{tx.businessName}</p>
          </div>

          {/* Amount + status */}
          <div className="bg-muted/40 rounded-lg p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold text-foreground">{fmtAmount(tx.amount)}</p>
            </div>
            <Badge variant="outline" className={`font-medium ${statusCfg.className}`}>
              {statusCfg.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 text-sm">
            {[
              { label: "Date", value: tx.date },
              { label: "Description", value: tx.description },
              { label: "Transaction ID", value: `TXN-${tx.id.toUpperCase()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

export type PaymentsViewProps = {
  /** Transaction status scope from shell L2 (`PaymentsL2NavPanel`). */
  statusFilter: PaymentsStatusFilter;
};

const paymentColumnHelper = createColumnHelper<Transaction>();

/* ─── Main view ─── */
export function PaymentsView({ statusFilter }: PaymentsViewProps) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [tableStatusFilter, setTableStatusFilter] = useState<PaymentsStatusFilter>("all");
  const [tagsQuick, setTagsQuick] = useState<PaymentTagsQuickFilter>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    if (statusFilter !== "all") {
      setTableStatusFilter("all");
      setTagsQuick("all");
    }
  }, [statusFilter]);

  const activeStatusLabel =
    PAYMENT_STATUS_FILTER_OPTS.find((o) => o.value === tableStatusFilter)?.label ?? "All statuses";
  const activeTagsLabel =
    PAYMENT_TAGS_QUICK_OPTS.find((o) => o.value === tagsQuick)?.label ?? "All payments";

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((tx) => {
      const matchesSearch =
        tx.contactName.toLowerCase().includes(search.toLowerCase()) ||
        tx.businessName.toLowerCase().includes(search.toLowerCase()) ||
        tx.description.toLowerCase().includes(search.toLowerCase());
      const matchesL2 = statusFilter === "all" || tx.status === statusFilter;
      const matchesTableStatus =
        statusFilter !== "all" ||
        tableStatusFilter === "all" ||
        tx.status === tableStatusFilter;
      const matchesTagsQuick =
        statusFilter !== "all" ||
        tagsQuick === "all" ||
        (tagsQuick === "unsettled" && (tx.status === "requested" || tx.status === "not_paid"));
      return matchesSearch && matchesL2 && matchesTableStatus && matchesTagsQuick;
    });
  }, [search, statusFilter, tableStatusFilter, tagsQuick]);

  const handleAction = useCallback((type: ModalType, tx: Transaction) => {
    setSelectedTx(tx);
    if (type === "invoice") {
      setInvoiceOpen(true);
    } else {
      setModalType(type);
    }
  }, []);

  const handleConfirm = () => {
    setModalType(null);
    setSelectedTx(null);
  };

  const paymentColumns = useMemo(
    () => [
      paymentColumnHelper.accessor("contactName", {
        id: "contact",
        header: "Contact",
        meta: { settingsLabel: "Contact" },
        size: 220,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{row.original.contactName}</span>
            <span className="text-muted-foreground">{row.original.businessName}</span>
          </div>
        ),
      }),
      paymentColumnHelper.accessor("amount", {
        id: "amount",
        header: "Amount",
        meta: { settingsLabel: "Amount" },
        size: 120,
        enableSorting: true,
        cell: (info) => (
          <span className="block text-left font-medium text-foreground tabular-nums">
            {fmtAmount(info.getValue())}
          </span>
        ),
      }),
      paymentColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 120,
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      paymentColumnHelper.accessor("date", {
        id: "date",
        header: "Date",
        meta: { settingsLabel: "Date" },
        size: 130,
        enableSorting: true,
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      paymentColumnHelper.accessor("description", {
        id: "description",
        header: "Description",
        meta: { settingsLabel: "Description" },
        size: 220,
        enableSorting: true,
        cell: (info) => (
          <span className="max-w-[220px] truncate text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      paymentColumnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Row actions</span>,
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: ({ row }) => <TxActions tx={row.original} onAction={handleAction} />,
      }),
    ],
    [handleAction],
  );

  const paymentsEmpty = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">No transactions match your search.</p>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <MainCanvasViewHeader
          title="Payments"
          description={`${filtered.length.toLocaleString()} showing · ${TRANSACTIONS.length.toLocaleString()} transactions`}
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
                    placeholder="Search transactions"
                    className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#8b92a5]"
                    aria-label="Search transactions"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open search"
                  title="Search transactions"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search
                    className="size-[14px] text-[#303030] dark:text-[#8b92a5]"
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Tags: ${activeTagsLabel}`}
                    title={`Tags: ${activeTagsLabel}`}
                  >
                    <Tags className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                    <Download size={13} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" aria-hidden />
                    Export
                  </DropdownMenuItem>
                  {statusFilter === "all" ? (
                    <>
                      <DropdownMenuSeparator />
                      {PAYMENT_TAGS_QUICK_OPTS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          className="cursor-pointer text-xs"
                          onClick={() => setTagsQuick(opt.value)}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
              {statusFilter === "all" ? (
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
                      <Filter className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {PAYMENT_STATUS_FILTER_OPTS.map((opt) => (
                      <DropdownMenuItem
                        key={String(opt.value)}
                        className="cursor-pointer text-xs"
                        onClick={() => setTableStatusFilter(opt.value)}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled
                  aria-label="Status filter uses the left menu for this scope"
                  title="Status filter uses the left menu for this scope"
                >
                  <Filter className="size-4 shrink-0 opacity-50" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              )}
              <AppDataTableColumnSettingsTrigger
                sheetTitle="Payment columns"
                onClick={() => setColumnSheetOpen(true)}
              />
            </div>
          }
        />

        {/* ── Summary + table (table body scrolls internally; thead stays sticky) ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 pb-6">
          <div className="shrink-0">
            <PaymentsSummaryStrip />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-border bg-background">
            <AppDataTable<Transaction>
              tableId="payments.ledger"
              data={filtered}
              columns={paymentColumns}
              initialSorting={[{ id: "date", desc: true }]}
              onRowClick={(tx) => {
                setSelectedTx(tx);
                setInvoiceOpen(true);
              }}
              getRowId={(row) => row.id}
              emptyState={paymentsEmpty}
              columnSheetTitle="Payment columns"
              className="min-h-0 min-w-0 flex-1 px-0"
              rowDensity="default"
              scrollableBody
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          </div>
        </div>

        {/* ── Modals ── */}
        <ActionDialog
          open={!!modalType && modalType !== "invoice"}
          type={modalType}
          tx={selectedTx}
          onConfirm={handleConfirm}
          onClose={() => { setModalType(null); setSelectedTx(null); }}
        />

        <InvoiceSheet
          open={invoiceOpen}
          tx={selectedTx}
          onClose={() => { setInvoiceOpen(false); setSelectedTx(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
