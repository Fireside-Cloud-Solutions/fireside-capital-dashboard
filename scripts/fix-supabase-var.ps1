Set-Location 'C:\Users\chuba\fireside-capital'

# Read the file
$content = Get-Content 'app/assets/js/app.js' -Raw

# Replace the declaration
$content = $content.Replace('const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);', 'const sb = window.supabase.createClient(supabaseUrl, supabaseKey);')

# Replace all references to supabase. (the client) but NOT window.supabase (the library)
# We need to be careful: replace "supabase." when used as the client, but not "window.supabase"
# The pattern: standalone "supabase." references that are the client
$content = $content.Replace('supabase.auth.', 'sb.auth.')
$content = $content.Replace('supabase.from(', 'sb.from(')

# Write back
Set-Content 'app/assets/js/app.js' -Value $content -NoNewline

Write-Output "Replacements done. Verifying..."
$check = Get-Content 'app/assets/js/app.js' -Raw
$constSb = ([regex]::Matches($check, 'const sb ')).Count
$sbAuth = ([regex]::Matches($check, 'sb\.auth\.')).Count
$sbFrom = ([regex]::Matches($check, 'sb\.from\(')).Count
$oldRef = ([regex]::Matches($check, '[^.]supabase\.(auth|from)')).Count
Write-Output "const sb: $constSb"
Write-Output "sb.auth.: $sbAuth"
Write-Output "sb.from(: $sbFrom"
Write-Output "Old supabase.(auth|from) refs remaining: $oldRef"

# Commit and push
git add app/assets/js/app.js
git commit -m 'fix: rename supabase client var to avoid CDN var conflict'
git push origin main
