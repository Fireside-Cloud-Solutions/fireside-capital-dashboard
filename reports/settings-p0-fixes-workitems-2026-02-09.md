# Settings Page P0 Fixes — Work Items

**Created by:** Capital (Orchestrator)  
**Date:** 2026-02-09 @ 7:47 AM EST  
**Source:** UI/UX Audit: Settings Page (2026-02-09-0720)  
**Priority:** P0 (Critical) — Must fix before release

---

## WI-SETTINGS-001: Add Loading State to Save Button

**Type:** Bug  
**Priority:** 1 (Critical)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  
**Estimated Effort:** 15 minutes

### Description
Save Settings button has NO loading state. User can click multiple times while save is in progress, causing duplicate requests and potential data corruption.

### Location
- `settings.html:157-159` — Save Settings button
- `app.js:2286-2309` — saveSettings() function

### Current Code
```html
<button class="btn btn-primary" id="saveSettingsBtn">
  <i class="bi bi-check-lg"></i> Save Settings
</button>
```

```javascript
async function saveSettings() {
  // ... CSRF check ...
  if (!currentUser) return;
  const goal = getRaw(document.getElementById('emergencyFundGoal').value);

  const { error } = await sb
      .from('settings')
      .upsert({ user_id: currentUser.id, emergency_fund_goal: goal });

  const statusEl = document.getElementById('settingsStatus');
  if (error) {
      statusEl.textContent = "Error saving settings.";
      statusEl.className = "ms-3 text-danger";
  } else {
      statusEl.textContent = "Settings saved!";
      statusEl.className = "ms-3 text-success";
      clearCache();
      await fetchAllDataFromSupabase(true);
  }
  setTimeout(() => { statusEl.textContent = ''; }, 3000);
}
```

### Expected Behavior
1. User clicks "Save Settings"
2. Button immediately shows loading spinner: `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`
3. Button is disabled during save (`disabled="true"`)
4. On success: Button returns to normal, success message shows in `#settingsStatus`
5. On error: Button returns to normal, error message shows

### Fix Required

**JavaScript (app.js:2286-2309):**
```javascript
async function saveSettings() {
  const btn = document.getElementById('saveSettingsBtn');
  const originalHTML = btn.innerHTML;
  const statusEl = document.getElementById('settingsStatus');
  
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!currentUser) return;
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
  
  try {
    const goal = getRaw(document.getElementById('emergencyFundGoal').value);

    const { error } = await sb
        .from('settings')
        .upsert({ user_id: currentUser.id, emergency_fund_goal: goal });

    if (error) throw error;
    
    // Success feedback
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    statusEl.className = 'ms-3 text-success';
    statusEl.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>Settings saved successfully';
    
    clearCache();
    await fetchAllDataFromSupabase(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => { statusEl.innerHTML = ''; }, 3000);
    
  } catch (err) {
    // Error feedback
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    statusEl.className = 'ms-3 text-danger';
    statusEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i>Failed to save settings';
    console.error(err);
  }
}
```

### Acceptance Criteria
- [x] Button shows spinner and "Saving..." text while request is in progress
- [x] Button is disabled during save (cannot click twice)
- [x] Button returns to original state after save completes
- [x] Success message shows checkmark icon
- [x] Error message shows warning icon
- [x] Status message auto-clears after 3 seconds (success only)

### Test Cases
1. Click Save with valid data → Should show loading state, then success
2. Click Save, try clicking again immediately → Should be disabled
3. Disconnect network, click Save → Should show error message
4. Save successfully, wait 3 seconds → Success message should disappear

---

## WI-SETTINGS-002: Add Input Validation to Emergency Fund Goal

**Type:** Bug  
**Priority:** 1 (Critical)  
**Area Path:** Fireside Capital\Data  
**Iteration:** Sprint 1  
**Estimated Effort:** 15 minutes

### Description
Emergency Fund Goal input has NO validation. User can enter negative numbers, letters, or absurdly large values. This can break the dashboard calculations and database constraints.

### Location
- `settings.html:151` — Emergency Fund Goal input field

### Current Code
```html
<input type="number" class="form-control" id="emergencyFundGoal" placeholder="e.g., 15000">
```

### Issues
1. No `min` attribute → User can enter negative numbers
2. No `max` attribute → User can enter 999999999999999
3. No `step` attribute → Allows decimal cents (should be whole dollars)
4. No inline validation feedback
5. No `required` attribute

### Expected Behavior
- Input accepts only positive numbers
- Reasonable maximum (e.g., $999,999,999)
- Whole dollar amounts (step="1")
- Inline validation feedback (red border if invalid)
- Required field validation

### Fix Required

**HTML (settings.html:151):**
```html
<input 
  type="number" 
  class="form-control" 
  id="emergencyFundGoal" 
  placeholder="e.g., 15000"
  min="0"
  max="999999999"
  step="1"
  aria-describedby="emergencyFundHelp emergencyFundError"
  required
>
<div class="invalid-feedback" id="emergencyFundError">
  Please enter a positive number (0-999,999,999)
</div>
```

**JavaScript (add to app.js event listeners section):**
```javascript
// Inline validation for emergency fund goal
const emergencyFundInput = document.getElementById('emergencyFundGoal');
if (emergencyFundInput) {
  emergencyFundInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0 || value > 999999999) {
      e.target.classList.add('is-invalid');
    } else {
      e.target.classList.remove('is-invalid');
    }
  });
  
  // Prevent form submission if invalid
  document.getElementById('saveSettingsBtn')?.addEventListener('click', (e) => {
    if (!emergencyFundInput.validity.valid) {
      e.preventDefault();
      emergencyFundInput.classList.add('is-invalid');
      emergencyFundInput.focus();
    }
  });
}
```

### Acceptance Criteria
- [x] Input has min="0" max="999999999" step="1" required
- [x] Input shows red border when invalid
- [x] Invalid feedback div appears below input
- [x] Cannot save with invalid value
- [x] Cannot enter negative numbers
- [x] Cannot enter more than 999,999,999

### Test Cases
1. Enter -1000 → Should show error
2. Enter 1000000000 → Should show error
3. Enter 15000.50 → Should round to 15001 or reject decimals
4. Leave blank, click Save → Should show required error
5. Enter valid value (e.g., 15000) → Should accept

---

## WI-SETTINGS-003: Add Empty State / Initial Load Behavior

**Type:** Bug  
**Priority:** 1 (Critical)  
**Area Path:** Fireside Capital\UX  
**Iteration:** Sprint 1  
**Estimated Effort:** 30 minutes

### Description
Input field is empty on initial page load. No indication if data is loading, if user has no settings, or if there's an error. Poor UX — user doesn't know what state the page is in.

### Location
- `settings.html:140-160` — Settings form
- `app.js:879-881` — Settings data pre-population

### Current Behavior
- Input field is empty on load (even if user has saved settings before)
- No skeleton loader
- No "last saved" timestamp
- No default value if never saved

### Expected Behavior
1. Show skeleton loader while fetching settings from Supabase
2. If settings exist, pre-fill input with value and show "Last saved: [timestamp]"
3. If no settings exist, show empty state: "Never saved — recommended: 3-6 months of expenses"
4. If error fetching, show error message

### Fix Required

**HTML (add after input field in settings.html:153):**
```html
<small class="text-muted mt-1 d-block" id="lastSaved"></small>
<div id="settingsLoadError" class="alert alert-danger mt-2 d-none" role="alert">
  Failed to load settings. Please refresh the page.
</div>
```

**JavaScript (modify app.js:879-881 and add loadSettings function):**
```javascript
async function loadSettings() {
  const input = document.getElementById('emergencyFundGoal');
  const lastSavedEl = document.getElementById('lastSaved');
  const errorEl = document.getElementById('settingsLoadError');
  
  if (!input) return;
  
  try {
    // Show loading skeleton
    input.disabled = true;
    input.placeholder = 'Loading...';
    
    const { data, error } = await sb
      .from('settings')
      .select('emergency_fund_goal, updated_at')
      .eq('user_id', currentUser.id)
      .single();
    
    input.disabled = false;
    input.placeholder = 'e.g., 15000';
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    if (data) {
      input.value = data.emergency_fund_goal || '';
      lastSavedEl.textContent = `Last saved: ${new Date(data.updated_at).toLocaleString()}`;
    } else {
      // No settings yet
      lastSavedEl.innerHTML = '<em>Never saved — recommended: 3-6 months of expenses</em>';
    }
    
    errorEl.classList.add('d-none');
    
  } catch (err) {
    input.disabled = false;
    errorEl.classList.remove('d-none');
    console.error('Failed to load settings:', err);
  }
}

// Call on page load (add to appropriate place in app.js)
if (document.getElementById('emergencyFundGoal')) {
  loadSettings();
}
```

### Acceptance Criteria
- [x] Input shows "Loading..." placeholder while fetching data
- [x] Input is disabled during load
- [x] If settings exist, value pre-fills and "Last saved" timestamp shows
- [x] If no settings, shows helpful empty state message
- [x] If error, shows error alert
- [x] After load completes, input is re-enabled

### Test Cases
1. Load page with existing settings → Should pre-fill with value and show timestamp
2. Load page as new user (no settings) → Should show empty state message
3. Load page with network disconnected → Should show error alert
4. Save settings, refresh page → Should show new value and updated timestamp

---

## WI-SETTINGS-004: Add ARIA Live Region to Status Messages

**Type:** Accessibility  
**Priority:** 2 (High — WCAG 4.1.3)  
**Area Path:** Fireside Capital\Accessibility  
**Iteration:** Sprint 1  
**Estimated Effort:** 5 minutes

### Description
Status messages (success/error) are dynamically injected but screen reader users are NOT notified. Violates WCAG 4.1.3 (Status Messages).

### Location
- `settings.html:161` — `#settingsStatus` span
- `app.js:2297-2301` — Status message updates

### Current Code
```html
<span id="settingsStatus"></span>
```

### Issue
No `role="status"` or `aria-live="polite"` attribute. Screen readers don't announce status changes.

### Fix Required

**HTML (settings.html:161):**
```html
<div 
  id="settingsStatus" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="ms-3"
></div>
```

### Acceptance Criteria
- [x] `#settingsStatus` has `role="status"`
- [x] `#settingsStatus` has `aria-live="polite"`
- [x] `#settingsStatus` has `aria-atomic="true"`
- [x] Screen reader announces "Settings saved successfully" when save completes
- [x] Screen reader announces error message if save fails

### Test Cases
1. Use NVDA/JAWS screen reader
2. Click Save Settings
3. Screen reader should announce status message without manual navigation

---

## Summary

| Work Item | Priority | Effort | Type | Status |
|-----------|----------|--------|------|--------|
| WI-SETTINGS-001 | P0 | 15 min | Bug | 🔴 Not Started |
| WI-SETTINGS-002 | P0 | 15 min | Bug | 🔴 Not Started |
| WI-SETTINGS-003 | P0 | 30 min | Bug | 🔴 Not Started |
| WI-SETTINGS-004 | P1 | 5 min | A11y | 🔴 Not Started |

**Total Estimated Effort:** 1 hour 5 minutes

**Recommended Sprint:** Sprint 1 (Current)  
**Blocking:** No (page works but UX is poor)  
**Risk:** Medium (user can corrupt data with invalid input)

---

## Implementation Order

1. **WI-SETTINGS-002** (Input validation) — Fix first to prevent data corruption
2. **WI-SETTINGS-001** (Loading state) — Prevents duplicate saves
3. **WI-SETTINGS-003** (Empty state) — Improves initial UX
4. **WI-SETTINGS-004** (ARIA live) — Accessibility compliance

---

**Created by:** Capital (Orchestrator)  
**Report Location:** `reports/settings-p0-fixes-workitems-2026-02-09.md`  
**Azure DevOps Project:** https://dev.azure.com/fireside365/Fireside%20Capital  
**Next Step:** Import to Azure DevOps and assign to Builder agent
