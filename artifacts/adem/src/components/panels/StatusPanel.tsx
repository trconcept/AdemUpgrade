import { SimulationState, EventLog, weatherLabel, seasonLabel, timeOfDayLabel, DailyStats, Person, DNA } from '../../lib/simulation';
import { Footprints, Brain, Moon, Bed, AlertCircle, Eye, ChevronRight, ChevronDown, Package, Apple, Sprout, Flower2, User, Shield, Activity, Dna } from 'lucide-react';
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';

const TICK_SECONDS = 0.8;
function fmtTicks(t: number): string {
  const sec = Math.round(t * TICK_SECONDS);
  if (sec < 60) return `${sec}sn`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}dk` : `${m}dk ${s}sn`;
}

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3 pb-3 border-b border-border/30 last:border-b-0">
      <button 
         onClick={() => setIsOpen(!isOpen)} 
         className="w-full flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && <div className="animate-in slide-in-from-top-2 fade-in-50 duration-200">{children}</div>}
    </div>
  );
}

export function StatusPanel({ state, person }: { state: SimulationState, person: Person }) {
  const [activeTab, setActiveTab] = useState<StatusTab>('general');
  const v = person.vitals;
  const isAdem = person.gender === 'male';

  const renderBar = (label: string, val: number, colorVar: string, colorClass?: string) => (
    <div className="space-y-1.5" key={label}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{val.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClass || ''}`}
          style={{
            width: `${val}%`,
            backgroundColor: colorClass ? undefined : (isAdem ? `hsl(var(--${colorVar}))` : (colorVar === 'health' ? '#ec4899' : `hsl(var(--${colorVar}))`)),
          }}
        />
      </div>
    </div>
  );

  const hours = Math.floor((state.env.timeCounter % 240) / 10);
  const mins = Math.floor(((state.env.timeCounter % 240) % 10) * 6);
  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  const ambient = state.env.ambientTemp;

  return (
    <div className="flex-shrink-0 flex flex-col border-b border-border bg-card/30 max-h-[65%] overflow-hidden">
      {/* Header & Tabs */}
      <div className={`pt-4 px-4 sticky top-0 z-10 ${isAdem ? 'bg-indigo-500/5' : 'bg-pink-500/5'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <User size={14} className={isAdem ? 'text-blue-400' : 'text-pink-400'} />
            <h2 className={`text-xs font-mono uppercase tracking-widest ${isAdem ? 'text-blue-400' : 'text-pink-400'}`}>
              {isAdem ? 'ADEM TELEMETRİ' : 'HAVVA TELEMETRİ'}
            </h2>
          </div>
          <div className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${isAdem ? 'bg-primary/10 text-primary' : 'bg-pink-500/10 text-pink-500'}`}>
             YAŞAM #{state.generation}
          </div>
        </div>

        <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar">
           {(['general', 'biology', 'psychology'] as StatusTab[]).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all relative flex-shrink-0 ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
               {tab === 'general' ? 'DURUM' : tab === 'biology' ? 'BİYOLOJİ' : 'PSİKOLOJİ'}
               {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
             </button>
           ))}
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {activeTab === 'general' && (
          <>
            <CollapsibleSection title="ORTAM & BİLGİ" defaultOpen={true}>
              <div className="grid grid-cols-2 gap-3 text-sm font-mono bg-background/50 p-3 rounded border border-border/30">
                <Cell label="Hayatta Kalma" value={`${state.daysSurvived}`} sub="Gün" />
                <Cell label="Zaman" value={timeStr} sub={timeOfDayLabel(state.env.timeOfDay)} />
                <Cell label="Mevsim" value={seasonLabel(state.env.season)} sub="" />
                <Cell label="Hava" value={weatherLabel(state.env.weather)} sub={`${ambient > 0 ? '+' : ''}${ambient.toFixed(1)}°C`} />
                <Cell label="Konum" value={`${person.pos.x}, ${person.pos.y}`} sub={`Biyom: ${state.env.biomes[person.pos.y][person.pos.x]}`} />
                <Cell label="Bilişsel Seviye" value={`L${Math.floor(person.totalSteps / 500 + state.generation * 2)}`} sub="" />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="BİLİŞSEL ODAK" defaultOpen={true}>
              <div className="bg-background/40 p-3 rounded border border-border/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-primary/80" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Aktif Düşünce</span>
                </div>
                <div className="text-[11px] font-mono text-primary leading-tight italic">
                   {person.thinking ? `"${person.thinking}"` : "Zihin sessiz..."}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Hayati Belirtiler" defaultOpen={true}>
              <div className="space-y-3.5">
                {renderBar('Sağlık', v.health, 'health')}
                {renderBar('Açlık', v.hunger, 'hunger')}
                {renderBar('Susuzluk', v.thirst, 'thirst')}
                {renderBar('Sıcaklık', v.temp, 'temp')}
                {renderBar('Enerji', v.energy, 'energy')}
              </div>
            </CollapsibleSection>
          </>
        )}

        {activeTab === 'biology' && (
           <div className="space-y-6">
              <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 space-y-2">
                 <h4 className="text-[10px] font-bold text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                    <Shield size={12} /> Savunmasızlık Analizi
                 </h4>
                 <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                   "Yalnızlık ve stres, metabolik hızı %20 artırır. Güvende hissetmek hayati önem taşır."
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="p-2 bg-muted/20 rounded">BOY: {person.anatomy.height}cm</div>
                    <div className="p-2 bg-muted/20 rounded">AĞIRLIK: {person.anatomy.weight}kg</div>
                    <div className="p-2 bg-muted/20 rounded col-span-2">İSKELET: {isAdem ? 'Dar Pelvis' : 'Geniş Pelvis'}</div>
                 </div>

                 <div className="space-y-3">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/20 pb-1">Anatomik Profil</div>
                    {renderBar('Kas Kütlesi', person.anatomy.muscleMass * 100, '', isAdem ? 'bg-blue-500' : 'bg-pink-400')}
                    {renderBar('Metabolizma', 90, '', isAdem ? 'bg-blue-300' : 'bg-pink-500')}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'psychology' && (
           <div className="space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zihinsel Durum</span>
                 </div>
                 <div className="space-y-3">
                    {renderBar('Mutluluk', person.psychology.emotions.happiness, '', 'bg-emerald-500')}
                    {renderBar('Merak', person.psychology.emotions.curiosity, '', 'bg-sky-500')}
                    {renderBar('Stres', person.psychology.emotions.stress, '', 'bg-amber-500')}
                    {renderBar('Korku', person.psychology.emotions.fear, '', 'bg-rose-500')}
                 </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                 <h4 className="text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <Dna size={12} /> Primat Mirası & DNA
                 </h4>
                 <div className="grid gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>Sosyal Hiyerarşi</span>
                        <span>%{person.dna.traits.socialHierarchy}</span>
                      </div>
                      <Progress value={person.dna.traits.socialHierarchy} className="h-1 bg-black/20" indicatorClassName="bg-purple-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>Primat Mirası</span>
                        <span>%{person.dna.traits.primateHeritage}</span>
                      </div>
                      <Progress value={person.dna.traits.primateHeritage} className="h-1 bg-black/20" indicatorClassName="bg-indigo-500" />
                    </div>
                 </div>
              </div>
           </div>
        )}

        <CollapsibleSection title="GÜNLÜK AKTİVİTE ÖZETİ" defaultOpen={false}>
          <DailyStatsCard today={person.dailyStats} yesterday={person.yesterdayStats} totalSteps={person.totalSteps} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

function InventoryItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5">
      <div className={color}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] text-muted-foreground uppercase leading-none">{label}</span>
        <span className="text-xs font-mono font-bold leading-tight">{value || 0}</span>
      </div>
    </div>
  );
}

function DailyStatsCard({
  today, yesterday, totalSteps,
}: { today: DailyStats; yesterday: DailyStats | null; totalSteps: number }) {
  const items: { icon: typeof Footprints; label: string; val: string; prev: string | null }[] = [
    { icon: Footprints, label: 'Adım', val: `${today.steps}`, prev: yesterday ? `${yesterday.steps}` : null },
    { icon: Brain, label: 'Karar', val: `${today.decisionCount}`, prev: yesterday ? `${yesterday.decisionCount}` : null },
    { icon: Brain, label: 'Düşünce', val: fmtTicks(today.thinkTicks), prev: yesterday ? fmtTicks(yesterday.thinkTicks) : null },
    { icon: Moon, label: 'Uyku', val: fmtTicks(today.sleepTicks), prev: yesterday ? fmtTicks(yesterday.sleepTicks) : null },
    { icon: Bed, label: 'Dinlenme', val: fmtTicks(today.restTicks), prev: yesterday ? fmtTicks(yesterday.restTicks) : null },
    { icon: AlertCircle, label: 'Tehlike', val: `${today.hostileEncounters}`, prev: yesterday ? `${yesterday.hostileEncounters}` : null },
    { icon: Eye, label: 'Gözlem', val: `${today.meetsObserved}`, prev: yesterday ? `${yesterday.meetsObserved}` : null },
  ];

  return (
    <div className="bg-background/40 rounded border border-border/30 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono text-muted-foreground/80 opacity-0 hidden">
           Mesafe Özeti
        </h3>
        <span className="text-[9px] font-mono text-muted-foreground/60 w-full text-right">
          Toplam {totalSteps} adım
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex items-center gap-2 text-xs">
              <Icon className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-muted-foreground/80 flex-1 truncate">{it.label}</span>
              <span className="font-mono tabular-nums text-foreground">{it.val}</span>
              {it.prev !== null && (
                <span className="font-mono text-[9px] text-muted-foreground/50 w-12 text-right truncate">
                  ({it.prev})
                </span>
              )}
            </div>
          );
        })}
      </div>
      {yesterday && (
        <div className="text-[9px] font-mono text-muted-foreground/40 text-right pt-0.5 border-t border-border/20">
          parantez içi: dün
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-base text-foreground leading-tight whitespace-nowrap">
        {value}
        {sub && <span className="text-[10px] text-muted-foreground ml-1.5">{sub}</span>}
      </div>
    </div>
  );
}

export function EventLogPanel({ logs, trackingAgent }: { logs: EventLog[], trackingAgent?: 'adem' | 'havva' }) {
  const filteredLogs = logs.filter(log => {
    if (!trackingAgent) return true;
    const msg = (log.text || log.message || '').toLowerCase();
    // If it mentions the other agent but not this one, filter it out (basic heuristic).
    const isAdem = msg.includes('adem');
    const isHavva = msg.includes('havva');
    if (trackingAgent === 'adem' && isHavva && !isAdem) return false;
    if (trackingAgent === 'havva' && isAdem && !isHavva) return false;
    // Allow global events or ones containing the agent's name.
    return true;
  });

  return (
    <div className="flex-1 min-h-[200px] flex flex-col bg-card/20">
      <div className="p-4 border-b border-border/50 bg-background/50">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Olay Günlüğü ({trackingAgent === 'adem' ? 'Adem' : trackingAgent === 'havva' ? 'Havva' : 'Genel'})</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredLogs.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono opacity-50">Henüz olay yok.</p>
        )}
        {filteredLogs.map((log) => {
          const t = log.type || log.category;
          return (
            <div key={log.id} className="fade-in flex gap-3 text-sm">
              <div className="text-muted-foreground font-mono text-[10px] sm:text-xs whitespace-nowrap pt-0.5">
                [{log.day !== undefined ? `G${log.day}` : `Tick ${log.tick}`} {log.time || ''}]
              </div>
              <div
                className={
                  t === 'good' ? 'text-[#6ea587]' :
                  t === 'bad' ? 'text-[#c54b5c]' :
                  t === 'death' || t === 'critical' ? 'text-red-500 font-bold' :
                  'text-card-foreground/80'
                }
              >
                {log.text || log.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
