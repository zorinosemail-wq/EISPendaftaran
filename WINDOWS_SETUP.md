# 🪟 Windows Setup Instructions

## 🔧 Cara Menjalankan Aplikasi di Windows

### Prerequisites
Pastikan Anda sudah menginstall:
- **Node.js** (versi 18 atau lebih tinggi) - [Download here](https://nodejs.org/)
- **Git** (opsional) - [Download here](https://git-scm.com/)

### 📋 Langkah-langkah Instalasi

1. **Buka Command Prompt atau PowerShell**
   - Tekan `Win + R`, ketik `cmd` atau `powershell`, lalu Enter
   - Atau klik kanan di folder project dan pilih "Open in Terminal"

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi**
   - Buka browser (Chrome, Firefox, Edge)
   - Akses `http://localhost:3000`

### 🚀 Commands yang Tersedia

```bash
# Jalankan development server
npm run dev

# Jalankan development server dengan log file
npm run dev:log

# Build untuk production
npm run build

# Jalankan production server
npm run start

# Cek code quality
npm run lint
```

### 🛠️ Jika Ada Masalah

#### 1. Error 'tee' is not recognized
✅ **Sudah diperbaiki!** Script sudah diupdate untuk kompatibel dengan Windows.

#### 2. Port 3000 sudah digunakan
```bash
# Cari proses yang menggunakan port 3000
netstat -ano | findstr :3000

# Kill proses tersebut (ganti XXXX dengan PID)
taskkill /PID XXXX /F
```

#### 3. Permission denied
```bash
# Jalankan sebagai Administrator
# Klik kanan pada Command Prompt -> "Run as administrator"
```

#### 4. Module not found
```bash
# Clear cache dan reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 📁 Struktur Folder yang Penting

```
my-project/
├── src/
│   ├── app/                    # Halaman dan API routes
│   ├── components/             # Komponen React
│   └── lib/                    # Utility functions
├── public/                     # Static files
├── package.json               # Dependencies dan scripts
└── WINDOWS_SETUP.md          # File ini
```

### 🌐 Akses Aplikasi

Setelah server berjalan, Anda bisa mengakses:

- **Main App**: `http://localhost:3000`
- **API Health Check**: `http://localhost:3000/api/health`

### 📊 Cara Menggunakan Aplikasi

1. **Pilih Tanggal**
   - Klik field "Tanggal Awal" dan pilih tanggal
   - Klik field "Tanggal Akhir" dan pilih tanggal

2. **Pilih Instalasi**
   - Pilih salah satu:
     - Instalasi Gawat Darurat (01)
     - Instalasi Rawat Jalan (02)
     - Instalasi Rawat Inap (03)

3. **Tampilkan Laporan**
   - Klik tombol "Tampilkan Laporan"
   - Tunggu proses pengambilan data

4. **Lihat Hasil**
   - **Tab Dashboard Analisa**: Grafik dan statistik
   - **Tab Data Lengkap**: Tabel detail dengan filter

### 🔍 Troubleshooting Lanjutan

#### Cek Log Error
```bash
# Lihat log development
npm run dev:log

# Buka file dev.log
type dev.log
```

#### Restart Server
- Di terminal yang menjalankan server, tekan `Ctrl + C`
- Jalankan kembali `npm run dev`

#### Clear Browser Cache
- Tekan `Ctrl + Shift + R` (hard refresh)
- Atau buka in-private/incognito window

### 💡 Tips untuk Windows

1. **Use PowerShell** untuk experience yang lebih baik daripada Command Prompt
2. **Install Windows Terminal** dari Microsoft Store untuk terminal yang lebih modern
3. **Enable Developer Mode** di Windows untuk fitur tambahan
4. **Use VS Code** sebagai editor dengan integrated terminal

### 🆘 Jika Masalah Berlanjut

Jika Anda masih mengalami masalah:

1. **Screenshot error** yang muncul
2. **Copy paste error message** dari terminal
3. **Cek Node.js version** dengan `node --version`
4. **Cek npm version** dengan `npm --version`

Pastikan Node.js versi 18+ dan npm versi 8+.

---

**Selamat menggunakan aplikasi Monitoring Biaya Rumah Sakit! 🏥**