# Create Azure DevOps Work Item
# Usage: .\create-ado-task.ps1 -Title "Task title" -Description "Task description" -WorkItemType "Task"

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Description,
    
    [Parameter(Mandatory=$false)]
    [string]$WorkItemType = "Task",
    
    [Parameter(Mandatory=$false)]
    [string]$Tags = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Priority = "2"
)

$org = "fireside365"
$project = "Fireside Capital"
$pat = $env:AZURE_DEVOPS_PAT

if (-not $pat) {
    Write-Error "AZURE_DEVOPS_PAT environment variable not set"
    exit 1
}

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$pat"))

$uri = "https://dev.azure.com/$org/$project/_apis/wit/workitems/`$$WorkItemType?api-version=7.1"

$body = @(
    @{
        op = "add"
        path = "/fields/System.Title"
        value = $Title
    },
    @{
        op = "add"
        path = "/fields/System.Description"
        value = $Description
    },
    @{
        op = "add"
        path = "/fields/Microsoft.VSTS.Common.Priority"
        value = $Priority
    }
)

if ($Tags) {
    $body += @{
        op = "add"
        path = "/fields/System.Tags"
        value = $Tags
    }
}

$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json-patch+json"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body ($body | ConvertTo-Json -Depth 10)
    Write-Host "✅ Work item created: #$($response.id) - $($response.fields.'System.Title')" -ForegroundColor Green
    Write-Host "   URL: https://dev.azure.com/$org/$project/_workitems/edit/$($response.id)" -ForegroundColor Cyan
    return $response
} catch {
    Write-Error "Failed to create work item: $_"
    Write-Error $_.Exception.Response.StatusCode
    Write-Error $_.Exception.Response.StatusDescription
    exit 1
}
