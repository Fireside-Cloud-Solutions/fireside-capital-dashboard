# Database Constraints Deployment Checklist

## ⚠️ MANUAL DEPLOYMENT REQUIRED

This migration requires manual execution via Supabase Dashboard SQL Editor.

---

## Pre-Deployment (✅ COMPLETED)

- [x] **Migration file created:** `app/migrations/003_add_data_validation_constraints.sql`
- [x] **Documentation created:** `docs/database-constraints-deployed.md`
- [x] **Validation script created:** `scripts/validate-data.ps1`
- [x] **Test suite created:** `scripts/test-constraints.ps1`
- [x] **Existing data validated:** 0 violations found
- [x] **26 constraints ready to deploy**

---

## Deployment Steps (⏳ REQUIRES HUMAN ACTION)

### Step 1: Open Supabase Dashboard
1. Navigate to: https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen
2. Login with credentials from `.credentials`
3. Click: **SQL Editor** in left sidebar

### Step 2: Apply Migration
1. Click: **New Query**
2. Open file: `app/migrations/003_add_data_validation_constraints.sql`
3. Copy the **entire contents** (7,035 bytes)
4. Paste into SQL Editor
5. Click: **Run** (bottom right)
6. Verify: "Success. No rows returned" message appears

### Step 3: Verify Constraints Are Active
Run this query in SQL Editor:
```sql
SELECT 
    constraint_name, 
    table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'CHECK' 
AND table_schema = 'public'
ORDER BY table_name, constraint_name;
```

**Expected result:** 26 rows (see list below)

<details>
<summary>Click to see expected constraints list</summary>

| table_name | constraint_name |
|------------|-----------------|
| assets | assets_created_at_not_future |
| assets | assets_loan_nonnegative |
| assets | assets_type_valid |
| assets | assets_value_nonnegative |
| bills | bills_amount_positive |
| bills | bills_created_at_not_future |
| bills | bills_frequency_valid |
| bills | bills_type_valid |
| debts | debts_balance_nonnegative |
| debts | debts_created_at_not_future |
| debts | debts_interest_rate_reasonable |
| debts | debts_monthly_payment_nonnegative |
| debts | debts_type_valid |
| income | income_amount_positive |
| income | income_created_at_not_future |
| income | income_frequency_valid |
| income | income_type_valid |
| investments | investments_annual_return_reasonable |
| investments | investments_balance_nonnegative |
| investments | investments_created_at_not_future |
| investments | investments_type_valid |
| snapshots | snapshots_created_at_not_future |

</details>

### Step 4: Run Test Suite
```powershell
cd C:\Users\chuba\fireside-capital
powershell -ExecutionPolicy Bypass -File scripts/test-constraints.ps1
```

**Expected output:**
```
✅ Tests Passed: 8
❌ Tests Failed: 0
All constraints are working correctly! ✨
```

### Step 5: Update Documentation
After successful deployment:
1. Edit `docs/database-constraints-deployed.md`
2. Change status from "⏳ Ready for deployment" to "✅ Deployed"
3. Add deployment date and test results

### Step 6: Commit and Push
```bash
cd C:\Users\chuba\fireside-capital\app
git add migrations/003_add_data_validation_constraints.sql
git add ../docs/database-constraints-deployed.md
git add ../docs/DEPLOY-CONSTRAINTS-CHECKLIST.md
git add ../scripts/validate-data.ps1
git add ../scripts/test-constraints.ps1
git commit -m "feat(database): Add validation constraints - prevent negative amounts, invalid dates, bad enums

- 26 CHECK constraints across 7 tables
- Amount validation (no negatives, reasonable ranges)
- Date validation (no future created_at)
- Enum validation (valid categories only)
- Test suite for verification
- Comprehensive deployment documentation

See docs/database-constraints-deployed.md for full details"
git push origin main
```

---

## Rollback (If Needed)

If issues occur, run the rollback script (commented at end of migration file):

1. Copy rollback SQL from migration file (lines 115-144)
2. Paste into Supabase SQL Editor
3. Click Run
4. Verify: All 26 constraints are dropped

---

## Troubleshooting

### "Constraint already exists" error
**Cause:** Migration was partially applied before  
**Fix:** Run rollback script, then re-apply full migration

### "Violates check constraint" error during deployment
**Cause:** Existing data doesn't meet constraint requirements  
**Fix:** 
1. Run validation script to find violations
2. Fix the data manually
3. Re-apply migration

### Application errors after deployment
**Cause:** Application trying to insert invalid data  
**Fix:**
1. Check error logs for specific constraint violation
2. Update application validation logic
3. Don't rollback unless truly necessary - fix the app instead

---

## Success Criteria

- [ ] Migration applied in Supabase Dashboard
- [ ] 26 constraints verified in database
- [ ] Test suite passes (8/8 tests)
- [ ] No application errors in first 24 hours
- [ ] Documentation updated with deployment date
- [ ] Code committed and pushed to main

---

## Next Steps After Deployment

1. **Monitor application logs** for 24 hours
2. **Phase 2: Performance indexes** (see `docs/research/11-database-optimization.md`)
3. **Phase 3: RLS optimization** (20-30% faster)
4. **Phase 4: Automated testing** (CI/CD integration)

---

**Created:** February 10, 2026  
**Status:** Ready for deployment  
**Estimated deployment time:** 10 minutes
