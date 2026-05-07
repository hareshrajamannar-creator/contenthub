import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  REVIEWS_SHORTCUT_EVENT,
  type ReviewsShortcutAction,
} from "@/app/shortcuts/events";
import {
  Search,
  MoreVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  Pencil,
  MessageCircle,
  List,
  Columns2,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { ManusToolbarIconHit } from "@/app/components/ManusToolbarIconHit";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import svgPaths from "../../imports/svg-k7qrt1366a";
import { ReviewSiteLogo, type ReviewPlatformSite } from "@/app/components/reviewPlatformLogos";
// Real placeholder images — replace with actual CDN URLs in production
const imgRectangle2429 = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format";
const imgRectangle2430 = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format";
const imgRectangle2431 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format";
const imgRectangle2432 = "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format";
const imgRectangle2436 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format";
const imgRectangle2437 = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format";
const imgRectangle2435 = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format";

/** Full set for reviews that show a longer carousel in demo data. */
const GALLERY_FULL = [
  imgRectangle2429,
  imgRectangle2430,
  imgRectangle2431,
  imgRectangle2432,
  imgRectangle2436,
  imgRectangle2437,
  imgRectangle2435,
];

import type { FilterItem } from "@/app/components/FilterPanel.v1";
import {
  FilterPane,
  FilterPaneTriggerButton,
} from "@/app/components/FilterPane";
import {
  createInitialReviewsFilters,
} from "@/app/data/reviewsFilters";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import type { ReviewsViewMode } from "./ReviewsView";

// Types
interface Review {
  id: number;
  site: ReviewPlatformSite;
  rating: number;
  reviewer: string;
  date: string;
  photoCount?: number;
  featured?: boolean;
  employees: number;
  location: string;
  photos: string[];
  text: string;
  replyStatus: "post" | "edit";
  hasReplyDots?: boolean;
}

/** Parses `review.date` strings like `Jan 7, 2023`; falls back to the raw string if invalid. */
export function formatReviewDateRelative(dateStr: string, nowMs: number = Date.now()): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return dateStr;
  const diffSec = Math.floor((nowMs - then) / 1000);
  if (diffSec < 45) return "Just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(diffSec / 3600);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return rtf.format(-days, "day");
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return rtf.format(-weeks, "week");
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  const years = Math.floor(days / 365);
  return rtf.format(-years, "year");
}

const REVIEW_BODY_LINE_HEIGHT_PX = 18;
const REVIEW_BODY_MAX_LINES = 5;

/** Word-boundary clamp: binary search on word count so truncation never splits a word (only between words). */
function buildClampedReviewText(
  fullText: string,
  widthPx: number,
  maxLines: number,
  lineHeightPx: number,
  font: { fontFamily: string; fontSize: string; fontWeight: string; letterSpacing: string },
): { collapsed: string; needsToggle: boolean } {
  const maxH = maxLines * lineHeightPx + 1;
  const probe = document.createElement("p");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.left = "-99999px";
  probe.style.top = "0";
  probe.style.width = `${Math.max(32, Math.floor(widthPx))}px`;
  probe.style.margin = "0";
  probe.style.padding = "0";
  probe.style.boxSizing = "border-box";
  probe.style.fontFamily = font.fontFamily;
  probe.style.fontSize = font.fontSize;
  probe.style.fontWeight = font.fontWeight;
  probe.style.letterSpacing = font.letterSpacing;
  probe.style.lineHeight = `${lineHeightPx}px`;
  probe.style.wordBreak = "normal";
  probe.style.overflowWrap = "break-word";
  probe.style.whiteSpace = "normal";
  document.body.appendChild(probe);

  const normalized = fullText.replace(/\s+/g, " ").trim();
  const words = normalized.length > 0 ? normalized.split(" ") : [];
  if (words.length === 0) {
    document.body.removeChild(probe);
    return { collapsed: fullText, needsToggle: false };
  }

  let lo = 0;
  let hi = words.length;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    probe.textContent = words.slice(0, mid).join(" ");
    if (probe.scrollHeight <= maxH) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  document.body.removeChild(probe);

  if (best >= words.length) {
    return { collapsed: fullText, needsToggle: false };
  }
  if (best === 0) {
    return { collapsed: fullText, needsToggle: false };
  }
  return { collapsed: `${words.slice(0, best).join(" ")}…`, needsToggle: true };
}

export function ReviewBody({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [collapsedDisplay, setCollapsedDisplay] = useState(text);
  const [needsToggle, setNeedsToggle] = useState(false);
  const [measured, setMeasured] = useState(false);

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el || expanded) return;
    const w = el.getBoundingClientRect().width;
    if (w < 32) return;
    const cs = getComputedStyle(el);
    const { collapsed, needsToggle: toggle } = buildClampedReviewText(
      text,
      w,
      REVIEW_BODY_MAX_LINES,
      REVIEW_BODY_LINE_HEIGHT_PX,
      {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
      },
    );
    setCollapsedDisplay(collapsed);
    setNeedsToggle(toggle);
    setMeasured(true);
  }, [expanded, text]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const showLineClampFallback = !expanded && !measured;
  const paragraphText = expanded ? text : measured ? collapsedDisplay : text;

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <p
        className={`whitespace-pre-wrap break-words text-[13px] leading-[18px] text-[#212121] dark:text-[#d0d0d0] ${showLineClampFallback ? "line-clamp-5" : ""}`}
      >
        {paragraphText}
      </p>
      {needsToggle ? (
        <button
          type="button"
          className="mt-1 text-left text-[12px] font-medium text-[#1976d2] hover:underline dark:text-[#90caf9]"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}

// Mock data matching Figma reference 2
const mockReviews: Review[] = [
  {
    id: 1,
    site: "yelp",
    rating: 5,
    reviewer: "Arya Stark",
    date: "Jan 7, 2023",
    photoCount: 12,
    featured: true,
    employees: 2,
    location: "Georgia",
    photos: GALLERY_FULL,
    text: "I had a great time here, the place is situated near Wagle circle. It has top notch ambience and a really cool vibe. The food and drinks were pretty good and I would definitely recommend this to all the non veg lovers. The restaurant is pretty big and can accommodate a huge crowd with indoor as well as outdoor seating. The prices for the dishes are reasonable and totally worth it.\n\nMy personal favorites were the desserts, especially the DIY cake station where you pick toppings and sauces. The staff explained every course without rushing us, and water refills were constant without having to wave someone down. We also tried the chef’s special grill platter: smoky, tender, and seasoned well without hiding the ingredients.\n\nIf I had to nitpick, the music near the bar was a touch loud for conversation, but tables farther in were perfect. Parking nearby can fill up on weekends, so plan a few extra minutes. Overall this was one of the better dining experiences I have had in the area, and I would gladly return with friends or family. Would definitely visit again! ❤️",
    replyStatus: "post",
  },
  {
    id: 2,
    site: "google",
    rating: 4,
    reviewer: "Daniel Peirre",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: GALLERY_FULL.slice(0, 6),
    photoCount: 9,
    text: "I recently had the pleasure of dining at Magna and it was an outstanding experience from start to finish. The menu is diverse and thoughtfully curated, with enough variety that every person in our group found something they were excited about. We started with small plates to share and each dish arrived at a comfortable pace.\n\nThe servers were attentive and knowledgeable when we asked about allergens and spice levels. Wine suggestions paired well with our mains, and nobody felt rushed even though the dining room was full. Lighting and table spacing made it easy to hear each other, which matters for a celebratory dinner.\n\nDesserts were a highlight: not overly sweet, and plated with care. I would recommend Magna for date nights, small team dinners, or visitors who want a reliable splurge without gimmicks. I am already planning a return visit to work through more of the menu.",
    replyStatus: "post",
  },
  {
    id: 3,
    site: "yelp",
    rating: 5,
    reviewer: "Austin Dale",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: GALLERY_FULL.slice(2, 6),
    text: "This is a huge place where you can hang out with friends or relatives without feeling cramped. There are several seating zones, from quieter corners to a livelier central area, so you can match the mood to your group. We visited on a Saturday evening and still found a comfortable table within ten minutes.\n\nThe portions are generous and easy to share. We ordered a mix of appetizers and mains and everything arrived hot. Staff checked in at the right moments and cleared plates promptly. The only minor issue was a short wait for the first round of drinks while the bar caught up with the rush.\n\nIf you are planning a birthday or casual reunion, this spot works well because you can linger without pressure to turn the table. I would come back for the relaxed atmosphere and the variety on the menu.",
    replyStatus: "edit",
    hasReplyDots: true,
  },
  {
    id: 4,
    site: "yelp",
    rating: 5,
    reviewer: "Austin Dale",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: GALLERY_FULL.slice(0, 5),
    text: "This place is amazing. The ambience is beautiful without feeling stiff, and the staff are cooperative and friendly from the moment you walk in. I tried the lunch express menu and you should definitely consider it if you want speed without sacrificing flavor. The regular menu also has plenty of variety, from lighter salads to hearty comfort plates.\n\nThe best part of our meal was dessert. I ordered the pastry special and it was flaky, balanced, and not cloying. Coffee was strong and served at the right temperature, which sounds small but makes a difference. Bathrooms were clean and stocked, always a good sign of how a restaurant is run day to day.\n\nWe sat near the window and had great natural light for photos, if that matters to you. Noise levels stayed reasonable even as more guests arrived. I would recommend this spot for a weekday lunch treat or a low key weekend meal.",
    replyStatus: "post",
    hasReplyDots: true,
  },
  {
    id: 5,
    site: "facebook",
    rating: 5,
    reviewer: "Priya Nandakumar",
    date: "Feb 2, 2024",
    employees: 3,
    location: "New York",
    photos: GALLERY_FULL,
    photoCount: 10,
    text: "We hosted a team dinner here and everything ran smoothly from the first email confirmation to the final bill. Reservations were honored on time, dietary restrictions were taken seriously, and the manager checked in once without hovering. The private dining area was set up with name cards and pitchers of water before we arrived, which made our kickoff feel organized.\n\nFood was plated consistently across a long table, so nobody waited awkwardly while others ate. Vegetarian and gluten free requests were handled confidently, and the kitchen split a few dishes so we could sample more items. Audio in the room was clear enough for short toasts without shouting.\n\nPricing matched what we were quoted, and gratuity options were explained upfront. Several colleagues asked for the name of the restaurant afterward, which is the best endorsement I can give. We will book again for our quarterly outing and probably for client dinners too.",
    replyStatus: "post",
  },
  {
    id: 6,
    site: "tripadvisor",
    rating: 3,
    reviewer: "Marco Benedetti",
    date: "Mar 18, 2024",
    employees: 2,
    location: "California",
    photos: [imgRectangle2431, imgRectangle2432],
    text: "The food itself was fine: flavors were balanced and plating looked thoughtful. Unfortunately we waited almost forty minutes past our reservation time before we were seated, and the host stand updates were vague. Noise near the bar carried into the dining area, which made it harder to talk without leaning in.\n\nWhen mains arrived they were lukewarm, as if they had sat under a lamp too long. The server apologized and offered to reheat, but at this price point I expected tighter pacing and hotter plates on the first try. Starters and drinks were stronger than the entrees on this visit.\n\nI am not writing the place off entirely because the menu shows ambition, but management should look at timing on busy nights. If you go, ask for a table away from the bar and confirm your reservation buffer if you have tickets afterward.",
    replyStatus: "edit",
    hasReplyDots: true,
  },
  {
    id: 7,
    site: "google",
    rating: 2,
    reviewer: "Jordan Lee",
    date: "Apr 4, 2024",
    employees: 1,
    location: "Texas",
    photos: GALLERY_FULL.slice(1, 5),
    text: "Our order was wrong twice in one meal, which is hard to excuse when the restaurant was not at full capacity. It took three separate asks to get water refills, and empty plates sat on the edge of the table for a long time. I understand everyone can have an off night, but the basics slipped repeatedly.\n\nWhen the correct dishes finally arrived, taste was average and temperature was acceptable. The manager offered a small discount after we flagged the issues, which helped a little, but we still left frustrated because the experience felt careless. Communication between the kitchen and the floor seemed disjointed from where we sat.\n\nI hope this was an outlier service night. Until I hear that staffing or training improved, I would hesitate to recommend this location for time sensitive plans or guests you want to impress without risk.",
    replyStatus: "post",
  },
  {
    id: 8,
    site: "facebook",
    rating: 4,
    reviewer: "Elena Vasquez",
    date: "May 12, 2024",
    employees: 2,
    location: "Florida",
    photos: GALLERY_FULL,
    photoCount: 11,
    text: "The brunch lineup here is strong, especially the shakshuka with enough spice to wake you up without overpowering the tomatoes. Fresh juices taste like real fruit, not syrup, and the coffee program is better than most brunch spots in the neighborhood. Sweet and savory options are balanced, so mixed groups do not have to compromise.\n\nPatio seating fills fast on weekends, so arrive early or expect a short wait. Once seated, service stayed attentive even as the room filled. One star off because parking was tight and the nearby garage rates add up if you linger.\n\nIf you go, order one savory plate and one pastry to share. The pastry case rotates and the staff happily described what was baked that morning. I would return for a sunny Saturday with friends.",
    replyStatus: "edit",
  },
  {
    id: 9,
    site: "tripadvisor",
    rating: 5,
    reviewer: "Tom Whitaker",
    date: "Jun 1, 2024",
    featured: true,
    employees: 2,
    location: "Georgia",
    photos: GALLERY_FULL.slice(0, 6),
    text: "I stayed nearby on business and ate here three nights in a row because the quality stayed consistent. Portions are generous without feeling sloppy, and the bartender remembered my usual by the second visit, which is a nice touch when you are tired from travel. The dining room stays professional enough for client meals but still relaxed.\n\nHighlight was the chef’s tasting menu: creative without being weird for the sake of it, and each course had a clear story. Bread service and intermezzos showed attention to detail. Wine by the glass list had enough depth that I did not feel stuck ordering the same bottle every night.\n\nBreakfast service was slightly slower on weekday mornings, yet food remained hot and accurate. If you are in town for work, this is a dependable anchor restaurant that does not waste your time or your expense account.",
    replyStatus: "post",
  },
  {
    id: 10,
    site: "google",
    rating: 5,
    reviewer: "Samira Okonkwo",
    date: "Jun 22, 2024",
    employees: 3,
    location: "New York",
    photos: GALLERY_FULL,
    photoCount: 8,
    text: "This is the best fried chicken sandwich I have had in the city in a long time. The breading stays crispy, the meat stays juicy, and the slaw actually has crunch instead of turning soggy in thirty seconds. Pickles and sauce are applied with restraint so you still taste the chicken.\n\nCounter service was fast even during lunch rush, and the line moved because the team repeats the same steps cleanly. Seating is limited, so plan for takeaway if you visit at peak times. Prices feel fair for the quality and portion size relative to nearby competitors.\n\nIf you want a lighter option, the side salad is fresh and not an afterthought. I have recommended this spot to coworkers and everyone who tried it agreed the sandwich is worth a return trip.",
    replyStatus: "post",
    hasReplyDots: true,
  },
  {
    id: 11,
    site: "yelp",
    rating: 1,
    reviewer: "Chris P.",
    date: "Jul 8, 2024",
    employees: 1,
    location: "California",
    photos: [imgRectangle2436, imgRectangle2437, imgRectangle2429, imgRectangle2430],
    text: "We found a hair in the appetizer, which immediately killed our appetite for the rest of the round. The manager apologized, but we were still charged for the dish, which felt dismissive given the circumstances. I am not usually someone who leaves one star reviews, but the response did not match the seriousness of the issue.\n\nOther tables around us seemed to be having a normal night, so this may have been an isolated kitchen slip. Still, how a restaurant recovers matters. A comped appetizer or a sincere follow up would have gone a long way.\n\nI hope the team retrains on quality checks and guest recovery. Until then I cannot recommend this location based on our visit.",
    replyStatus: "edit",
    hasReplyDots: true,
  },
  {
    id: 12,
    site: "facebook",
    rating: 3,
    reviewer: "Riley Chen",
    date: "Aug 3, 2024",
    employees: 2,
    location: "Texas",
    photos: GALLERY_FULL.slice(3, 7),
    text: "The ambience is lovely: warm lighting, comfortable chairs, and music at a volume that still allows conversation. Cocktails are creative and balanced, with clear flavors rather than a sugar bomb. We enjoyed the bar team’s recommendations and the garnishes looked fresh.\n\nMains took a long time to arrive, and one steak was overcooked relative to how we ordered it. The server noticed without us having to argue, and they comped a dessert, which helped salvage the evening. Side dishes were seasoned well and arrived hot.\n\nI would come back for drinks and appetizers with realistic expectations about pacing on a Friday. If you book for a special occasion, mention timing constraints up front.",
    replyStatus: "post",
  },
  {
    id: 13,
    site: "tripadvisor",
    rating: 4,
    reviewer: "Amélie Durand",
    date: "Sep 14, 2024",
    employees: 2,
    location: "Florida",
    photos: GALLERY_FULL,
    photoCount: 12,
    text: "This is a great spot for families. The kids’ menu had real options, not just nuggets and fries, and our children actually ate their meals without negotiation. High chairs were clean and staff brought crayons without us asking, which made the first ten minutes calmer for everyone.\n\nService was patient with questions and did not rush us out the door even after dessert. The dining room accommodated strollers better than many places we have tried on vacation. Restrooms could use an update: functional, but aging fixtures and a loose towel dispenser.\n\nIf you visit during peak dinner hours, expect a short wait, but the host kept us updated. We would return on a future trip because the overall experience felt genuinely family friendly rather than tolerant.",
    replyStatus: "post",
  },
  {
    id: 14,
    site: "google",
    rating: 4,
    reviewer: "Devon Mills",
    date: "Oct 2, 2024",
    employees: 2,
    location: "California",
    photos: GALLERY_FULL.slice(0, 5),
    text: "Solid weekday lunch spot with predictable quality. The soup and half sandwich deal is a bargain given the portion size, and the soup tasted like it was made in house rather than poured from a bag. Ingredients in the sandwich were fresh and the bread held up without falling apart.\n\nWi Fi was reliable enough if you need to answer email between bites, and outlets were available along the wall. Noise stayed at a workable level for a quick working lunch. Lines move quickly because the menu is focused.\n\nIf you want something indulgent, the cookie at the register is worth adding. I have been back three times this month and have not had a miss yet.",
    replyStatus: "edit",
  },
  {
    id: 15,
    site: "yelp",
    rating: 5,
    reviewer: "Hannah Brooks",
    date: "Nov 19, 2024",
    employees: 3,
    location: "New York",
    photoCount: 7,
    photos: GALLERY_FULL,
    text: "Our anniversary dinner exceeded expectations in almost every way. The sommelier pairing was thoughtful without being pushy, and each pour matched the food rather than overpowering it. Pacing between courses was perfect: long enough to enjoy, short enough to stay engaged.\n\nThe kitchen accommodated a shellfish allergy with calm confidence and swapped components without making us feel like a burden. Bread, butter, and small touches felt intentional. At the end of the meal we received a handwritten note, which was a lovely surprise and felt personal.\n\nWe left full but not uncomfortable, and the staff thanked us warmly on the way out. This is the kind of evening you remember months later. We will return for the next milestone.",
    replyStatus: "post",
  },
  {
    id: 16,
    site: "facebook",
    rating: 2,
    reviewer: "Alex Rivera",
    date: "Dec 7, 2024",
    employees: 1,
    location: "Georgia",
    photos: [imgRectangle2435, imgRectangle2432],
    text: "Our delivery order arrived cold and missing sides, which is frustrating when you are ordering for a group at home. In app support offered a partial credit only, and the back and forth took longer than remaking the meal would have. In person visits have been better in the past, so this felt like a different standard.\n\nWhen we have dined inside, food was hot and accurate, which makes the delivery gap more noticeable. Packaging may need a rethink for anything saucy, and checklists should confirm sides before drivers leave.\n\nI am leaving two stars instead of one because I know this brand can do better based on prior experiences. I hope operations tighten delivery QA soon.",
    replyStatus: "post",
  },
];

/* ─── Star rating — gold fill + gold outline on empty (review reference) ─── */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[2px] shrink-0" aria-hidden>
      {[...Array(5)].map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            strokeWidth={filled ? 0 : L1_STRIP_ICON_STROKE_PX}
            absoluteStrokeWidth={!filled}
            className={
              filled
                ? "fill-[#D4A017] stroke-[#D4A017]"
                : "fill-none stroke-[#D4A017]"
            }
          />
        );
      })}
    </div>
  );
}

/* ─── BirdAI Suggested Reply ─── */
function MynaAIReply({ hasThreeDots }: { hasThreeDots?: boolean }) {
  return (
    <div className="relative bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-[8px] p-5 w-full">
      <div className="flex flex-col gap-[6px]">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">BirdAI suggested reply</span>
          <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
          <div className="flex items-center">
            <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">Reply as</span>
            <div className="flex items-center gap-[2px] px-1 rounded-full">
              <span className="text-[12px] text-[#1976d2]">Sampada (me)</span>
              <svg className="w-[7.5px] h-[3.75px]" viewBox="0 0 7.5 3.75" fill="none">
                <path d="M0 0L3.75 3.75L7.5 0H0Z" fill="#49454F" />
              </svg>
            </div>
          </div>
        </div>
        {/* Reply text */}
        <p className="text-[13px] text-[#212121] dark:text-[#d0d0d0] leading-[18px]">
          We appreciate your feedback! Thank you for taking the time to share your experience with us.
        </p>
      </div>
      {/* Optional 3-dot menu on reply */}
      {hasThreeDots && (
        <div className="absolute right-3 top-2 bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-full size-[24px] flex items-center justify-center">
          <svg className="w-[12px] h-[3px] rotate-90" viewBox="0 0 12 3" fill="none">
            <path clipRule="evenodd" d={svgPaths.p2d3a0500} fill="#757575" fillRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

/** Review card toolbar — explicit 1.2px stroke (Lucide `absoluteStrokeWidth`). */
const REVIEW_ACTION_STROKE_PX = 1.2;

const reviewActionLucideProps = {
  width: L1_STRIP_ICON_SIZE,
  height: L1_STRIP_ICON_SIZE,
  strokeWidth: REVIEW_ACTION_STROKE_PX,
  absoluteStrokeWidth: true as const,
  className: "shrink-0",
  "aria-hidden": true as const,
};

/* ─── Action row — plain toolbar; glyphs match L1 IconStrip stroke + colors ─── */
function ActionRow({ replyStatus }: { replyStatus: "post" | "edit" }) {
  const primaryLabel = replyStatus === "post" ? "Post reply" : "Edit reply";
  return (
    <div className="flex w-full flex-wrap items-center gap-1">
      <ManusToolbarIconHit title={primaryLabel} aria-label={primaryLabel}>
        {replyStatus === "post" ? (
          <Send {...reviewActionLucideProps} />
        ) : (
          <Pencil {...reviewActionLucideProps} />
        )}
      </ManusToolbarIconHit>
      <ManusToolbarIconHit title="Open chat" aria-label="Open chat">
        <MessageCircle {...reviewActionLucideProps} />
      </ManusToolbarIconHit>
      <ManusToolbarIconHit title="More actions" aria-label="More actions">
        <MoreVertical {...reviewActionLucideProps} />
      </ManusToolbarIconHit>
    </div>
  );
}

/* ─── Blur-up progressive image (Pinterest / Instagram style) ─── *
 *
 *  Phase flow:
 *    "idle"     → img hidden (opacity-0), shimmer pulsing behind it
 *    "blurring" → img appears instantly at full blur (no transition), shimmer fades
 *    "sharp"    → filter + transform transition fires: blur collapses, scale returns to 1
 *
 *  Double-RAF between blurring→sharp ensures the browser paints one blurred
 *  frame before the CSS transition starts, giving the characteristic blur-up feel.
 */
function ProgressiveImg({
  src, alt, className, imgClassName, onError,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}) {
  const [phase, setPhase] = useState<"idle" | "blurring" | "sharp">("idle");

  useEffect(() => { setPhase("idle"); }, [src]);

  const handleLoad = () => {
    setPhase("blurring");
    // Paint one blurred frame, then start the unblur transition
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("sharp")));
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Shimmer bg — fades out once the blurred image is visible */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#eff0f2] dark:bg-[#282d37] animate-pulse opacity-70 transition-opacity duration-300 ease-out"
        style={{ opacity: phase === "idle" ? 1 : 0 }}
      />
      <img
        src={src}
        alt={alt}
        className={`relative w-full h-full object-cover ${imgClassName ?? ""}`}
        style={{
          opacity:    phase === "idle" ? 0 : 1,
          filter:     phase === "sharp" ? "blur(0px)"  : "blur(8px)",
          transform:  phase === "sharp" ? "scale(1)"   : "scale(1.03)",
          // Transition only fires on blurring→sharp (not idle→blurring)
          transition: phase === "sharp"
            ? "filter 400ms ease-out, transform 400ms ease-out"
            : "none",
        }}
        onLoad={handleLoad}
        onError={(e) => {
          setPhase("sharp");
          onError?.(e);
        }}
      />
    </div>
  );
}

/* ─── Lightbox ─── */
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
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none p-2"
      >
        ✕
      </button>
      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {photos.length}
      </div>
      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {/* Image */}
      <div
        className="max-h-[85vh] max-w-[90vw] rounded-[8px] shadow-2xl overflow-hidden"
        style={{ aspectRatio: "4/3" }}
        onClick={(e) => e.stopPropagation()}
      >
        <ProgressiveImg
          src={photos[index]}
          alt={`Photo ${index + 1}`}
          className="h-full w-full"
          imgClassName="object-contain"
        />
      </div>
      {/* Next */}
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

const CAROUSEL_GAP = 8;         // px  (gap-2)
const THUMB_MIN_W  = 120;        // px  never narrower than this
const THUMB_ASPECT = 4 / 3;      // width / height — keeps tiles proportional

/* ─── Photo Carousel (responsive fluid) ─── */
function PhotoCarousel({ photos }: { photos: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Measure container on mount and resize
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Derive how many thumbs fit given current container width
  const visibleCount = containerW > 0
    ? Math.max(2, Math.floor((containerW + CAROUSEL_GAP) / (THUMB_MIN_W + CAROUSEL_GAP)))
    : 4;

  // Clamp offset when visibleCount changes (e.g. window resize)
  const maxOffset = Math.max(0, photos.length - visibleCount);
  const clampedOffset = Math.min(scrollOffset, maxOffset);

  const canScrollLeft  = clampedOffset > 0;
  const canScrollRight = clampedOffset < maxOffset;

  const scrollLeft  = () => setScrollOffset((p) => Math.max(0, p - 1));
  const scrollRight = () => setScrollOffset((p) => Math.min(maxOffset, p + 1));

  const visiblePhotos = photos.slice(clampedOffset, clampedOffset + visibleCount);

  // Each thumb fills an equal share of the container
  const thumbW = containerW > 0
    ? Math.floor((containerW - (visibleCount - 1) * CAROUSEL_GAP) / visibleCount)
    : THUMB_MIN_W;
  const thumbH = Math.round(thumbW / THUMB_ASPECT);

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}
      <div ref={containerRef} className="relative w-full min-w-0">
        {/* Left edge fade */}
        {canScrollLeft && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-background/80 dark:from-[#1e2229]/80 to-transparent rounded-l-lg"
          />
        )}
        {/* Right edge fade */}
        {canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-background/80 dark:from-[#1e2229]/80 to-transparent rounded-r-lg"
          />
        )}

        {/* Thumb strip */}
        <div className="flex overflow-hidden" style={{ gap: CAROUSEL_GAP }}>
          {visiblePhotos.map((photo, idx) => {
            const absoluteIdx = clampedOffset + idx;
            return (
              <div
                key={absoluteIdx}
                onClick={() => setLightboxIndex(absoluteIdx)}
                className="relative shrink-0 cursor-pointer rounded-xl overflow-hidden"
                style={{ width: thumbW, height: thumbH }}
              >
                <ProgressiveImg
                  src={photo}
                  alt={`Review photo ${absoluteIdx + 1}`}
                  className="w-full h-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://picsum.photos/seed/review${absoluteIdx}/400/300`;
                  }}
                />
                {/* Subtle inset border */}
                <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 dark:border-white/5" />
              </div>
            );
          })}
        </div>

        {/* Prev / Next arrows */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Previous photos"
            className="absolute left-2 top-1/2 z-[2] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 border border-border text-foreground shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-muted dark:bg-[#1e2229]/90 dark:hover:bg-muted"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Next photos"
            className="absolute right-2 top-1/2 z-[2] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 border border-border text-foreground shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-muted dark:bg-[#1e2229]/90 dark:hover:bg-muted"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header: left — logo + name + stars/date/photos/featured; right — employees + location (same meta colours as date) */}
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <ReviewSiteLogo site={review.site} size={40} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] font-semibold leading-tight text-[#212121] dark:text-[#e4e4e4]">
              {review.reviewer}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <StarRating rating={review.rating} size={14} />
              <span className="text-[#555] dark:text-[#8b92a5]" title={review.date}>
                {formatReviewDateRelative(review.date)}
              </span>
              {review.photoCount != null && review.photoCount > 0 && (
                <>
                  <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                  <span className="text-[#555] dark:text-[#8b92a5]">{review.photoCount} photos</span>
                </>
              )}
              {review.featured && (
                <>
                  <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                  <div className="rounded-[4px] bg-[#eaeaea] px-2 py-0.5 dark:bg-[#333a47]">
                    <span className="text-[12px] text-[#212121] dark:text-[#e4e4e4]">Featured</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#555] dark:text-[#8b92a5]">
          <span className="whitespace-nowrap">
            {review.employees} {review.employees === 1 ? "employee" : "employees"}
          </span>
          <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
          <span className="whitespace-nowrap">{review.location}</span>
        </div>
      </div>

      {/* Review text (word-safe clamp + view more / less) */}
      <ReviewBody key={review.id} text={review.text} />

      {/* Photo carousel */}
      {review.photos.length > 0 && <PhotoCarousel photos={review.photos} />}

      {/* BirdAI suggested reply */}
      <MynaAIReply hasThreeDots={review.hasReplyDots} />

      {/* Action row */}
      <ActionRow replyStatus={review.replyStatus} />
    </div>
  );
}

/* ─── Review card skeleton ─── */
function ReviewCardSkeleton() {
  const s = "bg-[#eff0f2] dark:bg-[#282d37] rounded animate-pulse opacity-70";
  return (
    <div className="flex flex-col gap-4 py-1">
      {/* Header: avatar + name/sub-line | right label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full shrink-0 ${s}`} />
          <div className="flex flex-col gap-2">
            <div className={`h-2.5 w-36 ${s}`} />
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-20 ${s}`} />
              <div className={`h-2 w-16 ${s}`} />
            </div>
          </div>
        </div>
        <div className={`h-2 w-28 ${s}`} />
      </div>
      {/* Body text — 5 lines tapering naturally */}
      <div className="flex flex-col gap-[9px]">
        {["w-full","w-full","w-[88%]","w-[76%]","w-[58%]"].map((w, i) => (
          <div key={i} className={`h-[11px] ${w} ${s}`} />
        ))}
      </div>
      {/* Photo strip — 4 equal tiles */}
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`h-[100px] rounded-xl ${s}`} />
        ))}
      </div>
      {/* Reply bar */}
      <div className={`h-12 w-full rounded-xl ${s}`} />
    </div>
  );
}

const PAGE_SIZE = 3;

/* ─── Main ReviewsView (list mode) ─── */
export function ReviewsViewList({
  viewMode,
  onViewModeChange,
}: {
  viewMode?: ReviewsViewMode;
  onViewModeChange?: (mode: ReviewsViewMode) => void;
} = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterItem[]>(() =>
    createInitialReviewsFilters(),
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const aiReplyButtonRef = useRef<HTMLButtonElement>(null);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onShortcut = (e: Event) => {
      const detail = (e as CustomEvent<{ action: ReviewsShortcutAction }>).detail;
      if (!detail) return;
      if (detail.action === "focus-search") {
        setSearchOpen(true);
        queueMicrotask(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        });
      }
      if (detail.action === "toggle-filters") {
        setFilterPanelOpen((open) => !open);
      }
      if (detail.action === "focus-ai-reply") {
        aiReplyButtonRef.current?.focus();
      }
    };
    window.addEventListener(REVIEWS_SHORTCUT_EVENT, onShortcut);
    return () => window.removeEventListener(REVIEWS_SHORTCUT_EVENT, onShortcut);
  }, []);

  const filteredReviews = mockReviews.filter((review) =>
    searchQuery
      ? review.reviewer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.text.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Reset pagination when search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setFreshIds(new Set());
  }, [searchQuery]);

  // Intersection observer — fires when sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoadingMore || visibleCount >= filteredReviews.length) return;
        setIsLoadingMore(true);
        setTimeout(() => {
          const nextBatch = filteredReviews.slice(visibleCount, visibleCount + PAGE_SIZE);
          const nextIds = new Set(nextBatch.map((r) => r.id));
          setFreshIds(nextIds);
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredReviews.length));
          setIsLoadingMore(false);
          // Remove fade-in class after animation completes
          setTimeout(() => setFreshIds(new Set()), 700);
        }, 900);
      },
      { rootMargin: "120px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoadingMore, visibleCount, filteredReviews.length, filteredReviews]);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-[#1e2229] transition-colors duration-300">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <MainCanvasViewHeader
          title="All reviews"
          description={
            <span className="inline-flex flex-wrap items-center gap-1">
              <span>{mockReviews.length} reviews</span>
              <span className="mx-0.5 size-[3px] shrink-0 rounded-full bg-muted-foreground/70" aria-hidden />
              <span>4.1</span>
              <span className="inline-flex items-center">
                {[...Array(5)].map((_, i) => {
                  const filled = i < 4;
                  return (
                    <Star
                      key={i}
                      aria-hidden
                      className={`h-2.5 w-2.5 ${
                        filled ? "fill-[#D4A017] stroke-[#D4A017]" : "fill-none stroke-[#D4A017]"
                      }`}
                      strokeWidth={filled ? 0 : L1_STRIP_ICON_STROKE_PX}
                      absoluteStrokeWidth={!filled}
                    />
                  );
                })}
              </span>
            </span>
          }
          actions={
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative h-[var(--button-height)] w-[240px]">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-[14px] -translate-y-1/2 text-[#303030] dark:text-[#8b92a5]" aria-hidden />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (searchQuery === "") setSearchOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }
                  }}
                  autoFocus
                  placeholder="Search reviews"
                  className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:placeholder:text-[#8b92a5]"
                  aria-label="Search reviews"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Open search"
                aria-expanded={false}
                title="Search reviews"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-[14px] h-[14px] text-[#303030] dark:text-[#8b92a5]" aria-hidden />
              </Button>
            )}

            {viewMode && onViewModeChange && (
              <SegmentedToggle<ReviewsViewMode>
                iconOnly
                ariaLabel="Reviews view"
                value={viewMode}
                onChange={onViewModeChange}
                items={[
                  { value: "list",         label: "List view",         icon: <List className="size-[14px]" aria-hidden /> },
                  { value: "conversation", label: "Split view",        icon: <Columns2 className="size-[14px]" aria-hidden /> },
                ]}
              />
            )}

            {/* More options */}
            <Button variant="outline" size="icon">
              <MoreVertical className="w-[14px] h-[14px] text-[#303030] dark:text-[#8b92a5]" />
            </Button>

            {/* AI button */}
            <Button
              ref={aiReplyButtonRef}
              type="button"
              title="AI reply assistant"
              variant="outline"
              size="icon"
            >
              <svg className="w-[14px] h-[14px]" viewBox="0 0 16.6975 14.8252" fill="none">
                <path d={svgPaths.p33170700} fill="#6834B7" />
                <path d={svgPaths.p2d8f3b80} fill="#6834B7" />
                <path clipRule="evenodd" d={svgPaths.p1692000} fill="#6834B7" fillRule="evenodd" />
                <path d={svgPaths.p4cf0c70} fill="#6834B7" />
              </svg>
            </Button>

            <FilterPaneTriggerButton
              open={filterPanelOpen}
              onOpenChange={setFilterPanelOpen}
            />
          </div>
          }
        />

        {/* Reviews feed */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <style>{`
            @keyframes reviewFadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .review-fade-in {
              animation: reviewFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
          `}</style>
          <div className="flex flex-col gap-10">
            {filteredReviews.slice(0, visibleCount).map((review) => (
              <div
                key={review.id}
                className={freshIds.has(review.id) ? "review-fade-in" : undefined}
              >
                <ReviewCard review={review} />
              </div>
            ))}

            {/* Shimmer skeletons while loading next page */}
            {isLoadingMore && (
              <>
                {[0, 1, 2].map((i) => (
                  <ReviewCardSkeleton key={`skel-${i}`} />
                ))}
              </>
            )}

            {/* Sentinel — sits below the last card, triggers next load */}
            {visibleCount < filteredReviews.length && !isLoadingMore && (
              <div ref={sentinelRef} className="h-1" aria-hidden />
            )}

            {/* End-of-feed label */}
            {visibleCount >= filteredReviews.length && filteredReviews.length > 0 && (
              <p className="text-center text-[12px] text-[#aaa] dark:text-[#555] pb-2">
                All {filteredReviews.length} reviews loaded
              </p>
            )}
          </div>
        </div>
      </div>

      <FilterPane
        initialFilters={filters}
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        onFiltersChange={setFilters}
        motion="static"
        dock="right"
        storageKey="birdeye_reviews_filters"
      />
    </div>
  );
}
