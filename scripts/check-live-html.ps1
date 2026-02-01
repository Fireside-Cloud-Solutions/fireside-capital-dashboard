$r = Invoke-WebRequest -Uri 'https://nice-cliff-05b13880f.2.azurestaticapps.net/index.html' -UseBasicParsing
Write-Output "Content length: $($r.Content.Length)"
Write-Output ""

# Check for key elements
$html = $r.Content
if ($html -match 'loginForm') { Write-Output "loginForm: FOUND" } else { Write-Output "loginForm: MISSING" }
if ($html -match 'signupForm') { Write-Output "signupForm: FOUND" } else { Write-Output "signupForm: MISSING" }
if ($html -match 'loginAlert') { Write-Output "loginAlert: FOUND" } else { Write-Output "loginAlert: MISSING" }
if ($html -match 'signupAlert') { Write-Output "signupAlert: FOUND" } else { Write-Output "signupAlert: MISSING" }
if ($html -match 'forgotPasswordForm') { Write-Output "forgotPasswordForm: FOUND" } else { Write-Output "forgotPasswordForm: MISSING" }
if ($html -match 'resetPasswordModal') { Write-Output "resetPasswordModal: FOUND" } else { Write-Output "resetPasswordModal: MISSING" }
if ($html -match 'name="loginEmail"') { Write-Output 'name=loginEmail: FOUND' } else { Write-Output 'name=loginEmail: MISSING' }
if ($html -match 'name="signupEmail"') { Write-Output 'name=signupEmail: FOUND' } else { Write-Output 'name=signupEmail: MISSING' }
if ($html -match 'supabase-js@2') { Write-Output "supabase-js: FOUND" } else { Write-Output "supabase-js: MISSING" }
if ($html -match 'app\.js') { Write-Output "app.js: FOUND" } else { Write-Output "app.js: MISSING" }

# Check for the Supabase URL in the deployed app.js
Write-Output "`n=== Live app.js auth check ==="
$js = (Invoke-WebRequest -Uri 'https://nice-cliff-05b13880f.2.azurestaticapps.net/assets/js/app.js' -UseBasicParsing).Content
Write-Output "JS file length: $($js.Length)"
if ($js -match 'showAuthAlert') { Write-Output "showAuthAlert: FOUND (new auth code)" } else { Write-Output "showAuthAlert: MISSING (old auth code!)" }
if ($js -match 'signUp') { Write-Output "signUp function: FOUND" } else { Write-Output "signUp function: MISSING" }
if ($js -match 'forgotPassword') { Write-Output "forgotPassword: FOUND" } else { Write-Output "forgotPassword: MISSING" }
if ($js -match 'supabase\.auth\.signUp') { Write-Output "supabase.auth.signUp: FOUND" } else { Write-Output "supabase.auth.signUp: MISSING" }
