# Fireside Capital — Azure Functions API

This directory contains Azure Functions that provide serverless API endpoints for the Fireside Capital dashboard.

## Functions

### `/api/scan-email-bills`

Scans Gmail for bill-related emails and parses them into structured data.

**Method:** `GET` or `POST`

**Parameters:**
- `days` (optional) — Number of days to look back (default: 30)
- `maxResults` (optional) — Maximum number of emails to scan (default: 100)
- `minConfidence` (optional) — Minimum confidence score to include (default: 0.4)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "bills": [
    {
      "vendor": "AT&T",
      "amount": 85.50,
      "due_date": "2026-02-15",
      "category": "utilities",
      "source_email_id": "...",
      "confidence": 0.85
    }
  ],
  "scanned": {
    "days": 30,
    "emailCount": 45,
    "billCount": 5
  }
}
```

## Environment Variables

The following environment variables must be set in **Azure Static Web Apps Configuration** (Settings → Configuration):

### Gmail OAuth 2.0
- `GMAIL_CLIENT_ID` — Google OAuth 2.0 Client ID
- `GMAIL_CLIENT_SECRET` — Google OAuth 2.0 Client Secret
- `GMAIL_REDIRECT_URI` — OAuth redirect URI (e.g., `https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/google/callback`)
- `GMAIL_REFRESH_TOKEN` — OAuth refresh token (obtained after initial authorization)

### Node.js Environment
- `NODE_ENV` — Set to `production` for production deployment

## Setting Up Gmail OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for local testing)
   - `https://nice-cliff-05b13880f.2.azurestaticapps.net/auth/google/callback` (for production)
6. Copy the Client ID and Client Secret
7. Run the OAuth flow locally to obtain a refresh token:
   ```bash
   cd app
   node integrations/gmail/gmail-client.js
   ```
8. Add all credentials to Azure Static Web Apps Configuration

## Local Development

To test the API locally:

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Navigate to the api directory
cd app/api

# Install dependencies
npm install

# Start the local function runtime
func start
```

The API will be available at `http://localhost:7071/api/scan-email-bills`.

## Deployment

The API is automatically deployed to Azure Static Web Apps when changes are pushed to the `main` branch.

Azure Static Web Apps automatically:
- Detects the `api` directory
- Builds the Azure Functions
- Deploys them alongside the static web app
- Routes `/api/*` requests to the functions

## Debugging

View function logs in Azure Portal:
1. Go to Azure Portal
2. Navigate to the Static Web App resource
3. Select "Log stream" or "Application Insights"
4. View real-time logs from function executions
