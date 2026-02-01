$files = @(
  'app/index.html',
  'app/assets.html',
  'app/bills.html',
  'app/budget.html',
  'app/debts.html',
  'app/friends.html',
  'app/income.html',
  'app/investments.html',
  'app/reports.html',
  'app/settings.html'
)

$buttonCount = 0
$inputCount = 0

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  # Count buttons with icons but no text
  $iconButtons = ([regex]::Matches($content, '<button[^>]*>[\s\n]*<i class="bi')).Count
  $buttonCount += $iconButtons
  
  # Count inputs without associated labels
  $inputs = ([regex]::Matches($content, '<input[^>]*id="([^"]+)"')).Count
  $inputCount += $inputs
}

Write-Output "Icon buttons found: $buttonCount"
Write-Output "Total inputs to verify: $inputCount"
Write-Output "Pages to update: "
