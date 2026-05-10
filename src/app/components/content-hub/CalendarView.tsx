import React, { useState } from 'react';
import {
  FilterPane,
} from '@/app/components/FilterPane';
import type { FilterItem } from '@/app/components/FilterPanel.v1';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { ListView } from './ListView';

export type CalendarViewType = 'month' | 'week' | 'list';

const CALENDAR_FILTERS: FilterItem[] = [
  { id: 'contentType', label: 'Content type', options: ['All', 'FAQ', 'Social', 'Email', 'Blog', 'Review response', 'Ads'] },
  { id: 'status', label: 'Status', options: ['All statuses', 'Draft', 'Scheduled', 'Published', 'Awaiting approval'] },
  { id: 'channel', label: 'Channel', options: ['All channels', 'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'Web', 'Blog', 'Email'] },
  { id: 'creator', label: 'Creator', options: ['All creators', 'Elijah M', 'Jacob K', 'Ava T', 'Emily S', 'BirdAI'] },
  { id: 'dateRange', label: 'Date range', options: ['Current view', 'Next 7 days', 'Next 30 days', 'This quarter'] },
];

export const CalendarView = () => {
  const [viewType, setViewType] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterItem[]>(CALENDAR_FILTERS);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewType === 'week') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewType === 'week') newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          currentDate={currentDate}
          viewType={viewType}
          onViewChange={setViewType}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={() => setCurrentDate(new Date())}
          filterOpen={filterPanelOpen}
          onFilterOpenChange={setFilterPanelOpen}
        />
        <div className="flex-1 overflow-auto">
          {viewType === 'month' && <MonthView currentDate={currentDate} />}
          {viewType === 'week' && <WeekView currentDate={currentDate} />}
          {viewType === 'list' && <ListView currentDate={currentDate} />}
        </div>
      </div>

      <FilterPane
        initialFilters={filters}
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        onFiltersChange={setFilters}
        motion="static"
        dock="right"
        storageKey="content_hub_calendar_filters"
      />
    </div>
  );
};
