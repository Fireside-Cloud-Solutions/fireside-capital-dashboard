# Gmail Integration Implementation Plan
**Fireside Capital — Automated Bill Parsing**

Version: 1.0  
Date: February 1, 2026  
Author: Connector (Fireside Capital Integrations)

---

## 1. Overview

### What We're Building
An automated bill parsing system that:
- Connects to user's Gmail account via secure OAuth 2.0
- Scans inbox for bill-related emails (utilities, credit cards, subscriptions)
- Extracts bill data (amount, due date, merchant, category)
- Automatically inserts parsed bills into Supabase `bills` table
- Runs on a scheduled basis (daily/hourly) to keep bills up-to-date

### Why This Matters
Manual bill entry is tedious and error-prone. By automating bill detection and parsing from email, users:
- Never miss a bill payment
- Maintain accurate financial records effortlessly
- Get automated payment reminders via Discord alerts
- Build a complete financial picture without data entry overhead

### Technical Approach
**Azure Function (serverless)** triggered on a schedule (cron) that:
1. Retrieves stored OAuth tokens from Supabase
2. Queries Gmail API for bill-related emails
3. Parses email content and attachments
4. Inserts/updates bills in Supabase
5. Posts notifications to Discord #transactions channel

---

## 2. Prerequisites

### What the Founder Must Set Up

#### A. Google Cloud Project
1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Name: `fireside-capital-gmail`
   - Organization: (optional, leave blank for personal account)
   - Click "Create"

2. **Enable Gmail API**
   - In Cloud Console, go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: **External** (unless using Google Workspace organization)
   - Click "Create"
   - Fill in:
     - **App name:** Fireside Capital
     - **User support email:** (your email)
     - **App logo:** (optional, use Fireside logo)
     - **Authorized domains:** `azurestaticapps.net` (for the dashboard)
     - **Developer contact information:** (your email)
   - Click "Save and Continue"

4. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Search and add:
     - `https://www.googleapis.com/auth/gmail.readonly` — **Restricted scope** (read-only access to mailbox)
   - Click "Update" → "Save and Continue"
   - **Note:** This scope requires Google verification if more than 100 users. For personal use, you can add your account to "Test users" to bypass verification.

5. **Add Test Users** (if app is in testing mode)
   - Add your Gmail address to "Test users" list
   - This allows you to use the app without full OAuth verification

6. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Fireside Capital Web Client`
   - Authorized JavaScript origins:
     - `https://nice-cliff-05b13880f.2.azurestaticapps.net`
     - `http://localhost:3000` (for local testing)
   - Authorized redirect URIs:
     - `https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/gmail/callback`
     - `http://localhost:3000/auth/gmail/callback`
   - Click "Create"
   - **Download JSON** — save as `credentials/gmail-oauth-credentials.json` (DO NOT commit to repo)

7. **Extract Credentials**
   - Open the downloaded JSON file
   - Copy `client_id` and `client_secret` values
   - Store in Azure Function environment variables (see Deployment section)

#### B. Azure Resources
- **Azure Function App** (create via Azure Portal or CLI)
- **Azure Key Vault** (optional but recommended for production token storage)

#### C. Supabase Schema Updates
Add a new table for storing OAuth tokens:

```sql
CREATE TABLE user_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail'
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can manage their own OAuth tokens"
ON user_oauth_tokens
FOR ALL
USING (auth.uid() = user_id);
```

Add a column to track processed emails:

```sql
-- Track which emails have been processed to avoid duplicates
CREATE TABLE processed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Gmail message ID
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  UNIQUE(user_id, email_id)
);

ALTER TABLE processed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own processed emails"
ON processed_emails
FOR ALL
USING (auth.uid() = user_id);
```

---

## 3. Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Fireside Capital Dashboard                 │
│                  (Azure Static Web App - Frontend)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 1. User clicks "Connect Gmail"
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Google OAuth 2.0                            │
│          (User grants gmail.readonly permission)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 2. Redirect with auth code
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 OAuth Callback Handler                          │
│              (Express server / Azure Function)                  │
│         - Exchange code for access + refresh tokens             │
│         - Store tokens in Supabase (encrypted at rest)          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 3. Tokens stored
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            Supabase Database (user_oauth_tokens table)          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ 4. Scheduled trigger (cron: daily)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Azure Function: Bill Parser                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Load user tokens from Supabase                      │   │
│  │  2. Refresh access token if expired (< 5 min remaining) │   │
│  │  3. Query Gmail API for bill emails                     │   │
│  │  4. Parse email body/subject for bill data              │   │
│  │  5. Extract amounts, dates, merchants                   │   │
│  │  6. Categorize bills (utilities, subscriptions, etc.)   │   │
│  │  7. Insert into Supabase bills table                    │   │
│  │  8. Mark emails as processed                            │   │
│  │  9. Post to Discord #transactions                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase (bills table)                   │
│                   Discord (#transactions channel)               │
└─────────────────────────────────────────────────────────────────┘
```

### OAuth Flow (Detailed)

#### Initial Authorization
1. **User clicks "Connect Gmail" button** in Fireside Capital dashboard
2. **Frontend redirects to Google OAuth consent screen:**
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=<CLIENT_ID>
     &redirect_uri=https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/gmail/callback
     &response_type=code
     &scope=https://www.googleapis.com/auth/gmail.readonly
     &access_type=offline
     &prompt=consent
   ```
   - `access_type=offline` — requests refresh token
   - `prompt=consent` — forces consent screen (ensures refresh token is issued)

3. **User grants permission** → Google redirects back with authorization code:
   ```
   https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/gmail/callback?code=<AUTH_CODE>
   ```

4. **Callback handler exchanges code for tokens:**
   ```javascript
   POST https://oauth2.googleapis.com/token
   {
     code: <AUTH_CODE>,
     client_id: <CLIENT_ID>,
     client_secret: <CLIENT_SECRET>,
     redirect_uri: <REDIRECT_URI>,
     grant_type: 'authorization_code'
   }
   ```
   Response:
   ```json
   {
     "access_token": "ya29.a0AfH6...",
     "refresh_token": "1//0g...",
     "expires_in": 3599,
     "scope": "https://www.googleapis.com/auth/gmail.readonly",
     "token_type": "Bearer"
   }
   ```

5. **Store tokens in Supabase:**
   ```javascript
   INSERT INTO user_oauth_tokens (user_id, provider, access_token, refresh_token, token_expiry, scopes)
   VALUES (
     <SUPABASE_USER_ID>,
     'gmail',
     <ACCESS_TOKEN>,
     <REFRESH_TOKEN>,
     NOW() + INTERVAL '3599 seconds',
     ARRAY['https://www.googleapis.com/auth/gmail.readonly']
   )
   ON CONFLICT (user_id, provider) DO UPDATE
   SET access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       token_expiry = EXCLUDED.token_expiry,
       updated_at = NOW();
   ```

#### Token Refresh (Automatic)
Access tokens expire after ~1 hour. The Azure Function must refresh them before each API call:

1. **Check token expiry:**
   ```javascript
   if (tokenExpiry < Date.now() + 5 * 60 * 1000) {
     // Token expires in < 5 minutes, refresh it
   }
   ```

2. **Refresh token request:**
   ```javascript
   POST https://oauth2.googleapis.com/token
   {
     client_id: <CLIENT_ID>,
     client_secret: <CLIENT_SECRET>,
     refresh_token: <REFRESH_TOKEN>,
     grant_type: 'refresh_token'
   }
   ```
   Response:
   ```json
   {
     "access_token": "ya29.a0AfH6...",
     "expires_in": 3599,
     "scope": "https://www.googleapis.com/auth/gmail.readonly",
     "token_type": "Bearer"
   }
   ```
   **Note:** Refresh tokens do NOT expire (unless revoked by user or inactive for 6 months).

3. **Update Supabase:**
   ```javascript
   UPDATE user_oauth_tokens
   SET access_token = <NEW_ACCESS_TOKEN>,
       token_expiry = NOW() + INTERVAL '3599 seconds',
       updated_at = NOW()
   WHERE user_id = <USER_ID> AND provider = 'gmail';
   ```

---

## 4. Email Parsing Pipeline

### Step 1: Query Gmail API for Bill Emails

**Endpoint:** `GET https://gmail.googleapis.com/gmail/v1/users/me/messages`

**Query Parameters:**
```javascript
{
  q: 'subject:(invoice OR bill OR payment OR statement OR receipt) -label:processed-by-fireside newer_than:30d',
  maxResults: 100
}
```

**Filters:**
- `subject:(invoice OR bill OR payment OR statement OR receipt)` — keywords in subject line
- `-label:processed-by-fireside` — exclude already processed emails (using Gmail labels)
- `newer_than:30d` — only emails from last 30 days

**Response:**
```json
{
  "messages": [
    { "id": "18d4f1e2a3b5c6d7", "threadId": "18d4f1e2a3b5c6d7" }
  ],
  "nextPageToken": "..."
}
```

**Rate Limit:** 5 quota units per call. With 15,000 units/min per user, you can make 3,000 calls/min.

### Step 2: Fetch Full Email Content

For each message ID:

**Endpoint:** `GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}?format=full`

**Response:**
```json
{
  "id": "18d4f1e2a3b5c6d7",
  "threadId": "18d4f1e2a3b5c6d7",
  "labelIds": ["INBOX", "UNREAD"],
  "snippet": "Your electric bill is due...",
  "payload": {
    "headers": [
      { "name": "From", "value": "noreply@pepco.com" },
      { "name": "Subject", "value": "Your PEPCO Bill is Ready" },
      { "name": "Date", "value": "Thu, 30 Jan 2026 10:00:00 -0500" }
    ],
    "body": { "data": "base64_encoded_email_body" },
    "parts": [ /* attachments */ ]
  }
}
```

**Rate Limit:** 5 quota units per call.

### Step 3: Parse Bill Data

Use regex and NLP techniques to extract:

#### Amount Due
Patterns:
- `$123.45`
- `Total: $123.45`
- `Amount Due: 123.45`
- `You owe $123.45`

```javascript
const amountRegex = /(?:total|amount due|balance|you owe)[:\s]*\$?([\d,]+\.?\d{0,2})/i;
const match = emailBody.match(amountRegex);
const amount = match ? parseFloat(match[1].replace(',', '')) : null;
```

#### Due Date
Patterns:
- `Due: February 15, 2026`
- `Payment due by 02/15/2026`
- `Pay by Feb 15`

```javascript
const dueDateRegex = /(?:due|pay by|payment date)[:\s]*([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i;
const match = emailBody.match(dueDateRegex);
const dueDate = match ? new Date(match[1]) : null;
```

#### Merchant/Biller Name
Extract from "From" header:
```javascript
const fromHeader = headers.find(h => h.name === 'From').value;
// "PEPCO <noreply@pepco.com>" → "PEPCO"
const merchant = fromHeader.match(/^([^<]+)/)[1].trim();
```

Or use known sender domain mapping:
```javascript
const merchantMap = {
  'pepco.com': 'Pepco (Electric)',
  'verizon.com': 'Verizon',
  'capitalone.com': 'Capital One',
  'discover.com': 'Discover Card',
  // ...add more
};
const domain = fromHeader.match(/@([a-z0-9.-]+)/i)[1];
const merchant = merchantMap[domain] || domain;
```

#### Category
Map merchants to categories:
```javascript
const categoryMap = {
  'Pepco': 'Utilities',
  'Verizon': 'Subscriptions',
  'Capital One': 'Credit Cards',
  'Netflix': 'Subscriptions',
  // ...
};
const category = categoryMap[merchant] || 'Other';
```

#### Account Number (Last 4 Digits)
Pattern:
- `Account ending in 1234`
- `Account: ****1234`

```javascript
const accountRegex = /account[:\s]*(?:\*{4})?(\d{4})/i;
const match = emailBody.match(accountRegex);
const accountLast4 = match ? match[1] : null;
```

### Step 4: Insert into Supabase

```javascript
const { data, error } = await supabase
  .from('bills')
  .upsert({
    user_id: userId,
    name: merchant,
    amount: amount,
    due_date: dueDate,
    frequency: 'monthly', // infer or set default
    category: category,
    auto_pay: false,
    notes: `Auto-parsed from email (${fromHeader})`,
    created_at: new Date()
  }, {
    onConflict: 'user_id,name,due_date' // prevent duplicates
  });
```

### Step 5: Mark Email as Processed

**Option A:** Use Gmail Labels (recommended)
```javascript
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}/modify
{
  "addLabelIds": ["Label_123456789"] // custom label "processed-by-fireside"
}
```

**Option B:** Track in Supabase (fallback)
```javascript
INSERT INTO processed_emails (user_id, email_id, bill_id)
VALUES (<USER_ID>, <EMAIL_ID>, <BILL_ID>);
```

---

## 5. Code Modules

### File Structure
```
C:\Users\chuba\fireside-capital\
├── app/
│   ├── assets/
│   │   └── js/
│   │       ├── gmail-auth.js         [NEW] Frontend OAuth flow
│   │       └── settings-gmail.js     [NEW] Gmail connection UI
│   ├── settings.html                 [MODIFY] Add Gmail connection section
│   └── server.js                     [MODIFY] Add OAuth callback route
├── functions/
│   ├── GmailBillParser/              [NEW] Azure Function
│   │   ├── index.js                  Main function handler
│   │   ├── function.json             Timer trigger config
│   │   ├── gmail-client.js           Gmail API wrapper
│   │   ├── bill-parser.js            Email parsing logic
│   │   └── supabase-client.js        Supabase helpers
│   ├── OAuthCallback/                [NEW] Azure Function
│   │   ├── index.js                  OAuth callback handler
│   │   └── function.json             HTTP trigger config
│   ├── host.json
│   └── package.json
├── scripts/
│   └── setup-gmail-labels.js         [NEW] One-time label creation
└── docs/
    └── gmail-integration-plan.md     [THIS FILE]
```

### Module Descriptions

#### 1. `app/assets/js/gmail-auth.js` (Frontend)
**Purpose:** Initiate OAuth flow when user clicks "Connect Gmail"

```javascript
// Redirect user to Google OAuth consent screen
function connectGmail() {
  const clientId = '<CLIENT_ID>'; // From environment
  const redirectUri = 'https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/gmail/callback';
  const scope = 'https://www.googleapis.com/auth/gmail.readonly';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;
  
  window.location.href = authUrl;
}
```

#### 2. `functions/OAuthCallback/index.js` (Azure Function)
**Purpose:** Exchange authorization code for tokens and store in Supabase

```javascript
module.exports = async function (context, req) {
  const { code, state } = req.query;
  
  if (!code) {
    return { status: 400, body: 'Missing authorization code' };
  }
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  
  const tokens = await tokenResponse.json();
  
  // Store in Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Use service key for admin access
  );
  
  const { error } = await supabase
    .from('user_oauth_tokens')
    .upsert({
      user_id: state, // Pass user ID in state parameter
      provider: 'gmail',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: [tokens.scope]
    });
  
  if (error) {
    context.log.error('Failed to store tokens:', error);
    return { status: 500, body: 'Failed to store tokens' };
  }
  
  // Redirect back to settings page
  return {
    status: 302,
    headers: { Location: 'https://nice-cliff-05b13880f.2.azurestaticapps.net/settings.html?gmail=connected' }
  };
};
```

#### 3. `functions/GmailBillParser/index.js` (Azure Function)
**Purpose:** Scheduled function (daily) to parse bills from Gmail

```javascript
const { gmail } = require('./gmail-client');
const { parseBill } = require('./bill-parser');
const { supabase } = require('./supabase-client');

module.exports = async function (context, myTimer) {
  context.log('Bill parser started');
  
  // Fetch all users with Gmail connected
  const { data: tokens } = await supabase
    .from('user_oauth_tokens')
    .select('*')
    .eq('provider', 'gmail');
  
  for (const token of tokens) {
    try {
      // Refresh token if needed
      const accessToken = await gmail.ensureValidToken(token);
      
      // Query Gmail for bill emails
      const messages = await gmail.searchMessages(accessToken, {
        q: 'subject:(invoice OR bill OR payment) newer_than:7d'
      });
      
      for (const message of messages) {
        // Check if already processed
        const { data: processed } = await supabase
          .from('processed_emails')
          .select('id')
          .eq('user_id', token.user_id)
          .eq('email_id', message.id)
          .single();
        
        if (processed) continue; // Skip already processed
        
        // Fetch full message
        const fullMessage = await gmail.getMessage(accessToken, message.id);
        
        // Parse bill data
        const billData = parseBill(fullMessage);
        
        if (billData) {
          // Insert into bills table
          const { data: bill, error } = await supabase
            .from('bills')
            .insert({
              user_id: token.user_id,
              ...billData
            });
          
          // Mark as processed
          await supabase.from('processed_emails').insert({
            user_id: token.user_id,
            email_id: message.id,
            bill_id: bill.id
          });
          
          context.log(`Parsed bill for user ${token.user_id}: ${billData.name}`);
        }
      }
    } catch (err) {
      context.log.error(`Error processing user ${token.user_id}:`, err);
    }
  }
  
  context.log('Bill parser completed');
};
```

#### 4. `functions/GmailBillParser/gmail-client.js`
**Purpose:** Wrapper for Gmail API calls with token refresh

```javascript
const fetch = require('node-fetch');

async function ensureValidToken(token) {
  // Check if token is still valid (> 5 min remaining)
  const expiresIn = new Date(token.token_expiry) - Date.now();
  if (expiresIn > 5 * 60 * 1000) {
    return token.access_token;
  }
  
  // Refresh token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  
  const newToken = await response.json();
  
  // Update in Supabase
  const { supabase } = require('./supabase-client');
  await supabase
    .from('user_oauth_tokens')
    .update({
      access_token: newToken.access_token,
      token_expiry: new Date(Date.now() + newToken.expires_in * 1000)
    })
    .eq('user_id', token.user_id)
    .eq('provider', 'gmail');
  
  return newToken.access_token;
}

async function searchMessages(accessToken, params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.messages || [];
}

async function getMessage(accessToken, messageId) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.statusText}`);
  }
  
  return await response.json();
}

module.exports = { gmail: { ensureValidToken, searchMessages, getMessage } };
```

#### 5. `functions/GmailBillParser/bill-parser.js`
**Purpose:** Extract bill data from email content

```javascript
function parseBill(gmailMessage) {
  const headers = gmailMessage.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value || '';
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  
  // Decode email body
  const bodyData = gmailMessage.payload.body.data || gmailMessage.payload.parts?.[0]?.body?.data;
  if (!bodyData) return null;
  
  const emailBody = Buffer.from(bodyData, 'base64').toString('utf-8');
  const fullText = subject + ' ' + emailBody;
  
  // Extract amount
  const amountMatch = fullText.match(/(?:total|amount due|balance|you owe)[:\s]*\$?([\d,]+\.?\d{0,2})/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;
  
  // Extract due date
  const dueDateMatch = fullText.match(/(?:due|pay by)[:\s]*([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  const dueDate = dueDateMatch ? new Date(dueDateMatch[1]) : null;
  
  // Extract merchant
  const merchantMatch = from.match(/^([^<]+)/);
  const merchant = merchantMatch ? merchantMatch[1].trim() : from;
  
  // Categorize
  const category = categorizeMerchant(merchant, from);
  
  if (!amount || !dueDate) {
    return null; // Not enough data to create a bill
  }
  
  return {
    name: merchant,
    amount,
    due_date: dueDate,
    frequency: 'monthly',
    category,
    auto_pay: false,
    notes: `Auto-parsed from email (${from})`
  };
}

function categorizeMerchant(merchant, fromEmail) {
  const lowerFrom = fromEmail.toLowerCase();
  
  if (lowerFrom.includes('pepco') || lowerFrom.includes('electric') || lowerFrom.includes('gas')) {
    return 'Utilities';
  }
  if (lowerFrom.includes('netflix') || lowerFrom.includes('spotify') || lowerFrom.includes('adobe')) {
    return 'Subscriptions';
  }
  if (lowerFrom.includes('capitalone') || lowerFrom.includes('discover') || lowerFrom.includes('amex')) {
    return 'Credit Cards';
  }
  if (lowerFrom.includes('verizon') || lowerFrom.includes('att') || lowerFrom.includes('tmobile')) {
    return 'Subscriptions';
  }
  
  return 'Other';
}

module.exports = { parseBill };
```

#### 6. `functions/GmailBillParser/function.json` (Timer Trigger)
**Purpose:** Configure function to run daily at 8 AM

```json
{
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 8 * * *"
    }
  ]
}
```
**Schedule:** `0 0 8 * * *` = 8:00 AM daily (cron format)

---

## 6. Security Design

### Token Storage

#### Option 1: Supabase Database (Recommended for MVP)
- Store tokens in `user_oauth_tokens` table
- Supabase encrypts data at rest by default
- Use Row Level Security (RLS) to ensure users can only access their own tokens
- **Pros:** Simple, already using Supabase, built-in encryption
- **Cons:** Tokens are in the same database as application data

#### Option 2: Azure Key Vault (Production)
- Store tokens in Azure Key Vault (secrets management service)
- Reference tokens by user_id key
- **Pros:** Industry-standard secret management, separate from app data
- **Cons:** Additional Azure service cost, more complex setup

**Recommendation:** Start with Supabase (Option 1), migrate to Key Vault (Option 2) if scaling beyond personal use.

### Token Encryption
Even with database encryption at rest, add application-level encryption for defense in depth:

```javascript
const crypto = require('crypto');

function encryptToken(token) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32-byte key
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decryptToken(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### OAuth Best Practices

1. **Use `state` parameter** to prevent CSRF attacks:
   ```javascript
   const state = crypto.randomBytes(16).toString('hex');
   // Store in session/cookie, verify on callback
   ```

2. **Validate redirect URIs** — only allow whitelisted URIs in Google Cloud Console

3. **Minimize scope** — only request `gmail.readonly` (not full `mail.google.com` access)

4. **Prompt for consent** — use `prompt=consent` to ensure refresh token is issued

5. **Handle token revocation** gracefully:
   ```javascript
   if (response.status === 401) {
     // Token revoked by user, delete from database and notify user
     await supabase.from('user_oauth_tokens').delete().eq('user_id', userId);
     // Send Discord notification: "Gmail connection lost, please reconnect"
   }
   ```

### GDPR/Privacy Compliance

- **Data minimization:** Only store necessary token data, never store full email content
- **User consent:** OAuth consent screen clearly states what data is accessed
- **Right to delete:** Provide "Disconnect Gmail" button that:
  - Revokes tokens via Google API
  - Deletes tokens from Supabase
  - Stops bill parsing for that user
- **Data retention:** Auto-delete tokens if unused for 6 months (Google's policy)

---

## 7. Error Handling

### Gmail API Failures

```javascript
async function safeGmailRequest(requestFn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (err) {
      if (err.status === 429) {
        // Rate limit exceeded, wait and retry
        const backoff = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      if (err.status === 401) {
        // Unauthorized, token invalid
        throw new Error('Token revoked or expired');
      }
      if (err.status >= 500) {
        // Gmail API down, retry
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      throw err; // Other errors, don't retry
    }
  }
  throw new Error('Gmail API request failed after retries');
}
```

### Token Refresh Failures

```javascript
try {
  const accessToken = await ensureValidToken(token);
} catch (err) {
  // Refresh failed, likely revoked by user
  context.log.error(`Token refresh failed for user ${token.user_id}:`, err);
  
  // Delete invalid token
  await supabase.from('user_oauth_tokens').delete().eq('id', token.id);
  
  // Notify user via Discord
  await postToDiscord('#alerts', `⚠️ Gmail connection lost for user ${token.user_id}. Please reconnect.`);
  
  continue; // Skip this user, move to next
}
```

### Email Parsing Failures

```javascript
try {
  const billData = parseBill(fullMessage);
  if (!billData) {
    context.log.warn(`Could not parse bill from email ${message.id}`);
    // Still mark as processed to avoid retrying
    await supabase.from('processed_emails').insert({
      user_id: token.user_id,
      email_id: message.id,
      bill_id: null // No bill created
    });
  }
} catch (err) {
  context.log.error(`Parse error for email ${message.id}:`, err);
  // Do NOT mark as processed, will retry next run
}
```

### Function Timeout

Azure Functions have a default timeout of 5 minutes (free tier). To handle large inboxes:

```javascript
const startTime = Date.now();
const TIMEOUT_MS = 4.5 * 60 * 1000; // 4.5 minutes (leave buffer)

for (const message of messages) {
  if (Date.now() - startTime > TIMEOUT_MS) {
    context.log.warn('Approaching timeout, stopping early');
    break; // Will process remaining emails on next run
  }
  
  // Process message...
}
```

### User Notifications

Post to Discord #alerts channel when issues occur:

```javascript
async function notifyUser(userId, message) {
  // Map Supabase user_id to Discord user or channel
  await postToDiscord('#alerts', `🔔 User ${userId}: ${message}`);
}

// Examples:
await notifyUser(userId, 'Gmail connection lost. Please reconnect at Settings.');
await notifyUser(userId, 'Failed to parse bill from example@merchant.com. Please add manually.');
```

---

## 8. Testing Plan

### Phase 1: Manual Testing (Local)

1. **Setup:**
   - Create test Google Cloud Project
   - Add your personal Gmail as test user
   - Run Azure Functions locally (`func start`)

2. **OAuth Flow Test:**
   - Click "Connect Gmail" button
   - Verify redirect to Google consent screen
   - Grant permission
   - Verify redirect back to app with code
   - Verify tokens stored in Supabase
   - Check `user_oauth_tokens` table has correct data

3. **Email Parsing Test:**
   - Send yourself test bill emails with known patterns:
     - "Your PEPCO bill is $125.50, due February 15, 2026"
     - "Capital One payment of $89.99 due on 2/20/2026"
   - Manually trigger function: `func start` → call timer trigger
   - Verify bills appear in `bills` table
   - Verify `processed_emails` table updated

4. **Token Refresh Test:**
   - Manually set `token_expiry` to past date in database
   - Trigger function
   - Verify new access token fetched and stored

5. **Error Handling Test:**
   - Revoke OAuth permission in Google Account settings
   - Trigger function
   - Verify token deleted and error logged

### Phase 2: Integration Testing (Staging)

1. **Deploy to Azure:**
   - Deploy functions to Azure Function App
   - Configure environment variables
   - Test production OAuth flow

2. **End-to-End Test:**
   - Connect Gmail from production dashboard
   - Wait for scheduled trigger (or manually invoke)
   - Verify bills appear in dashboard

3. **Edge Cases:**
   - Email with no amount → verify skipped
   - Email with malformed date → verify handled
   - 100+ bills in inbox → verify pagination
   - Rate limit hit → verify retry logic

### Phase 3: Production Validation

1. **Monitor first week:**
   - Check Azure Function logs daily
   - Verify bills being parsed correctly
   - Track false positives/negatives

2. **User feedback:**
   - Add "Was this bill correct?" UI in dashboard
   - Iterate on parsing logic based on feedback

3. **Performance:**
   - Monitor function execution time
   - Check Supabase query performance
   - Optimize if > 1000 emails per user

---

## 9. Deployment Steps

### A. Azure Function App Setup

1. **Create Function App:**
   ```powershell
   az functionapp create \
     --name fireside-gmail-parser \
     --resource-group fireside-capital \
     --consumption-plan-location eastus \
     --runtime node \
     --runtime-version 18 \
     --storage-account firesidecapitalstorage \
     --functions-version 4
   ```

2. **Configure Environment Variables:**
   ```powershell
   az functionapp config appsettings set \
     --name fireside-gmail-parser \
     --resource-group fireside-capital \
     --settings \
       GOOGLE_CLIENT_ID="<FROM_GOOGLE_CLOUD>" \
       GOOGLE_CLIENT_SECRET="<FROM_GOOGLE_CLOUD>" \
       OAUTH_REDIRECT_URI="https://fireside-gmail-parser.azurewebsites.net/api/OAuthCallback" \
       SUPABASE_URL="https://qqtiofdqplwycnwplmen.supabase.co" \
       SUPABASE_SERVICE_KEY="<FROM_SUPABASE_SETTINGS>" \
       ENCRYPTION_KEY="<RANDOM_32_BYTE_HEX_STRING>"
   ```

3. **Deploy Functions:**
   ```powershell
   cd C:\Users\chuba\fireside-capital\functions
   func azure functionapp publish fireside-gmail-parser
   ```

### B. Frontend Integration

1. **Update `settings.html`:**
   Add Gmail connection section:
   ```html
   <div class="card">
     <div class="card-header">
       <h5>Gmail Integration</h5>
     </div>
     <div class="card-body">
       <p>Connect your Gmail account to automatically import bills.</p>
       <button id="connectGmailBtn" class="btn btn-primary">Connect Gmail</button>
       <div id="gmailStatus" class="mt-2"></div>
     </div>
   </div>
   ```

2. **Add JavaScript:**
   ```javascript
   document.getElementById('connectGmailBtn').addEventListener('click', () => {
     const clientId = '<GOOGLE_CLIENT_ID>';
     const redirectUri = 'https://fireside-gmail-parser.azurewebsites.net/api/OAuthCallback';
     const scope = 'https://www.googleapis.com/auth/gmail.readonly';
     const userId = supabase.auth.user().id; // Get current user ID
     
     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
       `client_id=${clientId}` +
       `&redirect_uri=${encodeURIComponent(redirectUri)}` +
       `&response_type=code` +
       `&scope=${encodeURIComponent(scope)}` +
       `&access_type=offline` +
       `&prompt=consent` +
       `&state=${userId}`; // Pass user ID for callback
     
     window.location.href = authUrl;
   });
   
   // Check if just connected
   const urlParams = new URLSearchParams(window.location.search);
   if (urlParams.get('gmail') === 'connected') {
     document.getElementById('gmailStatus').innerHTML = 
       '<span class="text-success">✓ Gmail connected successfully!</span>';
   }
   ```

### C. GitHub Actions CI/CD

Add workflow for Azure Functions deployment:

`.github/workflows/deploy-functions.yml`:
```yaml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
    paths:
      - 'functions/**'

jobs:
  deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd functions
          npm install
      
      - name: Deploy to Azure Functions
        uses: Azure/functions-action@v1
        with:
          app-name: 'fireside-gmail-parser'
          package: './functions'
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

---

## 10. Monitoring & Maintenance

### Azure Function Monitoring

1. **Application Insights:**
   - Enable in Azure Portal → Function App → Application Insights
   - Track:
     - Function invocations (should be ~1/day per user)
     - Execution duration (target < 30 seconds per user)
     - Errors/exceptions

2. **Custom Logging:**
   ```javascript
   context.log({
     event: 'bill_parsed',
     user_id: userId,
     merchant: billData.name,
     amount: billData.amount,
     email_id: message.id
   });
   ```

3. **Alerts:**
   - Set up Azure Monitor alerts:
     - Function failure rate > 10%
     - Average execution time > 2 minutes
     - No executions in 25 hours (daily function not running)

### Supabase Monitoring

1. **Database Queries:**
   - Monitor `user_oauth_tokens` table growth
   - Check `processed_emails` table size (could grow large over time)
   - Set up archive/cleanup job for emails > 90 days old

2. **Performance:**
   - Add indexes:
     ```sql
     CREATE INDEX idx_processed_emails_user_email ON processed_emails(user_id, email_id);
     CREATE INDEX idx_user_oauth_tokens_expiry ON user_oauth_tokens(token_expiry);
     ```

### Discord Notifications

Post daily summary to #transactions:

```javascript
// At end of GmailBillParser function
const summary = `📧 **Gmail Bill Parser Report**
- Users processed: ${usersProcessed}
- Bills found: ${billsFound}
- Errors: ${errors.length}
- Runtime: ${(Date.now() - startTime) / 1000}s`;

await postToDiscord('#transactions', summary);
```

### Maintenance Tasks

1. **Weekly:**
   - Review Azure Function logs for parsing errors
   - Check for new merchant patterns to add to parser

2. **Monthly:**
   - Review Gmail API quota usage (should be well under limits)
   - Clean up `processed_emails` table (archive old entries)
   - Update merchant categorization mappings

3. **Quarterly:**
   - Review OAuth consent screen (Google may require re-verification)
   - Update parsing regex patterns based on new bill formats
   - Performance optimization (if user base grows)

---

## 11. Timeline Estimate

### Phase 1: Setup & Research (Completed)
- ✅ Research Gmail API (2 hours)
- ✅ Write implementation plan (3 hours)

**Total: 5 hours**

### Phase 2: Google Cloud Configuration (Founder Task)
- Create Google Cloud Project (15 min)
- Enable Gmail API (5 min)
- Configure OAuth consent screen (20 min)
- Create OAuth credentials (10 min)
- Add test users (5 min)

**Total: 1 hour**

### Phase 3: Database Schema (30 min)
- Create `user_oauth_tokens` table
- Create `processed_emails` table
- Set up RLS policies
- Add indexes

### Phase 4: Azure Functions Development (8 hours)
- OAuth callback handler (2 hours)
- Gmail API client wrapper (2 hours)
- Bill parser logic (2 hours)
- Timer trigger function (1 hour)
- Error handling & logging (1 hour)

### Phase 5: Frontend Integration (2 hours)
- Add Gmail connection UI to settings.html
- Implement OAuth redirect flow
- Add connection status indicator

### Phase 6: Testing (4 hours)
- Local testing (2 hours)
- Integration testing (1 hour)
- Edge case testing (1 hour)

### Phase 7: Deployment (2 hours)
- Deploy Azure Functions
- Configure environment variables
- Set up CI/CD workflow
- Update frontend with production URLs

### Phase 8: Monitoring Setup (1 hour)
- Configure Application Insights
- Set up alerts
- Create Discord notification template

---

**TOTAL ESTIMATED TIME: 23.5 hours**

**Breakdown:**
- Founder tasks: 1 hour
- Development: 12.5 hours
- Testing: 4 hours
- Deployment: 2 hours
- Documentation (already complete): 5 hours

**Timeline:** 3-4 days for single developer working part-time (6-8 hours/day)

---

## 12. Risks & Blockers

### Identified Risks

1. **Google OAuth Verification Required**
   - **Risk:** If app has > 100 users, Google requires OAuth verification (can take 1-2 weeks)
   - **Mitigation:** Start with "Test users" mode (limited to founder's account)
   - **Long-term:** Submit for verification if scaling

2. **Email Parsing Accuracy**
   - **Risk:** Regex patterns may not capture all bill formats
   - **Mitigation:** Start with common merchants, iterate based on failures
   - **Fallback:** Allow manual bill entry for unparseable emails

3. **Gmail API Rate Limits**
   - **Risk:** 15,000 quota units/min per user = ~3,000 `messages.list` calls
   - **Mitigation:** Paginate carefully, cache results, run daily (not hourly)

4. **Token Revocation**
   - **Risk:** Users may revoke Gmail access without notifying app
   - **Mitigation:** Graceful error handling, Discord notification to reconnect

5. **Azure Function Cold Start**
   - **Risk:** First invocation after idle may take 10+ seconds
   - **Mitigation:** Acceptable for daily scheduled task (not user-facing)

6. **GDPR Compliance**
   - **Risk:** Accessing email data triggers strict privacy regulations
   - **Mitigation:** Clear consent screen, data minimization, right to delete

### Blockers

1. **Google Cloud Project Access**
   - **Blocker:** Founder must have Google account with Cloud Console access
   - **Resolution:** Create Google account if needed (free)

2. **Azure Function App Cost**
   - **Blocker:** Azure Functions Consumption Plan requires active subscription
   - **Resolution:** Free tier includes 1M executions/month (sufficient for MVP)

3. **Supabase Service Key**
   - **Blocker:** Need service key for admin-level token storage
   - **Resolution:** Generate in Supabase Dashboard → Settings → API

---

## 13. Success Metrics

### Launch Criteria (MVP)
- ✅ OAuth flow completes successfully
- ✅ At least 1 bill auto-parsed from test email
- ✅ Token refresh works automatically
- ✅ Errors logged and notifications sent
- ✅ No sensitive data exposed in logs

### KPIs (First Month)
- **Parsing accuracy:** > 80% of bill emails correctly parsed
- **Uptime:** > 99% (missed scheduled runs < 1%)
- **User satisfaction:** Founder reports time savings
- **Error rate:** < 5% of emails fail to parse

### Long-Term Goals
- Support 10+ merchant categories
- 95%+ parsing accuracy
- Real-time parsing (via Gmail webhooks/push notifications)
- PDF attachment parsing (OCR for bill PDFs)

---

## 14. Next Steps

### Immediate Actions (Founder)
1. ✅ Review this implementation plan
2. Create Google Cloud Project
3. Enable Gmail API
4. Configure OAuth consent screen
5. Create OAuth credentials
6. Share Client ID and Client Secret with development

### Development Tasks (Connector Agent)
1. Create Supabase schema (tables, RLS, indexes)
2. Scaffold Azure Functions project
3. Implement OAuth callback handler
4. Implement Gmail API client wrapper
5. Implement bill parser logic
6. Add frontend Gmail connection UI
7. Test locally with personal Gmail
8. Deploy to Azure
9. Monitor first week of production usage

### Follow-Up (Week 2)
1. Review parsing accuracy
2. Add new merchant patterns based on failures
3. Implement Discord daily summary report
4. Document common issues and resolutions

---

## 15. Appendix

### A. Useful Commands

**Test Azure Function Locally:**
```powershell
cd C:\Users\chuba\fireside-capital\functions
npm install
func start
```

**Manually Trigger Timer Function:**
```powershell
# From Azure Portal or:
curl -X POST http://localhost:7071/admin/functions/GmailBillParser -H "Content-Type: application/json" -d "{}"
```

**Check Supabase Tokens:**
```powershell
$headers = @{
    "apikey" = "<ANON_KEY>"
    "Authorization" = "Bearer <SERVICE_KEY>"
}
Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/user_oauth_tokens?select=*" -Headers $headers
```

### B. Common Merchant Patterns

| Merchant | Email Domain | Subject Keywords | Category |
|----------|--------------|------------------|----------|
| Pepco | pepco.com | "bill ready", "payment due" | Utilities |
| Verizon | verizon.com | "bill is ready", "payment due" | Subscriptions |
| Capital One | capitalone.com | "statement available", "payment due" | Credit Cards |
| Netflix | netflix.com | "receipt", "billing" | Subscriptions |
| Discover | discover.com | "statement ready", "payment due" | Credit Cards |

### C. Environment Variables Reference

| Variable | Example | Source |
|----------|---------|--------|
| GOOGLE_CLIENT_ID | 123456789-abc.apps.googleusercontent.com | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | GOCSPX-abcd1234 | Google Cloud Console |
| OAUTH_REDIRECT_URI | https://.../api/OAuthCallback | Azure Function URL |
| SUPABASE_URL | https://qqtiofdqplwycnwplmen.supabase.co | Supabase Dashboard |
| SUPABASE_SERVICE_KEY | eyJhbGciOiJIUzI1... | Supabase Dashboard → Settings → API |
| ENCRYPTION_KEY | 64-char hex string | `openssl rand -hex 32` |

### D. Resources

- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Azure Functions JavaScript Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**End of Implementation Plan**

**Status:** Ready for Founder Review  
**Next:** Await Google Cloud Project setup, then begin development
