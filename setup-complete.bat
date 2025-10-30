@echo off
echo ========================================
echo    Complete Server Setup Automation
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator!
    pause
    exit /b 1
)

set SERVER_IP=%1
if "%SERVER_IP%"=="" (
    echo Usage: %0 YOUR_SERVER_IP
    echo Example: %0 192.168.1.100
    echo.
    echo This script will:
    echo 1. Setup Next.js project
    echo 2. Configure Apache reverse proxy
    echo 3. Setup Windows Firewall
    echo 4. Create Windows Service
    echo.
    pause
    exit /b 1
)

echo Server IP: %SERVER_IP%
echo Starting complete setup...
echo.

echo [1/4] Setting up Next.js project...
call "%~dp0setup-windows-server.bat" %SERVER_IP%

echo.
echo [2/4] Configuring Apache...
call "%~dp0setup-apache.bat" %SERVER_IP%

echo.
echo [3/4] Setting up Firewall...
call "%~dp0setup-firewall.bat"

echo.
echo [4/4] Creating Windows Service...
call "%~dp0setup-service.bat"

echo.
echo ========================================
echo    🎉 SETUP COMPLETED! 🎉
echo ========================================
echo.
echo Your Next.js monitoring app is now running!
echo.
echo Access URLs:
echo   Local:    http://localhost
echo   Network:  http://%SERVER_IP%
echo   Direct:   http://%SERVER_IP%:3000
echo.
echo Service Management:
echo   Start:    net start MonitoringApp
echo   Stop:     net stop MonitoringApp
echo   Restart:  net stop MonitoringApp ^&^& net start MonitoringApp
echo   Status:   sc query MonitoringApp
echo.
echo Troubleshooting:
echo   Logs:     C:\projects\monitoring-biaya-rs\logs\
echo   Apache:   C:\xampp\apache\logs\
echo   Event:    eventvwr.msc
echo.
echo Next steps:
echo 1. Test access from client computers
echo 2. Configure router port forwarding if needed
echo 3. Setup SSL certificate for HTTPS (optional)
echo 4. Configure backup procedures
echo.
pause