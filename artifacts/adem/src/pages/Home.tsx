import { useState } from "react";
import { useSimulation } from "@/hooks/use-simulation";
import { KnowledgePanel } from "@/components/panels/KnowledgePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatusPanel, EventLogPanel } from "@/components/panels/StatusPanel";
import { BiologyPanel } from "@/components/panels/BiologyPanel";
import { PsychologyPanel } from "@/components/panels/PsychologyPanel";
import { ProjectStarMap } from "@/components/ProjectStarMap";
import { PrimordialReportPanel } from "@/components/panels/PrimordialReportPanel";
import { LinguisticsLabPanel } from "@/components/panels/LinguisticsLabPanel";
import { LineageExplorerPanel } from "@/components/panels/LineageExplorerPanel";
import { ChevronLeft, ChevronRight, Activity, BookOpen, Layers, Brain, Network, FileText, Mic2, Dna } from "lucide-react";

type SimMode = "live" | "fast" | "interactive";
type LeftMode = "knowledge" | "biology" | "psychology" | "linguistics" | "lineage" | "closed";
type TrackingAgent = "adem" | "havva";

function SimulationSubView({ 
  mode, 
  leftMode,
  rightMode,
  state,
  logs,
  trackingAgent,
  setTrackingAgent,
  forceInteract,
  forceSpawnFood
}: { 
  mode: SimMode; 
  leftMode: LeftMode;
  rightMode: "status" | "closed";
  state: any;
  logs: any;
  trackingAgent: TrackingAgent;
  setTrackingAgent: (a: TrackingAgent) => void;
  forceInteract: any;
  forceSpawnFood: any;
}) {
  const currentPerson = trackingAgent === "adem" ? state.adem : state.havva;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT PANEL */}
      {leftMode !== "closed" && (
        <div className="w-72 lg:w-96 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] h-full bg-background/95 border-r border-border overflow-y-auto custom-scrollbar">
          {leftMode === "knowledge" && <KnowledgePanel knowledge={currentPerson.knowledge} state={state} person={currentPerson} />}
          {leftMode === "biology" && <BiologyPanel state={state} />}
          {leftMode === "psychology" && <PsychologyPanel state={state} />}
          {leftMode === "linguistics" && <LinguisticsLabPanel state={state} />}
          {leftMode === "lineage" && <LineageExplorerPanel state={state} />}
        </div>
      )}

      {/* MAP / MAIN */}
      <MapPanel state={state} knowledge={{ ...state.adem.knowledge, ...state.havva.knowledge }} />

      {/* RIGHT PANEL */}
      {rightMode !== "closed" && (
        <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col border-l border-border z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.2)] h-full bg-background/95 overflow-hidden">
          {/* Agent Switcher */}
          <div className="flex p-2 bg-muted/20 border-b border-border/50 gap-1">
             <button 
               onClick={() => setTrackingAgent("adem")}
               className={`flex-1 py-2 text-[10px] font-mono rounded transition-all border ${trackingAgent === 'adem' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-bold' : 'bg-background/40 border-transparent text-muted-foreground'}`}
             >
               ADEM (ERKEK)
             </button>
             <button 
               onClick={() => setTrackingAgent("havva")}
               className={`flex-1 py-2 text-[10px] font-mono rounded transition-all border ${trackingAgent === 'havva' ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 font-bold' : 'bg-background/40 border-transparent text-muted-foreground'}`}
             >
               HAVVA (DİŞİ)
             </button>
          </div>

          <StatusPanel state={state} person={currentPerson} />
          
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
             {mode === "interactive" && (
                <div className="p-3 border-b border-border/50 bg-[#c54b5c]/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none">Müdahale Portu: {trackingAgent.toUpperCase()}</h3>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => forceInteract('feed', trackingAgent)}
                      className="py-1.5 bg-background border border-border rounded text-[10px] hover:bg-muted font-medium transition-colors"
                    >
                      Besle
                    </button>
                    <button 
                      onClick={() => forceInteract('heal', trackingAgent)}
                      className="py-1.5 bg-background border border-border rounded text-[10px] hover:bg-muted font-medium transition-colors"
                    >
                      İyileştir
                    </button>
                    <button 
                      onClick={forceSpawnFood}
                      className="py-1.5 bg-background border border-border rounded text-[10px] hover:bg-muted font-medium transition-colors"
                    >
                      Meyve
                    </button>
                  </div>
                </div>
             )}
             <EventLogPanel logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<SimMode>("live");
  const [leftMode, setLeftMode] = useState<LeftMode>("knowledge");
  const [rightMode, setRightMode] = useState<"status" | "closed">("status");
  const [trackingAgent, setTrackingAgent] = useState<TrackingAgent>("adem");
  const [starMapOpen, setStarMapOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  
  const tickRate = mode === "fast" ? 100 : 800;
  const { state, logs, forceInteract, forceSpawnFood } = useSimulation(tickRate);
  
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {starMapOpen && <ProjectStarMap onClose={() => setStarMapOpen(false)} />}
      {reportOpen && <PrimordialReportPanel onClose={() => setReportOpen(false)} />}
      
      {/* Top Navbar */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur z-20 flex items-center justify-between px-4 shadow-sm">
        
        {/* Left Toolbar */}
        <div className="flex items-center gap-2">
          <h1 className="font-bold tracking-tight text-lg mr-2 text-primary leading-none select-none">
            <span className="text-blue-500">A</span>DEM <span className="text-muted-foreground/30 font-light mx-1">&</span> <span className="text-pink-500">H</span>AVVA
          </h1>
          <button
            onClick={() => setStarMapOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 mr-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider"
            title="Proje Mimarisini Göster"
          >
            <Network size={14} />
            <span className="hidden sm:inline">Projeyi Anla</span>
          </button>

          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 mr-2 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-colors border border-amber-500/20 text-xs font-semibold uppercase tracking-wider"
            title="Primordial Bilimsel Rapor"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Belgeler</span>
          </button>
          
          <div className="flex bg-muted/30 p-1 rounded-md border border-border/50 gap-1">
             <button
                onClick={() => setLeftMode(leftMode === "knowledge" ? "closed" : "knowledge")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${leftMode === "knowledge" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                title="Ortak Bilgi Ağacı"
             >
                <BookOpen size={16} /> <span className="hidden xl:inline">Bilgi</span>
             </button>
             <button
                onClick={() => setLeftMode(leftMode === "biology" ? "closed" : "biology")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${leftMode === "biology" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                title="Anatomik Karşılaştırma"
             >
                <Activity size={16} /> <span className="hidden xl:inline">Biyoloji</span>
             </button>
             <button
                onClick={() => setLeftMode(leftMode === "psychology" ? "closed" : "psychology")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${leftMode === "psychology" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                title="Bireysel Psikolojiler"
             >
                <Brain size={16} /> <span className="hidden xl:inline">Psikoloji</span>
             </button>
             <button
                onClick={() => setLeftMode(leftMode === "linguistics" ? "closed" : "linguistics")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${leftMode === "linguistics" ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:bg-muted"}`}
                title="Ortak Dil Gelişimi"
             >
                <Mic2 size={16} /> <span className="hidden xl:inline">Dil</span>
             </button>
             <button
                onClick={() => setLeftMode(leftMode === "lineage" ? "closed" : "lineage")}
                className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${leftMode === "lineage" ? "bg-emerald-500/20 text-emerald-500" : "text-muted-foreground hover:bg-muted"}`}
                title="Soyağacı Gezgini"
             >
                <Dna size={16} /> <span className="hidden xl:inline">Soy</span>
             </button>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex bg-muted/30 p-1 rounded-md border border-border/50">
          <button
            onClick={() => setMode("live")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "live" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            CANLI
          </button>
          <button
            onClick={() => setMode("fast")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "fast" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            HIZLI
          </button>
          <button
            onClick={() => setMode("interactive")}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
              mode === "interactive" ? "bg-red-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            MODÜLER
          </button>
        </div>
        
        {/* Right Toolbar */}
        <div className="flex items-center gap-2">
           <button
              onClick={() => {
                setRightMode(rightMode === "status" ? "closed" : "status")
              }}
              className={`p-1.5 rounded-sm text-xs font-medium flex items-center gap-1 transition-colors ${rightMode === "status" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              title="Vitals & Olaylar"
           >
              <Layers size={16} /> <span className="hidden sm:inline">İstatistikler</span>
           </button>
           
           <div className="h-6 w-[1px] bg-border mx-1" />
           
           <button
              onClick={() => {
                (window as any).toggleGodMode?.(); 
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono border transition-all ${
                state.godMode 
                ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400/70"
              }`}
           >
              {state.godMode ? "GOD MODE: ACTIVE" : "SIGNAL FILTER: ON"}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <SimulationSubView 
          mode={mode} 
          leftMode={leftMode} 
          rightMode={rightMode} 
          state={state}
          logs={logs}
          trackingAgent={trackingAgent}
          setTrackingAgent={setTrackingAgent}
          forceInteract={forceInteract}
          forceSpawnFood={forceSpawnFood}
        />
      </div>
    </div>
  );
}
