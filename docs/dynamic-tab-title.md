# Dynamic browser tab title

## Pattern

```
{Section} – Birdeye
```

- **Context first, brand last** — mirrors Linear, Figma, Vercel.
- **En dash (`–`)** — not hyphen (`-`) or em dash (`—`). B2B SaaS standard.
- **Section granularity** — section-level for now (no named entities in routing yet). Upgrade to entity-level (e.g. a specific contact name) when real URL routing is added.

## Source of truth

`src/app/appViewTitle.ts` — `getAppViewTitle(view: AppView)` maps each route to a section label for **authenticated** tabs. For **unauthenticated** (sign-in shell), the same file exports `LOGIN_TAB_TITLES` (25 rotating phrases). The active index is stored in `sessionStorage` under `auth:login_tab_title_index` and advances on each sign-out.

`index.html` sets the initial `<title>` to `Welcome – Birdeye` so the first paint matches index `0` before React runs.

## Implementation

One `useEffect` in `App.tsx`, watching `isAuthenticated` and `currentView`:

```ts
useEffect(() => {
  if (!isAuthenticated) {
    document.title = LOGIN_TAB_TITLES[loginTabIndexFromSessionStorage];
    return;
  }
  document.title = `${getAppViewTitle(currentView)} – Birdeye`;
}, [isAuthenticated, currentView]);
```

(See `App.tsx` for index parsing, `auth:login_tab_title_index`, and sign-out increment.)

## Title reference

| AppView | Tab title |
|---|---|
| `agents-monitor`, `agents-builder`, `agent-detail`, `agents-analyze-performance`, `birdai-reports` | `BirdAI – Birdeye` |
| `agents-onboarding` | `BirdAI setup – Birdeye` |
| `inbox` | `Inbox – Birdeye` |
| `reviews` | `Reviews – Birdeye` |
| `social` | `Social – Birdeye` |
| `contacts` | `Contacts – Birdeye` |
| `listings` | `Listings – Birdeye` |
| `surveys` | `Surveys – Birdeye` |
| `ticketing` | `Ticketing – Birdeye` |
| `campaigns` | `Campaigns – Birdeye` |
| `insights` | `Insights – Birdeye` |
| `competitors` | `Competitors – Birdeye` |
| `dashboard`, `shared-by-me` | `Reports – Birdeye` |
| `business-overview` | `Overview – Birdeye` |
| `referrals` | `Referrals – Birdeye` |
| `payments` | `Payments – Birdeye` |
| `appointments` | `Appointments – Birdeye` |
| `scheduled-deliveries`, `schedule-builder` | `Scheduled deliveries – Birdeye` |

## Future upgrade

When real URL routing (React Router / TanStack Router) is added, switch to entity-level titles for detail views:

```
Acme Corp · Contacts – Birdeye
ENG-123 Fix login bug · Ticketing – Birdeye
```
