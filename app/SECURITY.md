# Session Security Implementation

## Overview
This document describes the session security hardening implemented for Fireside Capital.

## Features Implemented

### 1. Session Timeouts
- **Inactivity Timeout**: 30 minutes
  - User is automatically logged out after 30 minutes of inactivity
  - Warning shown 5 minutes before timeout
  - Any user activity (click, keypress, scroll) resets the timer
  
- **Absolute Timeout**: 24 hours
  - Maximum session duration is 24 hours
  - User must re-authenticate after this period
  - Cannot be extended by activity

### 2. Login Attempt Tracking
- **Rate Limiting**: Maximum 5 failed login attempts within 15 minutes
- **Account Lockout**: Temporary lockout after exceeding failed attempts
- **Lockout Duration**: 15 minutes from first failed attempt
- **Storage**: Attempts tracked in sessionStorage (cleared on browser close)

### 3. Secure Logout
- **Data Clearing**: All session data, caches, and global variables cleared
- **Token Revocation**: Supabase tokens revoked server-side via `signOut()`
- **Chart Cleanup**: All Chart.js instances destroyed
- **Redirect**: User redirected to home page after logout

### 4. Activity Monitoring
- **Events Tracked**: 
  - mousedown, mousemove
  - keypress
  - scroll
  - touchstart
  - click
  
- **Passive Listeners**: All activity listeners use passive mode for performance
- **Check Interval**: Session validity checked every 60 seconds

### 5. Security Warnings
- **Session Expiry Warning**: Displayed 5 minutes before inactivity timeout
- **Dismissible Banner**: User can dismiss warning by clicking close button
- **Activity Extension**: Any user activity automatically dismisses warning

### 6. Token Security
- **Storage**: Supabase uses localStorage by default (browser-managed)
- **Exposure Prevention**: Error logging sanitized to not expose tokens
- **Integrity Checks**: Session validation performed periodically
- **Expiration Checks**: Token expiration validated

## Configuration

All security parameters can be adjusted in `session-security.js`:

```javascript
const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000,        // 30 minutes
  ABSOLUTE_TIMEOUT: 24 * 60 * 60 * 1000,     // 24 hours
  ACTIVITY_CHECK_INTERVAL: 60 * 1000,        // 1 minute
  MAX_LOGIN_ATTEMPTS: 5,                      // 5 attempts
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000,      // 15 minutes
  WARNING_THRESHOLD: 5 * 60 * 1000           // 5 minutes
};
```

## Usage

### Initialization
The SessionSecurityManager is automatically initialized in `app.js`:

```javascript
sessionSecurity = new SessionSecurityManager(sb, (reason) => {
  console.log('[Security] Force logout triggered:', reason);
});
```

### Manual Session Extension
Users can manually extend their session by any activity, or programmatically:

```javascript
sessionSecurity.extendSession();
```

### Check Session Validity
```javascript
const isValid = await sessionSecurity.validateSessionIntegrity();
```

## Security Best Practices

### Implemented
✅ Inactivity timeout (30 minutes)  
✅ Absolute timeout (24 hours)  
✅ Login attempt rate limiting  
✅ Secure logout with data clearing  
✅ Token revocation on logout  
✅ Activity monitoring  
✅ Session expiry warnings  
✅ Error logging sanitization  

### Recommendations
⚠️ **Move to httpOnly Cookies**: For production, consider using Supabase server-side auth with httpOnly cookies instead of localStorage
⚠️ **Content Security Policy**: Add CSP headers to prevent XSS attacks  
⚠️ **HTTPS Only**: Ensure all traffic uses HTTPS in production  
⚠️ **Refresh Token Rotation**: Consider implementing refresh token rotation for enhanced security  

## Known Limitations

1. **localStorage Storage**: Tokens are stored in localStorage (Supabase default). This is vulnerable to XSS attacks. For production, consider:
   - Server-side session management
   - httpOnly cookies
   - Supabase Auth with server-side rendering

2. **Browser-Based Security**: All security measures are client-side and can be bypassed by a determined attacker with browser access. Always validate on the server.

3. **Session Storage for Login Attempts**: Login attempt tracking uses sessionStorage and is reset when the browser is closed. For persistent tracking, use a backend solution.

## Testing

### Test Inactivity Timeout
1. Log in to the application
2. Wait without any interaction
3. After 25 minutes, a warning should appear
4. After 30 minutes total, automatic logout should occur

### Test Absolute Timeout
1. Log in and stay active
2. Keep the session alive for 24 hours
3. After 24 hours, automatic logout should occur

### Test Login Attempts
1. Try logging in with wrong password 5 times
2. 6th attempt should show lockout message
3. Wait 15 minutes, then retry - should be allowed

### Test Secure Logout
1. Log in and load some data
2. Click logout
3. Verify all data is cleared from browser DevTools
4. Verify Supabase session is revoked

## Monitoring

Check browser console for security events:
- `[Security] Session monitoring started`
- `[Security] Inactivity timeout reached`
- `[Security] Absolute session timeout reached`
- `[Security] Force logout triggered`
- `[Security] All session data cleared`

## Support

For security issues or questions, contact the development team.

## Version History

- **v1.0** (2025-01-29): Initial implementation
  - Inactivity timeout
  - Absolute timeout
  - Login attempt tracking
  - Secure logout
  - Activity monitoring
