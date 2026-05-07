import type { Meta, StoryObj } from "@storybook/react";
import { BlogEditor } from "@/app/components/content-hub/blog/BlogEditor";

const meta: Meta<typeof BlogEditor> = {
  title: "App/ContentHub/BlogEditor",
  component: BlogEditor,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof BlogEditor>;

export const Default: Story = {
  args: {
    onBack: () => {},
    onPublish: () => {},
  },
};

export const WithCustomContent: Story = {
  args: {
    initialTitle: "5 Ways to Improve Your Google Maps Ranking in 2025",
    initialBody:
      "Google Maps ranking is determined by three primary factors: relevance, distance, and prominence. Here's how to optimize each for your local business.\n\n## 1. Keep your Google Business Profile complete\n\nA fully filled profile ranks significantly higher than an incomplete one.\n\n## 2. Collect and respond to reviews consistently\n\nRecent, high-volume review activity is a strong local ranking signal.\n\n## 3. Add photos regularly\n\nBusinesses with photos receive 42% more requests for directions.",
    onBack: () => {},
    onPublish: () => {},
  },
};
