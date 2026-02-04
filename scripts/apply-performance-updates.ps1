# Apply Performance Optimizations to All HTML Pages
# Part of Sprint Research Phase 1 - Performance Implementation
# See: reports/SPRINT-RESEARCH-PERFORMANCE-OPTIMIZATION-2026-02-04.md

$pages = @(
    "assets.html",
    "bills.html",
    "budget.html",
    "debts.html",
    "friends.html",
    "income.html",
    "investments.html",
    "reports.html",
    "settings.html",
    "transactions.html"
)

$appDir = "C:\Users\chuba\fireside-capital\app"

Write-Host "🚀 Applying performance optimizations to 10 HTML pages..." -ForegroundColor Cyan

foreach ($page in $pages) {
    $filePath = Join-Path $appDir $page
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  ❌ $page - NOT FOUND" -ForegroundColor Red
        continue
    }
    
    Write-Host "  📝 Processing $page..." -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $changes = 0
    
    # 1. Remove Chart.js from <head> if it exists
    $chartPattern = '  <!-- Chart\.js - Data visualization library -->\s*\r?\n\s*<script src="https://cdn\.jsdelivr\.net/npm/chart\.js@[\d\.]+/dist/chart\.umd\.min\.js"></script>'
    if ($content -match $chartPattern) {
        $content = $content -replace $chartPattern, '  <!-- Performance: Chart.js lazy-loaded on dashboard only (saves 270 KB on other pages) -->
  <!-- See assets/js/lazy-loader.js -->'
        $changes++
        Write-Host "    ✓ Removed Chart.js from <head>" -ForegroundColor Green
    }
    
    # 2. Add lazy-loader.js if not present
    if ($content -notmatch 'lazy-loader\.js') {
        # Find the first <script> tag and add lazy-loader before it
        $content = $content -replace '(<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2")', '  <!-- Performance optimization: Lazy loader utility (2 KB, load immediately) -->
  <script src="assets/js/lazy-loader.js"></script>
  
  $1'
        $changes++
        Write-Host "    ✓ Added lazy-loader.js" -ForegroundColor Green
    }
    
    # 3. Add defer to Supabase script
    $content = $content -replace '<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>', '  <!-- Critical: Supabase client (needed for auth checks) -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>'
    
    # 4. Add defer to Bootstrap JS
    $content = $content -replace '<script\s+src="https://cdn\.jsdelivr\.net/npm/bootstrap@[\d\.]+/dist/js/bootstrap\.bundle\.min\.js"></script>', '  <!-- Non-critical: Bootstrap JS (modals, dropdowns - user interaction only) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>'
    
    # 5. Remove Plaid global load and add comment
    $content = $content -replace '<script src="https://cdn\.plaid\.com/link/v2/stable/link-initialize\.js"></script>', '  <!-- Plaid: Lazy-loaded when user clicks "Connect Bank" (saves 95 KB) -->
  <!-- See assets/js/plaid.js - LazyLoader.loadPlaid() -->'
    
    # 6. Add defer to all local scripts
    $localScriptPattern = '<script src="assets/js/([^"]+)\.js"></script>'
    $content = $content -replace $localScriptPattern, '<script src="assets/js/$1.js" defer></script>'
    
    # 7. Clean up duplicate comments/whitespace
    $content = $content -replace "(\r?\n\s*){3,}", "`r`n`r`n"
    
    # Only write if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "  ✅ $page - UPDATED ($changes changes)" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  $page - NO CHANGES NEEDED" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Performance optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Expected improvements:" -ForegroundColor Cyan
Write-Host "  • Total Blocking Time: -200ms (defer on 19 scripts)"
Write-Host "  • Chart.js: Only loads on dashboard/reports (-270 KB on 8 pages)"
Write-Host "  • Plaid Link: Only loads on click (-95 KB on all pages)"
Write-Host "  • Estimated page load improvement: 40-60%"
