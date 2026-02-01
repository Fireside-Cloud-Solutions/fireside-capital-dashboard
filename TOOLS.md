# TOOLS.md — Fireside Capital

## Discord Channels

| Channel | ID | Purpose |
|---------|-----|---------|
| #general | 1467329041421045954 | General chat |
| #commands | 1467330060813074576 | Bot commands & queries |
| #dashboard | 1467330085949276448 | Automated summaries |
| #alerts | 1467330087212028129 | Payment reminders & warnings |
| #transactions | 1467330088017203230 | Transaction imports & categorization |
| #reports | 1467330088923300039 | Weekly/monthly reports |

**Guild ID:** 1467329040217014428

## Supabase Database

- **URL:** https://qqtiofdqplwycnwplmen.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g

### Tables
| Table | Description |
|-------|-------------|
| assets | Real estate, vehicles — value, loan, equity |
| investments | Accounts with balance, contributions, returns |
| debts | Loans with interest, terms, monthly payments |
| bills | Recurring bills with frequency and due dates |
| income | Income sources (W2/1099) with frequency |
| snapshots | Daily net worth snapshots |
| budgets | Monthly budget assignments per item |
| settings | User preferences (emergency fund goal, etc.) |

### Querying Supabase via REST API
```powershell
$headers = @{
    "apikey" = "ANON_KEY"
    "Authorization" = "Bearer ANON_KEY"
}
# Example: Get all bills
Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/bills?select=*" -Headers $headers
```

## Plaid Integration
- **Status:** Sandbox mode
- **Client ID:** In `app/.env`
- **Server:** `app/assets/js/server.js` (Express on port 3000)
- **Products:** auth, transactions

## Web Dashboard
- **App source:** `app/` directory
- **Azure Static Web App:** CI/CD via GitHub Actions
- **Repo:** Fireside-Cloud-Solutions/fireside-capital-dashboard
