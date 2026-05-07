/**
 * Shared visual for modal scrims (Dialog, Sheet, AlertDialog, Drawer overlays).
 * Prefer **light backdrop blur + low-opacity semantic tint** over heavy `bg-black/*`
 * so the shell stays visible and the UI feels native to Aero.
 *
 * Blur uses ~half the former `backdrop-blur-sm` strength (~2px vs ~4px) so the
 * shell stays more readable when sheets/dialogs open.
 */
export const MODAL_OVERLAY_VISUAL_CLASS =
  "bg-background/35 backdrop-blur-[2px] dark:bg-background/45";
