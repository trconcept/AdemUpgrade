import { useSimulation } from "@/hooks/use-simulation";
import { KnowledgePanel } from "@/components/panels/KnowledgePanel";
import { MapPanel } from "@/components/panels/MapPanel";
import { StatusPanel, EventLogPanel } from "@/components/panels/StatusPanel";

export default function Home() {
  const { state, knowledge, logs } = useSimulation();

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Sol Panel: Bilgi */}
      <div className="w-72 lg:w-80 flex-shrink-0 z-10 shadow-2xl shadow-black/20 h-full">
        <KnowledgePanel knowledge={knowledge} state={state} />
      </div>

      {/* Orta Panel: Harita */}
      <MapPanel state={state} />

      {/* Sağ Panel: Durum & Olay Günlüğü */}
      <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col border-l border-border z-10 shadow-2xl shadow-black/20 h-full overflow-hidden">
        <StatusPanel state={state} />
        <EventLogPanel logs={logs} />
      </div>
    </div>
  );
}
