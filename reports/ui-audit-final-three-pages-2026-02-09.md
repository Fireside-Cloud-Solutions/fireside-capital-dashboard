# UI/UX Audit: Final Three Pages (Investments, Reports, Friends)

**Date:** February 9, 2026 @ 7:35 AM EST  
**Auditor:** Builder Agent (QA Mode)  
**Pages:** investments.html, reports.html, friends.html  
**Status:** Comprehensive review complete

---

## Executive Summary

Completed final page audits to achieve 100% page coverage. **Total of 28 issues found** across three pages:
- **Investments:** 11 issues (2 P0, 6 P1, 2 P2, 1 P3)
- **Reports:** 12 issues (3 P0, 5 P1, 3 P2, 1 P3)
- **Friends:** 5 issues (1 P0, 2 P1, 2 P2)

**Priority Overview:**
- P0 (Critical): 6 issues
- P1 (High): 13 issues
- P2 (Medium): 7 issues
- P3 (Low): 2 issues

---

# Investments Page (investments.html)

## Page Structure

```
┌─────────────────────────────────────────────┐
│ Investments Header  [Add Investment]         │
├─────────────────────────────────────────────┤
│ Investment Accounts Table                    │
│ ┌────┬──────┬──────────┬────────┬────────┐ │
│ │Name│ Type │Starting $│Monthly │Actions │ │
│ │    │      │          │Contrib │        │ │
│ └────┴──────┴──────────┴────────┴────────┘ │
└─────────────────────────────────────────────┘
```

## Critical Issues (P0)

### INV-001: No Empty State for Investments Table

**Severity:** P0  
**Impact:** First-time users see blank table, no guidance on next steps

**Current:** Empty `<tbody>` when no investments exist  
**Expected:** Empty state component (same pattern as other pages)

**Fix:** Already implemented in `empty-states.js`, just needs wiring:
```javascript
if (investments.length === 0) {
  document.getElementById('investmentTableBody').innerHTML = generateEmptyStateHTML('investments');
} else {
  renderInvestmentsTable(investments);
}
```

---

### INV-002: No Loading State on Save Button

**Severity:** P0  
**Impact:** User can double-click, submit twice

**Current:** Button `#saveInvestmentBtn` has no loading state  
**Expected:** Spinner + disabled state during save

---

## High Priority Issues (P1)

### INV-003: Investment Type Enum Values Display As-Is

**Severity:** P1  
**Impact:** "401k" displays instead of "401(k)", "ira" instead of "Traditional IRA"

**Current Display:**
- 401k → Should be "401(k)"
- ira → Should be "Traditional IRA"
- roth-ira → Should be "Roth IRA"
- brokerage → Should be "Brokerage Account"

**Fix:** Add type labels in `app.js`:
```javascript
const investmentTypeLabels = {
  '401k': '401(k)',
  'ira': 'Traditional IRA',
  'roth-ira': 'Roth IRA',
  'brokerage': 'Brokerage Account',
  'savings': 'High-Yield Savings',
  'cd': 'Certificate of Deposit (CD)',
  'crypto': 'Cryptocurrency',
  'other': 'Other'
};

// In table rendering:
<td>${investmentTypeLabels[inv.type] || inv.type}</td>
```

---

### INV-004: Modal Title Doesn't Change for Edit

**Severity:** P1  
**Impact:** Confusing UX when editing (says "Add Investment" instead of "Edit Investment")

**Fix:** Update modal title in `openInvestmentModal()`:
```javascript
if (investmentId) {
  document.getElementById('addInvestmentLabel').textContent = 'Edit Investment';
} else {
  document.getElementById('addInvestmentLabel').textContent = 'Add Investment';
}
```

---

### INV-005: Starting Balance Should Not Be Required

**Severity:** P1  
**Impact:** Can't add new investment that starts at $0 (common for 401k at new job)

**Current:** `<input ... id="startingBalance" required>`  
**Fix:** Remove `required` attribute, allow $0 start

---

### INV-006: No Min/Max Validation on Annual Return

**Severity:** P1  
**Impact:** User can enter 999% or -100% (unrealistic values)

**Current:** `<input ... id="annualReturn" min="0">`  
**Fix:** Add realistic max: `min="-20" max="50"` (allow negative for losses, cap at 50% for realism)

---

### INV-007: No Inline Validation Feedback

**Severity:** P1  
**Impact:** User doesn't see errors until they try to save

**Fix:** Add Bootstrap validation classes on blur:
```javascript
inputs.forEach(input => {
  input.addEventListener('blur', () => {
    if (!input.validity.valid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  });
});
```

---

### INV-008: Missing ACTIONS Column in Table

**Severity:** P1 (was P3 in FC-072, upgraded due to consistency)  
**Impact:** No Edit/Delete buttons in table

**Status:** FC-072 already documented in BACKLOG.md  
**Current:** Actions column header exists but no Edit/Delete buttons render  
**Expected:** Same pattern as Assets, Bills, Debts pages

**Note:** This was previously marked P3 Low priority, but should be P1 for consistency with other pages.

---

## Medium Priority Issues (P2)

### INV-009: Current Value Should Auto-Calculate

**Severity:** P2  
**Impact:** User has to manually calculate current value (error-prone)

**Current:** User enters "Current Value" manually  
**Expected:** Auto-calculate based on:
```
Current Value = Starting Balance + (Monthly Contribution × Months Elapsed) + Returns
```

**Recommendation:** Add "Auto-Calculate" button or make it auto-update on date change

---

### INV-010: No Investment Summary Stats

**Severity:** P2  
**Impact:** Missing helpful context (total portfolio value, total returns, etc.)

**Expected:** Summary cards above table:
```
┌────────────────┬────────────────┬────────────────┐
│ Total Portfolio│  Total Returns │ Monthly Growth │
│   $125,432.15  │   +$25,432.15  │    +$1,234.56  │
└────────────────┴────────────────┴────────────────┘
```

---

## Low Priority Issues (P3)

### INV-011: No Chart Visualization

**Severity:** P3  
**Impact:** Hard to see portfolio allocation at a glance

**Recommendation:** Add pie chart showing portfolio allocation by type (401k, IRA, etc.)

---

# Reports Page (reports.html)

## Page Structure

```
┌─────────────────────────────────────────────┐
│ Reports Header                               │
├─────────────────────────────────────────────┤
│ [1M] [3M] [6M] [1Y] [ALL]  (time filters)   │
├─────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌──────────────────┐   │
│ │ Net Worth Chart │ │ Spending Trends  │   │
│ └─────────────────┘ └──────────────────┘   │
│ ┌─────────────────┐ ┌──────────────────┐   │
│ │ Income vs Exp.  │ │ Category Breakdown│   │
│ └─────────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────┘
```

## Critical Issues (P0)

### REP-001: No Empty State When No Data Exists

**Severity:** P0  
**Impact:** Charts fail to render, show blank space

**Expected:** Show message: "No data available for the selected time period. Connect your bank or add transactions to see reports."

---

### REP-002: No Loading State for Charts

**Severity:** P0  
**Impact:** User sees blank charts while loading, doesn't know if broken or loading

**Expected:** Skeleton loaders for chart containers while data fetches

**Fix:**
```html
<div class="chart-skeleton" id="netWorthSkeleton">
  <div class="skeleton-line"></div>
  <div class="skeleton-line"></div>
  <div class="skeleton-line"></div>
</div>
<canvas id="netWorthChart" class="d-none"></canvas>
```

---

### REP-003: Export Button Missing Loading State

**Severity:** P0  
**Impact:** User clicks "Export PDF", doesn't know if it's working (can take 2-3 seconds)

**Expected:** Button shows "Generating PDF..." with spinner

---

## High Priority Issues (P1)

### REP-004: Time Filter Buttons Missing Active State

**Severity:** P1 (Accessibility — WCAG 4.1.2)  
**Impact:** Screen readers can't tell which time period is selected

**Current:** No `aria-pressed` or visual indicator  
**Expected:**
```html
<button class="btn btn-sm btn-outline-secondary active" aria-pressed="true" data-period="1M">
  1M
</button>
```

---

### REP-005: Charts Missing Accessibility Descriptions

**Severity:** P1 (Accessibility — WCAG 1.1.1)  
**Impact:** Screen reader users can't understand chart data

**Expected:** Add `aria-label` to canvas and provide text alternative:
```html
<canvas 
  id="netWorthChart" 
  aria-label="Net worth over time: Starting at $50,000, ending at $75,000"
  role="img"
></canvas>
<p class="visually-hidden" id="netWorthDesc">
  Your net worth increased from $50,000 to $75,000 over the past month, 
  a growth of 50%.
</p>
```

---

### REP-006: Chart Color Contrast May Fail WCAG

**Severity:** P1 (Accessibility — WCAG 1.4.3)  
**Impact:** Low vision users may not see chart lines

**Recommendation:** Audit chart colors with contrast checker (target: 4.5:1 ratio)

---

### REP-007: No Keyboard Navigation for Time Filters

**Severity:** P1 (Accessibility — WCAG 2.1.1)  
**Impact:** Keyboard users can't switch time periods with arrow keys

**Expected:** Left/Right arrow keys switch between time periods

---

### REP-008: No Data Table Alternative for Charts

**Severity:** P1 (Accessibility — WCAG 1.1.1)  
**Impact:** Screen reader users can't access chart data

**Expected:** "View as Table" button that toggles data table view

---

## Medium Priority Issues (P2)

### REP-009: No Chart Download Option

**Severity:** P2  
**Impact:** Users can't save individual charts as images

**Recommendation:** Add "Download as PNG" button for each chart

---

### REP-010: No Date Range Picker

**Severity:** P2  
**Impact:** User limited to preset ranges (1M, 3M, 6M, 1Y, ALL), can't select custom range

**Expected:** "Custom Range" button opens date picker

---

### REP-011: No Print Stylesheet

**Severity:** P2  
**Impact:** Printed reports look bad (sidebar prints, charts may not render)

**Expected:** Add print CSS to hide sidebar, optimize charts for print

---

## Low Priority Issues (P3)

### REP-012: No Comparison Mode

**Severity:** P3  
**Impact:** Can't compare current month to last month side-by-side

**Recommendation:** Add "Compare to..." dropdown to overlay previous period

---

# Friends Page (friends.html)

## Page Structure

```
┌─────────────────────────────────────────────┐
│ Friends Header                               │
├─────────────────────────────────────────────┤
│ Find Friends                                 │
│ [Search by username or email...] [Search]   │
│                                              │
│ Friend Requests (2)                          │
│ ┌──────────────────────────────────────┐   │
│ │ @john_doe wants to add you [✓][✗]    │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ Your Friends                                 │
│ ┌──────────────────────────────────────┐   │
│ │ @jane_smith   [Message] [Remove]      │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Critical Issues (P0)

### FRD-001: No Empty State for Friends List

**Severity:** P0  
**Impact:** New users see blank "Your Friends" section

**Expected:** Empty state: "You haven't added any friends yet. Search for friends above to get started."

---

## High Priority Issues (P1)

### FRD-002: Search Input Label Fixed ✅

**Severity:** P1 — **FIXED** (commit 4f2d2ae)  
**Status:** CLOSED

**Verification:** Confirmed label exists at `friends.html:143`:
```html
<label for="friendSearchInput" class="visually-hidden">Search by username or email</label>
```

---

### FRD-003: No Loading State for Search Button

**Severity:** P1  
**Impact:** User clicks Search, doesn't know if it's working

**Expected:** Button shows spinner while searching

---

### FRD-004: No Search Results Empty State

**Severity:** P1  
**Impact:** When search returns no results, shows blank space

**Expected:** Message: "No users found matching '[query]'. Try a different username or email."

---

## Medium Priority Issues (P2)

### FRD-005: No Friendship Status Indicator

**Severity:** P2  
**Impact:** User doesn't know if friend request is pending, accepted, or rejected

**Expected:** Status badges: "Pending", "Accepted", "Declined"

---

### FRD-006: No Friend Activity Feed

**Severity:** P2  
**Impact:** Friends feature feels incomplete (no way to see what friends are doing)

**Recommendation:** Add activity feed showing when friends add bills, achieve goals, etc. (privacy-respecting)

---

# Summary: All Issues Across All Three Pages

## Priority Breakdown

| Priority | Investments | Reports | Friends | **Total** |
|----------|-------------|---------|---------|-----------|
| P0       | 2           | 3       | 1       | **6**     |
| P1       | 6           | 5       | 2       | **13**    |
| P2       | 2           | 3       | 2       | **7**     |
| P3       | 1           | 1       | 0       | **2**     |
| **Total**| **11**      | **12**  | **5**   | **28**    |

---

## Immediate Action Items (P0 Only)

### Investments (2 issues, ~1 hour)
1. Add empty state for investments table (15 min)
2. Add loading state to Save button (15 min)

### Reports (3 issues, ~2 hours)
1. Add empty state for charts (30 min)
2. Add skeleton loaders for charts (45 min)
3. Add loading state to Export button (15 min)

### Friends (1 issue, ~15 min)
1. Add empty state for friends list (15 min)

**Total P0 Fix Time:** ~3 hours

---

## Recommended Sprint Work

### Week 1: Fix All P0 Issues
- **Effort:** 3 hours
- **Impact:** Remove all critical UX blockers
- **Deliverable:** All pages have proper empty states and loading states

### Week 2: Fix P1 Accessibility Issues
- **Effort:** 6-8 hours
- **Focus:** Chart accessibility, time filter buttons, enum label display
- **Deliverable:** WCAG 2.1 AA compliant reports page

### Week 3: Polish (P1 + P2)
- **Effort:** 10-12 hours
- **Focus:** Inline validation, auto-calculations, summary stats
- **Deliverable:** Production-grade UX on all pages

---

## Sign-Off

**Pages Audited:** 3 (Investments, Reports, Friends)  
**Issues Found:** 28 (6 P0, 13 P1, 7 P2, 2 P3)  
**Blocking Issues:** 6 (all P0, all fixable in ~3 hours)

**Status:** ✅ **100% PAGE COVERAGE ACHIEVED**

**Auditor:** Builder Agent (QA Mode)  
**Date:** February 9, 2026 @ 7:40 AM EST  
**Next Steps:** Create work items in Azure DevOps for P0/P1 issues

---

**Report Generated:** February 9, 2026 @ 7:40 AM EST  
**Report Location:** `reports/ui-audit-final-three-pages-2026-02-09.md`
