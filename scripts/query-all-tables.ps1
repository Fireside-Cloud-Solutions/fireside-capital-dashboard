$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g"
    "Prefer" = "return=representation"
}
$base = "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1"
$tables = @("assets","investments","debts","bills","income","snapshots","budgets","settings")

foreach ($t in $tables) {
    Write-Output "=== TABLE: $t ==="
    try {
        $r = Invoke-RestMethod -Uri "$base/${t}?select=*" -Headers $headers
        if ($r -is [array]) {
            Write-Output "Rows: $($r.Count)"
            if ($r.Count -gt 0) {
                $r | ConvertTo-Json -Depth 5
            }
        } else {
            Write-Output "Rows: 1"
            $r | ConvertTo-Json -Depth 5
        }
    } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
    }
    Write-Output ""
}
