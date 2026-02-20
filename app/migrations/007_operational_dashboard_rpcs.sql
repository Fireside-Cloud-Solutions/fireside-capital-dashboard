-- Migration 007: Operational Dashboard RPCs for FC-173
-- Created: 2026-02-20
-- Purpose: 5 Postgres RPCs for FC-173 Operational Dashboard
-- All use SECURITY INVOKER + auth.uid() for RLS compliance

-- RPC 1: Monthly Spending by Category
-- Returns spending grouped by category for a given month
CREATE OR REPLACE FUNCTION get_monthly_spending(p_month text)
RETURNS TABLE(category text, total numeric, txn_count bigint)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 
    category,
    ROUND(SUM(amount)::numeric, 2) AS total,
    COUNT(*) AS txn_count
  FROM transactions
  WHERE user_id = auth.uid()
    AND category IS NOT NULL
    AND category != 'income'
    AND to_char(date::date, 'YYYY-MM') = p_month
  GROUP BY category
  ORDER BY total DESC;
$$;

-- RPC 2: Monthly Cash Flow
-- Returns income/expenses/net/savings_rate for a given month
CREATE OR REPLACE FUNCTION get_monthly_cash_flow(p_month text)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_income  numeric := 0;
  v_expenses numeric := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE user_id = auth.uid()
    AND category = 'income'
    AND to_char(date::date, 'YYYY-MM') = p_month;

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM transactions
  WHERE user_id = auth.uid()
    AND category != 'income'
    AND to_char(date::date, 'YYYY-MM') = p_month;

  RETURN json_build_object(
    'income',        v_income,
    'expenses',      v_expenses,
    'net',           v_income - v_expenses,
    'savings_rate',  CASE
                       WHEN v_income > 0
                       THEN ROUND(((v_income - v_expenses) / v_income) * 100, 1)
                       ELSE 0
                     END
  );
END;
$$;

-- RPC 3: 6-Month Spending Trend
-- Returns monthly spending/income/net for trend chart
CREATE OR REPLACE FUNCTION get_spending_trend(p_months int DEFAULT 6)
RETURNS TABLE(month text, total_spending numeric, total_income numeric, net numeric)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    to_char(date::date, 'YYYY-MM') AS month,
    ROUND(SUM(CASE WHEN category != 'income' THEN amount ELSE 0 END)::numeric, 2) AS total_spending,
    ROUND(SUM(CASE WHEN category = 'income'  THEN amount ELSE 0 END)::numeric, 2) AS total_income,
    ROUND(SUM(CASE WHEN category = 'income'  THEN amount ELSE -amount END)::numeric, 2) AS net
  FROM transactions
  WHERE user_id = auth.uid()
    AND date >= (CURRENT_DATE - (p_months || ' months')::interval)
  GROUP BY to_char(date::date, 'YYYY-MM')
  ORDER BY month ASC;
$$;

-- RPC 4: Bills Due Soon
-- Returns upcoming bills with days_until and is_overdue flags
CREATE OR REPLACE FUNCTION get_bills_due_soon(p_days int DEFAULT 30)
RETURNS TABLE(
  id        uuid,
  name      text,
  amount    numeric,
  due_date  date,
  days_until int,
  is_overdue boolean
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    id,
    name,
    ROUND(amount::numeric, 2),
    "nextDueDate"::date AS due_date,
    ("nextDueDate"::date - CURRENT_DATE)::int AS days_until,
    ("nextDueDate"::date < CURRENT_DATE) AS is_overdue
  FROM bills
  WHERE user_id = auth.uid()
    AND "nextDueDate"::date <= (CURRENT_DATE + p_days)
  ORDER BY "nextDueDate" ASC;
$$;

-- RPC 5: Net Worth Snapshot
-- Returns current net worth breakdown (assets - liabilities)
CREATE OR REPLACE FUNCTION get_net_worth_breakdown()
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_real_estate numeric := 0;
  v_vehicles    numeric := 0;
  v_investments numeric := 0;
  v_debt        numeric := 0;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN type = 'real_estate' THEN value ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'vehicle'     THEN value ELSE 0 END), 0)
  INTO v_real_estate, v_vehicles
  FROM assets
  WHERE user_id = auth.uid();

  SELECT COALESCE(SUM(balance), 0) INTO v_investments
  FROM investments WHERE user_id = auth.uid();

  SELECT COALESCE(SUM(balance), 0) INTO v_debt
  FROM debts WHERE user_id = auth.uid();

  RETURN json_build_object(
    'real_estate',        v_real_estate,
    'vehicles',           v_vehicles,
    'investments',        v_investments,
    'total_assets',       v_real_estate + v_vehicles + v_investments,
    'total_liabilities',  v_debt,
    'net_worth',          v_real_estate + v_vehicles + v_investments - v_debt
  );
END;
$$;

-- Verification queries (run after deployment)
-- SELECT * FROM get_monthly_spending('2026-02');
-- SELECT * FROM get_monthly_cash_flow('2026-02');
-- SELECT * FROM get_spending_trend(6);
-- SELECT * FROM get_bills_due_soon(30);
-- SELECT * FROM get_net_worth_breakdown();
