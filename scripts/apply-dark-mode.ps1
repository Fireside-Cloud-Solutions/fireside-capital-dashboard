Set-Location C:\Users\chuba\fireside-capital\app

function Write-FileRaw($path, $content) {
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — FC-104: Insert FOUC prevention script in all 12 HTML files
# ─────────────────────────────────────────────────────────────────────────────

# 10 files with 2-space indentation
$files2 = @("index.html","assets.html","bills.html","debts.html","friends.html",
            "income.html","investments.html","operations.html","reports.html","transactions.html")

$viewport2 = "  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />"
$fouc2 = "  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />`n  <!-- FC-104: FOUC prevention — set theme before CSS renders -->`n  <script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-bs-theme',t);document.documentElement.setAttribute('data-theme',t);}());</script>"

foreach ($f in $files2) {
    $fullPath = Join-Path (Get-Location) $f
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    if ($content -notlike "*FC-104*") {
        $content = $content.Replace($viewport2, $fouc2)
        Write-FileRaw $fullPath $content
        Write-Host "FC-104 applied: $f"
    } else {
        Write-Host "FC-104 already present, skipping: $f"
    }
}

# 2 files with 4-space indentation
$files4 = @("budget.html","settings.html")

$viewport4 = "    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />"
$fouc4 = "    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />`n    <!-- FC-104: FOUC prevention — set theme before CSS renders -->`n    <script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-bs-theme',t);document.documentElement.setAttribute('data-theme',t);}());</script>"

foreach ($f in $files4) {
    $fullPath = Join-Path (Get-Location) $f
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    if ($content -notlike "*FC-104*") {
        $content = $content.Replace($viewport4, $fouc4)
        Write-FileRaw $fullPath $content
        Write-Host "FC-104 applied: $f"
    } else {
        Write-Host "FC-104 already present, skipping: $f"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — FC-101: Add #themeSwitch to sidebar of 10 pages
# ─────────────────────────────────────────────────────────────────────────────

$sidebarOld = "        <a href=""settings.html""><i class=""bi bi-gear me-2""></i> Settings</a>`n      </div>`n    </div>"

$sidebarNew = "        <a href=""settings.html""><i class=""bi bi-gear me-2""></i> Settings</a>`n      </div>`n      <div class=""theme-toggle"">`n        <div class=""form-check form-switch"">`n          <input class=""form-check-input"" type=""checkbox"" id=""themeSwitch"" />`n          <label class=""form-check-label"" for=""themeSwitch"">Dark Mode</label>`n        </div>`n      </div>`n    </div>"

foreach ($f in $files2) {
    $fullPath = Join-Path (Get-Location) $f
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    if ($content -notlike "*themeSwitch*") {
        $content = $content.Replace($sidebarOld, $sidebarNew)
        Write-FileRaw $fullPath $content
        Write-Host "FC-101 applied: $f"
    } else {
        Write-Host "FC-101 already present, skipping: $f"
    }
}

Write-Host "`nAll HTML changes done."
