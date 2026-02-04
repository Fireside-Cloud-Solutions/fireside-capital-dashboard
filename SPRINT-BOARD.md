# SPRINT BOARD — Fireside Capital Dashboard

> **ALL AGENTS: Read this file BEFORE starting work. Update it AFTER completing work.**
> This is the single source of truth for task coordination.

## 🔴 IN PROGRESS (claimed — do not duplicate)

| Task | Claimed By | Started | Channel | Notes |
|------|-----------|---------|---------|-------|
| Bills page UI/UX audit | Architect | 2026-02-03 8:02 PM | #ui-ux | 6/11 pages done |
| CSS architecture research | Researcher | 2026-02-03 7:56 PM | #research | Delivered — moving to dark theme |
| QA full audit | Builder | 2026-02-03 8:05 PM | #qa | 11/11 HTML reviewed |

## 🟡 QUEUED (priority order — next agent picks top item)

| # | Task | Priority | Source | Notes |
|---|------|----------|--------|-------|
| 1 | Implement FC-036: Manual transaction entry | MEDIUM | #qa | 4-6 hour feature - delegate to Builder |
| 2 | Fix friends.html UI issues (7 issues from audit) | MEDIUM | #ui-ux | Loading states, empty state CTAs, mobile auth buttons |
| 3 | Bootstrap dark theme research | LOW | Researcher backlog | ✅ COMPLETE (reports posted) |
| 4 | PWA research | LOW | Researcher backlog | ✅ COMPLETE (reports posted) |
| 5 | Performance optimization | LOW | Researcher backlog | ✅ COMPLETE (reports posted) |

**NOTE:** Tasks "Implement design token system" and "Add skeleton loaders" removed — ALREADY IMPLEMENTED (design-tokens.css and skeleton CSS in components.css)

## ✅ COMPLETED (last 20)

| Task | Done By | Completed | Commit |
|------|---------|-----------|--------|
| Fix FC-033: Debts table layout (hide Term/Next Due on mobile) | Lead Dev (Capital) | 2026-02-04 9:05 AM | 1c9c308 |
| Fix FC-034: Bills filter button styling consistency | Lead Dev (Capital) | 2026-02-04 8:42 AM | ef148bc |
| Fix FC-037: Budget page duplicate bills (ID deduplication) | Lead Dev (Capital) | 2026-02-04 8:25 AM | 16bfd2e |
| Fix FC-030: Dashboard charts blank white squares | Lead Dev (Capital) | 2026-02-04 8:00 AM | a979728 |
| Fix FC-029: Welcome button height matches notification bell | Lead Dev (Capital) | 2026-02-04 7:45 AM | 62fcd36 |
| Fix ISSUE-UX-CONSISTENCY-001: Transactions page empty state | Capital (QA Bot) | 2026-02-03 10:09 PM | f0591eb |
| Fix FC-027: Desktop touch targets (44px WCAG 2.5.5) | Capital (Lead Dev) | 2026-02-03 10:00 PM | b46c813 |
| Fix ISSUE-UI007: Button hierarchy on transactions page | Capital (Lead Dev) | 2026-02-03 9:22 PM | f46497f |
| Fix .btn-secondary CSS conflict | Capital | 2026-02-03 8:08 PM | da4b117 |
| Fix backtick-n escape sequences | Builder | 2026-02-03 8:05 PM | 4724ba5 |
| Fix duplicate class attributes | Builder | 2026-02-03 8:05 PM | 50535fb |
| Remove budget category tags | Capital | 2026-02-03 7:30 PM | 06ec053 |
| Fix welcome button centering | Capital | 2026-02-03 7:30 PM | a712390 |
| Fix mobile column override | Capital | 2026-02-03 7:30 PM | 61f8835 |
| Mobile filter button wrapping | Capital | 2026-02-03 8:22 PM | 953130f |
| CSS architecture research | Researcher | 2026-02-03 7:56 PM | — |
| Financial dashboard UI patterns | Researcher | 2026-02-03 | — |
| Chart.js advanced patterns | Researcher | 2026-02-03 | — |
| Remove test files from prod | Builder | 2026-02-03 | d502a3f |
| Safe-area insets all pages | Capital | 2026-02-03 | — |

## 📋 RULES

1. **Before starting work:** Read this file. Check IN PROGRESS — don't work on claimed tasks.
2. **Claiming a task:** Move it from QUEUED to IN PROGRESS with your name and timestamp.
3. **Finishing a task:** Move it from IN PROGRESS to COMPLETED with commit hash if applicable.
4. **Found a new issue?** Add it to QUEUED with appropriate priority.
5. **Capital (PM)** owns prioritization — reorder QUEUED as needed.
6. **Conflicts?** If two agents edit this file simultaneously, Capital resolves on next run.
