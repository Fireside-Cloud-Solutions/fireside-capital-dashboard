# UI/UX Audit Report: Budget Page (budget.html)

**Date:** February 9, 2026  
**Page:** budget.html (Budget Management)  
**Auditor:** Capital (Sprint QA Cron)  
**Status:** Completed

---

## Executive Summary

The Budget page is a **mid-complexity** page with:
- ✅ Clean table structure for budget assignments
- ✅ Month navigation controls
- ✅ Summary cards for financial overview
- ✅ Auto-generate budget feature
- ⚠️ Missing empty states (critical UX issue)
- ⚠️ Button hierarchy violations (consistency issue)
- ⚠️ Page header layout inherited bug (ALREADY FIXED globally via FC-078)

**Complexity Score:** 6/10 (medium — simpler than Bills, more complex than Settings)

---

## Critical Issues (P0 - Must Fix)

### Issue 1: Page Header Layout — ✅ ALREADY FIXED (FC-078)
**Location:** Lines 115-133 (page-header)  
**Status:** ✅ **VERIFIED CORRECT** (FC-078 systemic fix applied Feb 9, 4:36 AM, commit 5b70655)

**Current State (CORRECT):**
```html
<div class="page-header">
  <h2>Budget</h2> <!-- ✅ Direct child of page-header -->
  <div class="page-header-actions flex-wrap">
    <div id="pageActions" class="initially-hidden">
      ...
    </div>
  </div>
  ...
</div>
```

**Verification:** Structure is correct. FC-078 systemic fix was applied to 9 pages including budget.html.

**Priority:** ~~P0~~ → **RESOLVED**  
**Effort:** 0 hours (already complete)

---

### Issue 2: No Empty State for Budget Table
**Location:** Line 178 (budgetAssignmentTable tbody)  
**Problem:** When no budget items exist, table shows empty tbody with only column headers. No guidance for new users on how to start.

**Current State:**
```html
<tbody id="budgetAssignmentTable">
</tbody>
```

**Impact:**
- Blocks new user onboarding
- Users don't know what to do first
- No clear path to "Add Item" or "Generate Budget"
- Poor first impression

**Fix:**
```javascript
// In app.js loadAndRenderBudget() function
if (budgetItems.length === 0) {
  document.getElementById('budgetAssignmentTable').innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-5">
        <div class="empty-state-inline">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon-inline">
            <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-3">No Budget Items Yet</h3>
          <p class="text-muted mb-4">Start by adding budget categories or auto-generate based on your spending history</p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
              <i class="bi bi-plus-circle"></i> Add Your First Item
            </button>
            <button class="btn btn-outline-secondary" id="emptyStateGenerateBtn">
              <i class="bi bi-magic"></i> Auto-Generate Budget
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;
  
  // Wire up empty state button
  document.getElementById('emptyStateGenerateBtn')?.addEventListener('click', () => {
    document.getElementById('generateBudgetBtn').click();
  });
  
  // Update summary cards to $0.00
  document.getElementById('expectedIncome').textContent = '$0.00';
  document.getElementById('assignedAmount').textContent = '$0.00';
  document.getElementById('activityAmount').textContent = '$0.00';
  document.getElementById('remainingToBudget').textContent = '$0.00';
  
  return; // Exit early
}
```

**Priority:** P0 — Blocks new user onboarding  
**Effort:** 2 hours (JS implementation + CSS styling + testing)

---

## High Priority Issues (P1 - Should Fix)

### Issue 3: Button Hierarchy Violation — Add Item Button
**Location:** Line 126 (Add Item button in page-header-actions)  
**Problem:** "Add Item" button uses `btn-secondary` when it should be primary action. "Generate Budget" uses `btn-secondary` which is correct (it's automated).

**Current State:**
```html
<button class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal" aria-label="Add budget item">
  <i class="bi bi-plus-circle"></i> Add Item
</button>
```

**Issue:** 
- This is the primary user action (manual budget creation)
- Should be visually prioritized over "Generate Budget"
- Inconsistent with Assets/Bills/Income pages where "Add" is secondary (those have simpler workflows)

**Analysis:**
- **Context:** Budget page has TWO ways to create budget:
  1. Manual: "Add Item" (user-driven, flexible)
  2. Auto: "Generate Budget" (AI-driven, quick)
- **User journey:** Most users will start with "Generate" (easier), then refine with "Add Item"
- **Verdict:** CURRENT HIERARCHY IS CORRECT (both secondary is fine)

**Priority:** ~~P1~~ → **NOT A BUG**  
**Effort:** 0 hours (no change needed)

---

### Issue 4: Generate Budget Button Lacks Loading State
**Location:** Line 123 (generateBudgetBtn)  
**Problem:** Button shows "Generate Budget" but has no loading state. If generation takes time (fetching transactions, calculating averages), user has no feedback.

**Current State:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn" aria-label="Generate budget automatically">
  <i class="bi bi-magic"></i> Generate Budget
</button>
<span id="generateBudgetStatus"></span>
```

**Fix:**
```javascript
// In app.js generateBudget() function
document.getElementById('generateBudgetBtn').addEventListener('click', async () => {
  const btn = document.getElementById('generateBudgetBtn');
  const status = document.getElementById('generateBudgetStatus');
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Generating...';
  status.textContent = '';
  
  try {
    await performBudgetGeneration();
    
    // Success state
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-magic"></i> Generate Budget';
    status.innerHTML = '<span class="text-success ms-2"><i class="bi bi-check-circle"></i> Budget generated!</span>';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
    
  } catch (error) {
    // Error state
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-magic"></i> Generate Budget';
    status.innerHTML = '<span class="text-danger ms-2"><i class="bi bi-exclamation-circle"></i> Failed to generate</span>';
  }
});
```

**Priority:** P1 — User feedback during async operation  
**Effort:** 1.5 hours (JS implementation + testing)

---

### Issue 5: Month Navigation Missing Accessibility Attributes
**Location:** Lines 119-121 (prevMonth, nextMonth buttons)  
**Problem:** Buttons have `aria-label` (good!) but missing:
- No `aria-controls` pointing to the data container
- No `aria-live` announcement when month changes
- Screen readers don't announce new month loaded

**Current State:**
```html
<button class="btn btn-outline-secondary btn-sm" id="prevMonth" aria-label="Previous month">
  <i class="bi bi-chevron-left"></i>
</button>
<h4 id="currentMonth" class="mb-0 text-no-wrap">Loading...</h4>
<button class="btn btn-outline-secondary btn-sm" id="nextMonth" aria-label="Next month">
  <i class="bi bi-chevron-right"></i>
</button>
```

**Fix:**
```html
<button class="btn btn-outline-secondary btn-sm" 
        id="prevMonth" 
        aria-label="Previous month"
        aria-controls="budgetAssignmentTable">
  <i class="bi bi-chevron-left"></i>
</button>
<h4 id="currentMonth" 
    class="mb-0 text-no-wrap" 
    role="status" 
    aria-live="polite" 
    aria-atomic="true">Loading...</h4>
<button class="btn btn-outline-secondary btn-sm" 
        id="nextMonth" 
        aria-label="Next month"
        aria-controls="budgetAssignmentTable">
  <i class="bi bi-chevron-right"></i>
</button>
```

**Priority:** P1 — Accessibility (WCAG 2.1 AA compliance)  
**Effort:** 30 minutes

---

### Issue 6: Table Column Headers Missing Sort Indicators
**Location:** Lines 168-177 (table headers)  
**Problem:** Headers are static text. Users might expect to sort by "Remaining" or "Category" but no visual indication that sorting is not implemented.

**Current State:**
```html
<thead>
  <tr>
    <th class="col-width-22">Item</th>
    <th class="col-width-13">Category</th>
    <th class="col-width-13">Needed</th>
    <th class="col-width-14">Assigned</th>
    <th class="col-width-13">Remaining</th>
    <th class="col-width-15">Funding Status</th>
    <th class="col-width-10">Actions</th>
  </tr>
</thead>
```

**Better Design (if sorting is implemented):**
```html
<thead>
  <tr>
    <th class="col-width-22">
      <button class="btn btn-link p-0 text-start" aria-label="Sort by item name">
        Item <i class="bi bi-arrow-down-up ms-1"></i>
      </button>
    </th>
    <th class="col-width-13">
      <button class="btn btn-link p-0 text-start" aria-label="Sort by category">
        Category <i class="bi bi-arrow-down-up ms-1"></i>
      </button>
    </th>
    ...
  </tr>
</thead>
```

**OR (if sorting NOT implemented — recommended for now):**
```html
<!-- Keep current static headers, they're fine -->
<th>Item</th>
<th>Category</th>
```

**Verdict:** Current design is correct if sorting not implemented. Only change if adding sort functionality.

**Priority:** ~~P1~~ → **NOT A BUG** (future enhancement)  
**Effort:** 0 hours (no change needed unless adding sorting feature)

---

## Medium Priority Issues (P2 - Nice to Have)

### Issue 7: Summary Cards Lack Visual Hierarchy
**Location:** Lines 144-165 (summary cards)  
**Problem:** All 4 cards look identical. "Remaining to Budget" is most important but has same visual weight as "Expected Income".

**Current State:**
```html
<div class="summary-card">
  <h6>Expected Income</h6>
  <h4 id="expectedIncome">$0.00</h4>
</div>
```

**Better Design:**
```css
/* Add visual hierarchy */
.summary-card--primary {
  border-left: 4px solid var(--color-primary);
  background: rgba(1, 164, 239, 0.05);
}

.summary-card--success {
  border-left: 4px solid var(--color-success);
}

.summary-card--warning {
  border-left: 4px solid var(--color-warning);
}

.summary-card--danger {
  border-left: 4px solid var(--color-danger);
}
```

```html
<div class="col-xl-3 col-md-6 col-12">
  <div class="summary-card summary-card--primary">
    <h6>Remaining to Budget</h6>
    <h4 id="remainingToBudget" class="text-success">$0.00</h4>
    <div class="summary-card-icon">
      <i class="bi bi-piggy-bank"></i>
    </div>
  </div>
</div>
```

**Priority:** P2 — Visual polish  
**Effort:** 2 hours (CSS + icon positioning)

---

### Issue 8: No Inline Validation for Budget Item Form
**Location:** Lines 202-216 (budgetItemForm)  
**Problem:** Form only validates on submit. No real-time feedback for:
- Negative amounts
- Duplicate item names
- Invalid category names

**Fix:**
```javascript
// Real-time validation
document.getElementById('budgetItemNeeded').addEventListener('blur', (e) => {
  const amount = parseFloat(e.target.value);
  if (amount < 0) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Amount must be positive');
  } else if (amount === 0) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Amount must be greater than $0');
  } else {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  }
});

// Duplicate name check
document.getElementById('budgetItemName').addEventListener('blur', async (e) => {
  const name = e.target.value.trim();
  const exists = await checkIfBudgetItemExists(name);
  if (exists) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'A budget item with this name already exists');
  } else {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  }
});
```

**Priority:** P2 — User guidance  
**Effort:** 2.5 hours

---

### Issue 9: Remaining to Budget Card Needs Dynamic Styling
**Location:** Line 162 (remainingToBudget)  
**Problem:** Card always shows `text-success` class even when remaining is negative (over-budget scenario).

**Current State:**
```html
<h4 id="remainingToBudget" class="text-success">$0.00</h4>
```

**Fix:**
```javascript
// In app.js budget calculation
function updateRemainingToBudget(remaining) {
  const el = document.getElementById('remainingToBudget');
  el.textContent = formatCurrency(remaining);
  
  // Dynamic color based on value
  el.classList.remove('text-success', 'text-warning', 'text-danger', 'text-muted');
  
  if (remaining > 0) {
    el.classList.add('text-success'); // Good: money left to assign
  } else if (remaining === 0) {
    el.classList.add('text-muted'); // Perfect: fully budgeted
  } else if (remaining >= -500) {
    el.classList.add('text-warning'); // Caution: slightly over-budget
  } else {
    el.classList.add('text-danger'); // Alert: significantly over-budget
  }
}
```

**Priority:** P2 — Visual feedback for over-budget state  
**Effort:** 1 hour

---

## Low Priority Issues (P3 - Polish)

### Issue 10: Modal Form Submit Button Uses Wrong Text
**Location:** Line 219 (saveBudgetItemBtn)  
**Problem:** Button says "Add Item" when modal title says "Add Budget Item". Should match.

**Current State:**
```html
<button type="button" id="saveBudgetItemBtn" class="btn btn-primary">Add Item</button>
```

**Fix:**
```html
<button type="button" id="saveBudgetItemBtn" class="btn btn-primary">Add Budget Item</button>
```

**OR** (if keeping button text short):
```html
<!-- Change modal title to match button -->
<h5 class="modal-title" id="addBudgetItemLabel">Add Item</h5>
```

**Priority:** P3 — Consistency  
**Effort:** 5 minutes

---

## Accessibility Issues (WCAG 2.1 AA)

### Issue A11Y-1: Table Missing Caption
**Location:** Line 168 (table element)  
**Problem:** Table has no `<caption>` element. Screen readers don't announce table purpose.

**Fix:**
```html
<table class="table align-middle mb-0">
  <caption class="visually-hidden">Budget assignments for the current month</caption>
  <thead>
```

**Priority:** P1  
**Effort:** 5 minutes

---

### Issue A11Y-2: Summary Card Values Have No Semantic Context
**Location:** Lines 144-165 (all 4 summary cards)  
**Problem:** Screen readers announce "$0.00" without context. Users don't know which metric is being read.

**Fix:**
```html
<div class="summary-card">
  <h6 id="expectedIncomeLabel">Expected Income</h6>
  <h4 id="expectedIncome" aria-labelledby="expectedIncomeLabel">$0.00</h4>
</div>
```

**Priority:** P1  
**Effort:** 15 minutes (add IDs + aria-labelledby to 4 cards)

---

## Positive Findings ✅

- ✅ Page header structure correct (FC-078 verified)
- ✅ Clean table structure with semantic HTML
- ✅ Good use of ARIA labels on navigation buttons
- ✅ Month navigation controls are intuitive
- ✅ Generate Budget feature is unique and valuable
- ✅ Summary cards provide clear financial overview
- ✅ Modal form has proper validation attributes (required, min, step)
- ✅ Responsive design with col-width classes
- ✅ Button hierarchy mostly correct (Generate + Add both secondary)

---

## Summary Metrics

- **Total Issues Found:** 10 (9 open + 1 already fixed via FC-078)
- **P0 (Critical):** 1 (empty state - blocks onboarding)
- **P1 (High):** 4 (loading state, accessibility, inline validation)
- **P2 (Medium):** 3 (visual hierarchy, dynamic styling)
- **P3 (Low):** 1 (button text consistency)
- **Accessibility Issues:** 2
- **NOT BUGS:** 2 (button hierarchy, sort indicators)

**Complexity Score:** 6/10 (medium complexity)  
**Estimated Total Effort:** 10.25 hours  
**Recommended Sprint Focus:** P0 + Top 3 P1 issues (5.5 hours)

---

## Priority Recommendations

**Phase 1 (Critical — 3.5 hours):**
1. Add budget table empty state — 2 hours
2. Add loading state to Generate Budget — 1.5 hours

**Phase 2 (High Priority — 2 hours):**
3. Fix month navigation accessibility — 30 min
4. Add table caption — 5 min
5. Add summary card aria-labelledby — 15 min
6. Inline validation for budget form — 50 min (subset)

**Phase 3 (Polish — 4.75 hours):**
7. Summary card visual hierarchy — 2 hours
8. Dynamic "Remaining" color styling — 1 hour
9. Full inline validation — 1.5 hours
10. Button text consistency — 15 min

---

## Next Steps

1. ✅ Verify FC-078 fix applied to budget.html (already confirmed)
2. Spawn Builder agent to implement P0 empty state
3. Continue audit on next page: debts.html
4. Create comprehensive Azure DevOps work items
5. Document empty state pattern for consistency

---

## Audit Progress

**Pages Audited:** 4/11 (36%)
- ✅ Dashboard (index.html) — 13 issues
- ✅ Assets (assets.html) — 13 issues
- ✅ Bills (bills.html) — 20 issues
- ✅ Budget (budget.html) — 10 issues

**Remaining Pages:** 7
- ⏳ debts.html
- ⏳ friends.html
- ⏳ income.html
- ⏳ investments.html
- ⏳ reports.html
- ⏳ settings.html
- ⏳ transactions.html

**Total Issues So Far:** 56 (4 pages)  
**Average Issues Per Page:** 14
