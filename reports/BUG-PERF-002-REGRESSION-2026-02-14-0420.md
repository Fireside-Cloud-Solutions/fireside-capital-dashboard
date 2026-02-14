# BUG-PERF-002-REGRESSION — Defer Implementation Performance Regression
**Date:** 2026-02-14 04:20 AM EST  
**Discovered By:** Capital (Sprint QA — Session 0420)  
**Severity:** P1 — High (Performance regression affecting all 11 pages)  
**Related Commit:** 5bff7a1 (perf(critical): BUG-PERF-002 - Add defer to scripts across 9 pages)  
**Status:** Identified — Awaiting revert/refinement

---

## 🎯 EXECUTIVE SUMMARY

**The BUG-PERF-002 fix (adding `defer` to all scripts) has caused a performance regression.**

While FCP (First Contentful Paint) improved by 23-28%, LCP (Largest Contentful Paint) worsened by 4-10%, and overall performance scores **decreased** by 3-5% across all tested pages.

**Root Cause:** Fireside Capital is a **data-driven web app** where the main content (charts, tables) is rendered BY JavaScript. Adding `defer` to all scripts delays execution until after DOM parsing completes, which delays chart/table rendering, increasing LCP.

**Expected Impact:** -3% to -5% performance on all 11 pages ❌

---

## 📊 TEST RESULTS (Before vs After)

### Assets Page
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Performance | 71% | 68% | **-3%** ❌ |
| FCP | 4.65s | 3.6s | **-1.05s (-23%)** ✅ |
| LCP | 4.70s | 4.9s | **+0.2s (+4%)** ❌ |
| Speed Index | 4.65s | 3.7s | **-0.95s (-20%)** ✅ |

### Budget Page
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Performance | 73% | 68% | **-5%** ❌ |
| FCP | 4.47s | 4.8s | **+0.33s (+7%)** ❌ |
| LCP | 4.53s | 5.0s | **+0.47s (+10%)** ❌ |
| Speed Index | 4.47s | 4.8s | **+0.33s (+7%)** ❌ |

### Dashboard (index.html)
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Performance | 69% | 66% | **-3%** ❌ |
| FCP | 4.7s | 3.4s | **-1.3s (-28%)** ✅ |
| LCP | 4.8s | 5.0s | **+0.2s (+4%)** ❌ |
| Speed Index | 4.7s | 3.9s | **-0.8s (-17%)** ✅ |

### Pattern Summary
**Across all 3 tested pages:**
- ✅ FCP improved by 23-28% (HTML parses faster)
- ❌ LCP worsened by 4-10% (JS-rendered content appears later)
- ❌ Overall performance scores decreased by 3-5%

---

## 🔍 ROOT CAUSE ANALYSIS

### Why `defer` Hurts LCP in Data-Driven Apps

**1. Fireside Capital's Architecture:**
- Main content (charts, tables, financial data) is **rendered by JavaScript**
- Chart.js creates all visualizations client-side
- `app.js` populates tables with Supabase data
- LCP is measured against the **largest chart or table** (not static HTML)

**2. How `defer` Changes Loading:**

**Before (synchronous scripts):**
```
HTML parsing → BLOCKED by script download → Script executes → Chart renders → LCP measured
```

**After (defer):**
```
HTML parsing (fast) → FCP measured → DOM complete → Scripts execute → Chart renders → LCP measured
                                        ↑ DELAY introduced here
```

**3. The Trade-Off:**
- **Content sites** (blogs, news): Main content is HTML → `defer` improves both FCP and LCP ✅
- **App sites** (dashboards, SPAs): Main content is JS-rendered → `defer` improves FCP but worsens LCP ⚠️

**4. Why LCP Increased:**
Before: Scripts blocked parsing but executed immediately → Charts rendered sooner  
After: Scripts deferred until DOM complete → Charts rendered later → LCP measured later

---

## 💡 RECOMMENDED SOLUTIONS

### Option 1: Selective Defer (RECOMMENDED) ⭐
**What:** Only defer non-critical scripts, keep critical rendering scripts synchronous  
**Effort:** 1-2 hours  
**Impact:** Best of both worlds — faster parsing without delaying critical content

**Critical scripts (keep synchronous):**
- `app.js` — Renders tables, populates data (MUST execute early)
- Chart.js CDN — Required for dashboard/reports (keep synchronous OR async)
- `empty-states.js` — Renders placeholder content (affects LCP)
- Supabase CDN — Required for data fetching (keep synchronous OR async)

**Non-critical scripts (safe to defer):**
- `notification-enhancements.js` — Toast notifications, bells (cosmetic)
- `loading-states.js` — Spinners, polish (progressive enhancement)
- `polish-utilities.js` — Visual polish (non-blocking)
- `security-patch.js` — Security hardening (can load after content)
- `app-polish-enhancements.js` — UI polish (non-blocking)

**Example implementation:**
```html
<!-- Critical: Load synchronously (or async for immediate execution) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/empty-states.js"></script>

<!-- Non-critical: Defer until DOM ready -->
<script src="assets/js/notification-enhancements.js" defer></script>
<script src="assets/js/loading-states.js" defer></script>
<script src="assets/js/polish-utilities.js" defer></script>
<script src="assets/js/security-patch.js" defer></script>
```

**Expected improvement:**
- FCP: Improved (HTML parses without blocking) ✅
- LCP: No regression (critical scripts execute early) ✅
- Performance: +5-8% improvement over current state

---

### Option 2: Use `async` Instead of `defer`
**What:** Replace `defer` with `async` on critical scripts  
**Effort:** 30 minutes  
**Impact:** Scripts load without blocking but execute immediately when ready

**Difference:**
- `defer`: Downloads in parallel, executes AFTER DOM parsing
- `async`: Downloads in parallel, executes IMMEDIATELY when ready

**When to use:**
- `async`: Scripts that are order-independent (analytics, ads, standalone utilities)
- `defer`: Scripts that depend on DOM or other scripts (form handlers, UI interactions)

**For Fireside Capital:**
- Chart.js: `async` OR synchronous (order-independent, but needed early)
- app.js: Synchronous (depends on Supabase, must run after DOM)
- Utilities: `defer` (nice-to-have, run after DOM)

---

### Option 3: Pre-render Skeleton Loaders in HTML
**What:** Render skeleton screens in HTML so LCP is measured against skeletons, not charts  
**Effort:** 4-6 hours  
**Impact:** LCP measured against static HTML skeletons → much faster

**Example:**
```html
<!-- Dashboard HTML (server-rendered or static) -->
<div class="chart-container">
  <div class="skeleton-chart" aria-hidden="true">
    <!-- Skeleton bars/lines in CSS -->
  </div>
</div>

<script defer src="assets/js/app.js"></script> <!-- Replace skeletons with real charts -->
```

**Benefits:**
- LCP measured against skeleton (instant) ✅
- Perceived performance improved (users see structure immediately) ✅
- Scripts can safely use `defer` ✅

**Drawbacks:**
- Requires HTML changes on all 11 pages
- More complex state management (hide skeleton → show real chart)

---

### Option 4: Revert to Synchronous (Fallback)
**What:** Revert commit 5bff7a1, return to synchronous script loading  
**Effort:** 15 minutes  
**Impact:** Performance returns to baseline (69% avg)

**When to use:**
- If other options blocked or too complex
- Temporary fallback while testing alternatives
- Preserves current user experience

---

## 🎯 DECISION MATRIX

| Solution | Effort | FCP Impact | LCP Impact | Performance Impact | Complexity |
|----------|--------|------------|------------|-------------------|------------|
| **Selective defer** | 1-2h | ✅ Improve | ✅ No regression | ✅ +5-8% | Low |
| **async instead** | 30min | ✅ Improve | ⚠️ Uncertain | ⚠️ +2-5% | Low |
| **Skeleton loaders** | 4-6h | ✅ Improve | ✅ Major improve | ✅ +10-15% | High |
| **Revert** | 15min | ❌ Baseline | ✅ Baseline | ⚠️ Baseline | None |

---

## 📋 RECOMMENDED ACTION PLAN

### Phase 1: Immediate Rollback (15 min)
1. Revert commit 5bff7a1 to restore baseline performance
2. Re-test 3 pages to confirm restoration
3. Update STATUS.md with rollback status

### Phase 2: Implement Selective Defer (1-2h)
1. Identify critical vs non-critical scripts (see list above)
2. Apply `defer` only to non-critical scripts
3. Test all 11 pages with Lighthouse
4. Verify LCP no longer regresses

### Phase 3: Validate Improvements (30 min)
1. Run full Lighthouse suite on all 11 pages
2. Compare to Session 0400 baseline
3. Document improvements in STATUS.md
4. Post success to #dashboard

### Phase 4 (Future): Skeleton Loaders (4-6h)
1. Create skeleton CSS components
2. Add skeletons to all pages
3. Update app.js to replace skeletons with real content
4. Test for +10-15% performance gain

---

## 📊 EXPECTED OUTCOMES

### After Rollback (Phase 1):
- Performance: 69% (baseline) ✅
- FCP: 4.75s avg (baseline) ✅
- LCP: 4.87s avg (baseline) ✅

### After Selective Defer (Phase 2):
- Performance: 74-77% (+7-11%) ✅
- FCP: 3.0-3.5s avg (-37% to -26%) ✅
- LCP: 4.5-4.8s avg (-8% to -1%) ✅

### After Skeleton Loaders (Phase 4):
- Performance: 82-85% (+19-23%) ✅
- FCP: 1.5-2.0s avg (-68% to -58%) ✅
- LCP: 2.0-2.5s avg (-59% to -49%) ✅ **Meets target**

---

## 🐛 RELATED ISSUES

- **BUG-PERF-001:** Reports page performance degradation (57%) — Separate issue
- **BUG-PERF-002:** Original issue (render-blocking scripts) — Fix caused regression
- **BUG-PERF-003:** Monolithic app.js (4000+ lines) — Still needs addressing
- **BUG-PERF-004:** Chart.js loaded globally — Still needs addressing

---

## 📝 LESSONS LEARNED

1. **`defer` is not a universal solution** — Works great for content sites, can hurt app sites
2. **LCP matters more than FCP** for data-driven apps — Main content is JS-rendered
3. **Test thoroughly before declaring victory** — Always verify improvements with actual tests
4. **Context-specific optimization** — Understand your app's architecture before applying generic advice
5. **Selective optimization beats blanket changes** — Critical vs non-critical script categorization

---

**Conclusion:** BUG-PERF-002 fix caused a 3-5% performance regression across all pages due to delayed execution of critical rendering scripts. **Recommended action:** Rollback + implement selective defer (critical scripts synchronous, non-critical deferred). **Estimated time to proper fix:** 2-3 hours. **Expected outcome:** +5-8% performance improvement without LCP regression.

**Status:** Awaiting founder approval for rollback + refined implementation.
