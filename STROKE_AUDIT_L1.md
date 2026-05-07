# Stroke audit — L1 rail (Figma Visual Uplift 2.0)

Source tokens: `src/app/components/l1StripIconTokens.ts` — `L1_STRIP_ICON_SIZE` = **16.2**, `L1_STRIP_ICON_STROKE_PX` = **1.6** (used for Phosphor / Lucide vector icons only).

| Slot / label | Component / asset | Size (px) | Stroke (px) | Notes |
|--------------|-------------------|-----------|---------------|--------|
| Agents | Sparkle (Phosphor) | 16.2 | 1.6 | `strokeWidth` + `weight` on `Sparkle` |
| Inbox … Reports | Figma SVG (`<img src="/l1-nav-visual-uplift/*.svg">`) | 16.2 | baked in SVG (~1.25–1.5) | Strokes are **authored in Figma**; not overridden in CSS so pixels match the file. |
| Agent setup | Sparkles (Lucide) | 16.2 | 1.6 + `absoluteStrokeWidth` | |
| Settings | Figma `settings.svg` (`<img>`) | 16.2 | baked in SVG | |

**Regenerating from Figma:** Re-export Main Nav glyphs (node `7593:1014`), replace files under `public/l1-nav-visual-uplift/`, and keep `l1NavVisualUpliftSources.ts` paths in sync.
