/** Single metric cell in a `metrics` slide (up to three). */
export interface BootInsightMetricColumn {
  label: string;
  value: string;
  /** Secondary line, e.g. delta or unit context. */
  hint?: string;
}

/** Optional category chip; prefer short sentence-case labels. */
export type BootInsightTag =
  | "shortcut"
  | "automation"
  | "product"
  | string;

export interface BootInsightSlideMetrics {
  kind: "metrics";
  id: string;
  tag?: BootInsightTag;
  /** One to three columns (show as a compact row). */
  columns: BootInsightMetricColumn[];
}

export interface BootInsightSlideMessage {
  kind: "message";
  id: string;
  tag?: BootInsightTag;
  title: string;
  body?: string;
}

export type BootInsightSlide = BootInsightSlideMetrics | BootInsightSlideMessage;
