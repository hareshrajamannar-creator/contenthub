import { useCallback, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronLeft, ChevronRight, Search, MoreHorizontal,
  Clock, User, Calendar, CalendarRange, List, CheckCircle2, X, Bell,
  MapPin, Phone, Mail,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import {
  Sheet, SheetContent,
} from "@/app/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/app/components/ui/dialog";
import {
  FloatingSheetFrame,
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
} from "@/app/components/layout/FloatingSheetFrame";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { cn } from "@/app/components/ui/utils";

/* ─── Types ─── */
type ApptStatus = "confirmed" | "requested" | "completed" | "cancelled" | "no_show" | "in_progress";
type ViewMode = "calendar" | "schedule";
type CalendarView = "day" | "week";

interface Provider {
  id: string; name: string; specialty: string; color: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: string;
  service: string;
  status: ApptStatus;
  date: string; // ISO yyyy-mm-dd
  startTime: string; // HH:MM 24h
  endTime: string;
  duration: number; // minutes
  location: string;
  notes?: string;
}

const appointmentColumnHelper = createColumnHelper<Appointment>();

/* ─── Mock data ─── */
const PROVIDERS: Provider[] = [
  { id: "p1", name: "Dr. Sarah Chen",   specialty: "General Dentistry", color: "#4f46e5" },
  { id: "p2", name: "Dr. Marcus Webb",  specialty: "Orthodontics",      color: "#0891b2" },
  { id: "p3", name: "Dr. Priya Nair",   specialty: "Cosmetic Dentistry", color: "#059669" },
  { id: "p4", name: "Dr. James Osei",   specialty: "Oral Surgery",       color: "#d97706" },
];

// Week of Apr 14, 2026 (Mon–Sun)
const WEEK_DATES = ["2026-04-14", "2026-04-15", "2026-04-16", "2026-04-17", "2026-04-18", "2026-04-19", "2026-04-20"];

const APPOINTMENTS: Appointment[] = [
  // Monday
  { id: "a1",  patientName: "Lisa Monroe",     patientEmail: "lisa@example.com",    patientPhone: "(512) 555-0141", providerId: "p1", service: "Teeth Cleaning",      status: "confirmed",   date: "2026-04-14", startTime: "09:00", endTime: "09:45", duration: 45, location: "Suite 101" },
  { id: "a2",  patientName: "Tom Harrington",  patientEmail: "tom@example.com",     patientPhone: "(512) 555-0182", providerId: "p2", service: "Braces Adjustment",   status: "confirmed",   date: "2026-04-14", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 204" },
  { id: "a3",  patientName: "Aisha Rahman",    patientEmail: "aisha@example.com",   patientPhone: "(512) 555-0109", providerId: "p3", service: "Veneer Consultation", status: "requested",   date: "2026-04-14", startTime: "11:00", endTime: "11:30", duration: 30, location: "Suite 308" },
  { id: "a4",  patientName: "Carlos Vega",     patientEmail: "carlos@example.com",  patientPhone: "(512) 555-0155", providerId: "p4", service: "Tooth Extraction",    status: "confirmed",   date: "2026-04-14", startTime: "14:00", endTime: "15:00", duration: 60, location: "Suite 412" },
  // Tuesday
  { id: "a5",  patientName: "Fiona Blake",     patientEmail: "fiona@example.com",   patientPhone: "(512) 555-0122", providerId: "p1", service: "Root Canal",          status: "in_progress", date: "2026-04-15", startTime: "09:30", endTime: "11:00", duration: 90, location: "Suite 101" },
  { id: "a6",  patientName: "David Park",      patientEmail: "david@example.com",   patientPhone: "(512) 555-0177", providerId: "p2", service: "Retainer Fitting",    status: "confirmed",   date: "2026-04-15", startTime: "13:00", endTime: "13:30", duration: 30, location: "Suite 204" },
  // Wednesday
  { id: "a7",  patientName: "Maria Santos",    patientEmail: "maria@example.com",   patientPhone: "(512) 555-0133", providerId: "p3", service: "Whitening Session",   status: "confirmed",   date: "2026-04-16", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 308" },
  { id: "a8",  patientName: "James Okafor",    patientEmail: "james@example.com",   patientPhone: "(512) 555-0194", providerId: "p1", service: "Check-up & X-ray",   status: "cancelled",   date: "2026-04-16", startTime: "14:30", endTime: "15:00", duration: 30, location: "Suite 101", notes: "Patient requested reschedule." },
  // Thursday
  { id: "a9",  patientName: "Nina Petrov",     patientEmail: "nina@example.com",    patientPhone: "(512) 555-0161", providerId: "p4", service: "Implant Consult",     status: "confirmed",   date: "2026-04-17", startTime: "09:00", endTime: "09:30", duration: 30, location: "Suite 412" },
  { id: "a10", patientName: "Oliver Grant",    patientEmail: "oliver@example.com",  patientPhone: "(512) 555-0148", providerId: "p2", service: "Invisalign Check",    status: "requested",   date: "2026-04-17", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 204" },
  { id: "a11", patientName: "Sophia Turner",   patientEmail: "sophia@example.com",  patientPhone: "(512) 555-0115", providerId: "p3", service: "Bonding",             status: "no_show",     date: "2026-04-17", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 308" },
  // Friday
  { id: "a12", patientName: "Ben Nakamura",    patientEmail: "ben@example.com",     patientPhone: "(512) 555-0127", providerId: "p1", service: "Fluoride Treatment",  status: "confirmed",   date: "2026-04-18", startTime: "08:30", endTime: "09:00", duration: 30, location: "Suite 101" },
  { id: "a13", patientName: "Clara Hughes",    patientEmail: "clara@example.com",   patientPhone: "(512) 555-0188", providerId: "p3", service: "Scaling & Polish",    status: "completed",   date: "2026-04-18", startTime: "10:00", endTime: "10:45", duration: 45, location: "Suite 308" },
  { id: "a14", patientName: "Devon King",      patientEmail: "devon@example.com",   patientPhone: "(512) 555-0139", providerId: "p4", service: "Wisdom Tooth Eval",   status: "confirmed",   date: "2026-04-18", startTime: "13:30", endTime: "14:00", duration: 30, location: "Suite 412" },
  // Saturday
  { id: "a15", patientName: "Elena Watts",     patientEmail: "elena@example.com",   patientPhone: "(512) 555-0172", providerId: "p2", service: "Dental Emergency",    status: "confirmed",   date: "2026-04-19", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 204" },
];

/* ─── Status config ─── */
const STATUS_CONFIG: Record<ApptStatus, { label: string; className: string; dotColor: string }> = {
  confirmed:   { label: "Confirmed",   className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dotColor: "#10b981" },
  requested:   { label: "Requested",   className: "bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-400",   dotColor: "#3b82f6" },
  completed:   { label: "Completed",   className: "bg-slate-50  text-slate-600  dark:bg-slate-800/40  dark:text-slate-400",  dotColor: "#94a3b8" },
  cancelled:   { label: "Cancelled",   className: "bg-red-50    text-red-600    dark:bg-red-950/40    dark:text-red-400",    dotColor: "#ef4444" },
  no_show:     { label: "No show",     className: "bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-400",  dotColor: "#f59e0b" },
  in_progress: { label: "In progress", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", dotColor: "#8b5cf6" },
};
const STATUS_TEXT_CLASS: Record<ApptStatus, string> = {
  confirmed: "text-emerald-700 dark:text-emerald-400",
  requested: "text-blue-700 dark:text-blue-400",
  completed: "text-slate-600 dark:text-slate-400",
  cancelled: "text-red-600 dark:text-red-400",
  no_show: "text-amber-700 dark:text-amber-400",
  in_progress: "text-purple-700 dark:text-purple-400",
};

/* ─── Helpers ─── */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDateHeader(iso: string): { day: string; num: number; month: string } {
  const d = parseDate(iso);
  return { day: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1], num: d.getDate(), month: MONTH_NAMES[d.getMonth()] };
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function providerById(id: string): Provider {
  return PROVIDERS.find((p) => p.id === id)!;
}

function isToday(iso: string): boolean {
  return iso === "2026-04-14"; // Monday = "today" in our mock
}

/* ─── Appointment card (calendar cell) ─── */
function ApptCard({
  appt,
  onClick,
  compact = false,
}: {
  appt: Appointment;
  onClick: (a: Appointment) => void;
  compact?: boolean;
}) {
  const provider = providerById(appt.providerId);
  const statusCfg = STATUS_CONFIG[appt.status];

  return (
    <button
      onClick={() => onClick(appt)}
      className="w-full text-left rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      style={{ borderLeftColor: provider.color, borderLeftWidth: 3 }}
    >
      <div className="px-2.5 py-2 bg-card group-hover:bg-muted/30 transition-colors">
        <div className="flex items-start justify-between gap-1">
          <p className={`font-medium text-foreground leading-tight ${compact ? "text-[11px]" : "text-xs"}`}>
            {appt.patientName}
          </p>
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5"
            style={{ background: statusCfg.dotColor }}
          />
        </div>
        {!compact && (
          <>
            <p className="text-[10px] text-muted-foreground mt-0.5">{appt.service}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock size={9} strokeWidth={1.6} absoluteStrokeWidth />
              {fmtTime12(appt.startTime)} · {appt.duration}m
            </p>
          </>
        )}
        {compact && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtTime12(appt.startTime)}</p>
        )}
      </div>
    </button>
  );
}

/* ─── Calendar week view ─── */
function WeekCalendar({
  dates,
  appointments,
  onApptClick,
}: {
  dates: string[];
  appointments: Appointment[];
  onApptClick: (a: Appointment) => void;
}) {
  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const d of dates) map[d] = [];
    for (const a of appointments) {
      if (map[a.date]) map[a.date].push(a);
    }
    // sort by start time
    for (const d of dates) {
      map[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }
    return map;
  }, [dates, appointments]);

  const TIME_SLOTS: string[] = [];
  for (let h = 8; h <= 18; h++) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 18) TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:30`);
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Gutter + time column */}
      <div className="flex flex-col shrink-0">
        {/* Header spacer */}
        <div className="h-12 border-b border-r border-border" style={{ width: 52 }} />
        {/* Time labels */}
        <div className="overflow-y-auto flex-1 border-r border-border" style={{ width: 52 }}>
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground"
              style={{ height: 40 }}
            >
              <span className="-translate-y-1.5">{t.endsWith(":00") ? fmtTime12(t) : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day columns (scrollable together) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col min-w-0">
        {/* Day headers */}
        <div className="flex border-b border-border shrink-0">
          {dates.map((d, i) => {
            const { day, num, month } = fmtDateHeader(d);
            const today = isToday(d);
            const count = (byDate[d] ?? []).length;
            return (
              <div
                key={d}
                className={`flex-1 min-w-[120px] h-12 flex flex-col items-center justify-center border-r border-border last:border-r-0 ${today ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium">{day}</span>
                  <span
                    className={`text-sm font-semibold ${today ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs" : "text-foreground"}`}
                  >
                    {num}
                  </span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">{count} appt{count > 1 ? "s" : ""}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex flex-1 overflow-y-auto">
          {dates.map((d) => {
            const today = isToday(d);
            const dayAppts = byDate[d] ?? [];
            return (
              <div
                key={d}
                className={`flex-1 min-w-[120px] border-r border-border last:border-r-0 relative ${today ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Grid rows */}
                {TIME_SLOTS.map((t) => (
                  <div
                    key={t}
                    className={`border-b ${t.endsWith(":30") ? "border-dashed border-border/40" : "border-border/60"}`}
                    style={{ height: 40 }}
                  />
                ))}

                {/* Appointments overlaid */}
                <div className="absolute inset-0 p-1 flex flex-col gap-1 pointer-events-none">
                  {dayAppts.map((a) => {
                    const startMin = timeToMinutes(a.startTime) - 8 * 60;
                    const topPx = (startMin / 30) * 40;
                    const heightPx = Math.max((a.duration / 30) * 40 - 4, 36);
                    return (
                      <div
                        key={a.id}
                        className="absolute left-1 right-1 pointer-events-auto"
                        style={{ top: topPx + 2, height: heightPx }}
                      >
                        <ApptCard appt={a} onClick={onApptClick} compact={a.duration <= 30} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Day single-column view ─── */
function DayCalendar({
  date,
  appointments,
  onApptClick,
}: {
  date: string;
  appointments: Appointment[];
  onApptClick: (a: Appointment) => void;
}) {
  const dayAppts = appointments
    .filter((a) => a.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const TIME_SLOTS: string[] = [];
  for (let h = 8; h <= 18; h++) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 18) TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:30`);
  }

  const { day, num, month } = fmtDateHeader(date);
  const today = isToday(date);

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      {/* Day header */}
      <div className={`h-12 border-b border-border flex items-center justify-center gap-2 ${today ? "bg-primary/5" : ""}`}>
        <span className="text-sm text-muted-foreground">{day}, {month}</span>
        <span className={`text-lg font-semibold ${today ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm" : "text-foreground"}`}>
          {num}
        </span>
      </div>

      {/* Time grid + appointments */}
      <div className="flex flex-1 overflow-y-auto min-h-0">
        {/* Time column */}
        <div className="shrink-0 border-r border-border" style={{ width: 64 }}>
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="flex items-start justify-end pr-3 text-[10px] text-muted-foreground"
              style={{ height: 56 }}
            >
              <span className="-translate-y-1.5">{t.endsWith(":00") ? fmtTime12(t) : ""}</span>
            </div>
          ))}
        </div>

        {/* Content column */}
        <div className="flex-1 relative">
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className={`border-b ${t.endsWith(":30") ? "border-dashed border-border/40" : "border-border/60"}`}
              style={{ height: 56 }}
            />
          ))}
          {/* Appointment cards */}
          <div className="absolute inset-0 p-2 pointer-events-none">
            {dayAppts.map((a) => {
              const startMin = timeToMinutes(a.startTime) - 8 * 60;
              const topPx = (startMin / 30) * 56;
              const heightPx = Math.max((a.duration / 30) * 56 - 6, 44);
              const provider = providerById(a.providerId);
              const statusCfg = STATUS_CONFIG[a.status];
              return (
                <div
                  key={a.id}
                  className="absolute left-2 right-2 pointer-events-auto"
                  style={{ top: topPx + 2, height: heightPx }}
                >
                  <button
                    onClick={() => onApptClick(a)}
                    className="w-full h-full text-left rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    style={{ borderLeftColor: provider.color, borderLeftWidth: 3 }}
                  >
                    <div className="px-3 py-1.5 bg-card group-hover:bg-muted/30 transition-colors flex items-start justify-between gap-2 h-full">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-tight truncate">{a.patientName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{a.service}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={9} strokeWidth={1.6} absoluteStrokeWidth />
                          {fmtTime12(a.startTime)} – {fmtTime12(a.endTime)}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{provider.name}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </button>
                </div>
              );
            })}
            {dayAppts.length === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No appointments today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule list view ─── */
function ScheduleList({
  appointments,
  search,
  onSearch,
  onApptClick,
}: {
  appointments: Appointment[];
  search: string;
  onSearch: (s: string) => void;
  onApptClick: (a: Appointment) => void;
}) {
  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(q) ||
      a.service.toLowerCase().includes(q) ||
      providerById(a.providerId).name.toLowerCase().includes(q)
    );
  });

  const handleRowClick = useCallback(
    (a: Appointment) => {
      onApptClick(a);
    },
    [onApptClick],
  );

  const scheduleColumns = useMemo(
    () => [
      appointmentColumnHelper.accessor("date", {
        id: "when",
        header: "Date & Time",
        meta: { settingsLabel: "Date & time" },
        size: 168,
        enableSorting: true,
        cell: ({ row }) => {
          const a = row.original;
          const { day, num, month } = fmtDateHeader(a.date);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">
                {day}, {month} {num}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock size={9} strokeWidth={1.6} absoluteStrokeWidth />
                {fmtTime12(a.startTime)} · {a.duration}m
              </span>
            </div>
          );
        },
      }),
      appointmentColumnHelper.accessor("patientName", {
        id: "patient",
        header: "Patient",
        meta: { settingsLabel: "Patient" },
        size: 168,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      appointmentColumnHelper.accessor((row) => providerById(row.providerId).name, {
        id: "provider",
        header: "Provider",
        meta: { settingsLabel: "Provider" },
        size: 168,
        enableSorting: true,
        cell: ({ row }) => {
          const a = row.original;
          const provider = providerById(a.providerId);
          return (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: provider.color }} />
              <span className="truncate text-foreground">{provider.name}</span>
            </div>
          );
        },
      }),
      appointmentColumnHelper.accessor("service", {
        id: "service",
        header: "Service",
        meta: { settingsLabel: "Service" },
        size: 200,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      appointmentColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 120,
        enableSorting: true,
        cell: (info) => {
          const statusCfg = STATUS_CONFIG[info.getValue()];
          return (
            <Badge variant="outline" className={statusCfg.className}>
              {statusCfg.label}
            </Badge>
          );
        },
      }),
      appointmentColumnHelper.accessor("location", {
        id: "location",
        header: "Location",
        meta: { settingsLabel: "Location" },
        size: 112,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      appointmentColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="text-left">
            <ApptRowActions appt={row.original} onAction={() => {}} />
          </div>
        ),
      }),
    ],
    [],
  );

  const scheduleEmpty = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">No appointments match your search.</p>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto border-b border-border">
        <AppDataTable<Appointment>
          tableId="appointments.schedule"
          data={filtered}
          columns={scheduleColumns}
          initialSorting={[{ id: "when", desc: false }]}
          getRowId={(a) => a.id}
          onRowClick={handleRowClick}
          emptyState={scheduleEmpty}
          columnSheetTitle="Appointment columns"
          className="min-h-0 min-w-0"
          toolbarLeft={
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search
                  size={13}
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search appointments…"
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{filtered.length} appointments</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

function ApptRowActions({ appt, onAction }: { appt: Appointment; onAction: () => void }) {
  const canCancel = appt.status === "confirmed" || appt.status === "requested";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer">
          <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Bell size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Send reminder
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs cursor-pointer">
          <Calendar size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          Reschedule
        </DropdownMenuItem>
        {canCancel && (
          <DropdownMenuItem className="text-xs text-destructive cursor-pointer focus:text-destructive">
            <X size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Appointment detail Sheet ─── */
function ApptDetailSheet({
  open,
  appt,
  onClose,
}: {
  open: boolean;
  appt: Appointment | null;
  onClose: () => void;
}) {
  if (!appt) return null;
  const provider = providerById(appt.providerId);
  const statusCfg = STATUS_CONFIG[appt.status];
  const statusTextClass = STATUS_TEXT_CLASS[appt.status];
  const { day, num, month } = fmtDateHeader(appt.date);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Appointment detail"
          description={`Appointment for ${appt.patientName}`}
          classNames={{
            body: "px-0 py-0",
            footer: "justify-start",
          }}
          footer={(
            <div className="flex w-full flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="h-9 rounded-md px-3.5 text-[13px] shadow-sm cursor-pointer gap-2"
              >
                <Bell size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Send reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-[13px] cursor-pointer gap-2"
              >
                <Calendar size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Reschedule
              </Button>
              {(appt.status === "confirmed" || appt.status === "requested") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-md px-3 text-[13px] text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer gap-2"
                >
                  <X size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  Cancel
                </Button>
              )}
            </div>
          )}
        >
          <div className="flex flex-col gap-6 px-6 py-4">
            {/* Status banner */}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ background: `${provider.color}14`, borderLeft: `3px solid ${provider.color}` }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{appt.service}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{provider.name}</p>
              </div>
              <span className={`shrink-0 text-sm font-medium ${statusTextClass}`}>
                {statusCfg.label}
              </span>
            </div>

            {/* Patient info */}
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Patient</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground">{appt.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{appt.patientPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{appt.patientEmail}</span>
                </div>
              </div>
            </section>

            {/* Appointment info */}
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Details</p>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { icon: Calendar, label: "Date", value: `${DAY_FULL[parseDate(appt.date).getDay() === 0 ? 6 : parseDate(appt.date).getDay() - 1]}, ${month} ${num}` },
                  { icon: Clock, label: "Time", value: `${fmtTime12(appt.startTime)} – ${fmtTime12(appt.endTime)} (${appt.duration} min)` },
                  { icon: MapPin, label: "Location", value: appt.location },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Icon size={14} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            {appt.notes && (
              <section className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">{appt.notes}</p>
              </section>
            )}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main view ─── */
export function AppointmentsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [currentDateIdx, setCurrentDateIdx] = useState(0); // for day view: index into WEEK_DATES
  const [search, setSearch] = useState("");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentDayDate = WEEK_DATES[currentDateIdx];

  const handleApptClick = (a: Appointment) => {
    setSelectedAppt(a);
    setSheetOpen(true);
  };

  // Week range label
  const startDate = parseDate(WEEK_DATES[0]);
  const endDate = parseDate(WEEK_DATES[6]);
  const weekLabel = `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()} – ${startDate.getMonth() !== endDate.getMonth() ? MONTH_NAMES[endDate.getMonth()] + " " : ""}${endDate.getDate()}, ${endDate.getFullYear()}`;

  // Day label
  const dayLabel = (() => {
    const { day, num, month } = fmtDateHeader(currentDayDate);
    return `${day}, ${month} ${num}`;
  })();

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <MainCanvasViewHeader
          title="Appointments"
          description="Schedule, manage, and track patient appointments."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedToggle<ViewMode>
                iconOnly
                ariaLabel="Appointments layout"
                value={viewMode}
                onChange={setViewMode}
                items={[
                  {
                    value: "calendar",
                    label: "Calendar view",
                    icon: (
                      <Calendar className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    ),
                  },
                  {
                    value: "schedule",
                    label: "Schedule list",
                    icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                  },
                ]}
              />
              {viewMode === "calendar" && (
                <>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-[var(--button-height)] w-[var(--button-height)] shrink-0 cursor-pointer"
                      disabled={
                        calendarView === "week" || (calendarView === "day" && currentDateIdx === 0)
                      }
                      onClick={() => {
                        if (calendarView === "day") setCurrentDateIdx((i) => Math.max(0, i - 1));
                      }}
                      aria-label="Previous day"
                    >
                      <ChevronLeft className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    </Button>
                    <span className="max-w-[min(100%,14rem)] truncate px-2 text-center text-xs font-medium text-foreground tabular-nums sm:max-w-[20rem]">
                      {calendarView === "week" ? weekLabel : dayLabel}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-[var(--button-height)] w-[var(--button-height)] shrink-0 cursor-pointer"
                      disabled={
                        calendarView === "week" ||
                        (calendarView === "day" && currentDateIdx === WEEK_DATES.length - 1)
                      }
                      onClick={() => {
                        if (calendarView === "day") setCurrentDateIdx((i) => Math.min(WEEK_DATES.length - 1, i + 1));
                      }}
                      aria-label="Next day"
                    >
                      <ChevronRight className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    </Button>
                  </div>
                  <SegmentedToggle<CalendarView>
                    iconOnly
                    ariaLabel="Calendar range"
                    value={calendarView}
                    onChange={setCalendarView}
                    items={[
                      {
                        value: "day",
                        label: "Day",
                        icon: (
                          <Calendar className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                        ),
                      },
                      {
                        value: "week",
                        label: "Week",
                        icon: (
                          <CalendarRange className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                        ),
                      },
                    ]}
                  />
                </>
              )}
            </div>
          }
        />

        {/* ── Main content area ── */}
        <div
          className={cn(
            "mx-6 mb-6 flex min-h-0 flex-1 flex-col overflow-hidden",
            viewMode === "calendar"
              ? "rounded-xl border border-border bg-card"
              : "border-0 bg-background",
          )}
        >
          {viewMode === "calendar" ? (
            calendarView === "week" ? (
              <WeekCalendar
                dates={WEEK_DATES}
                appointments={APPOINTMENTS}
                onApptClick={handleApptClick}
              />
            ) : (
              <DayCalendar
                date={currentDayDate}
                appointments={APPOINTMENTS}
                onApptClick={handleApptClick}
              />
            )
          ) : (
            <ScheduleList
              appointments={APPOINTMENTS}
              search={search}
              onSearch={setSearch}
              onApptClick={handleApptClick}
            />
          )}
        </div>

        {/* ── Detail sheet ── */}
        <ApptDetailSheet
          open={sheetOpen}
          appt={selectedAppt}
          onClose={() => { setSheetOpen(false); setSelectedAppt(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
