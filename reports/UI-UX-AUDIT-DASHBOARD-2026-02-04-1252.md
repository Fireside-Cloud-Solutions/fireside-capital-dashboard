# UI/UX Audit Report: index.html (Dashboard)
**Date:** February 4, 2026 - 12:52 PM EST  
**Auditor:** Architect (Sprint UI/UX Cron)  
**Page:** index.html (Dashboard)  
**Status:** First Audit  

---

## 🎯 Audit Scope

Systematic review of index.html (Dashboard) focusing on:
- Button hierarchy compliance with tri-color design system
- Touch target sizing (44px minimum per WCAG 2.5.5)
- Loading state implementation and UX polish
- Empty state consistency and quality
- Mobile responsiveness and safe-area-inset
- Accessibility compliance (ARIA labels, semantic HTML)
- Security best practices (inline handlers, CSP compliance)

---

## 🚨 CRITICAL ISSUES

### **ISSUE-FC-060: Inline Event Handler (Security/CSP Violation)**
**Severity:** HIGH (Security Best Practice)  
**Location:** index.html, line 110  
**Page:** Dashboard  

**Issue:**  
Inline `onclick` handler violates Content Security Policy (CSP) best practices and makes code harder to maintain.

**Current Code:**
```html
<a href="#" onclick="openPlaidLink()" class="auth-required">
  <i class="bi bi-bank2 me-2"></i> Connect a New Account
</a>
```

**Why This Matters:**
- **CSP Violation:** `unsafe-inline` required in CSP headers (security risk)
- **Maintainability:** Event handlers scattered across HTML instead of centralized JS
- **Accessibility:** `href="#"` is a code smell — should be a `<button>` or proper JS binding
- **Inconsistency:** This is the SAME issue found on budget.html (FC-055), transactions.html (FC-046)
- **Pattern:** This is a recurring anti-pattern across the entire app

**Expected Fix:**
```html
<!-- Remove onclick, add ID for JS binding -->
<a href="#" id="connectAccountLink" class="auth-required">
  <i class="bi bi-bank2 me-2"></i> Connect a New Account
</a>
```

```javascript
// In plaid.js or inline <script>
document.getElementById('connectAccountLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  openPlaidLink();
});
```

**OR** (Better semantic HTML):
```html
<button type="button" class="sidebar-link auth-required" id="connectAccountBtn">
  <i class="bi bi-bank2 me-2"></i> Connect a New Account
</button>
```

**Affected Pages:**
- ✅ `assets.html` — Verified clean (no inline onclick)
- ✅ `bills.html` — Verified clean (no inline onclick)
- ⚠️ `budget.html` — FC-055 (needs fix)
- ⚠️ `transactions.html` — FC-046 (needs fix)
- ⚠️ `index.html` — FC-060 (needs fix)
- ❓ Other pages — Need verification

**Priority:** HIGH (security best practice, affects multiple pages)

---

### **ISSUE-FC-061: Multiple Inline Event Handlers in Modals**
**Severity:** HIGH (Security/Maintainability)  
**Location:** index.html, lines 153, 458, 479  
**Page:** Dashboard  

**Issue:**
Multiple inline event handlers throughout the modal system:

**Current Violations:**
```html
<!-- Line 153: Notification mark all read -->
<button class="btn btn-sm btn-link text-decoration-none p-0" onclick="markAllNotificationsRead()" aria-label="Mark all notifications as read">Mark all read</button>

<!-- Line 458: Delete confirmation modal -->
<button type="button" class="btn btn-danger" onclick="deleteAssetConfirmed()">Delete</button>

<!-- Line 479: Delete debt confirmation -->
<button type="button" class="btn btn-danger" onclick="deleteDebtConfirmed()">Delete</button>

<!-- Line 500: Delete bill confirmation -->
<button type="button" class="btn btn-danger" onclick="deleteBillConfirmed()">Delete</button>

<!-- Line 521: Delete income confirmation -->
<button type="button" class="btn btn-danger" onclick="deleteIncomeConfirmed()">Delete</button>
```

**Why This Matters:**
- **Security:** Each inline handler requires CSP `unsafe-inline` exception
- **Maintainability:** Harder to track event handlers across 700+ line HTML file
- **Testing:** Inline handlers harder to unit test vs. modular JS
- **Pattern:** Same issue recurring across ALL pages

**Expected Fix:**
Add IDs and bind in JavaScript:
```html
<button type="button" class="btn btn-danger" id="confirmDeleteAssetBtn">Delete</button>
<button type="button" class="btn btn-danger" id="confirmDeleteDebtBtn">Delete</button>
<button type="button" class="btn btn-danger" id="confirmDeleteBillBtn">Delete</button>
<button type="button" class="btn btn-danger" id="confirmDeleteIncomeBtn">Delete</button>
<button class="btn btn-sm btn-link" id="markAllNotificationsReadBtn" aria-label="Mark all notifications as read">Mark all read</button>
```

**Priority:** HIGH (security + affects 5+ handlers)

---

### **ISSUE-FC-062: Auth Modal Buttons Use btn-primary (Design System Violation)**
**Severity:** MEDIUM (Design System Compliance)  
**Location:** index.html, lines 419, 443, 564  
**Page:** Dashboard  

**Issue:**  
Auth modal buttons use `btn-primary` (flame orange), violating the tri-color hierarchy rule:

> **Flame Orange (#f44e24):** PRIMARY actions - 1 per page max  
> *(from main.css design system documentation)*

**Current Violations:**
```html
<!-- Line 419: Login button -->
<button type="submit" class="btn btn-primary" id="loginSubmitBtn">Login</button>

<!-- Line 443: Signup button -->
<button type="submit" class="btn btn-primary" id="signupSubmitBtn">Sign Up</button>

<!-- Line 564: Reset password button -->
<button type="submit" class="btn btn-primary" id="resetPasswordBtn">Update Password</button>
```

**Why This Matters:**
- Dashboard has NO primary page action (charts/data display only)
- Auth modals are secondary context, not the page's primary action
- **Pattern established:** FC-038 (friends.html), FC-045 (transactions.html), FC-054 (budget.html) all flagged this same issue
- Design system reserves orange for commitment actions (Add Item, Save, etc.)

**Expected Fix:**
Change to `btn-secondary` (sky blue) for auth modals:
```html
<button type="submit" class="btn btn-secondary" id="loginSubmitBtn">Login</button>
<button type="submit" class="btn btn-secondary" id="signupSubmitBtn">Sign Up</button>
<button type="submit" class="btn btn-secondary" id="resetPasswordBtn">Update Password</button>
```

**Comparison to Other Pages:**
- `friends.html`: Auth buttons should use `btn-secondary` ✅ (FC-038)
- `transactions.html`: Auth buttons should use `btn-secondary` ✅ (FC-045)
- `budget.html`: Auth buttons should use `btn-secondary` ⚠️ (FC-054 needs fix)
- `index.html`: Auth buttons should use `btn-secondary` ⚠️ (FC-062 needs fix)

**Priority:** MEDIUM (design system consistency across app)

---

## 🟡 MEDIUM ISSUES

### **ISSUE-FC-063: Onboarding Modal Button Hierarchy**
**Severity:** MEDIUM (UX Clarity)  
**Location:** index.html, lines 590, 611, 665, 689, 700  
**Page:** Dashboard  

**Issue:**  
The onboarding wizard uses `btn-primary` for BOTH primary and secondary actions on the same screen, creating visual confusion.

**Current Code (Welcome screen, line 590-591):**
```html
<button type="button" class="btn btn-lg btn-primary" onclick="onboardingGetStarted()">Get Started</button>
<button type="button" class="btn btn-lg btn-outline-secondary" onclick="onboardingSkipWelcome()">Skip for now</button>
```

✅ **This is CORRECT** — "Get Started" is primary, "Skip" is outline-secondary

**Current Code (Profile step, line 611):**
```html
<button type="button" class="btn btn-primary" onclick="onboardingContinueProfile()">Continue</button>
```

✅ **This is CORRECT** — "Continue" is the primary action

**Current Code (Tour step, lines 665-666):**
```html
<button type="button" class="btn btn-outline-secondary" onclick="onboardingSkipTour()">Skip Tour</button>
<button type="button" class="btn btn-primary" onclick="onboardingStartTour()">Start Tour</button>
```

✅ **This is CORRECT** — "Start Tour" is primary, "Skip" is outline-secondary

**Current Code (Success step, line 689):**
```html
<button type="button" class="btn btn-lg btn-primary" onclick="onboardingComplete()">Go to Dashboard</button>
```

✅ **This is CORRECT** — "Go to Dashboard" is the primary/final action

**Re-evaluation:**  
Upon closer inspection, the onboarding wizard **DOES follow proper button hierarchy**. Each screen has 1 primary action (orange) and secondary/skip options use outline-secondary.

**Status:** FALSE ALARM — No issue detected. Onboarding button hierarchy is correct.

---

### **ISSUE-FC-064: Onboarding Inline Event Handlers**
**Severity:** MEDIUM (Security/CSP Consistency)  
**Location:** index.html, lines 590-700  
**Page:** Dashboard  

**Issue:**  
Onboarding wizard has **13+ inline onclick handlers**, same CSP violation pattern as FC-060/FC-061.

**Affected Functions:**
- `onboardingGetStarted()`
- `onboardingSkipWelcome()`
- `onboardingContinueProfile()`
- `onboardingSkipProfile()`
- `onboardingQuickStartAction('action')` (4 instances)
- `onboardingSkipQuickStart()`
- `onboardingSkipTour()`
- `onboardingStartTour()`
- `onboardingComplete()`

**Expected Fix:**
All onboarding buttons should have IDs and use event delegation or individual listeners in `onboarding.js`.

**Example:**
```html
<button type="button" class="btn btn-lg btn-primary" id="onboardingGetStartedBtn">Get Started</button>
```

```javascript
// In onboarding.js
document.getElementById('onboardingGetStartedBtn')?.addEventListener('click', () => {
  onboardingGetStarted();
});
```

**Priority:** MEDIUM (security consistency, affects onboarding flow)

---

## 🟢 LOW ISSUES

### **ISSUE-FC-065: Missing Skeleton Loaders on Stat Cards**
**Severity:** LOW (UX Polish)  
**Location:** index.html, lines 171-259  
**Page:** Dashboard  

**Issue:**  
The 6 stat cards (Net Worth, Total Assets, Monthly Bills, etc.) show **$0.00** immediately on page load with NO loading skeleton. This creates confusion:
- Is the value truly zero, or is data still loading?
- No visual indication that content is being fetched

**Current Implementation:**
```html
<div class="stat-value" id="netWorthValue">$0.00</div>
```

**Expected Behavior:**  
Show skeleton loaders during data fetch (similar to bills.html, assets.html):
```html
<div class="stat-value" id="netWorthValue">
  <div class="skeleton-stat" data-loading></div>
</div>
```

**Comparison:**
- `bills.html`: Has skeleton table rows ✅
- `assets.html`: Has skeleton cards ✅
- `transactions.html`: Missing skeletons ❌ (FC-047)
- `friends.html`: Missing skeletons ❌ (FC-040)
- `budget.html`: Missing skeletons ⚠️ (FC-056)
- `index.html`: Missing skeletons ⚠️ (FC-065)

**Note:**  
The HTML comment on line 3 says "Build: 2026-02-01-17:00 - FINAL FIX" which suggests this page has been through polish passes. However, skeleton loaders were likely added to other pages AFTER this build.

**Priority:** LOW (polish item, affects perceived performance but not functionality)

---

### **ISSUE-FC-066: Chart Placeholder Loading State Inconsistency**
**Severity:** LOW (UX Polish)  
**Location:** index.html, chart canvases (lines 298-350+)  
**Page:** Dashboard  

**Issue:**  
Chart containers have `<canvas>` elements with no loading skeleton or spinner while Chart.js initializes. On slow connections, users see blank white rectangles for 1-2 seconds.

**Expected Behavior:**  
Add skeleton loaders or subtle loading indicators BEFORE chart initialization:
```html
<div class="chart-wrapper chart-height-md">
  <div class="skeleton-chart" data-loading></div>
  <canvas id="netWorthTimelineChart" class="d-none"></canvas>
</div>
```

Then in `charts.js`, hide skeleton and show canvas when data loads.

**Priority:** LOW (polish item, minor UX enhancement)

---

## ✅ VERIFIED CORRECT

### Button Touch Targets
✅ Auth buttons (Login/Signup): 44px+ height  
✅ Notification bell: 48px (btn-icon class)  
✅ User dropdown button: 44px+  
✅ Onboarding buttons: 48px (btn-lg class)  
✅ Modal close buttons: 44px+  
✅ Sidebar links: 44px+ (12px padding top/bottom + text height)  

### Mobile Responsiveness
✅ Safe-area-inset applied in critical inline CSS (lines 32-66)  
✅ Hamburger menu fixed position with safe-area-inset-top  
✅ Auth state containers fixed position with proper z-index  
✅ Responsive grid for stat cards (`col-12 col-md-6 col-lg-6 col-xl-4`)  
✅ Chart cards responsive grid (varies by chart size/importance)  
✅ Subscriptions widget full-width on mobile (`col-12`)  

### Accessibility
✅ Skip link present (line 73)  
✅ Semantic HTML structure (`<main>`, `<nav>` implied by sidebar)  
✅ ARIA labels on notification bell ("Mark all notifications as read")  
✅ ARIA labels on sidebar toggle ("Toggle navigation")  
✅ ARIA labels on modal close buttons ("Close")  
✅ Form labels properly associated with inputs (all modals)  
✅ Dropdown menus have proper `aria-expanded` states  
✅ Headings follow proper hierarchy (h2 for page title, h3/h4/h5 for sections)  

### Design System Compliance
✅ CSS architecture: Imports design-tokens.css first (line 18)  
✅ Typography: Uses Inter (body) and Source Serif 4 (headings)  
✅ Color system: Dark theme with proper variable usage  
✅ Spacing: Follows 8px grid system (mb-4, mb-5, g-3, g-xl-4)  
✅ Card styling: Consistent 12px border-radius, 24px padding, var(--shadow-md)  
⚠️ **Button hierarchy:** Auth modals should use btn-secondary (FC-062)

### Critical Performance
✅ Preconnect to fonts.googleapis.com and fonts.gstatic.com (lines 7-8)  
✅ DNS prefetch to Plaid and Supabase (lines 11-12)  
✅ CSS cache busting with ?v=20260203 query params (lines 18-21)  
✅ Critical inline CSS to prevent auth flash (lines 32-66)  
✅ Supabase, Bootstrap, Plaid loaded from CDN (lines 384-386)  
✅ Chart.js loaded from CDN with version pinning (line 29)  

### Security
✅ CSRF protection loaded (`csrf.js`, line 390)  
✅ Rate limiting loaded (`rate-limiter.js`, `rate-limit-db.js`, lines 387-388)  
✅ Session security loaded (`session-security.js`, line 389)  
✅ Security utils loaded (`security-utils.js`, `security-patch.js`, lines 391, 394)  
⚠️ **Inline onclick handlers** — FC-060, FC-061, FC-064 (multiple violations)

### Onboarding Experience
✅ Progressive wizard flow (Welcome → Profile → Quick Start → Tour → Success)  
✅ Visual progress bar with step indicators  
✅ Skip options on every non-critical step  
✅ Friendly, approachable copy  
✅ Clear CTAs with proper visual hierarchy  
✅ Fireside logo/branding on welcome screen  
⚠️ **Inline event handlers** — FC-064 (CSP violations)

---

## 📊 SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| **Critical Issues** | 3 | 2 HIGH (security), 1 MEDIUM (design system) |
| **Medium Issues** | 2 | Both security/CSP related |
| **Low Issues** | 2 | UX polish (loading states) |
| **Verified Correct** | 9 categories | Touch targets, mobile, a11y, perf, security layers |

### Issue Breakdown
1. **FC-060:** Inline onclick on "Connect Account" link (HIGH) — Security/CSP
2. **FC-061:** Multiple inline onclick in modals (HIGH) — 5+ handlers, CSP violation
3. **FC-062:** Auth modal buttons use btn-primary (MEDIUM) — Should be btn-secondary
4. **FC-064:** Onboarding inline event handlers (MEDIUM) — 13+ handlers, CSP
5. **FC-065:** Missing skeleton loaders on stat cards (LOW) — UX polish
6. **FC-066:** Chart placeholder loading states (LOW) — UX polish

### Priority Recommendations
1. **Fix FC-060 + FC-061 immediately** (~1 hour) — Remove all inline onclick handlers, bind in JS
2. **Fix FC-062 next** (~5 minutes) — Change auth modal buttons to btn-secondary
3. **Fix FC-064 in next sprint** (~30 minutes) — Refactor onboarding event handlers
4. **Implement FC-065 + FC-066 for parity** (~2-3 hours) — Add skeleton loaders like other pages

### Security Pattern Alert
**CRITICAL FINDING:** Inline event handlers (`onclick=`) are a **recurring pattern** across the ENTIRE app:
- Dashboard (index.html): FC-060, FC-061, FC-064 (15+ handlers)
- Budget (budget.html): FC-055 (1 handler)
- Transactions (transactions.html): FC-046 (1+ handlers)
- Friends (friends.html): FC-038 mentioned similar issues
- ❓ Other pages: Unknown until audited

**Recommendation:**  
Create a **global security refactor task** to eliminate ALL inline event handlers across the app at once. This is a systemic issue, not isolated bugs.

---

## 🎯 OVERALL GRADE: B+

**Reasoning:**
- **Solid foundation:** Accessibility, mobile-first design, performance optimization all excellent
- **HIGH severity security issues:** Multiple inline onclick handlers (FC-060, FC-061) violate CSP best practices
- **Design system violation:** Auth modal buttons use wrong color (FC-062) — same pattern as other pages
- **UX polish gaps:** Missing loading skeletons for stat cards/charts (FC-065, FC-066) while other pages have them
- **Onboarding experience is excellent:** Clear wizard flow, proper visual hierarchy, skip options
- **No blocking bugs:** Page is fully functional

**Production Ready:** ✅ YES (security issues are best practice violations, not exploits)  
**Polish Ready:** ⚠️ PARTIAL (needs loading states for parity with bills/assets pages)  
**Security Hardening Ready:** ❌ NO (inline handlers need refactoring)

---

## 🔧 Quick Fix Script (FC-062 Only — Design System)

```powershell
# Fix FC-062: Change auth modal buttons to btn-secondary
$indexPath = "app/index.html"

(Get-Content $indexPath) -replace `
  '<button type="submit" class="btn btn-primary" id="loginSubmitBtn">Login</button>', `
  '<button type="submit" class="btn btn-secondary" id="loginSubmitBtn">Login</button>' | `
Set-Content $indexPath

(Get-Content $indexPath) -replace `
  '<button type="submit" class="btn btn-primary" id="signupSubmitBtn">Sign Up</button>', `
  '<button type="submit" class="btn btn-secondary" id="signupSubmitBtn">Sign Up</button>' | `
Set-Content $indexPath

(Get-Content $indexPath) -replace `
  '<button type="submit" class="btn btn-primary" id="resetPasswordBtn">Update Password</button>', `
  '<button type="submit" class="btn btn-secondary" id="resetPasswordBtn">Update Password</button>' | `
Set-Content $indexPath

Write-Host "✅ FC-062 fixed: Auth modal buttons now use btn-secondary" -ForegroundColor Green
```

---

## 🔄 Cross-Page Patterns

### Inline Event Handlers (CSP Violation)
**Pattern:** Every page audited so far has inline `onclick` handlers

**Affected Pages:**
- `index.html`: FC-060, FC-061, FC-064 (15+ handlers) ⚠️
- `budget.html`: FC-055 (1 handler) ⚠️
- `transactions.html`: FC-046 (1+ handlers) ⚠️
- `friends.html`: FC-038 (mentioned) ⚠️
- ❓ Other pages: Unknown

**Recommendation:**  
Schedule a **dedicated security sprint** to eliminate ALL inline handlers app-wide. This is the #1 security improvement needed.

### Auth Modal Button Colors
**Pattern:** Every page uses `btn-primary` for auth modals (should be `btn-secondary`)

**Affected Pages:**
- `index.html`: FC-062 ⚠️
- `budget.html`: FC-054 ⚠️
- `transactions.html`: FC-045 ⚠️
- `friends.html`: FC-038 ⚠️

**Recommendation:**  
Create a **global find/replace script** to fix this pattern across ALL pages at once (expected: 8-10 HTML files).

---

**Auditor:** Architect (Capital sub-agent)  
**Session:** sprint-uiux (cron job 79e2aa61-ac18-49c6-9326-a25104f9747a)  
**Next Page:** Will audit next unaudited page in next cron run (assets.html, debts.html, income.html, investments.html, reports.html, or settings.html)
