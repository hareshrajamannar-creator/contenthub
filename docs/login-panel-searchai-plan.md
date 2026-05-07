# Login Right Panel — Search AI Redesign Plan

> **File:** `src/app/components/auth/LoginMarketingPanel.tsx`  
> **Reference:** `https://birdeye.com/search-ai/` (Image #4, Image #5)  
> **Story:** `App/Auth/Login → Default`

---

## 1. What Changes

| | Current | Target |
|---|---|---|
| Background | Dark emerald→cyan gradient + Unsplash photo | Light lavender/white gradient + CSS blob decorations |
| Content position | Bottom-left overlay on photo | Vertically centered, full bleed |
| Headline | "Explore agents that respond, publish…" | "Be the top answer on all AI engines" |
| Label | "Latest updates" badge | "Search AI" pill badge with search icon |
| Subtitle | — | "Maximize your GEO and stay visible on zero-click search." |
| Platform proof | — | ChatGPT · Gemini · Perplexity icon chips |
| CTA | Prev/Next arrows | "Try Search AI" button (purple gradient) |

---

## 2. Visual Design

### Background

Pure CSS — no image dependency. Two overlapping radial blobs:

```css
/* Blob 1 — top-left lavender */
background: radial-gradient(ellipse 70% 60% at 20% 20%, #e0d7f7 0%, transparent 70%);

/* Blob 2 — right side blue/teal */
background: radial-gradient(ellipse 60% 50% at 85% 60%, #c7e6f9 0%, transparent 70%);

/* Base */
background-color: #fafafa (light) / #18181c (dark);
```

Tailwind equivalent: `bg-[#f7f5ff] dark:bg-[#18181c]` with two `absolute` divs for blobs.

### Layout

```
┌─────────────────────────────────┐
│          [blob decorations]     │
│                                 │
│   ┌─ ⊕ Search AI ──────────┐   │  ← pill badge, gradient border
│   └────────────────────────┘   │
│                                 │
│   Be the top answer             │  ← 48–56px, font-black, #1a1a1a
│   on all AI engines             │
│                                 │
│   Maximize your GEO and stay    │  ← 16px, #666
│   visible on zero-click search. │
│                                 │
│   ┌──────────────────────┐     │
│   │  ChatGPT  Gemini  ⟡  │     │  ← platform trust chips
│   └──────────────────────┘     │
│                                 │
│   ┌─ Try Search AI ──────┐     │  ← purple gradient pill button
│   └──────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Component Breakdown

### `LoginMarketingPanel` — new structure

```tsx
<div className="hidden lg:flex w-1/2 h-full p-6">
  <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#f7f5ff] dark:bg-[#18181c]
                  ring-1 ring-border/40 flex items-center justify-center">

    {/* Blob 1 — top-left lavender */}
    <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full
                    bg-[radial-gradient(ellipse_at_center,#ddd6fe_0%,transparent_65%)]
                    opacity-70 dark:opacity-30 pointer-events-none" />

    {/* Blob 2 — bottom-right blue */}
    <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full
                    bg-[radial-gradient(ellipse_at_center,#bfdbfe_0%,transparent_65%)]
                    opacity-60 dark:opacity-20 pointer-events-none" />

    {/* Content — centered */}
    <div className="relative z-10 flex flex-col items-center text-center gap-6 px-12">

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                      border border-transparent bg-gradient-to-r from-violet-400/30 to-blue-400/20
                      ring-1 ring-violet-400/40 text-sm font-medium text-[#4a3f8a] dark:text-violet-300">
        <SearchIcon className="w-3.5 h-3.5" />
        Search AI
      </div>

      {/* Headline */}
      <h2 className="text-[2.6rem] leading-[1.1] font-black tracking-tight
                     text-[#1a1a1a] dark:text-[#f0f0f0] max-w-[380px]">
        Be the top answer on all AI engines
      </h2>

      {/* Subtitle */}
      <p className="text-[15px] leading-relaxed text-[#555] dark:text-[#9ba2b0] max-w-[320px]">
        Maximize your GEO and stay visible on zero-click search.
      </p>

      {/* Platform chips */}
      <div className="flex items-center gap-2 text-[13px] text-[#444] dark:text-[#9ba2b0]">
        <PlatformChip label="ChatGPT" icon={<ChatGPTIcon />} />
        <span className="text-[#ccc]">·</span>
        <PlatformChip label="Gemini" icon={<GeminiIcon />} />
        <span className="text-[#ccc]">·</span>
        <PlatformChip label="Perplexity" icon={<PerplexityIcon />} />
      </div>

      {/* CTA */}
      <button className="px-8 py-3 rounded-full font-semibold text-white text-sm
                         bg-gradient-to-r from-violet-600 to-blue-600
                         hover:from-violet-500 hover:to-blue-500
                         shadow-lg shadow-violet-500/25 transition-all duration-200">
        Try Search AI
      </button>

    </div>
  </div>
</div>
```

---

## 4. Platform Chips

Inline SVG icons for the three AI platforms. No external imports needed — embed paths directly.

| Platform | Icon approach |
|---|---|
| ChatGPT | OpenAI logo SVG path (4-petal shape) — already in codebase as `svg-k7qrt1366a` if available, else inline |
| Gemini | Google Gemini star-burst SVG (4 points) |
| Perplexity | Simple ⟡ symbol or the "P" lettermark |

Each chip: `rounded-full bg-white/80 dark:bg-white/10 px-2.5 py-1 text-xs flex items-center gap-1.5`

---

## 5. Dark Mode

| Token | Light | Dark |
|---|---|---|
| Panel bg | `#f7f5ff` | `#18181c` |
| Blob 1 opacity | 70% | 30% |
| Blob 2 opacity | 60% | 20% |
| Headline | `#1a1a1a` | `#f0f0f0` |
| Subtitle | `#555555` | `#9ba2b0` |
| Badge text | `#4a3f8a` | `violet-300` |

---

## 6. Animation (optional enhancement)

- Badge: `animate-[fadeInDown_0.6s_ease-out]`
- Headline: `animate-[fadeInUp_0.5s_0.1s_ease-out_both]`
- Subtitle: `animate-[fadeInUp_0.5s_0.2s_ease-out_both]`
- CTA: `animate-[fadeInUp_0.5s_0.35s_ease-out_both]`

Stagger via `animation-delay` on each child. Same `fadeInUp` keyframe already used in ReviewsView.

---

## 7. Files Changed

| File | Change |
|---|---|
| `src/app/components/auth/LoginMarketingPanel.tsx` | Full rewrite — remove Unsplash photo, add blob bg + centered copy |

No other file changes needed. `BirdAILoginPage.tsx` already renders `<LoginMarketingPanel />`.

---

## 8. Implementation Checklist

- [ ] Replace gradient + photo + overlay with blob-bg layout
- [ ] Add "Search AI" pill badge (gradient border, search icon)
- [ ] Add headline — `text-[2.6rem] font-black`
- [ ] Add subtitle
- [ ] Add ChatGPT / Gemini / Perplexity platform chips (inline SVGs)
- [ ] Add "Try Search AI" purple gradient pill button
- [ ] Verify light + dark mode in Storybook (`App/Auth/Login`)
- [ ] No Unsplash image dependency
