# BUG-AUTH-001: Budget & Settings Pages Show Logged-Out CTA When Authenticated

## Priority: **P0 - CRITICAL** 🔴

## Status: NEW
**Found:** 2026-02-23 07:00 AM EST (Sprint QA)  
**Affects:** Production app  
**Impact:** Users cannot access Budget or Settings features

## Description
The Budget and Settings pages incorrectly display the logged-out CTA (Call To Action) screen with "Login" and "Sign Up" buttons, even when the user is authenticated. The top navigation correctly shows "Welcome, Matt" and the notification bell, confirming the user is logged in.

## Affected Pages
1. **budget.html** — Shows "Create Your Budget" CTA with login buttons
2. **settings.html** — Shows "Customize Your Experience" CTA with login buttons

## Expected Behavior
When authenticated:
- **Budget page** should display budget interface (month selector, budget categories, spending tracking)
- **Settings page** should display settings form (emergency fund goal, preferences, account settings)

## Actual Behavior
Both pages show the logged-out empty state with:
- Icon (calculator for Budget, gear for Settings)
- Marketing headline
- Description text
- Login button (orange)
- Sign Up button (gray outline)

## Root Cause (Hypothesis)
Likely causes:
1. **Auth check failing** — `logged-out-cta.js` might not be properly checking Supabase session
2. **Missing auth state** — Pages might not be calling `checkAuth()` or similar initialization
3. **Conditional rendering logic** — The `d-none` class toggling between `#loggedInState` and `#loggedOutState` containers may be broken on these specific pages

## Steps to Reproduce
1. Login to Fireside Capital (user is authenticated)
2. Navigate to Budget page (budget.html)
3. **Observe:** Logged-out CTA displayed instead of budget interface
4. Navigate to Settings page (settings.html)
5. **Observe:** Logged-out CTA displayed instead of settings form

## Environment
- **URL:** https://nice-cliff-05b13880f.2.azurestaticapps.net
- **Browser:** Chrome (automated testing via Clawdbot)
- **Date:** February 23, 2026
- **User:** Matt (authenticated via Supabase Auth)

## Screenshots
- Budget page: Shows "Create Your Budget" with login buttons
- Settings page: Shows "Customize Your Experience" with login buttons
- Both pages show "Welcome, Matt" in top-right (proof of authentication)

## Files to Investigate
```
app/budget.html
app/settings.html
app/assets/js/logged-out-cta.js
app/assets/js/auth.js (or equivalent Supabase auth handler)
```

## Acceptance Criteria
- ✅ When authenticated, budget.html displays budget interface (NOT the CTA)
- ✅ When authenticated, settings.html displays settings form (NOT the CTA)
- ✅ When NOT authenticated, both pages continue showing the CTA (existing behavior)
- ✅ No console errors related to auth checks
- ✅ Supabase session properly detected on page load

## Recommended Fix
1. Check if `budget.html` and `settings.html` are calling the auth initialization script
2. Verify `logged-out-cta.js` is properly imported and executed
3. Ensure Supabase client is initialized before auth check
4. Add defensive logging to track auth state transitions
5. Test with hard refresh and cache clearing

## Business Impact
- **Severity:** Critical (P0)
- **User Impact:** Users cannot configure budgets or change settings
- **Workaround:** None — features completely inaccessible
- **Affected Users:** 100% of authenticated users trying to access Budget or Settings

## Related Issues
- None identified (new finding from Sprint QA 0700)

## Next Steps
1. Create Azure DevOps work item (Bug, P0)
2. Assign to Builder agent for immediate fix
3. Test fix on local dev environment
4. Verify on live site after deployment
5. Add regression test to prevent recurrence
