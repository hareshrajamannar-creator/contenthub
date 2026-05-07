# Git workflow: `main` as source of truth

This document is the team convention for **birdeyev2** (and aligns with the shared **aero-ds** submodule rules below).

## Branch protection on `main`

**Goal:** No direct pushes to `main`; integrate only via pull request; optional required CI.

### Enable in GitHub (repository admin)

1. Open **Settings** → **Branches** → **Add branch protection rule** (or edit the rule for `main`).
2. **Branch name pattern:** `main`
3. Enable:
   - **Require a pull request before merging** (set minimum reviewers to `1` if you want mandatory review).
   - **Require status checks to pass before merging** → **Require branches to be up to date before merging** (recommended).
     - Add the check that runs on PRs. For this repo, after workflows have run at least once, pick the Playwright job (often listed as **Playwright Tests / test** or similar under “Status checks that are required”).
   - **Do not allow bypassing the above settings** (optional but strict).
4. Under **Rules applied to everyone including administrators**, decide whether admins may bypass (default off is stricter).

**Note:** On some **private** repositories, the REST API for branch protection returns `403` unless the org/repo is on a plan that includes the feature; configuration via the **web UI** is still the standard approach.

### Optional: automation via CLI

If your org allows it (public repo or eligible plan), an admin can script protection with the [GitHub REST API “Update branch protection”](https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection) or future `gh` extensions. Prefer the UI if API access is blocked.

---

## Updating feature branches: merge vs rebase (team convention)

**Convention for this repo: merge from `main` into your feature branch.**

When `main` moves ahead while your PR is open:

```bash
git fetch origin
git checkout your-feature-branch
git merge origin/main
# resolve conflicts, test, push
```

**Why merge (not rebase) here:** Keeps a clear history of when `main` was integrated into the branch; avoids force-pushing shared branches; matches default GitHub “merge PR into main” flows. If the whole org later standardizes on **rebase** for feature branches, update this section in one place—until then, use **merge** for `origin/main` → feature branch updates.

**Do not** resolve integration issues by committing directly on `main`.

---

## Working with `aero-ds`

`aero-ds` is a **separate repo** published as `@balajik-cmyk/aero-ds` on the GitHub Package Registry. It is consumed by birdeyev2 as a versioned npm dependency — no submodule commands needed.

### Setup (once per machine)

Create or update `~/.npmrc` (global) with a PAT that has `read:packages` scope:

```
//npm.pkg.github.com/:_authToken=<YOUR_PAT>
```

Or export it in your shell profile:

```bash
export GITHUB_TOKEN=<YOUR_PAT>
```

The repo-level `.npmrc` routes `@balajik-cmyk` installs to GitHub Package Registry and reads the token from `$GITHUB_TOKEN`.

### Fresh clone

```bash
git clone <birdeyev2-url>
cd birdeyev2
GITHUB_TOKEN=<your-pat> npm install   # pulls @balajik-cmyk/aero-ds from GPR
```

### Making changes to `aero-ds`

1. Clone `aero-ds` separately: `git clone git@github.com:balajik-cmyk/aero-ds.git`
2. Create a branch, make changes, open a PR, merge to `main`.
3. Bump the version in `aero-ds/package.json` (semver: patch / minor / major).
4. Tag the release: `git tag v1.x.y && git push --tags`
5. GitHub Actions auto-publishes the new version to GPR (see `.github/workflows/publish.yml`).
6. In **birdeyev2**, update the version pin: `npm install @balajik-cmyk/aero-ds@1.x.y`
7. Commit `package.json` + `package-lock.json` in a birdeyev2 PR.

### What `@balajik-cmyk/aero-ds` exports

| Import | What it provides |
|---|---|
| `import { cn } from “@balajik-cmyk/aero-ds”` | Tailwind class merge utility |
| `import { DESIGN_VERSION } from “@balajik-cmyk/aero-ds”` | Current design version token |
| `import { APP_SHELL_BELOW_TOPBAR_CARD_CLASS, ... } from “@balajik-cmyk/aero-ds”` | App shell layout constants |
| `import { FLOATING_PANEL_SURFACE_CLASSNAME } from “@balajik-cmyk/aero-ds”` | Floating overlay surface class |
| `import “@balajik-cmyk/aero-ds/theme.css”` | Canonical design token CSS |
| `import “@balajik-cmyk/aero-ds/tokens.css”` | Base token layer |

---

## Quick reference

| Action | Command / location |
|--------|---------------------|
| Start feature | `git checkout main && git pull && git checkout -b feature/my-change` |
| Sync feature with `main` | `git fetch origin && git merge origin/main` |
| Install deps (incl. aero-ds) | `GITHUB_TOKEN=<pat> npm install` |
| Bump aero-ds after publish | `npm install @balajik-cmyk/aero-ds@<version>` |
| Protect `main` | GitHub → Settings → Branches → protection rule for `main` |
