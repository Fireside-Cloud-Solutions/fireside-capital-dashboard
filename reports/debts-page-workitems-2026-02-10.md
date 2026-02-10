# Azure DevOps Work Items — Debts Page UI/UX Issues
**Date:** February 10, 2026 — 5:48 AM  
**Source:** `reports/ui-ux-audit-debts-2026-02-10.md`  
**Azure DevOps:** https://dev.azure.com/fireside365/Fireside%20Capital

---

## 🔴 HIGH PRIORITY User Stories

### US-1: Redesign Debts page to clarify debt vs financing distinction
**Type:** User Story  
**Priority:** 1 (Critical)  
**Effort:** 6 hours  
**Description:**  
Users are confused by the separation between "Debts" (table view) and "Financing & Payoff Tracking" (card view). They don't understand the difference and often add the same loan twice.

**Acceptance Criteria:**
- [ ] Either merge views with tab toggle (Table View / Card View)
- [ ] OR add clear section descriptions explaining debt vs financing
- [ ] Ensure mental model is clear: what goes in table vs cards
- [ ] Update empty states to reflect new structure

**Tags:** UX, Information-Architecture, Debts, High-Priority

---

### US-2: Add payoff progress bars to debts and financing items
**Type:** User Story  
**Priority:** 2  
**Effort:** 3 hours  
**Description:**  
Users can't see payoff progress at a glance. Add visual progress indicators showing percentage paid off and remaining balance.

**Acceptance Criteria:**
- [ ] Add progress bar to Debts table Amount column
- [ ] Add progress bar to Financing cards
- [ ] Show percentage paid off + remaining payments
- [ ] Use success color (green) for progress bar
- [ ] Include ARIA labels for screen readers

**Tags:** UX, Data-Visualization, Debts

---

### US-3: Add interest rate context indicators
**Type:** User Story  
**Priority:** 2  
**Effort:** 3 hours  
**Description:**  
Users don't know if their interest rates are good, average, or high. Add contextual indicators with tooltips.

**Acceptance Criteria:**
- [ ] Define "good", "average", "high" thresholds per loan type
- [ ] Add check/warning icons next to interest rates
- [ ] Include tooltips: "Good rate" / "Average" / "High — consider refinancing"
- [ ] Use icon colors: green (good), gray (average), orange (high)

**Tags:** UX, Feature, Debts, Financial-Insights

---

### US-4: Add "Export to CSV" for amortization schedules
**Type:** User Story  
**Priority:** 3  
**Effort:** 2 hours  
**Description:**  
Users want to export amortization schedules for tax records and refinancing applications.

**Acceptance Criteria:**
- [ ] Add "Export CSV" button to amortization modal footer
- [ ] Generate CSV with columns: Payment #, Date, Payment, Principal, Interest, Balance
- [ ] Include loan summary at top of CSV (name, rate, term)
- [ ] Download file as "Loan-Name-Amortization-YYYY-MM-DD.csv"

**Tags:** Feature, Debts, Export

---

### US-5: Add payoff calculator to amortization modal
**Type:** User Story  
**Priority:** 3  
**Effort:** 4 hours  
**Description:**  
Users want to calculate: "If I pay extra $X per month, when will I pay this off?"

**Acceptance Criteria:**
- [ ] Add "Payoff Calculator" section in amortization modal
- [ ] Input field: Extra monthly payment
- [ ] Real-time calculation: New payoff date + interest saved
- [ ] Update amortization table to reflect extra payments (optional)
- [ ] Show total interest saved in dollars

**Tags:** Feature, Debts, Calculator

---

### US-6: Add debt payoff strategy recommendation
**Type:** User Story  
**Priority:** 3  
**Effort:** 5 hours  
**Description:**  
Users don't know which debt to pay off first. Provide Debt Snowball vs Avalanche strategy recommendation.

**Acceptance Criteria:**
- [ ] Calculate optimal payoff order (Avalanche: high interest first)
- [ ] Show strategy recommendation at top of Debts page
- [ ] List debts in recommended order with reasoning
- [ ] Calculate total interest savings vs minimum payments
- [ ] Allow user to toggle Snowball (smallest balance first) vs Avalanche

**Tags:** Feature, Debts, Financial-Insights, High-Value

---

## 🟡 MEDIUM PRIORITY Tasks

### Task-1: Add empty state to Debts table
**Type:** Task  
**Priority:** 1  
**Effort:** 1 hour  
**Description:**  
New users see blank table. Add empty state with icon, heading, description, and "Add Your First Debt" CTA.

**Files:** `debts.html`, `app.js` (debt loading logic)  
**Tags:** UX, Empty-States, Debts

---

### Task-2: Add empty state to Financing & Payoff Tracking section
**Type:** Task  
**Priority:** 1  
**Effort:** 1 hour  
**Description:**  
Financing section is invisible until user adds items. Show empty state explaining feature.

**Files:** `debts.html`, `app.js` (financing cards logic)  
**Tags:** UX, Empty-States, Debts

---

### Task-3: Promote amortization schedule feature with button + tooltip
**Type:** Task  
**Priority:** 1  
**Effort:** 2 hours  
**Description:**  
Replace tiny "View Schedule" text link with prominent button. Add tooltip on first use explaining the feature.

**Files:** `debts.html`, `app.js`  
**Tags:** UX, Feature-Discovery, Debts

---

### Task-4: Hide "Completed" section when no completed debts exist
**Type:** Task  
**Priority:** 1  
**Effort:** 30 minutes  
**Description:**  
Don't show "Completed" section header if there are no completed items.

**Files:** `app.js` (completed section logic)  
**Tags:** UX, Debts

---

### Task-5: Add type icons to Debts table for visual scanning
**Type:** Task  
**Priority:** 2  
**Effort:** 1 hour  
**Description:**  
Table is text-heavy. Add icons to Type column (credit card, house, car, mortarboard, etc.).

**Icon Mapping:**
- credit-card → `bi-credit-card-2-front`
- mortgage → `bi-house-door`
- student-loan → `bi-mortarboard`
- auto-loan → `bi-car-front`
- personal-loan → `bi-person-badge`
- other → `bi-dash-circle`

**Files:** `debts.html`, `app.js`  
**Tags:** UX, Visual-Design, Debts

---

### Task-6: Display loan terms in years (not just months)
**Type:** Task  
**Priority:** 2  
**Effort:** 1 hour  
**Description:**  
Users think in years (3 years, 30 years), not months (36 months, 360 months). Format term column as "3 years", "2y 6m", etc.

**Files:** `app.js` (term formatting function)  
**Tags:** UX, Formatting, Debts

---

### Task-7: Add urgency badges to "Next Due" dates
**Type:** Task  
**Priority:** 2  
**Effort:** 2 hours  
**Description:**  
Show urgency for due dates: overdue (red), due today (yellow), due within 7 days (yellow), otherwise muted text.

**Files:** `app.js` (due date formatting)  
**Tags:** UX, Data-Visualization, Debts

---

### Task-8: Create dedicated modal for financing items (or clarify shared modal)
**Type:** Task  
**Priority:** 2  
**Effort:** 2 hours  
**Description:**  
Financing items currently reuse Bills modal (`#addBillModal`), which is confusing. Either create dedicated modal or dynamically update modal title based on context.

**Files:** `debts.html`, `app.js`  
**Tags:** UX, Modals, Debts

---

## 🔵 LOW PRIORITY Tasks

### Task-9: Make amortization schedule table responsive for mobile
**Type:** Task  
**Priority:** 3  
**Effort:** 2 hours  
**Description:**  
5-column amortization table is too wide for mobile. Create condensed mobile view with 3 columns (Payment #, Payment with P/I breakdown, Balance).

**Files:** `debts.html`, `main.css`  
**Tags:** Mobile, Responsive, Debts

---

### Task-10: Remove orphaned "Share Bill" modal from Debts page
**Type:** Task  
**Priority:** 3  
**Effort:** 30 minutes  
**Description:**  
`#shareBillModal` exists on Debts page but has no UI trigger. Either add Share feature to financing cards OR remove the modal.

**Files:** `debts.html`  
**Tags:** Cleanup, Debts

---

### Task-11: Add ARIA labels to financing cards for screen readers
**Type:** Task  
**Priority:** 3  
**Effort:** 1 hour  
**Description:**  
Financing cards lack `aria-label` and `role` attributes. Add for screen reader accessibility.

**Files:** `app.js` (financing card generation)  
**Tags:** Accessibility, A11y, WCAG

---

### Task-12: Add ARIA labels to all progress bars on Debts page
**Type:** Task  
**Priority:** 3  
**Effort:** 1 hour  
**Description:**  
If progress bars are added (Task US-2), ensure they have proper ARIA attributes for screen readers.

**Files:** `app.js`, `debts.html`  
**Tags:** Accessibility, A11y, WCAG

---

## Summary
- **6 User Stories** (HIGH value features)
- **8 Tasks** (MEDIUM priority fixes)
- **4 Tasks** (LOW priority polish)
- **Total Effort:** ~38 hours

## Manual Creation Steps (Azure CLI Not Installed)
1. Go to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Create User Stories first (US-1 through US-6)
3. Create Tasks (Task-1 through Task-12)
4. Set Iteration: Current sprint
5. Assign to: Builder agent (for implementation)
6. Link all items to Epic: "UI/UX Audit Sprint"
