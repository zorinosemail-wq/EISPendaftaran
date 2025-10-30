# 🏥 Sistem Monitoring Biaya Rumah Sakit

Aplikasi monitoring biaya rumah sakit yang modern dan komprehensif dengan Next.js 15, TypeScript, dan Tailwind CSS.

## ✨ Features

### 📊 **Dashboard Analytics**
- **Real-time Data Processing** - Streaming API dengan progress tracking
- **Financial Breakdown** - Analisis komponen biaya (Hutang Penjamin, Tanggungan RS, dll)
- **Status Periksa Analysis** - Tracking status pemeriksaan pasien
- **Top Ruangan Analysis** - Ruangan dengan kunjungan terbanyak
- **Trend Analysis** - Harian dan bulanan dengan visualisasi data

### 🎨 **Modern UI/UX**
- **Responsive Design** - Optimal di desktop, tablet, dan mobile
- **Dark Mode Support** - Tema terang/gelap dengan next-themes
- **Interactive Charts** - Visualisasi data dengan Recharts
- **Smooth Animations** - Framer Motion untuk transisi yang halus
- **Shadcn/ui Components** - Komponen UI yang modern dan konsisten

### 🔐 **Authentication & Security**
- **NextAuth.js** - Authentication system yang aman
- **Session Management** - Secure session handling
- **Role-based Access** - Kontrol akses berdasarkan peran

### ⚡ **Performance**
- **Batch Processing** - Optimized untuk 2000 records per batch
- **Streaming API** - Real-time progress updates
- **Memory Efficient** - Optimized data processing
- **Fast Loading** - Next.js 15 dengan App Router

## 🛠 Tech Stack

### **Core Framework**
- **Next.js 15** - React framework dengan App Router
- **TypeScript 5** - Type safety dan developer experience
- **React 19** - Modern React dengan concurrent features

### **Styling & UI**
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library

### **Data & State**
- **Prisma ORM** - Database toolkit
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **SQLite** - Local database (development)

### **Charts & Visualization**
- **Recharts** - Chart library for React
- **Custom Components** - Tailored visualization components

### **Authentication**
- **NextAuth.js v4** - Complete authentication solution

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

```bash
# Clone repository
git clone https://github.com/USERNAME/monitoring-biaya-rs.git
cd monitoring-biaya-rs

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Setup database
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"

# API Configuration
API_BASE_URL=http://localhost:3000
```

## 📱 Usage

### 1. **Login**
- Gunakan kredensial yang telah disediakan
- Sistem akan redirect ke dashboard setelah login berhasil

### 2. **Dashboard Navigation**
- **Ringkasan Utama** - Overview metrics dan KPIs
- **Analisa Status Periksa** - Detail status pemeriksaan
- **Breakdown Keuangan** - Komponen biaya detail
- **Grafik & Tabel** - Visualisasi data interaktif

### 3. **Data Monitoring**
- Pilih tanggal range dan instalasi
- Monitor real-time progress
- Export data untuk analisis lebih lanjut

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── monitoring/       # Monitoring components
│   └── charts/           # Chart components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── hooks/                # Custom hooks
└── types/                # TypeScript definitions
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:log      # Development with logging

# Building
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database

# Deployment
npm run deploy:vercel    # Deploy to Vercel production
npm run deploy:preview   # Deploy to Vercel preview

# Utilities
npm run generate:secret  # Generate NextAuth secret
npm run lint            # Run ESLint
```

### Database Schema

```prisma
model DataVerifikasiPelayanan {
  // Patient data
  NoPendaftaran    String
  NamaPasien       String
  TglPendaftaran   String
  
  // Status tracking
  StatusPeriksa    String // Y, T, B
  
  // Financial data
  TotalBiaya       Float
  TotalHutangPenjamin Float
  TotalTanggunganRS   Float
  TotalPembebasan     Float
  TotalHarusDiBayar   Float
  GrandTotal          Float
  
  // Room data
  RuanganPerawatan String
  // ... other fields
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables**
   ```env
   NEXTAUTH_SECRET=your_production_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   DATABASE_URL=your_production_database_url
   ```

### Manual Deployment

```bash
# Build project
npm run build

# Start production server
npm start
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics** - Built-in performance monitoring
- **Speed Insights** - Core Web Vitals tracking
- **Error Tracking** - Automatic error logging

### Database Monitoring
- **Prisma Studio** - Database browser
- **Query Performance** - Optimized database queries
- **Connection Pooling** - Efficient database connections

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Test thoroughly before deployment

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Vercel** - Deployment platform
- **Shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

For support and questions:

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/USERNAME/monitoring-biaya-rs/issues)
- 📖 Documentation: [Project Wiki](https://github.com/USERNAME/monitoring-biaya-rs/wiki)

---

<div align="center">
  <p>Made with ❤️ for Healthcare Industry</p>
  <p>© 2024 Sistem Monitoring Biaya Rumah Sakit</p>
</div>