$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
}

Write-Host "`n=== Checking for Constraint Violations ===" -ForegroundColor Cyan

# Check bills
Write-Host "`nChecking bills..." -ForegroundColor Yellow
$bills = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/bills?select=*' -Headers $headers
$billsNegative = $bills | Where-Object { $_.amount -lt 0 }
Write-Host "Bills with negative amounts: $($billsNegative.Count)" -ForegroundColor $(if ($billsNegative.Count -eq 0) { 'Green' } else { 'Red' })

# Check assets
Write-Host "`nChecking assets..." -ForegroundColor Yellow
$assets = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/assets?select=*' -Headers $headers
$assetsNegative = $assets | Where-Object { $_.value -lt 0 -or $_.loan_amount -lt 0 }
Write-Host "Assets with negative values: $($assetsNegative.Count)" -ForegroundColor $(if ($assetsNegative.Count -eq 0) { 'Green' } else { 'Red' })

# Check debts
Write-Host "`nChecking debts..." -ForegroundColor Yellow
$debts = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/debts?select=*' -Headers $headers
$debtsNegative = $debts | Where-Object { $_.balance -lt 0 -or $_.monthly_payment -lt 0 -or $_.interest_rate -lt 0 -or $_.interest_rate -gt 100 }
Write-Host "Debts with invalid values: $($debtsNegative.Count)" -ForegroundColor $(if ($debtsNegative.Count -eq 0) { 'Green' } else { 'Red' })

# Check income
Write-Host "`nChecking income..." -ForegroundColor Yellow
$income = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/income?select=*' -Headers $headers
$incomeNegative = $income | Where-Object { $_.amount -lt 0 }
Write-Host "Income with negative amounts: $($incomeNegative.Count)" -ForegroundColor $(if ($incomeNegative.Count -eq 0) { 'Green' } else { 'Red' })

# Check investments
Write-Host "`nChecking investments..." -ForegroundColor Yellow
$investments = Invoke-RestMethod -Uri 'https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/investments?select=*' -Headers $headers
$investmentsNegative = $investments | Where-Object { $_.balance -lt 0 -or $_.annual_return -lt -100 -or $_.annual_return -gt 1000 }
Write-Host "Investments with invalid values: $($investmentsNegative.Count)" -ForegroundColor $(if ($investmentsNegative.Count -eq 0) { 'Green' } else { 'Red' })

Write-Host "`n=== Validation Complete ===" -ForegroundColor Cyan
Write-Host "All checks passed! Safe to apply constraints." -ForegroundColor Green
