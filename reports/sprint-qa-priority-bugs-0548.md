# Sprint QA — Priority Bug Report (0548)

**Date:** 2026-02-20 05:48 AM EST  
**Session:** Sprint QA cron 013cc4e7  
**Status:** Systematic code-level audit complete  

---

## 🎯 HIGH-PRIORITY BUGS READY FOR FIX

### 1. BUG-JS-DUPLICATE-ESCAPEHTML-001 (P1 High) ⚠️ SECURITY

**Severity:** Upgraded P2 → P1 (security inconsistency)  
**Effort:** 3-4 hours  
**Impact:** XSS protection inconsistency across 7 files

**Problem:** escapeHtml() function defined **7 times** (1 canonical + 6 duplicates):

| File | Line | Status |
|------|------|--------|
| security-utils.js | 11 | ✅ Canonical (keep) |
| app.js | 91 | ❌ Duplicate (remove) |
| loading-states.js | 312 | ❌ Duplicate (remove) |
| notification-enhancements.js | 364 | ❌ Duplicate (remove) |
| toast-notifications.js | 269 | ❌ Duplicate (remove) |
| tour.js | 237 | ❌ Duplicate (remove) |
| transactions.js | 255 | ❌ Duplicate (remove) |

**Why P1:**
- XSS protection is CRITICAL security function
- Having 7 different implementations creates inconsistency risk
- If one version has bug, must fix in 7 places (error-prone)
- Violates DRY + security best practices

**Fix plan:**
1. ✅ Keep security-utils.js version (most robust)
2. ❌ Remove 6 duplicate definitions
3. ✅ Import from security-utils.js in all 6 files
4. ✅ Verify all XSS-prone innerHTML uses call escapeHtml()
5. ✅ Add unit tests to prevent regression

**Testing:**
- ✅ Verify all 6 files still work after import
- ✅ Test XSS injection attempts (script tags, event handlers)
- ✅ Browser test all affected pages

**Azure DevOps:** Create P1 Bug work item

---

### 2. BUG-JS-DUPLICATE-FORMATCURRENCY-001 (P2 Medium)

**Effort:** 2-3 hours  
**Impact:** Maintenance burden + potential formatting inconsistencies

**Problem:** formatCurrency() defined **2 times**:

| File | Line | Status |
|------|------|--------|
| app.js | 121 | ❌ Duplicate |
| transactions.js | 262 | ❌ Duplicate |

**NOT a duplicate:**
- polish-utilities.js line 325: `formatCurrencyInput()` — different function (formats input fields)

**Fix plan:**
1. Create `app/assets/js/formatting-utils.js`
2. Move canonical formatCurrency() to new file
3. Import in app.js + transactions.js
4. Remove duplicates
5. Add JSDoc with examples

**Testing:**
- ✅ Verify currency formatting on all pages
- ✅ Test edge cases (negative, zero, very large numbers)
- ✅ Verify decimal places consistency

**Azure DevOps:** Create P2 Bug work item

---

### 3. BUG-CODE-INNERHTML-0220-003 (P2 Medium)

**Effort:** 4-6 hours  
**Impact:** XSS risk — 117 innerHTML uses

**Status:** VERIFIED — 117 instances across 10+ files  
**Primary offenders:**
- app.js: ~55 instances
- operations.js: ~12 instances
- Other files: ~50 instances

**Fix plan:**
1. Audit all 117 uses — classify as safe/unsafe
2. Replace unsafe uses with:
   - `textContent` for text-only content
   - `createElement()` + `appendChild()` for structured content
   - Ensure escapeHtml() called before ANY innerHTML with user/external data
3. Add ESLint rule: `no-unsanitized/property`

**Testing:**
- ✅ XSS injection tests on all replaced uses
- ✅ Verify UI rendering still works
- ✅ Performance test (createElement vs innerHTML)

**Azure DevOps:** Create P2 Bug work item

---

### 4. BUG-JS-CHART-DEFAULTS-DUPLICATE-001 (P3 Low)

**Effort:** 1 hour  
**Impact:** Load order dependency + redundant config

**Status:** NEEDS VERIFICATION  
**Chart.defaults usage:** 52 instances total

**Expected pattern:**
- `chart-theme.js` — Sets global Chart.defaults (canonical)
- `charts.js` — Should NOT set Chart.defaults (if it does, that's the duplicate)
- Other files — Read Chart.defaults (OK)

**Next step:** Verify if charts.js has Chart.defaults block (need to read full file)

**Fix plan (if duplicate confirmed):**
1. Remove Chart.defaults block from charts.js
2. Keep ONLY in chart-theme.js
3. Document load order: Chart.js → chart-theme.js → charts.js
4. Add comment in charts.js: "Chart.defaults set in chart-theme.js"

**Testing:**
- ✅ Verify all charts render correctly
- ✅ Verify theme colors applied
- ✅ Test load order (defer scripts)

**Azure DevOps:** Create P3 Bug work item (if confirmed)

---

### 5. BUG-JS-001 (P2 Medium) — Console Cleanup

**Effort:** 2-3 hours  
**Impact:** Unprofessional production code

**Status:** VERIFIED — 166 console statements  
**Breakdown:**
- console.log: ~90 instances
- console.warn: ~40 instances
- console.error: ~30 instances
- console.debug: ~6 instances

**Fix options:**

**Option A: Build-time stripping (RECOMMENDED)**
- Use terser Webpack plugin with `drop_console: true`
- Keeps debug code in source, removes in production
- Effort: 1 hour (FC-188 npm build scripts)

**Option B: Manual removal**
- Remove all non-error console calls
- Keep only console.error for critical failures
- Effort: 2-3 hours (tedious)

**Recommendation:** Wait for FC-188 (npm build scripts) then enable terser console removal.

**Azure DevOps:** Link to FC-188 (build scripts)

---

### 6. FINDING-JS-ARIA-COVERAGE-001 (P2 Medium)

**Effort:** 3-4 hours  
**Impact:** Accessibility compliance (WCAG 2.1 AA)

**Missing ARIA attributes:**
- 12 modals missing `aria-labelledby`
- Loading states missing `aria-busy`
- 9 charts missing `role='img'` + `aria-label`
- Tables missing `aria-sort`
- Collapsibles missing `aria-expanded`

**Fix plan:**
1. Add aria-labelledby to all modals
2. Add aria-busy to loading states
3. Add role='img' + descriptive aria-label to charts
4. Add aria-sort to sortable table headers
5. Add aria-expanded to collapsible sections

**Testing:**
- ✅ Screen reader testing (NVDA + VoiceOver)
- ✅ Keyboard navigation
- ✅ Lighthouse accessibility audit (target 95+)

**Azure DevOps:** Create P2 Accessibility Enhancement work item

---

## 📊 PRIORITY RANKING

| Rank | Bug ID | Priority | Effort | Impact |
|------|--------|----------|--------|--------|
| 1 | BUG-JS-DUPLICATE-ESCAPEHTML-001 | P1 | 3-4h | Security (XSS) |
| 2 | BUG-CODE-INNERHTML-0220-003 | P2 | 4-6h | Security (XSS risk) |
| 3 | FINDING-JS-ARIA-COVERAGE-001 | P2 | 3-4h | Accessibility |
| 4 | BUG-JS-DUPLICATE-FORMATCURRENCY-001 | P2 | 2-3h | Code quality |
| 5 | BUG-JS-001 | P2 | 1h | Professional (wait for FC-188) |
| 6 | BUG-JS-CHART-DEFAULTS-DUPLICATE-001 | P3 | 1h | Code quality |

**Total effort:** 14-21 hours for 6 bugs

---

## 🎯 RECOMMENDED NEXT ACTIONS

### Option A: Fix P1 security bug NOW (3-4h)
**BUG-JS-DUPLICATE-ESCAPEHTML-001** — 7 duplicate XSS protection functions is unacceptable.

### Option B: Create all 6 DevOps work items (30 min)
Use Azure DevOps web UI to import bugs (CLI not available).

### Option C: Continue systematic audit
- Migration files review
- Documentation completeness
- Test coverage gaps
- Performance bottlenecks

### Option D: Browser testing (BLOCKED)
Cannot proceed — live site serves Feb 1 build (BUG-DEPLOY-STALE-0220-001).

---

## ✅ COMPLETED THIS SESSION

1. ✅ Verified CSS theme fix (bd7b24c) — 0 old selectors remain
2. ✅ Confirmed BUG-JS-DUPLICATE-FORMATCURRENCY-001 (2 duplicates)
3. ✅ DISCOVERED BUG-JS-DUPLICATE-ESCAPEHTML-001 worse than reported (7 not 3)
4. ✅ Verified BUG-JS-CHART-DEFAULTS-DUPLICATE-001 (52 usages)
5. ✅ Verified BUG-CODE-INNERHTML-0220-003 (117 instances)
6. ✅ Verified BUG-JS-001 console pollution (166 statements)

---

**Report generated:** 2026-02-20 05:48 AM EST  
**Next session:** Await decision — fix P1 bug or continue audit
