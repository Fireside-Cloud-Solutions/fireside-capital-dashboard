# Test Database Constraints
# This script verifies that all CHECK constraints are working correctly

$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Content-Type' = 'application/json'
    'Prefer' = 'return=representation'
}

$testsPassed = 0
$testsFailed = 0

function Test-Constraint {
    param(
        [string]$TestName,
        [string]$Table,
        [hashtable]$Data,
        [bool]$ShouldFail
    )
    
    Write-Host "`nTest: $TestName" -ForegroundColor Yellow
    
    try {
        $body = $Data | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/$Table" `
            -Method Post -Headers $headers -Body $body -ErrorAction Stop
        
        if ($ShouldFail) {
            Write-Host "  ❌ FAILED: Expected constraint violation but insert succeeded" -ForegroundColor Red
            $script:testsFailed++
            
            # Clean up the inserted row
            $id = $response.id
            Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/$Table?id=eq.$id" `
                -Method Delete -Headers $headers -ErrorAction SilentlyContinue
        } else {
            Write-Host "  ✅ PASSED: Insert succeeded as expected" -ForegroundColor Green
            $script:testsPassed++
            
            # Clean up the test row
            $id = $response.id
            Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/$Table?id=eq.$id" `
                -Method Delete -Headers $headers -ErrorAction SilentlyContinue
        }
    }
    catch {
        if ($ShouldFail) {
            Write-Host "  ✅ PASSED: Constraint violation caught as expected" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host "  ❌ FAILED: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
        }
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "    DATABASE CONSTRAINT TESTING SUITE" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Get a valid user_id from existing data
$existingUser = Invoke-RestMethod -Uri "https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/bills?select=user_id&limit=1" -Headers $headers
$userId = if ($existingUser.Count -gt 0) { $existingUser[0].user_id } else { "00000000-0000-0000-0000-000000000000" }

Write-Host "Using test user_id: $userId`n" -ForegroundColor Gray

# ============================================================================
# AMOUNT VALIDATION TESTS
# ============================================================================
Write-Host "`n--- AMOUNT VALIDATION TESTS ---" -ForegroundColor Cyan

Test-Constraint -TestName "Bills: Negative amount should FAIL" -Table "bills" -ShouldFail $true -Data @{
    user_id = $userId
    name = "Test Negative Bill"
    amount = -100
    frequency = "monthly"
    type = "Utilities"
    due_date = "2026-03-01"
}

Test-Constraint -TestName "Bills: Positive amount should PASS" -Table "bills" -ShouldFail $false -Data @{
    user_id = $userId
    name = "Test Valid Bill"
    amount = 100.50
    frequency = "monthly"
    type = "Utilities"
    due_date = "2026-03-01"
}

Test-Constraint -TestName "Debts: Interest rate > 100% should FAIL" -Table "debts" -ShouldFail $true -Data @{
    user_id = $userId
    name = "Test Invalid Debt"
    type = "Credit Card"
    balance = 1000
    interest_rate = 150
    monthly_payment = 50
}

Test-Constraint -TestName "Debts: Valid interest rate should PASS" -Table "debts" -ShouldFail $false -Data @{
    user_id = $userId
    name = "Test Valid Debt"
    type = "Credit Card"
    balance = 1000
    interest_rate = 18.5
    monthly_payment = 50
}

# ============================================================================
# ENUM VALIDATION TESTS
# ============================================================================
Write-Host "`n--- ENUM VALIDATION TESTS ---" -ForegroundColor Cyan

Test-Constraint -TestName "Bills: Invalid frequency should FAIL" -Table "bills" -ShouldFail $true -Data @{
    user_id = $userId
    name = "Test Invalid Frequency"
    amount = 100
    frequency = "every-other-month"
    type = "Utilities"
    due_date = "2026-03-01"
}

Test-Constraint -TestName "Bills: Valid frequency should PASS" -Table "bills" -ShouldFail $false -Data @{
    user_id = $userId
    name = "Test Valid Frequency"
    amount = 100
    frequency = "bi-weekly"
    type = "Utilities"
    due_date = "2026-03-01"
}

Test-Constraint -TestName "Bills: Invalid type should FAIL" -Table "bills" -ShouldFail $true -Data @{
    user_id = $userId
    name = "Test Invalid Type"
    amount = 100
    frequency = "monthly"
    type = "RandomCategory"
    due_date = "2026-03-01"
}

Test-Constraint -TestName "Income: Invalid frequency should FAIL" -Table "income" -ShouldFail $true -Data @{
    user_id = $userId
    source = "Test Income"
    amount = 5000
    frequency = "daily"
    type = "W2"
}

# ============================================================================
# RESULTS SUMMARY
# ============================================================================
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "            TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { 'Green' } else { 'Red' })
Write-Host "================================================`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "All constraints are working correctly! ✨" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some constraints are not working as expected. Review the failures above." -ForegroundColor Red
    exit 1
}
