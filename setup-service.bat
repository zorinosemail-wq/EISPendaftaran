@echo off
echo ========================================
echo    Windows Service Setup (NSSM)
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator!
    pause
    exit /b 1
)

REM Check if NSSM is installed
where nssm >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: NSSM not found!
    echo Please download and install NSSM from https://nssm.cc
    echo Extract to C:\nssm or add to PATH
    pause
    exit /b 1
)

set PROJECT_DIR=C:\projects\monitoring-biaya-rs
set NODE_EXE=C:\Program Files\nodejs\node.exe

if not exist "%NODE_EXE%" (
    echo ERROR: Node.js not found at %NODE_EXE%
    echo Please install Node.js first
    pause
    exit /b 1
)

if not exist "%PROJECT_DIR%" (
    echo ERROR: Project directory not found: %PROJECT_DIR%
    echo Please run setup-windows-server.bat first
    pause
    exit /b 1
)

echo [1/4] Stopping existing service...
net stop MonitoringApp 2>nul
sc delete MonitoringApp 2>nul

echo [2/4] Installing Windows Service...
nssm install MonitoringApp "%NODE_EXE%" "%PROJECT_DIR%\server.js"
nssm set MonitoringApp DisplayName "Monitoring Biaya RS"
nssm set MonitoringApp Description "Sistem Monitoring Biaya Rumah Sakit"
nssm set MonitoringApp Start SERVICE_AUTO_START
nssm set MonitoringApp AppDirectory "%PROJECT_DIR%"
nssm set MonitoringApp AppEnvironmentExtra "NODE_ENV=production"
nssm set MonitoringApp AppStdout "%PROJECT_DIR%\logs\service.log"
nssm set MonitoringApp AppStderr "%PROJECT_DIR%\logs\service-error.log"

echo [3/4] Creating logs directory...
if not exist "%PROJECT_DIR%\logs" mkdir "%PROJECT_DIR%\logs"

echo [4/4] Starting service...
net start MonitoringApp

echo.
echo ========================================
echo    Windows Service Setup Completed!
echo ========================================
echo.

echo Service status:
sc query MonitoringApp

echo.
echo Service logs:
type "%PROJECT_DIR%\logs\service.log" 2>nul

echo.
echo To manage service:
echo   Start:   net start MonitoringApp
echo   Stop:    net stop MonitoringApp
echo   Restart: net stop MonitoringApp ^&^& net start MonitoringApp
echo   Status:  sc query MonitoringApp
echo   Logs:    type "%PROJECT_DIR%\logs\service.log"
echo.
pause