# Create Azure DevOps Work Items via REST API
# Organization: fireside365
# Project: Fireside Capital

param(
    [string]$PAT = $env:AZURE_DEVOPS_PAT # Personal Access Token from environment
)

$org = "fireside365"
$project = "Fireside Capital"
$apiVersion = "7.0"

# Base64 encode PAT for authentication
if (!$PAT) {
    Write-Host "ERROR: AZURE_DEVOPS_PAT environment variable not set" -ForegroundColor Red
    Write-Host "Set it with: `$env:AZURE_DEVOPS_PAT = 'your-pat-token'" -ForegroundColor Yellow
    exit 1
}

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$PAT"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json-patch+json"
}

$baseUrl = "https://dev.azure.com/$org/$project/_apis/wit/workitems"

# Define bugs to create
$bugs = @(
    @{
        Title = "[P0] Table header/body column mismatch (transactions.html)"
        Description = "The transaction table has mismatched columns between header and body, causing semantic HTML errors and layout issues. Affects accessibility and data display."
        Priority = 1
        Effort = 2
        Tags = "P0;Bug;Frontend;Transactions"
        Type = "Bug"
    },
    @{
        Title = "[P0] Extract remaining transaction logic from app.js to transactions.js"
        Description = "Transaction logic is split between app.js (monolithic) and transactions.js (modular). This creates maintenance issues and code duplication. All transaction logic should be in transactions.js."
        Priority = 1
        Effort = 4
        Tags = "P0;Technical-Debt;Architecture;JavaScript"
        Type = "Bug"
    },
    @{
        Title = "[P0] No transaction data visible (verify database)"
        Description = "The transactions page loads but shows no data. Possible causes: empty database, broken query, authentication issue, or missing Plaid integration data."
        Priority = 1
        Effort = 2
        Tags = "P0;Bug;Data;Transactions"
        Type = "Bug"
    },
    @{
        Title = "[P0] Create dedicated friends.js module (refactor from app.js)"
        Description = "All Friends page logic (4000+ lines) is embedded in monolithic app.js. This creates severe maintenance issues. Extract to dedicated friends.js module following established architecture pattern."
        Priority = 1
        Effort = 8
        Tags = "P0;Technical-Debt;Architecture;JavaScript"
        Type = "Bug"
    },
    @{
        Title = "[P0] Add remove friend button (Friends page)"
        Description = "Friends page missing critical 'Remove Friend' button. Users cannot remove connections once added. Required for basic friendship management."
        Priority = 1
        Effort = 2
        Tags = "P0;Feature;Frontend;Friends"
        Type = "Bug"
    },
    @{
        Title = "[P0] Add cancel outgoing request button (Friends page)"
        Description = "Friends page missing 'Cancel Request' button for outgoing friend requests. Users cannot retract sent requests. Required for request management."
        Priority = 1
        Effort = 2
        Tags = "P0;Feature;Frontend;Friends"
        Type = "Bug"
    },
    @{
        Title = "[P0] Add reject incoming request button (Friends page)"
        Description = "Friends page missing 'Reject Request' button for incoming friend requests. Users can only accept, not decline. Required for complete request workflow."
        Priority = 1
        Effort = 2
        Tags = "P0;Feature;Frontend;Friends"
        Type = "Bug"
    },
    @{
        Title = "[P0] No friend data visible (verify database)"
        Description = "The Friends page loads but shows no data. Possible causes: empty database, broken query, authentication issue, or missing friend relationships."
        Priority = 1
        Effort = 2
        Tags = "P0;Bug;Data;Friends"
        Type = "Bug"
    },
    @{
        Title = "[P0] Create dedicated budget.js module (refactor from app.js)"
        Description = "All Budget page logic is embedded in monolithic app.js. Extract to dedicated budget.js module following established architecture pattern (similar to dashboard.js, assets.js)."
        Priority = 1
        Effort = 6
        Tags = "P0;Technical-Debt;Architecture;JavaScript"
        Type = "Bug"
    },
    @{
        Title = "[P0] Add delete budget item button (Budget page)"
        Description = "Budget page missing 'Delete' button for budget items. Users cannot remove budget entries once created. Required for basic budget management."
        Priority = 1
        Effort = 2
        Tags = "P0;Feature;Frontend;Budget"
        Type = "Bug"
    },
    @{
        Title = "[P1] Remove 159 console statements from production code"
        Description = "159 console.log/warn/error statements found across 11 JavaScript files. These create performance overhead, expose internal logic, and are unprofessional in production. Files: app.js (42), dashboard.js (28), assets.js (19), bills.js (15), debts.js (12), investments.js (11), income.js (9), transactions.js (8), settings.js (7), reports.js (5), security-utils.js (3)."
        Priority = 2
        Effort = 8
        Tags = "P1;Bug;JavaScript;Performance;Security"
        Type = "Bug"
    },
    @{
        Title = "[P2] Replace 57 alert() calls with toast notifications"
        Description = "57 blocking alert() calls throughout the codebase create poor UX (especially on mobile) and use an outdated pattern. Refactor to modern toast notification system. Decision needed: integrate existing toast-notifications.js (8.3 KB) or use Bootstrap toasts."
        Priority = 3
        Effort = 10
        Tags = "P2;Bug;UX;JavaScript"
        Type = "Bug"
    },
    @{
        Title = "[P2] Remove dead code: toast-notifications.js (8.3 KB unused)"
        Description = "File exists but is never imported or used. Creates wasted bandwidth and maintenance confusion. Decision needed: integrate into app OR delete entirely."
        Priority = 3
        Effort = 2
        Tags = "P2;Bug;JavaScript;Cleanup"
        Type = "Bug"
    }
)

Write-Host "`n=== Creating Azure DevOps Work Items ===" -ForegroundColor Green
Write-Host "Organization: $org" -ForegroundColor Yellow
Write-Host "Project: $project" -ForegroundColor Yellow
Write-Host "Total Bugs: $($bugs.Count)`n" -ForegroundColor Yellow

$createdItems = @()
$failedItems = @()

foreach ($bug in $bugs) {
    Write-Host "Creating: $($bug.Title)..." -ForegroundColor Cyan
    
    # Build JSON-Patch document
    $body = @(
        @{
            op = "add"
            path = "/fields/System.Title"
            value = $bug.Title
        },
        @{
            op = "add"
            path = "/fields/System.Description"
            value = $bug.Description
        },
        @{
            op = "add"
            path = "/fields/Microsoft.VSTS.Common.Priority"
            value = $bug.Priority
        },
        @{
            op = "add"
            path = "/fields/Microsoft.VSTS.Scheduling.Effort"
            value = $bug.Effort
        },
        @{
            op = "add"
            path = "/fields/System.Tags"
            value = $bug.Tags
        }
    ) | ConvertTo-Json -Depth 10
    
    try {
        $url = "$baseUrl/`$$($bug.Type)?api-version=$apiVersion"
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
        
        $createdItems += [PSCustomObject]@{
            ID = $response.id
            Title = $bug.Title
            Priority = "P$($bug.Priority - 1)" # Convert 1→P0, 2→P1, etc.
            URL = $response._links.html.href
        }
        
        Write-Host "  ✓ Created: Work Item #$($response.id)" -ForegroundColor Green
        
    } catch {
        $failedItems += $bug.Title
        Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500 # Rate limiting
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Created: $($createdItems.Count)" -ForegroundColor Green
Write-Host "Failed: $($failedItems.Count)" -ForegroundColor Red

if ($createdItems.Count -gt 0) {
    Write-Host "`n=== Created Work Items ===" -ForegroundColor Green
    $createdItems | Format-Table -AutoSize
    
    # Save to file
    $reportPath = "C:\Users\chuba\fireside-capital\reports\devops-bugs-created-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"
    $report = @"
# Azure DevOps Work Items Created — $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

**Organization:** $org  
**Project:** $project  
**Total Created:** $($createdItems.Count)

## Work Items

| ID | Priority | Title | URL |
|----|----------|-------|-----|
"@
    
    foreach ($item in $createdItems) {
        $report += "`n| #$($item.ID) | $($item.Priority) | $($item.Title) | $($item.URL) |"
    }
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`nReport saved: $reportPath" -ForegroundColor Green
}

if ($failedItems.Count -gt 0) {
    Write-Host "`n=== Failed Items ===" -ForegroundColor Red
    $failedItems | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
