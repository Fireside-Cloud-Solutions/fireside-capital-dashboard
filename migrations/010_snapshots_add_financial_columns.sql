-- Migration 010: Add financial columns to snapshots for MoM trend calculations (FC-086)
-- These columns are written by updateDashboardCards() on each page load and read by
-- calculateAndDisplayTrends() to display month-over-month deltas on stat cards.

ALTER TABLE snapshots
  ADD COLUMN IF NOT EXISTS "totalAssets"      NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS "totalInvestments" NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS "totalDebts"       NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS "monthlyBills"     NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS "monthlyIncome"    NUMERIC(15,2);

-- Confirm existing index covers the upsert conflict target
-- (date, user_id) unique constraint was added in initial schema
-- No new index needed — just confirming.
