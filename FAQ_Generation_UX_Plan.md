# Generate FAQ — UX Analysis & Screen-by-Screen Plan

**Based on:** Generate FAQ Copilot UX PRD v3 (April 2026)  
**UX principles:** Fewer steps, less visual noise, text-first controls, brand kit does the heavy lifting

---

## Part 1 — What the PRD gets right

The PRD's core insight is sound: **brand kit auto-fills everything except 3 things** (template, URL, count). The agent, tone, audience, reading level, blocked terms, approval workflow — all resolved without user input. That's a good foundation.

The 4-step input structure also makes logical sense as a *data model*: Template → Source → Goal → Output. The problem is not the logic but the *presentation*: icon-heavy cards, chip selectors, toggles, and separate screens for things that could share a surface.

---

## Part 2 — What to change and why

### Step reduction: 4 screens → 3 screens

Steps 3 (Goal & Audience) and 4 (Output & Publishing) are both mostly pre-filled. The only real decisions are: objective (3 options), FAQ count (one number), and destinations (a checklist). These take 45 seconds combined in the PRD's own timing estimate. There's no reason they occupy separate screens.

**Merged screen:** "Confirm — Goal + Output" becomes one surface with two sections. The user sets the objective, confirms count, picks destinations. Done.

### Visual noise reduction

| PRD approach | Proposed approach | Reason |
|---|---|---|
| 6 template cards with icons | Vertical radio list, text only | Icons don't add meaning here — the template name + one-line description is sufficient |
| Agent picker as a visible form control | Collapsed to a single text link: "Using Birdeye Standard FAQ Agent · Change" | 95% of users never change this — it should not occupy screen real estate |
| Objective as icon-chip row | 3 radio buttons | Chips imply selection within a tag cloud; radio makes the mutual exclusivity clear |
| Customer signal sources as toggle chips | Checkboxes | Chips suggest filtering; these are binary on/off — checkboxes are cleaner |
| Destination outputs as icon cards | Plain labeled checkboxes | Destinations are a checklist, not a gallery |
| Audience persona and tone as editable chips | Read-only labeled values with "from brand kit" note | These are locked; showing them as editable falsely implies the user should modify them here |
| Brand kit warning banner always shown | Only shown when brand kit is actually incomplete | Reduce ambient noise |

---

## Part 3 — The proposed flow

```
[Entry point]
     |
     v
[0] Prerequisite — brand + location         (skipped in project context; auto-resolved for single-brand workspaces)
     |
     v
[1] Template                                (5–10s)
     |
     v
[2] Source & Context                        (15–20s, content varies by template)
     |
     v
[3] Confirm — Goal + Output                 (20–30s, mostly review pre-filled values)
     |
     v
[4] Generation progress                     (30–90s, no decisions)
     |
     v
[5] Review & Edit                           (variable)
```

**SearchAI gap-fill path** collapses to a single confirmation screen (Step 0* below) before jumping straight to generation.

**Project context path** skips Screen 0 entirely.

---

## Part 4 — Screen-by-screen specification

---

### Screen 0 — Prerequisite (Brand + Location)

**Shown only for:** standalone asset creation (Path B). Skipped entirely when coming from a project, or when the workspace has exactly one brand + one location.

**Purpose:** Lock the brand context that feeds every downstream auto-fill.

**Layout:**

```
Which brand is this FAQ for?
[ Brand Kit dropdown — "Bright Smiles Dental" ]

Which location does this FAQ cover?
[ Location dropdown — "All locations" / specific location ]

[ Continue ]
```

**Rules:**
- Two fields, no more. No icons, no cards.
- If workspace has one brand: brand field pre-selected and not shown. If workspace has one location: location pre-selected and not shown. If both resolved: skip this screen entirely.
- Location selector is a searchable dropdown for multi-location workspaces.
- No back button (entry point is behind the user).

---

### Screen 1 — Choose a template

**Purpose:** Set the generation strategy. Most users will accept the default recommendation or pick from the list in under 10 seconds.

**Layout:**

```
What kind of FAQ do you need?

○  AEO Optimized  — recommended
   Maximize answer engine visibility with structured, snippet-ready FAQs

○  New Page FAQ Builder
   Build FAQs for a new or empty service page

○  Existing FAQ Optimizer
   Improve or expand FAQs your site already has

○  Customer Support FAQs
   Draw from reviews, tickets, and support history to answer real questions

○  Location-Specific
   Target FAQs to a specific location, hours, and local audience

○  Custom
   Configure every aspect of the generation yourself

                          Using Birdeye Standard FAQ Agent · Change

[ Cancel ]                                              [ Continue ]
```

**Rules:**
- No icons on template rows. Title + one-line description is enough.
- "AEO Optimized" pre-selected by default with "recommended" text label (not a badge chip).
- Agent line is plain text at the bottom right, below the list. Clicking "Change" expands an agent selector inline — a simple dropdown, no modal. This keeps the power-user control available without cluttering the screen for everyone else.
- No step counter yet (the flow has conditional branching and users don't need to know step totals).
- If user came from a SearchAI gap-fill: this screen is skipped — see Special Flows section.

---

### Screen 2 — Source & Context

**Purpose:** Tell the agent what to scrape, analyze, or draw from. This is the one screen where manual input is genuinely required.

**Content varies by template selected in Screen 1.**

---

**2A — AEO Optimized and New Page FAQ Builder:**

```
Which page should this FAQ be about?

[ https://brightsmiles.com/services/emergency-dental          ]
  We'll scan this page for services, topics, and existing content.

Any specific questions to prioritize?  (optional)
[ Textarea — "What to add? e.g. questions about pricing, parking..." ]

Also draw from connected sources:
[x] Customer reviews and ratings
[x] Search queries (Google Search Console)
[ ] Support tickets  Connect Intercom to use this

[ Back ]                                              [ Continue ]
```

---

**2B — Existing FAQ Optimizer:**

```
Where are your existing FAQs?

○  On a page — enter URL
   [ https://brightsmiles.com/faq ]

○  I'll paste them
   [ Textarea ]

○  Upload a file
   [ file input — .txt, .docx, .csv ]

What should we do with them?

○  Improve clarity and brand voice
○  Add missing topics and coverage gaps
○  Rewrite for a different audience

[ Back ]                                              [ Continue ]
```

---

**2C — Customer Support FAQs:**

```
Draw from these sources:

[x] Customer reviews and ratings
    Surfaced 47 high-frequency questions last 90 days
[x] Search queries (Google Search Console)
[ ] Support tickets  Connect Intercom to use this
[ ] Chat transcripts  Connect Zendesk to use this

Focus on a specific topic?  (optional)
[ e.g. "billing, refunds, appointment scheduling" ]

[ Back ]                                              [ Continue ]
```

---

**2D — Location-Specific:**

```
Which location?
[ Dropdown — pre-filled from prerequisite step ]

Any location-specific topics to prioritize?  (optional)
[ e.g. "parking, weekend hours, emergency walk-ins" ]

Also draw from:
[x] Customer reviews for this location
[x] Search queries for this location
[ ] Location's support tickets

[ Back ]                                              [ Continue ]
```

---

**Rules for Screen 2:**
- No icons on checkboxes or source rows. A simple "Connect [source] to use this" text note when a source is disconnected — not a chip or banner.
- URL field validates on blur; shows "We can't reach this URL — try a public URL or paste content manually" inline if unreachable.
- "Also draw from" section is shown only when at least one signal source is connected.
- Do not show all template variants at once. Render only the variant matching Screen 1's selection.

---

### Screen 3 — Confirm: Goal + Output

**Purpose:** Set objective and FAQ count. Confirm where results go. Almost everything is pre-filled.

**Layout:**

```
What's the main objective?

○  Increase visibility  — get found in search and AI answer engines
○  Deflect support questions  — help customers self-serve
○  Drive conversions  — move visitors toward a booking or purchase

How many FAQs?
[ — ] 12 [ + ]   (range 5–25)

Writing for:   Patients considering dental services   ·  from brand kit
Tone:          Warm, professional, compliant          ·  from brand kit

─────────────────────────────────────

Where should the results go?

[x] Content Hub library  (always included)
[x] SearchAI Recommendations  (auto-checked — objective is Visibility)
[x] Embed schema on page  (auto-checked — URL was provided)
[ ] Help center
[ ] Standalone page
[ ] Social posts from FAQs
[ ] Export as JSON

Schema markup:  JSON-LD (FAQPage)  — recommended for answer engines
Approval:  Requires team review before publishing  ·  from team settings

[ Back ]                                  [ Generate FAQs ]
```

**Rules:**
- Objective is 3 radio buttons. No icons, no chips.
- FAQ count is a stepper (+/-) with a number, not a slider. Sliders are imprecise for a specific integer count.
- Audience and Tone are read-only text with "· from brand kit" attribution. They are informational — the user confirmed these at brand kit setup. If brand kit is missing these, replace with editable text fields (same position, now showing placeholder text instead of locked value).
- Destinations are plain labeled checkboxes. No icons.
- Schema and Approval are single-line notes at the bottom of the destinations section — not separate form sections.
- "Generate FAQs" is the primary CTA. It is visually prominent. Cancel/Back is secondary.
- If brand kit is incomplete: show one inline note above the audience/tone rows: "Some brand kit fields are empty — we'll use sensible defaults. You can complete them in Brand Settings." No persistent warning banner.

---

### Screen 4 — Generation Progress

**Purpose:** Show the user what the agent is doing. This builds trust and prevents abandonment.

**Layout:**

```
Generating your FAQs

Emergency Dental FAQ Set  ·  AEO Optimized  ·  brightsmiles.com/services/emergency-dental

  Scanning brightsmiles.com/services/emergency-dental
  Found 3 services, 2 pricing mentions

  Mining customer signals from reviews and search queries
  Surfaced 47 high-frequency questions

  Researching authoritative answers via Perplexity
  Pulling top sources for "emergency dentist Dallas"...

  Pulling Google's People Also Ask questions
  Clustering and prioritizing top 12 questions
  Writing answers in your brand voice
  Optimizing for answer engines
  Generating schema markup

  ────────────────────────────────
  Estimated time remaining: 38s

[ Cancel ]
```

**Rules:**
- Each task row shows: completed (checkmark + result subtext) · active (task name + animated dots or spinner) · pending (task name, muted text color).
- Use Lucide `CheckCircle2` (strokeWidth 1.6) for completed, `Loader2` with spin animation for active. Pending rows: no icon, muted text. Three icon states maximum, kept small (14px).
- Subtext appears only after a task completes — keeps the screen from feeling overwhelming during generation.
- Estimated time updates dynamically.
- If a task fails: show "Could not complete — [Skip] [Retry]" inline on that row. No modal.
- Cancel is a text link, not a button. Destructive prominence is unnecessary here — accidental cancellations are bad.
- Do not show a progress bar percentage. The task list itself is the progress indicator.
- Layout: centered column, max-width ~560px. This is a "watch it work" moment — full-width would feel sparse.

---

### Screen 5 — Review & Edit

**Purpose:** Review generated FAQs, fix issues, publish. This is where users spend the most time.

**Header bar:**

```
← Back to Content Hub        Emergency Dental FAQ Set · 12 FAQs · Visibility

Set score: 89%  ·  10 ready to publish · 2 need review          [ Publish all ]
```

**Inline actions (below header, above FAQ list):**

```
Regenerate weak FAQs   ·   Reorder   ·   Add FAQ   ·   Export JSON
```

These are plain text links, no buttons, no icons.

**FAQ card:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  FAQ 1   ·   Editorial: 93%   ·   AEO: 89%                   Edit  │
├─────────────────────────────────────────────────────────────────────┤
│  Q: What qualifies as a dental emergency?                           │
│  A: A dental emergency includes severe tooth pain, knocked-out      │
│     teeth, abscesses, or uncontrolled bleeding...                   │
│                                                                     │
│  Compliance passed  ·  187 query coverage estimated                │
└─────────────────────────────────────────────────────────────────────┘
```

**FAQ card — with warning:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  FAQ 2   ·   Editorial: 78%   ·   AEO: 82%                   Edit  │
├─────────────────────────────────────────────────────────────────────┤
│  Set consistency: this says "all locations" but FAQ 9 says Plano    │
│  is closed weekends.   Review FAQ 9                                 │
│                                                                     │
│  Q: Do you offer same-day emergency appointments?                   │
│  A: Yes, we offer same-day emergency appointments at all...         │
└─────────────────────────────────────────────────────────────────────┘
```

**FAQ card — hard block:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  FAQ 3   ·   Editorial: 54%   ·   AEO: 71%                   Edit  │
├─────────────────────────────────────────────────────────────────────┤
│  Factual issue: claims "30 years of experience" but brand kit       │
│  shows 15 years. This FAQ is blocked from publishing.               │
│  Regenerate this FAQ                                                 │
│                                                                     │
│  Q: How long has your practice been open?                           │
│  A: Our practice has 30 years...                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Rules for FAQ cards:**
- No icons in the card body. Status is conveyed through text color and border: normal (no border change), warning (amber left border), hard block (red left border + blocked from publish).
- Scores shown as text, not progress bars or donut charts.
- Answer is truncated at 200 characters with a "show more" text link.
- AEO score only shown when objective = Visibility.
- "Edit" is a text link, right-aligned in the card header. No edit icon.

---

### Screen 5b — Individual FAQ Editor (slide-in from right)

Clicking Edit opens a panel that replaces or slides over the FAQ list.

**Layout:**

```
← Back to FAQ set                               Editorial: 78%

┌──────────────────────────────┬──────────────────────────────────────┐
│                              │  Content Hub Score                   │
│  Q: Do you offer same-day    │  Total  Brand  Fact  Read  Orig      │
│  emergency appointments?     │  78%    88%    70%   90%  88%        │
│                              │                                      │
│  [ edit question ]           │  Compliance: Passed                  │
│                              │  Set consistency warning:            │
│  A: Yes, we offer same-day   │  FAQ 9 contradicts this claim        │
│  emergency appointments at   │  about location coverage.            │
│  all our locations during    │  Review FAQ 9                        │
│  business hours...           │                                      │
│                              │  AEO Content Score                   │
│  [ edit answer ]             │  Answer-first: 82%                   │
│                              │  Snippet length: 85%                 │
│  Improve with AI:            │                                      │
│  Make more direct            │                                      │
│  Optimize for AEO            │                                      │
│  Shorten                     │                                      │
│  Lengthen                    │                                      │
│  More conversational         │                                      │
│  Add example                 │                                      │
│  Match brand voice           │                                      │
│  Improve clarity             │                                      │
│  Regenerate answer           │                                      │
│                              │                                      │
│  [ Save changes ]            │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

**Rules:**
- AI controls are plain text links in a vertical list. No icons on AI actions.
- Score panel is informational. It updates live as user edits or applies AI controls.
- AEO score section only shown when objective = Visibility.
- "Save changes" updates the FAQ set and returns to the review list.

---

## Part 5 — Special flows

### SearchAI gap-fill (fastest path)

When triggered from "Generate FAQs to fix this" in a SearchAI recommendation, all inputs are pre-resolved. The user sees a single confirmation screen, not the 3-step flow.

```
Generate 4 FAQs for your emergency dental page

These 4 high-value queries aren't covered:
· "emergency dentist open weekends"
· "dental emergency same day appointment"
· "knocked out tooth what to do"
· "emergency root canal cost"

Page:       brightsmiles.com/services/emergency-dental
Template:   AEO Optimized
Audience:   Patients considering dental services  ·  brand kit
Tone:       Warm, professional, compliant          ·  brand kit
Output:     SearchAI Recommendations + Content Hub library

Using Birdeye Standard FAQ Agent  ·  Change

[ Customize first ]                        [ Generate FAQs ]
```

One decision point: accept the pre-filled plan and generate, or customize first (which enters the 3-step flow at Screen 1 with everything pre-populated).

### Project flow

Coming from a project skips Screen 0 entirely. Brand kit and locations are already locked at project creation. The user lands directly on Screen 1.

---

## Part 6 — Step count comparison

| Flow | PRD steps | Proposed steps | Screens shown to user |
|---|---|---|---|
| Standalone, full flow | 0 + 1 + 2 + 3 + 4 | 0 + 1 + 2 + 3 | 4 (down from 5) |
| Project context | 1 + 2 + 3 + 4 | 1 + 2 + 3 | 3 (down from 4) |
| Single-brand workspace | 1 + 2 + 3 + 4 | 1 + 2 + 3 | 3 (down from 4) |
| SearchAI gap-fill | 0 + full flow | 1 confirmation | 1 (down from 5) |
| Existing page right-click | 1 + 2(pre-filled) + 3 + 4 | 1 + 2(pre-filled) + 3 | 3 (down from 4) |

Plus generation progress and review in all flows.

---

## Part 7 — Controls to remove entirely

These elements from the PRD have been removed or restructured:

**Template icon cards** → radio list. Icons on template names communicate nothing meaningful — the written description does the work.

**Agent picker as a visible card/select** → text link disclosure. The agent selection is a power-user feature. 95% of users should not see it as a form control.

**Chips for objectives (Visibility / Support / Conversion)** → radio buttons. Chips suggest these are toggleable tags. Radio makes the single-choice nature explicit.

**Chips/toggles for customer signal sources** → checkboxes. Clean and universally understood.

**Audience persona and tone as editable form fields** → read-only values with "from brand kit" label. If they're locked, don't style them as inputs.

**Destination icon cards** → checkboxes. A checklist should look like a checklist.

**FAQ count slider** → stepper (number + / - ). A slider is imprecise for a specific integer. The PRD's default is 12 and range is 5–25 — a stepper with visible increment/decrement handles this cleanly.

**Set score as a donut or bar chart** → plain percentage text. Scores are supplementary information on the review screen. They don't need chart chrome.

---

## Part 8 — Error and edge case handling

| Situation | How it surfaces |
|---|---|
| URL unreachable | Inline note below URL field on Screen 2: "We can't reach this URL. Try a public URL or paste your content below." |
| Zero services detected on page | Inline note: "We didn't find any services on this page — continue anyway, or try a different URL." No blocking gate. |
| Source not connected | Checkbox disabled, with text: "Connect Intercom to use this." Single click to connect. |
| Brand kit incomplete | One inline note on Screen 3 above audience/tone: "Some brand kit fields are empty — we'll use sensible defaults." |
| Requested count exceeds source coverage | Inline note after count stepper: "We found 18 high-value questions — generating 18 instead of 25." |
| Task failure during generation | Inline on that progress row: "[task name] failed — Retry / Skip" |
| All FAQs hard-blocked | Review screen shows error state with "Regenerate with stricter compliance" as the primary action. |

All errors surface inline, in context, where the problem is. No modals for validation errors.

---

## Part 9 — What stays from the PRD

These PRD decisions are good and should be kept:

**Smart defaults from brand kit.** Auto-filling tone, audience, reading level, approval workflow, and blocked terms is the right call. These should remain invisible unless incomplete.

**Template-driven task weighting.** The backend logic (which agent tasks run heavy vs. light per template) is sound. The UX simplification doesn't change this.

**Progress screen with task-level transparency.** Showing what the agent is actually doing builds trust. Keep the granular task list — just clean up the presentation.

**Per-FAQ scores.** Editorial + AEO scores per FAQ card are useful for prioritizing editing time. Keep them.

**Regenerate weak FAQs.** Set-level action that only re-runs poor-scoring FAQs is a smart UX pattern. Keep it.

**Auto-save every 10 seconds on review screen.** Critical for preventing lost work. Keep it.

**SearchAI gap-fill confirmation screen.** The compressed single-screen path for SearchAI-triggered flows is excellent. Keep it and make "Customize first" the escape hatch.
