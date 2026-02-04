# FC-046: Dashboard Sign Up Button Hierarchy Inconsistency

**Priority:** MEDIUM 🟡  
**Status:** FOUND  
**Date:** 2026-02-04  
**Found By:** Builder (sprint-qa cron)  

---

## Issue

The Sign Up button in the logged-out state header on **index.html (Dashboard)** uses `btn-primary` (flame orange), while **all 10 other pages** use `btn-secondary` (gray) for the same button.

### Inconsistency

**Dashboard (index.html) — Line 114:**
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

**All Other Pages (10/11) — Consistent Pattern:**
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

**Pages Using btn-secondary (Correct):**
- assets.html (line 108)
- bills.html (line 112)
- budget.html (line 121)
- debts.html (line 107)
- friends.html (line 102)
- income.html (line 107)
- investments.html (line 107)
- reports.html (line 115)
- settings.html (line 105)
- transactions.html (line 102)

---

## Impact

- **Severity:** Medium
- **User Impact:** Visual inconsistency across pages — confusing user experience
- **Design System Impact:** Violates button hierarchy consistency established in FC-043
- **Scope:** 1/11 pages affected

---

## Root Cause

Dashboard page was created earlier or updated separately from the systematic button hierarchy fixes applied in FC-043 (commit b1e7f62, 2026-02-04).

---

## Design System Rule

Per FC-043 button hierarchy rules:
- **btn-primary (flame orange):** Commitments only (Save, Submit, Confirm)
- **btn-secondary (gray):** Preparatory actions (Add, Search, Open Modal, Navigate)

**Opening a modal is a preparatory action, not a commitment.** The actual commitment is the Submit button inside the signup modal, which correctly uses btn-primary.

---

## Fix Required

Change line 114 in `app/index.html` from `btn-primary` to `btn-secondary`.

### Before (Inconsistent)
```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

### After (Consistent)
```html
<button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#signupModal">
  <i class="bi bi-person-plus"></i> Sign Up
</button>
```

---

## Files to Fix

| File | Line | Change |
|------|------|--------|
| `app/index.html` | 114 | `btn-primary` → `btn-secondary` |

---

## Testing Steps

1. Open Dashboard (index.html) in logged-out state
2. Verify Sign Up button is gray (not orange)
3. Click button → modal opens correctly
4. Compare with other pages → consistent appearance

---

## Prevention

- **Automated testing:** Add visual regression tests for button colors
- **Design system docs:** Create DESIGN-SYSTEM.md with component patterns
- **Code review:** Flag any new btn-primary uses for review

---

**Status:** Ready to fix  
**Estimated Fix Time:** 1 minute
