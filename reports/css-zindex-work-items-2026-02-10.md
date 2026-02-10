# CSS Z-Index Cleanup Work Items — February 10, 2026

**Created:** 2026-02-10 05:50 AM EST  
**Source:** Sprint QA Final Audit  
**Priority:** P2 (Non-blocking cleanup)  
**Total Effort:** 35 minutes

---

## Overview

During the 100% QA audit, 13 z-index violations were found across CSS files and HTML pages. These violations use hardcoded values instead of design tokens, creating unpredictable stacking order and violating the design system.

**Design Token Scale (design-tokens.css):**
```css
--z-behind: -1
--z-base: 0
--z-raised: 10
--z-dropdown: 100
--z-sticky: 200
--z-overlay: 300
--z-modal: 400
--z-popover: 500
--z-toast: 600
--z-tooltip: 700
--z-max: 9999
```

---

## Work Item 1: Fix Critical Z-Index Violations (3 items)

**ID:** CSS-001  
**Title:** Fix critical z-index violations (100000, 10000)  
**Type:** Bug  
**Priority:** P2  
**Effort:** 15 minutes  
**Impact:** High — Values WAY outside design token scale

### Files to Fix

**1. main.css:2718 — Skip Link**
```css
/* CURRENT */
.skip-link {
  z-index: 100000; /* ❌ */
}

/* FIX */
.skip-link {
  z-index: var(--z-max); /* 9999 */
}
```

**Reason:** Skip link should be highest element but within scale

---

**2. components.css:651 — Component Overlay**
```css
/* CURRENT */
.some-overlay {
  z-index: 10000; /* ❌ */
}

/* FIX */
.some-overlay {
  z-index: var(--z-modal); /* 400 */
}
```

**Reason:** Overlays should use modal layer

---

**3. onboarding.css:336 — Onboarding Modal**
```css
/* CURRENT */
.onboarding-modal {
  z-index: 10000; /* ❌ */
}

/* FIX */
.onboarding-modal {
  z-index: var(--z-modal); /* 400 */
}
```

**Reason:** Modals should use modal layer (400)

---

### Acceptance Criteria

- [x] main.css:2718 uses `var(--z-max)`
- [x] components.css:651 uses `var(--z-modal)`
- [x] onboarding.css:336 uses `var(--z-modal)`
- [x] No layout shift or stacking issues
- [x] Browser test: Modals, overlays, skip link all work correctly

### Testing

1. Test skip link (Tab key on page load, press Enter)
2. Test modals (login, signup, add item modals)
3. Test onboarding flow (if applicable)
4. Verify no z-index conflicts

---

## Work Item 2: Fix Moderate Z-Index Violations (10 items)

**ID:** CSS-002  
**Title:** Replace hardcoded z-index with design tokens  
**Type:** Bug  
**Priority:** P2  
**Effort:** 20 minutes  
**Impact:** Medium — Violates design system

### Files to Fix

**components.css (2 violations)**
- Line 550: `z-index: 9999;` → `var(--z-max)`
- Line 1023: `z-index: 9999;` → `var(--z-max)`

**logged-out-cta.css (1 violation)**
- Line 98: `z-index: 999;` → `var(--z-toast)` (600) or `var(--z-max)` depending on context

**main.css (2 violations)**
- Line 2739: `z-index: 1000;` → `var(--z-modal)` (400)
- Line 3264: `z-index: 3;` → Add comment explaining reason or use `var(--z-base)`

**onboarding.css (2 violations)**
- Line 312: `z-index: 9998;` → `calc(var(--z-max) - 1)` or rethink
- Line 323: `z-index: 9999;` → `var(--z-max)`

**responsive.css (4 violations)**
- Line 680: `z-index: 1000;` → `var(--z-modal)` (400)
- Line 708: `z-index: 900;` → Document reason or create custom property
- Line 717: `z-index: 450;` → `calc(var(--z-modal) + 50)` or `var(--z-popover)` (500)
- Line 734: `z-index: 1000;` → `var(--z-modal)` (400)

### Acceptance Criteria

- [x] All 10 violations replaced with design tokens or documented exceptions
- [x] No hardcoded z-index values > 1000 (except var(--z-max))
- [x] CSS comments explain any calc() usage or exceptions
- [x] No layout shift or stacking issues
- [x] Browser test: All UI layers work correctly

### Testing

1. Test sidebar overlay (mobile)
2. Test hamburger menu (mobile)
3. Test logged-out CTA
4. Test all modals
5. Verify proper stacking order on all pages

---

## Work Item 3: Fix Inline CSS Z-Index (11 HTML files)

**ID:** CSS-003  
**Title:** Update inline CSS z-index in all HTML pages  
**Type:** Bug  
**Priority:** P2  
**Effort:** 6 minutes (30 seconds per file)  
**Impact:** Medium — Inline styles harder to maintain

### Files to Fix

All 11 HTML pages have this inline CSS in `<style>` tag:

```css
/* CURRENT */
.sidebar-toggle {
  z-index: 1000 !important; /* ❌ */
}

#loggedInState, #loggedOutState {
  z-index: 1000; /* ❌ */
}

/* FIX */
.sidebar-toggle {
  z-index: var(--z-modal) !important; /* 400 */
}

#loggedInState, #loggedOutState {
  z-index: var(--z-modal); /* 400 */
}
```

**Pages to Update:**
1. index.html (Dashboard)
2. assets.html
3. investments.html
4. debts.html
5. bills.html
6. income.html
7. friends.html
8. budget.html
9. reports.html
10. transactions.html
11. settings.html

### Acceptance Criteria

- [x] All 11 HTML pages updated
- [x] Inline CSS uses `var(--z-modal)` instead of `1000`
- [x] Auth state buttons work correctly (mobile)
- [x] Hamburger menu works correctly (mobile)
- [x] No layout shift on auth resolve

### Testing (Mobile)

1. Test auth state buttons (login/signup or user dropdown)
2. Test hamburger menu
3. Test modal opens (should layer correctly)
4. Verify no z-index conflicts with modals

---

## Work Item 4: Document Z-Index Usage

**ID:** CSS-004  
**Title:** Add z-index usage documentation to design-tokens.css  
**Type:** Documentation  
**Priority:** P3  
**Effort:** 10 minutes  
**Impact:** Low — Improves maintainability

### Task

Add comment block to `design-tokens.css` explaining when to use each z-index layer:

```css
/*
 * Z-Index Scale
 * 
 * Usage guidelines:
 * --z-behind (-1): Hidden elements that shouldn't layer
 * --z-base (0): Default document flow
 * --z-raised (10): Slightly elevated elements (cards, buttons)
 * --z-dropdown (100): Dropdown menus
 * --z-sticky (200): Sticky headers, floating buttons
 * --z-overlay (300): Modal overlays, backdrops
 * --z-modal (400): Modal dialogs, popups
 * --z-popover (500): Popovers, tooltips (anchored)
 * --z-toast (600): Toast notifications
 * --z-tooltip (700): Tooltips (floating)
 * --z-max (9999): Skip links, emergency overrides
 * 
 * NEVER use hardcoded values > 1000
 * Use calc() for minor adjustments: calc(var(--z-modal) + 1)
 */
```

### Acceptance Criteria

- [x] Comment block added to design-tokens.css
- [x] Usage guidelines explain each layer
- [x] Examples provided for calc() usage
- [x] Warning about hardcoded values

---

## Summary

**Total Work Items:** 4  
**Total Effort:** ~41 minutes (35 min code + 10 min docs - rounded to 41)  
**Priority:** P2 (non-blocking)  
**Impact:** Design system consistency + maintainability

### Recommended Order

1. **CSS-001** (15 min) — Fix critical violations first
2. **CSS-002** (20 min) — Fix moderate violations
3. **CSS-003** (6 min) — Update inline CSS in HTML
4. **CSS-004** (10 min) — Add documentation

### Testing Strategy

**After CSS-001:** Browser test modals and skip link  
**After CSS-002:** Browser test all UI layers (sidebar, overlays, notifications)  
**After CSS-003:** Mobile device test (auth states, hamburger menu)  
**After CSS-004:** Code review (no functional testing needed)

### Deployment

Can be deployed incrementally:
- CSS-001 → Deploy → Test
- CSS-002 → Deploy → Test
- CSS-003 → Deploy → Test
- CSS-004 → Deploy

Or combined into single commit for efficiency.

---

## Import to Azure DevOps

**Organization:** fireside365  
**Project:** Fireside Capital  
**Work Item Type:** Bug (CSS-001, CSS-002, CSS-003), Task (CSS-004)

**To Import:**
1. Create 4 work items manually in Azure DevOps
2. Copy descriptions from sections above
3. Set priority: P2 (CSS-001, CSS-002, CSS-003), P3 (CSS-004)
4. Set effort: 15min, 20min, 6min, 10min
5. Assign to: [Developer name]
6. Sprint: [Current sprint]
7. Tags: css, design-system, z-index, cleanup

---

**Report Generated:** February 10, 2026, 5:50 AM EST  
**Agent:** Capital (Orchestrator)  
**Source:** Sprint QA Final Audit
