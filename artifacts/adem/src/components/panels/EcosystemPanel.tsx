import React from 'react';
import { SimulationState, CREATURE_INFO, CREATURE_DETAILS, CreatureKind } from '../../lib/simulation';
import { Activity, Heart, Skull, Info, TrendingUp, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  state: SimulationState;
}

export function EcosystemPanel({ state }: Props) {
  const { creatures, ecosystemStats } = state.env;
  
  const speciesCounts: Record<string, number> = creatures.reduce((acc, cr) => {
    acc[cr.kind] = (acc[cr.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allSpecies = Object.keys(CREATURE_INFO) as CreatureKind[];

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      {/* Ecosystem Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <TrendingUp className="text-green-500" size={20} />
          Ekosistem Veri Hattı
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Biyolojik Çeşitlilik ve Nüfus Takibi</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/40 border border-border/50 p-3 rounded-lg flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={14} /> Toplam Nüfus
          </div>
          <div className="text-2xl font-mono font-bold text-primary">{creatures.length}</div>
        </div>
        <div className="bg-card/40 border border-border/50 p-3 rounded-lg flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity size={14} /> Biyo-Kararlılık
          </div>
          <div className="text-2xl font-mono font-bold text-green-500">
            {Math.round((creatures.length / 100) * 100)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/30 border border-green-500/20 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase mb-1">
            <Heart size={10} /> Toplam Doğum
          </div>
          <div className="text-lg font-mono font-bold">{ecosystemStats.totalBirths}</div>
        </div>
        <div className="bg-card/30 border border-red-500/20 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase mb-1">
            <Skull size={10} /> Toplam Ölüm
          </div>
          <div className="text-lg font-mono font-bold">{ecosystemStats.totalDeaths}</div>
        </div>
      </div>

      {/* Species List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 border-b border-border pb-2">
          <Info size={14} /> Tür Spesifikasyonu
        </h3>
        
        {allSpecies.map((kind) => {
          const count = speciesCounts[kind] || 0;
          const info = CREATURE_INFO[kind];
          const details = CREATURE_DETAILS[kind];
          const births = ecosystemStats.births[kind] || 0;
          const deaths = ecosystemStats.deaths[kind] || 0;
          
          return (
            <div key={kind} className="group bg-card/20 hover:bg-card/40 border border-border/40 p-4 rounded-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg shadow-black/20"
                    style={{ backgroundColor: `${info.color}20`, border: `1px solid ${info.color}40` }}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="font-bold capitalize text-primary leading-none mb-1">{kind}</h4>
                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Heart size={8} className="text-green-500" /> {births}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Skull size={8} className="text-red-500" /> {deaths}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-primary">{count}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ADET</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>Nüfus Payı</span>
                    <span>{Math.round((count / creatures.length) * 100)}%</span>
                  </div>
                  <Progress value={(count / creatures.length) * 100} className="h-1 bg-muted/40" />
                </div>

                <div className="bg-black/20 p-2 rounded border border-white/5 space-y-2">
                  <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                    "{details.description}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Diyet: {details.diet}</span>
                    <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase font-bold">Davranış: {details.behavior}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 mt-auto">
        <div className="flex gap-2">
          <Info size={16} className="text-yellow-500 shrink-0" />
          <p className="text-[10px] text-yellow-500/80 leading-relaxed">
            Ekosistem verileri, mikro-simülasyon birimleri tarafından anlık olarak güncellenmektedir. Nüfus azalışı, doğal seleksiyon ve predator etkileşimleri simülasyon dengesi için kritiktir.
          </p>
        </div>
      </div>
    </div>
  );
}
