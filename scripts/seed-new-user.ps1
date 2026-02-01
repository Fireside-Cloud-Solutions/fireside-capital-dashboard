# Read seed SQL and replace old UUID with new one
$sql = Get-Content 'C:\Users\chuba\fireside-capital\app\Supabase\seed_data.sql' -Raw
$sql = $sql.Replace('64b7b729-4a67-4eb9-a280-ba5a7060f1d3', '8b6aca68-6072-457d-8053-7e81e41bfef3')

$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
    'Content-Type' = 'application/json'
}

# Try inserting via REST API for each table (need auth token for RLS)
# Actually, we need to use the user's session token. Let's try a different approach.
# We'll write the updated SQL to a file for the user to paste in Supabase SQL Editor

$outPath = 'C:\Users\chuba\fireside-capital\seed-new-user.sql'
Set-Content $outPath -Value $sql -NoNewline
Write-Output "Updated seed SQL written to: $outPath"
Write-Output "New UUID: 8b6aca68-6072-457d-8053-7e81e41bfef3"
Write-Output "Old UUID replaced in all INSERT statements"

# Count replacements
$count = ([regex]::Matches($sql, '8b6aca68-6072-457d-8053-7e81e41bfef3')).Count
Write-Output "Total UUID references: $count"
