# UI/UX Audit: Dashboard (index.html)
**Date:** February 15, 2026, 5:25 AM  
**Auditor:** Architect  
**Page:** index.html (Dashboard)  
**Status:** Audit Complete — 7 Issues Identified

---

## Executive Summary
Conducted comprehensive UI/UX audit of the Dashboard page. Found 7 issues ranging from design system violations (HIGH priority) to performance optimizations (LOW priority). Most critical issue: excessive primary buttons violating stated design philosophy.

---

## Issues Identified

### 🚨 ISSUE 1: Design System Violation - Button Hierarchy [HIGH PRIORITY]
**Location:** Throughout index.html  
**Problem:** 12 `btn-primary` buttons on one page violates design philosophy:  
> "Flame Orange (#f44e24): PRIMARY actions - 1 per page max"

**Current State:**
- 12 btn-primary buttons across modals and onboarding
- Visual hierarchy is broken — users don't know what the main action is
- Orange (primary) is overused, reducing its impact

**Proposed Fix:**
1. **Main page:** Keep 1 primary button maximum (likely "Connect Bank" or "Get Started")
2. **Modals:** Primary buttons in modals are acceptable (Login/Signup/Reset Password)
3. **Onboarding flow:** Use btn-primary for forward progression, btn-outline-secondary for skip/back
4. **Dashboard cards:** Convert action buttons to btn-outline-secondary or btn-link

**Files to Update:**
- `app/index.html` — Update button classes
- Verify other pages follow same pattern

**Work Item:** User Story — [UX] Audit and Fix Button Hierarchy (Dashboard)

---

### ISSUE 2: Skeleton Loader Lacks Animation [MEDIUM PRIORITY]
**Location:** Stats cards (`.stat-card-skeleton`)  
**Problem:** Loading skeletons are static, providing no visual feedback that content is loading

**Current State:**
```html
<div class="stat-card-skeleton">
  <div class="skeleton-loader skeleton-value"></div>
  <div class="skeleton-loader skeleton-trend"></div>
</div>
```
No animation — looks frozen to users.

**Proposed Fix:**
Add shimmer animation to skeleton loaders:

```css
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

.skeleton-loader {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    var(--color-bg-2) 0%,
    var(--color-bg-3) 50%,
    var(--color-bg-2) 100%
  );
  background-size: 468px 100%;
}
```

**Files to Update:**
- `app/assets/css/components.css` — Add shimmer keyframes and animation

**Work Item:** Task — [UX] Add Shimmer Animation to Skeleton Loaders

---

### ISSUE 3: Excessive Script Tags (15+) [MEDIUM PRIORITY]
**Location:** Bottom of `index.html`  
**Problem:** 15+ individual script tags create:
- Multiple HTTP requests (slower page load)
- Potential race conditions between scripts
- Higher latency on slower connections

**Current State:**
```html
<script src="assets/js/csrf.js"></script>
<script src="assets/js/security-utils.js"></script>
<script src="assets/js/session-security.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/event-handlers.js"></script>
<script src="assets/js/charts.js"></script>
<script src="assets/js/rate-limiter.js" defer></script>
<script src="assets/js/rate-limit-db.js" defer></script>
<script src="assets/js/polish-utilities.js" defer></script>
<script src="assets/js/notification-enhancements.js" defer></script>
<script src="assets/js/security-patch.js" defer></script>
<script src="assets/js/app-polish-enhancements.js" defer></script>
<script src="assets/js/plaid.js" defer></script>
<script src="assets/js/subscriptions.js" defer></script>
<script src="assets/js/onboarding.js" defer></script>
<script src="assets/js/tour.js" defer></script>
```

**Proposed Fix:**
1. **Bundle deferred scripts** into `app-bundle.js`:
   - rate-limiter.js, rate-limit-db.js, polish-utilities.js
   - notification-enhancements.js, security-patch.js, app-polish-enhancements.js
   - subscriptions.js, onboarding.js, tour.js
   
2. **Keep separate (execution order critical):**
   - csrf.js, security-utils.js, session-security.js, app.js, event-handlers.js, charts.js
   - plaid.js (lazy-loaded conditionally)

3. **Use build process** (Webpack/Rollup/esbuild) or manual concatenation

**Expected Impact:**
- Reduce from 16 requests → 8 requests
- Faster page load (fewer DNS lookups, TCP handshakes)
- Easier maintenance

**Files to Update:**
- Create `scripts/bundle-scripts.ps1` to concatenate non-critical scripts
- Update `app/index.html` to reference bundled file
- Repeat for other HTML pages

**Work Item:** Task — [Performance] Bundle Non-Critical Scripts

---

### ISSUE 4: Password Reset Modal Traps Users [MEDIUM PRIORITY]
**Location:** `#resetPasswordModal` (line ~970)  
**Problem:** Static backdrop prevents closing modal — users could be stuck if error occurs

**Current State:**
```html
<div class="modal fade" id="resetPasswordModal" 
     data-bs-backdrop="static" 
     data-bs-keyboard="false">
```

**Risk Scenario:**
1. User triggers password reset flow
2. Error occurs (network failure, invalid token)
3. User cannot close modal (static backdrop + keyboard disabled)
4. User is trapped, must reload page

**Proposed Fix:**
**Option A (Recommended):** Add Cancel button
```html
<div class="modal-footer">
  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="submit" class="btn btn-primary" id="resetPasswordBtn">Update Password</button>
</div>
```

**Option B:** Make backdrop dismissible
```html
<div class="modal fade" id="resetPasswordModal" 
     data-bs-backdrop="true" 
     data-bs-keyboard="true">
```

**Files to Update:**
- `app/index.html` — Add Cancel button to resetPasswordModal

**Work Item:** Bug — [UX] Password Reset Modal Traps Users with Static Backdrop

---

### ISSUE 5: Font Weight Optimization [LOW PRIORITY]
**Location:** Google Fonts link (line 23)  
**Problem:** Loading `Inter:400,600,700` but design tokens only use 600 and 700

**Current State:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

**Design Tokens:**
```css
--weight-semibold: 600;
--weight-bold: 700;
```
No reference to weight 400 (regular).

**Proposed Fix:**
Remove weight 400 from Inter:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

**Expected Impact:**
- Saves ~15KB font download
- Slightly faster first paint

**Files to Update:**
- `app/index.html` (and all other HTML pages if they use same font import)

**Work Item:** Task — [Performance] Remove Unused Font Weight (Inter 400)

---

### ISSUE 6: Inline Critical CSS Too Long [LOW PRIORITY]
**Location:** `<style>` tag in `<head>` (lines 44-76)  
**Problem:** 30+ lines of inline CSS makes HTML harder to maintain

**Current State:**
```html
<style>
  /* Critical inline CSS: prevent auth flash and layout shift on page load */
  @media (max-width: 991.98px) {
    .sidebar-toggle { ... }
    #loggedInState, #loggedOutState { ... }
    body.auth-resolved #loggedInState:not(.d-none) { ... }
  }
</style>
```

**Proposed Fix:**
1. Extract to `app/assets/css/critical.css`
2. Inline via build process (or keep as separate file with preload)
3. Reduces HTML size, improves maintainability

**Note:** This is LOW priority because inline critical CSS is a performance best practice. Issue is more about maintenance than functionality.

**Files to Update:**
- Create `app/assets/css/critical.css`
- Update `app/index.html` to inline or preload

**Work Item:** Task — [Refactor] Extract Inline Critical CSS

---

### ISSUE 7: Welcome Button Spacing on Mobile [LOW PRIORITY]
**Location:** Auth buttons (`#loggedInState`, `#loggedOutState`)  
**Problem:** Fixed positioning might overlap with hamburger on very small screens (<360px width)

**Current State:**
```css
@media (max-width: 991.98px) {
  .sidebar-toggle {
    position: fixed !important;
    top: max(12px, env(safe-area-inset-top)) !important;
    left: 16px !important;
  }
  
  #loggedInState, #loggedOutState {
    position: fixed !important;
    top: max(12px, env(safe-area-inset-top)) !important;
    right: 16px;
  }
}
```

**Risk:** On screens narrower than ~360px, buttons might squeeze hamburger and auth state.

**Proposed Fix:**
Add breakpoint for very small screens:
```css
@media (max-width: 359.98px) {
  .sidebar-toggle {
    top: max(8px, env(safe-area-inset-top)) !important;
    left: 8px !important;
    width: 40px;
    height: 40px;
  }
  
  #loggedInState, #loggedOutState {
    right: 8px;
  }
}
```

**Files to Update:**
- `app/index.html` inline `<style>` or `app/assets/css/responsive.css`

**Work Item:** Task — [UX] Improve Mobile Spacing on Very Small Screens (<360px)

---

## Recommendations

### Immediate Actions (This Sprint)
1. ✅ Fix ISSUE 1 (Button Hierarchy) — HIGH PRIORITY — Design system violation
2. ✅ Fix ISSUE 4 (Modal Trap) — MEDIUM PRIORITY — User could be stuck
3. ✅ Fix ISSUE 2 (Skeleton Animation) — MEDIUM PRIORITY — Perceived performance

### Next Sprint
4. Fix ISSUE 3 (Script Bundling) — MEDIUM PRIORITY — Real performance gain
5. Fix ISSUE 5 (Font Optimization) — LOW PRIORITY — Small performance gain

### Backlog (Low Priority)
6. Fix ISSUE 6 (Extract Critical CSS) — Maintainability
7. Fix ISSUE 7 (Mobile Spacing) — Edge case, affects <5% of users

---

## Next Audit Target
**Page:** `assets.html` (Assets page)  
**Estimated Issues:** Similar button hierarchy issues likely present

---

## Azure DevOps Work Items (To Be Created)

Unable to create work items automatically (Azure CLI not configured). Please create manually:

### User Stories
1. **[UX] Audit and Fix Button Hierarchy (Dashboard)**
   - Area: UI/UX
   - Priority: 1 (High)
   - Description: See ISSUE 1 above
   - Acceptance Criteria:
     - Max 1 btn-primary on main dashboard page (excluding modals)
     - Modals can use btn-primary for forward actions
     - All other actions use btn-outline-secondary or btn-link

### Tasks
2. **[UX] Add Shimmer Animation to Skeleton Loaders**
   - Area: UI/UX
   - Priority: 2 (Medium)
   - Parent: N/A
   
3. **[Performance] Bundle Non-Critical Scripts**
   - Area: Performance
   - Priority: 2 (Medium)
   - Parent: N/A
   
4. **[UX] Password Reset Modal Traps Users with Static Backdrop**
   - Area: UI/UX
   - Priority: 2 (Medium)
   - Type: Bug
   
5. **[Performance] Remove Unused Font Weight (Inter 400)**
   - Area: Performance
   - Priority: 3 (Low)
   
6. **[Refactor] Extract Inline Critical CSS**
   - Area: Code Quality
   - Priority: 3 (Low)
   
7. **[UX] Improve Mobile Spacing on Very Small Screens**
   - Area: UI/UX
   - Priority: 3 (Low)

---

**Audit Complete**  
**Next Sprint Check:** Review `assets.html` for similar issues
