# Design version workflow

Reference for starting versions, switching the app, rolling back, Storybook, and the version switcher.

---

## Starting a new version

### Create a v2 version of a component

1. Create `src/components/[ComponentName]/[ComponentName].v2.tsx` based on the existing `[ComponentName].v1.tsx`.
2. Keep all the logic and props exactly the same.
3. Only change the visual design: [describe what should look different — colors, layout, spacing, font, etc.]
4. Do not touch the re-export file `[ComponentName].tsx` yet.

### Create v2 token file

1. Create `src/themes/v2/tokens.css`.
2. Base it on `src/themes/v1/tokens.css` but update these values:
   - Primary color: [your new color]
   - Font: [your new font]
   - Border radius: [value]
   - Spacing: [value]
3. Keep any tokens that are not changing the same as v1.

### Switch the app to a new version

1. Update the re-export files for these components to point to v2:
   - `src/components/[ComponentName]/[ComponentName].tsx` → re-export from `./[ComponentName].v2`
   - `src/components/[ComponentName2]/[ComponentName2].tsx` → re-export from `./[ComponentName2].v2`
2. Update `src/config/designVersion.ts` to export `"v2"` instead of `"v1"`.
3. Do not delete any v1 files.

---

## Rolling back

### Roll back entire app to a previous version

1. Roll back the entire app to [v1/v2/v3].
2. Update `src/config/designVersion.ts` to export `"[version]"`.
3. Update the re-export file for every component in `src/components/` to point to the `.[version].tsx` file.
4. Do not delete any files.

### Roll back a single component

1. Roll back only the [ComponentName] component to [v1/v2].
2. Update `src/components/[ComponentName]/[ComponentName].tsx` to re-export from `./[ComponentName].[version]`.
3. Do not touch any other component.

---

## Storybook

### Add version stories for a component

1. Create a Storybook story file at `src/stories/[ComponentName].stories.tsx`.
2. Import all available versions of [ComponentName] (v1, v2, etc.) and export each as a named story: V1, V2, etc.
3. Use the default export to set the title as `"Components/[ComponentName]"`.

---

## Version switcher button

### Add a runtime version switcher to the UI

1. Create a `VersionSwitcher` component at `src/components/VersionSwitcher/VersionSwitcher.tsx`. It should:
   - Show buttons for v1, v2, v3, v4
   - Read the active version from localStorage key `"design_version"`
   - On click, save the selected version to localStorage and reload the page
   - Highlight the currently active version button
2. Add `<VersionSwitcher />` to the top of the main layout file.

---

## Checklist — before starting every new version

Before building v[X], do the following:

1. Confirm all current components have a `.v[X-1].tsx` file
2. Confirm `src/themes/v[X-1]/tokens.css` exists
3. Create an empty `src/themes/v[X]/tokens.css` copied from v[X-1]
4. List all components that will visually change in v[X] so you can review before you start
