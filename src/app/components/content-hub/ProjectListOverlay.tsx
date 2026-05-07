import React from 'react';
import { X } from 'lucide-react';
import type { Project } from './calendarData';

interface ProjectListOverlayProps {
  projects: Project[];
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectListOverlay: React.FC<ProjectListOverlayProps> = ({
  projects,
  onClose,
  onSelectProject,
}) => {
  const formatDateRange = (start: Date, end: Date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  };

  const isProjectActive = (project: Project) => {
    const now = new Date();
    return project.startDate <= now && project.endDate >= now;
  };

  // Sort projects: active first, then by start date (earliest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aActive = isProjectActive(a);
    const bActive = isProjectActive(b);

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    return a.startDate.getTime() - b.startDate.getTime();
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-background shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            All Projects ({sortedProjects.length})
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-2">
            {sortedProjects.map((project) => {
              const active = isProjectActive(project);

              return (
                <div
                  key={project.id}
                  className="rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
                  style={{
                    backgroundColor: project.color,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Project Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-[20px]"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {project.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[13px] font-semibold text-foreground">
                          {project.name}
                        </h4>
                        {active && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateRange(project.startDate, project.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Color Indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: project.color,
                        border: '2px solid rgba(0, 0, 0, 0.2)',
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Project color</span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (onSelectProject) {
                        onSelectProject(project.id);
                        onClose();
                      }
                    }}
                    className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] hover:opacity-90 transition-opacity"
                  >
                    View project
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
