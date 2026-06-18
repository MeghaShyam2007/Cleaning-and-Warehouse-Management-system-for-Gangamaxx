$token = (Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@gangamaxx.com","password":"Admin@123456"}').data.session.access_token
$h = @{ Authorization = "Bearer $token" }

try {
    $r = Invoke-RestMethod -Uri 'http://localhost:3001/api/products?page=1&limit=5' -Headers $h
    Write-Host "Products OK:" ($r | ConvertTo-Json -Depth 2)
} catch {
    $s = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($s)
    Write-Host "Products error:" $reader.ReadToEnd()
}
