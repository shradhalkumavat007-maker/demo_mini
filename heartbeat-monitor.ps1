# ElectroStock Live Terminal Heartbeat Monitor
$host.UI.RawUI.WindowTitle = "ElectroStock Terminal Heartbeat Monitor"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " ELECTROSTOCK FULL-STACK LIVE TERMINAL HEARTBEAT MONITOR" -ForegroundColor Yellow
Write-Host " Monitoring Next.js (Port 3000) & Java Backend (Port 8080)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "Waiting 5 seconds for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

$iteration = 0

while ($true) {
    $iteration++
    $now = (Get-Date).ToString("HH:mm:ss")
    
    # 1. Probe Next.js Frontend & SQLite
    $frontendStatus = "OFFLINE"
    $frontendMsg = "Connection refused"
    $frontendColor = "Red"
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $feRes = Invoke-RestMethod -Uri "http://localhost:3000/api/telemetry" -TimeoutSec 3 -ErrorAction Stop
        $sw.Stop()
        $frontendStatus = "ONLINE "
        $prods = $feRes.counts.products
        $serials = $feRes.counts.serials
        $frontendMsg = "$($sw.ElapsedMilliseconds)ms | SQLite: $prods prods, $serials serials"
        $frontendColor = "Green"
    } catch {
        # Fallback probe to /api/health if telemetry is busy
        try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            $feRes = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -ErrorAction Stop
            $sw.Stop()
            $frontendStatus = "ONLINE "
            $frontendMsg = "$($sw.ElapsedMilliseconds)ms | SQLite DB Healthy"
            $frontendColor = "Green"
        } catch {
            $frontendMsg = $_.Exception.Message
        }
    }

    # 2. Probe Java Backend
    $backendStatus = "OFFLINE"
    $backendMsg = "Connection refused"
    $backendColor = "Red"
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $bePort = 8085
        $beRes = $null
        try {
            $beRes = Invoke-RestMethod -Uri "http://localhost:8085/api/health" -TimeoutSec 3 -ErrorAction Stop
        } catch {
            $bePort = 8080
            $beRes = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 3 -ErrorAction Stop
        }
        $sw.Stop()
        $backendStatus = "ONLINE "
        $bProds = $beRes.counts.products
        $bTxns = $beRes.counts.transactions
        $oraStatus = if ($beRes.oracleConnected) { "Oracle XE: OK" } else { "In-Memory" }
        $backendMsg = "$($sw.ElapsedMilliseconds)ms | Java (Port $bePort): $bProds prods, $bTxns txns | $oraStatus"
        $backendColor = "Green"
    } catch {
        $backendMsg = $_.Exception.Message
    }

    # 3. Print Heartbeat row
    Write-Host "[$now] " -NoNewline -ForegroundColor DarkGray
    Write-Host "FRONTEND [3000]: " -NoNewline -ForegroundColor White
    Write-Host "[$frontendStatus] " -NoNewline -ForegroundColor $frontendColor
    Write-Host "$frontendMsg  " -NoNewline -ForegroundColor Gray
    
    Write-Host "| BACKEND [8080]: " -NoNewline -ForegroundColor White
    Write-Host "[$backendStatus] " -NoNewline -ForegroundColor $backendColor
    Write-Host "$backendMsg" -ForegroundColor Gray

    if ($frontendStatus -eq "OFFLINE" -or $backendStatus -eq "OFFLINE") {
        Write-Host "   >>> [ALERT] One or more services are not responding. Check the dedicated terminal windows for build/runtime stack traces." -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 8
}
