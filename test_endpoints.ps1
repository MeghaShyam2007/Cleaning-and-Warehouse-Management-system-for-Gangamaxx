$token = (Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@gangamaxx.com","password":"Admin@123456"}').data.session.access_token
$h = @{ Authorization = "Bearer $token" }

$endpoints = @(
    'http://localhost:3001/api/products?page=1&limit=5',
    'http://localhost:3001/api/stock',
    'http://localhost:3001/api/orders?limit=5',
    'http://localhost:3001/api/institutions?limit=5',
    'http://localhost:3001/api/reports/stock-summary'
)

foreach ($url in $endpoints) {
    try {
        $r = Invoke-RestMethod -Uri $url -Headers $h
        Write-Host "OK  $url -> count=$($r.data.Count)"
    } catch {
        $s = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($s)
        $body = $reader.ReadToEnd()
        Write-Host "ERR $url -> $body"
    }
}
