import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  AlignJustify, AlignLeft, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight,
  Columns2, ExternalLink, Filter, List, MessageCircle, Mic2, MoreVertical, Pencil, Search,
  Send, Settings2, Sparkles, SpellCheck, Star, LayoutTemplate,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { HorizontalResizeHandle } from "@/app/components/layout/HorizontalResizeHandle";
import {
  clampReviewsListWidth,
  maxReviewsListWidth,
  REVIEWS_LIST_WIDTH_DEFAULT,
  REVIEWS_LIST_WIDTH_MIN,
  useReviewsListPanelWidth,
} from "@/app/hooks/useReviewsListPanelWidth";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ReviewBody, formatReviewDateRelative } from "./ReviewsView.v1";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import type { ReviewsViewMode } from "./ReviewsView";
import svgPaths from "../../imports/svg-k7qrt1366a";
import { ReviewSiteLogo, type ReviewPlatformSite } from "@/app/components/reviewPlatformLogos";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  suggestedReply?: string;
  existingReply?: { text: string; author: string; date: string; platform: string };
  hasConversation?: boolean;
}

interface ReplyTemplate {
  id: string;
  name: string;
  content: string;
  source: string;
}

// ─── Images ──────────────────────────────────────────────────────────────────

const img1 = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format";
const img2 = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format";
const img3 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format";
const img4 = "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format";
const img5 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format";
const img6 = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format";
const img7 = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format";

const GALLERY_FULL = [img1, img2, img3, img4, img5, img6, img7];

// ─── Mock templates ───────────────────────────────────────────────────────────

const TEMPLATES: ReplyTemplate[] = [
  {
    id: "t1",
    name: "1 Star No Comment (3)",
    content: "Thank you for your feedback. We're sorry to hear about your experience. Please contact us directly so we can make this right.",
    source: "Feet Road - A",
  },
  {
    id: "t2",
    name: "1 Star No Comment (4)",
    content: "We would be grateful if you could contact the practice, to enable us to resolve any issue you have that may have led to your 1-star review.\nKind Regards\nmydentist Patient Support Team",
    source: "Feet Road - A",
  },
  {
    id: "t3",
    name: "1 Star No Comment (5)",
    content: "We are sorry to see your low rating. We take all feedback seriously and would love the opportunity to learn more about your experience. Please reach out to us directly.",
    source: "Feet Road - A",
  },
  {
    id: "t4",
    name: "5 Star Thank You",
    content: "Thank you so much for your wonderful review! We're delighted to hear you had a great experience. We look forward to seeing you again soon!",
    source: "Corporate Template",
  },
  {
    id: "t5",
    name: "General Response",
    content: "We appreciate your feedback! Thank you for taking the time to share your experience with us. Your input helps us improve our service.",
    source: "Corporate Template",
  },
  {
    id: "t6",
    name: "Service Recovery",
    content: "We sincerely apologize for falling short of your expectations. We value your feedback and are taking immediate steps to address the issues you raised. Please contact us so we can make this right.",
    source: "Corporate Template",
  },
];

// ─── Mock reviews ─────────────────────────────────────────────────────────────

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
    text: "I had a great time here, the place is situated near Wagle circle. It has top notch ambience and a really cool vibe. The food and drinks were pretty good and I would definitely recommend this to all the non veg lovers. The restaurant is pretty big and can accommodate a huge crowd with indoor as well as outdoor seating. The prices for the dishes are reasonable and totally worth it.\n\nMy personal favorites were the desserts, especially the DIY cake station where you pick toppings and sauces. The staff explained every course without rushing us, and water refills were constant without having to wave someone down.\n\nIf I had to nitpick, the music near the bar was a touch loud for conversation, but tables farther in were perfect. Parking nearby can fill up on weekends, so plan a few extra minutes. Overall this was one of the better dining experiences I have had in the area.",
    replyStatus: "post",
    suggestedReply: "We appreciate your feedback! Thank you for taking the time to share your experience with us.",
    hasConversation: true,
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
    text: "I recently had the pleasure of dining at Magna and it was an outstanding experience from start to finish. The menu is diverse and thoughtfully curated, with enough variety that every person in our group found something they were excited about.\n\nThe servers were attentive and knowledgeable when we asked about allergens and spice levels. Wine suggestions paired well with our mains, and nobody felt rushed even though the dining room was full.\n\nDesserts were a highlight: not overly sweet, and plated with care. I would recommend Magna for date nights, small team dinners, or visitors who want a reliable splurge without gimmicks.",
    replyStatus: "post",
    suggestedReply: "Thank you for the kind words, Daniel! We're so glad you enjoyed your dining experience with us.",
    hasConversation: false,
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
    text: "This is a huge place where you can hang out with friends or relatives without feeling cramped. There are several seating zones, from quieter corners to a livelier central area, so you can match the mood to your group. We visited on a Saturday evening and still found a comfortable table within ten minutes.",
    replyStatus: "edit",
    hasReplyDots: true,
    existingReply: {
      text: "Thank you for visiting us, Austin! We're thrilled you enjoyed the atmosphere. We look forward to welcoming you back soon.",
      author: "Sampada (me)",
      date: "Jan 9, 2023",
      platform: "Yelp",
    },
    hasConversation: true,
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
    text: "This place is amazing. The ambience is beautiful without feeling stiff, and the staff are cooperative and friendly from the moment you walk in. I tried the lunch express menu and you should definitely consider it if you want speed without sacrificing flavor.",
    replyStatus: "post",
    hasReplyDots: true,
    suggestedReply: "We appreciate your kind feedback! We're glad you enjoyed our lunch express menu.",
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
    text: "We hosted a team dinner here and everything ran smoothly from the first email confirmation to the final bill. Reservations were honored on time, dietary restrictions were taken seriously, and the manager checked in once without hovering.",
    replyStatus: "post",
    suggestedReply: "Thank you for choosing us for your team dinner, Priya! We're delighted everything went smoothly.",
  },
  {
    id: 6,
    site: "tripadvisor",
    rating: 3,
    reviewer: "Marco Benedetti",
    date: "Mar 18, 2024",
    employees: 2,
    location: "California",
    photos: [img3, img4],
    text: "The food itself was fine: flavors were balanced and plating looked thoughtful. Unfortunately we waited almost forty minutes past our reservation time before we were seated, and the host stand updates were vague.",
    replyStatus: "edit",
    hasReplyDots: true,
    existingReply: {
      text: "We sincerely apologize for the wait, Marco. Your experience does not reflect our standards and we are actively working to improve our reservation management.",
      author: "Manager",
      date: "Mar 20, 2024",
      platform: "TripAdvisor",
    },
    hasConversation: true,
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
    text: "Our order was wrong twice in one meal, which is hard to excuse when the restaurant was not at full capacity. It took three separate asks to get water refills, and empty plates sat on the edge of the table for a long time.",
    replyStatus: "post",
    suggestedReply: "We are truly sorry for the experience you had, Jordan. This is not the standard we hold ourselves to and we'd like to make it right.",
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
    text: "The brunch lineup here is strong, especially the shakshuka with enough spice to wake you up without overpowering the tomatoes. Fresh juices taste like real fruit, not syrup, and the coffee program is better than most brunch spots in the neighborhood.",
    replyStatus: "edit",
    existingReply: {
      text: "Thank you for the wonderful review, Elena! We're so happy our brunch hit the spot. The shakshuka is a team favorite too!",
      author: "Sampada (me)",
      date: "May 14, 2024",
      platform: "Facebook",
    },
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
    text: "I stayed nearby on business and ate here three nights in a row because the quality stayed consistent. Portions are generous without feeling sloppy, and the bartender remembered my usual by the second visit.",
    replyStatus: "post",
    suggestedReply: "We're so glad you made us your go-to spot during your trip, Tom! We look forward to welcoming you back.",
    hasConversation: false,
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
    text: "This is the best fried chicken sandwich I have had in the city in a long time. The breading stays crispy, the meat stays juicy, and the slaw actually has crunch instead of turning soggy.",
    replyStatus: "post",
    hasReplyDots: true,
    suggestedReply: "Thank you so much, Samira! We put a lot of care into that sandwich and it means the world to hear you loved it.",
    hasConversation: true,
  },
  {
    id: 11,
    site: "yelp",
    rating: 1,
    reviewer: "Chris P.",
    date: "Jul 8, 2024",
    employees: 1,
    location: "California",
    photos: [img5, img6, img1, img2],
    text: "We found a hair in the appetizer, which immediately killed our appetite for the rest of the round. The manager apologized, but we were still charged for the dish, which felt dismissive given the circumstances.",
    replyStatus: "edit",
    hasReplyDots: true,
    existingReply: {
      text: "We sincerely apologize for what you experienced, Chris. We have addressed this with our kitchen team and would like to offer you a complimentary visit to make things right.",
      author: "Manager",
      date: "Jul 10, 2024",
      platform: "Yelp",
    },
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
    text: "The ambience is lovely: warm lighting, comfortable chairs, and music at a volume that still allows conversation. Cocktails are creative and balanced, with clear flavors rather than a sugar bomb.",
    replyStatus: "post",
    suggestedReply: "Thank you for the feedback, Riley! We're glad you enjoyed the cocktails and ambience.",
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
    text: "This is a great spot for families. The kids' menu had real options, not just nuggets and fries, and our children actually ate their meals without negotiation. High chairs were clean and staff brought crayons without us asking.",
    replyStatus: "post",
    suggestedReply: "Thank you, Amélie! We love welcoming families and are so glad your little ones enjoyed the kids' menu.",
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
    text: "Solid weekday lunch spot with predictable quality. The soup and half sandwich deal is a bargain given the portion size, and the soup tasted like it was made in house rather than poured from a bag.",
    replyStatus: "edit",
    existingReply: {
      text: "Thanks for the kind words, Devon! We're proud of our soups — made fresh daily. See you for lunch soon!",
      author: "Sampada (me)",
      date: "Oct 4, 2024",
      platform: "Google",
    },
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
    text: "Our anniversary dinner exceeded expectations in almost every way. The sommelier pairing was thoughtful without being pushy, and each pour matched the food rather than overpowering it. Pacing between courses was perfect.",
    replyStatus: "post",
    suggestedReply: "Happy anniversary, Hannah! We're honored you chose us for such a special occasion. Wishing you many more!",
    hasConversation: false,
  },
  {
    id: 16,
    site: "facebook",
    rating: 2,
    reviewer: "Alex Rivera",
    date: "Dec 7, 2024",
    employees: 1,
    location: "Georgia",
    photos: [img7, img4],
    text: "Our delivery order arrived cold and missing sides, which is frustrating when you are ordering for a group at home. In app support offered a partial credit only, and the back and forth took longer than remaking the meal would have.",
    replyStatus: "post",
    suggestedReply: "We're very sorry about your delivery experience, Alex. This is not acceptable and we want to make it right for you.",
  },
];

// ─── Star rating ───────────────────────────────────────────────────────────────

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
            className={filled ? "fill-[#D4A017] stroke-[#D4A017]" : "fill-none stroke-[#D4A017]"}
          />
        );
      })}
    </div>
  );
}

// ─── Progressive image ────────────────────────────────────────────────────────

function ProgressiveImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [phase, setPhase] = useState<"idle" | "blurring" | "sharp">("idle");
  useEffect(() => { setPhase("idle"); }, [src]);
  const handleLoad = () => {
    setPhase("blurring");
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("sharp")));
  };
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[#eff0f2] dark:bg-[#282d37] animate-pulse opacity-70 transition-opacity duration-300"
        style={{ opacity: phase === "idle" ? 1 : 0 }}
      />
      <img
        src={src}
        alt={alt}
        className="relative w-full h-full object-cover"
        style={{
          opacity: phase === "idle" ? 0 : 1,
          filter: phase === "sharp" ? "blur(0px)" : "blur(8px)",
          transform: phase === "sharp" ? "scale(1)" : "scale(1.03)",
          transition: phase === "sharp" ? "filter 400ms ease-out, transform 400ms ease-out" : "none",
        }}
        onLoad={handleLoad}
        onError={() => setPhase("sharp")}
      />
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ photos, index, onClose, onPrev, onNext }: {
  photos: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl p-2">✕</button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{index + 1} / {photos.length}</div>
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div className="max-h-[85vh] max-w-[90vw] rounded-[8px] shadow-2xl overflow-hidden" style={{ aspectRatio: "4/3" }} onClick={(e) => e.stopPropagation()}>
        <ProgressiveImg src={photos[index]} alt={`Photo ${index + 1}`} className="h-full w-full" />
      </div>
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────────────────────

const CAROUSEL_GAP = 8;
const THUMB_MIN_W = 120;
const THUMB_ASPECT = 4 / 3;

function PhotoCarousel({ photos }: { photos: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const visibleCount = containerW > 0 ? Math.max(2, Math.floor((containerW + CAROUSEL_GAP) / (THUMB_MIN_W + CAROUSEL_GAP))) : 4;
  const maxOffset = Math.max(0, photos.length - visibleCount);
  const clampedOffset = Math.min(scrollOffset, maxOffset);
  const canScrollLeft = clampedOffset > 0;
  const canScrollRight = clampedOffset < maxOffset;
  const visiblePhotos = photos.slice(clampedOffset, clampedOffset + visibleCount);
  const thumbW = containerW > 0 ? Math.floor((containerW - (visibleCount - 1) * CAROUSEL_GAP) / visibleCount) : THUMB_MIN_W;
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
        {canScrollLeft && <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-background/80 to-transparent rounded-l-lg" />}
        {canScrollRight && <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-background/80 to-transparent rounded-r-lg" />}
        <div className="flex overflow-hidden" style={{ gap: CAROUSEL_GAP }}>
          {visiblePhotos.map((photo, idx) => {
            const absIdx = clampedOffset + idx;
            return (
              <div key={absIdx} onClick={() => setLightboxIndex(absIdx)} className="relative shrink-0 cursor-pointer rounded-xl overflow-hidden" style={{ width: thumbW, height: thumbH }}>
                <ProgressiveImg src={photo} alt={`Review photo ${absIdx + 1}`} className="w-full h-full" />
                <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10" />
              </div>
            );
          })}
        </div>
        {canScrollLeft && (
          <button type="button" onClick={() => setScrollOffset((p) => Math.max(0, p - 1))} aria-label="Previous photos" className="absolute left-2 top-1/2 z-[2] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 border border-border shadow-md backdrop-blur-sm hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
        )}
        {canScrollRight && (
          <button type="button" onClick={() => setScrollOffset((p) => Math.min(maxOffset, p + 1))} aria-label="Next photos" className="absolute right-2 top-1/2 z-[2] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 border border-border shadow-md backdrop-blur-sm hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </>
  );
}

// ─── BirdAI suggested reply ───────────────────────────────────────────────────

function MynaAIReply({ text, hasThreeDots }: { text?: string; hasThreeDots?: boolean }) {
  return (
    <div className="relative bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-[8px] p-4 w-full">
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">BirdAI suggested reply</span>
          <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
          <div className="flex items-center">
            <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">Reply as</span>
            <div className="flex items-center gap-[2px] px-1 rounded-full cursor-pointer">
              <span className="text-[12px] text-[#1976d2]">Sampada (me)</span>
              <svg className="w-[7.5px] h-[3.75px]" viewBox="0 0 7.5 3.75" fill="none">
                <path d="M0 0L3.75 3.75L7.5 0H0Z" fill="#49454F" />
              </svg>
            </div>
          </div>
        </div>
        <p className="text-[13px] text-[#212121] dark:text-[#d0d0d0] leading-[18px]">
          {text ?? "We appreciate your feedback! Thank you for taking the time to share your experience with us."}
        </p>
      </div>
      {hasThreeDots && (
        <div className="absolute right-3 top-2 bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-full size-[24px] flex items-center justify-center">
          <MoreVertical className="size-[12px] text-[#757575]" />
        </div>
      )}
    </div>
  );
}

// ─── AI reply dropdown menu ────────────────────────────────────────────────────

function AIReplyMenu({ onSelect }: { onSelect: (action: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="AI writing assistant"
          className="flex items-center gap-1 px-2 py-1 rounded-md border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] hover:bg-muted text-[#6834B7] transition-colors"
        >
          <svg className="w-[14px] h-[14px]" viewBox="0 0 16.6975 14.8252" fill="none">
            <path d={svgPaths.p33170700} fill="#6834B7" />
            <path d={svgPaths.p2d8f3b80} fill="#6834B7" />
            <path clipRule="evenodd" d={svgPaths.p1692000} fill="#6834B7" fillRule="evenodd" />
            <path d={svgPaths.p4cf0c70} fill="#6834B7" />
          </svg>
          <span className="text-[11px] font-medium text-[#6834B7]">AI</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase py-1">Generate</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect("generate-reply")}>
          <Sparkles className="size-4 text-[#6834B7]" />
          <span>Reply</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase py-1">Modify</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Mic2 className="size-4" />
            <span>Change tone</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {["Professional", "Friendly", "Empathetic", "Formal"].map((tone) => (
              <DropdownMenuItem key={tone} onClick={() => onSelect(`tone-${tone.toLowerCase()}`)}>{tone}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => onSelect("make-shorter")}>
          <AlignLeft className="size-4" />
          <span>Make shorter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("make-longer")}>
          <AlignJustify className="size-4" />
          <span>Make longer</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("fix-grammar")}>
          <SpellCheck className="size-4" />
          <span>Fix spelling and grammar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase py-1">Configure</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect("ai-prompts")}>
          <Settings2 className="size-4" />
          <span>AI prompts</span>
          <ExternalLink className="size-3 ml-auto text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Template picker dialog ───────────────────────────────────────────────────

function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (content: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  );
  const selected = TEMPLATES.find((t) => t.id === selectedId);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected.content);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-[15px]">Select a reply template</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground" />
            <input
              type="search"
              placeholder="Find"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex min-h-[320px] max-h-[400px] overflow-hidden">
          {/* List */}
          <div className="w-[240px] shrink-0 border-r overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-4 py-3 text-[13px] border-b last:border-b-0 transition-colors ${
                  selectedId === t.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-[#212121] dark:text-[#e4e4e4] hover:bg-muted"
                }`}
              >
                {t.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-[12px] text-muted-foreground">No templates found</p>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 min-w-0 overflow-y-auto p-5">
            {selected ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#212121] dark:text-[#e4e4e4]">{selected.name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{selected.source}</span>
                </div>
                <p className="text-[13px] leading-[18px] text-[#212121] dark:text-[#d0d0d0] whitespace-pre-line">{selected.content}</p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] text-muted-foreground">Select a template to preview</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>Use this template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reply editor ─────────────────────────────────────────────────────────────

function ReviewReplyEditor({
  initialText,
  onCancel,
  onPost,
}: {
  initialText?: string;
  onCancel: () => void;
  onPost: (text: string, submitForApproval?: boolean) => void;
}) {
  const [text, setText] = useState(initialText ?? "");
  const [focused, setFocused] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  const handleAIAction = (action: string) => {
    if (action === "generate-reply") {
      setText("We appreciate your feedback! Thank you for taking the time to share your experience with us.");
    } else if (action === "make-shorter" && text) {
      setText(text.slice(0, Math.ceil(text.length * 0.6)) + (text.length > 80 ? "..." : ""));
    } else if (action === "fix-grammar") {
      setText(text.replace(/\bi\b/g, "I"));
    }
  };

  return (
    <>
      <TemplatePickerDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={(content) => setText(content)}
      />

      <div className="flex flex-col gap-3 w-full">
        <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">Review reply</span>

        {/* Textarea box */}
        <div className={`flex flex-col rounded-lg border bg-white dark:bg-[#262b35] transition-all ${focused ? "border-primary ring-1 ring-primary" : "border-[#e5e9f0] dark:border-[#333a47]"}`}>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Write a reply or generate one using AI"
            className="resize-none rounded-t-lg bg-transparent px-3 pt-3 text-[13px] leading-[18px] text-[#212121] dark:text-[#e4e4e4] outline-none placeholder:text-[#1976d2] dark:placeholder:text-[#90caf9]"
          />
          {/* Toolbar row inside box */}
          <div className="flex items-center gap-2 px-2 pb-2 pt-1">
            <button
              type="button"
              title="Use a reply template"
              onClick={() => setTemplateOpen(true)}
              className="flex items-center justify-center size-7 rounded-md border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] hover:bg-muted transition-colors"
            >
              <LayoutTemplate className="size-[14px] text-[#555] dark:text-[#8b92a5]" />
            </button>
            <AIReplyMenu onSelect={handleAIAction} />
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-[#1976d2]">Cancel</Button>
          {/* Split button */}
          <div className="flex items-center">
            <Button
              size="sm"
              disabled={!text.trim()}
              onClick={() => onPost(text)}
              className="rounded-r-none pr-3"
            >
              Post reply
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="rounded-l-none border-l border-primary-foreground/30 px-2">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPost(text, true)}>Submit for approval</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Review detail panel ──────────────────────────────────────────────────────

function ReviewDetailPanel({
  review,
  replyEditing,
  onEditReply,
  onCancelReply,
  onPostReply,
  onOpenConversation,
}: {
  review: Review;
  replyEditing: boolean;
  onEditReply: () => void;
  onCancelReply: () => void;
  onPostReply: (text: string, submitForApproval?: boolean) => void;
  onOpenConversation: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-[#1e2229]">
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-5 max-w-3xl">

          {/* Review header */}
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <ReviewSiteLogo site={review.site} size={40} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[13px] font-semibold leading-tight text-[#212121] dark:text-[#e4e4e4]">{review.reviewer}</span>
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <StarRating rating={review.rating} size={14} />
                  <span className="text-[#555] dark:text-[#8b92a5]">{formatReviewDateRelative(review.date)}</span>
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
              <span className="whitespace-nowrap">{review.employees} {review.employees === 1 ? "employee" : "employees"}</span>
              <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
              <span className="whitespace-nowrap">{review.location}</span>
            </div>
          </div>

          {/* Full review text */}
          <ReviewBody key={review.id} text={review.text} />

          {/* Photos */}
          {review.photos.length > 0 && <PhotoCarousel photos={review.photos} />}

          {/* Existing reply display (edit mode, not currently editing) */}
          {review.replyStatus === "edit" && review.existingReply && !replyEditing && (
            <div className="rounded-lg border border-[#e5e9f0] dark:border-[#333a47] bg-[#f7f8fa] dark:bg-[#262b35] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-[#555] dark:text-[#8b92a5]">Response posted on</span>
                <span className="text-[11px] font-medium text-[#555] dark:text-[#8b92a5]">{review.existingReply.platform}</span>
                <div className="size-[3px] shrink-0 rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                <span className="text-[11px] text-[#555] dark:text-[#8b92a5]">{formatReviewDateRelative(review.existingReply.date)}</span>
              </div>
              <p className="text-[13px] leading-[18px] text-[#212121] dark:text-[#d0d0d0]">{review.existingReply.text}</p>
            </div>
          )}

          {/* BirdAI suggestion (post mode only, not editing) */}
          {review.replyStatus === "post" && !replyEditing && (
            <MynaAIReply text={review.suggestedReply} hasThreeDots={review.hasReplyDots} />
          )}

          {/* Reply editor */}
          {replyEditing ? (
            <ReviewReplyEditor
              initialText={review.existingReply?.text}
              onCancel={onCancelReply}
              onPost={onPostReply}
            />
          ) : (
            /* Action row */
            <div className="flex w-full items-center gap-2">
              {review.replyStatus === "post" ? (
                <button
                  type="button"
                  title="Post reply"
                  onClick={onEditReply}
                  className="flex size-8 items-center justify-center rounded-md text-[#555] dark:text-[#8b92a5] hover:bg-muted transition-colors"
                >
                  <Send className="size-[16px]" strokeWidth={1.2} absoluteStrokeWidth />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onEditReply}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#e5e9f0] dark:border-[#333a47] text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:bg-muted transition-colors"
                >
                  <Pencil className="size-[13px]" strokeWidth={1.2} absoluteStrokeWidth />
                  Edit reply
                </button>
              )}

              {/* Chat icon */}
              <button
                type="button"
                title="Open conversation"
                onClick={onOpenConversation}
                className="relative flex size-8 items-center justify-center rounded-md text-[#555] dark:text-[#8b92a5] hover:bg-muted transition-colors"
              >
                <MessageCircle className="size-[16px]" strokeWidth={1.2} absoluteStrokeWidth />
                {review.hasConversation && (
                  <span className="absolute top-1 right-1 size-[6px] rounded-full bg-primary" aria-hidden />
                )}
              </button>

              {/* More menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" title="More actions" className="flex size-8 items-center justify-center rounded-md text-[#555] dark:text-[#8b92a5] hover:bg-muted transition-colors">
                    <MoreVertical className="size-[16px]" strokeWidth={1.2} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Create ticket</DropdownMenuItem>
                  <DropdownMenuItem>Add tag</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation panel ───────────────────────────────────────────────────────

function ReviewConversationPanel({
  review,
  onBack,
}: {
  review: Review;
  onBack: () => void;
}) {
  const [composerText, setComposerText] = useState("");
  const [editingReply, setEditingReply] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-[#1e2229]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e9f0] dark:border-[#333a47] shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4 text-[#555] dark:text-[#8b92a5]" />
        </button>
        <span className="flex-1 text-[14px] font-medium text-[#212121] dark:text-[#e4e4e4] truncate">{review.reviewer}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex h-7 items-center gap-1 px-3 rounded-md border border-[#e5e9f0] dark:border-[#333a47] text-[12px] text-[#555] dark:text-[#8b92a5] hover:bg-muted">
              Unassigned
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Assign to me</DropdownMenuItem>
            <DropdownMenuItem>Assign to team...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
              <MoreVertical className="size-4 text-[#555] dark:text-[#8b92a5]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Create ticket</DropdownMenuItem>
            <DropdownMenuItem>Add tag</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete conversation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Date separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e5e9f0] dark:bg-[#333a47]" />
          <span className="text-[11px] text-[#8b92a5] shrink-0">Today • Apr 21</span>
          <div className="flex-1 h-px bg-[#e5e9f0] dark:bg-[#333a47]" />
        </div>

        {/* System chips */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-[#f0f1f5] dark:bg-[#262b35] rounded-full px-3 py-1.5 max-w-[280px]">
            <span className="text-[11px]">📧</span>
            <span className="text-[12px] font-medium text-[#212121] dark:text-[#e4e4e4]">RR - WAR</span>
          </div>
          <span className="text-[10px] text-[#8b92a5] pr-1">System · 11:18 AM</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-[#f0f1f5] dark:bg-[#262b35] rounded-full px-3 py-1.5 max-w-[280px]">
            <span className="text-[11px]">📧</span>
            <span className="text-[12px] font-medium text-[#212121] dark:text-[#e4e4e4]">Review Request email(95)</span>
          </div>
          <span className="text-[10px] text-[#8b92a5] pr-1">System · 11:33 AM</span>
        </div>

        {/* Embedded review card */}
        <div className="rounded-lg border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] overflow-hidden">
          {/* Card header */}
          <div className="flex items-start justify-between px-4 py-3 border-b border-[#e5e9f0] dark:border-[#333a47]">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#8b92a5] uppercase tracking-wide">Direct feedback</span>
                <ReviewSiteLogo site={review.site} size={16} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#212121] dark:text-[#e4e4e4]">{review.reviewer}</span>
                <span className="text-[11px] text-[#8b92a5]">{review.date}</span>
                <span className="text-[11px] text-[#8b92a5]">• 8 custom fields</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8b92a5] truncate max-w-[100px]">{review.location}</span>
            </div>
          </div>

          {/* Review text */}
          <div className="px-4 py-3">
            <StarRating rating={review.rating} size={12} />
            <p className="mt-2 text-[13px] leading-[18px] text-[#212121] dark:text-[#d0d0d0] line-clamp-4">{review.text}</p>
          </div>

          {/* Response block */}
          {review.existingReply && !editingReply && (
            <div className="mx-4 mb-3 rounded-lg bg-[#f7f8fa] dark:bg-[#1e2229] p-3">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[11px] text-[#555] dark:text-[#8b92a5]">Response auto-posted on</span>
                <span className="text-[11px] font-semibold text-[#555] dark:text-[#8b92a5]">{review.existingReply.platform}</span>
                <span className="text-[11px] text-[#8b92a5]">· {formatReviewDateRelative(review.existingReply.date)}</span>
              </div>
              <p className="text-[13px] leading-[18px] text-[#212121] dark:text-[#d0d0d0]">{review.existingReply.text}</p>
            </div>
          )}

          {/* Inline edit reply editor in conversation view */}
          {editingReply && (
            <div className="px-4 pb-4">
              <ReviewReplyEditor
                initialText={review.existingReply?.text}
                onCancel={() => setEditingReply(false)}
                onPost={() => setEditingReply(false)}
              />
            </div>
          )}

          {/* Card action row */}
          {!editingReply && (
            <div className="flex items-center justify-end gap-2 px-4 pb-3">
              {review.replyStatus === "edit" ? (
                <button
                  type="button"
                  onClick={() => setEditingReply(true)}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-[#e5e9f0] dark:border-[#333a47] text-[12px] text-[#212121] dark:text-[#e4e4e4] hover:bg-muted transition-colors"
                >
                  Edit reply
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingReply(true)}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-[#e5e9f0] dark:border-[#333a47] text-[12px] text-[#212121] dark:text-[#e4e4e4] hover:bg-muted transition-colors"
                >
                  <Pencil className="size-[11px]" />
                  Add reply
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex size-7 items-center justify-center rounded-md border border-[#e5e9f0] dark:border-[#333a47] hover:bg-muted transition-colors">
                    <MoreVertical className="size-[13px] text-[#555] dark:text-[#8b92a5]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Create ticket</DropdownMenuItem>
                  <DropdownMenuItem>Add tag</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <span className="text-[10px] text-[#8b92a5]">11:36 AM</span>
      </div>

      {/* Composer footer */}
      <div className="shrink-0 border-t border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#1e2229]">
        <div className="flex items-center gap-2 px-4 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-1 h-6 text-[12px] font-medium text-primary hover:text-primary/80">
                Email
                <ChevronDown className="size-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>SMS</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <textarea
          rows={2}
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          placeholder="Type your message or use a template"
          className="w-full resize-none bg-transparent px-4 py-2 text-[13px] leading-[18px] text-[#212121] dark:text-[#e4e4e4] outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <div className="flex items-center gap-1">
            <button type="button" title="Template" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
              <LayoutTemplate className="size-[14px]" />
            </button>
            <button type="button" title="Payment" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground text-[13px] font-bold">$</button>
            <button type="button" title="Attachment" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
              <svg className="size-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button type="button" title="Emoji" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground text-[15px]">😊</button>
            <button type="button" title="AI" className="flex size-7 items-center justify-center rounded-md hover:bg-muted">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 16.6975 14.8252" fill="none">
                <path d={svgPaths.p33170700} fill="#6834B7" />
                <path d={svgPaths.p2d8f3b80} fill="#6834B7" />
                <path clipRule="evenodd" d={svgPaths.p1692000} fill="#6834B7" fillRule="evenodd" />
                <path d={svgPaths.p4cf0c70} fill="#6834B7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <Button size="sm" disabled={!composerText.trim()} className="rounded-r-none pr-3">Send</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="rounded-l-none border-l border-primary-foreground/30 px-2">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Send and close</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review list panel ────────────────────────────────────────────────────────

function ReviewListPanel({
  reviews,
  selectedId,
  onSelect,
  viewMode,
  onViewModeChange,
}: {
  reviews: Review[];
  selectedId: number;
  onSelect: (id: number) => void;
  viewMode?: ReviewsViewMode;
  onViewModeChange?: (mode: ReviewsViewMode) => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#1e2229] border-r border-[#e5e9f0] dark:border-[#333a47]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-medium text-[#212121] dark:text-[#e4e4e4]">All reviews</h2>
            <div className="flex items-center gap-1 text-[11px] text-[#555] dark:text-[#8b92a5] mt-0.5">
              <span>{reviews.length} reviews</span>
              <div className="size-[3px] rounded-full bg-[#555] dark:bg-[#8b92a5] mx-0.5" />
              <span>4.1</span>
              <StarRating rating={4} size={10} />
            </div>
          </div>
          <div className="flex items-center gap-1">
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
            <button type="button" title="Filter" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
              <Filter className="size-[13px]" />
            </button>
            <button type="button" title="Sort" className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
              <svg className="size-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {reviews.map((review) => {
          const isSelected = review.id === selectedId;
          return (
            <button
              key={review.id}
              type="button"
              onClick={() => onSelect(review.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
                isSelected
                  ? "bg-primary/[0.07] dark:bg-primary/10"
                  : "hover:bg-[#f7f8fa] dark:hover:bg-[#262b35]"
              }`}
            >
              {/* Platform icon */}
              <div className="shrink-0 mt-0.5">
                <ReviewSiteLogo site={review.site} size={28} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-semibold truncate ${isSelected ? "text-primary" : "text-[#212121] dark:text-[#e4e4e4]"}`}>
                    {review.reviewer}
                  </span>
                  <span className="text-[10px] text-[#8b92a5] shrink-0">{formatReviewDateRelative(review.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={10} />
                </div>
                <p className="text-[11px] text-[#555] dark:text-[#8b92a5] line-clamp-1 mt-0.5">{review.text}</p>
                <div className="mt-0.5">
                  <span className="text-[10px] text-[#8b92a5]">{review.location}</span>
                </div>
              </div>
            </button>
          );
        })}
        {reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-[13px] text-muted-foreground">No reviews found</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReviewsViewConversation({
  viewMode,
  onViewModeChange,
}: {
  viewMode?: ReviewsViewMode;
  onViewModeChange?: (mode: ReviewsViewMode) => void;
} = {}) {
  const [selectedId, setSelectedId] = useState<number>(mockReviews[0].id);
  const [rightPaneMode, setRightPaneMode] = useState<"detail" | "conversation">("detail");
  const [replyEditing, setReplyEditing] = useState(false);

  const selectedReview = mockReviews.find((r) => r.id === selectedId) ?? mockReviews[0];

  const handleSelectReview = (id: number) => {
    setSelectedId(id);
    setRightPaneMode("detail");
    setReplyEditing(false);
  };

  const handlePostReply = (_text: string, _submitForApproval?: boolean) => {
    setReplyEditing(false);
  };

  /* ── Resizable list panel (same pattern as InboxView) ── */
  const listContainerRef = useRef<HTMLDivElement>(null);
  const resizeDraggingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWRef = useRef(0);

  const rowWidth =
    listContainerRef.current?.parentElement?.clientWidth ?? 1200;
  const { width: listWidth, setWidth: setListWidth, widthRef: listWidthRef } =
    useReviewsListPanelWidth(rowWidth);
  const maxListW = maxReviewsListWidth(rowWidth);

  const onResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      resizeDraggingRef.current = true;
      resizeStartXRef.current = e.clientX;
      resizeStartWRef.current = listWidthRef.current;
      e.currentTarget.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (!resizeDraggingRef.current) return;
        const delta = ev.clientX - resizeStartXRef.current;
        const rW =
          listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
        const next = clampReviewsListWidth(resizeStartWRef.current + delta, rW);
        listWidthRef.current = next;
        const el = listContainerRef.current;
        if (el) el.style.width = `${next}px`;
      };

      const onUp = (ev: PointerEvent) => {
        resizeDraggingRef.current = false;
        try {
          e.currentTarget.releasePointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        const rW =
          listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
        const finalW = clampReviewsListWidth(listWidthRef.current, rW);
        listWidthRef.current = finalW;
        setListWidth(finalW);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [rowWidth, setListWidth, listWidthRef]
  );

  const onResizeHandleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rW =
        listContainerRef.current?.parentElement?.clientWidth ?? rowWidth;
      const target = clampReviewsListWidth(REVIEWS_LIST_WIDTH_DEFAULT, rW);
      listWidthRef.current = target;
      setListWidth(target);
      const el = listContainerRef.current;
      if (el) el.style.width = `${target}px`;
    },
    [rowWidth, setListWidth, listWidthRef]
  );

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-[#1e2229]">
      <div
        ref={listContainerRef}
        className="relative flex shrink-0 flex-col min-h-0"
        style={{ width: listWidth }}
      >
        <HorizontalResizeHandle
          side="right"
          aria-label="Resize review list"
          aria-valuenow={Math.round(listWidth)}
          aria-valuemin={REVIEWS_LIST_WIDTH_MIN}
          aria-valuemax={Math.round(maxListW)}
          onPointerDown={onResizePointerDown}
          onDoubleClick={onResizeHandleDoubleClick}
        />
        <ReviewListPanel
          reviews={mockReviews}
          selectedId={selectedId}
          onSelect={handleSelectReview}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>

      <div className="flex-1 min-w-0 min-h-0">
        {rightPaneMode === "detail" ? (
          <ReviewDetailPanel
            review={selectedReview}
            replyEditing={replyEditing}
            onEditReply={() => setReplyEditing(true)}
            onCancelReply={() => setReplyEditing(false)}
            onPostReply={handlePostReply}
            onOpenConversation={() => { setRightPaneMode("conversation"); setReplyEditing(false); }}
          />
        ) : (
          <ReviewConversationPanel
            review={selectedReview}
            onBack={() => setRightPaneMode("detail")}
          />
        )}
      </div>
    </div>
  );
}
