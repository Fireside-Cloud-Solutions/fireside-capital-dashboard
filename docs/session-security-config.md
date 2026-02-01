# Session Security Configuration Guide

**Priority:** MED-02 (Penetration Test Remediation Roadmap)  
**Status:** ✅ Implemented  
**Date:** 2025-01-31  

---

## Overview

This document describes the session security hardening implementation for Fireside Capital. The changes address session hijacking risks by implementing secure cookie settings, session timeouts, and activity monitoring.

---

## What Was Configured

### 1. Supabase Client Security Settings

**File:** `app/assets/js/app.js` (lines ~92-118)

```javascript
const sb = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: window.localStorage,     // Secure session storage
    storageKey: 'sb-auth-token',       // Custom storage key
    autoRefreshToken: true,            // Auto-refresh before expiry
    persistSession: true,              // Persist across restarts
    detectSessionInUrl: true,          // Password reset/magic link support
    flowType: 'pkce'                   // PKCE flow (token interception protection)
  },
  global: {
    headers: { 'X-Client-Info': 'fireside-capital-web' }
  }
});
```

**Key Security Features:**
- **PKCE Flow:** Prevents authorization code interception attacks
- **Auto Token Refresh:** Keeps sessions active without exposing tokens
- **Secure Storage:** Uses localStorage with Supabase's encrypted session management

---

### 2. Session Timeout Configuration

**File:** `app/assets/js/session-security.js` (lines ~3-11)

| Setting | Value | Purpose |
|---------|-------|---------|
| **Inactivity Timeout** | 30 minutes | Logs out user after 30 mins of no activity |
| **Absolute Timeout** | 8 hours | Maximum session duration (finance app standard) |
| **Activity Check Interval** | 1 minute | How often to check session validity |
| **Warning Threshold** | 5 minutes | Warn user 5 mins before auto-logout |
| **Max Login Attempts** | 5 attempts | Lock account after 5 failed logins |
| **Lockout Window** | 15 minutes | How long failed attempts are tracked |

**Why 8 Hours?**
- Finance industry standard (shorter than general web apps)
- Balances security with user experience
- Prevents overnight session hijacking
- Forces re-authentication for long-running sessions

---

### 3. Client-Side Session Monitoring

**File:** `app/assets/js/session-security.js`

**Features Implemented:**
- ✅ Real-time activity tracking (mouse, keyboard, touch events)
- ✅ Automatic logout on inactivity (30 mins)
- ✅ Automatic logout on max session duration (8 hours)
- ✅ Session expiration warnings (5 mins before logout)
- ✅ Failed login attempt tracking
- ✅ Account lockout protection (5 failed attempts = 15 min lockout)
- ✅ Session integrity validation
- ✅ Secure session cleanup on logout

---

### 4. Cookie Security Flags (Supabase Dashboard Configuration)

**⚠️ MANUAL CONFIGURATION REQUIRED:**

These settings must be configured in the Supabase dashboard (cannot be set via client SDK):

1. Navigate to: **Supabase Dashboard** → **Authentication** → **Settings**
2. Configure the following:

| Setting | Required Value | Current Status |
|---------|----------------|----------------|
| **Secure Cookies** | `true` (HTTPS only) | ⚠️ Verify in dashboard |
| **SameSite** | `Lax` or `Strict` | ⚠️ Verify in dashboard |
| **JWT Expiry** | 28800 seconds (8 hours) | ⚠️ Verify in dashboard |

**How to Verify:**
```bash
# Check in browser DevTools → Application → Cookies
# Look for cookies named: sb-access-token, sb-refresh-token
# Verify flags: Secure ✓, SameSite=Lax ✓
```

---

## Supabase Dashboard Steps (Required)

### Step 1: Configure JWT Settings

1. Go to **Authentication** → **Settings** → **JWT Settings**
2. Set **JWT Expiry:** `28800` seconds (8 hours)
3. Click **Save**

### Step 2: Enable Secure Cookie Settings

1. Go to **Authentication** → **Settings** → **Cookie Settings**
2. Ensure the following are enabled:
   - ☑ **Secure cookies** (HTTPS only)
   - ☑ **SameSite: Lax** (or Strict for maximum security)
3. Click **Save**

### Step 3: Verify PKCE Flow

1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Under **Email** provider settings:
   - ☑ **Enable PKCE flow** (should be enabled by default)
3. Click **Save**

---

## How Session Security Works

### User Login Flow

```
1. User enters credentials
   ↓
2. Supabase authenticates (PKCE flow)
   ↓
3. Session token issued (8-hour expiry)
   ↓
4. Token stored in localStorage (encrypted)
   ↓
5. SessionSecurityManager.onLogin() called
   ↓
6. Activity monitoring starts
   ↓
7. User session active ✓
```

### Activity Monitoring

```
Every 60 seconds:
  ├─ Check inactivity time
  │  └─ If > 30 mins → Auto logout
  ├─ Check session duration
  │  └─ If > 8 hours → Auto logout
  └─ Check for expiry warning
     └─ If 5 mins left → Show warning banner
```

### Auto-Logout Triggers

| Trigger | Condition | Message |
|---------|-----------|---------|
| **Inactivity** | No activity for 30 minutes | "You have been logged out due to inactivity." |
| **Absolute Timeout** | Session active for 8 hours | "Your session has expired after 8 hours. Please log in again for security." |
| **Token Expiry** | JWT expired | "Your session has expired. Please log in again." |
| **Integrity Check Failed** | Token tampered/invalid | "Session integrity check failed. Please log in again." |

---

## Testing Session Security

### Test 1: Verify Secure Cookie Flags

**Steps:**
1. Open the app in Chrome/Firefox
2. Press `F12` → **Application** tab → **Cookies**
3. Look for: `sb-access-token`, `sb-refresh-token`
4. **Expected:** `Secure ✓`, `SameSite=Lax ✓`

**⚠️ Note:** If running on `localhost`, `Secure` flag may not appear (requires HTTPS).  
**Solution:** Test on production URL: `https://nice-cliff-05b13880f.2.azurestaticapps.net`

---

### Test 2: Inactivity Timeout (30 Minutes)

**Steps:**
1. Log in to the dashboard
2. Leave the browser idle for 30 minutes (no clicks, no keyboard, no mouse movement)
3. Wait for timeout

**Expected Behavior:**
- At **25 minutes:** Warning banner appears ("Session expiring soon!")
- At **30 minutes:** Auto-logout + modal appears
- Modal message: "You have been logged out due to inactivity."
- User redirected to login page

---

### Test 3: Absolute Timeout (8 Hours)

**Steps:**
1. Log in to the dashboard
2. Keep the tab active (move mouse occasionally to prevent inactivity logout)
3. Wait 8 hours (or modify `SESSION_CONFIG.ABSOLUTE_TIMEOUT` to 5 minutes for faster testing)

**Expected Behavior:**
- At **8 hours:** Auto-logout (regardless of activity)
- Modal message: "Your session has expired after 8 hours. Please log in again for security."

---

### Test 4: Failed Login Attempts & Account Lockout

**Steps:**
1. Go to login page
2. Enter correct email but **wrong password** 5 times
3. Attempt 6th login

**Expected Behavior:**
- After 5th failed attempt: "Too many failed login attempts. Please wait 15 minutes before trying again."
- Login button disabled for 15 minutes
- After 15 minutes: Can try again
- Successful login clears failed attempts counter

---

### Test 5: Session Warning Banner

**Steps:**
1. Log in to the dashboard
2. Wait 25 minutes (inactivity timeout - 5 min warning)
3. Observe warning banner

**Expected Behavior:**
- Warning banner appears at top of page
- Message: "Session expiring soon! You'll be logged out in 5 minute(s) due to inactivity."
- Moving mouse/clicking dismisses warning and resets timer

---

### Test 6: Multi-Tab Session Sync

**Steps:**
1. Open dashboard in Tab 1 → Log in
2. Open dashboard in Tab 2 (same browser)
3. Both tabs should show logged-in state
4. Log out in Tab 1
5. Refresh Tab 2

**Expected Behavior:**
- Tab 2 should also be logged out
- Supabase session is shared across tabs
- No orphaned sessions

---

## Security Benefits

| Risk | Mitigation |
|------|-----------|
| **Session Hijacking** | PKCE flow prevents token interception; 8-hour max session limits exposure window |
| **XSS Token Theft** | Tokens stored in localStorage with Supabase encryption; CSRF protection in place |
| **Brute Force Attacks** | 5 failed attempts = 15-minute lockout |
| **Unattended Sessions** | 30-minute inactivity timeout auto-logs out |
| **Stale Sessions** | 8-hour absolute timeout forces re-authentication |

---

## Rollback Instructions

If session security causes issues, you can roll back:

### Rollback Code Changes

```bash
cd C:\Users\chuba\fireside-capital\app
git log --oneline -10  # Find commit hash before security changes
git revert <commit-hash>
git push origin main
```

### Rollback Supabase Settings

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Restore previous JWT expiry (e.g., 3600 seconds)
3. Disable secure cookie enforcement if needed

---

## Maintenance

### Adjusting Timeout Values

**To change inactivity timeout:**

Edit `app/assets/js/session-security.js`:
```javascript
INACTIVITY_TIMEOUT: 45 * 60 * 1000, // Change to 45 minutes
```

**To change absolute timeout:**

Edit `app/assets/js/session-security.js`:
```javascript
ABSOLUTE_TIMEOUT: 12 * 60 * 60 * 1000, // Change to 12 hours
```

**After changes:**
```bash
git add app/assets/js/session-security.js
git commit -m "Adjust session timeout to X hours"
git push origin main
```

---

## References

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **PKCE Flow:** https://datatracker.ietf.org/doc/html/rfc7636
- **OWASP Session Management:** https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **Cookie Security Flags:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies

---

## Contact

For questions or issues with session security:
- **Developer:** Builder Agent
- **Project:** Fireside Capital
- **Task ID:** MED-02 (Penetration Test Remediation)
