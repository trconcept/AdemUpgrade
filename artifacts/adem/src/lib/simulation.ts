export type TileType =
  | 'empty' | 'tree' | 'water' | 'safe_fruit' | 'poison_fruit' | 'stone'
  | 'fire' | 'shelter' | 'predator'
  | 'mushroom' | 'thorn_bush' | 'herb' | 'snake' | 'spider' | 'toxic_swamp'
  | 'cave' | 'volcano' | 'cooked_meat' | 'havva';

export type BiomeType = 'temperate' | 'tundra' | 'desert' | 'jungle' | 'volcanic';
export type Weather = 'clear' | 'rain' | 'snow' | 'fog' | 'storm' | 'blizzard' | 'heatwave';
export type TimeOfDay = 'day' | 'night' | 'dusk' | 'dawn';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Action = 'explore' | 'eat_safe' | 'eat_poison' | 'drink' | 'rest' | 'warm_up' | 'shelter' | 'flee' | 'idle' | 'observe' | 'step_damage' | 'pickup' | 'use_item' | 'harvest' | 'craft' | 'symbolize' | 'reproduce';
export type BodyAlert = 'thirst' | 'hunger' | 'cold' | 'hot' | 'pain' | 'fatigue' | 'low_health' | 'infection' | 'bleeding' | 'fracture';
export type DeathCause = string;
export type CreatureKind = 'tavşan' | 'geyik' | 'kurt' | 'ayı';
export type BloodGroup = '0' | 'A' | 'B' | 'AB';

export interface DNA {
  sequence: string;
  mutationRate: number;
  traits: {
    longevityLevel: number;
    metabolismSpeed: number;
    sensoryAcuity: number;
    staminaMax: number;
  };
}

export interface WorldStateChange {
  id: string;
  unitId: string;
  x: number;
  y: number;
  z: number;
  action: string;
  timestamp: number;
  prevTile: TileType;
  newTile: TileType;
}

export interface Creature {
  id: string;
  kind: CreatureKind;
  pos: Position;
  moveCooldown: number;
  isAttacking?: boolean;
  isFleeing?: boolean;
  action?: 'eat' | 'drink' | 'sleep' | 'hunt' | 'idle' | 'vocalize';
}

export interface DailyStats {
  day: number;
  steps: number;
  restTicks: number;
  sleepTicks: number;
  thinkTicks: number;
  decisionCount: number;
  exploreTicks: number;
  hostileEncounters: number;
  meetsObserved: number;
  totalTicks: number;
}

export interface Vitals {
  health: number;
  hunger: number;
  thirst: number;
  temp: number;
  energy: number;
  breath: number;
  toxicity: number;
  immunity: number;
  bodyParts: {
    head: number;
    torso: number;
    arms: number;
    legs: number;
  };
}

export interface Position { x: number; y: number; }

export interface Observation {
  coords: string;
  tile: TileType;
  label?: string;
  properties: string[];
}

export interface Memory {
  observations: Record<string, Observation>;
  creatures: Record<string, { kind: CreatureKind, discoveredAs?: string }>;
  predator?: Record<string, boolean>;
  observationBuffer: any[];
}

export interface LifeRecord {
  generation: number;
  days: number;
  cause: DeathCause;
  knowledgeAtDeath: number;
}

export interface Environment {
  width: number;
  height: number;
  grid: TileType[][];
  weather: Weather;
  nextWeather: Weather;
  weatherProgress: number;
  timeOfDay: TimeOfDay;
  timeCounter: number;
  season: Season;
  ambientTemp: number;
  creatures: Creature[];
  biomes: BiomeType[][];
  heights: number[][];
  archaeology: WorldStateChange[];
}

export interface Psychology {
  emotions: {
    happiness: number;
    fear: number;
    curiosity: number;
    stress: number;
    disgust: number;
    willpower: number;
    tension: number;
  };
  impressions: Record<string, {
    sentiment: number;
    label: string;
    description: string;
  }>;
}

export interface Sensors {
  light: number;
  heat: number;
  audio: number;
  oxygen: number;
  pressure: number;
}

export interface Drives {
  hormonalDrive: number;
  matingCooldown: number;
}

export interface EventLog {
  id: string;
  day: number;
  time: string;
  text: string;
  type: 'good' | 'bad' | 'neutral' | 'death';
}

export interface Person {
  id: 'adem' | 'havva';
  name: string;
  gender: 'male' | 'female';
  vitals: Vitals;
  pos: Position;
  targetPos: Position | null;
  currentAction: Action | null;
  psychology: Psychology;
  drives: Drives;
  sensors: Sensors;
  thinking: string;
  inventory: Record<string, number>;
  knowledge: KnowledgeBase;
  restTicks: number;
  dailyStats: DailyStats;
  yesterdayStats: DailyStats | null;
  recentAlerts: BodyAlert[];
  lastDamageCause: DeathCause | null;
  totalSteps: number;
  visitedTiles: Record<string, true>;
  anatomy: {
    height: number;
    weight: number;
    muscleMass: number;
    reproductiveType: string;
    secondaryTraits: string[];
  };
  dna: DNA;
  isInventing?: boolean;
}

export interface SimulationState {
  generation: number;
  daysSurvived: number;
  ticksSurvived: number;
  env: Environment;
  livesHistory: LifeRecord[];
  cognitiveArchitecture: string;
  bloodGroup: BloodGroup;
  linguistics: {
    vocabulary: string[];
    syntaxComplexity: number;
    discoveredSymbols: string[];
    wordMap: Record<string, string>;
    symbolMap: Record<string, string>;
    associations: Record<string, string[]>;
  };
  inventions: string[];
  godMode: boolean;
  isInventing?: boolean;
  thinking?: string;
  adem: Person;
  havva: Person;
}

export type KnowledgeBase = Record<string, any>;

export const WORLD_WIDTH = 80;
export const WORLD_HEIGHT = 55;
export const TICKS_PER_DAY = 240;

export function seasonOf(days: number): Season {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[Math.floor(days / SEASON_CYCLE_DAYS) % 4];
}

export const CREATURE_INFO: Record<CreatureKind, { color: string, icon: string }> = {
  'tavşan': { color: '#ffffff', icon: '🐇' },
  'geyik': { color: '#c4a484', icon: '🦌' },
  'kurt': { color: '#808080', icon: '🐺' },
  'ayı': { color: '#5c4033', icon: '🐻' }
};

export function createInitialState(gen: number = 1, history: LifeRecord[] = [], psychology?: Psychology, dna?: DNA): SimulationState {
  const grid = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill('empty' as TileType));
  const biomes = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill('temperate' as BiomeType));
  const heights = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill(0));

  // Simpler World Gen
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      // Biome distribution
      if (y < 12) biomes[y][x] = 'tundra';
      else if (y > WORLD_HEIGHT - 12) biomes[y][x] = 'desert';
      else if (x < 15 || x > WORLD_WIDTH - 15) biomes[y][x] = 'jungle';
      
      const r = Math.random();
      const b = biomes[y][x];

      // Heights
      heights[y][x] = Math.floor(Math.random() * 10);

      // Grid Content
      if (r < 0.05) grid[y][x] = 'tree';
      else if (r < 0.08) grid[y][x] = 'water';
      else if (r < 0.10) grid[y][x] = 'stone';
      else if (r < 0.11) grid[y][x] = 'herb';
      else if (r < 0.12) {
        grid[y][x] = Math.random() > 0.5 ? 'safe_fruit' : 'poison_fruit';
      }
      
      if (b === 'volcanic' && Math.random() < 0.05) grid[y][x] = 'volcano';
      if (b === 'tundra' && Math.random() < 0.05) grid[y][x] = 'cave';
    }
  }

  // Ensure adem and havva start on valid ground
  grid[10][10] = 'empty';
  grid[20][20] = 'empty';

  // Spawn some creatures
  const initialCreatures: Creature[] = [];
  const kinds: CreatureKind[] = ['tavşan', 'geyik', 'kurt'];
  for (let i = 0; i < 15; i++) {
    initialCreatures.push({
      id: Math.random().toString(),
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      pos: { x: rndInt(WORLD_WIDTH), y: rndInt(WORLD_HEIGHT) },
      moveCooldown: 0
    });
  }

  return {
    generation: gen,
    daysSurvived: 0,
    ticksSurvived: 0,
    memory: { observations: {}, creatures: {}, observationBuffer: [] },
    livesHistory: history,
    cognitiveArchitecture: 'Initial_Seed',
    dna: dna || { sequence: 'ATGC', mutationRate: 0.01, traits: { longevityLevel: 50, metabolismSpeed: 50, sensoryAcuity: 50, staminaMax: 100 } },
    bloodGroup: '0',
    linguistics: { vocabulary: [], syntaxComplexity: 0, discoveredSymbols: [], wordMap: {}, symbolMap: {}, associations: {} },
    inventions: [],
    godMode: false,
    env: {
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      grid,
      weather: 'clear',
      nextWeather: 'clear',
      weatherProgress: 0,
      timeOfDay: 'day',
      timeCounter: 0,
      season: 'spring',
      ambientTemp: 22,
      creatures: initialCreatures,
      biomes,
      heights,
      archaeology: []
    },
    adem: createPerson('adem', 'Adem', 'male', dna || { sequence: 'ATGC', mutationRate: 0.01, traits: { longevityLevel: 50, metabolismSpeed: 50, sensoryAcuity: 50, staminaMax: 100 } }),
    havva: createPerson('havva', 'Havva', 'female', dna || { sequence: 'ATGC', mutationRate: 0.01, traits: { longevityLevel: 50, metabolismSpeed: 50, sensoryAcuity: 50, staminaMax: 100 } })
  };
}

function createPerson(id: 'adem' | 'havva', name: string, gender: 'male' | 'female', dna: DNA): Person {
  return {
    id, name, gender, dna,
    vitals: { health: 100, hunger: 100, thirst: 100, temp: 100, energy: 100, breath: 100, toxicity: 0, immunity: 100, bodyParts: { head: 100, torso: 100, arms: 100, legs: 100 } },
    pos: { x: id === 'adem' ? 10 : 20, y: id === 'adem' ? 10 : 20 },
    targetPos: null, currentAction: null, thinking: '...', inventory: {}, knowledge: {}, restTicks: 0, totalSteps: 0, visitedTiles: {}, recentAlerts: [], lastDamageCause: null, yesterdayStats: null,
    psychology: { emotions: { happiness: 50, fear: 0, curiosity: 50, stress: 0, disgust: 0, willpower: 50, tension: 0 }, impressions: {} },
    drives: { hormonalDrive: 0, matingCooldown: 0 },
    sensors: { light: 100, heat: 100, audio: 50, oxygen: 100, pressure: 0 },
    dailyStats: { day: 0, steps: 0, restTicks: 0, sleepTicks: 0, thinkTicks: 0, decisionCount: 0, exploreTicks: 0, hostileEncounters: 0, meetsObserved: 0, totalTicks: 0 },
    anatomy: { height: 175, weight: 70, muscleMass: 0.4, reproductiveType: 'human', secondaryTraits: [] }
  };
}

const SEASON_CYCLE_DAYS = 4;

function rndInt(max: number) { return Math.floor(Math.random() * max); }
function clampN(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function dist(a: Position, b: Position) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

export function getCoordinates(x: number, y: number) {
  const lon = ((x / WORLD_WIDTH) * 360 - 180).toFixed(4);
  const lat = (90 - (y / WORLD_HEIGHT) * 180).toFixed(4);
  return { lat, lon };
}


export function tickSimulation(st: SimulationState): { newState: SimulationState, newLogs: EventLog[] } {
  const lg: EventLog[] = [];
  
  const hours = Math.floor((st.env.timeCounter % 240) / 10).toString().padStart(2, '0');
  const mins = Math.floor(((st.env.timeCounter % 240) % 10) * 6).toString().padStart(2, '0');
  const timeStr = `${hours}:${mins}`;

  const localAddLog = (t: string, type: any) => {
    lg.push({ id: Math.random().toString(), text: t, type, day: st.daysSurvived, time: timeStr });
  };

  st.ticksSurvived++;
  st.env.timeCounter++;
  
  // Day Rollover
  if (st.env.timeCounter % TICKS_PER_DAY === 0) {
    st.daysSurvived++;
    [st.adem, st.havva].forEach(p => {
       p.yesterdayStats = { ...p.dailyStats };
       p.dailyStats = { day: st.daysSurvived, steps: 0, restTicks: 0, sleepTicks: 0, thinkTicks: 0, decisionCount: 0, exploreTicks: 0, hostileEncounters: 0, meetsObserved: 0, totalTicks: 0 };
    });
  }

  // Dünya Güncellemeleri
  updateWorldState(st, localAddLog);
  
  // Bireylerin Güncellenmesi
  updatePerson(st, st.adem, localAddLog);
  updatePerson(st, st.havva, localAddLog);

  // Ölüm Kontrolü
  if (st.adem.vitals.health <= 0 || st.havva.vitals.health <= 0) {
    const dead = st.adem.vitals.health <= 0 ? st.adem : st.havva;
    localAddLog(`${dead.name} hayatını kaybetti. Simülasyon yeni bir nesilde devam ediyor.`, 'death');
    return resetSimulation(st, lg);
  }

  return { newState: st, newLogs: lg };
}

function updateWorldState(st: SimulationState, _addLog: any) {
  const timeMod = st.env.timeCounter % TICKS_PER_DAY;
  if (timeMod < 30) st.env.timeOfDay = 'dawn';
  else if (timeMod < 150) st.env.timeOfDay = 'day';
  else if (timeMod < 180) st.env.timeOfDay = 'dusk';
  else st.env.timeOfDay = 'night';

  if (st.env.timeCounter % 360 === 0) {
    st.env.nextWeather = 'clear'; // Basitleştirilmiş hava
    st.env.weather = 'clear';
  }
}

function updatePerson(st: SimulationState, p: Person, addLog: any) {
  const isMale = p.gender === 'male';

  // 1. Vitals Güncellemesi (Tohum mantığı)
  updatePersonVitals(st, p);
  
  // 2. Hormonal Dürtü (Bilimsel Fark: Erkeklerde daha hızlı artış)
  p.drives.hormonalDrive = Math.min(100, p.drives.hormonalDrive + (isMale ? 0.15 : 0.08));
  if (p.drives.matingCooldown > 0) p.drives.matingCooldown--;

  // 3. Karar Verme & Hareket
  if (!p.targetPos || dist(p.pos, p.targetPos) === 0) {
    // İhtiyaç analizi
    const needs = [
      { n: 'thirst', v: 100 - p.vitals.thirst },
      { n: 'hunger', v: 100 - p.vitals.hunger },
      { n: 'reproduce', v: (p.drives.hormonalDrive > 80 && p.drives.matingCooldown === 0) ? 95 : 0 }
    ];
    needs.sort((a,b) => b.v - a.v);

    if (needs[0].v > 50 && needs[0].n === 'reproduce') {
      const partner = p.id === 'adem' ? st.havva : st.adem;
      p.targetPos = partner.pos;
      p.thinking = `${partner.name}'ya ulaşmak istiyor.`;
    } else {
      p.targetPos = { x: rndInt(WORLD_WIDTH), y: rndInt(WORLD_HEIGHT) };
      p.thinking = "Dünyayı keşfediyor.";
    }
  }

  // Hareket: Enerji kullanımı (Bilimsel Fark: Erkek kas metabolizması hızı)
  if (p.targetPos) {
    const dx = Math.sign(p.targetPos.x - p.pos.x);
    const dy = Math.sign(p.targetPos.y - p.pos.y);
    const newPos = { x: clampN(p.pos.x + dx, 0, WORLD_WIDTH - 1), y: clampN(p.pos.y + dy, 0, WORLD_HEIGHT - 1) };
    if (newPos.x !== p.pos.x || newPos.y !== p.pos.y) {
      p.pos = newPos;
      p.totalSteps++;
      p.dailyStats.steps++;
      p.visitedTiles[`${p.pos.x},${p.pos.y}`] = true;
    }
    p.vitals.energy -= (isMale ? 0.5 : 0.35);
  }

  // 4. Etkileşim
  const partner = p.id === 'adem' ? st.havva : st.adem;
  if (dist(p.pos, partner.pos) <= 1) {
    if (p.drives.hormonalDrive > 80 && partner.drives.hormonalDrive > 50 && p.drives.matingCooldown === 0) {
      addLog(`${p.name} ve ${partner.name} arasında biyolojik bir çekim oluştu.`, 'good');
      p.drives.hormonalDrive = 0;
      p.drives.matingCooldown = 400;
      st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.01);
    }
  }

  // 5. Kaynak Toplama
  const tile = st.env.grid[p.pos.y][p.pos.x];
  if (tile === 'safe_fruit' || tile === 'mushroom' || tile === 'herb') {
    p.inventory[tile] = (p.inventory[tile] || 0) + 1;
    st.env.grid[p.pos.y][p.pos.x] = 'empty';
    addLog(`${p.name} bir ${tile} topladı.`, 'neutral');
    
    // Dil öğrenimi & Kişisel Bilgi
    if (!st.linguistics.wordMap[tile]) {
      const words = ['Aka', 'Uru', 'Sali', 'Boko', 'Zani', 'Fito'];
      st.linguistics.wordMap[tile] = words[rndInt(words.length)] + "-" + Math.random().toString(36).substring(7, 9).toUpperCase();
      st.linguistics.vocabulary.push(st.linguistics.wordMap[tile]);
    }
    
    // Bireysel keşif kaydı
    if (!p.knowledge[tile]) {
      p.knowledge[tile] = {
        label: tile,
        word: st.linguistics.wordMap[tile],
        confidence: 1.0,
        discoveredAt: st.ticksSurvived,
        type: 'resource',
        properties: ['edible']
      };
    } else {
      p.knowledge[tile].occurrences = (p.knowledge[tile].occurrences || 1) + 1;
    }
  }
}

function updatePersonVitals(_st: SimulationState, p: Person) {
  p.vitals.hunger -= 0.2;
  p.vitals.thirst -= 0.3;
  p.vitals.energy -= 0.1;
  p.vitals.health = Math.max(0, p.vitals.health - (p.vitals.hunger < 10 ? 1 : 0));
}

function resetSimulation(st: SimulationState, lg: EventLog[]): { newState: SimulationState, newLogs: EventLog[] } {
  // Record history
  const dead = st.adem.vitals.health <= 0 ? st.adem : st.havva;
  st.livesHistory.push({
    generation: st.generation,
    days: st.daysSurvived,
    cause: dead.lastDamageCause || 'starvation',
    knowledgeAtDeath: Object.keys(dead.knowledge).length
  });

  st.generation++;
  st.daysSurvived = 0;
  st.ticksSurvived = 0;
  st.env.timeCounter = 0;

  // Fully reset both persons but keep DNA/Psychology (or mutate them)
  [st.adem, st.havva].forEach(p => {
    p.vitals = { 
      health: 100, hunger: 100, thirst: 100, temp: 100, energy: 100, breath: 100, 
      toxicity: 0, immunity: 100, 
      bodyParts: { head: 100, torso: 100, arms: 100, legs: 100 } 
    };
    p.inventory = {};
    p.pos = p.id === 'adem' ? { x: 10, y: 10 } : { x: 20, y: 20 };
    p.targetPos = null;
    p.currentAction = null;
    p.restTicks = 0;
    p.totalSteps = 0;
    p.visitedTiles = {};
    p.dailyStats = { day: 0, steps: 0, restTicks: 0, sleepTicks: 0, thinkTicks: 0, decisionCount: 0, exploreTicks: 0, hostileEncounters: 0, meetsObserved: 0, totalTicks: 0 };
    p.yesterdayStats = null;
  });

  return { newState: st, newLogs: lg };
}

export function weatherLabel(w: Weather): string {
  const map: Record<string, string> = { clear: 'Açık', rain: 'Yağmurlu', snow: 'Karlı', storm: 'Fırtınalı', blizzard: 'Tipi', heatwave: 'Sıcak Dalgası' };
  return map[w] || w;
}

export function seasonLabel(s: Season): string {
  const map: Record<string, string> = { spring: 'İlkbahar', summer: 'Yaz', autumn: 'Sonbahar', winter: 'Kış' };
  return map[s] || s;
}

export function timeOfDayLabel(t: TimeOfDay): string {
  const map: Record<string, string> = { dawn: 'Şafak', day: 'Gündüz', dusk: 'Alacakaranlık', night: 'Gece' };
  return map[t] || t;
}
