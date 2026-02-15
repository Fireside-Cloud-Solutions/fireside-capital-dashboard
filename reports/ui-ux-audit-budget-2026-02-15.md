# UI/UX Audit: Budget (budget.html)
**Date:** February 15, 2026, 7:25 AM  
**Auditor:** Capital (Builder sub-agent)  
**Page:** budget.html (Budget Planning & Assignment)  
**Status:** Audit Complete — 6 Issues Identified

---

## Executive Summary
Conducted comprehensive UI/UX audit of the Budget page. Found **6 issues**, including the same systemic problems (z-index, inline CSS duplication, modal trap, skeleton loaders) plus a **critical button hierarchy violation** with two adjacent `btn-secondary` buttons.

---

## Issues Identified

### 🚨 ISSUE 1: Z-Index Conflict - Mobile Hamburger Menu [CRITICAL - P0]
**Location:** Inline `<style>` block, line ~43  
**Problem:** Hamburger menu uses `z-index: var(--z-modal)` (400) which conflicts with modal overlays

**Status:** ❌ **SAME AS ALL OTHER PAGES** (systemic issue)  
**Fix:** Change to `z-index: var(--z-sticky)` (200)  
**Effort:** 1 minute (global find-replace)

**Work Item:** BUG-UI-NAV-001 (already documented)

---

### 🚨 ISSUE 2: Button Hierarchy Violation - Dual Secondary Buttons [HIGH - P1]
**Location:** Page header actions (lines ~125-136)  
**Problem:** Two adjacent buttons both use `btn-secondary` (blue), violating design hierarchy

**Current State:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn">
    <i class="bi bi-magic"></i> Generate Budget
</button>
<button class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
    <i class="bi bi-plus-circle"></i> Add Item
</button>
```

**Problem:** Both buttons are blue — no visual hierarchy. Users don't know which is the primary action.

**Expected Pattern:**
- **Primary action** (Add Item) → `btn-primary` (orange)
- **Secondary action** (Generate Budget) → `btn-secondary` (blue)

**Rationale:** "Add Item" is the manual, intentional action. "Generate Budget" is a utility/automation feature.

**Fix:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn">
    <i class="bi bi-magic"></i> Generate Budget
</button>
<button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
    <i class="bi bi-plus-circle"></i> Add Item
</button>
```

**Effort:** 2 minutes

**Work Item:** BUG-UI-BTN-003: Budget Page Button Hierarchy Violation

---

### ⚠️ ISSUE 3: Password Reset Modal Traps Users [MEDIUM - P2]
**Location:** `#resetPasswordModal` (line ~325)  
**Problem:** Static backdrop prevents closing modal — users stuck if error occurs

**Status:** ❌ **SAME AS ALL OTHER PAGES** (systemic issue)  
**Fix:** Add Cancel button to modal footer  
**Effort:** 2 minutes (global fix)

**Work Item:** BUG-UI-MODAL-001 (already documented)

---

### ⚠️ ISSUE 4: Inline Critical CSS Duplication [MEDIUM - P2]
**Location:** `<style>` block in `<head>` (lines 31-69)  
**Problem:** 39 lines of identical inline CSS in all 11 HTML files

**Status:** ❌ **SAME AS ALL OTHER PAGES** (systemic issue)  
**Fix:** Extract to `app/assets/css/critical.css`  
**Effort:** 15 minutes (global fix)

**Work Item:** BUG-UI-CSS-001 (already documented)

---

### ⚠️ ISSUE 5: Missing Skeleton Loaders [MEDIUM - P2]
**Location:** Summary cards, budget table  
**Problem:** No loading states — users see blank page while data loads

**Current State:**
- Summary cards show "$0.00" until data loads (looks like no data vs still loading)
- Budget table shows empty `<tbody>` until budgets load from Supabase
- Month selector shows "Loading..." but no skeleton for cards/table

**Expected Behavior:**
- Show skeleton loaders for:
  - 4 summary cards (Expected Income, Assigned, Spent, Remaining to Budget)
  - Budget table (5-7 skeleton rows)

**Impact:** Poor perceived performance — users think page is broken or slow

**Effort:** 30 minutes

**Work Item:** BUG-UI-LOAD-002: Budget Page Missing Skeleton Loaders

---

### ISSUE 6: Tooltip Dependency Missing [LOW - P3]
**Location:** Generate Budget button (line ~126)  
**Problem:** Tooltip uses Bootstrap's `data-bs-toggle="tooltip"` but Bootstrap tooltips are **not initialized by default**

**Current State:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn" 
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom"
        title="Auto-generate budget based on your bills and income">
```

**Problem:** Without JavaScript initialization, tooltip won't work:
```js
// Required in app.js or budget-specific JS:
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
```

**Impact:** Tooltip doesn't appear, reducing feature discoverability

**Fix:**
1. Add tooltip initialization to `app.js` (global solution)
2. OR: Add `initTooltips()` function to budget page JS

**Effort:** 5 minutes

**Work Item:** BUG-UI-TOOLTIP-001: Bootstrap Tooltips Not Initialized

---

## Page-Specific Strengths

### ✅ Excellent Features
1. **Month Navigation** — Previous/Next month buttons with current month display
2. **Auto-Generation** — "Generate Budget" creates budget from bills/income
3. **Funding Status** — Shows whether each item is funded/underfunded
4. **Remaining to Budget** — Real-time calculation of unassigned funds
5. **Column Width Control** — Custom `col-width-*` classes for table layout

### ✅ Good Accessibility
- Proper ARIA labels on navigation buttons (`aria-label="Previous month"`)
- `<caption class="visually-hidden">` on budget table
- Semantic HTML (`<main>`, `<thead>`, `<tbody>`)
- Skip link for keyboard users

### ✅ Responsive Design
- Summary cards stack on mobile (`.row g-3 g-xl-4`)
- Table horizontal scroll on small screens (`.table-responsive`)
- Fixed positioning for auth state (prevents layout shift)

---

## Issues Summary Table

| ID | Priority | Type | Title | Effort | Status |
|----|----------|------|-------|--------|--------|
| 1 | P0 | Bug | Z-Index Conflict - Mobile Hamburger Menu | 1 min | Global issue |
| 2 | P1 | Bug | Button Hierarchy Violation (Dual Secondary) | 2 min | **NEW** |
| 3 | P2 | Bug | Password Reset Modal Traps Users | 2 min | Global issue |
| 4 | P2 | Chore | Inline Critical CSS Duplication | 15 min | Global issue |
| 5 | P2 | Feature | Missing Skeleton Loaders | 30 min | **NEW** |
| 6 | P3 | Bug | Tooltip Dependency Missing | 5 min | **NEW** |

**Total Issues:** 6  
**New Issues:** 3 (BUG-UI-BTN-003, BUG-UI-LOAD-002, BUG-UI-TOOLTIP-001)  
**Global Issues:** 3 (already documented)  
**Total Effort:** ~55 minutes (excluding global fixes)

---

## Recommendations

### Immediate Actions (This Sprint)
1. ✅ Fix ISSUE 2 (Button Hierarchy) — P1 HIGH — Design violation
2. ✅ Fix ISSUE 6 (Tooltip Init) — P3 LOW — Feature doesn't work

### Next Sprint
3. Fix ISSUE 5 (Skeleton Loaders) — P2 MEDIUM — Perceived performance

### Global Fixes (Apply to All Pages)
4. Fix ISSUE 1 (Z-Index) — P0 CRITICAL — Mobile nav broken
5. Fix ISSUE 3 (Modal Trap) — P2 MEDIUM — UX trap
6. Fix ISSUE 4 (Critical CSS) — P2 MEDIUM — Maintainability

---

## Comparison to Other Pages

| Issue | Dashboard | Assets | Trans | Bills | Budget |
|-------|-----------|--------|-------|-------|--------|
| Z-Index Conflict | ❌ | ❌ | ❌ | ❌ | ❌ |
| Button Hierarchy | ❌ | ✅ | ❌ | ❌ | ❌ |
| Modal Trap | ❌ | ? | ? | ❌ | ❌ |
| Inline CSS Dup | ❌ | ❌ | ❌ | ❌ | ❌ |
| Skeleton Loaders | ✅ (fixed) | ? | ✅ (fixed) | ❌ | ❌ |
| Tooltip Init | ? | ? | ? | ? | ❌ |

**Pattern:** Button hierarchy violations are the most common page-specific issue (4 pages affected).

---

## Next Audit Target
**Page:** `debts.html` (Debts page)  
**Expected Issues:** Same systemic issues, likely button hierarchy violations

---

## Azure DevOps Work Items (To Be Created)

### Bugs
1. **BUG-UI-BTN-003: Budget Page Button Hierarchy Violation**
   - Area: UI/UX
   - Priority: 1 (High)
   - Description: See ISSUE 2 above
   - Acceptance Criteria:
     - "Add Item" button uses btn-primary
     - "Generate Budget" button uses btn-secondary
     - Visual hierarchy is clear

2. **BUG-UI-LOAD-002: Budget Page Missing Skeleton Loaders**
   - Area: UI/UX
   - Priority: 2 (Medium)
   - Description: See ISSUE 5 above
   - Acceptance Criteria:
     - Summary cards show skeleton loaders while data loads
     - Budget table shows 5-7 skeleton rows
     - Month selector shows skeleton while loading

3. **BUG-UI-TOOLTIP-001: Bootstrap Tooltips Not Initialized**
   - Area: UI/UX
   - Priority: 3 (Low)
   - Description: See ISSUE 6 above
   - Acceptance Criteria:
     - Tooltips work on all pages that use `data-bs-toggle="tooltip"`
     - Generate Budget button tooltip appears on hover

---

**Audit Complete**  
**Pages Audited:** 5 of 11 (Dashboard, Assets, Transactions, Bills, Budget)  
**Pages Remaining:** 6 (debts.html, income.html, investments.html, reports.html, settings.html, friends.html)  
**Progress:** 45% complete

**Next Sprint:** Continue audit of debts.html
