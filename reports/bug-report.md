# Bug Report
## Fireside Capital Dashboard

---

## BUG-001: Navigation Routing Failure - Assets Page Inaccessible

**Priority:** 🔴 **CRITICAL**  
**Status:** 🟡 Open  
**Discovered:** January 31, 2026  
**Reporter:** Auditor (QA Subagent)  
**Affected Users:** All users attempting to access Assets page

---

### Description
When navigating to the Assets page via direct URL (`/assets.html`) or sidebar navigation, the browser URL changes to `assets.html` but the page content displays the Bills page instead. This completely blocks access to the Assets management functionality.

---

### Steps to Reproduce

1. **Open application**
   - Navigate to https://nice-cliff-05b13880f.2.azurestaticapps.net/
   - Verify Dashboard loads successfully

2. **Navigate to Assets page via URL**
   - Change URL to https://nice-cliff-05b13880f.2.azurestaticapps.net/assets.html
   - Press Enter

3. **Observe the issue**
   - URL bar shows: `https://nice-cliff-05b13880f.2.azurestaticapps.net/assets.html`
   - Page content displays: Bills page (with heading "Bills", "Add Bill" button, recurring bills table)

---

### Expected Behavior
- URL: `https://nice-cliff-05b13880f.2.azurestaticapps.net/assets.html`
- Page content: Assets page with:
  - Heading: "Assets"
  - Button: "Add Asset"
  - Table columns: Name, Type, Current Value, Loan Balance, Equity, Next Due, Actions
  - Asset rows: BMW X5, 2700 Bingham Drive

---

### Actual Behavior
- URL: `https://nice-cliff-05b13880f.2.azurestaticapps.net/assets.html` ✅ Correct
- Page content: Bills page ❌ Wrong
  - Heading: "Bills"
  - Button: "Add Bill"
  - Summary cards: Monthly Bills Total, Recurring, Active Financing, Paid Off
  - Recurring Bills table with 14 bills
  - Financing & Payoff Tracking section
  - Bills I'm Sharing section

---

### Impact

| Impact Area | Severity |
|-------------|----------|
| **Functionality** | 🔴 Complete loss - Cannot manage assets |
| **User Experience** | 🔴 Confusing - URL doesn't match content |
| **Data Access** | 🔴 Asset data inaccessible via UI |
| **Business Logic** | 🔴 Net worth calculations may be affected if assets can't be updated |

**Affected Features:**
- ❌ View assets
- ❌ Add new assets
- ❌ Edit asset values
- ❌ Delete assets
- ❌ Update loan balances
- ❌ Calculate equity

---

### Environment

| Component | Details |
|-----------|---------|
| **URL** | https://nice-cliff-05b13880f.2.azurestaticapps.net |
| **Hosting** | Azure Static Web Apps |
| **Browser** | Clawd Browser Control |
| **Frontend** | Vanilla JS + Bootstrap 5 |
| **Date Tested** | January 31, 2026 |
| **User Account** | matt@firesidecloudsolutions.com |

---

### Root Cause Hypothesis

**Most Likely:**
1. **Azure Static Web Apps routing misconfiguration**
   - Missing or incorrect `staticwebapp.config.json` routes
   - Fallback route catching `assets.html` and redirecting to `bills.html`

2. **Client-side routing conflict**
   - JavaScript routing logic incorrectly handling `assets.html` requests
   - Possible hash routing vs. path routing mismatch

3. **File serving issue**
   - `assets.html` file missing or corrupted
   - Azure serving fallback page (bills.html) instead

**Less Likely:**
4. Build/deployment issue - files not synced properly to Azure
5. Caching issue - browser serving stale content (unlikely given URL changes correctly)

---

### Diagnostic Steps Needed

#### 1. Verify File Existence
```powershell
# Check if assets.html exists in repository
Test-Path C:\Users\chuba\fireside-capital\app\assets.html

# Check file size and content
Get-Content C:\Users\chuba\fireside-capital\app\assets.html | Select-Object -First 20
```

#### 2. Check Azure Static Web Apps Configuration
```json
// Check staticwebapp.config.json for routing rules
{
  "routes": [],
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

#### 3. Inspect Browser Network Tab
- Check if `assets.html` request returns 200 or redirect (301/302)
- Verify actual file content served vs. expected

#### 4. Review JavaScript Routing
```javascript
// Check app.js or main.js for routing logic
// Look for:
window.location.pathname
history.pushState()
Router configurations
```

#### 5. Test Other Pages
- Verify if other pages (Investments, Debts, Income) have the same issue
- Pattern would indicate systematic routing problem

---

### Suggested Fix

**Option 1: Azure Configuration Fix** (if config issue)
```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/assets.html",
      "serve": "/assets.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/*.{html,css,js,png,jpg,gif,svg,ico}"]
  }
}
```

**Option 2: Client-Side Routing Fix** (if JS issue)
```javascript
// Ensure routing logic doesn't override assets.html
// In main JS file:
if (window.location.pathname === '/assets.html') {
  // Let the native page load, don't intercept
  return;
}
```

**Option 3: Force Rebuild and Redeploy**
```bash
# If file missing or corrupted
git pull
npm run build  # or equivalent build command
az staticwebapp deploy  # or push to trigger GitHub Actions
```

---

### Testing Checklist (Post-Fix)

- [ ] Direct URL navigation to `/assets.html` loads Assets page
- [ ] Sidebar "Assets" link navigates to Assets page correctly
- [ ] URL and page content match
- [ ] Assets table displays with correct data
- [ ] "Add Asset" button visible and functional
- [ ] Test navigation to all other pages (regression testing)
- [ ] Clear browser cache and re-test
- [ ] Test in incognito/private browsing mode
- [ ] Test on multiple browsers (Chrome, Firefox, Edge)
- [ ] Verify GitHub Actions deployment succeeded without errors

---

### Workaround

**Temporary workaround for users:**
- None available - Assets page is completely inaccessible via UI
- Possible database-level workaround:
  - Direct Supabase access via SQL queries
  - Use Supabase dashboard to manually edit `assets` table
  - ⚠️ Not recommended for end users

**For developers:**
- Edit `assets` table directly in Supabase dashboard
- Use REST API to GET/POST/PUT/DELETE assets

---

### Related Issues
- May affect other pages - requires testing of Investments, Debts, Income pages
- Could impact mobile app (if exists) with similar routing

---

### Attachments
- Test log: `qa-test-log.txt`
- Browser snapshot showing URL vs. content mismatch (snapshot data in QA report)

---

## BUG-002: Monthly Bills Total Calculation Discrepancy

**Priority:** ⚠️ **HIGH**  
**Status:** 🟡 Open  
**Discovered:** January 31, 2026  
**Reporter:** Auditor (QA Subagent)  
**Affected Users:** All users viewing Bills page summary

---

### Description
The "Monthly Bills Total" summary card on the Bills page displays **$6,337.59**, but when manually calculating the sum of all visible recurring bills (including user's share of split bills), the expected total is **$5,944.18**. This represents a discrepancy of **$393.41** or **6.6% error**.

---

### Steps to Reproduce

1. **Navigate to Bills page**
   - URL: https://nice-cliff-05b13880f.2.azurestaticapps.net/bills.html
   - Verify page loads successfully

2. **Observe displayed total**
   - Summary card shows: "Monthly Bills Total: **$6,337.59**"

3. **Manually calculate from table**
   - Sum all recurring bills from the "Recurring Bills" table:
   
   | Bill | Amount | User Share |
   |------|--------|------------|
   | Sewage | $117.00 | $117.00 |
   | Big Green Egg | $324.52 | $324.52 |
   | XGIMI | $136.36 | $136.36 |
   | Internet (shared) | $99.99 | $0.00 (100% to Brittany) |
   | Mortgage | $2,124.80 | $2,124.80 |
   | HOA Fees (shared) | $170.00 | $85.00 (50/50 split) |
   | Cell Phone | $200.51 | $200.51 |
   | USC Rec | $52.00 | $52.00 |
   | BMW Payment | $1,534.00 | $1,534.00 |
   | BMW 430i | $411.00 | $411.00 |
   | Chevy Tahoe | $636.88 | $636.88 |
   | American Water | $101.03 | $101.03 |
   | West Penn Power | $87.44 | $87.44 |
   | Peoples Gas | $133.64 | $133.64 |
   
   **Total:** $5,944.18

4. **Calculate discrepancy**
   - Displayed: $6,337.59
   - Expected: $5,944.18
   - Difference: **$393.41** (too high)

---

### Expected Behavior
Monthly Bills Total should equal the sum of user's share of all recurring monthly bills:
- **$5,944.18** (or a different value if additional bills exist)

---

### Actual Behavior
Monthly Bills Total displays:
- **$6,337.59** (appears to include full amounts of shared bills instead of user's portion)

---

### Impact

| Impact Area | Severity |
|-------------|----------|
| **Data Accuracy** | 🟡 Moderate - Summary card misleading |
| **User Trust** | 🟡 Moderate - Users may question data accuracy |
| **Financial Planning** | 🟡 Moderate - Budget calculations may be incorrect |
| **Dashboard Integration** | ⚠️ Unknown - May affect dashboard summary cards |

---

### Root Cause Hypothesis

**Most Likely:**
1. **Shared bill calculation error**
   - Logic includes full bill amount instead of user's split percentage
   - Internet ($99.99 instead of $0.00) + HOA ($170.00 instead of $85.00) = $184.99 excess
   - Still doesn't fully explain $393.41 discrepancy

2. **Hidden bills not visible in table**
   - Additional bills exist in database but not displayed
   - Filter or pagination hiding some bills
   - $393.41 could represent 2-3 additional bills

3. **Frequency conversion error**
   - Some bills marked "monthly" but have different actual frequencies
   - Calculation converting non-monthly bills incorrectly

4. **Rounding errors**
   - Unlikely to account for $393.41 difference

---

### Diagnostic Steps Needed

#### 1. Database Query
```sql
-- Check actual database for all Matt's bills
SELECT 
  name, 
  amount, 
  frequency, 
  user_share_amount,
  is_shared
FROM bills
WHERE user_id = '<matt_user_id>'
AND type != 'paid_off'
ORDER BY name;
```

#### 2. JavaScript Calculation Review
```javascript
// Locate calculation logic in bills.js or bills.html
// Look for:
function calculateMonthlyTotal() {
  // Check if using amount vs. user_share_amount
  // Check if filtering by frequency correctly
}
```

#### 3. Verify Shared Bill Logic
```javascript
// Check if shared bills use correct column:
const billAmount = bill.is_shared ? bill.user_share_amount : bill.amount;
```

#### 4. Check for Hidden Bills
- Scroll through entire Bills table
- Check if pagination exists
- Verify no bills hidden by filters or CSS

---

### Suggested Fix

**Step 1: Identify Missing Bills**
- Query database to list all bills and their true monthly amounts
- Compare with UI display

**Step 2: Fix Calculation Logic**
```javascript
// Correct calculation (pseudo-code)
function calculateMonthlyTotal() {
  let total = 0;
  bills.forEach(bill => {
    if (bill.frequency === 'monthly' || bill.frequency === 'Monthly') {
      // Use user's share for shared bills
      const amount = bill.is_shared 
        ? bill.user_share_amount 
        : bill.amount;
      total += parseFloat(amount);
    }
  });
  return total.toFixed(2);
}
```

**Step 3: Add Unit Test**
```javascript
// Test shared bill calculation
test('Monthly total includes user share of split bills', () => {
  const bills = [
    { amount: 100, is_shared: false },
    { amount: 200, user_share_amount: 100, is_shared: true }  // 50/50 split
  ];
  expect(calculateMonthlyTotal(bills)).toBe(200); // 100 + 100
});
```

---

### Testing Checklist (Post-Fix)

- [ ] Monthly Bills Total matches sum of user's bill shares
- [ ] Shared bills (Internet, HOA Fees) use correct user_share_amount
- [ ] No hidden bills excluded from calculation
- [ ] Calculation handles different frequency types correctly
- [ ] Dashboard summary cards update if they pull from same calculation
- [ ] Regression test: non-shared bills still calculate correctly

---

### Workaround

**For users:**
- Manually calculate total from table rows
- Use "Your share" amounts for shared bills

**For developers:**
- Direct database query for accurate total
- Temporarily hardcode correct value (not recommended)

---

### Additional Notes

This bug may indicate a broader issue with shared bill handling. Recommend auditing:
1. Budget generation (does it use correct bill amounts?)
2. Upcoming transactions display
3. Monthly cash flow chart calculations
4. Any other financial summaries that aggregate bill data

---

### Attachments
- Bills page snapshot with visible discrepancy
- Manual calculation spreadsheet (above table)

---

**Report Prepared By:** Auditor (QA Subagent)  
**Report Date:** January 31, 2026  
**Version:** 1.0
