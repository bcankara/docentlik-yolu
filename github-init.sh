#!/bin/bash
# GitHub'a İlk Yükleme Scripti

echo "🎮 Doçentlik Yolu - GitHub Yükleme"
echo "=================================="
echo ""

# Git init
echo "1️⃣ Git repository başlatılıyor..."
git init

# Dosyaları stage'e al
echo "2️⃣ Dosyalar ekleniyor..."
git add .

# İlk commit
echo "3️⃣ İlk commit yapılıyor..."
git commit -m "🎉 Initial commit - Doçentlik Yolu v1.0

- Modüler yapı (CSS, JS)
- PWA desteği
- Multi-alan desteği (Mühendislik, Sosyal Bilimler)
- Uzay oyunu temalı UI
- Roket egzozu efektleri
- Admin/Ziyaretçi mod
- Başarım sistemi
- Responsive tasarım"

# Branch adını main yap
echo "4️⃣ Main branch oluşturuluyor..."
git branch -M main

# Remote ekle
echo "5️⃣ GitHub remote ekleniyor..."
git remote add origin https://github.com/bcankara/docentlik-yolu.git

# Push
echo "6️⃣ GitHub'a yükleniyor..."
echo ""
echo "⚠️  Şimdi aşağıdaki komutu çalıştırın:"
echo "git push -u origin main"
echo ""
echo "✅ Hazır! GitHub'da repo'nuzu oluşturmayı unutmayın:"
echo "   https://github.com/new"
echo "   Repository name: docentlik-yolu"
