#!/bin/bash

# 🚀 Create Deployment Package Script
# Script ini membuat package deployment yang ringkas untuk Windows Server

echo "📦 Creating Deployment Package for Windows Server"
echo "================================================="

# Create deployment package directory
PACKAGE_DIR="deployment-package-windows"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

echo "📁 Copying deployment files..."

# Copy essential deployment scripts
cp setup-complete.bat $PACKAGE_DIR/
cp setup-windows-server.bat $PACKAGE_DIR/
cp setup-apache.bat $PACKAGE_DIR/
cp setup-firewall.bat $PACKAGE_DIR/
cp setup-service.bat $PACKAGE_DIR/
cp test-server.bat $PACKAGE_DIR/
cp update-app.bat $PACKAGE_DIR/

# Copy configuration files
cp .env.windows-server $PACKAGE_DIR/
cp apache-vhost.conf $PACKAGE_DIR/

# Copy documentation
cp WINDOWS_SERVER_DEPLOYMENT.md $PACKAGE_DIR/
cp DEPLOYMENT_PACKAGE_README.md $PACKAGE_DIR/

# Copy source code (tanpa node_modules dan build files)
echo "📂 Copying source code..."
mkdir -p $PACKAGE_DIR/src

# Copy essential source files
cp -r src/ $PACKAGE_DIR/src/
cp package.json $PACKAGE_DIR/
cp package-lock.json $PACKAGE_DIR/
cp tsconfig.json $PACKAGE_DIR/
cp tailwind.config.ts $PACKAGE_DIR/
cp next.config.mjs $PACKAGE_DIR/
cp prisma/schema.prisma $PACKAGE_DIR/

# Copy root files
cp README.md $PACKAGE_DIR/
cp .gitignore $PACKAGE_DIR/

# Create quick setup script
cat > $PACKAGE_DIR/QUICK_SETUP.txt << 'EOF'
🚀 QUICK SETUP FOR WINDOWS SERVER

1. Copy folder ini ke C:\projects\monitoring-biaya-rs di Windows Server
2. Install prerequisites:
   - Node.js 18+ dari https://nodejs.org
   - XAMPP dari https://www.apachefriends.org
   - NSSM dari https://nssm.cc
3. Buka Command Prompt as Administrator
4. Jalankan: setup-complete.bat 192.168.1.100
5. Test akses: http://192.168.1.100

📖 Panduan lengkap: WINDOWS_SERVER_DEPLOYMENT.md
🧪 Testing: test-server.bat
🔄 Update: update-app.bat
EOF

# Create zip package
echo "🗜️ Creating deployment package..."
cd $PACKAGE_DIR
zip -r ../monitoring-biaya-rs-windows-deployment.zip .
cd ..

echo "✅ Deployment package created!"
echo "📁 Package location: $PACKAGE_DIR/"
echo "📦 Zip file: monitoring-biaya-rs-windows-deployment.zip"
echo ""
echo "📋 Package contents:"
du -sh $PACKAGE_DIR/*
echo ""
echo "🚀 Next steps:"
echo "1. Upload monitoring-biaya-rs-windows-deployment.zip ke Windows Server"
echo "2. Extract di C:\projects\monitoring-biaya-rs"
echo "3. Jalankan setup-complete.bat"
echo ""
echo "📊 Package size:"
du -sh monitoring-biaya-rs-windows-deployment.zip