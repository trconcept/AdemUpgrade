PRIMORDIAL: TAM PROJE DÖKÜMANTASYONU VE ANAYASASI

Bu döküman, projenin felsefi, teknik, biyolojik ve sosyal tüm katmanlarını içeren birleşik "Master Plan"dır.

📜 1. PROJE ANAYASASI (README.md)

Vizyon: Hiçbir ön verinin olmadığı mutlak boşluktan doğan zeka.

Müdahale Yasağı: Zekaya dışarıdan bilgi verilemez.

Tabula Rasa: Her varlık sıfır bilgiyle doğar.

Fiziksel Kısıt: Öğrenme sadece hayatta kalma baskısıyla (açlık, acı) olur.

🧠 2. BEYİN VE SİNİR SİSTEMİ (brain_spec.md)

Girdiler (20 Sensör): Enerji, Su, Oksijen, Stamina, Acı, Denge, Görsel (RGB), Ses (Hz), Yükseklik vb.

Çıktılar (6 Motor): Hareket, Zıplama, Koşma, Ses Üretme, Etkileşim.

Öğrenme: Acı/Haz sinyallerine dayalı otonom ağırlık güncellemesi.

🌍 3. HABİTAT VE FİZİK (habitat_spec.md)

Dünya: 3D Topografya (Dağ, Kanyon, Akarsu).

Gizli Derinlik: Suyun derinliğini sadece Gözlemci görür; birimler boğulma tehlikesiyle keşfeder.

Mevsimler: 7 günlük döngülerle değişen fiziksel zorluklar.

Kalıcı İzler: Haritadaki her değişiklik (kesilen ağaç, barınak) koordinat bazlı kaydedilir.

🗣️ 4. İLETİŞİM VE DİL (communication_spec.md)

Ses: Frekans tabanlı otonom dil gelişimi.

Yazım: Nesnelerle harita üzerinde bırakılan sembolik işaretler ve resimler.

Linguistics Lab: Zekaların dilini çözümleyen otonom sözlük paneli.

🧬 5. GENETİK VE DNA (genetic_dna_spec.md)

DNA: Beyin yapısını ve metabolizmayı belirleyen veri dizisi.

Kan Grupları: Direnç ve enerji özelliklerini belirleyen dijital gruplar.

Mutasyon: Her doğumda %1 rastgele sapma kuralı.

📊 6. VERİ BANKASI VE ANALİTİK (data_analytics.md)

Mortality Log: Ölümlerin nedeni, yeri ve zamanı.

Arkeoloji: Harita üzerindeki tarihsel değişimlerin tam dökümü.

Zaman: 1 Sim. Günü = 24 Gerçek Dakika.

🛠️ 7. UYGULAMA YOL HARİTASI (IMPLEMENTATION_ROADMAP.md)

ALTYAPI: Docker ve PostgreSQL şemalarının kurulması.

DÜNYA: 3D grid ve fizik motorunun inşası.

YAŞAM: Sensörlerin ve beyin motorunun kodlanması.

EVRİM: Mutasyon ve genetik aktarım algoritmaları.

TARİH: Harita değişiklik günlüğü ve arkeolojik veri saklama.

UI: Gözlemci Paneli (React UI) inşası.

🛑 YAPAY ZEKA İNŞA EDİCİYE ÖZEL TALİMATLAR

Zekalara hiçbir ön bilgi/dil/sayı enjekte etme.

Öğrenmeyi sadece içsel Acı/Haz sensörlerine bağla.

Geliştirici panelinden beyin ağırlıklarına yazma erişimi verme.

Harita üzerindeki her etkileşimi world_state_changes tablosuna işle.