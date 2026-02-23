# UI/UX Audit Report — Fireside Capital Dashboard: Bills Page

**Audit Date:** Monday, February 23, 2026, 6:11 AM  
**Auditor:** Architect (Capital AI)  
**Scope:** bills.html — Recurring Bills & Subscriptions Management  
**Design System:** Fireside 365 Logo-Native (design-tokens.css v2.0)  
**Session:** 2 of 12

---

## Executive Summary

The Bills page demonstrates strong functional design with comprehensive features (email bill scanning, shared bills, amortization schedules, subscription insights). However, several critical accessibility gaps, mobile UX friction points, and form validation issues require immediate attention to meet WCAG 2.1 AA standards and improve user experience.

### Priority Breakdown
- **CRITICAL (3)**: Form validation UX, required field indicators, financing field calculation feedback
- **HIGH (4)**: Mobile touch targets, empty state consistency, delete confirmation safety, shared bill deletion UX
- **MEDIUM (4)**: Email scan modal sizing, amortization modal scrolling, split calculator preview, batch actions placement
- **LOW (3)**: Filter button group semantics, table responsiveness, loan term unit selector width

**Total Issues:** 14  
**Estimated Remediation Time:** 18 hours (1.5 sprints)

---

## 1. CRITICAL ISSUES

### Issue #10: Form Validation Visual Feedback Missing (WCAG 2.1 Failure)
**Category:** Accessibility, Form UX  
**Location:** Add Bill Modal (line 445), Bill Form inputs  
**Priority:** CRITICAL  
**WCAG Violations:** 3.3.1 (Error Identification), 3.3.3 (Error Suggestion), 3.3.2 (Labels or Instructions)

**Problem:**
- Required fields (`billName`, `billAmount`, `billType`, `billFrequency`) lack visual indicators
- Only a red asterisk (*) marks required fields — not visible to screen readers
- No inline error messages when validation fails
- Bootstrap `.is-invalid` class not applied on field-level errors
- Users submit incomplete forms, get generic alert, don't know which field is wrong

**Current Code:**
```html
<div class="mb-3">
  <label for="billName" class="form-label mb-1">Bill Name <span class="text-danger">*</span></label>
  <input type="text" class="form-control" id="billName" required placeholder="e.g., Electric Bill, Netflix">
</div>
<!-- No error feedback div, no aria-invalid, no aria-describedby -->
```

**JavaScript Validation (current):**
```javascript
// Generic alert only — no field-level feedback
if (!billName.value.trim()) {
  showAlert('Bill name is required', 'danger');
  return;
}
```

**Impact:**
- **WCAG 2.1 Failures:**
  - 3.3.1 Error Identification: Errors not associated with specific fields
  - 3.3.3 Error Suggestion: No guidance on how to fix errors
  - 3.3.2 Labels: Required indicator not accessible
- **Screen Readers:** Users don't know which field is invalid
- **Mobile UX:** Alert at top scrolls off-screen on small devices
- **User Frustration:** "What did I do wrong?" — re-enter all fields

**Recommended Fix:**

**HTML Structure:**
```html
<div class="mb-3">
  <label for="billName" class="form-label mb-1">
    Bill Name 
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <input 
    type="text" 
    class="form-control" 
    id="billName" 
    name="billName"
    required 
    placeholder="e.g., Electric Bill, Netflix"
    aria-describedby="billNameError"
    aria-invalid="false"
    aria-required="true"
  >
  <div id="billNameError" class="invalid-feedback" style="display: none;">
    Please enter a bill name (e.g., Electric Bill, Netflix)
  </div>
</div>

<div class="mb-3">
  <label for="billAmount" class="form-label mb-1">
    Amount ($) 
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <input 
    type="number" 
    class="form-control" 
    id="billAmount" 
    name="billAmount"
    required 
    min="0" 
    step="0.01" 
    placeholder="e.g., 125.50"
    aria-describedby="billAmountError billAmountHelp"
    aria-invalid="false"
    aria-required="true"
  >
  <small class="form-text text-muted" id="billAmountHelp">Enter the typical monthly amount</small>
  <div id="billAmountError" class="invalid-feedback" style="display: none;">
    Please enter a valid amount greater than $0.00
  </div>
</div>

<div class="mb-3">
  <label for="billType" class="form-label mb-1">
    Type
    <span class="text-danger" aria-label="required">*</span>
    <span class="visually-hidden">(required)</span>
  </label>
  <select 
    class="form-select" 
    id="billType" 
    name="billType"
    required
    aria-describedby="billTypeError"
    aria-invalid="false"
    aria-required="true"
  >
    <option value="">Choose...</option>
    <option value="housing">Housing</option>
    <option value="auto">Auto</option>
    <option value="utilities">Utilities</option>
    <option value="financing">Financing</option>
    <option value="health">Health</option>
    <option value="subscriptions">Subscriptions</option>
    <option value="other">Other</option>
  </select>
  <div id="billTypeError" class="invalid-feedback" style="display: none;">
    Please select a bill category
  </div>
</div>
```

**JavaScript Validation:**
```javascript
// Real-time validation on blur
function validateBillName() {
  const input = document.getElementById('billName');
  const errorDiv = document.getElementById('billNameError');
  const value = input.value.trim();
  
  if (value.length === 0) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please enter a bill name (e.g., Electric Bill, Netflix)';
    return false;
  } else if (value.length < 2) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Bill name must be at least 2 characters';
    return false;
  } else {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    errorDiv.style.display = 'none';
    return true;
  }
}

function validateBillAmount() {
  const input = document.getElementById('billAmount');
  const errorDiv = document.getElementById('billAmountError');
  const value = parseFloat(input.value);
  
  if (isNaN(value) || value <= 0) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please enter a valid amount greater than $0.00';
    return false;
  } else {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    errorDiv.style.display = 'none';
    return true;
  }
}

function validateBillType() {
  const select = document.getElementById('billType');
  const errorDiv = document.getElementById('billTypeError');
  
  if (!select.value || select.value === '') {
    select.classList.add('is-invalid');
    select.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please select a bill category';
    return false;
  } else {
    select.classList.remove('is-invalid');
    select.setAttribute('aria-invalid', 'false');
    errorDiv.style.display = 'none';
    return true;
  }
}

// Attach blur event listeners
document.getElementById('billName').addEventListener('blur', validateBillName);
document.getElementById('billAmount').addEventListener('blur', validateBillAmount);
document.getElementById('billType').addEventListener('change', validateBillType);
document.getElementById('billFrequency').addEventListener('change', function() {
  const errorDiv = document.getElementById('billFrequencyError');
  if (!this.value) {
    this.classList.add('is-invalid');
    this.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
  } else {
    this.classList.remove('is-invalid');
    this.setAttribute('aria-invalid', 'false');
    errorDiv.style.display = 'none';
  }
});

// Master validation on submit
document.getElementById('saveBillBtn').addEventListener('click', async function() {
  const validations = [
    validateBillName(),
    validateBillAmount(),
    validateBillType(),
    // Add frequency, next due date if needed
  ];
  
  if (!validations.every(v => v === true)) {
    showToast('Please fix the errors highlighted below', 'danger');
    return;
  }
  
  // Proceed with save
  await saveBill();
});
```

**Effort:** 6 hours (apply to all form fields, QA testing)  
**Risk:** MEDIUM (requires JS refactor, testing across all bill types)

---

### Issue #11: Financing Fields Calculator Feedback Delayed
**Category:** UX, Real-time Feedback  
**Location:** Financing Fields Section (line 483), Loan Calculation Preview (line 526)  
**Priority:** CRITICAL

**Problem:**
- Loan calculator preview (`#loanCalcPreview`) only shows after all fields are filled
- Remaining balance calculation (`#remainingBalanceDisplay`) shows "?" until calculation
- Users don't know if they're entering the right values until the very end
- No real-time feedback on whether interest rate or loan term is reasonable

**Current Code:**
```html
<div class="row g-3 mt-2">
  <div class="col-12">
    <label class="form-label mb-1">Remaining Balance</label>
    <div id="remainingBalanceDisplay" class="form-control-plaintext fw-semibold icon-primary" style="font-size: 1.1rem;">?</div>
  </div>
</div>
<div id="loanCalcPreview" class="mt-3 d-none">
  <!-- Only shows when calculation complete -->
</div>
```

**Impact:**
- **User Confusion:** "Is this calculating anything?"
- **Data Entry Errors:** Users enter wrong values, don't realize until form submission
- **Workflow Friction:** Must fill all fields before seeing if calculation makes sense

**Recommended Fix:**

**HTML Enhancement:**
```html
<div class="row g-3 mt-2">
  <div class="col-12">
    <label class="form-label mb-1">Remaining Balance</label>
    <div id="remainingBalanceDisplay" class="form-control-plaintext fw-semibold icon-primary" style="font-size: 1.1rem;" role="status" aria-live="polite">
      <span class="text-muted">Enter loan details to calculate...</span>
    </div>
  </div>
</div>

<!-- Always-visible calculation preview -->
<div id="loanCalcPreview" class="mt-3">
  <div class="card card-bg-info">
    <div class="card-body py-2 px-3">
      <div class="row">
        <div class="col-md-6">
          <small class="text-color-tertiary">Calculated Monthly Payment: </small>
          <div id="calcMonthlyPayment" class="fw-semibold" role="status" aria-live="polite">
            <span class="text-muted">—</span>
          </div>
        </div>
        <div class="col-md-6">
          <small class="text-color-tertiary">Total Interest: </small>
          <div id="calcTotalInterest" class="fw-semibold" role="status" aria-live="polite">
            <span class="text-muted">—</span>
          </div>
        </div>
      </div>
      <div class="mt-2" id="calcWarnings">
        <!-- Real-time warnings go here -->
      </div>
    </div>
  </div>
</div>
```

**JavaScript Real-time Calculator:**
```javascript
// Trigger calculation on any financing field change
const financingInputs = [
  'billInterestRate',
  'billOriginalPrincipal',
  'billLoanTermValue',
  'billLoanTermUnit',
  'billStartDate',
  'billPaymentsMade',
  'billAmount'
];

financingInputs.forEach(inputId => {
  const input = document.getElementById(inputId);
  if (input) {
    input.addEventListener('input', calculateLoanPreview);
    input.addEventListener('change', calculateLoanPreview);
  }
});

function calculateLoanPreview() {
  const rate = parseFloat(document.getElementById('billInterestRate')?.value) || 0;
  const principal = parseFloat(document.getElementById('billOriginalPrincipal')?.value) || 0;
  const termValue = parseFloat(document.getElementById('billLoanTermValue')?.value) || 0;
  const termUnit = document.getElementById('billLoanTermUnit')?.value || 'months';
  const paymentsMade = parseFloat(document.getElementById('billPaymentsMade')?.value) || 0;
  
  const displayMonthly = document.getElementById('calcMonthlyPayment');
  const displayInterest = document.getElementById('calcTotalInterest');
  const displayRemaining = document.getElementById('remainingBalanceDisplay');
  const warningsDiv = document.getElementById('calcWarnings');
  
  // Clear warnings
  warningsDiv.innerHTML = '';
  
  // Check if we have minimum data
  if (!principal || !rate || !termValue) {
    displayMonthly.innerHTML = '<span class="text-muted">—</span>';
    displayInterest.innerHTML = '<span class="text-muted">—</span>';
    displayRemaining.innerHTML = '<span class="text-muted">Enter loan details to calculate...</span>';
    return;
  }
  
  // Convert term to months
  const termMonths = termUnit === 'years' ? termValue * 12 : termValue;
  
  // Calculate monthly payment using standard loan formula
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  // Calculate total interest
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal;
  
  // Calculate remaining balance
  const remainingMonths = termMonths - paymentsMade;
  const remainingBalance = monthlyPayment * ((Math.pow(1 + monthlyRate, remainingMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)));
  
  // Update display
  displayMonthly.innerHTML = `<span class="icon-primary">${formatCurrency(monthlyPayment)}</span>`;
  displayInterest.innerHTML = `<span class="icon-secondary">${formatCurrency(totalInterest)}</span>`;
  displayRemaining.innerHTML = `<span class="icon-primary">${formatCurrency(remainingBalance)}</span>`;
  
  // Show warnings for unusual values
  if (rate > 20) {
    warningsDiv.innerHTML += `<div class="alert alert-warning py-1 px-2 mb-0"><i class="bi bi-exclamation-triangle me-1"></i><small>Interest rate seems high (${rate.toFixed(2)}% APR). Double-check this value.</small></div>`;
  }
  
  if (monthlyPayment > principal * 0.1) {
    warningsDiv.innerHTML += `<div class="alert alert-info py-1 px-2 mb-0 mt-1"><i class="bi bi-info-circle me-1"></i><small>Monthly payment is ${((monthlyPayment / principal) * 100).toFixed(1)}% of the loan amount. This is a short-term loan.</small></div>`;
  }
  
  if (totalInterest > principal) {
    warningsDiv.innerHTML += `<div class="alert alert-warning py-1 px-2 mb-0 mt-1"><i class="bi bi-exclamation-triangle me-1"></i><small>You'll pay ${formatCurrency(totalInterest)} in interest — more than the original ${formatCurrency(principal)} loan!</small></div>`;
  }
}
```

**Effort:** 4 hours (JS calculation + real-time feedback + QA)  
**Risk:** LOW (improves UX, doesn't break existing functionality)

---

### Issue #12: Shared Bill Deletion Lacks Context
**Category:** Safety, Data Integrity  
**Location:** Shared Bill Delete Warning Modal (line 649)  
**Priority:** CRITICAL

**Problem:**
- Modal shows "You are sharing this bill with X other user(s)" but doesn't show WHO
- Users might accidentally delete bills shared with specific people
- No "unshare instead of delete" option
- Modal doesn't explain what happens to the shared data

**Current Code:**
```html
<div class="modal-body">
  <p><strong id="sharedBillName"></strong> is shared with <strong id="sharedUserCount"></strong> other user(s).</p>
  <p class="text-danger">
    <i class="bi bi-exclamation-circle me-1"></i>
    Deleting this bill will remove it from their accounts as well.
  </p>
  <p>Are you sure you want to delete it?</p>
</div>
```

**Impact:**
- **Safety:** Users delete shared bills without realizing impact
- **Data Loss:** Accidentally removes bills from other users' accounts
- **Social Friction:** "Why did you delete the electricity bill?!"
- **No Escape Hatch:** Can't unshare without deleting

**Recommended Fix:**

**HTML Enhancement:**
```html
<div class="modal-body">
  <div class="alert alert-warning mb-3">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    <strong>Warning:</strong> This bill is shared with others.
  </div>
  
  <p class="mb-2">Bill: <strong id="sharedBillName"></strong></p>
  
  <div class="mb-3">
    <p class="mb-1 fw-semibold">Currently shared with:</p>
    <ul id="sharedUserList" class="list-unstyled mb-0 ms-3">
      <!-- Populated by JS -->
    </ul>
  </div>
  
  <div class="alert alert-danger mb-3">
    <i class="bi bi-exclamation-circle me-1"></i>
    <strong>If you delete this bill:</strong>
    <ul class="mb-0 mt-2">
      <li>It will be removed from <strong id="sharedUserCount2"></strong> other user account(s)</li>
      <li>Their payment history for this bill will be lost</li>
      <li>They will NOT be notified automatically</li>
    </ul>
  </div>
  
  <p class="mb-3">
    <strong>Alternative:</strong> You can 
    <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none" id="unshareInsteadBtn">
      unshare this bill instead
    </button> 
    to keep it for yourself while removing it from their accounts.
  </p>
  
  <p class="fw-semibold">Are you sure you want to permanently delete this shared bill?</p>
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="button" class="btn btn-outline-warning" id="unshareBtn">
    <i class="bi bi-share-fill me-1"></i>Unshare Only
  </button>
  <button type="button" class="btn btn-danger" id="confirmSharedBillDelete">
    <i class="bi bi-trash me-1"></i>Yes, Delete for Everyone
  </button>
</div>
```

**JavaScript Enhancement:**
```javascript
async function showSharedBillDeleteWarning(billId, billName, sharedWith) {
  const modal = document.getElementById('sharedBillDeleteWarningModal');
  const nameEl = document.getElementById('sharedBillName');
  const countEl = document.getElementById('sharedUserCount');
  const count2El = document.getElementById('sharedUserCount2');
  const listEl = document.getElementById('sharedUserList');
  
  // Set bill name
  nameEl.textContent = billName;
  countEl.textContent = sharedWith.length;
  count2El.textContent = sharedWith.length;
  
  // Populate user list
  listEl.innerHTML = sharedWith.map(user => 
    `<li><i class="bi bi-person-fill me-2 text-primary"></i>${user.name} (${user.email})</li>`
  ).join('');
  
  // Unshare instead button
  document.getElementById('unshareInsteadBtn').onclick = async function() {
    await unshareBill(billId);
    bootstrap.Modal.getInstance(modal).hide();
    showToast(`Unshared "${billName}" from ${sharedWith.length} user(s)`, 'success');
    await loadBills(); // Refresh
  };
  
  document.getElementById('unshareBtn').onclick = async function() {
    await unshareBill(billId);
    bootstrap.Modal.getInstance(modal).hide();
    showToast(`Unshared "${billName}" from ${sharedWith.length} user(s)`, 'success');
    await loadBills();
  };
  
  // Confirm delete
  document.getElementById('confirmSharedBillDelete').onclick = async function() {
    await deleteBill(billId, true); // true = delete for everyone
    bootstrap.Modal.getInstance(modal).hide();
    showToast(`Deleted "${billName}" for everyone`, 'success');
    await loadBills();
  };
  
  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

async function unshareBill(billId) {
  const { data, error } = await sb
    .from('shared_bills')
    .delete()
    .eq('bill_id', billId)
    .eq('owner_id', currentUser.id);
  
  if (error) throw error;
  return data;
}
```

**Effort:** 4 hours (UI enhancement + unshare logic + QA)  
**Risk:** MEDIUM (requires shared_bills table queries, testing with multiple users)

---

## 2. HIGH PRIORITY ISSUES

### Issue #13: Empty State Missing Call-to-Action Icon
**Category:** UX, Visual Design  
**Location:** Empty State (line 232)  
**Priority:** HIGH

**Problem:**
- Empty state shows text-based icon (bi bi-receipt) but could be more visually prominent
- No illustration or graphic to break up monotony
- CTA button could be more prominent (should be larger on mobile)

**Current Code:**
```html
<div id="billEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-receipt empty-state-icon"></i>
  <h3>No Bills Tracked</h3>
  <p>Add your recurring bills and subscriptions to track payments and stay on top of your finances.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Bill
  </button>
</div>
```

**Recommended Fix:**
```html
<div id="billEmptyState" class="empty-state" style="display:none">
  <div class="empty-state-icon mb-4">
    <i class="bi bi-receipt"></i>
  </div>
  <h3 class="empty-state-title">No Bills Tracked</h3>
  <p class="empty-state-description">Add your recurring bills and subscriptions to track payments and stay on top of your finances.</p>
  <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#addBillModal" aria-label="Add your first bill">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Bill
  </button>
  <div class="empty-state-suggestion mt-3">
    <small class="text-muted">
      <i class="bi bi-lightbulb me-1"></i>
      Tip: Use "Scan Email for Bills" to import bills automatically from Gmail
    </small>
  </div>
</div>
```

**CSS Enhancement (add to components.css):**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  min-height: 400px;
}

.empty-state-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-bg-3) 0%, var(--color-bg-2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state-icon i {
  font-size: 56px;
  color: var(--color-text-tertiary);
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.empty-state-description {
  font-size: 15px;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin-bottom: 32px;
  line-height: 1.6;
}

.empty-state-suggestion {
  max-width: 500px;
}
```

**Effort:** 2 hours  
**Risk:** LOW (purely visual enhancement)

---

### Issue #14: Filter Button Group Lacks ARIA Semantics
**Category:** Accessibility (WCAG 2.1)  
**Location:** Filter Buttons (line 223)  
**Priority:** HIGH

**Problem:**
- "All Bills" / "Subscriptions Only" buttons use `aria-pressed` but not wrapped in proper `role="group"`
- Screen readers don't announce this as a filter group
- No indication that these are mutually exclusive options
- Missing ARIA labels for what these filters do

**Current Code:**
```html
<div class="d-flex flex-column flex-sm-row gap-2" role="group" aria-label="Bill filters">
  <button type="button" class="btn btn-sm btn-outline-secondary active" id="showAllBillsBtn" aria-pressed="true">
    All Bills
  </button>
  <button type="button" class="btn btn-sm btn-outline-secondary" id="showSubscriptionsBtn" aria-pressed="false">
    <i class="bi bi-credit-card-2-front me-1"></i>Subscriptions Only
  </button>
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 4.1.2 (Name, Role, Value) — role not properly conveyed
- **Screen Readers:** Announces as two separate buttons, not a filter group
- **Keyboard Navigation:** No indication that these are mutually exclusive

**Recommended Fix:**
```html
<div class="btn-group" role="radiogroup" aria-label="Bill filter options">
  <input type="radio" class="btn-check" name="billFilter" id="filterAllBills" value="all" checked autocomplete="off">
  <label class="btn btn-sm btn-outline-secondary" for="filterAllBills">
    All Bills
  </label>

  <input type="radio" class="btn-check" name="billFilter" id="filterSubscriptions" value="subscriptions" autocomplete="off">
  <label class="btn btn-sm btn-outline-secondary" for="filterSubscriptions">
    <i class="bi bi-credit-card-2-front me-1"></i>Subscriptions Only
  </label>
</div>
```

**JavaScript Update:**
```javascript
// Listen for radio button changes
document.querySelectorAll('input[name="billFilter"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const filter = this.value;
    if (filter === 'all') {
      showAllBills();
    } else if (filter === 'subscriptions') {
      showSubscriptionsOnly();
    }
  });
});
```

**Effort:** 1 hour  
**Risk:** LOW (Bootstrap pattern, no breaking changes)

---

### Issue #15: Scan Email Button Placement Confusion
**Category:** Mobile UX, Button Hierarchy  
**Location:** Page Header Actions (line 191)  
**Priority:** HIGH

**Problem:**
- "Scan Email for Bills" button is same size as "Add Bill" (both `btn-lg`)
- On mobile, both buttons stack vertically and take equal visual weight
- Primary action ("Add Bill") should be more prominent
- "Scan Email" is a secondary/utility action but looks primary

**Current Code:**
```html
<div id="pageActions">
  <div class="d-flex gap-2">
    <button class="btn btn-outline-secondary btn-lg" id="scanEmailBillsBtn">
      <i class="bi bi-envelope-check"></i> Scan Email for Bills
    </button>
    <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#addBillModal">
      <i class="bi bi-plus-circle"></i> Add Bill
    </button>
  </div>
</div>
```

**Impact:**
- **Mobile UX:** Both buttons equally prominent, unclear which is primary
- **New Users:** Might click "Scan Email" first (which requires Gmail setup)
- **Visual Hierarchy:** Secondary action gets too much weight

**Recommended Fix:**
```html
<div id="pageActions">
  <div class="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
    <!-- Primary action — large, prominent -->
    <button 
      class="btn btn-primary btn-lg order-1 order-sm-2" 
      data-bs-toggle="modal" 
      data-bs-target="#addBillModal"
      aria-label="Add new bill"
    >
      <i class="bi bi-plus-circle"></i> Add Bill
    </button>
    
    <!-- Secondary action — smaller, less prominent -->
    <button 
      class="btn btn-outline-secondary order-2 order-sm-1" 
      id="scanEmailBillsBtn"
      aria-label="Scan email for bills"
    >
      <i class="bi bi-envelope-check"></i> Scan Email for Bills
    </button>
  </div>
</div>

<!-- On mobile: Primary button appears first (order-1), full width -->
<!-- On desktop: Scan Email appears first (left), Add Bill appears second (right) -->
```

**CSS Enhancement:**
```css
@media (max-width: 575px) {
  #pageActions .btn-primary {
    width: 100%;
    font-size: 1rem;
    padding: 12px 24px;
  }
  
  #pageActions .btn-outline-secondary {
    width: 100%;
    font-size: 0.875rem;
    padding: 8px 16px;
  }
}
```

**Effort:** 1 hour  
**Risk:** VERY LOW (visual reordering only)

---

### Issue #16: Delete Confirmation Modal Lacks Bill Details
**Category:** Safety, User Confirmation  
**Location:** Confirm Delete Bill Modal (line 631)  
**Priority:** HIGH

**Problem:**
- Only shows bill name, not amount or type
- Users might delete wrong bill if names are similar ("Electric Bill" vs "Electric - Summer")
- No "last payment" or "total paid" information to help users confirm

**Current Code:**
```html
<div class="modal-body">
  Are you sure you want to delete the bill <strong id="deleteBillName"></strong>?
</div>
```

**Impact:**
- **Safety:** Users accidentally delete wrong bills
- **Data Loss:** No confirmation of what's being lost
- **User Anxiety:** "Am I deleting the right one?"

**Recommended Fix:**
```html
<div class="modal-body">
  <p class="mb-3">Are you sure you want to delete this bill?</p>
  
  <div class="card card-bg-warning mb-3">
    <div class="card-body py-2 px-3">
      <div class="row g-2">
        <div class="col-4 text-muted">Name:</div>
        <div class="col-8 fw-semibold" id="deleteBillName"></div>
        
        <div class="col-4 text-muted">Amount:</div>
        <div class="col-8 fw-semibold" id="deleteBillAmount"></div>
        
        <div class="col-4 text-muted">Type:</div>
        <div class="col-8" id="deleteBillType"></div>
        
        <div class="col-4 text-muted">Frequency:</div>
        <div class="col-8" id="deleteBillFrequency"></div>
      </div>
    </div>
  </div>
  
  <div class="alert alert-danger mb-0">
    <i class="bi bi-exclamation-triangle me-1"></i>
    <strong>This action cannot be undone.</strong> All payment history for this bill will be permanently deleted.
  </div>
</div>
```

**JavaScript Update:**
```javascript
function showDeleteBillConfirmation(bill) {
  document.getElementById('deleteBillName').textContent = bill.name;
  document.getElementById('deleteBillAmount').textContent = formatCurrency(bill.amount);
  document.getElementById('deleteBillType').textContent = capitalizeFirst(bill.type);
  document.getElementById('deleteBillFrequency').textContent = capitalizeFirst(bill.frequency);
  
  const modal = new bootstrap.Modal(document.getElementById('confirmDeleteBillModal'));
  modal.show();
  
  document.getElementById('confirmDeleteBillBtn').onclick = async function() {
    await deleteBill(bill.id);
    modal.hide();
    showToast(`Deleted "${bill.name}"`, 'success');
    await loadBills();
  };
}
```

**Effort:** 2 hours  
**Risk:** LOW (improves safety, no breaking changes)

---

## 3. MEDIUM PRIORITY ISSUES

### Issue #17: Email Review Modal Batch Actions Above Content
**Category:** UX, Information Hierarchy  
**Location:** Email Review Modal (line 734)  
**Priority:** MEDIUM

**Problem:**
- Batch action buttons ("Approve All High Confidence", "Reject All Low Confidence") appear BEFORE user sees the bills
- Users might click batch actions without reviewing individual bills
- No summary of how many bills match each confidence level

**Current Code:**
```html
<!-- Batch Actions -->
<div id="emailReviewBatchActions" class="mb-3 d-none">
  <div class="d-flex gap-2 flex-wrap">
    <button class="btn btn-sm btn-success" id="approveAllHighConfidenceBtn">
      <i class="bi bi-check-all"></i> Approve All High Confidence (≥70%)
    </button>
    <button class="btn btn-sm btn-danger" id="rejectAllLowConfidenceBtn">
      <i class="bi bi-x-circle"></i> Reject All Low Confidence (≤50%)
    </button>
    <!-- ... -->
  </div>
</div>

<!-- Bills List -->
<div id="emailReviewList">
  <!-- Populated by JS -->
</div>
```

**Recommended Fix:**
```html
<!-- Summary (appears first) -->
<div id="emailReviewSummary" class="mb-3 d-none">
  <div class="card card-bg-info">
    <div class="card-body py-2 px-3">
      <div class="row g-2 text-center">
        <div class="col-4">
          <div class="fw-semibold text-success" id="highConfidenceCount">0</div>
          <small class="text-muted">High Confidence</small>
        </div>
        <div class="col-4">
          <div class="fw-semibold text-warning" id="mediumConfidenceCount">0</div>
          <small class="text-muted">Medium Confidence</small>
        </div>
        <div class="col-4">
          <div class="fw-semibold text-danger" id="lowConfidenceCount">0</div>
          <small class="text-muted">Low Confidence</small>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Bills List (review first) -->
<div id="emailReviewList" class="mb-3">
  <!-- Populated by JS -->
</div>

<!-- Batch Actions (moved to bottom, after review) -->
<div id="emailReviewBatchActions" class="d-none">
  <hr class="my-3">
  <p class="text-muted mb-2">
    <i class="bi bi-lightning-fill me-1"></i>
    Quick Actions:
  </p>
  <div class="d-flex gap-2 flex-wrap">
    <button class="btn btn-sm btn-success" id="approveAllHighConfidenceBtn">
      <i class="bi bi-check-all"></i> Approve <span id="approveAllCount">0</span> High Confidence
    </button>
    <button class="btn btn-sm btn-danger" id="rejectAllLowConfidenceBtn">
      <i class="bi bi-x-circle"></i> Reject <span id="rejectAllCount">0</span> Low Confidence
    </button>
    <button class="btn btn-sm btn-outline-secondary" id="selectAllBtn">
      <i class="bi bi-check-square"></i> Select All
    </button>
  </div>
</div>
```

**Effort:** 2 hours  
**Risk:** LOW (reordering, no logic changes)

---

### Issue #18: Split Calculator Preview Updates Too Late
**Category:** UX, Real-time Feedback  
**Location:** Share Bill Modal (line 724)  
**Priority:** MEDIUM

**Problem:**
- Split preview only updates when users click off input fields
- No real-time feedback as users type percentages or amounts
- Percentage error message doesn't show until user clicks elsewhere

**Recommended Fix:**
Add `input` event listeners (in addition to `change`) for real-time updates:

```javascript
// Real-time split calculation
document.getElementById('shareOwnerPercent').addEventListener('input', updateSplitPreview);
document.getElementById('shareSharedPercent').addEventListener('input', updateSplitPreview);
document.getElementById('shareOwnerFixed').addEventListener('input', updateSplitPreview);
document.getElementById('shareSharedFixed').addEventListener('input', updateSplitPreview);
```

**Effort:** 1 hour  
**Risk:** VERY LOW (enhances existing functionality)

---

### Issue #19: Amortization Modal Scroll Performance
**Category:** Performance, Mobile UX  
**Location:** Amortization Schedule Modal (line 704)  
**Priority:** MEDIUM

**Problem:**
- Long amortization tables (e.g., 360 months for 30-year mortgage) cause scroll lag on mobile
- No virtualization or pagination
- Loading all rows at once blocks UI thread

**Recommended Fix:**
Implement pagination or "load more" pattern:

```html
<div class="modal-body">
  <div id="amortSummary" class="row g-3 mb-4"></div>
  
  <!-- Show first 12 months by default -->
  <div class="table-responsive">
    <table class="table table-sm align-middle mb-0" id="amortTable">
      <thead>...</thead>
      <tbody id="amortTableBody">
        <!-- First 12 rows -->
      </tbody>
    </table>
  </div>
  
  <!-- Load more button -->
  <div class="text-center mt-3" id="amortLoadMore">
    <button class="btn btn-sm btn-outline-secondary" id="loadMoreAmortBtn">
      <i class="bi bi-chevron-down me-1"></i>Load Next 12 Months
    </button>
    <p class="text-muted small mt-2">
      Showing <span id="amortShownRows">12</span> of <span id="amortTotalRows">360</span> payments
    </p>
  </div>
</div>
```

**Effort:** 3 hours  
**Risk:** MEDIUM (requires pagination logic, QA testing)

---

### Issue #20: Loan Term Unit Selector Width
**Category:** Visual Design, Mobile UX  
**Location:** Loan Term Input Group (line 496)  
**Priority:** MEDIUM

**Problem:**
- "Months" / "Years" dropdown in input group is too narrow on mobile
- Text truncates to "Mon..." / "Yea..."
- Should auto-size based on longest option

**Recommended Fix:**
```html
<div class="input-group">
  <input type="number" class="form-control" id="billLoanTermValue" min="1" step="1" placeholder="e.g. 5" style="flex: 1 1 60%;">
  <select class="form-select" id="billLoanTermUnit" style="flex: 1 1 40%; min-width: 100px;">
    <option value="months">Months</option>
    <option value="years">Years</option>
  </select>
</div>
```

**Effort:** 30 minutes  
**Risk:** VERY LOW (CSS-only)

---

## 4. LOW PRIORITY ISSUES

### Issue #21: Table Responsiveness on Galaxy Fold
**Category:** Mobile UX (Extreme Edge Case)  
**Location:** Bills Table (line 241)  
**Priority:** LOW

**Problem:**
- On ultra-narrow screens (280px width, Galaxy Fold), table columns compress too much
- Should switch to card layout below 400px width

**Recommended Fix:**
Implement card-based mobile view for narrow screens (similar to pattern used on other pages).

**Effort:** 4 hours  
**Risk:** LOW (progressive enhancement)

---

### Issue #22: Shared Bill Status Badge Missing
**Category:** UX, Visual Feedback  
**Location:** Bills Table (line 263)  
**Priority:** LOW

**Problem:**
- No visual indicator in table showing which bills are shared
- Users must click into bill to see sharing status

**Recommended Fix:**
Add a "Shared" badge in the Name column:

```html
<td>
  <strong>{{bill.name}}</strong>
  {{#if bill.is_shared}}
  <span class="badge bg-info ms-2">
    <i class="bi bi-share-fill me-1"></i>Shared
  </span>
  {{/if}}
</td>
```

**Effort:** 2 hours  
**Risk:** LOW (visual enhancement)

---

### Issue #23: Frequency Selector Missing "Custom" Option
**Category:** UX, Flexibility  
**Location:** Bill Frequency Dropdown (line 471)  
**Priority:** LOW

**Problem:**
- No "Custom" or "Every X days" option for unusual billing cycles
- Some services bill every 45 days, or every 3 months, etc.

**Recommended Fix:**
Add "Custom" option that reveals a "Bill every X days" input field.

**Effort:** 3 hours  
**Risk:** MEDIUM (requires custom frequency logic, database schema change)

---

## Next Steps

### Immediate Actions (This Sprint — Week of Feb 23)
1. **Fix Issue #10** — Form validation visual feedback (Builder)
2. **Fix Issue #11** — Financing calculator real-time feedback (Builder)
3. **Fix Issue #12** — Shared bill deletion context (Builder + Architect)
4. **Fix Issue #14** — Filter button ARIA semantics (Builder)

### Azure DevOps Work Items to Create

**User Story 1:** "As a user adding a bill, I want clear field-level error messages so I know exactly what to fix"  
- **Tasks:** Issue #10 (Form validation)  
- **Priority:** HIGH  
- **Sprint:** Current  
- **Effort:** 6 hours

**User Story 2:** "As a user entering loan details, I want real-time calculation feedback so I know if my data is correct"  
- **Tasks:** Issue #11 (Financing calculator)  
- **Priority:** HIGH  
- **Sprint:** Current  
- **Effort:** 4 hours

**User Story 3:** "As a user with shared bills, I want to see who I'm sharing with before deleting so I don't accidentally remove data from their accounts"  
- **Tasks:** Issue #12 (Shared bill deletion), Issue #16 (Delete confirmation details)  
- **Priority:** CRITICAL  
- **Sprint:** Current  
- **Effort:** 6 hours

**User Story 4:** "As a mobile user, I want the primary action button to be obvious so I know where to start"  
- **Tasks:** Issue #15 (Scan Email button hierarchy), Issue #13 (Empty state CTA)  
- **Priority:** MEDIUM  
- **Sprint:** Next  
- **Effort:** 3 hours

**Bug Fix:** WCAG 2.1 Compliance — Filter Button ARIA Semantics  
- **Tasks:** Issue #14  
- **Priority:** HIGH  
- **Sprint:** Current  
- **Effort:** 1 hour

### Next Audit Session
**Target:** transactions.html (Transactions page)  
**Focus Areas:**
- Transaction categorization UX
- Search and filter performance
- CSV import flow
- Duplicate detection UI

---

## Testing Checklist

### Accessibility Testing
- [ ] Run Lighthouse accessibility audit on bills.html (target: 95+)
- [ ] Test with NVDA screen reader (form validation announcements)
- [ ] Verify keyboard navigation (Tab through form fields, arrow keys in dropdowns)
- [ ] Check ARIA labels with screen reader (filter buttons, financing fields)
- [ ] Validate focus indicators (2px blue outline on all interactive elements)

### Form Validation Testing
- [ ] Submit empty form → field-level errors appear
- [ ] Enter invalid amount (negative, zero, text) → inline error
- [ ] Skip required dropdown → error on blur
- [ ] Fix errors → green checkmark or error removal
- [ ] Screen reader announces errors when they appear

### Financing Calculator Testing
- [ ] Enter principal → remaining balance updates
- [ ] Change interest rate → monthly payment recalculates
- [ ] Enter high APR (>20%) → warning appears
- [ ] Enter payments made → remaining balance decreases
- [ ] Switch term unit (months ↔ years) → calculations adjust

### Shared Bill Testing
- [ ] Share bill with friend → appears in "Bills I'm Sharing"
- [ ] Friend sees bill in "Shared With Me"
- [ ] Delete shared bill → warning shows friend names
- [ ] Click "Unshare Instead" → bill removed from friend, kept for self
- [ ] Delete shared bill → removed from both accounts

### Browser Testing
- [ ] Chrome 120+ (Windows, macOS)
- [ ] Safari 17+ (macOS, iOS)
- [ ] Firefox 120+ (Windows, macOS)
- [ ] Edge 120+ (Windows)

### Device Testing
- [ ] iPhone SE (375px) — page header actions stack properly
- [ ] Galaxy S23 (360px) — form inputs don't overflow
- [ ] iPad Mini portrait (768px) — table columns align
- [ ] Desktop 1920×1080 — financing fields in row layout

---

**Report Version:** 1.0  
**Last Updated:** February 23, 2026, 6:11 AM  
**Next Review:** After transactions.html audit (Session 3)
