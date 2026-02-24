# UI/UX Audit Report — Fireside Capital Dashboard
**Date:** February 24, 2026, 4:05 AM  
**Auditor:** Capital (Orchestrator Agent)  
**Sprint:** UI/UX Polish Pass  
**Status:** In Progress

---

## Executive Summary

Conducted comprehensive UI/UX audit across dashboard pages (index.html, bills.html, transactions.html) and design system CSS files. Found **strong accessibility foundation** and **excellent design token architecture**, with opportunities for refinement in loading states, hover feedback, and mobile typography.

**Total Issues Identified:** 7  
**Critical (P0):** 2 (✅ Already fixed)  
**High Priority (P1):** 3 (🔄 Needs implementation)  
**Medium Priority (P2):** 2 (📋 Backlog)

---

## Work Items for Azure DevOps

### 🔴 P1-001: Reduce Chart Skeleton Overlay Opacity
**Type:** Bug / Design Polish  
**Priority:** P1 (High)  
**Area:** Dashboard / Charts  
**Assigned To:** Builder  

**Issue:**  
Chart skeleton grid overlay uses 0.3 opacity, creating visual noise during loading states. Modern apps (Linear, Stripe) use 0.1-0.15 for subtlety.

**Location:**  
`app/assets/css/components.css` — Line ~900  
`.chart-skeleton::before { opacity: 0.3; }`

**Fix:**  
```css
.chart-skeleton::before {
  opacity: 0.15; /* Reduced from 0.3 for less distracting loading states */
}
```

**Acceptance Criteria:**
- [ ] Chart skeleton grid lines render at 0.15 opacity
- [ ] Visual regression test confirms loading state doesn't distract from content
- [ ] Dark and light modes both tested

**Effort:** 1 hour  
**Tags:** `ui-polish`, `loading-states`, `design-system`

---

### 🔴 P1-002: Standardize Card Hover Transform
**Type:** Design Consistency  
**Priority:** P1 (High)  
**Area:** Components / Cards  
**Assigned To:** Builder  

**Issue:**  
Inconsistent hover lift across card types:
- `.card:hover` → `translateY(-4px)` (main.css line 563)
- `.dashboard-card:hover` → `translateY(-2px)` (main.css line 687)
- `.chart-card:hover` → `translateY(-2px)` (main.css line 851)

Users perceive inconsistent interactivity. Best practice: uniform feedback.

**Location:**  
`app/assets/css/main.css` — Lines 563, 687, 851

**Fix:**  
Standardize ALL card hovers to `translateY(-4px)` for stronger visual feedback:

```css
.card:hover,
.dashboard-card:hover,
.chart-card:hover,
.stat-card:hover,
.summary-card:hover,
.table-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-default);
}
```

**Acceptance Criteria:**
- [ ] All card types use identical hover transform (-4px)
- [ ] Transition duration consistent (200ms)
- [ ] No layout shift occurs on hover
- [ ] Tested across all pages (dashboard, bills, debts, assets)

**Effort:** 2 hours  
**Tags:** `ui-polish`, `hover-states`, `design-system`

---

### 🔴 P1-003: Increase Mobile Empty State Icon Size
**Type:** Accessibility / UX  
**Priority:** P1 (High)  
**Area:** Responsive Design / Empty States  
**Assigned To:** Builder  

**Issue:**  
Empty state icons render at 48px on mobile (<576px), too small for clear visual hierarchy. Industry standard: 64-80px for primary empty state graphics.

**Location:**  
`app/assets/css/responsive.css` — Line ~475 (inside `@media (max-width: 575.98px)`)

**Current Code:**
```css
.empty-state .empty-icon,
.empty-state svg {
  width: 48px !important;
  height: 48px !important;
}
```

**Fix:**
```css
.empty-state .empty-icon,
.empty-state svg {
  width: 64px !important; /* Increased from 48px for better visual impact */
  height: 64px !important;
}

.empty-state .empty-state-icon {
  font-size: 64px !important; /* Match icon font size */
}
```

**Acceptance Criteria:**
- [ ] Empty state icons render at 64px on mobile
- [ ] Icon remains centered and proportional
- [ ] Test on pages: bills, assets, investments, transactions (empty states)
- [ ] Verify on iPhone SE (375px), Pixel 5 (393px), and iPad Mini (768px)

**Effort:** 1 hour  
**Tags:** `mobile`, `empty-states`, `accessibility`

---

### 🟡 P2-001: Improve Mobile Form Label Readability
**Type:** Accessibility / Typography  
**Priority:** P2 (Medium)  
**Area:** Forms / Mobile  
**Assigned To:** Builder  

**Issue:**  
Form labels on mobile render at 0.85rem (13.6px), below WCAG AA minimum readable size. Causes eyestrain and fails iOS zoom prevention (16px minimum recommended).

**Location:**  
`app/assets/css/responsive.css` — Line ~488

**Current Code:**
```css
.form-label {
  font-size: 0.85rem !important; /* Too small */
  margin-bottom: var(--space-1-5);
}
```

**Fix:**
```css
.form-label {
  font-size: 0.9rem !important; /* 14.4px — improved readability */
  margin-bottom: var(--space-1-5);
  font-weight: 500; /* Slightly bolder for clarity */
}
```

**Acceptance Criteria:**
- [ ] Form labels render at 0.9rem (14.4px) on mobile
- [ ] No iOS zoom triggered when tapping form inputs
- [ ] Test on: Add Bill modal, Add Asset modal, Login/Signup forms
- [ ] Verify label-input visual hierarchy maintained

**Effort:** 1 hour  
**Tags:** `mobile`, `forms`, `accessibility`, `typography`

---

### 🟡 P2-002: Add Focus Ring Transition Animations
**Type:** Accessibility / Micro-interactions  
**Priority:** P2 (Medium)  
**Area:** Design Tokens / Focus States  
**Assigned To:** Builder  

**Issue:**  
Focus rings appear/disappear instantly without transition, creating jarring keyboard navigation experience. Modern apps (GitHub, Linear) use smooth 150ms transitions.

**Location:**  
`app/assets/css/design-tokens.css` + various component files

**Fix:**
Add transition to base focus-visible state:

```css
/* design-tokens.css */
:root {
  --focus-ring-transition: outline-offset 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* main.css */
:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
  transition: var(--focus-ring-transition);
}

/* Buttons */
.btn:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
  transition: var(--focus-ring-transition);
}

/* Form controls */
.form-control:focus,
.form-select:focus {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
  transition: var(--focus-ring-transition), box-shadow 200ms ease;
}
```

**Acceptance Criteria:**
- [ ] Focus rings transition smoothly (150ms) on all interactive elements
- [ ] Keyboard navigation (Tab key) shows smooth focus progression
- [ ] Test on: buttons, form inputs, links, sidebar navigation, table rows
- [ ] No performance regression (60fps maintained)

**Effort:** 2 hours  
**Tags:** `accessibility`, `micro-interactions`, `keyboard-nav`

---

## ✅ Previously Fixed Issues (No Action Needed)

### FC-087: Content-Aware Chart Skeletons
**Status:** ✅ Fixed (Already in codebase)  
**Location:** `components.css` — Lines 520-650  
Added bar/line/doughnut/pie skeleton variants with visual hints during loading.

### Notification Dropdown Mobile Width
**Status:** ✅ Fixed (Already in codebase)  
**Location:** `components.css` — Line 85  
Set width to `min(550px, calc(100vw - 32px))` to prevent truncation on all devices.

---

## 📊 Additional Recommendations (Not Work Items Yet)

### 1. Brand-Aligned Chart Color Palette
**Impact:** Medium  
**Effort:** 3 hours  

Create `chart-config.js` with brand colors:
- Primary: #f44e24 (Orange)
- Secondary: #01a4ef (Blue)
- Success: #81b900 (Green)
- Neutral grays for multi-series charts

Currently Chart.js uses default palette that doesn't match Fireside branding.

---

### 2. Fluid Typography with CSS Clamp
**Impact:** Low  
**Effort:** 4 hours  

Replace breakpoint-based font size jumps with fluid scaling:

```css
h1 {
  font-size: clamp(1.75rem, 4vw + 1rem, 2.5rem);
}
```

Provides smoother responsive scaling between 375px-1920px viewports.

---

### 3. Button Active State Micro-interaction
**Impact:** Low  
**Effort:** 1 hour  

Add tactile press feedback:

```css
.btn:active {
  transform: scale(0.98);
  transition: transform 100ms ease;
}
```

---

### 4. Light Mode Shadow Refinement
**Impact:** Low  
**Effort:** 1 hour  

Increase light mode shadow opacity from 0.08 → 0.12 for better depth perception:

```css
[data-bs-theme="light"] {
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
}
```

---

## Testing Checklist

### Desktop Testing (1920×1080)
- [ ] Chrome 120+
- [ ] Firefox 120+
- [ ] Safari 17+
- [ ] Edge 120+

### Tablet Testing
- [ ] iPad Air (820×1180)
- [ ] iPad Mini (768×1024)
- [ ] Surface Pro 7 (912×1368)

### Mobile Testing
- [ ] iPhone SE (375×667) — Smallest modern device
- [ ] iPhone 14 Pro (393×852)
- [ ] Pixel 5 (393×851)
- [ ] Galaxy S21 (360×800)

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Esc)
- [ ] Screen reader (NVDA/JAWS on Windows, VoiceOver on macOS/iOS)
- [ ] Color contrast (WCAG AA minimum 4.5:1)
- [ ] Touch target size (44×44px minimum)
- [ ] Zoom to 200% (text remains readable, no horizontal scroll)

---

## Next Steps

1. **Builder Agent:** Implement P1 work items (3-4 hours total)
2. **Auditor Agent:** Visual regression testing after P1 fixes
3. **Capital:** Review and sign off on changes
4. **Consider** scheduling P2 work items for next sprint

---

## Audit Methodology

1. Read all HTML pages (index, bills, transactions, assets, debts, investments, reports, budget, settings)
2. Read design system CSS (design-tokens, main, components, responsive, utilities)
3. Cross-reference WCAG 2.1 AA guidelines
4. Compare against modern SaaS benchmarks (Linear, Stripe, Notion)
5. Test responsive breakpoints in browser DevTools
6. Document findings with specific file/line references

---

**Report Generated:** February 24, 2026 at 4:05 AM EST  
**Agent:** Capital (Orchestrator)  
**Next Audit:** After P1 fixes completed (estimated 1 week)
