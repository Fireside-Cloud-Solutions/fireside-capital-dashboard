# BUG-PERF-FC119-REGRESSION — FC-119 Performance Regression

**Discovered:** 2026-02-14 05:15 AM  
**Severity:** P0 — Critical  
**Status:** REVERTED (commit f932ff8)  
**Session:** Sprint Dev 0515

---

## Summary

FC-119 (moving scripts to end of `<body>`) **decreased performance by 4-5%** instead of improving it. This is the **THIRD failed attempt** to improve performance by delaying JavaScript execution.

**Pattern:** Any JavaScript delay (defer, selective defer, move to end) makes performance WORSE because Fireside Capital's main content (charts/tables) IS JavaScript-rendered.

---

## Test Results

### Dashboard (index.html)
| Metric | Before (Session 0400) | After FC-119 (0515) | Change |
|--------|----------------------|---------------------|--------|
| Performance | 69% | **64%** | **-5%** ❌ |
| FCP | 4.7s | 4.8s | +0.1s ❌ |
| LCP | 4.8s | 4.9s | +0.1s ❌ |
| TBT | 210ms | **260ms** | **+50ms** ❌ |

### Assets Page
| Metric | Before (Session 0400) | After FC-119 (0515) | Change |
|--------|----------------------|---------------------|--------|
| Performance | 71% | **67%** | **-4%** ❌ |
| FCP | 4.65s | 4.7s | +0.05s ❌ |
| LCP | 4.70s | **5.0s** | **+0.3s** ❌ |
| TBT | 0ms | **180ms** | **+180ms** ❌ |

---

## Root Cause

**Fireside Capital is a data-driven web application where the Largest Contentful Paint (LCP) is measured against JavaScript-rendered content:**

- Charts (Chart.js)
- Data tables (populated by app.js)
- Dashboard widgets (JavaScript-generated)

**Moving scripts to end of `<body>` delays script execution:**

```
BEFORE FC-119:
HTML parse → Scripts in <body> execute → Charts render → LCP measured
             ↑ Scripts execute DURING parsing

AFTER FC-119:
HTML parse → DOM complete → Scripts at end execute → Charts render → LCP measured
                            ↑ Scripts execute AFTER parsing (DELAYED)
```

**Result:** Charts render later → LCP increases → Performance decreases

---

## Failed Attempts Timeline

### Attempt 1: BUG-PERF-002 (Session 0415)
- **Fix:** Add `defer` to ALL scripts
- **Result:** Performance decreased 3-5% ❌
- **Reason:** Defer delays script execution until after DOM parsing

### Attempt 2: BUG-PERF-002-REGRESSION (Session 0435)
- **Fix:** Selective defer (critical synchronous, non-critical deferred)
- **Result:** Performance still decreased ❌
- **Reason:** Still delays some scripts, partial improvement but not enough

### Attempt 3: FC-119 (Session 0455)
- **Fix:** Move ALL scripts to end of `<body>` (non-blocking HTML parse)
- **Result:** Performance decreased 4-5% ❌
- **Reason:** Scripts execute even later than with defer

---

## Why Traditional Optimization Fails

**Content Sites (blogs, news):**
- Main content is HTML (text, images)
- Scripts are enhancements (navigation, ads)
- Delaying scripts improves FCP and LCP ✅

**App Sites (Fireside Capital):**
- Main content IS JavaScript (charts, tables)
- Scripts are not enhancements, they ARE the content
- Delaying scripts improves FCP but WORSENS LCP ❌

**Industry Best Practice:** "Defer scripts" assumes content-first, enhancement-second architecture.  
**Fireside Capital Reality:** Content IS JavaScript — traditional optimization doesn't apply.

---

## Solution: Fundamental Architecture Change Required

**Three attempts at delaying JavaScript ALL FAILED. We need a DIFFERENT approach:**

### Option 1: Async Instead of Defer (30 min, low risk)
- **Use `async` attribute** — Downloads in parallel but executes ASAP
- **How it works:** Browser downloads scripts without blocking HTML parse, executes immediately when ready
- **Difference from defer:** Executes AS SOON AS DOWNLOADED, not after DOM parsing
- **Expected:** FCP improves (non-blocking download), LCP no worse (fast execution)
- **Risk:** Script execution order not guaranteed (may break dependencies)

### Option 2: Pre-render Skeleton Loaders in HTML (2-3h, medium risk)
- **Add skeleton HTML** for charts and tables in HTML files
- **How it works:** LCP measured against skeleton HTML, not JS-rendered content
- **Expected:** FCP and LCP both improve (HTML content present immediately)
- **Risk:** More HTML to maintain, needs design work

### Option 3: Server-Side Rendering / Static Generation (4-8h, high complexity)
- **Pre-render charts/data on server or at build time**
- **Send HTML with charts already rendered**
- **Expected:** Massive FCP/LCP improvement (content is HTML)
- **Risk:** Requires major architecture change, stale data issues

### Option 4: Webpack Code Splitting (4-5h, medium complexity)
- **Split app.js into page-specific bundles**
- **Only load JavaScript needed for current page**
- **Expected:** Smaller bundle size → faster parse/execute
- **Risk:** Requires build system setup, testing

---

## Recommendation

**Stop trying to delay JavaScript execution. It doesn't work for our architecture.**

**Next Action:**
1. **Try Option 1: Async** (30 min quick win)
   - Replace scripts with `async` attribute
   - Test if execution order breaks anything
   - If successful: +2-4% performance without LCP regression

2. **If async fails: Escalate to founder**
   - **Diagnosis:** Traditional performance optimization doesn't work for JavaScript-first apps
   - **Options:** Pre-render skeletons (2-3h), Webpack (4-5h), SSR (4-8h)
   - **Decision:** Which architecture change to pursue?

---

## Anti-Loop Rule Applied

Per AGENTS.md Anti-Loop Rule:
> If a sub-agent fails to fix something TWICE:
> 1. STOP spawning agents for that task
> 2. Read the code yourself
> 3. Either fix it directly or escalate to the founder with a specific diagnosis
> 4. Never spawn a third agent for the same bug

**Status:** THIRD failed attempt completed. Must try fundamentally different approach OR escalate.

---

## Revert Details

- **Commit:** f932ff8
- **Reverted Files:** 9 HTML files (index, assets, bills, budget, debts, income, investments, reports, settings)
- **Restored to:** Commit 7831793 (pre-FC-119 state)
- **Deployment:** Azure CI/CD triggered, ETA 5-10 min

---

## Files Modified

- `app/index.html` — Scripts restored to mid-body position
- `app/assets.html` — Scripts restored to mid-body position
- `app/bills.html` — Scripts restored to mid-body position
- `app/budget.html` — Scripts restored to mid-body position
- `app/debts.html` — Scripts restored to mid-body position
- `app/income.html` — Scripts restored to mid-body position
- `app/investments.html` — Scripts restored to mid-body position
- `app/reports.html` — Scripts restored to mid-body position
- `app/settings.html` — Scripts restored to mid-body position

---

## Test Evidence

- `tests/lighthouse-dashboard-0515.json` — Dashboard: 64% performance
- `tests/lighthouse-assets-0515.json` — Assets: 67% performance

---

## Related

- BUG-PERF-002: Blanket defer regression (Session 0420)
- BUG-PERF-002-REGRESSION: Selective defer fix (Session 0435)
- BUG-PERF-003: Performance regression identified (Session 0440)
- FC-119: Move scripts to end of body (Session 0455)
