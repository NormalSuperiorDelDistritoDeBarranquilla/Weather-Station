$ErrorActionPreference = 'Stop'

function Resolve-Executable {
  param(
    [Parameter(Mandatory = $true)]
    [string[]] $Candidates
  )

  foreach ($candidate in $Candidates) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($null -ne $command) {
      return $command.Source
    }
  }

  throw "No se encontro ninguno de estos ejecutables: $($Candidates -join ', ')"
}

function Ensure-FileFromExample {
  param(
    [Parameter(Mandatory = $true)]
    [string] $TargetPath,
    [Parameter(Mandatory = $true)]
    [string] $ExamplePath
  )

  if (-not (Test-Path $TargetPath) -and (Test-Path $ExamplePath)) {
    Copy-Item $ExamplePath $TargetPath
  }
}

function Get-ListenerPid {
  param(
    [Parameter(Mandatory = $true)]
    [int] $Port
  )

  try {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
    return $connection.OwningProcess
  }
  catch {
    return $null
  }
}

function Wait-HttpReady {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Url,
    [int] $TimeoutSeconds = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3 | Out-Null
      return $true
    }
    catch {
      Start-Sleep -Milliseconds 800
    }
  }

  return $false
}

function Write-PidFile {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [int] $ProcessId
  )

  Set-Content -Path $Path -Value $ProcessId -Encoding ascii
}

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$runtimeDir = Join-Path $root '.runtime'

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$backendPidFile = Join-Path $runtimeDir 'backend.pid'
$frontendPidFile = Join-Path $runtimeDir 'frontend.pid'

Ensure-FileFromExample -TargetPath (Join-Path $backendDir '.env') -ExamplePath (Join-Path $backendDir '.env.example')
Ensure-FileFromExample -TargetPath (Join-Path $frontendDir '.env') -ExamplePath (Join-Path $frontendDir '.env.example')

$pythonExe = Resolve-Executable -Candidates @('python', 'py')
$npmExe = Resolve-Executable -Candidates @('npm.cmd', 'npm')

$backendPort = 8000
$frontendPort = 5173

$backendPid = Get-ListenerPid -Port $backendPort
$frontendPid = Get-ListenerPid -Port $frontendPort

if ($null -eq $backendPid) {
  Write-Host 'Iniciando backend...' -ForegroundColor Cyan
  $backendProcess = Start-Process `
    -FilePath $pythonExe `
    -ArgumentList @('-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000') `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput (Join-Path $backendDir 'backend.log') `
    -RedirectStandardError (Join-Path $backendDir 'backend.err.log') `
    -PassThru

  Write-PidFile -Path $backendPidFile -ProcessId $backendProcess.Id
}
else {
  Write-Host "Backend ya estaba en ejecucion en el puerto 8000 (PID $backendPid)." -ForegroundColor Yellow
}

if ($null -eq $frontendPid) {
  Write-Host 'Iniciando frontend...' -ForegroundColor Cyan
  $frontendProcess = Start-Process `
    -FilePath $npmExe `
    -ArgumentList @('run', 'dev', '--', '--host', '127.0.0.1') `
    -WorkingDirectory $frontendDir `
    -RedirectStandardOutput (Join-Path $frontendDir 'frontend.log') `
    -RedirectStandardError (Join-Path $frontendDir 'frontend.err.log') `
    -PassThru

  Write-PidFile -Path $frontendPidFile -ProcessId $frontendProcess.Id
}
else {
  Write-Host "Frontend ya estaba en ejecucion en el puerto 5173 (PID $frontendPid)." -ForegroundColor Yellow
}

$backendReady = Wait-HttpReady -Url 'http://127.0.0.1:8000/health'
$frontendReady = Wait-HttpReady -Url 'http://127.0.0.1:5173'

if (-not $backendReady) {
  throw 'El backend no respondio en http://127.0.0.1:8000/health'
}

if (-not $frontendReady) {
  throw 'El frontend no respondio en http://127.0.0.1:5173'
}

$backendListenerPid = Get-ListenerPid -Port $backendPort
$frontendListenerPid = Get-ListenerPid -Port $frontendPort

if ($null -ne $backendListenerPid) {
  Write-PidFile -Path $backendPidFile -ProcessId $backendListenerPid
}

if ($null -ne $frontendListenerPid) {
  Write-PidFile -Path $frontendPidFile -ProcessId $frontendListenerPid
}

Write-Host ''
Write-Host 'M1K1U iniciado correctamente.' -ForegroundColor Green
Write-Host 'Frontend: http://127.0.0.1:5173'
Write-Host 'Backend : http://127.0.0.1:8000'
Write-Host 'Swagger : http://127.0.0.1:8000/docs'

Start-Process 'http://127.0.0.1:5173'
