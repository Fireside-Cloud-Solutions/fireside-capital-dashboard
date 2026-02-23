# Create Azure DevOps Work Items for Bills UI/UX Audit
# Organization: fireside365
# Project: Fireside Capital

$org = "fireside365"
$project = "Fireside Capital"
$pat = $env:AZURE_DEVOPS_PAT  # Set this environment variable

if (-not $pat) {
    Write-Host "ERROR: AZURE_DEVOPS_PAT environment variable not set" -ForegroundColor Red
    Write-Host "Set it with: `$env:AZURE_DEVOPS_PAT = 'your-pat-token'" -ForegroundColor Yellow
    exit 1
}

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$pat"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json-patch+json"
}

$apiVersion = "7.1"
$baseUri = "https://dev.azure.com/$org/$project/_apis/wit/workitems"

# Work Item 1: Form Validation
$workItem1 = @(
    @{
        op = "add"
        path = "/fields/System.Title"
        value = "Form Validation: Field-level error feedback for Bills page"
    },
    @{
        op = "add"
        path = "/fields/System.Description"
        value = @"
<div>As a user adding a bill, I want clear field-level error messages so I know exactly what to fix.</div>

<h3>PROBLEM:</h3>
<ul>
<li>Required fields lack visual indicators beyond red asterisk</li>
<li>No inline error messages when validation fails</li>
<li>Bootstrap .is-invalid class not applied</li>
<li>Screen readers can't identify which field has errors</li>
</ul>

<h3>SOLUTION:</h3>
<ul>
<li>Add aria-invalid, aria-describedby to all form inputs</li>
<li>Add .invalid-feedback divs below each required field</li>
<li>Real-time validation on blur</li>
<li>WCAG 2.1 compliance (3.3.1, 3.3.3, 3.3.2)</li>
</ul>

<h3>FILES:</h3>
<ul>
<li>bills.html</li>
<li>assets/js/bill-validation.js (new)</li>
</ul>

<p><strong>Effort:</strong> 6 hours<br/>
<strong>Priority:</strong> Critical<br/>
<strong>Audit Reference:</strong> reports/ui-ux-audit-2026-02-23-0611-bills.md Issue #10</p>
"@
    },
    @{
        op = "add"
        path = "/fields/System.AreaPath"
        value = "Fireside Capital\UI-UX"
    },
    @{
        op = "add"
        path = "/fields/System.IterationPath"
        value = "Fireside Capital"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Common.Priority"
        value = 1
    },
    @{
        op = "add"
        path = "/fields/System.Tags"
        value = "accessibility; wcag; forms; critical; bills"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Scheduling.Effort"
        value = 6
    }
)

# Work Item 2: Financing Calculator
$workItem2 = @(
    @{
        op = "add"
        path = "/fields/System.Title"
        value = "Financing Calculator: Real-time feedback for loan fields"
    },
    @{
        op = "add"
        path = "/fields/System.Description"
        value = @"
<div>As a user entering loan details, I want real-time calculation feedback so I know if my data is correct.</div>

<h3>PROBLEM:</h3>
<ul>
<li>Remaining balance shows "?" until all fields filled</li>
<li>No real-time calculation as user types</li>
<li>Users enter wrong values, don't realize until submission</li>
<li>No warnings for unusual interest rates or loan terms</li>
</ul>

<h3>SOLUTION:</h3>
<ul>
<li>Calculate on every input change (not just blur)</li>
<li>Show monthly payment, total interest, remaining balance live</li>
<li>Display warnings for high APR (>20%)</li>
<li>Show info messages for unusual payment ratios</li>
<li>Add aria-live regions for screen readers</li>
</ul>

<h3>FILES:</h3>
<ul>
<li>bills.html (financing fields section)</li>
<li>assets/js/loan-calculator.js</li>
</ul>

<p><strong>Effort:</strong> 4 hours<br/>
<strong>Priority:</strong> Critical<br/>
<strong>Audit Reference:</strong> reports/ui-ux-audit-2026-02-23-0611-bills.md Issue #11</p>
"@
    },
    @{
        op = "add"
        path = "/fields/System.AreaPath"
        value = "Fireside Capital\UI-UX"
    },
    @{
        op = "add"
        path = "/fields/System.IterationPath"
        value = "Fireside Capital"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Common.Priority"
        value = 1
    },
    @{
        op = "add"
        path = "/fields/System.Tags"
        value = "ux; calculator; real-time; critical; bills"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Scheduling.Effort"
        value = 4
    }
)

# Work Item 3: Shared Bill Deletion Safety
$workItem3 = @(
    @{
        op = "add"
        path = "/fields/System.Title"
        value = "Shared Bills: Enhanced deletion confirmation with friend context"
    },
    @{
        op = "add"
        path = "/fields/System.Description"
        value = @"
<div>As a user with shared bills, I want to see who I'm sharing with before deleting so I don't accidentally remove data from their accounts.</div>

<h3>PROBLEM:</h3>
<ul>
<li>Delete modal shows "X other users" but not WHO</li>
<li>No "unshare instead of delete" option</li>
<li>Users accidentally delete bills from friends' accounts</li>
<li>Modal doesn't explain consequences clearly</li>
</ul>

<h3>SOLUTION:</h3>
<ul>
<li>Show list of friend names and emails in delete modal</li>
<li>Add "Unshare Only" button as alternative</li>
<li>Explain what happens to shared data</li>
<li>Add warning about notification (or lack thereof)</li>
<li>Implement unshareBill() function</li>
</ul>

<h3>FILES:</h3>
<ul>
<li>bills.html (shared bill delete modal)</li>
<li>assets/js/shared-bills.js</li>
</ul>

<p><strong>Effort:</strong> 6 hours<br/>
<strong>Priority:</strong> Critical<br/>
<strong>Audit Reference:</strong> reports/ui-ux-audit-2026-02-23-0611-bills.md Issue #12</p>
"@
    },
    @{
        op = "add"
        path = "/fields/System.AreaPath"
        value = "Fireside Capital\UI-UX"
    },
    @{
        op = "add"
        path = "/fields/System.IterationPath"
        value = "Fireside Capital"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Common.Priority"
        value = 1
    },
    @{
        op = "add"
        path = "/fields/System.Tags"
        value = "safety; shared-bills; deletion; critical; bills"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Scheduling.Effort"
        value = 6
    }
)

# Work Item 4: WCAG Compliance - Filter Buttons
$workItem4 = @(
    @{
        op = "add"
        path = "/fields/System.Title"
        value = "WCAG Fix: Filter button group ARIA semantics (Bills page)"
    },
    @{
        op = "add"
        path = "/fields/System.Description"
        value = @"
<div>Fix WCAG 2.1 4.1.2 violation for bill filter buttons (All Bills / Subscriptions Only).</div>

<h3>PROBLEM:</h3>
<ul>
<li>Buttons use aria-pressed but not wrapped in proper radiogroup</li>
<li>Screen readers don't announce as mutually exclusive options</li>
<li>Fails WCAG 2.1 4.1.2 (Name, Role, Value)</li>
</ul>

<h3>SOLUTION:</h3>
<ul>
<li>Replace with Bootstrap radio button group pattern</li>
<li>Use role="radiogroup" wrapper</li>
<li>Use input[type="radio"] + label pattern</li>
<li>Proper aria-label for group</li>
</ul>

<h3>FILES:</h3>
<ul>
<li>bills.html (filter button group)</li>
<li>assets/js/bill-filters.js</li>
</ul>

<p><strong>Effort:</strong> 1 hour<br/>
<strong>Priority:</strong> High<br/>
<strong>Audit Reference:</strong> reports/ui-ux-audit-2026-02-23-0611-bills.md Issue #14</p>
"@
    },
    @{
        op = "add"
        path = "/fields/System.AreaPath"
        value = "Fireside Capital\UI-UX"
    },
    @{
        op = "add"
        path = "/fields/System.IterationPath"
        value = "Fireside Capital"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Common.Priority"
        value = 2
    },
    @{
        op = "add"
        path = "/fields/System.Tags"
        value = "accessibility; wcag; aria; high; bills"
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Scheduling.Effort"
        value = 1
    }
)

# Create work items
$workItems = @(
    @{ Name = "Form Validation"; Body = $workItem1 },
    @{ Name = "Financing Calculator"; Body = $workItem2 },
    @{ Name = "Shared Bill Deletion"; Body = $workItem3 },
    @{ Name = "WCAG Filter Buttons"; Body = $workItem4 }
)

$createdItems = @()

foreach ($item in $workItems) {
    Write-Host "Creating work item: $($item.Name)..." -ForegroundColor Cyan
    
    try {
        $uri = "$baseUri/`$User%20Story?api-version=$apiVersion"
        $body = $item.Body | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        
        $workItemId = $response.id
        $workItemUrl = $response._links.html.href
        
        Write-Host "  ✓ Created: Work Item #$workItemId" -ForegroundColor Green
        Write-Host "    URL: $workItemUrl" -ForegroundColor Gray
        
        $createdItems += @{
            Name = $item.Name
            Id = $workItemId
            Url = $workItemUrl
        }
    }
    catch {
        Write-Host "  ✗ Failed to create work item: $($item.Name)" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "    Response: $responseBody" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Created $($createdItems.Count) of $($workItems.Count) work items" -ForegroundColor White

foreach ($item in $createdItems) {
    Write-Host "  • $($item.Name): #$($item.Id)" -ForegroundColor Green
}

Write-Host "`nView all items: https://dev.azure.com/$org/$project/_workitems" -ForegroundColor Yellow
