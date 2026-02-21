# 🚨 CRITICAL DATABASE BUG - IMMEDIATE ACTION REQUIRED

**Bug ID:** BUG-DB-SCHEMA-SNAPSHOTS-001  
**Priority:** P0 (CRITICAL)  
**Status:** MIGRATION READY - NEEDS EXECUTION  
**Discovered:** 2026-02-21 Sprint QA 0720  
**Handled By:** Capital (Sprint Dev 0720)  

---

## Problem

The Supabase `snapshots` table is **missing the `monthlyBills` column**, causing:

- ❌ **400 errors on EVERY page load** (all 12 pages affected)
- ❌ **Daily net worth snapshots NOT being saved** (data loss in progress)
- ❌ **Dashboard charts may have stale/incomplete data**
- ❌ Console error on every API call:
  ```
  "Could not find the 'monthlyBills' column of 'snapshots' in the schema cache" (PGRST204)
  ```

---

## Impact Assessment

**Severity:** CRITICAL (P0)  
**User Experience:** Broken  
**Data Loss:** Active (snapshots not saving since column was expected)  
**Blocking:** All 12 pages affected by API errors  

---

## Solution

### ✅ Migration Script Created

**File:** `migrations/001_add_monthly_bills_column.sql`

### 🔥 EXECUTE IMMEDIATELY

1. **Go to Supabase SQL Editor:**  
   https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/editor

2. **Run this SQL:**
   ```sql
   ALTER TABLE snapshots 
   ADD COLUMN IF NOT EXISTS "monthlyBills" NUMERIC;
   ```

3. **Verify:**
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'snapshots'
   AND column_name = 'monthlyBills';
   ```

   Expected result:
   ```
   column_name   | data_type | is_nullable
   --------------|-----------|------------
   monthlyBills  | numeric   | YES
   ```

---

## Estimated Fix Time

**Execution:** 2 minutes  
**Verification:** 1 minute  
**Total:** 3 minutes  

---

## Post-Fix Verification

After running the migration:

1. ✅ Check browser console - 400 errors should stop
2. ✅ Navigate through all 12 pages - no errors
3. ✅ Daily snapshot save should work (check `snapshots` table for new rows with `monthlyBills` populated)
4. ✅ Dashboard charts should update with fresh data

---

## Root Cause

The application code expects a `monthlyBills` column in the `snapshots` table, but it was never added during initial schema creation or subsequent migrations. This is a **schema drift** issue between code expectations and database reality.

---

## Prevention

- **Add migration tracking system** to prevent schema drift
- **Add schema validation on app startup** to catch missing columns early
- **Document all database schema changes** in migrations folder

---

**Created:** 2026-02-21 07:35 AM EST  
**Sprint:** Dev 0720  
**Agent:** Capital  
