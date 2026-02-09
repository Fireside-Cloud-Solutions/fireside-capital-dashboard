# Sprint Research: Azure Functions + Serverless Architecture

**Research Date:** February 9, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** ✅ Complete  
**Use Case:** OpenAI API proxy, transaction processing, scheduled reports, webhook handlers

---

## 📋 Executive Summary

Azure Functions is Microsoft's serverless compute platform for event-driven applications. For Fireside Capital:
- **API proxy** for OpenAI (keep API keys server-side)
- **Scheduled jobs** (daily net worth snapshots, weekly reports)
- **Webhook handlers** (Plaid transactions, Gmail bills)
- **Background processing** (batch categorization, report generation)

**Key Findings:**
- **Consumption Plan:** $0.20 per million executions + $0.000016 per GB-s
- **Typical cost:** $1-5/month for personal finance app
- **Cold start:** 1-3 seconds (acceptable for non-critical APIs)
- **Integration:** Native support for Supabase, OpenAI, Discord, Plaid

---

## 🏗️ Architecture Overview

### Current Setup (Static Web App)
```
User Browser
    ↓ (HTTPS)
Azure Static Web Apps
    ↓ (reads)
Supabase (database)
```

**Limitations:**
- No server-side secrets (API keys exposed in client code)
- No scheduled jobs (must run locally)
- No webhooks (Plaid/Gmail can't notify us)
- No background processing (slow categorization)

### Proposed Architecture (Hybrid)
```
User Browser
    ↓ (HTTPS)
Azure Static Web Apps (frontend)
    ↓ (calls)
Azure Functions (backend)
    ↓ (queries/calls)
├─ Supabase (database)
├─ OpenAI API (categorization)
├─ Plaid API (transactions)
├─ Discord API (notifications)
└─ Gmail API (bill parsing)
```

**Benefits:**
- ✅ Secrets stored server-side (environment variables)
- ✅ Scheduled triggers (cron jobs)
- ✅ Webhook endpoints (Plaid/Gmail)
- ✅ Background processing (queues)

---

## 🔧 Function App Structure

### Recommended Organization
```
fireside-capital-functions/
├── api/
│   ├── categorize/          # OpenAI transaction categorization
│   │   ├── index.js
│   │   └── function.json
│   ├── insights/            # Budget insights generation
│   │   ├── index.js
│   │   └── function.json
│   ├── query/               # Natural language queries
│   │   ├── index.js
│   │   └── function.json
│   └── webhooks/
│       ├── plaid-webhook/   # Plaid transaction notifications
│       │   ├── index.js
│       │   └── function.json
│       └── gmail-webhook/   # Gmail bill notifications
│           ├── index.js
│           └── function.json
├── scheduled/
│   ├── daily-snapshot/      # Net worth snapshot (0 0 * * *)
│   │   ├── index.js
│   │   └── function.json
│   ├── weekly-report/       # Discord weekly summary (0 8 * * MON)
│   │   ├── index.js
│   │   └── function.json
│   └── bill-reminders/      # Daily payment alerts (0 10 * * *)
│       ├── index.js
│       └── function.json
├── shared/                   # Shared utilities
│   ├── supabase.js          # Supabase client
│   ├── openai.js            # OpenAI client
│   ├── discord.js           # Discord embeds
│   └── security.js          # Auth, rate limiting
├── host.json                # Global config
├── local.settings.json      # Local environment variables
└── package.json
```

---

## 🎯 Use Case 1: OpenAI API Proxy

### Why Proxy?
❌ **Problem:** Exposing OpenAI API key in client JavaScript
```javascript
// DON'T DO THIS — API key visible in browser
const OPENAI_API_KEY = 'sk-...'; // Anyone can steal this!
fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
});
```

✅ **Solution:** Azure Function as secure proxy
```javascript
// Client calls Azure Function (no API key exposed)
fetch('https://fireside-capital-api.azurewebsites.net/api/categorize', {
  method: 'POST',
  body: JSON.stringify({ transaction })
});
```

### Implementation

**File:** `api/categorize/index.js`
```javascript
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Environment variables (set in Azure portal)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function (context, req) {
  // CORS headers
  context.res.headers = {
    'Access-Control-Allow-Origin': 'https://nice-cliff-05b13880f.2.azurestaticapps.net',
    'Access-Control-Allow-Methods': 'POST',
    'Content-Type': 'application/json'
  };

  // Validate request
  if (!req.body?.transaction) {
    context.res = { status: 400, body: { error: 'Missing transaction' } };
    return;
  }

  const { transaction, userId } = req.body;

  try {
    // Rate limiting (100 requests/hour per user)
    const rateLimitOk = await checkRateLimit(userId);
    if (!rateLimitOk) {
      context.res = { status: 429, body: { error: 'Rate limit exceeded' } };
      return;
    }

    // Check merchant cache
    const cached = await supabase
      .from('merchant_cache')
      .select('category')
      .eq('merchant_name', transaction.merchant_name)
      .single();

    if (cached.data) {
      context.log(`Cache hit: ${transaction.merchant_name} → ${cached.data.category}`);
      context.res = { status: 200, body: { category: cached.data.category, confidence: 100 } };
      return;
    }

    // Get user's categorization history for few-shot learning
    const history = await supabase
      .from('transactions')
      .select('name, amount, category')
      .eq('user_id', userId)
      .not('category', 'is', null)
      .order('date', { ascending: false })
      .limit(5);

    // Build prompt
    const prompt = buildPrompt(transaction, history.data || []);

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a financial assistant. Return ONLY the category name.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim();
    const confidence = 85; // Could extract from GPT logprobs

    // Cache merchant
    await supabase.from('merchant_cache').upsert({
      merchant_name: transaction.merchant_name,
      category,
      updated_at: new Date().toISOString()
    });

    context.log(`Categorized: ${transaction.name} → ${category}`);
    context.res = { status: 200, body: { category, confidence } };
  } catch (error) {
    context.log.error('Categorization failed:', error);
    context.res = { status: 500, body: { error: 'Categorization failed' } };
  }
};

function buildPrompt(transaction, history) {
  let prompt = `Categorize this transaction into ONE of these categories:
Groceries, Dining, Transportation, Housing, Utilities, Healthcare, Entertainment, Shopping, Income, Other

Transaction:
- Name: ${transaction.name}
- Amount: $${transaction.amount}
- Merchant: ${transaction.merchant_name || 'Unknown'}
`;

  if (history.length > 0) {
    prompt += `\nBased on your previous categorizations:\n`;
    history.forEach(h => {
      prompt += `- "${h.name}" ($${h.amount}) → ${h.category}\n`;
    });
  }

  return prompt;
}

async function checkRateLimit(userId) {
  // Implement with Azure Table Storage or Supabase
  // Return false if user exceeded 100 requests in last hour
  return true; // Simplified
}
```

**File:** `api/categorize/function.json`
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "categorize"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

## 🎯 Use Case 2: Scheduled Jobs (Timer Triggers)

### Daily Net Worth Snapshot

**File:** `scheduled/daily-snapshot/index.js`
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function (context, myTimer) {
  const timestamp = new Date().toISOString();
  context.log('Daily snapshot triggered:', timestamp);

  try {
    // Get all users
    const { data: users } = await supabase
      .from('profiles')
      .select('id');

    for (const user of users) {
      const netWorth = await calculateNetWorth(user.id);
      
      await supabase.from('snapshots').insert({
        user_id: user.id,
        net_worth: netWorth,
        created_at: timestamp
      });

      context.log(`Snapshot saved for user ${user.id}: $${netWorth}`);
    }

    context.res = { status: 200, body: `Snapshots created for ${users.length} users` };
  } catch (error) {
    context.log.error('Snapshot failed:', error);
    context.res = { status: 500, body: 'Snapshot failed' };
  }
};

async function calculateNetWorth(userId) {
  // Fetch assets, investments, debts
  const [assets, investments, debts] = await Promise.all([
    supabase.from('assets').select('value, loan').eq('user_id', userId),
    supabase.from('investments').select('balance').eq('user_id', userId),
    supabase.from('debts').select('balance').eq('user_id', userId).eq('status', 'active')
  ]);

  const assetTotal = assets.data.reduce((sum, a) => sum + (a.value - a.loan), 0);
  const investmentTotal = investments.data.reduce((sum, i) => sum + i.balance, 0);
  const debtTotal = debts.data.reduce((sum, d) => sum + d.balance, 0);

  return assetTotal + investmentTotal - debtTotal;
}
```

**File:** `scheduled/daily-snapshot/function.json`
```json
{
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**CRON Schedule Reference:**
| Schedule | Description |
|----------|-------------|
| `0 0 * * *` | Daily at midnight UTC |
| `0 8 * * MON` | Monday at 8 AM UTC |
| `0 10 * * *` | Daily at 10 AM UTC |
| `0 0 1 * *` | First day of every month |

---

### Weekly Discord Report

**File:** `scheduled/weekly-report/index.js`
```javascript
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function (context, myTimer) {
  context.log('Weekly report triggered');

  try {
    const userId = process.env.PRIMARY_USER_ID; // Matt's user ID

    // Get week's data
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [transactions, netWorth] = await Promise.all([
      supabase.from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStart.toISOString()),
      
      supabase.from('snapshots')
        .select('net_worth, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(7)
    ]);

    // Generate insights with GPT-4
    const insights = await generateWeeklyInsights(transactions.data, netWorth.data);

    // Post to Discord
    await postToDiscord({
      channel: process.env.DISCORD_REPORTS_CHANNEL,
      embed: {
        color: 0x01a4ef,
        title: '📊 Weekly Financial Summary',
        fields: [
          {
            name: '💰 Net Worth',
            value: `**$${netWorth.data[0].net_worth.toLocaleString()}**\n${getNetWorthChange(netWorth.data)}`,
            inline: true
          },
          {
            name: '💳 Transactions',
            value: `${transactions.data.length} transactions\n$${getTotalSpent(transactions.data)} spent`,
            inline: true
          },
          {
            name: '💡 Insights',
            value: insights.map(i => `• ${i}`).join('\n'),
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      }
    });

    context.log('Weekly report posted to Discord');
  } catch (error) {
    context.log.error('Weekly report failed:', error);
  }
};

async function generateWeeklyInsights(transactions, netWorthHistory) {
  const prompt = `Analyze this week's financial data and provide 3 brief insights:

Transactions: ${transactions.length} (total: $${getTotalSpent(transactions)})
Net worth change: ${getNetWorthChange(netWorthHistory)}

Top categories:
${getCategoryBreakdown(transactions)}

Return 3 insights as JSON array of strings.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are a personal CFO. Be concise and actionable.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 200
  });

  return JSON.parse(response.choices[0].message.content);
}

function getTotalSpent(transactions) {
  return transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
}

function getNetWorthChange(history) {
  if (history.length < 2) return 'No change';
  const current = history[0].net_worth;
  const weekAgo = history[6]?.net_worth || history[history.length - 1].net_worth;
  const change = current - weekAgo;
  const percent = ((change / weekAgo) * 100).toFixed(1);
  const arrow = change > 0 ? '↗️' : '↘️';
  return `${arrow} ${change > 0 ? '+' : ''}$${Math.abs(change).toLocaleString()} (${percent}%)`;
}

function getCategoryBreakdown(transactions) {
  const categories = {};
  transactions.forEach(t => {
    if (!categories[t.category]) categories[t.category] = 0;
    categories[t.category] += t.amount;
  });
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
    .join('\n');
}

async function postToDiscord({ channel, embed }) {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  
  await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ embeds: [embed] })
  });
}
```

**File:** `scheduled/weekly-report/function.json`
```json
{
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 8 * * MON"
    }
  ]
}
```

---

## 🎯 Use Case 3: Webhook Handlers

### Plaid Transaction Webhook

**File:** `api/webhooks/plaid-webhook/index.js`
```javascript
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function (context, req) {
  // Verify webhook signature
  const signature = req.headers['plaid-verification'];
  const isValid = verifyPlaidSignature(req.body, signature);
  
  if (!isValid) {
    context.res = { status: 401, body: 'Invalid signature' };
    return;
  }

  const { webhook_type, webhook_code, item_id } = req.body;

  context.log('Plaid webhook:', webhook_type, webhook_code);

  try {
    if (webhook_code === 'DEFAULT_UPDATE') {
      // New transactions available
      await importNewTransactions(item_id);
      
      // Categorize with OpenAI
      await categorizeRecentTransactions(item_id);
      
      // Post to Discord #transactions
      await notifyDiscord(`📥 New transactions imported from Plaid`);
    }

    context.res = { status: 200, body: 'Webhook processed' };
  } catch (error) {
    context.log.error('Webhook processing failed:', error);
    context.res = { status: 500, body: 'Processing failed' };
  }
};

function verifyPlaidSignature(body, signature) {
  const secret = process.env.PLAID_WEBHOOK_VERIFICATION_KEY;
  const computed = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return computed === signature;
}

async function importNewTransactions(itemId) {
  // Fetch transactions from Plaid
  // Insert into Supabase
  // (Implementation omitted for brevity)
}

async function categorizeRecentTransactions(itemId) {
  // Fetch uncategorized transactions
  // Call /api/categorize for each
  // Update with categories
}

async function notifyDiscord(message) {
  // Post to #transactions channel
}
```

**File:** `api/webhooks/plaid-webhook/function.json`
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "webhooks/plaid"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

## ⚙️ Configuration Files

### host.json (Global Settings)
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "functionTimeout": "00:05:00"
}
```

### local.settings.json (Local Development)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "OPENAI_API_KEY": "sk-...",
    "SUPABASE_URL": "https://qqtiofdqplwycnwplmen.supabase.co",
    "SUPABASE_SERVICE_KEY": "eyJ...",
    "DISCORD_BOT_TOKEN": "MTQ2...",
    "DISCORD_REPORTS_CHANNEL": "1467330088923300039",
    "DISCORD_TRANSACTIONS_CHANNEL": "1467330088017203230",
    "DISCORD_ALERTS_CHANNEL": "1467330087212028129",
    "PLAID_CLIENT_ID": "...",
    "PLAID_SECRET": "...",
    "PLAID_WEBHOOK_VERIFICATION_KEY": "...",
    "PRIMARY_USER_ID": "..."
  }
}
```

⚠️ **Never commit this file!** Add to `.gitignore`.

---

## 🚀 Deployment

### Option 1: Azure Portal (GUI)
1. Create Function App in Azure Portal
2. Choose **Consumption** plan (pay-per-use)
3. Runtime: **Node.js 20**
4. Region: **East US** (closest to you)
5. Deploy via VS Code Azure Functions extension

### Option 2: Azure CLI (Automated)
```bash
# Login
az login

# Create resource group
az group create --name fireside-capital-rg --location eastus

# Create storage account (required)
az storage account create \
  --name firesidecapitalstorage \
  --resource-group fireside-capital-rg \
  --location eastus \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --name fireside-capital-api \
  --resource-group fireside-capital-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --storage-account firesidecapitalstorage \
  --functions-version 4

# Set environment variables
az functionapp config appsettings set \
  --name fireside-capital-api \
  --resource-group fireside-capital-rg \
  --settings \
    OPENAI_API_KEY="sk-..." \
    SUPABASE_URL="https://..." \
    SUPABASE_SERVICE_KEY="eyJ..."

# Deploy code
cd fireside-capital-functions
func azure functionapp publish fireside-capital-api
```

### Option 3: GitHub Actions (CI/CD)
```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Azure Functions

on:
  push:
    branches: [main]
    paths:
      - 'functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd functions
          npm ci
      
      - name: Deploy to Azure
        uses: Azure/functions-action@v1
        with:
          app-name: fireside-capital-api
          package: functions
          publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

---

## 💰 Cost Analysis

### Consumption Plan Pricing
- **Execution:** $0.20 per million executions
- **Compute:** $0.000016 per GB-second
- **Free grant:** 400,000 GB-s + 1 million executions/month

### Estimated Monthly Costs

**Scenario: Personal Finance App (1 user)**
| Function | Invocations/month | Avg Duration | Cost |
|----------|-------------------|--------------|------|
| Categorization (manual) | 100 | 2s @ 512MB | $0.00002 |
| Categorization (webhook) | 500 | 2s @ 512MB | $0.0001 |
| Daily snapshot | 30 | 5s @ 256MB | $0.000002 |
| Weekly report | 4 | 10s @ 512MB | $0.000001 |
| Bill reminders | 30 | 3s @ 256MB | $0.000001 |
| Plaid webhooks | 50 | 8s @ 512MB | $0.00001 |
| **TOTAL** | **714** | — | **$0.00014** |

**Real-world cost:** ~$0.01/month (well within free tier)

**Scaling to 100 users:** ~$1/month  
**Scaling to 1000 users:** ~$10/month

---

## 🔒 Security Best Practices

### 1. Managed Identity (AAD)
```javascript
// Use Azure Managed Identity instead of connection strings
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const credential = new DefaultAzureCredential();
const vaultUrl = 'https://fireside-capital-vault.vault.azure.net';
const client = new SecretClient(vaultUrl, credential);

const openaiKey = await client.getSecret('openai-api-key');
```

### 2. Function-Level Authorization
```javascript
// function.json — require function key
{
  "authLevel": "function", // Not "anonymous"
  "type": "httpTrigger"
}

// Client must include function key in URL
fetch('https://fireside-capital-api.azurewebsites.net/api/categorize?code=ABC123...')
```

### 3. CORS Restrictions
```json
// host.json
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": [
          "https://nice-cliff-05b13880f.2.azurestaticapps.net"
        ],
        "supportCredentials": true
      }
    }
  }
}
```

---

## 📊 Monitoring & Debugging

### Application Insights (Built-in)
```javascript
// Automatic logging
context.log('Info message');
context.log.warn('Warning message');
context.log.error('Error message');

// Custom metrics
context.log.metric('CategoryAccuracy', 0.92);
context.log.metric('APILatency', 145);
```

### Query Logs in Azure Portal
```kusto
// Find errors in last 24 hours
traces
| where timestamp > ago(24h)
| where severityLevel >= 3
| project timestamp, message, operation_Name

// Track categorization accuracy
customMetrics
| where name == "CategoryAccuracy"
| summarize avg(value) by bin(timestamp, 1h)
```

---

## 🎯 Next Steps

### Phase 1: Setup (2 hours)
1. Create Azure Function App via portal or CLI
2. Install Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`
3. Create project: `func init fireside-capital-functions --javascript`
4. Set environment variables in Azure portal
5. Test locally: `func start`

### Phase 2: Build Functions (12 hours)
1. Implement `/api/categorize` (OpenAI proxy)
2. Implement `/scheduled/daily-snapshot` (net worth)
3. Implement `/scheduled/weekly-report` (Discord)
4. Test each function individually

### Phase 3: Deploy & Monitor (2 hours)
1. Deploy to Azure: `func azure functionapp publish fireside-capital-api`
2. Verify CORS settings
3. Test from live web app
4. Monitor Application Insights for errors

---

## 📚 Reference Links

- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Consumption Plan Pricing](https://azure.microsoft.com/en-us/pricing/details/functions/)
- [Timer Trigger CRON Reference](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer?tabs=python-v2%2Cisolated-process%2Cnodejs-v4&pivots=programming-language-javascript#ncrontab-expressions)
- [Best Practices](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [Application Insights](https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring)

---

## 💡 Key Takeaways

1. **Consumption Plan is perfect** for personal finance apps (under free tier)
2. **Cold starts (1-3s)** are acceptable for non-critical APIs
3. **Environment variables** keep secrets secure (no hardcoded keys)
4. **Timer triggers** enable fully automated workflows (snapshots, reports)
5. **Webhooks** enable real-time integrations (Plaid, Gmail)
6. **Application Insights** provides automatic monitoring (no setup needed)

---

**Next Research Topic:** React Native + Expo Architecture (if mobile app approved)

---

**Compiled by:** Capital (Orchestrator)  
**Date:** February 9, 2026  
**Status:** Ready for implementation  
**Estimated Setup Time:** 16 hours (setup + 3 core functions)
