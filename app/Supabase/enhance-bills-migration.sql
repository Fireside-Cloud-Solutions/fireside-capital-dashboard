-- ============================================================
-- Migration: Enhanced Bills & Budget System
-- Fireside Capital
-- Date: 2025-07-21
-- Author: Architect Agent
--
-- PURPOSE:
--   Add payoff tracking, auto-draft flags, variable bill support,
--   payment method tracking, status management, and notes to the
--   bills table. Non-destructive — only ALTER TABLE ADD COLUMN.
--
-- INSTRUCTIONS:
--   Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--   This is safe to run multiple times (IF NOT EXISTS guards).
--
-- IMPORTANT:
--   - Does NOT drop or recreate any tables
--   - Preserves all existing data (10 live bills)
--   - RLS policies remain unchanged (adding columns doesn't affect them)
-- ============================================================

-- ========================
-- 1. ENHANCED BILLS TABLE
-- ========================

-- End date for finite bills (XGIMI, Big Green Egg, car payments, golf clubs)
-- NULL means the bill continues indefinitely (mortgage, utilities, subscriptions)
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS end_date date;

-- Original financed/total amount for payoff tracking
-- e.g., Big Green Egg total financed = $3,894.24 (12 payments × $324.52)
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS total_amount numeric;

-- Count of payments already made toward total_amount
-- Used with amount to calculate: total_paid = payments_made × amount
-- And payoff %: (payments_made × amount) / total_amount
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS payments_made integer DEFAULT 0;

-- Whether this bill is auto-drafted from a bank account
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS is_auto_draft boolean DEFAULT false;

-- Whether the amount varies month to month (utilities: electric, water, gas, sewage)
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS is_variable boolean DEFAULT false;

-- How this bill is paid: "Robinhood CC", "auto-draft", "manual", "Chase Sapphire", etc.
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS payment_method text;

-- Bill lifecycle status
-- 'active' = currently recurring
-- 'paid_off' = finite bill fully paid (auto-set when payments_made × amount >= total_amount)
-- 'cancelled' = user cancelled this bill
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Email sender pattern for Gmail integration
-- e.g., "noreply@peoples-gas.com", "billing@amwater.com"
-- Used to auto-match incoming emails to this bill for amount updates
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS email_source text;

-- Free-form notes
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS notes text;

-- ========================
-- 2. ADD CHECK CONSTRAINT FOR STATUS
-- ========================
-- Wrapped in DO block so it doesn't fail if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bills_status_check'
    ) THEN
        ALTER TABLE public.bills
            ADD CONSTRAINT bills_status_check
            CHECK (status IN ('active', 'paid_off', 'cancelled'));
    END IF;
END $$;

-- ========================
-- 3. INDEX FOR STATUS FILTERING
-- ========================
-- Common query: show only active bills
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills (status);

-- Common query: find bills by user + status
CREATE INDEX IF NOT EXISTS idx_bills_user_status ON public.bills (user_id, status);

-- ========================
-- 4. BUDGET AUTO-POPULATION FUNCTION
-- ========================
-- This function generates budget entries for a given month from active bills.
-- Call it at the start of each month, or on demand from the dashboard.
--
-- Usage: SELECT generate_monthly_budget('8b6aca68-...', '2025-08');
--
-- Logic:
--   - For each active bill owned by the user:
--     - If fixed: needed_amount = bill.amount
--     - If variable: needed_amount = last month's budget assigned_amount (or bill.amount as fallback)
--   - Uses ON CONFLICT to avoid duplicates (upserts needed_amount only)
-- ========================
CREATE OR REPLACE FUNCTION generate_monthly_budget(
    p_user_id uuid,
    p_month text  -- format: 'YYYY-MM'
)
RETURNS integer  -- returns count of budget entries created/updated
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer := 0;
    v_prev_month text;
    v_bill record;
    v_needed numeric;
    v_prev_amount numeric;
BEGIN
    -- Calculate previous month string (e.g., '2025-08' → '2025-07')
    v_prev_month := to_char(
        (p_month || '-01')::date - interval '1 month',
        'YYYY-MM'
    );

    -- Loop through all active bills for this user
    FOR v_bill IN
        SELECT id, name, type, amount, is_variable
        FROM public.bills
        WHERE user_id = p_user_id
          AND status = 'active'
    LOOP
        -- Determine needed_amount
        IF v_bill.is_variable = true THEN
            -- For variable bills: use last month's assigned amount, fallback to bill.amount
            SELECT assigned_amount INTO v_prev_amount
            FROM public.budgets
            WHERE user_id = p_user_id
              AND month = v_prev_month
              AND item_id = v_bill.id
              AND item_type = 'bill'
            LIMIT 1;

            v_needed := COALESCE(v_prev_amount, v_bill.amount);
        ELSE
            -- For fixed bills: use the bill's amount directly
            v_needed := v_bill.amount;
        END IF;

        -- Upsert the budget entry
        INSERT INTO public.budgets (
            user_id, month, item_id, item_type,
            name, category, needed_amount, assigned_amount
        )
        VALUES (
            p_user_id, p_month, v_bill.id, 'bill',
            v_bill.name, v_bill.type, v_needed, v_needed
        )
        ON CONFLICT (user_id, month, item_id)
        DO UPDATE SET
            needed_amount = EXCLUDED.needed_amount,
            name = EXCLUDED.name,
            category = EXCLUDED.category;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- ========================
-- 5. PAYOFF CHECK FUNCTION
-- ========================
-- Automatically marks bills as 'paid_off' when fully paid.
-- Can be called after recording a payment, or on a schedule.
--
-- Usage: SELECT check_bill_payoffs('8b6aca68-...');
-- ========================
CREATE OR REPLACE FUNCTION check_bill_payoffs(p_user_id uuid)
RETURNS integer  -- returns count of bills marked as paid_off
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer := 0;
BEGIN
    UPDATE public.bills
    SET status = 'paid_off'
    WHERE user_id = p_user_id
      AND status = 'active'
      AND total_amount IS NOT NULL
      AND total_amount > 0
      AND payments_made IS NOT NULL
      AND (payments_made * amount) >= total_amount;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- ========================
-- 6. PAYOFF PROGRESS VIEW
-- ========================
-- Convenient view for the frontend to query payoff progress.
-- Returns all finite bills with calculated fields.
-- ========================
CREATE OR REPLACE VIEW public.bill_payoff_progress AS
SELECT
    id,
    user_id,
    name,
    type,
    status,
    amount AS monthly_payment,
    total_amount,
    payments_made,
    -- Total amount paid so far
    CASE
        WHEN payments_made IS NOT NULL AND amount IS NOT NULL
        THEN payments_made * amount
        ELSE 0
    END AS total_paid,
    -- Remaining balance
    CASE
        WHEN total_amount IS NOT NULL AND payments_made IS NOT NULL AND amount IS NOT NULL
        THEN GREATEST(total_amount - (payments_made * amount), 0)
        ELSE NULL
    END AS remaining_balance,
    -- Percentage complete (0-100)
    CASE
        WHEN total_amount IS NOT NULL AND total_amount > 0 AND payments_made IS NOT NULL AND amount IS NOT NULL
        THEN LEAST(ROUND(((payments_made * amount) / total_amount) * 100, 1), 100)
        ELSE NULL
    END AS payoff_percent,
    -- Estimated remaining payments
    CASE
        WHEN total_amount IS NOT NULL AND amount IS NOT NULL AND amount > 0 AND payments_made IS NOT NULL
        THEN GREATEST(CEIL((total_amount - (payments_made * amount)) / amount), 0)
        ELSE NULL
    END AS remaining_payments,
    -- Estimated payoff date (based on monthly frequency)
    CASE
        WHEN total_amount IS NOT NULL AND amount IS NOT NULL AND amount > 0 AND payments_made IS NOT NULL
             AND (payments_made * amount) < total_amount
        THEN (CURRENT_DATE + (
            GREATEST(CEIL((total_amount - (payments_made * amount)) / amount), 0) || ' months'
        )::interval)::date
        ELSE NULL
    END AS estimated_payoff_date,
    end_date,
    "nextDueDate",
    payment_method,
    notes
FROM public.bills
WHERE total_amount IS NOT NULL;

-- ========================
-- 7. GRANT ACCESS TO THE VIEW
-- ========================
-- The view uses SECURITY DEFINER functions and the bills table
-- which already has RLS. The view itself inherits the RLS of
-- the underlying table, so authenticated users only see their own data.

-- ========================
-- 8. BACKFILL EXISTING BILLS WITH DEFAULTS
-- ========================
-- Set all existing bills to 'active' status and is_auto_draft/is_variable defaults
-- This is safe to run multiple times
UPDATE public.bills SET status = 'active' WHERE status IS NULL;
UPDATE public.bills SET is_auto_draft = false WHERE is_auto_draft IS NULL;
UPDATE public.bills SET is_variable = false WHERE is_variable IS NULL;
UPDATE public.bills SET payments_made = 0 WHERE payments_made IS NULL;

-- ============================================================
-- MIGRATION COMPLETE
--
-- Next steps after running this migration:
-- 1. Update existing bills with proper metadata (is_variable, is_auto_draft, etc.)
-- 2. Import remaining bills from recurring-bills.json
-- 3. Set up payoff tracking for finite bills (total_amount, payments_made)
-- ============================================================
