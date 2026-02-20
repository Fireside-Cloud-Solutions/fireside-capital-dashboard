# Fix GitHub Issues #4 + #12: Remove hardcoded pixel widths from skeleton loaders

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
        Write-Host "File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $path -Raw
    
    # Count existing hardcoded widths
    $matches = [regex]::Matches($content, 'style="width: \d+px;"')
    $count = $matches.Count
    
    if ($count -eq 0) {
        Write-Host "$file - No changes needed" -ForegroundColor Gray
        continue
    }
    
    # Remove all inline width styles from skeleton loaders
    $content = $content -replace 'class="skeleton-loader[^"]*" style="width: \d+px;"', 'class="skeleton-loader"'
    $content = $content -replace 'class="skeleton-loader skeleton-line[^"]*" style="width: \d+px;"', 'class="skeleton-loader skeleton-line"'
    $content = $content -replace 'class="skeleton-loader skeleton-line mb-(\d)" style="width: \d+px;"', 'class="skeleton-loader skeleton-line mb-$1"'
    
    Set-Content $path -Value $content -NoNewline
    $totalReplacements += $count
    
    Write-Host "$file - Removed $count hardcoded widths" -ForegroundColor Green
}

Write-Host ""
Write-Host "Total skeleton width fixes: $totalReplacements" -ForegroundColor Cyan
Write-Host "Skeleton loaders now use responsive percentage-based widths from components.css" -ForegroundColor Cyan
