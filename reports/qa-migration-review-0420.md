# Database Migration Review — Feb 20, 2026 04:20 AM
**Session:** Sprint QA cron 013cc4e7  
**Agent:** Capital (QA Orchestrator)  
**Status:** ⚠️ **2 CRITICAL ISSUES FOUND**

---

## Executive Summary

Reviewed all database migrations in `app/migrations/`. Found **2 critical issues**:
1. **Migration numbering conflict** (2 files named `001_*.sql`)
2. **Missing migration** (`010_snapshots_add_financial_columns.sql` referenced but doesn't exist)

---

## Existing Migrations

| File | Date Created | Size | Status |
|------|--------------|------|--------|
| `001_add_onboarding_columns.sql` | Feb 3 | 923 B | ✅ Exists |
| `001_create_pending_bills_table.sql` | Feb 1 | 1.9 KB | ✅ Exists |
| `003_add_data_validation_constraints.sql` | Feb 10 | 7 KB | ✅ Exists |
| `005_create_transactions_table.sql` | Feb 3 | 6.8 KB | ✅ Exists |
| `006_add_category_budgets_to_settings.sql` | Feb 17 | 770 B | ⚠️ **Not applied** |
| `007_transaction_category_patterns_and_realtime.sql` | Feb 17 | 4.2 KB | ⚠️ **Not applied** |

---

## Critical Issues

### BUG-MIGRATION-NUMBERING-001 (P2 High)
**Issue:** Two migrations numbered `001_*`  
**Impact:** Confusion about execution order, potential duplicate runs  
**Files affected:**
- `001_add_onboarding_columns.sql` (Feb 3, 923 B)
- `001_create_pending_bills_table.sql` (Feb 1, 1.9 KB)

**Root cause:** No migration numbering coordination, manual numbering

**Fix options:**
1. **Rename older migration** → `001_create_pending_bills_table.sql` (Feb 1) to `002_create_pending_bills_table.sql`
2. **OR rename newer migration** → `001_add_onboarding_columns.sql` (Feb 3) to `002_add_onboarding_columns.sql`

**Recommendation:** Rename `001_add_onboarding_columns.sql` → `002_add_onboarding_columns.sql` (keep pending_bills as true 001 since it's older)

---

### BUG-MIGRATION-MISSING-010 (P1 Critical)
**Issue:** Migration referenced but file doesn't exist  
**Referenced in:** `STATUS.md` lines 236, 241  
**Expected location:** `app/migrations/010_snapshots_add_financial_columns.sql`  
**Impact:** Month-over-month (MoM) deltas on stat cards will fail silently  

**Evidence from STATUS.md:**
```
Migration 010: `migrations/010_snapshots_add_financial_columns.sql`
- adds 5 new columns to snapshots table
- Matt must run this in Supabase SQL Editor
- Enables full MoM trend display on all 4 stat cards
```

**Required columns (from STATUS.md, commit ceb35f6):**
```sql
ALTER TABLE public.snapshots
  ADD COLUMN IF NOT EXISTS total_assets FLOAT,
  ADD COLUMN IF NOT EXISTS total_investments FLOAT,
  ADD COLUMN IF NOT EXISTS total_debts FLOAT,
  ADD COLUMN IF NOT EXISTS monthly_bills FLOAT,
  ADD COLUMN IF NOT EXISTS monthly_income FLOAT;
```

**Fix:** Create migration file `010_snapshots_add_financial_columns.sql` with above SQL

---

## Migration Gap Analysis

**Expected sequence:** 001, 002, 003, 004, 005, 006, 007, 008, 009, 010  
**Actual files:** 001 (×2), 003, 005, 006, 007  
**Missing numbers:** 002, 004, 008, 009, 010

**Impact:** Low (numbers are cosmetic, migrations are applied manually via Supabase SQL Editor)

**Recommendation:** Establish migration naming convention:
- `{sequential_number}_{descriptive_name}.sql`
- Track in separate `MIGRATIONS.md` file with applied dates
- Consider migration tracking table in database

---

## Pending Migrations (Not Yet Applied)

### 006_add_category_budgets_to_settings.sql
**Purpose:** Add `category_budgets` JSONB column to `settings` table  
**Required by:** FC-180 (Budget vs Actuals tracker)  
**Blocked features:**
- `saveCategoryBudgets()` in app.js
- `calculateBudgetVsActuals()` in budget-actuals.js
- Budget page category grid (9 categories)

**Impact:** HTTP 400 errors on budget.html and settings.html  
**Status:** ⚠️ **BLOCKING P1 FEATURE** — Matt must run in Supabase SQL Editor

**SQL review:** ✅ Clean, idempotent, has COMMENT, safe to run

---

### 007_transaction_category_patterns_and_realtime.sql
**Purpose:** 
1. Create `transaction_category_patterns` table
2. Add RLS policies
3. Enable Supabase Realtime publications for transactions, bills, snapshots

**Required by:**
- FC-198 (smart categorization learning)
- FC-200 (realtime.js for live updates)
- BUG-CATEGORIZER-TABLE-001 (table doesn't exist)

**Blocked features:**
- Auto-categorization learning (categorizer.js)
- Realtime WebSocket subscriptions
- Live transaction updates without page refresh

**Impact:** Realtime features broken, auto-categorization can't persist learned patterns  
**Status:** ⚠️ **BLOCKING P1 FEATURE** — Matt must run in Supabase SQL Editor

**SQL review:**
- ✅ Has idempotent checks (`IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION`)
- ✅ Proper RLS policies (user isolation)
- ✅ Has CHECK constraints (category enum validation)
- ✅ Includes verification queries
- ✅ Safe to run

---

## Recommendations

### Immediate Actions (Matt)
1. **Run migration 006** in Supabase SQL Editor (fixes budget page HTTP 400)
2. **Run migration 007** in Supabase SQL Editor (enables realtime + categorization)
3. **Create migration 010** with snapshots financial columns SQL
4. **Run migration 010** after creating it

### Short-term (Capital)
5. **Rename** `001_add_onboarding_columns.sql` → `002_add_onboarding_columns.sql`
6. **Create** `MIGRATIONS.md` tracking file with applied dates
7. **Document** migration process in `docs/database-migrations.md`

### Long-term (Capital)
8. **Implement** migration tracking table in Supabase:
```sql
CREATE TABLE public.schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now()
);
```
9. **Consider** migration tool (Flyway, Liquibase, or custom script)

---

## Migration Execution Order (for Matt)

**When running pending migrations, execute in this order:**

```
1. 006_add_category_budgets_to_settings.sql
   ↓ (fixes budget page HTTP 400)
   
2. 007_transaction_category_patterns_and_realtime.sql
   ↓ (enables categorization + realtime)
   
3. 010_snapshots_add_financial_columns.sql (AFTER creating it)
   ↓ (enables MoM deltas on stat cards)
```

**All migrations are idempotent** — safe to re-run if unsure.

---

**Created:** 2026-02-20 04:20 EST  
**Migrations reviewed:** 6  
**Critical issues:** 2 (numbering conflict + missing file)  
**Pending migrations:** 3 (006, 007, 010)  
**Blocking features:** Budget vs Actuals, Realtime, MoM deltas
