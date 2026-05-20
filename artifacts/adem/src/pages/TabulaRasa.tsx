import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { 
  SimulationState, 
  createInitialState, 
  tickSimulation, 
  WORLD_WIDTH, 
  WORLD_HEIGHT, 
  EventLog,
  Person
} from "@/lib/simulation";
import { StatusPanel, EventLogPanel } from "@/components/panels/StatusPanel";
import { BiologyPanel } from "@/components/panels/BiologyPanel";
import { PsychologyPanel } from "@/components/panels/PsychologyPanel";
import { BiologicalNecessitiesPanel } from "@/components/panels/BiologicalNecessitiesPanel";
import { LinguisticsLabPanel } from "@/components/panels/LinguisticsLabPanel";
import { LineageExplorerPanel } from "@/components/panels/LineageExplorerPanel";

export default function TabulaRasa() {
  const [state, setState] = useState<SimulationState>(() => createInitialState(1, [], undefined, undefined, 'tabula_rasa'));
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [panelTab, setPanelTab] = useState<string>("status");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation tick
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    // We tick significantly faster or slower depending on needs, but let's stick to consistent timing
    const targetFPS = 20; 
    const interval = 1000 / targetFPS;

    const loop = (time: number) => {
      animationFrameId = requestAnimationFrame(loop);
      
      const dt = time - lastTime;
      if (dt >= interval) {
        lastTime = time - (dt % interval);
        setState((prev) => {
           if (!prev) return prev;
           const { newState, newLogs } = tickSimulation(prev);
           if (newLogs.length > 0) {
             setLogs(old => [...newLogs, ...old].slice(0, 50));
           }
           return { ...newState };
        });
      }
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellW = canvas.width / WORLD_WIDTH;
    const cellH = canvas.height / WORLD_HEIGHT;

    // Draw Biomes
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const height = state.env.heights[y][x];
        const biome = state.env.biomes[y][x];
        const tile = state.env.grid[y][x];

        let color = '#2E8B57'; 
        if (tile === 'volcano') color = '#ff4500';
        else if (height < 0) {
          color = height < -0.5 ? '#1E90FF' : '#4169E1'; // Derin su vs Sığ su
        } else {
          if (biome === 'desert') color = '#EDC9Af';
          else if (biome === 'tundra') color = '#E0F7FA';
          else if (biome === 'jungle') color = '#228B22';
          else if (biome === 'volcanic') color = '#555555';
          else color = '#3CB371';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);

        // Draw static objects
        if (tile === 'stone') {
          ctx.fillStyle = '#808080';
          ctx.beginPath();
          ctx.arc(x * cellW + cellW/2, y * cellH + cellH/2, cellW/3, 0, Math.PI*2);
          ctx.fill();
        } else if (tile === 'safe_fruit') {
          ctx.fillStyle = '#ff6b6b';
          ctx.beginPath();
          ctx.arc(x * cellW + cellW/2, y * cellH + cellH/2, cellW/4, 0, Math.PI*2);
          ctx.fill();
        } else if (tile === 'tree') {
          ctx.fillStyle = '#006400';
          ctx.beginPath();
          ctx.arc(x * cellW + cellW/2, y * cellH + cellH/2, cellW/2, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    // Draw population
    if (state.population) {
      state.population.forEach(p => {
        if (p.vitals.health <= 0) return;
        ctx.fillStyle = p.gender === 'male' ? '#4dabf7' : '#ff922b'; 
        ctx.beginPath();
        ctx.arc(p.pos.x * cellW + cellW/2, p.pos.y * cellH + cellH/2, Math.max(cellW/1.5, 2), 0, Math.PI*2);
        ctx.fill();
      });
    }

  }, [state]);

  const alivePopulation = state.population?.filter(p => p.vitals.health > 0) || [];

  return (
    <div className="w-full h-screen bg-[#050505] text-foreground flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-14 border-b border-border/40 bg-background/90 backdrop-blur shrink-0 flex items-center px-4 justify-between z-10 box-border">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            ← Geri
          </Link>
          <div className="flex items-center gap-2 border-l border-border/50 pl-4">
            <span className="w-2 h-2 rounded-full border border-primary bg-primary/20 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Tabula Rasa Modu</span>
          </div>
          <div className="flex gap-4 ml-6 text-xs font-mono text-muted-foreground">
            <span>GEN: {state.generation}</span>
            <span>GÜN: {state.daysSurvived}</span>
            <span>SAĞ NÜFUS: <span className="text-primary font-bold">{alivePopulation.length}</span></span>
          </div>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-md overflow-x-auto max-w-[500px]">
          {["status", "biology", "psychology", "linguistics", "lineage"].map(t => (
            <button
              key={t}
              onClick={() => setPanelTab(t)}
              className={`whitespace-nowrap px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-sm font-semibold transition-all ${
                panelTab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t === "status" ? "Durum" : t === "biology" ? "Biyoloji" : t === "psychology" ? "Psikoloji" : t === "lineage" ? "Soyağacı" : "Dilbilim"}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative flex">
        {/* Fullscreen Map Layer */}
        <div className="absolute inset-0 z-0">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {/* Floating Panel Layer */}
        <div className="absolute top-4 left-4 z-10 w-[400px] h-[calc(100%-2rem)] flex flex-col pointer-events-none">
           <div className="w-full h-full bg-background/80 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl p-4 flex flex-col box-border overflow-y-auto pointer-events-auto">
             
             {panelTab === "status" && (
                <div className="flex flex-col h-full gap-4">
                  <div className="bg-card/20 border border-border/30 rounded p-3 text-xs text-muted-foreground shrink-0">
                    Bu modda dış müdahale kapalıdır. 100 Adem ve 100 Havva ile doğal seçilim analiz edilir. Sistem, nüfusu izler.
                  </div>
                  <EventLogPanel logs={logs} trackingAgent="genel" />
                </div>
             )}

             {panelTab === "biology" && (
               <div className="flex flex-col h-full overflow-y-auto">
                 <BiologyPanel state={state} person={state.population?.[0] || state.adem} />
               </div>
             )}

             {panelTab === "psychology" && (
               <div className="flex flex-col h-full overflow-y-auto">
                 <PsychologyPanel state={state} person={state.population?.[0] || state.adem} />
               </div>
             )}

             {panelTab === "lineage" && (
                <div className="flex flex-col h-full overflow-y-auto">
                  <LineageExplorerPanel state={state} />
                  
                  <div className="mt-4 border-t border-border/40 pt-4">
                     <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Ölüm Kayıtları (Tabula Rasa)</h3>
                     <div className="space-y-1">
                       {state.livesHistory.slice(-20).reverse().map((r, i) => (
                         <div key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 rounded p-2 text-red-200">
                           <span className="font-bold opacity-75 mr-1">{r.personName} (G{r.generation}):</span>
                           <span className="uppercase opacity-90">{r.cause}</span>
                           <span className="opacity-50 ml-2">[{r.days} gün]</span>
                         </div>
                       ))}
                       {state.livesHistory.length === 0 && (
                         <div className="text-[10px] text-muted-foreground italic">Henüz ölüm gerçekleşmedi.</div>
                       )}
                     </div>
                  </div>
                </div>
             )}

             {panelTab === "linguistics" && (
                <div className="flex flex-col h-full">
                  <LinguisticsLabPanel state={state} person={state.population?.[0] || state.adem} />
                </div>
             )}

           </div>
        </div>
      </div>
    </div>
  );
}
