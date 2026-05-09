import { useState } from "react";
import { SimulationState } from "@/lib/simulation";
import { Activity, Thermometer, Droplets, Zap, BrainCircuit, HeartPulse, ChevronDown, ChevronRight, ShieldAlert, Bug, User } from "lucide-react";

function CollapsibleSection({ title, icon, defaultOpen = true, children }: { title: string, icon: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2">
      <button 
         onClick={() => setIsOpen(!isOpen)} 
         className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && <div className="animate-in slide-in-from-top-2 fade-in-50 duration-200">{children}</div>}
    </div>
  );
}

export function BiologyPanel({ state }: { state: SimulationState }) {
  const { adem, havva } = state;

  const renderBar = (label: string, value: number, color: string, subValue?: string, compact = false) => (
    <div className={`space-y-1 ${compact ? 'flex-1' : ''}`}>
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground truncate max-w-[80px]">{label}</span>
        <span className="font-mono text-primary/80">{subValue || `${Math.floor(value)}%`}</span>
      </div>
      <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-sm select-none">
      <div className="border-b border-border bg-muted/20 p-4">
        <h2 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
          <Activity size={18} className="text-indigo-500" /> 
          Biyolojik Karşılaştırma Matrisi
        </h2>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Anatomik ve Fizyolojik Veri Hattı</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* AGENT IDENTITY HEADERS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex flex-col items-center gap-1">
              <User size={24} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-400">ADEM (ERKEK)</span>
              <span className="text-[8px] text-blue-400/60 font-mono tracking-tighter">XY CHROMOSOME</span>
           </div>
           <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-lg flex flex-col items-center gap-1">
              <User size={24} className="text-pink-500" />
              <span className="text-[10px] font-bold text-pink-400">HAVVA (DİŞİ)</span>
              <span className="text-[8px] text-pink-400/60 font-mono tracking-tighter">XX CHROMOSOME</span>
           </div>
        </div>

        {/* METABOLIC STATUS COMPARISON */}
        <CollapsibleSection title="Metabolik Homeostaz" icon={<HeartPulse size={14} />}>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-6 p-1">
                {/* ADEM VITALS */}
                <div className="space-y-3">
                   {renderBar('Sağlık', adem.vitals.health, 'bg-red-500')}
                   {renderBar('Açlık', adem.vitals.hunger, 'bg-emerald-500')}
                   {renderBar('Enerji', adem.vitals.energy, 'bg-yellow-500')}
                   <div className="text-[9px] text-muted-foreground italic font-mono pt-1">
                     Bazal Hız: %110 <br/> Yakıt: Glikojen
                   </div>
                </div>
                {/* HAVVA VITALS */}
                <div className="space-y-3">
                   {renderBar('Sağlık', havva.vitals.health, 'bg-pink-500')}
                   {renderBar('Açlık', havva.vitals.hunger, 'bg-emerald-400')}
                   {renderBar('Enerji', havva.vitals.energy, 'bg-yellow-400')}
                   <div className="text-[9px] text-muted-foreground italic font-mono pt-1">
                     Bazal Hız: %88 <br/> Yakıt: Lipid Verimliliği
                   </div>
                </div>
             </div>
           </div>
        </CollapsibleSection>

        {/* ANATOMICAL SPECIFICATIONS */}
        <CollapsibleSection title="Anatomik Mimariler" icon={<Activity size={14} />}>
           <div className="space-y-4 text-[10px] font-mono">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted/20 p-3 rounded border border-border/20 space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1 uppercase opacity-60">Fiziksel Profil</div>
                    <div>Boy: {adem.anatomy.height}cm</div>
                    <div>Ağırlık: {adem.anatomy.weight}kg</div>
                    <div>Kas: %{(adem.anatomy.muscleMass * 100).toFixed(1)}</div>
                    <div>İskelet: Dar Pelvis</div>
                    <div className="text-[8px] pt-1 text-blue-400 font-bold uppercase">Agresyon Odaklı</div>
                 </div>
                 <div className="bg-muted/20 p-3 rounded border border-border/20 space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1 uppercase opacity-60">Fiziksel Profil</div>
                    <div>Boy: {havva.anatomy.height}cm</div>
                    <div>Ağırlık: {havva.anatomy.weight}kg</div>
                    <div>Kas: %{(havva.anatomy.muscleMass * 100).toFixed(1)}</div>
                    <div>İskelet: Geniş Pelvis</div>
                    <div className="text-[8px] pt-1 text-pink-400 font-bold uppercase">Dayanıklılık Odaklı</div>
                 </div>
              </div>
           </div>
        </CollapsibleSection>

        {/* HORMONAL & NEURAL */}
        <CollapsibleSection title="Nöro-Endokrin Denge" icon={<Zap size={14} />}>
           <div className="space-y-4 bg-muted/10 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="text-[9px] text-blue-400 uppercase font-bold">Dominant: Testosteron</div>
                    {renderBar('Avcı Dürtüsü', 75, 'bg-blue-500', 'Yüksek', true)}
                    {renderBar('Koruma', 60, 'bg-blue-400', 'Orta', true)}
                 </div>
                 <div className="space-y-2">
                    <div className="text-[9px] text-pink-400 uppercase font-bold">Dominant: Östrojen</div>
                    {renderBar('Empati / Sabır', 85, 'bg-pink-500', 'Max', true)}
                    {renderBar('Toplama', 70, 'bg-pink-400', 'Yüksek', true)}
                 </div>
              </div>
              <p className="text-[9px] text-muted-foreground italic leading-tight border-t border-white/5 pt-2">
                Hormonal dağılım, çevresel stres faktörlerine verilen tepki süresini ve şiddetini belirler. Adem reaksiyonel, Havva ise korumacı tepki verir.
              </p>
           </div>
        </CollapsibleSection>

        <CollapsibleSection title="Solunum ve Gaz Değişimi" icon={<Droplets size={14} />}>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/30 p-2 rounded border border-border/30">
                 {renderBar('O2 Satürasyonu (A)', adem.vitals.breath, 'bg-cyan-500')}
              </div>
              <div className="bg-card/30 p-2 rounded border border-border/30">
                 {renderBar('O2 Satürasyonu (H)', havva.vitals.breath, 'bg-cyan-400')}
              </div>
           </div>
        </CollapsibleSection>

        {/* GENETIC OVERVIEW */}
        <CollapsibleSection title="Genetik Matrisler" icon={<BrainCircuit size={14} />}>
           <div className="space-y-4 font-mono text-[9px] bg-card/20 p-3 rounded">
              <div className="space-y-1">
                 <div className="text-muted-foreground uppercase opacity-50">Ortak Dil Karmaşıklığı (Sinaptik Bağ):</div>
                 <div className="flex justify-between items-end">
                    <span className="text-xs text-primary font-bold">%{Math.floor(state.linguistics.syntaxComplexity * 100)}</span>
                    <span className="text-[8px] text-muted-foreground italic">Kolektif Öğrenme</span>
                 </div>
              </div>
              <div className="border-t border-border/10 pt-2 space-y-2">
                 <div className="text-muted-foreground uppercase opacity-50 italic">DNA Dizilimleri:</div>
                 <div className="text-[8px] break-all bg-black/20 p-2 rounded border border-white/5 text-blue-300">
                    {adem.dna.sequence.slice(0, 40)}...
                 </div>
                 <div className="text-[8px] break-all bg-black/20 p-2 rounded border border-white/5 text-pink-300">
                    {havva.dna.sequence.slice(0, 40)}...
                 </div>
              </div>
           </div>
        </CollapsibleSection>

      </div>
    </div>
  );
}
