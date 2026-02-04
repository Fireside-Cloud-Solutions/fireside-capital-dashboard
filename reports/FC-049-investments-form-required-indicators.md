# FC-049: Investment Form Missing Required Field Indicators

**Issue ID:** FC-049  
**Severity:** 🟡 MEDIUM  
**Category:** UX / Accessibility  
**Page:** investments.html  
**Found:** 2026-02-04 10:52 AM (Sprint QA Session)

---

## Issue

The investment form has **inconsistent required field indicators**. Five fields have the HTML `required` attribute but only two show the visual `*` asterisk, creating confusion about which fields are mandatory.

---

## Current State

### Form Fields with `required` Attribute

| Field | Line | Has `required` Attr | Has Visual `*` | Consistent? |
|-------|------|---------------------|----------------|-------------|
| Investment Name | 179 | ✅ Yes | ✅ Yes | ✅ Consistent |
| Type | 183 | ✅ Yes | ❌ No | ❌ Inconsistent |
| Starting Balance | 192 | ✅ Yes | ❌ No | ❌ Inconsistent |
| Monthly Contribution | 196 | ✅ Yes | ❌ No | ❌ Inconsistent |
| Annual Return | 200 | ✅ Yes | ❌ No | ❌ Inconsistent |
| Current Value | 204 | ✅ Yes | ✅ Yes | ✅ Consistent |
| Next Contribution Date | 208 | ❌ No | ❌ No | ✅ Consistent (optional) |

**Result:** 4 required fields are missing visual indicators, violating UX consistency.

---

## Code Examples

### Consistent (has both `required` + asterisk)
```html
<label for="investmentName" class="form-label">Investment Name <span class="text-danger">*</span></label>
<input type="text" class="form-control" id="investmentName" required placeholder="e.g., 401(k), Roth IRA, Brokerage">
```

### Inconsistent (has `required` but no asterisk)
```html
<label for="investmentType" class="form-label">Type</label>
<select class="form-select" id="investmentType" required>
  <option value="">Choose...</option>
  ...
</select>
```

---

## User Impact

1. **Confusion:** Users don't know which fields are mandatory until they try to submit
2. **Accessibility:** Screen readers announce "required" but visual users see no indicator
3. **Form errors:** Users submit incomplete forms and get validation errors
4. **Inconsistent with other pages:** assets.html, bills.html, debts.html all show asterisks for required fields

---

## Recommendation

### Option A: Add Asterisks to All Required Fields (Recommended)

**Rationale:** If a field has `required` attribute, it should show `*` for visual consistency and accessibility.

**Changes to `app/investments.html`:**

```html
<!-- Line 183: Type -->
<label for="investmentType" class="form-label">Type <span class="text-danger">*</span></label>

<!-- Line 192: Starting Balance -->
<label for="startingBalance" class="form-label">Starting Balance ($) <span class="text-danger">*</span></label>

<!-- Line 196: Monthly Contribution -->
<label for="monthlyContribution" class="form-label">Monthly Contribution ($) <span class="text-danger">*</span></label>

<!-- Line 200: Annual Return -->
<label for="annualReturn" class="form-label">Expected Annual Return (%) <span class="text-danger">*</span></label>
```

### Option B: Make Some Fields Optional (Alternative)

**Rationale:** Not all investment tracking requires complete data. Users might want to add a 401(k) without knowing the exact annual return percentage.

**Changes to `app/investments.html`:**

```html
<!-- KEEP Required (core identification) -->
<label for="investmentName" class="form-label">Investment Name <span class="text-danger">*</span></label>
<input type="text" class="form-control" id="investmentName" required ...>

<label for="investmentType" class="form-label">Type <span class="text-danger">*</span></label>
<select class="form-select" id="investmentType" required>

<label for="investmentValue" class="form-label">Current Value ($) <span class="text-danger">*</span></label>
<input type="number" class="form-control" id="investmentValue" required ...>

<!-- MAKE Optional (historical/projection data) -->
<label for="startingBalance" class="form-label">Starting Balance ($)</label>
<input type="number" class="form-control" id="startingBalance" min="0" step="0.01"> <!-- Remove required -->

<label for="monthlyContribution" class="form-label">Monthly Contribution ($)</label>
<input type="number" class="form-control" id="monthlyContribution" min="0" step="0.01"> <!-- Remove required -->

<label for="annualReturn" class="form-label">Expected Annual Return (%)</label>
<input type="number" class="form-control" id="annualReturn" min="0" step="0.1"> <!-- Remove required -->
```

---

## Recommendation: Option B (Make Optional)

**Reasoning:**
- **Core required data:** Name, Type, Current Value (minimum viable investment record)
- **Nice-to-have data:** Starting Balance, Monthly Contribution, Annual Return (for projections/analytics)
- **User-friendly:** Allows quick investment adds without complete historical data
- **Consistent with real use cases:** Users might not know exact monthly contribution or return percentage

---

## Testing

1. Remove `required` attribute from Starting Balance, Monthly Contribution, Annual Return
2. Test form submission with only Name, Type, Current Value filled
3. Verify database accepts NULL values for optional fields
4. Verify app.js saveInvestment() function handles null/undefined values correctly (it already uses `getRaw()` which handles this)

---

## Database Schema Check

```sql
-- Verify which investment fields allow NULL
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investments';
```

**Expected nullable fields:**
- `startingBalance` - NULL OK
- `monthlyContribution` - NULL OK
- `annualReturn` - NULL OK
- `nextContributionDate` - NULL OK

**Expected NOT NULL:**
- `name` - required
- `type` - required
- `value` - required
- `user_id` - required

---

## Fix Summary

### Changes to `app/investments.html`

**Remove `required` from 3 fields (lines 192, 196, 200):**
- Starting Balance
- Monthly Contribution
- Annual Return

**Result:**
- Only Name, Type, Current Value are required ✅
- Visual `*` indicators match `required` attributes ✅
- Users can quickly add investments without complete data ✅

---

## Impact

**Before Fix:**
- 5 required fields, only 2 show `*` → confusing UX
- Users must fill all fields even if they don't have the data

**After Fix:**
- 3 required fields, all show `*` → clear UX
- Users can add investments quickly with minimal data

---

## Related Issues

None — this is an isolated form UX issue

---

## Priority

🟡 **MEDIUM** - UX improvement, not blocking functionality. Users can still submit forms, but experience is inconsistent.

---

**Status:** ⏳ OPEN  
**Assigned:** Builder  
**Est. Time:** 5 minutes
