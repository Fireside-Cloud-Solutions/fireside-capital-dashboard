# ISSUE-A11Y-BUTTONS — Touch Target Accessibility Violations

**Severity:** 🟡 MEDIUM (WCAG 2.5.5 Level AAA)  
**Filed:** February 3, 2026 — 9:55 PM  
**Status:** ✅ RESOLVED  
**Fixed:** February 3, 2026 — 10:00 PM  
**Commit:** b46c813  

## Summary
Multiple button types fail to meet WCAG 2.5.5 touch target size requirement of 44×44px minimum on desktop viewport.

## WCAG Reference
**WCAG 2.5.5 Target Size (Level AAA):**  
> The size of the target for pointer inputs is at least 44 by 44 CSS pixels.

While Level AAA is not required for basic compliance, this is a usability best practice, especially for users with motor disabilities.

## Violations Found

### 1. Page Header Buttons (Desktop)
**File:** `app/assets/css/main.css` lines 224-228  
**Current:**
```css
.page-header .btn,
.page-header-actions .btn {
  height: 40px;
  min-height: 40px;
  max-height: 40px;
}
```
**Impact:** All top-right action buttons (Add Bill, Add Asset, etc.) are only 40px tall  
**Affects:** All 11 HTML pages  
**Fix Required:** Change to `height: 44px; min-height: 44px; max-height: 44px;`

### 2. Time Range Filter Buttons (Desktop)
**File:** `app/assets/css/main.css` lines 705-708  
**Current:**
```css
.time-range-filter .btn {
  border-radius: 0;
  font-size: 12px;
  padding: 6px 12px;
}
```
**Impact:** "1M", "3M", "6M", "1Y", "All" buttons are approximately 28px tall  
**Affects:** index.html (dashboard)  
**Fix Required:** Add `min-height: 44px;`

### 3. Small Buttons (`.btn-sm`) — Desktop
**File:** `app/assets/css/main.css` line 2145-2147  
**Current:**
```css
.table .btn-sm {
  padding: var(--space-1) var(--space-2-5);
  font-size: var(--text-caption);
  border-radius: var(--radius-sm);
}
```
**Missing:** No `min-height` specified for desktop (Bootstrap default is ~31px)  
**Impact:** Table action buttons (Edit, Delete, View) are too small  
**Affects:** All pages with data tables (assets, bills, debts, income, investments, transactions)  
**Fix Required:** Add base rule:
```css
.btn-sm {
  min-height: 44px;
}
```

## ✅ Already Compliant

### Mobile Viewport (@media max-width: 991.98px)
- Base `.btn`: `min-height: 44px` (line 1567-1569) ✅
- `.btn-sm`: `min-height: 44px` (line 1573-1574) ✅
- Font size: 16px (prevents iOS zoom) ✅

### Base Button Styles
- Default `.btn` (line 913-926): `min-height: 44px` ✅

## Recommended Fixes

### Priority 1: Page Header Buttons (Most Visible)
```css
/* main.css line 224 */
.page-header .btn,
.page-header-actions .btn {
  height: 44px;           /* Was 40px */
  min-height: 44px;       /* Was 40px */
  max-height: 44px;       /* Was 40px */
}
```

### Priority 2: Small Buttons (Most Common)
```css
/* main.css — add before line 2145 */
.btn-sm {
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
}
```

### Priority 3: Time Range Filters
```css
/* main.css line 705 */
.time-range-filter .btn {
  border-radius: 0;
  font-size: 12px;
  padding: 6px 12px;
  min-height: 44px;       /* ADD */
}
```

## Testing
After applying fixes, verify with browser DevTools:
1. Inspect any page header button → should show 44×44px computed size
2. Inspect table row Edit/Delete buttons → should show min 44px height
3. Inspect dashboard time range buttons → should show min 44px height

## Notes
- This is a Level AAA requirement (not mandatory for AA compliance)
- Addresses usability for motor-impaired users and mobile accuracy
- No visual regression expected — buttons will look slightly taller but remain proportional

---

**Assignee:** Builder  
**Estimated Effort:** 15 minutes  
**Risk:** Low (CSS-only change)
