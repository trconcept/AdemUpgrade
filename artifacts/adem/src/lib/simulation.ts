export type TileType =
  | 'empty' | 'tree' | 'water' | 'safe_fruit' | 'poison_fruit' | 'stone'
  | 'fire' | 'shelter' | 'predator'
  | 'mushroom' | 'thorn_bush' | 'herb' | 'snake' | 'spider' | 'toxic_swamp'
  | 'cave' | 'volcano' | 'cooked_meat' | 'havva' | 'dry_grass' | 'spark';

export type BiomeType = 'temperate' | 'tundra' | 'desert' | 'jungle' | 'volcanic';
export type Weather = 'clear' | 'rain' | 'snow' | 'fog' | 'storm' | 'blizzard' | 'heatwave';
export type TimeOfDay = 'day' | 'night' | 'dusk' | 'dawn';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Action = 'explore' | 'eat_safe' | 'eat_poison' | 'drink' | 'rest' | 'warm_up' | 'shelter' | 'flee' | 'idle' | 'observe' | 'step_damage' | 'pickup' | 'use_item' | 'harvest' | 'craft' | 'symbolize' | 'reproduce';
export type BodyAlert = 'thirst' | 'hunger' | 'cold' | 'hot' | 'pain' | 'fatigue' | 'low_health' | 'infection' | 'bleeding' | 'fracture';
export type DeathCause = string;
export type CreatureKind = 'tavşan' | 'geyik' | 'kurt' | 'ayı' | 'maymun' | 'zürafa' | 'aslan' | 'timsah' | 'penguen' | 'balina' | 'köpekbalığı';
export type BloodGroup = '0' | 'A' | 'B' | 'AB';

export interface DNA {
  sequence: string;
  mutationRate: number;
  traits: {
    longevityLevel: number;
    metabolismSpeed: number;
    sensoryAcuity: number;
    staminaMax: number;
    socialHierarchy: number; // 0-100: Influences dominance vs cooperation
    primateHeritage: number; // 0-100: Influences social mirroring and curiosity
    // Add new ones to make it more complex!
    aggressiveness?: number;
    creativity?: number;
    adaptability?: number;
  };
}

export function generateRandomDNA(): DNA {
  const chars = 'ATGC';
  let seq = '';
  for(let i=0; i<8; i++) seq += chars.charAt(Math.floor(Math.random() * chars.length));
  return {
    sequence: seq,
    mutationRate: 0.01 + (Math.random() * 0.04), // 1% to 5%
    traits: {
      longevityLevel: 30 + Math.random() * 70, // 30-100
      metabolismSpeed: 30 + Math.random() * 70,
      sensoryAcuity: 30 + Math.random() * 70,
      staminaMax: 50 + Math.random() * 50,
      socialHierarchy: Math.random() * 100,
      primateHeritage: Math.random() * 100,
      aggressiveness: Math.random() * 100,
      creativity: Math.random() * 100,
      adaptability: Math.random() * 100
    }
  };
}

export function generateBabyDNA(p1: DNA, p2: DNA): DNA {
  const seqParts = [p1.sequence.substring(0, 4), p2.sequence.substring(4, 8)];
  let mutationRate = (p1.mutationRate + p2.mutationRate) / 2;
  
  const mixTrait = (t1: number, t2: number) => {
    // 40% from p1, 40% from p2, 20% random mutation
    const r = Math.random();
    if (r < 0.4) return t1;
    if (r < 0.8) return t2;
    return Math.max(0, Math.min(100, ((t1 + t2) / 2) + (Math.random() * 30 - 15)));
  };

  return {
    sequence: seqParts.join(''),
    mutationRate: mutationRate,
    traits: {
      longevityLevel: mixTrait(p1.traits.longevityLevel, p2.traits.longevityLevel),
      metabolismSpeed: mixTrait(p1.traits.metabolismSpeed, p2.traits.metabolismSpeed),
      sensoryAcuity: mixTrait(p1.traits.sensoryAcuity, p2.traits.sensoryAcuity),
      staminaMax: mixTrait(p1.traits.staminaMax, p2.traits.staminaMax),
      socialHierarchy: mixTrait(p1.traits.socialHierarchy, p2.traits.socialHierarchy),
      primateHeritage: mixTrait(p1.traits.primateHeritage, p2.traits.primateHeritage),
      aggressiveness: mixTrait(p1.traits.aggressiveness || 50, p2.traits.aggressiveness || 50),
      creativity: mixTrait(p1.traits.creativity || 50, p2.traits.creativity || 50),
      adaptability: mixTrait(p1.traits.adaptability || 50, p2.traits.adaptability || 50),
    }
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
  personId?: string;
  personName?: string;
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
  ecosystemStats: {
    births: Record<CreatureKind | string, number>;
    deaths: Record<CreatureKind | string, number>;
    totalBirths: number;
    totalDeaths: number;
  };
}

export const CREATURE_DETAILS: Record<CreatureKind, { description: string, diet: string, behavior: string }> = {
  'tavşan': { 
    description: 'Hızlı üreyen, küçük memeli. Besin zincirinin en altında yer alır.',
    diet: 'Otçul (Ot, meyve)',
    behavior: 'Korkak, grup halinde gezmeyi sever.'
  },
  'geyik': { 
    description: 'Zarif ve hızlı bir orman hayvanı. Yüksek enerjiye sahip besin kaynağı.',
    diet: 'Otçul (Yaprak, ot)',
    behavior: 'Uyanık, tehlike anında hızla uzaklaşır.'
  },
  'kurt': { 
    description: 'Sürüler halinde avlanan zeki yırtıcı. Sosyal yapıları çok güçlüdür.',
    diet: 'Etçul',
    behavior: 'Sürü odaklı, stratejik avlanma.'
  },
  'ayı': { 
    description: 'Büyük ve güçlü yalnız avcı. Kış uykusu ve bal tutkusuyla bilinir.',
    diet: 'Hepçil',
    behavior: 'Yalnız, alan korumacı.'
  },
  'maymun': {
    description: 'İnsanlığın evrimsel kuzenleri. Sosyal yapıları ve alet kullanımına yatkınlıkları ile bilinirler.',
    diet: 'Hepçil (Meyve, böcek)',
    behavior: 'Meraklı, taklitçi ve sosyal gruplar halinde yaşarlar.'
  },
  'zürafa': {
    description: 'Uzun boyunlarıyla yüksek ağaçların yapraklarına ulaşabilen narin devler.',
    diet: 'Otçul',
    behavior: 'Sakin, sürü halinde otlar.'
  },
  'aslan': {
    description: 'Savanaların güçlü yırtıcısı. Erkekleri yeleleriyle dikkat çeker.',
    diet: 'Etçul',
    behavior: 'Sürü (gurur) halinde aile yapısı, agresif.'
  },
  'timsah': {
    description: 'Bataklık ve nehir kenarlarında pusu kuran tehlikeli pullu yırtıcı.',
    diet: 'Etçul',
    behavior: 'Sinsice izler, ani saldırır.'
  },
  'penguen': {
    description: 'Soğuk denizlere adapte olmuş, karada yavaş ama suda muazzam hızlı yüzebilen kuşlar.',
    diet: 'Etçul (Balık)',
    behavior: 'Koloni halinde yaşar, yüzücü.'
  },
  'balina': {
    description: 'Derin suların devasa deniz memelisi. Devasa cüssesine rağmen sakin karakterlidir.',
    diet: 'Etçul (Plankton, küçük balıklar)',
    behavior: 'Barışçıl, sosyal ve okyanus aşırı göçmen.'
  },
  'köpekbalığı': {
    description: 'Suların acımasız avcısı. Kan kokusunu uzaklardan alabilir.',
    diet: 'Etçul',
    behavior: 'Yalnız, yırtıcı ve agresif.'
  }
};

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
  type: 'good' | 'bad' | 'neutral' | 'death' | 'critical';
  category?: 'good' | 'bad' | 'neutral' | 'death' | 'critical';
  message?: string;
  tick?: number;
  agentId?: 'adem' | 'havva' | 'global';
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
  mode?: 'classic' | 'tabula_rasa';
  population?: Person[];
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
  children: Person[];
}

export type KnowledgeBase = Record<string, any>;

export const WORLD_WIDTH = 150;
export const WORLD_HEIGHT = 150;
export const TICKS_PER_DAY = 240;

export function seasonOf(days: number): Season {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[Math.floor(days / SEASON_CYCLE_DAYS) % 4];
}

export function isValidPosition(kind: string | 'human', x: number, y: number, env: {grid: TileType[][], heights: number[][]}): boolean {
  // Harita sarmalanması (Wrap around / Torus world) sebebiyle X ve Y değerleri zaten 0-W arası gelmelidir ama güvenlik için clamp:
  let tx = x;
  let ty = y;
  if (tx < 0) tx = WORLD_WIDTH - 1;
  if (tx >= WORLD_WIDTH) tx = 0;
  if (ty < 0) ty = WORLD_HEIGHT - 1;
  if (ty >= WORLD_HEIGHT) ty = 0;

  const tile = env.grid[ty][tx];
  const h = env.heights[ty][tx];
  
  if (tile === 'volcano') return false;

  const isWater = h === 0 || tile === 'water';
  const aquatic = ['balina', 'köpekbalığı'];
  const amphibious = ['timsah', 'penguen'];

  if (kind === 'human') {
    return !isWater;
  } else if (aquatic.includes(kind)) {
    return isWater;
  } else if (amphibious.includes(kind)) {
    return true; 
  } else {
    return !isWater;
  }
}

export const CREATURE_INFO: Record<CreatureKind, { color: string, icon: string }> = {
  'tavşan': { color: '#ffffff', icon: '🐇' },
  'geyik': { color: '#c4a484', icon: '🦌' },
  'kurt': { color: '#808080', icon: '🐺' },
  'ayı': { color: '#5c4033', icon: '🐻' },
  'maymun': { color: '#795548', icon: '🐒' },
  'zürafa': { color: '#e6c200', icon: '🦒' },
  'aslan': { color: '#d4af37', icon: '🦁' },
  'timsah': { color: '#4B5320', icon: '🐊' },
  'penguen': { color: '#111111', icon: '🐧' },
  'balina': { color: '#4682B4', icon: '🐋' },
  'köpekbalığı': { color: '#708090', icon: '🦈' }
};

export function createInitialState(gen: number = 1, history: LifeRecord[] = [], psychology?: Psychology, dna?: DNA, mode: 'classic' | 'tabula_rasa' = 'classic'): SimulationState {
  const grid = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill('empty' as TileType));
  const biomes = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill('temperate' as BiomeType));
  const heights = Array(WORLD_HEIGHT).fill(null).map(() => Array(WORLD_WIDTH).fill(0));

  // 1. Initial smooth fractal noise heights
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const nx = x / 12;
      const ny = y / 12;
      heights[y][x] = 
        (Math.sin(nx) + Math.cos(ny)) * 1.0 +
        (Math.sin(nx * 2.1 + 1) + Math.cos(ny * 2.3 + 2)) * 0.5 +
        (Math.sin(nx * 4.4 + 3) + Math.cos(ny * 4.5 + 4)) * 0.25;
    }
  }

  // 2. Normalize and shape heights
  let minH = 999, maxH = -999;
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      if (heights[y][x] < minH) minH = heights[y][x];
      if (heights[y][x] > maxH) maxH = heights[y][x];
    }
  }
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      let norm = (heights[y][x] - minH) / (maxH - minH); // 0.0 to 1.0
      // Sea level logic: bottom 25% is ocean
      if (norm < 0.25) {
        heights[y][x] = 0;
      } else {
        let landNorm = (norm - 0.25) / 0.75;
        landNorm = Math.pow(landNorm, 1.5); // Steepness factor
        heights[y][x] = landNorm * 15; // Max 15 (~1500 meters in UI)
      }
    }
  }

  // 4. Biomes and Grid Content Generation
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const h = heights[y][x];
      
      // Determine basic biome from coords and height
      if (h > 10) biomes[y][x] = 'volcanic';
      else if (y < 12) biomes[y][x] = 'tundra';
      else if (y > WORLD_HEIGHT - 12) biomes[y][x] = 'desert';
      else if (x < 15 || x > WORLD_WIDTH - 15) biomes[y][x] = 'jungle';
      else biomes[y][x] = 'temperate';

      const b = biomes[y][x];
      const r = Math.random();

      // Terrain placement based on height
      if (h === 0) {
        grid[y][x] = 'water';
      } else if (h >= 10) {
        if (b === 'volcanic') grid[y][x] = r < 0.02 ? 'volcano' : 'stone';
        else grid[y][x] = 'stone';
      } else {
        // Flat/hilly land
        if (r < 0.05) grid[y][x] = 'tree';
        else if (r < 0.10) grid[y][x] = 'stone';
        else if (r < 0.12) grid[y][x] = 'herb';
        else if (r < 0.14) grid[y][x] = 'dry_grass';
        else if (r < 0.15) {
          grid[y][x] = Math.random() > 0.5 ? 'safe_fruit' : 'poison_fruit';
        }

        if (b === 'tundra' && Math.random() < 0.01) {
          grid[y][x] = 'cave';
        } else if (h >= 5 && Math.random() < 0.005) {
          grid[y][x] = 'cave';
        } else if (Math.random() < 0.001) {
          grid[y][x] = 'cave';
        }
      }
    }
  }

  // Ensure adem and havva start on valid ground
  heights[75][75] = 5;
  grid[75][75] = 'empty';
  heights[80][80] = 5;
  grid[80][80] = 'empty';
  heights[77][77] = 5;
  grid[77][77] = 'empty';

  // Spawn some creatures intelligently based on biomes
  const initialCreatures: Creature[] = [];
  
  const spawnCreature = (kind: CreatureKind, preferredBiomes: BiomeType[], count: number, restrictWater: boolean = false, requireWater: boolean = false, preferCave: boolean = false) => {
    let spawned = 0;
    let attempts = 0;
    while (spawned < count && attempts < count * 50) {
      attempts++;
      const x = rndInt(WORLD_WIDTH);
      const y = rndInt(WORLD_HEIGHT);
      const b = biomes[y][x];
      const h = heights[y][x];
      const tile = grid[y][x];
      
      const isWater = h === 0 || tile === 'water';
      if (requireWater && !isWater) continue;
      if (restrictWater && isWater) continue;
      if (!preferredBiomes.includes(b)) continue;

      if (preferCave && Math.random() < 0.8 && tile !== 'cave') continue; // Highly prefer spawning in caves

      initialCreatures.push({
        id: Math.random().toString(),
        kind,
        pos: { x, y },
        moveCooldown: rndInt(5)
      });
      spawned++;
    }
  };

  spawnCreature('tavşan', ['temperate', 'jungle'], 25, true);
  spawnCreature('geyik', ['temperate', 'tundra'], 20, true);
  spawnCreature('kurt', ['temperate', 'tundra'], 15, true, false, true);
  spawnCreature('ayı', ['tundra', 'temperate'], 8, true, false, true);
  spawnCreature('maymun', ['jungle'], 18, true);
  spawnCreature('zürafa', ['desert', 'temperate'], 12, true);
  spawnCreature('aslan', ['desert', 'temperate'], 10, true);
  spawnCreature('timsah', ['jungle', 'temperate'], 10, false); // Can be anywhere near water? Let's just say water is handled below
  spawnCreature('penguen', ['tundra'], 15, false); // Can be in water or land in tundra
  spawnCreature('balina', ['temperate', 'tundra', 'desert', 'jungle', 'volcanic'], 6, false, true); // Only water
  spawnCreature('köpekbalığı', ['temperate', 'tundra', 'desert', 'jungle', 'volcanic'], 10, false, true); // Only water


  let population: Person[] | undefined;
  if (mode === 'tabula_rasa') {
    population = [];
    for (let i = 0; i < 100; i++) {
        let x = Math.floor(Math.random() * WORLD_WIDTH);
        let y = Math.floor(Math.random() * WORLD_HEIGHT);
        while(heights[y][x] < 0 || grid[y][x] === 'volcano') {
           x = Math.floor(Math.random() * WORLD_WIDTH); 
           y = Math.floor(Math.random() * WORLD_HEIGHT);
        }
        const m = createPerson(`adem_${i}`, `Adem ${i+1}`, 'male', generateRandomDNA());
        m.pos = {x, y};
        population.push(m);
    }
    for (let i = 0; i < 100; i++) {
        let x = Math.floor(Math.random() * WORLD_WIDTH);
        let y = Math.floor(Math.random() * WORLD_HEIGHT);
        while(heights[y][x] < 0 || grid[y][x] === 'volcano') {
           x = Math.floor(Math.random() * WORLD_WIDTH); 
           y = Math.floor(Math.random() * WORLD_HEIGHT);
        }
        const f = createPerson(`havva_${i}`, `Havva ${i+1}`, 'female', generateRandomDNA());
        f.pos = {x, y};
        population.push(f);
    }
  }

  return {
    mode,
    population,
    generation: gen,
    daysSurvived: 0,
    ticksSurvived: 0,
    memory: { observations: {}, creatures: {}, observationBuffer: [] },
    livesHistory: history,
    cognitiveArchitecture: 'Initial_Seed',
    dna: dna || { 
      sequence: 'ATGC', 
      mutationRate: 0.01, 
      traits: { 
        longevityLevel: 50, 
        metabolismSpeed: 50, 
        sensoryAcuity: 50, 
        staminaMax: 100,
        socialHierarchy: 50,
        primateHeritage: 70
      } 
    },
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
      archaeology: [],
      ecosystemStats: {
        births: { 'tavşan': 25, 'geyik': 20, 'kurt': 15, 'ayı': 8, 'maymun': 18, 'zürafa': 12, 'aslan': 10, 'timsah': 10, 'penguen': 15, 'balina': 6, 'köpekbalığı': 10 },
        deaths: {} as Record<string, number>,
        totalBirths: 149,
        totalDeaths: 0
      }
    },
    adem: createPerson('adem', 'Adem', 'male', dna || generateRandomDNA()),
    havva: createPerson('havva', 'Havva', 'female', dna || generateRandomDNA()),
    children: []
  };
}

function createPerson(id: string, name: string, gender: 'male' | 'female', dna: DNA): Person {
  const isMale = gender === 'male';
  return {
    id, name, gender, dna,
    vitals: { health: 100, hunger: 100, thirst: 100, temp: 100, energy: 100, breath: 100, toxicity: 0, immunity: 100, bodyParts: { head: 100, torso: 100, arms: 100, legs: 100 } },
    pos: { x: id === 'adem' ? 75 : (id === 'havva' ? 80 : 77), y: id === 'adem' ? 75 : (id === 'havva' ? 80 : 77) },
    targetPos: null, currentAction: null, thinking: '...', inventory: {}, knowledge: {}, restTicks: 0, totalSteps: 0, visitedTiles: {}, recentAlerts: [], lastDamageCause: null, yesterdayStats: null,
    psychology: { emotions: { happiness: 50, fear: 0, curiosity: 50, stress: 0, disgust: 0, willpower: 50, tension: 0 }, impressions: {} },
    drives: { hormonalDrive: 0, matingCooldown: 0 },
    sensors: { light: 100, heat: 100, audio: 50, oxygen: 100, pressure: 0 },
    dailyStats: { day: 0, steps: 0, restTicks: 0, sleepTicks: 0, thinkTicks: 0, decisionCount: 0, exploreTicks: 0, hostileEncounters: 0, meetsObserved: 0, totalTicks: 0 },
    anatomy: { 
      height: isMale ? 170 + Math.random() * 20 : 155 + Math.random() * 15, 
      weight: isMale ? 65 + Math.random() * 20 : 50 + Math.random() * 15, 
      muscleMass: isMale ? 0.4 + Math.random() * 0.1 : 0.3 + Math.random() * 0.1, 
      reproductiveType: 'human', 
      secondaryTraits: [] 
    }
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
    [st.adem, st.havva, ...st.children].forEach(p => {
       p.yesterdayStats = { ...p.dailyStats };
       p.dailyStats = { day: st.daysSurvived, steps: 0, restTicks: 0, sleepTicks: 0, thinkTicks: 0, decisionCount: 0, exploreTicks: 0, hostileEncounters: 0, meetsObserved: 0, totalTicks: 0 };
    });
  }

  // Dünya Güncellemeleri
  updateWorldState(st, localAddLog);
  
  // Bireylerin Güncellenmesi
  if (st.population) {
    st.population.forEach(p => updatePerson(st, p, localAddLog));
    // Remove dead from population
    const preLength = st.population.length;
    st.population = st.population.filter(p => {
       if (p.vitals.health <= 0) {
         localAddLog(`${p.name} hayatını kaybetti. (Neden: ${p.lastDamageCause || 'Bilinmiyor'})`, 'death');
         st.livesHistory.push({
            generation: st.generation,
            days: st.daysSurvived,
            cause: p.lastDamageCause || 'starvation',
            knowledgeAtDeath: Object.keys(p.knowledge).length,
            personId: p.id,
            personName: p.name
         });
         return false;
       }
       return true;
    });
    if (st.population.length === 0 && preLength > 0) {
       localAddLog("Tüm nüfus yok oldu. Doğal seçilim başarısız.", 'critical');
       // Restart tabula rasa completely
       return { newState: createInitialState(st.generation + 1, st.livesHistory, undefined, undefined, 'tabula_rasa'), newLogs: lg };
    }
  } else {
    updatePerson(st, st.adem, localAddLog);
    updatePerson(st, st.havva, localAddLog);
    st.children.forEach(c => updatePerson(st, c, localAddLog));

    // Remove dead children
    st.children = st.children.filter(c => {
      if (c.vitals.health <= 0) {
        localAddLog(`${c.name} hayatını kaybetti.`, 'death');
        return false;
      }
      return true;
    });
  }

  // Sosyal Etkileşim: Karşılaşma Mantığı
  if (!st.population) {
    const d = dist(st.adem.pos, st.havva.pos);
    if (d < 5) {
      const meetId = 'met_partner';
      const metBefore = st.adem.psychology.impressions['partner'];
      if (!metBefore) {
        localAddLog(`Büyük Karşılaşma: Adem ve Havva birbirlerini ilk kez gördüler! (Visual Pattern Matching)`, 'good');
        
        // Affect both
        [st.adem, st.havva].forEach(p => {
          p.psychology.emotions.curiosity += 30;
          p.psychology.emotions.fear += 10; // "Instinctive Battle"
          p.psychology.emotions.stress += 15;
          p.thinking = "Bana benzeyen bir varlık görüyorum... (Ayna Etkisi)";
        });

        // Initial trust based on Social Hierarchy trait
        const avgHierarchy = (st.adem.dna.traits.socialHierarchy + st.havva.dna.traits.socialHierarchy) / 2;
        const initialTrust = 100 - avgHierarchy; // Higher hierarchy = more aggression/lower initial trust
        
        st.adem.psychology.impressions['partner'] = { sentiment: initialTrust, label: 'Benzer Varlık', description: 'Kendime çok benzeyen bir varlık ile karşılaştım.' };
        st.havva.psychology.impressions['partner'] = { sentiment: initialTrust, label: 'Benzer Varlık', description: 'Kendime çok benzeyen bir varlık ile karşılaştım.' };
        
      } else {
        // Sosyal bağ güçlenmesi ve Dil tetiklenmesi
        if (st.ticksSurvived % 40 === 0) {
          st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.015);
          st.adem.psychology.emotions.happiness = Math.min(100, st.adem.psychology.emotions.happiness + 3);
          st.havva.psychology.emotions.happiness = Math.min(100, st.havva.psychology.emotions.happiness + 3);
          
          // Touch and Hormonal feedback (Oxytocin effect)
          if (d <= 1) {
            st.adem.psychology.emotions.stress = Math.max(0, st.adem.psychology.emotions.stress - 5);
            st.havva.psychology.emotions.stress = Math.max(0, st.havva.psychology.emotions.stress - 5);
            st.adem.thinking = "Dokunuşun sıcaklığı bir güven ve huzur (Oksitosin) yaratıyor.";
          }

          // Social Mirroring (Taklit)
          if (Math.random() < st.adem.dna.traits.primateHeritage / 200) {
             st.adem.thinking = "Havva'nın hareketlerini taklit ederek öğreniyor (Social Mirroring).";
          }
        }
      }
    }
  }

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

  st.env.season = seasonOf(st.daysSurvived);

  if (st.env.timeCounter % TICKS_PER_DAY === 0) {
    // Determine target weather based on season and days survived
    const season = st.env.season;
    const r = Math.random();
    let nextWeather: any = 'clear';
    if (season === 'spring' && r < 0.4) nextWeather = 'rain';
    if (season === 'summer' && r < 0.1) nextWeather = 'rain';
    if (season === 'autumn' && r < 0.3) nextWeather = 'rain';
    if (season === 'winter' && r < 0.3) nextWeather = 'snow';

    st.env.weather = st.env.nextWeather;
    st.env.nextWeather = nextWeather;
    st.env.weatherProgress = 0;
  } else {
    // Progress weather transition
    if (st.env.weatherProgress < 1) {
      st.env.weatherProgress += 0.05;
    }
  }
  
  // Dynamic Flora Regrowth (Random Samples per tick, to save performance)
  for (let i = 0; i < 50; i++) {
    const rx = Math.floor(Math.random() * WORLD_WIDTH);
    const ry = Math.floor(Math.random() * WORLD_HEIGHT);
    const tile = st.env.grid[ry][rx];
    const biome = st.env.biomes[ry][rx];
    const height = st.env.heights[ry][rx];
    const season = st.env.season;
    const weather = st.env.weather;
    
    // Growth conditions
    const isWater = height === 0;
    if (!isWater && tile === 'empty') {
      const isRaining = weather === 'rain' || weather === 'storm';
      let growChance = isRaining ? 0.05 : 0.01;
      
      // Seasonal adjustments
      if (season === 'spring') growChance *= 2.0;
      if (season === 'winter') growChance = 0;
      
      // Biome adjustments (Jungle grows faster, Desert grows slower)
      if (biome === 'jungle') growChance *= 2.0;
      if (biome === 'desert') growChance *= 0.1;
      if (biome === 'tundra' && season !== 'summer') growChance = 0; // Tundra only grows in summer

      if (Math.random() < growChance) {
        // Regrow something based on biome
        const r = Math.random();
        if (biome === 'desert') {
          st.env.grid[ry][rx] = r < 0.8 ? 'dry_grass' : (r < 0.9 ? 'herb' : 'stone');
        } else if (biome === 'jungle') {
          st.env.grid[ry][rx] = r < 0.5 ? 'tree' : (r < 0.7 ? 'safe_fruit' : (r < 0.8 ? 'poison_fruit' : 'herb'));
        } else if (biome === 'tundra') {
          st.env.grid[ry][rx] = r < 0.7 ? 'dry_grass' : 'stone';
        } else {
          // Temperate
          st.env.grid[ry][rx] = r < 0.4 ? 'tree' : (r < 0.8 ? 'herb' : 'safe_fruit');
        }
      }
    }
  }

  // Handle Spark and Fire propagation
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const tile = st.env.grid[y][x];
      if (tile === 'spark') {
        const neighbors = [
          {x: x - 1, y: y}, {x: x + 1, y: y}, {x: x, y: y - 1}, {x: x, y: y + 1}
        ];
        let foundTinder = false;
        neighbors.forEach(n => {
          if (n.x >= 0 && n.x < WORLD_WIDTH && n.y >= 0 && n.y < WORLD_HEIGHT) {
             if (st.env.grid[n.y][n.x] === 'dry_grass') {
               st.env.grid[n.y][n.x] = 'fire';
               foundTinder = true;
             }
          }
        });
        // Sparks fade quickly
        st.env.grid[y][x] = 'empty';
      }
      
      if (tile === 'fire') {
        // Fire fades or spreads slightly
        if (Math.random() < 0.05) {
           st.env.grid[y][x] = 'empty';
        }
      }
    }
  }

  // Handle Creature AI behaviors
  const newCreatures: Creature[] = [];
  const deceasedCreatures: string[] = [];

  st.env.creatures.forEach(cr => {
    if (cr.moveCooldown > 0) {
      cr.moveCooldown--;
      return;
    }

    // Natural death chance (very small per tick)
    if (Math.random() < 0.0001) {
      deceasedCreatures.push(cr.id);
      st.env.ecosystemStats.deaths[cr.kind] = (st.env.ecosystemStats.deaths[cr.kind] || 0) + 1;
      st.env.ecosystemStats.totalDeaths++;
      return;
    }

    // Reproduction chance
    if (st.env.creatures.length < 100 && Math.random() < 0.001) {
      const neighborsOfSameKind = st.env.creatures.filter(c => c.kind === cr.kind && dist(c.pos, cr.pos) < 2);
      if (neighborsOfSameKind.length > 1) {
        const baby: Creature = {
          id: Math.random().toString(),
          kind: cr.kind,
          pos: { ...cr.pos },
          moveCooldown: 10
        };
        newCreatures.push(baby);
        st.env.ecosystemStats.births[cr.kind] = (st.env.ecosystemStats.births[cr.kind] || 0) + 1;
        st.env.ecosystemStats.totalBirths++;
      }
    }

    const badWeather = st.env.weather === 'rain' || st.env.weather === 'snow' || st.env.weather === 'storm' || st.env.weather === 'blizzard';
    let soughtCave = false;
    if (badWeather && (cr.kind === 'ayı' || cr.kind === 'kurt' || cr.kind === 'aslan')) {
       for (let dy = -5; dy <= 5; dy++) {
         for (let dx = -5; dx <= 5; dx++) {
            const ny = cr.pos.y + dy;
            const nx = cr.pos.x + dx;
            if (ny >= 0 && ny < WORLD_HEIGHT && nx >= 0 && nx < WORLD_WIDTH && st.env.grid[ny][nx] === 'cave') {
              let mx = cr.pos.x + Math.sign(dx);
              let my = cr.pos.y + Math.sign(dy);
              if (isValidPosition(cr.kind, mx, my, st.env)) {
                cr.pos.x = mx;
                cr.pos.y = my;
              }
              soughtCave = true;
              break;
            }
         }
         if (soughtCave) break;
       }
    }

    if (soughtCave) {
       // Already moved towards cave
    } else if (cr.kind === 'kurt') {
      const otherWolves = st.env.creatures.filter(c => c.kind === 'kurt' && c.id !== cr.id);
      const nearestWolf = otherWolves.sort((a,b) => dist(cr.pos, a.pos) - dist(cr.pos, b.pos))[0];
      
      let nx = cr.pos.x;
      let ny = cr.pos.y;
      if (nearestWolf && dist(cr.pos, nearestWolf.pos) > 5) {
        nx = cr.pos.x + Math.sign(nearestWolf.pos.x - cr.pos.x);
        ny = cr.pos.y + Math.sign(nearestWolf.pos.y - cr.pos.y);
      } else {
        nx = cr.pos.x + rndInt(3) - 1;
        ny = cr.pos.y + rndInt(3) - 1;
      }
      if (nx < 0) nx = WORLD_WIDTH - 1; else if (nx >= WORLD_WIDTH) nx = 0;
      if (ny < 0) ny = WORLD_HEIGHT - 1; else if (ny >= WORLD_HEIGHT) ny = 0;
      if (isValidPosition(cr.kind, nx, ny, st.env)) { cr.pos.x = nx; cr.pos.y = ny; }
    } else if (cr.kind === 'maymun') {
      const otherMonkeys = st.env.creatures.filter(c => c.kind === 'maymun' && c.id !== cr.id);
      const nearestMonkey = otherMonkeys.sort((a,b) => dist(cr.pos, a.pos) - dist(cr.pos, b.pos))[0];
      let nx = cr.pos.x;
      let ny = cr.pos.y;
      if (nearestMonkey && dist(cr.pos, nearestMonkey.pos) > 3) {
        nx = cr.pos.x + Math.sign(nearestMonkey.pos.x - cr.pos.x);
        ny = cr.pos.y + Math.sign(nearestMonkey.pos.y - cr.pos.y);
      } else {
        nx = cr.pos.x + rndInt(3) - 1;
        ny = cr.pos.y + rndInt(3) - 1;
      }
      if (nx < 0) nx = WORLD_WIDTH - 1; else if (nx >= WORLD_WIDTH) nx = 0;
      if (ny < 0) ny = WORLD_HEIGHT - 1; else if (ny >= WORLD_HEIGHT) ny = 0;
      if (isValidPosition(cr.kind, nx, ny, st.env)) { cr.pos.x = nx; cr.pos.y = ny; }
    } else {
      let nx = cr.pos.x + rndInt(3) - 1;
      let ny = cr.pos.y + rndInt(3) - 1;
      if (nx < 0) nx = WORLD_WIDTH - 1; else if (nx >= WORLD_WIDTH) nx = 0;
      if (ny < 0) ny = WORLD_HEIGHT - 1; else if (ny >= WORLD_HEIGHT) ny = 0;
      if (isValidPosition(cr.kind, nx, ny, st.env)) { cr.pos.x = nx; cr.pos.y = ny; }
    }

    // Environmental Interaction (Eating)
    const t = st.env.grid[cr.pos.y][cr.pos.x];
    if ((cr.kind === 'tavşan' || cr.kind === 'geyik' || cr.kind === 'maymun') && (t === 'safe_fruit' || t === 'herb')) {
      if (Math.random() < 0.2) st.env.grid[cr.pos.y][cr.pos.x] = 'empty';
    }
    
    cr.moveCooldown = 2 + rndInt(5);
  });

  // Apply changes
  st.env.creatures = [
    ...st.env.creatures.filter(c => !deceasedCreatures.includes(c.id)),
    ...newCreatures
  ];
}

function updatePerson(st: SimulationState, p: Person, addLog: any) {
  const isMale = p.gender === 'male';

  // 1. Vitals Güncellemesi (Tohum mantığı)
  updatePersonVitals(st, p, addLog);
  
  // 2. Hormonal Dürtü (Bilimsel Fark: Erkeklerde daha hızlı artış)
  p.drives.hormonalDrive = Math.min(100, p.drives.hormonalDrive + (isMale ? 0.15 : 0.08));
  if (p.drives.matingCooldown > 0) p.drives.matingCooldown--;

  // 3. Karar Verme & Hareket
  if (!p.targetPos || dist(p.pos, p.targetPos) === 0) {
    // İhtiyaç analizi
    const badWeather = st.env.weather === 'rain' || st.env.weather === 'snow' || st.env.weather === 'storm' || st.env.weather === 'blizzard';
    const currentTile = st.env.grid[p.pos.y][p.pos.x];
    const isSheltered = currentTile === 'cave' || currentTile === 'shelter';

    const needs = [
      { n: 'energy', v: p.vitals.energy < 20 ? 100 : (p.vitals.energy < 40 ? 70 : 0) },
      { n: 'thirst', v: 100 - p.vitals.thirst },
      { n: 'hunger', v: 100 - p.vitals.hunger },
      { n: 'reproduce', v: (p.drives.hormonalDrive > 80 && p.drives.matingCooldown === 0) ? 95 : 0 },
      { n: 'shelter', v: (badWeather && !isSheltered) ? 85 : 0 }
    ];
    needs.sort((a,b) => b.v - a.v);
    
    // Yemek & Dinlenme & Sığınma Eylemleri
    if (needs[0].v > 40 && needs[0].n === 'energy') {
       p.thinking = "Çok yorgun, dinleniyor veya uyuyor.";
       p.vitals.energy = Math.min(100, p.vitals.energy + 10);
       p.dailyStats.sleepTicks++;
       if (Math.random() < 0.05 && addLog) addLog(`${p.name} uykuya daldı/dinleniyor.`, 'neutral');
       p.targetPos = null; // Hareket etme
       return; // Bu tick dinlendi
    } else if (needs[0].v > 50 && needs[0].n === 'thirst') {
       let foundWater = false;
       let bestDist = 999;
       let bestPos = null;
       for (let dy = -10; dy <= 10; dy++) {
         for (let dx = -10; dx <= 10; dx++) {
           const ny = p.pos.y + dy;
           const nx = p.pos.x + dx;
           if (ny >= 0 && ny < WORLD_HEIGHT && nx >= 0 && nx < WORLD_WIDTH) {
             if (st.env.heights[ny][nx] < 0 || st.env.grid[ny][nx] === 'water') {
               const d = Math.abs(dx) + Math.abs(dy);
               if (d <= 1) {
                  p.vitals.thirst = 100;
                  if (Math.random() < 0.05 && addLog) addLog(`${p.name} susuzluğunu giderdi.`, 'good');
                  p.thinking = "Su içti ve rahatladı.";
                  p.targetPos = null;
                  return;
               }
               if (d < bestDist) {
                 bestDist = d;
                 bestPos = { x: nx, y: ny };
                 foundWater = true;
               }
             }
           }
         }
       }
       if (foundWater && bestPos) {
         p.targetPos = bestPos;
         p.thinking = "Su kaynağına doğru ilerliyor.";
       } else {
         p.targetPos = { x: clampN(p.pos.x + rndInt(5) - 2, 0, WORLD_WIDTH - 1), y: clampN(p.pos.y + rndInt(5) - 2, 0, WORLD_HEIGHT - 1) };
         p.thinking = "Susuzluktan kıvranırken su arıyor.";
       }
    } else if (needs[0].v > 80 && needs[0].n === 'shelter') {
       p.thinking = "Kötü hava koşullarından (Fırtına/Yağış/Kar) korunmak için bir mağara arıyor.";
       // Find nearest cave within 20 tiles
       let foundCave = false;
       let bestDist = 999;
       let bestPos = null;
       for (let dy = -15; dy <= 15; dy++) {
         for (let dx = -15; dx <= 15; dx++) {
           const ny = p.pos.y + dy;
           const nx = p.pos.x + dx;
           if (ny >= 0 && ny < WORLD_HEIGHT && nx >= 0 && nx < WORLD_WIDTH) {
             if (st.env.grid[ny][nx] === 'cave') {
               const d = Math.abs(dx) + Math.abs(dy);
               if (d < bestDist) {
                 bestDist = d;
                 bestPos = { x: nx, y: ny };
                 foundCave = true;
               }
             }
           }
         }
       }
       if (foundCave && bestPos) {
         p.targetPos = bestPos;
       } else {
         p.targetPos = { x: clampN(p.pos.x + rndInt(3) - 1, 0, WORLD_WIDTH - 1), y: clampN(p.pos.y + rndInt(3) - 1, 0, WORLD_HEIGHT - 1) };
       }
    } else if (needs[0].v > 50 && needs[0].n === 'hunger') {
       // Çantada yiyecek var mı?
       const foodVariants = ['safe_fruit', 'mushroom', 'herb'];
       const trNames: Record<string, string> = { 'safe_fruit': 'meyve', 'mushroom': 'mantar', 'herb': 'şifalı ot' };
       let ate = false;
       for (const food of foodVariants) {
         if (p.inventory[food] && p.inventory[food] > 0) {
           p.inventory[food]--;
           p.vitals.hunger = Math.min(100, p.vitals.hunger + 30);
           addLog(`${p.name} acıktı ve çantasından bir ${trNames[food]} yedi.`, 'good');
           p.thinking = "Karnını doyurdu.";
           ate = true;
           break;
         }
       }
       if (!ate) {
         p.thinking = "Yiyecek bulmak zorunda.";
         p.targetPos = { x: rndInt(WORLD_WIDTH), y: rndInt(WORLD_HEIGHT) };
       }
    } else if (needs[0].v > 50 && needs[0].n === 'reproduce') {
      if (st.population) {
         const partners = st.population.filter(x => x.gender !== p.gender && x.id !== p.id && dist(x.pos, p.pos) < 20 && x.drives.matingCooldown === 0 && x.vitals.health > 0);
         if (partners.length > 0) {
           const partner = partners.sort((a,b) => dist(p.pos, a.pos) - dist(p.pos, b.pos))[0];
           p.targetPos = partner.pos;
           p.thinking = `${partner.name}'ya ulaşmak istiyor.`;
         } else {
           p.targetPos = { x: Math.floor(Math.random() * WORLD_WIDTH), y: Math.floor(Math.random() * WORLD_HEIGHT) };
         }
      } else {
         const partner = p.id === 'adem' ? st.havva : st.adem;
         p.targetPos = partner.pos;
         p.thinking = `${partner.name}'ya ulaşmak istiyor.`;
      }
    } else {
      p.targetPos = { x: rndInt(WORLD_WIDTH), y: rndInt(WORLD_HEIGHT) };
      p.thinking = "Dünyayı keşfediyor.";

      // Observe nearby creatures
      const nearbyCreatures = st.env.creatures.filter(c => dist(p.pos, c.pos) < 5);
      if (nearbyCreatures.length > 0) {
        const obs = nearbyCreatures[0];
        p.thinking = `${obs.kind.toUpperCase()} sürüsünü/davranışını gözlemliyor.`;
        
        if (obs.kind === 'kurt' && Math.random() < 0.1) {
          st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.005);
          p.psychology.emotions.curiosity = Math.min(100, p.psychology.emotions.curiosity + 1);
        }
        
        if (obs.kind === 'maymun' && Math.random() < 0.1) {
          // Learning byproduct: imitation and tool use awareness
          p.psychology.emotions.curiosity = Math.min(100, p.psychology.emotions.curiosity + 2);
          if (p.psychology.emotions.curiosity > 70) {
             p.thinking = "Maymunların hareketlerini taklit ederek alet kullanımını kavrıyor.";
             st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.01);
          }
        }
      }
    }
  }

  // Knapping (Tool/Fire starting)
  const currentTile = st.env.grid[p.pos.y][p.pos.x];
  if (currentTile === 'stone' && Math.random() < 0.05) {
     p.thinking = "Taşları birbirine vuruyor (Knapping)...";
     if (Math.random() < 0.1) { // 0.1% chance from user request was very low, 10% of 5% tick is 0.5% total
        st.env.grid[p.pos.y][p.pos.x] = 'spark';
        addLog(`${p.name} bir kıvılcım çıkardı!`, 'good');
     }
  }

  // Hareket: Enerji kullanımı (Bilimsel Fark: Erkek kas metabolizması hızı, ve Yükseklik Farkı)
  if (p.targetPos) {
    const dx = Math.sign(p.targetPos.x - p.pos.x);
    const dy = Math.sign(p.targetPos.y - p.pos.y);
    
    let tx = p.pos.x + dx;
    let ty = p.pos.y + dy;
    let regionChanged = false;

    // Torus / Küresel geçiş sistemi (Bölge değişimi)
    if (tx < 0) { tx = WORLD_WIDTH - 1; regionChanged = true; }
    else if (tx >= WORLD_WIDTH) { tx = 0; regionChanged = true; }
    if (ty < 0) { ty = WORLD_HEIGHT - 1; regionChanged = true; }
    else if (ty >= WORLD_HEIGHT) { ty = 0; regionChanged = true; }

    if (regionChanged && addLog && Math.random() < 0.3) {
      addLog(`${p.name} mevcut haritanın sınırına ulaşıp farklı bir coğrafi bölgeye (veya dünyanın arka yüzeyine) geçiş yaptı. Geri döndüğünde eski bölgeyi (haritayı) hatırlayacak!`, 'neutral');
    }

    const newPos = { x: tx, y: ty };
    
    let heightDiff = 0;
    if (newPos.x !== p.pos.x || newPos.y !== p.pos.y) {
      if (isValidPosition('human', newPos.x, newPos.y, st.env)) {
        const currentHeight = st.env.heights[p.pos.y][p.pos.x];
        const newHeight = st.env.heights[newPos.y][newPos.x];
        heightDiff = newHeight - currentHeight;
        p.pos = newPos;
        p.totalSteps++;
        p.dailyStats.steps++;
        p.visitedTiles[`${p.pos.x},${p.pos.y}`] = true;
      } else {
        // Engele takıldı (Su/Volkan), yeni yol bulsun
        p.targetPos = null;
      }
    }
    
    // Yokuş yukarı çıkmak daha fazla enerji harcatır
    let elevationStaminaCost = 0;
    if (heightDiff > 0) {
      elevationStaminaCost = heightDiff * 2.0; // 1 birim yükseklik (100m) 2 ekstra enerji götürür
    } else if (heightDiff < 0) {
      elevationStaminaCost = Math.max(-0.2, heightDiff * 0.5); // İnişte en fazla 0.2 enerji avantajı sağlar, sonsuz enerji üretmez
    }

    p.vitals.energy -= Math.max(0.1, (isMale ? 0.5 : 0.35) + elevationStaminaCost);
  }

  // 4. Etkileşim
  if (st.population) {
     if (p.drives.matingCooldown === 0 && p.drives.hormonalDrive > 80 && p.vitals.health > 0) {
        const partner = st.population.find(x => x.id !== p.id && x.gender !== p.gender && dist(p.pos, x.pos) <= 1 && x.drives.matingCooldown === 0 && x.drives.hormonalDrive > 50 && x.vitals.health > 0);
        if (partner) {
           if (addLog && Math.random() < 0.2) addLog(`${p.name} ve ${partner.name} arasında biyolojik etkileşim gerçekleşti.`, 'good');
           p.drives.hormonalDrive = 0; p.drives.matingCooldown = 600;
           partner.drives.hormonalDrive = 0; partner.drives.matingCooldown = 600;
           st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.01);
           if (st.population.length < 500) { // Limit total pop to 500
              const isBoy = Math.random() < 0.5;
              const childId = 'child_' + Math.random().toString(36).substring(2,9);
              const childName = (isBoy ? 'Adem-' : 'Havva-') + childId.substring(6,9).toUpperCase();
              const newDna = generateBabyDNA(p.dna, partner.dna);
              const child = createPerson(childId, childName, isBoy ? 'male' : 'female', newDna);
              child.pos = { ...p.pos };
              st.population.push(child);
              if (addLog) addLog(`Yeni bir nesil dünyaya geldi: ${childName}. (Ebeveyn: ${p.name} & ${partner.name})`, 'good');
           }
        }
     }
  } else {
    // Currently, only Adem and Havva represent the reproducing adults for simplicity.
    if (p.id === 'adem' || p.id === 'havva') {
      const partner = p.id === 'adem' ? st.havva : st.adem;
      if (dist(p.pos, partner.pos) <= 1) {
        if (p.drives.hormonalDrive > 80 && partner.drives.hormonalDrive > 50 && p.drives.matingCooldown === 0) {
          addLog(`${p.name} ve ${partner.name} arasında biyolojik bir etkileşim gerçekleşti! (Hormonal Drive)`, 'good');
          p.drives.hormonalDrive = 0;
          p.drives.matingCooldown = 600; // Longer cooldown
          partner.drives.matingCooldown = 600;
          st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.01);
          
          // Doğurtalım!
          if (st.children.length < 5) { // Sınır
             const isBoy = Math.random() < 0.5;
             const childId = 'child_' + Math.random().toString(36).substring(2,9);
             const childName = (isBoy ? 'Oğul-' : 'Kız-') + childId.substring(6,9).toUpperCase();
             const newDna = generateBabyDNA(p.dna, partner.dna);
             const child = createPerson(childId, childName, isBoy ? 'male' : 'female', newDna);
             child.pos = { ...p.pos }; // Spawns right next to parents
             st.children.push(child);
             addLog(`Bir bebek dünyaya geldi! Adı: ${childName}. Tamamen eşsiz genetiğe sahip.`, 'good');
          }
        }
      }
    }
  }

  // 5. Kaynak Toplama
  const tile = st.env.grid[p.pos.y][p.pos.x];
  if (tile === 'safe_fruit' || tile === 'mushroom' || tile === 'herb') {
    p.inventory[tile] = (p.inventory[tile] || 0) + 1;
    st.env.grid[p.pos.y][p.pos.x] = 'empty';
    if (addLog) addLog(`${p.name} bir ${tile} topladı.`, 'neutral');
    
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

  // 6. Doğal Sesleri Algılama ve Dil Gelişimi
  if (Math.random() < 0.05) {
    let soundSource = '';
    let soundDesc = '';
    
    // Rüzgar ve Fırtına sesi
    if (st.env.weather === 'storm' || st.env.weather === 'blizzard') {
      soundSource = 'sound_wind';
      soundDesc = 'şiddetli bir uğultu/fırtına sesi';
    } else if (st.env.weather === 'rain') {
      soundSource = 'sound_rain';
      soundDesc = 'yağmur damlalarının sesi';
    } else if (tile === 'tree' && Math.random() < 0.3) {
      soundSource = 'sound_leaves';
      soundDesc = 'ağaç yapraklarının hışırtısı';
    }

    // Hayvan sesleri
    if (!soundSource) {
      const nearAnimal = st.env.creatures.find(c => dist(p.pos, c.pos) < 6);
      if (nearAnimal) {
        soundSource = 'sound_' + nearAnimal.kind;
        soundDesc = `bir ${nearAnimal.kind} sesi`;
      }
    }

    // Kendi veya partnerinin çıkardığı ilk sesler (Islık, mırıltı vb.)
    if (!soundSource && Math.random() < 0.02) {
       soundSource = 'sound_self';
       soundDesc = 'kendi gırtlağından çıkan garip bir ıslık/mırıltı tınısı';
    }

    if (soundSource) {
      if (!p.knowledge[soundSource]) {
        // İlk defa duydu
        p.knowledge[soundSource] = {
           label: `İşitilen: ${soundDesc}`,
           confidence: 1.0,
           discoveredAt: st.ticksSurvived,
           type: 'abstract',
           properties: ['acoustic', 'mimicry']
        };
        
        if (addLog) {
          addLog(`${p.name} ilk defa doğada ${soundDesc} duydu ve oldukça şaşırdı. Onu taklit etmeye (mimicry) çalışıyor.`, 'good');
        }

        // Ses bazlı yeni kelime / hece türetimi
        const mimicWords = ['Fuu', 'Hrr', 'Şşşt', 'Ooo', 'Auu', 'Cik', 'Vııı'];
        const learnedWord = mimicWords[rndInt(mimicWords.length)] + "-" + soundSource.split('_').pop()?.substring(0,3).toUpperCase();
        
        if (!st.linguistics.wordMap[soundSource]) {
           st.linguistics.wordMap[soundSource] = learnedWord;
           st.linguistics.vocabulary.push(learnedWord);
           st.linguistics.syntaxComplexity = Math.min(1, st.linguistics.syntaxComplexity + 0.02);
        }
        p.knowledge[soundSource].word = st.linguistics.wordMap[soundSource];
        p.thinking = `Duyduğu ${soundDesc}ni ses telleriyle ("${learnedWord}") benzer bir şekilde çıkarmayı deniyor...`;
        p.psychology.emotions.curiosity = Math.min(100, p.psychology.emotions.curiosity + 5);
      } else {
        p.knowledge[soundSource].occurrences = (p.knowledge[soundSource].occurrences || 1) + 1;
      }
    }
  }
}

function updatePersonVitals(st: SimulationState, p: Person, addLog?: any) {
  let isAlone = false;
  if (st.population) {
    isAlone = !st.population.some(other => other.id !== p.id && dist(p.pos, other.pos) <= 15);
  } else {
    isAlone = dist(st.adem.pos, st.havva.pos) > 15;
  }
  const stressFactor = 1 + (p.psychology.emotions.stress / 200); // Stress burns energy faster
  const helplessnessFactor = isAlone ? 1.2 : 1.0; // "Vulnerability of helpless infants" logic - higher decay if alone

  const currentHeight = st.env.heights[p.pos.y][p.pos.x];
  let nearVolcano = false;
  // Kükürt gazı ve sıcaklık kontrolü (çevre taraması)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const ny = p.pos.y + dy;
      const nx = p.pos.x + dx;
      if (ny >= 0 && ny < WORLD_HEIGHT && nx >= 0 && nx < WORLD_WIDTH) {
        if (st.env.grid[ny][nx] === 'volcano') {
           nearVolcano = true;
           break;
        }
      }
    }
  }

  const currentTile = st.env.grid[p.pos.y][p.pos.x];
  
  // Predator check
  const hostileKinds = ['aslan', 'timsah', 'ayı', 'kurt', 'köpekbalığı'];
  const nearPredators = st.env.creatures.filter(c => hostileKinds.includes(c.kind) && dist(p.pos, c.pos) <= 1);
  if (nearPredators.length > 0) {
    p.dailyStats.hostileEncounters++;
    p.vitals.health -= nearPredators.length * 2.5; // Damage per tick
    p.lastDamageCause = 'predator_attack';
    if (Math.random() < 0.1 && addLog) {
      addLog(`${p.name} bir ${nearPredators[0].kind} tarafından saldırıya uğradı! (Sağlık: ${Math.round(p.vitals.health)})`, 'critical');
    }
    p.thinking = `Bir ${nearPredators[0].kind} saldırıyor!`;
  }

  // Weather effects
  const badWeather = st.env.weather === 'rain' || st.env.weather === 'snow' || st.env.weather === 'storm' || st.env.weather === 'blizzard';
  const isSheltered = currentTile === 'cave' || currentTile === 'shelter' || currentTile === 'tree';
  
  if (badWeather && !isSheltered) {
    const isCold = st.env.weather === 'snow' || st.env.weather === 'blizzard';
    p.vitals.temp -= isCold ? 0.5 : 0.2;
    if (st.env.weather === 'storm' && Math.random() < 0.005) {
      p.vitals.health -= 5; // Lightning or debris
      p.lastDamageCause = 'storm_lightning';
      if (addLog) addLog(`${p.name} fırtınada ağır yaralandı!`, 'critical');
    } else if (isCold && p.vitals.temp < 30) {
       p.vitals.health -= 0.5;
       p.lastDamageCause = 'hypothermia';
    }
  } else {
    // Normal temp recovery
    if (p.vitals.temp < 100) p.vitals.temp = Math.min(100, p.vitals.temp + 0.5);
  }

  if (currentTile === 'volcano') {
    p.vitals.health -= 5;
    p.vitals.toxicity = Math.min(100, p.vitals.toxicity + 10);
    p.lastDamageCause = 'volcanic_burn';
  } else if (nearVolcano) {
    p.vitals.toxicity = Math.min(100, p.vitals.toxicity + 2);
    p.vitals.temp += 1;
    if (Math.random() < 0.05) {
       p.thinking = "Kükürt gazı ciğerlerini yakıyor...";
    }
    if (p.vitals.toxicity > 50) {
       p.vitals.health -= 0.5;
       p.lastDamageCause = 'sulfur_inhalation';
    }
  }

  p.vitals.hunger -= 0.04 * stressFactor * helplessnessFactor;
  p.vitals.thirst -= 0.10 * stressFactor * helplessnessFactor;
  p.vitals.energy -= 0.30 * stressFactor;
  
  // Health decay from critical needs
  if (p.vitals.hunger < 10) p.vitals.health -= 0.04;
  if (p.vitals.thirst < 10) p.vitals.health -= 0.20;
  if (p.vitals.energy < 5) p.vitals.health -= 0.05;

  p.vitals.health = Math.max(0, Math.min(100, p.vitals.health));
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

  if (st.children.length === 0) {
    // Çocukları olmadan öldüler. "Boş Tahta" olarak sıfırdan başlıyor.
    lg.push({ id: Math.random().toString(), tick: st.ticksSurvived, category: 'death', message: `İlişki ve gen aktarımı gerçekleşmeden öldüler. Simülasyon BOŞ TAHTA (sıfırdan) olarak yeniden başlatılıyor!` });
    
    // Completely wipe. Create fresh state but keep livesHistory
    const newState = createInitialState(1, st.livesHistory);
    return { newState, newLogs: lg };
  } else {
    // Çocukları var. Gen aktarımı yaşandı. (Eğer o çocuklar da sağ kalırsa mantığıyla, şimdilik en eski çocuğu yeni Adem/Havva temeli alalım)
    lg.push({ id: Math.random().toString(), tick: st.ticksSurvived, category: 'good', message: `Gen aktarımı başarılı oldu. Simülasyon genetik miras aktarılarak yeni nesil ile devam ediyor.` });
    
    // Take the DNA of the first child to create the new generation parameters
    const childDna = st.children[0].dna;
    const newState = createInitialState(st.generation + 1, st.livesHistory, undefined, childDna); 
    return { newState, newLogs: lg };
  }
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
