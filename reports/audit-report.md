# 🔒 Fireside Capital — Full Security Audit Report

**Date:** July 21, 2025  
**Auditor:** Auditor Agent (Automated Security Review)  
**Scope:** Complete codebase at `app/` + repository-level configuration  
**Repository:** [Fireside-Cloud-Solutions/fireside-capital-dashboard](https://github.com/Fireside-Cloud-Solutions/fireside-capital-dashboard) (**PUBLIC**)

---

## Executive Summary

The Fireside Capital codebase has a **solid foundation** — Supabase RLS is correctly configured on all 8 tables, authentication is properly implemented via Supabase Auth, and XSS protections exist via an `escapeHtml()` utility that is consistently used in table rendering. The Plaid server properly uses environment variables.

However, **several critical and high-severity issues** were discovered, primarily related to **sensitive personal financial data committed to a public repository**, **credentials stored in plaintext documentation files**, and **missing security headers**. These must be remediated immediately.

### Overall Security Grade: **C+** (Needs Immediate Remediation)

| Category | Score | Notes |
|----------|-------|-------|
| Credential Management | 🔴 **F** | Real credentials & personal data in public repo |
| Supabase RLS | ✅ **A** | All 8 tables have proper RLS policies |
| Authentication | ✅ **A-** | Solid Supabase Auth implementation |
| XSS Protection | 🟡 **B-** | escapeHtml() used but inline onclick patterns are risky |
| Input Validation | 🟡 **B** | HTML5 validation present but no server-side validation |
| Security Headers | 🟡 **C** | Partial — missing CSP, HSTS, Referrer-Policy |
| Data Privacy | 🔴 **F** | Real personal financial data in public seed file |

---

## 🔴 Critical Findings

### CRIT-01: Real Personal Financial Data Exposed in Public Repository

**Location:** `app/Supabase/seed_data.sql`  
**Risk:** **CRITICAL** — Identity theft, financial fraud, targeted social engineering  

The seed data file contains **real personal financial information** committed to a **public GitHub repository**:

- Real names: "Brittany", "Matt"
- Real home address: "2700 Bingham Drive"  
- Real employer names: "Huntington Ingalls", "FERC"
- Exact income amounts: $3,569 bi-weekly (W2), $5,700 monthly (1099)
- Real credit card balances: Capital One ($957.69), Robinhood ($8,842.04)
- Real mortgage details: $246,544.53 loan at 6.5% on a $270,000 property
- Real vehicle: BMW X5 with $44,320 loan at 9.6%
- Real investment balances: 401(k)s, emergency fund amounts
- Real bill amounts: Verizon, People's Gas, American Water, West Penn Power

**Anyone on the internet can view this file and know the founder's exact financial picture.**

**Recommended Fix:**
```bash
# 1. Replace seed_data.sql with anonymized sample data
# 2. Remove the file from git history entirely:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app/Supabase/seed_data.sql" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all

# 3. Recreate with fake/anonymized data
```

---

### CRIT-02: Plaintext Credentials in `memory/credentials.md`

**Location:** `memory/credentials.md` (local file, in `.gitignore`)  
**Risk:** **CRITICAL** — Full account takeover if file leaks  

This file contains in plaintext:
- **Google Cloud OAuth Client Secret:** `GOCSPX-XXXX...REDACTED` (full value in local file)
- **Supabase user email:** `[REDACTED]@firesidecloudsolutions.com`
- **Supabase user password:** `[REDACTED]` (plaintext password stored on disk!)
- **Google OAuth Client ID:** `878751XXXX...REDACTED.apps.googleusercontent.com`

**Mitigating factor:** The file IS in `.gitignore` and was **never committed to git history** (verified). However:
1. The file itself notes the Google creds were "shared in Discord plaintext" — meaning they may already be compromised
2. Storing passwords in plaintext files on disk is inherently dangerous
3. If `.gitignore` is accidentally modified, this file would be committed

**Recommended Fix:**
1. **Immediately rotate** the Google OAuth Client Secret
2. **Immediately change** the Supabase account password (`Fireside2025!`)
3. Move credentials to a proper secrets manager (Azure Key Vault, 1Password CLI, etc.)
4. Delete `memory/credentials.md` from disk after migrating to a secrets manager
5. Add `memory/` to both root `.gitignore` AND `app/.gitignore` for defense in depth

---

### CRIT-03: Supabase Anon Key + Full Schema Details in Public Documentation

**Location:** `AGENTS.md` (lines ~126), `TOOLS.md` (lines ~19) — both committed to public repo  
**Risk:** **HIGH** — Information disclosure accelerates attacks  

While Supabase anon keys are *designed* to be public (they are client-side keys), these documentation files expose **far more than necessary**:

- The complete Supabase project URL
- The full anon key JWT (including project ref `qqtiofdqplwycnwplmen`)
- Complete database schema (all table names and column names)
- REST API query examples with headers
- Plaid integration status and architecture details
- Azure Static Web App URL and deployment pipeline
- Discord channel IDs and server structure

This gives an attacker a complete blueprint of the system architecture. Combined with CRIT-01's personal data, this is a significant risk.

**Recommended Fix:**
1. Move `AGENTS.md` and `TOOLS.md` out of the public repo (use a private repo or local-only)
2. If they must stay in repo, redact sensitive values and reference environment variables instead
3. Consider using a `.env.example` pattern instead of embedding real values

---

### CRIT-04: Plaid API Credentials in `.env` File

**Location:** `app/.env`  
**Risk:** **MEDIUM** (mitigated by `.gitignore`, elevated because repo is public)  

The `.env` file contains:
```
PLAID_CLIENT_ID= 685378c94ac5c0002193dc08
PLAID_SECRET= 472f9c1d6b199a2543db686a1d9906
```

**Mitigating factors:**
- ✅ `.env` is in both root `.gitignore` and `app/.gitignore`
- ✅ Was **never committed to git history** (verified)
- ✅ `server.js` correctly reads these via `process.env`
- ✅ Currently in Plaid sandbox mode (not production)

**Risk escalation:** If anyone accidentally commits this file or if the repo's `.gitignore` is modified, Plaid credentials would be exposed. Since this is sandbox, damage is limited, but this pattern must be hardened before production.

**Recommended Fix:**
1. When moving to Plaid production, use Azure Key Vault or Azure Static Web App application settings
2. Add pre-commit hook to prevent `.env` commits:
```bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -q '\.env$'; then
    echo "ERROR: .env file detected in commit. Aborting."
    exit 1
fi
```

---

## 🟡 Warnings

### WARN-01: Insufficient Security Headers

**Location:** `app/staticwebapp.config.json`  
**Risk:** Clickjacking, MIME sniffing, cross-site attacks  

Current headers:
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
}
```

**Missing critical headers:**
- `Content-Security-Policy` (CSP) — No protection against XSS via injected scripts
- `Strict-Transport-Security` (HSTS) — No enforcement of HTTPS
- `Referrer-Policy` — Referrer information may leak to third parties
- `Permissions-Policy` — Browser features not restricted
- `X-XSS-Protection` — Legacy XSS protection not set (though CSP is preferred)

**Recommended Fix:**
```json
{
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.plaid.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https://qqtiofdqplwycnwplmen.supabase.co wss://qqtiofdqplwycnwplmen.supabase.co; img-src 'self' data:;",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  }
}
```

---

### WARN-02: Inline `onclick` Handlers with Template Literal ID Injection

**Location:** `app/assets/js/app.js` — lines 393-394, 458-459, 517-518, 571-572, 623-624  
**Risk:** Potential XSS if ID values are ever non-UUID  

The render functions inject IDs directly into `onclick` attributes:
```javascript
onclick="openAssetModal('${a.id}')"
onclick="confirmDeleteAsset('${a.id}')"
```

Currently, IDs are Supabase-generated UUIDs (safe), but:
1. If the ID format ever changes or includes special characters, this becomes an XSS vector
2. The pattern of generating HTML with inline handlers is fragile

**Recommended Fix:** Use `data-*` attributes and delegated event listeners instead:
```javascript
// In the template:
`<button class="btn btn-sm btn-outline-primary edit-btn" data-id="${escapeHtml(a.id)}">`

// Event delegation:
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) openAssetModal(editBtn.dataset.id);
});
```

---

### WARN-03: No Server-Side Input Validation

**Location:** `app/assets/js/app.js` — all `save*()` functions  
**Risk:** Data integrity issues, potential injection  

Financial data is only validated client-side via HTML5 `min="0"` attributes. The `getRaw()` function strips non-numeric characters but:
1. **No server-side validation** exists — Supabase accepts whatever the client sends
2. **No max value limits** — a user could submit astronomically large numbers
3. **No type checking** — the `type` and `name` fields accept arbitrary text
4. **Negative values not blocked** for all fields — `assets.html` property/vehicle fields lack `min="0"`
5. **Settings page** `emergencyFundGoal` has no min/max validation at all

**Recommended Fix:**
1. Add Supabase database constraints:
```sql
ALTER TABLE public.bills ADD CONSTRAINT bills_amount_positive CHECK (amount >= 0);
ALTER TABLE public.debts ADD CONSTRAINT debts_amount_positive CHECK (amount >= 0);
ALTER TABLE public.income ADD CONSTRAINT income_amount_positive CHECK (amount >= 0);
ALTER TABLE public.investments ADD CONSTRAINT investments_value_positive CHECK (value >= 0);
```
2. Add `min="0"` to all financial input fields in HTML
3. Add client-side validation in `save*()` functions before Supabase calls

---

### WARN-04: `supabase` vs `sb` Variable Name Inconsistency (Bug)

**Location:** `app/assets/js/app.js` — lines 723, 1060  
**Risk:** **Runtime errors** — `saveSettings()` and `saveBudgetAssignment()` will fail  

The Supabase client is initialized as `sb`:
```javascript
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);
```

But two functions reference `supabase` (undefined variable):
```javascript
// Line 723 - saveSettings()
const { error } = await supabase.from('settings').upsert(...)

// Line 1060 - saveBudgetAssignment()
const { error } = await supabase.from('budgets').upsert(...)
```

These functions will throw `ReferenceError: supabase is not defined` at runtime, meaning **settings and budget saving is completely broken**.

**Recommended Fix:**
```javascript
// Change all instances of `supabase.from(` to `sb.from(`
```

---

### WARN-05: No Rate Limiting on Express Server

**Location:** `app/assets/js/server.js`  
**Risk:** API abuse, denial of service  

The Plaid proxy server has:
- ✅ CORS restricted to specific origins
- ❌ No rate limiting
- ❌ No request body size limits (beyond Express defaults)
- ❌ No authentication on endpoints
- ❌ No input validation on `public_token`
- ❌ No helmet.js for security headers

**Recommended Fix:**
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // limit each IP to 10 requests per window
}));

// Validate input
app.post('/exchange_public_token', async (req, res) => {
    if (!req.body.public_token || typeof req.body.public_token !== 'string') {
        return res.status(400).json({ error: 'Invalid public_token' });
    }
    // ... existing logic
});
```

---

### WARN-06: Plaid Access Token Not Persisted (TODO Left in Code)

**Location:** `app/assets/js/server.js` — line 28  
**Risk:** Functional gap — bank connections are lost on restart  

```javascript
const accessToken = response.data.access_token;
// TODO: Store accessToken server-side in a database, linked to the authenticated user.
```

The Plaid access token is received but **never stored**, meaning:
1. Bank account connections are lost after each token exchange
2. No ongoing transaction sync is possible
3. Users would need to re-link their bank accounts repeatedly

**Recommended Fix:** Store the access token encrypted in Supabase (server-side only, never exposed to client).

---

### WARN-07: Auth Token Storage in localStorage

**Location:** Supabase JS SDK default behavior  
**Risk:** XSS can steal auth tokens  

Supabase JS stores auth tokens in `localStorage` by default. While this is the standard pattern for SPAs, it means:
1. Any XSS vulnerability can steal the user's JWT
2. Tokens persist across browser sessions (no auto-expire on tab close)

**Mitigating factor:** The `escapeHtml()` function is consistently used, reducing XSS surface.

**Recommended Fix (when possible):**
- Implement a CSP header (WARN-01) to dramatically reduce XSS risk
- Consider `sessionStorage` if "remember me" isn't needed
- Monitor Supabase SDK updates for httpOnly cookie support

---

### WARN-08: Data Container Visibility Toggle Instead of Route Protection

**Location:** `app/assets/js/app.js` — line 1250  
**Risk:** Low — data is empty without auth, but UI flickers  

```javascript
document.getElementById('dataContainer').style.visibility = currentUser ? 'visible' : 'hidden';
```

Unauthenticated users see a hidden container rather than a redirect to a login page. While Supabase RLS ensures no data is returned without auth, this is a UX issue and could confuse users or show stale cached data briefly.

**Recommended Fix:** Implement proper route-based protection:
```javascript
if (!currentUser) {
    document.getElementById('dataContainer').style.display = 'none';
    // Show a prominent login prompt
} else {
    document.getElementById('dataContainer').style.display = 'block';
}
```

---

## 🟢 Suggestions

### SUG-01: Add CSRF Protection to Plaid Server

**Location:** `app/assets/js/server.js`  
**Risk:** Low (CORS helps, but not sufficient alone)  

The Express server relies solely on CORS for request origin validation. Consider adding:
- CSRF tokens for state-changing requests
- Validate the `Origin` header explicitly

---

### SUG-02: Remove `console.error` Statements That Leak Internal Details

**Location:** `app/assets/js/app.js` — 14 instances  
**Risk:** Low — information disclosure to browser DevTools  

Error messages like `"Error during data fetch"` with full error objects could leak internal Supabase error details. While `DEBUG` is set to `false` for `console.log`, `console.error` calls are always active.

**Recommended Fix:** In production, wrap errors:
```javascript
console.error("An error occurred. Please try again.");
// Only log details in development:
if (DEBUG) console.error("Details:", error);
```

---

### SUG-03: Add Database-Level Constraints for Data Integrity

**Location:** `app/Supabase/migration.sql`  
**Risk:** Low — data quality  

The schema has no CHECK constraints on:
- `amount` fields (could be negative)
- `interestRate` fields (could be > 100% or negative)
- `term` fields (could be 0 or negative)
- `frequency` fields (could be arbitrary text)

**Recommended Fix:**
```sql
ALTER TABLE public.bills ADD CONSTRAINT bills_frequency_check 
    CHECK (frequency IN ('Daily','Weekly','Bi-Weekly','Monthly','Quarterly','Annually'));
ALTER TABLE public.debts ADD CONSTRAINT debts_interest_range 
    CHECK ("interestRate" >= 0 AND "interestRate" <= 100);
```

---

### SUG-04: Add `node_modules/` to Root `.gitignore`

**Location:** Root `.gitignore`  
**Risk:** Low — bloated repo, potential dependency confusion  

The root `.gitignore` doesn't explicitly exclude `app/node_modules/`. While `app/.gitignore` does, defense in depth suggests adding it at the root level too.

---

### SUG-05: Implement Password Strength Requirements

**Location:** `app/index.html` — signup form  
**Risk:** Low — weak passwords  

The signup form only requires `minlength="6"`. For a financial application, consider:
- Minimum 8 characters
- At least one uppercase, one lowercase, one number
- Password strength meter UI

---

### SUG-06: Add Accessibility Improvements

**Location:** All HTML files  
**Risk:** Low — WCAG compliance  

- Missing `aria-label` on icon-only buttons (edit/delete)
- No skip-to-content link
- Chart canvases lack `aria-label` or fallback text
- Color contrast on dark theme should be verified (especially muted text)

---

## ✅ What's Done Right

| Area | Assessment |
|------|-----------|
| **Supabase RLS** | ✅ All 8 tables have RLS enabled with `auth.uid() = user_id` policies (USING + WITH CHECK) |
| **Foreign Keys** | ✅ All tables reference `auth.users(id)` with `ON DELETE CASCADE` |
| **XSS Protection** | ✅ `escapeHtml()` function exists and is used consistently in all render functions |
| **Auth Flow** | ✅ Email/password with confirmation, password reset, session management |
| **Plaid Server** | ✅ Credentials in env vars, not client-side; CORS restricted |
| **`.env` Protection** | ✅ In `.gitignore`, never committed to history |
| **User Data Isolation** | ✅ All Supabase queries include `.eq('user_id', currentUser.id)` |
| **Debug Mode** | ✅ `DEBUG` flag set to `false` for `console.log` |
| **Error Handling** | ✅ User-friendly auth error messages via `getFriendlyAuthError()` |
| **Chart Safety** | ✅ `safeCreateChart()` wrapper prevents chart rendering crashes |

---

## Remediation Priority

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| **NOW** | CRIT-01: Remove personal financial data from public repo | 30 min | Prevents identity theft |
| **NOW** | CRIT-02: Rotate all credentials in credentials.md | 15 min | Prevents account takeover |
| **NOW** | CRIT-03: Remove/redact AGENTS.md and TOOLS.md from public repo | 15 min | Reduces attack surface |
| **URGENT** | WARN-04: Fix `supabase` → `sb` variable bug | 5 min | Fixes broken features |
| **THIS WEEK** | WARN-01: Add security headers to staticwebapp.config.json | 15 min | Prevents XSS/clickjacking |
| **THIS WEEK** | WARN-03: Add database constraints | 30 min | Data integrity |
| **THIS WEEK** | WARN-05: Add rate limiting to Express server | 20 min | Prevents abuse |
| **NEXT SPRINT** | WARN-02: Refactor inline onclick handlers | 2 hrs | Reduces XSS surface |
| **NEXT SPRINT** | WARN-06: Implement Plaid token storage | 3 hrs | Functional requirement |
| **BACKLOG** | All SUG-* items | Various | Quality improvements |

---

## Conclusion

The application's **core security model is sound** — RLS, auth, and data isolation are all properly implemented. The critical issues are all related to **operational security**: real data in a public repo, credentials in documentation files, and missing defense-in-depth headers. These are all quickly fixable but must be addressed **immediately** given the public nature of the repository and the sensitivity of the financial data exposed.

**Immediate actions required:**
1. 🚨 Scrub `seed_data.sql` of all real personal data (replace with fake data)
2. 🚨 Rotate Google OAuth secret and Supabase password
3. 🚨 Move `AGENTS.md`/`TOOLS.md` out of the public repo or redact credentials
4. 🐛 Fix the `supabase` → `sb` variable name bug (breaks settings + budget saving)
5. 🔒 Add Content-Security-Policy and other security headers

---

*Report generated by Auditor Agent — Fireside Capital Security Review*
