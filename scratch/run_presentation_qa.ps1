$ErrorActionPreference = 'Stop'
$env:PRESENTATION_QA_PORT = '5175'
$env:BROWSER_CDP_PORT = '9341'
$env:GAME_QA_URL = 'http://127.0.0.1:5175/'
$qaRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $qaRoot
$qaProfile = Join-Path $PSScriptRoot 'presentation-final-profile'
$qaServer = $null
$qaBrowser = $null
try {
  $qaServer = Start-Process -FilePath (Get-Command node).Source -ArgumentList 'scratch/presentation_server.cjs' -WorkingDirectory $qaRoot -WindowStyle Hidden -PassThru
  $qaBrowser = Start-Process -FilePath 'C:/Program Files/Google/Chrome/Application/chrome.exe' -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9341',('--user-data-dir="'+$qaProfile+'"'),'about:blank') -WindowStyle Hidden -PassThru
  for ($attempt=0; $attempt -lt 40; $attempt++) {
    try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:9341/json' | Out-Null; break } catch { Start-Sleep -Milliseconds 200 }
  }
  node --experimental-websocket scratch/presentation_browser.cjs > scratch/presentation-browser.log 2>&1
  $uiExit = $LASTEXITCODE
  Write-Output "UI QA exit: $uiExit"
  node --experimental-websocket scratch/flow_browser.cjs presentation-flow-results.json --capture > scratch/presentation-flow.log 2>&1
  $flowExit = $LASTEXITCODE
  Write-Output "Flow QA exit: $flowExit"
  if ($uiExit -ne 0 -or $flowExit -ne 0) { throw 'Browser QA failed; inspect scratch/presentation-*.log' }
} finally {
  if ($qaBrowser) { Stop-Process -Id $qaBrowser.Id -Force -ErrorAction SilentlyContinue }
  if ($qaServer) { Stop-Process -Id $qaServer.Id -Force -ErrorAction SilentlyContinue }
  # Clean only the two isolated profiles created by this QA run.
  foreach ($qaFolder in @('presentation-final-profile','presentation-qa-profile')) {
    $qaTarget = Join-Path $PSScriptRoot $qaFolder
    Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object {
      $_.CommandLine -and $_.CommandLine.Contains($qaTarget) -and $_.CommandLine.Contains('--headless=new')
    } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $qaTarget) {
      $qaResolved = (Resolve-Path -LiteralPath $qaTarget).Path
      if (!$qaResolved.StartsWith($PSScriptRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'QA cleanup target escaped scratch' }
      Start-Sleep -Milliseconds 250
      try { Remove-Item -LiteralPath $qaResolved -Recurse -Force -ErrorAction Stop } catch { Write-Output 'QA profile remains in scratch; browser may still be releasing files.' }
    }
  }
}
