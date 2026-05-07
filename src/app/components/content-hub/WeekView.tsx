import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostCard } from './PostCard';
import { mockScheduledItems, mockProjects, PROJECT_COLOR_MAP } from './calendarData';
import type { Project } from './calendarData';

interface WeekViewProps {
  currentDate: Date;
}

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() &&
         a.getMonth() === b.getMonth() &&
         a.getFullYear() === b.getFullYear();
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

type ProjectWithSpan = Project & { startCol: number; spanCols: number };

function getProjectsForWeek(weekDays: Date[]): ProjectWithSpan[] {
  const weekStart = weekDays[0];
  const weekEnd   = weekDays[6];

  return mockProjects
    .filter(p => !(p.endDate < weekStart || p.startDate > weekEnd))
    .map(p => {
      const startCol = Math.max(0, weekDays.findIndex(d => {
        const ds = new Date(d); ds.setHours(0,0,0,0);
        const ps = new Date(p.startDate); ps.setHours(0,0,0,0);
        return ds >= ps;
      }));
      let endCol = 6;
      weekDays.forEach((d, i) => {
        const ds = new Date(d); ds.setHours(0,0,0,0);
        const pe = new Date(p.endDate); pe.setHours(0,0,0,0);
        if (ds <= pe) endCol = i;
      });
      return { ...p, startCol, spanCols: endCol - startCol + 1 };
    });
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const weekDays = getWeekDays(currentDate);
  const allProjects = getProjectsForWeek(weekDays);
  const VISIBLE = 5;
  const displayProjects = showAll ? allProjects : allProjects.slice(0, VISIBLE);
  const remaining = allProjects.length - VISIBLE;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Day header */}
      <div className="grid grid-cols-7 border-b border-border sticky top-0 z-10 bg-background shrink-0">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={cn(
              'h-[45px] flex items-center justify-center border-r border-border last:border-r-0',
              isToday(day) ? 'bg-primary/[0.04]' : '',
            )}
          >
            {isToday(day) ? (
              <span className="flex items-center gap-1 text-[12px]">
                <span className="text-primary">{DAY_NAMES[i]}</span>
                <span className="bg-primary rounded-full size-[19px] inline-flex items-center justify-center text-white text-[11px] font-medium">
                  {day.getDate()}
                </span>
              </span>
            ) : (
              <span className="text-[12px] text-muted-foreground">
                {DAY_NAMES[i]} {day.getDate()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Project strips */}
      {allProjects.length > 0 && (
        <div className="border-b border-border bg-muted/30 shrink-0">
          <div className="py-1.5 px-1 flex flex-col gap-1">
            {displayProjects.map(project => {
              const colors = PROJECT_COLOR_MAP[project.colorKey];
              const selected = selectedProjectId === project.id;
              const dimmed  = !!selectedProjectId && !selected;
              return (
                <div
                  key={project.id}
                  className="grid grid-cols-7 relative"
                  style={{ height: 26 }}
                >
                  {/* Positioning overlay */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProjectId(p => p === project.id ? null : project.id)}
                    className={cn(
                      'absolute top-0 h-full flex items-center gap-1.5 px-2 rounded-md text-[11px] font-medium cursor-pointer transition-all truncate border',
                      colors.bg, colors.text, colors.border,
                      selected && 'ring-1 ring-primary/40 border-primary/50',
                      dimmed && 'opacity-35',
                    )}
                    style={{
                      left: `calc(${(project.startCol / 7) * 100}% + 2px)`,
                      width: `calc(${(project.spanCols / 7) * 100}% - 4px)`,
                    }}
                  >
                    <span className="truncate">{project.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Show more / less */}
          {remaining > 0 || showAll ? (
            <div className="pb-1.5 px-3">
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                {showAll
                  ? <><ChevronUp size={12} strokeWidth={1.6} absoluteStrokeWidth /> Collapse</>
                  : <><ChevronDown size={12} strokeWidth={1.6} absoluteStrokeWidth /> Show {remaining} more projects</>
                }
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Content grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-l border-border min-h-full">
          {weekDays.map((day, i) => {
            const posts = mockScheduledItems
              .filter(p => isSameDay(p.date, day) &&
                (!selectedProjectId || p.projectId === selectedProjectId))
              .sort((a, b) => a.date.getHours() - b.date.getHours());

            return (
              <div
                key={i}
                className={cn(
                  'border-r border-b border-border p-2 flex flex-col gap-2',
                  isToday(day) && 'bg-primary/[0.02]',
                )}
                style={{ minHeight: 360 }}
              >
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
