/**
 * Standard main-canvas view header band (Appointments, Payments, Listings, …).
 * Use with {@link MainCanvasViewHeader} or mirror the same `px-6 pt-5 pb-4` row in bespoke layouts.
 */
export const MAIN_VIEW_HEADER_BAND_CLASS =
  "flex shrink-0 items-center justify-between px-6 pt-5 pb-4";

/**
 * Primary title line: canvas `<h1>`, {@link MainCanvasViewHeader}, and Radix
 * Dialog / Sheet / Drawer / AlertDialog titles (see `dialog.v1`, `sheet.v1`, `drawer.v1`, `alert-dialog.v1`).
 */
export const MAIN_VIEW_PRIMARY_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-foreground";

/** Optional one-line subtitle under the primary heading in canvas headers. */
export const MAIN_VIEW_SUBHEADING_CLASS = "mt-0.5 text-xs text-muted-foreground";
