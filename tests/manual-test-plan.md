# Manual Test Plan — Fireside Capital Dashboard

## Overview
This document provides step-by-step instructions for manually testing the Fireside Capital dashboard to validate functionality, mathematical accuracy, and user experience.

---

## Pre-Test Setup

### Test User Credentials
- **Email:** test@firesidecapital.com
- **Password:** TestPass123!
- **Database:** Supabase (see TOOLS.md for connection details)

### Test Data Set
Before beginning tests, ensure the following test data exists:

**Assets:**
- Home: $300,000 value, $200,000 loan (Real Estate)
- Car: $25,000 value, $15,000 loan (Vehicle)

**Investments:**
- 401(k): $50,000 value, $500 monthly contribution, 7% annual return
- Emergency Fund: $10,000 value

**Debts:**
- Mortgage: $200,000 balance, 4.5% APR, 360 months, $1,520/mo
- Car Loan: $15,000 balance, 5% APR, 60 months, $283/mo

**Bills:**
- Rent/Mortgage: $1,520 monthly
- Electric: $150 monthly (variable)
- Internet: $80 monthly
- Phone: $120 monthly

**Income:**
- Salary: $6,000 monthly (W2)
- Side Gig: $500 monthly (1099)

**Settings:**
- Emergency Fund Goal: $15,000

---

## Test Suite 1: Dashboard Page (index.html)

### Test 1.1: Net Worth Card
**Steps:**
1. Navigate to dashboard (index.html)
2. Locate "Net Worth" card

**Expected Results:**
- Net Worth = (Asset Equity + Investments) - Debts
- Formula: (($300k - $200k) + ($25k - $15k) + $50k + $10k) - ($200k + $15k)
- **Expected Net Worth:** **-$45,000**
- Value should be displayed in red if negative
- Value should match the chart data

**Edge Cases to Test:**
- [ ] Negative net worth displays correctly
- [ ] Large numbers format with commas ($1,234,567.89)
- [ ] Value updates immediately after adding/editing assets

### Test 1.2: Net Worth Timeline Chart
**Steps:**
1. Verify chart renders without errors
2. Hover over data points to see tooltips

**Expected Results:**
- Chart shows historical snapshots (if available)
- At least one data point (today's snapshot)
- Tooltips display formatted currency values
- Chart responds to theme toggle (light/dark mode)

**Edge Cases to Test:**
- [ ] Chart handles single data point
- [ ] Chart displays negative values correctly
- [ ] Chart updates when new snapshot is created

### Test 1.3: Upcoming Payments Widget
**Steps:**
1. Locate "Upcoming Payments" section
2. Verify bills/debts due within next 7 days are listed

**Expected Results:**
- Only payments with due dates in the next week appear
- Sorted by due date (earliest first)
- Displays: name, amount, category badge, due date
- "No upcoming payments" message if none exist

**Edge Cases to Test:**
- [ ] Empty state displays correctly
- [ ] Handles bills without due dates (excluded)
- [ ] Correctly filters out paid-off financing items

### Test 1.4: Cash Flow Chart (6-month projection)
**Steps:**
1. Locate "Monthly Cash Flow" bar chart
2. Verify it shows 6 months of projected income vs expenses

**Expected Results:**
- 6 bars (current month + 5 future months)
- Green bars = income, red bars = expenses
- Stacked bar chart format
- Tooltips show exact amounts

**Edge Cases to Test:**
- [ ] Chart accounts for bill frequency (weekly, bi-weekly, monthly, etc.)
- [ ] Excludes paid-off financing items from future projections
- [ ] Handles zero income gracefully

### Test 1.5: Emergency Fund Chart
**Steps:**
1. Locate "Emergency Fund Progress" chart
2. Verify goal vs current balance

**Expected Results:**
- If goal is set ($15,000):
  - Chart shows two bars: "Goal" and "Current"
  - Current bar reflects investment account with "emergency" in name
- If goal is NOT set:
  - Displays message: "You don't have an emergency fund goal set"
  - Shows "Click here to set one" link to settings page

**Edge Cases to Test:**
- [ ] Message displays when goal = 0
- [ ] Chart displays when goal > 0
- [ ] Current value matches the actual emergency fund investment

---

## Test Suite 2: Assets Page (assets.html)

### Test 2.1: Add Real Estate Asset
**Steps:**
1. Click "Add Asset" button
2. Select Type: "Real Estate"
3. Enter:
   - Name: Test Property
   - Property Value: $350,000
   - Loan Amount: $280,000
   - Next Due Date: (today + 30 days)
4. Click "Save"

**Expected Results:**
- Modal closes
- New row appears in table
- Equity column displays: $70,000
- Next Due Date displays formatted (MM/DD/YYYY)
- Dashboard net worth updates automatically

**Validation:**
- [ ] Equity = Value - Loan
- [ ] Negative equity displays as $0
- [ ] Values format as currency

### Test 2.2: Add Vehicle Asset
**Steps:**
1. Click "Add Asset"
2. Select Type: "Vehicle"
3. Enter:
   - Name: Test Car
   - Vehicle Value: $18,000
   - Loan Balance: $12,000
   - Next Due Date: (blank)
4. Click "Save"

**Expected Results:**
- New row appears
- Equity: $6,000
- Next Due Date: "-"

### Test 2.3: Edit Asset
**Steps:**
1. Click edit button (pencil icon) on existing asset
2. Change Property Value to $320,000
3. Click "Save"

**Expected Results:**
- Modal closes
- Row updates with new value
- Equity recalculates: $320k - $280k = $40,000
- Dashboard updates

### Test 2.4: Delete Asset
**Steps:**
1. Click delete button (trash icon)
2. Confirm deletion in modal
3. Click "Delete"

**Expected Results:**
- Confirmation modal appears
- Asset name displayed in confirmation text
- Row removed from table
- Dashboard net worth updates

**Edge Cases:**
- [ ] Cannot save asset with blank name
- [ ] Handles $0 value
- [ ] Handles $0 loan (paid off)
- [ ] Underwater asset (loan > value) shows $0 equity

---

## Test Suite 3: Investments Page (investments.html)

### Test 3.1: Add Investment Account
**Steps:**
1. Click "Add Investment"
2. Enter:
   - Name: Roth IRA
   - Type: Retirement
   - Current Value: $25,000
   - Starting Balance: $20,000
   - Monthly Contribution: $300
   - Annual Return: 8%
   - Next Contribution Date: (first day of next month)
3. Click "Save"

**Expected Results:**
- New row appears in table
- All fields display correctly formatted
- Annual return displays with % symbol
- Next Contribution Date formatted

**Validation:**
- [ ] Value can differ from starting balance (growth/loss)
- [ ] Monthly contribution can be $0
- [ ] Annual return can be negative (loss)

### Test 3.2: Edit Investment
**Steps:**
1. Edit existing investment
2. Change Current Value to $26,500
3. Change Monthly Contribution to $350
4. Save

**Expected Results:**
- Row updates
- Dashboard net worth recalculates

### Test 3.3: Delete Investment
**Steps:**
1. Delete investment
2. Confirm

**Expected Results:**
- Row removed
- Dashboard updates

**Edge Cases:**
- [ ] $0 value displays correctly
- [ ] Negative return % displays correctly
- [ ] No contribution date shows "-"

---

## Test Suite 4: Debts Page (debts.html)

### Test 4.1: Add Debt
**Steps:**
1. Click "Add Debt"
2. Enter:
   - Name: Personal Loan
   - Type: Other
   - Balance: $5,000
   - Interest Rate: 6.5%
   - Term: 36 months
   - Monthly Payment: $153.45
   - Next Payment Date: (15th of current month)
3. Save

**Expected Results:**
- New row appears
- Interest rate displays with %
- Term displays as "36 months"
- Monthly payment formatted as currency
- Next payment date formatted

**Validation:**
- [ ] Can enter 0% interest rate
- [ ] Can leave term blank (revolving debt like credit cards)
- [ ] Next payment date can be blank

### Test 4.2: Calculate Monthly Payment (Amortization)
**Steps:**
1. Add new debt with:
   - Balance: $10,000
   - Interest Rate: 5%
   - Term: 24 months
2. Calculate expected monthly payment manually:
   - Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
   - r = 0.05/12 = 0.004167
   - n = 24
   - Expected: ~$438.71

**Expected Results:**
- If app has auto-calculate feature, verify it matches $438.71

**Validation:**
- [ ] Monthly payment is accurate
- [ ] 0% APR results in simple division (principal / term)

### Test 4.3: Delete Debt
**Steps:**
1. Delete a debt
2. Confirm

**Expected Results:**
- Confirmation modal shows debt name
- Row removed
- Dashboard updates (net worth increases)

**Edge Cases:**
- [ ] Zero balance debt
- [ ] Negative balance (credit) - should be rejected or handled

---

## Test Suite 5: Bills Page (bills.html)

### Test 5.1: Add Standard Recurring Bill
**Steps:**
1. Click "Add Bill"
2. Enter:
   - Name: Gym Membership
   - Type: Subscriptions
   - Amount: $45.99
   - Frequency: Monthly
   - Next Due Date: (current date + 7 days)
3. Save

**Expected Results:**
- New row in table
- Category badge displays with correct color
- Amount formatted as currency
- Frequency displays correctly

**Validation:**
- [ ] All bill types have colored badges
- [ ] Frequency options: Daily, Weekly, Bi-Weekly, Monthly, Quarterly, Annually

### Test 5.2: Add Financing Bill (with loan details)
**Steps:**
1. Click "Add Bill"
2. Select Type: "Financing" or "Auto"
3. Enter:
   - Name: Furniture Financing
   - Amount: $324.75
   - Frequency: Monthly
   - **Expand Financing Section:**
     - Interest Rate: 0% APR
     - Original Principal: $7,788.48
     - Loan Term: 24 months (or 2 years)
     - Start Date: (12 months ago)
     - Payments Made: 12
4. Save

**Expected Results:**
- Bill appears in recurring bills table
- **Also appears in "Active Financing" card section**
- Financing card shows:
  - Progress bar at 50% (12/24 payments)
  - Monthly: $324.75
  - Remaining: $3,894.24
  - Payoff: (12 months from now)
  - 0% APR badge (green)
  - Principal vs Interest breakdown
  - "View Schedule" button

**Validation:**
- [ ] Loan calculator preview updates dynamically as you type
- [ ] 0% APR shows $0 total interest
- [ ] Remaining balance calculated correctly
- [ ] Progress bar fills proportionally

### Test 5.3: View Amortization Schedule
**Steps:**
1. Click "View Schedule" button on a financing item with loan details
2. Modal opens showing full amortization table

**Expected Results:**
- Table shows all 24 payments
- Columns: Payment #, Payment Amount, Principal, Interest, Balance
- Current payment (payment 13) is highlighted with arrow icon
- Past payments (1-12) are grayed out
- Final balance = $0.00

**Validation:**
- [ ] Sum of principal column = original principal
- [ ] Sum of interest column = total interest
- [ ] Balance decreases monotonically to zero
- [ ] First payment has higher interest than principal (if APR > 0)
- [ ] Last payment has higher principal than interest

### Test 5.4: Paid-Off Financing Item
**Steps:**
1. Edit a financing bill
2. Set Payments Made = Total Payments (e.g., 24/24)
3. Save

**Expected Results:**
- Bill **moves from Active Financing to "Completed/Paid Off" section**
- Shows ✅ checkmark
- "Paid Off" badge (green)
- Progress bar at 100%
- **Excluded from budget and cash flow projections**

**Validation:**
- [ ] Paid-off items don't appear in budget
- [ ] Don't count toward upcoming payments
- [ ] Can still view/edit/delete them

### Test 5.5: Share a Bill
**Steps:**
1. Click the "Share" button (link icon) on a bill
2. Enter friend's email (or select from friends list)
3. Choose split method: Equal (50/50)
4. Save

**Expected Results:**
- "Shared" badge appears next to bill name
- "Your share" displays below the total amount
- Friend receives notification (if implemented)

**Validation - Equal Split:**
- [ ] Owner amount = bill amount / 2
- [ ] Shared amount = bill amount / 2
- [ ] Owner + Shared = Total

**Validation - Percentage Split (60/40):**
- [ ] Owner amount = 60% of total
- [ ] Shared amount = 40% of total
- [ ] Percentages sum to 100%

**Validation - Fixed Amount Split:**
- [ ] Owner amount + Shared amount = Total
- [ ] Both amounts are editable

### Test 5.6: Delete Bill
**Steps:**
1. Delete a bill
2. Confirm

**Expected Results:**
- Confirmation modal
- Bill removed from table
- If financing item, also removed from financing cards section
- Budget updates (if this bill was in budget)

**Edge Cases:**
- [ ] Delete shared bill (should notify shared user)
- [ ] Delete paid-off bill (removed from completed section)

---

## Test Suite 6: Income Page (income.html)

### Test 6.1: Add Income Source
**Steps:**
1. Click "Add Income"
2. Enter:
   - Name: Freelance Work
   - Type: 1099
   - Amount: $1,200
   - Frequency: Bi-Weekly
   - Next Due Date: (next Friday)
3. Save

**Expected Results:**
- New row in table
- All fields formatted correctly

**Validation:**
- [ ] Income types: W2, 1099, Other
- [ ] All frequency options available

### Test 6.2: Edit Income
**Steps:**
1. Edit existing income
2. Change amount to $1,500
3. Save

**Expected Results:**
- Row updates
- Budget "Expected Income" recalculates

### Test 6.3: Delete Income
**Steps:**
1. Delete income
2. Confirm

**Expected Results:**
- Row removed
- Budget expected income decreases

---

## Test Suite 7: Budget Page (budget.html)

### Test 7.1: Generate Budget for Current Month
**Steps:**
1. Navigate to Budget page
2. Click "Generate Budget" button
3. Wait for confirmation

**Expected Results:**
- All active bills and debts appear in budget table
- "Needed" column = bill amount or debt monthly payment
- "Assigned" column pre-filled with needed amount
- Progress bars at 100% (fully funded)
- "Remaining to Budget" recalculates
- **Paid-off financing items are excluded**

**Validation:**
- [ ] Only active bills/debts included
- [ ] Variable bills use last month's amount if available
- [ ] Generate button shows status: "Generating..." → "✅ Generated X entries"
- [ ] Clicking again shows "Budget already up to date"

### Test 7.2: Adjust Budget Assignment
**Steps:**
1. Find a bill in the budget table
2. Change "Assigned" amount from $200 to $150
3. Tab out of the field

**Expected Results:**
- "Remaining" column updates: $200 - $150 = $50
- Progress bar updates to 75%
- Progress bar color changes to yellow (under-funded)
- "Assigned Amount" total at top recalculates
- "Remaining to Budget" recalculates

**Validation:**
- [ ] Over-funding (assigned > needed): progress bar red, 120%
- [ ] Exact funding (assigned = needed): progress bar green, 100%
- [ ] Under-funding (assigned < needed): progress bar yellow, <100%

### Test 7.3: Add Custom Budget Item
**Steps:**
1. Click "Add Budget Item"
2. Enter:
   - Name: Vacation Fund
   - Category: Savings
   - Needed Amount: $500
3. Save

**Expected Results:**
- New row appears in budget table
- "Assigned" defaults to $500 (needed amount)
- Progress bar at 100%
- Totals update

**Validation:**
- [ ] Custom items persist when switching months
- [ ] Can edit/delete custom items

### Test 7.4: Remove Item from Budget
**Steps:**
1. Click trash icon on a bill in the budget
2. Confirm removal

**Expected Results:**
- Item row becomes grayed out
- Moves to "Removed items" section at bottom
- Shows restore button
- Assigned amount removed from totals
- **Generate Budget will NOT re-add it**

**Validation:**
- [ ] Bill/debt items are suppressed (not deleted)
- [ ] Custom items are fully deleted
- [ ] Can restore suppressed items

### Test 7.5: Restore Removed Item
**Steps:**
1. Click "Restore" button on a removed item

**Expected Results:**
- Item moves back to active budget table
- Assigned amount resets to needed amount
- Totals recalculate
- Progress bar restores

### Test 7.6: Change Month
**Steps:**
1. Click "Next Month" button
2. Verify month label updates
3. Budget table reloads for new month

**Expected Results:**
- Month label changes (e.g., "January 2026" → "February 2026")
- Budget table shows saved assignments for that month (if any)
- If no data, table is empty
- Click "Generate Budget" to populate

**Validation:**
- [ ] Each month has independent budget data
- [ ] Switching back to previous month restores assignments
- [ ] "Prev Month" and "Next Month" work correctly

### Test 7.7: Zero Income Warning
**Steps:**
1. Go to Income page
2. Delete all income sources
3. Return to Budget page

**Expected Results:**
- Warning banner appears at top:
  - ⚠️ "No income sources found for this month."
  - Link to Income page
- Expected Income card shows $0.00
- Remaining to Budget shows negative value (if anything assigned)

**Validation:**
- [ ] Warning dismisses when income is added
- [ ] Budget still functions with $0 income

### Test 7.8: Budget Math Validation
**Steps:**
1. Set up budget with known values:
   - Income: $5,000
   - Bill 1 assigned: $1,500
   - Bill 2 assigned: $800
   - Bill 3 assigned: $600
2. Verify totals

**Expected Results:**
- Total Needed = sum of all "Needed" values
- Total Assigned = $1,500 + $800 + $600 = $2,900
- Remaining to Budget = $5,000 - $2,900 = $2,100

**Validation:**
- [ ] All calculations accurate to 2 decimal places
- [ ] Negative "Remaining" displays in red
- [ ] Over-budgeting handled correctly

---

## Test Suite 8: Reports Page (reports.html)

### Test 8.1: Net Worth Delta Chart
**Steps:**
1. Navigate to Reports page
2. Locate "Net Worth Change Over Time" chart

**Expected Results:**
- Bar chart showing month-over-month change
- Positive changes = green bars
- Negative changes = red bars
- Tooltips show dollar amounts

**Validation:**
- [ ] First month shows $0 change (no prior data)
- [ ] Subsequent months show delta from previous month
- [ ] Chart updates when snapshots change

### Test 8.2: Spending Categories Chart
**Steps:**
1. Locate "Spending by Category" donut chart

**Expected Results:**
- Shows all bill/debt types as slices
- Each slice colored differently
- Percentages sum to 100%
- Hover shows category name and amount

**Validation:**
- [ ] All bill types represented
- [ ] Debt payments included
- [ ] Paid-off financing excluded

### Test 8.3: Savings Rate Chart
**Steps:**
1. Locate "Savings Rate Over Time" line chart

**Expected Results:**
- Line chart showing % saved each month
- Formula: ((Income - Expenses) / Income) * 100
- Range: 0% to 100%

**Validation:**
- [ ] Negative savings rate (spending > income) shows correctly
- [ ] 100%+ savings rate (income > expenses by large margin) capped or handled
- [ ] Accounts for actual monthly income/expense frequency

### Test 8.4: Investment Growth Projection
**Steps:**
1. Locate "Investment Growth (Next 5 Months)" chart

**Expected Results:**
- Line chart with 5 data points
- Starts with current total investment value
- Projects forward using:
  - Actual portfolio annual return (weighted average)
  - Actual monthly contributions
- Values increase each month (if positive return)

**Validation:**
- [ ] Uses real user data (not hardcoded 8%)
- [ ] Handles negative returns (value decreases)
- [ ] Handles $0 contributions

---

## Test Suite 9: Settings Page (settings.html)

### Test 9.1: Set Emergency Fund Goal
**Steps:**
1. Navigate to Settings page
2. Enter Emergency Fund Goal: $15,000
3. Click "Save Settings"

**Expected Results:**
- Success message: "✅ Settings saved!"
- Message disappears after 3 seconds
- Return to dashboard
- Emergency Fund chart now displays (not the message)

**Validation:**
- [ ] Goal persists on page reload
- [ ] $0 goal reverts to "no goal set" message
- [ ] Negative values rejected

---

## Test Suite 10: Authentication & Security

### Test 10.1: Sign Up
**Steps:**
1. Open dashboard (logged out state)
2. Click "Sign Up" button
3. Enter:
   - Email: newuser@test.com
   - Password: SecurePass123!
   - First Name: Test
   - Last Name: User
4. Submit

**Expected Results:**
- Success message: "Account created! Check your email..."
- Email confirmation sent (check spam folder)
- Modal closes after 1 second

**Validation:**
- [ ] Weak passwords rejected
- [ ] Duplicate email shows error
- [ ] Form clears after submission

### Test 10.2: Login
**Steps:**
1. Click "Login" button
2. Enter valid credentials
3. Submit

**Expected Results:**
- Success message: "Login successful!"
- Modal closes
- Dashboard loads with user's data
- User info displayed in navbar

**Validation:**
- [ ] Invalid credentials show error
- [ ] Unconfirmed email shows error

### Test 10.3: Forgot Password
**Steps:**
1. Click "Forgot Password" link in login modal
2. Enter email
3. Submit

**Expected Results:**
- Success message: "Password reset link sent!"
- Check email for reset link
- Click link → redirected to reset password form

**Validation:**
- [ ] Invalid email shows error
- [ ] Link expires after X hours

### Test 10.4: Logout
**Steps:**
1. Click "Logout" button in navbar
2. Confirm (if prompted)

**Expected Results:**
- Redirected to login screen
- All data cleared from view
- Cannot access protected pages without re-login

---

## Test Suite 11: Data Isolation & Row-Level Security

### Test 11.1: User Data Isolation
**Steps:**
1. Create two test users: UserA and UserB
2. UserA adds assets, bills, debts
3. Log out UserA
4. Log in as UserB
5. Check if UserB sees UserA's data

**Expected Results:**
- UserB sees ONLY their own data
- No cross-user data visible
- Each user has independent budget, snapshots, etc.

**Validation (CRITICAL):**
- [ ] All Supabase queries filter by user_id
- [ ] RLS policies enabled on all tables
- [ ] No data leakage between users

---

## Test Suite 12: Edge Cases & Error Handling

### Test 12.1: Empty States
**Scenarios to test:**
- [ ] Dashboard with no data
- [ ] Budget with no bills/debts
- [ ] Reports with no snapshots
- [ ] Upcoming payments with nothing due

**Expected:**
- Friendly "no data" messages
- Calls-to-action (e.g., "Add your first bill")
- No blank/broken screens

### Test 12.2: Large Numbers
**Scenarios:**
- [ ] $10,000,000+ assets
- [ ] 1,000+ bills
- [ ] 100+ years of snapshots

**Expected:**
- No performance degradation
- Numbers format correctly ($10,000,000.00)
- Charts handle large datasets

### Test 12.3: Network Errors
**Steps:**
1. Disconnect internet
2. Try to save a bill

**Expected:**
- Error message: "Could not save. Check your connection."
- Data not lost (form retains values)
- Retry when connection restored

### Test 12.4: Invalid Inputs
**Scenarios:**
- [ ] Negative amounts (rejected or handled as $0)
- [ ] Future dates way in the past
- [ ] Special characters in names (should be escaped)
- [ ] Very long names (truncated or error)

**Expected:**
- Form validation prevents invalid submissions
- XSS attacks blocked (escapeHtml() function used)

---

## Test Suite 13: Theme Toggle

### Test 13.1: Switch to Dark Mode
**Steps:**
1. Click theme toggle switch (🌙/☀️)
2. Observe page

**Expected Results:**
- Background changes to dark
- Text color inverts (light text on dark bg)
- Charts update colors (grids, text, backgrounds)
- Preference saved to localStorage

**Validation:**
- [ ] Reload page → dark mode persists
- [ ] All pages respect theme setting
- [ ] Charts readable in both modes

---

## Test Suite 14: Responsive Design (Mobile)

### Test 14.1: Mobile Layout
**Steps:**
1. Resize browser to 375px width (mobile)
2. Navigate through all pages

**Expected Results:**
- Navbar collapses to hamburger menu
- Cards stack vertically
- Tables scroll horizontally (or reflow)
- Buttons remain accessible
- Charts resize appropriately

**Validation:**
- [ ] No horizontal scroll on main content
- [ ] All forms usable on mobile
- [ ] Modals fit on screen

---

## Post-Test Checklist

After completing all tests, verify:

- [ ] No console errors on any page
- [ ] All calculations produce correct results
- [ ] No data loss or corruption
- [ ] User isolation enforced
- [ ] Theme toggle works everywhere
- [ ] CSV export produces valid file
- [ ] All modals open/close correctly
- [ ] No broken links or 404 pages
- [ ] Performance: pages load in <2 seconds

---

## Bug Reporting Template

When a test fails, document it using this format:

**Bug ID:** BUG-001  
**Test:** Test Suite 4, Test 4.2  
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low  
**Description:** Monthly payment calculation is off by $0.50  
**Steps to Reproduce:**  
1. Add debt: $10,000 @ 5% APR / 24 months  
2. Observe monthly payment  
**Expected:** $438.71  
**Actual:** $439.21  
**Root Cause:** Rounding error in calculateAmortization() function  
**Fix Recommendation:** Apply rounding after each calculation step  

---

## Testing Sign-Off

**Tester Name:** ___________________  
**Date:** ___________________  
**Total Tests Run:** ___________________  
**Tests Passed:** ___________________  
**Tests Failed:** ___________________  
**Blockers:** ___________________  
**Approved for Production:** ☐ Yes ☐ No  

---

**End of Manual Test Plan**
