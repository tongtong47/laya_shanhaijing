@echo off
setlocal DisableDelayedExpansion
if "%~1"=="" (
  echo Drag one or more Excel files onto this script.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp00_excel_to_json.ps1" %*
if errorlevel 1 (
  echo Conversion failed.
  pause
  exit /b 1
)
echo Conversion completed.
pause
