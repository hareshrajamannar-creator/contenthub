import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, MoreVertical, Send, Star } from "lucide-react";
import { formatReviewDateRelative, ReviewBody } from "@/app/components/ReviewsView.v1";
import { ManusToolbarIconHit } from "@/app/components/ManusToolbarIconHit";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

/* ── Real photo sets using Unsplash (food / restaurant theme) ── */
const FOOD_PHOTOS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format",
];

const SINGLE_PHOTO = [FOOD_PHOTOS[0]];
const THREE_PHOTOS = FOOD_PHOTOS.slice(0, 3);

/* ── Lightbox ───────────────────────────────────────── */
function Lightbox({ photos, index, onClose, onPrev, onNext }: {
  photos: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none p-2 transition-colors"
      >
        ✕
      </button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {index + 1} / {photos.length}
      </div>
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <img
        src={photos[index]}
        alt={`Photo ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/* ── PhotoCarousel ──────────────────────────────────── */
function PhotoCarousel({ photos, visibleCount = 4 }: { photos: string[]; visibleCount?: number }) {
  const [offset, setOffset] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const canLeft  = offset > 0;
  const canRight = offset + visibleCount < photos.length;

  const visible = photos.slice(offset, offset + visibleCount + 1);

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex(i => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}

      <div className="relative w-full min-w-0">
        {canLeft ? (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-14 rounded-l-lg bg-gradient-to-r from-background from-35% to-transparent dark:from-[#1e2229]"
            aria-hidden
          />
        ) : null}
        {canRight ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 rounded-r-lg bg-gradient-to-l from-background from-35% to-transparent dark:from-[#1e2229]"
            aria-hidden
          />
        ) : null}

        <div className="flex gap-2 overflow-hidden rounded-lg">
          {visible.map((src, idx) => {
            const absIdx = offset + idx;
            return (
              <div
                key={absIdx}
                onClick={() => setLightboxIndex(absIdx)}
                className="relative h-[120px] w-[180px] shrink-0 cursor-pointer overflow-hidden rounded-lg"
              >
                <img
                  src={src}
                  alt={`Photo ${absIdx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://picsum.photos/seed/fallback${absIdx}/400/300`;
                  }}
                />
                <div className="pointer-events-none absolute inset-0 rounded-lg border border-border shadow-sm" />
              </div>
            );
          })}
        </div>

        {canLeft && (
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            className="absolute left-2 top-1/2 z-[2] flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted dark:bg-[#1e2229]/90 dark:hover:bg-muted"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(photos.length - visibleCount, o + 1))}
            className="absolute right-2 top-1/2 z-[2] flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted dark:bg-[#1e2229]/90 dark:hover:bg-muted"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   META + STORIES
   ══════════════════════════════════════════════════════ */
const meta: Meta = {
  title: "UI/PhotoCarousel",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "7 photos — scroll + lightbox",
  render: () => (
    <div className="max-w-[800px]">
      <PhotoCarousel photos={FOOD_PHOTOS} />
    </div>
  ),
};

export const ThreePhotos: Story = {
  name: "3 photos — no scroll needed",
  render: () => (
    <div className="max-w-[800px]">
      <PhotoCarousel photos={THREE_PHOTOS} />
    </div>
  ),
};

export const SinglePhoto: Story = {
  name: "1 photo",
  render: () => (
    <div className="max-w-[800px]">
      <PhotoCarousel photos={SINGLE_PHOTO} />
    </div>
  ),
};

export const CustomVisibleCount: Story = {
  name: "2 visible at a time",
  render: () => (
    <div className="max-w-[400px]">
      <PhotoCarousel photos={FOOD_PHOTOS} visibleCount={2} />
    </div>
  ),
};

/** Matches `ReviewCard` header: gold stars, relative date; `nowMs` fixed for stable Storybook copy. */
function ReviewCardHeaderDemoStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px] shrink-0" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-[14px] w-[14px] ${filled ? "fill-[#D4A017] stroke-[#D4A017]" : "fill-none stroke-[#D4A017]"}`}
            strokeWidth={filled ? 0 : L1_STRIP_ICON_STROKE_PX}
            absoluteStrokeWidth={!filled}
          />
        );
      })}
    </div>
  );
}

export const InReviewCard: Story = {
  name: "In review card context",
  render: () => {
    const storyNow = new Date("2026-04-09T12:00:00Z").getTime();
    const posted = formatReviewDateRelative("Jan 7, 2023", storyNow);
    return (
      <div className="max-w-[800px] bg-white dark:bg-card rounded-xl border border-border p-6 flex flex-col gap-4">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e1306c] text-sm font-semibold text-white">
              A
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[13px] font-semibold leading-tight text-foreground">Arya Stark</span>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <ReviewCardHeaderDemoStars rating={5} />
                <span className="text-[#555] dark:text-[#8b92a5]" title="Jan 7, 2023">
                  {posted}
                </span>
                <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                <span className="text-[#555] dark:text-[#8b92a5]">12 photos</span>
                <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                <div className="rounded-[4px] bg-[#eaeaea] px-2 py-0.5 dark:bg-[#333a47]">
                  <span className="text-[12px] text-[#212121] dark:text-[#e4e4e4]">Featured</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#555] dark:text-[#8b92a5]">
            <span className="whitespace-nowrap">2 employees</span>
            <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
            <span className="whitespace-nowrap">Georgia</span>
          </div>
        </div>
        <ReviewBody text="I had a great time here, the place is situated near Wagle circle. It has top notch ambience and a really cool vibe. The food and drinks were pretty good and I would definitely recommend this to all the non veg lovers. The restaurant is pretty big and can accommodate a huge crowd with indoor as well as outdoor seating.\n\nMy personal favorites were the desserts, especially the DIY cake station where you pick toppings and sauces. The staff explained every course without rushing us, and water refills were constant without having to wave someone down. We also tried the chef’s special grill platter: smoky, tender, and seasoned well without hiding the ingredients.\n\nIf I had to nitpick, the music near the bar was a touch loud for conversation, but tables farther in were perfect. Parking nearby can fill up on weekends, so plan a few extra minutes. Overall this was one of the better dining experiences I have had in the area, and I would gladly return with friends or family. Would definitely visit again! ❤️" />
        <PhotoCarousel photos={FOOD_PHOTOS} />
        <div className="rounded-lg bg-muted/50 p-4 text-[13px] leading-[18px] text-muted-foreground">
          <span className="text-[12px] text-muted-foreground">BirdAI suggested reply · </span>
          We appreciate your feedback! Thank you for taking the time to share your experience with us.
        </div>
        <div className="flex w-full flex-wrap items-center gap-1">
          <ManusToolbarIconHit aria-label="Post reply" title="Post reply">
            <Send
              width={L1_STRIP_ICON_SIZE}
              height={L1_STRIP_ICON_SIZE}
              strokeWidth={1.2}
              absoluteStrokeWidth
              className="shrink-0"
              aria-hidden
            />
          </ManusToolbarIconHit>
          <ManusToolbarIconHit aria-label="Open chat" title="Open chat">
            <MessageCircle
              width={L1_STRIP_ICON_SIZE}
              height={L1_STRIP_ICON_SIZE}
              strokeWidth={1.2}
              absoluteStrokeWidth
              className="shrink-0"
              aria-hidden
            />
          </ManusToolbarIconHit>
          <ManusToolbarIconHit aria-label="More actions" title="More actions">
            <MoreVertical
              width={L1_STRIP_ICON_SIZE}
              height={L1_STRIP_ICON_SIZE}
              strokeWidth={1.2}
              absoluteStrokeWidth
              className="shrink-0"
              aria-hidden
            />
          </ManusToolbarIconHit>
        </div>
      </div>
    );
  },
};
