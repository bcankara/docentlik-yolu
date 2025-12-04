# 🤝 Katkıda Bulunma Rehberi

Doçentlik Yolu projesine katkıda bulunmak istediğiniz için teşekkürler! Bu belge, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler
- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunurum?](#nasıl-katkıda-bulunurum)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Standartları](#kod-standartları)
- [Pull Request Süreci](#pull-request-süreci)

---

## 🤗 Davranış Kuralları

Bu proje açık kaynaklı bir topluluk projesidir. Herkesin saygılı ve yapıcı olmasını bekliyoruz.

- ✅ Saygılı ve yapıcı olun
- ✅ Farklı görüşlere açık olun
- ✅ Hataları kibarca bildirin
- ❌ Saldırgan dil kullanmayın
- ❌ Spam yapmayın

---

## 🚀 Nasıl Katkıda Bulunurum?

### 1. Issues (Sorunlar)

**Hata Bildirme:**
- GitHub Issues bölümünde yeni bir issue açın
- Hatayı nasıl oluşturabileceğimizi açıklayın
- Ekran görüntüleri ekleyin
- Tarayıcı ve sistem bilgilerinizi belirtin

**Özellik İsteği:**
- Yeni bir issue açın
- Özelliği detaylıca açıklayın
- Neden gerekli olduğunu belirtin
- Mümkünse mockup/örnek ekleyin

### 2. Fork & Clone

```bash
# Projeyi fork edin (GitHub web arayüzünden)
# Sonra fork'unuzu klonlayın:
git clone https://github.com/SIZIN-KULLANICI-ADINIZ/docentlik-yolu.git
cd docentlik-yolu

# Upstream remote ekleyin
git remote add upstream https://github.com/bcankara/docentlik-yolu.git
```

### 3. Branch Oluşturun

```bash
# Ana branch'ten yeni bir branch oluşturun
git checkout -b feature/yeni-ozellik
# veya
git checkout -b fix/hata-duzeltmesi
```

Branch isimlendirme:
- `feature/` - Yeni özellikler için
- `fix/` - Hata düzeltmeleri için
- `docs/` - Dokümantasyon için
- `style/` - CSS/UI değişiklikleri için
- `refactor/` - Code refactoring için

### 4. Değişikliklerinizi Yapın

```bash
# Kodunuzu yazın
# Test edin
# Commit edin
git add .
git commit -m "feat: yeni özellik eklendi"
```

Commit mesajları:
- `feat:` - Yeni özellik
- `fix:` - Hata düzeltmesi
- `docs:` - Dokümantasyon
- `style:` - CSS/Stil değişikliği
- `refactor:` - Kod yeniden yapılandırma
- `test:` - Test ekleme/düzeltme
- `chore:` - Genel bakım

### 5. Push & Pull Request

```bash
# Değişiklikleri fork'unuza push edin
git push origin feature/yeni-ozellik

# GitHub'da Pull Request açın
```

---

## 💻 Geliştirme Ortamı

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/bcankara/docentlik-yolu.git
cd docentlik-yolu

# Config dosyası oluşturun
cp config.php.example config.php

# Sunucuyu başlatın
php -S localhost:8080
```

### Test Etme

- Tarayıcıda `http://localhost:8080` açın
- Hem admin hem ziyaretçi modunda test edin
- Her iki alanı (Mühendislik, Sosyal Bilimler) test edin
- Mobil görünümü test edin (responsive)
- PWA kurulumunu test edin

---

## 📏 Kod Standartları

### PHP
- PSR-2 kod standardı
- Türkçe yorumlar
- Fonksiyon isimleri camelCase

```php
// İyi ✅
function getUserProgress($userId) {
    // Kullanıcı verilerini al
    return $data;
}

// Kötü ❌
function get_user_progress($user_id) {
    return $data;
}
```

### JavaScript
- ES6+ syntax
- Modüler yapı
- Türkçe yorumlar
- camelCase isimlendirme

```javascript
// İyi ✅
const calculatePoints = (tasks) => {
    // Puan hesapla
    return total;
};

// Kötü ❌
function calculate_points(tasks) {
    return total;
}
```

### CSS
- BEM isimlendirme (mümkünse)
- Değişkenler (CSS Custom Properties)
- Mobile-first yaklaşım
- Türkçe yorumlar

```css
/* İyi ✅ */
.quest-card {
    /* Quest kartı stilleri */
}

.quest-card__title {
    /* Başlık stili */
}

/* Kötü ❌ */
.qc {
    /* ... */
}
```

### Dosya Yapısı

Yeni dosyalar eklerken:
- CSS → `css/` klasörü
- JS → `js/` klasörü
- JSON kriterler → `kriterler/` klasörü
- Assets → `assets/` klasörü

---

## 🔍 Pull Request Süreci

### PR Checklist

PR göndermeden önce:

- [ ] Kodunuz çalışıyor
- [ ] Testler geçiyor (manuel test)
- [ ] Dokümantasyon güncel
- [ ] Commit mesajları anlamlı
- [ ] README güncel (gerekirse)
- [ ] Yorumlar Türkçe
- [ ] Console.log'lar temizlendi

### PR Şablonu

```markdown
## Değişiklik Türü
- [ ] Yeni özellik
- [ ] Hata düzeltmesi
- [ ] Dokümantasyon
- [ ] Stil/CSS
- [ ] Refactoring

## Açıklama
[Değişikliği açıklayın]

## Test Adımları
1. [Adım 1]
2. [Adım 2]

## Ekran Görüntüleri
[Varsa ekleyin]

## İlgili Issue
Closes #[issue numarası]
```

### Review Süreci

1. PR açılır
2. Otomatik kontroller çalışır
3. Maintainer review yapar
4. Gerekirse değişiklik istenir
5. Merge edilir

---

## 🎯 Ne Üzerine Çalışılabilir?

### Öncelikli Konular

- [ ] **ÜAK Kural Motoru**: Detaylı kural kontrolü (başlıca yazar, minimum puan)
- [ ] **Co-authorship Hesaplama**: Ortak yazarlı çalışmalarda puan bölüşümü
- [ ] **Import/Export**: JSON import/export özelliği
- [ ] **Raporlama**: PDF rapor oluşturma
- [ ] **Bildirimler**: Email bildirimleri
- [ ] **Multi-user**: Çok kullanıcılı sistem (opsiyonel)

### Düşük Öncelikli

- [ ] Daha fazla alan desteği
- [ ] Tema seçenekleri
- [ ] Dashboard grafikleri
- [ ] İstatistikler sayfası
- [ ] Gelişmiş filtreleme

### Dokümantasyon

- [ ] Video tutorial
- [ ] İngilizce README
- [ ] API dokümantasyonu
- [ ] Daha fazla örnek

---

## 📞 İletişim

- **GitHub Issues**: Sorular ve öneriler için
- **Pull Requests**: Kod katkıları için
- **Discussions**: Genel tartışmalar için

---

## 🏆 Katkıda Bulunanlar

Tüm katkıda bulunanlara teşekkürler! ❤️

[//]: # (GitHub otomatik olarak contributors listesini gösterir)

---

**Mutlu kodlamalar! 🎉**
