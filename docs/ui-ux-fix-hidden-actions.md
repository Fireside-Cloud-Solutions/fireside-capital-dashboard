# Fix: Remove Hidden Page Actions

**Issue ID:** FC-UIUX-001  
**Priority:** CRITICAL  
**Estimated Time:** 10 minutes  
**Date Identified:** February 21, 2026

---

## Problem

Primary action buttons on 9 pages are hidden with `class="initially-hidden"` until data loads from Supabase. This creates:

1. **FOUC (Flash of Unstyled Content)** - Buttons pop in after delay
2. **Delayed User Access** - Users can't interact with primary actions immediately
3. **Confusing UX** - Inconsistent button visibility during page load

---

## Affected Files

| File | Line | Element |
|------|------|---------|
| assets.html | 91 | `<div id="pageActions" class="initially-hidden">` |
| bills.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| budget.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| debts.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| friends.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| income.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| investments.html | 90 | `<div id="pageActions" class="initially-hidden">` |
| reports.html | 97 | `<div id="pageActions" class="initially-hidden">` |
| transactions.html | 90 | `<div id="pageActions" class="initially-hidden">` |

**Total:** 9 files

---

## Solution

### Step 1: Global Search/Replace

```powershell
# PowerShell command to fix all files at once
cd C:\Users\chuba\fireside-capital\app

# Find and replace in all HTML files
Get-ChildItem -Filter "*.html" | ForEach-Object {
    (Get-Content $_.FullName) -replace '<div id="pageActions" class="initially-hidden">', '<div id="pageActions">' | Set-Content $_.FullName
}
```

### Step 2: Verify Changes

```powershell
# Verify no more instances exist
Select-String -Path "*.html" -Pattern 'id="pageActions" class="initially-hidden"'
# Expected output: (empty - no matches)
```

### Step 3: Test

1. Open any affected page in browser
2. Verify action buttons are visible immediately on page load
3. Verify buttons still respect auth state (hidden when logged out)

---

## Why This Fix Is Safe

1. **Buttons are already auth-gated** - They only show when user is logged in (handled by `app.js`)
2. **No functional change** - Just removes visual delay
3. **Consistent with best practices** - Primary actions should be immediately visible
4. **No breaking changes** - Removing a CSS class doesn't affect JavaScript behavior

---

## Alternative (If Skeleton State Needed)

If you want to show a loading state for buttons during initial auth check:

```html
<!-- Replace initially-hidden with skeleton state -->
<div id="pageActions" class="skeleton-buttons">
  <button class="btn btn-primary" disabled>
    <span class="spinner-border spinner-border-sm me-2"></span>
    Loading...
  </button>
</div>
```

Then in `app.js`, replace the buttons with real content after auth check.

**Recommendation:** Just remove `initially-hidden` - simpler and better UX.

---

## Expected Outcome

✅ Buttons visible immediately on page load  
✅ No FOUC  
✅ Better perceived performance  
✅ Consistent UX across all pages  

---

## Git Commit Message

```
fix(ui): Remove hidden page actions across 9 pages

- Removed `initially-hidden` class from page action divs
- Buttons now visible immediately (still auth-gated)
- Improves perceived performance and UX consistency
- Fixes FOUC issue with primary actions

Affected pages: assets, bills, budget, debts, friends, income,
investments, reports, transactions

Issue: FC-UIUX-001
```
