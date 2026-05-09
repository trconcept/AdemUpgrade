import { SimulationState, KnowledgeBase } from "./simulation"; // import types

export interface InventionResult {
  skillName: string;
  outcomeText: string;
  category: string;
  description: string;
  isSuccessful: boolean;
  insight: string;
}

export async function inventNewSkill(
  state: SimulationState, 
  knowledge: KnowledgeBase,
  recentLogs: string[]
): Promise<InventionResult | null> {
  // Purely procedural/algorithmic "invention" logic simulating ADEM's brain
  // No external LLM/AI prompt - keeping the simulation fully closed and deterministic.

  const inv = state.adem.inventory; // Using adem's inventory as common if not shared
  const p = state.adem; // Check adem first for drives/psych
  const hasWood = (inv['wood'] || 0) > 0 || (state.havva.inventory['wood'] || 0) > 0;
  const hasStone = (inv['stone'] || 0) > 0 || (state.havva.inventory['stone'] || 0) > 0;
  const hasHerb = (inv['herb'] || 0) > 0 || (state.havva.inventory['herb'] || 0) > 0;
  const knowsTool = (knowledge['alet_yapımı']?.confidence || 0) > 0.5;
  const knowsFire = (knowledge['ateş_yakma']?.confidence || 0) > 0.5;

  const rand = Math.random();

  if (hasWood && hasStone && knowsTool && !knowledge['kesici_alet']) {
    return {
      skillName: "kesici_alet",
      outcomeText: "KARA-SVR - Taş ve odun bağlandı.",
      category: "alet",
      description: "Taş ve tahtayı birleştirerek daha delici/kesici bir obje yarattı.",
      isSuccessful: true,
      insight: "[Evrim] Parçaları birleştirmek, onlara tek başlarına sahip olmadıkları bir güç veriyor."
    };
  }

  if (hasWood && !knowsFire && (state.adem.psychology.emotions.fear > 30 || state.havva.psychology.emotions.fear > 30)) {
    return {
      skillName: "ateş_yakma",
      outcomeText: "ISI-KIV - Odunların sürtünmesinden ısı çıktı.",
      category: "doğa",
      description: "Kuru dalları sürterek kıvılcım elde edebileceğini anladı.",
      isSuccessful: rand > 0.5,
      insight: isSuccessfulFallback(rand > 0.5, "[Kıvılcım] Sürekli hareket, maddeyi ıstıyor ve parlatıyor!")
    };
  }

  if (hasHerb && !knowledge['şifa_özü'] && (state.adem.vitals.health < 60 || state.havva.vitals.health < 60)) {
    return {
      skillName: "şifa_özü",
      outcomeText: "YŞL-SIVI - Yapraklar ezildi.",
      category: "tıbbi",
      description: "Bitkileri ezerek yaralarına sürmeyi akıl etti.",
      isSuccessful: true,
      insight: "[Şifa] Bitkilerin özü, kandan daha güçlü olabilir."
    };
  }

  if ((state.adem.psychology.emotions.curiosity > 70 || state.havva.psychology.emotions.curiosity > 70) && 
      (state.adem.vitals.energy > 60 || state.havva.vitals.energy > 60) && 
      !knowledge['yıldız_haritası']) {
    return {
      skillName: "yıldız_haritası",
      outcomeText: "NOKTA-GÖZ - Gece gökyüzündeki desenler.",
      category: "felsefe",
      description: "Gökyüzündeki ışıkların sabit bir rotası olduğunu fark etti.",
      isSuccessful: true,
      insight: "[Tefekkür] Dünyadaki kaosun aksine, gökyüzünde bir düzen var."
    };
  }

  if ((state.adem.vitals.hunger > 80 || state.havva.vitals.hunger > 80) && 
      (state.adem.psychology.emotions.tension > 50 || state.havva.psychology.emotions.tension > 50) && 
      !knowledge['av_pususu']) {
    return {
      skillName: "av_pususu",
      outcomeText: "SESSİZ-BEK - Yırtıcılar gibi beklemek.",
      category: "hayatta_kalma",
      description: "Sürekli hareket etmek yerine avın ayağına gelmesini eklemeyi öğrendi.",
      isSuccessful: true,
      insight: "[Pusu] Bazen eylem, hiçbir şey yapmadan beklemektir."
    };
  }

  if (state.daysSurvived > 3 && !knowledge['zaman_algısı']) {
     return {
       skillName: "zaman_algısı",
       outcomeText: "GÜN-GECE - Aydınlık ve karanlığın döngüsü.",
       category: "felsefe",
       description: "Zamanın geçtiğini ve her günün birbirini kovaladığını kavradı.",
       isSuccessful: true,
       insight: "[Bilinç] Dün vardı, bugün var ve yarın da olacak."
     };
  }

  // Fallbacks
  if (state.psychology.emotions.tension > 80) {
     return {
       skillName: "panik_yönetimi",
       outcomeText: "DERİN-NEFES - Korkuyu baskılamak",
       category: "psikoloji",
       description: "Ölüm korkusunu yatıştırmak için iradesini kullandı.",
       isSuccessful: rand > 0.4,
       insight: isSuccessfulFallback(rand > 0.4, "[İrade] Bedenim korkabilir ama ben korkumu kontrol edebilirim.")
     };
  }

  return null;
}

function isSuccessfulFallback(success: boolean, insight: string) {
  return success ? insight : "[Başarısızlık] Şimdilik zihnim bu denemeyi tamamlayamadı.";
}
