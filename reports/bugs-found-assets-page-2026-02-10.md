# Bugs Found — Assets Page Testing (2026-02-10)

## Bug #1: Rate Limit JavaScript Error on Asset Save

**Priority**: P0 — CRITICAL  
**Component**: Backend / Rate Limiting  
**File**: `app/assets/js/rate-limit-db.js:34`  

**Description**:
Every time an asset is saved (create or update), a JavaScript error is thrown:
```
TypeError: Cannot read properties of undefined (reading 'getUser')
    at checkDatabaseRateLimit (rate-limit-db.js:34:70)
```

**Impact**:
- Errors logged to console on every save operation
- Rate limiting functionality may be broken
- Asset still saves successfully (error is caught), but this indicates a deeper issue
- Poor developer experience and potential security risk if rate limits aren't working

**Steps to Reproduce**:
1. Go to Assets page
2. Click "Add Your First Asset"
3. Fill in name and type
4. Click "Save Asset"
5. Open browser console
6. See error: "Rate limit check exception: TypeError: Cannot read properties of undefined (reading 'getUser')"

**Root Cause**:
Line 34 of rate-limit-db.js attempts to call `.getUser()` on an undefined object. Likely:
- Supabase client not initialized properly
- Auth module not available in scope
- Missing null check

**Fix Required**:
- Investigate rate-limit-db.js:34
- Ensure Supabase client is properly initialized before use
- Add defensive null checks: `if (client && client.auth) { ... }`
- Test rate limiting functionality

**Azure DevOps Command**:
```bash
az boards work-item create --type Bug \
  --title "[P0][Assets] Rate limit check error on save - undefined getUser" \
  --description "See: reports/bugs-found-assets-page-2026-02-10.md" \
  --org https://dev.azure.com/fireside365 \
  --project "Fireside Capital"
```

---

## Bug #2: ASS-002 Incomplete Fix — realEstate vs real-estate on Line 3626

**Priority**: P1 — HIGH  
**Component**: Frontend / Assets Page  
**File**: `app/assets/js/app.js:3626`  

**Description**:
Commit ce9dac1 fixed most instances of the `realEstate` vs `real-estate` type mismatch, but **missed line 3626**, which still uses camelCase `"realEstate"` instead of kebab-case `"real-estate"`.

**Current Code (Line 3626)**:
```javascript
if (type === "realEstate") { 
  document.querySelector(".real-estate-fields").classList.remove("d-none"); 
}
```

**Should Be**:
```javascript
if (type === "real-estate") { 
  document.querySelector(".real-estate-fields").classList.remove("d-none"); 
}
```

**Impact**:
- When user selects "Real Estate" from the type dropdown in Add Asset modal, the additional fields (Market Value, Loan Amount, Next Due Date) **do not appear**
- User cannot enter property details without first saving with incomplete data
- Edit mode works correctly (uses different code path that was fixed)

**Steps to Reproduce**:
1. Go to Assets page
2. Click "Add Your First Asset"
3. Change Asset Type dropdown to "Real Estate"
4. **Expected**: Market Value, Loan Amount, Next Due Date fields appear
5. **Actual**: Fields remain hidden

**Fix Required**:
Change line 3626 from:
```javascript
if (type === "realEstate") {
```
To:
```javascript
if (type === "real-estate") {
```

**Related**:
- Original issue: ASS-002
- Original fix: Commit ce9dac1 (2026-02-10 04:59 AM)
- This is a **missed instance** from that fix

**Azure DevOps Command**:
```bash
az boards work-item create --type Bug \
  --title "[P1][Assets] ASS-002 incomplete - line 3626 still uses 'realEstate' instead of 'real-estate'" \
  --description "See: reports/bugs-found-assets-page-2026-02-10.md" \
  --org https://dev.azure.com/fireside365 \
  --project "Fireside Capital"
```

---

## Summary

| Bug | Priority | Status | Impact |
|-----|----------|--------|--------|
| Rate limit error | P0 | 🔴 Critical | Errors on every save, rate limits may not work |
| ASS-002 incomplete | P1 | ⚠️ High | Real estate fields don't show in Add mode |

**Total Bugs Found**: 2  
**Critical**: 1  
**High**: 1  

**Tested Commit**: ce9dac1 (Assets page critical fixes)  
**Test Date**: 2026-02-10 10:00-10:15 AM EST  
**Tester**: Auditor (Clawdbot Subagent)
