# UI/UX Audit: Transactions Page
**Date:** 2026-02-14  
**Auditor:** Architect  
**Page:** app/transactions.html  
**Status:** ❌ Issues Found

---

## 🔍 Audit Results

### ✅ Strengths
- Good semantic HTML structure
- Accessibility features (aria-labels, form labels)
- Empty state implementation
- Filter controls are well-organized

### ❌ Issues Found

---

## Issue 1: Button Hierarchy Violation
**Severity:** Medium (P2)  
**Category:** Design Consistency  
**Location:** Line 110 — Sync from Bank button

### Problem
The "Sync from Bank" button uses `btn-secondary` when it should be the primary action on this page. This is the core functionality — importing transactions from Plaid.

**Current:**
```html
<button id="syncTransactionsBtn" class="btn btn-secondary">
```

**Expected:**
```html
<button id="syncTransactionsBtn" class="btn btn-primary">
```

### Impact
- Users may not recognize syncing as the most important action
- Violates established button hierarchy (FC-043 pattern)
- "Add Transaction" (manual entry) appears equally important visually

### Fix
Change sync button to `btn-primary` and ensure only ONE primary action exists per page.

**Work Item:** FC-128

---

## Issue 2: Missing Table Loading State
**Severity:** Medium (P2)  
**Category:** UX Polish — Perceived Performance  
**Location:** Line 203 — Transactions table tbody

### Problem
The table shows a generic spinner instead of skeleton loaders. Dashboard stat cards use skeleton loaders for better perceived performance (FC-056 established the pattern).

**Current:**
```html
<div id="loadingSpinner" class="text-center d-none">
  <div class="spinner-border text-primary" role="status">
```

**Expected:**
Create table skeleton loader with 5 shimmer placeholder rows showing:
- Date column (80px wide shimmer bar)
- Description column (200px wide shimmer bar)
- Category column (120px wide shimmer bar)
- Amount column (100px wide shimmer bar)
- Status column (80px wide shimmer bar)

### Impact
- Generic spinner feels slower than skeleton loaders
- Inconsistent with Dashboard loading pattern
- No visual anchor for users while data loads

### Fix
1. Create `.skeleton-table-row` component in components.css
2. Replace spinner with 5 skeleton rows
3. Match pattern from FC-056 (stat card skeletons)

**Work Item:** FC-129

---

## Issue 3: Status Column Not Implemented
**Severity:** Medium (P2)  
**Category:** Incomplete Feature  
**Location:** Line 200 — Table header "Status" column

### Problem
The table header declares a "Status" column but the data rendering logic doesn't populate it. This creates user confusion.

**Current:**
```html
<th>Status</th>
```

But transactions.js doesn't render any status data.

**Expected:**
Either:
- **Option A:** Implement status indicators (pending, cleared, failed, reconciled)
- **Option B:** Remove the column header entirely

### Impact
- Empty table column looks broken
- Users expect to see transaction status (pending vs. cleared is important)
- Plaid provides this data (`pending` field)

### Fix
Implement transaction status badges:
- 🟡 **Pending** — transaction not yet cleared
- 🟢 **Cleared** — transaction posted to account
- 🔴 **Failed** — transaction declined/reversed

Use Plaid's `pending` field + transaction date logic.

**Work Item:** FC-130

---

## Issue 4: No Pagination or Virtual Scrolling
**Severity:** High (P1)  
**Category:** Performance — Scalability  
**Location:** Entire table — no pagination controls

### Problem
If a user has 500+ transactions, the page will attempt to render all of them in the DOM at once. This will cause:
- Slow initial load
- Janky scrolling
- Memory bloat
- Poor mobile performance

**Current:**
No pagination footer, no "Load More" button, no virtual scrolling.

**Expected:**
Add pagination controls at bottom of table:
- Items per page selector (10 / 25 / 50 / 100)
- Page navigation (Previous / 1 2 3 ... 10 / Next)
- "Showing 1-25 of 347 transactions"

OR implement virtual scrolling (more complex).

### Impact
- **Critical:** App will be unusable with 1 year of daily transactions (365+ rows)
- Performance degrades linearly with data size
- Mobile devices will struggle with large DOMs

### Fix
Implement server-side pagination:
1. Add `?page=1&limit=25` query params
2. Supabase query with `.range()` pagination
3. Render pagination controls footer
4. Update URL on page change
5. Persist limit preference in localStorage

**Work Item:** FC-131

---

## Issue 5: Filters Missing Active State Indicator
**Severity:** Low (P3)  
**Category:** UX Polish — Visual Feedback  
**Location:** Lines 120-155 — Filter controls

### Problem
When filters are applied, there's no visual indication. Users can't tell at a glance if they're viewing filtered data or all transactions.

**Current:**
Filters apply silently, no badge or highlight.

**Expected:**
Add visual feedback:
- Badge count: "3 filters active"
- Highlight active filters (blue border)
- "Clear all filters" link becomes visible

### Impact
- Users may forget they have filters applied
- Confusion about why transactions aren't appearing
- Low discoverability of filter state

### Fix
1. Add filter badge: `<span class="badge bg-primary" id="activeFilterCount">3 filters active</span>`
2. Show/hide based on filter state
3. Add blue border to active filter inputs

**Work Item:** FC-132

---

## Issue 6: Auto-Categorize Button Hierarchy Unclear
**Severity:** Low (P3)  
**Category:** Design Decision  
**Location:** Line 114 — Auto-Categorize button

### Problem
The "Auto-Categorize Uncategorized" button uses `btn-outline-secondary`, making it visually weaker than "Add Transaction" (`btn-secondary`). But auto-categorization is arguably more important than manual entry for most users.

**Current:**
```html
<button id="autoCategorizeBtn" class="btn btn-outline-secondary ms-2">
```

**Questions:**
- Is auto-categorization a secondary or tertiary action?
- Should it be promoted to `btn-secondary`?
- Or is outline correct because it's an occasional action?

### Impact
- Unclear hierarchy may bury important feature
- Users may not discover auto-categorization

### Fix
**Decision Required:**
- If this is a core feature users should use regularly → `btn-secondary`
- If this is an occasional cleanup tool → keep `btn-outline-secondary`

Document the decision in design system.

**Work Item:** FC-133

---

## Issue 7: Mobile Filter Layout Not Optimized
**Severity:** Medium (P2)  
**Category:** Responsive Design  
**Location:** Lines 120-155 — Filter row

### Problem
Three-column filter layout (`col-md-4`) may stack awkwardly on mobile. No explicit mobile breakpoint styling.

**Current:**
```html
<div class="col-md-4">
  <label for="categoryFilter" class="form-label">Category</label>
  <select id="categoryFilter" class="form-select">
```

**Expected:**
Test on mobile (< 768px). Likely needs:
```html
<div class="col-12 col-md-4">
```

### Impact
- Filters may be cramped on mobile
- Poor touch target spacing
- Horizontal scroll risk

### Fix
1. Test on mobile device or responsive mode
2. Add `col-12` for mobile breakpoint
3. Verify filter buttons stack vertically on small screens

**Work Item:** FC-134

---

## Issue 8: Empty State CTA May Be Inconsistent
**Severity:** Low (P3)  
**Category:** UX Consistency  
**Location:** Line 218 — Empty state button

### Problem
Empty state button calls `openPlaidLink()` and uses `btn-primary`. Need to verify this triggers the SAME action as "Sync from Bank" button (line 110) for consistency.

**Current:**
```html
<button class="btn btn-primary" id="connectBankFromEmpty">
  <i class="bi bi-bank"></i> Sync from Bank
</button>
```

**Verify:**
- Does this open Plaid Link modal?
- Is it the same as clicking "Sync from Bank"?
- Or is it a new account connection flow?

### Impact
- If buttons do different things with same label → user confusion
- If they do the same thing → good consistency

### Fix
Review transactions.js to confirm both buttons trigger the same flow. If not, clarify button labels.

**Work Item:** FC-135

---

## Summary

| Priority | Count |
|----------|-------|
| P1 (High) | 1 |
| P2 (Medium) | 5 |
| P3 (Low) | 2 |
| **Total** | **8 issues** |

### Recommended Next Actions
1. **FC-131:** Implement pagination (P1 — blocking for scale)
2. **FC-128:** Fix button hierarchy (P2 — quick win)
3. **FC-129:** Add table skeleton loaders (P2 — UX polish)
4. **FC-130:** Implement status column (P2 — feature completion)
5. **FC-134:** Test mobile filter layout (P2 — responsive)

### Estimated Effort
- FC-131 (Pagination): 4-5 hours
- FC-128 (Button fix): 15 minutes
- FC-129 (Skeleton): 2 hours
- FC-130 (Status): 2 hours
- FC-134 (Mobile): 1 hour

**Total:** ~9-10 hours of design/dev work

---

## Next Audit
- [ ] Settings page
- [ ] Budget page
- [ ] Reports page
- [ ] Mobile responsive testing (all pages)
