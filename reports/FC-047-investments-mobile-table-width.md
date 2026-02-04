# FC-047: Investments Table Too Wide on Mobile

**Issue ID:** FC-047  
**Severity:** 🟡 MEDIUM  
**Category:** Mobile UX  
**Page:** investments.html  
**Found:** 2026-02-04 10:44 AM (Sprint QA Session)

---

## Issue

The investments table displays 8 columns on mobile, forcing horizontal scroll and making the table difficult to use. Similar to FC-033 (debts table fix), low-priority columns should be hidden on mobile.

---

## Current State

**Investments Table Columns (8 total):**
1. Name
2. Type
3. Starting Balance
4. Monthly Contribution
5. Annual Return
6. Next Contribution
7. Current Value
8. Actions

**Mobile Experience:**
- All 8 columns visible → extremely wide table
- Users must horizontal scroll to see Current Value and Actions
- Poor UX for primary use case (checking account values)

---

## Expected Behavior

Hide low-priority columns on mobile (≤767px), keeping only essential data:

**Visible on Mobile:**
- Name (identity)
- Type (context)
- Current Value (primary metric)
- Actions (edit/delete)

**Hidden on Mobile:**
- Starting Balance (historical, less actionable)
- Monthly Contribution (nice-to-have)
- Annual Return (nice-to-have)
- Next Contribution (less critical)

---

## Fix

### HTML Changes
**File:** `app/investments.html`

Add `.hide-mobile` class to low-priority columns:

```html
<thead>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th class="hide-mobile">Starting Balance</th>
    <th class="hide-mobile">Monthly Contribution</th>
    <th class="hide-mobile">Annual Return</th>
    <th class="hide-mobile">Next Contribution</th>
    <th>Current Value</th>
    <th>Actions</th>
  </tr>
</thead>
```

### JavaScript Changes
**File:** `app/assets/js/app.js`

Update `renderInvestments()` function (line 1024-1033) to add `.hide-mobile` to corresponding `<td>` elements:

```javascript
tbody.innerHTML = investments.map(inv => `
    <tr>
        <td>${escapeHtml(inv.name)}</td>
        <td>${escapeHtml(inv.type)}</td>
        <td class="hide-mobile">${formatCurrency(inv.startingBalance)}</td>
        <td class="hide-mobile">${formatCurrency(inv.monthlyContribution)}</td>
        <td class="hide-mobile">${escapeHtml(inv.annualReturn ? inv.annualReturn + '%' : '-')}</td>
        <td class="hide-mobile">${inv.nextContributionDate ? escapeHtml(formatDate(inv.nextContributionDate)) : '-'}</td>
        <td>${formatCurrency(inv.value)}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openInvestmentModal('${escapeAttribute(inv.id)}')" aria-label="Edit ${escapeAttribute(inv.name)}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteInvestment('${escapeAttribute(inv.id)}', '${escapeAttribute(inv.name)}')" aria-label="Delete ${escapeAttribute(inv.name)}"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`).join('');
```

### CSS (Already Exists)
**File:** `app/assets/css/responsive.css` (line 139-141)

```css
/* Hide low-priority columns on mobile (FC-033 fix) */
.table .hide-mobile {
  display: none !important;
}
```

---

## Impact

**Before Fix:**
- 8 columns on mobile → table width ~800px
- Horizontal scroll required to see Current Value
- Poor mobile UX

**After Fix:**
- 4 columns on mobile → table width ~500px
- All essential data visible without scrolling
- Consistent with debts page pattern (FC-033)

---

## Testing

1. Open investments.html on mobile (≤767px)
2. Add test investment
3. Verify only Name, Type, Current Value, Actions visible
4. Verify Starting Balance, Monthly Contribution, Annual Return, Next Contribution hidden
5. Test desktop (>768px) - all columns should remain visible

---

## Related Issues

- **FC-033:** Debts page mobile table fix (same pattern applied)
- Design system: Mobile-first responsive tables

---

## Priority

🟡 **MEDIUM** - Impacts mobile UX but users can still horizontal scroll to access data. Non-blocking for launch.

---

**Status:** ⏳ OPEN  
**Assigned:** Builder (next sprint)
