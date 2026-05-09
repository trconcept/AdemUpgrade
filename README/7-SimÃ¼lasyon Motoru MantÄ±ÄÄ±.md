ADEM: Simülasyon Motoru ve Yaşam Döngüsü

Bu döküman, projenin "Sıfır Müdahale" ilkesini teknik olarak nasıl yürüteceğini, fizik ve biyolojinin her "tick" içinde nasıl hesaplanacağını tanımlar.

1. Ana Döngü (The Heartbeat Loop)

Simülasyon saniyede 60 kez (60 FPS) şu işlem sırasını takip eder:

Duyusal Giriş (Perception Phase): 2000 varlığın her biri için çevre verileri (ışık, ses, eğim, enerji) sensörler aracılığıyla toplanır.

Düşünce İşleme (Neural Phase): Sensör verileri zekanın sinir ağına (Brain Matrisi) girer. Forward propagation (ileri besleme) ile motor çıktılar hesaplanır.

Fizik Hesaplama (Action Phase): Zekaların ürettiği hareket (yürüme, zıplama, ses) fizik motorunda (yerçekimi, sürtünme) işlenir.

Fizyolojik Güncelleme (Metabolism Phase): Hareketin maliyeti (enerji, su, stamina) ve çevresel etkiler (sıcaklık, oksijen) birimlerin vücut durumuna yansıtılır.

Dünya Güncelleme (Environment Phase): Mevsimsel değişimler, bitki büyümesi ve varlıkların yaptığı kalıcı değişiklikler (ağaç kesme vb.) haritaya işlenir.

2. Otonom Öğrenme ve Karar Döngüsü

Birimler her döngüde şu hiyerarşiye göre karar verir:

Refleks Katmanı: Acı ve ani tehlike anında (ateşe basma, düşme) sinir ağından bağımsız tetiklenen kaçınma hareketleri.

İhtiyaç Katmanı: Açlık, susuzluk ve yorgunluk seviyelerine göre "ihtiyaca yönelme" dürtüsü.

Keşif Katmanı: Merak (curiosity) algoritmasıyla tetiklenen, bilinmeyen tile'lara yönelme eylemi.

3. Ölüm ve Nesil Geçişi (Extinction Guard)

Sistem popülasyonu sürekli denetler:

Doğal Elenme: Enerjisi biten veya ölümcül hasar alan birim anında dondurulur, veritabanına "Ölüm Nedeni" ile kaydedilir ve haritadan silinir (yerine bir iz bırakarak).

Yeni Doğum: En başarılı (en uzun yaşayan ve en çok bilgi edinen) birimler eşleştiğinde, sistem yeni bir "Beyin Dosyası" oluşturur ve onu uygun bir konuma (genellikle ebeveynlerin yanına) yerleştirir.

4. Gözlemci Portu (God Access)

Simülasyon motoru, dışarıdan (senin panelinden) gelen "Zamanı Hızlandır" veya "Dünyayı Dondur" komutlarına yanıt verir ancak asla varlıkların içsel ağırlıklarına (weights) müdahale etmez.

Kesin Kural: Simülasyon motoru sadece "Çevresel Şartları" değiştirebilir, "Zekayı" değiştiremez.