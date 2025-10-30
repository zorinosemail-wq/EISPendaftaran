#!/bin/bash

echo "🔍 Git Debugging Commands"
echo "========================"

echo "📁 Current status:"
git status

echo -e "\n🌿 Current branches:"
git branch -a

echo -e "\n🔗 Remote repositories:"
git remote -v

echo -e "\n📊 Recent commits:"
git log --oneline -3

echo -e "\n🔧 Setup commands:"
echo "git remote add origin https://github.com/USERNAME/monitoring-biaya-rs.git"
echo "git push -u origin master"

echo -e "\n📝 Jika error, coba:"
echo "1. Pastikan repository sudah dibuat di GitHub"
echo "2. Ganti USERNAME dengan GitHub username Anda"
echo "3. Pastikan repository kosong (tidak ada README)"