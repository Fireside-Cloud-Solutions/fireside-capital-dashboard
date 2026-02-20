# Fix GitHub Issues #4 + #12: Remove hardcoded pixel widths from skeleton loaders
# Replace inline style="width: XXpx" with percentage-based widths via CSS

$files = @(
    "assets.html",
    "bills.html",
    "budget.html",
    "debts.html",
    "friends.html",
    "income.html",
    "investments.html",
    "transactions.html"
)

$totalReplacements = 0

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot "..\app\$file"
    if (-not (Test-Path $path)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $path -Raw
    $originalContent = $content
    
    # Pattern 1: Remove inline width from skeleton-loader elements
    # Before: <div class="skeleton-loader" style="width: 120px;"></div>
    # After:  <div class="skeleton-loader"></div>
    $content = $content -replace '<div class="skeleton-loader[^"]*" style="width: \d+px;">', '<div class="skeleton-loader">'
    
    # Pattern 2: Remove inline width from skeleton-line elements
    # Before: <div class="skeleton-loader skeleton-line" style="width: 85px;"></div>
    # After:  <div class="skeleton-loader skeleton-line"></div>
    $content = $content -replace '<div class="skeleton-loader skeleton-line[^"]*" style="width: \d+px;">', '<div class="skeleton-loader skeleton-line">'
    
    # Pattern 3: Remove inline width from skeleton-line mb-* elements
    # Before: <div class="skeleton-loader skeleton-line mb-2" style="width: 95px;"></div>
    # After:  <div class="skeleton-loader skeleton-line mb-2"></div>
    $content = $content -replace '<div class="skeleton-loader skeleton-line mb-\d" style="width: \d+px;">', {
        param($match)
        $mbClass = if ($match.Value -match 'mb-(\d)') { "mb-$($matches[1])" } else { "" }
        '<div class="skeleton-loader skeleton-line ' + $mbClass + '">'
    }
    
    if ($content -ne $originalContent) {
        $replacements = ([regex]::Matches($originalContent, 'style="width: \d+px;"')).Count
        $totalReplacements += $replacements
        
        Set-Content $path -Value $content -NoNewline
        Write-Host "✅ $file - Removed $replacements hardcoded widths" -ForegroundColor Green
    } else {
        Write-Host "⏭️  $file - No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Total skeleton width fixes: $totalReplacements" -ForegroundColor Cyan
Write-Host "📋 Skeleton loaders now use responsive percentage-based widths from components.css" -ForegroundColor Cyan
