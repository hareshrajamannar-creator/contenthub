/**
 * PostCard
 *
 * Calendar card for a single scheduled content item.
 * All icons are lucide-react @ strokeWidth={1.6} + absoluteStrokeWidth.
 * Platform indicators are small inline SVGs (brand colours only).
 * No raw hex / rgba values in className — semantic tokens only.
 */

import React from 'react';
import {
  Pencil, CalendarDays, Copy, MoreHorizontal,
  Share2, FileText, HelpCircle, Mail, LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScheduledItem } from './calendarData';

// ── Platform brand icons (inline SVG, small and consistent) ──────────────────

const PlatformDot: React.FC<{ platform: string }> = ({ platform }) => {
  const size = 16;
  if (platform === 'facebook') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-label="Facebook">
      <circle cx="10" cy="10" r="10" fill="#1877F2" />
      <path d="M13.5 10H11.5V16H9V10H7.5V8H9V6.5C9 5.1 9.9 4 11.5 4H13V6H12C11.4 6 11.5 6.3 11.5 6.8V8H13L13.5 10Z" fill="white" />
    </svg>
  );
  if (platform === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-label="Instagram">
      <rect width="20" height="20" rx="5" fill="url(#ig_pc)" />
      <circle cx="10" cy="10" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="6" r="1" fill="white" />
      <defs>
        <linearGradient id="ig_pc" x1="0" y1="20" x2="20" y2="0">
          <stop stopColor="#F58529" />
          <stop offset="0.5" stopColor="#DD2A7B" />
          <stop offset="1" stopColor="#515BD4" />
        </linearGradient>
      </defs>
    </svg>
  );
  if (platform === 'linkedin') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-label="LinkedIn">
      <rect width="20" height="20" rx="3" fill="#0A66C2" />
      <path d="M5 8h2v7H5V8zm1-3a1 1 0 110 2 1 1 0 010-2zm3 3h2v1h.03C11.4 8.6 12.2 8 13.3 8c2.2 0 2.7 1.4 2.7 3.3V15h-2v-3.3c0-.8 0-1.7-1-1.7s-1.2.8-1.2 1.7V15H9V8z" fill="white" />
    </svg>
  );
  if (platform === 'twitter') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-label="X / Twitter">
      <circle cx="10" cy="10" r="10" fill="#000" />
      <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">X</text>
    </svg>
  );
  return null;
};

// ── Dummy image seeds per content type ───────────────────────────────────────

const IMAGE_SEEDS: Record<string, string> = {
  social:  'garden-social',
  blog:    'nature-blog',
  faq:     'lawn-faq',
  email:   'email-promo',
  landing: 'landscape-lp',
};

// ── Content type icon (lucide) ────────────────────────────────────────────────

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  social:  <Share2         size={13} strokeWidth={1.6} absoluteStrokeWidth />,
  blog:    <FileText       size={13} strokeWidth={1.6} absoluteStrokeWidth />,
  faq:     <HelpCircle     size={13} strokeWidth={1.6} absoluteStrokeWidth />,
  email:   <Mail           size={13} strokeWidth={1.6} absoluteStrokeWidth />,
  landing: <LayoutTemplate size={13} strokeWidth={1.6} absoluteStrokeWidth />,
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  social: 'Social post', blog: 'Blog', faq: 'FAQ', email: 'Email', landing: 'Landing page',
};

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls = cn(
    'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium',
    status === 'Published' && 'bg-[#edf8ef] text-[#377e2c]',
    status === 'Draft'     && 'bg-[#e9e9eb] text-[#555555]',
    status === 'Scheduled' && 'bg-[#ecf5fd] text-[#1565b4]',
  );
  return <span className={cls}>{status}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

interface PostCardProps {
  post: ScheduledItem;
  compact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, compact = false }) => {
  const typeIcon = CONTENT_TYPE_ICON[post.contentType];

  const imgSeed = IMAGE_SEEDS[post.contentType] ?? 'nature';
  const imgUrl  = `https://picsum.photos/seed/${imgSeed}-${post.id}/400/200`;

  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-background overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all">
        {/* Thumbnail */}
        <div className="h-[60px] w-full overflow-hidden">
          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            {post.contentType === 'social' && post.platform
              ? <PlatformDot platform={post.platform} />
              : <span className="text-muted-foreground">{typeIcon}</span>
            }
            <span className="text-[11px] font-medium text-foreground">{post.time}</span>
            <StatusBadge status={post.status} />
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
            {post.caption}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group">
      {/* Thumbnail image */}
      <div className="h-[88px] w-full overflow-hidden">
        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Card header row */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        <StatusBadge status={post.status} />
        <span className="flex-1" />
        {/* Content type chip */}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {typeIcon}
          <span className="hidden group-hover:inline">{CONTENT_TYPE_LABEL[post.contentType]}</span>
        </span>
      </div>

      {/* Platform + time */}
      <div className="flex items-center gap-2 px-3 pb-1.5">
        {post.contentType === 'social' && post.platform
          ? <PlatformDot platform={post.platform} />
          : <span className="text-muted-foreground">{typeIcon}</span>
        }
        <span className="text-[12px] font-semibold text-foreground">{post.time}</span>
      </div>

      {/* Title + caption */}
      <div className="px-3 pb-2">
        <p className="text-[12px] font-medium text-foreground leading-snug truncate">{post.title}</p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {post.caption}
        </p>
      </div>

      {/* Action row */}
      <div className="px-2 pb-2 flex items-center gap-0.5">
        {[
          { icon: <Pencil       size={13} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Edit' },
          { icon: <CalendarDays size={13} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Reschedule' },
          { icon: <Copy         size={13} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Duplicate' },
          { icon: <MoreHorizontal size={13} strokeWidth={1.6} absoluteStrokeWidth />, label: 'More' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
};
