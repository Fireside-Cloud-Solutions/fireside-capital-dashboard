# PowerShell script to optimize all HTML pages

$optimizedFonts = 'family=Inter:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;1,8..60,400&display=swap'
$originalFonts = 'family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400;1,8..60,600&display=swap'

$files = @('assets.html', 'bills.html', 'budget.html', 'debts.html', 'friends.html', 'income.html', 'investments.html', 'settings.html')

foreach ($file in $files) {
    $path = "app\$file"
    if (Test-Path $path) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        $content = Get-Content -Path $path -Raw
        
        # Replace fonts
        if ($content -match [regex]::Escape($originalFonts)) {
            $content = $content -replace [regex]::Escape($originalFonts), $optimizedFonts
            Write-Host "  Optimized fonts" -ForegroundColor Green
        }
        
        # Check if Chart.js is loaded
        if ($content -match '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>') {
            $content = $content -replace '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>', '<!-- Chart.js is lazy loaded by app.js when needed -->'
            Write-Host "  Removed Chart.js from head" -ForegroundColor Green
        }
        
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "  Saved $file" -ForegroundColor Green
    } else {
        Write-Host "  File not found: $path" -ForegroundColor Red
    }
}

Write-Host "Optimization complete!" -ForegroundColor Green
