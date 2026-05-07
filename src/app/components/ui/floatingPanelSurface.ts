/**
 * Shared visual shell for floating overlays (Popover, DropdownMenu, Select, custom menus).
 * Matches the L1 profile menu: large corner radius, **no perimeter border** — depth comes from
 * the elevation shadow only (same idea as borderless Dialog/Sheet surfaces).
 * Import in primitives and stories; override with `className` only when necessary.
 */
export const FLOATING_PANEL_SURFACE_CLASSNAME =
  "rounded-2xl bg-popover text-popover-foreground shadow-[0_12px_48px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.45)]";

/** Default inset padding for list-style content inside the shell (8px grid). */
export const FLOATING_PANEL_LIST_PADDING_CLASSNAME = "p-2";
