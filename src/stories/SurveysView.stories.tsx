import type { Meta, StoryObj } from "@storybook/react";
import { SurveysView } from "@/app/components/SurveysView";

const meta: Meta<typeof SurveysView> = {
  title: "App/Views/SurveysView",
  component: SurveysView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Surveys product view. Migrated from `UI-web-2.0/src/app/pages/surveys/`. " +
          "Directory of ~50 mocked surveys with infinite scroll (IntersectionObserver on the list scroll root), " +
          "shimmer placeholder rows while the next page loads, and a sticky toolbar (search, filters, columns). " +
          "Survey table columns: name, type badge, status, sent, responses, completion bar, NPS score, " +
          "last updated, owner, ⋯ actions. Row click or View reports opens a floating medium Sheet (FloatingSheetFrame) with stats, NPS breakdown, questions, recent responses, and footer actions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SurveysView>;

export const Default: Story = {};
