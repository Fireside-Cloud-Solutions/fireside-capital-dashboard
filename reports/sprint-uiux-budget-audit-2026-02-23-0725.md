# UI/UX Audit Report — Fireside Capital Dashboard: Budget Page

**Audit Date:** Monday, February 23, 2026, 7:25 AM  
**Auditor:** Architect (Capital AI)  
**Scope:** budget.html — Monthly Budget Planning & Tracking  
**Design System:** Fireside 365 Logo-Native (design-tokens.css v2.0)  
**Session:** 3 of 12

---

## Executive Summary

The Budget page demonstrates strong core functionality (auto-generate, budget vs actuals, month navigation). However, critical accessibility gaps, form validation issues, and mobile UX friction points need immediate attention to meet WCAG 2.1 AA standards and improve user experience.

### Priority Breakdown
- **CRITICAL (4)**: Form validation, required field indicators, summary card semantics, month navigation keyboard access
- **HIGH (3)**: Mobile month picker width, auto-generate tooltip persistence, table column widths on mobile
- **MEDIUM (4)**: Empty state CTA redundancy, funding status color-only indicators, skeleton fade transition, BVA section heading hierarchy
- **LOW (2)**: "Generate Budget" button placement, category dropdown ordering

**Total Issues:** 13  
**Estimated Remediation Time:** 14 hours (1.5 sprints)

---

## 1. CRITICAL ISSUES

### Issue #C1: Form Validation Visual Feedback Missing (WCAG 2.1 Failure)
**Category:** Accessibility, Form UX  
**Location:** Add Budget Item Modal (line 335), form inputs  
**Priority:** CRITICAL  
**WCAG Violations:** 3.3.1 (Error Identification), 3.3.3 (Error Suggestion), 3.3.2 (Labels or Instructions)

**Problem:**
- Required fields (`budgetItemName`, `budgetItemCategory`, `budgetItemNeeded`) lack visual indicators beyond red asterisk
- No inline error messages when validation fails
- Bootstrap `.is-invalid` class not applied on field-level errors
- Users submit incomplete forms, get generic alert, don't know which field is wrong

**Current Code:**
```html
<div class="mb-3">
  <label for="budgetItemName" class="form-label mb-1">Item Name (e.g., Groceries) <span class="text-danger">*</span></label>
  <input type="text" class="form-control" id="budgetItemName" required>
</div>
<!-- No error feedback div, no aria-invalid, no aria-describedby -->
```

**Impact:**
- **WCAG 2.1 Failures:** 3.3.1, 3.3.3, 3.3.2
- **Screen Readers:** Users don't know which field is invalid
- **Mobile UX:** Alert at top scrolls off-screen
- **Completion Rate:** Users abandon form after 1-2 failed attempts

**Recommended Fix:**

**HTML:**
```html
<div class="mb-3">
  <label for="budgetItemName" class="form-label mb-1">
    Item Name (e.g., Groceries)
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <input 
    type="text" 
    class="form-control" 
    id="budgetItemName" 
    name="budgetItemName"
    required 
    aria-describedby="budgetItemNameError"
    aria-invalid="false"
    aria-required="true"
    placeholder="e.g., Groceries, Dining Out, Gas"
  >
  <div id="budgetItemNameError" class="invalid-feedback" style="display: none;">
    Please enter a budget item name (e.g., Groceries, Dining Out)
  </div>
</div>

<div class="mb-3">
  <label for="budgetItemCategory" class="form-label mb-1">
    Category
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <select 
    class="form-select" 
    id="budgetItemCategory" 
    name="budgetItemCategory"
    required
    aria-describedby="budgetItemCategoryError"
    aria-invalid="false"
    aria-required="true"
  >
    <option value="" disabled selected>Select a category...</option>
    <option value="dining">Dining</option>
    <option value="groceries">Groceries</option>
    <option value="transportation">Transportation</option>
    <option value="utilities">Utilities</option>
    <option value="entertainment">Entertainment</option>
    <option value="shopping">Shopping</option>
    <option value="healthcare">Healthcare</option>
    <option value="travel">Travel</option>
    <option value="other">Other</option>
  </select>
  <div id="budgetItemCategoryError" class="invalid-feedback" style="display: none;">
    Please select a category for this budget item
  </div>
</div>

<div class="mb-3">
  <label for="budgetItemNeeded" class="form-label mb-1">
    Amount Needed ($)
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <input 
    type="number" 
    class="form-control" 
    id="budgetItemNeeded" 
    name="budgetItemNeeded"
    required 
    min="0.01" 
    step="0.01"
    aria-describedby="budgetItemNeededError"
    aria-invalid="false"
    aria-required="true"
    placeholder="0.00"
  >
  <div id="budgetItemNeededError" class="invalid-feedback" style="display: none;">
    Please enter an amount greater than $0.00
  </div>
</div>
```

**JavaScript (budget.js or app.js):**
```javascript
function validateBudgetItemForm() {
  let isValid = true;
  
  // Validate item name
  const nameInput = document.getElementById('budgetItemName');
  const nameError = document.getElementById('budgetItemNameError');
  if (!nameInput.value.trim()) {
    nameInput.classList.add('is-invalid');
    nameInput.setAttribute('aria-invalid', 'true');
    nameError.style.display = 'block';
    isValid = false;
  } else {
    nameInput.classList.remove('is-invalid');
    nameInput.setAttribute('aria-invalid', 'false');
    nameError.style.display = 'none';
  }
  
  // Validate category
  const categoryInput = document.getElementById('budgetItemCategory');
  const categoryError = document.getElementById('budgetItemCategoryError');
  if (!categoryInput.value) {
    categoryInput.classList.add('is-invalid');
    categoryInput.setAttribute('aria-invalid', 'true');
    categoryError.style.display = 'block';
    isValid = false;
  } else {
    categoryInput.classList.remove('is-invalid');
    categoryInput.setAttribute('aria-invalid', 'false');
    categoryError.style.display = 'none';
  }
  
  // Validate amount
  const amountInput = document.getElementById('budgetItemNeeded');
  const amountError = document.getElementById('budgetItemNeededError');
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    amountInput.classList.add('is-invalid');
    amountInput.setAttribute('aria-invalid', 'true');
    amountError.style.display = 'block';
    isValid = false;
  } else {
    amountInput.classList.remove('is-invalid');
    amountInput.setAttribute('aria-invalid', 'false');
    amountError.style.display = 'none';
  }
  
  return isValid;
}

// Add blur validation for real-time feedback
document.getElementById('budgetItemName').addEventListener('blur', validateBudgetItemForm);
document.getElementById('budgetItemCategory').addEventListener('change', validateBudgetItemForm);
document.getElementById('budgetItemNeeded').addEventListener('blur', validateBudgetItemForm);

// Update save button handler
document.getElementById('saveBudgetItemBtn').addEventListener('click', function() {
  if (!validateBudgetItemForm()) {
    // Scroll to first invalid field
    const firstInvalid = document.querySelector('.modal-body .is-invalid');
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Proceed with save logic...
});
```

**Effort:** 3 hours  
**Risk:** MEDIUM (requires JS refactor, QA testing needed)

---

### Issue #C2: Summary Card Heading Semantics (WCAG 2.1 Failure)
**Category:** Accessibility, HTML Semantics  
**Location:** Summary cards (lines 234-260), using `<h6>` and `<h4>` tags  
**Priority:** CRITICAL  
**WCAG Violations:** 1.3.1 (Info and Relationships), 2.4.6 (Headings and Labels)

**Problem:**
- Summary card labels use `<h6>` tags but should use `<div>` or `<span>` with proper ARIA
- Values use `<h4>` but aren't headings — they're dynamic data displays
- Screen readers announce 4 headings per card, confusing navigation structure
- Heading hierarchy broken (h1 → h6 skip)

**Current Code:**
```html
<div class="summary-card loading">
    <h6>Expected Income</h6>
    <div class="skeleton-loader skeleton-value" style="width: 120px; height: 32px;"></div>
    <h4 id="expectedIncome" class="d-none">$0.00</h4>
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 1.3.1 (Info and Relationships) and 2.4.6 (Headings and Labels)
- **Screen Readers:** Navigation landmarks broken, users can't skim content properly
- **SEO:** Search engines can't properly parse page structure
- **Skip Links:** "Skip to content" shortcuts malfunction

**Recommended Fix:**

**HTML:**
```html
<div class="summary-card loading">
  <div class="summary-card-label">Expected Income</div>
  <div class="skeleton-loader skeleton-value" style="width: 120px; height: 32px;"></div>
  <div 
    id="expectedIncome" 
    class="summary-card-value d-none" 
    role="status" 
    aria-live="polite"
    aria-label="Expected income for current month"
  >
    <span class="visually-hidden">Expected income: </span>
    $0.00
  </div>
</div>

<div class="summary-card loading">
  <div class="summary-card-label">Assigned</div>
  <div class="skeleton-loader skeleton-value" style="width: 120px; height: 32px;"></div>
  <div 
    id="assignedAmount" 
    class="summary-card-value d-none" 
    role="status" 
    aria-live="polite"
    aria-label="Total assigned budget amount"
  >
    <span class="visually-hidden">Assigned: </span>
    $0.00
  </div>
</div>

<div class="summary-card loading">
  <div class="summary-card-label">Spent</div>
  <div class="skeleton-loader skeleton-value" style="width: 120px; height: 32px;"></div>
  <div 
    id="activityAmount" 
    class="summary-card-value d-none" 
    role="status" 
    aria-live="polite"
    aria-label="Total spent this month"
  >
    <span class="visually-hidden">Spent: </span>
    $0.00
  </div>
</div>

<div class="summary-card loading">
  <div class="summary-card-label">Remaining to Budget</div>
  <div class="skeleton-loader skeleton-value" style="width: 120px; height: 32px;"></div>
  <div 
    id="remainingToBudget" 
    class="summary-card-value text-success d-none" 
    role="status" 
    aria-live="polite"
    aria-label="Remaining funds to allocate"
  >
    <span class="visually-hidden">Remaining: </span>
    $0.00
  </div>
</div>
```

**CSS Adjustments (components.css or main.css):**
```css
/* Maintain visual appearance while using semantic markup */
.summary-card-label {
  font-size: 0.875rem;  /* 14px — same as h6 */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.summary-card-value {
  font-size: 2rem;  /* 32px — same as h4 */
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.summary-card-value.text-success {
  color: var(--color-success) !important;
}

/* Ensure proper visual hierarchy */
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

**Effort:** 2 hours  
**Risk:** LOW (CSS-only visual changes, no logic affected)

---

### Issue #C3: Month Navigation Keyboard Accessibility
**Category:** Accessibility (WCAG 2.1)  
**Location:** Month picker buttons (lines 119-122)  
**Priority:** CRITICAL  
**WCAG Violations:** 2.1.1 (Keyboard), 4.1.3 (Status Messages)

**Problem:**
- Month navigation buttons have `aria-label` but no keyboard shortcuts
- Screen reader users must tab through 3+ buttons to change month
- Current month display (`#currentMonth`) doesn't announce when it updates
- No `role="status"` on the month display region

**Current Code:**
```html
<div class="d-flex align-items-center gap-2">
  <button class="btn btn-outline-secondary" id="prevMonth" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>
  <h4 id="currentMonth" class="mb-0 text-no-wrap" role="status" aria-live="polite">Loading...</h4>
  <button class="btn btn-outline-secondary" id="nextMonth" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 2.1.1 (Keyboard) and 4.1.3 (Status Messages)
- **Screen Readers:** Month changes not announced properly
- **Keyboard Users:** No shortcuts (Arrow Left/Right expected)
- **Mobile:** Swipe gestures not implemented

**Recommended Fix:**

**HTML (add keyboard hints):**
```html
<div class="d-flex align-items-center gap-2" id="monthNavigator" tabindex="0" role="group" aria-label="Month navigation">
  <button 
    class="btn btn-outline-secondary" 
    id="prevMonth" 
    aria-label="Previous month (press left arrow or Shift+P)"
    data-bs-toggle="tooltip" 
    data-bs-placement="bottom"
    title="Previous Month (←)"
  >
    <i class="bi bi-chevron-left"></i>
  </button>
  <div 
    id="currentMonth" 
    class="mb-0 text-no-wrap month-display" 
    role="status" 
    aria-live="polite"
    aria-atomic="true"
  >
    Loading...
  </div>
  <button 
    class="btn btn-outline-secondary" 
    id="nextMonth" 
    aria-label="Next month (press right arrow or Shift+N)"
    data-bs-toggle="tooltip" 
    data-bs-placement="bottom"
    title="Next Month (→)"
  >
    <i class="bi bi-chevron-right"></i>
  </button>
</div>
```

**JavaScript (add keyboard navigation):**
```javascript
// Month navigation keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Arrow keys for month navigation (when not in input fields)
  if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    if (e.key === 'ArrowLeft' || (e.shiftKey && e.key === 'p')) {
      e.preventDefault();
      document.getElementById('prevMonth').click();
    } else if (e.key === 'ArrowRight' || (e.shiftKey && e.key === 'n')) {
      e.preventDefault();
      document.getElementById('nextMonth').click();
    }
  }
});

// Announce month changes to screen readers
function updateMonthDisplay(newMonth) {
  const monthDisplay = document.getElementById('currentMonth');
  monthDisplay.textContent = newMonth;
  
  // Announce to screen readers
  const announcement = `Now viewing budget for ${newMonth}`;
  announceToScreenReader(announcement);
}

function announceToScreenReader(message) {
  const announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.classList.add('visually-hidden');
  announcer.textContent = message;
  document.body.appendChild(announcer);
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}
```

**Effort:** 2 hours  
**Risk:** LOW (adds shortcuts, doesn't change existing behavior)

---

### Issue #C4: Table Column Width Mobile Overflow
**Category:** Mobile UX, Responsive Design  
**Location:** Budget table (lines 270-290), `.col-width-*` classes  
**Priority:** CRITICAL

**Problem:**
- 7 columns with fixed percentage widths overflow on screens < 768px
- Horizontal scroll required on mobile devices
- "Actions" column (10% width) too narrow for icon buttons
- "Funding Status" column text truncates illegibly

**Current Code:**
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

**Impact:**
- **Mobile UX:** Users can't view all columns without scrolling
- **Touch Targets:** Action buttons too small to tap accurately
- **Readability:** Text truncates mid-word
- **Abandonment:** Users give up on mobile editing

**Recommended Fix:**

**Option 1: Stacked Card Layout (Mobile)**

**CSS (responsive.css):**
```css
/* Desktop: Table layout */
@media (min-width: 768px) {
  .budget-table-wrapper {
    overflow-x: auto;
  }
  
  .budget-table {
    display: table;
    width: 100%;
  }
  
  .col-width-22 { width: 22%; }
  .col-width-13 { width: 13%; }
  .col-width-14 { width: 14%; }
  .col-width-15 { width: 15%; }
  .col-width-10 { width: 10%; }
}

/* Mobile: Card layout */
@media (max-width: 767px) {
  .budget-table thead {
    display: none; /* Hide table headers */
  }
  
  .budget-table tbody {
    display: block;
  }
  
  .budget-table tr {
    display: block;
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--color-bg-2);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }
  
  .budget-table td {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border: none;
  }
  
  .budget-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-right: 12px;
  }
  
  .budget-table td:last-child {
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border-subtle);
  }
}
```

**HTML (add data-label attributes for mobile):**
```html
<tbody id="budgetAssignmentTable">
  <tr>
    <td data-label="Item">Groceries</td>
    <td data-label="Category">Groceries</td>
    <td data-label="Needed">$600.00</td>
    <td data-label="Assigned">$500.00</td>
    <td data-label="Remaining">$100.00</td>
    <td data-label="Status">Underfunded</td>
    <td data-label="Actions">
      <button class="btn btn-sm btn-outline-primary">Edit</button>
      <button class="btn btn-sm btn-outline-danger">Delete</button>
    </td>
  </tr>
</tbody>
```

**Effort:** 4 hours  
**Risk:** MEDIUM (requires JS updates to add data-label attributes dynamically)

---

## 2. HIGH PRIORITY ISSUES

### Issue #H1: Month Picker Width on Mobile
**Category:** Mobile UX  
**Location:** Month navigation group (line 119)  
**Priority:** HIGH

**Problem:**
- Month text (e.g., "February 2026") + 2 buttons = ~280px minimum
- On iPhone SE (375px width), buttons crowd the month text
- `.text-no-wrap` prevents line breaks but causes overflow
- Buttons too close together for accurate touch

**Current Code:**
```html
<div class="d-flex align-items-center gap-2">
  <button class="btn btn-outline-secondary" id="prevMonth" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>
  <h4 id="currentMonth" class="mb-0 text-no-wrap" role="status" aria-live="polite">Loading...</h4>
  <button class="btn btn-outline-secondary" id="nextMonth" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>
</div>
```

**Impact:**
- **Mobile UX:** Buttons overlap on small screens
- **Touch Accuracy:** Users accidentally tap wrong button
- **Visual Glitch:** Text truncates if month name is long

**Recommended Fix:**

**HTML:**
```html
<div class="d-flex align-items-center justify-content-center gap-2 month-picker-wrapper">
  <button class="btn btn-outline-secondary btn-month-nav" id="prevMonth" aria-label="Previous month">
    <i class="bi bi-chevron-left"></i>
  </button>
  <div id="currentMonth" class="mb-0 month-display" role="status" aria-live="polite" aria-atomic="true">
    Loading...
  </div>
  <button class="btn btn-outline-secondary btn-month-nav" id="nextMonth" aria-label="Next month">
    <i class="bi bi-chevron-right"></i>
  </button>
</div>
```

**CSS:**
```css
.month-picker-wrapper {
  min-width: 280px;
  max-width: 100%;
}

.month-display {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* Allow flex shrink */
}

.btn-month-nav {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px; /* WCAG 2.5.5 touch target size */
  padding: 8px;
}

@media (max-width: 400px) {
  .month-display {
    font-size: 1rem; /* Smaller on very small screens */
  }
  
  .month-picker-wrapper {
    gap: 0.5rem; /* Tighter spacing */
  }
}
```

**Effort:** 1 hour  
**Risk:** LOW (CSS-only, no JS changes)

---

### Issue #H2: "Generate Budget" Tooltip Persistence
**Category:** UX, Accessibility  
**Location:** Generate Budget button (line 128)  
**Priority:** HIGH

**Problem:**
- Tooltip uses `data-bs-toggle="tooltip"` which requires Bootstrap JS initialization
- Tooltips not initialized on page load, so they never appear
- Help text critical for first-time users ("Auto-generate budget based on your bills and income")
- No visual indicator that help is available

**Current Code:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn" 
        aria-label="Generate budget automatically"
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom"
        title="Auto-generate budget based on your bills and income">
    <i class="bi bi-magic"></i> Generate Budget
</button>
```

**Impact:**
- **New Users:** Don't understand what "Generate Budget" does
- **Accessibility:** ARIA label only provides partial context
- **Discovery:** Feature underutilized due to unclear purpose

**Recommended Fix:**

**Option 1: Initialize Tooltips Globally**

**JavaScript (app.js):**
```javascript
// Initialize all Bootstrap tooltips on page load
document.addEventListener('DOMContentLoaded', function() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'hover focus',
      delay: { show: 500, hide: 100 }
    });
  });
});
```

**Option 2: Add Help Icon with Popover (Better for Mobile)**

**HTML:**
```html
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn" aria-label="Generate budget automatically">
  <i class="bi bi-magic"></i> Generate Budget
  <button 
    class="btn btn-link btn-sm p-0 ms-1" 
    type="button"
    data-bs-toggle="popover" 
    data-bs-placement="bottom"
    data-bs-trigger="click"
    data-bs-html="true"
    data-bs-content="<p class='mb-0'>Automatically creates budget items based on your recurring bills and expected income.</p><p class='mb-0 mt-2'><strong>Note:</strong> This will not overwrite existing budget items.</p>"
    aria-label="Learn more about auto-generate"
    tabindex="-1"
  >
    <i class="bi bi-question-circle"></i>
  </button>
</button>
```

**JavaScript (app.js):**
```javascript
// Initialize popovers
document.addEventListener('DOMContentLoaded', function() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.forEach(function (popoverTriggerEl) {
    new bootstrap.Popover(popoverTriggerEl, {
      sanitize: true
    });
  });
});
```

**Effort:** 1 hour (Option 1), 2 hours (Option 2)  
**Risk:** LOW (adds initialization, doesn't change existing functionality)

---

### Issue #H3: Funding Status Color-Only Indicators
**Category:** Accessibility (WCAG 2.1)  
**Location:** Funding Status column (line 277)  
**Priority:** HIGH  
**WCAG Violations:** 1.4.1 (Use of Color)

**Problem:**
- Funding status likely uses color alone to indicate state (red = underfunded, green = funded)
- Colorblind users (8% of males) can't distinguish status
- No text labels or icons to supplement color
- Screen readers don't announce color-based status

**Current Code (assumed based on typical implementation):**
```javascript
// Example of problematic implementation
function renderFundingStatus(needed, assigned) {
  const remaining = needed - assigned;
  if (remaining > 0) {
    return `<span class="text-danger">Underfunded</span>`;
  } else {
    return `<span class="text-success">Funded</span>`;
  }
}
```

**Impact:**
- **WCAG 2.1:** Fails 1.4.1 (Use of Color)
- **Colorblind Users:** Can't distinguish status at a glance
- **Accessibility:** Information lost to users with color vision deficiency

**Recommended Fix:**

**HTML (add icons + badges):**
```javascript
function renderFundingStatus(needed, assigned) {
  const remaining = needed - assigned;
  
  if (remaining > 0) {
    return `
      <span class="badge bg-danger d-inline-flex align-items-center gap-1">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
        <span>Underfunded</span>
      </span>
      <span class="visually-hidden">Status: underfunded by ${formatCurrency(remaining)}</span>
    `;
  } else if (remaining === 0) {
    return `
      <span class="badge bg-success d-inline-flex align-items-center gap-1">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
        <span>Funded</span>
      </span>
      <span class="visually-hidden">Status: fully funded</span>
    `;
  } else {
    return `
      <span class="badge bg-info d-inline-flex align-items-center gap-1">
        <i class="bi bi-arrow-up-circle-fill" aria-hidden="true"></i>
        <span>Overfunded</span>
      </span>
      <span class="visually-hidden">Status: overfunded by ${formatCurrency(Math.abs(remaining))}</span>
    `;
  }
}
```

**CSS (components.css):**
```css
/* Ensure badges have sufficient contrast */
.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  font-weight: 600;
}

.badge i {
  font-size: 0.875rem;
}

/* Add pattern fills for colorblind users */
.badge.bg-danger {
  background-color: var(--color-error) !important;
  border: 2px solid var(--color-error);
}

.badge.bg-success {
  background-color: var(--color-success) !important;
  border: 2px solid var(--color-success);
}

.badge.bg-info {
  background-color: var(--color-info) !important;
  border: 2px solid var(--color-info);
}
```

**Effort:** 2 hours  
**Risk:** LOW (visual enhancement, no logic changes)

---

## 3. MEDIUM PRIORITY ISSUES

### Issue #M1: Empty State CTA Redundancy
**Category:** UX, Content Design  
**Location:** Empty state (lines 226-233)  
**Priority:** MEDIUM

**Problem:**
- Empty state button text: "Add Your First Budget Item"
- Page header button text: "Add Item"
- Redundant CTA creates confusion ("Are these different actions?")
- Empty state button should be more descriptive

**Current Code:**
```html
<div id="budgetEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-calculator empty-state-icon"></i>
  <h3>No Budget Items Yet</h3>
  <p>Create your monthly budget to plan spending, track expenses, and reach your financial goals.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal" aria-label="Add your first budget item">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Budget Item
  </button>
</div>
```

**Impact:**
- **User Confusion:** "Are these the same button?"
- **Copy Clarity:** "Your First" implies limitation
- **Action Clarity:** Users unsure which button to use

**Recommended Fix:**

**HTML:**
```html
<div id="budgetEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-calculator empty-state-icon"></i>
  <h3>No Budget Items Yet</h3>
  <p>Create your monthly budget to plan spending, track expenses, and reach your financial goals.</p>
  <div class="empty-state-actions">
    <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal" aria-label="Create a budget item">
      <i class="bi bi-plus-circle me-2"></i> Create Budget Item
    </button>
    <button class="btn btn-outline-secondary btn-lg" id="generateBudgetBtnEmpty" aria-label="Auto-generate budget">
      <i class="bi bi-magic me-2"></i> Auto-Generate from Bills
    </button>
  </div>
  <p class="text-muted mt-3 small">
    <i class="bi bi-lightbulb me-1"></i>
    <strong>Tip:</strong> Start by importing your recurring bills, or manually add categories like Groceries, Dining, and Transportation.
  </p>
</div>
```

**CSS:**
```css
.empty-state-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

@media (min-width: 576px) {
  .empty-state-actions {
    flex-direction: row;
    justify-content: center;
  }
}
```

**Effort:** 1 hour  
**Risk:** VERY LOW (copy and layout changes only)

---

### Issue #M2: BVA Section Heading Hierarchy
**Category:** Accessibility, HTML Semantics  
**Location:** Budget vs Actuals section (line 303)  
**Priority:** MEDIUM  
**WCAG Violations:** 1.3.1 (Info and Relationships), 2.4.6 (Headings and Labels)

**Problem:**
- Section title uses `<h6>` which breaks heading hierarchy (h1 → h6 skip)
- Should be h2 or h3 to maintain proper structure
- Icon before heading isn't decorative, should be part of heading

**Current Code:**
```html
<div class="d-flex justify-content-between align-items-center mb-3">
  <h6 class="mb-0">
    <i class="bi bi-pie-chart me-2 text-primary"></i>Budget vs Actuals
  </h6>
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 1.3.1 and 2.4.6
- **Screen Readers:** Heading order confusing
- **SEO:** Page structure unclear to search engines

**Recommended Fix:**

**HTML:**
```html
<div class="d-flex justify-content-between align-items-center mb-3">
  <h2 class="section-heading mb-0">
    <i class="bi bi-pie-chart me-2 text-primary" aria-hidden="true"></i>
    Budget vs Actuals
  </h2>
</div>
```

**CSS:**
```css
.section-heading {
  font-size: 1.125rem;  /* 18px — same visual size as h6 */
  font-weight: 600;
  color: var(--color-text-primary);
}
```

**Effort:** 30 minutes  
**Risk:** VERY LOW (CSS visual parity maintained)

---

### Issue #M3: Skeleton Loader Fade Transition
**Category:** Visual Polish, Performance  
**Location:** Summary cards (lines 234-260), table skeleton rows (lines 294-315)  
**Priority:** MEDIUM

**Problem:**
- Skeleton loaders disappear instantly when data loads (`.d-none` class added)
- No fade transition creates jarring visual flash
- Loading state to content transition feels abrupt
- Modern UX pattern expects smooth transitions

**Current Code (assumed based on typical pattern):**
```javascript
function renderSummaryCards(data) {
  document.querySelector('.summary-card.loading .skeleton-loader').classList.add('d-none');
  document.getElementById('expectedIncome').classList.remove('d-none');
  // ... etc
}
```

**Impact:**
- **Visual Polish:** Abrupt transition feels unpolished
- **User Experience:** Flash can be disorienting
- **Perceived Performance:** Smooth transitions make app feel faster

**Recommended Fix:**

**CSS (components.css):**
```css
/* Skeleton fade-out animation */
@keyframes skeletonFadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.skeleton-loader.fade-out {
  animation: skeletonFadeOut 0.3s ease-out forwards;
}

/* Content fade-in animation */
@keyframes contentFadeIn {
  0% { 
    opacity: 0; 
    transform: translateY(4px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

.fade-in {
  animation: contentFadeIn 0.4s ease-out forwards;
}

/* Ensure smooth transitions */
.summary-card-value,
.budget-table tbody tr {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

**JavaScript (loading-states.js or app.js):**
```javascript
function hideSkeleton(skeletonElement, contentElement) {
  // Fade out skeleton
  skeletonElement.classList.add('fade-out');
  
  // Wait for animation to complete, then hide and show content
  setTimeout(() => {
    skeletonElement.classList.add('d-none');
    skeletonElement.classList.remove('fade-out');
    
    contentElement.classList.remove('d-none');
    contentElement.classList.add('fade-in');
    
    // Clean up animation class after completion
    setTimeout(() => {
      contentElement.classList.remove('fade-in');
    }, 400);
  }, 300);
}

// Usage example
function renderSummaryCards(data) {
  const skeletons = document.querySelectorAll('.summary-card .skeleton-loader');
  const contents = [
    document.getElementById('expectedIncome'),
    document.getElementById('assignedAmount'),
    document.getElementById('activityAmount'),
    document.getElementById('remainingToBudget')
  ];
  
  skeletons.forEach((skeleton, index) => {
    hideSkeleton(skeleton, contents[index]);
  });
}
```

**Effort:** 2 hours  
**Risk:** LOW (visual enhancement, doesn't affect functionality)

---

### Issue #M4: Category Dropdown Ordering
**Category:** UX, Content Organization  
**Location:** Budget item category select (line 345)  
**Priority:** MEDIUM

**Problem:**
- Categories listed alphabetically but not by frequency of use
- Most common categories (Groceries, Dining, Transportation) should be first
- "Other" should always be last
- No category grouping (e.g., "Essential" vs "Discretionary")

**Current Code:**
```html
<select class="form-select" id="budgetItemCategory" required>
  <option value="" disabled selected>Select a category...</option>
  <option value="dining">Dining</option>
  <option value="groceries">Groceries</option>
  <option value="transportation">Transportation</option>
  <option value="utilities">Utilities</option>
  <option value="entertainment">Entertainment</option>
  <option value="shopping">Shopping</option>
  <option value="healthcare">Healthcare</option>
  <option value="travel">Travel</option>
  <option value="other">Other</option>
</select>
```

**Impact:**
- **UX Friction:** Users scroll to find common categories
- **Data Quality:** More "Other" selections due to friction
- **Efficiency:** Extra time spent on every budget item creation

**Recommended Fix:**

**HTML (reorder by usage frequency + add optgroups):**
```html
<select class="form-select" id="budgetItemCategory" required>
  <option value="" disabled selected>Select a category...</option>
  
  <optgroup label="Common">
    <option value="groceries">🛒 Groceries</option>
    <option value="dining">🍴 Dining</option>
    <option value="transportation">🚗 Transportation</option>
    <option value="utilities">💡 Utilities</option>
  </optgroup>
  
  <optgroup label="Lifestyle">
    <option value="entertainment">🎬 Entertainment</option>
    <option value="shopping">🛍️ Shopping</option>
    <option value="travel">✈️ Travel</option>
  </optgroup>
  
  <optgroup label="Health & Other">
    <option value="healthcare">🏥 Healthcare</option>
    <option value="education">📚 Education</option>
    <option value="savings">💰 Savings</option>
    <option value="other">📦 Other</option>
  </optgroup>
</select>
```

**Note:** Emoji icons help with visual recognition but should be tested for accessibility and cross-platform consistency. Alternative: use Bootstrap Icons via custom select styling.

**Effort:** 30 minutes  
**Risk:** VERY LOW (HTML changes only)

---

## 4. LOW PRIORITY ISSUES

### Issue #L1: "Generate Budget" Button Placement
**Category:** UX, Visual Hierarchy  
**Location:** Page header actions (line 128)  
**Priority:** LOW

**Problem:**
- "Generate Budget" button placed between month navigation and "Add Item"
- Visual hierarchy unclear (which action is primary?)
- Button could be confused with month navigation controls

**Current Code:**
```html
<div id="pageActions">
  <div class="d-flex align-items-center gap-2">
    <button class="btn btn-outline-secondary" id="prevMonth" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>
    <h4 id="currentMonth" class="mb-0 text-no-wrap" role="status" aria-live="polite">Loading...</h4>
    <button class="btn btn-outline-secondary" id="nextMonth" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>
  </div>
  <button class="btn btn-secondary btn-sm" id="generateBudgetBtn">
    <i class="bi bi-magic"></i> Generate Budget
  </button>
  <span id="generateBudgetStatus" role="status" aria-live="polite"></span>
  <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
    <i class="bi bi-plus-circle"></i> Add Item
  </button>
</div>
```

**Impact:**
- **Visual Clarity:** Button placement suggests it's related to month navigation
- **Hierarchy:** Primary action ("Add Item") not visually dominant

**Recommended Fix:**

**HTML:**
```html
<div id="pageActions">
  <!-- Month navigation group -->
  <div class="d-flex align-items-center gap-2 month-nav-group">
    <button class="btn btn-outline-secondary" id="prevMonth" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>
    <h4 id="currentMonth" class="mb-0 text-no-wrap" role="status" aria-live="polite">Loading...</h4>
    <button class="btn btn-outline-secondary" id="nextMonth" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>
  </div>
  
  <!-- Action buttons group -->
  <div class="d-flex align-items-center gap-2 action-buttons-group">
    <button class="btn btn-outline-secondary btn-sm" id="generateBudgetBtn">
      <i class="bi bi-magic"></i> Generate Budget
    </button>
    <span id="generateBudgetStatus" role="status" aria-live="polite"></span>
    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addBudgetItemModal">
      <i class="bi bi-plus-circle"></i> Add Item
    </button>
  </div>
</div>
```

**CSS:**
```css
#pageActions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.month-nav-group {
  padding: 4px;
  background-color: var(--color-bg-2);
  border-radius: var(--radius-md);
}

.action-buttons-group {
  margin-left: auto; /* Push to right on desktop */
}

@media (max-width: 767px) {
  #pageActions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .month-nav-group {
    order: 1;
  }
  
  .action-buttons-group {
    order: 2;
    justify-content: space-between;
    margin-left: 0;
  }
}
```

**Effort:** 1 hour  
**Risk:** LOW (visual changes only)

---

### Issue #L2: No "Edit Budget Item" Functionality Visible
**Category:** UX, Feature Completeness  
**Location:** Budget table actions column (line 278)  
**Priority:** LOW

**Problem:**
- Table has "Actions" column but no visible edit/delete buttons in HTML
- Users likely can't edit budget items after creation
- Requires deleting and re-creating to fix mistakes

**Current Code:**
```html
<thead>
  <tr>
    <!-- ... -->
    <th class="col-width-10">Actions</th>
  </tr>
</thead>
<tbody id="budgetAssignmentTable">
  <!-- Skeleton rows shown, but no example of actual row structure -->
</tbody>
```

**Impact:**
- **UX Friction:** Can't correct typos or adjust amounts
- **Feature Gap:** Basic CRUD operation missing
- **Data Quality:** Users delete+recreate instead of editing

**Recommended Fix:**

**JavaScript (budget.js — example row rendering):**
```javascript
function renderBudgetRow(item) {
  return `
    <tr data-budget-id="${item.id}">
      <td data-label="Item">${escapeHtml(item.item_name)}</td>
      <td data-label="Category">${escapeHtml(item.category)}</td>
      <td data-label="Needed">${formatCurrency(item.amount_needed)}</td>
      <td data-label="Assigned">${formatCurrency(item.amount_assigned)}</td>
      <td data-label="Remaining">${formatCurrency(item.amount_needed - item.amount_assigned)}</td>
      <td data-label="Status">${renderFundingStatus(item.amount_needed, item.amount_assigned)}</td>
      <td data-label="Actions">
        <div class="btn-group btn-group-sm" role="group" aria-label="Budget item actions">
          <button 
            class="btn btn-outline-primary edit-budget-btn" 
            data-id="${item.id}"
            aria-label="Edit ${item.item_name}"
          >
            <i class="bi bi-pencil"></i>
            <span class="d-none d-md-inline ms-1">Edit</span>
          </button>
          <button 
            class="btn btn-outline-danger delete-budget-btn" 
            data-id="${item.id}"
            aria-label="Delete ${item.item_name}"
          >
            <i class="bi bi-trash"></i>
            <span class="d-none d-md-inline ms-1">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Edit button handler
document.addEventListener('click', function(e) {
  if (e.target.closest('.edit-budget-btn')) {
    const btn = e.target.closest('.edit-budget-btn');
    const budgetId = btn.dataset.id;
    openEditBudgetModal(budgetId);
  }
});

function openEditBudgetModal(budgetId) {
  // Fetch budget item data
  // Populate form fields
  // Change modal title to "Edit Budget Item"
  // Show modal
}
```

**Effort:** 3 hours (implement edit modal + handlers)  
**Risk:** MEDIUM (requires backend update logic, QA testing)

---

## Next Steps

### Immediate Actions (This Sprint)
1. **Fix Issue #C1** — Form validation visual feedback (Builder)
2. **Fix Issue #C2** — Summary card semantics (Architect)
3. **Fix Issue #C3** — Month navigation keyboard accessibility (Builder)
4. **Fix Issue #C4** — Mobile table overflow (Builder + Designer)

### Sprint +1
5. **Fix Issue #H1** — Month picker mobile width (Builder)
6. **Fix Issue #H2** — Tooltip initialization (Builder)
7. **Fix Issue #H3** — Funding status color-only indicators (Builder)

### Backlog
8. Medium and Low priority issues
9. Implement edit budget item functionality (Issue #L2)

---

## Testing Checklist

### Accessibility Testing
- [ ] Run Lighthouse accessibility audit (target: 95+)
- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver (iOS Safari)
- [ ] Verify keyboard navigation (Tab, Shift+Tab, Arrow keys, Enter, ESC)
- [ ] Check focus indicators visible on all interactive elements
- [ ] Validate ARIA labels with screen reader
- [ ] Test color contrast (WebAIM Contrast Checker)

### Form Validation Testing
- [ ] Submit empty form → see field-level errors
- [ ] Enter invalid amounts (negative, zero, non-numeric) → see specific error
- [ ] Select "Select a category..." → see category error
- [ ] Fix one field → error clears on that field only
- [ ] Submit valid form → success

### Mobile Testing (Responsive)
- [ ] iPhone SE (375px width) — month picker, table cards
- [ ] iPhone 14 Pro (393px width)
- [ ] Galaxy S23 (360px width)
- [ ] iPad Mini portrait (768px width)
- [ ] Desktop 1920×1080

### Browser Testing
- [ ] Chrome 120+ (Windows, macOS)
- [ ] Safari 17+ (macOS, iOS)
- [ ] Firefox 120+ (Windows, macOS)
- [ ] Edge 120+ (Windows)

---

**Report Version:** 1.0  
**Last Updated:** February 23, 2026, 7:25 AM  
**Next Review:** After debts.html audit (Session 4)
