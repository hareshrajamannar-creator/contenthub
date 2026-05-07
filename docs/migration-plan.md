# UI Migration Plan: UI-web-2.0 → birdeyev2 Prototype

> **Goal:** Build a fully navigable, high-fidelity prototype covering every major Birdeye product — on the birdeyev2 design system, verifiable in Storybook, zero API dependencies.

---

## 1. Source Repository: What UI-web-2.0 Is

| Fact | Detail |
|---|---|
| Repo | `birdeyeinc/UI-web-2.0` — private, 857 MB, actively maintained (last pushed Apr 14 2026) |
| Framework | React 17, Webpack 5 Module Federation (microfrontend host) |
| State | Redux 3.7 + redux-saga + reselect |
| Styling | SCSS + CSS Modules + Emotion + styled-components (mixed) |
| Component library | `@birdeye/elemental` — Birdeye's own in-house library (not shadcn, not MUI) |
| Routing | react-router-dom v6 |
| Storybook | Lives in the separate `elemental` repo, not in UI-web-2.0 |
| Key deps | Highcharts, GrapesJS (email builder), XYFlow (workflow canvas), TipTap, Firebase, Stripe |

### Microfrontend Architecture

UI-web-2.0 is the **host**. Several products are deployed as independent MFE remotes:

```
UI-web-2.0 (host)
├── InsightMfe          → micro-dashboard-utils repo
├── SocialMfe           → social MFE repo
├── MicroCompetitors    → competitors MFE repo
├── MicroSearchAi       → search AI MFE repo
└── ContentHubMfe       → content-hub-app repo
```

> **Implication:** Social, Competitors, SearchAI, and ContentHub code lives in separate repos — not inside UI-web-2.0 itself.

---

## 2. Critical Constraint: Nothing Drop-In

`@birdeye/elemental` uses SCSS + CSS Modules. birdeyev2 uses Tailwind + shadcn-style `ui/` primitives. **These are incompatible.**

**Migration approach per product:**
1. Read the source view + containers in UI-web-2.0 (or its MFE remote)
2. Identify the key UI patterns (table? card grid? split pane? wizard? calendar?)
3. Map each elemental component to its birdeyev2 `ui/` equivalent (see §5)
4. Mock all data inline — no Redux, no API calls
5. Wire the view into App.tsx `currentView` switch
6. Add a Storybook story
7. Verify light + dark mode in Storybook

---

## 3. Current State of birdeyev2

### Storybook coverage

| Layer | Total | With stories | Missing |
|---|---|---|---|
| UI primitives (`ui/`) | 58 | 49 (84%) | 9 |
| Product views | 14 | 9 (64%) | 5 |
| Design system docs | 4 | 4 | — |
| Layout / navigation | 5 | 5 | — |
| Auth / settings | 3 | 3 | — |
| Copy / content | 3 | 3 | — |
| **Total stories** | **73** | — | — |

### Product views: built vs placeholder

| Product | Current state | Source location in UI-web-2.0 |
|---|---|---|
| Agents / BirdAI | ✅ Full | `pages/workflows/` (XYFlow canvas) |
| Inbox | ✅ Full | `pages/messenger/`, `pages/messengerV2/` |
| Reviews | ✅ Full | `pages/reviews/` |
| Contacts | ✅ Full | `pages/contacts/` |
| SearchAI / Insights | ✅ Full | `pages/searchAI/`, `pages/insights-ai/` + MFE remote |
| Social | ✅ Migrated | `pages/social/` + Social MFE remote |
| Listings | ✅ Migrated | `pages/listingsV2/` |
| Surveys | ✅ Migrated | `pages/surveys/` |
| Ticketing | ✅ Migrated | `pages/ticketing/` |
| Campaigns | ✅ Migrated | `pages/campaigns/`, `pages/campaignsAI/` |
| Competitors | ✅ Migrated | Competitors MFE remote (built from product knowledge) |
| Referrals | ✅ Migrated | `pages/referral/` |
| Payments | ✅ Migrated | `pages/payments/` |
| Appointments | ✅ Migrated | `pages/appointments/` |

---

## 4. What Each Source Product Contains

| Product | Key source files | UI patterns to migrate |
|---|---|---|
| **Reviews** | ReviewActions, ReviewReducer, ReviewSaga; subfolders: ai-directives, messages, competitor | Review cards, star rating filters, AI response panel, competitor comparison |
| **Social** | SocialSaga; subfolders: publishPhoenix, engagePhoenix, approvals, benchmark, LinkInBio, responseTemplates | Content calendar, post composer, approval queue, engagement feed |
| **SearchAI** | SearchAIActions; subfolders: accuracy, citations, rankingBrand, rankingLocal, sentiment, visibility | Ranking tables, citation cards, sentiment charts, visibility scorecard |
| **Payments** | PaymentsContainer, PaymentsSaga; subfolders: PaymentDetails, PaymentsInvoice, PaymentsRefund | Invoice list, payment detail sheet, refund flow |
| **Appointments** | AppointmentsContainer.tsx; subfolders: appointmentDetail, AppointmentsSchedule, CalendarEvents | Calendar view, appointment list, booking detail |
| **Referrals** | ReferralActions, ReferralView, ReferralTables | Referral stat cards, leaderboard table, invite flow |
| **Listings** | subfolders: listing-site, localseo, scanResults, duplicateSuppression, ai-recommendations | Scan results table, SEO score cards, duplicate suppression list |
| **Surveys** | subfolders: design, distribute, reports, response, viewMode | Survey builder (design tab), distribution settings, response table, charts |
| **Ticketing** | ServiceView, TicketingRouter, newTicket | Ticket list, ticket detail split view, create ticket form |
| **Campaigns** | enterprise subdir; campaignsAI: redux/, pages/, components/ | Campaign list, AI campaign wizard, performance charts |
| **Competitors** | Competitors MFE remote | Comparison tables, benchmark charts, location breakdown |

---

## 5. Component Mapping: elemental → birdeyev2 `ui/`

| `@birdeye/elemental` | birdeyev2 `ui/` equivalent | Status |
|---|---|---|
| `<Button>` | `button` | ✅ Available + story |
| `<Modal>` | `dialog` | ✅ Available + story |
| `<SideDrawer>` | `sheet` | ✅ Available + story |
| `<Table>` | `table` | ✅ Available + story |
| `<Select>` | `select`, `command` | ✅ Available + story |
| `<Tabs>` | `tabs` | ✅ Available + story |
| `<Avatar>` | `avatar` | ✅ Available + story |
| `<Badge>` / `<Chip>` | `badge` | ✅ Available + story |
| `<Tooltip>` | `tooltip` | ✅ Available + story |
| `<Pagination>` | `pagination` | ✅ Available + story |
| `<Toggle>` | `switch`, `toggle` | ✅ Available + story |
| `<DatePicker>` | `calendar` + `popover` | ✅ Available + story |
| `<Skeleton>` | `skeleton` | ✅ Available + story |
| `<GraphTable>` / Highcharts | `chart` (Recharts wrapper) | ✅ Available + story |
| `<WorkflowCanvas>` (XYFlow) | `AgentsBuilderView` | ✅ Already built |
| `<Accordion>` | `accordion` | ✅ Available + story |
| `<RadioGroup>` | `radio-group` | ✅ Available + story |
| `<Checkbox>` | `checkbox` | ✅ Available + story |
| `<Input>` | `input` | ✅ Available + story |
| `<Textarea>` | `textarea` | ✅ Available + story |
| `<Progress>` | `progress` | ✅ Available + story |
| `<RichTextEditor>` (TipTap) | `textarea` | ⚠️ Approximation only |
| `<EmailCreator>` (GrapesJS) | — | ❌ Out of scope for prototype |
| Complex date-range picker | `calendar` + `popover` | ⚠️ Approximation |

---

## 6. Storybook Gaps to Fill Alongside Migration

### UI primitives with no story (9)

Add a story as each primitive gets used in a migrated view:

| Primitive | Used in / relevant to |
|---|---|
| `chat-container` | Inbox, Myna chat |
| `code-block` | Reports, developer settings |
| `drawer` | Mobile patterns |
| `file-upload` | Contacts import, settings |
| `markdown` | Surveys, campaign content |
| `prompt-suggestion` | SearchAI, BirdAI prompt input |
| `scroll-button` | Long lists, content calendar |
| `text-shimmer` | Loading states across all views |
| `thinking-bar` | BirdAI / AI response states |

### Product views with no story (5)

Add a story when the view is built or migrated:

| View | Story to add |
|---|---|
| `SocialView` | `App/Views/SocialView` |
| `SearchAIView` | `App/Views/SearchAIView` |
| `AgentDetailView` | `App/Views/AgentDetailView` |
| `AgentOnboardingView` | `App/Views/AgentOnboardingView` |
| `AnalyzePerformanceView` | `App/Views/AnalyzePerformanceView` |

---

## 7. Migration Order

Ordered by: **complexity (low → high)** × **prototype value (high → low)**.

| # | Product | Complexity | Key UI patterns | Source |
|---|---|---|---|---|
| 1 | **Referrals** | Low | Stat cards, leaderboard table, invite CTA | `pages/referral/` |
| 2 | **Payments** | Low | Invoice list, payment detail `Sheet`, refund dialog | `pages/payments/` |
| 3 | **Appointments** | Low–Med | `calendar`, appointment list, booking detail | `pages/appointments/` |
| 4 | **Surveys** | Medium | Tabs (design/distribute/results), response table, charts | `pages/surveys/` |
| 5 | **Ticketing** | Medium | Ticket list + detail split pane, create ticket `Sheet` | `pages/ticketing/` |
| 6 | **Listings** | Medium | Scan results table, SEO score cards, multi-tab | `pages/listingsV2/` |
| 7 | **Competitors** | Medium–High | Comparison tables, benchmark charts | MFE remote |
| 8 | **Social** | High | Content calendar, post composer, approval queue | MFE remote + `pages/social/` |
| 9 | **Campaigns** | High | Campaign list, AI wizard, performance charts | `pages/campaigns/`, `campaignsAI/` |

---

## 8. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Tech stack incompatible — elemental/SCSS vs Tailwind/shadcn | **High** | Certain | Treat source as reference only; never import elemental or SCSS |
| MFE remotes (Social, Competitors, SearchAI) require separate repo access | **High** | High | Clone those repos; scope migration to 2–3 key screens per product |
| Redux/API coupling makes UI logic hard to extract | **Medium** | High | Strip all data-fetching; replace with static mock objects |
| Visual drift from production Birdeye app | **Medium** | Medium | Use Figma (Aero node `238:759`) as layout ground truth; source code for data shape only |
| Scope creep — 9 products × multiple screens each | **Medium** | High | Time-box each product; one primary screen + one detail view per sprint |
| Missing design tokens causing visual inconsistency | **Low** | Low | Follow `theme.css` semantic tokens; verify every view in Storybook light + dark |
| elemental components with no birdeyev2 equivalent (email builder, rich canvas) | **Low** | Low | Mark as out-of-scope for prototype; use textarea approximation |

---

## 9. Success Criteria

### Per product view
- [ ] Real UI replacing `<Dashboard>` placeholder
- [ ] Light + dark mode parity
- [ ] Storybook story added (`App/Views/{Product}`)
- [ ] All data mocked inline (zero API/Redux dependencies)
- [ ] Navigates correctly from L1 rail → L2 nav → content

### Overall prototype
- [ ] All 9 placeholder product views replaced with real UI
- [ ] All 9 undocumented `ui/` primitives have Storybook stories
- [ ] All 5 undocumented product views have Storybook stories
- [ ] Every view uses Aero + `theme.css` semantic tokens exclusively
- [ ] Fully navigable end-to-end without dead ends
- [ ] Commits on `v2.x` branch per product shipped

---

## 10. Expected Outcome

| Outcome | Description |
|---|---|
| **High-fidelity prototype** | Every major Birdeye product navigable in one app shell — suitable for stakeholder demos, design reviews, and investor walkthroughs |
| **Design system validation** | birdeyev2's `ui/` primitives stress-tested against real product patterns; gaps identified and filled |
| **Storybook as single source** | 73 → ~87+ stories; every primitive and product view documented and verifiable in isolation |
| **Production migration roadmap** | The birdeyev2 codebase becomes the reference architecture for the eventual React 18 + Tailwind production migration away from UI-web-2.0 |
| **Reduced prototype build time** | Instead of building each screen from scratch, leverage existing source code as layout reference — estimated 60–70% faster than greenfield |

---

## 11. What We Are Not Doing

- ❌ Importing `@birdeye/elemental` components
- ❌ Copying SCSS stylesheets
- ❌ Wiring to real APIs or Redux store
- ❌ Building the email creator (GrapesJS) or audio waveform (Wavesurfer) features
- ❌ Implementing i18n / localization
- ❌ Full mobile responsive (desktop-first prototype only)

---

## 12. MFE Repo Access — Blocked / Pending

Some products live in separate MFE remote repos, not in UI-web-2.0. Source code for these cannot be read until repo access is confirmed.

| Product | Repo URL | Status |
|---|---|---|
| Social | Unknown — to be shared | ⏳ Pending access |
| Competitors | Unknown — to be shared | ⏳ Pending access |
| ContentHub / Campaigns | `https://github.com/birdeyeinc/content-hub` | ⏳ Pending access |
| SearchAI | Unknown — to be shared | ⏳ Pending (birdeyev2 already has SearchAIView — low priority) |

**Decision (2026-04-14):** Start with products 1–6 and 9 (all source available in UI-web-2.0). Revisit MFE repos when access is confirmed. Social and Competitors deferred to last.

---

## 13. TODO Tracker

Track each product migration here. Update status as work progresses.

### Migration status

| # | Product | Status | Branch | Story added | Notes |
|---|---|---|---|---|---|
| 1 | Referrals | ✅ Done | v2.4 | ✅ `App/Views/ReferralsView` | Source: `pages/referral/`. Stat cards + 3-tab table (Sent/Shared/Leads) + lead detail Sheet. |
| 2 | Payments | ✅ Done | v2.4 | ✅ `App/Views/PaymentsView` | Source: `pages/payments/`. Donut summary (Requested/Received/Not paid/Refunded) + 4 metric blocks + filterable transaction table with inline actions (cancel, mark-as-paid, refund, invoice Sheet). |
| 3 | Appointments | ✅ Done | v2.4 | ✅ `App/Views/AppointmentsView` | Source: `pages/appointments/`. Week/day calendar grid with time-positioned cards per provider + Schedule list table. Click-through to detail Sheet. |
| 4 | Surveys | ✅ Done | v2.4 | ✅ `App/Views/SurveysView` | Source: `pages/surveys/`. Listing table (name, type, status, sent, responses, completion bar, NPS score, owner). Row click → Reports Sheet with NPS breakdown, question bar charts, recent responses. |
| 5 | Ticketing | ✅ Done | v2.4 | ✅ `App/Views/TicketingView` | Source: `pages/ticketing/`. Inbox-style ticket feed with priority-coloured borders, status/source/assignee badges, bulk select (resolve/assign/close). Row click → conversation thread Sheet with reply composer. |
| 6 | Listings | ✅ Done | v2.4 | ✅ `App/Views/ListingsView` | Source: `pages/listingsV2/`. Summary tiles (Synced/Errors/Needs update/Not listed) + Locations tab (status, accuracy bar, issue count) + Sites tab (coverage bar, avg accuracy). Location row → per-site Sheet with issue details. |
| 7 | Competitors | ✅ Done | v2.4 | ✅ `App/Views/CompetitorsView` | Built from product knowledge (MFE repo inaccessible). Two-panel: competitor list (star ratings, trend indicators) + dashboard (rating BarChart, 6-month volume LineChart, sentiment breakdown cards, recent reviews table). |
| 8 | Social | ✅ Done | v2.4 | — | `SocialView.v1.tsx` already existed and was wired in App.tsx from prior session. No rebuild needed. |
| 9 | Campaigns | ✅ Done | v2.4 | ✅ `App/Views/CampaignsView` | Source: `pages/campaigns/enterprise/`. Two tabs: Campaigns (manual/one-time) + Automations (triggered/recurring). Table with type/status/medium badges, row click → detail Sheet (4 stat tiles + timeline + recipient activity). |

### Storybook gap status

| Component | Type | Status | Notes |
|---|---|---|---|
| `chat-container` | UI primitive | ⬜ Not started | Add when Inbox extended |
| `code-block` | UI primitive | ⬜ Not started | Add when Reports/dev views built |
| `drawer` | UI primitive | ⬜ Not started | Add when mobile patterns addressed |
| `file-upload` | UI primitive | ⬜ Not started | Add when Contacts import built |
| `markdown` | UI primitive | ⬜ Not started | Add when Surveys/Campaigns built |
| `prompt-suggestion` | UI primitive | ⬜ Not started | Add when SearchAI extended |
| `scroll-button` | UI primitive | ⬜ Not started | Add during any long-list view |
| `text-shimmer` | UI primitive | ⬜ Not started | Add as global loading pattern |
| `thinking-bar` | UI primitive | ⬜ Not started | Add when BirdAI extended |
| `SocialView` | Product view | 🔒 Blocked | Needs MFE repo access |
| `SearchAIView` | Product view | ⬜ Not started | View exists, needs story |
| `AgentDetailView` | Product view | ⬜ Not started | View exists, needs story |
| `AgentOnboardingView` | Product view | ⬜ Not started | View exists, needs story |
| `AnalyzePerformanceView` | Product view | ⬜ Not started | View exists, needs story |

### MFE repo access TODO

- [ ] Share Social MFE repo URL
- [ ] Share Competitors MFE repo URL
- [ ] Confirm access to `birdeyeinc/content-hub` (shared 2026-04-14, access TBC)
- [ ] Share SearchAI MFE repo URL (low priority — birdeyev2 already has SearchAIView)

---

---

## 14. One Design System Checklist

Apply this checklist to **every** migrated view before marking it ✅ Done.

### Tokens & colour
- [ ] All colours use `theme.css` semantic variables — `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-background`, `border-border`, `bg-primary`, `text-primary` etc.
- [ ] No hardcoded hex values except the brand blue (`#1E44CC` / `#2952E3`) where a semantic token does not exist yet
- [ ] Light mode and dark mode both visually correct — test in Storybook toolbar

### Typography
- [ ] Body text: `text-sm` (14px) or `text-[13px]` for dense tables
- [ ] Labels / metadata: `text-xs` (12px) or `text-[11px]` for sub-labels
- [ ] Headings: `text-[28px]` for stat numbers, standard Tailwind scale elsewhere
- [ ] No custom `font-family` — inherits from shell CSS

### Spacing
- [ ] 8px grid default: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `p-4`, `p-6`
- [ ] Dense tables: `py-3` row padding, `px-6` section padding
- [ ] No arbitrary spacing values unless genuinely necessary (`p-3`, `gap-3` avoided at layout level)

### Icons
- [ ] All icons from **Lucide** (`lucide-react`) — no emojis, no custom inline SVG unless Figma-exported
- [ ] `strokeWidth={1.6}` on every Lucide icon
- [ ] `absoluteStrokeWidth` added whenever icon is sized below 24px
- [ ] Icon size `14`–`16px` for inline use; `13px` for tight table/badge contexts

### Components
- [ ] Only `ui/` primitives used — `Button`, `Badge`, `Table`, `Tabs`, `Sheet`, `Card`, `Input`, `Progress`, `Tooltip`, etc.
- [ ] No `@birdeye/elemental` imports
- [ ] No inline `style={{}}` unless absolutely necessary (prefer Tailwind)

### Data
- [ ] All data is mocked inline — no `fetch`, no Redux, no API calls
- [ ] Mock data is realistic: real-looking names, dates, codes, percentages

### Storybook
- [ ] Story file created at `src/stories/{ProductName}View.stories.tsx`
- [ ] Story category: `App/Views/{ProductName}View`
- [ ] Story `parameters.layout: "fullscreen"`
- [ ] `docs.description.component` notes the source file in UI-web-2.0

### Accessibility
- [ ] Interactive rows / buttons have `onClick` handlers and visible focus style
- [ ] Icon-only buttons have `aria-label` or `<Tooltip>` for screen reader context
- [ ] Colour is not the sole differentiator (channel icons use both icon + label)

---

## Status key

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔵 | In progress |
| ✅ | Done |
| 🔒 | Blocked — waiting on external dependency |
| ⏳ | Pending — action required |

---

*Document owner: Balaji K · birdeyev2 / `docs/migration-plan.md` · Last updated 2026-04-14*
