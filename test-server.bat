@echo off
echo ========================================
echo    Server Testing & Diagnostics
echo ========================================
echo.

set SERVER_IP=%1
if "%SERVER_IP%"=="" set SERVER_IP=localhost

echo Testing server: %SERVER_IP%
echo.

echo [1/6] Testing Next.js direct connection (Port 3000)...
curl -s -o nul -w "Status: %%{http_code} - Time: %%{time_total}s\n" http://%SERVER_IP%:3000 || echo FAILED: Next.js not responding on port 3000

echo.
echo [2/6] Testing Apache reverse proxy (Port 80)...
curl -s -o nul -w "Status: %%{http_code} - Time: %%{time_total}s\n" http://%SERVER_IP% || echo FAILED: Apache proxy not responding on port 80

echo.
echo [3/6] Testing API endpoints...
curl -s -o nul -w "API Status: %%{http_code}\n" http://%SERVER_IP%/api/auth/session || echo FAILED: API endpoint not responding

echo.
echo [4/6] Checking service status...
sc query MonitoringApp 2>nul || echo WARNING: MonitoringApp service not found

echo.
echo [5/6] Checking Apache status...
sc query Apache2.4 2>nul || echo WARNING: Apache2.4 service not found

echo.
echo [6/6] Network diagnostics...
echo Active ports:
netstat -an | findstr ":80"
netstat -an | findstr ":3000"

echo.
echo ========================================
echo    Manual Testing Checklist
echo ========================================
echo.
echo From client computer, test these URLs:
echo 1. http://%SERVER_IP%              - Main application
echo 2. http://%SERVER_IP%/login        - Login page
echo 3. http://%SERVER_IP%/api/health   - API health check
echo.
echo Mobile testing:
echo - Access from mobile browser
echo - Check responsive design
echo - Test touch interactions
echo.
echo Performance testing:
echo - Load time should be < 3 seconds
echo - All charts should load properly
echo - Form submissions should work
echo.
echo Security testing:
echo - Login/logout functionality
echo - Session persistence
echo - Data validation
echo.
pause