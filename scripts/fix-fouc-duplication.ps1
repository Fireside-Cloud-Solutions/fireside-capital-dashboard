# Fix FOUC script duplication across HTML pages
$files = @(
    "app/assets.html",
    "app/bills.html",
    "app/debts.html",
    "app/income.html",
    "app/investments.html",
    "app/transactions.html",
    "app/reports.html",
    "app/friends.html",
    "app/operations.html"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    # Remove second occurrence of FOUC script (lines 10-12)
    $content = $content -replace '(?m)^  <!-- FC-104: FOUC prevention[^\n]*\n  <script>\(function.*?</script>\n(?=  <title>)', ''
    Set-Content $file -Value $content -NoNewline
    Write-Host "Fixed: $file"
}

Write-Host "`nAll files fixed!"
