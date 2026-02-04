# FC-050: Debt Type Dropdown Values Don't Match Database Schema

**Issue ID:** FC-050  
**Severity:** 🔴 HIGH  
**Category:** Data Integrity / Form Validation  
**Page:** debts.html  
**Found:** 2026-02-04 10:56 AM (Sprint QA Session)

---

## Issue

The debt form's "Type" dropdown uses display-friendly values that **do not match the database enum constraint**, causing potential data validation failures or inconsistent data storage. **Same pattern as FC-048 (investments).**

---

## Current State

### HTML Form (debts.html, line 201-208)
```html
<label for="debtType" class="form-label">Type</label>
<select class="form-select" id="debtType" required>
  <option value="">Choose...</option>
  <option>Credit Card</option>
  <option>Mortgage</option>
  <option>Student Loan</option>
  <option>Auto Loan</option>
  <option>Other</option>
</select>
```

**Values sent to database:**
- `Credit Card` (with space, capitalized)
- `Mortgage`
- `Student Loan` (with space, capitalized)
- `Auto Loan` (with space, capitalized)
- `Other` (capitalized)

### Database Schema (docs/database-constraints.md)
**Valid Debt Types (CHECK constraint `debts_type_valid`):**
- `credit-card` ✅ (lowercase, hyphenated)
- `student-loan` ✅ (lowercase, hyphenated)
- `mortgage` ✅ (lowercase)
- `auto-loan` ✅ (lowercase, hyphenated)
- `personal-loan` ✅ (lowercase, hyphenated)
- `other` ✅ (lowercase)

---

## Problem

### Mismatches:
| Form Value | DB Expects | Status |
|------------|------------|--------|
| `Credit Card` | `credit-card` | ❌ Invalid (space + capitalization) |
| `Mortgage` | `mortgage` | ⚠️ Case mismatch (DB uses lowercase) |
| `Student Loan` | `student-loan` | ❌ Invalid (space + capitalization) |
| `Auto Loan` | `auto-loan` | ❌ Invalid (space + capitalization) |
| `Other` | `other` | ⚠️ Case mismatch (DB uses lowercase) |
| ❌ Missing | `personal-loan` | Not available in form |

**Result:**
- Form submissions likely fail database CHECK constraint
- If constraint not enforced, inconsistent data stored
- Users cannot save debts
- Missing "Personal Loan" option

---

## Root Cause

The form dropdown was created with user-friendly labels but **no `value` attributes**, so the display text is sent directly to the database instead of lowercase hyphenated enum values.

---

## Fix

### HTML Changes
**File:** `app/debts.html` (line 201-208)

Replace dropdown with proper `value` attributes:

```html
<label for="debtType" class="form-label">Type <span class="text-danger">*</span></label>
<select class="form-select" id="debtType" required>
  <option value="">Choose...</option>
  <option value="credit-card">Credit Card</option>
  <option value="mortgage">Mortgage</option>
  <option value="student-loan">Student Loan</option>
  <option value="auto-loan">Auto Loan</option>
  <option value="personal-loan">Personal Loan</option>
  <option value="other">Other</option>
</select>
```

**Changes:**
- Added explicit `value` attributes matching database enum
- Display text remains user-friendly (e.g., "Credit Card" displays, "credit-card" saves)
- Added missing `personal-loan` option
- Added asterisk to label (field has `required` attribute but no visual indicator)

### JavaScript Changes
**File:** `app/assets/js/app.js`

**Update `openDebtModal()` function** to handle enum display:

```javascript
function openDebtModal(id = null) {
  editDebtId = id;
  const f = document.getElementById('debtForm');
  f.reset();
  if (id) {
    const debt = window.debts.find(d => d.id == id);
    if(debt) {
      f.debtName.value = escapeHtml(debt.name || '');
      f.debtType.value = debt.type || ''; // ✅ This already works correctly (sets value, not display text)
      f.debtAmount.value = debt.amount;
      f.debtInterest.value = debt.interestRate;
      f.debtTerm.value = debt.term;
      f.debtMonthly.value = debt.monthlyPayment;
      f.debtNextPaymentDate.value = debt.nextPaymentDate;
    }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
```

**Update table rendering** to display user-friendly type names:

```javascript
// Add helper function for debt type display names
function getDebtTypeDisplayName(type) {
  const typeMap = {
    'credit-card': 'Credit Card',
    'mortgage': 'Mortgage',
    'student-loan': 'Student Loan',
    'auto-loan': 'Auto Loan',
    'personal-loan': 'Personal Loan',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

// Update renderDebts() to use display names in table
tbody.innerHTML = debts.map(debt => `
    <tr>
        <td>${escapeHtml(debt.name)}</td>
        <td>${escapeHtml(getDebtTypeDisplayName(debt.type))}</td> <!-- Use display name -->
        <td>${formatCurrency(debt.amount)}</td>
        ...
    </tr>`).join('');
```

---

## Testing

### Manual Test
1. Open debts.html
2. Click "Add Debt"
3. Fill form with each debt type (including new "Personal Loan")
4. Save and verify:
   - No database errors
   - Type displays correctly in table
   - Edit modal shows correct type selected
5. Check database: `SELECT DISTINCT type FROM debts;`
   - Should only show lowercase hyphenated values: `credit-card`, `student-loan`, etc.

### Database Constraint Test
```sql
-- This should SUCCEED (valid enum value)
INSERT INTO public.debts (user_id, name, type, amount, interestRate, term, monthlyPayment)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 'credit-card', 5000, 18.5, 24, 250);

-- This should FAIL (invalid enum value)
INSERT INTO public.debts (user_id, name, type, amount, interestRate, term, monthlyPayment)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 'Credit Card', 5000, 18.5, 24, 250);
-- Expected error: violates check constraint "debts_type_valid"
```

---

## Impact

**Before Fix:**
- ❌ Form saves invalid enum values (`Credit Card`, `Student Loan`, `Auto Loan`)
- ❌ Database constraint violations (if enforced)
- ❌ Inconsistent data in database
- ❌ Users cannot save debts (if constraint is enforced)
- ❌ Missing "Personal Loan" option

**After Fix:**
- ✅ Form saves valid lowercase hyphenated enum values
- ✅ Consistent with database schema
- ✅ Display remains user-friendly
- ✅ All 6 debt types available

---

## Related Issues

- **FC-048:** Investment type enum mismatch (same pattern)
- **FC-025:** Enum normalization task (backlog) — may have cleaned up existing data
- **Database Constraints:** Migration 003 added enum validation

---

## Priority

🔴 **HIGH** - Breaks debt creation if database constraints are enforced. Data integrity issue. **Blocks core functionality.**

---

## Additional Recommendations

1. **Add form-level validation** to match database constraints:
   ```javascript
   // In saveDebt(), before database save:
   const validTypes = ['credit-card', 'mortgage', 'student-loan', 'auto-loan', 'personal-loan', 'other'];
   if (!validTypes.includes(record.type)) {
     alert('Invalid debt type selected.');
     return;
   }
   ```

2. **Audit existing data** for invalid types:
   ```sql
   SELECT id, name, type FROM debts 
   WHERE type NOT IN ('credit-card', 'mortgage', 'student-loan', 'auto-loan', 'personal-loan', 'other');
   ```

3. **Systematic fix across all forms:**
   - Investments (FC-048) ✅ Already documented
   - Debts (FC-050) ✅ This issue
   - Bills (check next)
   - Income (check next)

---

**Status:** ⏳ OPEN  
**Assigned:** Builder (URGENT - blocks debt creation)  
**Est. Time:** 10 minutes
