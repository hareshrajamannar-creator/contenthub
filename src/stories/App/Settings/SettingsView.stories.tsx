import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SettingsView } from "@/app/components/SettingsView.v1";

function SettingsViewDemo({ initialSearch = "" }: { initialSearch?: string }) {
  const [activeSection, setActiveSection] = useState("Business info");
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  // Pre-seed the search for the "Searched" story
  if (initialSearch) {
    sessionStorage.setItem("settings:search", JSON.stringify(initialSearch));
  }

  return (
    <div className="h-[700px] flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <SettingsView
        scrollTarget={scrollTarget}
        onScrollTargetConsumed={() => setScrollTarget(null)}
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
      />
    </div>
  );
}

const meta: Meta<typeof SettingsViewDemo> = {
  title: "App/Settings/SettingsView",
  component: SettingsViewDemo,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SettingsViewDemo>;

export const Default: Story = {};

export const Searched: Story = {
  args: { initialSearch: "agent" },
};

export const EmptySearchResult: Story = {
  args: { initialSearch: "zzznomatch" },
};
