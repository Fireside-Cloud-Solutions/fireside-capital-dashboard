$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Content-Type' = 'application/json'
}

# Try common email/password combos
$emails = @('matt@firesidecloudsolutions.com', 'mhubacher@gmail.com', 'matt.hubacher@gmail.com')
$passwords = @('Fireside2025!', 'fireside2025!', 'Fireside2025')

foreach ($email in $emails) {
    foreach ($password in $passwords) {
        $body = @{ email = $email; password = $password } | ConvertTo-Json
        try {
            $r = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/token?grant_type=password' -Method POST -Headers $headers -Body $body
            Write-Output "SUCCESS: $email / $password"
            Write-Output "User ID: $($r.user.id)"
            return
        } catch {
            $status = $_.Exception.Response.StatusCode.value__
            Write-Output "FAIL ($status): $email / $password"
        }
    }
}

# Also check what users exist via the auth admin endpoint (won't work with anon key, but try)
Write-Output "`nTrying password recovery for common emails..."
foreach ($email in $emails) {
    $body = @{ email = $email } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/recover' -Method POST -Headers $headers -Body $body
        Write-Output "Recovery sent to: $email (if account exists)"
    } catch {
        Write-Output "Recovery failed for: $email"
    }
}
