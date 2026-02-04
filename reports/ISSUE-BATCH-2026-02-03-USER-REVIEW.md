# User Review Issues — February 3, 2026
**Reported by:** Matt (Founder)
**Source:** Screenshots + descriptions from user testing session
**Priority Triage:** Needed

---

## FC-029 | Header Welcome Button Broken (CRITICAL)
**Page:** All pages (global header)
**Priority:** P1 — Affects every page
**Screenshot:** Welcome, Matt button has broken styling — border/padding mismatch, doesn't look like a proper dropdown button
**Expected:** Clean dropdown button matching dark theme, consistent with notification bell icon
**Fix:** Audit `.page-header` button styles, ensure Welcome dropdown matches design tokens

---

## FC-030 | Dashboard Charts Render as Blank White Squares (CRITICAL)
**Page:** Dashboard
**Priority:** P1 — Core dashboard functionality broken
**Screenshot:** Asset Allocation and Debt-to-Income Ratio charts show blank white rectangles with broken image icons
**Details:** Charts scroll indefinitely, canvas elements not rendering
**Expected:** Pie/donut charts with proper dark theme backgrounds
**Fix:** Debug Chart.js canvas initialization, check for missing data/config, ensure dark background on chart containers

---

## FC-031 | Dashboard KPI Overload — Needs Redesign (HIGH)
**Page:** Dashboard
**Priority:** P2 — UX/Design
**Details:** Previous audit flagged too many KPIs on dashboard. Net Worth should be front and center as the hero metric. Secondary KPIs should move to Reports page.
**Expected:** 4-3-2-1 hierarchy per Researcher's UI patterns report:
- 4 hero metrics (Net Worth prominent)
- 3 supporting visuals
- 2 action items
- 1 insight/alert
**Fix:** Redesign dashboard layout, move non-essential KPIs to reports

---

## FC-032 | Inconsistent Action Button Sizes Across All Pages (HIGH)
**Page:** All pages with action buttons (Assets, Bills, Debts, Budget)
**Priority:** P2 — Visual consistency
**Screenshot:** Edit button (orange outline, larger) is much bigger than Delete button (smaller, different style). Share button is a third size.
**Expected:** All action buttons (share, edit, delete) should be identical size, uniform icon styling, consistent padding
**Fix:** Standardize `.btn-action` class — same dimensions (36x36 or 40x40), same border-radius, same icon size

---

## FC-033 | Debts Page Card Layout Needs Rework (HIGH)
**Page:** Debts (Financing & Payoff Tracking)
**Priority:** P2 — UX/Layout
**Screenshot:** Debt names truncated ("BMW PAY...", "CHEVY TA...") because action buttons (share, edit, delete) compete for space on the same row
**Expected Layout:**
```
┌─────────────────────────────────┐
│                    [☐] [✏] [🗑] │  ← action icons top-right
│ BMW PAYMENT                     │  ← full name, no truncation
│ [financing]  [4.1% APR]        │  ← tag + rate on same row below name
│                                 │
│ Progress                   60%  │
│ ████████████░░░░░░░░░░░░░░░░░  │
│ ...                             │
└─────────────────────────────────┘
```
**Fix:** Restructure card HTML — move action icons to top-right row, debt name gets full width below, tag+APR on third row

---

## FC-034 | Bills Page — Filter Buttons Don't Match + Blue Tags Unreadable (MEDIUM)
**Page:** Bills
**Priority:** P2 — Visual consistency
**Screenshot:** 
- "All Bills" button (dark, filled) and "Subscriptions Only" button (text-only, barely visible as a button) have completely different styles
- Blue "Shared" tags are too bright (#00bfff-ish) against dark background, low contrast text
**Expected:**
- Both filter buttons should use same button group style (pill/toggle pattern)
- "Shared" tags should use a muted color that's readable (e.g., design token secondary color with proper contrast)
**Fix:** 
1. Create `.btn-group-filter` component with active/inactive states
2. Change shared badge color to muted tone with WCAG-compliant contrast

---

## FC-035 | Bills Page — Top Card Stack Layout Issues (LOW)
**Page:** Bills
**Priority:** P3 — Visual polish
**Details:** Summary stat cards at top of Bills page feel stacked/cluttered. Two rows of 3 cards feels heavy.
**Expected:** Consider consolidating to single row of key metrics or using a more compact layout
**Fix:** Evaluate card consolidation or responsive grid adjustment

---

## FC-036 | Transactions Page — No Manual Transaction Entry (MEDIUM)
**Page:** Transactions
**Priority:** P2 — Missing feature
**Details:** No way to add a single transaction manually
**Expected:** "Add Transaction" button in page header that opens a form/modal for manual entry (date, description, amount, category, account)
**Fix:** Add "Add Transaction" button + modal form (follow existing modal patterns from Bills/Assets)

---

## FC-037 | Budget Page — Multiple Critical Issues (HIGH)
**Page:** Budget
**Priority:** P1 — Multiple broken/missing features
**Details:**
1. **Duplicate bills** — Same bills appear multiple times as table scrolls
2. **No month navigation** — Cannot switch between previous/current/future months
3. **No add item** — Cannot add budget line items
4. **Delete button styling** — Doesn't match share/edit button styling on other pages
**Expected:**
1. Each bill appears once
2. Month selector (< January 2026 >) with prev/next arrows
3. "Add Budget Item" button
4. Consistent button styling per FC-032
**Fix:** Debug data rendering (dedup), add month navigation component, add budget item form, standardize buttons

---

## Summary

| ID | Page | Issue | Priority | Type |
|----|------|-------|----------|------|
| FC-029 | Global | Welcome button broken | P1 | Bug |
| FC-030 | Dashboard | Charts blank white squares | P1 | Bug |
| FC-031 | Dashboard | KPI overload, needs redesign | P2 | Design |
| FC-032 | All | Action buttons inconsistent sizes | P2 | Bug |
| FC-033 | Debts | Card layout — names truncated | P2 | Design |
| FC-034 | Bills | Filter buttons + blue tags | P2 | Bug |
| FC-035 | Bills | Top card stack layout | P3 | Polish |
| FC-036 | Transactions | No manual transaction entry | P2 | Feature |
| FC-037 | Budget | Dupes, no month nav, no add, button style | P1 | Bug/Feature |

**P1 (Critical):** FC-029, FC-030, FC-037 (3 issues)
**P2 (High):** FC-031, FC-032, FC-033, FC-034, FC-036 (5 issues)
**P3 (Low):** FC-035 (1 issue)
