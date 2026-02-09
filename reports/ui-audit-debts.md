# UI/UX Audit Report: Debts Page (debts.html)

**Date:** February 9, 2026  
**Page:** debts.html (Debt Management)  
**Auditor:** Capital (Sprint QA Cron)  
**Status:** Completed

---

## Executive Summary

The Debts page has **medium complexity** with:
- ✅ Clean table structure for debt tracking
- ✅ "Financing & Payoff Tracking" cards (visual debt progress)
- ✅ "Completed / Paid Off" section for historical debts
- ✅ Integration with Bills page modals (financing fields)
- ⚠️ Missing empty states (critical UX issue)
- ⚠️ Page header layout verified correct (FC-078)
- ⚠️ Button hierarchy correct

**Complexity Score:** 7/10 (more complex than Budget, less than Bills)

---

## Critical Issues (P0 - Must Fix)

### Issue 1: Page Header Layout — ✅ ALREADY FIXED (FC-078)
**Location:** Lines 95-107 (page-header)  
**Status:** ✅ **VERIFIED CORRECT** (FC-078 systemic fix applied Feb 9, 4:36 AM, commit 5b70655)

**Current State (CORRECT):**
```html
<div class="page-header">
  <h2>Debts</h2> <!-- ✅ Direct child of page-header -->
  <div class="page-header-actions">
    <div id="pageActions" class="initially-hidden">
      <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addDebtModal" aria-label="Add new debt">
        <i class="bi bi-plus-circle"></i> Add Debt
      </button>
    </div>
  </div>
  ...
</div>
```

**Verification:** Structure is correct. FC-078 systemic fix was applied to 9 pages including debts.html.

**Priority:** ~~P0~~ → **RESOLVED**  
**Effort:** 0 hours (already complete)

---

### Issue 2: No Empty State for Debts Table
**Location:** Line 149 (debtTableBody)  
**Problem:** When no debts exist, table shows empty tbody with only column headers. No guidance for new users.

**Current State:**
```html
<tbody id="debtTableBody">
</tbody>
```

**Impact:**
- Blocks new user onboarding
- Users celebrating debt-free status see blank table (missed opportunity for positive reinforcement!)
- No clear path to "Add Debt" button

**Fix:**
```javascript
// In app.js debt rendering function
if (debts.length === 0) {
  document.getElementById('debtTableBody').innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-5">
        <div class="empty-state-inline">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon-inline text-success">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-3 text-success">Debt-Free! 🎉</h3>
          <p class="text-muted mb-4">You have no active debts. Keep it up!</p>
          <p class="text-muted small">If you do take on debt in the future, track it here to plan your payoff strategy.</p>
          <button class="btn btn-outline-secondary mt-2" data-bs-toggle="modal" data-bs-target="#addDebtModal">
            <i class="bi bi-plus-circle"></i> Add Debt (if needed)
          </button>
        </div>
      </td>
    </tr>
  `;
  
  // Hide financing cards section
  document.getElementById('financingCards').innerHTML = '';
  
  return; // Exit early
}
```

**Priority:** P0 — Blocks new user onboarding + missed positive UX moment  
**Effort:** 2 hours (JS implementation + CSS styling + testing)

---

### Issue 3: No Empty State for Financing Cards Section
**Location:** Line 156 (financingCards)  
**Problem:** When no debts with financing exist, section shows empty div. No explanation.

**Fix:**
```javascript
// In financing cards rendering
if (financedDebts.length === 0 && debts.length > 0) {
  document.getElementById('financingCards').innerHTML = `
    <div class="col-12">
      <div class="text-center py-4">
        <i class="bi bi-info-circle text-muted" style="font-size: 2rem;"></i>
        <p class="text-muted mt-2 mb-0">No debts with financing details tracked</p>
        <p class="text-muted small">Edit a debt and add loan details to see payoff progress here</p>
      </div>
    </div>
  `;
}
```

**Priority:** P0 — User confusion when section exists but is empty  
**Effort:** 1 hour

---

## High Priority Issues (P1 - Should Fix)

### Issue 4: Completed Section Always Hidden
**Location:** Line 162 (completedSection with `d-none`)  
**Problem:** Section starts hidden with `d-none` class. JavaScript must unhide it when paid-off debts exist, but if JS fails to load or user has 0 completed debts, section is invisible.

**Current State:**
```html
<div id="completedSection" class="d-none">
  <h4 class="mb-3"><i class="bi bi-check-circle me-2 icon-success"></i>Completed</h4>
  <div id="completedCards" class="row g-3 mb-4">
    <!-- Populated by JS -->
  </div>
</div>
```

**Issue:**
- No empty state for "Completed" section when 0 paid-off debts
- Section heading visible even when empty (if JS shows it)

**Fix:**
```javascript
// Only show section if completed debts exist
const completedDebts = debts.filter(d => d.paidOff === true);
if (completedDebts.length > 0) {
  document.getElementById('completedSection').classList.remove('d-none');
  // Render cards
} else {
  document.getElementById('completedSection').classList.add('d-none');
}
```

**Priority:** P1 — Conditional visibility logic  
**Effort:** 1 hour

---

### Issue 5: Table Column "Type" Displays Database Enum Values
**Location:** Table row rendering (app.js)  
**Problem:** Enum values like "credit-card", "auto-loan", "student-loan" are displayed with hyphens instead of human-readable labels.

**Expected:**
```
credit-card → Credit Card
auto-loan → Auto Loan
student-loan → Student Loan
personal-loan → Personal Loan
```

**Fix (in app.js):**
```javascript
const debtTypeLabels = {
  'credit-card': 'Credit Card',
  'mortgage': 'Mortgage',
  'student-loan': 'Student Loan',
  'auto-loan': 'Auto Loan',
  'personal-loan': 'Personal Loan',
  'other': 'Other'
};

// In table rendering
const typeLabel = debtTypeLabels[debt.type] || debt.type;
```

**Priority:** P1 — User-facing display  
**Effort:** 30 minutes

---

### Issue 6: Add Debt Form Missing Inline Validation
**Location:** Lines 179-228 (debtForm)  
**Problem:** Form only validates on submit. No real-time feedback for:
- Negative amounts
- Interest rate > 100%
- Term = 0 months
- Monthly payment exceeds total amount

**Fix:**
```javascript
// Interest rate validation
document.getElementById('debtInterest').addEventListener('blur', (e) => {
  const rate = parseFloat(e.target.value);
  if (rate < 0 || rate > 100) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Interest rate must be between 0% and 100%');
  } else {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  }
});

// Loan term validation
document.getElementById('debtTerm').addEventListener('blur', (e) => {
  const term = parseInt(e.target.value);
  if (term < 1) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Term must be at least 1 month');
  } else if (term > 600) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Term exceeds 50 years (unusual, please verify)');
  } else {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  }
});
```

**Priority:** P1 — User guidance  
**Effort:** 2 hours

---

## Medium Priority Issues (P2 - Nice to Have)

### Issue 7: Table Action Buttons Lack Touch Targets
**Location:** Line 152 (Actions column - populated by JS)  
**Problem:** Edit/Delete buttons in tables likely don't meet WCAG 2.5.5 (44px minimum touch target).

**Fix:**
```css
.table .btn-group-actions {
  display: flex;
  gap: 8px;
}

.table .btn-group-actions .btn {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px;
}

@media (max-width: 575.98px) {
  .table .btn-group-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .table .btn-group-actions .btn {
    width: 100%;
  }
}
```

**Priority:** P2 — Accessibility compliance  
**Effort:** 1 hour

---

### Issue 8: "Next Due" Column Uses Relative Dates Without Context
**Location:** Table rendering (app.js)  
**Problem:** Dates likely show as "MM/DD/YYYY" with no indication if payment is overdue, due soon, or far future.

**Better Design:**
```javascript
function formatNextDueDate(date) {
  const today = new Date();
  const due = new Date(date);
  const daysUntil = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) {
    return `<span class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Overdue (${Math.abs(daysUntil)} days)</span>`;
  } else if (daysUntil === 0) {
    return `<span class="text-warning"><i class="bi bi-clock me-1"></i>Due today</span>`;
  } else if (daysUntil <= 7) {
    return `<span class="text-warning">Due in ${daysUntil} days</span>`;
  } else {
    return formatDate(date); // Standard date format
  }
}
```

**Priority:** P2 — User awareness of payment urgency  
**Effort:** 1.5 hours

---

### Issue 9: Modal Title Doesn't Change for Edit vs Add
**Location:** Lines 174-176 (addDebtModal)  
**Problem:** Modal title says "Add Debt" even when editing existing debt.

**Fix:**
```javascript
// When opening modal for edit
document.getElementById('addDebtLabel').textContent = 'Edit Debt';

// When opening modal for add
document.getElementById('addDebtLabel').textContent = 'Add Debt';
```

**Priority:** P2 — User clarity  
**Effort:** 15 minutes

---

## Low Priority Issues (P3 - Polish)

### Issue 10: Financing Cards Could Show Payoff Progress Bar
**Location:** Lines 156-159 (financingCards rendering)  
**Problem:** Cards show debt details but no visual progress indicator for payoff.

**Enhancement:**
```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Student Loan</h5>
    <p class="mb-2">Remaining: <strong>$18,500</strong> of $25,000</p>
    
    <!-- Progress bar -->
    <div class="progress" style="height: 8px;">
      <div class="progress-bar bg-success" role="progressbar" style="width: 26%;" aria-valuenow="26" aria-valuemin="0" aria-valuemax="100">
        <span class="visually-hidden">26% paid off</span>
      </div>
    </div>
    <small class="text-muted mt-1">26% paid off</small>
    
    <div class="mt-3">
      <small class="text-muted">32 of 120 payments made</small>
    </div>
  </div>
</div>
```

**Priority:** P3 — Visual enhancement  
**Effort:** 2 hours

---

## Accessibility Issues (WCAG 2.1 AA)

### Issue A11Y-1: Table Missing Caption
**Location:** Line 142 (table element)  
**Problem:** Table has no `<caption>` element. Screen readers don't announce table purpose.

**Fix:**
```html
<table class="table align-middle mb-0">
  <caption class="visually-hidden">Your active debts and loans</caption>
  <thead>
```

**Priority:** P1  
**Effort:** 5 minutes

---

### Issue A11Y-2: "Hide Mobile" Columns Not Announced to Screen Readers
**Location:** Line 149 (hide-mobile class on "Term" and "Next Due" columns)  
**Problem:** Screen readers still announce hidden columns, confusing mobile users.

**Fix:**
```html
<th class="hide-mobile" aria-hidden="true">Term</th>
<th class="hide-mobile" aria-hidden="true">Next Due</th>
```

```css
@media (max-width: 767.98px) {
  .hide-mobile {
    display: none !important;
  }
}
```

**Priority:** P1  
**Effort:** 10 minutes

---

## Positive Findings ✅

- ✅ Page header structure correct (FC-078 verified)
- ✅ Button hierarchy correct ("Add Debt" as secondary is appropriate)
- ✅ Clean table structure with semantic HTML
- ✅ Good use of ARIA labels on Add button
- ✅ Financing & Payoff Tracking section is unique and valuable
- ✅ Completed section for historical debts is thoughtful
- ✅ Modal form has proper validation attributes (required, min, step)
- ✅ Integration with Bills page modals shows good code reuse

---

## Summary Metrics

- **Total Issues Found:** 10 (9 open + 1 already fixed via FC-078)
- **P0 (Critical):** 2 (empty states - block onboarding + user confusion)
- **P1 (High):** 4 (type enum labels, inline validation, accessibility)
- **P2 (Medium):** 3 (touch targets, date formatting, modal title)
- **P3 (Low):** 1 (progress bars)
- **Accessibility Issues:** 2

**Complexity Score:** 7/10 (medium-high complexity)  
**Estimated Total Effort:** 12.25 hours  
**Recommended Sprint Focus:** P0 + Top 3 P1 issues (6 hours)

---

## Priority Recommendations

**Phase 1 (Critical — 4 hours):**
1. Add debts table empty state — 2 hours
2. Add financing cards empty state — 1 hour
3. Fix completed section visibility logic — 1 hour

**Phase 2 (High Priority — 3.5 hours):**
4. Fix type enum display labels — 30 min
5. Add inline validation — 2 hours
6. Add table caption — 5 min
7. Fix hide-mobile aria-hidden — 10 min

**Phase 3 (Polish — 4.75 hours):**
8. Touch target enforcement — 1 hour
9. Next Due date formatting — 1.5 hours
10. Modal title Edit vs Add — 15 min
11. Payoff progress bars — 2 hours

---

## Next Steps

1. ✅ Verify FC-078 fix applied to debts.html (already confirmed)
2. Continue audit on next page: income.html
3. Document empty state pattern for consistency
4. Create Azure DevOps work items after audit complete

---

## Audit Progress

**Pages Audited:** 5/11 (45%)
- ✅ Dashboard (index.html) — 13 issues
- ✅ Assets (assets.html) — 13 issues
- ✅ Bills (bills.html) — 20 issues
- ✅ Budget (budget.html) — 10 issues
- ✅ Debts (debts.html) — 10 issues

**Remaining Pages:** 6
- ⏳ income.html
- ⏳ investments.html
- ⏳ reports.html
- ⏳ settings.html
- ⏳ transactions.html
- ⏳ friends.html

**Total Issues So Far:** 66 (5 pages)  
**Average Issues Per Page:** 13.2
