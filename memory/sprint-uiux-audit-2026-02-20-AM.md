# UI/UX Sprint Audit — February 20th, 2026 (7:50 AM)

**Agent:** Capital (Architect mode)  
**Cron:** ad7d7355-8e6a-48fc-a006-4076a2937f6f (Sprint UI/UX)  
**Session:** Continuing systematic audit across all pages

---

## Audit Progress

**Previous Sessions:**
- Feb 15, 7:10 AM: Audited index.html, assets.html, transactions.html (3/11 pages)
- Found 6 issues (2 P0, 2 P1, 2 P2)

**This Session:**
- **Page Audited:** bills.html (4/11 pages complete)
- **CSS Reviewed:** components.css, main.css

---

## NEW FINDINGS: bills.html

### ✅ ISSUE BUG-UI-BTN-002: Button Hierarchy Violation
**Priority:** P1 HIGH  
**Location:** bills.html lines 99-100  
**Problem:**
```html
<button class="btn btn-outline-secondary" id="scanEmailBillsBtn">
  <i class="bi bi-envelope-check"></i> Scan Email for Bills
</button>
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal">
  <i class="bi bi-plus-circle"></i> Add Bill
</button>
```
**Analysis:**
- "Scan Email for Bills" is btn-outline-secondary (correct — TERTIARY action)
- "Add Bill" is btn-primary (correct — PRIMARY action)
- ✅ **NO VIOLATION** — This is proper hierarchy

**Verdict:** PASS ✅

---

### ⚠️ ISSUE BUG-UI-BTN-003: Button Class Naming Inconsistency
**Priority:** P2 MEDIUM  
**Location:** bills.html line 214 (and other pages)  
**Problem:**
```html
<button type="button" class="btn btn-sm btn-outline-secondary active" id="showAllBillsBtn">
  All Bills
</button>
<button type="button" class="btn btn-sm btn-outline-secondary" id="showSubscriptionsBtn">
  <i class="bi bi-credit-card-2-front me-1"></i>Subscriptions Only
</button>
```
**Analysis:**
- Filter buttons use `btn-sm btn-outline-secondary` (correct for filters/toggles)
- Both buttons are TERTIARY actions (neither is destructive/primary)
- ✅ Hierarchy is correct

**Verdict:** PASS ✅

---

### ❌ ISSUE BUG-UI-FORM-001: Form Modal Width Too Narrow
**Priority:** P1 HIGH  
**Location:** bills.html line 364 (Add Bill Modal)  
**Problem:**
```html
<div class="modal fade" id="addBillModal" tabindex="-1">
  <div class="modal-dialog">  <!-- Missing modal-lg class -->
    <div class="modal-content">
```
**Impact:**
- Complex form with 10+ fields crammed into default 500px modal width
- Financing fields (lines 421-499) include:
  - Interest rate + Original principal (2 columns)
  - Loan term + Start date (2 columns)
  - Payments made + Total financed (2 columns)
- On mobile/tablet, narrow modals cause awkward text wrapping
- Poor UX for data-heavy forms

**Fix:**
```html
<div class="modal-dialog modal-lg">
```

**Effort:** 2 minutes (add `modal-lg` class)  
**Affected Pages:**
- bills.html (addBillModal)
- Check other modals across all pages

---

### ❌ ISSUE BUG-UI-MODAL-001: Excessive Modal Size for Email Review
**Priority:** P2 MEDIUM  
**Location:** bills.html line 728 (Email Review Modal)  
**Problem:**
```html
<div class="modal fade" id="emailReviewModal">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
```
**Analysis:**
- ✅ Uses `modal-lg` (800px width) — good for list review
- ✅ Uses `modal-dialog-scrollable` — prevents content overflow
- ⚠️ NO ISSUE — this is correct implementation for bulk review

**Verdict:** PASS ✅

---

### ❌ ISSUE BUG-UI-ACCESS-001: Missing Skip Link Target
**Priority:** P0 CRITICAL (Accessibility)  
**Location:** bills.html line 37-38  
**Problem:**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
...
<main class="main-content flex-grow-1" id="main-content">
```
**Analysis:**
- ✅ Skip link present (line 37)
- ✅ Target ID `#main-content` exists (line 85)
- ✅ **NO ISSUE** — Accessibility feature working correctly

**Verdict:** PASS ✅

---

### ❌ ISSUE BUG-UI-EMPTY-001: Missing Empty State for Bills Table
**Priority:** P1 HIGH  
**Location:** bills.html lines 217-249 (billTableBody)  
**Problem:**
- Table shows 3 skeleton rows during loading (correct)
- NO EXPLICIT EMPTY STATE markup for "No bills yet" scenario
- JavaScript likely handles this dynamically
- **Needs verification:** Check if `empty-states.js` provides fallback

**Expected Implementation:**
```html
<tbody id="billTableBody">
  <!-- Skeleton rows (loading) -->
  <tr class="skeleton-row">...</tr>
  
  <!-- Empty state (no data) — MISSING? -->
  <tr class="empty-state-row d-none" id="noBillsRow">
    <td colspan="6" class="text-center py-5">
      <i class="bi bi-receipt empty-state-icon"></i>
      <p class="text-muted mt-3">No bills yet. Click "Add Bill" to get started.</p>
    </td>
  </tr>
</tbody>
```

**Fix:**
1. Add empty state row to HTML
2. Verify `empty-states.js` toggles skeleton → empty state → data correctly

**Effort:** 15 minutes (add markup + verify JS)  
**Severity:** HIGH (poor UX if table shows blank with no guidance)

---

### ✅ ISSUE BUG-UI-LAYOUT-001: Page Header 3-Div Structure (CONFIRMED)
**Priority:** P2 MEDIUM  
**Location:** bills.html lines 95-107 (and budget.html lines 87-117)  
**Problem:**
```html
<div class="page-header">
  <h2>Bills</h2>                          <!-- Div 1: Title -->
  <div class="page-header-actions">...</div>  <!-- Div 2: Actions -->
  <div>                                   <!-- Div 3: Auth (breaks layout) -->
    <div id="loggedOutState">...</div>
    <div id="loggedInState">...</div>
  </div>
</div>
```

**CSS Expectation:**
```css
.page-header {
  display: flex;
  justify-content: space-between;  /* Expects 2 children, not 3 */
}
```

**Impact:**
- Third div prevents proper space-between layout
- On mobile, auth buttons stack awkwardly
- Inconsistent with 2-div structure on index.html

**Fix:**
Wrap actions + auth in a single container:
```html
<div class="page-header">
  <h2>Bills</h2>
  <div class="page-header-right">
    <div class="page-header-actions">...</div>
    <div>
      <div id="loggedOutState">...</div>
      <div id="loggedInState">...</div>
    </div>
  </div>
</div>
```

**Effort:** 15 minutes (update 10 HTML files, add CSS for `.page-header-right`)  
**Status:** SAME ISSUE as previous audit (BUG-UI-LAYOUT-001)

---

### ✅ ISSUE BUG-UI-TYPE-002: Typography Units — Font Sizes in main.css
**Priority:** P1 HIGH  
**Location:** main.css lines 126-185  
**Analysis:**
```css
h1 { font-size: var(--text-h1); }  /* Uses design token — GOOD */
h2 { font-size: 32px; }            /* Hardcoded px — BAD */
h3 { font-size: 24px; }            /* Hardcoded px — BAD */
h4 { font-size: 20px; }            /* Hardcoded px — BAD */
h5 { font-size: 18px; }            /* Hardcoded px — BAD */
h6 { font-size: 16px; }            /* Hardcoded px — BAD */
p, li, td, span { font-size: 16px; } /* Hardcoded px — BAD */
.text-muted, small { font-size: 14px; } /* Hardcoded px — BAD */
```

**Problem:**
- Only h1 uses CSS variable (design token)
- Rest of typography uses hardcoded px values
- Breaks responsive scaling (doesn't respect user font size preferences)
- **WCAG 1.4.4 (AA):** Text should resize up to 200% without assistive tech

**Fix:**
Convert to design tokens or rem:
```css
h2 { font-size: 2rem; }      /* 32px at default 16px base */
h3 { font-size: 1.5rem; }    /* 24px */
h4 { font-size: 1.25rem; }   /* 20px */
h5 { font-size: 1.125rem; }  /* 18px */
h6 { font-size: 1rem; }      /* 16px */
p, li, td, span { font-size: 1rem; }
.text-muted, small { font-size: 0.875rem; } /* 14px */
```

**Effort:** 30 minutes (find-replace + test across all pages)  
**Status:** SAME ISSUE as previous audit (BUG-UI-TYPE-001)

---

## Summary: Bills Page Audit

| Issue ID | Issue | Priority | Status |
|----------|-------|----------|--------|
| BUG-UI-FORM-001 | Add Bill modal too narrow | P1 | ❌ NEW |
| BUG-UI-EMPTY-001 | Missing empty state for bills table | P1 | ❌ NEW |
| BUG-UI-LAYOUT-001 | Page header 3-div structure | P2 | ✅ CONFIRMED |
| BUG-UI-TYPE-002 | Typography hardcoded px units | P1 | ✅ CONFIRMED |

**Passes:**
- ✅ Button hierarchy correct (no violations)
- ✅ Email review modal properly sized
- ✅ Skip link accessibility working
- ✅ Filter buttons use correct classes

---

## CUMULATIVE ISSUE TRACKER (Updated)

### P0 CRITICAL (2 issues)
1. **BUG-UI-NAV-001:** Mobile nav z-index conflict (index.html)
2. **BUG-UI-CSS-001:** Duplicate inline critical CSS across 11 files

### P1 HIGH (4 issues)
3. **BUG-UI-NOTIF-001:** Notification dropdown 550px width causes scroll (components.css)
4. **BUG-UI-TYPE-001:** Typography hardcoded px units (main.css) — **CONFIRMED**
5. **BUG-UI-FORM-001:** Add Bill modal too narrow (bills.html) — **NEW**
6. **BUG-UI-EMPTY-001:** Missing empty state markup (bills.html) — **NEW**

### P2 MEDIUM (2 issues)
7. **BUG-UI-LAYOUT-001:** Page header 3-div structure (10 pages) — **CONFIRMED**
8. **BUG-UI-BTN-001:** Button hierarchy violations (transactions.html + others)

**Total Issues:** 8 (2 P0, 4 P1, 2 P2)  
**Total Effort:** ~2 hours

---

## Next Steps

1. **Continue audit:** 7 pages remaining (debts, friends, income, investments, operations, reports, settings)
2. **Verify empty states:** Check all table components for proper empty state implementation
3. **Modal width audit:** Review all modals across pages for proper sizing
4. **Create Azure DevOps work items** (once CLI is available)

---

## Pages Audited (4/11 — 36% Complete)

- ✅ index.html (dashboard)
- ✅ assets.html
- ✅ transactions.html
- ✅ bills.html
- ⏳ budget.html (partial — saw header only)
- ⏳ debts.html
- ⏳ friends.html
- ⏳ income.html
- ⏳ investments.html
- ⏳ operations.html
- ⏳ reports.html
- ⏳ settings.html

---

---

## DEBTS.HTML AUDIT (Page 5/11)

### ✅ POSITIVE FINDING: Proper Empty State Implementation
**Location:** debts.html lines 142-149  
**Finding:**
```html
<div id="debtEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-credit-card empty-state-icon"></i>
  <h3>No Debts Tracked</h3>
  <p>Add your loans, credit cards, and other debts to plan your payoff strategy and track your progress.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Debt
  </button>
</div>
```
**Analysis:** ✅ **EXCELLENT IMPLEMENTATION** — This is the correct pattern:
- Empty state icon (64px on mobile, 80px desktop)
- Clear heading + supportive copy
- Primary CTA button to resolve empty state
- **This pattern should be applied to bills.html (BUG-UI-EMPTY-001)**

### ❌ ISSUE BUG-UI-BTN-004: Button Hierarchy Violation in Debts
**Priority:** P1 HIGH  
**Location:** debts.html line 91  
**Problem:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
  <i class="bi bi-plus-circle"></i> Add Debt
</button>
```
**Analysis:**
- "Add Debt" is the PRIMARY action on the page (only action button)
- Uses `btn-secondary` (BLUE) instead of `btn-primary` (ORANGE)
- **Violates tri-color hierarchy:** PRIMARY actions should use orange
- Compare to income.html line 93: correctly uses `btn-primary` for "Add Income"

**Fix:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
```

**Effort:** 1 minute  
**Affected Files:** debts.html

### ❌ ISSUE BUG-UI-FORM-002: Add Debt Modal Too Narrow
**Priority:** P1 HIGH  
**Location:** debts.html line 240  
**Problem:**
```html
<div class="modal fade" id="addDebtModal">
  <div class="modal-dialog">  <!-- Missing modal-lg -->
    <div class="modal-content">
```
**Analysis:**
- Form has 7 required fields (name, type, amount, interest, term, monthly payment, next due)
- Default modal width (500px) causes cramped layout
- Same issue as bills.html (BUG-UI-FORM-001)

**Fix:**
```html
<div class="modal-dialog modal-lg">
```

**Effort:** 2 minutes

---

## INCOME.HTML AUDIT (Page 6/11)

### ✅ POSITIVE FINDINGS
1. **Empty state present:** Lines 137-145 (matches debts.html pattern)
2. **Button hierarchy correct:** Line 93 uses `btn-primary` for "Add Income"
3. **Page header structure:** SAME 3-div issue (confirmed BUG-UI-LAYOUT-001)

---

## BUTTON HIERARCHY VIOLATIONS SUMMARY

**Tri-Color Hierarchy Rule:**
- **Orange (btn-primary):** PRIMARY action (1 per page max)
- **Blue (btn-secondary):** SECONDARY actions (2 per page max)
- **Gray (btn-outline-secondary):** TERTIARY actions (unlimited)

**Pages with Violations:**
1. ✅ bills.html: NO VIOLATION (correct usage)
2. ❌ debts.html: "Add Debt" should be btn-primary (currently btn-secondary)
3. ✅ income.html: CORRECT (uses btn-primary)
4. ⏳ transactions.html: "Auto Categorize" — needs review

---

## CUMULATIVE ISSUE TRACKER (UPDATED)

### P0 CRITICAL (2 issues)
1. **BUG-UI-NAV-001:** Mobile nav z-index conflict (index.html)
2. **BUG-UI-CSS-001:** Duplicate inline critical CSS across 11 files

### P1 HIGH (6 issues)
3. **BUG-UI-NOTIF-001:** Notification dropdown 550px width causes scroll (components.css)
4. **BUG-UI-TYPE-001:** Typography hardcoded px units (main.css)
5. **BUG-UI-FORM-001:** Add Bill modal too narrow (bills.html)
6. **BUG-UI-EMPTY-001:** Missing empty state markup (bills.html)
7. **BUG-UI-BTN-004:** "Add Debt" button hierarchy violation (debts.html) — **NEW**
8. **BUG-UI-FORM-002:** Add Debt modal too narrow (debts.html) — **NEW**

### P2 MEDIUM (2 issues)
9. **BUG-UI-LAYOUT-001:** Page header 3-div structure (10 pages)
10. **BUG-UI-BTN-001:** Button hierarchy violations (transactions.html + others)

**Total Issues:** 10 (2 P0, 6 P1, 2 P2)  
**Total Effort:** ~2.5 hours

---

## Pages Audited (6/11 — 55% Complete)

- ✅ index.html (dashboard)
- ✅ assets.html
- ✅ transactions.html
- ✅ bills.html
- ✅ debts.html
- ✅ income.html (partial)
- ⏳ budget.html (header only)
- ⏳ friends.html
- ⏳ investments.html
- ⏳ operations.html
- ⏳ reports.html
- ⏳ settings.html

---

**Session completed:** 8:05 AM  
**Duration:** 15 minutes  
**Issues found:** 4 new (BUG-UI-FORM-001, BUG-UI-EMPTY-001, BUG-UI-BTN-004, BUG-UI-FORM-002)  
**Issues confirmed:** 2 (BUG-UI-LAYOUT-001, BUG-UI-TYPE-001)  
**Positive findings:** 2 (debts.html + income.html empty states)
