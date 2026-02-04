# FC-053: Assets Type Dropdown Uses camelCase Instead of kebab-case

**Issue ID:** FC-053  
**Severity:** 🔴 HIGH  
**Category:** Data Integrity / Form Validation  
**Page:** assets.html  
**Found:** 2026-02-04 11:35 AM (Sprint QA Session)

---

## Issue

The assets form's "Type" dropdown uses camelCase for "Real Estate" (`realEstate`) while the database schema expects kebab-case (`real-estate`). This causes database constraint violations when creating real estate assets.

---

## Current State

### HTML Form (assets.html, line 184-189)
```html
<select class="form-select" id="assetType" required>
  <option value="">Choose...</option>
  <option value="realEstate">Real Estate</option>
  <option value="vehicle">Vehicle</option>
  <option value="other">Other</option>
</select>
```

**Values sent to database:**
- `realEstate` ❌ (camelCase)
- `vehicle` ✅
- `other` ✅

### Database Schema (docs/database-constraints.md)
**Valid Asset Types (CHECK constraint `assets_type_valid`):**
- `real-estate` ✅ (kebab-case)
- `vehicle` ✅
- `other` ✅

---

## Problem

**Before Fix:**
- ❌ Selecting "Real Estate" sends `realEstate` to database
- ❌ Database rejects with constraint violation: `violates check constraint "assets_type_valid"`
- ❌ Users cannot create real estate assets
- ✅ Vehicle and Other types work (already lowercase)

**After Fix:**
- ✅ All 3 types use kebab-case format
- ✅ Database accepts all asset types
- ✅ Consistent with bills/debts/income enum patterns

---

## Fix

### HTML Changes
**File:** `app/assets.html` (line 186)

**Before:**
```html
<option value="realEstate">Real Estate</option>
```

**After:**
```html
<option value="real-estate">Real Estate</option>
```

### JavaScript Changes (if needed)
**File:** `app/assets/js/app.js`

Check if there are any display name helpers needed:

```javascript
// Asset type display names
function getAssetTypeDisplayName(type) {
  const typeMap = {
    'real-estate': 'Real Estate',
    'vehicle': 'Vehicle',
    'other': 'Other'
  };
  return typeMap[type] || type;
}
```

Update `renderAssets()` to use display name:
```javascript
tbody.innerHTML = assets.map(a => `
    <tr>
        <td>${escapeHtml(a.name)}</td>
        <td>${escapeHtml(getAssetTypeDisplayName(a.type))}</td> <!-- Use display name -->
        <td>${formatCurrency(a.value)}</td>
        ...
`).join('');
```

Update `openAssetModal()` to set enum value correctly:
```javascript
function openAssetModal(id = null) {
  editAssetId = id;
  const f = document.getElementById('assetForm');
  f.reset();
  if (id) {
    const asset = window.assets.find(a => a.id == id);
    if(asset) {
      f.assetName.value = escapeHtml(asset.name || '');
      f.assetType.value = asset.type || ''; // ✅ Sets enum value correctly (real-estate)
      f.assetValue.value = asset.value;
      // ... rest of fields
    }
  }
  bootstrap.Modal.getOrCreateInstance(f.closest('.modal')).show();
}
```

---

## Testing

### Manual Test
1. Open assets.html
2. Click "Add Asset"
3. Select "Real Estate" from Type dropdown
4. Fill in other required fields
5. Click "Save Asset"
6. **Expected:** Asset saves successfully (no console errors)
7. **Verify:** Asset displays as "Real Estate" in the table (not "real-estate")
8. Edit the asset
9. **Verify:** "Real Estate" option is pre-selected in dropdown

### Database Constraint Test
```sql
-- This should SUCCEED
INSERT INTO public.assets (user_id, name, type, value)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Property', 'real-estate', 300000);

-- This should FAIL (invalid type - camelCase)
INSERT INTO public.assets (user_id, name, type, value)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Property', 'realEstate', 300000);
-- Expected error: violates check constraint "assets_type_valid"
```

---

## Pattern: All Enum Mismatch Issues

| Issue | Page | Field | Severity | Status |
|-------|------|-------|----------|--------|
| FC-048 | investments | type | HIGH | ❌ OPEN |
| FC-050 | debts | type | HIGH | ❌ OPEN |
| FC-051 | income | type + frequency | CRITICAL | ✅ FIXED |
| **FC-053** | **assets** | **type** | **HIGH** | **❌ OPEN** |

**Root Cause:** Inconsistent enum format between HTML forms and database schema  
**Solution Pattern:** Use kebab-case in HTML `value` attributes, display-friendly text in visible labels

---

## Data Migration Needed?

Check existing assets records for invalid types:

```sql
-- Check invalid asset types
SELECT id, name, type FROM assets 
WHERE type NOT IN ('real-estate', 'vehicle', 'other');

-- If any found, fix them:
UPDATE assets SET type = 'real-estate' WHERE type = 'realEstate';
```

---

## Priority

🔴 **HIGH** - Blocks creation of real estate assets (common use case for personal finance tracking)

---

**Status:** ⏳ OPEN  
**Assigned:** Builder  
**Est. Time:** 10 minutes (1 HTML change, 2 JS function additions)  
**Related:** FC-048, FC-050, FC-051 (same enum mismatch pattern)
