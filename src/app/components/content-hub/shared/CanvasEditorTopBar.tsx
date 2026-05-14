import {
  Activity,
  Bookmark,
  History,
  MessageCircle,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { scoreStrokeColor } from './scoreColors';

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
  onZoomOut: () => void;
  onZoomIn: () => void;
  onVersionHistory?: () => void;
  onActivity?: () => void;
  onSave?: () => void;
  onChat?: () => void;
}

function TopBarIconButton({
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
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
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

function ScoreProgressRing({ score }: { score: number }) {
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
  onZoomOut,
  onZoomIn,
  onVersionHistory,
  onActivity,
  onSave,
  onChat,
}: CanvasEditorTopBarProps) {
  return (
    <div className="flex h-[48px] flex-none items-center justify-between gap-4 rounded-lg border border-border/60 bg-background px-4">
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

      <div className="flex items-center gap-1">
        <TopBarIconButton title="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <TopBarIconButton title="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <TopBarIconButton title="Zoom out" onClick={onZoomOut}>
          <ZoomOut size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <span className="min-w-10 text-center text-[13px] text-muted-foreground tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <TopBarIconButton title="Zoom in" onClick={onZoomIn}>
          <ZoomIn size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <TopBarIconButton title="Version history" onClick={onVersionHistory}>
          <History size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <TopBarIconButton title="Activity" onClick={onActivity}>
          <Activity size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <TopBarIconButton title="Save" onClick={onSave}>
          <Bookmark size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
        <TopBarIconButton title="Comments" onClick={onChat}>
          <MessageCircle size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </TopBarIconButton>
      </div>
    </div>
  );
}
