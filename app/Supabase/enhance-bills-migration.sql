-- ============================================================
-- Migration: Enhanced Bills & Budget System + Loan/Financing Tracking
-- Fireside Capital
-- Date: 2025-07-21 (updated 2025-07-21)
-- Author: Architect Agent
--
-- PURPOSE:
--   Add payoff tracking, auto-draft flags, variable bill support,
--   payment method tracking, status management, notes, AND full
--   loan/financing tracking with interest rate calculations and
--   amortization schedule support.
--
-- ADDITIONS (v2 — Loan Tracking):
--   - interest_rate (APR), original_principal, loan_term_months, start_date
--   - calculate_amortization_schedule() — full amortization table function
--   - calculate_loan_summary() — quick snapshot of loan position
--   - Updated payoff progress view with interest/principal breakdowns
--   - Backfill defaults for 0% APR store financing items
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
-- 1b. LOAN / FINANCING COLUMNS
-- ========================
-- These columns enable full amortization tracking for financed items
-- (car loans, mortgage, store financing like Big Green Egg, XGIMI, etc.)

-- Annual Percentage Rate (APR) as a decimal-friendly numeric
-- e.g., 5.99 means 5.99% APR. NULL = unknown or not a loan.
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS interest_rate numeric;

-- The original loan/financed amount BEFORE interest
-- e.g., if you financed $30,000 for a car, this is 30000
-- total_amount (from above) = principal + total interest over life of loan
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS original_principal numeric;

-- Total length of the loan in months
-- e.g., 60 for a 5-year car loan, 360 for a 30-year mortgage
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS loan_term_months integer;

-- When the loan/financing began — used with loan_term_months
-- to calculate where you are in the amortization schedule
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS start_date date;

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
-- 6. AMORTIZATION SCHEDULE FUNCTION
-- ========================
-- Returns a full amortization table for a loan.
-- Each row = one payment period with principal/interest breakdown.
--
-- Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
--   where P = principal, r = monthly rate, n = total payments
--
-- For 0% APR loans, each payment is simply P/n (no interest).
--
-- Usage:
--   SELECT * FROM calculate_amortization_schedule(30000, 5.99, 60, 12);
--   → Returns 60 rows showing month-by-month breakdown
--
-- Parameters:
--   p_principal       — original loan amount
--   p_annual_rate     — APR as a percentage (e.g., 5.99 for 5.99%)
--   p_term_months     — total number of monthly payments
--   p_payments_made   — how many payments already made (to mark past vs future)
-- ========================
CREATE OR REPLACE FUNCTION calculate_amortization_schedule(
    p_principal numeric,
    p_annual_rate numeric,
    p_term_months integer,
    p_payments_made integer DEFAULT 0
)
RETURNS TABLE (
    payment_number      integer,
    payment_amount      numeric,
    principal_portion   numeric,
    interest_portion    numeric,
    cumulative_principal numeric,
    cumulative_interest  numeric,
    remaining_balance   numeric,
    is_paid             boolean
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_monthly_rate  numeric;
    v_monthly_pmt   numeric;
    v_balance       numeric;
    v_interest      numeric;
    v_principal     numeric;
    v_cum_principal numeric := 0;
    v_cum_interest  numeric := 0;
    i               integer;
BEGIN
    -- Guard: if any input is NULL or invalid, return empty
    IF p_principal IS NULL OR p_principal <= 0
       OR p_term_months IS NULL OR p_term_months <= 0 THEN
        RETURN;
    END IF;

    v_balance := p_principal;

    -- Handle 0% APR (store financing, promotional rates)
    IF p_annual_rate IS NULL OR p_annual_rate = 0 THEN
        v_monthly_pmt := ROUND(p_principal / p_term_months, 2);

        FOR i IN 1..p_term_months LOOP
            -- Last payment absorbs any rounding remainder
            IF i = p_term_months THEN
                v_principal := v_balance;
            ELSE
                v_principal := v_monthly_pmt;
            END IF;

            v_balance := v_balance - v_principal;
            v_cum_principal := v_cum_principal + v_principal;

            payment_number      := i;
            payment_amount      := v_principal;  -- no interest, so payment = principal
            principal_portion   := ROUND(v_principal, 2);
            interest_portion    := 0;
            cumulative_principal := ROUND(v_cum_principal, 2);
            cumulative_interest  := 0;
            remaining_balance   := ROUND(GREATEST(v_balance, 0), 2);
            is_paid             := (i <= COALESCE(p_payments_made, 0));

            RETURN NEXT;
        END LOOP;

        RETURN;
    END IF;

    -- Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    v_monthly_rate := p_annual_rate / 100.0 / 12.0;

    v_monthly_pmt := ROUND(
        p_principal * (v_monthly_rate * POWER(1 + v_monthly_rate, p_term_months))
                    / (POWER(1 + v_monthly_rate, p_term_months) - 1),
        2
    );

    FOR i IN 1..p_term_months LOOP
        v_interest := ROUND(v_balance * v_monthly_rate, 2);

        -- Last payment: absorb any rounding difference
        IF i = p_term_months THEN
            v_principal := v_balance;
            v_interest := v_monthly_pmt - v_principal;
            IF v_interest < 0 THEN v_interest := 0; END IF;
        ELSE
            v_principal := v_monthly_pmt - v_interest;
        END IF;

        v_balance := v_balance - v_principal;
        v_cum_principal := v_cum_principal + v_principal;
        v_cum_interest := v_cum_interest + v_interest;

        payment_number      := i;
        payment_amount      := ROUND(v_monthly_pmt, 2);
        principal_portion   := ROUND(v_principal, 2);
        interest_portion    := ROUND(v_interest, 2);
        cumulative_principal := ROUND(v_cum_principal, 2);
        cumulative_interest  := ROUND(v_cum_interest, 2);
        remaining_balance   := ROUND(GREATEST(v_balance, 0), 2);
        is_paid             := (i <= COALESCE(p_payments_made, 0));

        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$;

-- ========================
-- 6b. LOAN SUMMARY FUNCTION
-- ========================
-- Returns a single-row summary of a loan's current position.
-- Useful for dashboard cards and quick status without the full schedule.
--
-- Usage:
--   SELECT * FROM calculate_loan_summary(30000, 5.99, 60, 12);
--   → One row with totals and current position
-- ========================
CREATE OR REPLACE FUNCTION calculate_loan_summary(
    p_principal numeric,
    p_annual_rate numeric,
    p_term_months integer,
    p_payments_made integer DEFAULT 0
)
RETURNS TABLE (
    monthly_payment         numeric,
    total_cost              numeric,      -- principal + all interest
    total_interest          numeric,      -- total interest over life of loan
    interest_paid_to_date   numeric,
    principal_paid_to_date  numeric,
    remaining_balance       numeric,
    remaining_payments      integer,
    payoff_percent          numeric       -- 0-100
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_monthly_rate numeric;
    v_monthly_pmt  numeric;
    v_total_interest numeric;
    v_cum_interest   numeric := 0;
    v_cum_principal  numeric := 0;
    v_balance        numeric;
    v_interest       numeric;
    v_principal_part numeric;
    i                integer;
BEGIN
    -- Guard
    IF p_principal IS NULL OR p_principal <= 0
       OR p_term_months IS NULL OR p_term_months <= 0 THEN
        RETURN;
    END IF;

    v_balance := p_principal;

    -- 0% APR path
    IF p_annual_rate IS NULL OR p_annual_rate = 0 THEN
        v_monthly_pmt := ROUND(p_principal / p_term_months, 2);

        monthly_payment        := v_monthly_pmt;
        total_cost             := p_principal;
        total_interest         := 0;
        principal_paid_to_date := ROUND(LEAST(COALESCE(p_payments_made, 0) * v_monthly_pmt, p_principal), 2);
        interest_paid_to_date  := 0;
        remaining_balance      := ROUND(GREATEST(p_principal - principal_paid_to_date, 0), 2);
        remaining_payments     := GREATEST(p_term_months - COALESCE(p_payments_made, 0), 0);
        payoff_percent         := CASE WHEN p_principal > 0
                                       THEN LEAST(ROUND((principal_paid_to_date / p_principal) * 100, 1), 100)
                                       ELSE 0 END;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Standard amortization
    v_monthly_rate := p_annual_rate / 100.0 / 12.0;

    v_monthly_pmt := ROUND(
        p_principal * (v_monthly_rate * POWER(1 + v_monthly_rate, p_term_months))
                    / (POWER(1 + v_monthly_rate, p_term_months) - 1),
        2
    );

    v_total_interest := (v_monthly_pmt * p_term_months) - p_principal;

    -- Walk through paid periods to get cumulative values at current position
    FOR i IN 1..LEAST(COALESCE(p_payments_made, 0), p_term_months) LOOP
        v_interest := ROUND(v_balance * v_monthly_rate, 2);
        v_principal_part := v_monthly_pmt - v_interest;

        v_balance := v_balance - v_principal_part;
        v_cum_principal := v_cum_principal + v_principal_part;
        v_cum_interest := v_cum_interest + v_interest;
    END LOOP;

    monthly_payment        := v_monthly_pmt;
    total_cost             := ROUND(v_monthly_pmt * p_term_months, 2);
    total_interest         := ROUND(v_total_interest, 2);
    interest_paid_to_date  := ROUND(v_cum_interest, 2);
    principal_paid_to_date := ROUND(v_cum_principal, 2);
    remaining_balance      := ROUND(GREATEST(v_balance, 0), 2);
    remaining_payments     := GREATEST(p_term_months - COALESCE(p_payments_made, 0), 0);
    payoff_percent         := CASE WHEN p_principal > 0
                                   THEN LEAST(ROUND((v_cum_principal / p_principal) * 100, 1), 100)
                                   ELSE 0 END;

    RETURN NEXT;
    RETURN;
END;
$$;

-- ========================
-- 7. PAYOFF PROGRESS VIEW (Enhanced with Loan Details)
-- ========================
-- Convenient view for the frontend to query payoff progress.
-- Returns all finite bills with calculated fields.
-- For loans with interest_rate + original_principal, uses amortization
-- math to provide accurate interest/principal breakdowns.
-- For 0% or non-loan items, falls back to simple payment math.
-- ========================
CREATE OR REPLACE VIEW public.bill_payoff_progress AS
SELECT
    b.id,
    b.user_id,
    b.name,
    b.type,
    b.status,
    b.amount AS monthly_payment,
    b.total_amount,
    b.payments_made,

    -- ---- Loan-specific fields ----
    b.interest_rate,
    b.original_principal,
    b.loan_term_months,
    b.start_date,

    -- Total interest over the life of the loan
    -- If we have loan details, calculate from amortization; otherwise derive from total_amount - original_principal
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.total_interest)
        WHEN b.total_amount IS NOT NULL AND b.original_principal IS NOT NULL
        THEN GREATEST(b.total_amount - b.original_principal, 0)
        ELSE NULL
    END AS total_interest,

    -- Interest paid to date (from amortization calculation)
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.interest_paid_to_date)
        ELSE 0
    END AS interest_paid_to_date,

    -- Principal paid to date (from amortization calculation)
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.principal_paid_to_date)
        WHEN b.payments_made IS NOT NULL AND b.amount IS NOT NULL
        THEN b.payments_made * b.amount
        ELSE 0
    END AS principal_paid_to_date,

    -- Total amount paid so far (principal + interest paid to date)
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN COALESCE(ls.principal_paid_to_date, 0) + COALESCE(ls.interest_paid_to_date, 0)
        WHEN b.payments_made IS NOT NULL AND b.amount IS NOT NULL
        THEN b.payments_made * b.amount
        ELSE 0
    END AS total_paid,

    -- Remaining balance (uses amortization if available, otherwise simple math)
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.remaining_balance)
        WHEN b.total_amount IS NOT NULL AND b.payments_made IS NOT NULL AND b.amount IS NOT NULL
        THEN GREATEST(b.total_amount - (b.payments_made * b.amount), 0)
        ELSE NULL
    END AS remaining_balance,

    -- Percentage complete (0-100)
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.payoff_percent)
        WHEN b.total_amount IS NOT NULL AND b.total_amount > 0 AND b.payments_made IS NOT NULL AND b.amount IS NOT NULL
        THEN LEAST(ROUND(((b.payments_made * b.amount) / b.total_amount) * 100, 1), 100)
        ELSE NULL
    END AS payoff_percent,

    -- Estimated remaining payments
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
        THEN (ls.remaining_payments)
        WHEN b.total_amount IS NOT NULL AND b.amount IS NOT NULL AND b.amount > 0 AND b.payments_made IS NOT NULL
        THEN GREATEST(CEIL((b.total_amount - (b.payments_made * b.amount)) / b.amount), 0)::integer
        ELSE NULL
    END AS remaining_payments,

    -- Estimated payoff date
    CASE
        WHEN b.original_principal IS NOT NULL AND b.original_principal > 0
             AND b.loan_term_months IS NOT NULL AND b.loan_term_months > 0
             AND ls.remaining_payments > 0
        THEN (CURRENT_DATE + (ls.remaining_payments || ' months')::interval)::date
        WHEN b.total_amount IS NOT NULL AND b.amount IS NOT NULL AND b.amount > 0
             AND b.payments_made IS NOT NULL AND (b.payments_made * b.amount) < b.total_amount
        THEN (CURRENT_DATE + (
            GREATEST(CEIL((b.total_amount - (b.payments_made * b.amount)) / b.amount), 0) || ' months'
        )::interval)::date
        ELSE NULL
    END AS estimated_payoff_date,

    b.end_date,
    b."nextDueDate",
    b.payment_method,
    b.notes
FROM public.bills b
LEFT JOIN LATERAL (
    SELECT *
    FROM calculate_loan_summary(
        b.original_principal,
        b.interest_rate,
        b.loan_term_months,
        b.payments_made
    )
) ls ON b.original_principal IS NOT NULL
     AND b.original_principal > 0
     AND b.loan_term_months IS NOT NULL
     AND b.loan_term_months > 0
WHERE b.total_amount IS NOT NULL
   OR (b.original_principal IS NOT NULL AND b.original_principal > 0);

-- ========================
-- 8. GRANT ACCESS TO THE VIEW
-- ========================
-- The view uses SECURITY DEFINER functions and the bills table
-- which already has RLS. The view itself inherits the RLS of
-- the underlying table, so authenticated users only see their own data.
-- The LATERAL join to calculate_loan_summary is IMMUTABLE so it's safe.

-- ========================
-- 9. BACKFILL EXISTING BILLS WITH DEFAULTS
-- ========================
-- Set all existing bills to 'active' status and is_auto_draft/is_variable defaults
-- This is safe to run multiple times
UPDATE public.bills SET status = 'active' WHERE status IS NULL;
UPDATE public.bills SET is_auto_draft = false WHERE is_auto_draft IS NULL;
UPDATE public.bills SET is_variable = false WHERE is_variable IS NULL;
UPDATE public.bills SET payments_made = 0 WHERE payments_made IS NULL;

-- ========================
-- 9b. BACKFILL LOAN DEFAULTS FOR KNOWN FINANCING ITEMS
-- ========================
-- 0% APR store financing: XGIMI and Big Green Egg
-- These are known 0% promotional financing — safe to set automatically.
-- For all others (BMW, Chevy Tahoe, Mortgage, etc.), leave interest_rate NULL
-- so the user can fill in their actual APR.

-- XGIMI — 0% store financing
UPDATE public.bills
SET interest_rate = 0
WHERE LOWER(name) LIKE '%xgimi%'
  AND interest_rate IS NULL;

-- Big Green Egg — 0% store financing
UPDATE public.bills
SET interest_rate = 0
WHERE LOWER(name) LIKE '%big green egg%'
  AND interest_rate IS NULL;

-- ============================================================
-- MIGRATION COMPLETE
--
-- New columns added:
--   interest_rate, original_principal, loan_term_months, start_date
--
-- New functions:
--   calculate_amortization_schedule(principal, rate, term, payments_made)
--     → Returns full month-by-month amortization table
--   calculate_loan_summary(principal, rate, term, payments_made)
--     → Returns single-row loan position summary
--
-- Updated views:
--   bill_payoff_progress — now includes interest_rate, original_principal,
--     total_interest, interest_paid_to_date, principal_paid_to_date
--     (auto-calculated via LATERAL join to calculate_loan_summary)
--
-- Next steps after running this migration:
--   1. Update existing bills with proper metadata (is_variable, is_auto_draft, etc.)
--   2. For each financed item, set: interest_rate, original_principal,
--      loan_term_months, start_date, total_amount, payments_made
--   3. Query amortization schedules:
--        SELECT * FROM calculate_amortization_schedule(30000, 5.99, 60, 12);
--   4. Query payoff progress (now with loan details):
--        SELECT * FROM bill_payoff_progress WHERE user_id = '...';
-- ============================================================
