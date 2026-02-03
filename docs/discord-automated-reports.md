# Discord Automated Financial Reports
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03  
Script: `scripts/generate-financial-report.js`

---

## Overview

Automated weekly and monthly financial summary reports posted to Discord #reports channel.

### What Gets Reported

**Weekly Report:**
- Current net worth
- 7-day net worth change
- Monthly cash flow (income - bills)
- Asset/investment/debt totals
- Upcoming bills (next 7 days)

**Monthly Report:**
- Current net worth
- 30-day net worth change
- Monthly cash flow & savings rate
- Asset/investment/debt totals
- Top 5 spending categories

---

## Setup

### 1. Create Discord Webhook

1. Go to Discord → #reports channel → Edit Channel (⚙️)
2. Click **Integrations** → **Webhooks** → **New Webhook**
3. Name: `Fireside Capital Reports`
4. Avatar: (optional, upload Fireside logo)
5. Copy the **Webhook URL**
6. Click **Save**

The webhook URL looks like:
```
https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz...
```

### 2. Set Environment Variables

#### Windows (PowerShell)
```powershell
# Add to your PowerShell profile or set per-session
$env:SUPABASE_URL = "https://qqtiofdqplwycnwplmen.supabase.co"
$env:SUPABASE_KEY = "your-supabase-anon-key"
$env:DISCORD_WEBHOOK_URL = "your-discord-webhook-url"
```

#### Linux/macOS (Bash)
```bash
# Add to ~/.bashrc or ~/.zshrc
export SUPABASE_URL="https://qqtiofdqplwycnwplmen.supabase.co"
export SUPABASE_KEY="your-supabase-anon-key"
export DISCORD_WEBHOOK_URL="your-discord-webhook-url"
```

#### Azure Function / Cron Service
Set in the function app configuration:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `DISCORD_WEBHOOK_URL`

---

## Usage

### Manual Execution

#### Weekly Report
```bash
cd C:\Users\chuba\fireside-capital
node scripts/generate-financial-report.js weekly
```

#### Monthly Report
```bash
cd C:\Users\chuba\fireside-capital
node scripts/generate-financial-report.js monthly
```

### Expected Output
```
[Report Generator] Starting weekly report generation...
[Report Generator] Fetching financial data from Supabase...
[Report Generator] Loaded: 2 assets, 8 bills, 15 snapshots
[Report Generator] Generating weekly report...
[Report Generator] Posting to Discord...
✅ [Report Generator] Report posted successfully!
```

---

## Scheduling (Automated)

### Option 1: Clawdbot Cron

Use the Clawdbot cron system to schedule reports:

```bash
# Weekly report: Every Monday at 9:00 AM
clawdbot cron add \
  --schedule "0 9 * * 1" \
  --task "node scripts/generate-financial-report.js weekly"

# Monthly report: 1st of every month at 9:00 AM
clawdbot cron add \
  --schedule "0 9 1 * *" \
  --task "node scripts/generate-financial-report.js monthly"
```

### Option 2: Windows Task Scheduler

1. Open Task Scheduler → Create Task
2. **General:**
   - Name: `Fireside Capital Weekly Report`
   - Run whether user is logged on or not
3. **Triggers:**
   - New → Weekly, Monday at 9:00 AM
4. **Actions:**
   - New → Start a program
   - Program: `node.exe`
   - Arguments: `scripts/generate-financial-report.js weekly`
   - Start in: `C:\Users\chuba\fireside-capital`
5. Click OK

Repeat for monthly report (1st of month).

### Option 3: Azure Function (Cron Trigger)

Create an Azure Function with a timer trigger:

**function.json:**
```json
{
  "bindings": [
    {
      "name": "weeklyTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 9 * * MON"
    }
  ]
}
```

**index.js:**
```javascript
const { execSync } = require('child_process');

module.exports = async function (context, weeklyTimer) {
  context.log('Running weekly financial report...');
  execSync('node scripts/generate-financial-report.js weekly', {
    cwd: '/home/site/wwwroot',
    env: process.env
  });
};
```

---

## Report Examples

### Weekly Report Preview
```
📊 Weekly Financial Summary
Report generated on Feb 3, 2026

💰 Net Worth               📈 7-Day Change            💵 Monthly Cash Flow
$125,340.00                +$2,450.00 (+2.00%)       $3,210.00 (32.10%)

🏠 Assets                  📊 Investments             💳 Debts
$280,000.00                $50,000.00                 $204,660.00

💸 Monthly Bills           💰 Monthly Income
$6,790.00                  $10,000.00

⏰ Upcoming Bills (Next 7 Days)
• Electric Bill — $120.00 due Feb 5, 2026
• Internet — $80.00 due Feb 7, 2026
• Car Insurance — $150.00 due Feb 9, 2026
```

### Monthly Report Preview
```
📊 Monthly Financial Summary
Report generated on Feb 1, 2026

💰 Net Worth               📈 30-Day Change           💵 Monthly Cash Flow
$125,340.00                +$8,230.00 (+7.02%)       $3,210.00

🏠 Total Assets            📊 Total Investments       💳 Total Debts
$280,000.00                $50,000.00                 $204,660.00

💸 Monthly Bills           💰 Monthly Income          📊 Savings Rate
$6,790.00 (18 bills)       $10,000.00 (2 sources)    +32.10%

💰 Top Spending Categories
• Rent/Mortgage — $2,500.00
• Auto Financing — $650.00
• Insurance — $540.00
• Subscriptions — $320.00
• Utilities — $280.00
```

---

## Troubleshooting

### Error: `SUPABASE_KEY environment variable not set`
**Solution:** Set the environment variable before running the script (see Setup section).

### Error: `Discord webhook error (404)`
**Solution:** Verify the webhook URL is correct and hasn't been deleted from Discord.

### Error: `Supabase error: JWT expired`
**Solution:** The Supabase key is invalid or expired. Generate a new anon key from the Supabase dashboard.

### No data in report / "Not enough data"
**Solution:**
- Ensure you have entered assets, bills, income, and debts in the app
- Create at least 2 net worth snapshots (dashboard page calculates them automatically)

### Report posted but empty fields
**Solution:** Check that your data has the required fields:
- Bills: `amount`, `frequency`, `type`, `due_date`
- Assets: `value`
- Investments: `starting_balance`
- Debts: `balance`

---

## Customization

### Change Report Colors

Edit `generate-financial-report.js`:

```javascript
// Weekly report (line ~200)
color: 0x01a4ef, // Fireside blue

// Monthly report (line ~280)
color: 0xf44e24, // Fireside orange
```

Discord color codes are hex integers (e.g., `0xFF5733`).

### Add More Fields

Add to the `fields` array in the embed:

```javascript
{
  name: '🎯 Custom Metric',
  value: 'Your calculated value',
  inline: true
}
```

### Change Report Channel

Create a new webhook in a different channel and update the `DISCORD_WEBHOOK_URL` environment variable.

---

## Security Notes

1. **Webhook URL is sensitive** — Anyone with it can post to your Discord channel. Keep it secret.
2. **Supabase key** — Use the anon key, not the service role key (RLS policies will filter data by user).
3. **Do NOT commit** webhook URL or Supabase key to Git. Use environment variables only.

---

## Future Enhancements

- [ ] **Email reports** — Send via email in addition to Discord
- [ ] **Spending alerts** — Notify when spending exceeds budget
- [ ] **Goal tracking** — Report progress toward savings/debt payoff goals
- [ ] **Chart images** — Embed net worth trend charts in reports
- [ ] **Multi-user support** — Generate reports per user (when shared bills are used)

---

## Related Documentation

- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Supabase REST API](https://supabase.com/docs/reference/javascript/select)
- [Clawdbot Cron](../docs/CRON.md)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
