# Global Issues — Action Plan
**Date:** February 4, 2026, 2:05 PM EST  
**Status:** STOP PAGE-BY-PAGE AUDITS — FIX SYSTEMICALLY

---

## The Problem

The UI/UX audit cron job has been running page-by-page audits and finding **THE SAME 5 ISSUES ON EVERY SINGLE PAGE**. This is inefficient and frustrating.

**Pages Audited So Far:**
1. Dashboard (index.html)
2. Transactions (transactions.html)
3. Friends (friends.html)
4. Budget (budget.html)
5. Assets (assets.html)
6. Bills (bills.html)

**Result:** 40+ individual issue tickets (FC-039 through FC-084) that are mostly duplicates across pages.

---

## The 5 Global Issues (Found on EVERY Page)

### 1. **Inline Event Handlers** (Security/CSP Violation)
**Severity:** HIGH  
**Pages Affected:** ALL 11 pages  
**Issue IDs:** FC-046, FC-052, FC-055, FC-060, FC-061, FC-070, FC-077

**Examples:**
```html
<button onclick="deleteBill()">Delete</button>
<a href="#" onclick="openPlaidLink()">Connect Account</a>
<button onclick="markAllNotificationsRead()">Mark All Read</button>
```

**Why It's a Problem:**
- Requires `unsafe-inline` in Content Security Policy (security risk)
- Makes code harder to maintain (event handlers scattered across HTML)
- Violates modern JavaScript best practices

**Global Fix:**
1. Remove ALL `onclick` attributes from HTML
2. Add IDs or data attributes to elements that need event binding
3. Centralize event binding in JavaScript files using `addEventListener`
4. Update CSP headers to disallow `unsafe-inline`

**Estimated Time:** 6-8 hours (all 11 pages)  
**Priority:** HIGH

---

### 2. **Missing Touch Targets** (Accessibility/WCAG 2.5.5)
**Severity:** MEDIUM  
**Pages Affected:** ALL 11 pages  
**Issue IDs:** FC-061, FC-071, FC-078, FC-081, FC-082

**Examples:**
```html
<!-- Too small on mobile -->
<button class="btn btn-sm btn-outline-secondary">Filter</button>
<button class="btn btn-secondary">Add Item</button>
```

**Why It's a Problem:**
- WCAG 2.5.5 requires 44x44px minimum touch targets
- Small buttons are frustrating on mobile devices
- Users with motor impairments struggle with small targets

**Global Fix:**
1. Add `.btn-touch-target` class to ALL action buttons
2. Remove `.btn-sm` from filter buttons and similar interactive elements
3. Ensure modal buttons meet 44px minimum

**Estimated Time:** 2-3 hours (search/replace + manual verification)  
**Priority:** MEDIUM

---

### 3. **Missing Loading States** (UX Polish)
**Severity:** MEDIUM  
**Pages Affected:** ALL 11 pages (except Email Review Modal — good example)  
**Issue IDs:** FC-056, FC-057, FC-063, FC-073, FC-080

**Examples:**
- Dashboard: No loading state while charts render
- Assets: No spinner while fetching data
- Bills: No indication during Supabase queries

**Why It's a Problem:**
- Blank screens feel slower than they are
- Users don't know if the app is working or frozen
- Industry standard (Mint, YNAB, Personal Capital all have loading states)

**Global Fix:**
1. Create a reusable loading state component
2. Add `<div id="loadingState">` to each page
3. Show spinner during data fetch, hide when complete
4. Use skeleton loaders for table content (already exists in loading-states.js)

**Estimated Time:** 4-5 hours (implement pattern, apply to 11 pages)  
**Priority:** MEDIUM

---

### 4. **Missing Empty States** (UX Polish)
**Severity:** MEDIUM  
**Pages Affected:** ALL data-driven pages (10/11 pages)  
**Issue IDs:** FC-056, FC-064, FC-072, FC-079

**Examples:**
- Bills table: Shows blank table when user has no bills
- Assets: Empty table header with no content
- Budget: No guidance for first-time users

**Why It's a Problem:**
- Confusing for first-time users (looks like a bug)
- Missed opportunity to guide users to add data
- Industry standard (modern apps use illustrated empty states with CTAs)

**Global Fix:**
1. Use existing `empty-states.js` utility
2. Add empty state markup to each table/container
3. Include clear CTAs ("Add Your First Bill", etc.)
4. Use Bootstrap Icons for visual interest

**Estimated Time:** 3-4 hours (leverage existing utility, apply to 10 pages)  
**Priority:** MEDIUM

---

### 5. **Notification Badge Always Shows "0"** (Visual Clutter)
**Severity:** LOW  
**Pages Affected:** ALL 11 pages  
**Issue IDs:** FC-083 (and likely on other pages)

**Examples:**
```html
<span class="badge rounded-pill bg-danger d-none" id="notificationBadge">0</span>
```

**Why It's a Problem:**
- Showing "0" is noisy and unnecessary
- Best practice: hide badges when count is 0
- Industry standard (Gmail, Slack, Discord all hide zero badges)

**Global Fix:**
1. Verify `notification-enhancements.js` hides badge when count is 0 (logic already exists)
2. Test on all pages to ensure it's working correctly
3. If broken, fix the JS logic once

**Estimated Time:** 30 minutes (verify + fix if needed)  
**Priority:** LOW

---

## Recommended Execution Plan

### Phase 1: Stop the Audit Spam (NOW)
1. ⏸️ **PAUSE** the UI/UX audit cron job
2. ✅ **CLOSE** duplicate issue tickets (FC-039 through FC-084)
3. ✅ **CREATE** 5 consolidated GitHub issues (one per global problem)
4. ✅ **PRIORITIZE** the 5 issues (High → Medium → Low)

**Time:** 30 minutes  
**Action:** Capital updates cron config, creates GitHub issues

---

### Phase 2: Global Fixes (Priority Order)

#### **Sprint 1: Touch Targets** (2-3 hours)
**What:** Add `.btn-touch-target` to all buttons, remove `.btn-sm` from filters  
**Why:** Quick win, immediate UX improvement  
**How:** Search/replace + manual verification  
**Assignee:** Builder

#### **Sprint 2: Loading States** (4-5 hours)
**What:** Implement loading spinners/skeletons on all 11 pages  
**Why:** Improves perceived performance  
**How:** Use existing `loading-states.js` utility  
**Assignee:** Builder

#### **Sprint 3: Empty States** (3-4 hours)
**What:** Add empty state markup with CTAs to all data tables  
**Why:** Better first-run experience  
**How:** Use existing `empty-states.js` utility  
**Assignee:** Builder

#### **Sprint 4: Inline Event Handlers** (6-8 hours)
**What:** Remove all `onclick` attributes, centralize event binding  
**Why:** Security (CSP) + maintainability  
**How:** Systematic refactor, one page at a time  
**Assignee:** Builder + Auditor (security review)

#### **Sprint 5: Notification Badge** (30 minutes)
**What:** Verify/fix badge hiding logic  
**Why:** Polish  
**How:** Test + fix if broken  
**Assignee:** Builder

---

### Phase 3: Verification (2 hours)
1. ✅ **Manual QA** on all 11 pages (browser testing)
2. ✅ **Lighthouse audit** (performance/accessibility scores)
3. ✅ **Mobile testing** (iOS Safari, Android Chrome)
4. ✅ **Accessibility audit** (keyboard navigation, screen readers)

**Assignee:** Auditor

---

## Estimated Total Time

| Sprint | Task | Time |
|--------|------|------|
| 1 | Touch Targets | 2-3 hours |
| 2 | Loading States | 4-5 hours |
| 3 | Empty States | 3-4 hours |
| 4 | Inline Handlers | 6-8 hours |
| 5 | Badge Logic | 30 min |
| **Verification** | Manual QA + testing | 2 hours |
| **TOTAL** | **5 sprints** | **18-22 hours** |

**Timeline:** 3-4 days (with focus, could be 2-3 days)

---

## Why This Approach Is Better

### Old Approach (What We've Been Doing)
- ❌ Audit page-by-page → Generate 40+ duplicate tickets
- ❌ Fix issues one page at a time → Slow, repetitive
- ❌ Miss opportunities for shared utilities
- ❌ High risk of inconsistency across pages

### New Approach (This Plan)
- ✅ Identify patterns once → Create 5 consolidated issues
- ✅ Fix globally with shared utilities → Fast, consistent
- ✅ Leverage existing code (`empty-states.js`, `loading-states.js`)
- ✅ Single QA pass at the end → Efficient

---

## Immediate Actions

### For Capital (Orchestrator)
1. **Stop** the UI/UX audit cron job immediately
2. **Create** 5 GitHub issues (one per global problem)
3. **Prioritize** in BACKLOG.md (P1 High → P2 Medium → P3 Low)
4. **Spawn** Builder with this action plan

### For Builder (Next Agent)
1. **Read** this action plan
2. **Start** with Sprint 1 (Touch Targets)
3. **Test** on live site using browser automation
4. **Report** progress after each sprint

---

## Success Criteria

After completing all 5 sprints:
- ✅ ALL buttons meet 44px touch target minimum
- ✅ ALL pages show loading states during data fetch
- ✅ ALL empty tables have illustrated empty states with CTAs
- ✅ ZERO inline event handlers (`onclick` attributes)
- ✅ Notification badges hide when count is 0
- ✅ Lighthouse accessibility score: 95+
- ✅ No new bugs introduced (verified via manual QA)

---

**Created:** February 4, 2026, 2:05 PM EST  
**Author:** Capital (Orchestrator)  
**Next Action:** Spawn Builder with Sprint 1 task
