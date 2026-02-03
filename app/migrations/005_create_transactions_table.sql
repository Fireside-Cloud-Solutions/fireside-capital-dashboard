-- Migration 005: Create Transactions Table with AI Categorization Support
-- Created: 2026-02-03
-- Purpose: Enable transaction import from Plaid with AI-powered auto-categorization

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

-- Transactions table for imported bank transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Plaid transaction data
  plaid_transaction_id TEXT UNIQUE,
  plaid_account_id TEXT,
  
  -- Core transaction data
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  name TEXT NOT NULL,  -- Merchant name from Plaid
  merchant_name TEXT,  -- Cleaned merchant name
  
  -- AI Categorization
  category TEXT,  -- User-assigned or AI-suggested category
  confidence NUMERIC,  -- AI confidence score (0-1)
  user_confirmed BOOLEAN DEFAULT FALSE,  -- Has user manually confirmed the category?
  
  -- Additional metadata
  pending BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for querying user's transactions by date (most common query)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions(user_id, date DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_transactions_category 
ON public.transactions(user_id, category);

-- Index for Plaid transaction ID lookups (upsert operations)
CREATE INDEX IF NOT EXISTS idx_transactions_plaid 
ON public.transactions(plaid_transaction_id);

-- Index for pending transactions
CREATE INDEX IF NOT EXISTS idx_transactions_pending 
ON public.transactions(user_id, pending) 
WHERE pending = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own transactions
CREATE POLICY "Users can only access their own transactions" 
ON public.transactions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

-- Ensure amount is not zero (valid transactions only)
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_amount_non_zero 
  CHECK (amount != 0);

-- Ensure confidence score is between 0 and 1 if set
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_confidence_range 
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1));

-- Prevent future dates (allow 1 day buffer for pending transactions)
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_date_not_future 
  CHECK (date <= CURRENT_DATE + INTERVAL '1 day');

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'Imported bank transactions from Plaid with AI-powered categorization';

-- Column comments for documentation
COMMENT ON COLUMN public.transactions.plaid_transaction_id IS 'Unique ID from Plaid API for deduplication';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount (positive=income, negative=expense)';
COMMENT ON COLUMN public.transactions.category IS 'Transaction category (dining, groceries, transportation, etc.)';
COMMENT ON COLUMN public.transactions.confidence IS 'AI confidence score for auto-categorization (0.0 to 1.0)';
COMMENT ON COLUMN public.transactions.user_confirmed IS 'TRUE if user manually confirmed/edited the category';

-- ============================================================================
-- TRANSACTION CATEGORY PATTERNS TABLE (Learning System)
-- ============================================================================

-- Store user corrections to improve AI categorization over time
CREATE TABLE IF NOT EXISTS public.transaction_category_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_pattern TEXT NOT NULL,  -- e.g., 'starbucks', 'walmart', 'shell'
  category TEXT NOT NULL,
  confidence NUMERIC DEFAULT 1.0,  -- User-confirmed patterns have high confidence
  times_used INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one pattern per user per category
  UNIQUE(user_id, merchant_pattern, category)
);

-- Index for fast merchant pattern lookups
CREATE INDEX IF NOT EXISTS idx_category_patterns_user 
ON public.transaction_category_patterns(user_id, merchant_pattern);

-- Enable RLS on category patterns
ALTER TABLE public.transaction_category_patterns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own patterns
CREATE POLICY "Users can only access their own category patterns" 
ON public.transaction_category_patterns 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.transaction_category_patterns IS 'User-specific merchant categorization patterns for AI learning';

-- ============================================================================
-- STANDARD CATEGORIES REFERENCE
-- ============================================================================

-- Standard category values:
-- - dining: Restaurants, fast food, cafes
-- - groceries: Supermarkets, grocery stores
-- - transportation: Gas, parking, tolls, rideshare
-- - utilities: Electric, water, internet, phone
-- - entertainment: Movies, concerts, streaming
-- - shopping: Retail, clothing, electronics
-- - healthcare: Medical, pharmacy, fitness
-- - travel: Hotels, flights, vacation
-- - bills: Recurring bills, subscriptions
-- - income: Salary, refunds, transfers in
-- - other: Uncategorized

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
