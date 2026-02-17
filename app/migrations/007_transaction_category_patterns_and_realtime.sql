-- Migration 007: transaction_category_patterns table + Supabase Realtime publications
-- FC-198 | Priority: P1 | Date: 2026-02-17
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)
--
-- This migration:
--   1. Creates transaction_category_patterns table (fixes BUG-CATEGORIZER-TABLE-001)
--   2. Adds RLS policies so users only see their own learned patterns
--   3. Enables Supabase Realtime publications for transactions, bills, snapshots
--      (required by FC-200 realtime.js)

-- ============================================================
-- Part 1: transaction_category_patterns table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.transaction_category_patterns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_pattern TEXT NOT NULL,          -- normalized lowercase alphanum string
  category        TEXT NOT NULL,            -- must match CATEGORIES enum in categorizer.js
  confidence      FLOAT NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  times_used      INTEGER NOT NULL DEFAULT 1,
  last_used       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_category CHECK (
    category IN (
      'dining', 'groceries', 'transportation', 'utilities',
      'entertainment', 'shopping', 'healthcare', 'travel',
      'bills', 'income', 'other', 'uncategorized'
    )
  ),
  UNIQUE (user_id, merchant_pattern, category)
);

-- Index for fast pattern lookups (used by categorizer.js batch .in() query)
CREATE INDEX IF NOT EXISTS idx_tcp_user_pattern
  ON public.transaction_category_patterns (user_id, merchant_pattern);

-- ============================================================
-- Part 2: Row Level Security
-- ============================================================

ALTER TABLE public.transaction_category_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only read their own patterns
CREATE POLICY "Users read own patterns"
  ON public.transaction_category_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own patterns
CREATE POLICY "Users insert own patterns"
  ON public.transaction_category_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own patterns
CREATE POLICY "Users update own patterns"
  ON public.transaction_category_patterns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own patterns
CREATE POLICY "Users delete own patterns"
  ON public.transaction_category_patterns
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Part 3: Enable Supabase Realtime publications
-- Required for FC-200 (realtime.js) to receive live updates
-- NOTE: transactions table must already exist
-- ============================================================

-- Add tables to supabase_realtime publication
-- (This is idempotent — safe to re-run)
DO $$
BEGIN
  -- transactions
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'transactions already in publication or table does not exist: %', SQLERRM;
  END;

  -- bills
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'bills already in publication or table does not exist: %', SQLERRM;
  END;

  -- snapshots
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.snapshots;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'snapshots already in publication or table does not exist: %', SQLERRM;
  END;
END;
$$;

-- ============================================================
-- Verification queries (run these to confirm success)
-- ============================================================
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'transaction_category_patterns';
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename IN ('transactions', 'bills', 'snapshots');
