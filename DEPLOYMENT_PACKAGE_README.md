# 🚀 Deployment Package untuk Windows Server

## 📦 Package Contents

File-file ini disediakan khusus untuk deployment di Windows Server. Tidak perlu di-push ke GitHub.

### 📁 Struktur Folder di Windows Server:
```
C:\projects\monitoring-biaya-rs\
├── setup-complete.bat           # Setup otomatis 1 klik
├── setup-windows-server.bat     # Setup Next.js project
├── setup-apache.bat             # Konfigurasi Apache
├── setup-firewall.bat           # Setup Firewall
├── setup-service.bat            # Buat Windows Service
├── test-server.bat              # Testing & diagnostics
├── update-app.bat               # Update & maintenance
├── .env.windows-server          # Environment variables template
├── apache-vhost.conf            # Apache configuration
└── WINDOWS_SERVER_DEPLOYMENT.md # Panduan lengkap
```

## 🎯 Cara Penggunaan

### Opsi 1: Download Manual (Recommended)

1. **Download file-file deployment** dari repository GitHub
2. **Copy ke Windows Server** di folder `C:\projects\monitoring-biaya-rs\`
3. **Jalankan setup:**
   ```batch
   # Buka Command Prompt as Administrator
   cd C:\projects\monitoring-biaya-rs
   setup-complete.bat 192.168.1.100
   ```

### Opsi 2: Clone Repository (Lightweight)

```batch
# Clone tanpa node_modules
git clone --depth 1 https://github.com/USERNAME/monitoring-biaya-rs.git
cd monitoring-biaya-rs

# Install dependencies
npm install --production

# Build project
npm run build

# Jalankan setup
setup-complete.bat 192.168.1.100
```

### Opsi 3: Copy Project Files

1. **Copy hanya source code** (tanpa node_modules, .next, db)
2. **Copy deployment scripts** dari folder ini
3. **Jalankan setup** di Windows Server

## 📋 File yang Diperlukan

### Core Files (wajib):
- `setup-complete.bat`
- `setup-windows-server.bat`
- `setup-apache.bat`
- `setup-firewall.bat`
- `setup-service.bat`

### Optional Files:
- `test-server.bat` - untuk testing
- `update-app.bat` - untuk maintenance
- `.env.windows-server` - template environment
- `apache-vhost.conf` - konfigurasi Apache

## 🔧 Prerequisites di Windows Server

### Software yang harus diinstall:
1. **Node.js 18+ LTS** - https://nodejs.org
2. **Git for Windows** - https://git-scm.com
3. **XAMPP for Windows** - https://www.apachefriends.org
4. **NSSM** - https://nssm.cc (untuk Windows Service)

### System Requirements:
- Windows Server 2016 atau lebih baru
- 4GB RAM minimum
- 10GB disk space
- Administrator privileges

## 🚀 Setup Instructions

### Step 1: Persiapan
```batch
# Buat folder project
mkdir C:\projects
cd C:\projects

# Download/copy deployment files
# Pastikan semua file .bat ada di folder ini
```

### Step 2: Jalankan Setup
```batch
# Ganti IP dengan IP server Anda
setup-complete.bat 192.168.1.100
```

### Step 3: Verifikasi
```batch
# Test aplikasi
test-server.bat 192.168.1.100

# Cek service
sc query MonitoringApp
```

## 📱 Akses dari Klien

Setelah setup selesai:
- **URL**: `http://IP_SERVER` (contoh: http://192.168.1.100)
- **Login**: Gunakan kredensial yang ada di aplikasi
- **Mobile**: Buka di browser mobile

## 🔄 Maintenance

### Update Aplikasi:
```batch
# Update otomatis
update-app.bat

# Atau manual
git pull origin master
npm install
npm run build
net stop MonitoringApp && net start MonitoringApp
```

### Troubleshooting:
```batch
# Cek logs
type C:\projects\monitoring-biaya-rs\logs\service.log

# Restart service
net stop MonitoringApp && net start MonitoringApp

# Test koneksi
test-server.bat
```

## 🎯 Keuntungan Package Ini

✅ **No Large Files** - Tidak ada node_modules atau build files
✅ **One-Click Setup** - Cukup jalankan satu script
✅ **Auto-Configuration** - Apache, Firewall, Service otomatis
✅ **Production Ready** - Konfigurasi untuk production
✅ **Easy Maintenance** - Scripts untuk update dan backup
✅ **Lightweight** - Hanya beberapa KB total size

## 📞 Support

Jika ada masalah:
1. Cek `WINDOWS_SERVER_DEPLOYMENT.md` untuk panduan lengkap
2. Jalankan `test-server.bat` untuk diagnostics
3. Cek logs di `C:\projects\monitoring-biaya-rs\logs\`
4. Restart service: `net stop MonitoringApp && net start MonitoringApp`

---

## 🎉 Siap Digunakan!

Package ini dirancang khusus untuk mempermudah deployment di Windows Server tanpa perlu memahami technical details. Cukup ikuti langkah-langkah di atas dan aplikasi Anda akan running dalam beberapa menit! 🚀