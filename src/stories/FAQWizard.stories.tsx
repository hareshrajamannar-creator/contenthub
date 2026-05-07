import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FAQWizard } from "@/app/components/content-hub/faq/FAQWizard";

const meta: Meta<typeof FAQWizard> = {
  title: "App/FAQWizard",
  component: FAQWizard,
};
export default meta;
type Story = StoryObj<typeof FAQWizard>;

const Controlled = ({ withBanner }: { withBanner?: boolean }) => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 border rounded text-sm"
      >
        Open FAQ Wizard
      </button>
      <FAQWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithPrerequisiteBanner: Story = {
  render: () => {
    // Override hook mock inline by rendering a story that swaps hasBrandKit
    // The real banner appears when hasBrandKit=false; shown here via doc notes.
    // To trigger: temporarily set hasBrandKit: false in useFAQPrerequisiteCheck.ts
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Set <code>hasBrandKit: false</code> in{" "}
        <code>useFAQPrerequisiteCheck.ts</code> to preview the amber banner.
        <Controlled />
      </div>
    );
  },
};
