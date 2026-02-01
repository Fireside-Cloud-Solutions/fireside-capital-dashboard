# Quick Start — Gmail Email Bill Integration

Get the email bill scanner running in 5 minutes.

---

## ⚡ Prerequisites

- ✅ Supabase account (already have)
- ✅ Google account (Gmail)
- ✅ Node.js installed (v18+)
- ✅ App running locally (`http://localhost:3000`) or on Azure

---

## 🚀 5-Minute Setup

### Step 1: Run Database Migration (2 min)

1. Go to **Supabase Dashboard** → [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **qqtiofdqplwycnwplmen**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `app/migrations/001_create_pending_bills_table.sql`
6. Click **Run** (bottom right)
7. ✅ Should see: "Success. No rows returned"

### Step 2: Set Up Gmail OAuth (2 min)

1. Go to **Google Cloud Console** → [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a project or select existing
3. **Enable Gmail API**:
   - Navigation Menu → APIs & Services → Library
   - Search "Gmail API" → Enable
4. **Create OAuth Credentials**:
   - APIs & Services → Credentials
   - **+ CREATE CREDENTIALS** → OAuth client ID
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
   - Click **Create**
5. **Download JSON** or copy **Client ID** and **Client Secret**
6. Add to `app/.env`:

```bash
GMAIL_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Step 3: Authorize Gmail Access (1 min)

```bash
cd app
npm install googleapis
node integrations/gmail/gmail-client.js
```

- Browser will open (or you'll get a URL to visit)
- Log in with your Gmail account
- Grant permissions
- Paste authorization code back in terminal
- Copy the `GMAIL_REFRESH_TOKEN` printed to console
- Add to `app/.env`:

```bash
GMAIL_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_HERE
```

### Step 4: Start the Server (<1 min)

```bash
# From app/ directory
npm install
node assets/js/server.js
```

✅ Should see: "Server running on port 3000"

### Step 5: Test the Feature (<1 min)

1. Open `http://localhost:3000` (or your Azure URL)
2. Log in to your account
3. Go to **Bills** page
4. Click **"Scan Email for Bills"**
5. Wait 5-30 seconds
6. Review modal should open with parsed bills!

---

## 🎯 First-Time Usage

### What Happens on First Scan

1. **Backend** searches your Gmail for last 30 days
2. **Finds** emails matching bill keywords (invoice, statement, payment due, etc.)
3. **Parses** each email:
   - Vendor: "AT&T", "Netflix", "Duke Energy", etc.
   - Amount: $85.50, $12.99, $125.00
   - Due Date: 2026-02-15, 2026-03-01
   - Category: utilities, subscriptions, housing
   - Confidence: 0.95 (95%), 0.67 (67%), 0.42 (42%)
4. **Stores** in `pending_bills` table with status = 'pending'
5. **Shows** in review modal for your approval

### How to Review Bills

**For each bill, you can:**

- ✅ **Approve** → Adds to your Bills table (shows on Bills page)
- ❌ **Reject** → Ignores this bill (won't ask again)
- ✏️ **Edit** → Change category, amount, or due date before approving

**Batch Actions:**

- **Approve All High Confidence** → Auto-approves bills with ≥70% confidence (green badges)
- **Reject All Low Confidence** → Auto-rejects bills with ≤50% confidence (red badges)

**Pro Tip**: Start by approving high-confidence bills, then manually review medium-confidence ones.

---

## 🔍 What Emails Get Scanned?

The scanner looks for:

- **Subjects** containing: bill, invoice, statement, payment due, amount due
- **Senders** containing: noreply, billing, payments, invoices
- **Date range**: Last 30 days (configurable)

**Examples of detected bills:**
- "Your Xfinity bill is ready" → **Xfinity, $89.99/mo, Utilities**
- "Netflix - Your payment of $15.49 is due" → **Netflix, $15.49/mo, Subscriptions**
- "Duke Energy Statement - Amount Due: $125.50" → **Duke Energy, $125.50, Utilities**

---

## 🛠️ Troubleshooting

### "Scan failed: Gmail integration may not be set up yet"

**Fix**: Complete Step 2 and Step 3 (OAuth setup + authorization)

### "No bills found"

**Possible causes:**
1. **No bill emails** in last 30 days → Try extending to 60 days (edit `days: 30` in code)
2. **Different email format** → Check your bill email subjects match search queries
3. **Low confidence threshold** → Bills with <40% confidence are filtered out

**Fix**: Adjust search queries in `app/integrations/gmail/gmail-client.js`:

```javascript
const BILL_SEARCH_QUERIES = [
  'subject:(your specific bill keyword)',
  'from:(specific-sender@example.com)',
];
```

### Bills showing wrong category

**Fix**: Edit `app/integrations/gmail/bill-parser.js` and add your vendors:

```javascript
const VENDOR_MAP = {
  'yourutility.com': 'Your Utility Co.',
};
```

---

## 📊 What Gets Stored?

### In `pending_bills` table (for review):
- Vendor name
- Amount
- Due date (if found)
- Category (auto-detected)
- Confidence score (0.0–1.0)
- Email subject + snippet (for context)
- Status: 'pending' | 'approved' | 'rejected'

### After Approval → `bills` table:
- Name (vendor)
- Type (category)
- Amount
- Next due date
- Frequency (defaults to 'monthly')

---

## 🎓 Advanced Tips

### Add Your Own Vendors

If bills show as "Unknown" vendor:

1. Find the sender email domain (e.g., `noreply@att.com`)
2. Add to `VENDOR_MAP` in `app/integrations/gmail/bill-parser.js`:

```javascript
'att.com': 'AT&T',
'yourbank.com': 'Your Bank',
```

### Adjust Confidence Thresholds

Default: High = 70%, Low = 50%

To change, edit `app/assets/js/email-bills.js`:

```javascript
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,  // More strict (80%)
  LOW: 0.3,   // More lenient (30%)
};
```

### Scan More Days

Default: Last 30 days

To scan 60 days, edit `scanEmailForBills()` in `app/assets/js/email-bills.js`:

```javascript
body: JSON.stringify({ days: 60 }),
```

---

## 📝 Quick Reference

| Action | Where | What It Does |
|--------|-------|--------------|
| **Manual Scan** | Bills page → "Scan Email for Bills" button | Searches Gmail, parses bills, shows in modal |
| **Review** | Bills page → "Review Bills" button | Opens modal with pending bills |
| **Approve** | Review modal → "Approve" on each bill | Adds to Bills table |
| **Reject** | Review modal → "Reject" on each bill | Marks as rejected, won't show again |
| **Batch Approve** | Review modal → "Approve All High Confidence" | Auto-approves ≥70% confidence |
| **Batch Reject** | Review modal → "Reject All Low Confidence" | Auto-rejects ≤50% confidence |

---

## ✅ Success Checklist

After first scan, you should have:

- [x] Pending bills section visible at top of Bills page
- [x] Badge showing count (e.g., "5 bills awaiting review")
- [x] Review modal opens with bill cards
- [x] Can approve/reject individual bills
- [x] Approved bills appear in main Bills table
- [x] Pending count decrements as you review

---

## 🚀 Next: Automate It (Phase 2)

Phase 1 is **manual scanning only**. To enable **automatic scanning every 6 hours**:

1. Set up scheduled function (Azure Functions / Supabase Edge Functions)
2. Add Gmail OAuth UI to Settings page
3. Add scan frequency selector (6h / 12h / 24h)
4. Add Discord notifications when new bills found

**Ready for Phase 2?** Ping Capital in Discord: `#commands` channel.

---

**You're all set!** 🎉

Try scanning your email now: Bills page → "Scan Email for Bills"
