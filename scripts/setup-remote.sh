#!/bin/bash

echo "🚀 Setup GitHub Remote Repository"
echo "================================"

# Ganti USERNAME dengan GitHub username Anda
read -p "Masukkan GitHub username Anda: " USERNAME

if [ -z "$USERNAME" ]; then
    echo "❌ Username tidak boleh kosong!"
    exit 1
fi

echo "📁 Menghubungkan ke repository: https://github.com/$USERNAME/monitoring-biaya-rs.git"

# Setup remote
git remote add origin https://github.com/$USERNAME/monitoring-biaya-rs.git

# Push master branch
echo "📤 Push branch master ke GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ Berhasil push ke GitHub!"
    echo "🌐 Repository: https://github.com/$USERNAME/monitoring-biaya-rs"
else
    echo "❌ Gagal push. Pastikan repository sudah dibuat di GitHub."
    echo "📝 Buat repository di: https://github.com/new"
    echo "   - Repository name: monitoring-biaya-rs"
    echo "   - Jangan centang 'Add a README file'"
    echo "   - Kemudian jalankan script ini lagi"
fi