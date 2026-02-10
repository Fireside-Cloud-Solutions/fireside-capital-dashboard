# Deploy Database Constraints Migration
# This script applies migration 003_add_data_validation_constraints.sql to Supabase

$SUPABASE_URL = "https://qqtiofdqplwycnwplmen.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwNjk0MiwiZXhwIjoyMDg1NDgyOTQyfQ.NwJv5O2xf7hJQxwHJhRQ9-1234567890abcdef"

Write-Host "`n=== Deploying Database Constraints Migration ===" -ForegroundColor Cyan

# Read the migration file
$migrationPath = "app/migrations/003_add_data_validation_constraints.sql"
$migrationSQL = Get-Content $migrationPath -Raw

# Note: Supabase REST API doesn't support arbitrary SQL execution
# We need to use the Supabase SQL Editor in the dashboard
Write-Host "`nMigration SQL prepared from: $migrationPath" -ForegroundColor Yellow
Write-Host "Total size: $($migrationSQL.Length) bytes" -ForegroundColor Yellow

Write-Host "`n=== MANUAL DEPLOYMENT REQUIRED ===" -ForegroundColor Magenta
Write-Host "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen" -ForegroundColor White
Write-Host "2. Navigate to: SQL Editor" -ForegroundColor White
Write-Host "3. Copy the contents of: app/migrations/003_add_data_validation_constraints.sql" -ForegroundColor White
Write-Host "4. Paste and click 'Run'" -ForegroundColor White

Write-Host "`n=== Opening migration file for copying... ===" -ForegroundColor Yellow
Start-Process notepad.exe $migrationPath

Write-Host "`nPress any key after you've applied the migration in Supabase Dashboard..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
