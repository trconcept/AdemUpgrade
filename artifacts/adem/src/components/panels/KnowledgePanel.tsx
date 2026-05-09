import { Brain, Droplet, Apple, Heart, Flame, Zap, AlertTriangle, ThermometerSnowflake, ThermometerSun, Skull, ChevronDown, ChevronRight, MessageSquareCode, Hammer, Fingerprint } from 'lucide-react';
import React, { useState } from 'react';
import {
  KnowledgeBase,
  SimulationState,
  Person,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../../lib/simulation';

interface Props {
  knowledge: KnowledgeBase;
  state: SimulationState;
  person: Person;
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

export function KnowledgePanel({ knowledge, state, person }: Props) {
  const entries = Object.values(knowledge || {}).sort((a, b) => b.confidence - a.confidence);
  const v = person.vitals;

  const avgConfidence = entries.length === 0 ? 0 :
    entries.reduce((s, e) => s + e.confidence, 0) / entries.length;

  const visitedCount = Object.keys(person.visitedTiles || {}).length;
  const exploreRatio = visitedCount / (WORLD_WIDTH * WORLD_HEIGHT);
  const totalTiles = WORLD_WIDTH * WORLD_HEIGHT;

  return (
    <div className="flex flex-col h-full bg-card/50 border-r border-border overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-background/50 sticky top-0 z-10 w-full bg-gradient-to-b from-background to-transparent backdrop-blur-sm">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Bilgi Veritabanı ({person.name})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* BODY DIAGRAM */}
        <CollapsibleSection title="Vücut Durumu" defaultOpen={true}>
          <BodyDiagram state={state} person={person} knowledgeCount={entries.length} avgConf={avgConfidence} />

          {/* current thought */}
          <div className="mt-3 px-2 py-1.5 rounded bg-background/40 border border-border/30 text-[10px] font-mono text-muted-foreground/80 text-center italic">
            "{person.thinking}"
          </div>
        </CollapsibleSection>

        {/* VITALS SHORT */}
        <CollapsibleSection title="Hayati Özet" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
            <VitalDot label="Sağlık" v={v.health} icon={<Heart size={9} />} />
            <VitalDot label="Toksisite" v={Math.max(0, 100 - v.toxicity)} icon={<Skull size={9} />} />
            <VitalDot label="Susuzluk" v={v.thirst} icon={<Droplet size={9} />} />
            <VitalDot label="Açlık" v={v.hunger} icon={<Apple size={9} />} />
            <VitalDot label="Sıcaklık" v={v.temp} icon={state.env.ambientTemp > 30 ? <ThermometerSun size={9} /> : <ThermometerSnowflake size={9} />} />
            <VitalDot label="Enerji" v={v.energy} icon={<Zap size={9} />} />
          </div>
        </CollapsibleSection>

        {/* PROGRESS */}
        <CollapsibleSection title="Öğrenim & Keşif" defaultOpen={true}>
          <div className="space-y-3.5">
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
        </CollapsibleSection>

        {/* LINGUISTICS & INVENTIONS */}
        <CollapsibleSection title="Filogenetik Gelişim (Dil & Teknoloji)" defaultOpen={true}>
           <div className="space-y-4">
              <div className="bg-background/40 p-3 rounded border border-border/30">
                 <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-cyan-400">
                    <MessageSquareCode size={12} />
                    <span>LİNGUİSTİK KALİBRASYON</span>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                    {state.linguistics.vocabulary.length === 0 && <span className="text-[10px] text-muted-foreground italic">Henüz kavram simgesi yok.</span>}
                    {state.linguistics.vocabulary.map((word, i) => (
                       <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 rounded-sm">
                          {word}
                       </span>
                    ))}
                 </div>
                 <div className="mt-3 pt-2 border-t border-border/10">
                    <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                       <span>SENTAKS KARMAŞIKLIĞI</span>
                       <span>%{(state.linguistics.syntaxComplexity * 100).toFixed(1)}</span>
                    </div>
                    <div className="w-full h-0.5 bg-muted/30 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${state.linguistics.syntaxComplexity * 100}%` }} />
                    </div>
                 </div>
              </div>

              <div className="bg-background/40 p-3 rounded border border-border/30">
                 <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-amber-500">
                    <Hammer size={12} />
                    <span>PROSEDÜREL KEŞİFLER</span>
                 </div>
                 <div className="space-y-1.5">
                    {state.inventions.length === 0 && <span className="text-[10px] text-muted-foreground italic">Araç kullanımı henüz soyut.</span>}
                    {state.inventions.map((inv, i) => (
                       <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-foreground/90">
                          <div className="w-1 h-1 bg-amber-500 rounded-full" />
                          {inv}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-background/40 p-3 rounded border border-border/30">
                 <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-indigo-400">
                    <Fingerprint size={12} />
                    <span>SOYUT SEMBOLİZM</span>
                 </div>
                 <div className="flex gap-3 text-lg font-serif text-indigo-200/60 transition-all duration-1000">
                    {state.linguistics.discoveredSymbols.length === 0 && <span className="text-[10px] font-mono italic text-muted-foreground">İşaret bekleniyor...</span>}
                    {state.linguistics.discoveredSymbols.map((s, i) => (
                        <span key={i} className="animate-in zoom-in-50 duration-700">{s}</span>
                    ))}
                 </div>
              </div>
           </div>
        </CollapsibleSection>

        {/* ARCHAEOLOGY */}
        {state.env.archaeology && state.env.archaeology.length > 0 && (
          <CollapsibleSection title="Arkeolojik Kayıtlar" defaultOpen={false}>
            <div className="space-y-1.5 px-1">
              {state.env.archaeology.slice().reverse().slice(0, 10).map((entry, i) => (
                <div key={i} className="text-[10px] font-mono px-2 py-1.5 rounded bg-background/30 border border-border/30 hover:border-cyan-500/20 transition-all">
                  <div className="flex justify-between items-center text-cyan-400/80 mb-1">
                    <span className="font-bold tracking-tighter">{entry.action}</span>
                    <span className="opacity-50">T+{entry.timestamp}</span>
                  </div>
                  <div className="text-muted-foreground/70 text-[9px] leading-tight">
                    LOC: {entry.x},{entry.y} ALT: {entry.z}m<br/>
                    TRANS: {entry.prevTile} <span className="text-primary/60">→</span> {entry.newTile}
                  </div>
                </div>
              ))}
              {state.env.archaeology.length > 10 && (
                <div className="text-[9px] text-center text-muted-foreground/40 italic pt-1">
                  + {state.env.archaeology.length - 10} kayıt daha derinde...
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* LIVES HISTORY */}
        {state.livesHistory.length > 0 && (
          <CollapsibleSection title="Geçmiş Yaşamlar" defaultOpen={false}>
            <div className="space-y-1.5">
              {state.livesHistory.slice().reverse().slice(0, 6).map((life, i) => (
                <div key={i} className="text-[11px] font-mono flex justify-between items-baseline gap-2 px-2 py-1 rounded bg-background/30 border border-border/30">
                  <span className="text-muted-foreground">#{life.generation}</span>
                  <span className="text-foreground tabular-nums">{life.days}g</span>
                  <span className="flex-1 text-[#e3636f]/90 truncate text-right">{life.cause}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* KNOWLEDGE ENTRIES */}
        <CollapsibleSection title="Edinilen Bilgiler" defaultOpen={true}>
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-xs text-muted-foreground font-mono opacity-60">
                Henüz bilgi yok. ADEM keşfediyor...
              </p>
            )}
            {entries.slice(0, 14).map((entry, i) => {
              const word = state.linguistics.wordMap[entry.situation] || entry.situation;
              const symbol = state.linguistics.symbolMap[entry.situation] || (state.godMode ? '?' : '');
              const displayTitle = state.godMode ? `${entry.situation.toUpperCase()} (${word})` : `DENEYİM: ${word}`;
              
              return (
                <div
                  key={i}
                  className="fade-in p-2.5 rounded bg-background/40 border border-border/40 hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-tight">
                      {displayTitle}
                    </span>
                    {symbol && (
                      <span className="text-lg font-serif text-indigo-300 opacity-60 leading-none">
                        {symbol}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 mb-2 text-[9px] font-mono text-muted-foreground/80">
                    <div><span className="opacity-50">Durum:</span> {entry.situation}</div>
                    <div><span className="opacity-50">Eylem:</span> {entry.action}</div>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground/90 mb-2 leading-tight border-l border-border/30 pl-2">
                    {entry.outcomeText}
                  </p>

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
                  <span className="text-[9px] font-mono text-muted-foreground/60 w-6 text-right">
                    ×{entry.occurrences}
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </CollapsibleSection>
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
  state, person, knowledgeCount, avgConf,
}: { state: SimulationState; person: Person; knowledgeCount: number; avgConf: number }) {
  const v = person.vitals;
  const alerts = person.recentAlerts;
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

      {/* SVG Human Body Silhouette */}
      <svg
        viewBox="0 0 100 200"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: "drop-shadow(0 0 10px rgba(122, 180, 220, 0.6))",
          strokeWidth: 1.5,
          stroke: "rgba(122, 180, 220, 0.9)",
          fill: "rgba(122, 180, 220, 0.2)",
        }}
      >
        <path d="M50 10 C55 10 58 13 58 18 C58 23 55 26 50 26 C45 26 42 23 42 18 C42 13 45 10 50 10 Z" />
        <path d="M50 26 C50 30 45 32 40 32 L35 32 C30 32 25 35 25 45 L25 55 C25 60 28 65 30 75 L35 110 L45 110 L48 85 L52 85 L55 110 L65 110 L70 75 C72 65 75 60 75 55 L75 45 C75 35 70 32 65 32 L60 32 C55 32 50 30 50 26 Z" />
        <path d="M42 110 L42 180 C42 185 45 190 48 190 L50 190 L50 110" />
        <path d="M58 110 L58 180 C58 185 55 190 52 190 L50 190 L50 110" />
      </svg>

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
