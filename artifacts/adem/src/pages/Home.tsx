import { useState } from "react";
import { useSimulation } from "@/hooks/use-simulation";
import { KnowledgePanel } from "@/components/panels/KnowledgePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatusPanel, EventLogPanel } from "@/components/panels/StatusPanel";
import { BiologyPanel } from "@/components/panels/BiologyPanel";
import { PsychologyPanel } from "@/components/panels/PsychologyPanel";
import { BiologicalNecessitiesPanel } from "@/components/panels/BiologicalNecessitiesPanel";
import { ProjectStarMap } from "@/components/ProjectStarMap";
import { PrimordialReportPanel } from "@/components/panels/PrimordialReportPanel";
import { LinguisticsLabPanel } from "@/components/panels/LinguisticsLabPanel";
import { LineageExplorerPanel } from "@/components/panels/LineageExplorerPanel";
import { EcosystemPanel } from "@/components/panels/EcosystemPanel";
import { DatabasePanel } from "@/components/panels/DatabasePanel";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Activity, BookOpen, Layers, Brain, Network, FileText, Mic2, Dna, TrendingUp, Map as MapIcon, Database as DatabaseIcon, LayoutPanelLeft } from "lucide-react";

type SimMode = "live" | "fast" | "interactive";
type TrackingAgent = "adem" | "havva";
type PanelTab = "status" | "knowledge" | "biology" | "psychology" | "ecosystem" | "linguistics" | "lineage" | "report" | "starmap";

export default function Home() {
  const [mainTab, setMainTab] = useState<"map" | "panels" | "database">("map");
  const [panelTab, setPanelTab] = useState<PanelTab>("status");
  const [mode, setMode] = useState<SimMode>("live");
  const [trackingAgent, setTrackingAgent] = useState<TrackingAgent>("adem");
  
  const tickRate = mode === "fast" ? 100 : 800;
  const { state, logs, forceInteract, forceSpawnFood } = useSimulation(tickRate);
  
  const currentPerson = trackingAgent === "adem" ? state.adem : state.havva;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-14 border-b border-border bg-background/95 backdrop-blur z-20 flex items-center justify-between px-4 shadow-sm">
        
        {/* Logo */}
        <h1 className="font-bold tracking-tight text-lg mr-4 text-primary leading-none select-none">
          <span className="text-blue-500">A</span>DEM <span className="text-muted-foreground/30 font-light mx-1">&</span> <span className="text-pink-500">H</span>AVVA
        </h1>

        {/* Main Tabs */}
        <div className="flex bg-muted/30 p-1 rounded-md border border-border/50 gap-1 mr-auto">
           <button
             onClick={() => setMainTab("map")}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${mainTab === "map" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
           >
             <MapIcon size={14} /> HARİTA
           </button>
           <button
             onClick={() => setMainTab("panels")}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${mainTab === "panels" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
           >
             <LayoutPanelLeft size={14} /> PANELLER
           </button>
           <button
             onClick={() => setMainTab("database")}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${mainTab === "database" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
           >
             <DatabaseIcon size={14} /> VERİTABANI
           </button>
           <Link href="/tabula-rasa" className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30">
             TABULA RASA MODU (100x100)
           </Link>
        </div>

        {/* Speed & God Mode */}
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/30 p-1 rounded-md border border-border/50">
            <button
              onClick={() => setMode("live")}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                mode === "live" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              CANLI
            </button>
            <button
              onClick={() => setMode("fast")}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                mode === "fast" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              HIZLI
            </button>
            <button
              onClick={() => setMode("interactive")}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                mode === "interactive" ? "bg-red-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              MODÜLER
            </button>
          </div>
          
          <button
             onClick={() => { (window as any).toggleGodMode?.(); }}
             className={`px-2 py-1.5 rounded-md text-[10px] font-mono border transition-all ${
               state.godMode 
               ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
               : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400/70 hover:bg-emerald-500/20"
             }`}
          >
             {state.godMode ? "GOD:ON" : "GOD:OFF"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex">
         {mainTab === 'map' && (
            <MapPanel state={state} knowledge={{ ...state.adem.knowledge, ...state.havva.knowledge }} />
         )}

         {mainTab === 'panels' && (
            <div className="flex h-full w-full">
               {/* Fixed Sidebar for Panel Tabs */}
               <div className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col pt-2 shadow-lg z-10">
                  <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border mb-2">
                    Panel Seçimi
                  </div>
                  
                  <div className="flex flex-col gap-1 px-2">
                     <button onClick={() => setPanelTab("status")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "status" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Layers size={16}/> Durum & Olaylar
                     </button>
                     <button onClick={() => setPanelTab("knowledge")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "knowledge" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <BookOpen size={16}/> Bilgi Ağacı
                     </button>
                     <button onClick={() => setPanelTab("biology")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "biology" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Activity size={16}/> Biyoloji
                     </button>
                     <button onClick={() => setPanelTab("psychology")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "psychology" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Brain size={16}/> Psikoloji
                     </button>
                     <button onClick={() => setPanelTab("ecosystem")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "ecosystem" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <TrendingUp size={16}/> Ekosistem
                     </button>
                     <button onClick={() => setPanelTab("linguistics")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "linguistics" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Mic2 size={16}/> Dil Gelişimi
                     </button>
                     <button onClick={() => setPanelTab("lineage")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "lineage" ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Dna size={16}/> Soy Ağacı
                     </button>
                     
                     <div className="mt-4 mb-2 border-t border-border" />
                     
                     <button onClick={() => setPanelTab("report")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "report" ? "bg-amber-500/20 text-amber-500 font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <FileText size={16}/> Bilimsel Rapor
                     </button>
                     <button onClick={() => setPanelTab("starmap")} className={`flex items-center gap-2 p-2 rounded text-sm text-left transition-colors ${panelTab === "starmap" ? "bg-indigo-500/20 text-indigo-400 font-bold" : "text-muted-foreground hover:bg-muted"}`}>
                        <Network size={16}/> Proje Mimarisini Anla
                     </button>
                  </div>
               </div>

               {/* Right Side Content wrapper */}
               <div className="flex-1 bg-background overflow-hidden relative flex flex-col">
                  {/* Global Tracking Agent Switcher for applicable tabs */}
                  {["status", "knowledge", "biology", "psychology", "linguistics"].includes(panelTab) && (
                     <div className="flex p-2 bg-muted/20 border-b border-border/50 gap-1 shrink-0">
                        <button 
                          onClick={() => setTrackingAgent("adem")}
                          className={`flex-1 py-1.5 text-xs font-mono rounded transition-all border ${trackingAgent === 'adem' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-bold' : 'bg-background/40 border-transparent text-muted-foreground hover:bg-muted'}`}
                        >
                          ADEM (ERKEK)
                        </button>
                        <button 
                          onClick={() => setTrackingAgent("havva")}
                          className={`flex-1 py-1.5 text-xs font-mono rounded transition-all border ${trackingAgent === 'havva' ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 font-bold' : 'bg-background/40 border-transparent text-muted-foreground hover:bg-muted'}`}
                        >
                          HAVVA (DİŞİ)
                        </button>
                     </div>
                  )}

                  <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                     <div className="max-w-6xl mx-auto h-full p-4">
                        {panelTab === "status" && (
                           <div className="flex flex-col gap-4 h-full">
                              <StatusPanel state={state} person={currentPerson} />
                              {mode === "interactive" && (
                                 <div className="p-3 border border-red-500/20 bg-red-500/5 flex flex-col gap-2 rounded">
                                   <div className="flex items-center justify-between">
                                     <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Müdahale Portu: {trackingAgent.toUpperCase()}</h3>
                                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                   </div>
                                   <div className="grid grid-cols-3 gap-2">
                                     <button onClick={() => forceInteract('feed', trackingAgent)} className="py-2 bg-background border border-border rounded text-xs hover:bg-muted font-medium transition-colors">Besle</button>
                                     <button onClick={() => forceInteract('heal', trackingAgent)} className="py-2 bg-background border border-border rounded text-xs hover:bg-muted font-medium transition-colors">İyileştir</button>
                                     <button onClick={forceSpawnFood} className="py-2 bg-background border border-border rounded text-xs hover:bg-muted font-medium transition-colors">Haritaya Meyve Bırak</button>
                                   </div>
                                 </div>
                              )}
                              <div className="flex-1 overflow-hidden min-h-[300px] border border-border rounded">
                                 <EventLogPanel logs={logs} trackingAgent={trackingAgent} />
                              </div>
                           </div>
                        )}

                        {panelTab === "knowledge" && <KnowledgePanel knowledge={currentPerson.knowledge} state={state} person={currentPerson} />}
                        {panelTab === "biology" && <BiologicalNecessitiesPanel state={state} />}
                        {panelTab === "psychology" && <PsychologyPanel state={state} person={currentPerson} />}
                        {panelTab === "ecosystem" && <EcosystemPanel state={state} />}
                        {panelTab === "linguistics" && <LinguisticsLabPanel state={state} person={currentPerson} />}
                        {panelTab === "lineage" && <LineageExplorerPanel state={state} />}
                        {panelTab === "report" && <PrimordialReportPanel onClose={() => setPanelTab("status")} />}
                        {panelTab === "starmap" && <ProjectStarMap onClose={() => setPanelTab("status")} />}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {mainTab === 'database' && (
            <div className="w-full h-full">
               <DatabasePanel state={state} logs={logs} />
            </div>
         )}
      </div>
    </div>
  );
}
