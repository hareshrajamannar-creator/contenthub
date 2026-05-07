import type { Meta, StoryObj } from "@storybook/react";
import { APP_SHELL_BELOW_TOPBAR_CARD_CLASS } from "@/app/components/layout/appShellClasses";
import {
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
  MAIN_VIEW_SUBHEADING_CLASS,
} from "@/app/components/layout/mainViewTitleClasses";

const meta: Meta = {
  title: "Design System/Tokens",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Before adding new UI primitives or Storybook stories, read **Design System → Before you add a component** (checklist + Sheet/floating panels). For stacked **page title + bordered widgets** (dashboard-style), see **Tokens → Main canvas + bordered widgets**.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ── shared label ────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════
   COLOURS
   ══════════════════════════════════════════════════════ */
const baseColors = [
  { name: "Primary",            token: "--primary",            cls: "bg-primary" },
  { name: "Primary foreground", token: "--primary-foreground", cls: "bg-primary-foreground border" },
  { name: "Secondary",          token: "--secondary",          cls: "bg-secondary" },
  { name: "Muted",              token: "--muted",              cls: "bg-muted" },
  { name: "Accent",             token: "--accent",             cls: "bg-accent border" },
  { name: "Destructive",        token: "--destructive",        cls: "bg-destructive" },
  { name: "Background",         token: "--background",         cls: "bg-background border" },
  { name: "Card",               token: "--card",               cls: "bg-card border" },
  { name: "Border",             token: "--border",             cls: "bg-border" },
  { name: "Input background",   token: "--input-background",   cls: "bg-input-background border" },
  { name: "Foreground",         token: "--foreground",         cls: "bg-foreground" },
  { name: "Muted foreground",   token: "--muted-foreground",   cls: "bg-muted-foreground" },
];

const chartColors = [
  { name: "Chart 1", token: "--chart-1", cls: "bg-chart-1" },
  { name: "Chart 2", token: "--chart-2", cls: "bg-chart-2" },
  { name: "Chart 3", token: "--chart-3", cls: "bg-chart-3" },
  { name: "Chart 4", token: "--chart-4", cls: "bg-chart-4" },
  { name: "Chart 5", token: "--chart-5", cls: "bg-chart-5" },
];

const sidebarColors = [
  { name: "Sidebar",              token: "--sidebar",              cls: "bg-sidebar border" },
  { name: "Sidebar primary",      token: "--sidebar-primary",      cls: "bg-sidebar-primary" },
  { name: "Sidebar accent",       token: "--sidebar-accent",       cls: "bg-sidebar-accent border" },
  { name: "Sidebar foreground",   token: "--sidebar-foreground",   cls: "bg-sidebar-foreground" },
  { name: "Sidebar border",       token: "--sidebar-border",       cls: "bg-sidebar-border" },
];

const appShellColors = [
  {
    name: "App shell gutter",
    token: "--app-shell-gutter",
    cls: "bg-app-shell-gutter",
    note: "Area around the L2+main card (`pr-[10px] pb-[10px]` row)",
  },
  {
    name: "App shell rail",
    token: "--app-shell-rail",
    cls: "bg-app-shell-rail",
    note: "L1 strip + TopBar (light matches gutter)",
  },
  {
    name: "App shell L1 nav highlight",
    token: "--app-shell-l1-nav-highlight",
    cls: "bg-app-shell-l1-nav-highlight border border-border",
    note: "L1 rail + expanded row pills — selected + hover (`IconStrip`)",
  },
  {
    name: "App shell L1 nav pressed",
    token: "--app-shell-l1-nav-pressed",
    cls: "bg-app-shell-l1-nav-pressed border border-border",
    note: "L1 nav pills while pointer down",
  },
  {
    name: "App shell L2 surface",
    token: "--app-shell-l2-surface",
    cls: "bg-app-shell-l2-surface border border-border",
    note: "Secondary navigation column",
  },
  {
    name: "App shell main",
    token: "--app-shell-main",
    cls: "bg-app-shell-main border border-border",
    note: "Primary content column (light = background)",
  },
  {
    name: "App shell outline",
    token: "--app-shell-border",
    cls: "bg-app-shell-border",
    note: "1px card frame — L2+main below TopBar",
  },
  {
    name: "App shell L2 row hover",
    token: "--app-shell-l2-row-hover",
    cls: "bg-app-shell-l2-row-hover border border-border",
    note: "L2 list row hover (`L2NavLayout` `HOVER`)",
  },
  {
    name: "App shell L2 row active",
    token: "--app-shell-l2-row-active",
    cls: "bg-app-shell-l2-row-active border border-border",
    note: "L2 selected child background (`CHILD_ACTIVE`)",
  },
  {
    name: "App shell L2 content muted",
    token: "--app-shell-l2-content-muted",
    cls: "bg-app-shell-l2-content-muted border border-border",
    note: "Main-column muted band (`L2_CONTENT_MUTED_BAND`)",
  },
];

const navigationSelectionRows: {
  name: string;
  token: string;
  cls: string;
  sampleTextCls: string;
  note: string;
}[] = [
  {
    name: "L1 selected / hover wash",
    token: "--app-shell-l1-nav-highlight",
    cls: "bg-app-shell-l1-nav-highlight border border-border",
    sampleTextCls: "text-primary",
    note: "Collapsed L1 rail + expanded L1 rows — same wash for selected and hover; pressed uses `--app-shell-l1-nav-pressed` (`Sidebar.v2`).",
  },
  {
    name: "L2 neutral selected row",
    token: "--app-shell-l2-row-active",
    cls: "bg-app-shell-l2-row-active border border-border",
    sampleTextCls: "text-foreground",
    note: "Tree child selection (`CHILD_ACTIVE` in `L2NavLayout.v1.tsx`). Text stays `text-foreground`.",
  },
  {
    name: "Primary-tint selected row",
    token: "--primary @ 10%",
    cls: "bg-primary/10 border border-primary/20",
    sampleTextCls: "text-primary",
    note: "Accent lists: flat L2 tabs (`CHILD_FLAT_ACCENT_ACTIVE`), overflow menu, profile rows. Text/icon: `text-primary`.",
  },
];

export const Colors: Story = {
  name: "Colours",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      <div>
        <SectionLabel>Base colours</SectionLabel>
        <div className="grid grid-cols-4 gap-4">
          {baseColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Chart colours</SectionLabel>
        <div className="grid grid-cols-5 gap-4">
          {chartColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Sidebar colours</SectionLabel>
        <div className="grid grid-cols-5 gap-4">
          {sidebarColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>App chrome</SectionLabel>
        <div className="grid grid-cols-5 gap-4">
          {appShellColors.map(({ name, token, cls, note }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
                {note ? <p className="text-[11px] text-muted-foreground">{note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Navigation selection</SectionLabel>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Use these three patterns: L1 rail + expanded Birdeye rows use <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">--app-shell-l1-nav-highlight</code>{" "}
          (visible blue-grey on the rail; not <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">--sidebar-accent</code>); L2 tree rows use app-shell L2 active; compact menus use{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">primary/10</code>. See{" "}
          <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">L2NavLayout.v1.tsx</code> and{" "}
          <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">Sidebar.v2.tsx</code>.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {navigationSelectionRows.map(({ name, token, cls, sampleTextCls, note }) => (
            <div key={token} className="flex flex-col gap-2">
              <div
                className={`flex h-14 w-full items-center rounded-lg px-4 text-sm font-medium ${sampleTextCls} ${cls}`}
              >
                Sample
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
                <p className="text-[11px] text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   BORDER RADIUS
   ══════════════════════════════════════════════════════ */
const radiusTokens = [
  {
    name: "None",
    token: "--",
    cls: "rounded-none",
    tw: "rounded-none",
    value: "0px",
    use: "Flat / flush elements",
  },
  {
    name: "SM",
    token: "--radius-sm",
    cls: "rounded-sm",
    tw: "rounded-sm",
    value: "6px",
    use: "Tight UI chips, small badges",
  },
  {
    name: "MD",
    token: "--radius-md",
    cls: "rounded-md",
    tw: "rounded-md",
    value: "8px",
    use: "Buttons, inputs, select",
  },
  {
    name: "LG",
    token: "--radius-lg",
    cls: "rounded-lg",
    tw: "rounded-lg",
    value: "10px (base)",
    use: "Cards, popovers, dropdowns",
  },
  {
    name: "XL",
    token: "--radius-xl",
    cls: "rounded-xl",
    tw: "rounded-xl",
    value: "14px",
    use: "Modals, dialogs, panels",
  },
  {
    name: "2XL",
    token: "--",
    cls: "rounded-2xl",
    tw: "rounded-2xl",
    value: "16px",
    use: "Large feature cards",
  },
  {
    name: "3XL",
    token: "--",
    cls: "rounded-3xl",
    tw: "rounded-3xl",
    value: "24px",
    use: "Hero sections, splash cards",
  },
  {
    name: "Full",
    token: "--",
    cls: "rounded-full",
    tw: "rounded-full",
    value: "9999px",
    use: "Avatars, pills, toggles",
  },
];

export const BorderRadius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      {/* Visual swatch grid */}
      <div>
        <SectionLabel>Radius scale</SectionLabel>
        <div className="grid grid-cols-4 gap-4">
          {radiusTokens.map(({ name, token, tw, value, use }) => (
            <div key={tw} className="flex flex-col gap-4">
              <div
                className={`h-20 w-full bg-primary/10 border-2 border-primary/30 ${tw} flex items-center justify-center`}
              >
                <span className="text-xs text-primary font-mono">{tw}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-foreground">{name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{value}</p>
                </div>
                {token !== "--" && (
                  <p className="font-mono text-[10px] text-primary">{token}</p>
                )}
                <p className="text-[11px] text-muted-foreground">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table reference */}
      <div>
        <SectionLabel>Quick reference</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Token", "Tailwind class", "Value", "Used on"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[length:var(--table-label-size)] text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {radiusTokens.map(({ name, token, tw, value, use }) => (
                <tr key={tw} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-primary">{token !== "--" ? token : "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{tw}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{value}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real component examples */}
      <div>
        <SectionLabel>Radius in real components</SectionLabel>
        <div className="flex flex-wrap gap-4 items-start">
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md">
            Button — rounded-md
          </button>
          <span className="inline-flex items-center rounded-md border-0 px-2 py-0.5 bg-secondary text-secondary-foreground text-[12px] font-medium">
            Badge — rounded-md (no border)
          </span>
          <div className="px-4 py-4 bg-card border border-border rounded-lg text-sm text-foreground">
            Card — rounded-lg
          </div>
          <div className="px-6 py-4 bg-card border border-border rounded-xl text-sm text-foreground shadow-md">
            Dialog — rounded-xl
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
            JD
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>App shell — L2 and main</SectionLabel>
        <p className="text-sm text-muted-foreground max-w-2xl mb-4">
          New product areas must reuse the same chrome so L2 and main line up with the rest of the app.
          Do not add a new 220px secondary nav without this top-left radius on the L2 column.
        </p>
        <ul className="text-sm text-foreground max-w-2xl list-disc pl-4 space-y-2 mb-6">
          <li>
            Below TopBar, wrap L2 + main (and optional Myna row) in{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">APP_SHELL_BELOW_TOPBAR_CARD_CLASS</code>{" "}
            from <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">appShellClasses.ts</code>{" "}
            (1px <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">rounded-lg</code> frame,{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">border-app-shell-border</code> /{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">--app-shell-border</code> — **App shell outline** in Colours; gutter uses{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">bg-app-shell-gutter</code> /{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">APP_SHELL_GUTTER_SURFACE_CLASS</code> with{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">pr-[10px] pb-[10px]</code> on the parent row in{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">App.tsx</code>).
          </li>
          <li>
            L2 navigation column: <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">PANEL</code> from{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">L2NavLayout.tsx</code> (8px left corners,{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">border-r border-app-shell-border</code> vs main).
          </li>
          <li>
            Main content column: <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">APP_MAIN_CONTENT_SHELL_CLASS</code>{" "}
            (<code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">rounded-tr-lg</code>,{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">rounded-br-lg</code>,{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">bg-app-shell-main</code> — no extra perimeter border).
          </li>
          <li>
            Top bar: <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">rounded-tr-lg</code> in{" "}
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">TopBar.tsx</code>.
          </li>
        </ul>
        <div className="flex h-24 w-full max-w-md flex-col rounded-lg bg-app-shell-gutter p-2">
          <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
            <div
              className="flex w-24 shrink-0 items-end justify-center rounded-tl-lg border-r border-app-shell-border bg-app-shell-l2-surface pb-2 text-[10px] text-muted-foreground"
              title="L2 — PANEL seam"
            >
              L2
            </div>
            <div
              className="flex flex-1 min-w-0 items-end justify-center rounded-tr-lg rounded-br-lg bg-app-shell-main pb-2 text-[10px] text-muted-foreground"
              title="Main — APP_MAIN_CONTENT_SHELL_CLASS"
            >
              Main
            </div>
          </div>
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   SHADOWS
   ══════════════════════════════════════════════════════ */
const shadowTokens = [
  {
    name: "None",
    tw: "shadow-none",
    use: "Flat, borderless surfaces",
  },
  {
    name: "SM",
    tw: "shadow-sm",
    use: "Subtle lift — inputs, tags",
  },
  {
    name: "Default",
    tw: "shadow",
    use: "Default card elevation",
  },
  {
    name: "MD",
    tw: "shadow-md",
    use: "Dropdowns, popovers",
  },
  {
    name: "LG",
    tw: "shadow-lg",
    use: "Floating panels, tooltips",
  },
  {
    name: "XL",
    tw: "shadow-xl",
    use: "Dialogs, modals",
  },
  {
    name: "2XL",
    tw: "shadow-2xl",
    use: "Large overlays, drawers",
  },
  {
    name: "Inner",
    tw: "shadow-inner",
    use: "Pressed states, inset wells",
  },
];

export const Shadows: Story = {
  name: "Shadows",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      {/* Visual swatch grid */}
      <div>
        <SectionLabel>Shadow scale</SectionLabel>
        <div className="grid grid-cols-4 gap-6">
          {shadowTokens.map(({ name, tw, use }) => (
            <div key={tw} className="flex flex-col gap-4">
              <div
                className={`h-20 w-full bg-card rounded-xl border border-border ${tw} flex items-center justify-center`}
              >
                <span className="font-mono text-xs text-muted-foreground">{tw}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="text-[11px] text-muted-foreground">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table reference */}
      <div>
        <SectionLabel>Quick reference</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Tailwind class", "Level", "Used on"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[length:var(--table-label-size)] text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shadowTokens.map(({ name, tw, use }) => (
                <tr key={tw} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-foreground">{tw}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real component elevation examples */}
      <div>
        <SectionLabel>Elevation in real components</SectionLabel>
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { label: "Input",   tw: "shadow-sm",  radius: "rounded-md",  extra: "px-4 py-2 border border-border bg-input-background" },
            { label: "Card",    tw: "shadow",      radius: "rounded-lg",  extra: "px-6 py-4 border border-border bg-card" },
            { label: "Popover", tw: "shadow-md",   radius: "rounded-xl",  extra: "px-6 py-4 border border-border bg-card" },
            { label: "Dialog",  tw: "shadow-xl",   radius: "rounded-xl",  extra: "px-6 py-6 border border-border bg-card" },
            { label: "Drawer",  tw: "shadow-2xl",  radius: "rounded-xl",  extra: "px-6 py-6 border border-border bg-card" },
          ].map(({ label, tw, radius, extra }) => (
            <div key={label} className="flex flex-col gap-2 items-center">
              <div className={`${extra} ${tw} ${radius} text-sm text-foreground min-w-[100px] text-center`}>
                {label}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{tw}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   ELEVATION MAP — radius + shadow together
   ══════════════════════════════════════════════════════ */
export const ElevationMap: Story = {
  name: "Elevation Map",
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <SectionLabel>Elevation map — radius + shadow per surface type</SectionLabel>

      <div className="flex flex-col gap-4">
        {[
          {
            level: "0 — Flat",
            shadow: "shadow-none",
            radius: "rounded-md",
            bg: "bg-muted",
            border: "border border-border",
            desc: "Badges, chips, inline labels",
            example: "badge",
          },
          {
            level: "1 — Raised",
            shadow: "shadow-sm",
            radius: "rounded-md",
            bg: "bg-card",
            border: "border border-border",
            desc: "Inputs, selects, small buttons",
            example: "input",
          },
          {
            level: "2 — Card",
            shadow: "shadow",
            radius: "rounded-lg",
            bg: "bg-card",
            border: "border border-border",
            desc: "Content cards, list items",
            example: "card",
          },
          {
            level: "3 — Floating",
            shadow: "shadow-md",
            radius: "rounded-xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Dropdowns, popovers, command palette",
            example: "dropdown",
          },
          {
            level: "4 — Overlay",
            shadow: "shadow-xl",
            radius: "rounded-xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Dialogs, modals, sheets",
            example: "modal",
          },
          {
            level: "5 — Temporary",
            shadow: "shadow-2xl",
            radius: "rounded-2xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Side drawers, full-screen panels",
            example: "drawer",
          },
        ].map(({ level, shadow, radius, bg, border, desc, example }) => (
          <div key={level} className="flex items-center gap-6">
            {/* Swatch */}
            <div
              className={`w-24 h-14 shrink-0 ${bg} ${border} ${shadow} ${radius} flex items-center justify-center`}
            >
              <span className="text-[10px] font-mono text-muted-foreground">{example}</span>
            </div>
            {/* Metadata */}
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm text-foreground">{level}</p>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
            {/* Tokens */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-mono text-[10px] text-primary">{shadow}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{radius}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   BUTTON SYSTEM
   Every interactive button in the product must use these heights.
   ══════════════════════════════════════════════════════ */
import { Button } from "@/app/components/ui/button";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { Star } from "lucide-react";

export const ButtonSystem: Story = {
  name: "Button System",
  render: () => (
    <div className="flex flex-col gap-10 max-w-2xl">

      <div>
        <SectionLabel>Button height tokens</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Token", "Value", "Size variant", "Live example"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[length:var(--table-label-size)] text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-mono text-xs text-primary">--button-height-xs</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">24px</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">iconXs</td>
                <td className="px-4 py-2">
                  <Button size="iconXs" variant="outline" aria-label="24px icon button">
                    <span className="font-mono text-[10px] leading-none">24</span>
                  </Button>
                </td>
              </tr>
              {[
                { token: "--button-height-sm", value: "32px", size: "sm",      label: "Small" },
                { token: "--button-height",    value: "34px", size: "default", label: "Default" },
                { token: "--button-height-lg", value: "44px", size: "lg",      label: "Large" },
              ].map(({ token, value, size, label }) => (
                <tr key={token} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-primary">{token}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{value}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{label}</td>
                  <td className="px-4 py-2">
                    <Button size={size as any} variant="outline">{label}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionLabel>All variants at default height (34px)</SectionLabel>
        <div className="flex flex-wrap gap-4 items-center">
          {(["default","secondary","outline","ghost","destructive","link"] as const).map(v => (
            <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Size comparison</SectionLabel>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col items-center gap-1">
            <Button size="iconXs" variant="outline" aria-label="24px">
              <span className="font-mono text-[10px] leading-none">24</span>
            </Button>
            <span className="font-mono text-[10px] text-muted-foreground">24px (iconXs)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button size="sm">Small — 32px</Button>
            <span className="font-mono text-[10px] text-muted-foreground">h: 32px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button size="default">Default — 34px</Button>
            <span className="font-mono text-[10px] text-muted-foreground">h: 34px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button size="lg">Large — 44px</Button>
            <span className="font-mono text-[10px] text-muted-foreground">h: 44px</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button size="icon">⊕</Button>
            <span className="font-mono text-[10px] text-muted-foreground">34px (icon)</span>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Base font size</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Token", "Value", "Effect"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[length:var(--table-label-size)] text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { token: "--font-size", value: "13px", effect: "Sets `html` font size — `text-*` rem utilities scale from here (app + Storybook)" },
                { token: "--table-label-size", value: "12px", effect: "Column headers and table label rows (`TableHead`, `AppDataTable` headers, `<th>` labels)" },
                { token: "text-xs",    value: "0.75rem (≈ 10px)", effect: "Captions, metadata, timestamps" },
                { token: "text-sm",    value: "0.875rem (≈ 11px)", effect: "Secondary text, table cells" },
                { token: "text-base",  value: "1rem (= 13px)", effect: "Body copy, inputs, default UI text" },
                { token: "text-lg",    value: "1.125rem (≈ 15px)", effect: "Sub-headings (h3)" },
                { token: "text-xl",    value: "1.25rem (≈ 16px)", effect: "Section headings (h2)" },
                { token: "text-2xl",   value: "1.5rem (≈ 20px)", effect: "Page titles (h1)" },
              ].map(({ token, value, effect }) => (
                <tr key={token} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-primary">{token}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{value}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   MAIN CANVAS + BORDERED WIDGET BANDS
   Reference: `Dashboard.v1.tsx` + `MainCanvasViewHeader`
   ══════════════════════════════════════════════════════ */

export const MainCanvasAndWidgetBands: Story = {
  name: "Main canvas + bordered widgets",
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <SectionLabel>Main canvas + bordered widgets</SectionLabel>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          For views that stack a <strong>page title</strong> (<code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MainCanvasViewHeader</code>) and one or more{" "}
          <strong>bordered cards</strong> (charts, KPI bands, tables), keep <strong>one horizontal band</strong> so the{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">h1</code> and card titles share a vertical alignment line, then add{" "}
          <strong>inner padding on the card</strong> so body content does not touch the border.
        </p>
        <ul className="mb-6 max-w-2xl list-disc space-y-2 pl-4 text-sm text-foreground">
          <li>
            <strong>Band (page + scroll body):</strong> use matching horizontal padding on the sticky header and the scrollable body below — e.g.{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">px-8</code> on both. On{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MainCanvasViewHeader</code>, override the default{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">px-6</code> from{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MAIN_VIEW_HEADER_BAND_CLASS</code> with{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">className=&quot;!px-8&quot;</code> when the view needs the wider gutter.
          </li>
          <li>
            <strong>Titles:</strong> page title uses the same tokens as everywhere else —{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MAIN_VIEW_PRIMARY_HEADING_CLASS</code> on the{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">h1</code> from{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MainCanvasViewHeader</code>; card titles use the same class on an{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">h3</code> (or equivalent). Subcopy under card titles:{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">MAIN_VIEW_SUBHEADING_CLASS</code>.
          </li>
          <li>
            <strong>Card shell:</strong> bordered surface — e.g. <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">rounded-lg border border-border bg-card</code> (or product hex borders where legacy). Card <strong>interior</strong>:{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">px-6</code> horizontal padding so headers, charts, and tables inset from the card edge (see **Elevation → Card** <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">px-6 py-4</code> pattern).
          </li>
          <li>
            <strong>Column layout:</strong> use <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">flex-col items-stretch</code> on the card so header rows span full width (avoid <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">items-center</code>, which shrinks children and breaks alignment).
          </li>
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="flex items-start justify-between border-b border-border px-8 py-5">
          <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Profile performance</h1>
          <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">Actions</span>
        </div>
        <div className="flex flex-col gap-6 px-8 pb-8 pt-6">
          <div className="flex flex-col items-stretch gap-4 rounded-lg border border-border bg-card px-6 py-5">
            <div>
              <h3 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Performance summary</h3>
              <p className={MAIN_VIEW_SUBHEADING_CLASS}>This month vs previous period</p>
            </div>
            <p className="text-sm text-muted-foreground">
              KPI row and chart would continue here — all insets are <code className="font-mono text-xs">px-6</code> from the card border.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   ICON STROKE (Lucide / product icons)
   ══════════════════════════════════════════════════════ */

export const IconStroke: Story = {
  name: "Icon stroke",
  render: () => (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <SectionLabel>Product outline icons — 1.4px</SectionLabel>
        <p className="text-sm text-muted-foreground max-w-xl mb-4">
          Hand-written UI icons (Lucide, Phosphor on the L1 rail) use{" "}
          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">L1_STRIP_ICON_STROKE_PX</code>{" "}
          (<strong>{L1_STRIP_ICON_STROKE_PX}px</strong>) from{" "}
          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">l1StripIconTokens.ts</code>.
          Lucide defaults to a heavier stroke; do not rely on that for new product UI.
        </p>
        <ul className="text-sm text-foreground max-w-xl list-disc pl-4 space-y-2 mb-6">
          <li>
            Pass <code className="font-mono text-xs bg-muted px-1 rounded">strokeWidth=&#123;L1_STRIP_ICON_STROKE_PX&#125;</code>{" "}
            (or literal <code className="font-mono text-xs bg-muted px-1 rounded">1.4</code>).
          </li>
          <li>
            When width/height are not the default 24px, add{" "}
            <code className="font-mono text-xs bg-muted px-1 rounded">absoluteStrokeWidth</code>{" "}
            so the stroke stays 1.4px on screen (see JSDoc in the tokens file).
          </li>
          <li>
            <code className="font-mono text-xs bg-muted px-1 rounded">strokeWidth=&#123;0&#125;</code>{" "}
            is fine for filled-only glyphs (e.g. filled stars).
          </li>
          <li>
            Not applicable: Recharts <code className="font-mono text-xs bg-muted px-1 rounded">strokeWidth</code> on lines/areas, and generated SVG under{" "}
            <code className="font-mono text-xs bg-muted px-1 rounded">src/imports/</code>.
          </li>
        </ul>
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2 items-center">
            <Star
              className="h-6 w-6 text-foreground fill-none stroke-current"
              strokeWidth={L1_STRIP_ICON_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
            <span className="font-mono text-[10px] text-muted-foreground">16px + absoluteStrokeWidth</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Star
              className="h-6 w-6 text-foreground fill-[#D4A017] stroke-[#D4A017]"
              strokeWidth={0}
              aria-hidden
            />
            <span className="font-mono text-[10px] text-muted-foreground">Filled — stroke 0</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
