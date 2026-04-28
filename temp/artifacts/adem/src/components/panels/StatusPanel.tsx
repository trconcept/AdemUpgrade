import { SimulationState, EventLog, weatherLabel, seasonLabel, timeOfDayLabel, DailyStats } from '../../lib/simulation';
import { Footprints, Brain, Moon, Bed, AlertCircle, Eye } from 'lucide-react';

const TICK_SECONDS = 0.8;
function fmtTicks(t: number): string {
  const sec = Math.round(t * TICK_SECONDS);
  if (sec < 60) return `${sec}sn`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}dk` : `${m}dk ${s}sn`;
}

export function StatusPanel({ state }: { state: SimulationState }) {
  const v = state.vitals;

  const renderBar = (label: string, val: number, colorVar: string) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{val.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${val}%`,
            backgroundColor: `hsl(var(--${colorVar}))`,
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
    <div className="flex-shrink-0 flex flex-col border-b border-border bg-card/30">
      <div className="p-4 border-b border-border/50 bg-background/50 flex justify-between items-center">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Durum Paneli
        </h2>
        <div className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          YAŞAM #{state.generation}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm font-mono bg-background/50 p-3 rounded border border-border/30">
          <Cell label="Hayatta Kalma" value={`${state.daysSurvived}`} sub="Gün" />
          <Cell label="Zaman" value={timeStr} sub={timeOfDayLabel(state.env.timeOfDay)} />
          <Cell label="Mevsim" value={seasonLabel(state.env.season)} sub="" />
          <Cell label="Hava" value={weatherLabel(state.env.weather)} sub={`${ambient > 0 ? '+' : ''}${ambient.toFixed(1)}°C`} />
        </div>

        <div className="space-y-3.5">
          {renderBar('Sağlık', v.health, 'health')}
          {renderBar('Açlık', v.hunger, 'hunger')}
          {renderBar('Susuzluk', v.thirst, 'thirst')}
          {renderBar('Vücut Sıcaklığı', v.temp, 'temp')}
          {renderBar('Enerji', v.energy, 'energy')}
        </div>

        <DailyStatsCard today={state.dailyStats} yesterday={state.yesterdayStats} totalSteps={state.totalSteps} />
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
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Bugünkü Aktivite
        </h3>
        <span className="text-[9px] font-mono text-muted-foreground/60">
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
      <div className="text-base text-foreground leading-tight">
        {value}
        {sub && <span className="text-[10px] text-muted-foreground ml-1.5">{sub}</span>}
      </div>
    </div>
  );
}

export function EventLogPanel({ logs }: { logs: EventLog[] }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-card/20">
      <div className="p-4 border-b border-border/50 bg-background/50">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Olay Günlüğü</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono opacity-50">Henüz olay yok.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="fade-in flex gap-3 text-sm">
            <div className="text-muted-foreground font-mono text-xs whitespace-nowrap pt-0.5">
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
