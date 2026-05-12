import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { RecCategory } from './recTypes'

const ALL_CATEGORIES: RecCategory[] = [
  'Local SEO',
  'Content',
  'Conversion',
  'Website content',
  'Website improvement',
  'Reviews',
  'Social',
  'FAQ',
  'Trust & Reputation',
  'Technical SEO',
]

const CATEGORY_DISPLAY_LABEL: Partial<Record<RecCategory, string>> = {
  Content: 'Blog',
  FAQ: 'FAQs',
}

const EFFORT_OPTIONS = ['Quick win', 'Medium', 'Bigger lift']

interface RecFilterPanelProps {
  filterTypes: RecCategory[]
  filterEffort: string[]
  onFilterTypesChange: (types: RecCategory[]) => void
  onFilterEffortChange: (effort: string[]) => void
  onClearAll: () => void
  onClose: () => void
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors',
        'hover:bg-muted/50',
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
          checked ? 'bg-primary border-primary' : 'border-border bg-background',
        )}
        onClick={onChange}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-foreground leading-[20px]">{label}</span>
    </label>
  )
}

export function RecFilterPanel({
  filterTypes,
  filterEffort,
  onFilterTypesChange,
  onFilterEffortChange,
  onClearAll,
  onClose,
}: RecFilterPanelProps) {
  const hasActiveFilters = filterTypes.length > 0 || filterEffort.length > 0

  function toggleType(cat: RecCategory) {
    if (filterTypes.includes(cat)) {
      onFilterTypesChange(filterTypes.filter(t => t !== cat))
    } else {
      onFilterTypesChange([...filterTypes, cat])
    }
  }

  function toggleEffort(effort: string) {
    if (filterEffort.includes(effort)) {
      onFilterEffortChange(filterEffort.filter(e => e !== effort))
    } else {
      onFilterEffortChange([...filterEffort, effort])
    }
  }

  return (
    <aside className="w-[280px] border-l border-border bg-background flex flex-col flex-shrink-0 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        <span className="text-[15px] text-foreground font-semibold leading-[24px]">Filter by</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-[13px] text-primary hover:underline"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            <X size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Category section */}
      <div className="px-4 py-4 flex flex-col gap-1">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.4px] mb-1">Category</p>
        {ALL_CATEGORIES.map(cat => (
          <CheckboxRow
            key={cat}
            label={CATEGORY_DISPLAY_LABEL[cat] ?? cat}
            checked={filterTypes.includes(cat)}
            onChange={() => toggleType(cat)}
          />
        ))}
      </div>

      <div className="h-px bg-border mx-4" />

      {/* Effort section */}
      <div className="px-4 py-4 flex flex-col gap-1">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-[0.4px] mb-1">Effort</p>
        {EFFORT_OPTIONS.map(effort => (
          <CheckboxRow
            key={effort}
            label={effort}
            checked={filterEffort.includes(effort)}
            onChange={() => toggleEffort(effort)}
          />
        ))}
      </div>
    </aside>
  )
}
