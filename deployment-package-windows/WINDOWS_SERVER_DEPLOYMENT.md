# 🖥️ Panduan Deploy Next.js di Windows Server dengan XAMPP

## 📋 Prerequisites

### Windows Server Requirements
- Windows Server 2016 atau lebih baru
- XAMPP for Windows (Apache + MySQL)
- Node.js 18+ (LTS version)
- Git for Windows
- Administrator privileges

### Network Requirements
- Static IP address atau DHCP reservation
- Port 80 (HTTP) dan 443 (HTTPS) open
- Port 3000 (Next.js) untuk internal use

## 🚀 Langkah 1: Setup Environment

### 1.1 Install Node.js
```powershell
# Download Node.js LTS dari https://nodejs.org
# Install dengan opsi default
# Verifikasi instalasi:
node --version
npm --version
```

### 1.2 Install Git
```powershell
# Download Git dari https://git-scm.com
# Install dengan opsi default
# Verifikasi:
git --version
```

### 1.3 Setup Project Folder
```powershell
# Buat folder untuk project
mkdir C:\projects
cd C:\projects

# Clone repository (ganti dengan URL Anda)
git clone https://github.com/USERNAME/monitoring-biaya-rs.git
cd monitoring-biaya-rs
```

## 🔧 Langkah 2: Konfigurasi Next.js untuk Production

### 2.1 Install Dependencies
```powershell
npm install
```

### 2.2 Build Project
```powershell
npm run build
```

### 2.3 Environment Variables
Buat file `.env.production`:
```env
NODE_ENV=production
NEXTAUTH_URL=http://YOUR_SERVER_IP
NEXTAUTH_SECRET=your_generated_secret_here
PORT=3000
HOSTNAME=0.0.0.0
```

### 2.4 Test Production Build
```powershell
npm start
```
Akses di browser: `http://localhost:3000`

## 🌐 Langkah 3: Konfigurasi Apache Reverse Proxy

### 3.1 Enable Apache Modules
Edit `C:\xampp\apache\conf\httpd.conf`:
```apache
# Uncomment (hapus #) dari baris berikut:
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
LoadModule headers_module modules/mod_headers.so
LoadModule deflate_module modules/mod_deflate.so
```

### 3.2 Konfigurasi Virtual Host
Buat file `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    ServerName YOUR_SERVER_IP
    # Atau gunakan domain jika ada
    # ServerName monitoring.yourdomain.com
    
    # Enable reverse proxy
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy ke Next.js app
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support untuk Next.js hot reload
    ProxyPass /_next/webpack-hmr ws://localhost:3000/_next/webpack-hmr
    ProxyPassReverse /_next/webpack-hmr ws://localhost:3000/_next/webpack-hmr
    
    # Headers untuk Next.js
    Header always set X-Forwarded-Proto "http"
    Header always set X-Forwarded-Host "%{HTTP_HOST}s"
    Header always set X-Real-IP "%{REMOTE_ADDR}s"
    
    # Enable compression
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Error handling
    ErrorLog "logs/monitoring-error.log"
    CustomLog "logs/monitoring-access.log" common
</VirtualHost>
```

### 3.3 Restart Apache
```powershell
# Restart Apache service
net stop Apache2.4
net start Apache2.4
```

## 🔐 Langkah 4: Konfigurasi Firewall

### 4.1 Windows Firewall
Buka **Windows Defender Firewall with Advanced Security**:

```powershell
# Allow HTTP (Port 80)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow HTTPS (Port 443) - jika diperlukan
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Allow Next.js (Port 3000) - internal only
New-NetFirewallRule -DisplayName "Next.js" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 4.2 Router/Network Firewall
- Forward port 80 ke IP server Anda
- Forward port 443 ke IP server Anda (jika HTTPS)

## 🚀 Langkah 5: Setup Service untuk Auto-Start

### 5.1 Buat Windows Service dengan NSSM
Download **NSSM (Non-Sucking Service Manager)** dari https://nssm.cc

### 5.2 Install Service
```powershell
# Extract NSSM, lalu jalankan:
nssm install MonitoringApp

# Konfigurasi:
# Application tab:
#   Path: C:\Program Files\nodejs\node.exe
#   Arguments: C:\projects\monitoring-biaya-rs\server.js
#   Startup directory: C:\projects\monitoring-biaya-rs

# Details tab:
#   Display name: Monitoring Biaya RS
#   Description: Sistem Monitoring Biaya Rumah Sakit

# Log on tab:
#   Log on as: Local System

# Klik "Install service"
```

### 5.3 Start Service
```powershell
net start MonitoringApp
sc config MonitoringApp start=auto
```

## 📊 Langkah 6: Database Setup (Opsional)

### 6.1 MySQL dengan XAMPP
```sql
-- Buat database di phpMyAdmin
CREATE DATABASE monitoring_rs;

-- Buat user
CREATE USER 'monitoring_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON monitoring_rs.* TO 'monitoring_user'@'localhost';
FLUSH PRIVILEGES;
```

### 6.2 Update Environment Variables
```env
DATABASE_URL="mysql://monitoring_user:secure_password@localhost:3306/monitoring_rs"
```

## 🧪 Langkah 7: Testing

### 7.1 Local Testing
```powershell
# Test Next.js langsung
curl http://localhost:3000

# Test via Apache proxy
curl http://localhost
```

### 7.2 External Testing
Dari komputer lain di network:
```powershell
# Test via IP server
curl http://YOUR_SERVER_IP

# Atau buka di browser
http://YOUR_SERVER_IP
```

## 🔄 Langkah 8: Maintenance

### 8.1 Update Script
Buat `update.bat`:
```batch
@echo off
echo Updating Monitoring App...
cd /d C:\projects\monitoring-biaya-rs

git pull origin main
npm install
npm run build

net stop MonitoringApp
net start MonitoringApp

echo Update completed!
pause
```

### 8.2 Backup Script
Buat `backup.bat`:
```batch
@echo off
echo Backing up Monitoring App...
set BACKUP_DIR=C:\backups\monitoring_rs
set DATE=%date:~-4%_%date:~4,2%_%date:~7,2%

mkdir "%BACKUP_DIR%" 2>nul
xcopy "C:\projects\monitoring-biaya-rs" "%BACKUP_DIR%\%DATE%" /E /I /H /Y

echo Backup completed to %BACKUP_DIR%\%DATE%
pause
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port 3000 already in use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID_NUMBER> /F
```

#### 2. Apache proxy not working
```powershell
# Check Apache error log
type "C:\xampp\apache\logs\error.log"

# Check Apache modules enabled
httpd -M
```

#### 3. Next.js service not starting
```powershell
# Check service status
sc query MonitoringApp

# Check event viewer for errors
eventvwr.msc
```

#### 4. Database connection issues
```powershell
# Test MySQL connection
mysql -u monitoring_user -p monitoring_rs

# Check MySQL service
sc query mysql
```

## 📱 Mobile Access

### Responsive Testing
- Test di mobile browser
- Check viewport meta tag
- Verify touch interactions

### Performance Optimization
- Enable gzip compression
- Optimize images
- Use CDN untuk static assets

## 🔒 Security Best Practices

### 1. HTTPS Setup
```apache
<VirtualHost *:443>
    ServerName YOUR_SERVER_IP
    
    # SSL configuration
    SSLEngine on
    SSLCertificateFile "C:/xampp/apache/conf/ssl/server.crt"
    SSLCertificateKeyFile "C:/xampp/apache/conf/ssl/server.key"
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [L,R=301]
</VirtualHost>
```

### 2. Security Headers
```apache
# Additional security headers
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
```

---

## 🎉 Selesai!

Sekarang aplikasi Next.js Anda sudah running di Windows Server dengan XAMPP dan bisa diakses oleh klien eksternal melalui IP address server.

### 📞 Support Commands:
```powershell
# Check service status
sc query MonitoringApp

# Restart service
net stop MonitoringApp && net start MonitoringApp

# Check logs
Get-EventLog -LogName Application -Source "MonitoringApp" -Newest 10
```

### 🌐 Access URLs:
- **Local**: http://localhost
- **Network**: http://YOUR_SERVER_IP
- **Direct Next.js**: http://YOUR_SERVER_IP:3000 (jika dibuka)