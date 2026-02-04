# FC-052: Security TODOs and Code Quality Issues

**Issue ID:** FC-052  
**Severity:** 🟡 MEDIUM  
**Category:** Security / Code Quality  
**Found:** 2026-02-04 11:25 AM (Sprint QA Session)

---

## Summary

Found 2 TODO comments in JavaScript files indicating incomplete security implementations and potential technical debt.

---

## Issue 1: Plaid Access Token Not Stored Server-Side (SECURITY)

**File:** `app/assets/js/server.js` (line 63)  
**Severity:** 🔴 HIGH  
**Impact:** Security vulnerability — access tokens should never be exposed to frontend

### Current Code
```javascript
const accessToken = response.data.access_token;
// TODO: Store accessToken server-side in a database, linked to the authenticated user.
// The access token should NEVER be sent to the frontend.
res.json({ success: true });
```

### Problem
- Plaid access token is obtained but not stored server-side
- Current implementation discards the token after exchange
- This means the app cannot make subsequent Plaid API calls without re-authentication
- **Security risk:** If token is sent to frontend for storage, it violates security best practices

### Recommended Fix
1. Create a `plaid_tokens` table in Supabase:
   ```sql
   CREATE TABLE plaid_tokens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     access_token TEXT NOT NULL ENCRYPTED,
     item_id TEXT NOT NULL,
     institution_name TEXT,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(user_id, item_id)
   );
   ```

2. Store token server-side after exchange:
   ```javascript
   const accessToken = response.data.access_token;
   const itemId = response.data.item_id;
   
   // Store in database
   await supabase.from('plaid_tokens').insert({
     user_id: req.user.id,
     access_token: accessToken,
     item_id: itemId
   });
   
   res.json({ success: true, item_id: itemId });
   ```

3. Create server-side endpoint for Plaid operations:
   ```javascript
   app.post('/plaid/transactions', authenticateUser, async (req, res) => {
     const { data } = await supabase
       .from('plaid_tokens')
       .select('access_token')
       .eq('user_id', req.user.id)
       .single();
     
     const transactions = await plaidClient.transactionsGet({
       access_token: data.access_token,
       start_date: req.body.start_date,
       end_date: req.body.end_date
     });
     
     res.json(transactions.data);
   });
   ```

**Priority:** HIGH — This blocks production Plaid integration

---

## Issue 2: Transactions.js Missing Plaid Token Backend

**File:** `app/assets/js/transactions.js` (line 69)  
**Severity:** 🟡 MEDIUM  
**Impact:** Feature incomplete — transactions sync won't work

### Current Code
```javascript
// TODO: Get stored Plaid access token from backend
```

### Problem
- Frontend transactions.js expects to fetch Plaid access token from backend
- Backend endpoint doesn't exist yet (see Issue 1)
- Sync button will fail when clicked

### Recommended Fix
Depends on Issue 1 resolution. Once server-side token storage is implemented:

```javascript
async function syncTransactionsFromPlaid() {
  const syncBtn = document.getElementById('syncTransactionsBtn');
  syncBtn.disabled = true;
  syncBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Syncing...';
  
  try {
    // Call backend endpoint (which retrieves token server-side)
    const response = await fetch('/plaid/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await supabase.auth.getSession().data.session.access_token}`
      },
      body: JSON.stringify({
        start_date: '2026-01-01',
        end_date: '2026-02-04'
      })
    });
    
    const { transactions } = await response.json();
    
    // Process and store transactions in Supabase
    await supabase.from('transactions').insert(transactions.map(t => ({
      user_id: (await supabase.auth.getUser()).data.user.id,
      ...t
    })));
    
    await loadTransactions();
    showToast('Transactions synced successfully', 'success');
  } catch (err) {
    console.error('Sync failed:', err);
    showToast('Failed to sync transactions', 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Sync Transactions';
  }
}
```

**Priority:** MEDIUM — Depends on Issue 1

---

## Code Quality: Console Statements

**Count:** 123 console statements across all JS files

### Current State
- Most console statements are wrapped in DEBUG flags (`DEBUG`, `DEBUG_CATEGORIZER`, etc.)
- Good practice: Conditional logging is present
- Production-ready: Logs can be toggled off by setting `DEBUG = false`

### Files with DEBUG Flags
- `app.js` — `const DEBUG = false;` (line 3)
- `categorizer.js` — `const DEBUG_CATEGORIZER = false;` (line 6)
- `csrf.js` — `const DEBUG_CSRF = false;` (line 6)
- `email-bills.js` — `const DEBUG_EMAIL_BILLS = false;` (line 9)

### Recommendation
✅ **NO ACTION REQUIRED** — Console statements are properly gated behind DEBUG flags. For production builds, consider adding a build step that strips all console statements:

```json
// package.json (future improvement)
{
  "scripts": {
    "build": "terser app.js --compress drop_console=true --output app.min.js"
  }
}
```

**Priority:** LOW — Nice-to-have for production optimization

---

## Code Quality: innerHTML Usage

**Count:** 85 innerHTML assignments across all JS files

### Security Assessment
✅ **SAFE** — Input sanitization is present:
- `escapeHtml()` function exists (app.js line 124-129)
- `escapeAttribute()` function exists (app.js line 138)
- Consistent usage throughout codebase

### Sample Safe Usage
```javascript
tbody.innerHTML = assets.map(a => `
  <td>${escapeHtml(a.name)}</td>
  <td>${escapeHtml(a.type)}</td>
  <td>${formatCurrency(a.value)}</td>
`).join('');
```

### Recommendation
✅ **NO ACTION REQUIRED** — All user input is properly escaped before insertion. For future improvements, consider migrating to a framework like React/Vue that handles XSS prevention automatically.

**Priority:** LOW — Code is already secure

---

## Summary Table

| Issue | Severity | Impact | Priority | Status |
|-------|----------|--------|----------|--------|
| Plaid token storage | 🔴 HIGH | Blocks production Plaid | HIGH | ❌ OPEN |
| Transactions backend | 🟡 MEDIUM | Feature incomplete | MEDIUM | ❌ OPEN |
| Console statements | 🟢 LOW | Production optimization | LOW | ✅ OK |
| innerHTML usage | 🟢 LOW | XSS prevention | LOW | ✅ OK |

---

## Next Steps

1. **HIGH PRIORITY:** Implement server-side Plaid token storage (FC-052 Issue 1)
2. **MEDIUM PRIORITY:** Update transactions.js to use backend endpoint (FC-052 Issue 2)
3. **LOW PRIORITY:** Add build step to strip console logs for production

---

**Assigned:** Connector (Plaid integration specialist)  
**Est. Time:** 
- Issue 1: 2 hours (database schema + server endpoint)
- Issue 2: 1 hour (frontend integration)
- Total: 3 hours

---

**Status:** ⏳ OPEN  
**Logged:** 2026-02-04 11:30 AM EST (Sprint QA Session)
