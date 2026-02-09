# BACKLOG.md — Product Backlog

**Product:** Fireside Capital → Fireside Personal Assistant  
**Owner:** Matt Hubacher  
**Last Updated:** 2026-02-08 (Testing strategy tasks added: FC-073 through FC-076)

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
| FC-028 | Bug | P3 | XS | Backlog | Transactions page empty state doesn't match .empty-state component pattern — see reports/ISSUE-UX-CONSISTENCY-001.md |
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

### EPIC-002: Mobile Application

| ID | Type | Priority | Size | Status | Title |
|----|------|----------|------|--------|-------|
| MOB-001 | Spike | P2 | M | Done | iOS app strategy & architecture (IOS_APP_STRATEGY.md) |
| MOB-002 | Feature | P2 | XL | Backlog | React Native + Expo project scaffold |
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
