# UI/UX Audit — Settings Page
**Date:** February 16, 2026 07:10 AM EST  
**Auditor:** Capital (Architect Agent)  
**Page:** settings.html  
**Status:** ✅ Complete  
**Previous Audit:** February 13, 2026 (3 days ago)

---

## Executive Summary

The **Settings page** remains the simplest page in Fireside Capital with only one user-configurable option (Emergency Fund Goal). While the page is functional and follows design system conventions, it continues to feel incomplete compared to user expectations for a financial app settings page.

**Overall Grade:** B- (75/100)
- ✅ **Strong**: Page header structure, auth handling, clean UI, password reset flow
- ⚠️ **Needs Work**: Feature depth, form validation, save feedback, empty state

**Changes Since Last Audit (Feb 13):**
- ✅ Inline CSS extracted (commit 505bd28)
- ✅ Scripts optimized with defer (commits 5bff7a1, 7831793)
- ✅ Modal footer gap fixed (FC-UIUX-015) — now 12px
- ❌ Core issues (ISSUE-SET001 through SET004) **NOT YET ADDRESSED**

---

## ✅ **Wins (What's Working Well)**

### 1. **Proper Page Header Structure**
- **Location**: `settings.html` line 82
- Uses `.page-header` container matching design system
- Consistent with Dashboard, Assets, Bills, Debts, Reports, etc.
- Auth controls properly positioned

**Evidence:**
```html
<div class="page-header">
  <h2>Settings</h2>
  <div><!-- Auth controls --></div>
</div>
```

### 2. **Clean, Minimal UI**
- Single card with `.card-max-width-md` (prevents ultra-wide forms)
- Proper 24px padding (`.card-body-padded`)
- Icon in section heading adds visual interest
- Good white space and breathing room

### 3. **Password Reset Flow Included**
- Modal at bottom of page (lines 189-215)
- Static backdrop prevents dismissal
- Proper form validation (6-character minimum)
- Confirmation field for new password

### 4. **Accessibility Features**
- Proper semantic HTML (`<label for="...">`)
- Skip link for keyboard navigation
- ARIA labels on auth buttons
- Input group with currency symbol is accessible

### 5. **Security & Best Practices**
- Rate limiting on save action (prevents spam)
- No inline event handlers (CSP-safe)
- Auth state handling (hides content when logged out)
- XSS protection via `escapeHtml()` in app.js

---

## 🔍 **Issues Found**

### **FC-UIUX-023 — Severely Under-Featured Settings Page**
- **Location**: `app/settings.html` lines 123-143
- **Issue**: Only ONE configurable setting (Emergency Fund Goal) — missing essential finance app settings
- **Expected Settings Sections**:
  1. **Financial Goals** (current — ✅ exists)
     - Emergency fund goal ✅
     - Savings goal target (missing)
     - Debt payoff target (missing)
  
  2. **Notifications** (missing entirely)
     - Bill reminder timing (3/5/7 days before)
     - Email notifications toggle
     - Push notifications (PWA)
     - Budget alert thresholds
  
  3. **Account Security** (missing entirely)
     - Change password
     - Two-factor authentication toggle
     - Active sessions viewer
     - Login history
  
  4. **Display Preferences** (missing entirely)
     - Default landing page
     - Date format (MM/DD/YYYY vs DD/MM/YYYY)
     - Currency format
     - First day of week
  
  5. **Data Management** (missing entirely)
     - Connected bank accounts list
     - Disconnect Plaid accounts
     - Export all data (CSV/JSON)
     - Delete account with confirmation
  
  6. **Privacy** (missing entirely)
     - Session timeout preference
     - Data sharing preferences
     - Download my data (GDPR compliance)
     - Activity log

**Impact**: 
- Confusing: "Settings" page feels incomplete
- Users can't control notifications despite bell icon in header
- No way to manage connected accounts after Plaid link
- Missing security features users expect

**Priority**: 🟠 **Medium-High** (P2)  
**Effort**: 12-16 hours (full settings expansion with 6 sections)

**Recommendation**: 
- Phase 1 (4h): Add Notifications section + Connected Accounts
- Phase 2 (4h): Add Display Preferences + Account Security
- Phase 3 (4h): Add Data Management + Privacy

---

### **FC-UIUX-024 — No Save State Visual Feedback**
- **Location**: `app/settings.html` line 142 (`#settingsStatus` span)
- **Issue**: When user clicks "Save Settings", there's NO visual feedback
  - No loading spinner during save
  - No success message or checkmark
  - No error state if save fails
  - `#settingsStatus` span exists but is empty

**Current Code (app.js line 2320-2340):**
```javascript
async function saveSettings() {
  // Rate limiting check ✓
  // Supabase update query ✓
  // But settingsStatus.innerHTML is NEVER SET ✗
}
```

**User Impact**:
- Uncertainty: "Did my changes save?"
- Users may click "Save" multiple times
- No confirmation of success/failure

**Priority**: 🟡 **Medium** (P2)  
**Effort**: 20 minutes

**Fix**:
```javascript
async function saveSettings() {
  const settingsStatus = document.getElementById('settingsStatus');
  const saveBtn = document.getElementById('saveSettingsBtn');
  
  // Show loading state
  settingsStatus.innerHTML = '<span class="text-muted"><i class="spinner-border spinner-border-sm me-1"></i>Saving...</span>';
  saveBtn.disabled = true;
  
  try {
    // ... Supabase update logic ...
    
    // Show success
    settingsStatus.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Saved successfully!</span>';
    setTimeout(() => { settingsStatus.innerHTML = ''; }, 3000);
  } catch (error) {
    // Show error
    settingsStatus.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle-fill me-1"></i>Save failed. Try again.</span>';
  } finally {
    saveBtn.disabled = false;
  }
}
```

---

### **FC-UIUX-025 — No Form Validation for Emergency Fund Goal**
- **Location**: `app/settings.html` line 131
- **Issue**: Input accepts ANY number with no validation
  - No minimum value (can enter $0 or $1)
  - No maximum value (can enter $999,999,999)
  - No guidance on reasonable ranges
  - No comma formatting for large numbers

**Current HTML:**
```html
<input type="number" class="form-control" id="emergencyFundGoal" 
       placeholder="e.g., 15000" min="100" max="1000000" step="100">
```

**Good:** min/max/step attributes are present  
**Bad:** No JavaScript validation to provide feedback

**User Impact**:
- Can accidentally enter $10 instead of $10,000
- No warning if value is unrealistically low/high
- Poor UX for large numbers (no comma separators in number inputs)

**Priority**: 🟡 **Medium** (P2)  
**Effort**: 30 minutes

**Fix**:
```javascript
// In saveSettings(), before Supabase update:
const goal = parseInt(emergencyFundGoal.value);

if (goal < 500) {
  settingsStatus.innerHTML = '<span class="text-warning"><i class="bi bi-info-circle-fill me-1"></i>Tip: Most experts recommend at least 3-6 months of expenses.</span>';
  // Allow save but show warning
}

if (goal > 100000) {
  settingsStatus.innerHTML = '<span class="text-info"><i class="bi bi-info-circle-fill me-1"></i>Great goal! Make sure it aligns with your income.</span>';
}
```

---

### **FC-UIUX-026 — Missing Empty State for First-Time Users**
- **Location**: `app/settings.html` — no empty state markup
- **Issue**: When new user visits Settings with no goal set, they see:
  - Empty input field with placeholder "e.g., 15000"
  - Small text: "How much you want saved for emergencies"
  - No visual guidance or educational context

**Contrast**: Dashboard, Bills, Income, Reports all have **helpful empty states** explaining purpose and providing CTAs

**User Impact**:
- New users may skip setting a goal (don't understand importance)
- No educational context about 3-6 months rule
- Inconsistent with empty state pattern used elsewhere

**Priority**: 🟡 **Medium** (P2)  
**Effort**: 30 minutes

**Fix**:
```html
<!-- Add before the card -->
<div id="settingsEmptyState" class="empty-state d-none">
  <i class="bi bi-bullseye empty-state-icon"></i>
  <h5 class="empty-state-title">Set Your Financial Goals</h5>
  <p class="empty-state-description">
    Start by setting an emergency fund goal. Financial experts recommend 
    saving 3-6 months of living expenses for unexpected situations.
  </p>
  <button class="btn btn-primary" onclick="document.getElementById('emergencyFundGoal').focus()">
    <i class="bi bi-plus-lg"></i> Set Emergency Fund Goal
  </button>
</div>
```

Show empty state when `emergency_fund_goal IS NULL` in database, hide card until button click.

---

### **FC-UIUX-027 — Inconsistent Section Heading Style**
- **Location**: `app/settings.html` line 125
- **Issue**: Section heading uses inline style instead of CSS class

**Current Code:**
```html
<h5 class="mb-4 heading-no-transform" style="font-size: var(--text-h5);">
  <i class="bi bi-bullseye me-2 icon-primary"></i>Financial Goals
</h5>
```

**Problem**: 
- Inline `style` attribute breaks separation of concerns
- `font-size: var(--text-h5)` is already defined in `.heading-no-transform` class (redundant)
- Other pages don't use inline styles for section headings

**Expected**: Use CSS classes only (no inline styles)

**Priority**: 🟢 **Low** (P3)  
**Effort**: 2 minutes

**Fix**:
```html
<h5 class="mb-4 heading-no-transform">
  <i class="bi bi-bullseye me-2 icon-primary"></i>Financial Goals
</h5>
```

Remove `style="font-size: var(--text-h5);"` — it's already handled by `.heading-no-transform` class.

---

### **FC-UIUX-028 — Reset Password Modal Placement**
- **Location**: `app/settings.html` lines 189-215
- **Issue**: Password reset modal is hardcoded at bottom of settings.html
- **Expected**: Modal should be globally available (triggered from "Forgot Password" link in login modal on ANY page)

**Current Behavior**: Modal only exists on Settings page

**User Impact**: 
- Low — modal works correctly on Settings page
- Architectural concern: password reset is a global auth feature, not settings-specific

**Priority**: 🟢 **Low** (P3) — Tech debt  
**Effort**: 1 hour (refactor to shared component in app.js)

**Recommendation**: Move to app.js as shared modal (like login/signup), trigger via URL hash or event

---

## 📋 **Previous Audit Findings (Feb 13) — Status Check**

| Issue ID | Title | Status | Notes |
|----------|-------|--------|-------|
| ISSUE-SET001 | Minimal Settings Options | ❌ **NOT FIXED** | Renamed to FC-UIUX-023 |
| ISSUE-SET002 | No Empty State | ❌ **NOT FIXED** | Renamed to FC-UIUX-026 |
| ISSUE-SET003 | No Save Feedback | ❌ **NOT FIXED** | Renamed to FC-UIUX-024 |
| ISSUE-SET004 | No Form Validation | ❌ **NOT FIXED** | Renamed to FC-UIUX-025 |
| ISSUE-SET005 | Modal Placement | ❌ **NOT FIXED** | Renamed to FC-UIUX-028 |

**None of the core UX issues from Feb 13 audit were addressed** — only infrastructure improvements (inline CSS extraction, script optimization).

---

## 🆕 **New Issues Found This Audit**

| Issue ID | Title | Priority | Effort |
|----------|-------|----------|--------|
| FC-UIUX-027 | Inline style on section heading | P3 | 2 min |

**All other issues (FC-UIUX-023 through FC-UIUX-028) are carried over from Feb 13 audit with updated IDs.**

---

## 📊 **Design System Compliance**

| Category | Score | Notes |
|----------|-------|-------|
| Page Header Structure | A | ✓ Proper .page-header with auth controls |
| Button Hierarchy | A | ✓ Primary button for save action |
| Spacing Consistency | A | ✓ 24px card padding, 8px grid |
| Typography Hierarchy | B | ⚠️ Inline style on section heading |
| Form Design | C | ✗ Minimal validation, no feedback |
| Empty States | F | ✗ No empty state for new users |
| Feature Completeness | D | ✗ Only 1 setting (missing 5+ sections) |
| Accessibility | A | ✓ Labels, ARIA, semantic HTML |
| Responsive Design | A | ✓ Card max-width, mobile-friendly |
| Interaction Polish | C | ✗ No save feedback, no validation hints |

**Overall Grade:** B- (75/100)

---

## 🔧 **Recommended Fix Priority**

### **Phase 1: Quick Wins (1.5 hours) — RECOMMENDED FOR NEXT SPRINT**
1. **FC-UIUX-024** — Add save state feedback (20 min) — High user impact
2. **FC-UIUX-025** — Add form validation hints (30 min) — Prevents data entry errors
3. **FC-UIUX-026** — Add empty state for new users (30 min) — UX consistency
4. **FC-UIUX-027** — Remove inline style (2 min) — Code cleanliness

**Total: ~1.5 hours for 4 issues**

### **Phase 2: Feature Expansion (12-16 hours) — Product Roadmap**
5. **FC-UIUX-023** — Expand settings sections (12-16h) — Bring to feature parity

### **Phase 3: Tech Debt (1 hour) — Nice-to-have**
6. **FC-UIUX-028** — Refactor password reset modal (1h) — Architectural cleanup

---

## 🎯 **Azure DevOps Work Items to Create**

| ID | Type | Title | Priority | Effort |
|----|------|-------|----------|--------|
| FC-UIUX-023 | User Story | Expand Settings page with 6 essential sections | P2 | 12-16h |
| FC-UIUX-024 | Task | Add save state visual feedback (loading/success/error) | P2 | 20 min |
| FC-UIUX-025 | Task | Add form validation hints for Emergency Fund Goal | P2 | 30 min |
| FC-UIUX-026 | Task | Add empty state for new users with no goal set | P2 | 30 min |
| FC-UIUX-027 | Task | Remove inline style from section heading | P3 | 2 min |
| FC-UIUX-028 | Task | Refactor password reset modal to shared component | P3 | 1h |

**Quick Wins Total:** 1 hour 22 minutes (FC-UIUX-024, 025, 026, 027)  
**Long-term Work:** 12-17 hours (FC-UIUX-023, 028)

---

## 🚀 **Next Steps**

1. **Immediate (This Sprint):**
   - Assign FC-UIUX-024 through FC-UIUX-027 to Builder (1.5 hours total)
   - Test save feedback, validation, empty state on live site

2. **Short-term (Next Sprint):**
   - Product decision: Which settings sections to add first?
   - Design wireframes for expanded Settings page
   - Break FC-UIUX-023 into smaller tasks (Notifications, Security, etc.)

3. **Long-term (Backlog):**
   - FC-UIUX-028: Refactor password reset modal
   - Comprehensive mobile testing for Settings page
   - A/B test empty state messaging

---

## 📝 **Testing Checklist**

After fixes are applied, verify:
- [ ] Save button shows loading spinner during save
- [ ] Success message appears and auto-dismisses after 3 seconds
- [ ] Error message appears if save fails
- [ ] Form shows validation hint for low/high emergency fund values
- [ ] Empty state shows for new users with no goal set
- [ ] Empty state CTA focuses the input field
- [ ] Section heading has no inline styles
- [ ] Mobile layout works correctly (input group, buttons)
- [ ] Keyboard navigation works (tab order, focus states)
- [ ] Screen reader announces save status changes

---

## 📍 **Comprehensive Audit Progress**

| Page | Status | Last Audit | Grade | Issues Found |
|------|--------|------------|-------|--------------|
| Dashboard | ✅ | Feb 16 | B+ | 2 (FC-UIUX-013, 014) |
| Assets | ✅ | Feb 10-15 | A | 0 |
| Bills | ✅ | Feb 15 | A | 0 |
| Investments | ✅ | Feb 10 | A | 0 |
| Debts | ✅ | Feb 10-15 | A | 0 |
| Reports | ✅ | Feb 16 | B | 5 (FC-UIUX-018-022) |
| **Settings** | ✅ | **Feb 16** | **B-** | **6 (FC-UIUX-023-028)** |
| Budget | ⏳ | Feb 15 | TBD | TBD |
| Transactions | ⏳ | Feb 14 | TBD | TBD |
| Income | ⏳ | Feb 14-15 | TBD | TBD |
| Friends | ⏳ | Feb 12 | TBD | TBD |

**Progress:** 7/11 pages audited (64%)  
**Remaining:** Budget, Transactions, Income, Friends (4 pages)

---

## 🎯 **Next Audit Target**

**Recommended:** Budget page (budget.html)  
**Reason:** High visibility, user-facing feature, likely has form validation needs

---

**Audit Completed:** February 16, 2026 07:10 AM EST  
**Report Size:** ~10 KB  
**Auditor:** Capital (Architect Agent)  
**Next Review:** Budget page
