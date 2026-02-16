# BUG-ASSETS-TABLE-001: Assets Table Column Header Mismatch

**Date:** 2026-02-16  
**Reported by:** Builder (QA Audit)  
**Priority:** P0 CRITICAL  
**Type:** Bug  
**Status:** New  
**Page:** assets.html  

---

## Summary
Assets table has critical column header mismatch — table shows only 5 column headers but renders 7 data columns, causing misalignment and data display errors.

## Current Behavior
**Table Header (Visible):**
- Name
- Type
- Equity ❌ (WRONG)
- Next Due ❌ (WRONG)
- Actions ❌ (WRONG)

**Data Rows (Visible):**
- Name: "BMW X5"
- Type: "Vehicle"
- Value: "$85,000.00"
- Loan: "$44,320.00"
- Equity: "$40,680.00"
- Next Due: "7/14/2025"
- Actions: [Edit] [Delete] buttons

**HTML Source (assets.html lines 139-146):**
```html
<thead>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Current Value</th>
    <th>Loan Balance</th>
    <th>Equity</th>
    <th>Next Due</th>
    <th>Actions</th>
  </tr>
</thead>
```

## Expected Behavior
Table headers should match the HTML source:
- Name
- Type
- Current Value
- Loan Balance
- Equity
- Next Due
- Actions

## Root Cause
**Hypothesis:** CSS is hiding 2 columns ("Current Value" and "Loan Balance") in the thead but NOT hiding them in the tbody, causing column misalignment.

**Likely culprit:** Responsive CSS or custom table CSS hiding specific th elements but not corresponding td elements.

## Steps to Reproduce
1. Log in to https://nice-cliff-05b13880f.2.azurestaticapps.net
2. Navigate to Assets page
3. Observe table header shows only 5 columns
4. Observe data rows show 7 columns
5. Headers don't match data

## Impact
- **User Confusion:** HIGH — Users see "Equity" header but data shows "Current Value"
- **Data Integrity:** HIGH — Column labels completely misrepresent the data
- **Accessibility:** CRITICAL — Screen readers will announce wrong column headers

## Browser
- Chrome 131.x (clawd browser)
- Resolution: 1920x1080
- Dark mode: enabled

## Fix Required
1. Audit ALL CSS files for table column hiding rules
2. Ensure responsive CSS hides BOTH th AND td for same column index
3. Test on mobile/tablet breakpoints
4. Verify all 11 pages with tables (assets, bills, debts, income, investments, budget, transactions, etc.)

## Screenshots
See browser screenshot: Assets page showing 5-column header with 7-column data rows

## Related
- May affect other table-based pages (bills.html, debts.html, investments.html, income.html)
- Could be related to responsive CSS refactoring from FC-017

---

**Next Steps:**
1. Search all CSS files for th/td hiding rules
2. Check responsive.css for table-specific media queries
3. Test fix across all breakpoints
4. Create PR with fix + verification screenshots
