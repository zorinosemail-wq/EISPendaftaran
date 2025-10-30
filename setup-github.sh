#!/bin/bash

# GitHub Setup Script
echo "🚀 Setup GitHub Repository untuk Monitoring Biaya RS"

# 1. Install GitHub CLI jika belum ada
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) belum terinstall"
    echo "Silakan install terlebih dahulu:"
    echo "  - Ubuntu/Debian: sudo apt install gh"
    echo "  - macOS: brew install gh"
    echo "  - Windows: Download dari https://cli.github.com/"
    exit 1
fi

# 2. Login ke GitHub
echo "📝 Login ke GitHub..."
gh auth login

# 3. Buat repository
echo "📁 Membuat repository..."
REPO_NAME="monitoring-biaya-rs"
gh repo create $REPO_NAME --public --description "Sistem Monitoring Biaya Rumah Sakit dengan Next.js 15, TypeScript, dan Tailwind CSS" --source=. --remote=origin --push

echo "✅ Repository berhasil dibuat: https://github.com/$(gh api user --jq '.login')/$REPO_NAME"
echo "🎉 Project siap di-deploy ke Vercel!"