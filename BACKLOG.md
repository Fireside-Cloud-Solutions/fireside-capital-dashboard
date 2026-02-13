# BACKLOG.md — Product Backlog

**Product:** Fireside Capital → Fireside Personal Assistant  
**Owner:** Matt Hubacher  
**Last Updated:** 2026-02-13 (Performance optimization tasks added: FC-118 through FC-127)

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
| FC-043 | Bug | P2 | XS | Done | Button hierarchy violations across 6 pages (assets, bills, debts, income, investments, budget) — Add buttons using btn-primary instead of btn-secondary — see reports/FC-043-button-hierarchy-violations.md |
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
| FC-093 | Chore | P1 | XS | Ready | **Apply global Chart.js performance defaults** — Disable animations, set responsive/maintainAspectRatio, line tension=0, spanGaps=true (67% faster) — see research/chartjs-optimization.md |
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

### EPIC-002: Mobile Application

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
