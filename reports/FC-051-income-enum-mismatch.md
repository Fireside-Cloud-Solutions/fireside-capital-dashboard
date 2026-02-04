# FC-051: Income Type & Frequency Dropdown Values Don't Match Database Schema

**Issue ID:** FC-051  
**Severity:** 🔴 CRITICAL  
**Category:** Data Integrity / Form Validation  
**Page:** income.html  
**Found:** 2026-02-04 11:00 AM (Sprint QA Session)

---

## Issue

The income form has **TWO critical enum mismatches**: both Type and Frequency dropdowns use values that don't match the database schema. **This is the most severe enum issue found — affects TWO fields.**

---

## Problem 1: Income Type Mismatch

### HTML Form (income.html, line 180-186)
```html
<label for="incomeType" class="form-label">Type</label>
<select class="form-select" id="incomeType" required>
  <option value="">Choose...</option>
  <option>W2</option>
  <option>1099</option>
  <option>Other</option>
</select>
```

**Values sent to database:** `W2`, `1099`, `Other`

### Database Schema (docs/database-constraints.md)
**Valid Income Types:**
- `salary` ✅
- `hourly` ✅
- `commission` ✅
- `bonus` ✅
- `freelance` ✅
- `rental` ✅
- `investment` ✅
- `other` ✅

**Result:** Form only offers 3 values, none of which match the 8 valid enum values! **100% mismatch.**

---

## Problem 2: Income Frequency Mismatch

### HTML Form (income.html, line 197-203)
```html
<label for="incomeFrequency" class="form-label">Frequency</label>
<select class="form-select" id="incomeFrequency" required>
  <option value="">Choose...</option>
  <option>Bi-Weekly</option>
  <option>Monthly</option>
  <option>Annually</option>
</select>
```

**Values sent to database:** `Bi-Weekly`, `Monthly`, `Annually` (capitalized)

### Database Schema (docs/database-constraints.md)
**Valid Income Frequencies:**
- `weekly` ✅
- `bi-weekly` ✅ (lowercase, hyphenated)
- `semi-monthly` ✅
- `monthly` ✅ (lowercase)
- `quarterly` ✅
- `annually` ✅ (lowercase)

**Result:** 
- Case mismatch on all 3 values
- Missing 3 valid frequencies: `weekly`, `semi-monthly`, `quarterly`

---

## Combined Impact

**Before Fix:**
- ❌ **Type field:** 100% invalid — none of the 3 options match DB schema
- ❌ **Frequency field:** Case mismatch + missing 3 options
- ❌ Database constraint violations block ALL income creation
- ❌ Users cannot track any income
- ❌ **This is the most severe form bug in the entire app**

**After Fix:**
- ✅ Type: 8 valid options matching schema
- ✅ Frequency: 6 valid options matching schema
- ✅ Income creation works
- ✅ Consistent data storage

---

## Fix

### HTML Changes
**File:** `app/income.html`

#### Type Dropdown (line 180-186)
```html
<label for="incomeType" class="form-label">Type <span class="text-danger">*</span></label>
<select class="form-select" id="incomeType" required>
  <option value="">Choose...</option>
  <option value="salary">Salary (W2)</option>
  <option value="hourly">Hourly Wages</option>
  <option value="commission">Commission</option>
  <option value="bonus">Bonus</option>
  <option value="freelance">Freelance (1099)</option>
  <option value="rental">Rental Income</option>
  <option value="investment">Investment Income</option>
  <option value="other">Other</option>
</select>
```

#### Frequency Dropdown (line 197-203)
```html
<label for="incomeFrequency" class="form-label">Frequency <span class="text-danger">*</span></label>
<select class="form-select" id="incomeFrequency" required>
  <option value="">Choose...</option>
  <option value="weekly">Weekly</option>
  <option value="bi-weekly">Bi-Weekly (Every 2 Weeks)</option>
  <option value="semi-monthly">Semi-Monthly (Twice a Month)</option>
  <option value="monthly">Monthly</option>
  <option value="quarterly">Quarterly</option>
  <option value="annually">Annually</option>
</select>
```

**Changes:**
- **Type:** Replaced `W2`/`1099`/`Other` with 8 valid enum values
- **Frequency:** Replaced capitalized values with lowercase, added missing options
- **Display text:** User-friendly (e.g., "Salary (W2)" displays, "salary" saves)
- **Asterisks:** Added to both labels (fields have `required` but no visual indicator)

---

## JavaScript Changes
**File:** `app/assets/js/app.js`

### Add Display Name Helpers

```javascript
// Income type display names
function getIncomeTypeDisplayName(type) {
  const typeMap = {
    'salary': 'Salary (W2)',
    'hourly': 'Hourly',
    'commission': 'Commission',
    'bonus': 'Bonus',
    'freelance': 'Freelance (1099)',
    'rental': 'Rental',
    'investment': 'Investment',
    'other': 'Other'
  };
  return typeMap[type] || type;
}

// Income frequency display names
function getIncomeFrequencyDisplayName(freq) {
  const freqMap = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-Weekly',
    'semi-monthly': 'Semi-Monthly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually'
  };
  return freqMap[freq] || freq;
}
```

### Update renderIncome()

```javascript
tbody.innerHTML = incomes.map(inc => `
    <tr>
        <td>${escapeHtml(inc.name)}</td>
        <td>${escapeHtml(getIncomeTypeDisplayName(inc.type))}</td> <!-- Use display name -->
        <td>${formatCurrency(inc.amount)}</td>
        <td>${escapeHtml(getIncomeFrequencyDisplayName(inc.frequency))}</td> <!-- Use display name -->
        <td>${inc.nextDueDate ? escapeHtml(formatDate(inc.nextDueDate)) : '-'}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openIncomeModal('${escapeAttribute(inc.id)}')" aria-label="Edit ${escapeAttribute(inc.name)}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteIncome('${escapeAttribute(inc.id)}', '${escapeAttribute(inc.name)}')" aria-label="Delete ${escapeAttribute(inc.name)}"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`).join('');
```

### Update openIncomeModal()

```javascript
function openIncomeModal(id = null) {
  editIncomeId = id;
  const f = document.getElementById('incomeForm');
  f.reset();
  if (id) {
    const inc = window.incomes.find(i => i.id == id);
    if(inc) {
      f.incomeName.value = escapeHtml(inc.name || '');
      f.incomeType.value = inc.type || ''; // ✅ Sets enum value correctly
      f.incomeAmount.value = inc.amount;
      f.incomeFrequency.value = inc.frequency || ''; // ✅ Sets enum value correctly
      f.incomeNextDueDate.value = inc.nextDueDate;
    }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
```

---

## Testing

### Manual Test
1. Open income.html
2. Click "Add Income"
3. Test each type:
   - Salary (W2) → saves as `salary`
   - Freelance (1099) → saves as `freelance`
4. Test each frequency:
   - Bi-Weekly → saves as `bi-weekly`
   - Monthly → saves as `monthly`
5. Verify:
   - No database errors
   - Type/frequency display correctly in table
   - Edit modal shows correct values selected

### Database Constraint Test
```sql
-- This should SUCCEED
INSERT INTO public.income (user_id, name, type, amount, frequency)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Salary', 'salary', 5000, 'bi-weekly');

-- This should FAIL (invalid type)
INSERT INTO public.income (user_id, name, type, amount, frequency)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test W2', 'W2', 5000, 'bi-weekly');
-- Expected error: violates check constraint "income_type_valid"

-- This should FAIL (invalid frequency)
INSERT INTO public.income (user_id, name, type, amount, frequency)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 'salary', 5000, 'Bi-Weekly');
-- Expected error: violates check constraint "income_frequency_valid"
```

---

## Related Issues

- **FC-048:** Investment type enum mismatch (HIGH)
- **FC-050:** Debt type enum mismatch (HIGH)
- **FC-051:** Income type/frequency mismatch (CRITICAL) ⬅ Most severe
- **Next:** Check bills.html for similar issues

---

## Priority

🔴 **CRITICAL** - **Blocks ALL income creation.** Type field has 100% mismatch (none of the 3 options are valid). This is the most severe form bug in the app.

---

## Data Migration Needed?

Check existing income records for invalid types/frequencies:

```sql
-- Check invalid types
SELECT id, name, type FROM income 
WHERE type NOT IN ('salary', 'hourly', 'commission', 'bonus', 'freelance', 'rental', 'investment', 'other');

-- Check invalid frequencies
SELECT id, name, frequency FROM income 
WHERE frequency NOT IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly', 'quarterly', 'annually');

-- Possible migration (if needed):
UPDATE income SET type = 'salary' WHERE type = 'W2';
UPDATE income SET type = 'freelance' WHERE type = '1099';
UPDATE income SET frequency = LOWER(frequency); -- Fix case
```

---

**Status:** ⏳ OPEN  
**Assigned:** Builder (URGENT - blocks income tracking entirely)  
**Est. Time:** 15 minutes
