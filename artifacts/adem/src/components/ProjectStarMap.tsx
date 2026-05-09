import React, { useState } from 'react';
import { Brain, Globe, Heart, Activity, Cpu, Monitor, Dna, X, Network, Database, ArrowLeft, Clock, Zap, FileText, RefreshCw, Map as MapIcon, CloudRain, Sun, Leaf, Book, Lightbulb, TrendingUp, AlertTriangle, ShieldAlert, GitMerge, Thermometer, Target, Navigation, Backpack, HeartPulse, MousePointer2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAIN_NODES = [
  { id: 'core', title: 'Çekirdek Simülasyon', icon: <Cpu size={24} />, x: 50, y: 50, color: 'emerald', description: 'Tüm sistemin kalbidir. Zamanı (tick), hava durumunu, nesil döngülerini ve alt sistemlerin uyum içinde çalışmasını yönetir. Sub-sistemleri incelemek için çift tıklayın veya detay kısmından haritasını açın.' },
  { id: 'env', title: 'Çevre & Ekosistem', icon: <Globe size={24} />, x: 50, y: 15, color: 'sky', description: 'Dünya Motoru. Biyomlar, iklimler, mevsimler ve gece/gündüz döngüsü burada işlenir. Coğrafi yükseklikler (topography), bitki örtüsü ve hayvanlar ekosisteme dinamik olarak dağıtılır.' },
  { id: 'cognition', title: 'Nöro-Bilişsel Sistem', icon: <Brain size={24} />, x: 85, y: 35, color: 'purple', description: 'Adem\'in öğrenme merkezi. Karşılaştığı durumları hipotezlere dönüştürür. Hangi yemeğin enerji verdiğini veya hangi canlının zarar verdiğini hafızasına kaydederek kalıcı kurallar (Knowledge Panel) oluşturur.' },
  { id: 'psychology', title: 'Psikoloji & Afektif Yapı', icon: <Heart size={24} />, x: 80, y: 75, color: 'rose', description: 'Duygu Motoru. Adem\'in anlık hislerini yönetir. Merak, Korku, Mutluluk, Stres ve Mental Yük gibi parametreleri sürekli günceller. Olumsuz tecrübeler travma olarak kaydedilir.' },
  { id: 'biology', title: 'Biyoloji & Epigenetik', icon: <Dna size={24} />, x: 50, y: 85, color: 'amber', description: 'Fiziksel yetenekleri ve nesilden nesile aktarılan özellikleri (DNA) belirler. Çevresel zorluklar veya travmatik ölümler, sonraki nesle Epigenetik kalıtımlar olarak aktarılır.' },
  { id: 'physical', title: 'Fiziksel Varlık & Navigasyon', icon: <Activity size={24} />, x: 20, y: 75, color: 'orange', description: 'Dünya üzerindeki fiziksel tezahür. Vücut ısısı, enerji seviyesi, laktik asit birikmesi, envanter (toplanan meyveler) ve haritadaki A* pathfinding (yol bulma) algoritması ile hareketlerini kapsar.' },
  { id: 'ui', title: 'Gözlem Panelleri (UI)', icon: <Monitor size={24} />, x: 15, y: 35, color: 'indigo', description: 'Ara yüz Katmanı. Tanrı Modu (God Mode) ve Müdahale butonu aracılığıyla kullanıcının simülasyonu izlemesini ve gerektiğinde sistemi manipüle etmesini (iyileştirme, besleme) sağlar.' }
];

const MAIN_CONNECTIONS = [
  ['core', 'env'], ['core', 'cognition'], ['core', 'psychology'], ['core', 'biology'], ['core', 'physical'], ['core', 'ui'],
  ['env', 'physical'], ['physical', 'psychology'], ['cognition', 'psychology'], ['biology', 'physical'], ['biology', 'cognition']
];

const SUBMAPS: Record<string, { nodes: any[], connections: string[][] }> = {
  core: {
    nodes: [
      { id: 'm_core', title: 'Çekirdek Simülasyon', icon: <Cpu size={32} />, x: 50, y: 50, color: 'emerald', description: 'Ana Yönetici (Orchestrator). Alt sistemlerin saatlerini senkronize eder.' },
      { id: 'core_tick', title: 'Zaman (Tick) Motoru', icon: <Clock size={24} />, x: 50, y: 20, color: 'emerald', description: 'Sistemdeki her bir döngüyü işletir (useSimulation içinde). Hızlandırılabilir veya yavaşlatılabilir.' },
      { id: 'core_state', title: 'Durum Yöneticisi', icon: <Database size={24} />, x: 85, y: 45, color: 'emerald', description: 'Dünyanın ve Adem\'in tüm mevcut parametrelerini (State) tek bir nesnede tutar ve React componentlerine iletir.' },
      { id: 'core_events', title: 'Olay Günlüğü Sistemi', icon: <FileText size={24} />, x: 75, y: 80, color: 'emerald', description: 'Gerçekleşen eylemleri, tehlikeleri ve ölümleri sistem kayıtlarına (Event Log) formatlı olarak yazar.' },
      { id: 'core_rebirth', title: 'Evrim / Yeniden Doğuş', icon: <RefreshCw size={24} />, x: 25, y: 65, color: 'emerald', description: 'Adem öldüğünde state sıfırlanırken, mevcut bilgilerin ve epigenetik verilerin yeni nesle aktarılmasını sağlar.' }
    ],
    connections: [['m_core', 'core_tick'], ['m_core', 'core_state'], ['m_core', 'core_events'], ['m_core', 'core_rebirth']]
  },
  env: {
    nodes: [
      { id: 'm_env', title: 'Çevre & Ekosistem', icon: <Globe size={32} />, x: 50, y: 50, color: 'sky', description: 'Dünya Motoru Merkezi. Tüm dış faktörlerin birleştiği yer.' },
      { id: 'env_biome', title: 'Biyom Üreteci & Harita', icon: <MapIcon size={24} />, x: 15, y: 40, color: 'sky', description: 'Harita başlangıcında Perlin noise benzeri bir yapıyla Çöl, Orman, Dağlık vb. bölgeleri ve yükseklik haritasını (heights) oluşturur.' },
      { id: 'env_weather', title: 'İklim & Hava Durumu', icon: <CloudRain size={24} />, x: 80, y: 30, color: 'sky', description: 'Güneşli, Yağmurlu, Fırtınalı geçişlerini kontrol eder. Islanma faktörü ve Adem\'in vücut ısısını doğrudan etkiler.' },
      { id: 'env_time', title: 'Zaman Çarkı', icon: <Sun size={24} />, x: 75, y: 75, color: 'sky', description: 'Gece/Gündüz (dawn, day, dusk, night) döngüsünü yönetir. Gece olduğunda görüş mesafesi düşer ve korku artar.' },
      { id: 'env_entities', title: 'Varlık Dağıtıcı', icon: <Leaf size={24} />, x: 25, y: 80, color: 'sky', description: 'Yenilebilir objelerin (meyveler vb.) ve Tehlikeli varlıkların (Kurt vb.) haritada sınır koşullarına göre rastgele oluşturulması.' }
    ],
    connections: [['m_env', 'env_biome'], ['m_env', 'env_weather'], ['m_env', 'env_time'], ['m_env', 'env_entities'], ['env_weather', 'env_time']]
  },
  cognition: {
    nodes: [
      { id: 'm_cognition', title: 'Nöro-Bilişsel Sistem', icon: <Brain size={32} />, x: 50, y: 50, color: 'purple', description: 'Bilişsel Merkez. Adem\'in üst düzey karar mekanizması.' },
      { id: 'cog_memory', title: 'Bilgi Bankası (Memory)', icon: <Book size={24} />, x: 50, y: 15, color: 'purple', description: 'Keşfedilen objelerin kalıcı olarak saklandığı bilgi tabanı. Hangi meyvenin ne kadar enerji verdiğini kaydeder.' },
      { id: 'cog_hypothesis', title: 'Hipotez Üretimi', icon: <Lightbulb size={24} />, x: 85, y: 50, color: 'purple', description: 'Yeni bir varlık görüldüğünde sınıflandırılması (Tehlike mi, Gıda mı?) ve buna yönelik test eylemlerini (yaklaş/kaç) belirler.' },
      { id: 'cog_learning', title: 'Öğrenme & Adaptasyon', icon: <TrendingUp size={24} />, x: 65, y: 85, color: 'purple', description: 'Bir kurt tarafından saldırıya uğrandığında "Kurt tehlikelidir" çıkarımını yaparak kaçış mekanizmasını güçlendirerek kurallara ekler.' },
      { id: 'cog_decision', title: 'Karar Algoritması', icon: <Settings size={24} />, x: 15, y: 50, color: 'purple', description: 'Mevcut duruma (vitals ve çevre) göre en uygun önceliği (Yemek bul, Kaç, Dinlen) seçip hedef koordinatı belirler.' }
    ],
    connections: [['m_cognition', 'cog_memory'], ['m_cognition', 'cog_hypothesis'], ['m_cognition', 'cog_learning'], ['m_cognition', 'cog_decision'], ['cog_hypothesis', 'cog_learning'], ['cog_learning', 'cog_memory']]
  },
  psychology: {
    nodes: [
      { id: 'm_psychology', title: 'Psikoloji & Afektif Yapı', icon: <Heart size={32} />, x: 50, y: 50, color: 'rose', description: 'Duygusal Merkez. Adem\'in stresini ve ruh halini günceller.' },
      { id: 'psy_emotions', title: 'Duygu Matrisi', icon: <Zap size={24} />, x: 30, y: 20, color: 'rose', description: 'Korku, Merak ve Mutluluk seviyelerini anlık hesaplar. Karanlıkta korku artarken tok olduğunda mutluluk artar.' },
      { id: 'psy_stress', title: 'Stres & Laktik Kriz', icon: <AlertTriangle size={24} />, x: 75, y: 25, color: 'rose', description: 'Uzun süreli koşma veya tehlike anında mental stres birikir. Panik durumunda yanlış veya agresif kararlar verilebilir.' },
      { id: 'psy_trauma', title: 'Travma Sistemi', icon: <ShieldAlert size={24} />, x: 80, y: 70, color: 'rose', description: 'Ciddi hastalanmalar veya tekrarlayan açlık krizleri kalıcı psikolojik izler bırakır. Örneğin: "Su fobisi" veya "Açlık anksiyetesi".' },
      { id: 'psy_motivation', title: 'Motivasyon Sistemi', icon: <Target size={24} />, x: 20, y: 75, color: 'rose', description: 'Enerji düşükken bile hayatta kalma dürtüsüyle (willpower) Adem\'e ekstra güç uygulanmasını sağlar.' }
    ],
    connections: [['m_psychology', 'psy_emotions'], ['m_psychology', 'psy_stress'], ['m_psychology', 'psy_trauma'], ['m_psychology', 'psy_motivation']]
  },
  biology: {
    nodes: [
      { id: 'm_biology', title: 'Biyoloji & Epigenetik', icon: <Dna size={32} />, x: 50, y: 50, color: 'amber', description: 'Genetik & Fizyolojik Çekirdek. Tüm fiziksel parametrelerin sınırlarını çizer.' },
      { id: 'bio_dna', title: 'Temel DNA (Genler)', icon: <Database size={24} />, x: 50, y: 15, color: 'amber', description: 'Doğuştan gelen hız kapasitesi, soğuğa dayanıklılık, bazal metabolizma hızı gibi statik, kalıtımsal değerler.' },
      { id: 'bio_epi', title: 'Epigenetik Aktarım', icon: <GitMerge size={24} />, x: 85, y: 50, color: 'amber', description: 'Hayat boyu geçirilen yoğun deneyimlerin (travmalar veya başarılar) gen ekspresyonunu değiştirmesi ve sonraki nesle aktarılması.' },
      { id: 'bio_mutation', title: 'Rastgele Mutasyon', icon: <RefreshCw size={24} />, x: 65, y: 85, color: 'amber', description: 'Her yeni nesilde ufak sapmalar yaratarak popülasyon/birey çeşitliliğini simüle eder. Zamanla farklı çevrelere adapte olunmasını sağlar.' },
      { id: 'bio_limit', title: 'Hayati Sınırlar', icon: <Thermometer size={24} />, x: 15, y: 50, color: 'amber', description: 'Vücudun katlanabileceği max/min ısı, açlık, susuzluk limitlerini tanımlar. Bu sınırlar aşıldığında organ hasarı başlar.' }
    ],
    connections: [['m_biology', 'bio_dna'], ['m_biology', 'bio_epi'], ['m_biology', 'bio_mutation'], ['m_biology', 'bio_limit'], ['bio_dna', 'bio_mutation'], ['bio_epi', 'bio_dna']]
  },
  physical: {
    nodes: [
      { id: 'm_physical', title: 'Fiziksel Varlık', icon: <Activity size={32} />, x: 50, y: 50, color: 'orange', description: 'Piyon Kontrolü. Adem\'in haritadaki somut temsilidir.' },
      { id: 'phy_path', title: 'A* Algoritması', icon: <Navigation size={24} />, x: 20, y: 25, color: 'orange', description: 'Algılanan dünyada (ızgara haritada), bilinen engellere göre o anki en uygun (maliyeti en düşük) rotayı çizer.' },
      { id: 'phy_move', title: 'Hareket Motoru', icon: <Target size={24} />, x: 50, y: 15, color: 'orange', description: 'A* tarafından çizilen rotada adım adım (grid-based) ilerlemeyi sağlar, yorgunluk ve biyo-limitlere göre hızı ayarlar.' },
      { id: 'phy_inv', title: 'Envanter (Mide)', icon: <Backpack size={24} />, x: 85, y: 45, color: 'orange', description: 'Toplanan gıdaları ve Adem\'in sindirim sistemindeki yiyeceklerin anlık parçalanma (enerjiye dönüşme) durumunu tutar.' },
      { id: 'phy_vitals', title: 'Anlık Vitals', icon: <HeartPulse size={24} />, x: 65, y: 80, color: 'orange', description: 'Koşu/Yürüme ve çevre sıcaklığını kullanarak anlık nabız, laktik asit birikimini ve bölgesel ısı artışını (uzuvlar bazında) hesaplar.' }
    ],
    connections: [['m_physical', 'phy_path'], ['m_physical', 'phy_move'], ['m_physical', 'phy_inv'], ['m_physical', 'phy_vitals'], ['phy_path', 'phy_move']]
  },
  ui: {
    nodes: [
      { id: 'm_ui', title: 'Gözlem Panelleri', icon: <Monitor size={32} />, x: 50, y: 50, color: 'indigo', description: 'Arayüz ve Kullanıcı Etkileşimi. React ile geliştirilmiş dashboardlar.' },
      { id: 'ui_god', title: 'Tanrı Modu (Etkileşim)', icon: <MousePointer2 size={24} />, x: 25, y: 35, color: 'indigo', description: 'Kullanıcının haritaya yemek eklemesi, varlık spawningi yapması veya Adem\'e müdahale etmesini sağlayan kontrol araçları.' },
      { id: 'ui_map', title: 'Canvas Harita', icon: <MapIcon size={24} />, x: 75, y: 35, color: 'indigo', description: '2D grid, varlıklar, görüş açısı (Fog of War) ve hava durumu efektlerini (Canvas API ile render loop içinde) ekrana çizer.' },
      { id: 'ui_stats', title: 'İstatistik & Analiz', icon: <TrendingUp size={24} />, x: 50, y: 80, color: 'indigo', description: 'Biyoloji, Psikoloji ve Bilgi panellerinde verileri gerçek zamanlı görselleştiren grafik ve metrik sistemleri.' }
    ],
    connections: [['m_ui', 'ui_god'], ['m_ui', 'ui_map'], ['m_ui', 'ui_stats']]
  }
};

export function ProjectStarMap({ onClose }: { onClose: () => void }) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [currentMap, setCurrentMap] = useState<string | null>(null);

  const activeNodes = currentMap && SUBMAPS[currentMap] ? SUBMAPS[currentMap].nodes : MAIN_NODES;
  const activeConnections = currentMap && SUBMAPS[currentMap] ? SUBMAPS[currentMap].connections : MAIN_CONNECTIONS;
  const activeNodeData = activeNode ? activeNodes.find(n => n.id === activeNode) : null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      {/* Background Starry Effect / Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-50 shadow-lg border border-border">
        <X size={24} />
      </button>

      <div className="absolute top-8 left-8 max-w-sm pointer-events-none z-40">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Network size={28} />
          <span>{currentMap ? `${MAIN_NODES.find(n => n.id === currentMap)?.title} Detayı` : 'Proje Mimari Haritası'}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {currentMap 
            ? 'Bu alt sistemin düğümlerine tıklayarak mekanik detaylarını inceleyebilirsiniz.' 
            : 'Adem projesinin alt sistemlerini incelemek için düğümlere tıklayın. Alt modüllerin haritasını görmek için "İç Haritaya Git" butonunu kullanın.'}
        </p>
        
        {currentMap && (
          <button 
            onClick={() => { setCurrentMap(null); setActiveNode(null); }}
            className="mt-4 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow"
          >
             <ArrowLeft size={16} />
             Ana Haritaya Dön
          </button>
        )}
      </div>

      <div className="w-full max-w-4xl aspect-video relative mt-16 sm:mt-0">
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                 <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
              </linearGradient>
           </defs>
          <AnimatePresence>
            {activeConnections.map(([srcId, dstId]) => {
              const src = activeNodes.find(n => n.id === srcId);
              const dst = activeNodes.find(n => n.id === dstId);
              if (!src || !dst) return null;
              
              const isActive = activeNode === srcId || activeNode === dstId;
              return (
                 <motion.line 
                    key={`${currentMap || 'main'}-${srcId}-${dstId}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    x1={`${src.x}%`} y1={`${src.y}%`}
                    x2={`${dst.x}%`} y2={`${dst.y}%`}
                    stroke={isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isActive ? 2 : 1.5}
                    strokeDasharray={isActive ? "none" : "5 5"}
                    className="transition-colors duration-300"
                 />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Nodes */}
        <AnimatePresence mode="popLayout">
          {activeNodes.map((node) => {
            const isActive = activeNode === node.id;
            const bgColors: Record<string, string> = {
              emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50',
              sky: 'bg-sky-500/10 text-sky-400 border-sky-500/50',
              purple: 'bg-purple-500/10 text-purple-400 border-purple-500/50',
              rose: 'bg-rose-500/10 text-rose-400 border-rose-500/50',
              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/50',
              orange: 'bg-orange-500/10 text-orange-400 border-orange-500/50',
              indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50',
            };

            return (
               <motion.div 
                 key={`${currentMap || 'main'}-${node.id}`}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0, opacity: 0 }}
                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                 onClick={() => setActiveNode(isActive ? null : node.id)}
                 className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                 style={{ left: `${node.x}%`, top: `${node.y}%` }}
               >
                  <motion.div 
                     whileHover={{ scale: 1.15 }}
                     whileTap={{ scale: 0.95 }}
                     className={`flex flex-col items-center gap-2`}
                  >
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${bgColors[node.color]} ${isActive ? 'shadow-[0_0_25px_currentColor] scale-110' : 'hover:shadow-[0_0_20px_currentColor] bg-card/60'}`}>
                        {node.icon}
                     </div>
                     <div className={`px-2 py-1 rounded bg-background/90 border border-border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-opacity shadow-lg ${isActive ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100'}`}>
                       {node.title}
                     </div>
                  </motion.div>
               </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info Popover */}
      <AnimatePresence>
        {activeNodeData && (
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-xl w-full bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 z-40"
           >
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                   {activeNodeData.icon}
                   {activeNodeData.title}
                 </h3>
                 <button onClick={() => setActiveNode(null)} className="text-muted-foreground hover:text-foreground bg-muted p-1 rounded-full">
                    <X size={20} />
                 </button>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-6">
                 {activeNodeData.description}
              </p>
              
              {!currentMap && SUBMAPS[activeNodeData.id] && (
                 <button 
                   onClick={() => {
                     setCurrentMap(activeNodeData.id);
                     setActiveNode(null);
                   }}
                   className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                 >
                   <Network size={18} />
                   <span>Alt Sistem Haritasını Aç</span>
                 </button>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
