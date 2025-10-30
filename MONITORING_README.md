# Sistem Monitoring Biaya Rumah Sakit

Aplikasi web berbasis Next.js 15 dengan TypeScript untuk monitoring biaya dan analisa keuangan rumah sakit. Aplikasi ini mengintegrasikan data dari berbagai API eksternal untuk menyajikan laporan komprehensif tentang pelayanan pasien dan status verifikasi keuangan.

## 🚀 Fitur Utama

### 📊 Dashboard Analisa
- **Statistik Kunjungan**: Total pasien, total transaksi, total biaya
- **Grafik Status Periksa**: Distribusi status pemeriksaan pasien (Sudah/Belum/Batal)
- **Analisa Verifikasi**: Status validasi kasir dan verifikasi keuangan
- **Trend Analysis**: Grafik harian dan bulanan kunjungan pasien
- **Demografi Pasien**: Distribusi berdasarkan instalasi, ruangan, jenis pasien, kelas

### 📋 Tabel Data Virtualisasi
- **Virtual Scrolling**: Menangani data besar tanpa lag
- **Filter & Sort**: Filter berdasarkan kolom dan sorting multi-kriteria
- **Column Selector**: Pilih kolom yang ingin ditampilkan
- **Color Coding**: Pewarnaan otomatis berdasarkan status
- **Export Ready**: Siap untuk fitur export data

### 🔔 Progress Tracking
- **Real-time Progress**: Indikator proses pengambilan data
- **Batch Processing**: Pengolahan data per batch untuk optimasi
- **Error Handling**: Penanganan error yang user-friendly

## 🏗️ Arsitektur Teknis

### Frontend Stack
- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Charts**: Recharts
- **Virtualization**: @tanstack/react-virtual
- **State Management**: React Hooks

### Backend API
- **Authentication**: JWT Token management
- **Data Processing**: Batch processing dengan chunking
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: Built-in delays untuk prevent API overload

## 📡 API Integration

Aplikasi mengintegrasikan 5 API utama:

1. **API Login** (`/api/monitoring/login`)
   - Endpoint: `POST https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/auth/login`
   - Authentication dengan username/password

2. **API Data Pasien** (`/api/monitoring/pasien`)
   - Endpoint: `POST https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/MonitoringBiaya/GetDataPasien`
   - Filter berdasarkan tanggal dan instalasi

3. **API Biaya Tindakan** (`/api/monitoring/tindakan`)
   - Endpoint: `POST https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/MonitoringBiaya/GetBiayaTindakan`
   - Data per 100 NoPendaftaran

4. **API Biaya Obat** (`/api/monitoring/obat`)
   - Endpoint: `POST https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/MonitoringBiaya/GetBiayaObat`
   - Data per 100 NoPendaftaran

5. **API Verifikasi** (`/api/monitoring/verifikasi`)
   - Endpoint: `POST https://api-rsudbudhiasih.jakarta.go.id/MedisServices/api/MonitoringBiaya/GetVerif`
   - Data per 100 NoBKM

## 🔄 Alur Proses Data

### 1. Input Parameter
- Pilih tanggal awal dan akhir
- Pilih instalasi (01: Gawat Darurat, 02: Rawat Jalan, 03: Rawat Inap)

### 2. Batch Processing
- **Date Range Splitting**: Periode dipotong per 10 hari
- **Data Fetching**: Pengambilan data pasien per batch
- **Biaya Processing**: Data tindakan dan obat per 100 NoPendaftaran
- **Verification Update**: Data verifikasi per 100 NoBKM

### 3. Data Integration
- **Master Data**: Data pasien sebagai master
- **Join Logic**: Penggabungan berdasarkan NoPendaftaran
- **Status Calculation**: Perhitungan status validasi otomatis

### 4. Output Generation
- **Dashboard**: Visualisasi data dan grafik
- **Table**: Tabel detail dengan virtualisasi
- **Summary**: Ringkasan statistik

## 🎨 Status Color Coding

### Status Periksa
- 🟢 **Y (Sudah Diperiksa)**: Hijau
- 🟡 **T (Belum Diperiksa)**: Kuning  
- 🔴 **B (Batal Pemeriksaan)**: Merah

### Status Validasi
- 🔴 **Belum Validasi Kasir**: Merah
- 🟡 **Validasi Kasir**: Kuning
- 🟢 **Verifikasi Keuangan**: Hijau

## 📱 Cara Penggunaan

1. **Buka Aplikasi**: Akses `http://localhost:3000`
2. **Pilih Periode**: Pilih tanggal awal dan akhir
3. **Pilih Instalasi**: Pilih salah satu dari 3 instalasi
4. **Klik "Tampilkan Laporan"**: Tunggu proses pengambilan data
5. **Lihat Hasil**: 
   - Tab **Dashboard Analisa** untuk grafik dan statistik
   - Tab **Data Lengkap** untuk tabel detail

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── api/monitoring/
│   │   ├── login/route.ts          # API Login
│   │   ├── pasien/route.ts         # API Data Pasien
│   │   ├── tindakan/route.ts       # API Biaya Tindakan
│   │   ├── obat/route.ts           # API Biaya Obat
│   │   ├── verifikasi/route.ts     # API Verifikasi
│   │   └── process/route.ts        # Main Process API
│   └── page.tsx                    # Main Page
├── components/
│   ├── monitoring/
│   │   ├── monitoring-form.tsx     # Form Input
│   │   ├── monitoring-table.tsx    # Virtual Table
│   │   ├── monitoring-dashboard.tsx # Dashboard
│   │   └── progress-indicator.tsx  # Progress Component
│   └── ui/                         # shadcn/ui Components
```

## 🔧 Konfigurasi

### Environment Variables
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### API Configuration
- **Batch Size**: 100 records per request
- **Date Range**: 10 days per batch
- **Timeout**: Built-in delays untuk prevent API overload
- **Retry Logic**: Error handling dengan retry mechanism

## 📈 Performance Optimization

### Frontend
- **Virtual Scrolling**: Handle data besar tanpa performance degradation
- **Memoization**: React.useMemo untuk expensive calculations
- **Lazy Loading**: Komponen dimuat saat dibutuhkan
- **Debouncing**: Input debouncing untuk filter

### Backend
- **Batch Processing**: Process data dalam chunks
- **Parallel Processing**: Concurrent API calls dengan delay
- **Memory Management**: EfficientError Recovery**: Grace data processing
- **ful error handling

## 🚨 Error Handling

### Common Issues
1. **API Timeout**: Cek koneksi ke server eksternal
2. **Invalid Token**: Auto-refresh token mechanism
3. **Large Data**: Virtual scrolling untuk handle data besar
4. **Network Error**: Retry mechanism dengan exponential backoff

### Troubleshooting
- Cek console log untuk error details
- Verify API endpoints accessibility
- Monitor network tab untuk API calls
- Check server logs untuk backend errors

## 📝 Catatan Penting

1. **API Rate Limit**: Built-in delays untuk prevent API overload
2. **Data Validation**: Input validation sebelum processing
3. **Memory Usage**: Efficient data processing untuk large datasets
4. **Browser Compatibility**: Modern browser support
5. **Responsive Design**: Mobile-friendly interface

## 🤝 Kontribusi

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Dikembangkan dengan ❤️ menggunakan Next.js 15, TypeScript, dan Tailwind CSS**