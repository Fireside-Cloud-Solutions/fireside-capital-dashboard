# Sprint Research Memory — 2026-02-18 06:56 EST

## Session
- Cron: f6500924 (Sprint Research)
- Topic: React Native Expo Deep Dive (MOB-002 implementation specifics)

## Status
All 14 prior research topics complete. This is first session of new research cycle targeting mobile implementation.

## Key Findings

### Mobile App Current State
- Scaffold exists: `mobile/` — Expo 54.0.33, RN 0.81.5, React Nav v7
- Only Login + Dashboard screens built
- Uses react-native-chart-kit (⚠️ DEAD — unmaintained 4 years)
- Theme colors WRONG — using #1a1a1a/dc3545 not Fireside brand
- No tab navigation yet, no CRUD screens
- No TanStack Query, no generated Supabase types

### Critical Findings
1. `react-native-chart-kit` is dead → replace with `react-native-gifted-charts`
2. Theme needs brand colors: #01a4ef primary, #f44e24 CTA, #81b900 success, #0f0f0f background
3. TanStack Query needs NetInfo (online) + AppState (focus) wiring specific to RN
4. `useFocusEffect` + `queryClient.invalidateQueries` = refresh-on-tab-focus pattern
5. Supabase types: `npx supabase gen types typescript --project-id qqtiofdqplwycnwplmen`

### New Tasks Created (9)
- MOB-008 (P1, 5min) — Fix theme.ts brand colors
- MOB-009 (P1, 30min) — Generate Supabase TypeScript types
- MOB-010 (P1, 30min) — TanStack Query v5 setup
- MOB-011 (P1, 45min) — useFinancialData.ts hooks
- MOB-012 (P1, 45min) — Bottom tab navigation (5 tabs)
- MOB-013 (P1, 3h) — CRUD list screens (4 screens)
- MOB-014 (P2, 1h) — Chart library upgrade
- MOB-015 (P2, 30min) — Bills urgency indicators
- MOB-016 (P3, 1h) — Demo mode for mobile

## Files
- Report: reports/react-native-expo-deep-dive-2026-02-18.md
- BACKLOG.md updated (MOB-008 through MOB-016 added)
