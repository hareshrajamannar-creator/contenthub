import type { FilterItem } from "@/app/components/FilterPanel.v1";

export function filterValue(
  filters: FilterItem[],
  id: string,
): string | undefined {
  return filters.find((f) => f.id === id)?.value;
}

/** Deep copy filter definitions for a fresh form state. */
export function cloneFilterItems(items: FilterItem[]): FilterItem[] {
  return items.map((f) => ({ ...f }));
}
