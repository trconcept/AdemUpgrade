PRIMORDIAL: Gözlemci Arayüzü (God Mode) Detaylı Şartnamesi

Bu döküman, şu anki "siyah ekran ve noktalar" görüntüsünü profesyonel bir simülasyon paneline dönüştürmek için gereken görsel standartları tanımlar.

1. Harita ve Habitat Görselleştirmesi (Canvas Layering)

Harita artık sadece siyah bir zemin olamaz. Şu katmanlar eklenmelidir:

Terrain Layer: habitat_spec.md dosyasındaki yükseklik (Z) verisine göre; dağlar açık gri/beyaz, ovalar koyu yeşil, kanyonlar ise kahverengi tonlarında "izometrik" veya "topografik" olarak çizilmelidir.

Hydrology Layer: Nehirler ve göller, akıntı yönlerini belirten animasyonlu mavi çizgilerle gösterilmelidir.

Hidden Depth (God Only): Sadece geliştirici paneline özel olarak, suların derinliği (0-10m) üzerine gelindiğinde veya bir "overlay" katmanı açıldığında renk tonlarıyla belli olmalıdır.

2. Varlık Etkileşimi ve Takip

Zoom & Pan: Kullanıcı mouse wheel ile haritaya yaklaşabilmeli (zoom) ve sürükleyerek (pan) gezinebilmelidir.

Unit Hover: Bir noktanın (Adem/Havva) üzerine gelindiğinde küçük bir "tooltip" açılmalı; ID, Enerji, Mevcut Eylem (Emekliyor, Yürüyor vb.) ve varsa "Korku/Travma" durumu anlık görünmelidir.

Path Visualizer: Belirli bir birim seçildiğinde, o birimin son 100 adımda geçtiği yerler ince bir hat (patika) olarak gösterilmelidir.

3. Gelişmiş Veri Panelleri (Sidebars)

Görseldeki basit loglar yerine şu modüller eklenmelidir:

Linguistic Spectrogram: Ekranın altında, o an popülasyonda yayılan ses frekanslarını (Hz) canlı bir dalga formu olarak gösteren panel.

Biometric Heatmap: Popülasyonun genel sağlık veya açlık durumunu harita üzerinde "ısı haritası" olarak gösteren buton.

Arkeoloji Günlüğü: Sadece "ATTACK" değil; "Ağaç Kesildi", "Barınak İnşa Edildi", "İlk Ses Keşfedildi" gibi milat niteliğindeki olaylar vurgulanmalıdır.

4. Teknik Gereksinim (Performance)

2000 birimin hareketi requestAnimationFrame ile 60 FPS'de takılmadan akmalıdır.

GPU hızlandırmalı Canvas (WebGL) kullanılmalıdır.