# Claude Code — project rules for BirdeyeV2 (Bird AI App)

> Full design intelligence: `.claude/skills/aero-ds/SKILL.md`

---

## Section 1 — What this repo is

This is the **Bird AI front-end prototype** — a full Birdeye SaaS shell containing Reviews, Social, Search AI, Contacts, Content Hub, Agents, Campaigns, and many other modules. It is a **single-page React app** powered by Vite, with no traditional routing library. All navigation is handled through a custom `AppView` union type and a persisted state hook.

The app is **demo / prototype quality**: it favours visual fidelity and UX exploration over production data wiring. Components render mock data inline rather than hitting real APIs.

**Stack at a glance:**

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind v4 (CSS-first config, no `tailwind.config.js`) |
| UI primitives | Custom `src/app/components/ui/*.v1.tsx` (shadcn-style Radix UI wrappers) |
| Design tokens | `@balajik-cmyk/aero-ds` npm package |
| Icons | Lucide React |
| Tables | TanStack Table v8 |
| Stories | Storybook 8 |
| Tests | Vitest + Playwright |

---

## Section 2 — NON-NEGOTIABLE RULES

These rules apply to **every change in every file**, no exceptions.

### 2.1 Storybook story required for every new component

When you create a **new** component under `src/app/components/` (including `ui/`), you **must** also create a story under `src/stories/` in the same response. When **modifying** an existing component, update its story to reflect the change.

**Do not** consider a component task complete without a story.

- File: `src/stories/<ComponentName>.stories.tsx`
- Title: `UI/<Name>` for primitives · `App/<Name>` for views/panels · `Design System/<name>` for token demos
- Always include a `Default` story + one story per key variant
- Use sentence case for story names
- Import the component directly — no mocks

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "@/app/components/MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "UI/MyComponent",
  component: MyComponent,
};
export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = { args: {} };
```

### 2.2 No emojis, ever

Do **not** add emojis to any JSX, string constant, comment, or label. This is a professional product UI.

### 2.3 Icons — Lucide only, correct stroke

- All icons come from `lucide-react` — do not add other icon libraries
- Every icon **must** use `strokeWidth={1.6}` (source: `l1StripIconTokens.ts`)
- When the icon size is **not** 24px: also add `absoluteStrokeWidth` so the stroke stays 1.6px on screen

```tsx
// Correct
<Search className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />

// Wrong — default strokeWidth={2}
<Search className="h-4 w-4" />
```

### 2.4 Spacing grid (8px / 4px dense)

- Default rhythm: multiples of **8px** → `gap-2` (8px) · `gap-4` (16px) · `gap-6` (24px) · `gap-8` (32px)
- Dense rhythm: **4px** → `gap-1` for label-to-control, icon gaps
- **Never use:** `gap-3`, `gap-5`, `p-3`, `px-3`, `px-5` (off-grid)

### 2.5 UI tag / badge casing — sentence case only

Badges, pills, status tags, chips: **sentence case** only.
- `Customer interaction` ✓ — `Customer Interaction` ✗
- Single words stay capitalized: `Success`, `Failed`, `Processing`

### 2.6 No new UI primitives without checking first

Before adding a new `ui/` primitive:
1. State the intent in one line (what job does this UI do?).
2. Search `src/app/components/ui/` and Storybook titles for an existing match.
3. Report the closest existing story and component file.
4. Decide: **extend**, **compose**, **replace**, or **new primitive** — and why.

Floating side panels → use **`Sheet`** with `inset="floating"`, not a bespoke `fixed` div.

### 2.7 Do not touch working code

Before making any change, read the file. Identify what is currently working. Change only what the task requires. Rewriting a whole component when only one section needed to change is a violation.

---

## Section 3 — Component library reference

### 3.1 UI primitives (`src/app/components/ui/`)

All primitives follow a versioning convention:

- **`*.v1.tsx`** — the implementation file (versioned, contains actual code)
- **`*.tsx`** (unversioned) — re-exports everything from `.v1.tsx`; this is the import target

Always import from the unversioned file:

```tsx
// Correct
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/app/components/ui/dialog";

// Wrong — never import from v1 directly
import { Button } from "@/app/components/ui/button.v1";
```

Key primitives available:

| Primitive | File |
|---|---|
| `Button` | `ui/button` |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter` | `ui/dialog` |
| `Sheet`, `SheetContent`, `SheetHeader` | `ui/sheet` |
| `Badge` | `ui/badge` |
| `Input` | `ui/input` |
| `Textarea` | `ui/textarea` |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | `ui/select` |
| `Checkbox` | `ui/checkbox` |
| `Switch` | `ui/switch` |
| `Separator` | `ui/separator` |
| `Tooltip`, `TooltipContent`, `TooltipTrigger` | `ui/tooltip` |
| `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` | `ui/dropdown-menu` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `ui/tabs` |
| `ScrollArea` | `ui/scroll-area` |
| `Sonner` (toasts) | `ui/sonner` |

Use `cn()` from `@balajik-cmyk/aero-ds` for Tailwind class merging — not directly from `class-variance-authority` or `clsx`.

### 3.2 aero-ds package imports

`@balajik-cmyk/aero-ds` is the published design-system package. Import from it; **never duplicate** its constants locally.

| Import | What it provides |
|---|---|
| `import { cn } from "@balajik-cmyk/aero-ds"` | Tailwind merge utility |
| `import { DESIGN_VERSION } from "@balajik-cmyk/aero-ds"` | Design version token |
| `import { APP_SHELL_BELOW_TOPBAR_CARD_CLASS, APP_SHELL_GUTTER_SURFACE_CLASS, APP_MAIN_CONTENT_SHELL_CLASS } from "@balajik-cmyk/aero-ds"` | Shell layout |
| `import { FLOATING_PANEL_SURFACE_CLASSNAME, FLOATING_PANEL_LIST_PADDING_CLASSNAME } from "@balajik-cmyk/aero-ds"` | Floating panel surface |
| `import { SLIDE_MS, SLIDE_EASING } from "@balajik-cmyk/aero-ds"` | Motion constants |
| `import "@balajik-cmyk/aero-ds/theme.css"` | Canonical token CSS |

**Do not modify `aero-ds/` directly.** It is a separate repo. Open a PR at `github.com/balajik-cmyk/aero-ds`, publish a new version, then update the version pin in `package.json`.

### 3.3 Design token references

| What | Location |
|---|---|
| Colour tokens (CSS vars) | `src/styles/theme.css` |
| Tailwind token classes | `bg-primary`, `text-muted-foreground`, `border-border`, etc. |
| Shell layout classes | `APP_SHELL_*` from `src/app/components/layout/appShellClasses.ts` (also re-exported from `aero-ds`) |
| Main view header | `MAIN_VIEW_HEADER_BAND_CLASS`, `MAIN_VIEW_PRIMARY_HEADING_CLASS`, `MAIN_VIEW_SUBHEADING_CLASS` from `src/app/components/layout/mainViewTitleClasses.ts` |
| Floating panel | `FLOATING_PANEL_SURFACE_CLASSNAME` from `aero-ds` |
| Modal overlay | `MODAL_OVERLAY_VISUAL_CLASS` from `src/app/components/ui/modalOverlayClasses.ts` |

**Key values to memorise:**

```ts
// Shell card that sits below the top bar
APP_SHELL_BELOW_TOPBAR_CARD_CLASS =
  "flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden rounded-lg border border-app-shell-border";

// Gutter surface (L2 nav background)
APP_SHELL_GUTTER_SURFACE_CLASS = "bg-app-shell-gutter transition-colors duration-300";

// Main content area inside the card
APP_MAIN_CONTENT_SHELL_CLASS =
  "flex-1 flex flex-col min-w-0 overflow-hidden rounded-tr-lg rounded-br-lg bg-app-shell-main";

// Standard view header band — use for every new view
MAIN_VIEW_HEADER_BAND_CLASS = "flex shrink-0 items-center justify-between px-6 pt-5 pb-4";
MAIN_VIEW_PRIMARY_HEADING_CLASS = "text-lg font-semibold tracking-tight text-foreground";
MAIN_VIEW_SUBHEADING_CLASS = "mt-0.5 text-xs text-muted-foreground";
```

- **No `border-b`** on a canvas/view header — title band stays visually open into body. Dividers belong on inner cards.
- **No perimeter border** on modal/sheet content — use shadow for depth.

---

## Section 4 — How to add a new feature module

Follow every step in order. Missing one step creates a silently broken view.

### Step 1 — Add the view string to `AppView`

In `src/app/App.tsx`, add your view key to the `AppView` union type:

```ts
export type AppView =
  | … existing views …
  | "my-new-module";
```

### Step 2 — Create the view component

Create `src/app/components/MyNewModuleView.tsx`. Every view must:

- Import and use `MAIN_VIEW_HEADER_BAND_CLASS` and `MAIN_VIEW_PRIMARY_HEADING_CLASS` for its header
- Fill 100% of available height — no `max-width` constraints or `margin: auto` centering
- Use `flex-1 overflow-auto` on its body section

```tsx
import { MAIN_VIEW_HEADER_BAND_CLASS, MAIN_VIEW_PRIMARY_HEADING_CLASS } from "./layout/mainViewTitleClasses";

export function MyNewModuleView() {
  return (
    <div className="flex flex-col h-full">
      <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
        <div>
          <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Module Title</h1>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        {/* content */}
      </div>
    </div>
  );
}
```

### Step 3 — Wire the view into App.tsx's render switch

In `App.tsx`, find the large `currentView ===` conditional block (`renderCurrentView` function or equivalent), import the new component at the top of the file, and add a case for the new view key.

### Step 4 — Create the L2 nav panel (if the module has sub-sections)

Create `src/app/components/MyNewModuleL2NavPanel.tsx`. L2 panels are narrow left-rail components rendered inside the shell gutter alongside the view. See `ContentHubL2NavPanel.tsx` as a reference.

Register the L2 panel in `App.tsx` inside the `{/* L2 nav */}` section — it is conditionally shown based on `currentView`. Pattern:

```tsx
{currentView === "my-new-module" && (
  <MyNewModuleL2NavPanel currentView={currentView} onNavigate={handleViewChange} />
)}
```

### Step 5 — Add an L1 icon to the icon strip (if top-level)

The `IconStrip` (imported from `"./components/Sidebar"`) is the far-left icon rail. Adding a new L1 entry requires editing the Sidebar components — check existing entries for the correct pattern.

### Step 6 — Create the Storybook story

As per rule 2.1, create `src/stories/MyNewModuleView.stories.tsx`.

---

## Section 5 — L2 navigation routing pattern

This app uses **no React Router**. All navigation is custom state.

### How routing works

```ts
// App.tsx
const [currentView, setCurrentView] = usePersistedState<AppView>("nav:l1", "reviews");
```

`usePersistedState` serialises the value to `sessionStorage` under the key `"nav:l1"`. On refresh, the last active view is restored. On sign-out, all `nav:*` keys are cleared so the next session starts fresh.

### Changing views

Views are changed by calling `handleViewChange`, which is defined in App.tsx and prop-drilled to child components that need to trigger navigation:

```ts
// Signature
handleViewChange(view: AppView, slug?: string): void
```

The `slug` parameter carries sub-section context (e.g. an agent ID, a conversation ID). Each module that needs a persistent sub-selection stores it in its own persisted key:

```ts
// Examples of module-level L2 state
const [selectedAgentSlug] = usePersistedState<string>("nav:l2:agents", "");
const [contactsL2Active] = usePersistedState("nav:l2:contacts", CONTACTS_L2_KEY_ALL);
const [searchAIL2Active] = usePersistedState("nav:l2:searchai", SEARCH_AI_L2_DEFAULT_ACTIVE);
```

Always use a module-specific prefix to avoid key collisions: `"nav:l2:<module-name>"`.

### L2 nav panels

Each module that has sub-sections exports a named `*L2NavPanel` component. App.tsx conditionally renders the correct one inside the shell gutter:

```tsx
{currentView.startsWith("content-hub") && !faqAgentBuilderOpen && (
  <ContentHubL2NavPanel currentView={currentView} onNavigate={handleViewChange} />
)}
{(currentView === "reviews" || …) && (
  <ReviewsL2NavPanel … />
)}
```

**Never show an L2 panel without matching exactly the right view(s).** Multiple modules share the same gutter slot — a condition that is too broad bleeds into unrelated views.

### Content Hub sub-views

Content Hub uses a prefix pattern. All its views start with `"content-hub"`:

| View key | What it shows |
|---|---|
| `content-hub-home` | Content Home (entry point) |
| `content-hub-projects` | Projects list |
| `content-hub-templates` | Template gallery |
| `content-hub-calendar` | Calendar view |
| `content-hub-create` | Create new content |
| `content-hub-agents-faq` | FAQ generation agents |
| `content-hub-agents-blog` | Blog generation agents |

The Content Hub editor (`ContentEditorShell`) is rendered when `currentView === "content-hub"` and `editingContentMode` is set.

---

## Section 6 — Styling rules

### 6.1 Tailwind v4 — CSS-first configuration

Tailwind is configured via `src/styles/theme.css` using CSS custom properties. There is **no `tailwind.config.js`**. Custom tokens are defined as CSS variables and consumed by Tailwind.

### 6.2 Token-based colours only

Never use raw hex or RGB values in `className` strings. Use semantic token classes:

| Token class | Meaning |
|---|---|
| `bg-background` | Main content surface |
| `bg-muted` | Subtle surface (chips, info bars) |
| `bg-primary` | Brand primary (buttons, active states) |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary / helper text |
| `border-border` | Standard border |
| `text-primary` | Brand colour text (links, active) |
| `text-destructive` | Error / destructive action |

### 6.3 Typography scale

Use Tailwind's text scale classes only. Common values:

| Use | Class |
|---|---|
| View heading | `text-lg font-semibold tracking-tight` |
| Section heading | `text-sm font-semibold` |
| Body / labels | `text-sm` |
| Small / captions | `text-xs` or `text-[12px]` |
| Micro (table headers, etc.) | `text-[11px]` |

### 6.4 No inline `style={{ }}` with raw values

Use Tailwind classes. If a value truly cannot be expressed in Tailwind (rare), use `style` with a CSS variable reference, not a hardcoded hex or pixel value.

### 6.5 Overflow and scroll

Views must scroll internally — never push content outside the shell:

```tsx
// View root: fixed height, inner scroll
<div className="flex flex-col h-full">
  <div className={MAIN_VIEW_HEADER_BAND_CLASS}>{/* static header */}</div>
  <div className="flex-1 overflow-auto">{/* scrollable body */}</div>
</div>
```

---

## Section 7 — Shared layout components

These components are part of the shell and must **never be modified** in their core structure. Feature work goes inside their `children` slots or alongside them as siblings.

### TopBar (`src/app/components/TopBar.tsx`)

The horizontal bar at the very top of the app. Renders the Birdeye logo, global search, and right-side user controls. Do not modify.

### IconStrip (`src/app/components/Sidebar.tsx → IconStrip`)

The leftmost narrow rail of icons representing L1 modules. Clicking an icon calls `handleViewChange`. Frozen unless adding a new top-level module.

### L2NavPanel variants

All L2 panels are exported from `src/app/components/Sidebar.tsx`. The Content Hub L2 panel lives separately at `src/app/components/ContentHubL2NavPanel.tsx` due to its complexity.

### Shell layout assembly

The shell card is assembled in App.tsx using these three constants — always in this order:

```tsx
<div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
  {/* L2 gutter */}
  <div className={APP_SHELL_GUTTER_SURFACE_CLASS}>
    {/* conditionally rendered L2NavPanel */}
  </div>
  {/* Main content */}
  <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
    {renderCurrentView()}
  </div>
</div>
```

### ResizableRightChatPanel (`src/app/components/layout/ResizableRightChatPanel.tsx`)

The AI chat panel that slides in from the right when `aiPanelOpen` is true. It wraps `MynaChatPanel`. Do not re-implement this pattern — use the existing component.

### AppBootShimmer (`src/app/components/layout/AppBootShimmer.tsx`)

Shown for 1.2 seconds after login as a shell skeleton. Do not modify.

---

## Section 8 — Common mistakes that cause blank screens

These are recurring patterns that break the app silently. Verify none of these are present before marking a task complete.

### 8.1 Missing export from view file

If a view component is not exported, or there is a named/default export mismatch, the import in App.tsx will be `undefined` and the screen renders nothing. Always use **named exports** for view components.

### 8.2 Wrong import path

The app uses the `@/` path alias pointing at `src/`. An incorrect relative path fails silently at runtime.

```ts
// Correct
import { MyView } from "@/app/components/MyView";

// Wrong — relative paths can resolve to the wrong location
import { MyView } from "../../components/MyView";
```

### 8.3 View not wired into the render switch

Adding a key to the `AppView` union type does **not** automatically render anything. The key must also be handled in the `currentView ===` conditional block in App.tsx. A missing case renders nothing.

### 8.4 L2 nav condition too broad

If an L2 panel's condition uses `.startsWith("content")` instead of `.startsWith("content-hub")`, it activates for unrelated views and shifts the layout unexpectedly.

### 8.5 Overflow not set on view root

A view component without `h-full` + `overflow-auto` on its body div causes content to overflow the shell and scroll the entire `<html>` element, breaking the layout for everything else.

### 8.6 `flex-1 min-h-0` missing on a growing child

The shell uses nested flex rows and columns. Any child that should fill remaining space needs `flex-1 min-h-0` (or `min-w-0` in a row). Missing `min-h-0` causes the child to overflow its flex parent instead of scrolling internally.

### 8.7 Hardcoded height on a view panel

Using `h-[600px]` on a panel inside the shell clips content on small viewports and leaves whitespace on large ones. Use `h-full`, `flex-1`, or `min-h-0`.

### 8.8 `usePersistedState` key collision

Two modules using the same `sessionStorage` key will clobber each other's navigation state. Always use a module-specific prefix: `"nav:l2:<module-name>"`.

### 8.9 Dialog missing `DialogPortal`

Radix UI dialogs must be wrapped in `DialogPortal` to render outside the normal DOM tree. Omitting it causes z-index and overflow-clipping issues where the modal is hidden behind other content.

### 8.10 Wizard modal too narrow

The standard `DialogContent` wrapper applies `sm:max-w-lg` (512px). For wizard modals that need more width, use `DialogPrimitive.Content` directly with explicit sizing:

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";

<DialogPrimitive.Content className="max-w-[640px] max-h-[88vh] …">
```

---

## Section 9 — Reference modules

When building a new module, use these as canonical examples of correct patterns.

### Reviews (`src/app/components/ReviewsView.tsx`)

Reference for: standard view layout, `MAIN_VIEW_HEADER_BAND_CLASS` usage, TanStack Table integration, L2 nav panel pattern.

### Content Hub — `ContentEditorShell` (`src/app/components/content-hub/editor/ContentEditorShell.tsx`)

Reference for: block editor layout, left/right panel composition, wizard modal integration, `BlockEditorProvider` context wrapping, info bar between header and body, `needsWizard` flag for deferred canvas population.

### Content Hub — `ContentCreationWizardModal` (`src/app/components/content-hub/wizard/ContentCreationWizardModal.tsx`)

Reference for: multi-step modal pattern, `DialogPrimitive.Content` with custom dimensions, `StepIndicator` component, mode-branching step routing, cancel/back/next footer. Step labels are keyed by `WizardMode`; step components are routed via `renderStep()`.

### AiCopilot (`src/app/components/content-hub/AiCopilot.tsx`)

Reference for: context-aware panel that switches between setup mode (`editorContext: 'setup'`) and editing mode (`editorContext: 'editing'`). The `editorContext` prop gates entirely different UX flows within the same component — early return pattern with `<EditorCopilot />`.

### Contacts (`src/app/components/ContactsView.tsx`)

Reference for: L2 sub-section state pattern, `usePersistedState` for L2 active key, app-bridge pattern for cross-component communication without prop-drilling all the way to root.

### FAQWizardStep1 / FAQWizardStep3Combined (`src/app/components/content-hub/wizard/`)

Reference for: the canonical 3-step wizard step structure, template picker cards, goal/output data interfaces, pill-based form controls.

---

## Appendix — `AppView` union (current)

```ts
export type AppView =
  | "business-overview"
  | "dashboard"
  | "shared-by-me"
  | "inbox"
  | "storybook"
  | "reviews"
  | "social"
  | "searchai"
  | "contacts"
  | "scheduled-deliveries"
  | "agents-monitor"
  | "agents-analyze-performance"
  | "agents-builder"
  | "agent-detail"
  | "agents-onboarding"
  | "schedule-builder"
  | "birdai-reports"
  | "birdai-journeys"
  | "listings"
  | "surveys"
  | "ticketing"
  | "campaigns"
  | "insights"
  | "competitors"
  | "referrals"
  | "payments"
  | "appointments"
  | "content-hub"
  | "content-hub-home"
  | "content-hub-projects"
  | "content-hub-templates"
  | "content-hub-calendar"
  | "content-hub-create"
  | "content-hub-assigned"
  | "content-hub-approve"
  | "content-hub-agents-faq"
  | "content-hub-agents-blog"
  | "recommendations";
```
