ADEM: Tarihsel Arşiv ve Arkeoloji Sistemi

Bu modül, simülasyonun başlangıcından itibaren gerçekleşen her fiziksel, sosyal ve biyolojik olayın nasıl "ebedileştirileceğini" tanımlar. Amaç, 1000 nesil sonra bile "İlk Ateş"in nerede ve kim tarafından yakıldığının bilgisini bilimsel bir kesinlikle sunmaktır.

1. Dünya Değişiklik Arşivi (World Archaeology)

Harita üzerindeki her etkileşim, "Dünya Hafızası"na şu veri yapısıyla kaydedilir:

Eylem ID: Benzersiz işlem numarası.

Aktör (Unit_ID): Değişikliği yapan Adem/Havva'nın kimliği.

Koordinat (x, y, z): Eylemin gerçekleştiği 3 boyutlu nokta.

Eylem Türü: AĞAÇ_KESME, BARINAK_İNŞA, ATEŞ_YAKMA, ARAZİ_DÜZLEME, AVLANMA.

Eski Durum / Yeni Durum: Hücrenin dönüşüm verisi.

Zaman Damgası (Epoch): Simülasyonun hangi saniyesinde gerçekleştiği.

Gözlemci Notu: Bu veriler asla silinmez. Bir barınak yıkılsa bile, o koordinattaki "yıkıntı" verisi tarihe işlenir.

2. Soy ve Genetik Miras (Lineage Archive)

Her bir varlığın soyağacı, bir "Yaşam Kitabı" (Life Book) şeklinde tutulur:

Biyolojik Kayıt: Ebeveynler, doğum tarihi, cinsiyet ve DNA (Ağırlık Matrisi) özeti.

Başarı Skoru: Yaşadığı süre, ürettiği çocuk sayısı, keşfettiği bilgi sayısı.

Soy Sonu Tespiti: Bir soy tükendiğinde, sistem otomatik olarak "Soy Sonu Raporu" oluşturur ve bu soyun medeniyete olan katkısını (Örn: "Ateşin evcilleştirilmesinde öncü soy") analiz eder.

3. Bilgi Bankası ve Kültürel Fosiller (Knowledge Vault)

Zekaların kendi kendine ulaştığı sonuçlar "Kesin Çıktılar" olarak dökümante edilir:

Keşif Kronolojisi: "Simülasyon 450. Gün: İlk kez bir Adem, suyun derinliğine girmeden önce kıyıda beklemeyi keşfetti."

Kültürel Sözlük: Frekans bazlı iletişimin zaman içindeki evrimi. Hangi "sesin" ne zaman bir "kavrama" dönüştüğünün kaydı.

4. Zaman Ölçeklendirme ve Senkronizasyon

Simülasyonun zamanı, dış dünya ile şu kesin oranlarda bağlanır:

Zaman Birimi

Gerçek Dünya Karşılığı

Simülasyon Karşılığı

Saniye

1 Saniye

1 Simülasyon Dakikası

Tick (Heartbeat)

16.6ms (60 FPS)

1 Simülasyon Saniyesi

Döngü (Cycle)

24 Dakika

1 Simülasyon Günü

Mevsim

2.8 Saat

7 Simülasyon Günü

Yıl

~14.6 Saat

365 Simülasyon Günü

Başlangıç Kaydı: Projenin ilk başlatıldığı gerçek dünya tarihi (Örn: 28 Nisan 2026, 02:34) sistemin "Yaratılış Anı" (Epoch 0) olarak tüm kayıtlara işlenir.