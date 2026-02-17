# BACKLOG.md — Product Backlog

**Product:** Fireside Capital → Fireside Personal Assistant  
**Owner:** Matt Hubacher  
**Last Updated:** 2026-02-17 04:45 EST (Sprint UI/UX 0445: JS UX layer audit — 3 new bugs BUG-UX-ALERT-001/BUG-UX-CONFIRM-001/BUG-CHART-ALERT-001 added)

---

## Legend
- **Priority:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low) | P4 (Nice-to-have)
- **Type:** Feature | Bug | Spike | Chore | Epic
- **Status:** Backlog | Ready | In Progress | Review | Done
- **Size:** XS (< 2h) | S (2-4h) | M (4-8h) | L (1-2d) | XL (3-5d) | Epic (multi-sprint)

---

## 🏔️ EPICS

### EPIC-001: Personal Finance Dashboard (Fireside Capital)
**Status:** In Progress  
**Description:** World-class personal finance web application — track net worth, budgets, bills, income, investments, debts. Responsive, accessible, branded.

### EPIC-002: Mobile Application (iOS + Android)
**Status:** Planning  
**Description:** React Native + Expo mobile app for Fireside Capital. Same features as web, native feel.

### EPIC-003: Email Bill Parsing (Fireside Capital feature)
**Status:** Backlog  
**Description:** Parse bills from Gmail/Outlook and auto-import into Fireside Capital. This is a FINANCE feature — it feeds data into the personal finance app. Not full email management.

### EPIC-004: DevOps Integration
**Status:** Backlog  
**Description:** Azure DevOps project for backlog management, sprint tracking, CI/CD pipelines.

---

### ⚠️ SEPARATE PRODUCT: Fireside Assistant
The following epics belong to **Fireside Assistant** — a separate desktop application with its own codebase, agent, and project. NOT part of Fireside Capital.

- **Email Intelligence** — Full inbox management, sorting, draft replies, spam blocking (Gmail + Outlook + more)
- **Calendar & Meetings** — Manage calendars, schedule meetings, handle conflicts
- **Daily Briefings** — Morning/evening digests, email summaries, action items
- **Chatbot** — Interactive assistant for availability questions, business info, services
- **Desktop App** — Native .exe with system tray, real-time monitoring, notifications

These will be tracked in a separate backlog when Fireside Assistant development begins.

---

## 📋 BACKLOG ITEMS

### EPIC-001: Personal Finance Dashboard

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| FC-001 | Bug | P0 | M | Done | Assets page routing failure — shows Bills content |
| FC-002 | Bug | P1 | S | Done | Monthly bills total miscalculation |
| FC-003 | Bug | P2 | XS | Done | Shared bill deletion lacks warning dialog |
| FC-004 | Feature | P1 | L | Done | UX/UI polish — match Fireside Cloud Solutions brand |
| FC-005 | Feature | P1 | L | Done | Responsive design — dashboard viz sizing, mobile layouts |
| FC-006 | Chore | P1 | M | In Progress | Security remediation (session security hardening remaining) |
| FC-007 | Feature | P1 | M | Done | WCAG 2.1 AA accessibility compliance |
| FC-008 | Chore | P2 | S | Done | SEO optimization — meta tags, semantic HTML, sitemap |
| FC-009 | Spike | P2 | M | Done | Competitor research — Mint, YNAB, Monarch, Copilot, Lunch Money |
| FC-010 | Feature | P2 | L | Done | Onboarding flow for new users |
| FC-011 | Feature | P2 | M | Done | Dashboard data visualization improvements |
| FC-012 | Feature | P3 | M | Backlog | Dark mode polish and theme consistency |
| FC-013 | Chore | P2 | S | Done | Workspace cleanup — organize 80+ root files |
| FC-014 | Bug | P0 | L | Done | !important abuse — 301 instances causing CSS maintainability crisis |
| FC-077 | Bug | P0 | S | Done | **Chart.js canvas reuse error — Dashboard + Reports pages broken** (6/9 and 5/5 charts fail with "Canvas already in use" errors) — Fix safeCreateChart() to destroy before recreate — see reports/FC-077-chart-canvas-reuse-error.md |
| FC-015 | Bug | P0 | S | Done | Welcome button text not vertically centered on ultrawide monitors |
| FC-016 | Bug | P1 | L | Done | CSS file loading order conflicts causing style override battles |
| FC-017 | Bug | P1 | M | Done | Responsive breakpoint inconsistencies — custom breakpoints don't align with Bootstrap |
| FC-018 | Bug | P1 | S | Done | Missing aria-labels on icon-only buttons (accessibility) |
| FC-019 | Bug | P2 | M | Done | Inline styles in HTML preventing responsive CSS overrides |
| FC-020 | Bug | P2 | XS | Done | JavaScript debug code left in production (console pollution) |
| FC-021 | Bug | P2 | XS | Done | Empty state icons too large on mobile devices |
| FC-022 | Chore | P3 | S | Backlog | Duplicate/redundant CSS rules bloating stylesheet |
| FC-023 | Chore | P3 | XS | Done | Commented-out code left in CSS files |
| FC-024 | Chore | P3 | M | Backlog | Magic numbers in CSS — replace with CSS custom properties |
| FC-025 | Chore | P2 | M | Done | Database enum normalization — standardize type/frequency field casing |
| FC-026 | Feature | P1 | XL | Backlog | Data import system — YNAB budget import + spreadsheet uploads with column mapping |
| FC-027 | Bug | P2 | XS | Done | Desktop touch targets below 44px WCAG 2.5.5 minimum (page header, time filters, table buttons) — see reports/ISSUE-A11Y-BUTTONS.md |
| FC-028 | Bug | P3 | XS | Done | Transactions page empty state doesn't match .empty-state component pattern — see reports/ISSUE-UX-CONSISTENCY-001.md |
| FC-039 | Bug | P2 | XS | Done | Friends page search button using btn-primary instead of btn-secondary — see reports/FC-043-button-hierarchy-violations.md |
| FC-040 | Feature | P2 | M | Done | Friends page missing loading states (skeleton loaders) — see reports/UI-UX-AUDIT-FRIENDS-2026-02-04-0923.md |
| FC-041 | Feature | P3 | S | Done | Friends page empty states don't use empty-states.js utility — see reports/UI-UX-AUDIT-FRIENDS-2026-02-04-0923.md |
| FC-042 | Chore | P3 | XS | Backlog | Friends page section icon colors inconsistent (design decision) — see reports/UI-UX-AUDIT-FRIENDS-2026-02-04-0923.md |
| FC-043 | Bug | P2 | XS | Done | Button hierarchy violations across 6 pages (assets, bills, debts, income, investments, budget) — Add buttons using btn-primary instead of btn-secondary — FIXED commit 5716e50 + 747f56b (2026-02-15) — see reports/FC-043-button-hierarchy-violations.md |
| BUG-UI-BTN-002 | Bug | P1 | XS | Done | **Bills page button hierarchy violation** — "Add Bill" should be btn-primary (core action), not btn-secondary (2 min) — FIXED commit 5716e50 (2026-02-15) |
| BUG-UI-BTN-003 | Bug | P1 | XS | Done | **Budget page button hierarchy violation** — "Add Item" should be btn-primary (core action), not btn-secondary (2 min) — FIXED commit 5716e50 (2026-02-15) |
| BUG-UI-BTN-006 | Bug | P1 | XS | Done | **Investments page button hierarchy violation** — "Add Investment" should be btn-primary (core action), not btn-secondary (2 min) — FIXED commit 5716e50 (2026-02-15) |
| BUG-UI-BTN-008 | Bug | P1 | XS | Done | **Assets page button hierarchy violation** — "Add Asset" should be btn-primary (core action), not btn-secondary (2 min) — FIXED commit 747f56b (2026-02-15) |
| FC-056 | Feature | P2 | M | Done | Missing skeleton loaders on Dashboard (9 charts + 6 stat cards) — poor perceived performance |
| FC-057 | Bug | P2 | XS | Done | Inconsistent chart heights — standardize to 2 sizes (lg/md) for visual consistency |
| FC-058 | Feature | P3 | S | Backlog | Subscriptions widget loading state — replace generic spinner with skeleton cards |
| FC-060 | Chore | P3 | XS | Backlog | Stat card SVG icons missing explicit width/height attributes |
| FC-061 | Feature | P2 | S | Backlog | Dashboard empty state for new users — show onboarding CTA instead of blank charts |
| FC-062 | Bug | P3 | XS | Backlog | Upcoming transactions widget needs max-height on mobile |
| FC-063 | Feature | P3 | S | Backlog | Chart lazy loading indicator — subtle "Loading charts..." text for slow connections |
| FC-072 | Bug | P3 | XS | Done | Investments page missing ACTIONS column — no edit/delete buttons for investment accounts |
| FC-073 | Chore | P2 | M | Backlog | **Unit Testing Setup (Phase 1)** — Jest + 120+ tests for calculations, security, utilities (4-5h) — see docs/research/07-testing-strategies.md |
| FC-074 | Chore | P3 | M | Backlog | **Integration Testing Setup (Phase 2)** — pgTAP database tests for schema, RLS, constraints (3-4h) — see docs/research/07-testing-strategies.md |
| FC-075 | Chore | P3 | L | Backlog | **E2E Testing Setup (Phase 3)** — Playwright tests for 15 user flows + visual regression (5-6h) — see docs/research/07-testing-strategies.md |
| FC-076 | Chore | P3 | XS | Backlog | **CI/CD Testing Pipeline** — GitHub Actions workflow for automated tests on every commit (1h) — see docs/research/07-testing-strategies.md |
| FC-078 | Chore | P2 | L | Ready | **Refactor CSS to ITCSS + BEM Architecture** — Implement structured CSS with design tokens for scalability, dark theme prep, maintainability (8-10h) — see reports/css-architecture-research-2026-02-11.md |
| FC-079 | Chore | P2 | M | Ready | **Set up ITCSS folder structure** — Create 7-layer CSS architecture in app/assets/css/ (Settings, Tools, Generic, Elements, Objects, Components, Utilities) — see research/css-architecture-itcss.md |
| FC-080 | Chore | P2 | M | Ready | **Create CSS custom properties for theming** — Define design tokens for colors, typography, spacing with dark mode support using [data-theme] — see research/css-architecture-itcss.md |
| FC-081 | Chore | P2 | L | Ready | **Migrate inline styles to ITCSS components** — Move inline styles from HTML to component files using BEMIT naming (.c-dashboard-card, .c-chart, etc.) — see research/css-architecture-itcss.md |
| FC-082 | Chore | P3 | S | Ready | **Build spacing utility system** — Create spacing utilities (.u-mt-*, .u-mb-*, .u-gap-*) to replace component margins — see research/css-architecture-itcss.md |
| FC-083 | Chore | P3 | XS | Ready | **Document BEMIT naming conventions** — Add CSS architecture guide to README with naming rules and examples — see research/css-architecture-itcss.md |
| FC-084 | Feature | P1 | L | Ready | **Redesign dashboard layout using F-pattern hierarchy** — Top-left: net worth (primary KPI), Row 1: alerts, Row 2: overview cards, Row 3: trend charts — see research/financial-dashboard-ui-patterns.md |
| FC-085 | Feature | P2 | M | Ready | **Create alert card component (monitoring pattern)** — Alert users to upcoming bills (7-day), low balance warnings, overdue payments with supportive microcopy — see research/financial-dashboard-ui-patterns.md |
| FC-086 | Feature | P2 | S | Ready | **Add deltas to all stat cards** — Show month-over-month changes with ↑/↓ indicators, percentages, and color coding (green/red) — see research/financial-dashboard-ui-patterns.md |
| FC-087 | Feature | P2 | M | Ready | **Build skeleton loaders for all charts** — Replace generic spinners with content-aware skeleton screens (bars, lines) for better perceived performance — see research/financial-dashboard-ui-patterns.md |
| FC-088 | Feature | P2 | S | Ready | **Create emotionally supportive empty states** — Replace generic empty states with warm, helpful microcopy and clear CTAs for new users — see research/financial-dashboard-ui-patterns.md |
| FC-089 | Feature | P3 | S | Ready | **Add microinteractions for payment confirmations** — Soft pulse animation, checkmark reveal, haptic feedback (mobile) for high-stakes actions — see research/financial-dashboard-ui-patterns.md |
| FC-090 | Feature | P3 | L | Ready | **Implement proper dark mode** — Use CSS custom properties with [data-theme="dark"], maintain contrast ratios, test all charts — see research/financial-dashboard-ui-patterns.md |
| FC-091 | Feature | P3 | S | Ready | **Add tooltips for financial jargon** — Explain ROI, APR, equity, net worth, etc. with contextual tooltips on hover/tap — see research/financial-dashboard-ui-patterns.md |
| FC-092 | Feature | P4 | XL | Backlog | **Build customizable widget system** — Drag-and-drop dashboard widgets, hide/show sections, save layouts per user — see research/financial-dashboard-ui-patterns.md |
| FC-093 | Chore | P1 | XS | Done | **Apply global Chart.js performance defaults** — Disable animations, set responsive/maintainAspectRatio, line tension=0, spanGaps=true (67% faster) — FIXED commit 93c361a (2026-02-14) — see research/chartjs-optimization.md |
| FC-094 | Chore | P2 | S | Ready | **Pre-parse chart data timestamps** — Convert dates to timestamps before passing to Chart.js, set parsing: false, normalized: true (62% faster) — see research/chartjs-optimization.md |
| FC-095 | Feature | P2 | M | Ready | **Create createOptimizedChart() factory** — Centralized chart creation with decimation, fixed rotation, mobile optimizations, dark mode support — see research/chartjs-optimization.md |
| FC-096 | Feature | P3 | S | Ready | **Implement Chart.js decimation for net worth trend** — Use LTTB algorithm to sample large datasets (> 365 points) to 500 samples (89% faster) — see research/chartjs-optimization.md |
| FC-097 | Feature | P3 | S | Ready | **Create dark mode chart color update utility** — Dynamically update chart colors on theme toggle without recreating instances — see research/chartjs-optimization.md |
| FC-098 | Feature | P3 | S | Ready | **Add mobile-specific chart optimizations** — Disable legends/tooltips, reduce tick limits on mobile devices — see research/chartjs-optimization.md |
| FC-099 | Chore | P3 | S | Backlog | **Write Chart.js performance testing suite** — Benchmark rendering times for 100/500/1k/5k/10k points, compare optimized vs unoptimized — see research/chartjs-optimization.md |
| FC-100 | Feature | P2 | M | Ready | **Add Bootstrap 5.3 color mode toggle** — Implement official Bootstrap theme toggle with localStorage persistence and OS preference detection — see research/bootstrap-dark-theme.md |
| FC-101 | Feature | P2 | S | Ready | **Create theme toggle button in navbar** — Add icon button (moon/sun) to toggle between light/dark modes — see research/bootstrap-dark-theme.md |
| FC-102 | Chore | P2 | M | Ready | **Add custom financial dashboard color overrides** — Define dark mode colors for positive/negative values, brand colors, cards, charts — see research/bootstrap-dark-theme.md |
| FC-103 | Feature | P2 | M | Ready | **Update Chart.js to respond to theme changes** — Add MutationObserver to watch data-bs-theme and update chart colors dynamically — see research/bootstrap-dark-theme.md |
| FC-104 | Chore | P2 | XS | Ready | **Add inline theme script to prevent FOUC** — Set theme in <head> before any CSS loads to prevent flash of unstyled content — see research/bootstrap-dark-theme.md |
| FC-105 | Chore | P3 | S | Ready | **Test all pages in light/dark modes** — Visual regression testing for cards, charts, forms, modals, tables in both themes — see research/bootstrap-dark-theme.md |
| FC-106 | Chore | P3 | S | Ready | **Validate WCAG contrast ratios for dark mode** — Ensure 4.5:1 text contrast, 3:1 UI contrast in dark theme — see research/bootstrap-dark-theme.md |
| FC-107 | Chore | P3 | XS | Backlog | **Document theme toggle in README** — Add theme implementation guide and customization instructions — see research/bootstrap-dark-theme.md |
| FC-108 | Feature | P1 | M | Ready | **Implement Service Worker with hybrid caching** — Cache-first for static assets, network-first for API data, stale-while-revalidate for everything else (3-4h) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-109 | Feature | P1 | XS | Ready | **Create custom offline page** — Branded offline.html with retry/dashboard actions (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-110 | Chore | P1 | XS | Ready | **Register service worker in all HTML pages** — Add registration script to 11 pages (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-111 | Feature | P2 | S | Ready | **Enhance PWA manifest** — Add screenshots, shortcuts, share_target, file_handlers to manifest.json (1h) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-112 | Chore | P2 | XS | Ready | **Add iOS/Safari PWA meta tags** — Apple-specific meta tags for home screen install (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-113 | Chore | P2 | XS | Ready | **Generate iOS splash screens** — Use pwa-asset-generator for 12 splash screen sizes (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-114 | Feature | P3 | M | Ready | **Implement background sync for offline edits** — Queue financial data updates in IndexedDB when offline (2h) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-115 | Feature | P3 | XS | Ready | **Add app badging for upcoming bills** — Show count of upcoming bills on home screen icon (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-116 | Feature | P3 | XS | Ready | **Implement Web Share API for reports** — Share financial reports via native share sheet (30 min) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-117 | Feature | P3 | S | Ready | **Create custom PWA install prompt** — Branded install banner with custom UI (1h) — see reports/PWA-IMPLEMENTATION-RESEARCH-2026-02-13.md |
| FC-118 | Chore | P1 | M | Ready | **Set up Webpack build system with code splitting** — Configure entry points, dynamic imports, TerserPlugin for minification + console removal (4-5h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-119 | Chore | P1 | XS | Ready | **Implement async/defer for non-critical scripts** — Apply async to third-party scripts, defer to non-critical first-party scripts (1-2h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-120 | Chore | P1 | S | Ready | **Extract and inline critical CSS** — Use Critical tool to extract above-the-fold CSS, configure async CSS loading (2-3h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-121 | Chore | P1 | XS | Ready | **Configure Cache-Control headers in staticwebapp.config.json** — Set max-age=31536000 for static assets, max-age=3600 for HTML (1h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-122 | Feature | P1 | S | Ready | **Implement lazy loading for below-the-fold images and charts** — Add loading="lazy", Intersection Observer for charts (1-2h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-123 | Feature | P1 | S | Ready | **Set up Core Web Vitals monitoring** — Install web-vitals library, Google Analytics 4 tracking, Lighthouse CI (2-3h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-124 | Feature | P2 | S | Ready | **Convert images to WebP/AVIF format** — Batch convert PNG/JPEG, update HTML with picture elements (2-3h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-125 | Feature | P2 | S | Ready | **Implement task yielding for long-running operations** — Add yieldToMainThread() utility, refactor data processing loops (2-3h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-126 | Chore | P2 | XS | Ready | **Refactor event listeners to use delegation** — Replace individual listeners with parent-level delegation (1-2h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-127 | Chore | P2 | S | Ready | **Enable Azure CDN for global distribution** — Configure Azure CDN with caching rules (2h) — see reports/PERFORMANCE-OPTIMIZATION-RESEARCH-2026-02-13.md |
| FC-155 | Chore | P3 | XS | Ready | **Run baseline Lighthouse audit** — Document current performance scores for all 11 pages, establish performance budget baseline (1h) — Sprint Research Task (Session 0715) |
| FC-156 | Chore | P2 | XS | Ready | **Add preconnect to Supabase origin** — Add rel="preconnect" and dns-prefetch for Supabase API to all 11 HTML pages, 100-300ms faster API requests (30 min) — Sprint Research Task (Session 0715) |
| FC-157 | Chore | P2 | XS | Ready | **Implement font preloading** — Preload Source Serif 4 + Inter WOFF2 fonts with font-display:swap for faster FCP (30 min) — Sprint Research Task (Session 0715) |
| FC-158 | Chore | P3 | XS | Ready | **Refactor event listeners to delegation** — Replace individual button listeners with parent-level delegation on tables, 90% reduction in memory usage (1-2h) — Sprint Research Task (Session 0715) |
| FC-159 | Feature | P3 | S | Ready | **Add performance budgets to Webpack** — Set maxAssetSize (200KB) and maxEntrypointSize (300KB), fail builds that exceed limits (1h) — Sprint Research Task (Session 0715) |
| FC-160 | Chore | P3 | S | Ready | **Set up Lighthouse CI performance gates** — GitHub Actions workflow to block PRs that degrade performance below 90 score (2-3h) — Sprint Research Task (Session 0715) |
| FC-128 | Bug | P2 | XS | Done | **Transactions page button hierarchy violation** — "Sync from Bank" should be btn-primary (core action), not btn-secondary (15 min) — FIXED commit aa9641d (2026-02-14) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-129 | Feature | P2 | S | Ready | **Add table skeleton loaders to Transactions page** — Replace generic spinner with 5 shimmer placeholder rows for better perceived performance (2h) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-130 | Feature | P2 | S | Ready | **Implement transaction status column** — Add pending/cleared/failed badges using Plaid pending field (2h) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-131 | Feature | P1 | M | Done | **Add pagination to Transactions table** — Server-side pagination with page controls, limit selector, prevents DOM bloat with 500+ rows (4-5h) — FIXED commit 0d41744 (2026-02-15) — see reports/QA-SPRINT-0701-FC131-PAGINATION-2026-02-15.md |
| FC-132 | Feature | P3 | XS | Ready | **Add active filter indicator to Transactions** — Badge count + blue borders for active filters (1h) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-133 | Chore | P3 | XS | Ready | **Document auto-categorize button hierarchy decision** — Clarify if btn-outline-secondary is correct or should be btn-secondary (30 min) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-134 | Bug | P2 | XS | Ready | **Fix Transactions filter mobile layout** — Test and add col-12 for mobile breakpoint (1h) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-135 | Chore | P3 | XS | Ready | **Verify empty state CTA consistency** — Confirm "Sync from Bank" buttons trigger same action (30 min) — see reports/UI-UX-AUDIT-TRANSACTIONS-2026-02-14.md |
| FC-136 | Bug | P1 | XS | Done | **Debts page button hierarchy violation** — "Add Debt" should be btn-primary (core action), not btn-secondary (5 min) — FIXED commit 8b2fddd (2026-02-14) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| FC-137 | Feature | P2 | S | Ready | **Add table skeleton loaders to Debts page** — Replace generic spinner with 5 shimmer placeholder rows for better perceived performance (2h) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| FC-138 | Feature | P2 | XS | Ready | **Add empty state HTML to Debts page** — Fallback markup with CTA for new users (30 min) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| FC-139 | Bug | P1 | XS | Done | **Income page button hierarchy violation** — "Add Income" should be btn-primary (core action), not btn-secondary (5 min) — FIXED commit 8b2fddd (2026-02-14) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| FC-140 | Feature | P2 | S | Ready | **Add table skeleton loaders to Income page** — Replace generic spinner with 5 shimmer placeholder rows (2h) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| FC-141 | Feature | P2 | XS | Ready | **Add empty state HTML to Income page** — Fallback markup with CTA for new users (30 min) — see reports/UI-UX-AUDIT-DEBTS-INCOME-2026-02-14.md |
| BUG-TRANS-001 | Bug | P2 | XS | Done | **Filter state not persisted across page navigation** — When user clicks Previous/Next on Transactions page, filters are lost. Users expect filters to persist. Store activeFilters in module scope and pass to renderTransactionsTable() (15 min) — FIXED commit 1b4c5b8 (2026-02-15) — see reports/QA-SPRINT-0701-FC131-PAGINATION-2026-02-15.md |
| BUG-TRANS-002 | Bug | P3 | XS | Done | **Pagination controls visible when filtered results are empty** — Early return in renderTransactionsTable() skips updatePaginationUI() call when table is empty. Call updatePaginationUI() before return to hide controls (5 min) — FIXED commit 1b4c5b8 (2026-02-15) — see reports/QA-SPRINT-0701-FC131-PAGINATION-2026-02-15.md |
| BUG-TRANS-003 | Bug | P2 | XS | Done | **Mobile pagination layout needs responsive testing** — Pagination controls use d-flex justify-content-between with no mobile breakpoints. Test on iPhone SE (375px) and Galaxy Fold (280px). May need flex-column on mobile or shorter label ("Per page:" vs "Items per page:") (30 min test + fix) — FIXED commit c572f5b (2026-02-16) — Added flex-column flex-sm-row for responsive stacking, gap-2 spacing, centered on mobile — see reports/QA-SPRINT-0701-FC131-PAGINATION-2026-02-15.md |
| BUG-UI-CSS-001 | Bug | P2 | XS | Done | **Inline critical CSS duplication** — 40+ lines of identical inline CSS in all 11 HTML pages violates DRY principle, maintenance nightmare. Extract to external critical.css file (20 min) — FIXED commit 505bd28 (2026-02-16) — see reports/BUG-UI-CSS-001-FIXED-2026-02-16.md |
| BUG-UI-MODAL-001 | Bug | P2 | XS | Done | **Password reset modal traps users** — Static backdrop prevents closing modal, no Cancel button. Users stuck if error occurs (5 min) — FIXED commit 353219b (2026-02-15) — see reports/SPRINT-QA-AUDIT-COMPLETE-2026-02-15.md |
| BUG-UI-NAV-001 | Bug | P0 | XS | Done | **Z-index conflict - mobile hamburger menu** — Hamburger menu uses z-index: 400 (modal level) instead of 200 (sticky level), breaks modal focus trap (5 min) — FIXED commit 3aeddcc (2026-02-15) — see reports/BUG-UI-NAV-001-COMPLETE-FIX-2026-02-15.md |
| BUG-UI-LOAD-001 | Bug | P2 | S | Done | **Bills page missing skeleton loaders** — No loading states for 3 summary cards, table, subscription widget. Poor perceived performance (30 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-LOAD-002 | Bug | P2 | S | Done | **Budget page missing skeleton loaders** — No loading states for 4 summary cards, budget table. Poor perceived performance (30 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-LOAD-003 | Bug | P2 | S | Done | **Debts page missing skeleton loaders** — No loading states for debts table, financing cards. Poor perceived performance (20 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-LOAD-004 | Bug | P2 | S | Done | **Income page missing skeleton loaders** — No loading states for income table. Poor perceived performance (20 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-LOAD-005 | Bug | P2 | S | Done | **Investments page missing skeleton loaders** — No loading states for investments table. Poor perceived performance (20 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-LOAD-006 | Bug | P2 | S | Done | **Assets page missing skeleton loaders** — No loading states for assets table. Poor perceived performance (20 min) — FIXED commits 577d9e5 + ba91da0 (2026-02-16) — see reports/BUG-UI-LOAD-001-006-FIXED-2026-02-16.md |
| BUG-UI-TOOLTIP-001 | Bug | P3 | XS | Done | **Bootstrap tooltips not initialized** — FALSE POSITIVE from audit. Tooltips ARE initialized (app.js lines 4931-4934, called at line 3849). No fix needed. |
| BUG-JS-001 | Bug | P2 | S | Ready | **Console cleanup** — 151 console.log statements need removal or build-time stripping for professional production code (2-3h) — see reports/SPRINT-QA-AUDIT-COMPLETE-2026-02-15.md |
| BUG-CSS-001 | Bug | P3 | L | Ready | **!important abuse** — 289 !important instances causing specificity battles. Large refactoring effort (8-12h) — see reports/SPRINT-QA-AUDIT-COMPLETE-2026-02-15.md |
| BUG-PERF-003 | Bug | P3 | S | Ready | **Excessive script tags** — 15-20 individual script tags slow page load. Bundle with Webpack (45 min) — see reports/SPRINT-QA-AUDIT-COMPLETE-2026-02-15.md |
| FC-142 | Chore | P1 | M | Ready | **Split main.css into ITCSS layers** — Break down 92KB main.css into layered architecture (1-settings, 3-generic, 4-elements, 5-objects, 6-components, 7-utilities) with import orchestrator for better maintainability (6-8h) — Sprint Research Task |
| FC-143 | Chore | P1 | S | Ready | **Create critical CSS bundle for faster FCP** — Extract critical path CSS (design tokens + auth state + typography) into <14KB bundle, update all 11 HTML files to inline critical and defer non-critical (3-4h) — Sprint Research Task |
| FC-144 | Chore | P2 | M | Ready | **Convert components to BEM naming convention** — Refactor 8 core components (card, button, chart, form, nav, table, modal, badge) to use BEM (.c-card__header) to prevent specificity conflicts (4-5h) — Sprint Research Task |
| FC-145 | Chore | P2 | S | Ready | **Consolidate media queries (mobile-first)** — Merge scattered responsive rules from 3 files into single responsive.css with mobile-first approach using breakpoint tokens (2-3h) — Sprint Research Task |
| FC-146 | Chore | P3 | M | Ready | **Add CSS build pipeline (purge + minify)** — Implement PurgeCSS to remove unused Bootstrap rules, add minification and source maps for production builds, integrate with GitHub Actions CI/CD (3-4h) — Sprint Research Task |
| FC-147 | Feature | P1 | M | Ready | **Redesign dashboard layout using F-pattern hierarchy** — Move net worth to top-left hero position, create alerts card (upcoming bills, budget warnings), reorganize charts by priority (4-5h) — Sprint Research Task |
| FC-148 | Feature | P2 | S | Ready | **Add deltas to all stat cards** — Show month-over-month changes with ↑/↓ indicators, percentages, and color coding (green for positive, red for negative) — Provides financial context at a glance (2-3h) — Sprint Research Task |
| FC-149 | Feature | P2 | M | Ready | **Create skeleton loaders for all charts** — Replace generic spinners with content-aware skeleton screens (bars, lines) for better perceived performance — 40-60% faster perceived load time (3-4h) — Sprint Research Task |
| FC-150 | Feature | P3 | S | Ready | **Replace generic empty states with supportive microcopy** — Warm, helpful empty states with clear CTAs for new users ("Your financial journey starts here") — 50% reduction in empty state bounce rate (2h) — Sprint Research Task |
| FC-151 | Feature | P4 | XS | Ready | **Add microinteractions for payment confirmations** — Soft pulse animation, checkmark reveal for high-stakes actions — Positive reinforcement for financial wins (1-2h) — Sprint Research Task |
| FC-152 | Feature | P2 | S | Ready | **Bootstrap Dark Theme Core Implementation** — Add theme-toggle.js with localStorage persistence, theme toggle dropdown to navbar, dark-theme.css with financial-specific overrides, test WCAG 2.1 AA contrast compliance (2h) — Sprint Research Task (Session 0631) |
| FC-153 | Feature | P2 | XS | Ready | **Chart.js Dark Mode Integration** — Add chart-themes.js with light/dark configs, update all chart creation to listen for themechange event, test chart readability in both modes (1h) — Sprint Research Task (Session 0631) |
| FC-154 | Chore | P3 | XS | Ready | **Dark Mode Documentation** — Document theme toggle usage in README, add color palette reference to DESIGN.md, document Chart.js theme API (30 min) — Sprint Research Task (Session 0631) |
| FC-UIUX-013 | Bug | P2 | XS | Done | **Dashboard missing page header wrapper** — index.html lacks `.page-header` structure, causing inconsistent spacing vs other pages (15 min) — FIXED commit 10c6281 (2026-02-16) — Sprint UI/UX Audit (Session 1127, 2026-02-16) — see reports/UIUX-SPRINT-AUDIT-2026-02-16.md |
| FC-UIUX-014 | Bug | P2 | XS | Done | **Inconsistent button placement** — Dashboard header controls not in `.page-header-actions` div (15 min) — FIXED commit 10c6281 (2026-02-16) — Sprint UI/UX Audit (Session 1127, 2026-02-16) — see reports/UIUX-SPRINT-AUDIT-2026-02-16.md |
| FC-UIUX-015 | Bug | P3 | XS | Done | **Modal footer spacing inconsistency** — Duplicate `.modal-footer` definition with 8px gap instead of 12px (5 min) — FIXED commit (Sprint Dev 0636, 2026-02-16) — Sprint UI/UX Audit (Session 1127, 2026-02-16) — see reports/UIUX-SPRINT-AUDIT-2026-02-16.md |
| FC-UIUX-016 | Bug | P3 | XS | Done | **Empty state icon size** — Icons should be 80px, not 64px (2 min) — ALREADY FIXED (FC-UIUX-004) — Sprint UI/UX Audit (Session 1127, 2026-02-16) — see reports/UIUX-SPRINT-AUDIT-2026-02-16.md |
| FC-UIUX-017 | Bug | P3 | S | Ready | **Stat card trend labels inconsistent** — CSS defines `.trend-label` but not used consistently in HTML templates (30 min) — Sprint UI/UX Audit (Session 1127, 2026-02-16) — see reports/UIUX-SPRINT-AUDIT-2026-02-16.md |
| FC-UIUX-018 | Bug | P2 | XS | Done | **Reports page Export button incorrect hierarchy** — Export button uses btn-secondary (blue filled), should be btn-outline-secondary for utility actions (2 min) — FIXED commit (Sprint Dev 0722, 2026-02-16) — Sprint UI/UX Audit (Session 0645, 2026-02-16) — see reports/UI-UX-AUDIT-REPORTS-2026-02-16-0645.md |
| FC-UIUX-019 | Bug | P2 | XS | Done | **Reports page inconsistent section spacing** — Chart rows use mt-3 (16px), breaks 8px grid system, should use mb-24 or mb-32 (5 min) — FIXED commit (Sprint Dev 0722, 2026-02-16) — Sprint UI/UX Audit (Session 0645, 2026-02-16) — see reports/UI-UX-AUDIT-REPORTS-2026-02-16-0645.md |
| FC-UIUX-020 | Feature | P2 | S | Ready | **Reports page missing empty state** — No empty state for new users with no snapshot data, should show educational context + CTA (30 min) — Sprint UI/UX Audit (Session 0645, 2026-02-16) — see reports/UI-UX-AUDIT-REPORTS-2026-02-16-0645.md |
| FC-UIUX-021 | Chore | P3 | M | Ready | **Summary card semantic inconsistency** — Reports uses .summary-card, Dashboard uses .stat-card for same pattern, need unified naming (1h) — Sprint UI/UX Audit (Session 0645, 2026-02-16) — see reports/UI-UX-AUDIT-REPORTS-2026-02-16-0645.md |
| FC-UIUX-022 | Bug | P3 | XS | Ready | **Reports page chart heights not defined** — Chart wrappers missing .chart-height-lg or .chart-height-md classes for consistent sizing (5 min) — Sprint UI/UX Audit (Session 0645, 2026-02-16) — see reports/UI-UX-AUDIT-REPORTS-2026-02-16-0645.md |
| FC-UIUX-023 | Feature | P2 | XL | Ready | **Settings page severely under-featured** — Only 1 setting (Emergency Fund Goal), missing 5 essential sections: Notifications, Account Security, Display Prefs, Data Management, Privacy (12-16h) — Sprint UI/UX Audit (Session 0710, 2026-02-16) — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-UIUX-024 | Bug | P2 | XS | Done | **Settings page no save state feedback** — FALSE POSITIVE from audit. Save states ARE implemented (app.js lines 2355-2373): loading spinner, success message with checkmark, error state, auto-clear after 3s. No fix needed. — Sprint UI/UX Audit (Session 0710, 2026-02-16) — Verified 2026-02-16 Sprint Dev 0740 — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-UIUX-025 | Bug | P2 | XS | Done | **Settings page no form validation** — Emergency Fund Goal input accepts any number with no validation hints for unrealistic values (30 min) — FIXED commit 8a93da9 (2026-02-16) — Added real-time validation with Bootstrap is-invalid/is-valid classes, visual feedback, improved helper text with recommended ranges — Sprint UI/UX Audit (Session 0710, 2026-02-16) — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-UIUX-026 | Feature | P2 | XS | Done | **Settings page missing empty state** — No empty state for new users with no goal set, should show educational context about 3-6 months rule (30 min) — FIXED commit abe8ae9 (2026-02-16) — Added empty state with bullseye icon, educational text, and CTA button that focuses input when clicked — Sprint UI/UX Audit (Session 0710, 2026-02-16) — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-UIUX-027 | Bug | P3 | XS | Done | **Settings page inline style on section heading** — Section heading uses inline style attribute instead of CSS class, breaks separation of concerns (2 min) — FIXED commit f0accb3 (2026-02-16) — Created .card-section-heading class in components.css — Sprint UI/UX Audit (Session 0710, 2026-02-16) — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-UIUX-028 | Chore | P3 | XS | Ready | **Password reset modal placement** — Modal hardcoded in settings.html, should be global shared component triggered from any page (1h) — Sprint UI/UX Audit (Session 0710, 2026-02-16) — see reports/UI-UX-AUDIT-SETTINGS-2026-02-16-0710.md |
| FC-161 | Chore | P2 | S | Ready | **Separate spacing utilities from components** — Create utility classes for margin/spacing (.m-0, .mb-8, .mb-16, .mb-24, .mb-32) to prevent component margin conflicts (1h) — Sprint Research Task (Session 0736) — CSS Architecture Best Practices |
| FC-162 | Chore | P3 | XS | Ready | **Add animation utilities layer** — Create animations.css with fadeIn, slideUp, transition helpers for better UI polish (30 min) — Sprint Research Task (Session 0736) — CSS Architecture Best Practices |
| FC-163 | Chore | P3 | S | Ready | **Verify PurgeCSS in build pipeline** — Remove unused Bootstrap classes, estimated 30-40% CSS size reduction (1h) — Sprint Research Task (Session 0736) — CSS Architecture Best Practices |
| FC-164 | Feature | P1 | L | Ready | **Add Operational Dashboard view** — Create operations.html with cash flow 30/60/90 forecast, bills due aging, budget vs actuals drill-down (8-12h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-165 | Feature | P2 | S | Ready | **Implement progressive disclosure pattern** — Show 4 key metrics upfront, collapsible "Show More" for secondary metrics to reduce information overload (2h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-166 | Feature | P2 | S | Ready | **Add contextual tooltips to all metrics** — Explain financial jargon (debt-to-income, savings rate) with info icons + tooltips (1h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-167 | Feature | P1 | S | Ready | **Add bullet charts for goal tracking** — Replace gauge charts with Stephen Few bullet charts for emergency fund, savings goals (2h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-168 | Feature | P2 | S | Ready | **Add "What Changed?" chart annotations** — Explain spikes/dips in trend charts with context labels (car repair, bonus paycheck) (1h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-169 | Feature | P1 | M | Ready | **Add contextual empty states with sample data toggle** — Educational empty states with "Preview with Sample Data" button for new users (3h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-170 | Feature | P2 | S | Ready | **Add keyboard navigation for charts** — Allow arrow keys to navigate data points with screen reader announcements (2h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-171 | Feature | P3 | S | Ready | **Add "Export to Excel" for all tables** — Financial users expect Excel exports, add XLSX export function (1h) — Sprint Research Task (Session 0736) — Financial Dashboard UI Patterns |
| FC-UIUX-029 | Feature | P1 | S | Done | **Income page missing KPI summary cards** — Only financial page with ZERO stat cards. Add Monthly Total, Annual Total, Next Paycheck cards above the income table (2h) — FIXED commit 1b38a90 (2026-02-17) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-030 | Feature | P2 | XS | Ready | **Income page missing empty state** — Skeleton rows vanish on empty data, no guidance shown. Add #incomeEmptyState div with btn-primary CTA (20 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-031 | Bug | P3 | XS | Done | **Income modal field order suboptimal** — Amount before Date/Frequency. Reorder: Name → Type → Amount → Frequency → Date (2 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-032 | Chore | P3 | XS | Ready | **Income skeleton inline width styles** — 18 skeleton cells use inline style="width:XXpx". Add .skeleton-col-sm/md/lg CSS utilities (15 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-033 | Bug | P2 | XS | Done | **Transactions "Sync from Bank" wrong button style** — Uses btn-secondary (filled blue) for utility action, should be btn-outline-secondary (2 min) — FIXED commit 1b38a90 (2026-02-17) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-034 | Bug | P2 | XS | Ready | **Transactions primary action outside page-header-actions** — "Add Transaction" inside #dataContainer instead of .page-header-actions like all other pages (20 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-035 | Feature | P2 | S | Ready | **Transactions page missing skeleton loaders** — Table starts empty with just a CSS spinner. Add skeleton rows matching 5-column structure (20 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-036 | Bug | P2 | XS | Done | **Transactions empty state CTA uses btn-secondary** — Empty state buttons should be btn-primary to drive onboarding action (2 min) — FIXED commit 1b38a90 (2026-02-17) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-037 | Chore | P3 | XS | Ready | **Transactions inline script block in HTML** — 82-line script block at EOF should be extracted to transactions-init.js (15 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-038 | Bug | P3 | XS | Done | **Transactions "Apply Filters" uses btn-secondary** — Primary panel action should be btn-primary to differentiate from "Clear" (2 min) — FIXED commit 1b38a90 (2026-02-17) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-039 | Bug | P2 | XS | Done | **Friends page all empty state CTAs use btn-secondary** — 3 empty state buttons across Pending/Friends/Outgoing sections should be btn-primary (5 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-040 | Feature | P2 | XS | Ready | **Friends page-header-actions empty** — Only page with user content but zero header action button. Add "Find Friend" CTA to header (30 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-041 | Feature | P2 | S | Ready | **Friends page missing skeleton loaders** — FC-040 marked Done but no skeletons in static HTML for 3 content sections (30 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-042 | Bug | P3 | XS | Done | **Friends search button uses btn-secondary** — Input-group trigger action should be btn-primary (2 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-043 | Bug | P3 | XS | Done | **Friends H2 title mismatch** — H2 says "Friends & Connections", sidebar says "Friends" — should match (1 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |
| FC-UIUX-044 | Bug | P3 | XS | Done | **Friends empty states use inline SVG icons** — 3 empty state icon sections use raw SVG instead of Bootstrap Icons like all other pages (5 min) — Sprint UI/UX Audit (Session 0405, 2026-02-17) — see reports/UI-UX-AUDIT-FINAL-2026-02-17-0405.md |

| BUG-SKEL-001 | Bug | P2 | XS | Done | **Skeleton loaders stay visible after .loading removed** - .summary-card:not(.loading) .skeleton-loader had no display:none CSS rule � skeleton and value both visible simultaneously on Bills, Income, and all summary-card pages. Fixed: added CSS rule in main.css (Sprint QA 0420, 2026-02-17, commit f21804c) |
| BUG-SIGNUP-BTN-GLOBAL | Bug | P2 | XS | Done | **Sign Up CTA uses btn-secondary across all 11 pages** - Primary onboarding action should be btn-primary. Fixed across all pages: assets, bills, budget, debts, friends, income, index, investments, reports, settings, transactions (Sprint QA 0420, 2026-02-17, commit f21804c) |

| BUG-UX-ALERT-001 | Bug | P2 | S | Ready | **63 native alert() calls across 7 JS files** — app.js×49, onboarding.js×5, plaid.js×2, subscriptions.js×2, charts.js×1, email-bills.js×1, reports.js×1, security-patch.js×1. Toast system exists but native window.alert override is commented out. Blocking dialogs break UX + mobile. Fix: uncomment override (5 min quick win) + replace each with correct Toast type (2-3h proper fix). (Sprint UI/UX 0445, 2026-02-17) |
| BUG-UX-CONFIRM-001 | Bug | P2 | S | Done | **6 native confirm() blocking dialogs** — FIXED commit e3c78c5 (2026-02-17). Added showConfirmModal() to toast-notifications.js; replaced all 7 confirm() calls across app.js (×4), email-bills.js (×2), subscriptions.js (×1) with Bootstrap confirmation modals. (Sprint Dev 0515, 2026-02-17) |
| BUG-CHART-ALERT-001 | Bug | P3 | XS | Ready | **charts.js L797: pie chart click shows data in native alert()** — Clicking a category slice in the spending chart fires alert() with category name, monthly total, and a tip. Should be a Bootstrap popover or tooltip instead. Jarring UX, can't style it. Est: 30 min. (Sprint UI/UX 0445, 2026-02-17) |
| FC-176 | Bug | P2 | XS | Ready | **Bootstrap dark mode using wrong attribute** — All 11 HTML pages use `data-theme="dark"` on `<body>` instead of `data-bs-theme="dark"` on `<html>`. Bootstrap 5.3's built-in dark mode CSS variables are NOT activating — cards, dropdowns, modals, tables, forms all use light-mode Bootstrap styles. Fix: migrate attribute to `<html>` and update JS theme toggle. (2h) — Sprint Research 2026-02-17 |
| FC-177 | Chore | P3 | XS | Ready | **Parallel chart rendering in renderAdditionalCharts()** — 6 charts rendered sequentially with `await`. Replace with `Promise.all()` for ~5x faster dashboard chart load (300ms → ~60ms). Safe: each chart targets a different canvas element. (30 min) — Sprint Research 2026-02-17 |
| FC-178 | Chore | P3 | XS | Ready | **Chart.js tick rotation optimization** — All x-axes missing `minRotation: 0, maxRotation: 0, sampleSize: 10` settings. Chart.js must auto-calculate rotation on every render without these. (30 min, add to all `scales.x` configs in charts.js + app.js) — Sprint Research 2026-02-17 |
| FC-179 | Chore | P3 | XS | Done | **Script defer + Supabase preconnect** — FIXED commit e3c78c5 (2026-02-17). Added preconnect + dns-prefetch for Supabase to all 11 HTML pages. (Sprint Dev 0515, 2026-02-17) |
| BUG-CSS-ORPHAN-001 | Chore | P3 | XS | Ready | **3 orphaned CSS files not linked in any HTML** - financial-patterns.css (504 lines), category-icons.css (291 lines, references Lucide icons not in project), empty-states.css (338 lines, uses BEM naming mismatched from actual HTML classes). Total: 1,133 lines of dead CSS. Fix: delete or link correctly. (Sprint QA 0420, 2026-02-17) |
| FC-172 | Feature | P1 | S | Ready | **Cash Flow Projection Engine** — Implement `cash-flow.js` with `generateCashFlowProjection()`, `getOccurrences()`, `advanceByFrequency()`. Handles all 8 frequencies (daily → annual), month-end edge cases, parallel inflow/outflow ledger. Unit-testable. Powers FC-173. (2-3h) — Sprint Research 2026-02-17 — see reports/cash-flow-forecasting-research-2026-02-17.md |
| FC-173 | Feature | P1 | L | Ready | **Operational Dashboard Page** — Build `operations.html` + `operations.js` with: cash flow line chart (30/60/90d toggle), bills aging widget (3 buckets: ≤7d/8-30d/31-60d), budget vs. actuals horizontal bar chart, Safe to Spend KPI, upcoming 14-day transactions list. Depends on FC-172. (5-6h) — Sprint Research 2026-02-17 — see reports/cash-flow-forecasting-research-2026-02-17.md |
| FC-174 | Feature | P2 | XS | Ready | **Safety Buffer Setting** — Add `safety_buffer` field to settings table (default $500). User-configurable threshold for Safe to Spend calculation and low-balance alerts. Show in Settings page as part of FC-UIUX-023 expansion. (30 min) — Sprint Research 2026-02-17 |
| FC-175 | Feature | P2 | XS | Ready | **Current Balance Manual Entry** — Add `current_balance` field to settings table. Quick-entry modal on Operations page for users without Plaid production. Required starting point for cash flow projections (FC-172/173). (45 min) — Sprint Research 2026-02-17 |### EPIC-002: Mobile Application

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| MOB-001 | Spike | P2 | M | Done | iOS app strategy & architecture (IOS_APP_STRATEGY.md) |
| MOB-002 | Feature | P2 | XL | Backlog | React Native + Expo project scaffold — see reports/SPRINT-RESEARCH-REACT-NATIVE-EXPO-ARCHITECTURE-2026-02-09.md |
| MOB-003 | Feature | P2 | XL | Backlog | Core screens — Dashboard, Assets, Bills, Budget |
| MOB-004 | Feature | P3 | L | Backlog | Biometric auth (Face ID / Touch ID) |
| MOB-005 | Feature | P3 | L | Backlog | Push notifications for payment reminders |
| MOB-006 | Chore | P3 | M | Backlog | App Store / Play Store submission prep |

### Transaction Management

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| TRANS-001 | Feature | P1 | XL | Done | Transaction auto-categorization system (Phases 1-4 complete: DB schema, Plaid import, AI categorization, UI page) |

### EPIC-003: Email Intelligence

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| EMAIL-001 | Spike | P1 | M | Done | Gmail API integration research & plan |
| EMAIL-002 | Feature | P1 | XL | Backlog | Gmail bill parsing — auto-detect and import bills |
| EMAIL-003 | Feature | P2 | XL | Backlog | Gmail inbox management — sort, folders, labels |
| EMAIL-004 | Feature | P2 | L | Backlog | AI draft replies — suggest/prepare email responses |
| EMAIL-005 | Feature | P2 | M | Backlog | Spam detection & blocking |
| EMAIL-006 | Feature | P2 | XL | Backlog | Outlook/Microsoft Graph integration |
| EMAIL-007 | Feature | P3 | L | Backlog | Email summarization — daily digest of important emails |
| EMAIL-008 | Spike | P3 | M | Backlog | Multi-provider architecture (expandable beyond Gmail/Outlook) |

### EPIC-004: Calendar & Meetings

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| CAL-001 | Spike | P3 | M | Backlog | Calendar API research (Google Calendar + Outlook) |
| CAL-002 | Feature | P3 | XL | Backlog | View & manage calendar events |
| CAL-003 | Feature | P3 | L | Backlog | Schedule meetings & send invites |
| CAL-004 | Feature | P3 | M | Backlog | Conflict detection & resolution |
| CAL-005 | Feature | P4 | L | Backlog | Smart scheduling — find optimal meeting times |

### EPIC-004: DevOps Integration

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| DEVOPS-001 | Chore | P2 | L | Backlog | Set up Azure DevOps project + boards |
| DEVOPS-002 | Feature | P2 | M | Backlog | Sync BACKLOG.md ↔ Azure DevOps work items |
| DEVOPS-003 | Chore | P3 | M | Backlog | CI/CD pipeline in DevOps (replace GitHub Actions) |

---

## 📊 Sprint Status

### Current Sprint: Sprint 1 — Foundation (Feb 1-7)
**Goal:** Stable, polished, secure web app

| In Progress | Assignee |
|---|---|
| FC-001: Assets page routing | Builder |
| FC-004/005: UX/UI + Responsive | Builder |
| FC-006: Security remediation | Auditor |
| EMAIL-001: Gmail research | Connector |
| FC-009: Competitor research | Analyst |

### Next Sprint: Sprint 2 — Intelligence (Feb 8-14)
**Goal:** Email integration + mobile scaffold
- EMAIL-002: Gmail bill parsing
- EMAIL-003: Inbox management
- MOB-002: React Native scaffold
- FC-007: Accessibility compliance

---

## Adding Items
To add a new backlog item, tell Capital in #commands:
`/backlog add [type] [priority] [title]`

Examples:
- `/backlog add feature P2 Add recurring transaction templates`
- `/backlog add bug P1 Login session expires too quickly`
- `/backlog add spike P2 Research Plaid production requirements`
