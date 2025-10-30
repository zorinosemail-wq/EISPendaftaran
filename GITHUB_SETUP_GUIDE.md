# 🚀 Setup GitHub Repository - Panduan Lengkap

## Langkah 1: Buat Repository di GitHub

1. **Kunjungi**: https://github.com/new
2. **Isi form**:
   - Repository name: `monitoring-biaya-rs`
   - Description: `Sistem Monitoring Biaya Rumah Sakit dengan Next.js 15`
   - Pilih Public atau Private
   - **JANGAN centang "Add a README file"**
   - **JANGAN centang "Add .gitignore"**
   - **JANGAN centang "Choose a license"**
3. **Klik "Create repository"**

## Langkah 2: Hubungkan Local Repository

Setelah repository dibuat, GitHub akan menampilkan halaman dengan commands. Gunakan commands ini:

```bash
# Ganti USERNAME dengan GitHub username Anda
git remote add origin https://github.com/USERNAME/monitoring-biaya-rs.git

# Push branch master (karena branch lokal Anda adalah master)
git push -u origin master
```

## Langkah 3: Verifikasi

```bash
# Cek remote
git remote -v

# Cek branch
git branch -a

# Status
git status
```

## Jika Error Terjadi

### Error: "origin already exists"
```bash
# Hapus remote lama
git remote remove origin

# Tambah remote baru
git remote add origin https://github.com/USERNAME/monitoring-biaya-rs.git

# Push
git push -u origin master
```

### Error: "failed to push some refs"
```bash
# Force push (hanya jika repository kosong)
git push -u origin master --force
```

### Error: "Authentication failed"
```bash
# Setup GitHub credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Atau gunakan GitHub CLI
gh auth login
```

## Alternative: Rename Branch ke Main

Jika Anda ingin menggunakan branch `main`:

```bash
# Rename branch master ke main
git branch -M main

# Push ke main
git push -u origin main
```

## Setelah Success

Jika push berhasil, Anda akan melihat:
```
Enumerating objects: 123, done.
Counting objects: 100% (123/123), done.
Delta compression using up to 8 threads
Compressing objects: 100% (85/85), done.
Writing objects: 100% (123/123), 45.67 KiB | 2.34 MiB/s, done.
Total 123 (delta 45), reused 0 (delta 0), pack-reused 0
To https://github.com/USERNAME/monitoring-biaya-rs.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

## Next Steps

Setelah berhasil push ke GitHub:

1. **Kunjungi repository**: https://github.com/USERNAME/monitoring-biaya-rs
2. **Verifikasi files** terupload dengan benar
3. **Lanjut ke Vercel**: Import repository ke Vercel

---

🎉 **Selamat! Project Anda sekarang ada di GitHub!**