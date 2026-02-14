# FC-119: Move scripts to end of <body> for performance
# This allows HTML to parse and render before JavaScript executes

$files = @(
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

foreach ($file in $files) {
    $path = Join-Path $appDir $file
    Write-Host "Processing $file..." -ForegroundColor Cyan
    
    $content = Get-Content $path -Raw
    
    # Find where scripts start (after </main></div>)
    # and where they end (before first modal)
    $pattern = '(?s)(<script[^>]*src="https://cdn\.jsdelivr\.net/npm/@supabase.*?)(  <div class="modal)'
    
    if ($content -match $pattern) {
        $scriptBlock = $matches[1]
        
        # Remove scripts from middle of file
        $content = $content -replace [regex]::Escape($scriptBlock), ""
        
        # Add comment and scripts before </body>
        $scriptBlockWithComment = @"
  
  <!-- SCRIPTS: Moved to end of <body> for performance (FC-119) - HTML parses before JavaScript executes -->
  $scriptBlock
"@
        
        $content = $content -replace '</body>', ($scriptBlockWithComment + '</body>')
        
        # Save file
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "  ✓ Scripts moved to end of <body>" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Pattern not found - skipping" -ForegroundColor Yellow
    }
}

Write-Host "`n✓ FC-119 complete - All scripts moved to end of <body> tags" -ForegroundColor Green
