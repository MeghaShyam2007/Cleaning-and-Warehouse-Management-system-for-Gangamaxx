try {
    $r = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@gangamaxx.com","password":"Admin@123456"}'
    Write-Host "SUCCESS:"
    $r | ConvertTo-Json -Depth 5
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $body = $reader.ReadToEnd()
    Write-Host "ERROR $status : $body"
}
