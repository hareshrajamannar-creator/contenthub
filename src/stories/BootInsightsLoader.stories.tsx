import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { BootInsightsLoader } from "@/app/components/layout/BootInsightsLoader";
import { bootInsightsDefaultSlides } from "@/app/components/layout/bootInsightsDefaultSlides";
import type { BootInsightSlide } from "@/app/components/layout/bootInsightTypes";
import { AppBootShimmer } from "@/app/components/layout/AppBootShimmer";

const customSlides: BootInsightSlide[] = [
  {
    kind: "message",
    id: "custom-a",
    tag: "product",
    title: "Custom loader copy for this flow",
    body: "Pass any `slides` array to `BootInsightsLoader` — same motion and a11y shell.",
  },
  {
    kind: "metrics",
    id: "custom-b",
    columns: [
      { label: "North star", value: "42", hint: "Demo metric" },
      { label: "Latency", value: "120 ms", hint: "p95" },
      { label: "Uptime", value: "99.9%", hint: "Last 30 days" },
    ],
  },
];

const canvasDecorator: Meta<typeof BootInsightsLoader>["decorators"] = [
  (Story) => (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Story />
    </div>
  ),
];

const meta: Meta<typeof BootInsightsLoader> = {
  title: "UI/BootInsightsLoader",
  component: BootInsightsLoader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Rotating boot insights for auth delay and post-login shell. Enable **prefers-reduced-motion** in your OS to verify instant transitions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BootInsightsLoader>;

export const Default: Story = {
  decorators: canvasDecorator,
  args: {
    slides: bootInsightsDefaultSlides,
    intervalMs: 2800,
  },
};

export const CustomSlides: Story = {
  decorators: canvasDecorator,
  args: {
    slides: customSlides,
    intervalMs: 2400,
  },
};

/** Parent-driven index (no internal interval). */
export const Controlled: Story = {
  decorators: canvasDecorator,
  render: function ControlledStory() {
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
      const id = window.setInterval(() => {
        setActiveIndex((i) => (i + 1) % customSlides.length);
      }, 2000);
      return () => window.clearInterval(id);
    }, []);
    return (
      <BootInsightsLoader
        slides={customSlides}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
      />
    );
  },
};

export const EmbeddedInAppBootShimmer: Story = {
  render: () => <AppBootShimmer bootInsightsIntervalMs={560} />,
  parameters: {
    layout: "fullscreen",
  },
};
