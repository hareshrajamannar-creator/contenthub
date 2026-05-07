# AppDataTable visual rollout — change report

This document lists every path touched or intended for the **flat table surface**, **header/body typography**, **resize handle**, **responsive weighted columns** (see [`appdatatable-column-distribution.md`](./appdatatable-column-distribution.md)), **`toolbarTitle` + icon-only Columns**, and **wrapper stripping** work. Check boxes as you merge.

## 1. Core component

| File | Status | Notes |
|------|--------|--------|
| [`src/app/components/ui/AppDataTable.tsx`](../src/app/components/ui/AppDataTable.tsx) | ☐ | `toolbarTitle?`, two-row toolbar, icon-only Columns when untitled; **12px** headers / **13px** body; sort: **`ArrowUpDown`**, **`font-semibold`** + **`-translate-y-*`** on icon when sorted; `table-fixed mx-auto`; `min-h-[52px]` on head; short resize hit box; overlap fix (`overflow-hidden`, `whitespace-normal` on cells) |
| [`src/app/components/ui/appDataTableColumnSizing.ts`](../src/app/components/ui/appDataTableColumnSizing.ts) (or adjacent name) | ☐ | **`getDefaultWeights(n)`**, **`distributeWidths(...)`** per [`appdatatable-column-distribution.md`](./appdatatable-column-distribution.md) |
| [`src/app/components/ui/ColumnSettingsSheet.tsx`](../src/app/components/ui/ColumnSettingsSheet.tsx) | ☐ | Optional: spacing only if sheet header needs alignment with new toolbar |
| [`docs/appdatatable-column-distribution.md`](./appdatatable-column-distribution.md) | ☐ | Spec / report (ratios, algorithm, persistence, checklist) — **update if implementation diverges** |

## 2. Storybook

| File | Status | Notes |
|------|--------|--------|
| [`src/stories/AppDataTable.stories.tsx`](../src/stories/AppDataTable.stories.tsx) | ☐ | Stories: **with** `toolbarTitle` (labeled Columns) vs **without** (icon-only); demo cells use 13px + muted, not `text-sm`/`text-xs` |

## 3. Product — strip `bg-card` / card chrome around tables

| File | Status | Notes |
|------|--------|--------|
| [`src/app/components/SurveysView.v1.tsx`](../src/app/components/SurveysView.v1.tsx) | ☐ | Outer `rounded-xl border bg-card` around table + footer → flat `bg-background` / `border-0` |
| [`src/app/components/ReferralsView.v1.tsx`](../src/app/components/ReferralsView.v1.tsx) | ☐ | Table-only `overflow-hidden rounded-xl border bg-card` → remove card; keep **StatCard** metrics as-is |
| [`src/app/components/ListingsView.v1.tsx`](../src/app/components/ListingsView.v1.tsx) | ☐ | Main tabs shell `bg-card border rounded-xl` → flat; tab bar `border-b` retained |
| [`src/app/components/listings/ListingsAllSitesPanel.tsx`](../src/app/components/listings/ListingsAllSitesPanel.tsx) | ☐ | Root `rounded-xl border bg-card` → flat scroll area |
| [`src/app/components/listings/GoogleSuggestionsPanel.tsx`](../src/app/components/listings/GoogleSuggestionsPanel.tsx) | ☐ | Inner wrapper around **`AppDataTable` only** → flat; **keep** upper stat `bg-card` tiles |
| [`src/app/components/searchai/SearchAIRecommendationsPanel.tsx`](../src/app/components/searchai/SearchAIRecommendationsPanel.tsx) | ☐ | Same as Google suggestions |
| [`src/app/components/PaymentsView.v1.tsx`](../src/app/components/PaymentsView.v1.tsx) | ☐ | Ledger `bg-card border rounded-xl` around table → flat; keep summary **PaymentsSummaryCard** / metrics |
| [`src/app/components/CampaignsView.v1.tsx`](../src/app/components/CampaignsView.v1.tsx) | ☐ | Tabs content `h-full bg-card border rounded-xl` (both tabs) → `bg-background`, optional `border-0` |
| [`src/app/components/CompetitorsView.v1.tsx`](../src/app/components/CompetitorsView.v1.tsx) | ☐ | **`SectionCard`**: add `variant="flat"` (`bg-transparent border-0`); use **`variant="flat"`** on **Recent competitor reviews** only |
| [`src/app/components/AppointmentsView.v1.tsx`](../src/app/components/AppointmentsView.v1.tsx) | ☐ | Shared main shell: **`bg-card border rounded-xl`** when `viewMode === "calendar"`; **flat** when `viewMode === "schedule"` |

## 4. Already flat (audit only)

| File | Notes |
|------|--------|
| [`src/app/components/ContactsView.v1.tsx`](../src/app/components/ContactsView.v1.tsx) | `AppDataTable` in `overflow-auto` without table-only card |
| Lists & segments surfaces | Per product audit — add `toolbarTitle` only if a section title is required |

## 5. Optional `toolbarTitle` call sites

Pass **`toolbarTitle`** only where an in-canvas section title should sit on the same band as Columns (most views rely on **`MainCanvasViewHeader`** and leave **`toolbarTitle`** unset for **icon-only** Columns).

---

**PR section title suggestion:** “AppDataTable rollout” — paste §3 table + link to this file.

## 6. Implementation notes (`AppDataTable`)

- **Resize handle:** Outer hit target `~w-3`, `top-1/2 -translate-y-1/2`, `h-10`; inner visible line `h-[13px] w-px rounded-full`. Use **`hover:` on the outer** with a child selector (e.g. `hover:[&>span]:bg-primary`) or toggle classes from `header.column.getIsResizing()` — avoid `group-hover` unless `group` is set on `TableHead`.
- **Sheet title vs aria-label:** Reuse one string (e.g. `columnsLabel = columnSheetTitle ?? "Columns"`) for sheet `title`, icon button `aria-label` / `title`, and labeled Columns button text.
- **Resize / narrow columns (no overlap):** `TableCell` from `table.v1` includes **`whitespace-nowrap`**. Under **`table-fixed`** + small `width`, content overflows **`visible`** and draws over the next column. On `AppDataTable`’s **`TableCell`** / **`TableHead`**, add **`overflow-hidden min-w-0`** and **`whitespace-normal`** on body cells (see plan **§4b**). Acceptance: drag column to min width — no cross-column overlap.
