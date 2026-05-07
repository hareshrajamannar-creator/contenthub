import type { AppView } from "@/app/App";

/** BirdAI routes: main canvas uses `AppShellContentPlaceholder` (product not in shell). */
const BIRDAI_MAIN_PLACEHOLDER: ReadonlySet<AppView> = new Set([
  "agents-monitor",
  "agents-analyze-performance",
  "agents-builder",
  "agent-detail",
  "agents-onboarding",
  "birdai-reports",
  "birdai-journeys",
]);

/** L2 column placeholder — excludes `agents-builder` (full-width, no L2 rail in app). */
const BIRDAI_L2_PLACEHOLDER: ReadonlySet<AppView> = new Set([
  "agents-monitor",
  "agents-analyze-performance",
  "agents-onboarding",
  "agent-detail",
  "birdai-reports",
  "birdai-journeys",
]);

export function birdAiShellShowsMainPlaceholder(view: AppView): boolean {
  return BIRDAI_MAIN_PLACEHOLDER.has(view);
}

export function birdAiShellShowsL2Placeholder(view: AppView): boolean {
  return BIRDAI_L2_PLACEHOLDER.has(view);
}
