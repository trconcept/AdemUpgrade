import { useState, useEffect } from "react";
import { Mic2, Activity, Hexagon, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  state: any;
}

export function LinguisticsLabPanel({ state }: Props) {
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const { wordMap, vocabulary } = state.linguistics;

  // Generate random frequencies mimicking spectrogram 0.1Hz - 1.0Hz
  useEffect(() => {
    const interval = setInterval(() => {
      const newFreqs = Array.from({ length: 24 }).map(() => (Math.random() * 0.9 + 0.1));
      setFrequencies(newFreqs);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      {/* HEADER */}
      <section className="space-y-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
          <Mic2 size={16} className="text-secondary" />
          <span>DİL LABORATUVARI (Linguistics Lab)</span>
        </div>
      </section>

      {/* SPECTROGRAM */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
          BİLİŞSEL FREKANS SPEKTROGRAMI (0.1Hz - 1.0Hz)
        </div>
        <div className="bg-card/40 border border-border/50 rounded-lg p-3 relative overflow-hidden h-32 flex items-end justify-between px-2 pb-2">
          {frequencies.map((freq, idx) => (
            <div
              key={idx}
              className="w-2 bg-secondary/80 rounded-t-sm transition-all duration-700 ease-in-out"
              style={{ height: `${Math.max(10, freq * 100)}%`, opacity: freq > 0.7 ? 1 : 0.6 }}
            />
          ))}
          <div className="absolute top-2 left-3 text-[10px] font-mono text-secondary/70">CANLI DİNLEME AKTİF...</div>
        </div>
      </section>

      {/* AUTONOMOUS DICTIONARY */}
      <section className="space-y-3">
         <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
           <Database size={12} /> OTONOM SÖZLÜK
         </div>
         <div className="bg-card/30 p-2 rounded-lg border border-border/50 space-y-2">
           {Object.entries(wordMap).length === 0 ? (
             <div className="text-xs text-muted-foreground italic p-2 text-center">Henüz bir ses frekansı kaydedilmedi.</div>
           ) : (
             <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
               {Object.entries(wordMap).map(([concept, word], idx) => (
                 <div key={idx} className="flex flex-col p-2 bg-background/50 rounded border border-border/40 gap-1 hover:border-secondary/50 transition-colors">
                   <div className="flex justify-between items-center">
                     <span className="text-secondary font-mono font-bold tracking-widest">{word as string}</span>
                     <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase tracking-wider">
                       {(freqMapping(concept))}
                     </span>
                   </div>
                   <div className="text-[10px] text-muted-foreground">Kavram/Durum: <span className="text-foreground">{concept}</span></div>
                 </div>
               ))}
             </div>
           )}
         </div>
      </section>
      
      {/* VOCABULARY OVERVIEW */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
           <Cpu size={12} /> DİL KAPASİTESİ
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center">
              <span className="text-2xl font-mono text-secondary">{vocabulary?.length || 0}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Öğrenilen Kelime</span>
           </div>
           <div className="bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center">
              <span className="text-2xl font-mono text-secondary">
                 {Math.round((state.linguistics.syntaxComplexity || 0) * 100)}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Sentaks Karmaşıklığı</span>
           </div>
        </div>
      </section>

    </div>
  );
}

function freqMapping(concept: string) {
  // Try to extract an action-like hint
  const low = concept.toLowerCase();
  if (low.includes('eat') || low.includes('food') || low.includes('meyve')) return 'BESLENME/EMİLİM (0.4Hz)';
  if (low.includes('drink') || low.includes('water') || low.includes('su_')) return 'HİDRASYON (0.2Hz)';
  if (low.includes('pain') || low.includes('damage') || low.includes('predator') || low.includes('kurt') || low.includes('ayı')) return 'TEHLİKE/KAÇIŞ (0.9Hz)';
  if (low.includes('sleep') || low.includes('rest')) return 'DİNLENME (0.1Hz)';
  if (low.includes('fire') || low.includes('heat') || low.includes('ates')) return 'TERMAL UYARICI (0.6Hz)';
  return 'GENEL UYARICI (0.5Hz)';
}
