$ErrorActionPreference = 'Stop'

function Stop-ManagedProcess {
  param(
    [Parameter(Mandatory = $true)]
    [string] $PidFile
  )

  if (-not (Test-Path $PidFile)) {
    return $false
  }

  $rawPid = Get-Content -Path $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  $parsedPid = 0
  if (-not [int]::TryParse($rawPid, [ref] $parsedPid)) {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $false
  }

  $pidValue = $parsedPid

  try {
    $process = Get-Process -Id $pidValue -ErrorAction Stop
    Stop-Process -Id $process.Id -Force
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $true
  }
  catch {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $false
  }
}

$root = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $root '.runtime'
$backendPidFile = Join-Path $runtimeDir 'backend.pid'
$frontendPidFile = Join-Path $runtimeDir 'frontend.pid'

$backendStopped = Stop-ManagedProcess -PidFile $backendPidFile
$frontendStopped = Stop-ManagedProcess -PidFile $frontendPidFile

if ($backendStopped -or $frontendStopped) {
  Write-Host 'M1K1U detenido correctamente.' -ForegroundColor Green
  if ($backendStopped) {
    Write-Host 'Backend detenido.'
  }
  if ($frontendStopped) {
    Write-Host 'Frontend detenido.'
  }
}
else {
  Write-Host 'No se encontraron procesos administrados por los scripts de M1K1U.' -ForegroundColor Yellow
}
