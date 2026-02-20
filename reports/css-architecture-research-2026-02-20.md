# CSS Architecture & Performance Research
**Date:** February 20, 2026  
**Researcher:** Capital Research Agent  
**Status:** Complete

## Executive Summary

The Fireside Capital dashboard has an **excellent CSS architecture** that follows modern best practices. No major refactoring needed. Research focused on Chart.js performance optimization and PWA implementation.

## CSS Architecture Analysis

### Current State: ✅ EXCELLENT

**File Structure:**
```
Bootstrap 5 (base)
  └─ design-tokens.css (CSS variables)
      └─ main.css (core styles)
          ├─ components.css (UI components)
          ├─ responsive.css (breakpoints)
          ├─ utilities.css (helper classes)
          ├─ accessibility.css (a11y)
          ├─ onboarding.css (feature-specific)
          └─ critical.css (above-fold)
```

**Strengths:**
- Token-based design system (colors, spacing, typography, shadows, transitions)
- Modular organization (ITCSS-like layering)
- Semantic naming conventions
- Light/dark mode support via `data-bs-theme` attribute
- Comprehensive financial semantic colors
- UX polish already applied (8px grid, smooth transitions, WCAG touch targets)

**No Action Required:** The CSS architecture is production-ready and well-maintained.

---

## Chart.js Performance Recommendations

### Problem
Chart.js struggles with >10,000 data points, which impacts:
- Transaction history charts
- Daily net worth snapshots over multiple years
- Real-time transaction feeds

### Solutions Provided

1. **Data Decimation** — LTTB algorithm to preserve visual shape while reducing points
2. **Lazy Loading** — IntersectionObserver for off-screen charts
3. **Throttled Updates** — Batch real-time updates every 1 second
4. **Custom HTML Tooltips** — Offload tooltip rendering from canvas to DOM

### Implementation Files
- `app/assets/js/chart-config.js` (NEW)
- Updated chart initialization in existing JS files

---

## PWA Implementation

### Service Worker Strategy
- **Network-first** for Supabase API (always fresh financial data)
- **Cache-first** for static assets (CSS, JS, images)
- **Stale-while-revalidate** for offline fallback

### Files to Create
- `app/sw.js` (service worker)
- `app/manifest.json` (web app manifest)
- `app/assets/icons/icon-192.png` (app icon)
- `app/assets/icons/icon-512.png` (app icon)

### Expected Impact
- Offline access to dashboard (read-only mode)
- Faster page loads (cached assets)
- Installable as native app on mobile/desktop

---

## Performance Quick Wins

1. **Critical CSS Inlining** — Already have `critical.css`, just need to inline it
2. **Lazy Load Bootstrap Icons** — Only load used icons (reduce font size)
3. **Supabase Query Optimization** — Pagination + RPC functions for aggregations
4. **Image Optimization** — WebP with fallback + lazy loading

---

## Next Implementation Tasks

**Priority Order:**

### High Priority (Core Performance)
1. Create `app/assets/js/chart-config.js` with decimation defaults
2. Implement lazy chart loading for Reports page
3. Add service worker for offline support

### Medium Priority (UX Polish)
4. Add theme toggle button (dark/light switcher)
5. Create web app manifest for PWA install
6. Optimize Supabase queries with pagination

### Low Priority (Progressive Enhancement)
7. Implement virtual scrolling for transaction lists
8. Create custom HTML tooltips for charts
9. Generate minimal Bootstrap Icons subset

---

## Research Backlog Status

- ✅ **CSS Architecture** — Analyzed, no changes needed
- ✅ **Chart.js Performance** — Recommendations provided
- ✅ **Bootstrap Dark Theme** — Already implemented
- ✅ **PWA** — Service worker + manifest specs provided
- ✅ **Performance Optimization** — Quick wins identified
- 🔜 **Financial Dashboard UI Patterns** — Additional research on transaction categorization UX

---

## Findings Posted
- Discord channel: #dashboard (1467330085949276448)
- Message ID: 1474338958107480239
- Timestamp: 2026-02-20 04:33 AM EST

---

## Recommendations for Builder

**Spawn Builder agent for:**
1. Chart.js configuration implementation (`chart-config.js`)
2. Service worker creation (`sw.js`)
3. Web app manifest (`manifest.json`)

**Do NOT spawn for:**
- CSS refactoring (not needed)
- Dark theme implementation (already done)

**Implementation Estimate:**
- Chart.js config: 2 hours
- Service worker: 3 hours
- Web manifest + icons: 1 hour
- **Total: 6 hours of dev work**
