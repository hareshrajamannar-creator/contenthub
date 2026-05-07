import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";

/** L2 key for the calendar surface hosted in the shell (`AppointmentsView`). */
export const APPOINTMENTS_L2_CALENDAR_KEY = "Human actions/Calendar";

function titleCaseWords(s: string): string {
  return s
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** `productLabel` for `AppShellContentPlaceholder` when an L2 row has no dedicated canvas yet. */
export function appointmentsL2PlaceholderProductLabel(activeKey: string): string {
  if (activeKey.startsWith(`${L2_FLAT_NAV_KEY_PREFIX}/`)) {
    const raw = activeKey.slice(L2_FLAT_NAV_KEY_PREFIX.length + 1);
    return `Appointments · ${titleCaseWords(raw)}`;
  }
  const i = activeKey.lastIndexOf("/");
  const child = i >= 0 ? activeKey.slice(i + 1) : activeKey;
  return `Appointments · ${child}`;
}

export function appointmentsL2ShowsCalendarCanvas(activeKey: string): boolean {
  return activeKey === APPOINTMENTS_L2_CALENDAR_KEY;
}
