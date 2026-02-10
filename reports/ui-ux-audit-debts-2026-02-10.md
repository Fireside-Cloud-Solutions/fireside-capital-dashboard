# UI/UX Audit Report — Debts Page
**Date:** February 10, 2026 — 5:48 AM  
**Page:** debts.html (Debts & Loans)  
**Auditor:** Capital (Architect Agent)

---

## Executive Summary
The Debts page has a confused identity — it combines both simple debt tracking (table) AND financing/payoff tracking (moved from Bills). This creates cognitive overload and unclear boundaries between "debt" and "financing." The page lacks empty states, has accessibility issues, and the amortization modal is powerful but hidden.

**Severity:** HIGH — Significant UX confusion, poor FTUE

---

## CRITICAL ISSUES (HIGH PRIORITY)

### Issue #24: Page Identity Crisis — "Debts" vs "Financing"
**Location:** Entire page structure  
**Current State:**  
- Main table shows "Debts" (Name, Type, Amount, Interest, Term, Monthly Pmt)
- Below that: "Financing & Payoff Tracking" section with cards
- Modals reuse Bills modal (`#addBillModal`) for financing items

**Problem:**  
Users don't understand the difference between:
1. Adding a debt in the table (top)
2. Adding a financing item in the cards (bottom)
3. Why debts and financing are separated

**Impact:**  
- Users add the same loan twice (once as debt, once as financing)
- Poor mental model ("Isn't financing a type of debt?")
- Confusing CTAs ("Add Debt" button vs financing cards)

**Recommended Fix — OPTION A: Merge Everything**
```html
<h2>Debts & Loans</h2>
<div class="btn-group mb-3" role="group">
  <button class="btn btn-secondary active" data-view="table">
    <i class="bi bi-table"></i> Table View
  </button>
  <button class="btn btn-outline-secondary" data-view="cards">
    <i class="bi bi-card-list"></i> Card View
  </button>
</div>

<!-- Show EITHER table OR cards, not both -->
<div id="tableView">...</div>
<div id="cardView" class="d-none">...</div>
```

**Recommended Fix — OPTION B: Clarify Labels**
```html
<h2>Debts</h2>
<p class="text-muted">Credit cards, personal loans, and debts without amortization tracking.</p>
<!-- Table here -->

<h4 class="mt-5">
  <i class="bi bi-bank me-2"></i>Financed Purchases (Amortization Tracking)
</h4>
<p class="text-muted">Car loans, mortgages, and financed items with payment schedules.</p>
<!-- Cards here -->
```

**Work Item:** User Story  
**Title:** Redesign Debts page to clarify debt vs financing distinction  
**Effort:** 6 hours  
**Tags:** UX, Information-Architecture, Debts, HIGH-PRIORITY

---

### Issue #25: Missing Empty State for Debts Table
**Location:** `<tbody id="debtTableBody">`  
**Current State:** Blank table on first load  
**Problem:** New users see empty table, no guidance  
**Impact:** Poor FTUE, users don't know what to add  

**Recommended Fix:**
```html
<tr class="empty-state-row" id="debtsEmptyState">
  <td colspan="8" class="text-center py-5">
    <div class="empty-state">
      <i class="bi bi-credit-card empty-state-icon"></i>
      <h4>No debts tracked yet</h4>
      <p class="text-muted">Track credit cards, student loans, personal loans, and other debts.</p>
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
        <i class="bi bi-plus-circle"></i> Add Your First Debt
      </button>
    </div>
  </td>
</tr>
```

**Work Item:** Task  
**Title:** Add empty state to Debts table  
**Effort:** 1 hour  
**Tags:** UX, Empty-States, Debts

---

### Issue #26: Financing Cards Section Has NO Empty State
**Location:** `<div id="financingCards">`  
**Current State:** Empty `<div>` when no financing items exist  
**Problem:** Section is invisible until user adds financing (users don't know the feature exists)  
**Impact:** Feature abandonment, low adoption  

**Recommended Fix:**
```html
<!-- Show this when financingCards.children.length === 0 -->
<div class="col-12" id="financingEmptyState">
  <div class="empty-state-compact">
    <i class="bi bi-bank empty-state-icon-sm"></i>
    <h5>No financed purchases yet</h5>
    <p class="text-muted small">
      Track car loans, mortgages, and financed items with amortization schedules.
    </p>
    <button class="btn btn-sm btn-outline-primary" onclick="addFinancingItem()">
      <i class="bi bi-plus-circle"></i> Add Financing
    </button>
  </div>
</div>
```

**Work Item:** Task  
**Title:** Add empty state to Financing & Payoff Tracking section  
**Effort:** 1 hour  
**Tags:** UX, Empty-States, Debts

---

### Issue #27: Hidden Amortization Feature (Power Feature, Zero Discoverability)
**Location:** Financing cards, "View Schedule" link  
**Current State:** Small text link at bottom of financing cards  
**Problem:**  
- Most users never discover the amortization schedule modal
- Link is tiny, easy to miss
- No visual cue that this is a powerful tool

**Impact:** High-value feature has near-zero adoption  

**Recommended Fix:**
```html
<!-- In each financing card -->
<button class="btn btn-sm btn-outline-primary w-100 mt-2" 
        onclick="showAmortizationSchedule(billId)">
  <i class="bi bi-bar-chart-line me-1"></i> View Payment Schedule
</button>
```

**+ Add tooltip on first view:**
```javascript
if (!localStorage.getItem('amortization_explained')) {
  // Show tooltip: "See your full payment breakdown — principal, interest, and payoff date"
  localStorage.setItem('amortization_explained', 'true');
}
```

**Work Item:** Task  
**Title:** Promote amortization schedule feature with button + tooltip  
**Effort:** 2 hours  
**Tags:** UX, Feature-Discovery, Debts

---

### Issue #28: "Completed" Section Header Shows Even When Empty
**Location:** `<div id="completedSection" class="d-none">`  
**Current State:** Toggled with `.d-none`, but structure is unclear  
**Problem:** JavaScript likely shows the section even when `completedCards` is empty  
**Impact:** Empty section headers create confusion  

**Recommended Fix:**
```javascript
function updateCompletedSection() {
  const completedSection = document.getElementById('completedSection');
  const completedCards = document.getElementById('completedCards');
  
  if (completedCards.children.length > 0) {
    completedSection.classList.remove('d-none');
  } else {
    completedSection.classList.add('d-none');
  }
}
```

**Work Item:** Task  
**Title:** Hide "Completed" section when no completed debts exist  
**Effort:** 30 minutes  
**Tags:** UX, Debts

---

## MODERATE ISSUES (MEDIUM PRIORITY)

### Issue #29: Debt Type Icons Missing (Visual Hierarchy)
**Location:** Debts table, "Type" column  
**Current State:** Text only (credit-card, mortgage, student-loan, etc.)  
**Problem:** Table is text-heavy, lacks visual scanning cues  
**Impact:** Poor scannability, slow information retrieval  

**Recommended Fix:**
```html
<td>
  <i class="bi bi-credit-card-2-front me-1 icon-secondary"></i>
  Credit Card
</td>
<td>
  <i class="bi bi-house-door me-1 icon-secondary"></i>
  Mortgage
</td>
<td>
  <i class="bi bi-mortarboard me-1 icon-secondary"></i>
  Student Loan
</td>
```

**Icon mapping:**
- credit-card → `bi-credit-card-2-front`
- mortgage → `bi-house-door`
- student-loan → `bi-mortarboard`
- auto-loan → `bi-car-front`
- personal-loan → `bi-person-badge`
- other → `bi-dash-circle`

**Work Item:** Task  
**Title:** Add type icons to Debts table for visual scanning  
**Effort:** 1 hour  
**Tags:** UX, Visual-Design, Debts

---

### Issue #30: Term Column Uses Months (Not User-Friendly)
**Location:** Table "Term" column  
**Current State:** Displays "36 months", "60 months", "360 months"  
**Problem:** Users think in years for loans (3 years, 5 years, 30 years)  
**Impact:** Cognitive load, poor readability  

**Recommended Fix:**
```javascript
function formatLoanTerm(months) {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} years`;
  return `${years}y ${remainingMonths}m`;
}

// Examples:
// 6 → "6 months"
// 12 → "1 year"
// 36 → "3 years"
// 30 → "2y 6m"
```

**Work Item:** Task  
**Title:** Display loan terms in years (not just months)  
**Effort:** 1 hour  
**Tags:** UX, Formatting, Debts

---

### Issue #31: No Progress Indicator for Debt Paydown
**Location:** Debts table / Financing cards  
**Current State:** Shows amount, monthly payment, due date — but NOT progress  
**Problem:** Users don't see how much they've paid off  
**Impact:** Missed opportunity for motivational UX  

**Recommended Fix — Table:**
```html
<td>
  <div class="d-flex align-items-center gap-2">
    <span class="fw-semibold">$12,450</span>
    <div class="progress flex-grow-1" style="height: 6px; max-width: 80px;">
      <div class="progress-bar bg-success" role="progressbar" 
           style="width: 58%" 
           aria-valuenow="58" aria-valuemin="0" aria-valuemax="100"
           aria-label="58% paid off"></div>
    </div>
    <small class="text-muted">58%</small>
  </div>
</td>
```

**Recommended Fix — Financing Cards:**
```html
<div class="progress mb-2" style="height: 8px;">
  <div class="progress-bar bg-success" style="width: 42%"></div>
</div>
<div class="d-flex justify-content-between small text-muted">
  <span>42% paid off</span>
  <span>18 payments remaining</span>
</div>
```

**Work Item:** User Story  
**Title:** Add payoff progress bars to debts and financing items  
**Effort:** 3 hours  
**Tags:** UX, Data-Visualization, Debts

---

### Issue #32: "Next Due" Column Doesn't Show Urgency
**Location:** Table "Next Due" column  
**Current State:** Shows date only (e.g., "2026-02-15")  
**Problem:** Users don't know if payment is overdue, due soon, or far away  
**Impact:** Missed opportunity for urgency cues  

**Recommended Fix:**
```javascript
function formatDueDate(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const daysUntil = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) {
    // Overdue
    return `<span class="badge bg-danger">${Math.abs(daysUntil)}d overdue</span>`;
  } else if (daysUntil === 0) {
    return `<span class="badge bg-warning text-dark">Due today</span>`;
  } else if (daysUntil <= 7) {
    return `<span class="badge bg-warning text-dark">Due in ${daysUntil}d</span>`;
  } else {
    return `<span class="text-muted">${due.toLocaleDateString()}</span>`;
  }
}
```

**Work Item:** Task  
**Title:** Add urgency badges to "Next Due" dates (overdue, due soon)  
**Effort:** 2 hours  
**Tags:** UX, Data-Visualization, Debts

---

### Issue #33: Financing Cards Use Bill Edit Modal (Confusing)
**Location:** Financing cards → "Edit" button → opens `#addBillModal`  
**Current State:** Modal title says "Edit Financing Item"  
**Problem:**  
- URL/element ID says "Bill" but content says "Financing"
- Users think they're editing a bill (wrong mental model)

**Impact:** Confusing modal reuse, breaks user expectations  

**Recommended Fix — OPTION A: Rename Modal**
```html
<div class="modal fade" id="editFinancingModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Financed Purchase</h5>
        ...
      </div>
      ...
    </div>
  </div>
</div>
```

**OPTION B: Use Shared Modal with Dynamic Title**
```javascript
function openFinancingModal(itemId) {
  const modal = document.getElementById('addBillModal');
  const title = modal.querySelector('.modal-title');
  title.textContent = itemId ? 'Edit Financed Purchase' : 'Add Financed Purchase';
  // ... populate fields
}
```

**Work Item:** Task  
**Title:** Create dedicated modal for financing items (or clarify shared modal)  
**Effort:** 2 hours  
**Tags:** UX, Modals, Debts

---

## MINOR ISSUES (LOW PRIORITY)

### Issue #34: Interest Rate Column Lacks Context
**Location:** Table "Interest" column  
**Current State:** Shows "4.5%", "6.2%", etc.  
**Problem:** Users don't know if this is a good or bad rate  
**Impact:** Missed opportunity for contextual guidance  

**Recommended Fix:**
```html
<td>
  <div class="d-flex align-items-center gap-2">
    <span>4.5%</span>
    <i class="bi bi-check-circle icon-success" 
       data-bs-toggle="tooltip" 
       title="Good rate for this loan type"></i>
  </div>
</td>
<td>
  <div class="d-flex align-items-center gap-2">
    <span>18.9%</span>
    <i class="bi bi-exclamation-circle icon-warning" 
       data-bs-toggle="tooltip" 
       title="High interest — consider refinancing"></i>
  </div>
</td>
```

**Work Item:** User Story  
**Title:** Add interest rate context indicators (good/average/high)  
**Effort:** 3 hours  
**Tags:** UX, Feature, Debts

---

### Issue #35: Amortization Modal Table Not Responsive on Mobile
**Location:** `#amortizationModal` table  
**Current State:** 5 columns (Payment #, Payment, Principal, Interest, Balance)  
**Problem:** Table is too wide for mobile screens  
**Impact:** Mobile usability issue  

**Recommended Fix:**
```html
<!-- Mobile: Show condensed view -->
<table class="table d-md-none">
  <thead>
    <tr><th>#</th><th>Payment</th><th>Balance</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>
        <strong>$1,200</strong>
        <br><small class="text-muted">P: $800 | I: $400</small>
      </td>
      <td>$199,200</td>
    </tr>
  </tbody>
</table>

<!-- Desktop: Show full table -->
<table class="table d-none d-md-table">
  <!-- Original 5-column layout -->
</table>
```

**Work Item:** Task  
**Title:** Make amortization schedule table responsive for mobile  
**Effort:** 2 hours  
**Tags:** Mobile, Responsive, Debts

---

### Issue #36: No "Export to CSV" for Amortization Schedule
**Location:** `#amortizationModal` footer  
**Current State:** Only "Close" button  
**Problem:** Users want to export payment schedule for tax records, refinancing  
**Impact:** Missed feature opportunity  

**Recommended Fix:**
```html
<div class="modal-footer">
  <button class="btn btn-outline-secondary" onclick="exportAmortizationCSV()">
    <i class="bi bi-download"></i> Export CSV
  </button>
  <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
</div>
```

**Work Item:** User Story  
**Title:** Add "Export to CSV" button for amortization schedules  
**Effort:** 2 hours  
**Tags:** Feature, Debts, Export

---

### Issue #37: Share Bill Modal on Debts Page (Why?)
**Location:** `#shareBillModal`  
**Current State:** Modal for sharing bills exists on Debts page  
**Problem:** Debts page doesn't have "Share" UI anywhere — modal is orphaned  
**Impact:** Dead code, confusing for developers  

**Recommended Fix:**
```html
<!-- EITHER: Add "Share" feature to financing cards -->
<button class="btn btn-sm btn-outline-secondary" 
        onclick="shareFinancingItem(billId)">
  <i class="bi bi-share"></i> Share
</button>

<!-- OR: Remove the modal from this page entirely -->
```

**Work Item:** Task  
**Title:** Remove orphaned "Share Bill" modal from Debts page  
**Effort:** 30 minutes  
**Tags:** Cleanup, Debts

---

## ACCESSIBILITY ISSUES (A11Y)

### Issue #38: Financing Cards Missing ARIA Labels
**Location:** Financing cards (`#financingCards`)  
**Current State:** Cards have no `aria-label` or `role`  
**Problem:** Screen readers can't identify card purpose  
**Impact:** WCAG 2.1 Level A failure  

**Recommended Fix:**
```html
<div class="card" 
     role="article" 
     aria-label="Car Loan - Honda Accord - 32% paid off">
  ...
</div>
```

**Work Item:** Task  
**Title:** Add ARIA labels to financing cards for screen readers  
**Effort:** 1 hour  
**Tags:** Accessibility, A11y, WCAG

---

### Issue #39: Progress Bars in Financing Cards Missing Accessible Text
**Location:** Financing cards, progress bar (if added per Issue #31)  
**Current State:** Visual-only progress bar  
**Problem:** Screen readers can't announce progress  
**Impact:** WCAG 2.1 Level A failure  

**Recommended Fix:**
```html
<div class="progress" role="progressbar" 
     aria-valuenow="42" aria-valuemin="0" aria-valuemax="100"
     aria-label="Loan payoff progress: 42% paid">
  <div class="progress-bar" style="width: 42%"></div>
</div>
```

**Work Item:** Task  
**Title:** Add ARIA labels to all progress bars on Debts page  
**Effort:** 1 hour  
**Tags:** Accessibility, A11y, WCAG

---

## FEATURE OPPORTUNITIES (HIGH VALUE)

### "Payoff Calculator" Tool
**Problem:** Users want to know: "If I pay extra $X per month, when will I pay this off?"  
**Solution:** Add interactive payoff calculator in amortization modal  
**Implementation:**
```html
<div class="card mt-3">
  <div class="card-body">
    <h6>Payoff Calculator</h6>
    <div class="row g-3">
      <div class="col-md-6">
        <label>Extra Monthly Payment</label>
        <input type="number" class="form-control" id="extraPayment" placeholder="$0">
      </div>
      <div class="col-md-6">
        <label>New Payoff Date</label>
        <div class="form-control-plaintext fw-semibold" id="newPayoffDate">—</div>
      </div>
    </div>
    <div class="mt-2 text-muted small">
      You'll save <strong id="interestSaved">$0</strong> in interest.
    </div>
  </div>
</div>
```

**Work Item:** User Story  
**Title:** Add payoff calculator to amortization modal  
**Effort:** 4 hours  
**Tags:** Feature, Debts, Calculator

---

### Debt Snowball vs Avalanche Strategy
**Problem:** Users don't know which debt to pay off first  
**Solution:** Add strategy recommendation based on balances + interest rates  
**Implementation:**
```html
<div class="alert alert-info">
  <h6><i class="bi bi-lightbulb me-2"></i>Payoff Strategy Recommendation</h6>
  <p><strong>Debt Avalanche:</strong> Pay off high-interest debts first to save $X in interest.</p>
  <ol>
    <li>Credit Card A (18.9% APR) — Pay $X extra per month</li>
    <li>Personal Loan (12.5% APR)</li>
    <li>Auto Loan (4.2% APR)</li>
  </ol>
</div>
```

**Work Item:** User Story  
**Title:** Add debt payoff strategy recommendation (Snowball/Avalanche)  
**Effort:** 5 hours  
**Tags:** Feature, Debts, Financial-Insights

---

## THINGS DONE RIGHT ✅
- **Amortization schedule modal** — Powerful feature (but hidden)
- **Financing & payoff tracking** — Smart separation from bills
- **Completed section** — Good archive pattern
- **Loan term fields** — Captures full loan context

---

## AZURE DEVOPS WORK ITEMS TO CREATE

### User Stories (HIGH)
1. **Redesign Debts page to clarify debt vs financing distinction** (6h) — CRITICAL
2. **Add payoff progress bars to debts and financing items** (3h)
3. **Add interest rate context indicators (good/average/high)** (3h)
4. **Add "Export to CSV" button for amortization schedules** (2h)
5. **Add payoff calculator to amortization modal** (4h)
6. **Add debt payoff strategy recommendation (Snowball/Avalanche)** (5h)

### Tasks (MEDIUM)
1. **Add empty state to Debts table** (1h)
2. **Add empty state to Financing & Payoff Tracking section** (1h)
3. **Promote amortization schedule feature with button + tooltip** (2h)
4. **Hide "Completed" section when no completed debts exist** (30min)
5. **Add type icons to Debts table for visual scanning** (1h)
6. **Display loan terms in years (not just months)** (1h)
7. **Add urgency badges to "Next Due" dates** (2h)
8. **Create dedicated modal for financing items** (2h)

### Tasks (LOW)
1. **Make amortization schedule table responsive for mobile** (2h)
2. **Remove orphaned "Share Bill" modal from Debts page** (30min)
3. **Add ARIA labels to financing cards for screen readers** (1h)
4. **Add ARIA labels to all progress bars on Debts page** (1h)

---

## NEXT AUDIT
**Page:** Budget (budget.html)  
**Focus Areas:** Category management, budget allocation, progress tracking, overspending warnings
