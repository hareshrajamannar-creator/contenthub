import type { Meta, StoryObj } from "@storybook/react";
import { BlogSectionCanvas } from "@/app/components/content-hub/blog/BlogSectionCanvas";
import type { BlogSection } from "@/app/components/content-hub/blog/BlogInlineCreationFlow";

// ── Mock data helpers ─────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: BlogSection[] = [
  { id: "b1", heading: "Introduction", description: "Set the scene and introduce the main topic", wordCount: 200 },
  { id: "b2", heading: "Why this matters in 2024", description: "Context and urgency for the reader", wordCount: 300 },
  { id: "b3", heading: "Key strategies and best practices", description: "Core actionable advice with examples", wordCount: 500 },
  { id: "b4", heading: "Real-world examples", description: "Case studies and proof points", wordCount: 400 },
  { id: "b5", heading: "How to get started", description: "Step-by-step action plan for readers", wordCount: 300 },
];

const SHORT_SECTIONS: BlogSection[] = [
  { id: "s1", heading: "Overview", description: "A short introduction to the topic", wordCount: 150 },
  { id: "s2", heading: "Key takeaways", description: "The main points readers should remember", wordCount: 200 },
];

const LONG_SECTIONS: BlogSection[] = [
  { id: "l1", heading: "The state of customer experience in 2024", description: "Industry landscape and key trends", wordCount: 400 },
  { id: "l2", heading: "The psychology of loyalty", description: "Why customers return and what drives defection", wordCount: 350 },
  { id: "l3", heading: "Building a customer-first culture", description: "Organisational change and leadership alignment", wordCount: 450 },
  { id: "l4", heading: "Technology and personalisation at scale", description: "AI-powered tools and automation strategies", wordCount: 400 },
  { id: "l5", heading: "Measuring what matters", description: "Metrics, KPIs, and reporting frameworks", wordCount: 300 },
  { id: "l6", heading: "Case studies from leading brands", description: "Concrete examples of CX transformations", wordCount: 500 },
  { id: "l7", heading: "Your 90-day roadmap", description: "An actionable plan to start immediately", wordCount: 350 },
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
    generationLabel: "Customer experience guide — Olive Garden brand kit",
  },
};

export const Short_post: Story = {
  name: "Short post",
  args: {
    sections: SHORT_SECTIONS,
    generationLabel: "Brief overview post",
  },
};

export const Long_form: Story = {
  name: "Long-form post",
  args: {
    sections: LONG_SECTIONS,
    generationLabel: "In-depth CX guide — 3,500 words",
  },
};

export const No_generation_label: Story = {
  name: "No generation label",
  args: {
    sections: DEFAULT_SECTIONS,
  },
};
