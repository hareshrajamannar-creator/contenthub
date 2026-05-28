import {
  Activity,
  ChevronDown,
  History,
  MessageCircle,
  Redo2,
  Undo2,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { scoreStrokeColor } from './scoreColors';

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
      </div>
    </div>
  );
}
