/**
 * BlockShell
 *
 * Wraps every block with:
 * - Selection ring when focused
 * - Drag handle (grip icon, left edge)
 * - Hover toolbar (right side: move up / move down / duplicate / delete)
 * - Click-outside to deselect
 */

import React, { useRef } from 'react';
import {
  GripVertical, ChevronUp, ChevronDown, Copy, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockShellProps {
  blockId: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
  /** For drag-and-drop */
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragOver?: boolean;
}

export function BlockShell({
  blockId,
  focused,
  onFocus,
  onBlur,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  isFirst,
  isLast,
  children,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
}: BlockShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={shellRef}
      data-block-id={blockId}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onFocus}
      className={cn(
        'group/shell relative rounded-xl transition-all',
        focused
          ? 'ring-2 ring-primary/30 bg-background'
          : 'hover:ring-1 hover:ring-border bg-background',
        isDragOver && 'ring-2 ring-primary',
      )}
    >
      {/* Drag handle — left edge, visible on hover / focus */}
      <div
        className={cn(
          'absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-opacity',
          focused || 'opacity-0 group-hover/shell:opacity-100',
        )}
      >
        <GripVertical size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground/50" />
      </div>

      {/* Hover/focus toolbar — top-right */}
      <div className={cn(
        'absolute -right-2 -top-3 flex items-center gap-0.5 bg-background border border-border rounded-lg px-1 py-0.5 shadow-sm transition-opacity z-10',
        focused ? 'opacity-100' : 'opacity-0 group-hover/shell:opacity-100',
      )}>
        <button
          type="button"
          title="Move up"
          disabled={isFirst}
          onClick={e => { e.stopPropagation(); onMoveUp(); }}
          className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          title="Move down"
          disabled={isLast}
          onClick={e => { e.stopPropagation(); onMoveDown(); }}
          className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <div className="w-px h-3 bg-border mx-0.5" />
        <button
          type="button"
          title="Duplicate"
          onClick={e => { e.stopPropagation(); onDuplicate(); }}
          className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Copy size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          title="Delete block"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={12} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      {/* Block content */}
      <div className="px-5 py-4" onBlur={onBlur}>
        {children}
      </div>
    </div>
  );
}
