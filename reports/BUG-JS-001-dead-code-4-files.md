# BUG-JS-001 — Dead Code: 4 Unused JavaScript Files (39 KB)

**Priority:** P0 (server.js security risk) + P2 (other files)  
**Found:** 2026-02-11 07:00 AM (Sprint QA comprehensive audit)  
**Impact:** HIGH — 39 KB dead code + security risk  
**Effort:** 5 min (server.js) + 10-12 hours (toast refactor) OR 5 min (delete unused)

---

## 📋 ISSUE SUMMARY

Four JavaScript files exist in `app/assets/js/` but are never linked or used:

1. **server.js** (6.7 KB) — Node.js Express server (SECURITY RISK)
2. **toast-notifications.js** (8.3 KB) — Toast system (could replace 56 alert() calls)
3. **chart-config.js** (11.1 KB) — Chart.js configuration utilities
4. **error-messages.js** (11.1 KB) — Error message helpers

**Total Dead Code:** 39 KB

---

## ✅ RESOLVED: server.js Moved Out of Web-Accessible Folder

**File:** `server.js` (180 lines)  
**Issue:** Node.js backend server file was in client-side assets folder  
**Status:** ✅ **FIXED** in commit `316cdd5` (Feb 11, 2026)

**What It Was:**
- Express.js server for Plaid Link token generation
- Was in `app/assets/js/server.js` (web-accessible) ❌
- Should live in project root (not web-accessible) ✅

**Previous Location:** `app/assets/js/server.js` ❌  
**Current Location:** `C:\Users\chuba\fireside-capital\server.js` ✅

**Fix Applied:**
```bash
# Commit 316cdd5 moved file to project root
git mv app/assets/js/server.js server.js
```

**Result:** ✅ Security best practice resolved — file no longer in web root

---

## 🟡 P2: toast-notifications.js Not Linked

**File:** `app/assets/js/toast-notifications.js` (235 lines, 8.3 KB)  
**Issue:** Well-written toast notification system exists but is never used

**What It Does:**
- Show success/error/warning/info toast notifications
- Auto-dismiss after timeout
- Stacking support for multiple toasts
- MUCH better UX than `alert()` popups

**Current State:**
- File exists with 10 functions
- Never linked in any HTML file
- App uses `alert()` 56 times instead

**Impact:**
- 56 `alert()` calls block user interactions (modal dialogs)
- Poor UX compared to non-blocking toast notifications
- Dead code shipped to users (8.3 KB)

**Options:**

### Option A: Link Toast System and Refactor (RECOMMENDED)
**What:** Replace all 56 `alert()` calls with toast notifications  
**Effort:** 10-12 hours  
**Files to modify:** 10+ JavaScript files  
**Result:** Modern non-blocking notifications throughout app

**Steps:**
1. Add `<script src="assets/js/toast-notifications.js">` to all pages
2. Search for all `alert(` calls (56 total)
3. Replace with `showSuccessToast()`, `showErrorToast()`, etc.
4. Test all notification scenarios

**Example Refactor:**
```javascript
// Before
alert('Asset saved successfully!');

// After
showSuccessToast('Asset saved successfully!');
```

### Option B: Delete Dead Code (QUICK FIX)
**What:** Delete toast-notifications.js and keep using `alert()`  
**Effort:** 5 minutes  
**Result:** -8.3 KB payload, cleaner codebase

---

## ✅ RESOLVED: chart-config.js Deleted

**File:** `app/assets/js/chart-config.js` (360 lines, 11.1 KB)  
**Issue:** Chart.js configuration utilities, never linked  
**Status:** ✅ **DELETED** (Feb 11, 2026)

**What It Was:**
- Default chart options
- Color palettes
- Responsive breakpoint helpers
- Chart.js plugin configurations

**Why Deleted:**
- `charts.js` works perfectly without it (has inline configs)
- Duplicate configuration logic
- Never referenced in any HTML file
- Confirmed dead code

**Result:** ✅ -11.1 KB payload, cleaner codebase

---

## ✅ RESOLVED: error-messages.js Deleted

**File:** `app/assets/js/error-messages.js` (308 lines, 11.1 KB)  
**Issue:** Error message formatting utilities, never linked  
**Status:** ✅ **DELETED** (Feb 11, 2026)

**What It Was:**
- `getErrorMessage()` — Format error objects
- `formatSupabaseError()` — Parse Supabase errors
- `showErrorDialog()` — Display error modals
- `logErrorToConsole()` — Structured error logging

**Why Deleted:**
- App uses inline error handling (works fine)
- Never referenced in any HTML file
- Duplicate error message strings throughout code
- Confirmed dead code

**Result:** ✅ -11.1 KB payload, cleaner codebase

---

## ✅ RECOMMENDED ACTIONS

**Priority Order:**

1. ~~**IMMEDIATE (P0):** Move server.js out of web-accessible folder~~ ✅ **DONE** (commit 316cdd5)

2. **DECISION REQUIRED (P2):** Toast notifications
   - **Option A:** Refactor to use toast system (10-12 hours) ← Better UX
   - **Option B:** Delete toast-notifications.js (5 min) ← Quick cleanup

3. ~~**RECOMMENDED (P3):** Delete unused files~~ ✅ **DONE** (Feb 11, 2026)
   - ✅ Deleted chart-config.js (11.1 KB)
   - ✅ Deleted error-messages.js (11.1 KB)
   - **Saved:** 22.2 KB payload

**Total Effort:**
- Quick fix: 20 minutes (move + delete)
- Full refactor: 11-13 hours (move + toast system + delete)

---

## 📊 IMPACT ASSESSMENT

| Metric | Before | After (Cleanup) | After (Full Refactor) |
|--------|--------|-----------------|------------------------|
| Dead Code | 39 KB | 8.3 KB (-30.7 KB) | 0 KB |
| Security Risk | server.js exposed | ✅ Fixed | ✅ Fixed |
| UX Quality | alert() blocks | alert() blocks | ✅ Toast notifications |
| Payload Size | 431 KB | 400.3 KB (-30.7 KB) | 400 KB (-31 KB, +toast linked) |

**Progress:** 3 of 4 files resolved (server.js moved, chart-config.js + error-messages.js deleted)  
**Remaining:** 1 file (toast-notifications.js) — awaiting decision

---

**Created:** 2026-02-11 07:00 AM  
**Auditor:** Capital (QA Agent)  
**Session:** Sprint QA — Cron 013cc4e7  
**Source:** JS-COMPREHENSIVE-AUDIT-2026-02-11-0640.md
