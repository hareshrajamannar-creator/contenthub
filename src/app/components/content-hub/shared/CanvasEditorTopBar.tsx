import {
  Activity,
  Check,
  ChevronDown,
  History,
  MessageCircle,
  Redo2,
  Undo2,
  UserRound,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { scoreStrokeColor } from './scoreColors';

// ── Team members (mock) ───────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Mitchell',  email: 'sarah.mitchell@birdeye.com',  initials: 'SM', color: 'bg-indigo-500'  },
  { id: '2', name: 'James Wilson',    email: 'james.wilson@birdeye.com',    initials: 'JW', color: 'bg-amber-500'   },
  { id: '3', name: 'David Parker',    email: 'david.parker@birdeye.com',    initials: 'DP', color: 'bg-emerald-500' },
  { id: '4', name: 'Emily Johnson',   email: 'emily.johnson@birdeye.com',   initials: 'EJ', color: 'bg-rose-500'    },
  { id: '5', name: 'Michael Chen',    email: 'michael.chen@birdeye.com',    initials: 'MC', color: 'bg-violet-500'  },
];

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 0.85, 1.0, 1.25, 1.5, 2.0, 3.0];

interface CanvasEditorTopBarProps {
  score: number;
  scoreLabel?: string;
  scorePanelOpen?: boolean;
  onScoreClick?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomOut?: () => void;
  onZoomIn?: () => void;
  onZoomChange?: (zoom: number) => void;
  onVersionHistory?: () => void;
  onActivity?: () => void;
  onChat?: () => void;
  hideScore?: boolean;
}

function TileButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={title}
          disabled={disabled}
          onClick={onClick}
          className="flex w-[30px] h-[30px] items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:text-muted-foreground/25 disabled:pointer-events-none"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

export function ScoreProgressRing({ score }: { score: number }) {
  const size = 20;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clampedScore / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted-foreground/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={scoreStrokeColor(score)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="-rotate-90 origin-center transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

export function CanvasEditorTopBar({
  score,
  scoreLabel = 'Content score',
  scorePanelOpen = false,
  onScoreClick,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onVersionHistory,
  onActivity,
  onChat,
  hideScore = false,
}: CanvasEditorTopBarProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = TEAM_MEMBERS.find(u => u.id === selectedUserId) ?? null;

  function handleSend() {
    if (!selectedUser) return;
    const name = selectedUser.name;
    setAssignOpen(false);
    setSelectedUserId(null);
    toast.success(`Assigned to ${name}`);
  }

  return (
    <div className="flex h-[48px] flex-none items-center gap-4 rounded-lg border border-border/60 bg-background px-4">
      {/* Left: content score (when visible) */}
      {!hideScore && (
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onScoreClick}
            aria-pressed={scorePanelOpen}
            className={cn(
              'flex h-8 items-center gap-2 rounded-md px-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/80',
              scorePanelOpen && 'bg-muted text-foreground',
            )}
          >
            <ScoreProgressRing score={score} />
            <span className="font-medium text-foreground">{score}</span>
            <span>/ 100 {scoreLabel}</span>
          </button>
        </div>
      )}

      {/* Right: action icon tiles */}
      <div className="flex items-center gap-1 ml-auto">
        <TileButton title="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={14} strokeWidth={1.6} absoluteStrokeWidth />
        </TileButton>
        <TileButton title="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 size={14} strokeWidth={1.6} absoluteStrokeWidth />
        </TileButton>

        {/* Zoom dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-[30px] items-center gap-1 rounded-lg border border-border/70 bg-background px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="tabular-nums min-w-[28px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <ChevronDown size={11} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[80px]">
            {ZOOM_PRESETS.map(p => (
              <DropdownMenuItem
                key={p}
                onClick={() => onZoomChange?.(p)}
                className="justify-center text-[13px]"
              >
                {Math.round(p * 100)}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <TileButton title="Version history" onClick={onVersionHistory}>
          <History size={14} strokeWidth={1.6} absoluteStrokeWidth />
        </TileButton>
        <TileButton title="Activity" onClick={onActivity}>
          <Activity size={14} strokeWidth={1.6} absoluteStrokeWidth />
        </TileButton>
        <TileButton title="Comments" onClick={onChat}>
          <MessageCircle size={14} strokeWidth={1.6} absoluteStrokeWidth />
        </TileButton>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* Assign to dropdown */}
        <DropdownMenu open={assignOpen} onOpenChange={setAssignOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-[30px] items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserRound size={13} strokeWidth={1.6} absoluteStrokeWidth />
              <span>{selectedUser ? selectedUser.name : 'Assign to'}</span>
              <ChevronDown size={11} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[272px] p-0 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-[12px] font-medium text-foreground">Assign to</p>
            </div>
            <div className="py-1 max-h-[220px] overflow-y-auto">
              {TEAM_MEMBERS.map(member => (
                <DropdownMenuItem
                  key={member.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                  onSelect={e => {
                    e.preventDefault();
                    setSelectedUserId(member.id === selectedUserId ? null : member.id);
                  }}
                >
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
                    member.color,
                  )}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground leading-none mb-0.5">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                  {selectedUserId === member.id && (
                    <Check size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <button
                type="button"
                disabled={!selectedUser}
                onClick={handleSend}
                className="w-full rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none"
              >
                Send
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
