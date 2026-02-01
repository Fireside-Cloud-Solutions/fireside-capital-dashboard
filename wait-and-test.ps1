Write-Output "Waiting 60s for Azure deploy..."
Start-Sleep -Seconds 60
Write-Output "Checking GitHub Actions..."
$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/actions/runs?per_page=1' -Headers @{'Accept'='application/vnd.github.v3+json'}
$run = $r.workflow_runs[0]
Write-Output "Status: $($run.status) | Conclusion: $($run.conclusion) | Commit: $($run.head_commit.message)"
