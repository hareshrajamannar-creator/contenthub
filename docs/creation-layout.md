# Creation layout — full-width builder pattern

## Rule

**Creation and builder views suppress the L2 nav panel and span the full available width** (L2 zone + main content zone). The builder provides its own left panel (tool palette, step nav, or config tree) that acts as the functional equivalent of L2.

## When to apply

Apply the creation layout when a view has **3 or more internal panels** of its own:

| Zone | Role |
|---|---|
| Left panel (tool palette / step nav) | Replaces L2 nav |
| Center panel (canvas / main workspace) | Primary work area |
| Right panel (config / properties / inspector) | Contextual detail |

### Applies to
- `agents-builder` — workflow canvas (ToolboxPanel + Canvas + PropertiesPanel)
- Any future `*-builder` or `create-*` views (report builder, campaign builder, form builder, etc.)

### Does NOT apply to
- Standard product views (monitor, reviews, contacts, inbox, etc.) — these keep L2 + content side by side
- Single-panel onboarding wizards — those embed their own sidebar *inside* the content zone without suppressing L2

## Layout structure

```
┌──────┬──────────────────────────────────────────────────────┐
│  L1  │  ToolboxPanel (280px)  │  Canvas (flex-1)  │  Props  │
│ rail │  ← acts as L2          │                   │ (340px) │
└──────┴──────────────────────────────────────────────────────┘
```

Compare with a standard product view:

```
┌──────┬──────────────┬───────────────────────────────────────┐
│  L1  │  L2 nav      │  Main content (flex-1)                │
│ rail │  (220px)     │                                       │
└──────┴──────────────┴───────────────────────────────────────┘
```

## How to implement

### 1. Keep the view in `hasOwnL2Panel` (App.tsx)

This suppresses the default Reports L2 panel:

```ts
const hasOwnL2Panel = (v: AppView) =>
  // ...
  v === "agents-builder" ||  // ← keep this
  // ...
```

### 2. Exclude the view from any product-specific L2NavPanel conditional

```tsx
// The AgentsL2NavPanel conditional must NOT include agents-builder:
{!aiPanelOpen && !mynaWorkspaceExpanded && (
  currentView === "agents-monitor" ||
  currentView === "agents-analyze-performance" ||
  // agents-builder intentionally omitted — uses creation layout
) && <AgentsL2NavPanel ... />}
```

### 3. Size the view's own left panel at 280px

The freed L2 space (220px) goes to the canvas. The tool panel widens slightly from
the default 260px to 280px to feel appropriately weighted as the L2 replacement:

```tsx
<div className="w-[280px] border-r ...">
  {/* tool palette / step nav */}
</div>
```

## Token reference

| Element | Class / value |
|---|---|
| Tool panel width | `w-[280px]` |
| Canvas | `flex-1 flex flex-col min-w-0 overflow-hidden` |
| Properties panel | `w-[340px]` (builder-specific, not a global token) |
| Standard L2 width (for reference) | `w-[220px]` (`PANEL` in `L2NavLayout`) |
