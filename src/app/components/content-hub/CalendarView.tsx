import React, { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { ListView } from './ListView';

export type CalendarViewType = 'month' | 'week' | 'list';

export const CalendarView = () => {
  const [viewType, setViewType] = useState<CalendarViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

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
    <div className="flex flex-col h-full bg-background">
      <CalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onViewChange={setViewType}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={() => setCurrentDate(new Date())}
      />
      <div className="flex-1 overflow-auto">
        {viewType === 'month' && <MonthView currentDate={currentDate} />}
        {viewType === 'week' && <WeekView currentDate={currentDate} />}
        {viewType === 'list' && <ListView currentDate={currentDate} />}
      </div>
    </div>
  );
};
