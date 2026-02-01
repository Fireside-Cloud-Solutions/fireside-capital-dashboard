# Security Remediation Roadmap
## Fireside Capital Dashboard

**Generated:** February 1, 2026  
**Target Completion:** February 28, 2026 (4 weeks)

---

## Executive Summary

This roadmap addresses **11 security findings** identified in the penetration test, prioritized by severity and implementation complexity. The focus is on **immediate remediation of 2 HIGH-severity vulnerabilities** within the first week, followed by medium and low-priority enhancements.

**Total Estimated Effort:** ~80 hours (2 weeks of development time)

---

## Phase 1: CRITICAL — Immediate Fixes (Week 1)

### 🔴 Priority 1: Fix XSS Vulnerabilities (HIGH-01)

**Severity:** HIGH  
**Effort:** 16 hours  
**Assignee:** Builder Agent  
**Timeline:** Days 1-3

#### Tasks:

1. **Audit all innerHTML usage** (4 hours)
   ```bash
   # Find all innerHTML assignments
   grep -rn "innerHTML" app/assets/js/
   # Document which are user-controlled vs static
   ```

2. **Replace vulnerable innerHTML calls** (8 hours)
   - Bills page: Bill names, types, descriptions
   - Budget page: Custom budget items
   - Notifications: Title and body rendering
   - Friends page: Display names, usernames
   - Shared bills: Participant names

3. **Create sanitization utility** (2 hours)
   ```javascript
   // app/assets/js/security-utils.js
   
   /**
    * Safely render user content as HTML
    * @param {string} userContent - Untrusted user input
    * @returns {string} Sanitized HTML
    */
   function sanitizeUserHTML(userContent) {
     // Option 1: Strip all HTML
     return escapeHtml(userContent);
     
     // Option 2: Allow limited HTML (links, bold, italic)
     // Use DOMPurify library: https://github.com/cure53/DOMPurify
     return DOMPurify.sanitize(userContent, {
       ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
       ALLOWED_ATTR: ['href']
     });
   }
   
   /**
    * Safely create DOM element with text content
    */
   function createTextElement(tag, text, className = '') {
     const el = document.createElement(tag);
     el.textContent = text;  // Safe — no HTML interpretation
     if (className) el.className = className;
     return el;
   }
   ```

4. **Refactor bill rendering** (2 hours)
   ```javascript
   // BEFORE (vulnerable)
   tbody.innerHTML = bills.map(b => `
     <tr>
       <td>${b.name}</td>
       <td>${b.type}</td>
     </tr>
   `).join('');
   
   // AFTER (secure)
   tbody.innerHTML = bills.map(b => `
     <tr>
       <td>${escapeHtml(b.name)}</td>
       <td>${escapeHtml(b.type)}</td>
     </tr>
   `).join('');
   
   // OR (preferred)
   tbody.innerHTML = '';
   bills.forEach(b => {
     const row = tbody.insertRow();
     row.insertCell().textContent = b.name;
     row.insertCell().textContent = b.type;
   });
   ```

5. **Testing & Validation** (2 hours)
   - Test all XSS payloads from pentest report
   - Verify escaping in all forms
   - Check notification rendering
   - Test shared bill names

#### Acceptance Criteria:
- [ ] All user-generated content passes through `escapeHtml()` or `textContent`
- [ ] XSS payloads do NOT execute when entered in any form field
- [ ] All 54 innerHTML assignments reviewed and secured
- [ ] Unit tests added for sanitization functions

---

### 🔴 Priority 2: Implement CSRF Protection (HIGH-02)

**Severity:** HIGH  
**Effort:** 12 hours  
**Assignee:** Builder + Architect Agents  
**Timeline:** Days 3-5

#### Tasks:

1. **Verify Supabase CORS configuration** (1 hour)
   - Login to Supabase Dashboard
   - Navigate to Settings → API → CORS
   - Ensure only `https://nice-cliff-05b13880f.2.azurestaticapps.net` is whitelisted
   - Remove wildcard (*) if present

2. **Configure secure session cookies** (2 hours)
   ```javascript
   // app/assets/js/app.js
   const sb = window.supabase.createClient(supabaseUrl, supabaseKey, {
     auth: {
       persistSession: true,
       storageKey: 'supabase.auth.token',
       detectSessionInUrl: true,
       flowType: 'pkce',  // More secure than implicit flow
       storage: window.localStorage,  // Or implement httpOnly cookie storage
       autoRefreshToken: true
     }
   });
   ```

3. **Implement CSRF token system** (4 hours)
   
   **Option A: Double Submit Cookie Pattern**
   ```javascript
   // Generate token on login
   async function onLoginSuccess() {
     const csrfToken = crypto.randomUUID();
     sessionStorage.setItem('csrf_token', csrfToken);
     
     // Set cookie (via server-side function if available)
     document.cookie = `csrf_token=${csrfToken}; SameSite=Strict; Secure`;
   }
   
   // Validate on every state-changing request
   async function validateCSRF() {
     const sessionToken = sessionStorage.getItem('csrf_token');
     const cookieToken = getCookie('csrf_token');
     
     if (!sessionToken || sessionToken !== cookieToken) {
       throw new Error('CSRF validation failed');
     }
   }
   
   // Add to all forms
   document.querySelectorAll('form').forEach(form => {
     form.addEventListener('submit', async (e) => {
       try {
         await validateCSRF();
       } catch (err) {
         e.preventDefault();
         alert('Security validation failed. Please refresh and try again.');
       }
     });
   });
   ```

   **Option B: Supabase RPC + Custom Header**
   ```javascript
   // Custom header approach
   const CSRF_HEADER = 'X-CSRF-Token';
   
   async function makeSecureRequest(fn) {
     const token = sessionStorage.getItem('csrf_token');
     
     // Add custom header to Supabase client
     sb.headers = {
       ...sb.headers,
       [CSRF_HEADER]: token
     };
     
     return await fn();
   }
   
   // Usage
   await makeSecureRequest(async () => {
     await sb.from('bills').insert({ name: 'New Bill', amount: 100 });
   });
   ```

4. **Add SameSite cookie attribute** (2 hours)
   - Check current cookie configuration
   - Set `SameSite=Strict` on all session cookies
   - Test that login still works after change

5. **Testing** (3 hours)
   - Create malicious HTML page attempting CSRF
   - Verify requests are blocked
   - Test legitimate form submissions still work
   - Verify cookie flags in production

#### Acceptance Criteria:
- [ ] CORS restricted to production domain only
- [ ] Session cookies have `SameSite=Strict`
- [ ] CSRF tokens validated on all state-changing operations
- [ ] Cross-site requests blocked in testing

---

## Phase 2: MEDIUM Priority (Week 2)

### 🟡 Priority 3: Verify Session Security (MED-02)

**Severity:** MEDIUM  
**Effort:** 4 hours  
**Timeline:** Days 6-7

#### Tasks:

1. **Inspect production cookies** (1 hour)
   - Login to live app
   - Open DevTools → Application → Cookies
   - Document all cookie flags

2. **Fix missing flags** (2 hours)
   ```javascript
   // If using custom cookie storage
   function setSecureCookie(name, value, options = {}) {
     const defaults = {
       httpOnly: false,  // Cannot be set via JavaScript (server-side only)
       secure: true,     // HTTPS only
       sameSite: 'Strict',
       maxAge: 3600      // 1 hour
     };
     
     const opts = { ...defaults, ...options };
     document.cookie = `${name}=${value}; ${Object.entries(opts).map(([k,v]) => `${k}=${v}`).join('; ')}`;
   }
   ```

3. **Test session timeout** (1 hour)
   - Verify sessions expire after inactivity
   - Check token refresh mechanism
   - Test logout across tabs

#### Acceptance Criteria:
- [ ] All session cookies have Secure flag
- [ ] SameSite attribute set to Strict
- [ ] Session timeout configured (default: 1 hour)

---

### 🟡 Priority 4: Improve Shared Bill Deletion (MED-03)

**Severity:** MEDIUM  
**Effort:** 8 hours  
**Timeline:** Days 8-9

#### Tasks:

1. **Add pre-delete check** (3 hours)
   ```javascript
   async function deleteBill(billId) {
     // Check for active shares
     const { data: shares } = await sb
       .from('bill_shares')
       .select('*, shared_with:user_profiles!shared_with_id(display_name)')
       .eq('bill_id', billId)
       .in('status', ['accepted', 'pending']);
     
     if (shares && shares.length > 0) {
       const names = shares.map(s => s.shared_with.display_name).join(', ');
       const confirmed = confirm(
         `⚠️ Warning: This bill is shared with ${names}.\n\n` +
         `Deleting it will:\n` +
         `• Remove it from their budgets\n` +
         `• Delete all payment history\n` +
         `• Cancel pending shares\n\n` +
         `Are you absolutely sure?`
       );
       
       if (!confirmed) return;
     }
     
     // Proceed with deletion
     await sb.from('bills').delete().eq('id', billId);
   }
   ```

2. **Implement soft delete option** (4 hours)
   ```sql
   -- Add deleted_at column
   ALTER TABLE bills ADD COLUMN deleted_at TIMESTAMPTZ;
   
   -- Update RLS to exclude deleted bills
   CREATE POLICY "Users can view own active bills"
     ON public.bills FOR SELECT
     USING (auth.uid() = user_id AND deleted_at IS NULL);
   
   -- Shared users can still see deleted bills (read-only archive)
   CREATE POLICY "Shared users can read archived shared bills"
     ON public.bills FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM public.bill_shares
         WHERE bill_shares.bill_id = bills.id
         AND bill_shares.shared_with_id = auth.uid()
         AND bill_shares.status = 'accepted'
       )
     );
   ```

3. **Update UI to show archived bills** (1 hour)
   - Add "Archived" section to bills page
   - Show deleted bills with restored ability (for owner only)

#### Acceptance Criteria:
- [ ] Deletion confirmation shown when bill has shares
- [ ] Soft delete implemented (bills marked as deleted, not removed)
- [ ] Shared users retain read-only access to archived bills

---

### 🟡 Priority 5: Implement Rate Limiting (MED-04)

**Severity:** MEDIUM  
**Effort:** 6 hours  
**Timeline:** Days 10-11

#### Tasks:

1. **Database-level rate limiting** (4 hours)
   ```sql
   -- app/Supabase/rate-limiting-migration.sql
   
   -- Connection request rate limit (10 per hour)
   CREATE OR REPLACE FUNCTION check_connection_rate_limit()
   RETURNS trigger AS $$
   DECLARE
     request_count integer;
   BEGIN
     SELECT COUNT(*) INTO request_count
     FROM connections
     WHERE requester_id = NEW.requester_id
       AND created_at > NOW() - INTERVAL '1 hour';
     
     IF request_count >= 10 THEN
       RAISE EXCEPTION 'Rate limit exceeded: maximum 10 connection requests per hour';
     END IF;
     
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER enforce_connection_rate_limit
     BEFORE INSERT ON connections
     FOR EACH ROW EXECUTE FUNCTION check_connection_rate_limit();
   
   -- Bill creation rate limit (20 per minute)
   CREATE OR REPLACE FUNCTION check_bill_creation_rate_limit()
   RETURNS trigger AS $$
   DECLARE
     creation_count integer;
   BEGIN
     SELECT COUNT(*) INTO creation_count
     FROM bills
     WHERE user_id = NEW.user_id
       AND created_at > NOW() - INTERVAL '1 minute';
     
     IF creation_count >= 20 THEN
       RAISE EXCEPTION 'Rate limit exceeded: maximum 20 bills per minute';
     END IF;
     
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER enforce_bill_creation_rate_limit
     BEFORE INSERT ON bills
     FOR EACH ROW EXECUTE FUNCTION check_bill_creation_rate_limit();
   ```

2. **Enable Supabase API rate limiting** (1 hour)
   - Login to Supabase Dashboard
   - Navigate to Settings → API
   - Configure rate limits:
     - Requests per second: 100
     - Burst: 200

3. **Client-side debouncing** (1 hour)
   ```javascript
   // Debounce friend request button
   let lastRequestTime = 0;
   const REQUEST_COOLDOWN = 2000; // 2 seconds
   
   async function sendConnectionRequest(userId) {
     const now = Date.now();
     if (now - lastRequestTime < REQUEST_COOLDOWN) {
       alert('Please wait a moment before sending another request.');
       return;
     }
     
     lastRequestTime = now;
     // Proceed with request
   }
   ```

#### Acceptance Criteria:
- [ ] Connection requests limited to 10/hour per user
- [ ] Bill creation limited to 20/minute per user
- [ ] Supabase API rate limits configured
- [ ] User-friendly error messages for rate limit hits

---

## Phase 3: LOW Priority & Enhancements (Weeks 3-4)

### 🟢 Priority 6: Remove Debug Code (LOW-01)

**Effort:** 2 hours

```javascript
// Replace conditional debug
const DEBUG = false;

// With build-time removal
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

---

### 🟢 Priority 7: Generic Auth Error Messages (LOW-02)

**Effort:** 1 hour

```javascript
function getFriendlyAuthError(error) {
  // Generic message for all auth failures
  return 'Invalid email or password. Please try again.';
}
```

---

### 🟢 Priority 8: Add Subresource Integrity (LOW-03)

**Effort:** 4 hours

```html
<!-- Add SRI hashes to all CDN resources -->
<script 
  src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous">
</script>
```

Generate hashes: https://www.srihash.org/

---

### 🔵 Priority 9: Security Headers

**Effort:** 6 hours

Add `staticwebapp.config.json` headers:

```json
{
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
  }
}
```

---

### 🔵 Priority 10: Enhanced Password Policy

**Effort:** 3 hours

Update Supabase authentication settings:
- Minimum length: 8 characters (increased from 6)
- Require: uppercase + lowercase + number + symbol

---

### 🔵 Priority 11: Business Logic Constraints

**Effort:** 4 hours

```sql
-- Prevent negative amounts
ALTER TABLE bills ADD CONSTRAINT bills_amount_positive CHECK (amount >= 0);
ALTER TABLE assets ADD CONSTRAINT assets_value_nonnegative CHECK (value >= 0);
ALTER TABLE debts ADD CONSTRAINT debts_amount_positive CHECK (amount > 0);
ALTER TABLE investments ADD CONSTRAINT investments_contrib_nonnegative CHECK (monthly_contribution >= 0);

-- Prevent future dates beyond reasonable range
ALTER TABLE bills ADD CONSTRAINT bills_reasonable_date 
  CHECK (next_due_date < CURRENT_DATE + INTERVAL '10 years');
```

---

## Testing & Validation Checklist

### Before Deployment

- [ ] All HIGH priority fixes implemented and tested
- [ ] XSS payloads tested in all forms (no execution)
- [ ] CSRF tokens validated on state-changing operations
- [ ] Session cookies inspected (Secure, SameSite flags present)
- [ ] Rate limiting tested (triggers after threshold)
- [ ] Negative amounts rejected by database
- [ ] All unit tests passing
- [ ] Manual penetration test re-run (verify fixes)

### Deployment

- [ ] Code reviewed by Architect agent
- [ ] Security review by Auditor agent
- [ ] Staged deployment to test environment
- [ ] Production deployment
- [ ] Post-deployment smoke tests

### Monitoring

- [ ] Enable Supabase audit logs
- [ ] Set up alerts for:
  - Failed login attempts (>5 in 10 minutes)
  - Rate limit violations
  - Unusual API access patterns
- [ ] Weekly security log review

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | HIGH priority fixes | XSS remediation, CSRF protection |
| **Week 2** | MEDIUM priority | Session security, shared bill UX, rate limiting |
| **Week 3** | LOW priority | Debug removal, error messages, SRI |
| **Week 4** | Enhancements | Security headers, password policy, constraints |

---

## Success Metrics

- **Zero HIGH-severity vulnerabilities** after Week 1
- **Zero MEDIUM-severity vulnerabilities** after Week 2
- **All tests passing** before production deployment
- **No XSS execution** in penetration test re-run
- **CSRF attacks blocked** in validation testing

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| **Introducing bugs during remediation** | Comprehensive testing after each change |
| **Breaking existing functionality** | Staged deployment, rollback plan |
| **Timeline overrun** | Prioritize HIGH items, defer LOW items if needed |
| **New vulnerabilities introduced** | Security review after all changes |

---

## Appendix: Quick Reference

### Secure Coding Patterns

```javascript
// ✅ SAFE: Use textContent
element.textContent = userInput;

// ✅ SAFE: Use escapeHtml()
element.innerHTML = escapeHtml(userInput);

// ❌ UNSAFE: Direct innerHTML
element.innerHTML = userInput;

// ✅ SAFE: Create elements programmatically
const div = document.createElement('div');
div.textContent = userInput;
parent.appendChild(div);
```

### Testing Commands

```bash
# Run XSS tests
node pentest-workspace/test-xss.js

# Check for innerHTML usage
grep -rn "innerHTML" app/assets/js/

# Verify cookie flags
# Open browser DevTools → Application → Cookies → Check flags

# Test rate limiting
# Send 11 connection requests in 1 hour (should block 11th)
```

---

**Roadmap Owner:** Capital (Orchestrator Agent)  
**Last Updated:** February 1, 2026  
**Next Review:** After Phase 1 completion (1 week)
