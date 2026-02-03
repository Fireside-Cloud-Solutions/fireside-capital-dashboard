# FC-014 Phase 1: Remove unnecessary !important declarations
# Focus: Low-hanging fruit (obvious unnecessary cases)

$files = @("main.css", "responsive.css", "components.css", "accessibility.css")
$removed = 0

foreach ($file in $files) {
    $path = "app/assets/css/$file"
    if (!(Test-Path $path)) { continue }
    
    $content = Get-Content $path -Raw
    $original = $content
    
    Write-Host "Processing $file..."
    
    # Remove !important from standalone properties with no real competition
    # These are safe removals where the property has no conflicting styles
    
    # 1. Remove from .stats-cards properties (no competition)
    $content = $content -replace '(\.stats-cards[^{]*\{[^}]*font-size:\s*[^;]+)\s*!important', '$1'
    
    # 2. Remove from .empty-state (no competition)
    $content = $content -replace '(\.empty-state[^{]*\{[^}]*opacity:\s*[^;]+)\s*!important', '$1'
    
    # 3. Remove from .card-title (no competition)
    $content = $content -replace '(\.card-title[^{]*\{[^}]*margin:\s*[^;]+)\s*!important', '$1'
    
    # Count removals
    $changes = ($original.Length - $content.Length)
    if ($changes -gt 0) {
        $removed += ($original -split '!important').Count - ($content -split '!important').Count
        Set-Content $path $content -NoNewline
        Write-Host "  Removed ~$($removed) !important declarations"
    } else {
        Write-Host "  No changes"
    }
}

Write-Host ""
Write-Host "Phase 1 Complete: Removed $removed unnecessary !important declarations"
Write-Host "Run visual regression tests before committing."
