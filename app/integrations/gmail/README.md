# Gmail Bill Integration — Setup Guide

This feature automatically scans your Gmail inbox for bills (electricity, internet, subscriptions, etc.), extracts key data (vendor, amount, due date), and allows you to approve or reject them with one click.

---

## 🎯 What It Does

1. **Scans** your Gmail inbox for bill-related emails (last 30 days by default)
2. **Parses** vendor name, amount, due date, and category using AI-powered extraction
3. **Stores** results in a `pending_bills` table for review
4. **Allows** you to approve (add to Bills), reject, or edit before saving

---

## ✅ Phase 1 Features (Completed)

- ✅ Manual "Scan Email for Bills" button on Bills page
- ✅ Pending bills section with badge count
- ✅ Review modal with individual bill cards
- ✅ Approve/reject/edit actions for each bill
- ✅ Batch actions: "Approve All High Confidence", "Reject All Low Confidence"
- ✅ Confidence scoring (high ≥70%, low ≤50%)
- ✅ Database schema: `pending_bills` table
- ✅ Backend API endpoint: `POST /api/scan-email-bills`

---

## 🔧 Setup Instructions

### 1. Database Migration

Run the SQL migration to create the `pending_bills` table:

```bash
# In Supabase Dashboard > SQL Editor, run:
app/migrations/001_create_pending_bills_table.sql
```

Or execute manually:

```sql
CREATE TABLE pending_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  category TEXT,
  confidence NUMERIC(3, 2),
  source_email_id TEXT,
  email_subject TEXT,
  email_snippet TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes + RLS policies (see full migration file)
```

### 2. Google Cloud OAuth Setup

To connect to Gmail, you need OAuth 2.0 credentials:

#### A. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., "Fireside Capital Gmail")
3. Enable the **Gmail API** (APIs & Services > Library > search "Gmail API")

#### B. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth client ID**
3. Application type: **Web application**
4. Name: `Fireside Capital Gmail Integration`
5. **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/google/callback` (production)
6. Click **Create** and download the JSON file

#### C. Add Credentials to `.env`

```bash
# Gmail OAuth Credentials
GMAIL_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 3. First-Time OAuth Authorization

The first time you run a Gmail scan, you'll need to authorize the app:

```bash
# From the app/ directory
cd app
npm install googleapis

# Run the authorization flow
node integrations/gmail/gmail-client.js
```

This will:
1. Print an authorization URL
2. Ask you to visit it and log in with your Google account
3. Paste the authorization code back
4. Save a refresh token to `.gmail-token.json` and `.env`

Once complete, copy the `GMAIL_REFRESH_TOKEN` to your `.env`:

```bash
GMAIL_REFRESH_TOKEN=your-refresh-token-here
```

### 4. Start the Backend Server

The Gmail scanning endpoint runs on the Express server:

```bash
# From app/ directory
npm install
node assets/js/server.js
```

Server should be running on `http://localhost:3000`

### 5. Test the Integration

1. Open the dashboard: `http://localhost:3000` (or live URL)
2. Log in to your account
3. Navigate to **Bills** page
4. Click **"Scan Email for Bills"** button
5. Wait for the scan to complete (5-30 seconds depending on inbox size)
6. Review parsed bills in the modal
7. Approve, reject, or edit bills

---

## 📋 Usage

### Manual Scan

1. Go to **Bills** page
2. Click **"Scan Email for Bills"**
3. Wait for results
4. Review in the modal:
   - ✅ **Approve** → adds to Bills table
   - ❌ **Reject** → marks as rejected
   - ✏️ **Edit** → adjust amount/category/date

### Batch Actions

- **Approve All High Confidence**: Auto-approves bills with ≥70% confidence
- **Reject All Low Confidence**: Auto-rejects bills with ≤50% confidence
- **Select All / Deselect All**: Bulk selection

### Pending Bills Section

- Appears at the top of Bills page when pending bills exist
- Shows count badge (e.g., "3 bills awaiting review")
- Click "Review Bills" to open modal

---

## 🔍 How It Works

### Email Search Queries

The scanner searches for emails matching:
- `subject:(bill OR statement OR invoice)`
- `subject:(payment due OR amount due)`
- `subject:(your bill is ready OR payment reminder)`
- `from:(noreply OR billing OR payments OR invoices)`

### Parsing Logic

1. **Amount Extraction**
   - Regex patterns: "Amount Due: $123.45", "Total: $85.50", etc.
   - Confidence: Higher for explicit labels, lower for generic dollar signs

2. **Due Date Extraction**
   - Patterns: "Due Date: January 15, 2026", "Due by: 01/15/2026"
   - Assumes current/next year if no year specified

3. **Vendor Extraction**
   - Checks known vendor map (`VENDOR_MAP` in `bill-parser.js`)
   - Falls back to sender domain or display name

4. **Category Classification**
   - Heuristic rules based on vendor and keywords
   - Categories: utilities, housing, auto, insurance, subscriptions, health, other

### Confidence Scoring

Each bill gets a confidence score (0.0–1.0) based on:
- Amount extraction confidence (explicit "Amount Due" = high)
- Date extraction confidence (full date with year = high)
- Category classification confidence (known vendor = high)

Overall confidence = average of component scores.

---

## 🛠️ Troubleshooting

### "Scan failed: Gmail integration may not be set up yet"

**Cause**: Missing or invalid OAuth credentials.

**Fix**:
1. Check `.env` has `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
2. Run authorization flow: `node integrations/gmail/gmail-client.js`
3. Restart the server

### "Failed to save bills: permission denied"

**Cause**: Row Level Security (RLS) policy issue.

**Fix**:
1. Verify RLS policies are enabled on `pending_bills` table
2. Check `user_id` matches `auth.uid()` in Supabase
3. Verify you're logged in (check `currentUser` in console)

### No bills found despite having bill emails

**Cause**: Search queries may not match your email format.

**Fix**:
1. Check email subjects/senders in your inbox
2. Adjust `BILL_SEARCH_QUERIES` in `gmail-client.js`
3. Lower `minConfidence` threshold (default: 0.4)

### Bills showing wrong category

**Cause**: Heuristic classifier needs training.

**Fix**:
1. Add your vendors to `VENDOR_MAP` in `bill-parser.js`
2. Add keywords to `CATEGORY_RULES`
3. Use the "Edit" button to correct category before approving

---

## 📦 Dependencies

- `googleapis` — Google APIs Node.js client
- `express` — Backend API server
- `dotenv` — Environment variable management
- `@supabase/supabase-js` — Database client

Install:

```bash
npm install googleapis express dotenv cors
```

---

## 🚧 Phase 2 Preview (Next Steps)

- **Settings page integration**: Enable/disable auto-scan, set frequency
- **Gmail OAuth UI**: In-app authorization flow (no CLI needed)
- **Automated scanning**: Cron job to scan every 6/12/24 hours
- **Discord notifications**: Alert when new bills are found
- **Improved editing**: Inline editing for vendor/amount/date
- **Email preview**: Show full email body in modal

---

## 📝 Files Overview

| File | Purpose |
|------|---------|
| `gmail-client.js` | OAuth + Gmail API wrapper |
| `bill-parser.js` | Email → structured bill data |
| `server.js` | Express API endpoint (`POST /api/scan-email-bills`) |
| `email-bills.js` | Frontend UI logic (scan button, review modal) |
| `bills.html` | Updated UI (scan button, pending section, modal) |
| `styles.css` | Email bill card styling |
| `001_create_pending_bills_table.sql` | Database migration |

---

## 🎓 Developer Notes

### Adding New Vendors

Edit `bill-parser.js`:

```javascript
const VENDOR_MAP = {
  'yourutility.com': 'Your Utility Co.',
  'yourbank.com': 'Your Bank',
};
```

### Adjusting Search Queries

Edit `gmail-client.js`:

```javascript
const BILL_SEARCH_QUERIES = [
  'subject:(your custom query)',
  'from:(specific-sender@example.com)',
];
```

### Changing Confidence Thresholds

Edit `email-bills.js`:

```javascript
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,  // More strict
  LOW: 0.3,   // More lenient
};
```

---

## ✅ Testing Checklist

- [ ] Database migration runs without errors
- [ ] OAuth authorization completes successfully
- [ ] Server starts and `/api/scan-email-bills` responds
- [ ] "Scan Email for Bills" button triggers scan
- [ ] Pending bills section appears when bills exist
- [ ] Review modal loads and displays bills correctly
- [ ] Approve action adds bill to `bills` table
- [ ] Reject action marks bill as rejected
- [ ] Batch actions work (approve all high, reject all low)
- [ ] Page reloads show correct bill counts

---

## 📞 Support

For issues or questions:
1. Check server logs for detailed error messages
2. Review Supabase logs for database errors
3. Test OAuth flow manually: `node integrations/gmail/gmail-client.js`
4. Ping Capital (orchestrator) in Discord #commands channel

---

**Phase 1 Complete!** 🎉

Ready to move to Phase 2 (Settings UI + Automated Scanning)?
