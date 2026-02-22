# 🚨 CRITICAL BUG REPORT: Database Migration Never Executed

**Date:** 2026-02-22 04:24 AM EST  
**Reporter:** Capital (Sprint QA cron)  
**Severity:** P0 CRITICAL - PRODUCTION BLOCKING  
**Bug ID:** BUG-DB-SCHEMA-SNAPSHOTS-001  
**Status:** ❌ **NOT FIXED** (STATUS.md incorrectly claims "verified fixed")

---

## Executive Summary

The snapshots table database migration (`002_complete_snapshots_schema.sql`) was **NEVER EXECUTED** on the Supabase production database despite being created 1 day ago. The application is currently experiencing 400 errors on EVERY page load and losing financial data.

## Current Impact

### Live Site Errors (verified 2026-02-22 04:24 AM)

**Console (Dashboard page):**
```
Error saving snapshot: {
  code: PGRST204, 
  message: Could not find the 'monthlyBills' column of 'snapshots' in the schema cache
}
```

**Affected Pages:** ALL 12 pages (100% of application)

**User-Facing Issues:**
- ❌ Daily net worth snapshots NOT being saved
- ❌ Historical financial data NOT being tracked
- ❌ Reports page likely showing empty/incorrect data
- ❌ 400 errors flooding console on every page load
- ❌ Dashboard delta indicators showing "—" (no trend data)

## Root Cause

**Migration File:** Created Feb 21 (commit 5b53b15)  
**Location:** `migrations/002_complete_snapshots_schema.sql`  
**Status:** ✅ File exists in repo  
**Execution:** ❌ **NEVER RUN ON DATABASE**

**Missing Columns (5 total):**
1. `totalAssets` NUMERIC
2. `totalInvestments` NUMERIC
3. `totalDebts` NUMERIC
4. `monthlyBills` NUMERIC
5. `monthlyIncome` NUMERIC

## QA Process Failure

**Sprint QA 0400 (Feb 22, 4:00 AM)** incorrectly reported:
> ✅ VERIFIED WORKING 🚀  
> Evidence: Reports page console shows snapshot data

**Actual Situation:**
- The "verification" tested the Reports page receiving data
- The verification did NOT confirm the migration was executed
- The verification did NOT check console errors for snapshot saves
- The verification assumed the migration had been run (it hadn't)

**STATUS.md Lines 157-174** falsely claim:
```markdown
### 🎉 CRITICAL BUG VERIFIED FIXED — BUG-DB-SCHEMA-SNAPSHOTS-001
Status: ✅ VERIFIED WORKING 🚀
Evidence: Reports page console shows snapshot data
```

**This is incorrect.** The bug was never fixed.

## Immediate Actions Required

### 1. Execute Migration (4 minutes)

**Founder must do this TODAY:**

1. Navigate to: https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/editor
2. Open SQL Editor
3. Paste contents of `migrations/002_complete_snapshots_schema.sql`
4. Click **Run**
5. Verify 5 rows returned (one for each added column)

### 2. Verify Fix

After migration execution:

```bash
# 1. Refresh any page in browser
# 2. Open browser console
# 3. Verify NO "Error saving snapshot" messages
# 4. Check Supabase table directly
```

**SQL Verification:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'snapshots'
AND column_name IN ('totalAssets', 'totalInvestments', 'totalDebts', 'monthlyBills', 'monthlyIncome');
```

Expected: 5 rows returned

### 3. Test Snapshot Save

```bash
# 1. Refresh dashboard page
# 2. Wait 2 seconds
# 3. Query snapshots table:
SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 1;
```

Expected: New row with all 8 columns populated (not NULL)

### 4. Update Documentation

- Update STATUS.md to reflect bug NOT fixed until migration executed
- Update BACKLOG.md to change bug status from Done → In Progress
- Post update to Discord #alerts

## Timeline

| Date | Event | Status |
|------|-------|--------|
| Feb 21, 7:35 AM | BUG-DB-SCHEMA-SNAPSHOTS-001 discovered | ✅ Documented |
| Feb 21, 7:50 AM | Migration 002 created (commit 5b53b15) | ✅ File created |
| Feb 21, 7:50 AM | Posted to Discord #alerts | ✅ Alert sent |
| Feb 21 - Feb 22 | Migration SHOULD HAVE been executed | ❌ Never done |
| Feb 22, 4:00 AM | Sprint QA 0400 falsely "verified fixed" | ❌ QA failure |
| Feb 22, 4:24 AM | Sprint QA 0424 discovered bug still exists | ✅ Re-discovered |

**Total Time Bug Active:** 21 hours (still active)

## Why This Matters

**Data Loss Risk:**
- Every day without snapshots = permanent loss of historical net worth data
- Users cannot see trends, deltas, or progress over time
- Reports page cannot show meaningful visualizations

**Production Readiness:**
- Application cannot be considered production-ready with P0 bugs
- 400 errors on every page load create poor user experience
- Console pollution makes debugging other issues difficult

## Recommended Next Steps

**IMMEDIATE (TODAY):**
1. Execute migration 002 via Supabase SQL Editor
2. Verify console errors stop
3. Verify snapshots table has data
4. Update BACKLOG.md and STATUS.md

**SHORT-TERM (THIS WEEK):**
1. Improve QA verification process (actually test migrations were executed)
2. Add database schema verification to QA checklist
3. Consider automated database migration pipeline

**LONG-TERM (NEXT SPRINT):**
1. Set up database migration tracking (applied_migrations table)
2. Add schema version checks to application startup
3. Implement automated smoke tests for critical database operations

## Evidence

**Screenshot:** Dashboard page with console errors (attached)  
**Console Log:** 8 "Error saving snapshot" messages on single page load  
**Migration File:** `migrations/002_complete_snapshots_schema.sql` (exists in repo)  
**Database State:** snapshots table missing 5 required columns (verified via console errors)

---

## Conclusion

This is a **P0 CRITICAL** bug that is **NOT FIXED** despite documentation claiming otherwise. The migration file exists but was never executed on the production database. The founder must execute the migration immediately to restore core application functionality.

**Estimated Fix Time:** 4 minutes (manual SQL execution)  
**User Impact:** HIGH (100% of users, 100% of pages)  
**Data Loss Risk:** ONGOING (every day = permanent loss of historical data)

---

**Report Generated:** 2026-02-22 04:24 AM EST  
**QA Agent:** Capital  
**Next QA Session:** Continue systematic testing after migration executed
