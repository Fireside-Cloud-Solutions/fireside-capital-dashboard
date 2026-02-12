# Azure DevOps Work Items — P0 Critical Issues
**Created:** February 12, 2026 — 6:05 AM EST  
**Project:** Fireside Capital  
**Organization:** fireside365  
**Sprint:** Sprint 1  
**Total:** 10 work items (42 hours)

---

## Work Item 1: [ARCH-FRIENDS-001] Extract Friends Module from app.js

**Type:** Task  
**Priority:** 1 (Critical)  
**Effort:** 8 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** architecture, refactoring, friends, technical-debt

### Description
All friend-related functionality is currently embedded in the monolithic app.js file (4000+ lines), causing severe maintainability issues. Extract into dedicated friends.js module.

### Current State
**File:** `app/assets/js/app.js`  
**Lines:** 4191-4400+ (approximately 200+ lines)  
**Functions to extract:**
- searchFriends() (line 4191)
- sendFriendRequest() (line 4268)
- acceptFriendRequest() (line 4294)
- declineFriendRequest() (line 4312)
- cancelFriendRequest() (line 4320)
- removeFriend() (likely exists)
- loadPendingRequests()
- loadMyFriends()
- loadOutgoingRequests()
- renderFriendCard()
- updateFriendsDisplay()

### Impact
- **Maintainability:** Impossible to work on friends features without touching massive file
- **Testability:** Cannot unit test friends functionality in isolation
- **Performance:** Entire 4000+ line app.js loads on every page
- **Collaboration:** Merge conflicts when multiple devs touch app.js

### Implementation Steps
1. Create new file: `app/assets/js/friends.js`
2. Move all friend functions from app.js to friends.js
3. Add proper module structure:
   ```javascript
   // friends.js
   export async function searchFriends(query) {
     // ... existing code
   }
   
   export async function sendFriendRequest(addresseeId) {
     // ... existing code
   }
   
   // etc.
   ```
4. Update `app/friends.html` to reference new module:
   ```html
   <script type="module" src="assets/js/friends.js"></script>
   ```
5. Remove extracted code from app.js
6. Test all friend functionality on live site
7. Verify no console errors
8. Take before/after screenshots

### Acceptance Criteria
- [ ] friends.js file created with proper module structure
- [ ] All friend functions moved from app.js
- [ ] friends.html loads friends.js correctly
- [ ] Search functionality works
- [ ] Send friend request works
- [ ] Accept/decline request works
- [ ] Cancel request works
- [ ] Remove friend works
- [ ] No console errors
- [ ] app.js file size reduced by ~200 lines
- [ ] Live site tested and verified
- [ ] Screenshots captured
- [ ] Code review complete

---

## Work Item 2: [ARCH-BUDGET-001] Extract Budget Module from app.js

**Type:** Task  
**Priority:** 1 (Critical)  
**Effort:** 6 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** architecture, refactoring, budget, technical-debt

### Description
All budget-related functionality is currently embedded in the monolithic app.js file (4000+ lines). Extract into dedicated budget.js module.

### Current State
**File:** `app/assets/js/app.js`  
**Lines:** 2543-2929+ (approximately 400+ lines)  
**Functions to extract:**
- loadAndRenderBudget() (line 2544)
- saveBudgetAssignment() (line 2837)
- saveBudgetItem() (line 2878)
- deleteBudgetItem() (line 2929)
- updateBudgetItem()
- calculateBudgetSummary()
- renderBudgetTable()
- navigateMonth()
- generateBudget() (AI generation)

### Impact
Same as ARCH-FRIENDS-001 (maintainability, testability, performance)

### Implementation Steps
1. Create new file: `app/assets/js/budget.js`
2. Move all budget functions from app.js to budget.js
3. Add proper module structure with exports
4. Update `app/budget.html` to reference new module
5. Remove extracted code from app.js
6. Test all budget functionality on live site
7. Take screenshots

### Acceptance Criteria
- [ ] budget.js file created with proper module structure
- [ ] All budget functions moved from app.js
- [ ] budget.html loads budget.js correctly
- [ ] Load budget for month works
- [ ] Save budget item works
- [ ] Update budget assignment works
- [ ] Delete budget item works (when button added)
- [ ] Month navigation works
- [ ] AI budget generation works
- [ ] No console errors
- [ ] app.js file size reduced by ~400 lines
- [ ] Live site tested and verified
- [ ] Screenshots captured

---

## Work Item 3: [BUG-TX-002] Fix Transactions Table Header/Body Column Mismatch

**Type:** Bug  
**Priority:** 1 (Critical)  
**Effort:** 0.5 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** accessibility, semantic-html, transactions

### Description
Transactions table defines 5 columns in `<thead>` but only renders 4-5 columns in `<tbody>`, causing visual misalignment and breaking screen reader semantics.

### Current State
**File:** `app/transactions.html`  
**Lines:** 164-172 (thead), rendering logic in transactions.js line 147-167

**Current thead:**
```html
<thead>
  <tr>
    <th>Date</th>
    <th>Description</th>
    <th>Category</th>
    <th>Amount</th>
    <th>Confidence</th> <!-- ❌ Doesn't match tbody -->
  </tr>
</thead>
```

**Current tbody (rendered by JS):**
- Column 1: Date
- Column 2: Description
- Column 3: Category dropdown + confidence score (embedded)
- Column 4: Amount
- Column 5: Pending badge

**Issue:** "Confidence" header aligns with "Pending" column visually

### Impact
- Screen readers announce incorrect column names
- Visually confusing
- Semantic HTML violation
- WCAG accessibility issue

### Recommended Fix (Option A)
Add "Actions" column, keep confidence embedded under category:

```html
<thead>
  <tr>
    <th>Date</th>
    <th>Description</th>
    <th>Category</th>
    <th>Amount</th>
    <th>Actions</th>
  </tr>
</thead>
```

Update tbody to add edit/delete buttons in Actions column (addresses future feature need).

### Acceptance Criteria
- [ ] Table header columns match tbody columns exactly (1:1 mapping)
- [ ] Visual alignment correct on all screen sizes
- [ ] Screen reader announces correct column names
- [ ] No semantic HTML errors
- [ ] Tested with NVDA or JAWS screen reader
- [ ] Live site verified
- [ ] Screenshots captured

---

## Work Item 4: [FEAT-FRIENDS-001] Add Remove Friend Button

**Type:** Feature  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** friends, feature-gap, crud

### Description
Users cannot remove/unfriend existing friends. Once connected, the relationship is permanent. This is a critical missing CRUD operation.

### Current State
**File:** `app/friends.html` (My Friends section)  
**Current:** Only displays friend name and email, no actions  
**Expected:** Add "Remove" button for each friend

### Implementation
1. Add "Remove" button to friend card/row:
   ```html
   <button class="btn btn-sm btn-outline-danger" onclick="removeFriend('${friendConnectionId}')">
     <i class="bi bi-person-x"></i> Remove
   </button>
   ```

2. Wire to removeFriend() function (should already exist in app.js):
   ```javascript
   async function removeFriend(connectionId) {
     if (!confirm('Remove this friend? You can always send a new request later.')) return;
     
     const { error } = await sb
       .from('connections')
       .delete()
       .eq('id', connectionId);
     
     if (error) {
       showToast('Failed to remove friend', 'error');
       return;
     }
     
     showToast('Friend removed', 'success');
     await loadMyFriends();
   }
   ```

3. Add confirmation modal for safety
4. Test on live site

### Acceptance Criteria
- [ ] "Remove" button visible for each friend in My Friends section
- [ ] Clicking button shows confirmation dialog
- [ ] Confirming removes friend from database
- [ ] UI updates immediately (friend card removed)
- [ ] Success toast notification shown
- [ ] Error handling if API call fails
- [ ] Live site tested
- [ ] Screenshots captured

---

## Work Item 5: [FEAT-FRIENDS-002] Add Cancel Outgoing Request Button

**Type:** Feature  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** friends, feature-gap, crud

### Description
Users cannot cancel friend requests they sent. If a request is sent accidentally, there's no way to retract it.

### Current State
**File:** `app/friends.html` (Outgoing Requests section)  
**Current:** Only displays pending request, no actions  
**Expected:** Add "Cancel" button for each outgoing request

### Implementation
Similar to Work Item 4:
1. Add "Cancel" button to outgoing request card
2. Wire to cancelFriendRequest() function (already exists in app.js line 4320)
3. Add confirmation if needed
4. Test on live site

### Acceptance Criteria
- [ ] "Cancel" button visible for each outgoing request
- [ ] Clicking cancels the friend request
- [ ] Request removed from Outgoing Requests section
- [ ] Success toast notification
- [ ] Error handling
- [ ] Live site tested

---

## Work Item 6: [FEAT-FRIENDS-003] Add Reject Incoming Request Button

**Type:** Feature  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** friends, feature-gap, crud

### Description
Users can only accept incoming friend requests. There's no way to reject/decline unwanted requests.

### Current State
**File:** `app/friends.html` (Pending Requests section)  
**Current:** Only "Accept" button exists  
**Expected:** Add "Reject" button next to "Accept"

### Implementation
1. Add "Reject" button next to existing "Accept" button
2. Wire to declineFriendRequest() function (already exists in app.js line 4312)
3. Test on live site

### Acceptance Criteria
- [ ] "Reject" button visible next to "Accept" button
- [ ] Both buttons clearly labeled and styled appropriately
- [ ] Clicking Reject removes request from Pending Requests
- [ ] Success toast notification
- [ ] Error handling
- [ ] Live site tested

---

## Work Item 7: [FEAT-BUDGET-001] Add Delete Budget Item Button

**Type:** Feature  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 1  
**Assigned To:** Builder  
**Tags:** budget, feature-gap, crud

### Description
Users cannot delete budget items once created. If an item is added by mistake or no longer needed, there's no way to remove it.

### Current State
**File:** `app/budget.html` (budget table)  
**Function exists:** deleteBudgetItem() already exists in app.js line 2929  
**Missing:** Button in UI to trigger the function

### Implementation
1. Add "Delete" button to budget table row:
   ```html
   <td>
     <button class="btn btn-sm btn-outline-danger" onclick="deleteBudgetItem('${itemId}', '${monthString}')">
       <i class="bi bi-trash"></i> Delete
     </button>
   </td>
   ```

2. Add confirmation modal (safety):
   ```javascript
   if (!confirm('Delete this budget item? This cannot be undone.')) return;
   ```

3. Test on live site

### Acceptance Criteria
- [ ] "Delete" button visible for each budget item
- [ ] Clicking shows confirmation dialog
- [ ] Confirming deletes item from database
- [ ] Budget table updates immediately
- [ ] Budget summary recalculates
- [ ] Success toast notification
- [ ] Error handling
- [ ] Live site tested

---

## Work Item 8: [DATA-TX-001] Investigate Empty Transaction Data

**Type:** Investigation / Bug  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 1  
**Assigned To:** Capital / Builder  
**Tags:** data, investigation, transactions

### Description
Transactions page displays empty state. No transactions visible in table. Need to investigate root cause and resolve.

### Investigation Steps
1. **Check Supabase `transactions` table:**
   - Login to Supabase dashboard
   - Navigate to Table Editor → transactions
   - Check if any rows exist for test user
   - Check user_id matches logged-in user

2. **Check Plaid connection:**
   - Verify Plaid access token stored
   - Test Plaid sync endpoint
   - Check for API errors

3. **Check data loading:**
   - Inspect Network tab (browser DevTools)
   - Verify API request to Supabase succeeds
   - Check for JavaScript errors in console

4. **Test with sample data:**
   - Manually insert 3-5 sample transactions via Supabase SQL Editor
   - Verify they display in UI
   - Document findings

### Possible Root Causes
- No Plaid connection established
- User hasn't synced transactions yet
- Database query filtering incorrectly (wrong user_id)
- Empty state logic triggering incorrectly
- API rate limiting

### Resolution
Based on findings:
- **If no data:** Seed sample transactions OR connect Plaid in sandbox mode
- **If query error:** Fix query in transactions.js
- **If empty state bug:** Fix conditional logic

### Acceptance Criteria
- [ ] Root cause identified and documented
- [ ] Either real or sample transactions visible in table
- [ ] Empty state only shows when truly no data
- [ ] Documentation updated with findings
- [ ] Live site verified with visible transactions

---

## Work Item 9: [DATA-FRIENDS-001] Investigate Empty Friend Data

**Type:** Investigation / Bug  
**Priority:** 1 (Critical)  
**Effort:** 2 hours  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 1  
**Assigned To:** Capital / Builder  
**Tags:** data, investigation, friends

### Description
Friends page displays empty state for all 3 sections (Pending Requests, My Friends, Outgoing Requests). Need to investigate and resolve.

### Investigation Steps
1. **Check Supabase `connections` table:**
   - Verify table exists
   - Check for any rows
   - Check schema matches expectations (requester_id, addressee_id, status)

2. **Check users table:**
   - Verify multiple test users exist
   - Check if usernames/emails set up

3. **Check friend loading functions:**
   - Review app.js lines 4191-4400+
   - Verify queries correct
   - Check for JavaScript errors

4. **Test with sample data:**
   - Create 2-3 test user accounts
   - Manually insert sample connections via SQL
   - Verify they display in UI

### Possible Root Causes
- No connections table data
- Only one test user exists (need 2+ for friends)
- Query filtering incorrectly
- Empty state logic always showing

### Resolution
Based on findings:
- **If no users:** Create test accounts
- **If no data:** Seed sample connections
- **If query error:** Fix query
- **If schema issue:** Update table schema

### Acceptance Criteria
- [ ] Root cause identified
- [ ] Either real or sample friends/requests visible
- [ ] All 3 sections (Pending, Friends, Outgoing) tested
- [ ] Documentation updated
- [ ] Live site verified

---

## Work Item 10: [ARCH-TX-001] Transaction Module Extraction (COMPLETE) ✅

**Type:** Task  
**Priority:** 1 (Critical)  
**Effort:** 4 hours  
**Status:** RESOLVED  
**Resolution Date:** Before February 9, 2026  
**Resolved By:** Builder (previous sprint)

### Description
Extract transaction logic from monolithic app.js into dedicated transactions.js module.

### Verification
- ✅ File exists: `app/assets/js/transactions.js`
- ✅ Last modified: February 9, 2026 5:04 AM
- ✅ File size: 9102 bytes (~300 lines)
- ✅ No transaction functions found in app.js (search returned empty)
- ✅ Module includes: loadTransactions, syncTransactions, renderTransactionsTable, updateTransactionCategory, addManualTransaction

### Outcome
Successfully extracted. No further action needed. Mark as DONE in Azure DevOps.

---

## SUMMARY TABLE

| # | Work Item | Type | Effort | Status | Assignee |
|---|-----------|------|--------|--------|----------|
| 1 | ARCH-FRIENDS-001 | Task | 8h | OPEN | Builder |
| 2 | ARCH-BUDGET-001 | Task | 6h | OPEN | Builder |
| 3 | BUG-TX-002 | Bug | 0.5h | OPEN | Builder |
| 4 | FEAT-FRIENDS-001 | Feature | 2h | OPEN | Builder |
| 5 | FEAT-FRIENDS-002 | Feature | 2h | OPEN | Builder |
| 6 | FEAT-FRIENDS-003 | Feature | 2h | OPEN | Builder |
| 7 | FEAT-BUDGET-001 | Feature | 2h | OPEN | Builder |
| 8 | DATA-TX-001 | Investigation | 2h | OPEN | Capital |
| 9 | DATA-FRIENDS-001 | Investigation | 2h | OPEN | Capital |
| 10 | ARCH-TX-001 | Task | 4h | **DONE** ✅ | Builder |

**Total Remaining:** 9 work items, 26.5 hours  
**Sprint 1 Target:** Complete all P0 work items (1 week)

---

## AZURE DEVOPS CREATION INSTRUCTIONS

### Option 1: Manual Creation (Recommended)
1. Login to Azure DevOps: https://dev.azure.com/fireside365
2. Navigate to: Fireside Capital → Boards → Work Items
3. Click "New Work Item" → Select type (Task/Bug/Feature)
4. Copy/paste details from above
5. Set Priority, Effort, Iteration, Assigned To
6. Click "Save & Close"
7. Repeat for all 9 work items

### Option 2: Bulk Import (If available)
1. Export work items above to CSV
2. Use Azure DevOps "Import Work Items" feature
3. Map columns to fields
4. Import batch

### Option 3: REST API (Automated)
If Azure CLI installed and PAT token available:
```powershell
az boards work-item create `
  --title "[ARCH-FRIENDS-001] Extract Friends Module" `
  --type "Task" `
  --priority 1 `
  --effort 8 `
  --iteration "Sprint 1" `
  --assigned-to "Builder" `
  --description "Extract all friend-related functions..."
```

---

**Status:** Ready for Azure DevOps work item creation  
**Created:** February 12, 2026 — 6:05 AM EST  
**Next Action:** Create 9 work items in Azure DevOps, assign to Builder for Sprint 1
