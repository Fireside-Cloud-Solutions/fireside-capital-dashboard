$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Content-Type' = 'application/json'
}

# Sign in
$body = '{"email":"matt@firesidecloudsolutions.com","password":"Fireside2025!"}'
$auth = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/auth/v1/token?grant_type=password' -Method Post -Headers $headers -Body $body
$token = $auth.access_token
Write-Host "Token obtained: $($token.Substring(0,20))..."

$authHeaders = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Fetch existing bills
$bills = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/bills?select=*&user_id=eq.8b6aca68-6072-457d-8053-7e81e41bfef3' -Headers $authHeaders
Write-Host "=== EXISTING BILLS ==="
$bills | ConvertTo-Json -Depth 5

# Check budgets table schema
Write-Host "`n=== BUDGETS TABLE ==="
$budgets = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/budgets?select=*&limit=1' -Headers $authHeaders
$budgets | ConvertTo-Json -Depth 5
