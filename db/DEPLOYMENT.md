# Rate Limiting Database Deployment Guide

## Overview
This implements secure, database-backed rate limiting to prevent abuse while maintaining good user experience.

## Architecture
- **Client-side rate limiting** (`rate-limiter.js`) - Fast UX feedback, prevents accidental rapid clicks
- **Database rate limiting** (`rate-limit-db.js` + PostgreSQL function) - Secure enforcement, can't be bypassed

## Deployment Steps

### 1. Run SQL Schema (Required)
Run `db/rate-limiting-schema.sql` in Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/sql/new
2. Copy contents of `db/rate-limiting-schema.sql`
3. Paste and click "Run"
4. Verify tables created:
   ```sql
   SELECT * FROM rate_limits LIMIT 1;
   ```

### 2. Deploy Frontend Code
```powershell
cd C:\Users\chuba\fireside-capital\app
git add -A
git commit -m "feat: implement database-backed rate limiting (MED-04)"
git push origin main
```

### 3. Verify Deployment
Wait 2-3 minutes for Azure Static Web Apps to deploy, then:
1. Open https://nice-cliff-05b13880f.2.azurestaticapps.net/bills.html
2. Open browser console (F12)
3. Try adding 21 bills rapidly (should be blocked after 20)
4. Check database: `SELECT * FROM rate_limits;`

## Rate Limits Configured

| Operation | Limit | Window | Location |
|-----------|-------|--------|----------|
| Bill creation | 20 | 1 minute | bills.html |
| Asset creation | 20 | 1 minute | assets.html |
| Debt creation | 20 | 1 minute | debts.html |
| Income creation | 20 | 1 minute | income.html |
| Investment creation | 20 | 1 minute | investments.html |
| Updates (any) | 50 | 1 minute | All pages |
| Plaid connections | 10 | 1 hour | *(future)* |
| Email scans | 2 | 1 minute | *(future)* |
| Friend requests | 10 | 1 hour | *(future)* |

## How It Works

### Client-Side (UX Layer)
```javascript
// Fast feedback - blocks duplicate clicks
const clientLimiter = rateLimiters.save; // 5 saves per 10 seconds
```

### Database (Security Layer)
```javascript
// Secure enforcement - checks database
const allowed = await checkDatabaseRateLimit('add_bill');
// Calls PostgreSQL function: check_rate_limit(user_id, operation, max, window)
```

### Hybrid Integration
```javascript
await withHybridRateLimit('save', 'add_bill', async () => {
  // Your database operation here
});
// Checks client-side first (fast), then database (secure)
```

## Testing

### Manual Testing
1. **Bill Creation Rate Limit**
   - Open bills.html
   - Click "Add Bill" rapidly 21 times
   - 21st click should show: "Rate limit exceeded"
   - Wait 1 minute → should allow again

2. **Asset Creation Rate Limit**
   - Open assets.html
   - Add 20 assets quickly
   - 21st should fail
   - Check database: `SELECT * FROM rate_limits WHERE operation='add_asset';`

3. **Database Verification**
   ```sql
   -- View rate limit records
   SELECT 
     operation,
     request_count,
     window_start,
     NOW() - window_start as elapsed
   FROM rate_limits
   ORDER BY created_at DESC;
   ```

### Automated Testing (Future)
- Add Cypress tests for rate limit enforcement
- Test window expiration and reset
- Test fail-open behavior (allows on DB error)

## Maintenance

### Cleanup Old Records
Rate limit records auto-clean after 24 hours via the `cleanup_rate_limits()` function.

To manually clean:
```sql
SELECT cleanup_rate_limits();
```

### Monitor Rate Limit Hits
```sql
-- Users hitting rate limits most
SELECT 
  user_id,
  operation,
  COUNT(*) as limit_hits
FROM rate_limits
WHERE request_count >= (
  SELECT p_max_requests 
  FROM unnest(ARRAY[20, 50, 10, 2]) as p_max_requests
)
GROUP BY user_id, operation
ORDER BY limit_hits DESC;
```

### Adjust Rate Limits
Edit `app/assets/js/rate-limit-db.js`:
```javascript
const RATE_LIMIT_CONFIG = {
  add_bill: { max: 30, windowMinutes: 1 }, // Increased from 20 to 30
  // ...
};
```

## Rollback Plan
If issues occur:
1. Comment out `withHybridRateLimit` calls in app.js
2. Revert to old client-side only:
   ```javascript
   // Old code (client-side only):
   if (!rateLimiters.save.allow('saveBill')) {
     alert('Too many requests');
     return;
   }
   ```
3. Database function stays in place (doesn't interfere)

## Security Considerations
- ✅ **Fail-open**: If database check fails, allows operation (prevents blocking users)
- ✅ **User-scoped**: All limits are per-user (prevents one user blocking others)
- ✅ **CSRF protection**: Still enforced before rate limiting
- ✅ **RLS policies**: Users can only read their own rate limit records
- ⚠️ **Bypass**: Advanced users can bypass client-side limits, but database layer catches them

## Files Modified
- `db/rate-limiting-schema.sql` - Database schema and functions
- `app/assets/js/rate-limit-db.js` - Database rate limiting wrapper
- `app/assets/js/app.js` - Updated save functions to use hybrid rate limiting
- `app/index.html` - Added script tag
- `app/bills.html` - Added script tag
- `app/assets.html` - Added script tag
- `app/debts.html` - Added script tag
- `app/income.html` - Added script tag
- `app/investments.html` - Added script tag

## Next Steps (Future Enhancements)
- [ ] Add rate limiting to Plaid connection flow
- [ ] Add rate limiting to email scanning
- [ ] Add rate limiting to friend requests
- [ ] Add Datadog/monitoring for rate limit violations
- [ ] Add admin dashboard to view rate limit stats
