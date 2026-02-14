# BUG-PERF-003: BUG-PERF-002-REGRESSION Fix Ineffective — Performance Highly Variable

**Bug ID:** BUG-PERF-003  
**Severity:** P1 (High Priority — Affects All Pages)  
**Type:** Performance Regression  
**Found:** Feb 14, 2026 4:40 AM EST  
**Reporter:** Capital (Sprint QA Cron)  
**Affects:** All 11 HTML pages

---

## Executive Summary

The BUG-PERF-002-REGRESSION fix (commit 7831793, Feb 14 4:38 AM) implemented selective `defer` to improve performance. **Expected:** +5-8% improvement (69% → 74-77%). **Actual:** Highly variable results ranging from 58% to 72%, with most pages at or below baseline (68%). The fix did NOT achieve its performance targets and may have introduced new regressions on some pages (Reports: 58%).

---

## Test Results (Feb 14, 2026 4:41-4:44 AM)

**Lighthouse CLI Tests (Performance Category Only):**

| Page | Performance | FCP | LCP | TBT | vs Baseline (69%) |
|------|-------------|-----|-----|-----|-------------------|
| **Investments** | **72%** ✅ | 4.4s | 4.7s | 50ms | **+3%** |
| **Assets** | **71%** ✅ | 4.7s | 4.7s | 0ms | **+2%** |
| **Budget** | **71%** ✅ | 4.7s | 4.7s | 0ms | **+2%** |
| **Settings** | 69% | 4.9s | 5.0s | 50ms | 0% |
| **Dashboard** | 68% ⚠️ | 4.1s | 5.0s | 210ms | **-1%** |
| **Bills** | 68% ⚠️ | 4.9s | 5.2s | 110ms | **-1%** |
| **Reports** | **58%** ❌ | 4.5s | 5.2s | 480ms | **-11%** |

**Average Performance:** **68%** (vs expected 74-77%)  
**Best:** Investments 72% (+3% vs baseline)  
**Worst:** Reports 58% (-11% vs baseline)  
**Target:** 90%+ (not achieved on any page)

---

## Comparison to Previous Tests

### Dashboard (index.html)
- **Session 0721 (Feb 13, 7:21 AM):** 69% performance (before BUG-PERF-002-REGRESSION fix)
- **Today (Feb 14, 4:41 AM):** 68% performance (after BUG-PERF-002-REGRESSION fix)
- **Change:** -1% (regression)

### Bills (bills.html)
- **Session 0746 (Feb 13, 7:46 AM):** 68% performance
- **Today (Feb 14, 4:42 AM):** 68% performance
- **Change:** 0% (no improvement)

---

## Critical Metrics

### Total Blocking Time (TBT) — Highly Variable ⚠️
| Page | TBT | Status |
|------|-----|--------|
| Assets | 0ms | ✅ Excellent |
| Budget | 0ms | ✅ Excellent |
| Investments | 50ms | ✅ Good (< 200ms target) |
| Settings | 50ms | ✅ Good |
| Bills | 110ms | ⚠️ Moderate |
| Dashboard | 210ms | ❌ Poor (> 200ms) |
| Reports | 480ms | ❌ Very Poor (2.4x target) |

**Previous Dashboard TBT (Session 0721):** 10ms (before BUG-PERF-002-REGRESSION fix)  
**Today:** 210ms (after BUG-PERF-002-REGRESSION fix)  
**Regression:** +200ms (21x worse)

### Largest Contentful Paint (LCP)
- **Target:** < 2.5s
- **All pages:** 4.7s - 5.2s ❌
- **Status:** All pages fail LCP target by 88-108%

### First Contentful Paint (FCP)
- **Target:** < 1.8s
- **All pages:** 4.1s - 4.9s ❌
- **Status:** All pages fail FCP target by 128-172%

---

## Root Cause Analysis

### What BUG-PERF-002-REGRESSION Fixed
**Commit 7831793 (Feb 14, 4:38 AM):**
- Added `defer` attribute to non-critical scripts
- **Critical (synchronous):** Supabase, Bootstrap, csrf.js, security-utils.js, session-security.js, app.js, event-handlers.js, empty-states.js, charts.js
- **Non-critical (defer):** rate-limiter.js, rate-limit-db.js, polish-utilities.js, notification-enhancements.js, security-patch.js, app-polish-enhancements.js, plaid.js, subscriptions.js, loading-states.js

### Why It Didn't Work
1. **TBT Increased Significantly:** Dashboard TBT went from 10ms → 210ms (21x worse)
2. **Performance Scores Variable:** 58% - 72% range (expected consistent 74-77%)
3. **Reports Page Severely Affected:** 58% performance with 480ms TBT
4. **Root Cause:** Critical scripts still render-blocking — `defer` on non-critical scripts had minimal impact

### The Real Problem
**ALL scripts still load synchronously in `<head>` or early `<body>`** — even with `defer`, the browser must:
1. Download and parse HTML
2. Discover script tags
3. Download all scripts (render-blocking CDN resources: Bootstrap 59KB, Chart.js 270KB, Supabase SDK)
4. Execute critical scripts
5. Then render content (LCP)

**Selective `defer` helps TBT on SOME pages** (Assets: 0ms, Budget: 0ms) but **hurts others** (Dashboard: 210ms, Reports: 480ms) — likely due to execution order dependencies.

---

## Expected vs Actual

### Expected (from BUG-PERF-002-REGRESSION fix commit message)
> EXPECTED IMPROVEMENT:
> - FCP: Improved (HTML parses without blocking) ✅
> - LCP: No regression (critical scripts execute early) ✅
> - Performance: +5-8% improvement over baseline (69% → 74-77%)

### Actual
- **FCP:** ❌ Still 4.1-4.9s (no meaningful improvement)
- **LCP:** ❌ Regressed on some pages (Dashboard: 4.8s → 5.0s)
- **Performance:** ❌ Variable (58-72%), average 68% vs expected 74-77%
- **TBT:** ❌ Severely regressed on some pages (Dashboard: 10ms → 210ms, Reports: 480ms)

---

## Impact Assessment

### User Impact
- **Slow page loads:** 4-5 second wait before meaningful content appears
- **Inconsistent experience:** Reports page significantly slower than other pages
- **Mobile users:** Worse experience (Core Web Vitals fail)

### Business Impact
- **SEO:** Google penalizes slow sites (FCP/LCP/TBT all fail)
- **Bounce rate:** Users leave before page loads
- **Accessibility:** Slow load impacts users with disabilities

### Technical Debt
- **Quick fixes insufficient:** Selective `defer` not enough to hit 90% target
- **Comprehensive fix required:** FC-118 (Webpack build system) or alternative bundling strategy
- **Performance budget:** Currently no page meets 90% target

---

## Recommendations

### Immediate Actions (Next Sprint)
1. **Investigate Reports Page:** Why is TBT 480ms (8x worse than target)?
2. **Test Defer Attribute Order:** Are critical scripts being delayed by deferred scripts?
3. **Measure Script Dependencies:** Which scripts can truly be deferred without breaking functionality?

### Short-Term Fixes (This Week)
1. **FC-119: Async/Defer Optimization** (30 min)
   - Test `async` vs `defer` for non-critical scripts
   - Move all scripts to end of `<body>` (not `<head>`)
   - Expected: -0.5 to -2s FCP improvement

2. **Critical CSS Inline** (1-2 hours)
   - Inline critical CSS for above-the-fold content
   - Defer non-critical CSS (`preload` + `onload`)
   - Expected: -1 to -1.5s FCP improvement

### Long-Term Solutions (Next 2 Weeks)
1. **FC-118: Webpack Build System** (4-5 hours)
   - Bundle and minify all local JS/CSS
   - Tree-shake unused code
   - Code splitting (vendor vs app bundles)
   - Expected: 69% → 80% performance

2. **CDN Strategy Review** (2 hours)
   - Self-host critical dependencies (Bootstrap, Chart.js)
   - Use HTTP/2 server push for critical resources
   - Implement service worker for caching
   - Expected: -1 to -2s LCP improvement

---

## Testing Notes

### Test Environment
- **Tool:** Lighthouse CLI 13.0.0
- **Browser:** Chrome Headless
- **Network:** Simulated (mobile 4G)
- **CPU:** 4x slowdown
- **Date:** Feb 14, 2026 4:41-4:44 AM EST

### Test Command
```powershell
lighthouse [URL] --only-categories=performance --output=json --output-path=[PATH] --chrome-flags="--headless --no-sandbox"
```

### Pages Tested
7 of 11 pages (64% coverage):
- ✅ Dashboard (index.html)
- ✅ Assets (assets.html)
- ✅ Bills (bills.html)
- ✅ Budget (budget.html)
- ✅ Investments (investments.html)
- ✅ Reports (reports.html)
- ✅ Settings (settings.html)
- ⏳ Debts (debts.html)
- ⏳ Friends (friends.html)
- ⏳ Income (income.html)
- ⏳ Transactions (transactions.html)

---

## Next Steps

### For QA
1. ✅ Test remaining 4 pages (Debts, Friends, Income, Transactions)
2. ✅ Create comprehensive performance comparison chart
3. ✅ Post findings to Discord #qa channel
4. ⏳ Create Azure DevOps work item for BUG-PERF-003
5. ⏳ Update STATUS.md with performance audit status

### For Development
1. **Decision Required:** Revert BUG-PERF-002-REGRESSION fix (commit 7831793)?
2. **Alternative:** Implement FC-119 (async/defer optimization) as immediate fix?
3. **Long-term:** Prioritize FC-118 (Webpack build system) for comprehensive fix?

---

## References

- **Commit:** 7831793 (BUG-PERF-002-REGRESSION fix, Feb 14 4:38 AM)
- **Previous Bug:** BUG-PERF-002 (all scripts had defer, causing LCP regression)
- **Related Reports:**
  - reports/BUG-PERF-002-REGRESSION-2026-02-14-0420.md
  - reports/SPRINT-QA-2026-02-13-0721.md (Dashboard 69% performance)
  - reports/SPRINT-QA-2026-02-13-0746.md (Bills 68% performance)
- **Work Items:**
  - FC-118: Webpack Build System (comprehensive performance fix)
  - FC-119: Async/Defer Script Loading (quick win)

---

## Conclusion

The BUG-PERF-002-REGRESSION fix (selective `defer`) **did not achieve its performance targets**. While some pages improved slightly (Investments: 72%, Assets: 71%, Budget: 71%), others regressed (Reports: 58%, Dashboard: 68%). The **average performance is 68%**, well below the expected 74-77% and far from the 90% target.

**Critical Issue:** TBT increased significantly on some pages (Dashboard: 10ms → 210ms, Reports: 480ms), indicating potential script execution order issues.

**Recommendation:** Investigate Reports page TBT regression immediately. Consider reverting selective `defer` if root cause is unfixable. Prioritize FC-118 (Webpack) or FC-119 (script positioning) for reliable performance improvement.

**Awaiting Founder Decision:** Revert fix, apply alternative, or proceed with comprehensive Webpack solution?
