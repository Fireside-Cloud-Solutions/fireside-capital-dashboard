# Sprint QA — Investments Page Audit

**Session:** Sprint QA 0622  
**Date:** 2026-02-20 06:22 AM EST  
**Agent:** Capital (QA Lead)  
**Page:** investments.html  
**Status:** ✅ AUDIT COMPLETE — 3 BUGS FOUND (1 P2, 2 P3)

---

## Overview

Systematic audit of investments.html for HTML structure, accessibility, UX consistency, and code quality.

**Overall Grade:** B (Solid structure, but missing empty state and inconsistent skeleton count)

---

## Bugs Found (3)

### BUG-INVESTMENTS-SKELETON-INCONSISTENT-001 (P2 Medium, 5 min)

**Issue:** investments.html has only 3 skeleton loader rows, while all other pages use 5 rows for consistency.

**Location:** investments.html lines ~158-181 (skeleton rows in #investmentTableBody)

**Current state:** 3 skeleton rows

**Fix:** Add 2 more skeleton rows to match standard pattern:
```html
<tr class="skeleton-row">
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
  <td><div class="skeleton-loader"></div></td>
</tr>
<!-- Repeat for 5th row -->
```

**Impact:** Inconsistent loading UX compared to other pages. Users expect similar loading patterns across the app.

**Priority:** P2 — UX consistency issue

---

### BUG-INVESTMENTS-NO-EMPTY-STATE-001 (P3 Low, 10 min)

**Issue:** investments.html has no static empty state div (like other pages have).

**Location:** Missing between dataContainer and table-card (around line ~139)

**Current state:** No `#investmentEmptyState` div. Empty state likely handled dynamically by JS (less ideal).

**Fix:** Add static empty state div:
```html
<div id="investmentEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-piggy-bank empty-state-icon"></i>
  <h3>No Investments Yet</h3>
  <p>Track your retirement accounts, brokerage accounts, and other investments to monitor your portfolio growth.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addInvestmentModal" aria-label="Add your first investment">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Investment
  </button>
</div>
```

**Impact:** Inconsistent empty state pattern. Other pages (assets, bills, debts, income) all have static empty states for better UX.

**Priority:** P3 — Low (functional, just inconsistent)

---

### BUG-INVESTMENTS-CSS-STALE-0220-001 (P3 Low, 3 min)

**Issue:** 6 CSS files have stale cache version strings (v=20260217 or v=20260218), should be v=20260220.

**Location:** investments.html lines 26-32

**Files with stale versions:**
- components.css: v=20260218 (should be v=20260220)
- responsive.css: v=20260217 (should be v=20260220)
- utilities.css: v=20260218 (should be v=20260220)
- accessibility.css: v=20260217 (should be v=20260220)
- logged-out-cta.css: v=20260217 (should be v=20260220)
- critical.css: v=20260217 (should be v=20260220)

**Impact:** Users may get stale cached CSS after new deployments.

**Fix:** Batch find/replace across all 12 HTML pages (systemic issue).

**Priority:** P3 — Low impact

---

## Just Fixed (Sprint QA 0622 — Commit 2cc6db7)

### BUG-INVESTMENTS-MODAL-CANCEL-001 ✅ FIXED

**Issue:** #addInvestmentModal footer was missing Cancel button.  
**Fix:** Cancel button added to modal footer (line 242)  
**Status:** ✅ Complete (verified in this audit session)

---

## Positives (What's Working)

### Accessibility ✅

- **Skip link:** Present (`<a href="#main-content" class="skip-link">`)
- **Table caption:** Visually hidden caption for screen readers (line 142)
- **Form labels:** All inputs have associated labels with `for` attributes
- **Required fields:** Marked with `<span class="text-danger">*</span>` and `required` attribute
- **Modal ARIA:** Proper `aria-labelledby`, `aria-hidden`, `tabindex="-1"`
- **Modal Cancel button:** Present (data-bs-dismiss="modal") ✅ (just fixed)

### Semantic HTML ✅

- **Heading hierarchy:** H2 (page title) — VALID (simple structure, no subheadings)
- **Table structure:** Proper `<thead>`, `<tbody>`, `<th>`, `<td>`
- **Form structure:** Proper `<form>`, `<label>`, `<input>`, `<select>` nesting

### UX Consistency ⚠️

- ⚠️ **Skeleton loaders:** Only 3 rows (inconsistent with 5-row standard)
- ⚠️ **Empty state:** Missing static div (other pages have it)
- ✅ **Demo banner:** FC-184 demo mode banner present
- ✅ **Page header actions:** Auth-gated "Add Investment" button

### Features ✅

- **Investment tracking:** 401k, IRA, Roth IRA, brokerage, HSA, 529, crypto, other
- **Contributions:** Starting balance, monthly contribution tracking
- **Returns:** Annual return % calculation
- **Next contribution:** Date tracking
- **Current value:** Real-time portfolio value

---

## Audit Checklist

**HTML Structure:**
- ✅ Semantic HTML5
- ✅ Proper heading hierarchy (H2 only)
- ✅ Table with caption
- ✅ Skip link for keyboard navigation

**Accessibility:**
- ✅ ARIA labels on modals
- ✅ Form labels with `for` attributes
- ✅ Required fields marked visually + programmatically
- ✅ Modal Cancel button (just fixed)

**CSS:**
- ✅ Bootstrap 5.3.3 loaded
- ✅ Design tokens present (v=20260219, current)
- ✅ Main CSS (v=20260219, current)
- ⚠️ 6 CSS files with stale version strings (P3)

**UX Consistency:**
- ⚠️ Empty state missing (P3)
- ⚠️ Skeleton loaders inconsistent (3 rows instead of 5) (P2)
- ✅ Demo mode banner
- ✅ Auth state management

**Performance:**
- ✅ DNS prefetch for Supabase
- ✅ Font preconnect
- ✅ Critical scripts synchronous
- ✅ Non-critical scripts deferred

---

## Recommendations

### Immediate (This Sprint)

1. **Fix BUG-INVESTMENTS-SKELETON-INCONSISTENT-001** (5 min) — Add 2 more skeleton rows for consistency

### Short Term (Next Sprint)

2. **Fix BUG-INVESTMENTS-NO-EMPTY-STATE-001** (10 min) — Add static empty state div
3. **Fix BUG-INVESTMENTS-CSS-STALE-0220-001** (3 min) — Update 6 CSS version strings to v=20260220 (batch with other pages)

### Future Enhancements

4. Add investment charts (portfolio growth over time, allocation pie chart)
5. Add asset allocation breakdown
6. Add projected future value based on contributions and returns

---

## Comparison to Other Pages

**Investments page is WEAKER than:**
- assets.html (has 5 skeleton rows + static empty state)
- bills.html (has 5 skeleton rows + static empty state)
- income.html (has 5 skeleton rows + static empty state + summary cards)

**Investments page is CONSISTENT with:**
- Most pages for accessibility and semantic HTML
- Other pages for modal structure (after Cancel button fix)

---

## Next Page to Audit

**Completed detailed audits (10/12):**
- ✅ dashboard.html
- ✅ assets.html
- ✅ bills.html
- ✅ budget.html
- ✅ operations.html
- ✅ transactions.html
- ✅ friends.html
- ✅ debts.html
- ✅ income.html
- ✅ investments.html

**Remaining (2/12):**
- ⏸️ reports.html
- ⏸️ settings.html

---

## Session Summary

- **Files reviewed:** 1 (investments.html, ~383 lines)
- **Bugs found:** 3 (1 P2, 2 P3)
- **Just fixed bugs verified:** 1 (BUG-INVESTMENTS-MODAL-CANCEL-001)
- **Positives noted:** 8+ (accessibility, semantic HTML, features)
- **Overall grade:** B (Good fundamentals, needs UX polish for consistency)
- **Next action:** Audit reports.html OR fix skeleton inconsistency (5 min quick win)

---

**Report created:** 2026-02-20 06:22 AM EST  
**Agent:** Capital (QA Orchestrator)  
**Session:** Sprint QA 0622
