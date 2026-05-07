import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarViewType } from './CalendarView';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewType,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}) => {
  const formatLabel = () => {
    if (viewType === 'month') {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewType === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return 'All content';
  };

  const VIEW_LABELS: Record<CalendarViewType, string> = {
    list: 'List',
    week: 'Week',
    month: 'Month',
  };

  return (
    <div className="h-[64px] flex items-center justify-between px-6 border-b border-border bg-background shrink-0 sticky top-0 z-10">
      {/* Left: chevrons + date label + today */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
        </button>

        <p className="text-[18px] font-normal text-foreground tracking-tight whitespace-nowrap">
          {formatLabel()}
        </p>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight size={16} strokeWidth={1.6} absoluteStrokeWidth />
        </button>

        <button
          type="button"
          onClick={onToday}
          className="text-[14px] font-normal text-primary hover:bg-muted px-2 rounded-md transition-colors"
        >
          Today
        </button>
      </div>

      {/* Right: view toggle pill + more + filter */}
      <div className="flex items-center gap-2">
        {/* List / Week / Month pill */}
        <div className="flex items-center gap-1 h-9 px-2 py-1.5 rounded border border-border">
          {(['list', 'week', 'month'] as CalendarViewType[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={cn(
                'h-6 px-2 rounded text-[14px] font-normal transition-colors',
                viewType === v
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {/* More button */}
        <button
          type="button"
          className="flex items-center justify-center size-9 rounded border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <MoreVertical size={18} strokeWidth={1.6} absoluteStrokeWidth />
        </button>

        {/* Filter button */}
        <button
          type="button"
          className="flex items-center justify-center size-9 rounded border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal size={18} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>
    </div>
  );
};
