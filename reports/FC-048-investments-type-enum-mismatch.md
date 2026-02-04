# FC-048: Investment Type Dropdown Values Don't Match Database Schema

**Issue ID:** FC-048  
**Severity:** 🔴 HIGH  
**Category:** Data Integrity / Form Validation  
**Page:** investments.html  
**Found:** 2026-02-04 10:48 AM (Sprint QA Session)

---

## Issue

The investment form's "Type" dropdown uses display-friendly values that **do not match the database enum constraint**, causing potential data validation failures or inconsistent data storage.

---

## Current State

### HTML Form (investments.html, line 188-195)
```html
<select class="form-select" id="investmentType" required>
  <option value="">Choose...</option>
  <option>Stock</option>
  <option>Crypto</option>
  <option>401(k)</option>
  <option>Real Estate</option>
  <option>Other</option>
</select>
```

**Values sent to database:**
- `Stock`
- `Crypto`
- `401(k)`
- `Real Estate`
- `Other`

### Database Schema (docs/database-constraints.md)
**Valid Investment Types (CHECK constraint `investments_type_valid`):**
- `401k` ✅
- `ira` ✅
- `roth-ira` ✅
- `brokerage` ✅
- `savings` ✅
- `cd` ✅
- `crypto` ✅
- `other` ✅

---

## Problem

### Mismatches:
| Form Value | DB Expects | Status |
|------------|------------|--------|
| `Stock` | `brokerage` or `401k` | ❌ Invalid (not in enum) |
| `Crypto` | `crypto` | ⚠️ Case mismatch (DB uses lowercase) |
| `401(k)` | `401k` | ❌ Invalid (parentheses not in enum) |
| `Real Estate` | `other` or `brokerage`? | ❌ Invalid (not in enum) |
| `Other` | `other` | ⚠️ Case mismatch (DB uses lowercase) |

**Result:**
- Form submissions likely fail database CHECK constraint
- If constraint not enforced, inconsistent data stored
- Users cannot save investments

---

## Root Cause

The form dropdown was created with user-friendly labels but **no `value` attributes**, so the display text is sent directly to the database instead of lowercase enum values.

---

## Fix

### HTML Changes
**File:** `app/investments.html` (line 188-195)

Replace dropdown with proper `value` attributes:

```html
<label for="investmentType" class="form-label">Type <span class="text-danger">*</span></label>
<select class="form-select" id="investmentType" required>
  <option value="">Choose...</option>
  <option value="401k">401(k)</option>
  <option value="ira">Traditional IRA</option>
  <option value="roth-ira">Roth IRA</option>
  <option value="brokerage">Brokerage Account</option>
  <option value="savings">High-Yield Savings</option>
  <option value="cd">Certificate of Deposit (CD)</option>
  <option value="crypto">Cryptocurrency</option>
  <option value="other">Other</option>
</select>
```

**Changes:**
- Added explicit `value` attributes matching database enum
- Display text remains user-friendly (e.g., "401(k)" displays, "401k" saves)
- Covers all 8 valid enum values
- Added "Traditional IRA" and "Roth IRA" options (were missing)
- Added "High-Yield Savings" and "CD" options (were missing)
- Changed "Stock" to "Brokerage Account" (more accurate)
- Removed "Real Estate" (doesn't fit investment tracking; belongs in Assets)

### JavaScript Changes
**File:** `app/assets/js/app.js`

**Update `openInvestmentModal()` function** (line 1042) to handle enum display:

```javascript
function openInvestmentModal(id = null) {
  editInvestmentId = id;
  const f = document.getElementById('investmentForm');
  f.reset();
  if (id) {
    const inv = window.investments.find(i => i.id == id);
    if(inv) {
      f.investmentName.value = escapeHtml(inv.name || '');
      // Set the value, not the display text
      f.investmentType.value = inv.type || ''; // ✅ This already works correctly
      f.investmentValue.value = inv.value;
      f.startingBalance.value = inv.startingBalance || '';
      f.monthlyContribution.value = inv.monthlyContribution;
      f.annualReturn.value = inv.annualReturn;
      f.nextContributionDate.value = inv.nextContributionDate;
    }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
```

**Update table rendering** (line 1026) to display user-friendly type names:

```javascript
// Add helper function for investment type display names
function getInvestmentTypeDisplayName(type) {
  const typeMap = {
    '401k': '401(k)',
    'ira': 'Traditional IRA',
    'roth-ira': 'Roth IRA',
    'brokerage': 'Brokerage',
    'savings': 'Savings',
    'cd': 'CD',
    'crypto': 'Crypto',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

// Update renderInvestments() line 1026
tbody.innerHTML = investments.map(inv => `
    <tr>
        <td>${escapeHtml(inv.name)}</td>
        <td>${escapeHtml(getInvestmentTypeDisplayName(inv.type))}</td> <!-- Use display name -->
        <td class="hide-mobile">${formatCurrency(inv.startingBalance)}</td>
        ...
    </tr>`).join('');
```

---

## Testing

### Manual Test
1. Open investments.html
2. Click "Add Investment"
3. Fill form with each investment type
4. Save and verify:
   - No database errors
   - Type displays correctly in table
   - Edit modal shows correct type selected
5. Check database: `SELECT DISTINCT type FROM investments;`
   - Should only show lowercase enum values: `401k`, `ira`, `roth-ira`, etc.

### Database Constraint Test
```sql
-- This should SUCCEED (valid enum value)
INSERT INTO public.investments (user_id, name, type, value)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test 401k', '401k', 10000);

-- This should FAIL (invalid enum value)
INSERT INTO public.investments (user_id, name, type, value)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Stock', 'Stock', 10000);
-- Expected error: violates check constraint "investments_type_valid"
```

---

## Impact

**Before Fix:**
- ❌ Form saves invalid enum values (`Stock`, `401(k)`, `Real Estate`)
- ❌ Database constraint violations (if enforced)
- ❌ Inconsistent data in database
- ❌ Users cannot save investments (if constraint is enforced)

**After Fix:**
- ✅ Form saves valid lowercase enum values
- ✅ Consistent with database schema
- ✅ Display remains user-friendly
- ✅ All 8 investment types available

---

## Related Issues

- **FC-025:** Enum normalization task (backlog) — may have cleaned up existing data
- **Database Constraints:** Migration 003 added enum validation

---

## Priority

🔴 **HIGH** - Breaks investment creation if database constraints are enforced. Data integrity issue.

---

## Additional Recommendations

1. **Add form-level validation** to match database constraints:
   ```javascript
   // In saveInvestment(), before database save:
   const validTypes = ['401k', 'ira', 'roth-ira', 'brokerage', 'savings', 'cd', 'crypto', 'other'];
   if (!validTypes.includes(record.type)) {
     alert('Invalid investment type selected.');
     return;
   }
   ```

2. **Audit existing data** for invalid types:
   ```sql
   SELECT id, name, type FROM investments 
   WHERE type NOT IN ('401k', 'ira', 'roth-ira', 'brokerage', 'savings', 'cd', 'crypto', 'other');
   ```

3. **Add missing label** to Type field (currently has no `<span class="text-danger">*</span>` but field is `required`)

---

**Status:** ⏳ OPEN  
**Assigned:** Builder (URGENT - blocks investment creation)  
**Est. Time:** 15 minutes
