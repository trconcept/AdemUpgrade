import React from 'react';
import { SimulationState, Person } from '../../lib/simulation';
import { Activity, Thermometer, Wind, Zap, Droplets, Utensils, Heart, Shield, Info, Users, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  state: SimulationState;
}

export function BiologicalNecessitiesPanel({ state }: Props) {
  const { adem, havva, ticksSurvived } = state;

  const renderNecessity = (label: string, value: number, icon: React.ReactNode, impact: string, color: string) => (
    <div className="bg-card/20 border border-border/40 p-4 rounded-xl space-y-3 transition-all hover:bg-card/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-foreground`}>
            {icon}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">{label}</h4>
            <div className="text-sm font-mono font-bold">{Math.round(value)}%</div>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded">
          {value > 80 ? 'OPTIMAL' : value > 50 ? 'NOMINAL' : value > 20 ? 'WARNING' : 'CRITICAL'}
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress value={value} className="h-1 bg-muted/40" indicatorClassName={color} />
        <p className="text-[10px] text-muted-foreground italic leading-tight">
          <Shield size={10} className="inline mr-1" /> {impact}
        </p>
      </div>
    </div>
  );

  const renderSubjectStats = (p: Person) => {
    const isAlone = false; // logic would be dist(adem.pos, havva.pos) > 15 but this is a static render part
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 border-b border-border pb-2 mt-4">
          <Activity size={14} className={p.gender === 'male' ? 'text-blue-400' : 'text-pink-400'} />
          {p.name.toUpperCase()} - Biyolojik Geri Bildirim
        </h3>

        <div className="grid gap-3">
          {renderNecessity('Beslenme', p.vitals.hunger, <Utensils size={14} />, 'Yetersiz beslenme doku onarımını durdurur ve sağlığı düşürür.', 'bg-orange-500')}
          {renderNecessity('Su Dengesi', p.vitals.thirst, <Droplets size={14} />, 'Dehidrasyon bilişsel fonksiyonları ve hızı %40 yavaşlatır.', 'bg-cyan-500')}
          {renderNecessity('Enerji Rezervi', p.vitals.energy, <Zap size={14} />, 'Düşük enerji, karar verme yetisini köreltir ve dinlenme ihtiyacını tetikler.', 'bg-yellow-500')}
          {renderNecessity('Beden Isısı', p.vitals.temp, <Thermometer size={14} />, 'Isı dengesi bozulduğunda metabolizma korunma moduna geçer.', 'bg-blue-400')}
        </div>

        {/* DNA Influence */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <h4 className="text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
            <Heart size={12} /> Primat Mirası & Genetik Faktörler
          </h4>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-muted-foreground">
                   <span>Sosyal Hiyerarşi</span>
                   <span>%{p.dna.traits.socialHierarchy}</span>
                </div>
                <Progress value={p.dna.traits.socialHierarchy} className="h-1 bg-black/20" indicatorClassName="bg-purple-500" />
             </div>
             <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-muted-foreground">
                   <span>Primat Mirası</span>
                   <span>%{p.dna.traits.primateHeritage}</span>
                </div>
                <Progress value={p.dna.traits.primateHeritage} className="h-1 bg-black/20" indicatorClassName="bg-indigo-500" />
             </div>
          </div>
          <p className="text-[9px] text-muted-foreground leading-relaxed pt-1">
            {p.dna.traits.socialHierarchy > 50 ? 'Baskınlık eğilimi yüksek; diğer bireylerle ilk karşılaşmada bir otorite mücadelesi yaşatabilir.' : 'İşbirliği odaklı yapı; güven inşası daha hızlı gerçekleşir.'}
            {' '}
            {p.dna.traits.primateHeritage > 70 ? 'Yüksek taklit yeteneği; görsel modelleme yoluyla araç kullanımını 3x daha hızlı kavrar.' : 'Bireysel öğrenme odaklı.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Activity size={20} className="text-rose-500" />
          Biyolojik İhtiyaçlar
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Hayati Değerler ve Çevresel Etki Analizi</p>
      </div>

      {/* Overview Card */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex gap-3">
          <Brain size={20} className="text-blue-400 shrink-0" />
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Savunmasız Bebeklik Paradoksu</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              İnsan yavruları, hayatta kalabilmek için kolektif bir yapıya ve sığınağa en çok ihtiyaç duyan canlılardır. 
              {state.adem.vitals.energy < 30 || state.havva.vitals.energy < 30 ? (
                <span className="text-rose-400 font-bold block mt-1">DİKKAT: Yorgunluk arttıkça savunmasızlık katsayısı yükseliyor!</span>
              ) : (
                <span className="text-emerald-400 font-bold block mt-1">Şu anki değerler grup güvenliği için yeterli.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSubjectStats(adem)}
        {renderSubjectStats(havva)}
      </div>

      {/* Interaction Warning */}
      <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 mt-auto">
        <div className="flex gap-2">
          <Info size={16} className="text-yellow-500 shrink-0" />
          <p className="text-[10px] text-yellow-500/80 leading-relaxed">
            Biyolojik ihtiyaçların karşılanmaması, agentların karar verme ağacını (Thinking) kısıtlar ve sadece $Survival$ moduna indirger. Sosyal bağlar bu riskleri minimize eder.
          </p>
        </div>
      </div>
    </div>
  );
}
