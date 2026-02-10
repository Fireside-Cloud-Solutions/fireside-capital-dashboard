# BUG-CHART-002: PWA Manifest Icons Missing (404)

**Created:** 2026-02-10 06:25 AM EST  
**Severity:** P2 (Medium)  
**Status:** New  
**Found By:** Capital (Sprint QA cron 013cc4e7)  
**Affected Commit:** 0b24dc0, 5632b12 (PWA manifest implementation)

---

## Summary

PWA manifest.json is deployed and working, but references non-existent icon files. Browser shows 404 error when trying to load app icons, preventing proper PWA installation and home screen icon display.

---

## Impact

- **User Impact:** MEDIUM — PWA installability broken, no app icon shows
- **Pages Affected:** All pages (manifest is site-wide)
- **Browser Tested:** Chrome (latest)
- **Reproducible:** 100% on live site

---

## Steps to Reproduce

1. Navigate to https://nice-cliff-05b13880f.2.azurestaticapps.net/
2. Open DevTools → Console
3. **BUG:** Error shows: "Failed to load resource: the server responded with a status of 404 ()"
4. **Location:** https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png

---

## Console Error

```
Failed to load resource: the server responded with a status of 404 ()
URL: https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png

Warning: Error while trying to use the following icon from the Manifest: 
https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png 
(Download error or resource isn't a valid image)
```

---

## Root Cause Analysis

**File:** `app/manifest.json`

**Problem:** Manifest references icons that were never created:

```json
"icons": [
  {
    "src": "assets/img/icons/icon-192x192.png",  // ❌ DOES NOT EXIST
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "assets/img/icons/icon-512x512.png",  // ❌ DOES NOT EXIST
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

**Current State:**
- ✅ Directory exists: `app/assets/img/icons/`
- ✅ README exists: `app/assets/img/icons/README.md` (documents requirements)
- ❌ No PNG files created

---

## Missing Files

1. **icon-192x192.png** — 192x192px PNG with Fireside Capital branding
2. **icon-512x512.png** — 512x512px PNG with Fireside Capital branding

**Requirements (from README.md):**
- Square aspect ratio (192x192 and 512x512)
- PNG format with transparency
- Fireside Capital logo/brand colors (#01a4ef blue, #f44e24 orange)
- Purpose: "any maskable" (safe area in center 80%)

---

## Fix Options

### Option 1: Create Icons from Existing Logo (Recommended)
**Pros:** Professional, branded  
**Cons:** Requires image editing tool  
**Time:** 15-20 minutes

**Steps:**
1. Open existing Fireside logo (`app/assets/img/logo.svg` or equivalent)
2. Export to PNG at 192x192px and 512x512px
3. Ensure center 80% contains important content (maskable safe area)
4. Save to `app/assets/img/icons/` directory
5. Commit and push

### Option 2: Use Placeholder Until Design Review
**Pros:** Unblocks PWA testing immediately  
**Cons:** Unprofessional placeholder  
**Time:** 5 minutes

**Use solid color squares with "FC" text**

### Option 3: Disable PWA Temporarily
**Pros:** Removes 404 errors  
**Cons:** Loses PWA functionality  
**Time:** 2 minutes (remove manifest link from HTML)

---

## Recommended Fix

**Option 1** — Create proper branded icons for professional PWA experience.

**Alternative:** If no design assets available immediately, use Option 2 placeholder, then replace with proper icons in next sprint.

---

## Related Issues

**BUG-CHART-001:** Net Worth chart rendering error — P0 priority (MUST FIX FIRST)

Both bugs introduced in same Sprint Dev session (6:15 AM, commits fb6fbf1/0b24dc0/5632b12).

---

## Testing Checklist

After fix:
- [ ] Icons load without 404 errors
- [ ] Chrome shows "Install app" prompt
- [ ] Home screen icon appears correctly
- [ ] Splash screen shows branding (optional)
- [ ] manifest.json validation passes (Chrome DevTools → Application → Manifest)

---

## Work Item

**Azure DevOps:** BUG-CHART-002  
**Type:** Bug  
**Priority:** P2  
**Size:** XS (15-20 min)  
**Sprint:** Current  
**Assignee:** Capital/Builder (or Designer if available)

---

## Git Blame

**Introduced By:** Commit 0b24dc0  
**Author:** Builder (spawned by Capital)  
**Date:** 2026-02-10 05:57 AM  
**Message:** "feat(pwa): Add PWA manifest and theme colors for mobile installability"

**Note:** Builder documented the missing icons in `app/assets/img/icons/README.md` but did not create the actual PNG files.

---

## Notes

PWA functionality is otherwise working correctly:
- ✅ manifest.json serves correctly (not 404)
- ✅ All PWA meta tags added to HTML
- ✅ Theme colors configured
- ✅ Start URL and display mode set

Only blocker is the missing icon files. Once icons are created, PWA will be fully functional.

**Impact:** Users can't install the app to home screen, and browser warnings clutter console logs.
