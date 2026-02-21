-- Migration: Complete snapshots table schema with ALL missing columns
-- Priority: P0 - CRITICAL (blocking production)
-- Issue: BUG-DB-SCHEMA-SNAPSHOTS-001 (revised)
-- Created: 2026-02-21 (Sprint QA 0740)
-- 
-- Problem: snapshots table missing FIVE required columns causes:
--   - 400 errors on ALL page loads (12/12 pages)
--   - Daily snapshots NOT being saved (data loss)
--   - Reports page shows $0.00 for all metrics
--   - Console errors on every API call
--
-- Previous Migration (001) only added monthlyBills
-- This migration adds ALL 5 missing columns
--
-- EXECUTE THIS IMMEDIATELY via Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/editor

-- Add all missing columns to snapshots table
ALTER TABLE snapshots 
ADD COLUMN IF NOT EXISTS "totalAssets" NUMERIC,
ADD COLUMN IF NOT EXISTS "totalInvestments" NUMERIC,
ADD COLUMN IF NOT EXISTS "totalDebts" NUMERIC,
ADD COLUMN IF NOT EXISTS "monthlyBills" NUMERIC,
ADD COLUMN IF NOT EXISTS "monthlyIncome" NUMERIC;

-- Verify all columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'snapshots'
AND column_name IN ('totalAssets', 'totalInvestments', 'totalDebts', 'monthlyBills', 'monthlyIncome')
ORDER BY column_name;

-- Expected result (5 rows):
-- column_name       | data_type | is_nullable
-- ------------------|-----------|------------
-- monthlyBills      | numeric   | YES
-- monthlyIncome     | numeric   | YES
-- totalAssets       | numeric   | YES
-- totalDebts        | numeric   | YES
-- totalInvestments  | numeric   | YES

-- AFTER EXECUTION:
-- 1. Verify console errors stop on all 12 pages
-- 2. Trigger a manual snapshot save (refresh any page with data)
-- 3. Verify Reports page shows actual data instead of $0.00
-- 4. Check snapshots table has new row with all columns populated
