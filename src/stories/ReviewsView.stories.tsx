import type { Meta, StoryObj } from "@storybook/react";
import { ReviewsView } from "@/app/components/ReviewsView";

const meta: Meta<typeof ReviewsView> = {
  title: "App/Views/ReviewsView",
  component: ReviewsView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Reviews module list. Each **ReviewCard** header stacks **reviewer name** (semibold) on the first line, then **gold star rating** (filled + outlined empties) with a **relative date** on the second line. Review copy is **word-safe** clamped at five lines with **View more** / **View less** when needed. **CTAs** use a **Manus-style** plain toolbar: **no top rule**, **icon-only** (**Send** / **Pencil**, **MessageCircle**, **MoreVertical**) on **`ManusToolbarIconHit`** with **semantic** muted colors and **`hover:bg-muted`**. Photo thumbnails use click-to-lightbox only—no hover “View” overlay.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewsView>;

export const Default: Story = {};
