# UI/UX Work Items — Pending Implementation
**Date:** February 13, 2026 — 4:09 AM EST  
**Status:** Awaiting Azure DevOps work item creation

---

## 🎯 REPORTS PAGE ISSUES (4 items)

### REP001 — Missing Empty State for Reports
**Type:** User Story  
**Area:** Reports  
**Priority:** 2 (Medium)  
**Effort:** 2 Story Points (~15 minutes)  
**Tags:** design, ux, empty-state, reports  
**Description:**  
As a new user, I want to see helpful guidance when the Reports page has no data, so I know what to do next.

**Acceptance Criteria:**
- [ ] Add empty state HTML to reports.html (icon, headline, description, CTAs)
- [ ] Add toggle logic in reports.js to show empty state when snapshots.length === 0
- [ ] Empty state links to Assets, Investments, Income pages
- [ ] Test with fresh account (no data)
- [ ] Screenshot for documentation

**Implementation Notes:**
```html
<div id="emptyStateReports" class="empty-state">
  <i class="bi bi-graph-up-arrow empty-state-icon"></i>
  <h4>Your Financial Reports Await</h4>
  <p>Reports will populate once you add your financial data.</p>
  <div class="empty-state-actions">
    <a href="assets.html" class="btn btn-primary">Add Assets</a>
    <a href="investments.html" class="btn btn-outline-secondary">Add Investments</a>
  </div>
</div>
```

---

### REP002 — Export Button Missing Accessible Label
**Type:** Task  
**Area:** Reports  
**Priority:** 2 (Medium)  
**Effort:** 1 Story Point (~2 minutes)  
**Tags:** accessibility, wcag, aria, reports  
**Description:**  
Update Export button aria-label to be more descriptive for screen readers.

**Acceptance Criteria:**
- [ ] Change aria-label from "Export reports" to "Export financial report as CSV"
- [ ] Add title attribute with tooltip text
- [ ] Verify with NVDA/JAWS screen reader

**Current Code (reports.html line 114):**
```html
<button class="btn btn-primary" aria-label="Export reports">
```

**Fixed Code:**
```html
<button class="btn btn-primary" aria-label="Export financial report as CSV" title="Download current report data as CSV">
```

---

### REP003 — No Mobile Responsiveness for Charts
**Type:** User Story  
**Area:** Reports  
**Priority:** 2 (Medium)  
**Effort:** 5 Story Points (~45 minutes)  
**Tags:** design, mobile, responsive, charts, reports  
**Description:**  
As a mobile user, I want charts to be readable and optimized for small screens.

**Acceptance Criteria:**
- [ ] Add responsive chart config in reports.js (larger fonts on mobile)
- [ ] Add CSS utility to hide less critical charts on mobile (.mobile-hide)
- [ ] Test on iPhone 14 Pro and Galaxy S23 via browser automation
- [ ] Verify legend readability
- [ ] Verify axis labels don't overlap
- [ ] Screenshot mobile charts for documentation

**Implementation Notes:**
```javascript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { size: window.innerWidth < 576 ? 14 : 12 }
      }
    }
  }
};
```

---

### REP004 — No "Last Updated" Timestamp
**Type:** Task  
**Area:** Reports  
**Priority:** 3 (Low)  
**Effort:** 2 Story Points (~10 minutes)  
**Tags:** ux, transparency, reports  
**Description:**  
Add timestamp display showing when report data was last refreshed.

**Acceptance Criteria:**
- [ ] Add timestamp HTML below summary cards
- [ ] Update timestamp in reports.js when loading snapshot
- [ ] Format as "Last updated: February 12, 2026 at 5:30 AM"
- [ ] Test with real data

**Implementation Notes:**
```html
<p class="text-muted small text-end mb-0">
  <i class="bi bi-clock"></i> Last updated: <span id="reportLastUpdated">--</span>
</p>
```

---

## 🔧 SETTINGS PAGE ISSUES (12 items)

### ARCH-SETTINGS-001 — Settings Logic Embedded in Monolithic app.js
**Type:** Technical Debt  
**Area:** Settings  
**Priority:** 0 (Critical)  
**Effort:** 13 Story Points (~4 hours)  
**Tags:** architecture, refactor, settings  
**Description:**  
Extract settings logic from app.js into dedicated settings.js module for better maintainability.

**Acceptance Criteria:**
- [ ] Create assets/js/settings.js
- [ ] Move all settings-related functions from app.js
- [ ] Update settings.html to load settings.js
- [ ] Verify Emergency Fund Goal still works
- [ ] No regression in other pages

---

### FEAT-SETTINGS-001 — Only 1 Setting Exists (Emergency Fund Goal)
**Type:** Feature  
**Area:** Settings  
**Priority:** 1 (High)  
**Effort:** 21 Story Points (~8 hours)  
**Tags:** feature, settings, ux  
**Description:**  
Build out full settings panel with notification preferences, theme toggle, currency format, date format, and budget start date.

**Missing Settings:**
1. **Notification Preferences** (email alerts, payment reminders, weekly reports)
2. **Theme Toggle** (dark/light mode — currently only dark)
3. **Currency Format** (USD, EUR, GBP, etc.)
4. **Date Format** (MM/DD/YYYY vs DD/MM/YYYY)
5. **Budget Start Date** (1st of month, 15th, custom)

**Acceptance Criteria:**
- [ ] Add UI for each setting group
- [ ] Store preferences in Supabase settings table
- [ ] Apply theme toggle dynamically
- [ ] Apply currency/date format across all pages
- [ ] Test all settings persist correctly

---

### FEAT-SETTINGS-002 — No Account Management Section
**Type:** Feature  
**Area:** Settings  
**Priority:** 1 (High)  
**Effort:** 13 Story Points (~6 hours)  
**Tags:** feature, settings, security, account  
**Description:**  
Add account management section: change email, change password, delete account.

**Acceptance Criteria:**
- [ ] Add "Account" section to settings.html
- [ ] Change Email form (with verification)
- [ ] Change Password form (require current password)
- [ ] Delete Account button (with confirmation modal + grace period)
- [ ] Test all flows end-to-end
- [ ] Handle Supabase auth errors gracefully

---

### FEAT-SETTINGS-003 — No Data Export/Import
**Type:** Feature  
**Area:** Settings  
**Priority:** 1 (High)  
**Effort:** 8 Story Points (~4 hours)  
**Tags:** feature, settings, data-portability  
**Description:**  
Add "Export All Data" button to download complete financial data as JSON backup.

**Acceptance Criteria:**
- [ ] Add "Data & Privacy" section to settings.html
- [ ] Export button generates JSON with all user data (assets, bills, debts, income, investments, transactions, snapshots)
- [ ] Filename format: `fireside-capital-backup-YYYY-MM-DD.json`
- [ ] Test export with real data
- [ ] Add optional Import functionality (v2 scope — not required for MVP)

---

### UX-SETTINGS-001 — No Loading Skeleton States
**Type:** Task  
**Area:** Settings  
**Priority:** 1 (High)  
**Effort:** 5 Story Points (~2 hours)  
**Tags:** ux, loading, skeleton, settings  
**Description:**  
Add skeleton loading states while fetching settings from Supabase.

**Acceptance Criteria:**
- [ ] Add skeleton HTML for Emergency Fund Goal input
- [ ] Show skeleton on page load
- [ ] Hide skeleton when data loads
- [ ] Test with slow network (throttle in DevTools)

---

### UX-SETTINGS-002 — No Success Toast When Settings Saved
**Type:** Task  
**Area:** Settings  
**Priority:** 1 (High)  
**Effort:** 3 Story Points (~1 hour)  
**Tags:** ux, feedback, toast, settings  
**Description:**  
Show success toast notification when settings are saved successfully.

**Acceptance Criteria:**
- [ ] Add toast component (if not already in components.css)
- [ ] Show "Settings saved successfully" toast
- [ ] Auto-dismiss after 3 seconds
- [ ] Test with Emergency Fund Goal save

---

### FORM-SETTINGS-001 — No Inline Validation for Emergency Fund Goal
**Type:** Task  
**Area:** Settings  
**Priority:** 2 (Medium)  
**Effort:** 3 Story Points (~1 hour)  
**Tags:** validation, forms, settings  
**Description:**  
Add inline validation for Emergency Fund Goal input (must be > 0, max $10M).

**Acceptance Criteria:**
- [ ] Show error message if value < 0
- [ ] Show error message if value > 10,000,000
- [ ] Disable Save button while invalid
- [ ] Test edge cases (negative, zero, very large numbers)

---

### UX-SETTINGS-003 — No "Last Saved" Timestamp
**Type:** Task  
**Area:** Settings  
**Priority:** 2 (Medium)  
**Effort:** 3 Story Points (~1 hour)  
**Tags:** ux, transparency, settings  
**Description:**  
Add "Last saved: [timestamp]" below Save Settings button.

**Acceptance Criteria:**
- [ ] Display timestamp after successful save
- [ ] Format as "Last saved: February 12, 2026 at 5:30 AM"
- [ ] Update timestamp dynamically when re-saving

---

### FEAT-SETTINGS-004 — No Privacy/Security Settings
**Type:** Feature  
**Area:** Settings  
**Priority:** 2 (Medium)  
**Effort:** 21 Story Points (~8 hours)  
**Tags:** feature, settings, security, privacy  
**Description:**  
Add security section: 2FA setup, active sessions management, login history.

**Acceptance Criteria:**
- [ ] Add "Security & Privacy" section
- [ ] Two-Factor Authentication setup (TOTP via authenticator app)
- [ ] Active Sessions list (device, location, last active)
- [ ] Login History table (last 10 logins with IP, device, date)
- [ ] Test 2FA flow end-to-end

---

### A11Y-SETTINGS-001 — No Keyboard Shortcuts Help Panel
**Type:** Task  
**Area:** Settings  
**Priority:** 2 (Medium)  
**Effort:** 5 Story Points (~2 hours)  
**Tags:** accessibility, keyboard, settings  
**Description:**  
Add "Keyboard Shortcuts" help panel in settings (or accessible via `?` key).

**Acceptance Criteria:**
- [ ] Add "Keyboard Shortcuts" section to settings.html
- [ ] Document common shortcuts (S = save, Esc = close modal, etc.)
- [ ] Optional: Global `?` key to open help modal

---

### POLISH-SETTINGS-001 — No Settings Search/Filter
**Type:** Task  
**Area:** Settings  
**Priority:** 3 (Low)  
**Effort:** 8 Story Points (~3 hours)  
**Tags:** polish, ux, settings  
**Description:**  
Add search box to filter settings (needed when settings grow to 20+).

**Acceptance Criteria:**
- [ ] Add search input at top of settings page
- [ ] Filter settings sections by keyword
- [ ] Highlight matching settings
- [ ] Clear search button

---

### POLISH-SETTINGS-002 — No "Reset to Defaults" Button
**Type:** Task  
**Area:** Settings  
**Priority:** 3 (Low)  
**Effort:** 3 Story Points (~1 hour)  
**Tags:** polish, ux, settings  
**Description:**  
Add "Reset to Defaults" button to restore all settings to factory defaults.

**Acceptance Criteria:**
- [ ] Add "Reset to Defaults" button (secondary style)
- [ ] Show confirmation modal before resetting
- [ ] Reset all settings to defaults in Supabase
- [ ] Show success toast after reset

---

## 📊 WORK ITEM SUMMARY

| Page | Total Issues | P0 | P1 | P2 | P3 | Total Effort |
|------|--------------|----|----|----|----|--------------|
| Reports | 4 | 0 | 0 | 3 | 1 | ~1.5 hours |
| Settings | 12 | 1 | 5 | 4 | 2 | ~43 hours |
| **TOTAL** | **16** | **1** | **5** | **7** | **3** | **~44.5 hours** |

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1 (Quick Wins) — 2-3 hours
1. REP002 — Export button aria-label (2 min)
2. REP004 — Reports timestamp (10 min)
3. REP001 — Reports empty state (15 min)
4. UX-SETTINGS-002 — Settings success toast (1 hour)
5. UX-SETTINGS-003 — Settings last saved timestamp (1 hour)

### Sprint 2 (Reports Mobile) — 1 hour
6. REP003 — Mobile chart responsiveness (45 min)

### Sprint 3 (Settings Architecture) — 4 hours
7. ARCH-SETTINGS-001 — Extract settings.js module (4 hours)

### Sprint 4 (Settings Features) — 18 hours
8. FEAT-SETTINGS-001 — Add more settings (notifications, theme, currency, date, budget start) (8 hours)
9. FEAT-SETTINGS-002 — Account management (change email/password, delete account) (6 hours)
10. FEAT-SETTINGS-003 — Data export/import (4 hours)

### Sprint 5 (Polish) — Remaining P2/P3 items (~21 hours)

---

## ✅ NEXT ACTIONS

1. **Create Azure DevOps work items** from this document (requires `az` CLI or manual creation)
2. **Spawn Builder sub-agent** to implement Sprint 1 quick wins (REP001, REP002, REP004)
3. **Test mobile chart rendering** on real devices for REP003
4. **Review Settings architecture** before implementing FEAT-SETTINGS-001

---

**Status:** 📝 Documented — Ready for work item creation  
**Last Updated:** 2026-02-13 04:09 AM EST
