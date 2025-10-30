@echo off
echo ========================================
echo    Apache Configuration Setup
echo ========================================
echo.

REM Check if XAMPP is installed
if not exist "C:\xampp" (
    echo ERROR: XAMPP not found in C:\xampp
    echo Please install XAMPP first
    pause
    exit /b 1
)

set SERVER_IP=%1
if "%SERVER_IP%"=="" (
    echo Usage: %0 YOUR_SERVER_IP
    echo Example: %0 192.168.1.100
    pause
    exit /b 1
)

echo [1/4] Backing up Apache configuration...
copy "C:\xampp\apache\conf\httpd.conf" "C:\xampp\apache\conf\httpd.conf.backup" >nul
copy "C:\xampp\apache\conf\extra\httpd-vhosts.conf" "C:\xampp\apache\conf\extra\httpd-vhosts.conf.backup" >nul

echo [2/4] Enabling Apache modules...
REM Enable required modules in httpd.conf
powershell -Command "(Get-Content 'C:\xampp\apache\conf\httpd.conf') -replace '#LoadModule rewrite_module modules/mod_rewrite.so', 'LoadModule rewrite_module modules/mod_rewrite.so' -replace '#LoadModule proxy_module modules/mod_proxy.so', 'LoadModule proxy_module modules/mod_proxy.so' -replace '#LoadModule proxy_http_module modules/mod_proxy_http.so', 'LoadModule proxy_http_module modules/mod_proxy_http.so' -replace '#LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so', 'LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so' -replace '#LoadModule headers_module modules/mod_headers.so', 'LoadModule headers_module modules/mod_headers.so' -replace '#LoadModule deflate_module modules/mod_deflate.so', 'LoadModule deflate_module modules/mod_deflate.so' | Set-Content 'C:\xampp\apache\conf\httpd.conf'"

echo [3/4] Creating Virtual Host configuration...
(
echo ^<VirtualHost *:80^>
echo     ServerName %SERVER_IP%
echo     ProxyPreserveHost On
echo     ProxyRequests Off
echo     ProxyPass / http://localhost:3000/
echo     ProxyPassReverse / http://localhost:3000/
echo     Header always set X-Forwarded-Proto "http"
echo     Header always set X-Forwarded-Host "%%{HTTP_HOST}s"
echo     Header always set X-Real-IP "%%{REMOTE_ADDR}s"
echo     ErrorLog "logs/monitoring-error.log"
echo     CustomLog "logs/monitoring-access.log" combined
echo ^</VirtualHost^>
) > "C:\xampp\apache\conf\extra\httpd-vhosts.conf"

echo [4/4] Restarting Apache...
net stop Apache2.4
timeout /t 3 /nobreak >nul
net start Apache2.4

echo.
echo ========================================
echo    Apache Configuration Completed!
echo ========================================
echo.
echo Virtual Host configured for: http://%SERVER_IP%
echo Proxy to: http://localhost:3000
echo.
echo Apache status:
sc query Apache2.4
echo.
pause