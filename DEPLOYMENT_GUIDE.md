# 📋 Panduan Deploy ke GitHub & Vercel

## 🚀 Langkah 1: Push ke GitHub

### Opsi A: Manual (Tanpa GitHub CLI)
```bash
# 1. Buat repository baru di GitHub.com
# - Kunjungi https://github.com/new
# - Repository name: monitoring-biaya-rs
# - Pilih Public/Private
# - Jangan centang "Add a README file"
# - Klik "Create repository"

# 2. Connect local repository ke GitHub
git remote add origin https://github.com/USERNAME_ANDA/monitoring-biaya-rs.git
git branch -M main
git push -u origin main
```

### Opsi B: Dengan GitHub CLI (Jika sudah terinstall)
```bash
# 1. Login ke GitHub
gh auth login

# 2. Buat repository dan push
gh repo create monitoring-biaya-rs --public --description "Sistem Monitoring Biaya Rumah Sakit" --source=. --remote=origin --push
```

## 🔧 Langkah 2: Persiapkan Environment Variables

### Buat file .env.production
```bash
# Environment Variables untuk Production
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Database Configuration
DATABASE_URL=your_production_database_url_here

# API Configuration
API_BASE_URL=https://your-api-domain.com
```

### Generate NextAuth Secret
```bash
# Generate random secret
openssl rand -base64 32
# Atau gunakan online generator
```

## 🌐 Langkah 3: Deploy ke Vercel

### Opsi A: Via Vercel CLI
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy project
vercel

# 4. Setup environment variables di Vercel Dashboard
# - Kunjungi https://vercel.com/dashboard
# - Pilih project Anda
# - Settings → Environment Variables
# - Tambahkan semua variabel dari .env.production
```

### Opsi B: Via Vercel Website (Recommended)
1. **Kunjungi https://vercel.com**
2. **Login dengan GitHub**
3. **Import GitHub Repository**
   - Klik "Add New..." → "Project"
   - Pilih repository `monitoring-biaya-rs`
   - Klik "Import"

4. **Configure Project**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

5. **Environment Variables**
   - Tambahkan semua variabel dari file `.env.production`
   - Klik "Add" untuk setiap variabel

6. **Deploy**
   - Klik "Deploy"
   - Tunggu proses deployment selesai

## 🎯 Langkah 4: Konfigurasi Tambahan

### Custom Domain (Opsional)
1. Di Vercel Dashboard → Settings → Domains
2. Tambahkan custom domain Anda
3. Update DNS records

### Auto-Deploy Setup
- Setiap push ke branch `main` akan otomatis trigger deploy
- Pull request akan membuat preview deployment

## 📊 Langkah 5: Testing Production

### Checklist Testing:
- [ ] Login page berfungsi
- [ ] Dashboard load dengan benar
- [ ] API endpoints berfungsi
- [ ] Database connection berhasil
- [ ] Responsive design di mobile/desktop
- [ ] Form validation berfungsi

### Monitor Performance:
- Kunjungi [Vercel Analytics](https://vercel.com/analytics)
- Monitor [Vercel Logs](https://vercel.com/logs)

## 🔄 Langkah 6: CI/CD Setup

### GitHub Actions (Opsional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Selamat! Project Anda sudah live! 🎉

### Next Steps:
1. **Monitor performance** dengan Vercel Analytics
2. **Setup error tracking** dengan Sentry (opsional)
3. **Backup database** secara berkala
4. **Update dependencies** secara berkala
5. **Monitor security** dengan dependabot

### Useful Links:
- 📊 Vercel Dashboard: https://vercel.com/dashboard
- 📈 Analytics: https://vercel.com/analytics
- 📝 Documentation: https://nextjs.org/docs
- 🎨 Tailwind CSS: https://tailwindcss.com/docs