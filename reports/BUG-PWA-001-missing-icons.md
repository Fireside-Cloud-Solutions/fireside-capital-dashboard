# BUG-PWA-001: Missing PWA Icons (404 Error)

**Priority:** P2 MEDIUM  
**Type:** Bug  
**Effort:** 1 hour  
**Discovered:** 2026-02-15 06:40 AM (Sprint QA Session)  
**Status:** NEW

---

## Problem

PWA manifest references `icon-192x192.png` but the file doesn't exist, causing 404 errors on every page load.

---

## Evidence

### Console Error

```
Failed to load resource: the server responded with a status of 404 ()
https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png
```

### Browser Warning

```
Error while trying to use the following icon from the Manifest:
https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/img/icons/icon-192x192.png
(Download error or resource isn't a valid image)
```

---

## Impact

**User Impact:** MEDIUM
- PWA installation may fail or show broken icon
- Home screen icon missing on iOS/Android
- Professional appearance affected

**Frequency:** Every page load (11 pages × 2 loads = 22 404 errors during audit)

---

## Fix

### Option 1: Generate Missing Icons

Use `pwa-asset-generator` to create all required sizes:

```powershell
cd C:\Users\chuba\fireside-capital\app
npx pwa-asset-generator .\assets\img\logo.png .\assets\img\icons\ --favicon --type png
```

**Required sizes (per manifest.json):**
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 ← **MISSING**
- 384x384
- 512x512

### Option 2: Update Manifest

Remove reference to 192x192 from manifest.json if not needed.

**Recommended:** Option 1 (generate all icons) — proper PWA support.

---

## Testing

### Manual Test Plan

1. Run `pwa-asset-generator`
2. Verify `icon-192x192.png` exists in `app/assets/img/icons/`
3. Reload page
4. **EXPECTED:** No 404 errors in console
5. **ACTUAL:** (test after fix)

### Lighthouse PWA Audit

Run Lighthouse and verify:
- [ ] "Manifest includes a maskable icon" (PASS)
- [ ] "No icon 404 errors" (PASS)

---

## Acceptance Criteria

- [ ] Generate all missing PWA icon sizes
- [ ] Verify all icons load without 404 errors
- [ ] Test PWA installation on mobile device
- [ ] Verify home screen icon displays correctly
- [ ] Git commit icon files
- [ ] Azure deployment includes new icons

---

## Related Issues

- ⏳ FC-108 to FC-117: PWA Implementation (backlog)
- This is a prerequisite for proper PWA support

---

**Report Created:** 2026-02-15 06:47 AM  
**Agent:** Capital (QA Orchestrator)  
**Session:** Sprint QA 013cc4e7
