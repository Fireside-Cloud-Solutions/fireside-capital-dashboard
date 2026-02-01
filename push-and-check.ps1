Set-Location 'C:\Users\chuba\fireside-capital'
git add .github/workflows/azure-static-web-apps-nice-cliff-05b13880f.yml
git commit -m 'fix: try app_location=/ output_location=app for Azure SWA'
git push origin main

Write-Output "Pushed. Waiting 90s for deploy..."
Start-Sleep -Seconds 90

Write-Output "Checking Actions..."
$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/actions/runs?per_page=1' -Headers @{'Accept'='application/vnd.github.v3+json'}
$run = $r.workflow_runs[0]
Write-Output "Status: $($run.status) | Conclusion: $($run.conclusion)"

Write-Output "`nChecking site..."
try {
    $site = Invoke-WebRequest -Uri 'https://nice-cliff-05b13880f.azurestaticapps.net' -UseBasicParsing
    Write-Output "SITE IS LIVE! Status: $($site.StatusCode) Content-Length: $($site.Content.Length)"
} catch {
    Write-Output "Still 404: $($_.Exception.Message)"
}

try {
    $site2 = Invoke-WebRequest -Uri 'https://nice-cliff-05b13880f.azurestaticapps.net/index.html' -UseBasicParsing
    Write-Output "/index.html Status: $($site2.StatusCode)"
} catch {
    Write-Output "/index.html: $($_.Exception.Message)"
}
