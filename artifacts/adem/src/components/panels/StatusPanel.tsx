import { SimulationState, EventLog, weatherLabel, seasonLabel, timeOfDayLabel, DailyStats, Person } from '../../lib/simulation';
import { Footprints, Brain, Moon, Bed, AlertCircle, Eye, ChevronRight, ChevronDown, Package, Apple, Sprout, Flower2, User } from 'lucide-react';
import React, { useState } from 'react';

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
  const v = person.vitals;
  const isAdem = person.gender === 'male';

  const renderBar = (label: string, val: number, colorVar: string) => (
    <div className="space-y-1.5" key={label}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{val.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${val}%`,
            backgroundColor: isAdem ? `hsl(var(--${colorVar}))` : (colorVar === 'health' ? '#ec4899' : `hsl(var(--${colorVar}))`),
            opacity: val < 20 ? 0.85 : 1,
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
      <div className={`p-4 border-b border-border/50 flex justify-between items-center sticky top-0 z-10 ${isAdem ? 'bg-indigo-500/5' : 'bg-pink-500/5'}`}>
        <div className="flex items-center gap-2">
           <User size={14} className={isAdem ? 'text-blue-400' : 'text-pink-400'} />
           <h2 className={`text-xs font-mono uppercase tracking-widest ${isAdem ? 'text-blue-400' : 'text-pink-400'}`}>
             {isAdem ? 'ADEM VERİ HATTI' : 'HAVVA VERİ HATTI'}
           </h2>
        </div>
        <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isAdem ? 'bg-primary/10 text-primary' : 'bg-pink-500/10 text-pink-500'}`}>
           YAŞAM #{state.generation}
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
        
        <CollapsibleSection title="ORTAM & BİLGİ" defaultOpen={true}>
          <div className="grid grid-cols-2 gap-3 text-sm font-mono bg-background/50 p-3 rounded border border-border/30">
            <Cell label="Hayatta Kalma" value={`${state.daysSurvived}`} sub="Gün" />
            <Cell label="Zaman" value={timeStr} sub={timeOfDayLabel(state.env.timeOfDay)} />
            <Cell label="Mevsim" value={seasonLabel(state.env.season)} sub="" />
            <Cell label="Hava" value={weatherLabel(state.env.weather)} sub={`${ambient > 0 ? '+' : ''}${ambient.toFixed(1)}°C`} />
            <Cell label="Konum" value={`${person.pos.x}, ${person.pos.y}`} sub={`Biyom: ${state.env.biomes[person.pos.y][person.pos.x]}`} />
            <Cell label="Bilişsel Seviye" value={`L${Math.floor(person.totalSteps / 500 + state.generation * 2)}`} sub={`${state.daysSurvived * 10} IQ eq.`} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="BİLİŞSEL MİMARİ" defaultOpen={true}>
          <div className="bg-background/40 p-3 rounded border border-border/20 space-y-2">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-primary/80" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Zihinsel Durum</span>
            </div>
            <div className="text-sm font-mono text-primary font-medium tracking-tight">
              {state.godMode ? state.cognitiveArchitecture : state.cognitiveArchitecture.split(' ')[0]}
            </div>
            <div className="text-[10px] text-muted-foreground/80 font-mono leading-tight border-t border-border/10 pt-2 flex gap-1.5">
              <span className="opacity-50">&gt;_</span>
              <span>{state.godMode ? person.thinking : (person.thinking || '').replace(/\[.*?\]/g, '').trim()}</span>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="ENVANTER (ZULA)" defaultOpen={true}>
          <div className="bg-background/40 p-3 rounded border border-border/20 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5">
              <Apple size={14} className="text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">
                  {state.godMode ? 'Meyve' : (state.linguistics.wordMap['safe_fruit'] || '???')}
                </span>
                <span className="text-xs font-mono font-bold leading-tight">{person.inventory['safe_fruit'] || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5">
              <Sprout size={14} className="text-orange-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">
                  {state.godMode ? 'Mantar' : (state.linguistics.wordMap['mushroom'] || '???')}
                </span>
                <span className="text-xs font-mono font-bold leading-tight">{person.inventory['mushroom'] || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5">
              <Flower2 size={14} className="text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">
                  {state.godMode ? 'Bitki' : (state.linguistics.wordMap['herb'] || '???')}
                </span>
                <span className="text-xs font-mono font-bold leading-tight">{person.inventory['herb'] || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5 opacity-40">
              <Package size={14} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">Diğer</span>
                <span className="text-xs font-mono font-bold leading-tight">0</span>
              </div>
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

        <CollapsibleSection title="Fiziksel Kondisyon" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
            {renderBar('Kafa', v.bodyParts.head, 'health')}
            {renderBar('Gövde', v.bodyParts.torso, 'health')}
            {renderBar('Kollar', v.bodyParts.arms, 'health')}
            {renderBar('Bacaklar', v.bodyParts.legs, 'health')}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Günlük Aktivite Özeti" defaultOpen={false}>
          <DailyStatsCard today={person.dailyStats} yesterday={person.yesterdayStats} totalSteps={person.totalSteps} />
        </CollapsibleSection>

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

export function EventLogPanel({ logs }: { logs: EventLog[] }) {
  return (
    <div className="flex-1 min-h-[200px] flex flex-col bg-card/20">
      <div className="p-4 border-b border-border/50 bg-background/50">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Olay Günlüğü</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono opacity-50">Henüz olay yok.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="fade-in flex gap-3 text-sm">
            <div className="text-muted-foreground font-mono text-[10px] sm:text-xs whitespace-nowrap pt-0.5">
              [G{log.day} {log.time}]
            </div>
            <div
              className={
                log.type === 'good' ? 'text-[#6ea587]' :
                log.type === 'bad' ? 'text-[#c54b5c]' :
                'text-card-foreground/80'
              }
            >
              {log.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
