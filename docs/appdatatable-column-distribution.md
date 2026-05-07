# AppDataTable — responsive column width logic (report)

One **shared algorithm** for all `AppDataTable` instances: widths are **proportional weights**, not equal splits. **Wider first column** (primary / name / lead) matches SaaS directory patterns and avoids a flat 50/50 look for two columns.

---

## 1. Goals

- **Nice distribution** for **2–5 visible leaf columns** (typical app tables); extendable for **6+** with a defined fallback.
- **Resolution-aware:** as the **table container** grows or shrinks, **default** column widths rescale (implementation uses **`ResizeObserver`** on the table wrapper — not raw `100vw`, so sidebars and padding stay honest).
- **Respects TanStack `minSize` / `maxSize`** from each `ColumnDef` when clamping.
- **Persistence policy (recommended):** persisted **`columnSizing`** in sessionStorage is **user intent**. Options:
  - **Strict:** never auto-resize after first paint if any saved sizes exist.
  - **Hybrid (recommended for UX):** auto-distribute on mount and on resize **only while `columnSizing` is empty**; after the user drags a resize handle, persist and **freeze** until **Reset** in the Columns sheet (clears sizing state).
- Document the chosen policy in the PR when implemented.

---

## 2. Single algorithm — “weighted budget with clamps”

**Inputs**

- `n` — number of **visible** leaf columns (after visibility), in **visual order** (`columnOrder`).
- `W` — **available inner width** of the table scroll container (from `ResizeObserver`, minus vertical scrollbar if present). Minimum sensible floor, e.g. `W >= 320`.
- `min[i]`, `max[i]`, optional **`weight[i]`** per column from `meta` (see §4); if omitted, use **role-based defaults** from §3.

**Steps**

1. **Normalize weights** so `sum(weight) = 1`.
2. **Ideal widths:** `ideal[i] = W * weight[i]`.
3. **Clamp:** `clamped[i] = clamp(ideal[i], min[i], max[i])`.
4. **Fix sum:** let `S = sum(clamped)`. If `S !== W`, distribute delta **on the primary column only** (index `0`), re-clamped to its min/max, until no change or iterate once: if still off, distribute remainder across columns with largest `max - width` headroom in order. (For product tables, **single pass to primary** is usually enough.)
5. **TanStack:** set `columnSizing[columnId] = round(clamped[i])` (px integers).

**Why not 50/50 for `n = 2`?**  
Weights **`62% / 38%`** give the first column room for **composite cells** (name + subtitle, codes + badges) and the second for shorter metadata, without looking arbitrarily “centered.”

---

## 3. Default weight presets (no per-column `meta`)

Use **column index** `i = 0 .. n-1` in **display order**. Weights are **fixed ratios** (not breakpoints — breakpoints only change **`W`**).

| `n` | Weight vector (sum = 1) | Rationale |
|-----|-------------------------|-----------|
| **2** | **`0.62`, `0.38`** | Primary + secondary; clearly not 50/50. |
| **3** | **`0.45`, `0.275`, `0.275`** | Strong lead; two peers share the rest. |
| **4** | **`0.34`, `0.22`, `0.22`, `0.22`** | Lead + three balanced. |
| **5** | **`0.28`, `0.18`, `0.18`, `0.18`, `0.18`** | Lead + four balanced. |
| **6+** | **`0.22`**, then **`(1 - 0.22) / (n - 1)`** for each other | First column still dominant; tail equal. |

**Default `minSize` / `maxSize`** (if not set per column): keep current table defaults (`minSize: 72`, `maxSize: 640`) or tighten **`minSize`** to **80** on first column only for `n >= 4` if QA wants less truncation (optional).

---

## 4. Optional overrides (`ColumnDef.meta`)

Allow tables to opt in without forking the math:

```ts
meta?: {
  settingsLabel?: string;
  /** 0–1, relative to siblings; normalized across visible columns */
  sizeWeight?: number;
}
```

- If **any** visible column sets `sizeWeight`, **normalize** those values to weights for those columns; any column **without** `sizeWeight` receives an **equal share of the remainder** after subtracting explicit weights (document this in code comments).
- If **none** set, use §3 index-based presets.

---

## 5. Example numbers (same algorithm, different `W`)

Weights for **`n = 2`:** `0.62 / 0.38`.

| Content width `W` | Col 0 (px) | Col 1 (px) |
|-------------------|------------|------------|
| 480 | 298 | 182 |
| 720 | 446 | 274 |
| 960 | 595 | 365 |
| 1120 | 694 | 426 |
| 1440 | 893 | 547 |

Weights for **`n = 4`:** `0.34, 0.22, 0.22, 0.22` at `W = 1120` → **381, 246, 246, 247** (after rounding / remainder fix).

---

## 6. Breakpoints vs container width

**Do not** hard-code `50vw` or assume a fixed sidebar. **Use `ResizeObserver`** on the **`overflow-x-auto`** wrapper (or the `AppDataTable` root above `<Table>`) so:

- **Narrow main column** → smaller `W` → same ratios, smaller px (then **horizontal scroll** once `sum(min)` exceeds `W`).
- **Wide desktop** → larger `W` → same ratios, roomier columns up to **`maxSize`**.

Optional **UX guard:** if `W < 640`, bump **`minSize`** floor slightly (e.g. +8px) for readability **or** leave mins and rely on scroll — pick one in implementation and test with Referrals / Surveys.

---

## 7. Implementation checklist (for Agent / PR)

| Step | Action |
|------|--------|
| 1 | Add `appDataTableColumnSizing.ts` (or similar) exporting **`getDefaultWeights(n)`**, **`distributeWidths({ W, columns, visibleOrder })`**. |
| 2 | In `AppDataTable`, `useRef` + **`ResizeObserver`** on the scroll container; debounce **~100ms** optional. |
| 3 | On `W` or visible column set change, compute sizes; call **`setColumnSizing`** per persistence policy (§1). |
| 4 | Ensure **column resize drag** still updates persisted state; **Reset** clears sizing and triggers one redistribution. |
| 5 | Storybook: stories with **2 / 4 / 5** columns and a **resizable canvas** or viewport toolbar to visually verify. |

---

## 8. Relation to other `AppDataTable` work

- **Typography / sort / resize handle / overlap** — orthogonal; this doc only governs **default px widths** vs viewport.
- **`table-layout: fixed`** + `style={{ width: table.getTotalSize() }}` — total width should match **`max(W, sum(sizes))`** or **`W`** depending on product choice: either **table fills container** (`width: 100%` with column %), or **table min width = sum(columns)** (scroll). Current code uses **sum of column sizes**; aligning **`getTotalSize()`** with **`max(W, sum)`** avoids a tiny table floating when columns are narrow — note for implementer.

---

*This report is the source of truth for ratios; link from the main polish plan and PR description.*
