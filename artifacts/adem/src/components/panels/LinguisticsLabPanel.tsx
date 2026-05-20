import { useState, useEffect } from "react";
import { Mic2, Activity, Hexagon, Database, Cpu, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  state: any;
  person: any; // We now receive the selected person (Adem/Havva)
}

export function LinguisticsLabPanel({ state, person }: Props) {
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const { wordMap, vocabulary } = state.linguistics;

  // Each person has their own spectrogram frequency pattern
  useEffect(() => {
    // We clear/restart the interval when person changes to re-seed the visualization
    const isMale = person.gender === 'male';
    const interval = setInterval(() => {
      const newFreqs = Array.from({ length: 24 }).map(() => {
        // Males might have lower-pitched visually (more stability), 
        // females might have higher variability, just a visual difference
        return isMale 
          ? (Math.random() * 0.7 + 0.1) 
          : (Math.random() * 0.9 + 0.2);
      });
      setFrequencies(newFreqs);
    }, 800);
    return () => clearInterval(interval);
  }, [person.id]);

  // Derive known words from personal knowledge
  const personalWords = Object.keys(person.knowledge)
    .filter(k => person.knowledge[k].word)
    .map(k => ({ concept: k, word: person.knowledge[k].word }));

  const personalSyntaxComplexity = (state.linguistics.syntaxComplexity * (person.psychology.emotions.curiosity / 100)) || Math.random() * 0.1;

  const colorClass = person.gender === 'male' ? "text-blue-400" : "text-pink-400";
  const bgBarClass = person.gender === 'male' ? "bg-blue-500/80" : "bg-pink-500/80";
  const borderClass = person.gender === 'male' ? "border-blue-500/50" : "border-pink-500/50";

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      {/* HEADER */}
      <section className="space-y-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
          <Mic2 size={16} className={colorClass} />
          <span>DİL LABORATUVARI - {person.name.toUpperCase()}</span>
        </div>
      </section>

      {/* SPECTROGRAM */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex justify-between">
          <span>BİLİŞSEL FREKANS SPEKTROGRAMI (BİREYSEL)</span>
          <span className={colorClass}>{person.gender === 'male' ? '120Hz - Düşük Ton' : '220Hz - Yüksek Ton'}</span>
        </div>
        <div className={`bg-card/40 border ${borderClass} rounded-lg p-3 relative overflow-hidden h-32 flex items-end justify-between px-2 pb-2`}>
          {frequencies.map((freq, idx) => (
            <div
              key={idx}
              className={`w-2 ${bgBarClass} rounded-t-sm transition-all duration-700 ease-in-out`}
              style={{ height: `${Math.max(10, freq * 100)}%`, opacity: freq > 0.5 ? 1 : 0.6 }}
            />
          ))}
          <div className="absolute top-2 left-3 text-[10px] font-mono opacity-70 flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full animate-pulse ${bgBarClass}`} />
             {person.name.toUpperCase()} DİNLENİYOR...
          </div>
        </div>
      </section>

      {/* AUTONOMOUS DICTIONARY */}
      <section className="space-y-3">
         <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
           <Database size={12} /> BİREYSEL KELİME DAĞARCIĞI
         </div>
         <div className="bg-card/30 p-2 rounded-lg border border-border/50 space-y-2">
           {personalWords.length === 0 ? (
             <div className="text-xs text-muted-foreground italic p-2 text-center">{person.name} henüz konuşabilmek için yeterince kavram öğrenmedi.</div>
           ) : (
             <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
               {personalWords.map((entry, idx) => (
                 <div key={idx} className={`flex flex-col p-2 bg-background/50 rounded border border-border/40 gap-1 hover:${borderClass} transition-colors`}>
                   <div className="flex justify-between items-center">
                     <span className={`${colorClass} font-mono font-bold tracking-widest`}>{entry.word}</span>
                     <span className={`text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded uppercase tracking-wider`}>
                       {(freqMapping(entry.concept))}
                     </span>
                   </div>
                   <div className="text-[10px] text-muted-foreground">Kavram/Durum: <span className="text-foreground">{entry.concept}</span></div>
                 </div>
               ))}
             </div>
           )}
         </div>
      </section>
      
      {/* VOCABULARY OVERVIEW */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
           <Cpu size={12} /> DİL KAPASİTESİ ({person.name.toUpperCase()})
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div className={`bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center`}>
              <span className={`text-2xl font-mono ${colorClass}`}>{personalWords.length}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Öğrenilen Kelime</span>
           </div>
           <div className={`bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center`}>
              <span className={`text-2xl font-mono ${colorClass}`}>
                 {Math.round((personalSyntaxComplexity || 0) * 100)}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Sentaks Kavrama</span>
           </div>
        </div>
        
        <div className="bg-primary/5 rounded p-3 border border-primary/10 mt-2">
            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">SOYUTLAMA & SEMBOL GÜCÜ</div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              Dil sadece seslerden ibaret değil; {person.name} dünyayı soyutlayarak sembolik düşünme evresine {state.linguistics.discoveredSymbols.length > 0 ? "giriş yaptı." : "henüz geçemedi."} Bu kapasite ile kelimeleri sadece anlık eylemler için değil, geçmiş ve geleceği anlatmak için birleştiriyor (Sentaks Karmaşıklığı: {Math.round((personalSyntaxComplexity || 0) * 100)}%).
            </p>
        </div>
      </section>

    </div>
  );
}

function freqMapping(concept: string) {
  const low = concept.toLowerCase();
  
  // Doğa ve Mimik Sesleri
  if (low.includes('sound_wind')) return 'DOĞA TAKLİDİ / RÜZGAR (0.8Hz)';
  if (low.includes('sound_rain')) return 'DOĞA TAKLİDİ / YAĞMUR (0.6Hz)';
  if (low.includes('sound_leaves')) return 'DOĞA TAKLİDİ / HIŞIRTI (0.5Hz)';
  if (low.includes('sound_self')) return 'BİREYSEL MIRILTI / ISLIK (0.4Hz)';
  if (low.includes('sound_')) return 'HAYVAN TAKLİDİ (0.9Hz)'; // Diğer tüm hayvan sesleri

  if (low.includes('eat') || low.includes('food') || low.includes('meyve') || low.includes('mushroom') || low.includes('herb')) return 'BESLENME/EMİLİM (0.4Hz)';
  if (low.includes('drink') || low.includes('water') || low.includes('su_')) return 'HİDRASYON (0.2Hz)';
  if (low.includes('pain') || low.includes('damage') || low.includes('predator') || low.includes('kurt') || low.includes('ayı')) return 'TEHLİKE/KAÇIŞ (0.9Hz)';
  if (low.includes('sleep') || low.includes('rest')) return 'DİNLENME (0.1Hz)';
  if (low.includes('fire') || low.includes('heat') || low.includes('ates')) return 'TERMAL UYARICI (0.6Hz)';
  return 'GENEL UYARICI (0.5Hz)';
}
