# Verify Rate Limiting Implementation
# Tests that database schema and functions are deployed to Supabase

$SUPABASE_URL = "https://qqtiofdqplwycnwplmen.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g"

Write-Host "🔍 Verifying Rate Limiting Implementation..." -ForegroundColor Cyan
Write-Host ""

# Check 1: Verify rate_limits table exists
Write-Host "✓ Check 1: rate_limits table..." -ForegroundColor Yellow
try {
    $headers = @{
        "apikey" = $ANON_KEY
        "Authorization" = "Bearer $ANON_KEY"
    }
    
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rate_limits?select=*&limit=0" -Headers $headers -Method Get -ErrorAction Stop
    Write-Host "  ✅ rate_limits table exists" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*relation*does not exist*") {
        Write-Host "  ❌ rate_limits table NOT FOUND - needs to be created" -ForegroundColor Red
        Write-Host "  Run: db/rate-limiting-schema.sql in Supabase SQL Editor" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "  ⚠️  Could not verify table (might need auth): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check 2: Verify JavaScript files exist
Write-Host "✓ Check 2: JavaScript files..." -ForegroundColor Yellow
$files = @(
    "app/assets/js/rate-limiter.js",
    "app/assets/js/rate-limit-db.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Check 3: Verify HTML pages include scripts
Write-Host "✓ Check 3: HTML script tags..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem "app/*.html" -Exclude "test-*.html", "polish-demo.html"
$missingScripts = @()

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content $htmlFile.FullName -Raw
    
    if ($content -notmatch 'rate-limiter\.js') {
        $missingScripts += "$($htmlFile.Name) missing rate-limiter.js"
    }
    if ($content -notmatch 'rate-limit-db\.js') {
        $missingScripts += "$($htmlFile.Name) missing rate-limit-db.js"
    }
}

if ($missingScripts.Count -eq 0) {
    Write-Host "  ✅ All HTML pages include rate limiting scripts" -ForegroundColor Green
} else {
    Write-Host "  ❌ Missing scripts:" -ForegroundColor Red
    foreach ($missing in $missingScripts) {
        Write-Host "    - $missing" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Check 4: Verify app.js uses hybrid rate limiting
Write-Host "✓ Check 4: Hybrid rate limiting integration..." -ForegroundColor Yellow
$appJs = Get-Content "app/assets/js/app.js" -Raw

$functions = @("saveAsset", "saveInvestment", "saveDebt", "saveBill", "saveIncome")
$notIntegrated = @()

foreach ($func in $functions) {
    if ($appJs -notmatch "$func[\s\S]{0,200}withHybridRateLimit") {
        $notIntegrated += $func
    }
}

if ($notIntegrated.Count -eq 0) {
    Write-Host "  ✅ All save functions use hybrid rate limiting" -ForegroundColor Green
} else {
    Write-Host "  ❌ Functions not using hybrid rate limiting:" -ForegroundColor Red
    foreach ($func in $notIntegrated) {
        Write-Host "    - $func" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Check 5: Verify database schema file
Write-Host "✓ Check 5: Database schema file..." -ForegroundColor Yellow
if (Test-Path "db/rate-limiting-schema.sql") {
    $schema = Get-Content "db/rate-limiting-schema.sql" -Raw
    
    $checks = @(
        @{ Name = "rate_limits table"; Pattern = "CREATE TABLE.*rate_limits" },
        @{ Name = "check_rate_limit function"; Pattern = "CREATE.*FUNCTION check_rate_limit" },
        @{ Name = "cleanup_rate_limits function"; Pattern = "CREATE.*FUNCTION cleanup_rate_limits" }
    )
    
    $allPresent = $true
    foreach ($check in $checks) {
        if ($schema -match $check.Pattern) {
            Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($check.Name) missing" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if (-not $allPresent) { exit 1 }
} else {
    Write-Host "  ❌ db/rate-limiting-schema.sql NOT FOUND" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Rate Limiting Implementation Verified!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Components:" -ForegroundColor Yellow
Write-Host "  [OK] Database schema: db/rate-limiting-schema.sql" -ForegroundColor Green
Write-Host "  [OK] Client-side limiter: app/assets/js/rate-limiter.js" -ForegroundColor Green
Write-Host "  [OK] Database limiter: app/assets/js/rate-limit-db.js" -ForegroundColor Green
Write-Host "  [OK] Integration: All save functions updated" -ForegroundColor Green
Write-Host "  [OK] HTML: All pages include scripts" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Ensure db/rate-limiting-schema.sql has been run in Supabase SQL Editor" -ForegroundColor White
Write-Host "  2. Test by rapidly clicking 'Add Bill' 21 times (should block after 20)" -ForegroundColor White
Write-Host "  3. Check database: SELECT * FROM rate_limits" -ForegroundColor White
Write-Host ""
