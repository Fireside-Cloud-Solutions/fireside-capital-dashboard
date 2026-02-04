# Fireside Capital - Live Site Testing Script
# Automated verification of the deployed dashboard
# Run this after ANY deployment to catch issues immediately

param(
    [switch]$Screenshots,
    [switch]$Verbose
)

Write-Host "🔍 Fireside Capital - Live Site Test" -ForegroundColor Cyan
Write-Host "Testing: https://nice-cliff-05b13880f.2.azurestaticapps.net" -ForegroundColor Gray
Write-Host ""

# Test 1: Site is reachable
Write-Host "✓ Checking site availability..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://nice-cliff-05b13880f.2.azurestaticapps.net" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host " PASS" -ForegroundColor Green
    } else {
        Write-Host " FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
    exit 1
}

# Test 2: CSS files are loading
Write-Host "✓ Checking CSS integrity..." -NoNewline
$cssFiles = @(
    "https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/css/main.css",
    "https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/css/utilities.css"
)
$cssPass = $true
foreach ($css in $cssFiles) {
    try {
        $resp = Invoke-WebRequest -Uri $css -UseBasicParsing
        if ($resp.StatusCode -ne 200) { $cssPass = $false }
    } catch {
        $cssPass = $false
    }
}
if ($cssPass) {
    Write-Host " PASS" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
}

# Test 3: Check for the bad CSS rule
Write-Host "✓ Verifying CSS fix (no max-height:inherit)..." -NoNewline
try {
    $mainCss = Invoke-WebRequest -Uri "https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/css/main.css" -UseBasicParsing
    if ($mainCss.Content -match "max-height:\s*inherit\s*!important") {
        Write-Host " FAIL (conflicting rule still present)" -ForegroundColor Red
    } else {
        Write-Host " PASS" -ForegroundColor Green
    }
} catch {
    Write-Host " SKIP (couldn't fetch CSS)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 For full browser testing, use the browser automation tool:" -ForegroundColor Cyan
Write-Host "   1. Login with matt@firesidecloudsolutions.com" -ForegroundColor Gray
Write-Host "   2. Navigate through all pages" -ForegroundColor Gray
Write-Host "   3. Verify charts render correctly" -ForegroundColor Gray
Write-Host "   4. Check responsive behavior" -ForegroundColor Gray
Write-Host ""
Write-Host "Credentials stored in: .credentials" -ForegroundColor Gray
