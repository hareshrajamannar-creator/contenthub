import type { Meta, StoryObj } from "@storybook/react";
import { EmailEditor } from "@/app/components/content-hub/email/EmailEditor";

const meta: Meta<typeof EmailEditor> = {
  title: "App/ContentHub/EmailEditor",
  component: EmailEditor,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof EmailEditor>;

export const Default: Story = {
  args: {
    initialSubjects: ["Your spring offer is ready, {{first_name}}"],
    initialBody: "",
    onBack: () => {},
    onPublish: () => {},
  },
};

export const WithContent: Story = {
  args: {
    initialSubjects: [
      "Your spring offer is ready, {{first_name}} 🌿",
      "Transform your yard this season — exclusive offer inside",
    ],
    initialBody:
      "Hi {{first_name}},\n\nSpring is here and there's no better time to bring your outdoor vision to life.\n\nBook your free consultation this week and get 10% off.",
    onBack: () => {},
    onPublish: () => {},
  },
};
