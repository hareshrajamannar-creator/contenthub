/**
 * EditorContentCard
 *
 * Unified card shell used for every content piece in the canvas.
 *
 * Header (always the same chrome):
 *   [icon] [editable name]  [status badge]  [score pill ●]  [✓ approval]  [@ assign]  [⋮]
 *
 * Body:
 *   Type-specific inline preview renderer (blog excerpt, social preview,
 *   FAQ accordion, email, landing, video). Driven by `itemType`.
 *
 * Footer:
 *   Canva-style "Add another [type]" button — appears below the card.
 */

import React, { useState } from 'react';
import {
  FileText, Share2, Mail, MessageSquare, Monitor, Video,
  CheckCircle2, MoreHorizontal, ChevronRight,
  Eye, Pencil, Copy, Trash2,
  UserCircle2, ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { cn } from '@/app/components/ui/utils';
import { type ContentItemType, ITEM_TYPE_LABEL } from './editorConfig';
import { scoreColor, scoreStrokeColor } from '../shared/scoreColors';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardStatus = 'Draft' | 'Ready' | 'Needs work' | 'Approved';

export interface ContentCardData {
  id: string;
  itemType: ContentItemType;
  name: string;
  status: CardStatus;
  score: number;
  approved: boolean;
  assignee?: string;
}

interface EditorContentCardProps {
  card: ContentCardData;
  /** Called when user clicks the score pill — parent opens/closes right panel */
  onScoreClick: (cardId: string) => void;
  /** Whether THIS card's score panel is currently open */
  scoreActive: boolean;
  /** Called when user clicks Edit in the ⋮ menu — drills down to item editor */
  onEdit: (cardId: string) => void;
  /** Called when user clicks "Add another [type]" footer button */
  onAddAnother: (itemType: ContentItemType) => void;
  /** Show the "Add another" footer (last card in a type group, or always) */
  showAddAnother?: boolean;
}

// ── Icon map ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<ContentItemType, React.ElementType> = {
  blog:    FileText,
  social:  Share2,
  email:   Mail,
  faq:     MessageSquare,
  landing: Monitor,
  video:   Video,
};

// ── Inline content preview renderers ─────────────────────────────────────────

function BlogPreview() {
  return (
    <div className="px-6 py-4 space-y-3">
      <h2 className="text-[18px] font-semibold text-foreground leading-snug">
        How Local Businesses Are Winning With AI-Powered Review Responses
      </h2>
      <p className="text-[12px] text-muted-foreground">~167 words · ~1 min read</p>
      <p className="text-[13px] text-foreground leading-relaxed">
        Online reviews shape purchasing decisions more than ever. According to a 2024 BrightLocal survey,
        93% of consumers read reviews before visiting a local business, and 89% say they're more likely to
        choose a business that responds to all reviews.
      </p>
      <h3 className="text-[15px] font-semibold text-foreground">The AI Advantage</h3>
      <p className="text-[13px] text-foreground leading-relaxed">
        AI-powered response tools help local businesses respond faster and more consistently — without
        sacrificing personalization. Rather than copy-paste replies, modern AI can personalize each
        response based on the reviewer's specific feedback, match your brand voice, and escalate negative
        reviews to the right team member automatically.
      </p>
    </div>
  );
}

function SocialPreview() {
  return (
    <div className="px-6 py-4 flex justify-center">
      <div className="w-[280px] rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
        {/* Mock image area */}
        <div className="h-[160px] bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center">
          <span className="text-3xl">🌿</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-medium text-primary">OG</span>
            </div>
            <span className="text-[12px] font-medium text-foreground">Olive Garden</span>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed">
            🌱 Spring is here and so is our outdoor seating! Join us for fresh flavors under the open sky.
            Reserve your table today. 🍃
          </p>
          <p className="text-[11px] text-primary">#SpringDining #OutdoorSeating #LocalEats</p>
        </div>
      </div>
    </div>
  );
}

function EmailPreview() {
  return (
    <div className="px-6 py-4 flex justify-center">
      <div className="w-full max-w-[480px] rounded-lg border border-border overflow-hidden bg-background shadow-sm">
        <div className="bg-primary/5 px-4 py-3 border-b border-border">
          <p className="text-[11px] text-muted-foreground">Subject</p>
          <p className="text-[13px] font-medium text-foreground">Your table is waiting this spring 🌸</p>
        </div>
        <div className="px-4 py-4 space-y-3">
          <p className="text-[13px] text-foreground">Hi [First Name],</p>
          <p className="text-[13px] text-foreground leading-relaxed">
            Spring has arrived and we've got something special waiting for you. Come enjoy our seasonal
            menu in our newly expanded outdoor dining area.
          </p>
          <div className="flex justify-center pt-1">
            <span className="bg-primary text-primary-foreground text-[12px] font-medium px-4 py-2 rounded-lg">
              Reserve your table
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQPreview() {
  const questions = [
    'Are reservations required?',
    'Do you offer vegan options?',
    'Is there outdoor seating?',
    'What are your hours of operation?',
  ];
  return (
    <div className="flex flex-col border-t border-border/40">
      {questions.map((q, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-4 py-2 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
        >
          <span className="text-[10px] font-mono text-muted-foreground/60 w-6 flex-shrink-0 select-none">Q{i + 1}</span>
          <span className="text-[12px] text-foreground flex-1 truncate">{q}</span>
          <ChevronRight size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/40 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function LandingPreview() {
  return (
    <div className="px-6 py-6 text-center space-y-4 bg-gradient-to-b from-primary/5 to-transparent rounded-b-xl">
      <h2 className="text-[20px] font-semibold text-foreground leading-tight">
        Fresh ingredients. Local sourcing. Great service.
      </h2>
      <p className="text-[13px] text-muted-foreground max-w-[360px] mx-auto leading-relaxed">
        Experience the Olive Garden difference — made fresh daily at all 500 locations nationwide.
      </p>
      <div className="flex justify-center">
        <span className="bg-primary text-primary-foreground text-[13px] font-medium px-6 py-2.5 rounded-lg">
          Book your table now
        </span>
      </div>
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="px-6 py-4 flex justify-center">
      <div className="w-full max-w-[400px] rounded-xl overflow-hidden border border-border bg-zinc-900 shadow-sm">
        <div className="h-[180px] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-800/60 to-emerald-900/60" />
          <div className="relative z-10 size-12 rounded-full bg-white/20 flex items-center justify-center">
            <Video size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-white ml-0.5" />
          </div>
        </div>
        <div className="px-3 py-2.5 bg-zinc-800">
          <p className="text-[12px] font-medium text-white">Behind the scenes — Olive Garden kitchen</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">2:34 · YouTube</p>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<ContentItemType, React.FC> = {
  blog:    BlogPreview,
  social:  SocialPreview,
  email:   EmailPreview,
  faq:     FAQPreview,
  landing: LandingPreview,
  video:   VideoPreview,
};

// ── Score bar — horizontal progress + score number, matches FAQGroupCard ─────

function ScoreBar({ score, active, onClick }: { score: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Content score: ${score}. Click to ${active ? 'close' : 'open'} score panel.`}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors flex-none',
        active ? 'bg-muted' : 'hover:bg-muted/60',
      )}
    >
      <div className="w-12 h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: scoreStrokeColor(score) }}
        />
      </div>
      <span
        className="text-[12px] font-semibold leading-none tabular-nums"
        style={{ color: scoreColor(score).text }}
      >
        {score}
      </span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const TEAM_MEMBERS = ['Haresh R.', 'Priya K.', 'Arjun M.', 'Balaji K.'];
const APPROVAL_STATUSES = ['Approved', 'Needs review', 'Pending', 'Rejected'] as const;
type ApprovalStatus = typeof APPROVAL_STATUSES[number];

export function EditorContentCard({
  card,
  onScoreClick,
  scoreActive,
  onEdit,
  onAddAnother,
  showAddAnother = true,
}: EditorContentCardProps) {
  const [assignee, setAssignee] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const Icon = TYPE_ICON[card.itemType];
  const Preview = PREVIEW_MAP[card.itemType];

  return (
    <div className="flex flex-col gap-2">
      {/* Card */}
      <div className={cn(
        'rounded-xl border bg-background transition-shadow hover:shadow-sm',
        scoreActive ? 'border-primary/30 shadow-sm' : 'border-border',
      )}>

        {/* Card header — matches FAQ/blog canvas style */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border">

          {/* LEFT: icon + name + score */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="size-6 rounded-md bg-primary/[0.07] flex items-center justify-center flex-none">
              <Icon size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/70" />
            </div>
            <span className="text-[13px] font-medium text-foreground truncate">{card.name}</span>
            <ScoreBar score={card.score} active={scoreActive} onClick={() => onScoreClick(card.id)} />
          </div>

          {/* RIGHT: assign + approval + edit + kebab */}
          <div className="flex items-center gap-1 flex-none">

            {/* Assign dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 h-7 px-2 rounded-md text-[12px] transition-colors',
                    assignee
                      ? 'text-primary bg-primary/[0.07] hover:bg-primary/[0.11]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <UserCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                  <span className="max-w-[64px] truncate">{assignee ?? 'Assign'}</span>
                  <ChevronDown size={10} strokeWidth={1.6} absoluteStrokeWidth className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {TEAM_MEMBERS.map(name => (
                  <DropdownMenuItem key={name} onSelect={() => setAssignee(name)}>
                    <UserCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2 text-muted-foreground flex-none" />
                    {name}
                    {assignee === name && (
                      <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="ml-auto text-primary flex-none" />
                    )}
                  </DropdownMenuItem>
                ))}
                {assignee && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setAssignee(null)} className="text-muted-foreground">
                      Unassign
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Approval dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 h-7 px-2 rounded-md text-[12px] transition-colors',
                    approvalStatus === 'Approved'
                      ? 'text-[#1D9E75] bg-[#1D9E75]/[0.07] hover:bg-[#1D9E75]/[0.12]'
                      : approvalStatus === 'Needs review' || approvalStatus === 'Pending'
                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                      : approvalStatus === 'Rejected'
                      ? 'text-destructive bg-destructive/[0.07] hover:bg-destructive/[0.12]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                  <span>{approvalStatus ?? 'Approve'}</span>
                  <ChevronDown size={10} strokeWidth={1.6} absoluteStrokeWidth className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {APPROVAL_STATUSES.map(status => (
                  <DropdownMenuItem key={status} onSelect={() => setApprovalStatus(status)}>
                    {status}
                    {approvalStatus === status && (
                      <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="ml-auto text-primary flex-none" />
                    )}
                  </DropdownMenuItem>
                ))}
                {approvalStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setApprovalStatus(null)} className="text-muted-foreground">
                      Clear
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-border mx-0.5" />

            {/* Edit — navigates to item editor */}
            <button
              type="button"
              title="Edit in canvas"
              onClick={() => onEdit(card.id)}
              className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Pencil size={14} strokeWidth={1.6} absoluteStrokeWidth />
            </button>

            {/* Kebab */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <MoreHorizontal size={14} strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem className="gap-2">
                  <Eye size={13} strokeWidth={1.6} absoluteStrokeWidth />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Copy size={13} strokeWidth={1.6} absoluteStrokeWidth />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2">
                  <Trash2 size={13} strokeWidth={1.6} absoluteStrokeWidth />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card body — content preview (view mode) */}
        <Preview />
      </div>

      {/* Canva-style "Add another" footer */}
      {showAddAnother && (
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => onAddAnother(card.itemType)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="size-5 rounded-full border border-dashed border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
              <span className="text-[14px] leading-none">+</span>
            </span>
            Add another {ITEM_TYPE_LABEL[card.itemType].toLowerCase()}
          </button>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}
    </div>
  );
}
