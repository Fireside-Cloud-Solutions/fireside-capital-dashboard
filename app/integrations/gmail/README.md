# Gmail Bill Integration — Fireside Capital

Automatically searches your Gmail inbox for bills, statements, and invoices, then extracts structured data (vendor, amount, due date, category) ready for the dashboard.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `gmail-client.js` | OAuth 2.0 authentication + Gmail API wrapper |
| `bill-parser.js` | Email parsing, amount/date extraction, categorization |
| `README.md` | This file — setup guide |

---

## 🔧 Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top left) → **New Project**
3. Name it: `Fireside Capital` (or anything you like)
4. Click **Create**
5. Make sure the new project is selected in the dropdown

### Step 2: Enable the Gmail API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click on it → click **Enable**

### Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type → click **Create**
3. Fill in:
   - **App name:** `Fireside Capital`
   - **User support email:** your email
   - **Developer contact email:** your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**
   - Search for `gmail.readonly`
   - Check the box for `https://www.googleapis.com/auth/gmail.readonly`
   - Click **Update** → **Save and Continue**
6. On the **Test users** page, click **Add Users**
   - Add your Gmail address
   - Click **Save and Continue**
7. Review and click **Back to Dashboard**

> ⚠️ **Note:** While the app is in "Testing" status, only test users can authorize. This is fine for personal use. If you want to skip the "unverified app" warning, you can publish the app later.

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Fireside Capital Dashboard`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/auth/google/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 5: Configure Environment Variables

Add these to your `app/.env` file:

```env
# Gmail API OAuth 2.0
GMAIL_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Step 6: Install Dependencies

From the `app/` directory:

```bash
npm install googleapis
```

### Step 7: Run First Authorization

```bash
cd app
node integrations/gmail/bill-parser.js 30
```

This will:
1. Print a URL — open it in your browser
2. Sign in with your Google account
3. Grant permission to read emails
4. Copy the authorization code and paste it back in the terminal
5. A refresh token will be generated and saved

After the first run, add the refresh token to your `.env`:

```env
GMAIL_REFRESH_TOKEN=your-refresh-token-here
```

This ensures future runs don't need the interactive flow.

---

## 🚀 Usage

### CLI — Quick Scan

```bash
# Search last 30 days (default)
node integrations/gmail/bill-parser.js

# Search last 90 days
node integrations/gmail/bill-parser.js 90

# Search last 60 days, minimum 0.6 confidence
node integrations/gmail/bill-parser.js 60 0.6
```

### Programmatic — In Your App

```javascript
const { searchBillEmails } = require('./integrations/gmail/gmail-client');
const { parseBillEmails } = require('./integrations/gmail/bill-parser');

async function scanForBills() {
  // Search Gmail for bill emails from the last 30 days
  const emails = await searchBillEmails({ days: 30, maxResults: 200 });
  
  // Parse and extract structured bill data
  const bills = parseBillEmails(emails, { minConfidence: 0.5 });
  
  // Each bill looks like:
  // {
  //   vendor: "AT&T",
  //   amount: 85.50,
  //   due_date: "2026-02-15",
  //   category: "utilities",
  //   source_email_id: "msg_abc123",
  //   confidence: 0.85
  // }
  
  return bills;
}
```

---

## 📤 Output Format

Each extracted bill is a JSON object ready for Supabase:

```json
{
  "vendor": "AT&T",
  "amount": 85.50,
  "due_date": "2026-02-15",
  "category": "utilities",
  "source_email_id": "18d4a5b3c2e1f000",
  "confidence": 0.85
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `vendor` | string | Cleaned vendor name (from sender or subject) |
| `amount` | number | Dollar amount due |
| `due_date` | string\|null | Due date in YYYY-MM-DD format (null if not found) |
| `category` | string | Auto-classified: `utilities`, `insurance`, `subscriptions`, `housing`, `loans`, `credit_cards`, `medical`, `other` |
| `source_email_id` | string | Gmail message ID for reference |
| `confidence` | number | 0.0–1.0 confidence score for the extraction |

---

## 🔒 Security

- **No credentials in code.** All secrets are in `.env` (which is `.gitignore`'d).
- **Read-only scope.** The `gmail.readonly` scope cannot modify or delete emails.
- **Token storage.** The `.gmail-token.json` file is created locally and should NOT be committed. It's in `.gitignore`.
- **No data leaves your machine** — parsing happens locally.

### Required `.env` Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GMAIL_CLIENT_ID` | OAuth 2.0 Client ID | ✅ Yes |
| `GMAIL_CLIENT_SECRET` | OAuth 2.0 Client Secret | ✅ Yes |
| `GMAIL_REDIRECT_URI` | Redirect URI (default: `http://localhost:3000/auth/google/callback`) | Optional |
| `GMAIL_REFRESH_TOKEN` | Refresh token (generated after first auth) | Recommended |

---

## 🏗️ Architecture

```
Gmail Inbox
    │
    ▼
gmail-client.js ──── OAuth 2.0 ────► Google API
    │                                    │
    │ searchBillEmails()                 │ messages.list()
    │                                    │ messages.get()
    ▼                                    ▼
bill-parser.js ◄──── raw emails ────────┘
    │
    ├── extractVendor()     → "AT&T"
    ├── extractAmount()     → $85.50
    ├── extractDueDate()    → "2026-02-15"
    └── classifyCategory()  → "utilities"
    │
    ▼
Structured Bill Data ────► Supabase (future)
                     ────► Dashboard (future)
                     ────► Discord alerts (future)
```

---

## 🔮 Next Steps

After setup and initial testing:

1. **Validate parsing accuracy** — Review the extracted bills for correctness
2. **Wire into Supabase** — Auto-insert bills into the `bills` table
3. **Dashboard integration** — Show parsed bills on the web dashboard
4. **Scheduled scanning** — Run on a cron/timer (daily or weekly)
5. **Discord alerts** — Post new bills to #alerts channel
6. **Extend vendor map** — Add more vendors as they appear

---

## 🐛 Troubleshooting

### "Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET"
→ Add them to `app/.env`. See Step 4-5 above.

### "invalid_grant" or token errors
→ Your refresh token may have expired. Delete `.gmail-token.json` and re-run the auth flow.

### No bills found
→ Try a longer time range: `node integrations/gmail/bill-parser.js 90`
→ Check that you have bill emails in your inbox (not just trash/spam)

### Low confidence scores
→ The parser uses heuristic regex patterns. Bills with non-standard formatting may score lower. Review `_meta` fields for debugging.

### Google "This app isn't verified" warning
→ This is normal for apps in "Testing" mode. Click **Advanced** → **Go to Fireside Capital (unsafe)** to proceed. It's your own app on your own account.
