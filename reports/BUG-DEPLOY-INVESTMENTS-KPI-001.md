# BUG-DEPLOY-INVESTMENTS-KPI-001: FC-UIUX-030 Not Deployed to Production

**Type:** P0 - Critical Deployment Bug  
**Found:** 2026-02-22 06:40 AM (Sprint QA 0640)  
**Status:** Active  
**Component:** Deployment / Azure Static Web Apps

---

## Summary
FC-UIUX-030 (Investment KPI cards) was committed to Git and pushed to GitHub but is NOT deployed to the live site at https://nice-cliff-05b13880f.2.azurestaticapps.net.

This is the **SAME deployment/caching issue** as BUG-DEPLOY-CSRF-001 discovered earlier.

---

## Evidence

### Git Status
- ✅ Commit 4003e99 exists in local main branch
- ✅ Commit is pushed to origin/main (git push says "Everything up-to-date")
- ✅ Changes visible in local `app/investments.html` file

### Live Site
- ❌ KPI cards NOT visible on https://nice-cliff-05b13880f.2.azurestaticapps.net/investments.html
- ❌ HTML source missing the KPI card markup
- ❌ Browser screenshot shows only the investment table (no cards above it)

### What SHOULD Be There
According to commit 4003e99, the following should appear before the investment table:

```html
<!-- Investment KPI Summary Cards (FC-UIUX-030) -->
<div class="row g-3 g-xl-4 mb-4">
  <div class="col-xl-4 col-md-6 col-12">
    <div class="summary-card loading" role="status" aria-live="polite">
      <h6>Total Portfolio Value</h6>
      <div class="skeleton-loader skeleton-value" style="width: 140px; height: 32px;"></div>
      <h4 id="investmentTotalValue" class="d-none">$0.00</h4>
    </div>
  </div>
  <!-- ... 2 more cards ... -->
</div>
```

---

## Impact
- **User Impact:** Medium (feature not available, but page functional)
- **Developer Impact:** High (deployment pipeline broken)
- **Trust Impact:** Critical (2nd time in 24h that committed code isn't live)

---

## Root Cause
Azure Static Web Apps deployment pipeline or caching issue. The GitHub Actions workflow is either:
1. Not triggering on push
2. Triggering but failing silently
3. Succeeding but Azure is serving stale cached files

---

## Reproduction
1. Visit https://nice-cliff-05b13880f.2.azurestaticapps.net/investments.html
2. Look for KPI summary cards above the investment table
3. They are NOT there

## Expected
Three KPI summary cards should appear:
- Total Portfolio Value
- Monthly Contributions
- Average Annual Return

## Actual
Only the investment table is visible. No KPI cards.

---

## Tested On
- **Date:** 2026-02-22 06:40 AM
- **Browser:** Chrome (via Clawdbot browser automation)
- **URL:** https://nice-cliff-05b13880f.2.azurestaticapps.net/investments.html

---

## Resolution Required
MUST be fixed by founder or DevOps team:
1. Check Azure Static Web Apps deployment logs
2. Verify GitHub Actions workflow is running
3. Force a new deployment or clear Azure cache
4. Ensure all commits from 2026-02-22 are actually deployed

---

## Related Bugs
- **BUG-DEPLOY-CSRF-001:** Same deployment issue (CSRF fix not live despite being committed)
- **BUG-DB-MIGRATION-001:** Database bug that persisted due to migration not executing

---

## Files Affected
- `app/investments.html` (lines 138-163)
- `app/assets/js/app.js` (Investment KPI calculation logic)

---

## Assignee
**Founder** (Matt) — requires Azure Portal access to diagnose deployment pipeline

---

## Notes
This is **NOT a code bug** — the code is correct and committed. This is a **deployment/infrastructure bug**.

All code review and testing is pointless until the deployment pipeline is fixed.
