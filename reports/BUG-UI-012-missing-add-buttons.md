# BUG-UI-012: Missing "Add" Buttons on Multiple Pages

**Priority:** P0 CRITICAL  
**Type:** Bug  
**Effort:** 30 minutes  
**Discovered:** 2026-02-15 06:40 AM (Sprint QA Session)  
**Status:** NEW  
**Affects:** Assets page (confirmed), potentially Investments, Debts, Bills, Income pages

---

## Problem

The "Add Asset" button exists in HTML but is not visible to users because the JavaScript is not properly removing the `initially-hidden` class.

### Root Cause

File: `app/assets/js/app.js` line 3684

```javascript
// CURRENT (BROKEN):
if (document.getElementById('pageActions')) {
  document.getElementById('pageActions').style.display = currentUser ? '' : 'none';
}
```

**Issue:** Setting `style.display = ''` (empty string) doesn't override the CSS class `.initially-hidden { display: none; }`. The class must be removed.

---

## Evidence

### Browser Inspection (Assets Page)

```javascript
{
  "exists": true,
  "display": "",                    // inline style is empty (not overriding CSS)
  "classList": ["initially-hidden"], // CSS class still present
  "computedDisplay": "none"         // Result: hidden
}
```

### HTML Structure

```html
<!-- assets.html line 106 -->
<div id="pageActions" class="initially-hidden">
  <button class="btn btn-secondary btn-touch-target" id="openAssetModalBtn" 
    aria-label="Add new asset">
    <i class="bi bi-plus-circle"></i> Add Asset
  </button>
</div>
```

### CSS

```css
/* utilities.css line 12 */
.initially-hidden {
  display: none;
}
```

---

## Impact

**User Impact:** CRITICAL — Users cannot add assets, debts, bills, or income sources. Core functionality is broken.

**Scope:** Likely affects all pages using the `#pageActions` pattern:
- ✅ Assets page (confirmed broken)
- ⚠️ Investments page (empty state works, but table view untested)
- ⚠️ Debts page
- ⚠️ Bills page  
- ⚠️ Income page

---

## Fix

### Option 1: Remove Class (Recommended)

```javascript
// app/assets/js/app.js line 3683-3685
if (document.getElementById('pageActions')) {
  const pageActions = document.getElementById('pageActions');
  if (currentUser) {
    pageActions.classList.remove('initially-hidden');
  } else {
    pageActions.style.display = 'none';
  }
}
```

### Option 2: Force Inline Display

```javascript
// Alternative (less clean)
if (document.getElementById('pageActions')) {
  document.getElementById('pageActions').style.display = currentUser ? 'block' : 'none';
}
```

**Recommended:** Option 1 (remove class) — cleaner, allows CSS to control layout.

---

## Testing

### Manual Test Plan

1. Login to Fireside Capital
2. Navigate to Assets page
3. **EXPECTED:** "Add Asset" button visible below page heading
4. **ACTUAL:** No button visible (FAIL ❌)

### Regression Test

After fix, verify on all 5 affected pages:
- [ ] Assets page shows "Add Asset" button
- [ ] Investments page shows "Add Investment" button (when table has data)
- [ ] Debts page shows "Add Debt" button
- [ ] Bills page shows "Add Bill" button
- [ ] Income page shows "Add Income" button

---

## Acceptance Criteria

- [x] Identify root cause
- [ ] Apply fix to app.js line 3684
- [ ] Test on all 5 pages (Assets, Investments, Debts, Bills, Income)
- [ ] Verify button hierarchy still correct (btn-secondary for main page buttons)
- [ ] No visual regressions
- [ ] Git commit with descriptive message
- [ ] Azure CI/CD deployment

---

## Related Issues

- ✅ BUG-DASH-001: Button hierarchy violations (FIXED in Session 0548)
- This bug was introduced AFTER the button hierarchy fix (likely during refactoring)

---

## Azure DevOps

**Work Item:** [Bug] Missing "Add" Buttons - Users Cannot Add Assets/Debts/Bills/Income  
**Priority:** P0 CRITICAL  
**Effort:** 0.5 hours  
**Sprint:** Current

---

**Report Created:** 2026-02-15 06:45 AM  
**Agent:** Capital (QA Orchestrator)  
**Session:** Sprint QA 013cc4e7
