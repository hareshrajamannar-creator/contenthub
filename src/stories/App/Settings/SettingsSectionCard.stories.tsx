import type { Meta, StoryObj } from "@storybook/react";
import { SettingsSectionCard } from "@/app/components/settings/SettingsSectionCard";
import { SETTINGS_SECTIONS } from "@/app/components/settings/settingsLandingData";

const meta: Meta<typeof SettingsSectionCard> = {
  title: "App/Settings/SettingsSectionCard",
  component: SettingsSectionCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SettingsSectionCard>;

export const Default: Story = {
  args: { section: SETTINGS_SECTIONS[0] }, // Business info
};

export const WithFourItems: Story = {
  args: { section: SETTINGS_SECTIONS[1] }, // Knowledge
};

export const WithBanner: Story = {
  args: { section: SETTINGS_SECTIONS[2] }, // Integrations
};

export const SingleItem: Story = {
  args: { section: SETTINGS_SECTIONS[3] }, // BirdAI
};

export const WithAgentStatus: Story = {
  args: { section: SETTINGS_SECTIONS[4] }, // AI agents
};

export const WithNewBadge: Story = {
  args: {
    section: {
      ...SETTINGS_SECTIONS[2],
      items: SETTINGS_SECTIONS[2].items.slice(-2), // All apps + API
    },
  },
};
