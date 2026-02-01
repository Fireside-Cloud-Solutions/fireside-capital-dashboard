# Session Security — Quick Reference

## 🔒 Security Features Active

### Auto-Logout Timeouts

| Timeout Type | Duration | Behavior |
|--------------|----------|----------|
| **Inactivity** | 30 minutes | Logout after no user activity |
| **Absolute** | 24 hours | Logout after session duration |
| **Warning** | 5 minutes before | Alert shown before timeout |

### Login Protection

| Feature | Limit | Duration |
|---------|-------|----------|
| **Max Failed Attempts** | 5 | Per 15 minutes |
| **Account Lockout** | Yes | 15 minutes |
| **Countdown Timer** | Yes | Shows remaining time |

### Activity Tracking

**Tracked Events**: Click, Keypress, Scroll, Touch, Mouse Movement

Any interaction resets the inactivity timer.

---

## 👤 User Experience

### Normal Use
- ✅ Session stays active as long as you interact
- ✅ No interruptions during active work
- ✅ Seamless background protection

### Idle Sessions
1. **25 minutes**: Warning banner appears
2. **30 minutes**: Automatic logout
3. **Any activity**: Warning dismissed, timer reset

### Failed Logins
1. **5 failed attempts**: Account temporarily locked
2. **15-minute wait**: Countdown timer shown
3. **After 15 minutes**: Can try again

### Long Sessions
- After **24 hours** of continuous session:
  - Automatic logout (even if active)
  - Must re-authenticate
  - Security best practice

---

## 🛠️ Developer Reference

### Check Session Status
```javascript
// Is account locked?
sessionSecurity.isAccountLocked()
// Returns: true/false

// Get remaining lockout time
sessionSecurity.getLockoutMinutes()
// Returns: number of minutes

// Extend session manually
sessionSecurity.extendSession()

// Validate session
await sessionSecurity.validateSessionIntegrity()
// Returns: true/false
```

### Configuration Location
**File**: `app/assets/js/session-security.js`  
**Object**: `SESSION_CONFIG`

```javascript
{
  INACTIVITY_TIMEOUT: 30 * 60 * 1000,    // 30 min
  ABSOLUTE_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,                  // 5 attempts
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000   // 15 min
}
```

---

## 🧪 Testing Checklist

### Test Inactivity Timeout
1. ☐ Log in to app
2. ☐ Don't interact for 25 minutes
3. ☐ Verify warning appears
4. ☐ Don't interact for 5 more minutes
5. ☐ Verify automatic logout

### Test Activity Extension
1. ☐ Log in to app
2. ☐ Wait 28 minutes
3. ☐ Click anywhere
4. ☐ Verify timer resets
5. ☐ Verify no logout

### Test Login Lockout
1. ☐ Enter wrong password 5 times
2. ☐ Verify lockout message
3. ☐ Verify countdown timer
4. ☐ Wait 15 minutes
5. ☐ Verify can login again

### Test Absolute Timeout
1. ☐ Log in and stay active
2. ☐ Keep session alive for 24 hours
3. ☐ Verify automatic logout
4. ☐ Verify must re-authenticate

### Test Secure Logout
1. ☐ Log in and load data
2. ☐ Click logout
3. ☐ Verify redirect to home
4. ☐ Open DevTools > Application > Storage
5. ☐ Verify all data cleared

---

## 📋 Security Checklist

### Before Deployment
- ☑ Session security module loaded
- ☑ All HTML pages include script
- ☑ Login attempt tracking active
- ☑ Timeout warnings working
- ☑ Logout clears all data
- ☑ Error logs sanitized

### Production Recommendations
- ☐ Enable HTTPS
- ☐ Add Content Security Policy headers
- ☐ Consider httpOnly cookies
- ☐ Implement server-side validation
- ☐ Add rate limiting on backend
- ☐ Monitor security events

---

## 🚨 Troubleshooting

### Warning Not Showing
- Check browser console for `[Security]` messages
- Verify `session-security.js` is loaded
- Check if user is logged in
- Verify SessionSecurityManager initialized

### Immediate Logout
- Check console for timeout messages
- Verify activity events are firing
- Check if token is expired
- Validate Supabase session

### Login Lockout Not Working
- Check sessionStorage for `login_attempts`
- Verify SessionSecurityManager exists
- Check browser console for errors
- Clear sessionStorage and try again

### Session Not Extending
- Verify activity listeners registered
- Check if events are passive
- Look for JavaScript errors
- Verify `recordActivity()` being called

---

## 📞 Support

### Console Logging
Enable security event logging:
```javascript
// All events logged with [Security] prefix
[Security] Session monitoring started
[Security] Inactivity timeout reached (30 minutes)
[Security] Force logout triggered: You have been logged out due to inactivity.
[Security] All session data cleared
```

### Manual Reset
Clear all security state:
```javascript
// Clear login attempts
sessionSecurity.clearLoginAttempts();

// Stop monitoring
sessionSecurity.stopSessionMonitoring();

// Restart
sessionSecurity.startSessionMonitoring();
```

---

## 📖 Documentation

- **Full Docs**: `app/SECURITY.md`
- **Implementation**: `SESSION_SECURITY_COMPLETION_REPORT.md`
- **Source Code**: `app/assets/js/session-security.js`

---

**Last Updated**: 2025-01-29  
**Version**: 1.0  
**Status**: ✅ Active
