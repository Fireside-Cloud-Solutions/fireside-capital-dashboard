# Sprint Research Memory — 2026-02-17 04:31 EST

**Session:** Research Cron f6500924, 04:31 AM
**Duration:** ~10 min
**Agent:** Capital (Orchestrator)

## Status
- All 6 original research topics COMPLETE (done by Feb 16)
- This session: Pivoted to Cash Flow Forecasting — implementation guide for FC-164

## New Research Topic: Cash Flow Forecasting

**Report:** `reports/cash-flow-forecasting-research-2026-02-17.md`

### Key Findings
1. Algorithm = day-by-day ledger from existing bills + income + debts tables
2. Only new DB field needed: `current_balance` in settings (FC-175, 45 min)
3. "Safe to Spend" = lowest balance in next 14 days minus safety buffer — killer feature, 30 min
4. Handles 8 frequencies: daily, weekly, bi-weekly, monthly, bi-monthly, quarterly, semi-annual, annual
5. Month-end edge cases: use `setMonth()` not fixed-day arithmetic

### 4 New Backlog Items
- FC-172 (P1, 2-3h): Cash Flow Projection Engine (cash-flow.js)
- FC-173 (P1, 5-6h): Operational Dashboard Page (operations.html)
- FC-174 (P2, 30 min): Safety Buffer setting
- FC-175 (P2, 45 min): Current Balance manual entry

### Discord
- Posted 2 messages to #dashboard (1473251501391609939, 1473251568106082304)

## Next Research Opportunity
- Supabase Realtime subscriptions (for live balance updates)
- Or: implementation is now ready — spawn Builder for FC-172+FC-173
