@echo off
echo ========================================
echo    Windows Firewall Configuration
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator!
    pause
    exit /b 1
)

echo [1/3] Creating firewall rules for HTTP (Port 80)...
netsh advfirewall firewall delete rule name="HTTP Monitoring App" >nul 2>&1
netsh advfirewall firewall add rule name="HTTP Monitoring App" dir=in action=allow protocol=TCP localport=80

echo [2/3] Creating firewall rules for Next.js (Port 3000)...
netsh advfirewall firewall delete rule name="Next.js Monitoring App" >nul 2>&1
netsh advfirewall firewall add rule name="Next.js Monitoring App" dir=in action=allow protocol=TCP localport=3000

echo [3/3] Creating firewall rules for HTTPS (Port 443)...
netsh advfirewall firewall delete rule name="HTTPS Monitoring App" >nul 2>&1
netsh advfirewall firewall add rule name="HTTPS Monitoring App" dir=in action=allow protocol=TCP localport=443

echo.
echo ========================================
echo    Firewall Configuration Completed!
echo ========================================
echo.

echo Current firewall rules:
echo.
netsh advfirewall firewall show rule name="HTTP Monitoring App"
netsh advfirewall firewall show rule name="Next.js Monitoring App"
netsh advfirewall firewall show rule name="HTTPS Monitoring App"

echo.
echo Network status:
netstat -an | findstr ":80"
netstat -an | findstr ":3000"
netstat -an | findstr ":443"

echo.
pause