import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  type SheetFloatingSize,
} from "@/app/components/ui/sheet";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";

const meta: Meta = {
  title: "UI/Sheet",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Floating **side panels** only: **Radix `Sheet`** with `side=\"right\"`, `inset=\"floating\"`, and `floatingSize` (**sm** 340px, **md** 480px, **lg** 640px, **xl** ~85vw capped with `calc(100vw-2rem)`). Inset from top, right, and bottom with rounded corners; **`SheetContent`** has **no** outer **border** (edge and floating variants use **`shadow-lg`** only). **Backdrop:** same Aero scrim as Dialog — **`MODAL_OVERLAY_VISUAL_CLASS`** (light `backdrop-blur-[2px]` + semantic tint from `@/app/components/ui/modalOverlayClasses`), not `bg-black/*`. Dismiss with the **top-right** close control on **`SheetContent`** (single close affordance; avoid duplicating it in the footer). Prefer **`FloatingSheetFrame`** (`@/app/components/layout/FloatingSheetFrame`) for edging header, scrollable body only, and sticky footer actions; set **`SheetContent`** `className` to include **`FLOATING_SHEET_FRAME_CONTENT_CLASS`** (`overflow-hidden`) so the frame body owns vertical scroll. For a full product example on **medium** (profile + password), see **App/Settings/Account settings**. For **xl**, you can split the frame body into a fixed-width form column (~**lg** / 640px) plus a flexible preview column — see **Extra large with preview**.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function floatingSizeWidthDescription(floatingSize: SheetFloatingSize): string {
  switch (floatingSize) {
    case "sm":
      return "340px max width, capped on narrow viewports";
    case "md":
      return "480px max width, capped on narrow viewports";
    case "lg":
      return "640px max width, capped on narrow viewports";
    case "xl":
      return "~85vw width, capped at calc(100vw - 2rem) on narrow viewports";
    default: {
      const _exhaustive: never = floatingSize;
      return _exhaustive;
    }
  }
}

function FloatingPlaceholder({
  floatingSize,
  title,
}: {
  floatingSize: SheetFloatingSize;
  title: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open {title.toLowerCase()} panel</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize={floatingSize}
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title={title}
          description={
            <>
              Generic floating shell — <strong>{floatingSize}</strong> (
              {floatingSizeWidthDescription(floatingSize)}).
            </>
          }
          primaryAction={{
            label: "Continue",
            onClick: () => {
              // Storybook demo only
            },
          }}
        >
          <p className="text-sm text-muted-foreground">
            Only this region changes per feature. Pass <code className="text-xs">floatingSize</code>{" "}
            on <code className="text-xs">SheetContent</code>.
          </p>
          <div className="mt-8 flex flex-col gap-4 text-sm text-muted-foreground">
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>
                Scrollable body line {i + 1} — header and footer stay fixed while this area scrolls.
              </p>
            ))}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

export const Small: Story = {
  render: () => <FloatingPlaceholder floatingSize="sm" title="Small panel" />,
};

export const Medium: Story = {
  render: () => <FloatingPlaceholder floatingSize="md" title="Medium panel" />,
};

export const Large: Story = {
  render: () => <FloatingPlaceholder floatingSize="lg" title="Large panel" />,
};

export const ExtraLarge: Story = {
  name: "Extra large",
  render: () => <FloatingPlaceholder floatingSize="xl" title="Extra large panel" />,
};

function PreviewMockPage({
  variant,
}: {
  variant: "cover" | "summary" | "detail";
}) {
  return (
    <div
      className="w-full shrink-0 overflow-hidden rounded-md bg-background shadow-sm"
      style={{ aspectRatio: "1 / 1.4142" }}
    >
      <div className="flex h-full min-h-0 flex-col p-4">
        {variant === "cover" ? (
          <>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="h-8 w-8 rounded-md bg-primary/15" aria-hidden />
              <p className="text-xs font-medium text-foreground">Profile performance report</p>
              <p className="text-[10px] text-muted-foreground">Social media analytics overview</p>
              <div className="mt-2 flex flex-col gap-1 text-[9px] text-muted-foreground">
                <span>July 10, 2025</span>
                <span>30 locations</span>
              </div>
            </div>
            <p className="text-center text-[9px] text-muted-foreground">Cover</p>
          </>
        ) : variant === "summary" ? (
          <>
            <div className="mb-3 h-2 w-12 rounded-sm bg-primary/40" aria-hidden />
            <h3 className="mb-1 text-[10px] font-medium text-foreground">Executive summary</h3>
            <p className="mb-3 text-[9px] leading-relaxed text-muted-foreground">
              Overview of profile performance over the last 30 days with positive trends across
              platforms.
            </p>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-sm bg-muted" aria-hidden />
              <div className="h-2 w-[80%] rounded-sm bg-muted" aria-hidden />
              <div className="h-2 w-full rounded-sm bg-muted" aria-hidden />
            </div>
            <p className="mt-auto pt-4 text-center text-[9px] text-muted-foreground">Summary</p>
          </>
        ) : (
          <>
            <p className="mb-2 text-[10px] font-medium text-foreground">Performance detail</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 rounded-sm bg-muted/80" aria-hidden />
              <div className="h-16 rounded-sm bg-muted/80" aria-hidden />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-2 w-full rounded-sm bg-muted" aria-hidden />
              <div className="h-2 w-full rounded-sm bg-muted" aria-hidden />
            </div>
            <p className="mt-auto pt-4 text-center text-[9px] text-muted-foreground">Detail</p>
          </>
        )}
      </div>
    </div>
  );
}

function ExtraLargeWithPreviewDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open extra large panel with preview</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="xl"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Export report"
          description="Configure the export on the left; preview updates on the right."
          classNames={{
            body: "flex min-h-0 flex-1 flex-col overflow-hidden p-0",
          }}
          primaryAction={{
            label: "Export",
            onClick: () => {
              // Storybook demo only
            },
          }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => {
              // Storybook demo only
            },
          }}
        >
          <div className="flex min-h-0 flex-1 flex-row">
            <div className="w-full max-w-[640px] shrink-0 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sheet-preview-report-title">Report title</Label>
                  <Input
                    id="sheet-preview-report-title"
                    defaultValue="Profile performance report"
                    placeholder="Report title"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sheet-preview-subtitle">Subtitle</Label>
                  <Input
                    id="sheet-preview-subtitle"
                    defaultValue="Social media analytics overview"
                    placeholder="Subtitle"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Demo only — left column matches <strong>lg</strong> width (640px max); preview
                  uses the remaining space inside <strong>xl</strong>.
                </p>
              </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/40">
              <div className="flex h-[38px] shrink-0 items-center justify-between px-4">
                <span className="text-[10px] font-medium text-muted-foreground">Preview</span>
                <span className="text-[10px] text-muted-foreground">3 pages</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-4">
                  <PreviewMockPage variant="cover" />
                  <PreviewMockPage variant="summary" />
                  <PreviewMockPage variant="detail" />
                </div>
              </div>
            </div>
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

export const ExtraLargeWithPreview: Story = {
  name: "Extra large with preview",
  render: () => <ExtraLargeWithPreviewDemo />,
};
