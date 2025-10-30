@echo off
echo ========================================
echo    Update & Maintenance Script
echo ========================================
echo.

set PROJECT_DIR=C:\projects\monitoring-biaya-rs
set BACKUP_DIR=C:\backups\monitoring-rs

echo Project directory: %PROJECT_DIR%
echo Backup directory: %BACKUP_DIR%
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator!
    pause
    exit /b 1
)

echo [1/5] Creating backup...
set DATE=%date:~-4%_%date:~4,2%_%date:~7,2%_%time:~0,2%_%time:~3,2%
set DATE=%DATE: =0%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
echo Backing up to: %BACKUP_DIR%\%DATE%
xcopy "%PROJECT_DIR%" "%BACKUP_DIR%\%DATE%" /E /I /H /Y >nul

echo [2/5] Stopping service...
net stop MonitoringApp

echo [3/5] Updating code...
cd /d "%PROJECT_DIR%"
git pull origin master

echo [4/5] Installing dependencies and building...
call npm install
call npm run build

echo [5/5] Starting service...
net start MonitoringApp

echo.
echo ========================================
echo    Update Completed!
echo ========================================
echo.
echo Backup location: %BACKUP_DIR%\%DATE%
echo Service status:
sc query MonitoringApp

echo.
echo Testing updated application...
timeout /t 5 /nobreak >nul
curl -s -o nul -w "Application Status: %%{http_code}\n" http://localhost || echo WARNING: Application not responding

echo.
echo To rollback if needed:
echo 1. net stop MonitoringApp
echo 2. xcopy "%BACKUP_DIR%\PREVIOUS_BACKUP" "%PROJECT_DIR%" /E /I /H /Y
echo 3. net start MonitoringApp
echo.
pause