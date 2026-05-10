import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { FilterPaneTriggerButton } from '@/app/components/FilterPane';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';
import { cn } from '@/app/components/ui/utils';
import type { CalendarViewType } from './CalendarView';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
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
  filterOpen,
  onFilterOpenChange,
}) => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

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
    <div className="flex h-20 shrink-0 items-center justify-between bg-background px-6">
      {/* Left: chevrons + date label + today */}
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous period"
        >
          <ChevronLeft className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
        </Button>

        <p className="whitespace-nowrap text-[18px] font-normal tracking-tight text-foreground">
          {formatLabel()}
        </p>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNext}
          aria-label="Next period"
        >
          <ChevronRight className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onToday}
          className="px-2 text-primary hover:text-primary"
        >
          Today
        </Button>
      </div>

      {/* Right: view toggle pill + more + filter */}
      <div className="flex items-center gap-2">
        {searchOpen || searchQuery ? (
          <div className="relative h-[var(--button-height)] w-[240px]">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 size-[14px] -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.6}
              absoluteStrokeWidth
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onBlur={() => {
                if (searchQuery === '') setSearchOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearchQuery('');
                  setSearchOpen(false);
                }
              }}
              autoFocus
              placeholder="Search calendar"
              className="h-full w-full rounded-md border border-input bg-background py-0 pl-8 pr-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              aria-label="Search calendar"
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open calendar search"
            title="Search calendar"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </Button>
        )}

        <ToggleGroup
          type="single"
          value={viewType}
          onValueChange={(value) => value && onViewChange(value as CalendarViewType)}
          variant="outline"
          aria-label="Calendar view"
          className="shadow-none"
        >
          {(['list', 'week', 'month'] as CalendarViewType[]).map(v => (
            <ToggleGroupItem
              key={v}
              value={v}
              aria-label={`${VIEW_LABELS[v]} view`}
              className={cn(
                'h-[var(--button-height)] px-4 text-[13px] font-normal',
                viewType === v && 'bg-muted text-foreground',
              )}
            >
              {VIEW_LABELS[v]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="More options"
        >
          <MoreVertical className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
        </Button>

        <FilterPaneTriggerButton
          open={filterOpen}
          onOpenChange={onFilterOpenChange}
        />
      </div>
    </div>
  );
};
