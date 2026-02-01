$htmlFiles = Get-ChildItem "C:\Users\chuba\fireside-capital\app\*.html"

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove script references to deleted security files
    $content = $content -replace '\s*<script src="assets/js/security-utils\.js"></script>\r?\n?', ''
    $content = $content -replace '\s*<script src="assets/js/security-patch\.js"></script>\r?\n?', ''
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Cyan
