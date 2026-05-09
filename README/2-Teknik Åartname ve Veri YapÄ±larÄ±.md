ADEM: Teknik Şartname ve Veri Standartları

1. Dünya Veri Yapısı (Grid 3.0)

Harita hücreleri artık yükseklik verisi içeren nesnelerdir.

interface Tile {
  x: number;
  y: number;
  z: number; // Yükseklik değeri
  type: 'PLAIN' | 'MOUNTAIN' | 'CANYON' | 'LAKE' | 'RIVER';
  moisture: number; // Nem oranı
  modification: {
    unit_id: string | null;
    timestamp: number | null;
    action: string | null;
  };
}


2. Veritabanı Güncellemeleri

A. Dünya Değişiklik Kaydı (world_state_changes)

Koordinat sistemine z ekseni ve eylem türlerine fizyolojik eylemler eklendi:

coord_z: Değişikliğin yüksekliği.

action_type: AĞAÇ_KESME, BARINAK_İNŞA, KÖPRÜ_YAPMA, ARAZİ_DÜZLEME.

B. Birim Durum Kaydı (unit_states)

Anlık fizyolojik verilerin takibi için:

stamina, body_temp, sweat_level.

3. Zaman ve Fizik Senkronizasyonu

Gravity Constant: Düşme hızı ve hasar hesaplaması için standart yerçekimi sabiti.

Metabolizma Hızı: Hareket türüne göre (Koşma vs. Yürüme) değişken enerji tüketim katsayısı.