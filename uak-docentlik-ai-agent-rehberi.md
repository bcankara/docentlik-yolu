# ÜAK DOÇENTLİK PUAN HESAPLAMA - AI AGENT REHBERİ

**Versiyon:** 2025 Ekim Dönemi
**Kaynak:** ÜAK Resmi PDF (Tablo 9: Mühendislik, Tablo 11: Sosyal Bilimler)
**Amaç:** AI agent'ın doçentlik puanı hesaplaması için tam referans

---

## BÖLÜM 1: TEMEL ALAN TESPİTİ

### 1.1 Temel Alan Listesi

```
GRUP_A (Başlıca Yazar VAR - Öğrenci Kuralı):
- Fen Bilimleri ve Matematik
- Mühendislik
- Ziraat, Orman ve Su Ürünleri

GRUP_B (Başlıca Yazar VAR - İlk İsim + Öğrenci Kuralı):
- Mimarlık, Planlama ve Tasarım
- Sağlık Bilimleri
- Spor Bilimleri

GRUP_C (Başlıca Yazar YOK - Eşit Bölünme):
- Eğitim Bilimleri
- Filoloji
- Güzel Sanatlar
- Hukuk
- İlahiyat
- Sosyal, Beşeri ve İdari Bilimler
```

### 1.2 Temel Alan Belirleme Kuralı

```python
def get_temel_alan_grubu(temel_alan: str) -> str:
    GRUP_A = ["Fen Bilimleri ve Matematik", "Mühendislik", "Ziraat, Orman ve Su Ürünleri"]
    GRUP_B = ["Mimarlık, Planlama ve Tasarım", "Sağlık Bilimleri", "Spor Bilimleri"]
    GRUP_C = ["Eğitim Bilimleri", "Filoloji", "Güzel Sanatlar", "Hukuk", "İlahiyat", "Sosyal, Beşeri ve İdari Bilimler"]
    
    if temel_alan in GRUP_A:
        return "GRUP_A"
    elif temel_alan in GRUP_B:
        return "GRUP_B"
    elif temel_alan in GRUP_C:
        return "GRUP_C"
    else:
        return "UNKNOWN"
```

---

## BÖLÜM 2: BAŞLICA YAZAR KURALLARI

### 2.1 Başlıca Yazar Tanımı (GRUP_A: Mühendislik vb.)

```yaml
baslica_yazar_kosullari:
  - kosul: "tek_yazarli"
    aciklama: "Makale tek yazarlı ise aday başlıca yazardır"
    
  - kosul: "ogrenci_ile_birlikte"
    aciklama: "Danışmanlığını yaptığı lisansüstü öğrenci(ler) ile birlikte yazılmış makale"
    notlar:
      - "Aynı makalede birden fazla öğrenci olabilir"
      - "İkinci/eş danışman da yer alabilir"
      - "ANCAK: İkinci danışman başlıca yazar SAYILMAZ"

onemli_uyari: "Birinci isim (first author) olmak BAŞLICA YAZAR YAPMAZ"
```

### 2.2 Başlıca Yazar Tanımı (GRUP_B: Sağlık vb.)

```yaml
baslica_yazar_kosullari:
  - kosul: "tek_yazarli"
  - kosul: "ilk_sirada_yer_alan"
    aciklama: "Makalenin yazarlarından ilk sırada yer alan yazar"
  - kosul: "ogrenci_ile_birlikte"
```

### 2.3 Başlıca Yazar Tanımı (GRUP_C: Sosyal Bilimler vb.)

```yaml
baslica_yazar: null
aciklama: "Bu grupta başlıca yazar kavramı YOKTUR. Çok yazarlı yayınlarda puan her zaman eşit bölünür."
```

### 2.4 Başlıca Yazar Belirleme Algoritması

```python
def is_baslica_yazar(
    temel_alan_grubu: str,
    yazar_sayisi: int,
    aday_pozisyonu: int,  # 1-indexed
    ogrenci_var_mi: bool,
    aday_danisman_mi: bool,
    aday_es_danisman_mi: bool = False,
    dis_akademisyen_var_mi: bool = False
) -> bool:
    """
    Adayın başlıca yazar olup olmadığını belirler.
    
    Returns:
        bool: True ise aday başlıca yazar, False değilse
    """
    
    # GRUP_C: Başlıca yazar kavramı yok
    if temel_alan_grubu == "GRUP_C":
        return False  # Kavram yok, her zaman eşit bölünür
    
    # Tek yazarlı - her grupta başlıca yazar
    if yazar_sayisi == 1:
        return True
    
    # GRUP_A (Mühendislik vb.)
    if temel_alan_grubu == "GRUP_A":
        # Eş danışman başlıca yazar SAYILMAZ
        if aday_es_danisman_mi:
            return False
        
        # Dış akademisyen varsa başlıca yazar YOK
        if dis_akademisyen_var_mi:
            return False
        
        # Öğrenciyle birlikte ve asıl danışman ise
        if ogrenci_var_mi and aday_danisman_mi:
            return True
        
        return False
    
    # GRUP_B (Sağlık vb.)
    if temel_alan_grubu == "GRUP_B":
        # İlk sırada yer alan yazar
        if aday_pozisyonu == 1:
            return True
        
        # Öğrenciyle birlikte ve danışman ise
        if ogrenci_var_mi and aday_danisman_mi:
            return True
        
        return False
    
    return False
```

---

## BÖLÜM 3: PUAN HESAPLAMA KURALLARI

### 3.1 Makale Puan Hesaplama (GRUP_A ve GRUP_B)

```python
def hesapla_makale_puani(
    tam_puan: float,
    yazar_sayisi: int,
    baslica_yazar_mi: bool,
    aday_pozisyonu: int  # 1-indexed, sadece başlıca yazar değilse kullanılır
) -> float:
    """
    Makalelerden alınacak puanı hesaplar.
    
    Kurallar:
    - Tek yazarlı: tam puan × 1.0
    - 2 yazarlı + başlıca yazar: tam puan × 0.8
    - 2 yazarlı + ikinci yazar: tam puan × 0.5
    - 3+ yazarlı + başlıca yazar: tam puan × 0.5
    - 3+ yazarlı + diğer yazarlar: (tam puan × 0.5) / (yazar_sayisi - 1)
    - Başlıca yazar yok: tam puan / yazar_sayisi
    """
    
    # Tek yazarlı
    if yazar_sayisi == 1:
        return tam_puan * 1.0
    
    # Başlıca yazar var
    if baslica_yazar_mi:
        if yazar_sayisi == 2:
            return tam_puan * 0.8
        else:  # 3+ yazar
            return tam_puan * 0.5
    
    # Başlıca yazar değil ama başlıca yazar VAR (2 yazarlı)
    # Bu durumda ikinci yazar 0.5 alır
    # NOT: Bu durumu tespit etmek için ek bilgi gerekir
    
    # Başlıca yazar yok - eşit bölünme
    return tam_puan / yazar_sayisi


def hesapla_ikinci_yazar_puani(
    tam_puan: float,
    yazar_sayisi: int,
    baslica_yazar_var_mi: bool
) -> float:
    """
    Başlıca yazar olmayan yazarların puanını hesaplar.
    """
    
    if yazar_sayisi == 1:
        return 0  # Tek yazarlı, ikinci yazar yok
    
    if not baslica_yazar_var_mi:
        return tam_puan / yazar_sayisi
    
    if yazar_sayisi == 2:
        return tam_puan * 0.5
    else:  # 3+ yazar
        kalan_puan = tam_puan * 0.5
        diger_yazar_sayisi = yazar_sayisi - 1
        return kalan_puan / diger_yazar_sayisi
```

### 3.2 Makale Puan Hesaplama (GRUP_C: Sosyal Bilimler)

```python
def hesapla_makale_puani_sosyal(tam_puan: float, yazar_sayisi: int) -> float:
    """
    Sosyal Bilimler için makale puanı hesaplar.
    Her zaman eşit bölünür.
    """
    if yazar_sayisi == 1:
        return tam_puan
    return tam_puan / yazar_sayisi
```

### 3.3 Diğer Yayınlar (Bildiri, Kitap) - TÜM ALANLAR

```python
def hesapla_diger_yayin_puani(tam_puan: float, yazar_sayisi: int) -> float:
    """
    Bildiri ve kitap puanı hesaplar.
    TÜM ALANLARDA eşit bölünür (başlıca yazar kuralı UYGULANMAZ).
    """
    return tam_puan / yazar_sayisi
```

---

## BÖLÜM 4: PUAN TABLOLARI

### 4.1 Uluslararası Makale Puanları

```yaml
uluslararasi_makale:
  SCIE_SSCI:
    Q1: 30
    Q2: 20
    Q3: 15
    Q4: 10
  AHCI: 20
  ESCI: 10
  Scopus: 10
  diger_uluslararasi_indeks: 5
  editore_mektup_arastirma_notu_ozet_kitap_kritigi: 3
```

### 4.2 Ulusal Makale Puanları

```yaml
ulusal_makale:
  TR_Dizin: 10
  diger_hakemli_dergi: 4
  editore_mektup_arastirma_notu_ozet_kitap_kritigi: 2
```

### 4.3 Lisansüstü Tezlerden Üretilmiş Yayın Puanları

```yaml
tezden_uretilmis_yayin:
  SCIE_SSCI_AHCI_makale: 20
  ESCI_Scopus_makale: 10
  diger_uluslararasi_indeks_makale: 5
  TR_Dizin_makale: 8
  BKCI_kitap: 20
  BKCI_kitap_bolumu: 10
  diger_kitap:
    muhendislik: 5
    sosyal: 3
  diger_kitap_bolumu:
    muhendislik: 3
    sosyal: 2
  CPCI_bildiri:
    muhendislik: 5
    sosyal: 3
  diger_bildiri: 2
  
  kurallar:
    minimum_yayin: 1  # a-h bentlerinden en az 1
    maksimum_puan: 20
    diger_kitap_bolum_max:
      sosyal: 5  # g veya h bentlerinden max 5 puan
```

### 4.4 Kitap Puanları

```yaml
kitap:
  BKCI_kitap: 20
  BKCI_kitap_bolumu: 10
  diger_kitap: 5
  diger_kitap_bolumu: 3
  
  kurallar:
    maksimum_puan: 20
    diger_kitap_bolum_max: 5  # c veya d bentlerinden max 5 puan
    editir_sarti: "YÖKSİS veri tabanına kayıtlı öğretim üyelerinin editör olduğu kitap kabul edilir"
    ders_kitabi: "Ders kitabı dışındaki özgün bilimsel kitaplar puanlanır"
    ayni_kitap: "Aynı kitaptaki bölümlerden sadece biri puanlanabilir"
```

### 4.5 Atıf Puanları

```yaml
atif:
  SCIE_SSCI_AHCI_ESCI_Scopus: 3
  BKCI_kitap: 2
  TR_Dizin: 2
  diger: 1
  
  kurallar:
    minimum_puan: 5
    maksimum_puan: 10
    oz_atif: "Adayın kendi eserlerine yaptığı atıf değerlendirmeye alınmaz"
    ayni_yayin: "Bir esere aynı yayında yapılan birden fazla atıf tek atıf sayılır"
```

### 4.6 Tez Danışmanlığı Puanları

```yaml
tez_danismanligi:
  doktora:
    asil_danisman: 5
    es_danisman: 2.5  # yarısı
  yuksek_lisans:
    asil_danisman: 3
    es_danisman: 1.5  # yarısı
  
  kurallar:
    maksimum_puan: 10
    tamamlanmis_tez: "Sadece tamamlanmış tezler puanlanır"
```

### 4.7 Bilimsel Araştırma Projesi Puanları

```yaml
proje:
  AB_Cerceve_TUBITAK:
    koordinator_yurutucu: 15
    arastirmaci: 10
    danisman: 5
  uluslararasi_destekli: 10  # yürütücü/araştırmacı/danışman
  ArGe_UrGe: 5  # yürütücü/araştırmacı/danışman
  BAP: 3  # sadece yürütücü
  
  kurallar:
    maksimum_puan:
      muhendislik: 30
      sosyal: 20
    ogrenci_projesi: "Öğrenci projesi hariç"
    tez_projesi: "Tez ve uzmanlık projeleri hariç (BAP için)"
```

### 4.8 Bilimsel Toplantı (Bildiri) Puanları

```yaml
bildiri:
  CPCI: 5
  diger:
    muhendislik: 3
    sosyal: 3
  
  kurallar:
    minimum_puan: 5
    maksimum_puan: 10
    ayni_toplanti: "Aynı bilimsel toplantıda sunulan en fazla bir çalışma puanlanabilir"
    duzenleme_komitesi: "Diğer toplantılar için akademisyen temsilcisi zorunlu"
```

### 4.9 Eğitim-Öğretim Puanları

```yaml
egitim_ogretim:
  dort_yariyil_ders: 2
  iki_yil_yillik_program: 2
  
  kurallar:
    minimum_puan: 2
    maksimum_puan: 6
    kadrolu_muafiyet: "2 yıl kadrolu öğretim elemanı olanlar 2 puan almış sayılır"
```

### 4.10 Patent/Faydalı Model Puanları

```yaml
patent:
  uluslararasi_patent: 20
  ulusal_patent: 10
  faydali_model: 5
  patent_basvurusu: 2
  
  kurallar:
    puan_bolunme: "Puan kişi sayısına bölünür"
```

### 4.11 Ödül Puanları

```yaml
odul:
  YOK_Yilin_Doktora_Tezi: 25
  YOK_Ustun_Basari: 25
  TUBITAK_Bilim: 25
  TUBITAK_Tesvik: 25  # UBYT Ödülü hariç
  TUBA_GEBIP: 25
  TUBA_TESEP: 25
  
  kurallar:
    maksimum_puan: 25
```

### 4.12 Editörlük Puanları

```yaml
editorluk:
  SCIE_SSCI_AHCI_ESCI_Scopus_dergi: 2
  BKCI_Scopus_kitap: 1
  TR_Dizin_dergi: 1
  
  kurallar:
    maksimum_puan: 4
```

### 4.13 Diğer Puanlar

```yaml
diger:
  h_indeksi_5_ve_uzeri: 5
  yurtdisi_6_ay: 5  # İlk 300 üniversitede
  
  # Sadece Sosyal Bilimler:
  film_festivali: 5
  yonetmenlik: 5
  tv_sinema_dijital: 5
  
  kurallar:
    maksimum_puan:
      muhendislik: 10
      sosyal: 20
```

---

## BÖLÜM 5: ZORUNLULUKLAR

### 5.1 Genel Zorunluluklar (Tüm Alanlar)

```yaml
genel_zorunluluklar:
  toplam_puan:
    minimum: 100
    doktora_sonrasi_minimum: 90
    not: "Tezden üretilmiş yayın puanları 90 puana dahil değil"
  
  tezden_yayin:
    minimum_adet: 1
    kaynak: "a-h bentlerinden"
  
  atif:
    minimum_puan: 5
  
  bildiri:
    minimum_puan: 5
  
  egitim_ogretim:
    minimum_puan: 2
```

### 5.2 Mühendislik Özel Zorunlulukları

```yaml
muhendislik_zorunluluklari:
  uluslararasi_makale:
    minimum_puan: 40
    kaynak: "Q1, Q2 veya Q3 makalelerden"
    baslica_yazar_sarti: true
    baslica_yazar_aciklama: "En az birinde başlıca yazar olmak"
  
  ulusal_makale:
    minimum_puan: 10
    kaynak: "TR Dizin"
```

### 5.3 Sosyal Bilimler Özel Zorunlulukları

```yaml
sosyal_bilimler_zorunluluklari:
  uluslararasi_makale:
    minimum_puan: 10
    kaynak: "a, b, c veya d bentlerinden"
  
  ulusal_makale:
    minimum_adet: 5
    tek_yazarli_minimum: 3
    farkli_dergi_sarti: true
    alternatif:
      aciklama: "Sağlanamazsa 1. maddenin a veya b bentlerinden biri tek yazarlı olmak üzere en az 3 yayın"
  
  kitap:
    zorunlu: true
    secenekler:
      - "En az 1 kitap"
      - "En az 2 kitap bölümü (tüm bölümleri bilim alanı ile ilgili)"
```

---

## BÖLÜM 6: HESAPLAMA AKIŞI

### 6.1 Ana Hesaplama Algoritması

```python
def hesapla_docentlik_puani(aday_bilgileri: dict) -> dict:
    """
    Doçentlik puanını hesaplar.
    
    Args:
        aday_bilgileri: {
            "temel_alan": str,
            "doktora_tarihi": date,
            "yayinlar": list,
            "projeler": list,
            "atiflar": list,
            ...
        }
    
    Returns:
        {
            "toplam_puan": float,
            "doktora_sonrasi_puan": float,
            "kategori_puanlari": dict,
            "zorunluluk_kontrolu": dict,
            "uyarilar": list
        }
    """
    
    sonuc = {
        "toplam_puan": 0,
        "doktora_sonrasi_puan": 0,
        "kategori_puanlari": {},
        "zorunluluk_kontrolu": {},
        "uyarilar": []
    }
    
    temel_alan_grubu = get_temel_alan_grubu(aday_bilgileri["temel_alan"])
    
    # 1. Uluslararası Makale
    ul_makale_puan = hesapla_uluslararasi_makale(
        aday_bilgileri["yayinlar"],
        temel_alan_grubu
    )
    sonuc["kategori_puanlari"]["uluslararasi_makale"] = ul_makale_puan
    
    # 2. Ulusal Makale
    ulusal_makale_puan = hesapla_ulusal_makale(
        aday_bilgileri["yayinlar"],
        temel_alan_grubu
    )
    sonuc["kategori_puanlari"]["ulusal_makale"] = ulusal_makale_puan
    
    # 3. Tezden Üretilmiş Yayın (max 20)
    tez_yayin_puan = hesapla_tez_yayin(aday_bilgileri["yayinlar"])
    tez_yayin_puan = min(tez_yayin_puan, 20)
    sonuc["kategori_puanlari"]["tez_yayin"] = tez_yayin_puan
    
    # 4. Kitap (max 20)
    kitap_puan = hesapla_kitap(aday_bilgileri["yayinlar"])
    kitap_puan = min(kitap_puan, 20)
    sonuc["kategori_puanlari"]["kitap"] = kitap_puan
    
    # 5. Atıf (min 5, max 10)
    atif_puan = hesapla_atif(aday_bilgileri["atiflar"])
    atif_puan = min(atif_puan, 10)
    sonuc["kategori_puanlari"]["atif"] = atif_puan
    
    # 6. Tez Danışmanlığı (max 10)
    danisman_puan = hesapla_danismanlik(aday_bilgileri["danismanliklar"])
    danisman_puan = min(danisman_puan, 10)
    sonuc["kategori_puanlari"]["danismanlik"] = danisman_puan
    
    # 7. Proje (max 30/20)
    proje_max = 30 if temel_alan_grubu == "GRUP_A" else 20
    proje_puan = hesapla_proje(aday_bilgileri["projeler"])
    proje_puan = min(proje_puan, proje_max)
    sonuc["kategori_puanlari"]["proje"] = proje_puan
    
    # 8. Bildiri (min 5, max 10)
    bildiri_puan = hesapla_bildiri(aday_bilgileri["yayinlar"])
    bildiri_puan = min(bildiri_puan, 10)
    sonuc["kategori_puanlari"]["bildiri"] = bildiri_puan
    
    # 9. Eğitim-Öğretim (min 2, max 6)
    egitim_puan = hesapla_egitim(aday_bilgileri["egitim"])
    egitim_puan = min(egitim_puan, 6)
    sonuc["kategori_puanlari"]["egitim"] = egitim_puan
    
    # 10. Patent
    patent_puan = hesapla_patent(aday_bilgileri["patentler"])
    sonuc["kategori_puanlari"]["patent"] = patent_puan
    
    # 11. Ödül (max 25)
    odul_puan = hesapla_odul(aday_bilgileri["oduller"])
    odul_puan = min(odul_puan, 25)
    sonuc["kategori_puanlari"]["odul"] = odul_puan
    
    # 12. Editörlük (max 4)
    editor_puan = hesapla_editorluk(aday_bilgileri["editorlukler"])
    editor_puan = min(editor_puan, 4)
    sonuc["kategori_puanlari"]["editorluk"] = editor_puan
    
    # 13. Diğer (max 10/20)
    diger_max = 10 if temel_alan_grubu == "GRUP_A" else 20
    diger_puan = hesapla_diger(aday_bilgileri["diger"])
    diger_puan = min(diger_puan, diger_max)
    sonuc["kategori_puanlari"]["diger"] = diger_puan
    
    # Toplam hesapla
    sonuc["toplam_puan"] = sum(sonuc["kategori_puanlari"].values())
    
    # Doktora sonrası puan hesapla
    sonuc["doktora_sonrasi_puan"] = hesapla_doktora_sonrasi(
        sonuc["kategori_puanlari"],
        tez_yayin_puan  # Bu 90'a dahil değil
    )
    
    # Zorunluluk kontrolü
    sonuc["zorunluluk_kontrolu"] = kontrol_zorunluluklar(
        aday_bilgileri,
        sonuc["kategori_puanlari"],
        temel_alan_grubu
    )
    
    return sonuc
```

---

## BÖLÜM 7: ÖZEL DURUMLAR VE İSTİSNALAR

### 7.1 Bildiri ve Kitaplarda Puan Bölünmesi

```yaml
kural: "Diğer yayınlarda (bildiri, kitap) toplam puan yazarlar arasında EŞİT olarak bölünür"
aciklama: "Başlıca yazar kuralı sadece MAKALELER için geçerlidir"
```

### 7.2 İkinci/Eş Danışman Durumu

```yaml
makale_yazarligi:
  asil_danisman: "Başlıca yazar OLUR"
  es_danisman: "Başlıca yazar OLMAZ"
  
tez_danismanligi_puani:
  asil_danisman: "Tam puan"
  es_danisman: "Yarım puan"
```

### 7.3 Dış Akademisyen Etkisi (Mühendislik)

```yaml
kural: "Lisansüstü öğrenci ve eş danışman haricinde başka bir katkıda bulunan varsa, puanlar eşit olarak bölünür"
sonuc: "Birinci yazar olmak başlıca yazar puanı kazandırmaz"

ornekler:
  - durum: "Aday + Öğrenci"
    baslica_yazar: true
    
  - durum: "Aday + Öğrenci + Eş danışman"
    baslica_yazar: true  # Sadece asıl danışman için
    
  - durum: "Aday + Öğrenci + Dış akademisyen"
    baslica_yazar: false
    puan_hesabi: "Eşit bölünür"
    
  - durum: "Aday (1. isim) + Başka akademisyen"
    baslica_yazar: false
    puan_hesabi: "Eşit bölünür"
```

### 7.4 Aynı Çalışmanın Çoklu Puanlanması

```yaml
kurallar:
  - "Her çalışma sadece BİR bölümde puanlandırılır"
  - "Lisansüstü tezlerden üretilen yayınlar, 'Tezden Üretilmiş Yayın' şartı dışında ayrıca puanlanamaz"
  - "Aynı toplantıda sunulan en fazla BİR çalışma puanlanabilir"
  - "Aynı kitaptaki bölümlerden sadece BİRİ puanlanabilir"
```

### 7.5 Yabancı Uyruklu Adaylar

```yaml
kural: "TR Dizin koşulunu sağlayamazlarsa"
alternatif: "Aynı sayıdaki yayını 1. maddenin a, b veya c bentlerinden yapmış olma şartı"
```

### 7.6 Yayın Geçerlilik Kuralı

```yaml
kural: "Başvuru tarihi ile basılı veya elektronik olarak yayımlanmış özgün makale"
uyari: "Sadece DOI numarası almış olmak YETERLİ DEĞİLDİR"
gerekli: "Cilt, sayı ve sayfa numarası almış olmalı"
```

---

## BÖLÜM 8: KISALTMALAR SÖZLÜĞÜ

```yaml
indeksler:
  SCIE: "Web of Science Science Citation Index Expanded"
  SSCI: "Web of Science Social Sciences Citation Index"
  AHCI: "Web of Science Art and Humanities Citation Index"
  ESCI: "Web of Science Emerging Sources Citation Index"
  TR_Dizin: "TÜBİTAK ULAKBİM TR Dizin"
  BKCI: "Web of Science Book Citation Index"
  CPCI: "Web of Science Conference Proceedings Citation Index"
  Scopus: "Elsevier Scopus"

Q_degerleri:
  Q1: "Web of Science Journal Impact Factor (JIF) Quartile 1 (En üst %25)"
  Q2: "Web of Science Journal Impact Factor (JIF) Quartile 2 (%25-50)"
  Q3: "Web of Science Journal Impact Factor (JIF) Quartile 3 (%50-75)"
  Q4: "Web of Science Journal Impact Factor (JIF) Quartile 4 (Alt %25)"

oduller:
  UBYT: "TÜBİTAK Uluslararası Bilimsel Yayınları Teşvik"
  TUBA_GEBIP: "Türkiye Bilimler Akademisi Üstün Başarılı Genç Bilim İnsanı Ödülleri"
  TUBA_TESEP: "Türkiye Bilimler Akademisi Bilimsel Telif Eser Ödülleri Programı"

patent:
  uluslararasi: "PCT, EPC, EAPO, ARIPO, OAPI veya doğrudan ülkesel başvuru"
  ulusal: "Türk Patent ve Marka Kurumu tarafından verilen tescil belgesi"

diger:
  AB_Cerceve: "Avrupa Birliği Çerçeve Programları"
  BAP: "Bilimsel Araştırma Projesi (Üniversite)"
  ArGe: "Araştırma Geliştirme"
  UrGe: "Ürün Geliştirme"
```

---

## BÖLÜM 9: HIZLI REFERANS TABLOLARI

### 9.1 Yazar Konumu Hızlı Karar Tablosu

```
┌─────────────────────────────────────────────────────────────────┐
│                    BAŞLICA YAZAR MI?                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ADIM 1: Temel alanı belirle                                   │
│  ├─ Sosyal Bilimler grubu → Başlıca yazar YOK, eşit böl        │
│  └─ Mühendislik/Fen/Sağlık grubu → Adım 2'ye git               │
│                                                                 │
│  ADIM 2: Tek yazarlı mı?                                       │
│  ├─ EVET → Başlıca yazar ✓                                     │
│  └─ HAYIR → Adım 3'e git                                       │
│                                                                 │
│  ADIM 3: Öğrencinle mi yazdın?                                 │
│  ├─ HAYIR → Eşit böl                                           │
│  └─ EVET → Adım 4'e git                                        │
│                                                                 │
│  ADIM 4: Dış akademisyen var mı?                               │
│  ├─ EVET → Eşit böl                                            │
│  └─ HAYIR → Adım 5'e git                                       │
│                                                                 │
│  ADIM 5: Asıl danışman mısın?                                  │
│  ├─ EVET → Başlıca yazar ✓                                     │
│  └─ HAYIR (eş danışman) → Başlıca yazar değil                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Puan Katsayıları Hızlı Tablosu

```
┌──────────────────────────────────────────────────────────────┐
│              MAKALE PUAN KATSAYILARI (Mühendislik)           │
├──────────────────────────────────────────────────────────────┤
│ Yazar Durumu              │ Başlıca Yazar │ Diğer Yazarlar  │
├───────────────────────────┼───────────────┼─────────────────┤
│ 1 yazar                   │ 1.0           │ -               │
│ 2 yazar + başlıca         │ 0.8           │ 0.5             │
│ 3+ yazar + başlıca        │ 0.5           │ 0.5/(n-1)       │
│ n yazar + başlıca yok     │ 1/n           │ 1/n             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              MAKALE PUAN KATSAYILARI (Sosyal Bilimler)       │
├──────────────────────────────────────────────────────────────┤
│ Yazar Durumu              │ Her Yazar                        │
├───────────────────────────┼──────────────────────────────────┤
│ 1 yazar                   │ 1.0                              │
│ n yazar                   │ 1/n                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Zorunluluk Kontrol Listesi

```
┌──────────────────────────────────────────────────────────────┐
│                    ZORUNLULUK KONTROL LİSTESİ                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ☐ Toplam puan ≥ 100                                         │
│ ☐ Doktora sonrası puan ≥ 90 (tez yayını hariç)              │
│                                                              │
│ MÜHENDİSLİK:                                                │
│ ☐ Uluslararası makale ≥ 40 puan (Q1-Q3, en az 1 başlıca)    │
│ ☐ TR Dizin ≥ 10 puan                                        │
│ ☐ Tezden yayın ≥ 1 adet (a-h bentleri)                      │
│ ☐ Atıf ≥ 5 puan                                             │
│ ☐ Bildiri ≥ 5 puan                                          │
│ ☐ Eğitim ≥ 2 puan                                           │
│                                                              │
│ SOSYAL BİLİMLER:                                            │
│ ☐ Uluslararası makale ≥ 10 puan                             │
│ ☐ TR Dizin ≥ 5 yayın (3'ü tek yazarlı, farklı dergilerde)   │
│ ☐ Kitap ≥ 1 veya Kitap bölümü ≥ 2                           │
│ ☐ Tezden yayın ≥ 1 adet (a-h bentleri)                      │
│ ☐ Atıf ≥ 5 puan                                             │
│ ☐ Bildiri ≥ 5 puan                                          │
│ ☐ Eğitim ≥ 2 puan                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## BÖLÜM 10: ÖRNEK SENARYOLAR

### Senaryo 1: Mühendislik - Q1 Makale (30 puan)

```yaml
durum_1:
  yazar: "Aday tek"
  hesaplama: "30 × 1.0 = 30 puan"
  
durum_2:
  yazar: "Aday + YL öğrencisi"
  baslica_yazar: true
  hesaplama: "30 × 0.8 = 24 puan"
  
durum_3:
  yazar: "Aday + 2 YL öğrencisi"
  baslica_yazar: true
  hesaplama: "30 × 0.5 = 15 puan"
  
durum_4:
  yazar: "Aday (1. isim) + başka hoca"
  baslica_yazar: false
  hesaplama: "30 / 2 = 15 puan"
  
durum_5:
  yazar: "Aday + öğrenci + dış hoca"
  baslica_yazar: false
  hesaplama: "30 / 3 = 10 puan"
  
durum_6:
  yazar: "Aday + öğrenci + eş danışman"
  asil_danisman_baslica: true
  es_danisman_baslica: false
  hesaplama_asil: "30 × 0.5 = 15 puan"
  hesaplama_es: "(30 × 0.5) / 2 = 7.5 puan"
```

### Senaryo 2: Sosyal Bilimler - Q1 Makale (30 puan)

```yaml
durum_1:
  yazar: "Aday tek"
  hesaplama: "30 × 1.0 = 30 puan"
  
durum_2:
  yazar: "Aday + 1 kişi"
  hesaplama: "30 / 2 = 15 puan"
  
durum_3:
  yazar: "Aday + 2 kişi"
  hesaplama: "30 / 3 = 10 puan"
```

---

**Son Güncelleme:** 5 Aralık 2025
**Kaynak:** ÜAK Resmi Doçentlik Başvuru Şartları (2025 Ekim Dönemi)
