# BUG-PWA-001: Missing PWA Icons (404 Errors)

**Priority:** Medium  
**Type:** Bug / PWA / Assets  
**File:** `app/assets/img/icons/` (directory exists but empty)  
**Found:** 2026-02-14 07:15 AM  
**Status:** New

## Summary
PWA manifest references icon files that don't exist, causing 404 errors in browser console and preventing app from being installable as a PWA.

## Console Errors
```
Failed to load resource: the server responded with a status of 404 ()
https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png
```

## Missing Files
1. `icon-192x192.png` — 192x192px PNG (minimum for PWA)
2. `icon-512x512.png` — 512x512px PNG (required for maskable icons)

## Impact
- **Functionality:** PWA cannot be installed on mobile/desktop
- **Console Errors:** 404 errors on every page load
- **User Experience:** No icon shown in browser tab/bookmark
- **SEO/Performance:** Lighthouse score reduction

## Current State
- Directory exists: `app/assets/img/icons/`
- README.md documents the requirement
- manifest.json references the icons
- Icons have not been created yet

## Recommendation
1. Create base icon using Fireside Capital logo
2. Generate 192x192 and 512x512 versions
3. Follow design guidelines in README.md:
   - Colors: Primary #01a4ef (blue), accent #f44e24 (orange)
   - Background: Work on both light/dark
   - Maskable: Safe zone (center 80%) for Android
4. Use https://realfavicongenerator.net/ or design tools

## Priority Justification
Medium priority because:
- Affects all pages (console errors)
- Blocks PWA installability
- But doesn't break core functionality

## Testing
Verified on:
- Reports page (404 in console log)
- Expected on all pages since icons are loaded in manifest
