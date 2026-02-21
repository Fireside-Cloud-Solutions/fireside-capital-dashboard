-- Migration: Add monthlyBills column to snapshots table
-- Priority: P0 - CRITICAL (blocking production)
-- Issue: BUG-DB-SCHEMA-SNAPSHOTS-001
-- Created: 2026-02-21
-- 
-- Problem: snapshots table missing monthlyBills column causes:
--   - 400 errors on ALL page loads (12/12 pages)
--   - Daily snapshots NOT being saved (data loss)
--   - Console error: "Could not find the 'monthlyBills' column of 'snapshots' in the schema cache"
--
-- EXECUTE THIS IMMEDIATELY via Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/editor

-- Add the missing column
ALTER TABLE snapshots 
ADD COLUMN IF NOT EXISTS "monthlyBills" NUMERIC;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'snapshots'
AND column_name = 'monthlyBills';

-- Expected result:
-- column_name   | data_type | is_nullable
-- --------------|-----------|------------
-- monthlyBills  | numeric   | YES
