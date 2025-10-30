#!/bin/bash

echo "🚀 GitHub Setup - Automated Script"
echo "================================="

# Input username
read -p "Masukkan GitHub username Anda: " USERNAME

if [ -z "$USERNAME" ]; then
    echo "❌ Username tidak boleh kosong!"
    echo "📖 Panduan manual ada di GITHUB_SETUP_GUIDE.md"
    exit 1
fi

REPO_URL="https://github.com/$USERNAME/monitoring-biaya-rs.git"

echo "🔗 Repository URL: $REPO_URL"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote origin already exists"
    read -p "Hapus dan setup ulang? (y/N): " REMOVE_REMOTE
    if [[ $REMOVE_REMOTE =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Remote origin dihapus"
    else
        echo "📤 Mencoba push ke remote yang ada..."
        git push -u origin master
        exit $?
    fi
fi

# Add remote
echo "🔗 Menambahkan remote origin..."
git remote add origin $REPO_URL

# Push to GitHub
echo "📤 Push ke GitHub..."
echo "Pastikan repository sudah dibuat di GitHub:"
echo "  - URL: https://github.com/new"
echo "  - Name: monitoring-biaya-rs"
echo "  - Jangan centang 'Add a README file'"
echo ""

read -p "Tekan Enter untuk melanjutkan push..."

git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Repository berhasil di-push!"
    echo "🌐 URL: https://github.com/$USERNAME/monitoring-biaya-rs"
    echo ""
    echo "📋 Next steps:"
    echo "1. Kunjungi repository Anda"
    echo "2. Import ke Vercel: https://vercel.com/new"
    echo "3. Setup environment variables"
    echo "4. Deploy!"
else
    echo ""
    echo "❌ Push gagal!"
    echo "📖 Troubleshooting:"
    echo "1. Pastikan repository sudah dibuat di GitHub"
    echo "2. Pastikan repository kosong (tidak ada README)"
    echo "3. Periksa GitHub credentials Anda"
    echo "4. Coba: git push -u origin master --force"
    echo ""
    echo "📖 Panduan lengkap: GITHUB_SETUP_GUIDE.md"
fi