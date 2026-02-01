# Fireside Capital — Accessibility Issues & Remediation Guide

**Audit Date:** February 1, 2026  
**WCAG Version:** 2.1 Level AA  
**Current Compliance Status:** ❌ FAIL (68/100)  
**Target Compliance Status:** ✅ PASS (95+/100)

---

## Overview

This document catalogues all WCAG 2.1 accessibility violations found in the Fireside Capital dashboard, organized by severity and success criterion. Each issue includes:
- **WCAG reference** (principle, guideline, success criterion, level)
- **Affected elements** (with code examples)
- **Impact** on users with disabilities
- **Remediation steps** (with code solutions)
- **Testing method** (how to verify the fix)

---

## Critical Issues (Level A) — Must Fix Immediately

### Issue #1: Icon-Only Buttons Lack Accessible Names
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Affected Pages:** All CRUD pages (Assets, Investments, Debts, Bills, Income)  
**User Impact:** Screen reader users cannot determine button purpose

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<button class="btn btn-sm btn-outline-primary">
  <i class="bi bi-pencil"></i>
</button>
<button class="btn btn-sm btn-outline-danger">
  <i class="bi bi-trash"></i>
</button>
<button class="btn btn-sm btn-outline-info">
  <i class="bi bi-eye"></i>
</button>
```

**Screen reader announces:** "Button" (no context)

#### Remediation
```html
<!-- FIXED (PASSES) -->
<button class="btn btn-sm btn-outline-primary" aria-label="Edit BMW X5">
  <i class="bi bi-pencil" aria-hidden="true"></i>
</button>
<button class="btn btn-sm btn-outline-danger" aria-label="Delete BMW X5">
  <i class="bi bi-trash" aria-hidden="true"></i>
</button>
<button class="btn btn-sm btn-outline-info" aria-label="View BMW X5 details">
  <i class="bi bi-eye" aria-hidden="true"></i>
</button>
```

**Key changes:**
1. Added `aria-label` with descriptive text (includes item name)
2. Added `aria-hidden="true"` to icons (prevents duplicate announcement)

#### Testing
1. Use NVDA/JAWS screen reader
2. Tab to button
3. Verify announcement: "Edit BMW X5 button"
4. Run axe DevTools — should show 0 "button-name" errors

**Estimated Effort:** 2 hours (update all table action buttons)

---

### Issue #2: Modal Close Buttons Missing Labels
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Critical  
**Affected Pages:** All modals (Login, Signup, Add Asset, Delete confirmations)  
**User Impact:** Screen reader users don't know button closes modal

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
```

**Screen reader announces:** "Button" (no context)

#### Remediation
```html
<!-- FIXED (PASSES) -->
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
```

Or with more context:
```html
<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close login dialog"></button>
```

#### Testing
1. Open any modal
2. Tab to close button (X in top-right)
3. Verify screen reader announces: "Close button"
4. Run Lighthouse — should pass "button-name" audit

**Estimated Effort:** 30 minutes (add to all modals)

---

### Issue #3: Charts Lack Alternative Text
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Severity:** Critical  
**Affected Pages:** Dashboard, Reports, Bills (8+ charts total)  
**User Impact:** Blind users receive zero information from charts

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<canvas id="netWorthTimelineChart"></canvas>
```

**Screen reader announces:** "Canvas" (no data)

#### Remediation
**Option 1: Add aria-label with summary**
```html
<canvas id="netWorthTimelineChart" 
        aria-label="Net Worth Over Time: Line chart showing increase from $250,000 in January 2025 to $286,957 in July 2025, with monthly fluctuations between $245,000 and $287,500"></canvas>
```

**Option 2: Add data table (better for detailed data)**
```html
<div class="chart-wrapper">
  <canvas id="netWorthChart" aria-describedby="netWorthData"></canvas>
  <table id="netWorthData" class="visually-hidden">
    <caption>Net Worth Over Time</caption>
    <thead>
      <tr><th>Month</th><th>Net Worth</th></tr>
    </thead>
    <tbody>
      <tr><td>Jan 2025</td><td>$250,000</td></tr>
      <tr><td>Feb 2025</td><td>$255,000</td></tr>
      <!-- ... all data points ... -->
    </tbody>
  </table>
</div>
```

**CSS:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

#### Implementation Strategy
1. For simple charts (pie, donut): Use `aria-label` with percentages
2. For time-series charts: Generate data table from Chart.js data
3. Update chart rendering code to inject `aria-label` dynamically

#### Testing
1. Use screen reader to navigate to chart
2. Verify summary/data is announced
3. Run axe DevTools — should pass "aria-hidden-focus"
4. Run WAVE — should show no "Missing alternative text" errors

**Estimated Effort:** 3 hours (all charts + table generation)

---

### Issue #4: Missing Skip Navigation Link
**WCAG:** 2.4.1 Bypass Blocks (Level A)  
**Severity:** Critical  
**Affected Pages:** All pages  
**User Impact:** Keyboard users must tab through 12 sidebar links on every page

#### Current State
No mechanism to bypass sidebar navigation

#### Remediation
```html
<!-- Add as first element in <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Add id to main element -->
<main id="main-content" class="main-content flex-grow-1">
  ...
</main>
```

**CSS:**
```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-primary);
  color: var(--color-text-on-brand);
  padding: 10px 20px;
  border-radius: 0 0 4px 0;
  z-index: 9999;
  font-weight: 600;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
```

#### Testing
1. Load any page
2. Press Tab once
3. Verify "Skip to main content" link appears
4. Press Enter
5. Verify focus moves to main content area
6. Run Lighthouse — should pass "bypass" audit

**Estimated Effort:** 30 minutes

---

### Issue #5: Table Headers Missing Scope Attributes
**WCAG:** 1.3.1 Info and Relationships (Level A)  
**Severity:** Critical  
**Affected Pages:** All table pages (Assets, Bills, Debts, etc.)  
**User Impact:** Screen reader users can't navigate tables effectively

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<thead>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Amount</th>
  </tr>
</thead>
```

**Screen reader experience:** Header-cell relationships are ambiguous

#### Remediation
```html
<!-- FIXED (PASSES) -->
<thead>
  <tr>
    <th scope="col">Name</th>
    <th scope="col">Type</th>
    <th scope="col">Amount</th>
  </tr>
</thead>
```

For row headers (if applicable):
```html
<tbody>
  <tr>
    <th scope="row">Total</th>
    <td>$10,000</td>
  </tr>
</tbody>
```

#### Testing
1. Use screen reader table navigation (Ctrl+Alt+Arrow keys in NVDA)
2. Verify column headers are announced when moving through cells
3. Run axe DevTools — should pass "th-has-data-cells"

**Estimated Effort:** 1 hour (update all tables)

---

### Issue #6: Required Form Fields Not Marked
**WCAG:** 3.3.2 Labels or Instructions (Level A)  
**Severity:** Critical  
**Affected Pages:** All forms (Login, Signup, Add Asset, etc.)  
**User Impact:** Users don't know which fields are required before submitting

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<div class="mb-3">
  <label for="assetName" class="form-label">Asset Name</label>
  <input type="text" class="form-control" id="assetName" name="assetName">
</div>
```

**No indication field is required**

#### Remediation
```html
<!-- FIXED (PASSES) -->
<div class="mb-3">
  <label for="assetName" class="form-label">
    Asset Name <span class="text-danger" aria-label="required">*</span>
  </label>
  <input type="text" 
         class="form-control" 
         id="assetName" 
         name="assetName" 
         required 
         aria-required="true">
</div>
```

**Or with explicit text:**
```html
<label for="email" class="form-label">
  Email <span class="badge bg-danger">Required</span>
</label>
<input type="email" id="email" required aria-required="true">
```

**Add form instructions:**
```html
<form>
  <p class="text-muted mb-3">
    Fields marked with <span class="text-danger">*</span> are required.
  </p>
  <!-- form fields -->
</form>
```

#### Testing
1. Use screen reader on form
2. Verify required fields announce "required"
3. Try submitting empty form — browser should block
4. Run axe DevTools — should pass "label" and "aria-required-attr"

**Estimated Effort:** 2 hours (all forms)

---

### Issue #7: Form Labels Not Properly Associated
**WCAG:** 1.3.1 Info and Relationships (Level A)  
**Severity:** Critical  
**Affected Pages:** Settings page, some modals  
**User Impact:** Screen readers can't associate labels with inputs

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<div>
  <label class="form-label">Emergency Fund Goal</label>
  <input type="number" class="form-control" id="emergencyFundGoal">
</div>
```

**Missing `for` attribute on label**

#### Remediation
```html
<!-- FIXED (PASSES) -->
<div>
  <label for="emergencyFundGoal" class="form-label">Emergency Fund Goal</label>
  <input type="number" class="form-control" id="emergencyFundGoal" name="emergencyFundGoal">
</div>
```

**Or wrap input in label:**
```html
<label class="form-label">
  Emergency Fund Goal
  <input type="number" class="form-control" name="emergencyFundGoal">
</label>
```

#### Testing
1. Click label — input should receive focus
2. Use screen reader — label should be announced with input
3. Run axe DevTools — should pass "label"

**Estimated Effort:** 1 hour

---

### Issue #8: Heading Hierarchy Skips Levels
**WCAG:** 1.3.1 Info and Relationships (Level A)  
**Severity:** High  
**Affected Pages:** Dashboard, all pages  
**User Impact:** Screen reader users can't navigate by headings effectively

#### Current Hierarchy
```html
<main>
  <!-- No h1 on page -->
  <h2>Dashboard</h2> <!-- Page title -->
  
  <!-- Stat cards -->
  <h5>Investments</h5> <!-- Skips h3, h4 -->
  <h5>Debts</h5>
  
  <!-- Chart sections -->
  <h5>Net Worth Over Time</h5> <!-- Should be h3 or h4 -->
</main>
```

**Problem:** Jumps from h2 → h5 (skips h3, h4)

#### Recommended Hierarchy
```html
<main>
  <h1>Dashboard</h1> <!-- Add h1 for page title -->
  
  <section aria-labelledby="overview">
    <h2 id="overview" class="visually-hidden">Financial Overview</h2>
    
    <h3>Investments</h3> <!-- Stat card titles -->
    <h3>Debts</h3>
    <h3>Assets</h3>
    <h3>Net Worth</h3>
  </section>
  
  <section aria-labelledby="charts">
    <h2 id="charts" class="visually-hidden">Charts & Analytics</h2>
    
    <h3>Net Worth Over Time</h3> <!-- Chart titles -->
    <h3>Monthly Cash Flow</h3>
  </section>
</main>
```

**CSS for visually hidden headings:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
```

#### Testing
1. Use screen reader heading navigation (H key in NVDA)
2. Verify logical hierarchy (no skipped levels)
3. Run axe DevTools — should pass "heading-order"
4. Check browser outline view (DevTools > Elements > Accessibility)

**Estimated Effort:** 3 hours (all pages)

---

### Issue #9: Color as Sole Indicator
**WCAG:** 1.4.1 Use of Color (Level A)  
**Severity:** High  
**Affected Pages:** Dashboard (Upcoming Transactions), all financial displays  
**User Impact:** Color-blind users can't distinguish income from expenses

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<div class="text-danger">-$117.00</div> <!-- Red = expense -->
<div class="text-success">+$5,000</div> <!-- Green = income -->
```

**Relies solely on red/green color**

#### Remediation
**Option 1: Add text prefix**
```html
<div class="text-danger">
  <span aria-hidden="true">−</span> <!-- Minus symbol -->
  <span class="visually-hidden">Expense:</span>
  $117.00
</div>
<div class="text-success">
  <span aria-hidden="true">+</span> <!-- Plus symbol -->
  <span class="visually-hidden">Income:</span>
  $5,000.00
</div>
```

**Option 2: Add icons**
```html
<div class="text-danger">
  <i class="bi bi-arrow-down-circle" aria-hidden="true"></i>
  <span class="visually-hidden">Expense:</span>
  $117.00
</div>
<div class="text-success">
  <i class="bi bi-arrow-up-circle" aria-hidden="true"></i>
  <span class="visually-hidden">Income:</span>
  $5,000.00
</div>
```

**Option 3: Use accessible badges**
```html
<span class="badge bg-danger">
  <i class="bi bi-dash-circle" aria-hidden="true"></i> 
  $117.00 Expense
</span>
<span class="badge bg-success">
  <i class="bi bi-plus-circle" aria-hidden="true"></i> 
  $5,000 Income
</span>
```

#### Testing
1. Use "Colorblindly" Chrome extension (Deuteranopia mode)
2. Verify income/expense are distinguishable without color
3. Use screen reader — verify category is announced
4. Run axe DevTools — should pass "color-contrast"

**Estimated Effort:** 2 hours

---

## High-Priority Issues (Level AA) — Fix This Sprint

### Issue #10: Color Contrast Failures
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Severity:** High  
**Affected Pages:** All table pages  
**User Impact:** Low-vision users can't see icon buttons

#### Failing Elements
**Icon buttons in tables:**
- Orange `#f44e24` on dark gray `#1a1a1a` = **2.8:1** (fails 3:1 minimum)
- Red `#e53935` on dark gray = **2.9:1** (fails 3:1)

#### Remediation
**Option 1: Use higher-contrast colors**
```css
/* Increase icon brightness */
.table .btn-outline-primary i {
  color: #ff6b4a; /* 3.5:1 ratio — PASSES */
}

.table .btn-outline-danger i {
  color: #ff5449; /* 3.6:1 ratio — PASSES */
}
```

**Option 2: Add background to icon buttons**
```css
.table .btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid currentColor;
}
```

**Option 3: Replace icons with text**
```html
<button class="btn btn-sm btn-primary">Edit</button>
<button class="btn btn-sm btn-danger">Delete</button>
```

#### Testing
1. Use Lighthouse color contrast audit
2. Use axe DevTools — should pass "color-contrast"
3. Use Color Contrast Analyzer tool
4. Verify ratios ≥ 3:1 for UI elements, ≥ 4.5:1 for text

**Estimated Effort:** 1 hour

---

### Issue #11: Focus Indicators Too Subtle
**WCAG:** 1.4.11 Non-text Contrast (Level AA)  
**Severity:** High  
**Affected Pages:** All pages  
**User Impact:** Keyboard users can't see where focus is

#### Current State
Bootstrap default blue outline is barely visible on dark backgrounds

#### Remediation
```css
/* Global focus indicator */
*:focus-visible {
  outline: 3px solid var(--color-secondary); /* Sky blue #01a4ef */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Exception for buttons (avoid double border) */
.btn:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(1, 164, 239, 0.2);
}

/* Sidebar links */
.sidebar a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  background: rgba(var(--color-primary-rgb), 0.1);
}
```

#### Testing
1. Tab through entire page
2. Verify all interactive elements show visible focus ring
3. Measure contrast: focus indicator vs background ≥ 3:1
4. Run axe DevTools — should pass "focus-visible"

**Estimated Effort:** 1 hour

---

### Issue #12: No Status Messages for Dynamic Content
**WCAG:** 4.1.3 Status Messages (Level AA)  
**Severity:** Medium  
**Affected Pages:** Dashboard, all data pages  
**User Impact:** Screen reader users don't know when data updates

#### Current State
Dashboard cards update silently when data loads from Supabase

#### Remediation
**Add live region for status messages:**
```html
<!-- Add to main content area -->
<div id="statusMessages" aria-live="polite" aria-atomic="true" class="visually-hidden"></div>
```

**JavaScript:**
```javascript
function announceToScreenReader(message) {
  const statusDiv = document.getElementById('statusMessages');
  statusDiv.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    statusDiv.textContent = '';
  }, 1000);
}

// Usage examples:
announceToScreenReader('Financial data updated');
announceToScreenReader('Asset added successfully');
announceToScreenReader('Error: Unable to load data');
```

**For real-time updates:**
```html
<div class="dashboard-card" aria-live="polite">
  <h3>Net Worth</h3>
  <p id="netWorthValue">$286,957.01</p>
</div>
```

#### Testing
1. Use screen reader
2. Trigger data update (e.g., add new asset)
3. Verify announcement without moving focus
4. Run axe DevTools — should pass "aria-live"

**Estimated Effort:** 2 hours

---

## Medium-Priority Issues — Fix Next Sprint

### Issue #13: Hamburger Menu Button Missing Expanded State
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Severity:** Medium  
**Affected Pages:** All pages (mobile view)  
**User Impact:** Screen reader users don't know if menu is open/closed

#### Current Code
```html
<button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle navigation">
  <i class="bi bi-list"></i>
</button>
```

**Missing:** `aria-expanded` attribute

#### Remediation
```html
<button class="sidebar-toggle" 
        id="sidebarToggle" 
        aria-label="Toggle navigation" 
        aria-expanded="false"
        aria-controls="sidebar">
  <i class="bi bi-list" aria-hidden="true"></i>
</button>
```

**JavaScript:**
```javascript
const toggleBtn = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('show');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  
  // Update label for clarity
  toggleBtn.setAttribute('aria-label', 
    isOpen ? 'Close navigation menu' : 'Open navigation menu'
  );
});
```

#### Testing
1. Use screen reader on mobile
2. Click/tap menu button
3. Verify announcement: "Open navigation menu button, expanded false"
4. Click again
5. Verify announcement: "Close navigation menu button, expanded true"

**Estimated Effort:** 30 minutes

---

### Issue #14: Links Without Descriptive Text
**WCAG:** 2.4.4 Link Purpose (Level A)  
**Severity:** Medium  
**Affected Pages:** Bills page (amortization schedule links)  
**User Impact:** Screen reader users hear multiple "View Schedule" links with no context

#### Affected Elements
```html
<!-- CURRENT (FAILS) -->
<button class="btn btn-sm">
  <i class="bi bi-calendar"></i> View Schedule
</button>
```

**Multiple identical link text on same page**

#### Remediation
**Option 1: Add context to link text**
```html
<button class="btn btn-sm">
  <i class="bi bi-calendar" aria-hidden="true"></i> 
  View Schedule for Big Green Egg
</button>
```

**Option 2: Use aria-label**
```html
<button class="btn btn-sm" aria-label="View amortization schedule for Big Green Egg">
  <i class="bi bi-calendar" aria-hidden="true"></i> 
  <span aria-hidden="true">View Schedule</span>
</button>
```

**Option 3: Use visually-hidden text**
```html
<button class="btn btn-sm">
  <i class="bi bi-calendar" aria-hidden="true"></i> 
  View Schedule
  <span class="visually-hidden">for Big Green Egg</span>
</button>
```

#### Testing
1. Use screen reader heading/link navigation (K key in NVDA)
2. Verify each link has unique, descriptive text
3. Run WAVE — should show no "Redundant link" warnings

**Estimated Effort:** 1 hour

---

### Issue #15: Forms Missing Autocomplete Attributes
**WCAG:** 1.3.5 Identify Input Purpose (Level AA)  
**Severity:** Medium  
**Affected Pages:** Login, Signup forms  
**User Impact:** Users can't leverage browser autofill

#### Current Code
```html
<input type="email" class="form-control" id="loginEmail" name="loginEmail">
<input type="password" class="form-control" id="loginPassword" name="loginPassword">
```

**Missing `autocomplete` attributes**

#### Remediation
```html
<!-- Login form -->
<input type="email" 
       id="loginEmail" 
       name="email" 
       autocomplete="email">

<input type="password" 
       id="loginPassword" 
       name="password" 
       autocomplete="current-password">

<!-- Signup form -->
<input type="text" 
       id="signupFirstName" 
       name="firstName" 
       autocomplete="given-name">

<input type="text" 
       id="signupLastName" 
       name="lastName" 
       autocomplete="family-name">

<input type="email" 
       id="signupEmail" 
       name="email" 
       autocomplete="email">

<input type="password" 
       id="signupPassword" 
       name="password" 
       autocomplete="new-password">
```

**Other common autocomplete values:**
- `name` — Full name
- `tel` — Phone number
- `street-address` — Address
- `postal-code` — ZIP code
- `cc-number` — Credit card

#### Testing
1. Open form in browser
2. Start typing in email field
3. Verify browser suggests saved emails
4. Run Lighthouse — should pass "autocomplete" audit

**Estimated Effort:** 30 minutes

---

## Low-Priority Issues — Future Backlog

### Issue #16: Motion Not Respecting User Preferences
**WCAG:** 2.3.3 Animation from Interactions (Level AAA)  
**Severity:** Low  
**Affected Pages:** All pages (card entrance animations)  
**User Impact:** Users with vestibular disorders may experience discomfort

#### Current Code
CSS defines animation but doesn't fully disable for `prefers-reduced-motion`

#### Remediation
```css
/* Ensure all animations respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Disable entrance animations */
  .dashboard-card,
  .chart-card,
  .summary-card {
    animation: none !important;
  }
}
```

#### Testing
1. Enable "Reduce motion" in OS settings (Windows: Ease of Access, Mac: Accessibility)
2. Reload page
3. Verify no animations play
4. Run Lighthouse — should pass "motion" audit

**Estimated Effort:** 30 minutes

---

## Remediation Priority Matrix

| Issue | WCAG Level | Severity | User Impact | Effort | Priority |
|-------|------------|----------|-------------|--------|----------|
| #1 Icon button labels | A | Critical | Screen readers | 2h | 1 |
| #2 Modal close labels | A | Critical | Screen readers | 30m | 1 |
| #3 Chart alt text | A | Critical | Blind users | 3h | 1 |
| #4 Skip link | A | Critical | Keyboard users | 30m | 1 |
| #5 Table scope | A | Critical | Screen readers | 1h | 1 |
| #6 Required fields | A | Critical | All users | 2h | 1 |
| #7 Form labels | A | Critical | Screen readers | 1h | 1 |
| #8 Heading hierarchy | A | High | Screen readers | 3h | 2 |
| #9 Color indicator | A | High | Color-blind | 2h | 2 |
| #10 Color contrast | AA | High | Low vision | 1h | 2 |
| #11 Focus indicators | AA | High | Keyboard users | 1h | 2 |
| #12 Status messages | AA | Medium | Screen readers | 2h | 3 |
| #13 Menu expanded | A | Medium | Screen readers | 30m | 3 |
| #14 Link text | A | Medium | Screen readers | 1h | 3 |
| #15 Autocomplete | AA | Medium | All users | 30m | 3 |
| #16 Reduced motion | AAA | Low | Vestibular | 30m | 4 |

**Total Estimated Effort:** 22 hours

---

## Implementation Checklist

### Phase 1: Critical A11y (Sprint 1)
- [ ] Add aria-label to all icon-only buttons (#1)
- [ ] Add aria-label="Close" to modal close buttons (#2)
- [ ] Add aria-label to all charts with data summary (#3)
- [ ] Add skip navigation link (#4)
- [ ] Add scope="col" to all table headers (#5)
- [ ] Mark all required fields with asterisks + required attribute (#6)
- [ ] Associate all form labels with inputs (#7)

**Outcome:** Pass WCAG 2.1 Level A compliance

### Phase 2: Enhanced A11y (Sprint 2)
- [ ] Fix heading hierarchy across all pages (#8)
- [ ] Add text/icon indicators to financial data (#9)
- [ ] Improve color contrast on icon buttons (#10)
- [ ] Strengthen focus indicators globally (#11)
- [ ] Add live regions for status messages (#12)

**Outcome:** Pass WCAG 2.1 Level AA compliance

### Phase 3: Polish (Sprint 3)
- [ ] Add aria-expanded to hamburger menu (#13)
- [ ] Make link text descriptive and unique (#14)
- [ ] Add autocomplete attributes to forms (#15)
- [ ] Respect prefers-reduced-motion (#16)

**Outcome:** Achieve 95+ accessibility score

---

## Testing Tools & Resources

### Automated Testing
1. **Lighthouse** (Chrome DevTools) — Built-in audit
2. **axe DevTools** — Browser extension (free)
3. **WAVE** — Web accessibility evaluation tool
4. **Pa11y** — Command-line accessibility tester

### Manual Testing
1. **NVDA** — Free Windows screen reader
2. **JAWS** — Professional Windows screen reader
3. **VoiceOver** — Built-in Mac/iOS screen reader
4. **Color Contrast Analyzer** — Desktop app for WCAG contrast checking

### Browser Extensions
1. **axe DevTools** — Automated auditing
2. **Colorblindly** — Simulates color blindness
3. **Accessibility Insights** — Microsoft testing tool
4. **HeadingsMap** — Visualizes heading structure

---

## Compliance Statement (After Fixes)

> Fireside Capital is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
> 
> **Conformance Status:** WCAG 2.1 Level AA  
> **Date Achieved:** [Target: March 1, 2026]  
> **Assessment Method:** Self-evaluation using automated tools (axe, Lighthouse) and manual testing with screen readers (NVDA, VoiceOver)
> 
> **Feedback:** If you encounter any accessibility barriers, please contact us at accessibility@firesidecapital.com

---

**Document Prepared By:** UX/Accessibility Specialist  
**Next Audit Date:** After Phase 1 implementation (estimated 2 weeks)
