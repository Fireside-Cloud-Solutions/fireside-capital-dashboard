$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Content-Type' = 'application/json'
}

# Check auth settings first
Write-Output "=== Auth Settings ==="
$settings = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/settings' -Headers $headers
$settings | ConvertTo-Json -Depth 3

# Try signup
Write-Output "`n=== Trying Signup ==="
$body = @{
    email = 'test@firesidecapital.test'
    password = 'TestPassword123!'
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/signup' -Method POST -Headers $headers -Body $body
    Write-Output "Signup response:"
    $r | ConvertTo-Json -Depth 3
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Output "Signup failed ($statusCode)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Output $reader.ReadToEnd()
}
