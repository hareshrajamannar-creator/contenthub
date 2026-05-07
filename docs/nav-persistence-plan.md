# Nav Persistence Plan — L1 + L2 State Across Refresh

> **Goal:** After a page refresh the app reopens on the same L1 product and the same L2 sub-nav item the user was on. No extra network calls; purely client-side `sessionStorage`.

---

## 1. Problem Statement

| State | Current behaviour | Target behaviour |
|---|---|---|
| L1 product (`currentView`) | Always resets to `"agents-monitor"` | Restores last product visited |
| L2 active item (Contacts, SearchAI) | Already lifted to App.tsx — resets on refresh | Restore from sessionStorage |
| L2 active item (Reviews, Inbox, Listings, Surveys, Ticketing, Campaigns, Competitors, Appointments, Agents) | Owned internally by each L2 panel — resets on refresh | Restore from sessionStorage (lift or hook) |

---

## 2. Storage Strategy

### Why `sessionStorage` (not `localStorage`)

| | sessionStorage | localStorage |
|---|---|---|
| Survives refresh | ✅ | ✅ |
| Clears on tab close | ✅ (desired — fresh start each session) | ❌ (stale state across days) |
| Per-tab isolation | ✅ | ❌ (shared across tabs) |

### Key schema

```
nav:l1                → AppView string          e.g. "reviews"
nav:l2:contacts       → string                  e.g. "all"
nav:l2:searchai       → string                  e.g. "visibility/ChatGPT"
nav:l2:agents         → string                  e.g. "agent-slug/review-responder"
nav:l2:agents:analyze → string                  e.g. "overview"
nav:l2:reviews        → string                  e.g. "all"
nav:l2:inbox          → string                  e.g. "standalone/All messages"
nav:l2:listings       → string                  e.g. "locations"
nav:l2:surveys        → string                  e.g. "active"
nav:l2:ticketing      → string                  e.g. "open"
nav:l2:campaigns      → string                  e.g. "campaigns"
nav:l2:competitors    → string                  e.g. "overview"
nav:l2:appointments   → string                  e.g. "calendar"
```

---

## 3. Core Primitive — `usePersistedState`

A single hook replaces `useState` wherever state needs to survive a refresh.

```ts
// src/app/hooks/usePersistedState.ts

import { useState, useEffect } from "react";

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  storage: Storage = sessionStorage,
): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = storage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // storage quota exceeded — silently skip
    }
  }, [key, value, storage]);

  return [value, setValue];
}
```

**Usage is identical to `useState` — just swap the import.**

---

## 4. Implementation Plan

### Step 1 — L1 (`currentView`) in App.tsx

```diff
- const [currentView, setCurrentView] = useState<AppView>("agents-monitor");
+ const [currentView, setCurrentView] = usePersistedState<AppView>("nav:l1", "agents-monitor");
```

**Done.** Refresh lands on the same product.

---

### Step 2 — L2 panels already controlled in App.tsx

Two panels are already controlled: **Contacts** and **SearchAI**. Same swap:

```diff
- const [contactsL2Active, setContactsL2Active] = useState(CONTACTS_L2_KEY_ALL);
+ const [contactsL2Active, setContactsL2Active] = usePersistedState("nav:l2:contacts", CONTACTS_L2_KEY_ALL);

- const [searchAIL2Active, setSearchAIL2Active] = useState(SEARCH_AI_L2_DEFAULT_ACTIVE);
+ const [searchAIL2Active, setSearchAIL2Active] = usePersistedState("nav:l2:searchai", SEARCH_AI_L2_DEFAULT_ACTIVE);
```

Also persist agent slug and analyze item:

```diff
- const [selectedAgentSlug, setSelectedAgentSlug] = useState<string>("");
+ const [selectedAgentSlug, setSelectedAgentSlug] = usePersistedState<string>("nav:l2:agents", "");

- const [selectedAnalyzeItem, setSelectedAnalyzeItem] = useState<string>("overview");
+ const [selectedAnalyzeItem, setSelectedAnalyzeItem] = usePersistedState<string>("nav:l2:agents:analyze", "overview");
```

---

### Step 3 — Self-owned L2 panels

These panels own their `activeItem` state internally. Two options:

#### Option A — In-place hook swap (less code, no API change) ✅ Recommended

For each panel, replace `useState` with `usePersistedState`:

| Panel | File | Key |
|---|---|---|
| `ReviewsL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:reviews"` |
| `InboxL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:inbox"` |
| `ListingsL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:listings"` |
| `SurveysL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:surveys"` |
| `TicketingL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:ticketing"` |
| `CampaignsL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:campaigns"` |
| `CompetitorsL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:competitors"` |
| `AppointmentsL2NavPanel` | `Sidebar.v2.tsx` | `"nav:l2:appointments"` |
| `AgentsL2NavPanel` | `AgentsL2NavPanel.v1.tsx` | already lifted above |

For panels that don't expose `activeItem` as a prop, the in-place swap is:

```diff
- const [activeItem, setActiveItem] = useState("standalone/All messages");
+ const [activeItem, setActiveItem] = usePersistedState("nav:l2:inbox", "standalone/All messages");
```

#### Option B — Lift to App.tsx + pass as props

Lift every `activeItem` into App.tsx (like Contacts and SearchAI are already), pass them down via props. More consistent long-term but requires more prop threading. Suitable if we ever need to programmatically change L2 from outside the panel.

**Recommendation: Option A for now.** The panels are already self-contained; the hook keeps changes minimal and local.

---

### Step 4 — Reset on view change (keep existing behaviour)

The existing `useEffect` that resets L2 state when `currentView` changes should be **kept** for controlled panels (Contacts, SearchAI). For self-owned panels, their state is not reset on view change today — no change needed.

```ts
// App.tsx — existing, keep as-is
useEffect(() => {
  if (currentView !== "contacts") {
    setContactsL2Active(CONTACTS_L2_KEY_ALL);
    // ...
  }
}, [currentView]);
```

---

## 5. Files Changed

| File | Change |
|---|---|
| `src/app/hooks/usePersistedState.ts` | **New** — core primitive |
| `src/app/App.tsx` | Replace 4 `useState` calls with `usePersistedState` |
| `src/app/components/Sidebar.v2.tsx` | Replace ~8 internal `useState` calls in L2 panels |
| `src/app/components/AgentsL2NavPanel.v1.tsx` | Check if slug/analyze already lifted; if not, add hook |

---

## 6. Edge Cases

| Scenario | Handling |
|---|---|
| Stored `nav:l1` value is no longer a valid `AppView` (e.g. after code change) | `usePersistedState` returns stored value as-is; `hasOwnL2Panel()` and the render switch have a final `else` → `<Dashboard>` fallback. Safe. |
| Stored L2 key no longer exists in the nav tree | The panel renders nothing active; first click resets to a valid key. Acceptable. |
| User opens app in two tabs | Each tab has its own `sessionStorage` — no cross-tab interference. |
| Storage quota exceeded | `try/catch` in `usePersistedState` silently skips writes; read always returns default. |
| Sign-out | Call `sessionStorage.clear()` (or remove only `nav:*` keys) in the `signOut` callback. |

---

## 7. Checklist

- [ ] Create `src/app/hooks/usePersistedState.ts`
- [ ] App.tsx: `currentView` → `usePersistedState`
- [ ] App.tsx: `contactsL2Active`, `searchAIL2Active`, `selectedAgentSlug`, `selectedAnalyzeItem` → `usePersistedState`
- [ ] Sidebar.v2.tsx: 8 internal L2 `activeItem` states → `usePersistedState`
- [ ] AgentsL2NavPanel: verify slug/analyze state is lifted; add hook if needed
- [ ] Sign-out: clear `nav:*` keys from sessionStorage
- [ ] Test: refresh on each product → lands on same L1 + same L2 item
- [ ] Test: open two tabs → no cross-tab bleed
