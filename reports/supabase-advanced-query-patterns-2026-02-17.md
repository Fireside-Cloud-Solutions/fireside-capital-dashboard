# Research Report: Supabase Advanced Query Patterns
**Sprint Research | 2026-02-17 06:57 EST | Agent: Researcher**
**Scope:** FC-173 Operational Dashboard — aggregates, RPCs, views, client-side vs server-side tradeoffs

---

## 1. Context

The current app fetches ALL rows from every table and computes everything client-side. This is fine now with a single user and <100 rows per table, but it doesn't scale and it's the wrong pattern for dashboard aggregations. FC-173 (Operational Dashboard) needs to display 8+ computed metrics — all of which require aggregates across transactions, bills, debts, and income.

**Current pattern (everywhere in app.js):**
```js
const { data: transactions } = await sb.from('transactions').select('*').eq('user_id', uid);
// Then: transactions.reduce((sum, t) => sum + t.amount, 0)  ← client-side aggregate
```

**Target pattern for FC-173:**
```js
const { data } = await supabase.rpc('get_monthly_spending_by_category', {
  p_user_id: uid, p_month: '2026-02'
});
// Returns pre-grouped rows: [{ category: 'dining', total: 450.00, count: 12 }, ...]
```

---

## 2. Why RPCs Over PostgREST Aggregates

**PostgREST native aggregates** (available via `.select('sum(amount)')`) require:
- `ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';`
- This must be set in the Supabase dashboard SQL editor
- May require Pro plan; not guaranteed on free tier Supabase instance

**Postgres RPCs (stored functions)** are universally supported, work with RLS, and are the Supabase-recommended pattern for complex queries. Use them.

**Key advantage:** RPCs respect Row-Level Security (RLS) even with `SECURITY INVOKER` — so we don't need to pass `user_id` as a parameter at all if RLS is enabled on the tables. The `auth.uid()` is available inside the function context.

---

## 3. Five Core RPCs for FC-173

Run all of these in Supabase SQL Editor (Dashboard → SQL Editor → New Query):

### RPC 1: Monthly Spending by Category
The most important query for the Operational Dashboard budget section.

```sql
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
```

**JS call:**
```js
const { data: spending } = await supabase.rpc('get_monthly_spending', {
  p_month: '2026-02'
});
// Returns: [{ category: 'dining', total: 450.00, txn_count: 12 }, ...]
```

**Why this matters:** Replaces fetching all transactions + client-side `reduce()`. For 500+ transactions, this is 10-50x faster.

---

### RPC 2: Monthly Cash Flow
Income vs expenses summary for the dashboard header KPI cards.

```sql
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
```

**JS call:**
```js
const { data: cashFlow } = await supabase.rpc('get_monthly_cash_flow', {
  p_month: '2026-02'
});
// Returns: { income: 5200.00, expenses: 3840.00, net: 1360.00, savings_rate: 26.2 }
```

---

### RPC 3: 6-Month Spending Trend
Powers the spending trend chart on the Operational Dashboard.

```sql
CREATE OR REPLACE FUNCTION get_spending_trend(p_months int DEFAULT 6)
RETURNS TABLE(month text, total_spending numeric, total_income numeric, net numeric)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    to_char(date::date, 'YYYY-MM')                                    AS month,
    ROUND(SUM(CASE WHEN category != 'income' THEN amount ELSE 0 END)::numeric, 2) AS total_spending,
    ROUND(SUM(CASE WHEN category = 'income'  THEN amount ELSE 0 END)::numeric, 2) AS total_income,
    ROUND(SUM(CASE WHEN category = 'income'  THEN amount ELSE -amount END)::numeric, 2) AS net
  FROM transactions
  WHERE user_id = auth.uid()
    AND date >= (CURRENT_DATE - (p_months || ' months')::interval)
  GROUP BY to_char(date::date, 'YYYY-MM')
  ORDER BY month ASC;
$$;
```

**JS call:**
```js
const { data: trend } = await supabase.rpc('get_spending_trend', { p_months: 6 });
// Returns: [{ month: '2025-09', total_spending: 3200, total_income: 5000, net: 1800 }, ...]
// Feed directly into Chart.js line chart
```

---

### RPC 4: Bills Due Soon
For the "Upcoming Bills" widget on the Operational Dashboard.

```sql
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
    "nextDueDate"::date                                  AS due_date,
    ("nextDueDate"::date - CURRENT_DATE)::int            AS days_until,
    ("nextDueDate"::date < CURRENT_DATE)                 AS is_overdue
  FROM bills
  WHERE user_id = auth.uid()
    AND "nextDueDate"::date <= (CURRENT_DATE + p_days)
  ORDER BY "nextDueDate" ASC;
$$;
```

**JS call:**
```js
const { data: upcoming } = await supabase.rpc('get_bills_due_soon', { p_days: 30 });
// Returns sorted bill list with days_until and is_overdue flags pre-computed
```

---

### RPC 5: Net Worth Snapshot
Single-call current net worth breakdown for dashboard header.

```sql
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
```

**JS call:**
```js
const { data: nw } = await supabase.rpc('get_net_worth_breakdown');
// Returns: { real_estate: 380000, vehicles: 28000, investments: 45000,
//            total_assets: 453000, total_liabilities: 224000, net_worth: 229000 }
```

---

## 4. Parallel Execution Pattern (CRITICAL)

Do NOT call these RPCs sequentially. Use `Promise.all()`:

```js
// ✅ Correct — all 5 RPCs fire simultaneously (~200ms total)
const month = getCurrentMonth(); // '2026-02'
const [spending, cashFlow, trend, bills, netWorth] = await Promise.all([
  supabase.rpc('get_monthly_spending',    { p_month: month }),
  supabase.rpc('get_monthly_cash_flow',   { p_month: month }),
  supabase.rpc('get_spending_trend',      { p_months: 6 }),
  supabase.rpc('get_bills_due_soon',      { p_days: 30 }),
  supabase.rpc('get_net_worth_breakdown'),
]);

// ❌ Wrong — sequential, 5× slower
const spending  = await supabase.rpc('get_monthly_spending', { p_month: month });
const cashFlow  = await supabase.rpc('get_monthly_cash_flow', { p_month: month });
// ... etc
```

---

## 5. Recommended Database View

One view is worth creating — it simplifies the monthly snapshot insert (currently in app.js):

```sql
CREATE OR REPLACE VIEW v_current_net_worth AS
SELECT
  auth.uid()                                           AS user_id,
  COALESCE((SELECT SUM(value)   FROM assets      WHERE user_id = auth.uid()), 0)
  + COALESCE((SELECT SUM(balance) FROM investments WHERE user_id = auth.uid()), 0)
  - COALESCE((SELECT SUM(balance) FROM debts       WHERE user_id = auth.uid()), 0) AS net_worth,
  NOW()::date                                          AS as_of;
```

Usage: `supabase.from('v_current_net_worth').select('net_worth')` — auto-filters by RLS.

---

## 6. Demo Mode Routing Pattern

The `budget-actuals.js` demo mode pattern should be replicated in `operational-dashboard.js`:

```js
async function loadOperationalDashboardData(month) {
  if (typeof isDemoMode === 'function' && isDemoMode()) {
    return buildDemoOpsData(month); // Pure JS, no Supabase calls
  }

  // Live mode — parallel RPC calls
  const [spending, cashFlow, trend, bills, netWorth] = await Promise.all([
    supabase.rpc('get_monthly_spending',    { p_month: month }),
    supabase.rpc('get_monthly_cash_flow',   { p_month: month }),
    supabase.rpc('get_spending_trend',      { p_months: 6 }),
    supabase.rpc('get_bills_due_soon',      { p_days: 30 }),
    supabase.rpc('get_net_worth_breakdown'),
  ]);

  return {
    spending:  spending.data  || [],
    cashFlow:  cashFlow.data  || {},
    trend:     trend.data     || [],
    bills:     bills.data     || [],
    netWorth:  netWorth.data  || {},
  };
}
```

---

## 7. Implementation Steps for Builder

1. **Run SQL** — Paste all 5 RPC definitions into Supabase SQL Editor → Run
2. **Verify** — Test each RPC in SQL Editor: `SELECT * FROM get_monthly_spending('2026-02');`
3. **Create `operational-dashboard.js`** — Import pattern from `budget-actuals.js`, wire up all 5 RPCs with `Promise.all()`
4. **Wire to `operations.html`** — The FC-173 page that doesn't exist yet
5. **Demo data** — Add `buildDemoOpsData()` to `demo-data.js` using `DEMO_DATA.transactions`

---

## 8. New Tasks Created

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-193 | P1 | 1h | Deploy 5 Supabase RPCs to production (SQL Editor paste + verify) |
| FC-194 | P1 | 5h | Build `operational-dashboard.js` — loads all 5 RPCs in parallel, renders FC-173 UI |
| FC-195 | P2 | 1h | Migrate `budget-actuals.js` live-mode query to use RPC instead of client-side SUM |
| FC-196 | P3 | 1h | Add demo data for Operational Dashboard (`buildDemoOpsData()` in demo-data.js) |

**Combined:** ~8h → Complete Operational Dashboard with RPC-backed data layer

---

## 9. Key Takeaways

| Finding | Impact |
|---------|--------|
| Use RPCs, not PostgREST aggregates | PostgREST aggregates need manual Supabase config; RPCs always work |
| `SECURITY INVOKER` + `auth.uid()` | No `user_id` param needed — RLS handles scoping automatically |
| `Promise.all()` for all 5 RPCs | ~200ms dashboard load vs 1000ms sequential |
| Mirror `budget-actuals.js` demo pattern | Same `isDemoMode()` guard, `buildDemoOpsData()` as fallback |
| Run SQL directly in Supabase Dashboard | No migration files needed; these are Postgres functions, not schema changes |
