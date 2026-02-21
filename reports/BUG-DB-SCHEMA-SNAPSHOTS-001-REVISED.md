# 🚨 CRITICAL DATABASE BUG - COMPLETE SCHEMA FIX REQUIRED

**Bug ID:** BUG-DB-SCHEMA-SNAPSHOTS-001 (REVISED)  
**Priority:** P0 (CRITICAL - BLOCKING PRODUCTION)  
**Status:** MIGRATION READY - AWAITING EXECUTION  
**Discovered:** 2026-02-21 Sprint QA 0720  
**Revised:** 2026-02-21 Sprint QA 0740  
**Handled By:** Capital (QA Lead)  

---

## Problem (REVISED - MORE EXTENSIVE THAN INITIALLY REPORTED)

The Supabase `snapshots` table is missing **FIVE required columns**, not just one:

### Missing Columns
1. ❌ `totalAssets` NUMERIC
2. ❌ `totalInvestments` NUMERIC
3. ❌ `totalDebts` NUMERIC
4. ❌ `monthlyBills` NUMERIC
5. ❌ `monthlyIncome` NUMERIC

### Current Impact
- ❌ **400 errors on EVERY page load** (all 12 pages affected)
- ❌ **Daily net worth snapshots NOT being saved** (data loss in progress)
- ❌ **Reports page shows $0.00 for ALL metrics** (Investments, Debts, Net Worth)
- ❌ **Zero historical data** (snapshots table is EMPTY - 0 rows)
- ❌ Console errors on every API call:
  ```
  Error saving snapshot: {
    code: PGRST204,
    message: "Could not find the 'monthlyBills' column of 'snapshots' in the schema cache"
  }
  ```

### Code vs Schema Mismatch

**What the code tries to save** (app.js:3805-3817):
```javascript
await sb.from('snapshots').upsert({
  date: today,
  netWorth,          // ✅ EXISTS in table
  totalAssets,       // ❌ MISSING from table
  totalInvestments,  // ❌ MISSING from table
  totalDebts,        // ❌ MISSING from table
  monthlyBills,      // ❌ MISSING from table
  monthlyIncome,     // ❌ MISSING from table
  user_id: currentUser.id
}, { onConflict: 'date,user_id' });
```

**Current schema** (verified via REST API):
```sql
CREATE TABLE public.snapshots (
    user_id uuid NOT NULL,
    date date NOT NULL,
    netWorth numeric,        -- ✅ Only data column that exists
    created_at timestamp with time zone DEFAULT now()
);
```

---

## Previous Migration Was Incomplete

**Migration 001** (commit 93e6aef) only added `monthlyBills`:
```sql
ALTER TABLE snapshots 
ADD COLUMN IF NOT EXISTS "monthlyBills" NUMERIC;
```

**This migration was NEVER executed** (snapshots table has 0 rows, REST API returns 400 errors).

---

## Complete Solution - Migration 002

### ✅ New Migration Script Created

**File:** `migrations/002_complete_snapshots_schema.sql`

### 🔥 EXECUTE IMMEDIATELY

**1. Go to Supabase SQL Editor:**  
https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/editor

**2. Run this SQL:**
```sql
ALTER TABLE snapshots 
ADD COLUMN IF NOT EXISTS "totalAssets" NUMERIC,
ADD COLUMN IF NOT EXISTS "totalInvestments" NUMERIC,
ADD COLUMN IF NOT EXISTS "totalDebts" NUMERIC,
ADD COLUMN IF NOT EXISTS "monthlyBills" NUMERIC,
ADD COLUMN IF NOT EXISTS "monthlyIncome" NUMERIC;
```

**3. Verify:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'snapshots'
AND column_name IN ('totalAssets', 'totalInvestments', 'totalDebts', 'monthlyBills', 'monthlyIncome')
ORDER BY column_name;
```

**Expected result (5 rows):**
```
column_name       | data_type | is_nullable
------------------|-----------|------------
monthlyBills      | numeric   | YES
monthlyIncome     | numeric   | YES
totalAssets       | numeric   | YES
totalDebts        | numeric   | YES
totalInvestments  | numeric   | YES
```

---

## Estimated Fix Time

**Execution:** 2 minutes (copy SQL, paste, run)  
**Verification:** 2 minutes (test pages, check console)  
**Total:** 4 minutes  

---

## Post-Fix Verification Checklist

After running the migration:

1. ✅ **Check browser console** - 400 errors should stop on all pages
2. ✅ **Navigate Dashboard** - Should trigger automatic snapshot save
3. ✅ **Check snapshots table** - Should have 1 new row with all 8 columns populated:
   ```sql
   SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 1;
   ```
4. ✅ **Check Reports page** - Should show actual data instead of $0.00:
   - Total Investments: ~$214,521.27
   - Total Debts: ~$9,799.73
   - Net Worth: ~$286,957.01
5. ✅ **Test all 12 pages** - No console errors
6. ✅ **Wait 24 hours** - Verify daily snapshot auto-save works

---

## Root Cause Analysis

### Why This Happened
1. **Schema drift** - Code was updated to save more fields, but database schema was never migrated
2. **Incomplete migration** - Migration 001 only added 1 of 5 missing columns
3. **No schema validation** - App doesn't check expected schema on startup
4. **Migration never executed** - Even the incomplete migration 001 was never run on Supabase

### Why It Wasn't Caught Earlier
- Snapshots save on a background timer (not user-facing action)
- Error logged to console but doesn't break page rendering
- Reports page shows $0.00 (could be mistaken for "no data yet")
- Testing focused on CRUD operations (bills, assets, etc.) not reporting

---

## Prevention Measures

### Immediate (P0)
- [x] Create complete migration with all 5 columns
- [ ] Founder executes migration immediately
- [ ] Add migration tracking system

### Short-term (P1)
- [ ] Add schema validation on app startup
  ```javascript
  async function validateSchema() {
    const { data, error } = await sb.from('snapshots').select('totalAssets').limit(0);
    if (error?.code === 'PGRST204') {
      console.error('SCHEMA ERROR: snapshots table missing required columns');
      alert('Database schema outdated. Please contact support.');
    }
  }
  ```
- [ ] Document all table schemas in `docs/database-schema.md`
- [ ] Create migration checklist (code changes = schema migration)

### Long-term (P2)
- [ ] Set up automated schema testing in CI/CD
- [ ] Add pre-deployment schema validation
- [ ] Implement database change review process
- [ ] Consider using Prisma or TypeORM for schema management

---

## Impact on Features

### Currently Broken
- ❌ Reports page (shows $0.00 for everything)
- ❌ Net worth trend charts (no historical data)
- ❌ Month-over-month comparisons
- ❌ Dashboard "change from last month" indicators

### Will Work After Fix
- ✅ Daily snapshot auto-save
- ✅ Reports page with accurate data
- ✅ Historical trend analysis
- ✅ Net worth tracking over time
- ✅ Monthly cash flow reports

---

## Testing Evidence

**1. Snapshots table is empty:**
```powershell
$headers = @{ "apikey" = "ANON_KEY"; "Authorization" = "Bearer ANON_KEY" }
Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/snapshots?select=*&limit=1" -Headers $headers
# Result: { "value": [], "Count": 0 }
```

**2. REST API confirms missing columns:**
```powershell
Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/snapshots?select=totalAssets,monthlyBills" -Headers $headers
# Result: 400 Bad Request (columns don't exist)
```

**3. Browser console shows error:**
```
Error saving snapshot: { code: PGRST204, message: "Could not find the 'monthlyBills' column of 'snapshots' in the schema cache" }
```

**4. Reports page screenshot:**
- All summary cards show $0.00
- Screenshot: `qa-sprint-audit-2026-02-21-reports.jpg`

---

## Related Bugs

### BUG-UI-REPORTS-ZERO-001 (P1)
**Title:** Reports page shows $0.00 for all metrics  
**Status:** BLOCKED by BUG-DB-SCHEMA-SNAPSHOTS-001  
**Will auto-fix:** YES (after migration executes + first snapshot saves)

### BUG-UI-DASHBOARD-TRENDS-001 (P2 - NOT YET FILED)
**Title:** Dashboard "change from last month" shows "—" (no delta)  
**Status:** BLOCKED by BUG-DB-SCHEMA-SNAPSHOTS-001  
**Will auto-fix:** YES (after 2+ snapshots exist for comparison)

---

## Communication

**Discord Alert Posted To:**
- #alerts (1467330087212028129) — Critical production issue
- #dev (TBD) — Migration script ready for execution

**BACKLOG.md Updated:**
- BUG-DB-SCHEMA-SNAPSHOTS-001 status: MIGRATION READY (002)
- Time estimate: 4 min execution
- Added note: "Previous migration 001 incomplete + never executed"

**STATUS.md Updated:**
- Sprint QA 0740 findings documented
- Database bug escalated to P0 CRITICAL

---

**Created:** 2026-02-21 07:45 AM EST  
**Sprint:** QA 0740  
**Agent:** Capital (QA Lead)  
**Next Action:** Founder must execute migration 002 immediately
