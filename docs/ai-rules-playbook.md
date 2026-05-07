# AI Rules Playbook

How this project wires up rules, skills, and sync across Claude, Gemini, Codex, and Cursor — and how to replicate this setup in a new project.

---

## The problem this solves

When multiple AI assistants work on the same codebase, each one reads its own instruction file. Without a system, rules drift — one assistant follows the spacing grid, another doesn't. This playbook describes the setup that keeps all assistants in sync from a single source of truth.

---

## Architecture overview

```
birdeyev2/
│
├── CLAUDE.md                          ← SOURCE OF TRUTH — edit only this one
├── GEMINI.md                          ← auto-generated from CLAUDE.md
├── AGENTS.md                          ← auto-generated from CLAUDE.md
│
├── .github/
│   └── copilot-instructions.md        ← auto-generated from CLAUDE.md
│
├── .cursor/
│   └── rules/                         ← Cursor-specific (glob-scoped)
│       ├── aero-ds-saas-storybook.mdc
│       ├── storybook-story-required.mdc
│       ├── storybook-new-component.mdc
│       └── icon-stroke-lucide.mdc
│       (spacing-grid + ui-tags-sentence-case → moved to Cursor account level)
│
├── .claude/
│   └── skills/
│       └── aero-ds/
│           └── SKILL.md               ← deep reference (all files link here)
│
└── scripts/
    └── sync-ai-rules.mjs              ← sync script
```

---

## Which file each assistant reads

| Assistant | File |
|---|---|
| Claude Code (this tool) | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` |
| Codex CLI (OpenAI) | `AGENTS.md` |
| GitHub Copilot (VS Code / JetBrains) | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/*.mdc` |

---

## The sync system

### How it works

`CLAUDE.md` is the single source of truth. The other three flat files (`GEMINI.md`, `AGENTS.md`, `copilot-instructions.md`) are generated from it — same content, only the header line changes.

### Sync script

**File:** `scripts/sync-ai-rules.mjs`

Run manually:
```bash
node scripts/sync-ai-rules.mjs
```

What it does:
1. Reads `CLAUDE.md`
2. Strips the first header line
3. Writes the body to each target file with the correct assistant-specific header
4. Prints a confirmation for each file written

### Pre-commit hook (automatic)

**File:** `.git/hooks/pre-commit`

```sh
#!/bin/sh
node scripts/sync-ai-rules.mjs
git add GEMINI.md AGENTS.md .github/copilot-instructions.md
```

This runs automatically on every `git commit`. You never need to think about syncing — just edit `CLAUDE.md` and commit.

> Note: `.git/hooks/` is not committed to git. If a teammate clones the repo, they need to set up the hook themselves:
> ```bash
> cp .git/hooks/pre-commit .git/hooks/pre-commit  # already there after clone? no — see below
> ```
> To share hooks with the team, consider committing the hook to a `scripts/hooks/` folder and adding a setup step to the README:
> ```bash
> cp scripts/hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
> ```

---

## What the rules cover (7 sections in CLAUDE.md)

| # | Rule | What it enforces |
|---|---|---|
| 1 | **Storybook story required** | Every new component needs a story in `src/stories/`. Modified components need updated stories. |
| 2 | **Spacing grid** | 8px default rhythm, 4px dense. Avoid `gap-3`, `gap-5`, `p-3`, `px-5`. |
| 3 | **Icon stroke** | Lucide icons use `strokeWidth={1.6}`. Add `absoluteStrokeWidth` when not 24px. |
| 4 | **UI tags sentence case** | Badges, chips, status tags: sentence case only. |
| 5 | **Design system tokens** | Colour from `theme.css`, shell layout from `appShellClasses.ts`, no `border-b` on canvas header. |
| 6 | **aero-ds npm package** | Import from `@balajik-cmyk/aero-ds`. Don't duplicate constants. Don't modify `aero-ds/` directly. |
| 7 | **Stack reference** | React · Vite · Tailwind v4 · shadcn-style · Radix UI · TanStack Table · React Router v7 · Storybook 8 |

---

## Cursor: project-level vs account-level rules

### Account-level (applies to ALL your projects in Cursor)

Go to: **Cursor → Settings → Cursor Settings → Rules for AI**

Paste the rule content (without the `---` frontmatter block) for:

| Rule | Why account-level |
|---|---|
| `spacing-grid` | 8px grid is universal for any web UI |
| `ui-tags-sentence-case` | Sentence case on chips is universal UX |

### Project-level (this repo only, in `.cursor/rules/`)

| Rule file | Glob scope | What it does |
|---|---|---|
| `aero-ds-saas-storybook.mdc` | `src/app/**`, `src/stories/**`, theme CSS | Main Aero DS design system guidance |
| `storybook-story-required.mdc` | `src/app/components/**` | Enforces story creation for new components |
| `storybook-new-component.mdc` | `src/stories/**`, `src/app/components/ui/**` | Guardrail before adding a new UI primitive |
| `icon-stroke-lucide.mdc` | `src/app/components/**`, `src/stories/**` | 1.6px stroke rule (Birdeye-specific) |

---

## The skill file

**File:** `.claude/skills/aero-ds/SKILL.md`

This is the deep reference — invoked with `/aero-ds` in Claude Code or referenced in Cursor via the `aero-ds-saas-storybook.mdc` rule. It contains:

- Full shell architecture diagram (L1, TopBar, L2, Main canvas)
- All design token quick-refs (colour, spacing, radius, shadow, typography)
- Component-specific patterns (AppDataTable, Sheet/FloatingSheetFrame, BootInsightsLoader, SegmentedToggle, etc.)
- Copy-paste prompts for full-page builds from Figma or screenshots
- Pre-delivery checklist

The flat files (`CLAUDE.md` etc.) are short summaries. The skill file is the full detail. All flat files link to it.

---

## The aero-ds npm package workflow

### What it is

`@balajik-cmyk/aero-ds` is the published design system package. It lives at [github.com/balajik-cmyk/aero-ds](https://github.com/balajik-cmyk/aero-ds) and is published to GitHub Package Registry.

### What it exports

| Import | Provides |
|---|---|
| `import { cn }` | Tailwind merge utility |
| `import { DESIGN_VERSION }` | Current design version |
| `import { APP_SHELL_* }` | Shell layout class constants |
| `import { FLOATING_PANEL_* }` | Floating panel surface classes |
| `import { SLIDE_MS, SLIDE_EASING }` | Motion constants |
| `import "@balajik-cmyk/aero-ds/theme.css"` | Canonical design token CSS |

### Publishing a new version

1. Make changes in the `aero-ds` repo
2. Bump version in `aero-ds/package.json`
3. `git tag v1.x.y && git push origin v1.x.y`
4. GitHub Actions auto-publishes to GPR
5. In `birdeyev2`: `npm install @balajik-cmyk/aero-ds@1.x.y`
6. Commit the updated `package.json` + `package-lock.json`

### Installing (first time / new machine)

```bash
export GITHUB_TOKEN=$(gh auth token)
npm install
```

---

## How to apply this to a new project

### Step 1 — Create the four assistant files

```
CLAUDE.md                         ← write your rules here
GEMINI.md                         ← will be auto-generated
AGENTS.md                         ← will be auto-generated
.github/copilot-instructions.md   ← will be auto-generated
```

Start with `CLAUDE.md`. Use the same 7-section structure.

### Step 2 — Add the sync script

Copy `scripts/sync-ai-rules.mjs` from this repo. Run it once to generate the other files:
```bash
node scripts/sync-ai-rules.mjs
```

### Step 3 — Wire the pre-commit hook

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
node scripts/sync-ai-rules.mjs
git add GEMINI.md AGENTS.md .github/copilot-instructions.md
EOF
chmod +x .git/hooks/pre-commit
```

### Step 4 — Add Cursor rules

Create `.cursor/rules/` and add `.mdc` files for project-specific rules. Frontmatter format:

```
---
description: One-line description of when this rule applies
globs: src/app/**/*.tsx, src/stories/**/*.tsx
alwaysApply: false
---

# Rule title
...rule content...
```

Set `alwaysApply: true` only for rules that should fire on every file (e.g. spacing grid).

### Step 5 — Add universal rules to Cursor account level

In Cursor → Settings → Rules for AI, paste any rules that apply across all your projects (spacing, casing conventions, etc.).

### Step 6 — Add a skill (Claude only)

Create `.claude/skills/<skill-name>/SKILL.md` with deep reference content. Reference it from `CLAUDE.md` with:
```
> Full reference: `.claude/skills/<skill-name>/SKILL.md`
```

---

## Day-to-day workflow

| Task | What to do |
|---|---|
| Add or change a rule | Edit `CLAUDE.md` → commit (hook auto-syncs) |
| Add a Cursor-specific rule | Add `.mdc` file to `.cursor/rules/` |
| Update the deep reference | Edit `.claude/skills/aero-ds/SKILL.md` directly |
| New teammate setup | `gh auth login` → `gh auth refresh -h github.com -s read:packages` → add `GITHUB_TOKEN` to shell → `npm install` |
| Update aero-ds package | PR in aero-ds repo → tag → publish → bump version pin in birdeyev2 |
