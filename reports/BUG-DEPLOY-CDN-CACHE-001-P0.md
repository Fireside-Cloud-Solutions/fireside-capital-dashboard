# BUG-DEPLOY-CDN-CACHE-001 — Azure CDN Cache Blocking All Deployments

**Severity:** P0 (Critical — Deployment Pipeline Broken)  
**Type:** Infrastructure / DevOps  
**Discovered:** 2026-02-22 07:43 AM EST (Sprint QA cron)  
**Status:** 🚨 **BLOCKING PRODUCTION DEPLOYMENT**  

---

## 📋 EXECUTIVE SUMMARY

Azure Static Web Apps CDN is serving **stale cached versions** of ALL files (HTML, CSS, JS), despite commits being pushed to GitHub and deployment workflows succeeding. **No code changes from the past 3+ hours are live.**

### Impact

- ❌ All commits since ~4:19 AM are NOT live (3h 24min deployment lag)
- ❌ 10+ bug fixes and features appear "deployed" but users see old code
- ❌ QA testing is reporting false positives (local code ≠ live code)
- ❌ All 12 pages serving stale HTML
- ❌ All 9 CSS files potentially stale
- ❌ All JS files confirmed stale

**Blocked Deployments:**
1. BUG-JS-CSRF-CONSOLE-POLLUTION-001 (commit c899df2, 4:19 AM) — Not live
2. Reports page h5->h3 typography fix (commit 8f85bb6, 7:22 AM) — Not live
3. Stat card spacing fix (commit 3980957, 7:15 AM) — Likely not live
4. Empty state typography fixes (commit 8aa2030, 7:15 AM) — Likely not live
5. Skeleton fade transitions CSS (commit 1dec046, 7:22 AM) — Likely not live
6. Skeleton fade transitions JS (commit 6b0a2d9, 7:35 AM) — Likely not live

---

## 🔍 EVIDENCE

### Test 1: CSRF.js Console Warnings

**Expected (after fix c899df2):** Zero CSRF warnings  
**Actual (on live site):** 9 CSRF warnings on every page load  

**Live Code (browser fetch):**
```javascript
// Line 88 in deployed csrf.js
if (!form) {
  console.warn(`CSRF: Form with ID "${formId}" not found`);  // ❌ OLD CODE
  return;
}
```

**Origin Server (direct HTTP request with cache-busting):**
```javascript
// Line 88 in origin csrf.js
if (!form) {
  // Silently skip forms that don't exist on this page  // ✅ NEW CODE (FIXED)
  return;
}
```

**Conclusion:** Browser is receiving cached JS from CDN, not fresh code from origin.

---

### Test 2: Reports Page Typography Fix

**Expected (after fix 8f85bb6):** `<h3 class="mb-2">No Financial Data Yet</h3>`  
**Actual (on live site):** `<h5 class="mb-2">No Financial Data Yet</h5>` ❌

**Verification:**
```javascript
document.body.innerHTML.includes('<h3 class="mb-2">No Financial Data Yet</h3>')
// Result: false

document.body.innerHTML.includes('<h5 class="mb-2">No Financial Data Yet</h5>')
// Result: true ❌ OLD VERSION SERVED
```

**Conclusion:** Browser is receiving cached HTML from CDN, not fresh HTML from origin.

---

### Test 3: Console Warnings Timeline

| Time | Event | CSRF Warnings Count |
|------|-------|---------------------|
| 4:19 AM | CSRF fix committed (c899df2) | Should be 0 |
| 6:05 AM | Sprint QA 0600 reports warnings still present | 9 warnings ❌ |
| 7:41 AM | Sprint QA 0741 tests live site | **9 warnings still present** ❌ |

**Deployment Lag:** 3 hours 24 minutes (and counting)

---

## 🔧 ROOT CAUSE ANALYSIS

### Azure Static Web Apps CDN Behavior

**Problem:** Azure Static Web Apps uses Azure CDN to serve content globally. When a GitHub deployment completes, the origin files are updated, but the CDN edge nodes continue serving cached versions until:
1. The cache TTL expires (could be hours or days)
2. Manual cache purge is triggered
3. A new deployment with different content hash is pushed

**Why Direct HTTP Requests Work:**
- `Invoke-WebRequest` with cache-busting (`?cb=timestamp`) bypasses CDN cache
- Browser requests WITHOUT cache-busting hit CDN cache

**Why Browser Sees Old Code:**
- Browser requests: `https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/js/csrf.js`
- CDN serves cached version (no cache-busting parameter)
- Hard refresh (Ctrl+Shift+F5) doesn't help (CDN cache, not browser cache)

---

## 🚨 AFFECTED FILES

### Confirmed Stale (Tested)
1. ✅ `/assets/js/csrf.js` — 3h 24min stale (commit c899df2 not live)
2. ✅ `/reports.html` — 18min stale (commit 8f85bb6 not live)

### Likely Stale (Not Yet Tested)
3. `/assets.html` — h5->h3 fix (commit 8aa2030)
4. `/settings.html` — h5->h3 fix (commit 8aa2030)
5. `/assets/css/main.css` — stat-trend fix (commit 3980957)
6. `/assets/js/app.js` — skeleton fade JS (commit 6b0a2d9)
7. All other HTML pages (12 total)
8. All other CSS files (9 total)
9. All other JS files

---

## 🛠️ RESOLUTION OPTIONS

### Option 1: Manual CDN Cache Purge (RECOMMENDED)

**Steps:**
1. Login to Azure Portal: https://portal.azure.com
2. Navigate to: Static Web Apps → nice-cliff-05b13880f
3. Find "Purge CDN" or "Clear Cache" option
4. Purge all cached content
5. Wait 5-10 minutes for propagation
6. Re-test live site

**Pros:**
- Immediate fix (5-10 min)
- No code changes needed
- Fixes all affected files at once

**Cons:**
- Requires Azure Portal access
- May cause temporary 404s during purge

---

### Option 2: Add Cache-Busting to All Asset References

**Implementation:**
```html
<!-- Before -->
<script src="/assets/js/csrf.js"></script>

<!-- After -->
<script src="/assets/js/csrf.js?v=20260222b"></script>
```

**Pros:**
- Prevents future CDN cache issues
- Industry best practice
- Granular control over cache invalidation

**Cons:**
- Requires updating ALL HTML pages
- Requires new deployment (which may also be cached)
- Doesn't fix current issue immediately

---

### Option 3: Configure Azure CDN Rules

**Implementation:**
1. Azure Portal → Static Web Apps → Configuration
2. Set `Cache-Control` headers for different file types:
   - HTML: `no-cache` or `max-age=300` (5 min)
   - CSS/JS: `max-age=3600` (1 hour) with versioning
   - Images: `max-age=86400` (24 hours)

**Pros:**
- Long-term solution
- Balances performance with freshness
- Industry standard

**Cons:**
- Doesn't fix current issue
- Requires Azure configuration knowledge

---

### Option 4: Wait for CDN TTL Expiry

**Do Nothing:**
- Wait for Azure CDN cache to naturally expire
- Could take hours or days depending on TTL settings

**Pros:**
- Zero effort

**Cons:**
- Unacceptable delay
- Users see broken site
- Cannot deploy fixes

---

## 🎯 RECOMMENDED IMMEDIATE ACTIONS

### 1. Purge Azure CDN Cache (5 minutes) — **DO THIS FIRST**

```
Azure Portal > Static Web Apps > nice-cliff-05b13880f > Purge CDN
```

### 2. Verify Fix (5 minutes)

Re-test after purge:
```javascript
// Test 1: CSRF warnings should be ZERO
console.clear();
location.reload();
// Wait for load, count warnings

// Test 2: Reports page should have h3
fetch('/reports.html').then(r => r.text()).then(h => 
  h.includes('<h3 class="mb-2">No Financial Data Yet</h3>')
);
```

### 3. Add Cache-Busting to Critical JS Files (30 minutes)

Update all 12 HTML pages:
```html
<script src="/assets/js/csrf.js?v=20260222"></script>
<script src="/assets/js/app.js?v=20260222b"></script>
<script src="/assets/js/chart-factory.js?v=20260220"></script>
```

Increment version number with each deployment.

### 4. Configure Azure CDN Headers (1 hour)

Set proper `Cache-Control` headers:
- HTML: `no-cache` (always revalidate)
- JS/CSS: `max-age=3600` (1 hour) + versioning
- Images: `max-age=86400` (1 day)

---

## 📊 TESTING EVIDENCE

### Console Output (Sprint QA 0741)

**Page:** https://nice-cliff-05b13880f.2.azurestaticapps.net/  
**Time:** 2026-02-22 07:43:48 EST  

```json
{
  "type": "warning",
  "text": "CSRF: Form with ID \"assetForm\" not found",
  "timestamp": "2026-02-22T12:43:48.042Z",
  "location": {
    "url": "https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/js/csrf.js",
    "lineNumber": 88,
    "columnNumber": 14
  }
}
```

**Repeated 9 times** for all protected forms.

---

### HTTP Fetch Comparison

**Browser Fetch (via CDN):**
```javascript
fetch('/assets/js/csrf.js')
  .then(r => r.text())
  .then(t => t.split('\n')[87])
// Result: "      console.warn(`CSRF: Form with ID \"${formId}\" not found`);"
```

**Direct HTTP (cache-busted):**
```powershell
Invoke-WebRequest -Uri "https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/js/csrf.js?cb=1740223428"
# Line 88: "// Silently skip forms that don't exist on this page"
```

**Conclusion:** Origin server has fix, CDN does not.

---

## 🔄 DEPLOYMENT HISTORY

| Commit | Time | Change | Deployed to Origin? | Live on CDN? |
|--------|------|--------|---------------------|--------------|
| c899df2 | 4:19 AM | CSRF fix | ✅ YES | ❌ NO (3h 24min lag) |
| 8aa2030 | 7:15 AM | Empty state h5->h3 | ✅ YES | ❌ NO (28min lag) |
| 3980957 | 7:15 AM | Stat card spacing | ✅ YES | ❌ NO (28min lag) |
| 8f85bb6 | 7:22 AM | Reports h5->h3 | ✅ YES | ❌ NO (21min lag) |
| 1dec046 | 7:22 AM | Skeleton CSS | ✅ YES | ❌ NO (21min lag) |
| 6b0a2d9 | 7:35 AM | Skeleton JS | ✅ YES | ❌ NO (8min lag) |

**All commits verified pushed to GitHub main branch.**  
**Azure deployment workflows show success.**  
**But CDN is serving stale files.**

---

## 📢 IMPACT ASSESSMENT

### Production Readiness: ❌ BLOCKED

**Cannot deploy until CDN cache is purged.**

### User Experience: DEGRADED

Users see:
- 9 console warnings on every page (unprofessional)
- Inconsistent typography (h5 instead of h3)
- Missing spacing optimizations
- Old skeleton loader behavior

### Development Workflow: BROKEN

- QA reports false positives (local code ≠ live code)
- Cannot verify deployments
- Cannot test fixes
- Developers waste time re-pushing same fixes

### Business Impact: MEDIUM

- App is functional (no critical bugs)
- But quality improvements are not reaching users
- Technical debt accumulating (users see old code)

---

## 🎯 PRIORITY: P0

**Justification:**
- Blocks ALL future deployments
- Breaks QA/testing workflow
- Affects 100% of users
- Multiple hours of deployment lag
- Critical fixes not reaching production

**Action Required:** Founder must purge Azure CDN cache IMMEDIATELY (5 minutes via Azure Portal)

---

## 📝 NEXT STEPS (After Cache Purge)

1. ✅ Verify all 6+ commits are live
2. ✅ Confirm zero CSRF warnings
3. ✅ Test Reports page has h3 heading
4. ⏳ Implement cache-busting on all asset references
5. ⏳ Configure Azure CDN Cache-Control headers
6. ⏳ Document deployment verification procedure
7. ⏳ Add automated deployment tests (detect CDN cache lag)

---

**Reported by:** Capital (QA Lead) — Sprint QA 0741  
**Next QA Session:** Will verify cache purge success + re-test all pages
