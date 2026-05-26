import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { BlogSectionCanvas } from "@/app/components/content-hub/blog/BlogSectionCanvas";
import type { BlogSection } from "@/app/components/content-hub/blog/BlogInlineCreationFlow";

// ── Mock data helpers ─────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: BlogSection[] = [
  { id: "b1", heading: "How search has changed in 2026", description: "AI search now delivers one citation-backed answer — not a ranked list of links", wordCount: 200 },
  { id: "b2", heading: "The AI trust stack", description: "How AI engines decide which brands to cite: owned content, profiles, citations, and reviews", wordCount: 300 },
  { id: "b3", heading: "What content gets you cited", description: "FAQ pages, location pages, and structured service content consistently outperform generic copy", wordCount: 500 },
  { id: "b4", heading: "Five actions for enterprise brands", description: "The highest-leverage steps to improve AI citation share across all locations", wordCount: 400 },
  { id: "b5", heading: "How to measure AI search visibility", description: "Tracking answer presence, citation share, and coverage gaps across ChatGPT, Gemini, and Perplexity", wordCount: 300 },
];

const SHORT_SECTIONS: BlogSection[] = [
  { id: "s1", heading: "What is AI search optimization?", description: "The shift from ranking in links to being cited in synthesized answers", wordCount: 150 },
  { id: "s2", heading: "Three steps to get started", description: "The most actionable starting points for multi-location brands", wordCount: 200 },
];

const LONG_SECTIONS: BlogSection[] = [
  { id: "l1", heading: "The state of AI search in 2026", description: "Industry landscape: who is being cited, who is invisible, and why it matters now", wordCount: 400 },
  { id: "l2", heading: "How AI platforms select citations", description: "The signals LLMs use to choose which brands appear in generated answers", wordCount: 350 },
  { id: "l3", heading: "Building owned content that AI trusts", description: "Website structure, FAQ pages, and service pages written for answer engines", wordCount: 450 },
  { id: "l4", heading: "Profile and citation consistency at scale", description: "Google Business Profile, Apple Business Connect, and directory accuracy across all locations", wordCount: 400 },
  { id: "l5", heading: "How reviews influence AI recommendations", description: "Ratings, sentiment, and review volume as trust signals in AI search", wordCount: 300 },
  { id: "l6", heading: "Measuring AI search visibility", description: "Answer presence, citation share, and gap analysis across ChatGPT, Gemini, and Perplexity", wordCount: 500 },
  { id: "l7", heading: "Your 30-day AEO action plan", description: "A practical roadmap to start improving AI search citation share immediately", wordCount: 350 },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof BlogSectionCanvas> = {
  title: "App/BlogSectionCanvas",
  component: BlogSectionCanvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Post-generation blog editor canvas. Mirrors FAQSectionCanvas with a hero block, rich content blocks (headings, paragraphs, bullets, images, callouts, quotes), left AI/Manual panel, floating toolbar, and right-side score panel.",
      },
    },
  },
  decorators: [
    Story => (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BlogSectionCanvas>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    sections: DEFAULT_SECTIONS,
    generationLabel: "State of AI Search 2026 — Birdeye brand identity",
  },
};

export const Short_post: Story = {
  name: "Short post",
  args: {
    sections: SHORT_SECTIONS,
    generationLabel: "AI search intro post",
  },
};

export const Long_form: Story = {
  name: "Long-form post",
  args: {
    sections: LONG_SECTIONS,
    generationLabel: "In-depth AI search guide — 3,500 words",
  },
};

export const No_generation_label: Story = {
  name: "No generation label",
  args: {
    sections: DEFAULT_SECTIONS,
  },
};

export const Text_editing_toolbar: Story = {
  name: "Text editing toolbar",
  args: {
    sections: DEFAULT_SECTIONS,
    generationLabel: "State of AI Search 2026 — Birdeye brand identity",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("How search has changed in 2026"));
  },
};

export const Manual_block_tabs: Story = {
  name: "Manual block tabs",
  args: {
    sections: DEFAULT_SECTIONS,
    generationLabel: "State of AI Search 2026 — Birdeye brand identity",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Manual" }));
    await userEvent.click(canvas.getByRole("button", { name: "Pre-built" }));
  },
};
