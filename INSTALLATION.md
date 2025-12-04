# 📦 Kurulum Kılavuzu

Doçentlik Yolu uygulamasını yerel bilgisayarınıza veya sunucunuza kurmak için adım adım rehber.

---

## 🎯 Hızlı Başlangıç

### 1. Projeyi İndirin
```bash
git clone https://github.com/bcankara/docentlik-yolu.git
cd docentlik-yolu
```

### 2. Konfigürasyonu Ayarlayın
```bash
# Config dosyasını kopyalayın
cp config.php.example config.php

# Düzenleyin (herhangi bir text editor ile)
nano config.php  # veya notepad, vim, vscode, vs.
```

**config.php içeriğini güncelleyin:**
```php
<?php
define('ADMIN_USERNAME', 'admin');           // İstediğiniz kullanıcı adı
define('ADMIN_PASSWORD', 'güçlü_şifre_123'); // GÜÇ LÜ bir şifre belirleyin!
define('SESSION_TIMEOUT', 3600);             // 1 saat (3600 saniye)
define('DATA_DIR', __DIR__ . '/data');
define('CRITERIA_DIR', __DIR__ . '/kriterler');
?>
```

⚠️ **ÖNEMLİ**: `config.php` dosyası `.gitignore`'da olduğu için GitHub'a yüklenmeyecektir. Bu güvenlik için önemlidir!

### 3. PHP Sunucuyu Başlatın
```bash
php -S localhost:8080
```

### 4. Tarayıcıda Açın
```
http://localhost:8080
```

---

## 🖥️ Sistem Gereksinimleri

### Minimum Gereksinimler
- **PHP**: 7.4 veya üzeri
- **Disk Alanı**: ~5 MB
- **Bellek**: 128 MB RAM
- **Tarayıcı**: Modern web tarayıcı
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

### Önerilen Gereksinimler
- **PHP**: 8.0 veya üzeri
- **Web Sunucu**: Apache 2.4+ veya Nginx 1.18+
- **Disk Alanı**: 10 MB (veri artışına göre)

---

## 🔧 Detaylı Kurulum Senaryoları

### Senaryo 1: Yerel Geliştirme (Windows)

#### Adım 1: PHP Kurulumu
1. [PHP for Windows](https://windows.php.net/download/) adresinden PHP indirin
2. ZIP dosyasını `C:\php` klasörüne çıkartın
3. Sistem değişkenlerine `C:\php` ekleyin
4. CMD'de test edin: `php -v`

#### Adım 2: Projeyi Hazırlayın
```cmd
cd C:\Users\YourName\Documents
git clone https://github.com/kullanici-adi/docentlik-yolu.git
cd docentlik-yolu

# Config dosyası oluştur
copy config.php.example config.php
notepad config.php
```

#### Adım 3: Çalıştırın
```cmd
php -S localhost:8080
```

### Senaryo 2: Yerel Geliştirme (macOS/Linux)

```bash
# PHP genellikle önceden yüklüdür, kontrol edin:
php -v

# Proje kurulumu
cd ~/Projects
git clone https://github.com/kullanici-adi/docentlik-yolu.git
cd docentlik-yolu

# Config ayarlama
cp config.php.example config.php
nano config.php  # veya vim, code, vs.

# İzinleri ayarla
chmod 755 data/

# Çalıştır
php -S localhost:8080
```

### Senaryo 3: XAMPP ile (Windows/macOS)

#### Adım 1: XAMPP Kurulumu
1. [XAMPP](https://www.apachefriends.org/) indirin ve kurun
2. XAMPP Control Panel'i açın
3. Apache'yi başlatın

#### Adım 2: Proje Yerleşimi
```bash
# Windows
cd C:\xampp\htdocs
git clone https://github.com/kullanici-adi/docentlik-yolu.git

# macOS
cd /Applications/XAMPP/htdocs
git clone https://github.com/kullanici-adi/docentlik-yolu.git
```

#### Adım 3: Konfigürasyon
```bash
cd docentlik-yolu
cp config.php.example config.php
# Düzenleyin
```

#### Adım 4: Erişim
```
http://localhost/docentlik-yolu
```

### Senaryo 4: Docker ile

`Dockerfile` oluşturun:
```dockerfile
FROM php:8.0-apache
COPY . /var/www/html/
RUN chmod 755 /var/www/html/data
EXPOSE 80
```

`docker-compose.yml`:
```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html/data
```

Çalıştırın:
```bash
docker-compose up
```

---

## 🗂️ Klasör İzinleri

### Linux/macOS
```bash
# data klasörü yazılabilir olmalı
chmod 755 data/

# Tüm dosyaların sahibi web sunucu kullanıcısı olmalı
sudo chown -R www-data:www-data .  # Apache
sudo chown -R nginx:nginx .        # Nginx
```

### Windows
- Genellikle ek izin ayarına gerek yoktur
- Eğer sorun varsa, klasöre "Tam Denetim" verin

---

## 🌐 Sunucu Üretim Ortamı

### Apache Ayarları

`.htaccess` dosyası (zaten dahil):
```apache
# Güvenlik
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>

# Pretty URLs için (opsiyonel)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

### Nginx Ayarları

`/etc/nginx/sites-available/docentlik-yolu`:
```nginx
server {
    listen 80;
    server_name docentlik.example.com;
    root /var/www/docentlik-yolu;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index api.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # Güvenlik
    location ~ /config\.php$ {
        deny all;
    }

    location ~ /data/.*\.json$ {
        deny all;
    }
}
```

### SSL/HTTPS Kurulumu (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d docentlik.example.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 🔐 Güvenlik Ayarları

### 1. Güçlü Şifre Belirleme
```php
// config.php
define('ADMIN_PASSWORD', 'aA1!bB2@cC3#'); // En az 12 karakter, karışık
```

### 2. HTTPS Kullanımı
- Üretim ortamında **mutlaka HTTPS** kullanın
- Let's Encrypt ile ücretsiz SSL

### 3. Dosya İzinleri
```bash
# Sadece gerekli klasörler yazılabilir
chmod 755 data/
chmod 644 *.php *.html *.json *.css *.js
```

### 4. Güvenlik Duvarı
Sadece gerekli portları açın:
- 80 (HTTP)
- 443 (HTTPS)

---

## 📊 Veri Yedekleme

### Manuel Yedekleme
```bash
# Tüm kullanıcı verilerini yedekle
cp -r data/ backup/data-$(date +%Y%m%d)/
```

### Otomatik Yedekleme (cron)
```bash
# /etc/crontab
0 2 * * * cd /var/www/docentlik-yolu && tar -czf ~/backups/docentlik-$(date +\%Y\%m\%d).tar.gz data/
```

### Cloud Backup (Dropbox, Google Drive)
```bash
# rclone ile
rclone copy data/ dropbox:docentlik-backups/
```

---

## 🐛 Sorun Giderme

### Hata: "Permission denied" (data klasörü)
**Çözüm:**
```bash
chmod 755 data/
sudo chown www-data:www-data data/  # Linux
```

### Hata: "Call to undefined function session_start()"
**Çözüm:** PHP session extension aktif değil
```bash
# php.ini dosyasını düzenle
; session.save_path = "/tmp"  # Bu satırın önündeki ; işaretini kaldır
```

### Hata: "404 Not Found" (api.php)
**Çözüm:** Web sunucu yapılandırması
- Apache: `.htaccess` aktif mi?
- Nginx: try_files doğru mu?

### Şifremi Unuttum!
**Çözüm:**
1. `config.php` dosyasını açın
2. `ADMIN_PASSWORD` değerini değiştirin
3. Kaydedin, sunucuyu yeniden başlatın

---

## ✅ Kurulum Kontrolü

Tüm adımları tamamladıktan sonra:

1. **Tarayıcıda açın**: `http://localhost:8080`
2. **Login ekranı görünüyor mu?** ✅
3. **"Ziyaretçi Olarak Devam" çalışıyor mu?** ✅
4. **Progress bar efektleri var mı?** ✅
5. **Quest kartlarına tıklanabiliyor mu?** ✅
6. **Admin giriş yapılabiliyor mu?** ✅
7. **Veriler kaydediliyor mu?** ✅
8. **Alan değişimi çalışıyor mu?** ✅

Hepsi ✅ ise kurulum başarılı! 🎉

---

## 📞 Yardım

Sorun mu yaşıyorsunuz?
1. [README.md](README.md) dosyasını okuyun
2. Bu dosyada ilgili bölümü kontrol edin
3. GitHub Issues'da arayın
4. Yeni issue açın (hata detayları ile)

---

**İyi çalışmalar! 🎓**
