# BUG-CSS-001: Hardcoded Colors in main.css

**Priority:** Low  
**Type:** Code Quality / Maintainability  
**File:** `app/assets/css/main.css`  
**Found:** 2026-02-14 07:10 AM  
**Status:** New

## Summary
Several hardcoded color values found in main.css that should use CSS variables for consistency and dark mode compatibility.

## Issues Found

### 1. Button Warning Hover (Lines 1060-1061)
```css
.btn-warning:hover {
  background-color: #d99400;
  border-color: #d99400;
  color: var(--color-text-on-brand);
}
```
**Should be:** Use `var(--color-warning-hover)` or similar variable

### 2. Badge Primary (Lines 1319-1321)
```css
.badge.bg-primary {
  background-color: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
```
**Should be:** Use CSS variables for primary color

### 3. Badge Purple (Lines 1323-1326)
```css
.badge.bg-purple {
  background-color: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}
```
**Should be:** Define and use purple color variables

### 4. Badge Indigo (Lines 1328-1331)
```css
.badge.bg-indigo {
  background-color: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
```
**Should be:** Define and use indigo color variables

### 5. White Color on Danger Hover (Line 1034)
```css
.btn-danger:hover {
  ...
  color: #fff;
  ...
}
```
**Should be:** Use `var(--color-text-on-brand)` for consistency

## Impact
- **Functionality:** None (no user-facing bugs)
- **Maintainability:** Medium (harder to update color scheme)
- **Dark Mode:** Low (most work correctly, but inconsistent)
- **Accessibility:** None

## Recommendation
1. Define missing color variables in `design-tokens.css`
2. Replace hardcoded values with CSS variables
3. Ensure all badge colors have dark mode support

## Test Coverage
- Verified on Reports page
- Confirmed no visual regressions

## Related
- Part of systematic CSS audit (Sprint QA)
