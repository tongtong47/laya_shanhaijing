@echo off
setlocal DisableDelayedExpansion
if "%~1"=="" (
  echo Drag one or more JSON files onto this script.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp00_json_to_excel.ps1" %*
if errorlevel 1 (
  echo Conversion failed.
  pause
  exit /b 1
)
echo Conversion completed.
pause
