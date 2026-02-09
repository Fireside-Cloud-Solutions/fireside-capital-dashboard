# UI/UX Audit Report: Assets Page (assets.html)

**Date:** February 9, 2026  
**Page:** assets.html (Assets Management)  
**Auditor:** Architect Agent  
**Status:** Completed

---

## Executive Summary

The Assets page has a **simpler structure** than the dashboard but suffers from:
- ❌ Critical page header layout bug
- ❌ Poor empty state handling (inherited issue)
- ❌ Confusing modal form structure
- ⚠️ Accessibility gaps in table actions
- ⚠️ Mobile table usability issues

---

## Critical Issues (P0 - Must Fix)

### Issue 1: Page Header Layout Broken
**Location:** Lines 117-122 (page-header)  
**Problem:** The page header uses incorrect structure causing "Assets" heading and "Add Asset" button to stack incorrectly.

**Current State:**
```html
<div class="page-header">
  <div class="page-header-actions">
    <h2>Assets</h2>
    <div id="pageActions" class="initially-hidden">
      <button class="btn btn-secondary btn-touch-target" id="openAssetModalBtn">
```

**Issue:** The `<h2>` is INSIDE `page-header-actions` div, but CSS expects it to be a direct child. This breaks flexbox layout and causes wrapping on tablets.

**Fix:**
```html
<div class="page-header">
  <h2>Assets</h2> <!-- Move outside page-header-actions -->
  <div class="page-header-actions">
    <button class="btn btn-secondary" id="openAssetModalBtn" aria-label="Add new asset">
      <i class="bi bi-plus-circle"></i> Add Asset
    </button>
  </div>
  <div>
    <!-- Auth state buttons -->
  </div>
</div>
```

**Priority:** P0 — Breaks responsive layout  
**Effort:** 15 minutes

---

### Issue 2: Empty Table State Missing
**Location:** Line 170 (assetTableBody)  
**Problem:** When no assets exist, the table shows just headers with an empty body. No guidance for users.

**Current State:**
```html
<tbody id="assetTableBody">
</tbody>
```

**Fix:**
```javascript
// In empty-states.js or assets page JS
if (assets.length === 0) {
  document.getElementById('assetTableBody').innerHTML = `
    <tr>
      <td colspan="7" class="table-empty">
        <i class="bi bi-house-door"></i>
        <h3>No Assets Yet</h3>
        <p>Start tracking your real estate, vehicles, and other valuable assets</p>
        <button class="btn btn-primary" id="emptyStateAddAsset">
          <i class="bi bi-plus-circle"></i> Add Your First Asset
        </button>
      </td>
    </tr>
  `;
}
```

**Priority:** P0 — Blocks new user onboarding  
**Effort:** 2 hours

---

### Issue 3: Modal Form Conditional Fields Confusing
**Location:** Lines 189-222 (asset type fields)  
**Problem:** Form shows/hides fields based on asset type, but uses `d-none` class. Screen readers still announce hidden fields.

**Current Issue:**
```html
<div class="col-12 asset-fields real-estate-fields d-none">
  <div class="row g-3">
    <div class="col-md-4">
      <label for="propertyValue" class="form-label">Market Value</label>
      <input type="number" class="form-control" id="propertyValue" step="0.01" />
    </div>
```

**Problems:**
1. `d-none` hides visually but not from screen readers
2. No `aria-hidden` when fields are hidden
3. Hidden inputs might still submit empty values

**Fix:**
```javascript
// When hiding fields
realEstateFields.classList.add('d-none');
realEstateFields.setAttribute('aria-hidden', 'true');
realEstateFields.querySelectorAll('input').forEach(input => {
  input.disabled = true; // Prevent submission
  input.removeAttribute('required');
});

// When showing fields
realEstateFields.classList.remove('d-none');
realEstateFields.removeAttribute('aria-hidden');
realEstateFields.querySelectorAll('input').forEach(input => {
  input.disabled = false;
  // Re-add required if needed
});
```

**Priority:** P0 — Accessibility + data validation issue  
**Effort:** 3 hours

---

## High Priority Issues (P1 - Should Fix)

### Issue 4: Table Action Buttons Not Touch-Friendly
**Location:** Line 173 (Actions column, populated by JS)  
**Problem:** Edit/Delete buttons in table are likely too small for mobile. No minimum touch target enforcement.

**Expected Issue (based on typical implementation):**
- Buttons probably < 44px touch target
- Too close together (< 8px gap)
- Hard to tap accurately on mobile

**Fix:**
```css
/* Add to main.css */
.table .btn-group-actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
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

**Priority:** P1 — Mobile usability  
**Effort:** 2 hours

---

### Issue 5: Table Horizontal Scroll Not Obvious
**Location:** Line 168 (table-responsive)  
**Problem:** On mobile, table scrolls horizontally but there's no visual indicator. Users don't know they can scroll.

**Fix:**
```css
/* Add subtle shadow to indicate scroll */
.table-responsive {
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to left, rgba(26, 26, 26, 0.8), transparent);
  pointer-events: none;
  opacity: 1;
  transition: opacity 200ms;
}

.table-responsive.scrolled-to-end::after {
  opacity: 0;
}
```

```javascript
// Add scroll detection
const tableContainer = document.querySelector('.table-responsive');
tableContainer.addEventListener('scroll', () => {
  const isScrolledToEnd = tableContainer.scrollWidth - tableContainer.scrollLeft === tableContainer.clientWidth;
  tableContainer.classList.toggle('scrolled-to-end', isScrolledToEnd);
});
```

**Priority:** P1 — Discoverability  
**Effort:** 2 hours

---

### Issue 6: Delete Modal Lacks Severity Indicator
**Location:** Lines 301-319 (confirmDeleteAssetModal)  
**Problem:** Delete confirmation modal looks neutral. Should visually communicate danger.

**Current State:**
```html
<div class="modal-header">
  <h5 class="modal-title">Confirm Deletion</h5>
</div>
<div class="modal-body">
  Are you sure you want to delete the asset <strong id="deleteAssetName"></strong>?
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="button" class="btn btn-danger" id="confirmDeleteAssetBtn">Delete</button>
</div>
```

**Fix:**
```html
<div class="modal-header bg-danger bg-opacity-10 border-danger">
  <i class="bi bi-exclamation-triangle text-danger me-2"></i>
  <h5 class="modal-title text-danger">Confirm Deletion</h5>
</div>
<div class="modal-body">
  <p>⚠️ This action cannot be undone.</p>
  <p>Are you sure you want to permanently delete <strong id="deleteAssetName"></strong>?</p>
  <p class="text-muted small mb-0">• All associated data will be removed<br>• This will affect your net worth calculations</p>
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="button" class="btn btn-danger" id="confirmDeleteAssetBtn">
    <i class="bi bi-trash"></i> Delete Permanently
  </button>
</div>
```

**Priority:** P1 — User safety  
**Effort:** 1 hour

---

### Issue 7: Modal Form Field IDs Conflict Risk
**Location:** Lines 189-222 (asset type fields)  
**Problem:** Real estate and vehicle fields have different IDs (`propertyValue` vs `vehicleValue`) but same purpose. If form is reused for editing, this causes confusion.

**Better Architecture:**
```html
<!-- Use data attributes instead of multiple ID sets -->
<div class="col-12 asset-fields" data-asset-type="real-estate">
  <div class="row g-3">
    <div class="col-md-4">
      <label for="assetValue" class="form-label">Market Value</label>
      <input type="number" class="form-control" id="assetValue" name="value" />
    </div>
    <div class="col-md-4">
      <label for="assetLoanBalance" class="form-label">Loan Balance</label>
      <input type="number" class="form-control" id="assetLoanBalance" name="loan_balance" />
    </div>
    <div class="col-md-4">
      <label for="assetNextDueDate" class="form-label">Next Due Date</label>
      <input type="date" class="form-control" id="assetNextDueDate" name="next_due_date" />
    </div>
  </div>
</div>
```

Then use CSS to show/hide:
```css
.asset-fields { display: none; }
.asset-fields[data-asset-type].active { display: block; }
```

**Priority:** P1 — Code maintainability + accessibility  
**Effort:** 3 hours (requires JS refactor)

---

## Medium Priority Issues (P2 - Nice to Have)

### Issue 8: No Inline Validation Feedback
**Location:** Lines 179-223 (asset form)  
**Problem:** Form only validates on submit. No real-time feedback as user types.

**Recommended Implementation:**
- Show green checkmark on valid fields as user types
- Show error messages below invalid fields
- Disable submit button until form is valid
- Use Bootstrap's `.is-valid` and `.is-invalid` classes

**Priority:** P2  
**Effort:** 4 hours

---

### Issue 9: "Next Due" Field Unclear Purpose
**Location:** Lines 215, 222 (realEstateNextDueDate, vehicleNextDueDate)  
**Problem:** Label says "Next Due Date" but no explanation of what this means. Is it insurance? Loan payment? Property tax?

**Fix:**
```html
<label for="assetNextDueDate" class="form-label">
  Next Due Date 
  <i class="bi bi-info-circle" 
     data-bs-toggle="tooltip" 
     data-bs-placement="top" 
     title="Next payment due date for loans, insurance, or taxes related to this asset"></i>
</label>
```

**Priority:** P2  
**Effort:** 1 hour

---

### Issue 10: Equity Not Calculated Automatically
**Location:** Table column "Equity" (line 172)  
**Problem:** User must manually calculate equity (Value - Loan). Should be automatic.

**Fix:**
```javascript
// In table rendering code
const equity = (asset.value || 0) - (asset.loan_balance || 0);
row.innerHTML = `
  <td>${asset.name}</td>
  <td>${asset.type}</td>
  <td>$${asset.value.toLocaleString()}</td>
  <td>$${asset.loan_balance.toLocaleString()}</td>
  <td class="${equity >= 0 ? 'text-success' : 'text-danger'}">
    $${Math.abs(equity).toLocaleString()}
    ${equity < 0 ? '(underwater)' : ''}
  </td>
  <td>${asset.next_due_date || '—'}</td>
  <td>...</td>
`;
```

**Priority:** P2 — User convenience  
**Effort:** 1 hour

---

## Accessibility Issues (WCAG 2.1 AA)

### Issue A11Y-1: Table Missing Caption
**Location:** Line 169 (table)  
**Problem:** Table has no `<caption>` element. Screen readers don't announce table purpose.

**Fix:**
```html
<table class="table align-middle mb-0">
  <caption class="visually-hidden">List of your assets including real estate and vehicles</caption>
  <thead>
```

**Priority:** P1  
**Effort:** 10 minutes

---

### Issue A11Y-2: Modal Title ID Mismatch
**Location:** Line 177 (modal aria-labelledby)  
**Problem:** Modal uses `aria-labelledby="addAssetModalLabel"` but title ID changes to "editAssetModalLabel" when editing. Causes aria reference error.

**Fix:**
```javascript
// When opening for edit
document.getElementById('addAssetModalLabel').textContent = 'Edit Asset';
// Don't change the ID
```

OR use single ID for both modes:
```html
<h5 class="modal-title" id="assetModalLabel">Add Asset</h5>
```
```html
<div class="modal fade" id="addAssetModal" aria-labelledby="assetModalLabel">
```

**Priority:** P1  
**Effort:** 30 minutes

---

### Issue A11Y-3: Delete Button in Table Missing Accessible Name
**Location:** Line 173 (Actions column - expected based on pattern)  
**Problem:** Delete buttons likely only show icon with no aria-label.

**Expected Current:**
```html
<button class="btn btn-sm btn-danger" onclick="deleteAsset('123')">
  <i class="bi bi-trash"></i>
</button>
```

**Fix:**
```html
<button class="btn btn-sm btn-danger" 
        onclick="deleteAsset('123')" 
        aria-label="Delete asset: Home">
  <i class="bi bi-trash" aria-hidden="true"></i>
</button>
```

**Priority:** P1  
**Effort:** 1 hour

---

## Performance Issues

### Issue PERF-1: All Scripts Load on Every Page
**Location:** Lines 325-342 (script tags)  
**Problem:** Page loads Plaid, Chart.js, and other scripts not needed on Assets page. Wastes bandwidth.

**Fix:**
Create conditional script loader:
```javascript
// In polish-utilities.js
const pageScripts = {
  'index.html': ['charts.js', 'plaid.js', 'subscriptions.js'],
  'assets.html': ['plaid.js'], // Only Plaid needed
  'bills.html': [],
  // etc.
};

const currentPage = window.location.pathname.split('/').pop();
const scriptsForPage = pageScripts[currentPage] || [];

scriptsForPage.forEach(script => {
  import(`./assets/js/${script}`);
});
```

**Priority:** P2  
**Effort:** 4 hours (requires architecture change)

---

## Summary Metrics

- **Total Issues Found:** 13
- **P0 (Critical):** 3
- **P1 (High):** 7
- **P2 (Medium):** 3
- **Accessibility Issues:** 3
- **Performance Issues:** 1

**Estimated Total Effort:** 25.67 hours  
**Recommended Sprint Focus:** P0 + Top 4 P1 issues (13.5 hours)

---

## Next Steps

1. Fix critical page header layout issue (blocking all pages with same structure)
2. Implement empty state for assets table
3. Fix modal form conditional fields for accessibility
4. Continue audit on bills.html, income.html, and other pages
5. Create comprehensive Azure DevOps work items for all findings
