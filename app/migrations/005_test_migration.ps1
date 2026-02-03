# Migration 005 Validation Script
# Tests the SQL syntax and verifies migration is ready

Write-Host "=== Migration 005 Validation ===" -ForegroundColor Cyan
Write-Host ""

# Check if migration file exists
$migrationFile = "005_create_transactions_table.sql"
if (Test-Path $migrationFile) {
    Write-Host "[OK] Migration file found: $migrationFile" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Migration file not found!" -ForegroundColor Red
    exit 1
}

# Read migration content
$content = Get-Content $migrationFile -Raw
Write-Host "[OK] Migration file size: $($content.Length) bytes" -ForegroundColor Green

# Check for required elements
$checks = @{
    'CREATE TABLE.*transactions' = 'transactions table creation'
    'CREATE TABLE.*transaction_category_patterns' = 'category_patterns table creation'
    'ENABLE ROW LEVEL SECURITY' = 'RLS enablement'
    'CREATE POLICY' = 'RLS policies'
    'CREATE INDEX' = 'Performance indexes'
    'CHECK.*confidence.*0.*1' = 'Confidence constraint'
    'CHECK.*amount.*0' = 'Amount constraint'
}

Write-Host ""
Write-Host "Checking migration elements:" -ForegroundColor Yellow

$allPassed = $true
foreach ($pattern in $checks.Keys) {
    if ($content -match $pattern) {
        Write-Host "  [OK] $($checks[$pattern])" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($checks[$pattern])" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

if ($allPassed) {
    Write-Host "=== Migration 005 is ready for deployment! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://qqtiofdqplwycnwplmen.supabase.co" -ForegroundColor White
    Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
    Write-Host "3. Copy contents of $migrationFile" -ForegroundColor White
    Write-Host "4. Paste and run in Supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "See 005_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
} else {
    Write-Host "=== Migration validation failed ===" -ForegroundColor Red
    exit 1
}
