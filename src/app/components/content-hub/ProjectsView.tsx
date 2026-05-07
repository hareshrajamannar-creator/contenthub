import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Filter, LayoutGrid, List, MoreHorizontal, Search,
  FileText, Share2, Mail, MessageSquare, Monitor, Megaphone, MessageCircle,
} from 'lucide-react';
import { AppDataTable } from '@/app/components/ui/AppDataTable';
import { AppDataTableColumnSettingsTrigger } from '@/app/components/ui/AppDataTableColumnSettingsTrigger';
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

const TYPE_THUMB: Record<ContentType, { bg: string; iconBg: string; iconColor: string; Icon: React.ElementType }> = {
  faq:      { bg: 'from-blue-50 to-blue-100',     iconBg: 'bg-blue-100',     iconColor: 'text-blue-600',     Icon: MessageSquare },
  social:   { bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-100',   iconColor: 'text-purple-600',   Icon: Share2        },
  email:    { bg: 'from-indigo-50 to-indigo-100', iconBg: 'bg-indigo-100',   iconColor: 'text-indigo-600',   Icon: Mail          },
  blog:     { bg: 'from-slate-50 to-slate-100',   iconBg: 'bg-slate-200',    iconColor: 'text-slate-600',    Icon: FileText      },
  response: { bg: 'from-green-50 to-green-100',   iconBg: 'bg-green-100',    iconColor: 'text-green-600',    Icon: MessageCircle },
  ads:      { bg: 'from-amber-50 to-amber-100',   iconBg: 'bg-amber-100',    iconColor: 'text-amber-600',    Icon: Megaphone     },
};

// ── Template card (matches "Suggested for you" style) ─────────────────────────

function TemplateCard({ tmpl, onUse }: { tmpl: TemplateItem; onUse: (t: TemplateItem) => void }) {
  const thumb = TYPE_THUMB[tmpl.type];
  const { Icon } = thumb;

  return (
    <div
      onClick={() => onUse(tmpl)}
      className="border border-border rounded-[10px] bg-background hover:border-primary/30 transition-all cursor-pointer group flex flex-col overflow-hidden"
    >
      {/* Thumbnail preview area */}
      <div className={cn('relative h-[160px] bg-gradient-to-br border-b border-border overflow-hidden flex flex-col items-center justify-center gap-3 p-6', thumb.bg)}>
        {/* Icon */}
        <div className={cn('size-12 rounded-xl flex items-center justify-center shrink-0', thumb.iconBg)}>
          <Icon size={22} strokeWidth={1.6} absoluteStrokeWidth className={thumb.iconColor} />
        </div>
        {/* Preview shimmer lines */}
        <div className="w-full flex flex-col gap-1.5">
          {[90, 65, 80].map((w, i) => (
            <div key={i} className="h-[6px] rounded-full bg-white/60" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={e => { e.stopPropagation(); onUse(tmpl); }}
            className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Use template
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col gap-1.5">
        <span className={cn('self-start text-[10px] font-medium px-1.5 py-0.5 rounded', TYPE_BADGE[tmpl.type])}>
          {TYPE_LABEL[tmpl.type]}
        </span>
        <p className="text-[12px] text-foreground font-medium leading-snug line-clamp-2">{tmpl.name}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{tmpl.description}</p>
        {tmpl.useCases.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {tmpl.useCases.slice(0, 2).map(uc => (
              <span key={uc} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{uc}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────

const col = createColumnHelper<ProjectRow>();

// ── View ──────────────────────────────────────────────────────────────────────

export const ProjectsView = ({ onNavigate }: { onNavigate: (view: 'content-hub-create') => void }) => {
  const [activeTab, setActiveTab] = useState<TabId>('saved');
  const [libTab, setLibTab] = useState<LibTabId>('all');
  const [libQuery, setLibQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const tableData = useMemo(() => PROJECTS, []);

  const filteredTemplates = useMemo(() => {
    const q = libQuery.toLowerCase();
    return TEMPLATES.filter(t => {
      const matchesTab = libTab === 'all' || t.type === libTab;
      const matchesQ = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchesTab && matchesQ;
    });
  }, [libTab, libQuery]);

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">

      {/* Header band */}
      <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Projects</h1>
        <div className="flex items-center gap-1">
          {activeTab === 'saved' && (
            <>
              <Button type="button" variant="outline" size="icon" aria-label="Search projects">
                <Search className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="More options">
                <MoreHorizontal className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
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
                  <LayoutGrid className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view"
                  className="h-[var(--button-height)] min-w-[var(--button-height)] px-0 border-border">
                  <List className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </ToggleGroupItem>
              </ToggleGroup>
              <AppDataTableColumnSettingsTrigger
                sheetTitle="Project columns"
                onClick={() => setColumnSheetOpen(true)}
              />
              <Button type="button" variant="outline" size="icon" aria-label="Filter projects">
                <Filter className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
            </>
          )}

          {activeTab === 'library' && (
            <div className="relative">
              <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                value={libQuery}
                onChange={e => setLibQuery(e.target.value)}
                placeholder="Search templates..."
                className="border border-input rounded-md h-[var(--button-height)] pl-8 pr-3 text-[13px] bg-background w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
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
  );
};
