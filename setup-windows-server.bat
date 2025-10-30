@echo off
echo ========================================
echo    Monitoring Biaya RS - Setup Script
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this script as Administrator!
    pause
    exit /b 1
)

echo [1/6] Setting up environment...
set PROJECT_DIR=C:\projects\monitoring-biaya-rs
set SERVER_IP=%1

if "%SERVER_IP%"=="" (
    echo Usage: %0 YOUR_SERVER_IP
    echo Example: %0 192.168.1.100
    pause
    exit /b 1
)

echo Server IP: %SERVER_IP%
echo Project Directory: %PROJECT_DIR%
echo.

echo [2/6] Creating project directory...
if not exist "C:\projects" mkdir "C:\projects"
cd /d C:\projects

echo [3/6] Downloading project...
if not exist "monitoring-biaya-rs" (
    echo Cloning repository...
    git clone https://github.com/USERNAME/monitoring-biaya-rs.git
) else (
    echo Updating existing repository...
    cd monitoring-biaya-rs
    git pull origin master
    cd ..
)

cd monitoring-biaya-rs

echo [4/6] Installing dependencies...
call npm install

echo [5/6] Building project...
call npm run build

echo [6/6] Creating environment file...
echo NODE_ENV=production > .env.production
echo NEXTAUTH_URL=http://%SERVER_IP% >> .env.production
echo NEXTAUTH_SECRET=lmA9cqWvCFitAMsFISk4U5mXswfZOiYW4wh8jWEbxzg= >> .env.production
echo PORT=3000 >> .env.production
echo HOSTNAME=0.0.0.0 >> .env.production
echo DATABASE_URL="mysql://root:@localhost:3306/monitoring_rs" >> .env.production
echo API_BASE_URL=http://%SERVER_IP% >> .env.production

echo.
echo ========================================
echo    Setup Completed!
echo ========================================
echo.
echo Next steps:
echo 1. Configure Apache reverse proxy
echo 2. Setup Windows Firewall
echo 3. Create Windows Service
echo 4. Test application
echo.
echo Project location: %PROJECT_DIR%
echo Server URL: http://%SERVER_IP%
echo.
pause