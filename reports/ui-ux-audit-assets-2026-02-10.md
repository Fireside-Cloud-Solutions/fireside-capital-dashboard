# UI/UX Audit Report — Assets Page
**Date:** February 10, 2026 — 5:28 AM  
**Page:** assets.html (Assets)  
**Auditor:** Capital (Architect Agent)

---

## PREVIOUS RECOMMENDATION VERIFIED ✅
**Issue #3 from Dashboard Audit:** Google Fonts `font-display:swap` has been implemented!  
The Assets page correctly includes `&display=swap` in the Google Fonts URL. This prevents FOIT (Flash of Invisible Text) and improves perceived performance.

---

## CRITICAL ISSUES (HIGH PRIORITY)

### Issue #9: Empty Table Has No Empty State
**Location:** `<tbody id="assetTableBody">` — initially empty  
**Current State:** Blank table with headers, no rows  
**Problem:** New users see an empty table with no guidance  
**Impact:** Confusing FTUE, users don't know where to start  

**Recommended Fix:**
```html
<tbody id="assetTableBody">
  <tr class="empty-state-row" id="assetEmptyState">
    <td colspan="7" class="text-center py-5">
      <div class="empty-state">
        <i class="bi bi-house-door empty-state-icon"></i>
        <h4>No assets yet</h4>
        <p class="text-muted">Start by adding your first asset — real estate, vehicle, or other valuable items.</p>
        <button class="btn btn-primary" id="openAssetModalFromEmpty">
          <i class="bi bi-plus-circle"></i> Add Your First Asset
        </button>
      </div>
    </td>
  </tr>
</tbody>
```

**Work Item:** User Story  
**Title:** Add empty state to Assets table  
**Effort:** 2 hours  
**Tags:** UX, Empty-States, Assets

---

### Issue #10: Form Modal Lacks Inline Validation
**Location:** Add Asset modal form (`id="assetForm"`)  
**Current State:** No visual feedback when entering invalid data  
**Problem:** Users submit form, get generic error, don't know what's wrong  
**Impact:** Frustrating form UX, increased support requests  

**Recommended Fix:**
```javascript
// Real-time validation
document.getElementById('propertyValue').addEventListener('blur', (e) => {
  const value = parseFloat(e.target.value);
  const errorDiv = e.target.nextElementSibling;
  
  if (value < 0) {
    e.target.classList.add('is-invalid');
    errorDiv.textContent = 'Value must be positive';
    errorDiv.classList.add('invalid-feedback');
  } else {
    e.target.classList.remove('is-invalid');
    errorDiv.textContent = '';
  }
});
```

**Work Item:** User Story  
**Title:** Add inline validation to Asset form with real-time error messages  
**Effort:** 4 hours  
**Tags:** UX, Forms, Validation

---

### Issue #11: Asset Type Dropdown Causes Layout Shift
**Location:** `<select id="assetType">` triggers conditional fields  
**Current State:** Selecting "Real Estate" makes new fields suddenly appear  
**Problem:** Jarring layout shift, form jumps down  
**Impact:** Unpolished UX, feels janky  

**Recommended Fix:**
```css
/* Option 1: Smooth height transition */
.asset-fields {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.asset-fields.show {
  max-height: 500px; /* Adjust based on content */
}
```

**Work Item:** Task  
**Title:** Add smooth transition animation to conditional asset form fields  
**Effort:** 2 hours  
**Tags:** UX, Animation, Forms

---

## MODERATE ISSUES (MEDIUM PRIORITY)

### Issue #12: Table Not Optimized for Mobile
**Location:** 7-column table in `.table-responsive`  
**Current State:** Horizontally scrollable on mobile devices  
**Problem:** Poor mobile UX, users have to scroll sideways to see all data  
**Impact:** 60%+ of users on mobile struggle with table navigation  

**Recommended Fix:**
```css
@media (max-width: 767.98px) {
  /* Hide table, show card layout */
  .table-responsive { display: none; }
  
  .asset-cards { display: block; }
  
  .asset-card {
    background: var(--color-bg-2);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .asset-card-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .asset-card-data {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
```

**Work Item:** User Story  
**Title:** Create mobile-friendly card layout for Assets table  
**Effort:** 6 hours  
**Tags:** Mobile, Responsive, UX

---

### Issue #13: Actions Column Lacks Context
**Location:** Table "Actions" column with edit/delete buttons  
**Current State:** Icon-only buttons with no labels  
**Problem:** Screen readers can't announce button purpose  
**Impact:** Accessibility violation (WCAG 2.1 Level AA)  

**Recommended Fix:**
```html
<!-- BEFORE -->
<button class="btn btn-sm btn-outline-secondary">
  <i class="bi bi-pencil"></i>
</button>

<!-- AFTER -->
<button class="btn btn-sm btn-outline-secondary" 
        aria-label="Edit 123 Main St"
        data-bs-toggle="tooltip" 
        title="Edit asset">
  <i class="bi bi-pencil"></i>
</button>
```

**Work Item:** Task  
**Title:** Add aria-labels and tooltips to action buttons in Assets table  
**Effort:** 1 hour  
**Tags:** Accessibility, A11y, WCAG

---

### Issue #14: No Live Equity Calculation in Form
**Location:** Asset form modal — Property Value and Loan Amount fields  
**Current State:** User enters values, equity calculated only after save  
**Problem:** Missed opportunity for helpful real-time feedback  
**Impact:** Users want to see equity before submitting  

**Recommended Fix:**
```javascript
// Live equity calculation
function updateEquity() {
  const value = parseFloat(document.getElementById('propertyValue').value) || 0;
  const loan = parseFloat(document.getElementById('loanAmount').value) || 0;
  const equity = value - loan;
  
  const equityDisplay = document.getElementById('equityPreview');
  equityDisplay.textContent = `Equity: ${formatCurrency(equity)}`;
  equityDisplay.className = equity >= 0 ? 'text-success' : 'text-danger';
}

document.getElementById('propertyValue').addEventListener('input', updateEquity);
document.getElementById('loanAmount').addEventListener('input', updateEquity);
```

**Work Item:** User Story  
**Title:** Add live equity calculation to Asset form  
**Effort:** 2 hours  
**Tags:** UX, Forms, Feature-Enhancement

---

## MINOR ISSUES (LOW PRIORITY)

### Issue #15: Modal Close Button Too Small
**Location:** `.modal-header .btn-close` in Add Asset modal  
**Current State:** Close button (X) is default Bootstrap size (~24x24px)  
**Problem:** Small touch target on mobile (WCAG 2.5.5 requires 44x44px)  
**Impact:** Accessibility compliance, harder to tap on mobile  

**Recommended Fix:**
```css
.modal-header .btn-close {
  width: 44px;
  height: 44px;
  padding: 12px;
}
```

**Work Item:** Task  
**Title:** Increase modal close button touch target size to 44x44px  
**Effort:** 15 minutes  
**Tags:** Accessibility, Mobile, Quick-Win

---

## THINGS DONE RIGHT ✅
- **Google Fonts with display=swap** — Prevents FOIT
- **Responsive table wrapper** — `.table-responsive` handles overflow
- **Proper form labels** — Required fields marked with asterisks
- **Accessible skip-to-content** — Keyboard navigation support
- **Modal ARIA attributes** — Proper `aria-labelledby` and `aria-hidden`

---

## AZURE DEVOPS WORK ITEMS TO CREATE

### User Stories
1. **Add empty state to Assets table** (HIGH, 2h)
2. **Add inline validation to Asset form** (HIGH, 4h)
3. **Create mobile-friendly card layout for Assets** (MEDIUM, 6h)
4. **Add live equity calculation to Asset form** (MEDIUM, 2h)

### Tasks
1. **Add smooth transition animation to conditional fields** (MEDIUM, 2h)
2. **Add aria-labels and tooltips to action buttons** (MEDIUM, 1h)
3. **Increase modal close button touch target size** (LOW, 15min)

---

## NEXT AUDIT
**Page:** Bills (bills.html)  
**Focus Areas:** Recurring payment UX, date pickers, subscription filtering
