# UI/UX Audit Report — Fireside Capital Dashboard

**Audit Date:** Monday, February 23, 2026, 5:51 AM  
**Auditor:** Architect (Capital AI)  
**Scope:** Dashboard (index.html) — Session 1 of 12  
**Design System:** Fireside 365 Logo-Native (design-tokens.css v2.0)

---

## Executive Summary

The Fireside Capital dashboard demonstrates strong foundational design with a comprehensive token system, proper dark/light mode support, and responsive layouts. However, several accessibility gaps, mobile UX issues, and consistency problems require immediate attention to meet WCAG 2.1 AA standards and improve user experience.

### Priority Breakdown
- **CRITICAL (2)**: Typography hierarchy, stat card accessibility
- **HIGH (2)**: Mobile notification width, theme toggle persistence
- **MEDIUM (3)**: Empty states, form validation, mobile touch targets
- **LOW (3)**: Chart contrast, onboarding escape hatch, button sizing

---

## 1. CRITICAL ISSUES

### Issue #1: Typography Hierarchy Inconsistency
**Category:** Accessibility, SEO, Visual Design  
**Location:** Page header (line 372), stat cards (lines 423-534), chart cards  
**Priority:** CRITICAL

**Problem:**
- Page titles inconsistently use h1 (40px) vs h2 (32px)
- Stat card labels use plain `<span>` instead of semantic headings
- Chart card titles are h5 (18px) but should be h2 or h3 for hierarchy
- Screen readers can't properly navigate page structure

**Current Code:**
```html
<div class="page-header">
  <h1>Dashboard</h1>  <!-- Good -->
</div>

<div class="stat-card">
  <span class="stat-label">Net Worth</span>  <!-- BAD: Not semantic -->
  <div class="stat-value">$0.00</div>        <!-- BAD: No ARIA -->
</div>

<div class="chart-card">
  <h5>Net Worth Over Time</h5>  <!-- BAD: Should be h2 or h3 -->
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 1.3.1 (Info and Relationships) and 2.4.6 (Headings and Labels)
- **SEO:** Search engines can't properly parse page structure
- **Screen Readers:** Navigation landmarks broken, users can't skim content
- **Visual Confusion:** Hierarchy unclear for low-vision users

**Recommended Fix:**
```html
<!-- Page Header -->
<div class="page-header">
  <h1>Dashboard</h1>
</div>

<!-- Stat Cards -->
<div class="stat-card">
  <h2 class="stat-label">Net Worth</h2>  <!-- Semantic heading -->
  <div class="stat-value" role="status" aria-live="polite" aria-label="Current net worth">
    <span class="currency-symbol">$</span>
    <span class="currency-value">250,430.50</span>
  </div>
</div>

<!-- Chart Cards -->
<div class="chart-card">
  <h2>Net Worth Over Time</h2>  <!-- Proper hierarchy -->
</div>
```

**CSS Adjustments Needed:**
```css
/* Maintain visual appearance while using semantic markup */
.stat-card h2.stat-label {
  font-size: 0.875rem;  /* 14px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.chart-card h2 {
  font-size: 1.125rem;  /* 18px — keep existing visual size */
  font-weight: 600;
  margin-bottom: 1rem;
}
```

**Effort:** 2 hours  
**Risk:** LOW (CSS-only changes, no logic affected)

---

### Issue #2: Stat Card Value Accessibility
**Category:** Accessibility (WCAG 2.1)  
**Location:** `.stat-value` divs (lines 434-445, 469-474, 503-507, 537-542)  
**Priority:** CRITICAL

**Problem:**
- Financial values lack ARIA labels and semantic structure
- Screen readers announce "$250,430.50" as "dollar two five zero comma four three zero..."
- No indication when values update (no live regions)
- Trend indicators (▲ +5.2%) lack proper context

**Current Code:**
```html
<div class="stat-value d-none" id="netWorthValue">$0.00</div>
<div class="stat-trend d-none" id="netWorthTrend">
  <span class="trend-indicator">?</span>
</div>
```

**Impact:**
- **WCAG 2.1:** Fails 1.3.1 (Info and Relationships) and 4.1.3 (Status Messages)
- **Screen Readers:** Values announced incorrectly, trends meaningless
- **Voice Control:** "Click net worth value" won't work
- **Low Vision:** Trend colors alone insufficient (need text)

**Recommended Fix:**
```html
<div 
  class="stat-value" 
  id="netWorthValue" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  aria-label="Current net worth"
>
  <span class="visually-hidden">Current value: </span>
  <span class="currency-value" aria-label="250,430 dollars and 50 cents">
    $250,430.50
  </span>
</div>

<div 
  class="stat-trend" 
  id="netWorthTrend" 
  role="status" 
  aria-live="polite"
>
  <span 
    class="trend-indicator trend-up" 
    aria-label="Increased by 5.2% from previous period"
  >
    <i class="bi bi-arrow-up" aria-hidden="true"></i>
    <span>+5.2%</span>
  </span>
</div>
```

**JavaScript Enhancement:**
```javascript
function updateStatCard(cardId, value, trend) {
  const valueEl = document.getElementById(`${cardId}Value`);
  const trendEl = document.getElementById(`${cardId}Trend`);
  
  // Update value with proper ARIA
  valueEl.innerHTML = `
    <span class="visually-hidden">Current value: </span>
    <span class="currency-value" aria-label="${formatCurrencyForScreenReader(value)}">
      ${formatCurrency(value)}
    </span>
  `;
  
  // Update trend with context
  const trendDirection = trend > 0 ? 'up' : 'down';
  const trendText = trend > 0 ? 'Increased' : 'Decreased';
  trendEl.innerHTML = `
    <span 
      class="trend-indicator trend-${trendDirection}" 
      aria-label="${trendText} by ${Math.abs(trend)}% from previous period"
    >
      <i class="bi bi-arrow-${trendDirection}" aria-hidden="true"></i>
      <span>${trend > 0 ? '+' : ''}${trend}%</span>
    </span>
  `;
}

function formatCurrencyForScreenReader(value) {
  const dollars = Math.floor(value);
  const cents = Math.round((value % 1) * 100);
  return `${dollars.toLocaleString()} dollars and ${cents} cents`;
}
```

**Effort:** 4 hours  
**Risk:** MEDIUM (requires JS updates, QA testing needed)

---

## 2. HIGH PRIORITY ISSUES

### Issue #3: Mobile Notification Dropdown Width
**Category:** Mobile UX, Responsive Design  
**Location:** `components.css` line 78 (approx.)  
**Priority:** HIGH

**Problem:**
- Fixed `width: 550px` breaks layout on screens < 600px
- Causes horizontal scroll on iPhone SE, Galaxy Fold, small Android devices
- `max-width: calc(100vw - 32px)` fallback not respected by all browsers

**Current Code:**
```css
#notificationList,
.dropdown-menu-wide {
  width: 550px !important;
  max-width: calc(100vw - 32px) !important;
}
```

**Impact:**
- **Mobile UX:** Dropdown extends off-screen, requires horizontal scroll
- **Touch Targets:** Users can't reach "Mark all read" button on right side
- **Visual Glitch:** Dropdown arrow misaligned with bell icon

**Recommended Fix:**
```css
#notificationList,
.dropdown-menu-wide {
  width: min(550px, calc(100vw - 32px)) !important;
  max-width: 100vw !important;
  left: auto !important;  /* Override Bootstrap positioning */
  right: 0 !important;    /* Align to right edge */
}

/* Ensure proper mobile behavior */
@media (max-width: 600px) {
  #notificationList,
  .dropdown-menu-wide {
    width: calc(100vw - 16px) !important;
    margin: 0 8px;
    right: 8px !important;
  }
}
```

**Test Cases:**
1. iPhone SE (375px width)
2. Galaxy Fold (280px width)
3. iPad Mini portrait (768px width)
4. Desktop (1920px width)

**Effort:** 1 hour  
**Risk:** LOW (CSS-only, no JS changes)

---

### Issue #4: Theme Toggle Persistence Failure
**Category:** UX, Data Persistence  
**Location:** Sidebar theme toggle (line 391), `app.js` theme handler  
**Priority:** HIGH

**Problem:**
- Theme preference only saves on `window.beforeunload` event
- If browser crashes, tab closes unexpectedly, or mobile app terminates, preference is lost
- Users frustrated by repeated theme changes

**Current Code (app.js):**
```javascript
themeSwitch.addEventListener('change', function() {
  const newTheme = this.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  // No immediate save! Only on page unload.
});

window.addEventListener('beforeunload', function() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  localStorage.setItem('theme', currentTheme);  // Too late if crash occurs
});
```

**Impact:**
- **User Frustration:** Repeated theme resets after crashes
- **Mobile UX:** iOS/Android apps often terminated without `beforeunload` firing
- **Accessibility:** High contrast users lose preference, accessibility features reset

**Recommended Fix:**
```javascript
// Save immediately on change
themeSwitch.addEventListener('change', function() {
  const newTheme = this.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);  // Duplicate for legacy
  
  // Save immediately
  try {
    localStorage.setItem('theme', newTheme);
    console.log(`Theme saved: ${newTheme}`);
  } catch (e) {
    console.error('Failed to save theme preference:', e);
    showToast('Theme change saved but may not persist', 'warning');
  }
  
  // Trigger theme change event for other components
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
});

// Remove beforeunload handler (no longer needed)
```

**Effort:** 30 minutes  
**Risk:** VERY LOW (adds persistence, doesn't change behavior)

---

## 3. MEDIUM PRIORITY ISSUES

### Issue #5: Empty State Inconsistency
**Category:** UX, Visual Design  
**Location:** Subscriptions widget (line 456), upcoming transactions (line 509)  
**Priority:** MEDIUM

**Problem:**
- Loading spinner shows indefinitely if no data exists
- No proper empty state illustration or call-to-action
- Users unsure if app is broken or if they need to add data

**Current Code:**
```html
<div id="subscriptionsList">
  <div class="text-center py-3">
    <div class="spinner-border spinner-border-sm text-muted" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</div>
```

**Impact:**
- **User Confusion:** "Is it loading or empty?"
- **Abandoned Flows:** Users don't know to click "Add Bill" button
- **Support Tickets:** "Dashboard not loading" complaints

**Recommended Fix:**

**HTML Component:**
```html
<div class="empty-state">
  <div class="empty-state-icon">
    <i class="bi bi-inbox"></i>
  </div>
  <h3 class="empty-state-title">No subscriptions yet</h3>
  <p class="empty-state-description">
    Add your recurring subscriptions to track monthly spending and get payment reminders.
  </p>
  <a href="bills.html?type=subscription" class="btn btn-primary">
    <i class="bi bi-plus-circle me-2"></i>
    Add First Subscription
  </a>
</div>
```

**CSS Component:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-state-icon i {
  font-size: 40px;
  color: var(--color-text-tertiary);
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 400px;
  margin-bottom: 24px;
  line-height: 1.5;
}
```

**Effort:** 3 hours (design component + implement across 5 pages)  
**Risk:** LOW (purely additive, no existing behavior changed)

---

### Issue #6: Form Validation Visual Feedback Missing
**Category:** UX, Accessibility  
**Location:** Login modal (line 616), Signup modal (line 651), all form pages  
**Priority:** MEDIUM

**Problem:**
- Bootstrap `.is-invalid` class not applied on validation errors
- Only alert banner shows at top of form
- Users don't know WHICH field is invalid
- Screen readers don't announce field-level errors

**Current Code (app.js validation):**
```javascript
if (!emailValid) {
  showAlert('Invalid email address', 'danger');
  return;  // No visual indicator on input field
}
```

**Impact:**
- **WCAG 2.1:** Fails 3.3.1 (Error Identification) and 3.3.3 (Error Suggestion)
- **User Confusion:** "What's wrong?" — users re-enter all fields
- **Mobile UX:** Alert at top scrolls off-screen, user can't see it

**Recommended Fix:**

**HTML Structure:**
```html
<div class="mb-3">
  <label for="loginEmail" class="form-label">Email address</label>
  <input 
    type="email" 
    class="form-control" 
    id="loginEmail" 
    name="loginEmail"
    aria-describedby="loginEmailError"
    aria-invalid="false"
    required
  >
  <div id="loginEmailError" class="invalid-feedback" style="display: none;">
    Please enter a valid email address
  </div>
</div>
```

**JavaScript Validation:**
```javascript
function validateEmail(inputId) {
  const input = document.getElementById(inputId);
  const errorDiv = document.getElementById(`${inputId}Error`);
  const email = input.value.trim();
  
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!isValid && email.length > 0) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Please enter a valid email address';
    return false;
  } else {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    errorDiv.style.display = 'none';
    return true;
  }
}

// Validate on blur
document.getElementById('loginEmail').addEventListener('blur', function() {
  validateEmail('loginEmail');
});
```

**Effort:** 4 hours (apply to all forms: login, signup, assets, bills, debts, income)  
**Risk:** MEDIUM (requires JS refactor, QA needed)

---

## 4. LOW PRIORITY ISSUES

### Issue #7: Button Touch Target Size
**Category:** Accessibility (WCAG 2.5.5)  
**Location:** Sidebar links (line 380), notification bell (line 385), stat cards  
**Priority:** LOW

**Problem:**
- Touch targets are 40px height but WCAG 2.5.5 Level AAA requires 44px minimum
- Small buttons (icon-only) may be 32px × 32px
- Mobile users with large fingers or motor impairments struggle

**Current Code:**
```css
.sidebar a {
  padding: 12px 24px;  /* Results in ~40px height */
  min-height: 40px;
}

.btn-icon {
  width: 40px;
  height: 40px;
}
```

**Impact:**
- **WCAG 2.5.5:** Fails Level AAA (Target Size)
- **Mobile UX:** Mis-taps on sidebar links, especially on bumpy surfaces
- **Accessibility:** Motor impairment users struggle with precision

**Recommended Fix:**
```css
/* Sidebar Links */
.sidebar a {
  padding: 14px 24px;  /* Increase to 44px min height */
  min-height: 44px;
  display: flex;
  align-items: center;
}

/* Icon Buttons */
.btn-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stat Cards (clickable) */
.stat-card[data-href] {
  cursor: pointer;
  min-height: 44px;  /* If entire card is clickable */
}
```

**Effort:** 2 hours  
**Risk:** LOW (visual adjustments only, may need design review)

---

### Issue #8: Chart Color Contrast
**Category:** Accessibility (WCAG 1.4.3)  
**Location:** `charts.js` Chart.js color configuration  
**Priority:** LOW

**Problem:**
- Some chart colors (e.g., light blue lines on dark background) may not meet 4.5:1 contrast ratio
- Color alone used to distinguish data series (not accessible to colorblind users)

**Current Code:**
```javascript
const chartColors = {
  primary: '#01a4ef',    // May be too light on dark background
  secondary: '#f44e24',
  accent: '#81b900'
};
```

**Audit Needed:**
Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to test:
- Primary blue (#01a4ef) on dark bg (#1a1a1a): Ratio?
- Accent green (#81b900) on dark bg: Ratio?
- Text labels on chart backgrounds

**Recommended Fix:**
```javascript
// Use design token colors + ensure patterns/icons for colorblind users
const chartColors = {
  primary: getComputedStyle(document.documentElement).getPropertyValue('--color-secondary'),  // #01a4ef
  secondary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),  // #f44e24
  accent: getComputedStyle(document.documentElement).getPropertyValue('--color-accent')       // #81b900
};

// Add pattern fills for line charts (accessible to colorblind)
const linePatterns = {
  primary: 'solid',
  secondary: 'dashed',
  accent: 'dotted'
};

// Ensure data labels have sufficient contrast
const chartOptions = {
  plugins: {
    legend: {
      labels: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary'),
        font: { size: 14 }
      }
    }
  }
};
```

**Effort:** 3 hours (audit + adjustments + QA)  
**Risk:** LOW (visual changes only, no logic affected)

---

### Issue #9: Onboarding Modal No Escape Hatch
**Category:** UX, User Control  
**Location:** Onboarding modal (line 706) — `data-bs-backdrop="static"`  
**Priority:** LOW

**Problem:**
- Users can't dismiss onboarding with ESC key or outside click
- No "Skip all" or "Remind me later" option on early steps
- Power users feel trapped, forced through 5-step wizard

**Current Code:**
```html
<div 
  class="modal fade" 
  id="onboardingModal" 
  data-bs-backdrop="static"  <!-- Prevents dismissal -->
  data-bs-keyboard="false"   <!-- Disables ESC key -->
>
```

**Impact:**
- **UX Frustration:** "I just want to explore!" — users close tab instead
- **Power Users:** Tech-savvy users annoyed by forced tutorial
- **Accessibility:** Keyboard-only users can't easily exit

**Recommended Fix:**

**HTML:**
```html
<div 
  class="modal fade" 
  id="onboardingModal" 
  data-bs-backdrop="true"    <!-- Allow outside click to dismiss -->
  data-bs-keyboard="true"    <!-- Allow ESC key -->
>
```

**Step 1 (Welcome Screen) — Add "Remind Me Later":**
```html
<div class="onboarding-welcome-actions">
  <button type="button" class="btn btn-lg btn-primary" id="onboardingGetStartedBtn">
    Get Started
  </button>
  <button 
    type="button" 
    class="btn btn-lg btn-outline-secondary" 
    id="onboardingRemindLaterBtn"
    data-bs-dismiss="modal"
  >
    Remind Me Later
  </button>
</div>
```

**JavaScript (onboarding.js):**
```javascript
document.getElementById('onboardingRemindLaterBtn').addEventListener('click', function() {
  // Set reminder for next login
  localStorage.setItem('onboarding_remind_at', Date.now() + (24 * 60 * 60 * 1000));  // 24 hours
  bootstrap.Modal.getInstance(document.getElementById('onboardingModal')).hide();
});
```

**Effort:** 1 hour  
**Risk:** VERY LOW (improves UX, no breaking changes)

---

## Next Steps

### Immediate Actions (This Sprint)
1. **Fix Issue #1** — Typography hierarchy (Architect to implement)
2. **Fix Issue #2** — Stat card accessibility (Builder to implement with Architect guidance)
3. **Fix Issue #3** — Mobile notification width (Builder to implement)
4. **Fix Issue #4** — Theme toggle persistence (Builder to implement)

### Azure DevOps Work Items to Create
- **User Story 1:** "As a screen reader user, I want proper heading structure so I can navigate the dashboard efficiently"
  - Tasks: Issue #1, Issue #2
  - Priority: HIGH
  - Sprint: Current

- **User Story 2:** "As a mobile user, I want the notification dropdown to fit my screen so I can read all notifications"
  - Tasks: Issue #3
  - Priority: HIGH
  - Sprint: Current

- **User Story 3:** "As a user, I want my theme preference saved immediately so I don't lose it if my browser crashes"
  - Tasks: Issue #4
  - Priority: MEDIUM
  - Sprint: Current

- **User Story 4:** "As a new user, I want clear empty states so I know what actions to take"
  - Tasks: Issue #5
  - Priority: MEDIUM
  - Sprint: Next

### Next Audit Session
**Target:** bills.html (Subscriptions page)  
**Focus Areas:**
- Payment tracking UX
- Recurring bill management
- Subscription cancellation flow
- Mobile optimization

---

## Appendix: Testing Checklist

### Accessibility Testing
- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver (iOS Safari)
- [ ] Verify keyboard navigation (Tab, Shift+Tab, Enter, ESC)
- [ ] Check focus indicators (2px blue outline visible)
- [ ] Validate ARIA labels with screen reader

### Browser Testing
- [ ] Chrome 120+ (Windows, macOS)
- [ ] Safari 17+ (macOS, iOS)
- [ ] Firefox 120+ (Windows, macOS)
- [ ] Edge 120+ (Windows)
- [ ] Samsung Internet (Android)

### Device Testing
- [ ] iPhone SE (375px width)
- [ ] iPhone 14 Pro (393px width)
- [ ] Galaxy S23 (360px width)
- [ ] iPad Mini portrait (768px width)
- [ ] iPad Pro landscape (1024px width)
- [ ] Desktop 1920×1080

### Visual Regression Testing
- [ ] Screenshot before/after for each fix
- [ ] Compare dark mode vs light mode
- [ ] Verify chart rendering consistency
- [ ] Check empty states vs populated states

---

**Report Version:** 1.0  
**Last Updated:** February 23, 2026, 5:51 AM  
**Next Review:** After bills.html audit (Session 2)
