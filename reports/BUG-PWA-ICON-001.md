# BUG-PWA-ICON-001: Missing PWA Icon File (icon-192x192.png)

**Date:** 2026-02-16  
**Reported by:** Builder (QA Audit)  
**Priority:** P2 MEDIUM  
**Type:** Bug  
**Status:** New  
**Affects:** All pages  

---

## Summary
Browser console shows 404 error for missing PWA icon file: `/assets/img/icons/icon-192x192.png`

## Console Error
```
Failed to load resource: the server responded with a status of 404 ()
https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png
```

## Current Behavior
- manifest.json references icon-192x192.png
- File does not exist in /assets/img/icons/ directory
- Browser throws 404 error on every page load
- PWA installation may fail or show default icon

## Expected Behavior
- Icon file should exist at /assets/img/icons/icon-192x192.png
- No console errors
- PWA icon displays correctly when installing to home screen

## Impact
- **Console Pollution:** LOW — Non-critical 404 error
- **PWA Installation:** MEDIUM — May show default icon instead of branded icon
- **User Experience:** LOW — Doesn't affect app functionality

## Fix Required
1. Generate PWA icons (192x192, 512x512, etc.) from Fireside Capital logo
2. Place in /assets/img/icons/ directory
3. Verify manifest.json references correct paths
4. Test PWA installation on mobile devices

## Related
- FC-111: Enhance PWA manifest (includes icon generation)
- FC-113: Generate iOS splash screens (uses pwa-asset-generator)

---

**Recommendation:** Bundle this fix with FC-111 PWA manifest enhancement work (already in backlog as P2 Ready)
