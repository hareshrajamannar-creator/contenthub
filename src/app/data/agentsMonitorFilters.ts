import type { FilterItem } from "@/app/components/FilterPanel.v1";
import type { ActivityCategory } from "@/app/data/agentsMonitorMock";
import { cloneFilterItems } from "@/app/data/filterUtils";

export const AGENTS_MONITOR_FILTERS_STORAGE_KEY = "birdeye_agents_monitor_filters";

export const AGENTS_MONITOR_FILTER_IDS = {
  agent: "monitor_agent",
  status: "monitor_status",
  category: "monitor_category",
  date: "monitor_date",
} as const;

const agentOptions = [
  "All agents",
  "Review response agent",
  "Review generation agent",
  "Listing optimization agent",
  "Social publishing agent",
  "Social engagement agent",
  "Ticketing agent",
];

const statusOptions = [
  "All statuses",
  "Success",
  "Needs review",
  "Failed",
  "Processing",
];

const categoryOptions: ("All categories" | ActivityCategory)[] = [
  "All categories",
  "Customer interaction",
  "Automation",
  "Content publishing",
  "Data update",
  "System event",
  "Error",
];

const dateOptions = ["Today", "Last 7 days", "Last 30 days", "Custom range"];

/** Default filter schema for Agents Monitor (matches prior dropdowns). */
export const agentsMonitorFilterItems: FilterItem[] = [
  {
    id: AGENTS_MONITOR_FILTER_IDS.agent,
    label: "Agent",
    options: agentOptions,
  },
  {
    id: AGENTS_MONITOR_FILTER_IDS.status,
    label: "Status",
    options: statusOptions,
  },
  {
    id: AGENTS_MONITOR_FILTER_IDS.category,
    label: "Category",
    options: categoryOptions as string[],
  },
  {
    id: AGENTS_MONITOR_FILTER_IDS.date,
    label: "Date",
    options: dateOptions,
  },
];

export function createInitialAgentsMonitorFilters(): FilterItem[] {
  return cloneFilterItems(agentsMonitorFilterItems);
}
