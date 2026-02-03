# Scheduled Budget Generation
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03  
Script: `scripts/generate-monthly-budget.js`

---

## Overview

Automatically creates a new month's budget on the 1st of each month, based on the previous month's allocations. Eliminates manual budget setup and ensures continuity month-to-month.

### What It Does

1. **Checks for existing budget** — Skips if budget already exists for target month
2. **Copies previous month** — Uses last month's budget amounts as defaults
3. **Adds all active bills/income** — Includes recurring items (skips one-time)
4. **Normalizes frequencies** — Converts weekly/bi-weekly/quarterly to monthly amounts
5. **Notifies Discord** — Posts summary to #reports (optional)

---

## How It Works

### Example Scenario

**Previous Month (January 2026):**
- Electric Bill: $120 (monthly) → Budget: $120
- Internet: $80 (monthly) → Budget: $80 (manually adjusted from $75)
- Car Payment: $350 (monthly) → Budget: $350

**New Month (February 2026):**
The script creates:
- Electric Bill: $120 (copied from January)
- Internet: $80 (keeps manual override from January)
- Car Payment: $350 (copied from January)

If you had adjusted January's budget (e.g., increased Internet to $80), February inherits the adjusted amount.

---

## Usage

### Manual Execution

```bash
cd C:\Users\chuba\fireside-capital

# Generate budget for current month
node scripts/generate-monthly-budget.js

# Generate budget for specific month
node scripts/generate-monthly-budget.js 2026-03
```

### Expected Output

```
[Budget Generator] Starting automatic budget generation...
[Budget Generator] Target month: 2026-02
[Budget Generator] Generating budget for 2026-02...
[Budget Generator] Found 12 assignments from 2026-01
[Budget Generator] Found 8 bills, 2 income sources
[Budget Generator] Created 10 budget assignments
✅ [Budget Generator] Budget inserted successfully
[Budget Generator] Discord notification sent
[Budget Generator] Complete!
```

### Notification Example (Discord)

```
✅ Budget Generated for 2026-02

📊 10 items budgeted
💰 Income: $10,000.00
💸 Expenses: $6,790.00
💵 Projected Savings: $3,210.00 (32.1%)
```

---

## Scheduling (Automated)

### Option 1: Clawdbot Cron

```bash
# Run on the 1st of every month at 12:01 AM
clawdbot cron add \
  --schedule "1 0 1 * *" \
  --task "node scripts/generate-monthly-budget.js"
```

### Option 2: Windows Task Scheduler

1. Open Task Scheduler → Create Task
2. **General:**
   - Name: `Fireside Capital Monthly Budget`
   - Run whether user is logged on or not
3. **Triggers:**
   - New → Monthly, 1st day, 12:01 AM
4. **Actions:**
   - New → Start a program
   - Program: `node.exe`
   - Arguments: `scripts/generate-monthly-budget.js`
   - Start in: `C:\Users\chuba\fireside-capital`
5. Click OK

### Option 3: Azure Function (Cron Trigger)

**function.json:**
```json
{
  "bindings": [
    {
      "name": "monthlyTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 1 0 1 * *"
    }
  ]
}
```

**index.js:**
```javascript
const { execSync } = require('child_process');

module.exports = async function (context, monthlyTimer) {
  context.log('Running monthly budget generation...');
  execSync('node scripts/generate-monthly-budget.js', {
    cwd: '/home/site/wwwroot',
    env: process.env
  });
};
```

---

## Environment Variables

### Required
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_KEY` — Supabase anon or service key

### Optional
- `DISCORD_WEBHOOK_URL` — Discord webhook for notifications (#reports channel)

### Setup (PowerShell)
```powershell
$env:SUPABASE_URL = "https://qqtiofdqplwycnwplmen.supabase.co"
$env:SUPABASE_KEY = "your-supabase-key"
$env:DISCORD_WEBHOOK_URL = "your-discord-webhook-url"
```

---

## Logic Details

### Frequency Normalization

The script converts all frequencies to monthly amounts:

| Frequency | Multiplier | Example |
|-----------|------------|---------|
| daily | × 30 | $10/day → $300/month |
| weekly | × 4.33 | $50/week → $216.50/month |
| bi-weekly | × 2.17 | $100/bi-weekly → $217/month |
| monthly | × 1 | $500/month → $500/month |
| quarterly | × 0.33 | $600/quarter → $200/month |
| semi-annual | × 0.17 | $1200/semi-annual → $200/month |
| annual | × 0.083 | $1200/year → $100/month |
| one-time | **Skipped** | — |

### Budget Inheritance

1. **No previous budget:** Uses calculated monthly amount from bill/income
2. **Previous budget exists:** Uses previous month's amount (preserves manual adjustments)
3. **One-time bills:** Skipped (won't appear in new budget)

### Duplicate Prevention

If a budget already exists for the target month, the script exits with:
```
⚠️  Budget for 2026-02 already exists. Skipping.
```

This prevents duplicate entries if the script runs multiple times.

---

## Manual Adjustments

### After Auto-Generation

The script creates a baseline budget. You can still manually adjust:

1. Go to **Budget page** in the app
2. Click on any budget item to edit
3. Change the budgeted amount
4. Save

**Next month, your manual adjustments will be preserved** — the script copies adjusted amounts, not recalculated ones.

### Adding Custom Categories

To add non-bill/income budget items:

1. Create a suppressed bill/income (set `suppressed = true` in database)
2. Or manually insert budget row via Supabase SQL Editor:

```sql
INSERT INTO budgets (month, item_type, item_id, item_name, amount, category)
VALUES ('2026-02', 'custom', NULL, 'Savings Goal', 500.00, 'Savings');
```

---

## Troubleshooting

### Issue: Budget not generated

**Causes:**
1. No bills or income in database
2. All bills are one-time (script skips them)
3. Budget already exists for target month

**Solution:** Check database for active recurring bills/income.

### Issue: Amounts are wrong

**Causes:**
1. Frequency set incorrectly on bill/income
2. Previous month's budget had manual adjustments

**Solution:** 
- Verify bill frequency (monthly vs bi-weekly vs weekly)
- Check previous month's budget in app for overrides

### Issue: Discord notification failed

**Causes:**
1. Webhook URL invalid
2. Webhook deleted from Discord
3. Network error

**Solution:** Verify webhook URL is correct. Notification failure doesn't block budget creation.

---

## Security Notes

1. **Supabase key** — Use anon key (RLS policies filter by user). Service key bypasses RLS.
2. **Discord webhook** — Keep URL secret. Anyone with it can post to your channel.
3. **Cron security** — Ensure scheduled task runs with minimal permissions (no admin).

---

## Future Enhancements

- [ ] **Budget templates** — Define custom monthly budgets independent of bills
- [ ] **Rollover tracking** — Carry forward unused budget to next month
- [ ] **Goal-based budgets** — Allocate toward savings/debt payoff goals
- [ ] **Category limits** — Set spending caps per category (Utilities, Entertainment, etc.)
- [ ] **Budget variance alerts** — Notify when spending exceeds budget

---

## Related Documentation

- [Budget Page Documentation](./BUDGET.md)
- [Discord Automated Reports](./discord-automated-reports.md)
- [Supabase Schema](./ARCHITECTURE.md)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
