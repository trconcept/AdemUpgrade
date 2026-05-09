import React, { useState, useEffect } from 'react';
import { Brain, Heart, Zap, Smile, Frown, Compass, AlertCircle, Trash2, Network, User, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SimulationState } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Props {
  state: SimulationState;
}

export function PsychologyPanel({ state }: Props) {
  const { adem, havva } = state;
  const ademPsy = adem.psychology;
  const havvaPsy = havva.psychology;
  
  // Use combined knowledge for the map/observations view
  const combinedKnowledge = { ...adem.knowledge, ...havva.knowledge };
  const klKeys = Object.keys(combinedKnowledge).slice(-5);
  const inv = state.inventions.slice(-3);

  const impressions = Object.values(ademPsy.impressions);
  const likes = impressions.filter(i => i.sentiment > 0).sort((a,b) => b.sentiment - a.sentiment);
  const dislikes = impressions.filter(i => i.sentiment < 0).sort((a,b) => a.sentiment - b.sentiment);

  const [emotionHistory, setEmotionHistory] = useState<any[]>([]);

  useEffect(() => {
    setEmotionHistory(prev => {
      const newData = [...prev, {
        time: state.ticksSurvived,
        ademHappiness: ademPsy.emotions.happiness,
        ademStress: ademPsy.emotions.stress,
        havvaHappiness: havvaPsy.emotions.happiness,
        havvaStress: havvaPsy.emotions.stress,
      }];
      return newData.slice(-30);
    });
  }, [ademPsy.emotions, havvaPsy.emotions, state.ticksSurvived]);

  const emotionColors = {
    happiness: 'bg-emerald-500',
    fear: 'bg-rose-500',
    curiosity: 'bg-sky-500',
    stress: 'bg-amber-500',
    willpower: 'bg-indigo-500',
    tension: 'bg-purple-600',
  };

  const renderEmotionGroup = (person: any, label: string, colorClass: string) => {
    const emos = person.psychology.emotions;
    return (
      <div className="space-y-3 bg-muted/10 p-3 rounded-lg border border-border/20">
         <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${colorClass}`}>
            <User size={12} /> {label} ZİHİN DURUMU
         </div>
         <div className="grid gap-2">
            {[
              { l: 'MUTLULUK', v: emos.happiness, c: emotionColors.happiness, i: <Smile size={12}/> },
              { l: 'KORKU', v: emos.fear, c: emotionColors.fear, i: <AlertCircle size={12}/> },
              { l: 'MERAK', v: emos.curiosity, c: emotionColors.curiosity, i: <Compass size={12}/> },
              { l: 'STRES', v: emos.stress, c: emotionColors.stress, i: <Zap size={12}/> },
            ].map(e => (
              <div key={e.l} className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="flex items-center gap-1 opacity-70">{e.i} {e.l}</span>
                  <span>%{Math.round(e.v)}</span>
                </div>
                <Progress value={e.v} className="h-1 bg-black/20" indicatorClassName={e.c} />
              </div>
            ))}
         </div>
         <div className="mt-2 pt-2 border-t border-border/10">
            <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1 flex items-center gap-1">
              <Brain size={10}/> AKTİF ODAK:
            </div>
            <div className="text-[10px] font-mono text-primary leading-tight italic bg-black/10 p-1.5 rounded line-clamp-2">
               {person.thinking}
            </div>
         </div>
      </div>
    );
  };

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      {/* EMOTIONAL STATE COMPARISON */}
      <section className="space-y-4 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-primary" />
            <span>PSİKOLOJİK KARŞILAŞTIRMA (KOLEKTİF BİLİNÇ)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {renderEmotionGroup(adem, "ADEM", "text-blue-400")}
           {renderEmotionGroup(havva, "HAVVA", "text-pink-400")}
        </div>
      </section>

      {/* NEURAL SYNC GRAPH */}
      <section className="space-y-3 shrink-0 h-40">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <Activity size={14} className="text-primary/70" />
          <span>Duygusal Senkronizasyon (Trend)</span>
        </div>
        <div className="w-full h-full bg-card/20 rounded border border-border/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emotionHistory}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '4px', fontSize: '9px', color: '#fff' }}
                itemStyle={{ padding: 0 }}
              />
              <Line type="monotone" name="Adem Mutluluk" dataKey="ademHappiness" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" name="Havva Mutluluk" dataKey="havvaHappiness" stroke="#ec4899" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" name="Adem Stres" dataKey="ademStress" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              <Line type="monotone" name="Havva Stres" dataKey="havvaStress" stroke="#ec4899" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-[8px] font-mono uppercase text-muted-foreground">
           <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-[#3b82f6]"/> Adem</div>
           <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-[#ec4899]"/> Havva</div>
        </div>
      </section>

      {/* INTERACTIVE MIND MAP */}
      <section className="space-y-3 shrink-0 flex-1 min-h-[220px] flex flex-col">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-primary/70" />
            <span>Nöral Kavram Haritası</span>
          </div>
          <span className="text-[8px] opacity-70 bg-muted/50 px-1.5 py-0.5 rounded cursor-help" title="Farenin kaydırma tekerleğiyle yakınlaşıp uzaklaşabilir ve sürükleyerek gezinebilirsiniz">
            Etkileşimli Harita
          </span>
        </div>
        <div className="relative flex-1 bg-card/30 rounded border border-border/40 overflow-hidden hover:border-primary/30 transition-colors">
           {Object.keys(combinedKnowledge).length === 0 && state.inventions.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground italic">Zihin henüz çok sessiz...</span>
              </div>
           ) : (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                centerOnInit={true}
              >
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                  <div className="relative w-[800px] h-[800px]">
                    {/* Connections to Center */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                      {Object.entries(combinedKnowledge)
                        .slice(-30)
                        .map((_, i, arr) => {
                           const count = arr.length + state.inventions.slice(-10).length;
                           const index = i;
                           const angle = (index / count) * Math.PI * 2;
                           const radius = 100 + (index % 3) * 40;
                           const x = 400 + Math.cos(angle) * radius;
                           const y = 400 + Math.sin(angle) * radius;
                           return <line key={`line_obs_${i}`} x1="400" y1="400" x2={x} y2={y} stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" />;
                      })}
                      {state.inventions.slice(-10).map((_, i, arr) => {
                           const count = Object.keys(combinedKnowledge).slice(-30).length + arr.length;
                           const index = Object.keys(combinedKnowledge).slice(-30).length + i;
                           const angle = (index / count) * Math.PI * 2;
                           const radius = 100 + (index % 3) * 40;
                           const x = 400 + Math.cos(angle) * radius;
                           const y = 400 + Math.sin(angle) * radius;
                           return <line key={`line_inv_${i}`} x1="400" y1="400" x2={x} y2={y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />;
                      })}
                    </svg>

                    {/* Central Node */}
                    <div 
                       onClick={(e) => { e.stopPropagation(); setSelectedNode('BENLİK\nDünyanın farkında olan ana bilinç merkezi.'); }}
                       className="absolute top-[400px] left-[400px] -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/50 cursor-pointer hover:bg-primary/30 z-10 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                       <Brain size={20} className="text-primary" />
                    </div>
                    
                    {/* Orbit Nodes: Observations */}
                    {Object.entries(combinedKnowledge).slice(-30).map(([k, v]: [string, any], i, arr) => {
                      const count = arr.length + state.inventions.slice(-10).length;
                      const index = i;
                      const angle = (index / count) * Math.PI * 2;
                      const radius = 100 + (index % 3) * 40;
                      const x = 400 + Math.cos(angle) * radius;
                      const y = 400 + Math.sin(angle) * radius;
                      return (
                        <div 
                           key={`obs_${k}`}
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             setSelectedNode(`BİLGİ: ${v.label || k}\nBağlam: ${v.situation || 'Keşif'}\nGüven: %${Math.round(v.confidence * 100)}`); 
                           }}
                           className="absolute bg-cyan-500/20 px-2 py-1.5 rounded-md flex items-center justify-center border border-cyan-500/40 cursor-pointer hover:bg-cyan-500/40 text-[10px] font-mono whitespace-nowrap text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:scale-110 transition-transform"
                           style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                           {v.label ? v.label.toUpperCase() : k.toUpperCase()}
                        </div>
                      );
                    })}

                    {/* Orbit Nodes: Inventions */}
                    {state.inventions.slice(-10).map((invName, i, arr) => {
                      const count = Object.keys(combinedKnowledge).slice(-30).length + arr.length;
                      const index = Object.keys(combinedKnowledge).slice(-30).length + i;
                      const angle = (index / count) * Math.PI * 2;
                      const radius = 100 + (index % 3) * 40;
                      const x = 400 + Math.cos(angle) * radius;
                      const y = 400 + Math.sin(angle) * radius;
                      return (
                        <div 
                           key={`inv_${invName}`}
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             setSelectedNode(`ÜRETİM: ${invName}\nAdem'in zekası bir araç tasarladı.`); 
                           }}
                           className="absolute bg-amber-500/20 px-2 py-1.5 rounded-md flex items-center justify-center border border-amber-500/40 cursor-pointer hover:bg-amber-500/40 text-[10px] font-mono whitespace-nowrap text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-110 transition-transform z-10"
                           style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                           🔨 {invName.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </TransformWrapper>
           )}

           {/* Details Popover */}
           <AnimatePresence>
             {selectedNode && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute bottom-3 left-3 right-3 bg-background/95 backdrop-blur-xl border border-border/80 p-3 rounded-lg text-xs shadow-2xl z-20 pointer-events-auto">
                 <div className="flex justify-between items-start mb-2 border-b border-border/50 pb-2">
                   <span className="font-bold text-primary">{selectedNode.split('\n')[0]}</span>
                   <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground bg-muted/50 rounded-full w-5 h-5 flex items-center justify-center -mt-1 -mr-1">×</button>
                 </div>
                 <div className="text-muted-foreground leading-relaxed">
                   {selectedNode.split('\n').slice(1).map((line, i) => (
                     <div key={i}>{line}</div>
                   ))}
                   {selectedNode.split('\n').length === 1 && "Bu düğüm, zihindeki aktif bir sinaptik bağı temsil eder."}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </section>

      {/* DISCOVERED FEELINGS */}
      <div className="grid grid-cols-2 gap-4 shrink-0 min-h-[200px]">
        {/* LIKES */}
        <section className="flex flex-col space-y-3 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider">
            <Heart size={14} />
            <span>POZİTİF İZLER</span>
          </div>
          <div className="flex-1 space-y-2">
            {likes.length === 0 ? (
              <div className="text-[10px] text-muted-foreground opacity-40 italic py-4">Henüz güzel bir şey keşfetmedi...</div>
            ) : (
              likes.map((imp, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={imp.label} 
                  className="bg-emerald-500/5 border border-emerald-500/10 rounded p-2 space-y-1 hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400 truncate pr-2">{imp.label}</span>
                    <span className="text-[9px] text-emerald-500/60">+{imp.sentiment}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">{imp.description}</p>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* DISLIKES */}
        <section className="flex flex-col space-y-3 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500/80 uppercase tracking-wider">
            <Frown size={14} />
            <span>TRAVMALAR</span>
          </div>
          <div className="flex-1 space-y-2">
            {dislikes.length === 0 ? (
              <div className="text-[10px] text-muted-foreground opacity-40 italic py-4">Dünya henüz ona zarar vermedi...</div>
            ) : (
              dislikes.map((imp, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={imp.label} 
                  className="bg-rose-500/5 border border-rose-500/10 rounded p-2 space-y-1 hover:bg-rose-500/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-rose-400 truncate pr-2">{imp.label}</span>
                    <span className="text-[9px] text-rose-500/60">{imp.sentiment}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">{imp.description}</p>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="pt-4 border-t border-border/40 shrink-0 mt-auto">
        <div className="bg-primary/5 rounded p-3 border border-primary/10">
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            "Adem dünyayı sadece verilere göre değil, hissettiklerine göre de anlamlandırıyor. 
            Acıdan kaçmayı ve hazza yaklaşmayı öğreniyor; bu onun hayatta kalma stratejisinin çekirdeğidir."
          </p>
        </div>
      </div>
    </div>
  );
}
