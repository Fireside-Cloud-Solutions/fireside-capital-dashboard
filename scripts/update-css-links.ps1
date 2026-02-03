# Update CSS links in all HTML files for consolidation
# FC-016: CSS Consolidation

$htmlFiles = @(
    "index.html",
    "assets.html",
    "bills.html",
    "budget.html",
    "debts.html",
    "friends.html",
    "income.html",
    "investments.html",
    "reports.html",
    "settings.html"
)

$oldCSSPattern = @'
  <link rel="stylesheet" href="assets/css/styles.css[^>]*" />
  <link rel="stylesheet" href="assets/css/notification-polish.css" />
  <link rel="stylesheet" href="assets/css/polish.css" />
  <link rel="stylesheet" href="assets/css/mobile-optimizations.css[^>]*" />
  <link rel="stylesheet" href="assets/css/brand-polish.css" />
  <link rel="stylesheet" href="assets/css/accessibility.css" />
'@

$newCSS = @'
  <link rel="stylesheet" href="assets/css/main.css?v=20260203" />
  <link rel="stylesheet" href="assets/css/components.css?v=20260203" />
  <link rel="stylesheet" href="assets/css/responsive.css?v=20260203" />
  <link rel="stylesheet" href="assets/css/accessibility.css?v=20260203" />
'@

foreach ($file in $htmlFiles) {
    $path = Join-Path "C:\Users\chuba\fireside-capital\app" $file
    
    if (Test-Path $path) {
        Write-Host "Updating $file..."
        $content = Get-Content $path -Raw
        
        # Remove old CSS links one by one
        $content = $content -replace '<link rel="stylesheet" href="assets/css/styles\.css[^>]*" />\s*', ''
        $content = $content -replace '<link rel="stylesheet" href="assets/css/notification-polish\.css" />\s*', ''
        $content = $content -replace '<link rel="stylesheet" href="assets/css/polish\.css" />\s*', ''
        $content = $content -replace '<link rel="stylesheet" href="assets/css/mobile-optimizations\.css[^>]*" />\s*', ''
        $content = $content -replace '<link rel="stylesheet" href="assets/css/brand-polish\.css" />\s*', ''
        $content = $content -replace '<link rel="stylesheet" href="assets/css/skip-link\.css" />\s*', ''
        
        # Replace accessibility.css line with new CSS block
        $content = $content -replace '<link rel="stylesheet" href="assets/css/accessibility\.css" />', $newCSS
        
        Set-Content $path $content -NoNewline
        Write-Host "  ✓ Updated $file"
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}

Write-Host ""
Write-Host "CSS links updated in all HTML files!"
