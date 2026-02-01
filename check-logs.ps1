# Get the latest run's jobs
$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/actions/runs?per_page=1' -Headers @{'Accept'='application/vnd.github.v3+json'}
$runId = $r.workflow_runs[0].id
Write-Output "Run ID: $runId"

# Get jobs for this run
$jobs = Invoke-RestMethod -Uri "https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/actions/runs/$runId/jobs" -Headers @{'Accept'='application/vnd.github.v3+json'}
foreach ($job in $jobs.jobs) {
    Write-Output "`nJob: $($job.name) - $($job.status) - $($job.conclusion)"
    foreach ($step in $job.steps) {
        Write-Output "  Step: $($step.name) - $($step.status) - $($step.conclusion)"
    }
}

# Get the logs URL
$logsUrl = "https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/actions/runs/$runId/logs"
Write-Output "`nLogs URL: $logsUrl"

# List files in app/ to verify structure
Write-Output "`nFiles in repo app/ directory:"
$tree = Invoke-RestMethod -Uri 'https://api.github.com/repos/Fireside-Cloud-Solutions/fireside-capital-dashboard/git/trees/main?recursive=1' -Headers @{'Accept'='application/vnd.github.v3+json'}
$tree.tree | Where-Object { $_.path -like "app/*" -and $_.path -notlike "app/node_modules/*" -and $_.type -eq "blob" } | ForEach-Object { Write-Output "  $($_.path)" }
