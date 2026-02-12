# Fireside Capital - Live Site QA Testing Script
# Automated browser testing using Selenium WebDriver

param(
    [string]$Url = "https://nice-cliff-05b13880f.2.azurestaticapps.net",
    [string]$Email = "matt@firesidecloudsolutions.com",
    [string]$Password = "vRpBE5387U5G%0",
    [string]$ReportPath = "C:\Users\chuba\fireside-capital\reports\qa-live-test-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"
)

# Check if Selenium WebDriver is installed
if (!(Get-Module -ListAvailable -Name Selenium)) {
    Write-Host "Installing Selenium WebDriver module..." -ForegroundColor Yellow
    Install-Module -Name Selenium -Force -Scope CurrentUser
}

Import-Module Selenium

# Initialize test results
$TestResults = @()
$BugCount = 0

function Add-TestResult {
    param(
        [string]$Page,
        [string]$Test,
        [string]$Result,
        [string]$Details = "",
        [string]$Priority = "P2"
    )
    
    $script:TestResults += [PSCustomObject]@{
        Page = $Page
        Test = $Test
        Result = $Result
        Details = $Details
        Priority = $Priority
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
    
    if ($Result -eq "FAIL") {
        $script:BugCount++
    }
}

function Test-PageLoad {
    param([string]$PageName, [string]$Path = "")
    
    $url = if ($Path) { "$Url/$Path" } else { $Url }
    
    try {
        $Driver.Navigate().GoToUrl($url)
        Start-Sleep -Seconds 2
        
        # Check for console errors
        $logs = $Driver.Manage().Logs.GetLog("browser")
        $errors = $logs | Where-Object { $_.Level -eq "SEVERE" }
        
        if ($errors.Count -gt 0) {
            Add-TestResult -Page $PageName -Test "Console Errors" -Result "FAIL" `
                -Details "$($errors.Count) console errors detected" -Priority "P1"
        } else {
            Add-TestResult -Page $PageName -Test "Page Load" -Result "PASS"
        }
        
        return $true
    } catch {
        Add-TestResult -Page $PageName -Test "Page Load" -Result "FAIL" `
            -Details $_.Exception.Message -Priority "P0"
        return $false
    }
}

function Test-Login {
    Write-Host "Testing login functionality..." -ForegroundColor Cyan
    
    try {
        # Click login button
        $loginBtn = $Driver.FindElementByXPath("//button[contains(text(), 'Login')]")
        $loginBtn.Click()
        Start-Sleep -Seconds 1
        
        # Wait for modal
        $emailField = $Driver.FindElementById("loginEmail")
        $passwordField = $Driver.FindElementById("loginPassword")
        
        # Enter credentials
        $emailField.SendKeys($Email)
        $passwordField.SendKeys($Password)
        
        # Submit
        $submitBtn = $Driver.FindElementById("loginSubmitBtn")
        $submitBtn.Click()
        Start-Sleep -Seconds 3
        
        # Verify login success (check for logged-in elements)
        $currentUrl = $Driver.Url
        if ($currentUrl -match "index.html" -or $Driver.FindElementsByClassName("dashboard").Count -gt 0) {
            Add-TestResult -Page "Authentication" -Test "Login" -Result "PASS"
            return $true
        } else {
            Add-TestResult -Page "Authentication" -Test "Login" -Result "FAIL" `
                -Details "Login did not redirect to dashboard" -Priority "P0"
            return $false
        }
        
    } catch {
        Add-TestResult -Page "Authentication" -Test "Login" -Result "FAIL" `
            -Details $_.Exception.Message -Priority "P0"
        return $false
    }
}

function Test-Dashboard {
    Write-Host "Testing Dashboard page..." -ForegroundColor Cyan
    
    Test-PageLoad -PageName "Dashboard" -Path "index.html"
    
    try {
        # Check for key elements
        $elements = @{
            "Net Worth Card" = "//div[contains(@class, 'card')]//h6[contains(text(), 'Net Worth')]"
            "Total Assets Card" = "//div[contains(@class, 'card')]//h6[contains(text(), 'Total Assets')]"
            "Total Debts Card" = "//div[contains(@class, 'card')]//h6[contains(text(), 'Total Debts')]"
            "Net Worth Chart" = "canvas#netWorthChart"
            "Cash Flow Chart" = "canvas#cashFlowChart"
        }
        
        foreach ($elem in $elements.GetEnumerator()) {
            try {
                $found = if ($elem.Value -match "^canvas") {
                    $Driver.FindElementById($elem.Value.Replace("canvas#", ""))
                } else {
                    $Driver.FindElementByXPath($elem.Value)
                }
                
                Add-TestResult -Page "Dashboard" -Test $elem.Key -Result "PASS"
            } catch {
                Add-TestResult -Page "Dashboard" -Test $elem.Key -Result "FAIL" `
                    -Details "Element not found" -Priority "P1"
            }
        }
        
    } catch {
        Add-TestResult -Page "Dashboard" -Test "General" -Result "FAIL" `
            -Details $_.Exception.Message -Priority "P1"
    }
}

function Test-AssetsPage {
    Write-Host "Testing Assets page..." -ForegroundColor Cyan
    
    Test-PageLoad -PageName "Assets" -Path "assets.html"
    
    try {
        # Test "Add Asset" button
        $addBtn = $Driver.FindElementByXPath("//button[contains(text(), 'Add Asset')]")
        $addBtn.Click()
        Start-Sleep -Seconds 1
        
        # Check if modal opens
        $modal = $Driver.FindElementById("assetModal")
        if ($modal.Displayed) {
            Add-TestResult -Page "Assets" -Test "Add Asset Modal" -Result "PASS"
        } else {
            Add-TestResult -Page "Assets" -Test "Add Asset Modal" -Result "FAIL" `
                -Details "Modal did not open" -Priority "P1"
        }
        
        # Close modal
        $closeBtn = $Driver.FindElementByXPath("//button[@data-bs-dismiss='modal']")
        $closeBtn.Click()
        Start-Sleep -Seconds 1
        
    } catch {
        Add-TestResult -Page "Assets" -Test "Add Asset Modal" -Result "FAIL" `
            -Details $_.Exception.Message -Priority "P1"
    }
}

# Main test execution
try {
    Write-Host "`n=== Fireside Capital Live QA Testing ===" -ForegroundColor Green
    Write-Host "Site: $Url" -ForegroundColor Yellow
    Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Yellow
    
    # Start Chrome driver
    Write-Host "Starting Chrome WebDriver..." -ForegroundColor Cyan
    $Driver = Start-SeChrome -Quiet
    
    # Test logged-out state
    Write-Host "`n--- Testing Logged-Out State ---" -ForegroundColor Magenta
    Test-PageLoad -PageName "Dashboard (Logged Out)"
    
    # Verify logged-out elements
    try {
        $signUpBtn = $Driver.FindElementByXPath("//button[contains(text(), 'Sign Up')]")
        Add-TestResult -Page "Dashboard" -Test "Sign Up CTA Visible" -Result "PASS"
    } catch {
        Add-TestResult -Page "Dashboard" -Test "Sign Up CTA Visible" -Result "FAIL" `
            -Details "Sign Up button not found" -Priority "P1"
    }
    
    # Test login
    Write-Host "`n--- Testing Authentication ---" -ForegroundColor Magenta
    $loginSuccess = Test-Login
    
    if ($loginSuccess) {
        # Test all pages
        Write-Host "`n--- Testing Pages (Logged In) ---" -ForegroundColor Magenta
        Test-Dashboard
        Test-AssetsPage
        
        # Test other pages
        $pages = @(
            @{ Name = "Bills"; Path = "bills.html" }
            @{ Name = "Debts"; Path = "debts.html" }
            @{ Name = "Income"; Path = "income.html" }
            @{ Name = "Investments"; Path = "investments.html" }
            @{ Name = "Transactions"; Path = "transactions.html" }
            @{ Name = "Budget"; Path = "budget.html" }
            @{ Name = "Reports"; Path = "reports.html" }
            @{ Name = "Settings"; Path = "settings.html" }
        )
        
        foreach ($page in $pages) {
            Test-PageLoad -PageName $page.Name -Path $page.Path
        }
    }
    
    Write-Host "`n=== Test Summary ===" -ForegroundColor Green
    $passed = ($TestResults | Where-Object { $_.Result -eq "PASS" }).Count
    $failed = ($TestResults | Where-Object { $_.Result -eq "FAIL" }).Count
    $total = $TestResults.Count
    
    Write-Host "Total Tests: $total" -ForegroundColor White
    Write-Host "Passed: $passed" -ForegroundColor Green
    Write-Host "Failed: $failed" -ForegroundColor Red
    Write-Host "Bugs Found: $BugCount`n" -ForegroundColor Yellow
    
    # Generate report
    $report = @"
# Fireside Capital - Live QA Test Report

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Site:** $Url  
**Total Tests:** $total  
**Passed:** $passed  
**Failed:** $failed  
**Bugs Found:** $BugCount

---

## Test Results

| Page | Test | Result | Priority | Details | Time |
|------|------|--------|----------|---------|------|
"@

    foreach ($result in $TestResults) {
        $report += "`n| $($result.Page) | $($result.Test) | **$($result.Result)** | $($result.Priority) | $($result.Details) | $($result.Timestamp) |"
    }
    
    $report += "`n`n---`n`n**Test completed:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n"
    
    # Save report
    $report | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host "Report saved: $ReportPath" -ForegroundColor Green
    
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Cleanup
    if ($Driver) {
        Write-Host "`nClosing browser..." -ForegroundColor Yellow
        Stop-SeDriver -Driver $Driver
    }
}
