import type { Meta, StoryObj } from "@storybook/react";
import { ContentCard, DIMENSIONS_BY_TYPE } from "@/app/components/content-hub/shared/ContentCard";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive plausible dimension scores spread around editorialScore */
function dims(type: keyof typeof DIMENSIONS_BY_TYPE, score: number) {
  const labels = DIMENSIONS_BY_TYPE[type];
  const offsets = [5, -3, 2, -4];
  return labels.map((label, i) => ({
    label,
    score: Math.min(100, Math.max(0, score + offsets[i])),
  }));
}

const noop = () => {};
const handlers = {
  onSelect:         noop,
  onEdit:           noop,
  onRegenerate:     noop,
  onSchedule:       noop,
  onExport:         noop,
  onComment:        noop,
  onHistory:        noop,
  onClone:          noop,
  onDelete:         noop,
  onPositionChange: noop,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ContentCard> = {
  title: "App/ContentHub/ContentCard",
  component: ContentCard,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 300, width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentCard>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const FAQReady: Story = {
  args: {
    ...handlers,
    contentId: "faq-1",
    type: "faq",
    primaryText: "How do I respond to a negative review on Google?",
    secondaryText:
      "You should respond within 24 hours, acknowledge the feedback, and offer a direct resolution. Avoid generic copy-paste replies—personalize each response to show genuine care.",
    editorialScore: 88,
    lowestDimension: "Originality",
    secondaryScore: 74,
    dimensions: dims("faq", 88),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const FAQNeedsWork: Story = {
  args: {
    ...handlers,
    contentId: "faq-2",
    type: "faq",
    primaryText: "Can I delete a Google review?",
    secondaryText:
      "Business owners cannot delete reviews directly. You can flag reviews that violate Google's policies for removal.",
    editorialScore: 72,
    lowestDimension: "Brand voice",
    secondaryScore: 61,
    dimensions: dims("faq", 72),
    status: "needs-work",
    warnings: ["Brand voice mismatch detected"],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const FAQBlocked: Story = {
  args: {
    ...handlers,
    contentId: "faq-3",
    type: "faq",
    primaryText: "What is Birdeye's refund policy?",
    secondaryText:
      "All subscription fees are non-refundable after 30 days of the billing cycle.",
    editorialScore: 58,
    lowestDimension: "Factual accuracy",
    dimensions: dims("faq", 58),
    status: "blocked",
    warnings: ["Potential factual inaccuracy", "Legal review required"],
    hardBlock: true,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const SocialReady: Story = {
  args: {
    ...handlers,
    contentId: "social-1",
    type: "social",
    platform: "instagram",
    primaryText:
      "Your reputation is your strongest asset. 🌟 See how top local businesses are turning reviews into revenue.",
    secondaryText:
      "#ReputationManagement #LocalBusiness #CustomerExperience #Birdeye #GrowthStrategy",
    editorialScore: 91,
    lowestDimension: "Visual alignment",
    secondaryScore: 82,
    dimensions: dims("social", 91),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const EmailReady: Story = {
  args: {
    ...handlers,
    contentId: "email-1",
    type: "email",
    primaryText: "Your Q2 reputation report is ready — here's what changed",
    secondaryText:
      "Hi {{first_name}}, your review volume is up 18% this quarter. See which locations are outperforming expectations and where you can improve.",
    editorialScore: 86,
    lowestDimension: "Personalization",
    secondaryScore: 34,
    dimensions: dims("email", 86),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const BlogReady: Story = {
  args: {
    ...handlers,
    contentId: "blog-1",
    type: "blog",
    primaryText: "How Local Businesses Are Winning With AI-Powered Review Responses",
    secondaryText:
      "In a world where 93% of consumers read online reviews before making a purchase, the speed and quality of your responses can make or break your reputation. Learn how businesses like yours are using AI to respond faster and smarter.",
    editorialScore: 89,
    lowestDimension: "SEO optimization",
    secondaryScore: 77,
    dimensions: dims("blog", 89),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const ResponseReady: Story = {
  args: {
    ...handlers,
    contentId: "resp-1",
    type: "response",
    primaryText: "Thank you for the kind words, Sarah!",
    secondaryText:
      "We're so glad your experience at our downtown location was exceptional. Our team works hard every day to make sure every visit feels personal. We'd love to see you again soon!",
    editorialScore: 93,
    lowestDimension: "Empathy",
    dimensions: dims("response", 93),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const Generating: Story = {
  args: {
    ...handlers,
    contentId: "gen-1",
    type: "faq",
    primaryText: "",
    secondaryText: "",
    editorialScore: 0,
    lowestDimension: "",
    dimensions: [],
    status: "generating",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    ...handlers,
    contentId: "faq-sel",
    type: "faq",
    primaryText: "How often should I ask customers for reviews?",
    secondaryText:
      "Best practice is to request reviews within 24–48 hours after a positive interaction. Avoid asking too frequently — once per transaction is ideal.",
    editorialScore: 85,
    lowestDimension: "Content readability",
    secondaryScore: 70,
    dimensions: dims("faq", 85),
    status: "ready",
    warnings: [],
    hardBlock: false,
    position: { x: 0, y: 0 },
    selected: true,
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 380, width: 560, paddingTop: 60 }}>
        <Story />
      </div>
    ),
  ],
};
