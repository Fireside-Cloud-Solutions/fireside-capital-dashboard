# BUG-A11Y-002: Missing Autocomplete Attributes on Password Fields

**Priority:** P3 LOW  
**Type:** Accessibility / Security  
**Effort:** 15 minutes  
**Discovered:** 2026-02-15 06:40 AM (Sprint QA Session)  
**Status:** NEW

---

## Problem

Password input fields are missing `autocomplete` attributes, preventing browsers from securely auto-filling passwords.

---

## Evidence

### Console Warning (x4)

```
[DOM] Input elements should have autocomplete attributes
(suggested: "current-password"): (More info: https://goo.gl/9p2vKq)

[DOM] Input elements should have autocomplete attributes
(suggested: "new-password"): (More info: https://goo.gl/9p2vKq)
```

**Affected Fields:**
- Login modal: email + password inputs
- Sign Up modal: email + password + confirm password inputs
- Reset Password modal: new password + confirm password inputs

---

## Impact

**User Impact:** LOW  
- Password managers may not auto-fill properly
- Slightly worse UX for returning users

**Security Impact:** LOW  
- Autocomplete helps users choose strong passwords
- Browser password managers are more secure than memorization

**Accessibility Impact:** MEDIUM  
- WCAG 2.1 Level AA requires autocomplete for authentication (1.3.5)

---

## Fix

### index.html Updates

```html
<!-- Login Modal (current) -->
<input type="email" class="form-control" id="loginEmail" required>
<input type="password" class="form-control" id="loginPassword" required>

<!-- Login Modal (fixed) -->
<input type="email" class="form-control" id="loginEmail" autocomplete="email" required>
<input type="password" class="form-control" id="loginPassword" autocomplete="current-password" required>

<!-- Sign Up Modal (current) -->
<input type="email" class="form-control" id="signUpEmail" required>
<input type="password" class="form-control" id="signUpPassword" required>
<input type="password" class="form-control" id="confirmPassword" required>

<!-- Sign Up Modal (fixed) -->
<input type="email" class="form-control" id="signUpEmail" autocomplete="email" required>
<input type="password" class="form-control" id="signUpPassword" autocomplete="new-password" required>
<input type="password" class="form-control" id="confirmPassword" autocomplete="new-password" required>

<!-- Reset Password Modal (current) -->
<input type="password" class="form-control" id="newPassword" required>
<input type="password" class="form-control" id="confirmNewPassword" required>

<!-- Reset Password Modal (fixed) -->
<input type="password" class="form-control" id="newPassword" autocomplete="new-password" required>
<input type="password" class="form-control" id="confirmNewPassword" autocomplete="new-password" required>
```

### All Other Pages

Apply same pattern to any auth forms on other pages (if any).

---

## Autocomplete Values Reference

**Standard values (per https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill):**
- `email` — Email address
- `current-password` — Existing password (login)
- `new-password` — New password (registration, reset)
- `username` — Username (if applicable)

---

## Testing

### Manual Test Plan

1. Apply fix to index.html
2. Open login modal
3. Right-click password field → inspect
4. **EXPECTED:** `autocomplete="current-password"` present
5. Test with browser password manager
6. **EXPECTED:** Browser suggests saved password

### Console Check

After fix:
- [ ] No more "Input elements should have autocomplete" warnings
- [ ] Chrome DevTools → Audits → Best Practices shows no autocomplete warnings

---

## Acceptance Criteria

- [ ] Add `autocomplete="email"` to all email inputs
- [ ] Add `autocomplete="current-password"` to login password inputs
- [ ] Add `autocomplete="new-password"` to signup/reset password inputs
- [ ] Verify console warnings gone
- [ ] Test password manager auto-fill works
- [ ] No visual regressions
- [ ] Git commit changes

---

## Related Issues

- ✅ FC-007: WCAG 2.1 AA accessibility compliance (Done, but missed this)

---

**Report Created:** 2026-02-15 06:50 AM  
**Agent:** Capital (QA Orchestrator)  
**Session:** Sprint QA 013cc4e7
