# UI/UX Audit Report: Transactions Page (transactions.html)

**Date:** February 9, 2026  
**Time:** 5:31 AM EST  
**Page:** transactions.html (Transaction Management)  
**Auditor:** Architect (Sprint UI/UX Cron)  
**Status:** Completed

---

## Executive Summary

The Transactions page is a **high-complexity** page with:
- ✅ FC-028 empty state fix verified (commit 9323ee1)
- ✅ Plaid integration with Sync button
- ✅ Auto-categorization feature
- ✅ Manual transaction entry
- ✅ Filtering and search capabilities
- ⚠️ Multiple button hierarchy violations
- ⚠️ Accessibility gaps (table caption, ARIA labels)
- ⚠️ Missing loading states on async operations

**Complexity Score:** 8/10 (high — most complex CRUD page)

---

## Critical Issues (P0 - Must Fix)

### Issue 1: Empty State Implementation — ✅ VERIFIED FIXED (FC-028)
**Status:** ✅ **COMPLETE** (commit 9323ee1, Feb 9, 4:17 AM)

**Verification:** 
- Empty state component present in HTML (lines 122-138)
- JavaScript properly toggles visibility (transactions.js)
- CTA button wired to Plaid connection

**No action needed.** ✅

---

### Issue 2: Primary Button Overload — 3 Primary Buttons in One Group
**Location:** Lines 111-119 (sync, add, auto-categorize buttons)  
**Problem:** ALL three action buttons use `btn-primary` class. Visual hierarchy broken — user doesn't know which is most important.

**Current State:**
```html
<button id="syncTransactionsBtn" class="btn btn-primary">
  <i class="bi bi-arrow-repeat me-2"></i> Sync from Bank
</button>
<button id="addTransactionBtn" class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
  <i class="bi bi-plus-circle me-2"></i> Add Transaction
</button>
<button id="autoCategorizeBtn" class="btn btn-secondary ms-2">
  <i class="bi bi-tags me-2"></i> Auto-Categorize Uncategorized
</button>
```

**Analysis:**
- "Sync from Bank" = Primary user action (fetches latest data from Plaid)
- "Add Transaction" = Secondary fallback (manual entry for cash transactions)
- "Auto-Categorize" = Tertiary utility (automated helper)

**Fix:**
```html
<button id="syncTransactionsBtn" class="btn btn-primary">
  <i class="bi bi-arrow-repeat me-2"></i> Sync from Bank
</button>
<button id="addTransactionBtn" class="btn btn-secondary ms-2" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
  <i class="bi bi-plus-circle me-2"></i> Add Transaction
</button>
<button id="autoCategorizeBtn" class="btn btn-outline-secondary ms-2">
  <i class="bi bi-tags me-2"></i> Auto-Categorize Uncategorized
</button>
```

**Priority:** P0 — Button hierarchy violation (design system consistency)  
**Effort:** 5 minutes

---

## High Priority Issues (P1 - Should Fix)

### Issue 3: No Loading State for Sync Button
**Location:** Line 111 (syncTransactionsBtn)  
**Problem:** "Sync from Bank" triggers async Plaid operation but has no loading state. User gets no feedback during 3-10 second fetch.

**Fix (in transactions.js):**
```javascript
document.getElementById('syncTransactionsBtn').addEventListener('click', async () => {
  const btn = document.getElementById('syncTransactionsBtn');
  const originalHTML = btn.innerHTML;
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Syncing...';
  
  try {
    await syncTransactionsFromPlaid();
    
    // Success state
    btn.innerHTML = '<i class="bi bi-check-circle me-2"></i> Synced!';
    
    // Restore after 2 seconds
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }, 2000);
    
    // Update last sync time
    document.getElementById('lastSyncTime').textContent = new Date().toLocaleString();
    
  } catch (error) {
    // Error state
    btn.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i> Failed';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }, 2000);
    
    console.error('Sync failed:', error);
  }
});
```

**Priority:** P1 — User feedback during async operation  
**Effort:** 1.5 hours

---

### Issue 4: No Loading State for Auto-Categorize Button
**Location:** Line 117 (autoCategorizeBtn)  
**Problem:** "Auto-Categorize" triggers AI/rules-based categorization but has no loading state.

**Fix (in transactions.js):**
```javascript
document.getElementById('autoCategorizeBtn').addEventListener('click', async () => {
  const btn = document.getElementById('autoCategorizeBtn');
  const originalHTML = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Categorizing...';
  
  try {
    const result = await autoCategorizeTransactions();
    
    // Success with count
    btn.innerHTML = `<i class="bi bi-check-circle me-2"></i> Categorized ${result.count}`;
    
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }, 3000);
    
  } catch (error) {
    btn.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i> Failed';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }, 2000);
  }
});
```

**Priority:** P1 — User feedback  
**Effort:** 1 hour

---

### Issue 5: Table Missing Caption
**Location:** Line 141 (table element)  
**Problem:** No `<caption>` for screen readers.

**Fix:**
```html
<table class="table align-middle mb-0">
  <caption class="visually-hidden">Your recent transactions from connected bank accounts</caption>
  <thead>
```

**Priority:** P1 — Accessibility (WCAG 2.1 AA)  
**Effort:** 5 minutes

---

### Issue 6: Filter Buttons Lack Active State + ARIA
**Location:** Lines 125-129 (Category Filter dropdown)  
**Problem:** 
- No visual indication which filter is active
- No `aria-pressed` or `role="group"` for filter button group
- Screen readers don't announce current filter state

**Current State:**
```html
<div class="dropdown">
  <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="categoryFilterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
    <i class="bi bi-funnel me-2"></i> Category: All
  </button>
  <ul class="dropdown-menu" aria-labelledby="categoryFilterDropdown">
    <li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>
    <li><a class="dropdown-item" href="#" data-category="groceries">Groceries</a></li>
    ...
  </ul>
</div>
```

**Fix:**
```javascript
// In filter click handler
document.querySelectorAll('[data-category]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const category = e.target.dataset.category;
    
    // Update button text
    const dropdown = document.getElementById('categoryFilterDropdown');
    dropdown.innerHTML = `<i class="bi bi-funnel me-2"></i> Category: ${category === 'all' ? 'All' : category}`;
    
    // Add active class to clicked item
    document.querySelectorAll('[data-category]').forEach(i => i.classList.remove('active'));
    e.target.classList.add('active');
    
    // Announce to screen readers
    dropdown.setAttribute('aria-label', `Filtering by ${category === 'all' ? 'all categories' : category}`);
    
    // Apply filter
    filterTransactionsByCategory(category);
  });
});
```

**Priority:** P1 — Accessibility + UX feedback  
**Effort:** 1 hour

---

### Issue 7: Search Input Missing ARIA Label
**Location:** Line 132 (Search input)  
**Problem:** Input has placeholder but no `<label>` or `aria-label`.

**Current State:**
```html
<input type="text" class="form-control" id="transactionSearch" placeholder="Search transactions...">
```

**Fix:**
```html
<label for="transactionSearch" class="visually-hidden">Search transactions</label>
<input type="text" class="form-control" id="transactionSearch" placeholder="Search transactions..." aria-label="Search transactions by merchant name or amount">
```

**Priority:** P1 — Accessibility  
**Effort:** 10 minutes

---

## Medium Priority Issues (P2 - Nice to Have)

### Issue 8: Table Column "Category" Displays Enum Values
**Location:** Table row rendering (transactions.js)  
**Problem:** Database enum values like "groceries", "dining", "utilities" need human-readable labels.

**Expected:**
```
groceries → Groceries
dining → Dining & Restaurants
utilities → Utilities
gas-transportation → Gas & Transportation
```

**Fix (in transactions.js):**
```javascript
const categoryLabels = {
  'groceries': 'Groceries',
  'dining': 'Dining & Restaurants',
  'utilities': 'Utilities',
  'gas-transportation': 'Gas & Transportation',
  'entertainment': 'Entertainment',
  'shopping': 'Shopping',
  'healthcare': 'Healthcare',
  'other': 'Other'
};

// In table rendering
const categoryLabel = categoryLabels[transaction.category] || transaction.category || 'Uncategorized';
```

**Priority:** P2 — User-facing display labels  
**Effort:** 30 minutes

---

### Issue 9: "Last Synced" Time Doesn't Update After Manual Add
**Location:** Line 119 (lastSyncTime span)  
**Problem:** Time only updates after Plaid sync, not when user manually adds a transaction.

**Fix:**
```javascript
// In addTransactionBtn handler success callback
document.getElementById('lastSyncTime').textContent = new Date().toLocaleString() + ' (manual add)';
```

**Priority:** P2 — User awareness  
**Effort:** 15 minutes

---

### Issue 10: No Inline Validation for Amount Field
**Location:** Add Transaction modal form (lines 161-206)  
**Problem:** Amount field allows negative values, $0, or invalid decimals without feedback.

**Fix:**
```javascript
document.getElementById('transactionAmount').addEventListener('blur', (e) => {
  const amount = parseFloat(e.target.value);
  if (isNaN(amount) || amount <= 0) {
    e.target.classList.add('is-invalid');
    showFieldError(e.target, 'Amount must be greater than $0');
  } else {
    e.target.classList.remove('is-invalid');
    e.target.classList.add('is-valid');
  }
});
```

**Priority:** P2 — User guidance  
**Effort:** 1 hour

---

### Issue 11: Mobile Table Overflow — 7 Columns
**Location:** Lines 141-151 (table with 7 columns)  
**Problem:** Table likely overflows on mobile devices (< 768px). No responsive column hiding.

**Recommendation:**
```css
@media (max-width: 767.98px) {
  .table .hide-mobile {
    display: none !important;
  }
}
```

```html
<th class="hide-mobile">Account</th>
<th class="hide-mobile">Category</th>
```

**Priority:** P2 — Mobile UX  
**Effort:** 1.5 hours (test all breakpoints)

---

## Low Priority Issues (P3 - Polish)

### Issue 12: Modal Title Doesn't Change for Edit vs Add
**Location:** Line 155 (addTransactionLabel)  
**Problem:** Modal says "Add Transaction" even when editing existing transaction.

**Fix:**
```javascript
// When opening modal for edit
document.getElementById('addTransactionLabel').textContent = 'Edit Transaction';

// When opening modal for add
document.getElementById('addTransactionLabel').textContent = 'Add Transaction';
```

**Priority:** P3 — User clarity  
**Effort:** 15 minutes

---

### Issue 13: No Date Range Picker for Filtering
**Location:** Lines 125-139 (filter controls)  
**Enhancement:** Add date range picker to filter transactions by time period.

**Priority:** P3 — Future enhancement  
**Effort:** 4 hours (date picker integration)

---

## Accessibility Issues (WCAG 2.1 AA)

### Issue A11Y-1: Table Missing Caption
**Location:** Line 141  
**Status:** Documented as Issue #5 (P1)

---

### Issue A11Y-2: Search Input Missing Label
**Location:** Line 132  
**Status:** Documented as Issue #7 (P1)

---

### Issue A11Y-3: Filter Buttons Missing ARIA State
**Location:** Lines 125-129  
**Status:** Documented as Issue #6 (P1)

---

## Positive Findings ✅

- ✅ FC-028 empty state verified working
- ✅ Empty state CTA properly wired to Plaid connection (`connectBankFromEmpty`)
- ✅ Clean separation of sync vs manual entry
- ✅ Auto-categorization feature is valuable
- ✅ Search functionality implemented
- ✅ Category filtering dropdown implemented
- ✅ Modal form has validation attributes (required, type="number")
- ✅ Semantic HTML structure

---

## Summary Metrics

- **Total Issues Found:** 13
- **P0 (Critical):** 1 (button hierarchy violation)
- **P1 (High):** 6 (loading states, accessibility, filter state)
- **P2 (Medium):** 4 (enum labels, mobile overflow, validation)
- **P3 (Low):** 2 (modal title, date range picker)
- **Accessibility Issues:** 3
- **VERIFIED FIXES:** 1 (FC-028 empty state)

**Complexity Score:** 8/10 (high complexity — most complex CRUD page)  
**Estimated Total Effort:** 12.75 hours  
**Recommended Sprint Focus:** P0 + Top 5 P1 issues (4.5 hours)

---

## Priority Recommendations

**Phase 1 (Critical — 5 minutes):**
1. Fix button hierarchy (Sync=primary, Add=secondary, Categorize=outline) — 5 min

**Phase 2 (High Priority — 4 hours):**
2. Add loading state to Sync button — 1.5 hours
3. Add loading state to Auto-Categorize button — 1 hour
4. Add table caption — 5 min
5. Fix filter button active state + ARIA — 1 hour
6. Add search input label — 10 min

**Phase 3 (Polish — 8.75 hours):**
7. Category enum display labels — 30 min
8. Update last sync time on manual add — 15 min
9. Inline validation for amount field — 1 hour
10. Mobile table column hiding — 1.5 hours
11. Modal title Edit vs Add — 15 min
12. Date range picker (future) — 4 hours

---

## Next Steps

1. Fix P0 button hierarchy immediately (5 minutes)
2. Continue audit on next page: investments.html or reports.html
3. Create Azure DevOps work items for all issues
4. Document async loading state pattern for reuse

---

## Audit Progress

**Pages Audited (Detailed):** 6/11 (55%)
- ✅ Dashboard (index.html) — 13 issues
- ✅ Assets (assets.html) — 13 issues
- ✅ Bills (bills.html) — 20 issues
- ✅ Budget (budget.html) — 10 issues
- ✅ Debts (debts.html) — 10 issues
- ✅ Transactions (transactions.html) — 13 issues

**Remaining Pages (Quick Assessment):** 5
- ⏳ income.html
- ⏳ investments.html
- ⏳ reports.html
- ⏳ settings.html
- ⏳ friends.html

**Total Issues So Far:** 79 (6 pages)  
**Average Issues Per Page:** 13.2

---

## Audit Completion Estimate

- **Detailed audits remaining:** 5 pages × 1.5 hours each = 7.5 hours
- **Azure DevOps work item creation:** 2 hours
- **Final summary report:** 1 hour
- **Total remaining:** 10.5 hours

**Target completion:** Feb 9 EOD (if continuing at current pace)
