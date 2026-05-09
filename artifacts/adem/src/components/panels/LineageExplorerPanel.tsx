import { Activity, Beaker, Dna, GitMerge, HeartPulse } from "lucide-react";

interface Props {
  state: any;
}

export function LineageExplorerPanel({ state }: Props) {
  const { generation, bloodGroup, livesHistory, adem } = state;
  const dna = adem.dna;

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      {/* HEADER */}
      <section className="space-y-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
          <Dna size={16} className="text-emerald-500" />
          <span>SOYAĞACI GEZGİNİ (Lineage Explorer)</span>
        </div>
      </section>

      {/* DNA TRAITS & BIOLOGY */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
          <Beaker size={12} /> BİYOLOJİK PARAMETRELER
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center relative overflow-hidden">
              <span className="text-2xl font-mono text-rose-500 font-bold">{bloodGroup}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Kan Grubu</span>
              <HeartPulse size={32} className="absolute -bottom-2 -right-2 text-rose-500/10" />
           </div>
           <div className="bg-card/30 border border-border/50 rounded flex flex-col p-2 items-center justify-center relative overflow-hidden">
              <span className="text-2xl font-mono text-emerald-500 font-bold">GEN-{generation}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Jenerasyon</span>
           </div>
        </div>

        <div className="flex flex-col gap-2 mt-2 bg-card/40 p-3 rounded-lg border border-border/50">
           <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">DNA ZİNCİRİ (Mutasyon +%1 / Doğum)</div>
           
           <div className="font-mono text-[8px] text-emerald-500/40 break-all mb-3 bg-black/20 p-1.5 rounded border border-emerald-500/10 tracking-widest leading-relaxed">
             {dna.sequence}
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-[10px]">
               <span className="text-muted-foreground">Metabolizma Hızı:</span>
               <span className="text-emerald-400 font-mono">{dna.traits.metabolismSpeed.toFixed(2)}x</span>
             </div>
             <div className="w-full bg-muted/40 h-1 mt-1 rounded-full overflow-hidden">
               <div className="bg-emerald-500/50 h-full" style={{ width: `${Math.min(100, (dna.traits.metabolismSpeed / 100) * 100)}%` }} />
             </div>
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-[10px]">
               <span className="text-muted-foreground">Öğrenme & Adaptasyon:</span>
               <span className="text-emerald-400 font-mono">{dna.traits.sensoryAcuity.toFixed(2)}x</span>
             </div>
             <div className="w-full bg-muted/40 h-1 mt-1 rounded-full overflow-hidden">
               <div className="bg-emerald-500/50 h-full" style={{ width: `${Math.min(100, (dna.traits.sensoryAcuity / 100) * 100)}%` }} />
             </div>
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-[10px]">
               <span className="text-muted-foreground">Fizyolojik Limit (Stamina):</span>
               <span className="text-emerald-400 font-mono">{(dna.traits.staminaMax / 10).toFixed(1)}k</span>
             </div>
             <div className="w-full bg-muted/40 h-1 mt-1 rounded-full overflow-hidden">
               <div className="bg-emerald-500/50 h-full" style={{ width: `${Math.min(100, (dna.traits.staminaMax / 1000) * 100)}%` }} />
             </div>
           </div>

           <div className="space-y-1">
             <div className="flex justify-between text-[10px]">
               <span className="text-muted-foreground">Nöral Kapasite (Longevity Level):</span>
               <span className="text-emerald-400 font-mono">Lv.{Math.floor(dna.traits.longevityLevel)}</span>
             </div>
             <div className="w-full bg-muted/40 h-1 mt-1 rounded-full overflow-hidden">
               <div className="bg-emerald-500/50 h-full" style={{ width: `${Math.min(100, (dna.traits.longevityLevel / 100) * 100)}%` }} />
             </div>
           </div>
        </div>
      </section>

      {/* LINEAGE REPOSITORY */}
      <section className="space-y-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
           <GitMerge size={12} /> SOY HATTI & KALITIM (Crossover)
        </div>
        <div className="bg-card/30 p-3 rounded-lg border border-border/50 relative">
          <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-emerald-500/20 z-0"></div>
          
          <div className="space-y-4 relative z-10">
             {livesHistory?.length === 0 ? (
                 <div className="text-xs text-muted-foreground p-2 pl-6">Henüz bir soyağacı oluşmadı (İlk jenerasyon hayatta).</div>
             ) : (
                [...livesHistory].reverse().map((record: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                     <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground">
                           Adem / Havva GEN-{record.generation}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                           <span className="text-amber-400">{record.days} Gün Yaşadı</span> • Bilgi Çapı: {record.knowledgeAtDeath}
                        </span>
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded w-fit mt-1">
                           ÖLÜM: {record.cause}
                        </span>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>
      </section>
      
    </div>
  );
}
