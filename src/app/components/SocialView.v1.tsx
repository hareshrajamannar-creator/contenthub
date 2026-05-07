import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  MoreHorizontal,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import { cn } from "@/app/components/ui/utils";
import { SocialPostPreviewSheet } from "@/app/components/social/SocialPostPreviewSheet";
import {
  type SocialCalendarPost,
  SocialPostPlatformIcon,
  SocialPostPreviewBody,
} from "@/app/components/social/socialPostShared";

/* ─── Post action icons (v2.7 inline SVGs) ─── */
function EditIcon() {
  return (
    <svg className="h-[14px] w-[14px]" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M8.38.58a1.92 1.92 0 012.83 0 1.92 1.92 0 010 2.83L3.78 10.83l-3.22.94.94-3.22L8.38.58z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 5h12M4 1v2m6-2v2M2 3h10a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

type ViewMode = "list" | "week" | "month";

const imgFrame1000003570 = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003571 = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003572 = "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003573 = "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003574 = "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop&auto=format";
const imgRectangle4668 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format";
const imgRectangle4669 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format";
const imgBitmapCopy1 = "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop&auto=format";
const imgDentalOffice = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop&auto=format";
const imgSmile = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop&auto=format";

/* ─── Mock copy (Aspen Dental–style practice social) ─── */
const POST_TEXT =
  "Healthy smiles start with care you can count on. Book a cleaning and comprehensive exam at Aspen Dental—most insurance accepted, flexible financing, and same-day appointments where available. Ask about whitening, implants, and dentures. Your neighborhood team is here to help you love your smile again.";
const POST_TEXT_SHORT =
  "New patient special: exam + X-rays + cleaning. Schedule online or call your local Aspen Dental practice today…";

const postsData: Record<number, SocialCalendarPost[]> = {
  1: [
    { id: "s1-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT },
    { id: "s1-2", time: "6:30 AM", platform: "instagram", text: POST_TEXT_SHORT, image: imgSmile },
    { id: "s1-3", time: "2:15 PM", platform: "google", text: "Weekend hours update: our Eastside office is open Saturday 8–2 for hygiene visits and urgent care triage." },
  ],
  2: [
    {
      id: "s2-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003570,
    },
    {
      id: "s2-2",
      time: "12:00 AM",
      platform: "facebook",
      text: "April is Oral Cancer Awareness Month—book a screening with your hygiene visit. Early detection saves lives.",
    },
    {
      id: "s2-3",
      time: "4:40 PM",
      platform: "twitter",
      text: "Tip: replace your toothbrush every 3 months—or sooner after a cold. Your hygienist can show you the best brush for your gums.",
    },
  ],
  3: [
    {
      id: "s3-1",
      time: "12:00 AM",
      platform: "instagram",
      text: POST_TEXT_SHORT,
      image: imgRectangle4668,
    },
    {
      id: "s3-2",
      time: "12:00 AM",
      platform: "twitter",
      text: "Invisalign® consults are free this month. Straighten teeth discreetly—ask your doctor if clear aligners are right for you.",
    },
    {
      id: "s3-3",
      time: "7:05 PM",
      platform: "facebook",
      text: POST_TEXT,
      aiScheduled: [{ time: "8:10 PM" }],
    },
  ],
  4: [
    {
      id: "s4-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003571,
    },
    {
      id: "s4-2",
      time: "12:00 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      aiScheduled: [{ time: "12:48 PM" }],
    },
    {
      id: "s4-3",
      time: "3:20 PM",
      platform: "instagram",
      text: "Meet the team: Dr. Patel and our assistants make nervous patients feel at home. Comment with your first-visit story.",
      image: imgDentalOffice,
    },
  ],
  5: [
    {
      id: "s5-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003572,
    },
    {
      id: "s5-2",
      time: "12:50 PM",
      platform: "facebook",
      text: "Same-day denture repairs in select locations—call ahead so we can fit you in and get you smiling again.",
      aiScheduled: [{ time: "6:48 PM" }],
    },
  ],
  6: [
    {
      id: "s6-1",
      time: "12:48 PM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003573,
      aiScheduled: [{ time: "10:48 PM" }, { time: "6:48 PM" }, { time: "8:48 PM" }],
    },
    {
      id: "s6-2",
      time: "12:48 PM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgRectangle4669,
    },
    {
      id: "s6-3",
      time: "5:00 PM",
      platform: "google",
      text: "Review shout-out—thank you, Jordan, for the five stars on your whitening touch-up. We appreciate you!",
    },
  ],
  7: [
    { id: "s7-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT_SHORT },
    {
      id: "s7-2",
      time: "10:28 AM",
      platform: "facebook",
      text: "Sports season reminder: custom mouthguards protect teeth better than boil-and-bite. Stop by front desk to get fitted.",
      image: imgFrame1000003574,
      aiScheduled: [{ time: "9:48 AM" }],
    },
    {
      id: "s7-3",
      time: "12:00 AM",
      platform: "facebook",
      text: "Financing question? CareCredit® and flexible payment options help many patients start treatment the same week.",
      image: imgBitmapCopy1,
      aiScheduled: [{ time: "6:48 PM" }],
    },
    {
      id: "s7-4",
      time: "8:30 PM",
      platform: "instagram",
      text: "Before & after: composite bonding closed a small gap in one visit. Swipe for the smile refresh.",
      image: imgSmile,
    },
  ],
  8: [
    { id: "s8-1", time: "9:00 AM", platform: "facebook", text: "Happy Monday—our phones open at 7 AM for scheduling. Text STOP to opt out of reminders." },
    { id: "s8-2", time: "11:30 AM", platform: "twitter", text: POST_TEXT_SHORT },
  ],
  9: [{ id: "s9-1", time: "2:00 PM", platform: "instagram", text: "Snack smart: cheese and nuts help neutralize acids between meals. Save sticky sweets for right after meals, then rinse.", image: imgRectangle4668 }],
  10: [
    { id: "s10-1", time: "8:15 AM", platform: "google", text: "We’re hiring a treatment coordinator—DM us “careers” for details. Great benefits, growth-minded team." },
    { id: "s10-2", time: "4:45 PM", platform: "facebook", text: POST_TEXT_SHORT, image: imgDentalOffice },
  ],
  11: [{ id: "s11-1", time: "12:30 PM", platform: "facebook", text: "Sedation options available for longer procedures—your comfort plan is personalized at every visit." }],
  12: [
    { id: "s12-1", time: "10:00 AM", platform: "instagram", text: "Floss threaders make cleaning around bridges easy—ask us for a demo at your next appointment.", image: imgFrame1000003571 },
    { id: "s12-2", time: "6:00 PM", platform: "twitter", text: POST_TEXT_SHORT },
  ],
  13: [{ id: "s13-1", time: "1:10 PM", platform: "facebook", text: "Implant consultation: learn about bone health, healing timelines, and realistic expectations in one visit." }],
  14: [
    { id: "s14-1", time: "7:45 AM", platform: "facebook", text: POST_TEXT_SHORT, aiScheduled: [{ time: "5:15 PM" }] },
    { id: "s14-2", time: "3:00 PM", platform: "instagram", text: "Community day recap—free kids’ screenings and toothbrush kits while supplies lasted. Thank you for showing up!", image: imgSmile },
  ],
  15: [{ id: "s15-1", time: "9:20 AM", platform: "google", text: "Parking tip: validated garage on 4th—bring your ticket to checkout for a stamp." }],
  16: [{ id: "s16-1", time: "11:00 AM", platform: "twitter", text: "Grinding at night? A night guard can protect enamel and reduce jaw soreness. Custom fit beats drugstore one-size." }],
  17: [{ id: "s17-1", time: "4:30 PM", platform: "facebook", text: POST_TEXT_SHORT, image: imgFrame1000003572 }],
  18: [
    { id: "s18-1", time: "8:00 AM", platform: "instagram", text: "Sensitive teeth? Try a desensitizing toothpaste for two weeks before whitening—we can recommend a brand.", image: imgRectangle4669 },
    { id: "s18-2", time: "7:15 PM", platform: "facebook", text: "Refer a friend—both of you save on your next hygiene visit when they complete their new patient exam." },
  ],
  19: [{ id: "s19-1", time: "12:45 PM", platform: "facebook", text: "Emergency? Knocked-out tooth: keep it moist in milk and call us immediately—time matters for reimplantation." }],
  20: [{ id: "s20-1", time: "2:30 PM", platform: "google", text: POST_TEXT_SHORT }],
  21: [{ id: "s21-1", time: "5:50 PM", platform: "instagram", text: "Thank you for 2,000 local followers—we’re honored to care for this community’s smiles.", image: imgDentalOffice }],
};

const WEEK_DAYS = [
  { label: "Sun", date: 1 },
  { label: "Mon", date: 2 },
  { label: "Tue", date: 3 },
  { label: "Wed", date: 4, isToday: true },
  { label: "Thu", date: 5 },
  { label: "Fri", date: 6 },
  { label: "Sat", date: 7 },
];

const MONTH_WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** April 1, 2024 is Monday → one leading empty cell when week starts Sunday */
const APRIL_2024_LEADING_EMPTY = 1;
const APRIL_2024_DAYS = 30;

function buildApril2024MonthCells(): (number | null)[] {
  const cells: (number | null)[] = [];
  for (let i = 0; i < APRIL_2024_LEADING_EMPTY; i++) cells.push(null);
  for (let d = 1; d <= APRIL_2024_DAYS; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function flattenPostsChronological(): { day: number; post: SocialCalendarPost }[] {
  const days = Object.keys(postsData)
    .map(Number)
    .sort((a, b) => a - b);
  const out: { day: number; post: SocialCalendarPost }[] = [];
  for (const day of days) {
    for (const post of postsData[day] ?? []) {
      out.push({ day, post });
    }
  }
  return out;
}

/** v2.7-style dense post card (list + week columns). */
function PostCardComponent({
  post,
  onOpenPreview,
}: {
  post: SocialCalendarPost;
  onOpenPreview: () => void;
}) {
  return (
    <div className="w-full rounded-[6px] border border-[#e9e9eb] bg-[#f4f6f7] p-2 transition-colors dark:border-[#333a47] dark:bg-[#22262f]">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-label="Open post preview"
          onClick={onOpenPreview}
          className="flex w-full cursor-pointer flex-col gap-2 rounded-[4px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SocialPostPreviewBody post={post} variant="compact" />
        </button>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
              aria-label="Edit post"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
              aria-label="Schedule"
            >
              <CalendarIcon />
            </button>
          </div>
          <button
            type="button"
            className="-rotate-90 p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
            aria-label="More options"
          >
            <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/** v2.7-style week column calendar (day strip + vertical columns). */
function SocialWeekGrid({
  onOpenPreview,
}: {
  onOpenPreview: (post: SocialCalendarPost) => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden text-xs leading-normal">
      <div className="flex shrink-0 border-b border-[#e9e9eb] dark:border-[#333a47]">
        {WEEK_DAYS.map((day) => (
          <div key={day.date} className="flex flex-1 items-center justify-center bg-white py-3 dark:bg-[#1e2229]">
            {day.isToday ? (
              <div className="flex items-center gap-1">
                <span className="text-[#125598] dark:text-[#6b9bff]">{day.label}</span>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#125598] text-[11px] text-white dark:bg-[#2552ED]"
                  style={{ fontWeight: 400 }}
                >
                  {day.date}
                </span>
              </div>
            ) : (
              <span className="text-[#555] dark:text-[#8b92a5]">
                {day.label} {day.date}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-y-auto">
        {WEEK_DAYS.map((day) => {
          const posts = postsData[day.date] || [];
          return (
            <div
              key={day.date}
              className={`flex min-w-0 flex-1 flex-col gap-2 border-r border-[#e9e9eb] p-2 last:border-r-0 dark:border-[#333a47] ${
                day.isToday ? "bg-white dark:bg-[#1e2229]" : "bg-[#f9fafb] dark:bg-[#181b22]"
              }`}
            >
              {posts.map((post) => (
                <PostCardComponent key={post.id} post={post} onOpenPreview={() => onOpenPreview(post)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SocialListView({
  rows,
  onOpenPreview,
}: {
  rows: { day: number; post: SocialCalendarPost }[];
  onOpenPreview: (post: SocialCalendarPost) => void;
}) {
  const grouped = useMemo(() => {
    const map: { day: number; posts: SocialCalendarPost[] }[] = [];
    let currentDay: number | null = null;
    let bucket: SocialCalendarPost[] = [];
    for (const { day, post } of rows) {
      if (currentDay !== day) {
        if (currentDay !== null) map.push({ day: currentDay, posts: bucket });
        currentDay = day;
        bucket = [];
      }
      bucket.push(post);
    }
    if (currentDay !== null) map.push({ day: currentDay, posts: bucket });
    return map;
  }, [rows]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden text-xs leading-normal">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 dark:bg-[#1e2229]">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {grouped.map(({ day, posts }) => (
            <section key={day} aria-labelledby={`social-list-day-${day}`}>
              <h2
                id={`social-list-day-${day}`}
                className="sticky top-0 z-[1] -mx-1 mb-2 border-b border-[#e9e9eb] bg-white px-1 py-2 font-semibold text-[#212121] dark:border-[#333a47] dark:bg-[#1e2229] dark:text-[#e4e4e4]"
              >
                April {day}
              </h2>
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostCardComponent key={post.id} post={post} onOpenPreview={() => onOpenPreview(post)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Flex height chain for list / week / month (full-width, no card frame). */
function SocialCalendarSurface({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">{children}</div>;
}

/** Dense month cell row (Sprout / Later–style stacked publish items). */
function MonthPostChip({
  post,
  onClick,
}: {
  post: SocialCalendarPost;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/20 px-2 py-1 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <span className="shrink-0 pt-0.5">
        <SocialPostPlatformIcon platform={post.platform} size={12} />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-muted-foreground">{post.time}</span>
        <span className="line-clamp-3 break-words leading-snug text-foreground">{post.text}</span>
      </span>
    </button>
  );
}

function SocialMonthGrid({
  onOpenPreview,
}: {
  onOpenPreview: (post: SocialCalendarPost) => void;
}) {
  const cells = useMemo(() => buildApril2024MonthCells(), []);
  const rowCount = cells.length / 7;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden text-xs leading-normal">
      <div className="grid shrink-0 grid-cols-7 border-b border-border bg-background">
        {MONTH_WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center py-2 font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className="grid h-full min-h-0 w-full grid-cols-7 gap-px bg-border"
          style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
        >
          {cells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div key={`e-${idx}`} className="min-h-0 bg-muted/15" aria-hidden />
              );
            }
            const posts = postsData[dayNum] || [];
            const isToday = dayNum === 4;
            return (
              <div
                key={dayNum}
                className="flex min-h-0 min-w-0 flex-col gap-1 bg-background p-2"
              >
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      isToday ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {dayNum}
                  </span>
                  {posts.length > 0 ? (
                    <span className="truncate tabular-nums text-muted-foreground">
                      {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                  ) : null}
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                  {posts.slice(0, 3).map((post) => (
                    <MonthPostChip key={post.id} post={post} onClick={() => onOpenPreview(post)} />
                  ))}
                  {posts.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => onOpenPreview(posts[3])}
                      className="w-full shrink-0 cursor-pointer rounded-md px-2 py-1 text-left font-medium text-primary hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      +{posts.length - 3} more
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Social View – Main export
   ═══════════════════════════════════════════ */
export function SocialView() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentMonth] = useState("April 2024");
  const [previewPost, setPreviewPost] = useState<SocialCalendarPost | null>(null);

  const listRows = useMemo(() => flattenPostsChronological(), []);
  const openPreview = (post: SocialCalendarPost) => setPreviewPost(post);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background transition-colors duration-300">
      <MainCanvasViewHeader
        title={
          <>
            <span className="sr-only">Social · </span>
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <span
                className="min-w-0 max-w-[min(100%,18rem)] shrink truncate px-1 text-center tabular-nums sm:max-w-[24rem]"
                aria-live="polite"
              >
                {currentMonth}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                aria-label="Next month"
              >
                <ChevronRight className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 shrink-0 px-2 text-lg font-medium text-primary hover:bg-primary/10"
              >
                Today
              </Button>
            </span>
          </>
        }
        actions={
          <>
            <SegmentedToggle<ViewMode>
              iconOnly
              ariaLabel="Social calendar layout"
              value={viewMode}
              onChange={setViewMode}
              items={[
                {
                  value: "list",
                  label: "List view",
                  icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
                {
                  value: "week",
                  label: "Week view",
                  icon: (
                    <CalendarRange className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                  ),
                },
                {
                  value: "month",
                  label: "Month view",
                  icon: <Calendar className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
              ]}
            />

            <Button type="button" variant="outline" size="icon" aria-label="Filter">
              <Filter className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SocialCalendarSurface>
          {viewMode === "list" ? (
            <SocialListView rows={listRows} onOpenPreview={openPreview} />
          ) : viewMode === "week" ? (
            <SocialWeekGrid onOpenPreview={openPreview} />
          ) : (
            <SocialMonthGrid onOpenPreview={openPreview} />
          )}
        </SocialCalendarSurface>
      </div>

      <SocialPostPreviewSheet
        open={previewPost !== null}
        onOpenChange={(next) => {
          if (!next) setPreviewPost(null);
        }}
        post={previewPost}
      />
    </div>
  );
}
