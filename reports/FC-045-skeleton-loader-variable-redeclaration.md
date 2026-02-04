# FC-045: Variable Redeclaration in Skeleton Loader Implementation

**Priority:** CRITICAL 🔴  
**Status:** ✅ FIXED  
**Date Found:** 2026-02-04 10:36 AM  
**Date Fixed:** 2026-02-04 10:41 AM  
**Found By:** Builder (sprint-qa cron)  
**Broken Commit:** 5cb93b3  
**Fix Commit:** 2ae98a1

---

## Issue

The skeleton loader implementation in `app.js` `loadFriendsPage()` function has **JavaScript syntax errors** due to variable redeclaration.

### Error Details

```javascript
// Line 4121-4123: Initial declaration
const pendingContainer = document.getElementById('pendingRequestsContainer');
const friendsContainer = document.getElementById('myFriendsContainer');
const outgoingContainer = document.getElementById('outgoingRequestsContainer');

// Lines 4140-4147: After setting skeleton HTML...
const pendingContainer = document.getElementById('pendingRequestsContainer'); // ❌ REDECLARATION
const pendingSection = document.getElementById('pendingRequestsSection');

// Line 4178: After fetching friends data...
const friendsContainer = document.getElementById('myFriendsContainer'); // ❌ REDECLARATION
```

**JavaScript Error:**
```
Uncaught SyntaxError: Identifier 'pendingContainer' has already been declared
Uncaught SyntaxError: Identifier 'friendsContainer' has already been declared
```

---

## Impact

- **Severity:** Critical
- **User Impact:** Friends page will NOT load — JavaScript execution stops at the redeclaration
- **Scope:** 100% of Friends page users
- **Data Loss Risk:** None (syntax error prevents execution)

---

## Root Cause

When adding skeleton loaders, the developer declared container variables at the top of the function (lines 4121-4123), then **redeclared the same variables** later when loading actual data (lines 4147, 4178).

This violates JavaScript `const` declaration rules — you cannot redeclare a `const` variable in the same scope.

---

## Fix Required

Remove the redeclarations on lines 4147 and 4178. The variables are already declared at the top of the function.

### Before (Broken)
```javascript
async function loadFriendsPage() {
  const pendingContainer = document.getElementById('pendingRequestsContainer'); // Line 4121
  const friendsContainer = document.getElementById('myFriendsContainer'); // Line 4122
  const outgoingContainer = document.getElementById('outgoingRequestsContainer'); // Line 4123
  
  // ... skeleton HTML setup ...
  
  const pendingContainer = document.getElementById('pendingRequestsContainer'); // ❌ Line 4147
  const pendingSection = document.getElementById('pendingRequestsSection');
  
  // ... more code ...
  
  const friendsContainer = document.getElementById('myFriendsContainer'); // ❌ Line 4178
}
```

### After (Fixed)
```javascript
async function loadFriendsPage() {
  const pendingContainer = document.getElementById('pendingRequestsContainer'); // Line 4121
  const friendsContainer = document.getElementById('myFriendsContainer'); // Line 4122
  const outgoingContainer = document.getElementById('outgoingRequestsContainer'); // Line 4123
  const pendingSection = document.getElementById('pendingRequestsSection'); // Move to top
  
  // ... skeleton HTML setup ...
  
  // ✅ No redeclaration, use existing variable
  if (pendingContainer) { ... }
  
  // ... more code ...
  
  // ✅ No redeclaration, use existing variable
  if (friendsContainer) { ... }
}
```

---

## Files to Fix

| File | Lines | Change |
|------|-------|--------|
| `app/assets/js/app.js` | 4147 | Remove `const pendingContainer = ...` |
| `app/assets/js/app.js` | 4178 | Remove `const friendsContainer = ...` |
| `app/assets/js/app.js` | 4121-4125 | Add `pendingSection` declaration at top |

---

## Testing Steps

1. Open Friends page in browser
2. Open browser console (F12)
3. Check for syntax errors
4. Verify skeleton loaders appear briefly before data loads
5. Verify all three sections (Pending, Friends, Outgoing) load correctly

---

## Prevention

- **ESLint rule:** Enable `no-redeclare` rule
- **Code review:** Check for duplicate variable declarations in long functions
- **Testing:** Run page in browser after every commit affecting core functionality

---

## Fix Applied

**Commit:** 2ae98a1  
**Time to Fix:** 5 minutes  
**Changes Made:**

1. **Added section declarations at function start** (line 4122, 4125)
   - Added `const pendingSection = document.getElementById('pendingRequestsSection');`
   - Added `const outgoingSection = document.getElementById('outgoingRequestsSection');`

2. **Removed pendingContainer redeclaration** (removed lines ~4155-4156)
   - Changed from: `const pendingContainer = ... const pendingSection = ...`
   - Changed to: Direct `if (pendingContainer)` check

3. **Removed friendsContainer redeclaration** (removed line ~4191)
   - Changed from: `const friendsContainer = ...`
   - Changed to: Direct `if (friendsContainer)` check

4. **Removed outgoingContainer redeclaration** (removed lines ~4246-4247)
   - Changed from: `const outgoingContainer = ... const outgoingSection = ...`
   - Changed to: Direct `if (outgoingContainer)` check

**Verification:**
- ✅ No JavaScript syntax errors
- ✅ Skeleton loaders work correctly
- ✅ All three sections (Pending, Friends, Outgoing) load data
- ✅ Empty states appear when no data exists

**Status:** ✅ FIXED and deployed
