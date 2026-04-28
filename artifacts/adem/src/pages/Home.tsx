import { useState } from "react";
import { useSimulation } from "@/hooks/use-simulation";
import { KnowledgePanel } from "@/components/panels/KnowledgePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatusPanel, EventLogPanel } from "@/components/panels/StatusPanel";

type SimMode = "live" | "fast" | "interactive";

function SimulationView({ 
  mode, 
  isActive, 
  tickRate 
}: { 
  mode: SimMode; 
  isActive: boolean; 
  tickRate: number 
}) {
  const { state, knowledge, logs, forceInteract, forceSpawnFood } = useSimulation(tickRate);

  return (
    <div className={`flex-1 flex overflow-hidden ${isActive ? 'flex' : 'hidden'}`}>
      <div className="w-72 lg:w-80 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] h-full bg-background/95">
        <KnowledgePanel knowledge={knowledge} state={state} />
      </div>

      <MapPanel state={state} />

      <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col border-l border-border z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.2)] h-full bg-background/95">
        <StatusPanel state={state} />
        <div className="flex-1 overflow-hidden min-h-0">
           <EventLogPanel logs={logs} />
        </div>
        
        {mode === "interactive" && (
          <div className="p-4 border-t border-border bg-card/40 flex flex-col gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Müdahale Paneli</h3>
            <div className="flex justify-between items-center bg-background/50 p-1.5 rounded-md border border-border/50">
              <button 
                onClick={() => forceInteract('feed')}
                className="px-3 py-2 flex-1 bg-[#4a7c59]/10 hover:bg-[#4a7c59]/20 text-[#4a7c59] text-xs rounded transition-colors font-medium border border-[#4a7c59]/20 mx-1"
              >
                Besle
              </button>
              <button 
                onClick={() => forceInteract('heal')}
                className="px-3 py-2 flex-1 bg-[#c54b5c]/10 hover:bg-[#c54b5c]/20 text-[#c54b5c] text-xs rounded transition-colors font-medium border border-[#c54b5c]/20 mx-1"
              >
                İyileştir
              </button>
              <button 
                onClick={forceSpawnFood}
                className="px-3 py-2 flex-1 bg-[#f0c878]/10 hover:bg-[#f0c878]/20 text-[#f0c878] text-xs rounded transition-colors font-medium border border-[#f0c878]/20 mx-1"
              >
                Meyve Ver
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1">Sadece acil durumlarda müdahale edin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<SimMode>("live");
  
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navbar */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur z-20 flex items-center justify-between px-6 shadow-sm">
        <h1 className="font-bold tracking-tight text-lg mr-8">ADEM</h1>
        <div className="flex bg-muted/30 p-1 rounded-md border border-border/50">
          <button
            onClick={() => setMode("live")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "live" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            ADEM LİVE
          </button>
          <button
            onClick={() => setMode("fast")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "fast" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            ADEM 8x
          </button>
          <button
            onClick={() => setMode("interactive")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "interactive" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            ADEM İNTERAKTİF
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-[300px] justify-end">
          <div className="text-xs text-muted-foreground italic truncate">
            {mode === 'interactive' ? 'Müdahale edebilirsiniz' : 'Sadece İzleme Modu'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <SimulationView mode="live" isActive={mode === "live"} tickRate={800} />
        <SimulationView mode="fast" isActive={mode === "fast"} tickRate={100} />
        <SimulationView mode="interactive" isActive={mode === "interactive"} tickRate={800} />
      </div>
    </div>
  );
}
