import type { Meta, StoryObj } from "@storybook/react";
import { SocialEditor } from "@/app/components/content-hub/social/SocialEditor";

const meta: Meta<typeof SocialEditor> = {
  title: "App/ContentHub/SocialEditor",
  component: SocialEditor,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SocialEditor>;

export const Default: Story = {
  args: {
    platform: "instagram",
    initialCaption: "",
    initialHashtags: "",
    onBack: () => {},
    onPublish: () => {},
  },
};

export const WithContent: Story = {
  args: {
    platform: "instagram",
    initialCaption:
      "Transform your outdoor space this season 🌿 Our design team is ready to bring your vision to life — from drought-resistant gardens to full yard makeovers. Book a free consultation today.",
    initialHashtags:
      "#Landscaping #OutdoorLiving #GardenDesign #SustainableLandscaping",
    onBack: () => {},
    onPublish: () => {},
  },
};

export const LinkedInVariant: Story = {
  args: {
    platform: "linkedin",
    initialCaption:
      "Proud to complete 50+ commercial landscaping projects this quarter. Eco-friendly design that enhances curb appeal while reducing environmental footprint.",
    initialHashtags: "#CommercialLandscaping #Sustainability",
    onBack: () => {},
    onPublish: () => {},
  },
};
