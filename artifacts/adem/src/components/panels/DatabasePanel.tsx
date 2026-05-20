import { SimulationState, EventLog } from '../../lib/simulation';
import { Activity, Skull, Baby, Globe, Clock, History } from 'lucide-react';

export function DatabasePanel({ state, logs }: { state: SimulationState, logs: EventLog[] }) {
  const allTimeAdemDeaths = state.livesHistory.length; 
  const totalDays = state.livesHistory.reduce((acc, curr) => acc + curr.days, 0) + state.daysSurvived;

  return (
    <div className="p-6 h-full overflow-y-auto bg-background text-foreground space-y-6">
      <h2 className="text-2xl font-bold border-b border-border pb-2 flex items-center gap-2">
        <Globe className="text-primary" />
        Genel Simülasyon Veritabanı
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
           <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase flex items-center gap-2"><Clock size={16}/> Toplam Süre</h3>
           <div className="text-2xl font-mono">{totalDays}. Gün</div>
           <div className="text-xs text-muted-foreground mt-1">Mevcut Nesil: {state.generation}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
           <h3 className="text-sm font-bold text-muted-foreground mb-1 uppercase flex items-center gap-2"><Baby size={16}/> Canlı Nüfus</h3>
           <div className="text-2xl font-mono">{2 + state.children.length} İnsan</div>
           <div className="text-xs text-muted-foreground mt-1">{state.env.creatures.length} Vahşi Hayvan</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
           <h3 className="text-sm font-bold text-red-400 mb-1 uppercase flex items-center gap-2"><Skull size={16}/> Ölüm ve Yeniden Doğuş</h3>
           <div className="text-2xl font-mono">{state.generation - 1} Ölüm</div>
           <div className="text-xs text-muted-foreground mt-1">Simülasyon Sıfırlanma Sayısı</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
           <h3 className="text-sm font-bold text-emerald-400 mb-1 uppercase flex items-center gap-2"><Activity size={16}/> Ekosistem Olayları</h3>
           <div className="text-2xl font-mono">{state.env.ecosystemStats.totalBirths} Doğum</div>
           <div className="text-xs text-muted-foreground mt-1 text-red-400">{state.env.ecosystemStats.totalDeaths} Hayvan Ölümü</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold flex items-center gap-2"><History size={20}/> Nesil Geçmişi</h3>
            <div className="overflow-y-auto max-h-48 pr-2 space-y-2 custom-scrollbar">
              {state.livesHistory.length === 0 ? (
                <div className="text-muted-foreground text-sm italic">Henüz bir ölüm kaydedilmedi.</div>
              ) : (
                state.livesHistory.map((h, i) => (
                  <div key={i} className="bg-muted/40 p-2 rounded text-sm flex justify-between items-center border border-border/50">
                    <div>
                      <span className="font-bold text-primary">Nesil {h.generation}</span>
                      <span className="text-muted-foreground ml-2">{h.days} gün yaşadı</span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded">
                      Ölüm Nedeni: {h.cause}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold flex items-center gap-2">Ademler ve Havvalar (Çocuklar)</h3>
            <div className="overflow-y-auto max-h-48 pr-2 space-y-2 custom-scrollbar">
               <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded text-sm flex justify-between">
                  <span className="font-bold text-blue-400">Adem (Erkek)</span>
                  <span className="text-muted-foreground">Yaş: {Math.floor(state.adem.age)} | Can: {Math.floor(state.adem.vitals.health)}</span>
               </div>
               <div className="bg-pink-500/10 border border-pink-500/30 p-2 rounded text-sm flex justify-between">
                  <span className="font-bold text-pink-400">Havva (Dişi)</span>
                  <span className="text-muted-foreground">Yaş: {Math.floor(state.havva.age)} | Can: {Math.floor(state.havva.vitals.health)}</span>
               </div>
               {state.children?.map((child, i) => (
                 <div key={i} className={`p-2 rounded text-sm flex justify-between border ${child.gender === 'male' ? 'bg-blue-500/5 border-blue-500/20 text-blue-300' : 'bg-pink-500/5 border-pink-500/20 text-pink-300'}`}>
                    <span className="font-bold capitalize">{child.name}</span>
                    <span className="text-muted-foreground text-xs opacity-70">Yaş: {Math.floor(child.age)} | Otonom Varlık</span>
                 </div>
               ))}
               {!state.children?.length && (
                 <div className="text-muted-foreground text-xs italic opacity-70 p-1">Henüz yeni nesil oluşmadı...</div>
               )}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-3">
          <h3 className="text-lg font-bold">Önemli Olaylar (Kayıt Defteri)</h3>
          <div className="flex gap-2 mb-2">
             <div className="px-2 py-1 text-[10px] font-mono bg-red-500/10 text-red-400 rounded border border-red-500/20">Tehlike ve Ölümler</div>
             <div className="px-2 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Başarılı Sonuçlar</div>
             <div className="px-2 py-1 text-[10px] font-mono bg-muted text-muted-foreground rounded border border-border">Diğer Olaylar</div>
          </div>
          <div className="overflow-y-auto h-[400px] pr-2 space-y-2 custom-scrollbar">
             {logs.slice().reverse().map((l, i) => {
                const isDanger = l.category === 'critical' || l.category === 'death';
                const isGood = l.category === 'good';
                return (
                  <div key={i} className={`p-2 rounded text-xs border ${isDanger ? 'border-red-500/30 bg-red-500/5 text-red-100' : isGood ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-100' : 'border-border/50 bg-muted/20 text-muted-foreground'}`}>
                     <div className="flex justify-between items-center mb-1">
                        <span className="opacity-50 font-mono text-[9px]">GÜN {Math.floor(l.tick / 100)}</span>
                        {isDanger && <span className="opacity-80 font-bold text-[9px] text-red-400 tracking-widest uppercase">{l.category}</span>}
                        {isGood && <span className="opacity-80 font-bold text-[9px] text-emerald-400 tracking-widest uppercase">SUCCESS</span>}
                     </div>
                     <div className="leading-relaxed">{l.message}</div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
