# QA Sprint Bug Report
**Date:** Friday, February 20, 2026 — 4:00 AM
**Auditor:** Capital (QA Agent)
**Scope:** Dark mode verification + systematic page audit

---

## 🔴 CRITICAL: Deployment Completely Stale

### BUG-DEPLOY-STALE-0220-001 (P0 — BLOCKER)
**Severity:** Critical  
**Page:** All  
**Status:** Open  

**Description:**  
Live site (https://nice-cliff-05b13880f.2.azurestaticapps.net) is serving build from **February 1, 2026 17:00** — **19 days old**. None of the recent work is deployed:

**Missing Features:**
- FC-100/101/104: Bootstrap dark mode toggle (committed Feb 19)
- FC-102: Light mode financial color overrides (committed Feb 20)
- FC-087: Content-aware chart skeleton loaders (committed Feb 19)
- FC-094/095/097/103/177/178: Chart performance optimizations (committed Feb 19)

**Missing Bug Fixes (20+ commits):**
- All QA fixes from last 2 days
- Session security fixes
- Mobile layout fixes
- Operations dashboard (FC-173)
- And many more

**Evidence:**
```javascript
// Deployed HTML <head> comment:
<!-- Build: 2026-02-01-17:00 - FINAL FIX -->

// Latest git commit:
88d2fd3 docs: Sprint Dev 0755 status update — FC-102 complete, commit 1fd857c
Date: Feb 20, 2026

// Expected dark mode toggle in sidebar:
<div class="theme-toggle">
  <input class="form-check-input" type="checkbox" id="themeSwitch" />
</div>
// Actual: getElementById('themeSwitch') => null
```

**Root Cause:**  
Azure Static Web Apps CI/CD pipeline is NOT deploying on git push. GitHub Actions may be failing or disabled.

**Impact:**  
- Users see 19-day-old version with known bugs
- All recent QA work is invisible
- Dark mode feature completely unavailable
- Performance improvements not applied

**Fix:**
1. ~~Check GitHub Actions status~~ ✅ DONE — Actions ARE running successfully (run #555 completed Feb 19, 8:03 AM)
2. ~~Verify workflow config~~ ✅ DONE — Workflow is correct (`app_location: "app"`, `skip_app_build: true`)
3. **Root Cause Identified:** Azure Static Web Apps CDN is NOT propagating deployments despite successful GitHub Actions
4. **Required Actions:**
   - Purge Azure CDN cache for nice-cliff-05b13880f.2.azurestaticapps.net
   - OR Trigger manual redeployment via Azure portal
   - OR Restart Azure Static Web Apps service
   - Check Azure Static Web Apps deployment history (may be stuck on old deployment)
5. Add deployment verification check to workflow (e.g., check build timestamp after deploy)

**Test:**
After deployment, verify:
```javascript
document.getElementById('themeSwitch') !== null
document.querySelector('html').innerHTML.includes('Build: 2026-02-')
```

---

## 🔴 HIGH: Database Schema Mismatch

### BUG-SNAPSHOT-SCHEMA-0220-002 (P1 — Data Loss Risk)
**Severity:** High  
**Page:** Dashboard (all pages that save snapshots)  
**Status:** Open  

**Description:**  
Daily snapshot saves are failing due to schema mismatch. Code is trying to save `monthlyBills` column that doesn't exist in Supabase `snapshots` table.

**Evidence:**
```
Console Error (repeated 3x on dashboard load):
Failed to load resource: 400 (https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/snapshots)

Error saving snapshot: {
  code: PGRST204,
  details: null,
  hint: null,
  message: "Could not find the 'monthlyBills' column of 'snapshots' in the schema cache"
}

Source: app.js?v=20260219b:3816:23
```

**Root Cause:**  
`app.js` line ~3816 is trying to save a snapshot object with a `monthlyBills` property, but the Supabase table schema doesn't include that column. Either:
1. The code added a new field without a migration, OR
2. A migration was written but not applied to the database

**Impact:**
- Net worth history snapshots not being saved
- "Net Worth Over Time" chart may have stale/missing data
- Historical trend analysis broken
- Users lose daily financial tracking

**Fix:**
Migration file `migrations/010_snapshots_add_financial_columns.sql` exists but was NEVER APPLIED to Supabase.

**Steps to Fix:**
1. Open Supabase Dashboard → SQL Editor
2. Run migration `migrations/010_snapshots_add_financial_columns.sql`:
   ```sql
   ALTER TABLE snapshots
     ADD COLUMN IF NOT EXISTS "totalAssets"      NUMERIC(15,2),
     ADD COLUMN IF NOT EXISTS "totalInvestments" NUMERIC(15,2),
     ADD COLUMN IF NOT EXISTS "totalDebts"       NUMERIC(15,2),
     ADD COLUMN IF NOT EXISTS "monthlyBills"     NUMERIC(15,2),
     ADD COLUMN IF NOT EXISTS "monthlyIncome"    NUMERIC(15,2);
   ```
3. Verify columns were added: `SELECT * FROM snapshots LIMIT 1;`
4. Test snapshot save on dashboard (should succeed without errors)

**Files:**
- Migration: `migrations/010_snapshots_add_financial_columns.sql`
- Code saving snapshots: `app/assets/js/app.js` (line 3804-3816)

---

## 🟡 MEDIUM: Chart Cleanup Error on Logout

### BUG-SESSION-CASHFLOW-CHART-0220-003 (P2 — UX)  
**Severity:** Medium  
**Page:** All (triggered on logout)  
**Status:** ✅ FIXED (commit 91852c8)  

**Description:**  
When session security triggers logout, `session-security.js` tries to destroy `window.cashFlowChart` but the object doesn't exist or doesn't have a `.destroy()` method, causing a TypeError.

**Evidence:**
```
Console Error (repeated 10+ times on logout):
TypeError: window.cashFlowChart.destroy is not a function
    at SessionSecurityManager.clearAllSessionData (session-security.js:192:52)
    at SessionSecurityManager.onLogout (session-security.js:356:10)
```

**Root Cause:**
`session-security.js` line 192 assumes `cashFlowChart` is always a Chart.js instance with a `.destroy()` method. But:
1. Cash flow chart may not be initialized on all pages
2. The chart might be stored in a different variable name
3. Operations.html may use a different chart instance for cash flow

**Impact:**
- Console spam on logout (10+ identical errors)
- Doesn't break functionality but pollutes error logs
- May mask real errors

**Fix:** ✅ APPLIED
Committed in `91852c8` - Added method existence check before calling `.destroy()` on all charts.

**Changed Code:**
```javascript
// Before:
if (window.cashFlowChart) window.cashFlowChart.destroy();

// After:
if (window.cashFlowChart && typeof window.cashFlowChart.destroy === 'function') {
  window.cashFlowChart.destroy();
}
```

Applied to: `netWorthChart`, `cashFlowChart`, `emergencyFundChart`

**Files:**
- ✅ `app/assets/js/session-security.js` (lines 190-198)

---

## Summary

| Bug ID | Severity | Status | Page | Title |
|--------|----------|--------|------|-------|
| BUG-DEPLOY-STALE-0220-001 | P0 Critical | Open (Azure portal needed) | All | Deployment 19 days stale - FC-100+ missing |
| BUG-SNAPSHOT-SCHEMA-0220-002 | P1 High | Open (Supabase migration needed) | Dashboard | monthlyBills column missing from snapshots table |
| BUG-SESSION-CASHFLOW-CHART-0220-003 | P2 Medium | ✅ FIXED (commit 91852c8) | All | cashFlowChart.destroy() TypeError on logout |

**Next Steps:**
1. **URGENT:** Fix Azure CDN/deployment propagation (BUG-DEPLOY-STALE-0220-001)
   - Azure portal access needed
   - Purge CDN cache or restart Static Web App
   - GitHub Actions are working correctly
2. Fix snapshot schema (BUG-SNAPSHOT-SCHEMA-0220-002)
   - Run `migrations/010_snapshots_add_financial_columns.sql` in Supabase SQL Editor
3. ✅ ~~Add chart null checks (BUG-SESSION-CASHFLOW-CHART-0220-003)~~ DONE (commit 91852c8)
4. Continue systematic page audit after deployment fix

**Diagnosis Summary:**
- ✅ Git commits are up to date (88d2fd3)
- ✅ GitHub Actions running successfully (555 workflows completed)
- ✅ Workflow config is correct
- ❌ Azure Static Web Apps NOT serving latest deployment
- ❌ Site stuck on Feb 1 build despite 19 days of successful deployments

**QA Status:**
- Pages audited: 1/14 (Dashboard - but testing stale build)
- CSS files audited: 1/9 (design-tokens.css verified in source)
- **Cannot proceed with meaningful QA until deployment is fixed**

---
**Generated:** 2026-02-20 04:00 AM EST  
**By:** Capital (Fireside Capital QA Agent)
