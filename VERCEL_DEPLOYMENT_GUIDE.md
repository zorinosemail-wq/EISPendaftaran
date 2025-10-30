# Vercel Deployment Guide

## 🚀 Deploy Hospital Monitoring System ke Vercel

### 📋 Persyaratan
- Akun Vercel (https://vercel.com)
- GitHub repository (sudah dioptimasi sebelumnya)
- Database eksternal (PostgreSQL) - Vercel Postgres atau Supabase

### 🔧 Langkah 1: Setup Database

#### Opsi 1: Vercel Postgres (Recommended)
1. Di dashboard Vercel, buka **Storage**
2. Klik **Create Database**
3. Pilih **Postgres**
4. Konfigurasi database
5. Copy `DATABASE_URL` dari dashboard

#### Opsi 2: Supabase
1. Buat akun di https://supabase.com
2. Buat project baru
3. Copy connection string dari Settings > Database

### 🔧 Langkah 2: Setup Environment Variables di Vercel

1. Di dashboard Vercel, buka project settings
2. Pergi ke **Environment Variables**
3. Tambahkan variables berikut:

```
NEXTAUTH_SECRET=generate_random_secret_minimum_32_characters
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 🔧 Langkah 3: Deploy ke Vercel

#### Metode 1: GitHub Integration (Recommended)
1. Klik **Add New Project** di Vercel
2. Import dari GitHub
3. Pilih repository hospital monitoring system
4. Vercel akan otomatis mendeteksi Next.js
5. Configure environment variables
6. Klik **Deploy**

#### Metode 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy dari root directory
vercel --prod
```

### 🔧 Langkah 4: Database Migration

Setelah deploy berhasil, jalankan migration:

```bash
# Generate Prisma client
prisma generate

# Push schema ke database
prisma db push

# Atau jalankan migration
prisma migrate deploy
```

### ⚠️ Limitations di Vercel

#### Socket.IO Limitations
- Socket.IO tidak fully supported di Vercel serverless
- Real-time features menggunakan Server-Sent Events (SSE)
- WebSocket connections tidak persistent

#### Database Limitations
- SQLite tidak supported di Vercel
- Harus menggunakan PostgreSQL eksternal
- Connection pooling recommended untuk production

### 🔧 Konfigurasi Khusus Vercel

#### 1. Next.js Config
```typescript
// next.config.ts
output: 'standalone',
experimental: {
  serverComponentsExternalPackages: ['socket.io'],
}
```

#### 2. Package.json Scripts
```json
{
  "build:vercel": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

#### 3. API Routes
- `/api/socket` - Socket.IO fallback endpoint
- `/api/realtime` - Server-Sent Events untuk real-time updates

### 🧪 Testing di Vercel

1. **Basic Functionality**
   - Buka URL deployment
   - Test login functionality
   - Test monitoring dashboard

2. **API Testing**
   ```bash
   # Health check
   curl https://your-domain.vercel.app/api/health
   
   # Real-time endpoint
   curl https://your-domain.vercel.app/api/realtime
   ```

3. **Database Connection**
   - Test CRUD operations
   - Verify data persistence

### 🚨 Troubleshooting

#### Common Issues

1. **Build Errors**
   ```bash
   # Check build logs di Vercel dashboard
   # Pastikan semua dependencies terinstall
   npm install
   ```

2. **Database Connection**
   ```bash
   # Verify DATABASE_URL format
   # Test connection locally
   prisma db pull
   ```

3. **Real-time Features**
   - Socket.IO tidak bekerja di production
   - Gunakan SSE endpoint sebagai alternatif

#### Error Solutions

1. **NEXTAUTH_URL Error**
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

2. **Database Timeout**
   - Gunakan connection pooling
   - Increase timeout di Vercel functions

3. **CORS Issues**
   - Headers sudah dikonfigurasi di vercel.json
   - Verify API endpoints

### 📊 Monitoring di Vercel

1. **Vercel Analytics**
   - Aktifkan di project settings
   - Monitor performance dan usage

2. **Logs**
   - View logs di Vercel dashboard
   - Monitor API route performance

3. **Database Monitoring**
   - Monitor connection usage
   - Optimize queries

### 🔄 Update Process

1. **Code Updates**
   ```bash
   git add .
   git commit -m "Update features"
   git push origin main
   ```

2. **Database Updates**
   ```bash
   # Create migration
   prisma migrate dev --name update
   
   # Deploy migration
   prisma migrate deploy
   ```

3. **Environment Updates**
   - Update variables di Vercel dashboard
   - Redeploy untuk apply changes

### 💡 Tips Production

1. **Performance**
   - Gunakan Vercel Edge Functions untuk static content
   - Optimize images dan assets

2. **Security**
   - Gunakan HTTPS (otomatis di Vercel)
   - Protect sensitive environment variables

3. **Scaling**
   - Vercel otomatis scaling
   - Monitor usage limits

### 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/deployment

---

## ✅ Deployment Checklist

- [ ] Setup PostgreSQL database
- [ ] Configure environment variables
- [ ] Update Prisma schema untuk PostgreSQL
- [ ] Test build locally
- [ ] Deploy ke Vercel
- [ ] Run database migrations
- [ ] Test semua functionality
- [ ] Monitor performance

**Selamat! Hospital Monitoring System Anda siap di production di Vercel! 🎉**