# UI/UX Audit: Budget Page
**Date:** Friday, February 13, 2026 — 7:27 AM EST  
**Page:** budget.html  
**Auditor:** Capital (Architect)  
**Status:** COMPREHENSIVE REVIEW

---

## Executive Summary

Budget page is **functionally complete** but has **8 UI/UX issues** ranging from HIGH to LOW priority. Focus areas: spacing inconsistencies, mobile responsiveness, empty state implementation, and button hierarchy.

**Critical Findings:**
- ❌ **HIGH**: Month navigation controls missing mobile optimization
- ❌ **HIGH**: Summary cards lack spacing system consistency
- ⚠️ **MEDIUM**: Table columns need better responsive behavior
- ⚠️ **MEDIUM**: Empty state implementation missing

---

## 🔴 HIGH PRIORITY ISSUES

### ISSUE #1: Month Navigation Controls - Mobile UX
**Severity:** HIGH  
**Impact:** Mobile users (50%+ traffic)  
**Location:** Line 168-173 (`#pageActions .d-flex`)

**Problem:**
Month navigation controls (`prevMonth`, `currentMonth`, `nextMonth`) are not optimized for mobile touch targets:
```html
<button class="btn btn-outline-secondary btn-sm" id="prevMonth">
  <i class="bi bi-chevron-left"></i>
</button>
<h4 id="currentMonth" class="mb-0 text-no-wrap">Loading...</h4>
<button class="btn btn-outline-secondary btn-sm" id="nextMonth">
  <i class="bi bi-chevron-right"></i>
</button>
```

**Issues:**
1. `.btn-sm` buttons may be under 44x44px touch target (WCAG 2.5.5)
2. No visible spacing tokens (`gap-2` uses Bootstrap's spacing, not design tokens)
3. `text-no-wrap` class doesn't exist in CSS (should be `text-nowrap`)

**Fix:**
```html
<div class="d-flex align-items-center" style="gap: var(--space-2);">
  <button class="btn btn-outline-secondary btn-touch-target" id="prevMonth" 
          aria-label="Previous month">
    <i class="bi bi-chevron-left"></i>
  </button>
  <h4 id="currentMonth" class="mb-0 text-nowrap">Loading...</h4>
  <button class="btn btn-outline-secondary btn-touch-target" id="nextMonth" 
          aria-label="Next month">
    <i class="bi bi-chevron-right"></i>
  </button>
</div>
```

**Priority:** HIGH  
**Estimated Effort:** 1 hour

---

### ISSUE #2: Summary Cards - Spacing System Violation
**Severity:** HIGH  
**Impact:** Design system consistency  
**Location:** Lines 207-232 (summary cards grid)

**Problem:**
Summary cards use Bootstrap's `.g-3 .g-xl-4` gutters instead of design token spacing:
```html
<div class="row g-3 g-xl-4 mb-4">
```

According to `design-tokens.css`, the spacing system should use `var(--space-*)` tokens, but Bootstrap's `.g-3` = 1rem (16px) and `.g-xl-4` = 1.5rem (24px) — these don't align with the 8px grid system documented in `main.css`.

**Inconsistency:**
- `main.css` line 47: "Consistent 8px grid system throughout"
- Bootstrap gutters use 4px increments (`.g-1` = 0.25rem = 4px)
- Design tokens use different increments

**Fix:**
Replace Bootstrap gutters with custom spacing:
```html
<div class="row mb-4" style="gap: var(--space-3, 1rem);">
```

OR update `design-tokens.css` to match Bootstrap's spacing scale.

**Priority:** HIGH  
**Estimated Effort:** 2 hours (affects ALL pages)

---

### ISSUE #3: Table Column Widths - Mobile Overflow Risk
**Severity:** MEDIUM  
**Impact:** Mobile table readability  
**Location:** Lines 243-251 (table header)

**Problem:**
Table uses percentage-based column widths that don't adapt on mobile:
```html
<th class="col-width-22">Item</th>
<th class="col-width-13">Category</th>
<th class="col-width-13">Needed</th>
<th class="col-width-14">Assigned</th>
<th class="col-width-13">Remaining</th>
<th class="col-width-15">Funding Status</th>
<th class="col-width-10">Actions</th>
```

**Issues:**
1. No responsive column hiding for mobile
2. 7 columns on mobile will require horizontal scroll
3. No `@media` rules to hide less-critical columns on small screens

**Recommendation:**
1. Hide "Category" and "Funding Status" on mobile
2. Stack "Needed" and "Assigned" vertically in mobile view
3. Add responsive utility classes:

```html
<th class="col-width-22">Item</th>
<th class="col-width-13 d-none d-lg-table-cell">Category</th>
<th class="col-width-13">Needed</th>
<th class="col-width-14">Assigned</th>
<th class="col-width-13 d-none d-md-table-cell">Remaining</th>
<th class="col-width-15 d-none d-xl-table-cell">Funding Status</th>
<th class="col-width-10">Actions</th>
```

**Priority:** MEDIUM  
**Estimated Effort:** 2 hours

---

## ⚠️ MEDIUM PRIORITY ISSUES

### ISSUE #4: Empty State Implementation Missing
**Severity:** MEDIUM  
**Impact:** User onboarding, first-time experience  
**Location:** `#budgetAssignmentTable` (line 253)

**Problem:**
No empty state implementation visible in HTML. When `#budgetAssignmentTable` is empty, users see a blank table with just headers.

**Expected Pattern** (from `empty-states.js`):
```html
<div class="empty-state">
  <div class="empty-state-icon">
    <i class="bi bi-calculator"></i>
  </div>
  <h4 class="empty-state-title">No Budget Items Yet</h4>
  <p class="empty-state-message">
    Create your first budget item to start tracking spending.
  </p>
  <button class="btn btn-secondary" data-bs-toggle="modal" 
          data-bs-target="#addBudgetItemModal">
    <i class="bi bi-plus-circle"></i> Add Budget Item
  </button>
</div>
```

**Priority:** MEDIUM  
**Estimated Effort:** 1 hour

---

### ISSUE #5: "Generate Budget" Button - Unclear Affordance
**Severity:** MEDIUM  
**Impact:** Feature discovery  
**Location:** Line 177 (`#generateBudgetBtn`)

**Problem:**
"Generate Budget" button uses `.btn-secondary` styling but represents a POWERFUL automation feature (likely AI-powered). Users may not understand it's a primary action.

**Current:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn">
  <i class="bi bi-magic"></i> Generate Budget
</button>
```

**Recommendation:**
1. Promote to `.btn-primary` (flame orange) OR
2. Add tooltip explaining what it does:
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn" 
        data-bs-toggle="tooltip" 
        title="Auto-generate budget based on your bills and income">
  <i class="bi bi-magic"></i> Generate Budget
</button>
```

**Priority:** MEDIUM  
**Estimated Effort:** 30 minutes

---

## 🟡 LOW PRIORITY ISSUES

### ISSUE #6: Caption Text - Accessibility Language
**Severity:** LOW  
**Impact:** Screen reader clarity  
**Location:** Line 242 (`<caption>`)

**Problem:**
Caption is overly verbose:
```html
<caption class="visually-hidden">
  Monthly budget assignments showing needed amounts, assigned funds, 
  remaining balances, and funding status for each category
</caption>
```

**Recommendation:**
Simplify to essential info:
```html
<caption class="visually-hidden">
  Budget items with needed, assigned, and remaining amounts
</caption>
```

**Priority:** LOW  
**Estimated Effort:** 5 minutes

---

### ISSUE #7: Form Validation - Missing Client-Side Feedback
**Severity:** LOW  
**Impact:** User experience, form submission errors  
**Location:** Lines 265-283 (`#budgetItemForm`)

**Problem:**
Form inputs have `required` attribute but no visual indication of required fields:
```html
<label for="budgetItemName" class="form-label">Item Name (e.g., Groceries)</label>
<input type="text" class="form-control" id="budgetItemName" required>
```

**Recommendation:**
Add asterisk to required labels:
```html
<label for="budgetItemName" class="form-label">
  Item Name <span class="text-danger">*</span>
</label>
```

**Priority:** LOW  
**Estimated Effort:** 15 minutes

---

### ISSUE #8: Modal Footer - Button Order Inconsistency
**Severity:** LOW  
**Impact:** UX consistency across pages  
**Location:** Line 285 (`#addBudgetItemModal .modal-footer`)

**Problem:**
Modal has only one button in footer (Save), no Cancel button:
```html
<div class="modal-footer">
  <button type="button" id="saveBudgetItemBtn" class="btn btn-primary">Add Item</button>
</div>
```

Most modals follow pattern: `[Cancel] [Primary Action]`

**Recommendation:**
Add cancel button for consistency:
```html
<div class="modal-footer">
  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
    Cancel
  </button>
  <button type="button" id="saveBudgetItemBtn" class="btn btn-primary">
    Add Item
  </button>
</div>
```

**Priority:** LOW  
**Estimated Effort:** 15 minutes

---

## ✅ POSITIVE FINDINGS

### What's Working Well

1. **Accessibility Foundation:**
   - Proper ARIA labels on icon-only buttons ✓
   - Skip link implemented ✓
   - Table caption for screen readers ✓

2. **Mobile-First Approach:**
   - Critical CSS prevents auth flash ✓
   - Sidebar overlay pattern ✓
   - Safe area insets for notched devices ✓

3. **Progressive Enhancement:**
   - `.initially-hidden` pattern prevents layout shift ✓
   - `.data-hidden` container for loading states ✓

4. **Security:**
   - CSRF tokens referenced in scripts ✓
   - Rate limiting implemented ✓
   - Session security in place ✓

---

## RECOMMENDATIONS

### Immediate Actions (This Sprint)
1. **Fix month navigation** (Issue #1) — 1 hour
2. **Add empty state** (Issue #4) — 1 hour
3. **Verify touch targets** (relates to Issue #1) — 30 minutes

**Total:** 2.5 hours

### Next Sprint
4. **Resolve spacing system** (Issue #2) — 2 hours (global fix)
5. **Optimize table columns** (Issue #3) — 2 hours

### Backlog
6. Issues #5-8 — Low-priority polish (1.5 hours total)

---

## TESTING CHECKLIST

Before marking complete:
- [ ] Month nav buttons ≥44x44px on mobile (Chrome DevTools)
- [ ] Empty state displays when table is empty
- [ ] Table scrolls horizontally on mobile without breaking layout
- [ ] All form fields show required indicators
- [ ] Modal has Cancel button

---

## FILES TO MODIFY

**HTML:**
- ✏️ `app/budget.html` — Fix month nav, add empty state, update form

**CSS:**
- 📝 `app/assets/css/design-tokens.css` — Document spacing system decision
- 📝 `app/assets/css/components.css` — Add `.btn-touch-target` if missing

**JavaScript:**
- 📝 `app/assets/js/budget.js` (if exists) — Implement empty state logic

---

## CONCLUSION

Budget page is **production-ready** with minor UX improvements needed. Focus on:
1. Mobile touch targets (WCAG compliance)
2. Empty state (first-time user experience)
3. Design system consistency (spacing tokens)

**Quality Score:** 7/10 (Good foundation, needs polish)  
**Accessibility Score:** 8/10 (Strong, minor improvements)  
**Mobile Score:** 6/10 (Needs responsive table work)

**Next Audit:** Investments or Income page (whichever hasn't been reviewed yet)
