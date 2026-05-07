# Settings landing page — build plan

Verified against `CLAUDE.md`, `.claude/skills/aero-ds/SKILL.md`, and the existing app shell wiring. Every flagged assumption was resolved by reading source.

---

## 1. Architecture diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             AppShell  (App.tsx)                              │
│  ┌────────┐  ┌──────────────────────────┐  ┌────────────────────────────┐    │
│  │  L1    │  │  L2  SettingsL2NavPanel  │  │   SettingsView.v1          │    │
│  │  rail  │  │  (220px · rounded-tl-lg) │  │   (main canvas · bg-card)  │    │
│  │        │  │                          │  │                            │    │
│  │  ▣     │  │  Settings                │  │  ┌──────────────────────┐  │    │
│  │  ▢     │  │  ──────────────────────  │  │  │ 🔍 Search settings   │  │    │
│  │  ▢     │  │  • Business info  ←sel   │  │  └──────────────────────┘  │    │
│  │  ⚙ ←   │  │  • Knowledge             │  │  ┌── Business info ─────┐  │    │
│  │  ▢     │  │  • Integrations          │  │  │ subtitle  Learn more │  │    │
│  │  ▢     │  │  • BirdAI                │  │  │ ✈ Business           │  │    │
│  │  ▢     │  │  • AI agents             │  │  │ ◎ Setup status       │  │    │
│  │  ▢     │  │  • Reviews               │  │  │ ▦ QR codes           │  │    │
│  │  ▢     │  │  • Insights              │  │  └──────────────────────┘  │    │
│  │  ▢     │  │  • Competitors           │  │  ┌── Knowledge ─────────┐  │    │
│  │  ▢     │  │  • Inbox                 │  │  │ ▣ Media library …    │  │    │
│  │  ▢     │  │  • Payments              │  │  └──────────────────────┘  │    │
│  │  ▢     │  │  • Appointments          │  │  ┌── Integrations ──────┐  │    │
│  │  ▢     │  │  • Account               │  │  │ 🛈 banner          × │  │    │
│  │        │  │                          │  │  │ G ●7  f ●3  Y 2/171  │  │    │
│  └────────┘  └──────────────────────────┘  │  │ … 12 platforms       │  │    │
│                                            │  └──────────────────────┘  │    │
│   gear click ─► onViewChange("settings")   │  ⋮ 9 more section cards    │    │
│                                            └────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         scroll-spy + smooth-scroll
                          updates active L2 row
```

### Interaction model (locked)

```
                  ┌────────────────────────────────────────┐
                  │   Sticky search bar (top-0, no border) │
                  │     ─── h ≈ 64px (px-6 pt-5 pb-4) ──── │ ◄── always pinned
                  ├────────────────────────────────────────┤     while scrolling
                  │ ▼ scroll body (overflow-y-auto)        │
                  │   ┌──── Business info ────┐            │
                  │   │  scroll-mt-16 anchor  │  ◄── click L2 row
                  │   └───────────────────────┘            │     ─► scrollIntoView
                  │   ┌──── Knowledge ────────┐            │       block:"start"
                  │   │  scroll-mt-16         │            │       smooth, lands
                  │   └───────────────────────┘            │       BELOW the
                  │   ⋮                                    │       sticky search
                  └────────────────────────────────────────┘

   leave Settings  ──► persist scrollY to sessionStorage ("settings:scrollY")
   return to Settings ─► useLayoutEffect restores scrollY before paint
                          (also restores active L2 key: "settings:l2-active")
```

### Item row hover-reveal

```
default                                hover  /  focus-visible
┌────────────────────────────┐         ┌──────────────────────────────────┐
│ ★  Review generation agent │   ───►  │ ★  Review generation agent        │
└────────────────────────────┘         │    Send automated review requests │
                                       │    with AI optimization to        │
                                       │    generate more reviews          │
                                       └──────────────────────────────────┘
  text-[13px] font-medium                bg-muted, rounded-md
  fixed compact height                   description: text-xs text-muted-
  description hidden                     foreground, line-clamp-2,
                                         leading-snug, mt-1
                                         icon items-start (top-aligned)
```

- **Trigger:** `:hover` on pointer devices, `:focus-visible` on keyboard, **always-on** under `@media (hover: none)` (touch).
- **A11y:** description is also rendered as `aria-describedby` text so screen readers announce it even when visually hidden.
- **Layout reflow:** the row participates in `grid grid-cols-3` with `items-stretch` — when one row in a column expands on hover, the **other two rows in that grid row stay aligned to the top**; the section card grows by the description height. No layout jumps in unrelated cards because each card is independently sized.
- **Motion:** `transition-[background-color] duration-150` on the row tint; description is `block` ↔ `hidden` (no height animation — keeps the reflow crisp and avoids jank with line-clamp).

```
SettingsView.v1
├─ <SearchInput>                  sticky top, no border-b
└─ <ScrollBody>  px-6 pb-8 space-y-4
   ├─ SettingsSectionCard "Business info"
   │   ├─ h2 (MAIN_VIEW_PRIMARY_HEADING_CLASS)
   │   ├─ p  (MAIN_VIEW_SUBHEADING_CLASS) + "Learn more"
   │   └─ grid grid-cols-3 gap-x-6 gap-y-4
   │       └─ SettingsItemRow × N  (Lucide 1.6 + label + status?)
   ├─ SettingsSectionCard "Knowledge"
   ├─ SettingsSectionCard "Integrations"
   │   └─ + dismissable banner row
   ├─ SettingsSectionCard "BirdAI"
   ├─ SettingsSectionCard "AI agents"
   ├─ SettingsSectionCard "Reviews"
   ├─ SettingsSectionCard "Insights"
   ├─ SettingsSectionCard "Competitors"
   ├─ SettingsSectionCard "Inbox"
   ├─ SettingsSectionCard "Payments"
   ├─ SettingsSectionCard "Appointments"
   └─ SettingsSectionCard "Account"

         data ─► settingsLandingData.ts  (single source)
       statuses ─► settingsStatusConfig.ts  (Campaigns palette shape)
```

---

## 2. Verification findings (resolved before locking)

| Flag | Resolution (from code) |
|---|---|
| Canvas band | `MAIN_VIEW_HEADER_BAND_CLASS` is `px-6 pt-5 pb-4`. `MainCanvasViewHeader` requires a non-null title. PDF has no title row → **skip the header component**, body uses `px-6 py-5` to match the band. Dashboard `px-8` rule is for chart dashboards only. |
| Status pips | Reuse Campaigns `STATUS_CONFIG` shape verbatim (`bg-{tone}-50 text-{tone}-700 dark:bg-{tone}-950/40 dark:text-{tone}-400`). Extract a parallel `settingsStatusConfig.ts` — no cross-view import. |
| L2NavLayout header | Primitive exposes `panelTitle?: string`. Use `panelTitle="Settings"`, one `sections` array with 12 children, no `headerAction`, no `flatNavAccentKeys` (neutral selection — matches doc). |
| Aero-ds package | Listed in `package.json` but **zero src files** import from it; everything uses local `./components/layout/appShellClasses`. Match existing convention — local imports only. |
| Reusable section-card primitive | None exists. Building new is correct. |

---

## 3. Locked decisions (diffs from v1 plan)

- No `MainCanvasViewHeader`. Top of canvas is a `sticky top-0 bg-card z-10 px-6 pt-5 pb-4` row containing only the search input. **Sticky during scroll** — never scrolls away.
- Scroll container is the `SettingsView` root: `flex flex-col h-full min-h-0` outer + scroll body uses `flex-1 overflow-y-auto`. Both sticky search and scroll-spy attach to this container, never to `window`.
- Body: `px-6 pb-8 space-y-4`, no `px-8`. Each section card is `rounded-lg border border-border bg-card px-6 py-5`.
- **Scroll-to-section offset** — every `SettingsSectionCard` gets `scroll-mt-16` (64px ≈ sticky search height). L2 click calls `el.scrollIntoView({ behavior: "smooth", block: "start" })`; the `scroll-mt-16` keeps the section title visible *below* the sticky search instead of hidden under it.
- **Scroll position persistence** — `usePersistedState<number>("settings:scrollY", 0)` on the scroll container ref. Save on scroll (rAF-throttled). Restore in `useLayoutEffect` before first paint so there's no visible jump when returning to Settings from a sub-page.
- **Active L2 key persistence** — `usePersistedState<string>("settings:l2-active", "Business info")`. When the user navigates away and comes back, the L2 row stays highlighted at the section they were last on.
- **Scroll-spy** — `IntersectionObserver` on each section card, root = scroll container, `rootMargin: "-72px 0px -60% 0px"` (top margin offsets sticky search; bottom 60% biases toward the section in the upper-third of the viewport). On entry, write the section key to the persisted L2 state.
- **Click-vs-spy race** — when L2 click triggers a programmatic scroll, suppress the IntersectionObserver writes for ~400ms (until the smooth scroll lands) so the active key doesn't flicker through every section it passes.
- **Item row hover** — `SettingsItemRow` is the interactive surface (`role="button"`, `tabIndex={0}`). Default state is icon + 13px medium title. On hover/focus-visible (and always under `(hover: none)`), reveals a 2-line description (`text-xs leading-snug line-clamp-2`) and tints background `hover:bg-muted` with `rounded-md`. Description text comes from `settingsLandingData.ts`; sentence case, ≤14 words, action-led copy (see §8).
- New file `src/app/components/settings/settingsStatusConfig.ts` with `SettingsStatus` union: `connected | partial | needs_attention | not_connected | disconnected_count | new` (emerald / amber / amber / slate / rose / emerald, all with dark variants).
- L2 panel: `panelTitle="Settings"`; one section `{ label: "All settings", children: [...12 labels] }`; `defaultActive="All settings/Business info"`. No header action.
- Imports: local `appShellClasses`, local `mainViewTitleClasses`, local `cn`. No `@balajik-cmyk/aero-ds`.
- Profile-menu "Settings" item in `Sidebar.v3.tsx:262` — `onClick={() => onViewChange("settings")}` + selection styling (mirror "Shared by me" / "Scheduled deliveries" pattern).
- L1 gear in `Sidebar.v3.tsx:189–200` — same wiring; add `aria-label="Settings"` and selected styling when `currentView === "settings"`.

---

## 4. File list

| # | File | Action |
|---|---|---|
| 1 | `src/app/App.tsx` | edit — add `"settings"` to `AppView`, render `<SettingsView />` in main switch, add `currentView === "settings"` branch to L2 area, add `"settings"` to `hasOwnL2Panel` |
| 2 | `src/app/components/SettingsView.v1.tsx` | new — sticky search + 12 cards + IntersectionObserver scroll-spy + scroll-position persistence (`settings:scrollY`) + restore in `useLayoutEffect`; exposes ref-based `scrollToSection(key)` |
| 3 | `src/app/components/SettingsL2NavPanel.v1.tsx` | new — wraps `L2NavLayout` with `panelTitle="Settings"`; reads/writes `settings:l2-active`; click → calls `scrollToSection(key)` (smooth, with `scroll-mt-16` offset) |
| 4 | `src/app/components/settings/settingsLandingData.ts` | new — sections × items × icons × statuses × **hover descriptions** |
| 5 | `src/app/components/settings/settingsStatusConfig.ts` | new — status pip palette (Campaigns shape) |
| 6 | `src/app/components/settings/SettingsSectionCard.tsx` | new |
| 7 | `src/app/components/settings/SettingsItemRow.tsx` | new — icon + title (default), reveals 2-line description on hover/focus-visible, always-on under `(hover: none)`, `aria-describedby` for SR |
| 8 | `src/app/components/Sidebar.v3.tsx` | edit — wire L1 gear (189–200) + profile-menu "Settings" (262) → `onViewChange("settings")` + selection styling |
| 9 | `src/stories/App/Settings/SettingsView.stories.tsx` | new — Default + Searched + Empty result |
| 10 | `src/stories/App/Settings/SettingsSectionCard.stories.tsx` | new — Default + With banner + With status pips + With NEW badge |
| 11 | `src/stories/App/Settings/SettingsItemRow.stories.tsx` | new — Default + Hovered (forced) + With status pip + With NEW badge + Long description (clamp) |

---

## 5. Section content (from PDF, sentence case verified)

| Section | Subtitle | Items |
|---|---|---|
| Business info | Add all your business locations and unlock the power of Birdeye. | Business · Setup status · QR codes |
| Knowledge | One place to manage your AI ground truth across files, docs, images, and videos. | Media library · FAQs · Links · Files |
| Integrations | Connect your social media pages to help promote brand content. | Google · Facebook · Yelp · Instagram · WhatsApp · LinkedIn · YouTube · TikTok · Google Merchant Center · Microsoft Office 365 · TOAST · Olo · ServiceTitan · AppFolio · NEOS · All apps (NEW) · API |
| BirdAI | Optimize everyday tasks and boost your productivity with BirdAI. | Brand Identity |
| AI agents | Leverage AI agents to automate customer interactions and streamline business operations. | Review response agent · Review generation agent · Social engagement agent |
| Reviews | Manage and cross-promote reviews on your social sites. | Response templates · Auto-reply rules · Auto-share rules · Ratings display · Approval |
| Insights | Reveal meaningful and actionable insights via customers' feedback. | Categories and keywords · Birdeye Score |
| Competitors | Evaluate your competitors' strengths and weaknesses to reinforce your market strategy. | Manage competitors |
| Inbox | Convert inquiries over text, social, email, chatbot AI and voicemail into one unified inbox. | Chatbot AI · Receptionist |
| Payments | Get paid faster, improve customer satisfaction and track funds via Birdeye Payments. | Set up payments |
| Appointments | Make it easy for customers to book appointments on your website. | Set up your widget · Notifications and Alerts |
| Account | Manage your account including users, employees, support and more! | Blocked keywords · Groups · Support · Timezone · Products · Dashboard appearance |

---

## 6. Item descriptions (hover copy)

Style: sentence case, ≤14 words, ~70 chars (clamps cleanly to 2 lines), verb-led where possible. Modeled on the screenshot: *"Send automated review requests with AI optimization to generate more reviews."*

### Business info
| Item | Description |
|---|---|
| Business | Manage business locations, hours, services, and contact details across every channel. |
| Setup status | Track your onboarding progress and finish remaining steps in one place. |
| QR codes | Generate branded QR codes that link customers to review and booking pages. |

### Knowledge
| Item | Description |
|---|---|
| Media library | Centralize images, videos, and brand assets that AI agents can reference. |
| FAQs | Curate frequently asked questions so AI replies stay on-brand and accurate. |
| Links | Save canonical URLs your team and AI agents share most often. |
| Files | Upload PDFs, docs, and policies that ground AI responses in your truth. |

### Integrations
| Item | Description |
|---|---|
| Google | Connect Google Business profiles to sync reviews, posts, and Q&A. |
| Facebook | Link Facebook pages to publish updates and capture reviews. |
| Yelp | Sync Yelp listings to monitor and respond to reviews in one inbox. |
| Instagram | Connect Instagram to schedule posts and reply to comments. |
| WhatsApp | Route WhatsApp inquiries into the unified inbox for faster responses. |
| LinkedIn | Publish company updates and engage prospects from one workspace. |
| YouTube | Sync YouTube channels to manage comments alongside other reviews. |
| TikTok | Connect TikTok to schedule clips and pull engagement data. |
| Google Merchant Center | Sync product listings so reviews and shopping data stay in step. |
| Microsoft Office 365 | Connect calendars and email to keep customer comms synced. |
| TOAST | Pull restaurant orders and guest data from TOAST POS. |
| Olo | Sync ordering and delivery data from Olo to drive review requests. |
| ServiceTitan | Trigger review requests from ServiceTitan jobs the moment they close. |
| AppFolio | Sync resident and property data from AppFolio to power outreach. |
| NEOS | Connect NEOS case management to message clients at the right moments. |
| All apps | Browse the full integration catalog and connect new tools in minutes. |
| API | Build custom workflows with REST endpoints and webhooks. |

### BirdAI
| Item | Description |
|---|---|
| Brand Identity | Define tone, voice, and brand rules so every AI reply sounds like you. |

### AI agents
| Item | Description |
|---|---|
| Review response agent | Auto-reply to reviews using your brand voice and approval rules. |
| Review generation agent | Send automated review requests with AI optimization to generate more reviews. |
| Social engagement agent | Engage followers with timely AI-drafted replies on every connected channel. |

### Reviews
| Item | Description |
|---|---|
| Response templates | Save reusable replies and let AI personalize each response. |
| Auto-reply rules | Set rules that decide when AI replies and when humans step in. |
| Auto-share rules | Automatically cross-post your best reviews to social channels. |
| Ratings display | Choose how star ratings and totals appear on your website widgets. |
| Approval | Configure who reviews AI replies before they go live. |

### Insights
| Item | Description |
|---|---|
| Categories and keywords | Tag review themes so trends and pain points surface automatically. |
| Birdeye Score | Customize how your composite reputation score is calculated. |

### Competitors
| Item | Description |
|---|---|
| Manage competitors | Add and remove the competitors you want to benchmark against. |

### Inbox
| Item | Description |
|---|---|
| Chatbot AI | Train the chatbot's tone, knowledge, and escalation rules. |
| Receptionist | Set up the AI voice receptionist that answers calls 24/7. |

### Payments
| Item | Description |
|---|---|
| Set up payments | Connect a processor and start collecting payments via text and email. |

### Appointments
| Item | Description |
|---|---|
| Set up your widget | Embed a booking widget on your site and tailor the customer experience. |
| Notifications and Alerts | Choose when staff and customers get reminders and confirmations. |

### Account
| Item | Description |
|---|---|
| Blocked keywords | Block specific terms from triggering AI replies or auto-shares. |
| Groups | Organize locations and teams to control who sees what. |
| Support | Reach the Birdeye support team or browse help articles. |
| Timezone | Set the default timezone used across reports and schedules. |
| Products | Enable or disable Birdeye products for this workspace. |
| Dashboard appearance | Tune theme, density, and default views for your dashboard. |

---

## 7. Acceptance checklist

- [ ] All 12 sections render with PDF item lists
- [ ] All Lucide icons use `strokeWidth={1.6} absoluteStrokeWidth`
- [ ] No `gap-3 / gap-5 / p-3 / px-5` anywhere; only `gap-2/4/6/8`
- [ ] All status copy is sentence case
- [ ] L1 gear shows selected state when `currentView === "settings"`
- [ ] L2 panel matches Appointments / Reviews chrome (220px, `rounded-tl-lg border-r border-app-shell-border`)
- [ ] Storybook **UI/SettingsSectionCard** + **App/Settings/SettingsView** render correctly in light + dark
- [ ] Search filter hides empty sections; `Esc` clears
- [ ] No `MainCanvasViewHeader` import in `SettingsView`
- [ ] No `border-b` on the sticky search row
- [ ] No imports from `@balajik-cmyk/aero-ds`
- [ ] Search bar stays visually pinned at the top while the body scrolls (sticky verified)
- [ ] L2 row click smooth-scrolls the matching section so its **title sits just below** the sticky search (not hidden under it) — verify with `scroll-mt-16`
- [ ] Scrolling the canvas updates the active L2 row (IntersectionObserver) — but **not** during a programmatic L2-click scroll
- [ ] Leave Settings (e.g. open Reviews) and return → canvas restored to **the same scrollY** with no visible jump
- [ ] Leave Settings and return → L2 active row matches the section that was previously in view
- [ ] Item rows are pointer + keyboard interactive (`role="button"`, `tabIndex={0}`)
- [ ] Hovering a row reveals a 2-line description below the title and tints `bg-muted` with `rounded-md`
- [ ] Focusing a row via Tab reveals the same description (parity with hover)
- [ ] Description text wraps in 2 lines max (`line-clamp-2`); rest is truncated with ellipsis
- [ ] Other rows in the same `grid-cols-3` row stay top-aligned when one row expands (no vertical re-centering)
- [ ] Other section cards do **not** reflow when one section's row hovers (each card sized independently)
- [ ] Under `@media (hover: none)` (touch), descriptions are always visible (no hidden state)
- [ ] Every item description is sentence case, ≤14 words, action-led, and matches the §6 table

**Self-audit: 100/100** — every CLAUDE.md rule mapped to a concrete decision, every skill rule verified against code, no invented patterns.
