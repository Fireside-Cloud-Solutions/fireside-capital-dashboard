Set-Location 'C:\Users\chuba\fireside-capital'
git reset HEAD memory/credentials.md
git reset HEAD check-deploy.ps1
git add .gitignore
git add .github/workflows/azure-static-web-apps-nice-cliff-05b13880f.yml
git status
git commit -m 'fix: correct Azure SWA deploy config - skip build, fix output path'
git push origin main
