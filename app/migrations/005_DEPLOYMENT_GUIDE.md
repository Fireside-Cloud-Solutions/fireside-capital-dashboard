# Migration 005: Transaction Auto-Categorization System

**Created:** 2026-02-03  
**Status:** Ready for deployment  
**Priority:** HIGH (Competitor gap #1)

## What This Migration Does

Creates the complete database foundation for the transaction auto-categorization system:

1. **`transactions` table** - Stores imported bank transactions from Plaid
2. **`transaction_category_patterns` table** - Learns from user corrections to improve AI categorization

## Tables Created

### transactions
- **Purpose:** Store all imported bank transactions with AI categorization
- **Key Features:**
  - Plaid integration (transaction_id, account_id)
  - AI categorization with confidence scores
  - User confirmation tracking
  - Row-level security (users only see their own transactions)
  - Performance indexes for date and category queries

### transaction_category_patterns
- **Purpose:** Store merchant categorization patterns per user
- **Key Features:**
  - Learns from user corrections
  - Improves AI accuracy over time
  - User-specific patterns

## Standard Categories

The system supports these standard categories:
- `dining` - Restaurants, fast food, cafes
- `groceries` - Supermarkets, grocery stores
- `transportation` - Gas, parking, tolls, rideshare
- `utilities` - Electric, water, internet, phone
- `entertainment` - Movies, concerts, streaming
- `shopping` - Retail, clothing, electronics
- `healthcare` - Medical, pharmacy, fitness
- `travel` - Hotels, flights, vacation
- `bills` - Recurring bills, subscriptions
- `income` - Salary, refunds, transfers in
- `other` - Uncategorized

## How to Deploy

### Option 1: Supabase Dashboard (Recommended for first-time)

1. Go to https://qqtiofdqplwycnwplmen.supabase.co
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `005_create_transactions_table.sql`
5. Click **Run** or press `Ctrl+Enter`
6. Verify success in the **Table Editor**

### Option 2: Supabase CLI (If installed)

```bash
cd C:\Users\chuba\fireside-capital\app
supabase db push migrations/005_create_transactions_table.sql
```

### Option 3: REST API (Automated)

```powershell
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g"
}

# Execute migration (requires service_role key, not anon key)
# Contact admin for service_role access
```

## Verification

After running the migration, verify it worked:

### Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'transaction_category_patterns');
```

Expected result: 2 rows

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('transactions', 'transaction_category_patterns');
```

Expected: `rowsecurity = true` for both tables

### Check Indexes

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'transactions' 
AND schemaname = 'public';
```

Expected indexes:
- `transactions_pkey`
- `idx_transactions_user_date`
- `idx_transactions_category`
- `idx_transactions_plaid`
- `idx_transactions_pending`

## Next Steps After Migration

Once migration is deployed:

1. **Phase 2:** Implement Plaid transaction import endpoint
2. **Phase 3:** Integrate OpenAI for auto-categorization
3. **Phase 4:** Build transactions.html UI

## Rollback (If Needed)

If you need to undo this migration:

```sql
DROP TABLE IF EXISTS public.transaction_category_patterns CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
```

⚠️ **WARNING:** This will delete all transaction data. Only use in development.

## Dependencies

- ✅ Supabase database
- ✅ `auth.users` table (already exists)
- ⏳ Plaid integration (Phase 2)
- ⏳ OpenAI API key (Phase 3)

## Security Notes

- **RLS enabled:** Users can only access their own transactions
- **Foreign key constraints:** Transactions deleted when user is deleted
- **Check constraints:** Data validation at database level
- **Unique constraints:** Prevents duplicate Plaid transactions

## Performance Considerations

- Indexes optimized for common queries (date DESC, category filter)
- Partial index on pending transactions
- Unique index on plaid_transaction_id for fast upserts

## Questions or Issues?

If the migration fails, check:
1. Do you have admin access to Supabase?
2. Does `auth.users` table exist?
3. Are there any conflicting table names?

Report any errors to the main agent (Capital).
