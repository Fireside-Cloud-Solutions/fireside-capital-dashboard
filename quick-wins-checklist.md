# Fireside Capital — Quick Wins Checklist

**Goal:** Fix critical UX/accessibility issues with minimal effort  
**Total Estimated Time:** 4 hours  
**Impact:** Fixes 8 critical WCAG violations + improves overall user experience

---

## ✅ Quick Win #1: Add Skip Navigation Link
**Time:** 15 minutes  
**Impact:** Critical — Makes app keyboard-accessible  
**WCAG:** 2.4.1 Bypass Blocks (Level A)

### Implementation
**1. Add skip link as first element in `<body>`:**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

**2. Add id to main element (all pages):**
```html
<main id="main-content" class="main-content flex-grow-1">
```

**3. Add CSS to `styles.css`:**
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

### Testing
- [ ] Press Tab on any page
- [ ] Verify "Skip to main content" appears
- [ ] Press Enter
- [ ] Verify focus moves to main content

---

## ✅ Quick Win #2: Add ARIA Labels to Icon Buttons
**Time:** 30 minutes  
**Impact:** Critical — Screen readers can identify button purpose  
**WCAG:** 4.1.2 Name, Role, Value (Level A)

### Files to Update
- `assets.html`
- `investments.html`
- `debts.html`
- `bills.html`
- `income.html`

### Find & Replace
**Find:**
```html
<button class="btn btn-sm btn-outline-primary" onclick="editAsset
```

**Replace:**
```html
<button class="btn btn-sm btn-outline-primary" aria-label="Edit asset" onclick="editAsset
```

**Do the same for:**
- Edit buttons: `aria-label="Edit [item type]"`
- Delete buttons: `aria-label="Delete [item type]"`
- View buttons: `aria-label="View details"`

**Better: Dynamic labels (JavaScript):**
```javascript
// In table rendering code, add item name to label:
<button aria-label="Edit ${item.name}">
  <i class="bi bi-pencil" aria-hidden="true"></i>
</button>
```

### Testing
- [ ] Use NVDA/JAWS screen reader
- [ ] Tab to icon button
- [ ] Verify announces "Edit [item name] button"

---

## ✅ Quick Win #3: Strengthen Focus Indicators
**Time:** 10 minutes  
**Impact:** High — Makes keyboard navigation visible  
**WCAG:** 1.4.11 Non-text Contrast (Level AA)

### Implementation
**Add to `styles.css` (end of file):**
```css
/* Enhanced focus indicators for accessibility */
*:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
  border-radius: 4px;
}

.btn:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(1, 164, 239, 0.2);
}

.sidebar a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  background: rgba(var(--color-primary-rgb), 0.15);
}
```

### Testing
- [ ] Tab through entire page
- [ ] Verify all interactive elements show blue outline
- [ ] Verify outline is visible on dark and light backgrounds

---

## ✅ Quick Win #4: Add ARIA Labels to Charts
**Time:** 30 minutes  
**Impact:** Critical — Blind users can understand financial data  
**WCAG:** 1.1.1 Non-text Content (Level A)

### Files to Update
- `index.html` (Dashboard — 8 charts)
- `reports.html`
- `bills.html` (amortization charts)

### Implementation
**Find all `<canvas>` elements and add `aria-label`:**

**Dashboard charts:**
```html
<!-- Net Worth Timeline -->
<canvas id="netWorthTimelineChart" 
        aria-label="Net Worth Over Time: Line chart showing increase from $250,000 in January to $286,957 in July 2025"></canvas>

<!-- Cash Flow -->
<canvas id="cashFlowChart" 
        aria-label="Monthly Cash Flow: Stacked bar chart showing income versus expenses for the past 6 months"></canvas>

<!-- Net Worth Change -->
<canvas id="netWorthDeltaChart" 
        aria-label="Monthly Net Worth Change: Bar chart showing net worth increased by $12,500 in July 2025"></canvas>

<!-- Spending Categories -->
<canvas id="spendingCategoriesChart" 
        aria-label="Top Spending Categories: Donut chart showing Housing 45%, Auto 25%, Utilities 15%, Other 15%"></canvas>

<!-- Emergency Fund -->
<div id="emergencyFundChartWrapper" 
     aria-label="Emergency Fund Progress: You have saved $20,000 toward your $30,000 goal, which is 67% complete"></div>

<!-- Savings Rate -->
<canvas id="savingsRateChart" 
        aria-label="Savings Rate Over Time: Line chart showing savings rate fluctuating between 5% and 15% over the past year"></canvas>

<!-- Investment Growth -->
<canvas id="investmentGrowthChart" 
        aria-label="Investment Growth Over Time: Line chart showing projected investment value growing from $214,000 to $226,000 over the next 6 months"></canvas>
```

### Testing
- [ ] Use screen reader
- [ ] Navigate to each chart
- [ ] Verify summary data is announced

---

## ✅ Quick Win #5: Add `scope` to Table Headers
**Time:** 15 minutes  
**Impact:** Critical — Screen readers can navigate tables  
**WCAG:** 1.3.1 Info and Relationships (Level A)

### Files to Update
All pages with tables (Assets, Investments, Debts, Bills, Income, Budget)

### Find & Replace
**Find:**
```html
<th>
```

**Replace:**
```html
<th scope="col">
```

**Example (before):**
```html
<thead>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Amount</th>
  </tr>
</thead>
```

**Example (after):**
```html
<thead>
  <tr>
    <th scope="col">Name</th>
    <th scope="col">Type</th>
    <th scope="col">Amount</th>
  </tr>
</thead>
```

### Testing
- [ ] Use screen reader table navigation (Ctrl+Alt+Arrow in NVDA)
- [ ] Verify column headers are announced
- [ ] Run axe DevTools — should pass "th-has-data-cells"

---

## ✅ Quick Win #6: Mark Required Fields
**Time:** 20 minutes  
**Impact:** Critical — Users know which fields are required  
**WCAG:** 3.3.2 Labels or Instructions (Level A)

### Files to Update
- All modal forms (Login, Signup, Add Asset, Add Bill, etc.)
- Settings page forms

### Implementation
**1. Add asterisk to labels:**
```html
<label for="assetName" class="form-label">
  Asset Name <span class="text-danger">*</span>
</label>
```

**2. Add `required` attribute to inputs:**
```html
<input type="text" 
       id="assetName" 
       name="assetName" 
       class="form-control" 
       required 
       aria-required="true">
```

**3. Add form instruction:**
```html
<form id="addAssetForm">
  <p class="text-muted small mb-3">
    Fields marked with <span class="text-danger">*</span> are required.
  </p>
  <!-- form fields -->
</form>
```

### Apply to These Forms
- [ ] Login form (email, password)
- [ ] Signup form (first name, last name, email, password)
- [ ] Add Asset form (name, type, current value)
- [ ] Add Bill form (name, amount, frequency)
- [ ] Add Debt form (name, amount, APR)
- [ ] Add Investment form (name, balance)
- [ ] Add Income form (source, amount, frequency)

### Testing
- [ ] Try submitting empty form
- [ ] Verify browser blocks submission
- [ ] Verify required message appears

---

## ✅ Quick Win #7: Fix Icon Button Color Contrast
**Time:** 20 minutes  
**Impact:** High — Low-vision users can see action buttons  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)

### Implementation
**Add to `styles.css`:**
```css
/* Fix color contrast for icon buttons */
.table .btn-outline-primary i,
.table .btn-outline-primary:hover i {
  color: #ff6b4a; /* 3.5:1 contrast ratio — PASSES */
}

.table .btn-outline-danger i,
.table .btn-outline-danger:hover i {
  color: #ff5449; /* 3.6:1 contrast ratio — PASSES */
}

.table .btn-outline-info i,
.table .btn-outline-info:hover i {
  color: #3eb8f0; /* 3.8:1 contrast ratio — PASSES */
}
```

### Testing
- [ ] Use Chrome DevTools > Elements > Inspect icon
- [ ] View computed color
- [ ] Use Color Contrast Analyzer — verify ≥ 3:1 ratio
- [ ] Run Lighthouse — should pass contrast audit

---

## ✅ Quick Win #8: Add Autocomplete to Forms
**Time:** 20 minutes  
**Impact:** Medium — Speeds up form completion  
**WCAG:** 1.3.5 Identify Input Purpose (Level AA)

### Files to Update
- Login modal
- Signup modal

### Implementation

**Login form:**
```html
<input type="email" 
       id="loginEmail" 
       name="email" 
       autocomplete="email" 
       class="form-control">

<input type="password" 
       id="loginPassword" 
       name="password" 
       autocomplete="current-password" 
       class="form-control">
```

**Signup form:**
```html
<input type="text" 
       id="signupFirstName" 
       name="firstName" 
       autocomplete="given-name" 
       class="form-control">

<input type="text" 
       id="signupLastName" 
       name="lastName" 
       autocomplete="family-name" 
       class="form-control">

<input type="email" 
       id="signupEmail" 
       name="email" 
       autocomplete="email" 
       class="form-control">

<input type="password" 
       id="signupPassword" 
       name="password" 
       autocomplete="new-password" 
       class="form-control">
```

### Testing
- [ ] Open login form
- [ ] Start typing in email field
- [ ] Verify browser suggests saved emails
- [ ] Run Lighthouse — should pass "autocomplete" audit

---

## ✅ Quick Win #9: Add Toast Notifications (Bonus)
**Time:** 30 minutes  
**Impact:** High — Users get feedback on actions  
**Not WCAG, but huge UX improvement**

### Implementation
**1. Add Bootstrap Toast container (before `</body>`):**
```html
<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11000">
  <div id="successToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body" id="successToastMessage">
        Action completed successfully
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>
</div>
```

**2. Add JavaScript helper function (in `app.js`):**
```javascript
function showToast(message, type = 'success') {
  const toast = document.getElementById('successToast');
  const messageEl = document.getElementById('successToastMessage');
  
  // Update message
  messageEl.textContent = message;
  
  // Update style
  toast.className = `toast align-items-center text-bg-${type} border-0`;
  
  // Show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}
```

**3. Call on user actions:**
```javascript
// After saving asset
showToast('Asset added successfully', 'success');

// After deleting
showToast('Asset deleted', 'danger');

// On error
showToast('Error: Unable to save data', 'danger');
```

### Testing
- [ ] Add a new asset
- [ ] Verify toast appears in top-right corner
- [ ] Verify toast auto-dismisses after 5 seconds
- [ ] Verify screen reader announces message

---

## ✅ Quick Win #10: Add Loading Spinner
**Time:** 20 minutes  
**Impact:** High — Users know data is loading  
**Not WCAG, but huge UX improvement**

### Implementation
**1. Add spinner HTML (in Dashboard `dataContainer`):**
```html
<div id="loadingSpinner" class="text-center py-5">
  <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
    <span class="visually-hidden">Loading financial data...</span>
  </div>
  <p class="mt-3 text-muted">Loading your financial data...</p>
</div>
```

**2. Hide data container initially:**
```javascript
// In app.js, before loading data:
document.getElementById('dataContainer').style.display = 'none';
document.getElementById('loadingSpinner').style.display = 'block';

// After data loads:
document.getElementById('loadingSpinner').style.display = 'none';
document.getElementById('dataContainer').style.display = 'block';
```

**Or use skeleton screens (better UX):**
```html
<div class="dashboard-card skeleton">
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>
```

```css
.skeleton {
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Testing
- [ ] Reload page
- [ ] Verify spinner appears while data loads
- [ ] Verify spinner disappears when data loads
- [ ] Use screen reader — verify loading message is announced

---

## 📋 Completion Checklist

### Critical Accessibility (Must Do)
- [ ] **Quick Win #1:** Skip navigation link (15 min)
- [ ] **Quick Win #2:** ARIA labels on icon buttons (30 min)
- [ ] **Quick Win #3:** Strengthen focus indicators (10 min)
- [ ] **Quick Win #4:** ARIA labels on charts (30 min)
- [ ] **Quick Win #5:** Table header scope attributes (15 min)
- [ ] **Quick Win #6:** Mark required fields (20 min)
- [ ] **Quick Win #7:** Fix icon button contrast (20 min)
- [ ] **Quick Win #8:** Add autocomplete (20 min)

**Total Critical Time: ~2.5 hours**

### UX Enhancements (Highly Recommended)
- [ ] **Quick Win #9:** Toast notifications (30 min)
- [ ] **Quick Win #10:** Loading spinner (20 min)

**Total UX Time: ~50 minutes**

---

## ⚡ Power Hour — Do This First

If you only have 1 hour, do these 4 tasks in priority order:

1. **Skip link** (15 min) — Biggest accessibility impact
2. **ARIA labels on buttons** (30 min) — Fixes most critical screen reader issue
3. **Focus indicators** (10 min) — Helps all keyboard users
4. **Table scope attributes** (15 min) — Quick find/replace

**Result:** 4 critical WCAG violations fixed in 1 hour

---

## 🎯 Success Metrics

**Before Quick Wins:**
- Lighthouse Accessibility Score: ~70/100
- WCAG Level A Compliance: ❌ FAIL
- Critical Issues: 7

**After Quick Wins:**
- Lighthouse Accessibility Score: ~88/100
- WCAG Level A Compliance: ✅ PASS (most issues)
- Critical Issues: 1-2 remaining

**Remaining Work:**
- Fix heading hierarchy (3 hours)
- Add form validation feedback (4 hours)
- Add loading/error states (3 hours)

---

## 📦 Git Commit Messages

Use these commit messages as you complete each quick win:

```bash
git commit -m "accessibility: add skip navigation link (WCAG 2.4.1)"
git commit -m "accessibility: add ARIA labels to icon buttons (WCAG 4.1.2)"
git commit -m "accessibility: strengthen focus indicators (WCAG 1.4.11)"
git commit -m "accessibility: add ARIA labels to charts (WCAG 1.1.1)"
git commit -m "accessibility: add scope to table headers (WCAG 1.3.1)"
git commit -m "accessibility: mark required form fields (WCAG 3.3.2)"
git commit -m "accessibility: fix icon button color contrast (WCAG 1.4.3)"
git commit -m "accessibility: add autocomplete to forms (WCAG 1.3.5)"
git commit -m "ux: add toast notification system"
git commit -m "ux: add loading spinner for data fetches"
```

---

**Document Created:** February 1, 2026  
**Total Estimated Time:** 4 hours  
**Difficulty:** Easy (mostly HTML/CSS edits)  
**Impact:** ⭐⭐⭐⭐⭐ (Fixes critical accessibility barriers)
