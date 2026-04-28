import { Brain, Droplet, Apple, Heart, Flame, Zap, AlertTriangle, ThermometerSnowflake, ThermometerSun, Skull } from 'lucide-react';
import bodyImg from '@assets/image_1777248677805.png';
import {
  KnowledgeBase,
  SimulationState,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../../lib/simulation';

interface Props {
  knowledge: KnowledgeBase;
  state: SimulationState;
}

function vitalColor(v: number): string {
  if (v < 25) return '#e3636f';
  if (v < 50) return '#e09e54';
  if (v < 75) return '#d6c970';
  return '#7dd0a0';
}

function vitalGlow(v: number): number {
  return v < 30 ? 1 : v < 60 ? 0.6 : 0.3;
}

export function KnowledgePanel({ knowledge, state }: Props) {
  const entries = Object.values(knowledge).sort((a, b) => b.confidence - a.confidence);
  const v = state.vitals;

  const avgConfidence = entries.length === 0 ? 0 :
    entries.reduce((s, e) => s + e.confidence, 0) / entries.length;

  const visitedCount = Object.keys(state.visitedTiles).length;
  const exploreRatio = visitedCount / (WORLD_WIDTH * WORLD_HEIGHT);
  const totalTiles = WORLD_WIDTH * WORLD_HEIGHT;

  return (
    <div className="flex flex-col h-full bg-card/50 border-r border-border overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-background/50">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Bilgi Veritabanı
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* BODY DIAGRAM */}
        <div className="px-4 pt-4 pb-3 border-b border-border/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
            Vücut Durumu
          </div>
          <BodyDiagram state={state} knowledgeCount={entries.length} avgConf={avgConfidence} />

          {/* current thought */}
          <div className="mt-3 px-2 py-1.5 rounded bg-background/40 border border-border/30 text-[10px] font-mono text-muted-foreground/80 text-center italic">
            "{state.thinking}"
          </div>
        </div>

        {/* VITALS SHORT */}
        <div className="px-4 py-3 border-b border-border/40">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
            <VitalDot label="Sağlık" v={v.health} icon={<Heart size={9} />} />
            <VitalDot label="Susuzluk" v={v.thirst} icon={<Droplet size={9} />} />
            <VitalDot label="Açlık" v={v.hunger} icon={<Apple size={9} />} />
            <VitalDot label="Sıcaklık" v={v.temp} icon={state.env.ambientTemp > 30 ? <ThermometerSun size={9} /> : <ThermometerSnowflake size={9} />} />
            <VitalDot label="Enerji" v={v.energy} icon={<Zap size={9} />} />
            <VitalDot label="Konfor" v={Math.max(0, 100 - Math.abs(20 - state.env.ambientTemp) * 4)} icon={<Flame size={9} />} />
          </div>
        </div>

        {/* PROGRESS */}
        <div className="px-4 py-4 border-b border-border/40 space-y-3.5">
          <ProgressBlock
            label="Öğrenim Durumu"
            value={`${entries.length} bilgi`}
            sub={`Ortalama güven %${(avgConfidence * 100).toFixed(0)}`}
            ratio={avgConfidence}
            color="#7aa3c6"
          />
          <ProgressBlock
            label="Keşfetme Durumu"
            value={`${visitedCount} / ${totalTiles}`}
            sub={`Dünyanın %${(exploreRatio * 100).toFixed(1)}'i`}
            ratio={exploreRatio}
            color="#a8956c"
          />
        </div>

        {/* LIVES HISTORY */}
        {state.livesHistory.length > 0 && (
          <div className="px-4 py-4 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              <Skull size={11} />
              Geçmiş Yaşamlar
            </div>
            <div className="space-y-1.5">
              {state.livesHistory.slice().reverse().slice(0, 6).map((life, i) => (
                <div key={i} className="text-[11px] font-mono flex justify-between items-baseline gap-2 px-2 py-1 rounded bg-background/30 border border-border/30">
                  <span className="text-muted-foreground">#{life.generation}</span>
                  <span className="text-foreground tabular-nums">{life.days}g</span>
                  <span className="flex-1 text-[#e3636f]/90 truncate text-right">{life.cause}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KNOWLEDGE ENTRIES */}
        <div className="px-4 py-4 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
            Edinilen Bilgiler
          </div>
          {entries.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono opacity-60">
              Henüz bilgi yok. ADEM keşfediyor...
            </p>
          )}
          {entries.slice(0, 14).map((entry, i) => (
            <div
              key={i}
              className="fade-in p-2.5 rounded bg-background/40 border border-border/40 hover:border-primary/30 transition-colors"
            >
              <p className="text-xs text-card-foreground/90 leading-snug">{entry.outcomeText}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-0.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${entry.confidence * 100}%`,
                      background: 'linear-gradient(90deg, #7aa3c6, #6ea587)',
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground tabular-nums">
                  {(entry.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/60">
                  ×{entry.occurrences}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VitalDot({ label, v, icon }: { label: string; v: number; icon: React.ReactNode }) {
  const c = vitalColor(v);
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span style={{ color: c }} className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="tabular-nums" style={{ color: c }}>{v.toFixed(0)}</span>
    </div>
  );
}

function ProgressBlock({
  label, value, sub, ratio, color,
}: { label: string; value: string; sub: string; ratio: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-xs font-mono text-foreground tabular-nums">{value}</div>
      </div>
      <div className="mt-1.5 h-1 bg-muted/40 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground/70 mt-1">{sub}</div>
    </div>
  );
}

function BodyDiagram({
  state, knowledgeCount, avgConf,
}: { state: SimulationState; knowledgeCount: number; avgConf: number }) {
  const v = state.vitals;
  const alerts = state.recentAlerts;
  const hasAlert = (a: string) => alerts.includes(a as never);
  const overheating = state.env.ambientTemp > 30;

  // Container is sized to closely match the X-ray body image's aspect.
  // Icon positions are percentages calibrated to anatomical landmarks in the image.
  return (
    <div className="relative mx-auto" style={{ width: 200, height: 280 }}>
      {/* Outer aura */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(122, 180, 220, 0.18) 0%, rgba(122, 180, 220, 0) 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* X-ray body image */}
      <img
        src={bodyImg}
        alt="ADEM vücut"
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ filter: 'drop-shadow(0 0 12px rgba(80, 160, 220, 0.35))' }}
        draggable={false}
      />

      {/* Body part icons overlaid (positions as % of container) */}
      {/* Brain — learning indicator */}
      <BodyIcon
        leftPct={50} topPct={9}
        active={knowledgeCount > 0}
        intensity={Math.min(1, 0.3 + avgConf * 0.7)}
        color="#9bc4e0"
        title={`Beyin: ${knowledgeCount} bilgi`}
        icon={<Brain size={12} />}
        badge={knowledgeCount > 0 ? `${knowledgeCount}` : undefined}
      />

      {/* Forehead alert (cold/hot) */}
      {(hasAlert('cold') || hasAlert('hot')) && (
        <BodyIcon
          leftPct={36} topPct={6}
          active intensity={0.85}
          color={hasAlert('cold') ? '#9ed6e2' : '#e09e54'}
          title={hasAlert('cold') ? 'Üşüyor' : 'Aşırı sıcak'}
          icon={hasAlert('cold') ? <ThermometerSnowflake size={11} /> : <ThermometerSun size={11} />}
          pulse
        />
      )}

      {/* Throat — thirst */}
      <BodyIcon
        leftPct={50} topPct={20}
        active intensity={vitalGlow(v.thirst)}
        color={vitalColor(v.thirst)}
        title={`Susuzluk ${v.thirst.toFixed(0)}`}
        icon={<Droplet size={11} />}
        pulse={hasAlert('thirst')}
      />

      {/* Heart — health (left chest) */}
      <BodyIcon
        leftPct={42} topPct={32}
        active intensity={vitalGlow(v.health)}
        color={vitalColor(v.health)}
        title={`Sağlık ${v.health.toFixed(0)}`}
        icon={<Heart size={12} />}
        pulse={hasAlert('low_health')}
      />

      {/* Body temp — right chest (lung area) */}
      <BodyIcon
        leftPct={58} topPct={32}
        active intensity={vitalGlow(v.temp)}
        color={vitalColor(v.temp)}
        title={`Vücut sıcaklığı ${v.temp.toFixed(0)}`}
        icon={overheating ? <ThermometerSun size={12} /> : <ThermometerSnowflake size={12} />}
      />

      {/* Stomach — hunger */}
      <BodyIcon
        leftPct={50} topPct={48}
        active intensity={vitalGlow(v.hunger)}
        color={vitalColor(v.hunger)}
        title={`Açlık ${v.hunger.toFixed(0)}`}
        icon={<Apple size={12} />}
        pulse={hasAlert('hunger')}
      />

      {/* Energy — leg */}
      <BodyIcon
        leftPct={42} topPct={78}
        active intensity={vitalGlow(v.energy)}
        color={vitalColor(v.energy)}
        title={`Enerji ${v.energy.toFixed(0)}`}
        icon={<Zap size={11} />}
        pulse={hasAlert('fatigue')}
      />

      {/* Pain marker if low health */}
      {hasAlert('low_health') && (
        <BodyIcon
          leftPct={62} topPct={56}
          active intensity={1}
          color="#e3636f"
          title="Yaralı"
          icon={<AlertTriangle size={10} />}
          pulse
        />
      )}
    </div>
  );
}

function BodyIcon({
  leftPct, topPct, color, intensity, icon, title, pulse, badge, active,
}: {
  leftPct: number; topPct: number; color: string; intensity: number;
  icon: React.ReactNode; title: string; pulse?: boolean; badge?: string; active?: boolean;
}) {
  if (!active) return null;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      title={title}
    >
      <div
        className={`relative flex items-center justify-center rounded-full ${pulse ? 'animate-pulse' : ''}`}
        style={{
          width: 20,
          height: 20,
          background: `radial-gradient(circle, ${color}55 0%, transparent 75%)`,
          boxShadow: `0 0 ${5 + intensity * 9}px ${color}`,
        }}
      >
        <div
          className="rounded-full p-1 backdrop-blur-sm"
          style={{
            background: `rgba(8, 18, 30, 0.55)`,
            color,
            border: `1px solid ${color}80`,
          }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="absolute -bottom-1.5 -right-1.5 text-[8px] font-mono px-1 rounded-full leading-tight"
            style={{ background: color, color: '#0d1316', border: '1px solid rgba(0,0,0,0.4)' }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
