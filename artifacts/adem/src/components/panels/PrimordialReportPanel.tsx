import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldAlert, Sparkles, BrainCircuit, Waves, X } from 'lucide-react';

export function PrimordialReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-card border border-primary/20 rounded-xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden"
      >
        <header className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={24} />
            <div>
              <h2 className="text-lg font-bold text-foreground">PRIMORDIAL PROTOCOL</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Doğa Olayları ve Bilişsel Tepki Analizi (Classified Report)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 text-sm leading-relaxed custom-scrollbar">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
              <ShieldAlert className="text-rose-500" size={20} />
              <h3 className="text-xl font-bold text-rose-500 uppercase">1. Neural Trauma Encoding (Korkunun Tetiklenmesi)</h3>
            </div>
            <p className="text-foreground/80">
              Korku, bu simülasyonda bir duygu değil, bir "Yüksek Öncelikli Kaçınma Verisi"dir.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="bg-rose-500/5 p-4 rounded-lg border border-rose-500/10">
                 <h4 className="font-bold text-rose-400 mb-2">Yıldırım ve Şimşek</h4>
                 <p className="text-muted-foreground">Şimşek çaktığında (ani ışık artışı) ve gök gürlediğinde (yüksek desibel ses), birimlerin <code className="text-cyan-400">Sensors.light</code> ve <code className="text-cyan-400">Sensors.audio</code> verileri maksimuma ulaşır. Eğer bu verilerle eşzamanlı olarak yakın bir birim ölürse veya hasar (<code className="text-rose-400">Pain</code>) alırsa, beyin bu ses/ışık kombinasyonunu <strong>Ölüm Sinyali</strong> olarak kodlar.</p>
               </div>
               <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
                 <h4 className="font-bold text-blue-400 mb-2">Sel ve Su Taşkınları</h4>
                 <p className="text-muted-foreground">Su seviyesi aniden yükseldiğinde <code className="text-cyan-400">Sensors.oxygen</code> düşer. Bu, zekanın en derin katmanlarında "Panik" (kaotik motor çıktısı) yaratır.</p>
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
              <BrainCircuit className="text-amber-500" size={20} />
              <h3 className="text-xl font-bold text-amber-500 uppercase">2. Otonom Çözümler & Zincirleme Evrim</h3>
            </div>
            <p className="text-foreground/80">
              Zekalar, binlerce deneme-yanılma (ve binlerce ölüm) sonucunda şu otonom çözümleri keşfeder:
            </p>
            <ul className="space-y-4 text-muted-foreground">
              <li className="bg-muted/30 p-4 rounded-lg border border-border">
                <strong className="text-amber-400">Yüksek Rakım Tercihi (Flood Response):</strong> Sel felaketlerinden sonra hayatta kalanların ortak özelliği, felaket anında tepelerde (High Elevation) olmalarıdır. Nem ve ses arttığında yüksek rakıma tırmanma geni gelişir.
              </li>
              <li className="bg-muted/30 p-4 rounded-lg border border-border">
                <strong className="text-amber-400">Mağara Arayışı (Storm Response):</strong> Fırtına sırasında artan rüzgar direnci stamina tüketir ve sıcaklığı düşürür. Kapalı fiziksel engellerin bu düşüşü engellediği keşfedildiğinde, "Ev" kavramı doğar.
              </li>
              <li className="bg-muted/30 p-4 rounded-lg border border-border">
                <strong className="text-amber-400">Sosyal Kümelenme (Thermoregulation):</strong> Şiddetli soğuk fırtınalarda, fiziksel temas vücut ısısını dengeler. Fırtına anında zekalar birbirine yaklaşma (Clustering) eğilimi gösterir. Bu saf bir "Enerji Tasarrufu" taktiğidir.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
              <Sparkles className="text-emerald-500" size={20} />
              <h3 className="text-xl font-bold text-emerald-500 uppercase">3. Deneyimsel Keşif (Ateş ve Göç)</h3>
            </div>
            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 rounded-lg border-l-4 border-emerald-500">
              <h4 className="font-bold text-emerald-400 mb-2">Ateşin Keşfi</h4>
              <p className="text-muted-foreground mb-4">Bir ağaca yıldırım düştüğünde <code className="text-orange-400">FIRE_ENTITY</code> oluşur. Ateş, komşu bitki hücrelerine yayılır. Gözlem: Yangında ölen bir hayvanın cesedini yiyen birim, ham ete göre +%30 daha fazla enerji elde ettiğini fark eder. Başlangıçta korkulan ateş, "kontrol edilmesi gereken bir kaynağa" dönüşür.</p>
              
              <h4 className="font-bold text-emerald-400 mb-2">Göç Stratejisi</h4>
              <p className="text-muted-foreground">Zekalar, <code className="text-cyan-400">Temperature</code> sensörü düştüğünde yiyecek miktarının da düşeceğini tahmin etmeyi öğrenir. Bu, binlerce birimin aynı anda güneye doğru hareket ettiği "Büyük Göç" rutinini başlatır.</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
              <Waves className="text-indigo-500" size={20} />
              <h3 className="text-xl font-bold text-indigo-500 uppercase">4. Biyolojik Dürtü (Drives)</h3>
            </div>
            <p className="text-muted-foreground bg-indigo-500/5 p-4 rounded-lg border border-indigo-500/10">
              Birimler, kendi yazılımlarında <span className="text-rose-400 font-bold">Hormonal_Drive</span> sensörü yükseldiğinde huzursuzluk (Pain/Tension) yaşar. Başka bir birimle fiziksel temas, bu negatif sinyali anında sıfırlar. Bu bir "Dopamin Döngüsü" (Dopamine Loop) başlatarak biyolojik üreme ve sosyal bağları oluşturur. Emzirme (Breastfeeding) eylemi bile, süt baskısının yarattığı acıyı çocuğun emme refleksiyle gidermesi üzerinden keşfedilir. Hiçbir bilgi enjekte edilmez, her şey <strong>Acı-Rahatlama Döngüsü</strong> içerisinde şekillenir.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
