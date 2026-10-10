$ErrorActionPreference = 'Stop'
$env:PRESENTATION_QA_PORT = '5176'
$env:BROWSER_CDP_PORT = '9343'
$env:GAME_QA_URL = 'http://127.0.0.1:5176/'
$qaRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $qaRoot
$qaProfile = Join-Path $PSScriptRoot 'visual-qa-profile'
$qaServer = $null
$qaBrowser = $null
try {
  $qaServer = Start-Process -FilePath (Get-Command node).Source -ArgumentList 'scratch/presentation_server.cjs' -WorkingDirectory $qaRoot -WindowStyle Hidden -PassThru
  $qaBrowser = Start-Process -FilePath 'C:/Program Files/Google/Chrome/Application/chrome.exe' -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9343',('--user-data-dir="'+$qaProfile+'"'),'about:blank') -WindowStyle Hidden -PassThru
  for ($attempt=0; $attempt -lt 40; $attempt++) {
    try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:9343/json' | Out-Null; break } catch { Start-Sleep -Milliseconds 200 }
  }
  node --experimental-websocket scratch/visual_review_browser.cjs > scratch/visual-review-browser.log 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Visual QA failed; inspect scratch/visual-review-browser.log' }
  Get-Content scratch/visual-review-results.json
} finally {
  if ($qaBrowser) { Stop-Process -Id $qaBrowser.Id -Force -ErrorAction SilentlyContinue }
  if ($qaServer) { Stop-Process -Id $qaServer.Id -Force -ErrorAction SilentlyContinue }
  try {
    Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object {
      $_.CommandLine -and $_.CommandLine.Contains($qaProfile) -and $_.CommandLine.Contains('--headless=new')
    } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  } catch { Write-Output 'Process inventory unavailable; the tracked browser and server were stopped.' }
  if (Test-Path -LiteralPath $qaProfile) {
    $qaResolved = (Resolve-Path -LiteralPath $qaProfile).Path
    if (!$qaResolved.StartsWith($PSScriptRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'QA profile escaped scratch' }
    Start-Sleep -Milliseconds 250
    try { Remove-Item -LiteralPath $qaResolved -Recurse -Force -ErrorAction Stop } catch { Write-Output 'QA profile remains in scratch; Chrome may still be releasing files.' }
  }
}
