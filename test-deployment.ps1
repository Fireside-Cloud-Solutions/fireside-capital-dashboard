# Test script for Phase 1 Gmail Bill Integration Deployment
# Tests the live site: https://nice-cliff-05b13880f.2.azurestaticapps.net

Write-Host "=== PHASE 1 DEPLOYMENT TEST ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://nice-cliff-05b13880f.2.azurestaticapps.net"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$TestName,
        [string]$ExpectedContent
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($ExpectedContent) {
            if ($response.Content -match $ExpectedContent) {
                Write-Host "[PASS] $TestName" -ForegroundColor Green
                return @{ Test = $TestName; Result = "PASS"; Details = "Found: $ExpectedContent" }
            } else {
                Write-Host "[FAIL] $TestName - Content not found" -ForegroundColor Red
                return @{ Test = $TestName; Result = "FAIL"; Details = "Missing: $ExpectedContent" }
            }
        } else {
            Write-Host "[PASS] $TestName - Status $($response.StatusCode)" -ForegroundColor Green
            return @{ Test = $TestName; Result = "PASS"; Details = "Status: $($response.StatusCode)" }
        }
    } catch {
        Write-Host "[FAIL] $TestName - $($_.Exception.Message)" -ForegroundColor Red
        return @{ Test = $TestName; Result = "FAIL"; Details = $_.Exception.Message }
    }
}

Write-Host "1. Testing bills.html deployment..." -ForegroundColor Yellow
$testResults += Test-Endpoint "$baseUrl/bills.html" "Bills page loads" ""
$testResults += Test-Endpoint "$baseUrl/bills.html" "Scan button exists" "scanEmailBillsBtn"
$testResults += Test-Endpoint "$baseUrl/bills.html" "Pending section exists" "pendingEmailBillsSection"
$testResults += Test-Endpoint "$baseUrl/bills.html" "Review modal exists" "emailReviewModal"

Write-Host ""
Write-Host "2. Testing JavaScript files..." -ForegroundColor Yellow
$testResults += Test-Endpoint "$baseUrl/assets/js/email-bills.js" "Email bills JS exists" "scanEmailForBills"
$testResults += Test-Endpoint "$baseUrl/assets/js/app.js" "App JS loads" ""

Write-Host ""
Write-Host "3. Testing CSS..." -ForegroundColor Yellow
$testResults += Test-Endpoint "$baseUrl/assets/css/styles.css" "Styles CSS loads" ""

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
$passed = ($testResults | Where-Object { $_.Result -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Result -eq "FAIL" }).Count
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "FAILED TESTS:" -ForegroundColor Red
    $testResults | Where-Object { $_.Result -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Details)" -ForegroundColor Red
    }
}

# Return exit code
if ($failed -gt 0) { exit 1 } else { exit 0 }
