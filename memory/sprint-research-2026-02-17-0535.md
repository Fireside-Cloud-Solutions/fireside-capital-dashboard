# Sprint Research Memory — 2026-02-17 05:35 EST

## Session
- Cron: f6500924 (Sprint Research)
- Topics: Budget vs Actuals + Sample Data / Demo Mode

## Status
All 6 original research topics complete (CSS, Financial UI, Chart.js, Bootstrap Dark Theme, PWA, Performance).
Previous session (0431): Cash Flow Forecasting for FC-172/173.
This session: Budget vs Actuals algorithm + Demo Mode architecture.

## Key Findings

### Budget vs Actuals
- Current budgets table = item-based (per bill/debt), NOT true category actuals
- True BvA needs: settings.category_budgets JSON + transactions table sum by category
- Formula: Variance = actual - budget, Pct = ((actual/budget)-1) × 100
- "3 Amber Rule": warn at 85% of budget (not just at 100%)
- Engine: ~100 lines, budget-actuals.js
- UI: Bootstrap progress bars (green/amber/red), month selector

### Demo Mode Architecture
- Client-side only: demo data in JS, no Supabase writes
- Two files: demo-data.js (all table data) + data-layer.js (Supabase wrapper)
- Toggle: localStorage flag + sticky banner
- Sample profile: Tech Corp salary $5200 bi-weekly + $800 freelance, mortgage $1850, student loan $24500, car loan $11200, 401k $45200 + Roth IRA $18700

## Tasks Created
- FC-180 (P1, 1h) — Category budget settings (settings.category_budgets JSON)
- FC-181 (P1, 2h) — budget-actuals.js engine
- FC-182 (P1, 3h) — BvA UI card (progress bars)
- FC-183 (P2, 1h) — Historical budget comparison
- FC-184 (P1, 3h) — demo-data.js (all 6 tables)
- FC-185 (P1, 2h) — data-layer.js (Supabase wrapper)
- FC-186 (P2, 1h) — Demo banner + empty state toggle buttons
- FC-187 (P2, 30m) — Demo toggle in Settings

## Files
- Report: reports/budget-vs-actuals-sample-data-research-2026-02-17.md
- BACKLOG.md updated (FC-180 to FC-187 added)
- STATUS.md updated
- Posted to #dashboard (msg 1473267654016892989)
