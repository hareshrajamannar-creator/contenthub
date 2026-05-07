import { useState, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import {
  Clock, CheckCircle2, Check, XCircle,
  Search, MoreHorizontal, MapPin, CircleCheck, CircleX,
  ChevronDown, SlidersHorizontal,
} from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'
import { APP_MAIN_CONTENT_SHELL_CLASS } from '@/app/components/layout/appShellClasses'
import { Button } from '@/app/components/ui/button'
import { AppDataTable } from '@/app/components/ui/AppDataTable'
import { AppDataTableColumnSettingsTrigger } from '@/app/components/ui/AppDataTableColumnSettingsTrigger'
import { useRecStore } from './useRecStore'
import { RecDetailView } from './RecDetailView'
import { RecFilterPanel } from './RecFilterPanel'
import type { RecStatus, Recommendation, RecCategory } from './recTypes'
import type { BusinessMetrics } from './recTypes'

// ── Status tile config ────────────────────────────────────────────────────────

const TILE_CONFIG: {
  tab: RecStatus
  label: string
  Icon: React.ElementType
}[] = [
  { tab: 'pending',   label: 'Pending',   Icon: Clock        },
  { tab: 'accepted',  label: 'Accepted',  Icon: CheckCircle2 },
  { tab: 'completed', label: 'Completed', Icon: Check        },
  { tab: 'rejected',  label: 'Rejected',  Icon: XCircle      },
]

// ── Effort sort order ─────────────────────────────────────────────────────────

const EFFORT_ORDER: Record<Recommendation['effort'], number> = {
  'Quick win':   0,
  'Medium':      1,
  'Bigger lift': 2,
}

// ── Category → metric map ─────────────────────────────────────────────────────

const CATEGORY_METRIC: Partial<Record<RecCategory, { label: string; key: keyof BusinessMetrics }>> = {
  'Content':             { label: 'Citation share',   key: 'citationShare' },
  'Website content':     { label: 'Citation share',   key: 'citationShare' },
  'FAQ':                 { label: 'Citation share',   key: 'citationShare' },
  'Social':              { label: 'Citation share',   key: 'citationShare' },
  'Local SEO':           { label: 'Visibility score', key: 'visibility' },
  'Technical SEO':       { label: 'Visibility score', key: 'visibility' },
  'Website improvement': { label: 'Visibility score', key: 'visibility' },
  'Conversion':          { label: 'Visibility score', key: 'visibility' },
  'Trust & Reputation':  { label: 'Sentiment score',  key: 'sentiment' },
  'Reviews':             { label: 'Sentiment score',  key: 'sentiment' },
}

// ── Performance bar (single track, blue + salmon) ─────────────────────────────

function PerformanceBar({ rec, metrics }: { rec: Recommendation; metrics: BusinessMetrics }) {
  const meta    = CATEGORY_METRIC[rec.category]
  const current = rec.youScore !== undefined ? rec.youScore : (meta ? (metrics[meta.key] as number) : 0)
  const compPct = rec.compScore !== undefined
    ? rec.compScore
    : (() => {
        const compTotal    = rec.competitors.reduce((s, c) => s + c.totalCitations, 0)
        const avgCitations = rec.competitors.length > 0 ? compTotal / rec.competitors.length : 0
        const maxCitations = rec.competitors[0]?.totalCitations ?? 1
        return Math.min((avgCitations / maxCitations) * (current * 1.1), 100)
      })()
  const label = meta?.label ?? 'Score'
  const yourW  = Math.min(current, 100)
  const compW  = Math.min(compPct, 100)

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="relative h-3 bg-[#eaeaea] dark:bg-muted rounded-[4px] mt-2 overflow-hidden flex">
        <div className="h-full bg-primary" style={{ width: `${yourW}%` }} />
        {compW > yourW && (
          <div className="h-full bg-[#ff9e80]" style={{ width: `${compW - yourW}%` }} />
        )}
      </div>
      <div className="flex flex-col mt-0.5">
        <span className="text-[12px] text-foreground leading-[20px] whitespace-nowrap font-normal">
          Your {label} : {current === 0 ? '0%' : `${current.toFixed(1)}%`}
        </span>
        <span className="text-[12px] text-muted-foreground leading-[18px] whitespace-nowrap font-normal">
          Industry average : {compPct.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RecommendationsViewProps {
  onNavigateToContentHub?: (recId: string, recTitle: string, recAeoScore: number, preloadedQuestions?: { question: string; answer: string }[]) => void
  onNavigateToBlogCanvas?: (recId: string, recTitle: string) => void
  initialRecId?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const recColumnHelper = createColumnHelper<Recommendation>()

export function RecommendationsView({ onNavigateToContentHub, onNavigateToBlogCanvas, initialRecId }: RecommendationsViewProps) {
  const store = useRecStore()
  const {
    recommendations, metrics, activeTab, setActiveTab,
    showFilterPanel, toggleFilterPanel,
    filterTypes, filterEffort,
    setFilterTypes, setFilterEffort, clearFilters,
    rejectRec, acceptRec, completeRec,
  } = store

  const [selectedRecId,      setSelectedRecId]      = useState<string | null>(initialRecId ?? null)
  const [searchQuery,        setSearchQuery]        = useState('')
  const [showSearch,         setShowSearch]         = useState(false)
  const [columnSheetOpen,    setColumnSheetOpen]    = useState(false)

  // Location popover
  const [showLocPopover,  setShowLocPopover]  = useState(false)
  const [locPopoverPos,   setLocPopoverPos]   = useState({ top: 0, left: 0 })
  const [popoverLocs,     setPopoverLocs]     = useState<string[]>([])
  const chevronRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Status counts
  const counts: Record<RecStatus, number> = {
    pending:     recommendations.filter(r => r.status === 'pending').length,
    accepted:    recommendations.filter(r => r.status === 'accepted').length,
    in_progress: recommendations.filter(r => r.status === 'in_progress').length,
    completed:   recommendations.filter(r => r.status === 'completed').length,
    rejected:    recommendations.filter(r => r.status === 'rejected').length,
  }

  // Filtered list
  const filtered = recommendations.filter(r => {
    if (activeTab !== 'all' && r.status !== activeTab) return false
    if (filterTypes.length > 0 && !filterTypes.includes(r.category)) return false
    if (filterEffort.length > 0 && !filterEffort.includes(r.effort)) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleChevronEnter(rec: Recommendation) {
    const el = chevronRefs.current[rec.id]
    if (el) {
      const rect = el.getBoundingClientRect()
      setLocPopoverPos({ top: rect.bottom + 6, left: rect.left - 80 })
    }
    const locs = rec.locationNames ?? [`Location 1`]
    setPopoverLocs(locs)
    setShowLocPopover(true)
  }

  // Column definitions
  const columns = useMemo(() => [
    recColumnHelper.accessor('title', {
      id: 'recommendation',
      header: 'Recommendations',
      meta: { settingsLabel: 'Recommendations' },
      size: 280,
      sortingFn: 'alphanumeric',
      cell: ({ row }) => (
        <p className="text-[14px] text-foreground leading-[22px] font-normal group-hover/table-row:text-primary transition-colors pr-4 whitespace-normal">
          {row.original.title}
        </p>
      ),
    }),
    recColumnHelper.accessor('category', {
      id: 'type',
      header: 'Type',
      meta: { settingsLabel: 'Type' },
      size: 140,
      sortingFn: 'alphanumeric',
      cell: ({ row }) => {
        const label = row.original.category === 'FAQ' ? 'Content' : row.original.category;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-border bg-background text-[12px] text-muted-foreground leading-[18px] font-normal whitespace-nowrap">
            {label}
          </span>
        );
      },
    }),
    recColumnHelper.accessor(row => EFFORT_ORDER[row.effort], {
      id: 'impact',
      header: 'Impact',
      meta: { settingsLabel: 'Impact' },
      size: 360,
      sortingFn: 'basic',
      cell: ({ row }) => (
        <p className="text-[14px] text-foreground leading-[22px] font-normal line-clamp-3 whitespace-normal pr-4">
          {row.original.description}
        </p>
      ),
    }),
    recColumnHelper.accessor(row => {
      const meta = CATEGORY_METRIC[row.category]
      return row.youScore !== undefined ? row.youScore : (meta ? (metrics[meta.key] as number) : 0)
    }, {
      id: 'currentPerformance',
      header: 'Current performance',
      meta: { settingsLabel: 'Current performance' },
      size: 220,
      sortingFn: 'basic',
      cell: ({ row }) => (
        <div className="pr-4">
          <PerformanceBar rec={row.original} metrics={metrics} />
        </div>
      ),
    }),
    recColumnHelper.accessor(row => row.locations ?? 1, {
      id: 'locations',
      header: 'Locations',
      meta: { settingsLabel: 'Locations' },
      size: 140,
      enableResizing: false,
      sortingFn: 'basic',
      cell: ({ row }) => {
        const rec = row.original
        const locationCount = rec.locations ?? 1
        return (
          <div
            className="flex items-center gap-1.5 h-[32px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-6 flex-shrink-0">
              <span className="text-[14px] text-foreground leading-[22px]">
                {locationCount}
              </span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover/table-row:opacity-100 transition-opacity duration-150 pointer-events-none group-hover/table-row:pointer-events-auto">
              <button
                ref={el => { chevronRefs.current[rec.id] = el }}
                className="flex items-center justify-center w-8 h-8 hover:bg-muted rounded transition-colors"
                onClick={e => { e.stopPropagation(); handleChevronEnter(rec) }}
                onMouseEnter={() => handleChevronEnter(rec)}
                onMouseLeave={() => setTimeout(() => setShowLocPopover(false), 200)}
              >
                <ChevronDown size={14} strokeWidth={2} className="text-foreground" />
              </button>
              <button
                title="Reject"
                className="flex items-center justify-center w-8 h-8 hover:bg-muted rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                onClick={e => { e.stopPropagation(); rejectRec(rec.id) }}
              >
                <CircleX size={18} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
              <button
                title="Accept"
                className="flex items-center justify-center w-8 h-8 hover:bg-muted rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                onClick={e => { e.stopPropagation(); acceptRec(rec.id, 'self') }}
              >
                <CircleCheck size={18} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </div>
          </div>
        )
      },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [metrics, rejectRec, acceptRec])

  // Selected rec
  const selectedRec = selectedRecId ? recommendations.find(r => r.id === selectedRecId) ?? null : null

  if (selectedRec) {
    return (
      <div className={cn(APP_MAIN_CONTENT_SHELL_CLASS)}>
        <RecDetailView
          rec={selectedRec}
          metrics={metrics}
          onBack={() => setSelectedRecId(null)}
          onAccept={(id) => {
            acceptRec(id, 'self')
            setSelectedRecId(null)
          }}
          onReject={(id) => {
            rejectRec(id)
            setSelectedRecId(null)
          }}
          onNavigateToContentHub={
            onNavigateToContentHub
              ? (questions) => {
                  acceptRec(selectedRec.id, 'self')
                  const aeoScore = selectedRec.aeoScore?.you ?? 92
                  onNavigateToContentHub(selectedRec.id, selectedRec.title, aeoScore, questions)
                }
              : undefined
          }
          onNavigateToBlogCanvas={
            onNavigateToBlogCanvas
              ? () => {
                  acceptRec(selectedRec.id, 'self')
                  onNavigateToBlogCanvas(selectedRec.id, selectedRec.title)
                }
              : undefined
          }
          onCompleteRec={(id) => completeRec(id)}
        />
      </div>
    )
  }

  return (
    <div className={cn(APP_MAIN_CONTENT_SHELL_CLASS, 'flex flex-col')}>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-16 flex items-center px-6 gap-2 bg-background">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-[18px] font-normal text-foreground tracking-[-0.36px] leading-[26px] whitespace-nowrap">
            Recommendations
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {showSearch && (
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded px-2.5 py-1.5 mr-1">
              <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search recommendations…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false) }}
                className="w-[200px] bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none leading-[20px]"
              />
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Search recommendations"
            onClick={() => setShowSearch(s => !s)}
            className={cn((showSearch || searchQuery) && 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15 hover:text-primary')}
          >
            <Search className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </Button>

          <AppDataTableColumnSettingsTrigger
            sheetTitle="Recommendation columns"
            onClick={() => setColumnSheetOpen(true)}
          />

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Filter recommendations"
              onClick={toggleFilterPanel}
              className={cn(showFilterPanel && 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15 hover:text-primary')}
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>
            {(filterTypes.length > 0 || filterEffort.length > 0) && (
              <span className="pointer-events-none absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] leading-none px-1 py-0.5 rounded-full min-w-[14px] text-center">
                {filterTypes.length + filterEffort.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Status tiles ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6">
        <div className="flex">
          {TILE_CONFIG.map(tile => {
            const isSelected = activeTab === tile.tab
            const n = counts[tile.tab]
            return (
              <button
                key={tile.tab}
                onClick={() => setActiveTab(tile.tab)}
                className={cn(
                  'flex-1 flex flex-col items-start px-4 py-4 text-left transition-colors rounded-t',
                  isSelected ? 'bg-primary/10 border-b-2 border-primary' : 'border-b-2 border-transparent',
                )}
              >
                <span className={cn(
                  'text-[28px] leading-[40px] font-normal tracking-tight block',
                  isSelected ? 'text-primary' : 'text-foreground',
                )}>
                  {n}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <tile.Icon size={14} strokeWidth={1.6} absoluteStrokeWidth className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-[13px] text-foreground leading-[20px] font-normal">{tile.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table + optional filter panel ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <p className="text-[14px]">No recommendations match the current filters.</p>
            </div>
          ) : (
            <div className="mt-5">
              <AppDataTable<Recommendation>
                tableId="recommendations.list.v1"
                data={filtered}
                columns={columns}
                initialSorting={[{ id: 'impact', desc: false }]}
                getRowId={r => r.id}
                onRowClick={rec => setSelectedRecId(rec.id)}
                columnSheetTitle="Recommendation columns"
                hideColumnsButton
                columnSheetOpen={columnSheetOpen}
                onColumnSheetOpenChange={setColumnSheetOpen}
                scrollableBody={false}
                rowDensity="default"
              />
            </div>
          )}
        </div>

        {showFilterPanel && (
          <RecFilterPanel
            filterTypes={filterTypes}
            filterEffort={filterEffort}
            onFilterTypesChange={setFilterTypes}
            onFilterEffortChange={setFilterEffort}
            onClearAll={clearFilters}
            onClose={toggleFilterPanel}
          />
        )}
      </div>

      {/* Location popover portal */}
      {showLocPopover && createPortal(
        <div
          className="fixed z-[9999] bg-background rounded-lg shadow-lg border border-border w-56 py-2"
          style={{ top: locPopoverPos.top, left: locPopoverPos.left }}
          onMouseEnter={() => setShowLocPopover(true)}
          onMouseLeave={() => setShowLocPopover(false)}
        >
          <p className="px-3 pt-1 pb-2 text-[11px] text-muted-foreground font-medium tracking-[0.4px] uppercase">
            Locations covered
          </p>
          <ul className="max-h-52 overflow-y-auto">
            {popoverLocs.map(loc => (
              <li key={loc} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50">
                <MapPin size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-shrink-0" />
                <span className="text-[13px] text-foreground leading-[18px]">{loc}</span>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  )
}
