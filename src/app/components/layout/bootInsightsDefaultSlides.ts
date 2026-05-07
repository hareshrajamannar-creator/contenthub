import type { BootInsightSlide } from "./bootInsightTypes";

/**
 * Demo copy for boot / auth loading surfaces. Replace with live data when APIs exist.
 */
export const bootInsightsDefaultSlides: BootInsightSlide[] = [
  {
    kind: "metrics",
    id: "reviews-overview",
    tag: "product",
    columns: [
      { label: "Reviews", value: "1,248", hint: "Across connected sites" },
      { label: "Review rate", value: "12%", hint: "Of eligible customers" },
      { label: "Avg. rating", value: "4.3", hint: "Was 4.2 last month" },
    ],
  },
  {
    kind: "message",
    id: "social-engagement",
    tag: "product",
    title: "10 posts published — collecting reach and engagements",
    body: "Bird AI keeps your social performance in one place so you can spot what resonates.",
  },
  {
    kind: "message",
    id: "shortcuts",
    tag: "shortcut",
    title: "Press ? or ⌘K anytime to open keyboard shortcuts",
    body: "Jump views with chords like G then V for Reviews or G then T for Ticketing.",
  },
  {
    kind: "message",
    id: "auto-admin",
    tag: "automation",
    title: "Auto-admin messages run across reviews, inbox, and campaigns",
    body: "Set tone and guardrails once; Bird AI drafts and routes consistent replies where you allow it.",
  },
  {
    kind: "message",
    id: "product-pitch",
    tag: "product",
    title: "Bird AI is your operating layer for reputation, messaging, and growth",
    body: "One shell for reviews, agents, schedules, and reports — tuned for local and multi-location teams.",
  },
];
