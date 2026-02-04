# UI/UX Audit Report: Debts Page
**Date:** February 4, 2026 - 2:35 PM  
**Page:** debts.html  
**Auditor:** Architect (Sub-Agent)  
**Status:** 🔴 Multiple Critical Issues

---

## Executive Summary
The Debts page has SEVERE UI/UX issues including:
- **Critical data loss risk** — Financing section shares modals/JS with Bills page (different schemas)
- **Confusing dual-entity design** — Mixing "Debts" and "Bills/Financing" creates cognitive load
- **Inconsistent table design** — Different from other pages
- **Poor affordance** — No visual indication that financing cards are interactive
- **Amortization modal bloat** — Complex modal embedded but likely unused

**Recommendation:** URGENT refactor required. Either consolidate debt tracking OR clearly separate concerns.

---

## 🔴 CRITICAL ISSUES

### 1. **DATA CORRUPTION RISK — Shared Bill Modal on Debts Page**
**Issue:** The page includes the Bills edit modal (`addBillModal`) but uses it for "financing items" which have different schemas than debts. This creates data integrity risk.

**Location:** Lines 584-692 (Bill Edit Modal)

**Evidence:**
- Debts schema: `name, type, amount, interest, term, monthly_payment, next_payment_date`
- Bills schema: `name, type, amount, frequency, next_due_date, interest_rate, original_principal, loan_term_value, etc.`
- Mixing these in one modal with shared JS will corrupt data

**Fix:**
```
OPTION A (RECOMMENDED): Remove financing cards from debts page entirely
- Move to bills.html where they belong
- Keep debts.html focused on installment debts only
- Remove all bill-related modals and JS from debts.html

OPTION B: Create separate financing modal
- Rename addBillModal → addFinancingModal
- Separate JS handlers
- Different Supabase table or clear schema separation
```

**Priority:** 🔴 **CRITICAL** — Risk of data corruption

---

### 2. **Conceptual Confusion — Two Debt Models on One Page**
**Issue:** Page shows:
1. Traditional "Debts" table (credit cards, loans, mortgages)
2. "Financing & Payoff Tracking" cards (from Bills page)

These represent different mental models:
- **Debts** = total liabilities (balance sheet item)
- **Financing** = payment obligations (cash flow item)

**Location:** Line 207 (`<h4>Financing & Payoff Tracking</h4>`)

**User Impact:**
- Unclear whether to add car loan as "Debt" or "Financing"
- Duplicate data entry likely
- Amortization calculations won't match if entered twice

**Fix:**
```
RECOMMENDED: Pick ONE model per page
1. Debts page = Balance sheet view (total owed)
2. Bills page = Cash flow view (monthly payments)
3. Link between them with clear CTAs

OR: Rename page to "Liabilities & Financing" and provide clear guidance
```

**Priority:** 🔴 **CRITICAL** — Core UX confusion

---

### 3. **No Visual Affordance for Interactive Financing Cards**
**Issue:** Financing cards look static but presumably have edit/delete actions (based on Bill modal presence). No hover state, no action buttons visible.

**Location:** Line 209 (`<div id="financingCards">`)

**Fix:**
```html
<!-- Add visible action buttons to financing cards -->
<div class="financing-card-actions">
  <button class="btn btn-sm btn-outline-secondary" aria-label="Edit">
    <i class="bi bi-pencil"></i>
  </button>
  <button class="btn btn-sm btn-outline-danger" aria-label="Delete">
    <i class="bi bi-trash"></i>
  </button>
</div>

<!-- Add CSS hover state -->
.financing-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

**Priority:** 🟠 **HIGH** — Discoverability issue

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Inconsistent Table Column Design**
**Issue:** Debts table shows different columns than Assets/Investments tables, making cross-page comparison difficult.

**Location:** Lines 190-200 (Table headers)

**Current:**
```
Name | Type | Amount | Interest | Term | Monthly Pmt | Next Due | Actions
```

**Better (align with Assets page):**
```
Name | Type | Balance | Interest | Payment | Next Due | Progress | Actions
```

**Fix:**
- Add "Progress" column showing visual payoff bar (like Assets equity)
- Rename "Amount" → "Balance" for consistency
- Move "Term" to modal (not critical for list view)

**Priority:** 🟠 **HIGH** — Consistency

---

### 5. **Amortization Modal Complexity**
**Issue:** Lines 750-777 include full amortization schedule modal with table. This is:
- Likely unused by most users
- Heavy DOM weight for edge-case feature
- Better suited as separate "view details" page

**Location:** Lines 750-777

**Fix:**
```
OPTION A: Remove entirely, add link to external calculator
OPTION B: Lazy-load modal content only when user clicks "View Schedule"
OPTION C: Move to dedicated /debt-details/:id page
```

**Priority:** 🟠 **HIGH** — Performance & UX clutter

---

### 6. **Delete Confirmation Modal Duplication**
**Issue:** Page has TWO separate delete modals:
1. `confirmDeleteDebtModal` (line 545)
2. `confirmDeleteBillModal` (line 725)

Plus a third warning modal for shared bills (line 743).

**Location:** Lines 545, 725, 743

**Fix:**
```
Consolidate to ONE reusable modal:
<div class="modal fade" id="confirmDeleteModal">
  <div class="modal-body">
    Are you sure you want to delete <strong id="deleteItemName"></strong>?
    <div id="deleteWarningText" class="d-none text-danger mt-2"></div>
  </div>
  <button onclick="confirmDeleteItem()">Delete</button>
</div>

JS: Store deleteType ('debt' | 'bill') and deleteId in data attributes
```

**Priority:** 🟠 **HIGH** — Code quality & maintainability

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. **Missing Empty State**
**Issue:** No empty state guidance for new users with zero debts.

**Location:** Line 181 (`<div id="dataContainer">`)

**Fix:**
```html
<!-- Add before table-card -->
<div id="emptyState" class="empty-state d-none">
  <i class="bi bi-credit-card empty-state-icon"></i>
  <h3>No Debts Yet</h3>
  <p>Track loans, credit cards, and other liabilities to see your payoff progress.</p>
  <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#addDebtModal">
    <i class="bi bi-plus-circle"></i> Add Your First Debt
  </button>
</div>
```

**Priority:** 🟡 **MEDIUM** — Onboarding UX

---

### 8. **No Debt Summary Cards**
**Issue:** Page lacks overview metrics (unlike Dashboard, Assets, Bills). Users can't see:
- Total debt balance
- Total monthly obligations
- Weighted average interest rate
- Debt-free projection date

**Location:** Should be above line 181 (before table)

**Fix:**
```html
<div class="row g-3 mb-4">
  <div class="col-md-3">
    <div class="stat-card stat-card-alert">
      <div class="stat-card-label">Total Debt</div>
      <div class="stat-card-value" id="totalDebtValue">$0</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stat-card">
      <div class="stat-card-label">Monthly Payments</div>
      <div class="stat-card-value" id="monthlyPaymentsValue">$0</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stat-card">
      <div class="stat-card-label">Avg Interest</div>
      <div class="stat-card-value" id="avgInterestValue">0%</div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="stat-card stat-card-success">
      <div class="stat-card-label">Debt-Free In</div>
      <div class="stat-card-value" id="debtFreeDate">—</div>
    </div>
  </div>
</div>
```

**Priority:** 🟡 **MEDIUM** — Feature parity

---

### 9. **Form Field Ordering Inconsistency**
**Issue:** Add Debt modal fields in non-logical order:
```
Name → Type → Amount → Interest → Term → Monthly → Next Due
```

Better flow:
```
Name → Type → Amount → Interest → Term → (calc Monthly auto) → Start Date → Next Due
```

**Location:** Lines 372-422 (Add Debt Modal)

**Fix:**
- Auto-calculate monthly payment from amount/interest/term
- Show calculated value in read-only field with "edit" override option
- Add "Start Date" field (missing currently)
- Move "Next Due" to end

**Priority:** 🟡 **MEDIUM** — Form UX

---

### 10. **Mobile Table Overflow**
**Issue:** Table has 8 columns including "Term" and "Next Due" which will break on mobile despite `.hide-mobile` classes.

**Location:** Lines 190-200

**Fix:**
```css
/* In responsive.css */
@media (max-width: 767.98px) {
  .debts-table th:nth-child(5), /* Term */
  .debts-table td:nth-child(5),
  .debts-table th:nth-child(7), /* Next Due */
  .debts-table td:nth-child(7) {
    display: none;
  }
  
  /* Stack Name + Type vertically in one cell */
  .debts-table td:first-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .debts-table .debt-type {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
}
```

**Priority:** 🟡 **MEDIUM** — Mobile UX

---

## 🟢 LOW PRIORITY / POLISH

### 11. **No Debt Type Icons**
**Issue:** Table shows text labels for debt types without visual differentiation.

**Fix:**
```javascript
const debtIcons = {
  'credit-card': 'bi-credit-card-2-front',
  'mortgage': 'bi-house-door',
  'student-loan': 'bi-mortarboard',
  'auto-loan': 'bi-car-front',
  'personal-loan': 'bi-cash-coin',
  'other': 'bi-three-dots'
};

// In table row generation:
<i class="bi ${debtIcons[debt.type]} me-1 icon-primary"></i>
```

**Priority:** 🟢 **LOW** — Visual polish

---

### 12. **No Interest Rate Highlighting**
**Issue:** High-interest debts (>15% APR) should be visually flagged for payoff priority.

**Fix:**
```javascript
const interestClass = interest > 15 ? 'text-danger fw-bold' : '';
<td class="${interestClass}">${interest}%</td>
```

**Priority:** 🟢 **LOW** — Financial UX hint

---

### 13. **Missing Quick Actions**
**Issue:** No bulk actions (mark multiple debts as paid off, export to CSV, etc.)

**Priority:** 🟢 **LOW** — Power user feature

---

## Accessibility Notes
✅ **GOOD:**
- Skip link present
- ARIA labels on buttons
- Semantic HTML structure
- Modal focus management

❌ **MISSING:**
- Table needs `<caption>` for screen readers
- No `aria-describedby` on form fields with validation
- Delete modals lack `role="alertdialog"`

---

## Design Token Compliance
✅ Uses design-tokens.css variables  
✅ Consistent with main.css spacing grid  
✅ Bootstrap 5.3.3 loaded correctly  
⚠️ Financing cards styling unknown (populated by JS)

---

## Comparison to Other Pages
| Feature | Dashboard | Assets | Bills | Debts | Investments |
|---------|-----------|--------|-------|-------|-------------|
| Summary cards | ✅ | ✅ | ✅ | ❌ | ✅ |
| Table view | ✅ | ✅ | ✅ | ✅ | ✅ |
| Visual progress | ✅ | ✅ | ✅ | ❌ | ❌ |
| Empty state | ✅ | ✅ | ✅ | ❌ | ? |
| Mobile-optimized | ✅ | ✅ | ✅ | ⚠️ | ? |
| Consistent modals | ✅ | ✅ | ✅ | ❌ | ? |

**Finding:** Debts page is BEHIND other pages in UX maturity.

---

## Recommended Action Plan

### PHASE 1 (URGENT — This week)
1. ⚠️ Remove financing cards from Debts page → move to Bills page
2. ⚠️ Delete shared bill modals (data integrity risk)
3. ⚠️ Add summary stat cards
4. ⚠️ Add empty state

### PHASE 2 (Next sprint)
1. Add visual progress bars in table
2. Consolidate delete modals
3. Auto-calculate monthly payment in form
4. Add debt type icons
5. Improve mobile table layout

### PHASE 3 (Future)
1. Lazy-load amortization modal
2. Add high-interest warnings
3. Add bulk actions
4. Add debt payoff calculator tool

---

## Files Referenced
- `debts.html` (reviewed fully)
- `main.css` (design system — confirmed compliance)
- `components.css` (card styles — confirmed used)
- `responsive.css` (mobile breakpoints — needs update)

---

## Conclusion
The Debts page has **critical architectural issues** that need immediate attention before any polish work. The mixing of Bills and Debts schemas creates data corruption risk. Once the data model is clarified, the page needs significant UX investment to match the quality of other pages.

**Overall Grade:** 🔴 **D+ (Major Issues)**

**Next Steps:**
1. Review with Builder to understand financing cards implementation
2. Make architectural decision (consolidate or separate)
3. Implement Phase 1 fixes
4. Re-audit after refactor

---

**Audit completed:** February 4, 2026 - 2:35 PM
