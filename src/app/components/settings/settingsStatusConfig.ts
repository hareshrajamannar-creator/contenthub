export type SettingsConnectionStatus =
  | "connected"
  | "partial"
  | "needs_attention"
  | "not_connected"
  | "disconnected";

export interface SettingsStatusMeta {
  type: SettingsConnectionStatus;
  label: string;
}

export const STATUS_DOT_CLASS: Record<SettingsConnectionStatus, string> = {
  connected:       "bg-emerald-500 dark:bg-emerald-400",
  partial:         "bg-amber-500 dark:bg-amber-400",
  needs_attention: "bg-amber-500 dark:bg-amber-400",
  not_connected:   "bg-slate-400 dark:bg-slate-500",
  disconnected:    "bg-rose-500 dark:bg-rose-400",
};

export const STATUS_LABEL_CLASS: Record<SettingsConnectionStatus, string> = {
  connected:       "text-emerald-600 dark:text-emerald-400",
  partial:         "text-amber-600 dark:text-amber-400",
  needs_attention: "text-amber-600 dark:text-amber-400",
  not_connected:   "text-slate-500 dark:text-slate-400",
  disconnected:    "text-rose-500 dark:text-rose-400",
};
