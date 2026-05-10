import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  LayoutGrid, List, MoreVertical, Search,
  FileText, Share2, Mail, MessageSquare, Monitor, Megaphone, MessageCircle,
} from 'lucide-react';
import { AppDataTable } from '@/app/components/ui/AppDataTable';
import { AppDataTableColumnSettingsTrigger } from '@/app/components/ui/AppDataTableColumnSettingsTrigger';
import {
  FilterPane,
  FilterPaneTriggerButton,
} from '@/app/components/FilterPane';
import type { FilterItem } from '@/app/components/FilterPanel.v1';
import { Button } from '@/app/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';
import { TextTabsRow, type TextTabItem } from '@/app/components/ui/text-tabs';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
} from '@/app/components/layout/mainViewTitleClasses';
import {
  type ProjectRow,
  type ProjectStatus,
  ProjectThumbnail,
  StatusCell,
  ChannelCell,
  RowActions,
} from './projectShared';
import { TEMPLATES, type ContentType, type TemplateItem } from './TemplateGallery';

// ── Mock data ─────────────────────────────────────────────────────────────────

const PROJECTS: ProjectRow[] = [
  { id: 1,  name: 'Spring garden cleanup',             status: 'Draft',     channels: ['facebook','instagram','twitter','linkedin','youtube','web'],  locations: 500, updated: 'Nov 05, 2025', createdBy: 'Elijah M',  hue: 160 },
  { id: 2,  name: 'Sustainable lawn care launch 🌱',   status: 'Running',   channels: ['web','blog','email'],                                          locations: 500, updated: 'Nov 04, 2025', createdBy: 'Jacob K',   hue: 210 },
  { id: 3,  name: 'Before & after showcase',           status: 'Running',   channels: ['facebook','instagram','twitter','linkedin','youtube','email'], locations: 500, updated: 'Nov 03, 2025', createdBy: 'Ava T',     hue: 280 },
  { id: 4,  name: 'Summer backyard bliss ☀️',          status: 'Running',   channels: ['web','blog','email'],                                          locations: 500, updated: 'Nov 01, 2025', createdBy: 'Emily S',   hue: 40  },
  { id: 5,  name: 'Customer testimonial campaign',     status: 'Paused',    channels: ['facebook','instagram','twitter','linkedin','youtube','web'],   locations: 500, updated: 'Sep 05, 2025', createdBy: 'William S', hue: 20  },
  { id: 6,  name: 'Fall planting season',              status: 'Completed', channels: ['web','blog','email'],                                          locations: 500, updated: 'Sep 05, 2025', createdBy: 'James K',   hue: 90  },
  { id: 7,  name: 'Holiday outdoor lighting',          status: 'Completed', channels: ['facebook','instagram','twitter','linkedin','youtube','email'], locations: 500, updated: 'Sep 05, 2025', createdBy: 'Emma W',    hue: 320 },
  { id: 8,  name: 'Local business partnership',        status: 'Completed', channels: ['web','blog','email'],                                          locations: 500, updated: 'Sep 05, 2025', createdBy: 'Mia S',     hue: 190 },
  { id: 9,  name: 'Sustainable landscaping education', status: 'Completed', channels: ['facebook','instagram','web','blog'],                           locations: 500, updated: 'Sep 05, 2025', createdBy: 'Mia S',     hue: 130 },
  { id: 10, name: 'Re-engagement offer',               status: 'Completed', channels: ['web','blog','email'],                                          locations: 500, updated: 'Sep 05, 2025', createdBy: 'Mia S',     hue: 260 },
];

const TEMPLATE_CREATORS = ['BirdAI', 'Content team', 'Marketing team', 'SEO team'] as const;

function getTemplateCreator(templateId: string) {
  const seed = templateId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TEMPLATE_CREATORS[seed % TEMPLATE_CREATORS.length];
}

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = 'saved' | 'library';

const TABS: TextTabItem<TabId>[] = [
  { id: 'saved',   label: 'Saved',   suffix: <Badge variant="secondary" className="font-normal">50</Badge> },
  { id: 'library', label: 'Library', suffix: <Badge variant="secondary" className="font-normal">40</Badge> },
];

// ── Library filter tabs ───────────────────────────────────────────────────────

type LibTabId = 'all' | ContentType;

const LIB_TABS: TextTabItem<LibTabId>[] = [
  { id: 'all',      label: 'All' },
  { id: 'faq',      label: 'FAQ' },
  { id: 'social',   label: 'Social' },
  { id: 'email',    label: 'Email' },
  { id: 'blog',     label: 'Blog' },
  { id: 'response', label: 'Review response' },
  { id: 'ads',      label: 'Ads' },
];

// ── Template type colours + icons ─────────────────────────────────────────────

const TYPE_LABEL: Record<ContentType, string> = {
  faq: 'FAQ', social: 'Social', email: 'Email',
  blog: 'Blog', response: 'Review response', ads: 'Ads',
};

const TYPE_BADGE: Record<ContentType, string> = {
  faq:      'bg-blue-50 text-blue-700',
  social:   'bg-purple-50 text-purple-700',
  email:    'bg-primary/10 text-primary',
  blog:     'bg-muted text-muted-foreground',
  response: 'bg-green-50 text-green-700',
  ads:      'bg-amber-50 text-amber-700',
};

const TYPE_THUMB: Record<ContentType, { iconBg: string; iconColor: string; Icon: React.ElementType }> = {
  faq:      { iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   Icon: MessageSquare },
  social:   { iconBg: 'bg-purple-100', iconColor: 'text-purple-600', Icon: Share2        },
  email:    { iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', Icon: Mail          },
  blog:     { iconBg: 'bg-slate-200',  iconColor: 'text-slate-600',  Icon: FileText      },
  response: { iconBg: 'bg-green-100',  iconColor: 'text-green-600',  Icon: MessageCircle },
  ads:      { iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  Icon: Megaphone     },
};

const CONTENT_TYPE_OPTIONS = ['All content types', ...Object.values(TYPE_LABEL)];
const PROJECT_CHANNEL_OPTIONS = ['All channels', 'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'Web', 'Blog', 'Email'];
const PROJECT_CREATOR_OPTIONS = ['All creators', ...Array.from(new Set(PROJECTS.map(project => project.createdBy)))];
const PROJECT_STATUS_OPTIONS = ['All statuses', 'Draft', 'Running', 'Paused', 'Completed'];
const TEMPLATE_TAG_OPTIONS = ['All tags', ...Array.from(new Set(TEMPLATES.flatMap(template => template.useCases))).sort()];
const TEMPLATE_CREATOR_OPTIONS = ['All creators', ...TEMPLATE_CREATORS];

const SAVED_FILTERS: FilterItem[] = [
  { id: 'status', label: 'Status', options: PROJECT_STATUS_OPTIONS },
  { id: 'channel', label: 'Channel', options: PROJECT_CHANNEL_OPTIONS },
  { id: 'creator', label: 'Creator', options: PROJECT_CREATOR_OPTIONS },
  { id: 'updated', label: 'Last updated', options: ['Any time', 'Last 7 days', 'Last 30 days', 'Last 90 days'] },
  { id: 'locations', label: 'Locations', options: ['Any locations', '1-100', '101-500', '500+'] },
];

const LIBRARY_FILTERS: FilterItem[] = [
  { id: 'contentType', label: 'Content type', options: CONTENT_TYPE_OPTIONS },
  { id: 'tag', label: 'Tags', options: TEMPLATE_TAG_OPTIONS },
  { id: 'creator', label: 'Creator', options: TEMPLATE_CREATOR_OPTIONS },
  { id: 'goal', label: 'Goal', options: ['Any goal', 'Search visibility', 'Customer education', 'Promotion', 'Retention', 'Reputation'] },
  { id: 'format', label: 'Format', options: ['Any format', 'Template', 'Suggestion', 'Campaign asset'] },
];

// ── Template card (matches "Suggested for you" style) ─────────────────────────

function TemplateCard({ tmpl, onUse }: { tmpl: TemplateItem; onUse: (t: TemplateItem) => void }) {
  const thumb = TYPE_THUMB[tmpl.type];
  const { Icon } = thumb;
  const isBlog = tmpl.type === 'blog';
  const isSocial = tmpl.type === 'social';

  return (
    <div
      onClick={() => onUse(tmpl)}
      className="border border-border rounded-[10px] bg-background hover:border-primary/30 transition-all cursor-pointer group flex flex-col overflow-hidden"
    >
      {/* Thumbnail preview area */}
      <div className="relative h-[160px] overflow-hidden border-b border-border bg-zinc-100">
        <div className="absolute inset-0 p-6">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-2 py-1">
              <div className={cn('flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border', thumb.iconBg)}>
                <Icon size={9} strokeWidth={1.6} absoluteStrokeWidth className={thumb.iconColor} />
              </div>
              <span className="flex-1 text-[6px] font-semibold text-zinc-700">{TYPE_LABEL[tmpl.type]}</span>
              <div className="flex items-center gap-1">
                <div className="h-[3px] w-8 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full w-4/5 rounded-full bg-emerald-600" />
                </div>
                <span className="rounded-[2px] bg-emerald-50 px-1 text-[5px] font-bold text-emerald-700">92</span>
              </div>
            </div>
            {isBlog && (
              <div className="relative h-[46px] shrink-0 overflow-hidden border-b border-zinc-100">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-100" />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-emerald-600" />
                <div className="absolute bottom-4 left-3 h-6 w-5 rounded-t-full bg-emerald-700" />
                <div className="absolute bottom-4 right-4 h-5 w-4 rounded-t-full bg-emerald-700/70" />
                <div className="absolute right-7 top-2 size-2 rounded-full bg-amber-300" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1 overflow-hidden px-2 py-2">
              <div className="flex gap-1">
                <span className={cn('rounded-[2px] px-1 py-0.5 text-[5px] font-semibold', TYPE_BADGE[tmpl.type])}>
                  {TYPE_LABEL[tmpl.type]}
                </span>
                {isSocial && <span className="rounded-[2px] bg-purple-50 px-1 py-0.5 text-[5px] font-semibold text-purple-700">Post</span>}
              </div>
              <span className="text-[6px] font-bold leading-tight text-zinc-800">{tmpl.name}</span>
              <div className="mt-0.5 flex items-center gap-1">
                <div className="size-2 rounded-full bg-zinc-300" />
                <div className="h-[2px] w-7 rounded-full bg-zinc-200" />
                <div className="h-[2px] w-4 rounded-full bg-zinc-100" />
              </div>
              <div className="mt-0.5 flex flex-col gap-0.5">
                <div className="h-[2px] w-full rounded-full bg-zinc-200" />
                <div className="h-[2px] w-10/12 rounded-full bg-zinc-200" />
                <div className="h-[2px] w-7/12 rounded-full bg-zinc-100" />
              </div>
            </div>
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={e => { e.stopPropagation(); onUse(tmpl); }}
            className="h-7 rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Use template
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        <span className={cn('self-start text-[10px] font-medium px-2 py-0.5 rounded', TYPE_BADGE[tmpl.type])}>
          {TYPE_LABEL[tmpl.type]}
        </span>
        <p className="text-[12px] text-foreground font-medium leading-snug line-clamp-2">{tmpl.name}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{tmpl.description}</p>
        {tmpl.useCases.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {tmpl.useCases.slice(0, 2).map(uc => (
              <span key={uc} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{uc}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────

const col = createColumnHelper<ProjectRow>();

function filterValue(filters: FilterItem[], id: string) {
  return filters.find(filter => filter.id === id)?.value;
}

function isAllFilter(value: string | undefined, allLabel: string) {
  return value === undefined || value === allLabel;
}

// ── View ──────────────────────────────────────────────────────────────────────

export const ProjectsView = ({
  initialTab = 'saved',
  onNavigate,
}: {
  initialTab?: TabId;
  onNavigate: (view: 'content-hub-create') => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [libTab, setLibTab] = useState<LibTabId>('all');
  const [libQuery, setLibQuery] = useState('');
  const [libSearchOpen, setLibSearchOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<FilterItem[]>(SAVED_FILTERS);
  const [libraryFilters, setLibraryFilters] = useState<FilterItem[]>(LIBRARY_FILTERS);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const tableData = useMemo(() => {
    const status = filterValue(savedFilters, 'status');
    const channel = filterValue(savedFilters, 'channel');
    const creator = filterValue(savedFilters, 'creator');
    const locations = filterValue(savedFilters, 'locations');

    return PROJECTS.filter(project => {
      const matchesStatus = isAllFilter(status, 'All statuses') || project.status === status;
      const matchesChannel = isAllFilter(channel, 'All channels') || project.channels.includes(channel!.toLowerCase() as ProjectRow['channels'][number]);
      const matchesCreator = isAllFilter(creator, 'All creators') || project.createdBy === creator;
      const matchesLocations =
        isAllFilter(locations, 'Any locations') ||
        (locations === '1-100' && project.locations <= 100) ||
        (locations === '101-500' && project.locations > 100 && project.locations <= 500) ||
        (locations === '500+' && project.locations > 500);

      return matchesStatus && matchesChannel && matchesCreator && matchesLocations;
    });
  }, [savedFilters]);

  const filteredTemplates = useMemo(() => {
    const q = libQuery.toLowerCase();
    const contentType = filterValue(libraryFilters, 'contentType');
    const tag = filterValue(libraryFilters, 'tag');
    const creator = filterValue(libraryFilters, 'creator');
    const goal = filterValue(libraryFilters, 'goal');

    return TEMPLATES.filter(t => {
      const matchesTab = libTab === 'all' || t.type === libTab;
      const matchesQ = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchesType = isAllFilter(contentType, 'All content types') || TYPE_LABEL[t.type] === contentType;
      const matchesTag = isAllFilter(tag, 'All tags') || t.useCases.includes(tag!);
      const matchesCreator = isAllFilter(creator, 'All creators') || getTemplateCreator(t.id) === creator;
      const matchesGoal =
        isAllFilter(goal, 'Any goal') ||
        t.useCases.some(useCase => useCase.toLowerCase().includes(goal!.split(' ')[0].toLowerCase())) ||
        t.description.toLowerCase().includes(goal!.split(' ')[0].toLowerCase());

      return matchesTab && matchesQ && matchesType && matchesTag && matchesCreator && matchesGoal;
    });
  }, [libTab, libQuery, libraryFilters]);

  const columns = useMemo(() => [
    col.accessor('name', {
      id: 'name',
      header: 'Name',
      size: 300,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <ProjectThumbnail hue={row.original.hue} />
          <span className="truncate text-[13px] font-normal text-foreground group-hover/table-row:text-primary transition-colors">
            {row.original.name}
          </span>
        </div>
      ),
    }),
    col.accessor('status', {
      id: 'status',
      header: 'Status',
      size: 120,
      enableSorting: true,
      cell: ({ getValue }) => <StatusCell status={getValue() as ProjectStatus} />,
    }),
    col.accessor('channels', {
      id: 'channels',
      header: 'Channels',
      size: 180,
      enableSorting: false,
      cell: ({ getValue }) => <ChannelCell channels={getValue()} />,
    }),
    col.accessor('locations', {
      id: 'locations',
      header: 'Locations',
      size: 120,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-[13px] font-normal text-foreground">{getValue()}</span>
      ),
    }),
    col.accessor('updated', {
      id: 'updated',
      header: 'Last updated',
      size: 150,
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-[13px] font-normal text-foreground">{getValue()}</span>
      ),
    }),
    col.accessor('createdBy', {
      id: 'createdBy',
      header: 'Created by',
      size: 160,
      enableSorting: true,
      cell: ({ row, getValue }) => (
        <div className="flex items-center justify-between w-full min-w-0">
          <span className="text-[13px] font-normal text-foreground truncate">{getValue()}</span>
          <RowActions
            onPreview={() => onNavigate('content-hub-create')}
            onEdit={() => onNavigate('content-hub-create')}
            onDuplicate={() => {}}
            onAddToLibrary={() => {}}
            onDelete={() => {}}
          />
        </div>
      ),
    }),
  ], [onNavigate]);

  const activeFilters = activeTab === 'library' ? libraryFilters : savedFilters;
  const handleActiveFiltersChange = activeTab === 'library' ? setLibraryFilters : setSavedFilters;
  const filterStorageKey = activeTab === 'library'
    ? 'content_hub_library_filters'
    : 'content_hub_projects_filters';

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col">

      {/* Header band */}
      <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Projects</h1>
        <div className="flex items-center gap-2">
          {activeTab === 'saved' && (
            <>
              <Button type="button" variant="outline" size="icon" aria-label="Search projects">
                <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as 'list' | 'grid')}
                variant="outline"
                aria-label="View mode"
                className="shadow-none"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view"
                  className="h-[var(--button-height)] min-w-[var(--button-height)] px-0 border-border">
                  <LayoutGrid className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view"
                  className="h-[var(--button-height)] min-w-[var(--button-height)] px-0 border-border">
                  <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button type="button" variant="outline" size="icon" aria-label="More options">
                <MoreVertical className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <AppDataTableColumnSettingsTrigger
                sheetTitle="Project columns"
                onClick={() => setColumnSheetOpen(true)}
              />
              <FilterPaneTriggerButton
                open={filterPanelOpen}
                onOpenChange={setFilterPanelOpen}
              />
            </>
          )}

          {activeTab === 'library' && (
            <>
              {libSearchOpen || libQuery ? (
                <div className="relative h-[var(--button-height)] w-[240px]">
                  <Search
                    size={14}
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={libQuery}
                    onChange={e => setLibQuery(e.target.value)}
                    onBlur={() => {
                      if (!libQuery) setLibSearchOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setLibQuery('');
                        setLibSearchOpen(false);
                      }
                    }}
                    autoFocus
                    placeholder="Search templates"
                    className="h-full w-full rounded-md border border-input bg-background py-0 pl-8 pr-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Search templates"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open template search"
                  title="Search templates"
                  onClick={() => setLibSearchOpen(true)}
                >
                  <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
              )}
              <Button type="button" variant="outline" size="icon" aria-label="More options">
                <MoreVertical className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <FilterPaneTriggerButton
                open={filterPanelOpen}
                onOpenChange={setFilterPanelOpen}
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TextTabsRow<TabId>
        items={TABS}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Projects tabs"
        className="px-6"
      />

      {/* Saved tab — table */}
      {activeTab === 'saved' && (
        <div className="min-h-0 flex-1 overflow-hidden py-4">
          <AppDataTable<ProjectRow>
            tableId="content-hub.projects"
            data={tableData}
            columns={columns}
            scrollableBody
            rowDensity="default"
            stickyLeadingColumnCount={1}
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
            onRowClick={() => onNavigate('content-hub-create')}
          />
        </div>
      )}

      {/* Library tab — template cards */}
      {activeTab === 'library' && (
        <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
          {/* Type filter tabs */}
          <TextTabsRow<LibTabId>
            items={LIB_TABS}
            value={libTab}
            onChange={setLibTab}
            ariaLabel="Template types"
            className="px-6"
          />

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-[13px] text-muted-foreground">
                No templates match your search.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredTemplates.map(tmpl => (
                  <TemplateCard
                    key={tmpl.id}
                    tmpl={tmpl}
                    onUse={() => onNavigate('content-hub-create')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <FilterPane
        key={activeTab}
        initialFilters={activeFilters}
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
        onFiltersChange={handleActiveFiltersChange}
        motion="static"
        dock="right"
        storageKey={filterStorageKey}
      />
    </div>
  );
};
