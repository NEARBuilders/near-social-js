@echo off
setlocal

REM Windows shim for tools that expect a `mkdir` executable (not a PowerShell alias).
REM Supports: mkdir -p <dir>

set "DIR="
if "%~1"=="-p" (
  set "DIR=%~2"
) else (
  set "DIR=%~1"
)

if "%DIR%"=="" exit /b 1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d='%DIR%'; if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }"

REM Always succeed (matches `mkdir -p` semantics).
exit /b 0
