# FC-038: Button Style Inconsistencies (Auth & Forgot Password)

**Severity:** LOW (UI Consistency)  
**Pages:** All pages (11 files)  
**Type:** Button style inconsistency  
**Status:** FIXED  
**Found:** 2026-02-04 09:18 AM (Sprint QA)  
**Fixed:** 2026-02-04 09:25 AM (Sprint QA)

## Issues Found

### 1. Logged-Out Auth Buttons
**Files:** friends.html, settings.html

Used `btn-outline-primary` and `btn-primary` instead of consistent `btn-outline-secondary` and `btn-secondary`

### 2. Forgot Password Buttons  
**Files:** All 11 HTML pages

Used `btn-outline-primary` instead of `btn-outline-secondary`

## Current State (friends.html line 105-110)

```html
<button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
  <i class="bi bi-box-arrow-in-right"></i> Login
</button>
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

## Expected State (consistent with all other pages)

```html
<button class="btn btn-outline-secondary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
  <i class="bi bi-box-arrow-in-right"></i> Login
</button>
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

## Impact

- Visual inconsistency across pages
- Friends page buttons appear blue instead of gray
- Breaks design system consistency

## Fix

Replace `btn-outline-primary` with `btn-outline-secondary` and `btn-primary` with `btn-secondary` on friends.html.

## Files Fixed

All 11 HTML pages updated:
- [x] index.html - Forgot password button
- [x] assets.html - Forgot password button
- [x] investments.html - Forgot password button
- [x] debts.html - Forgot password button
- [x] bills.html - Forgot password button
- [x] budget.html - Forgot password button
- [x] income.html - Forgot password button
- [x] transactions.html - Forgot password button
- [x] reports.html - Forgot password button
- [x] settings.html - Auth buttons + Forgot password button
- [x] friends.html - Auth buttons + Forgot password button

## Verification

All buttons now use consistent `btn-outline-secondary` styling across all pages.
