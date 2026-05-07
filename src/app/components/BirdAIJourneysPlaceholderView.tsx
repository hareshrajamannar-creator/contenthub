/**
 * Placeholder main content for Journeys L2 leaves that do not yet have a dedicated screen.
 */

import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";

const LEAF_TITLE: Record<string, string> = {
  "Agents/campaign": "Campaign agents",
  "Settings/channels": "Channels",
  "Settings/templates": "Templates",
  "Settings/knowledge": "Knowledge",
  "Settings/memory": "Memory",
  "Settings/comm-restriction": "Communication restriction",
  "Settings/manage-tags": "Manage tags",
};


function titleFromKey(journeysL2Key: string): string {
  return LEAF_TITLE[journeysL2Key] ?? journeysL2Key.replace(/\//g, " · ");
}

export function BirdAIJourneysPlaceholderView({ journeysL2Key }: { journeysL2Key: string }) {
  const title = titleFromKey(journeysL2Key);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background transition-colors">
      <MainCanvasViewHeader
        title={title}
        description="This Journeys area is not wired to a full experience yet. Navigation and the Storybook scorecard reflect the target IA from design."
      />
    </div>
  );
}
