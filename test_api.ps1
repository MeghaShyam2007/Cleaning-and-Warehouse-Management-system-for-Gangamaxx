$loginBody = '{"email":"admin@gangamaxx.com","password":"Admin@123456"}'
$loginRes = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$token = $loginRes.data.session.access_token
Write-Host "Login OK - Role: $($loginRes.data.user.role)"

$headers = @{ Authorization = "Bearer $token" }

# Test AI Chatbot
$chatRes = Invoke-RestMethod -Uri 'http://localhost:3001/api/ai/chat' -Method POST -ContentType 'application/json' -Headers $headers -Body '{"message":"hello"}'
Write-Host "`nAI Chat Reply:"
Write-Host $chatRes.data.reply

# Test Kit Builder
$kitRes = Invoke-RestMethod -Uri 'http://localhost:3001/api/ai/kit-builder' -Method POST -ContentType 'application/json' -Headers $headers -Body '{"scenario":"hospital"}'
Write-Host "`nKit Builder:"
Write-Host "Name: $($kitRes.data.kit_name)"
Write-Host "Items: $($kitRes.data.items.Count)"
Write-Host "Estimated Total: Rs.$($kitRes.data.estimated_total)"
