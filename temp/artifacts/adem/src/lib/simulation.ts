export type TileType =
  | 'empty' | 'tree' | 'water' | 'safe_fruit' | 'poison_fruit' | 'stone'
  | 'fire' | 'shelter' | 'predator'
  | 'mushroom' | 'thorn_bush' | 'herb';
export type Weather = 'clear' | 'rain' | 'snow' | 'fog' | 'storm';
export type TimeOfDay = 'day' | 'night' | 'dusk' | 'dawn';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Action = 'explore' | 'eat_safe' | 'eat_poison' | 'drink' | 'rest' | 'warm_up' | 'shelter' | 'flee' | 'idle' | 'observe' | 'step_damage';
export type BodyAlert = 'thirst' | 'hunger' | 'cold' | 'hot' | 'pain' | 'fatigue' | 'low_health';
export type DeathCause = 'Susuzluk' | 'Açlık' | 'Soğuk' | 'Zehirlenme' | 'Yırtıcı saldırısı' | 'Yorgunluk' | 'Bilinmeyen';
export type CreatureKind = 'tavşan' | 'geyik' | 'kurt' | 'ayı';

export interface Creature {
  id: string;
  kind: CreatureKind;
  pos: Position;
  moveCooldown: number;
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
}

export interface Position { x: number; y: number; }

export interface Memory {
  water: Record<string, true>;
  safeFruit: Record<string, true>;
  poisonFruit: Record<string, true>;
  fire: Record<string, true>;
  shelter: Record<string, true>;
  predator: Record<string, true>;
  mushroom: Record<string, true>;
  thorn: Record<string, true>;
  herb: Record<string, true>;
  creatures: Record<string, { kind: CreatureKind }>;
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
}

export interface SimulationState {
  generation: number;
  daysSurvived: number;
  ticksSurvived: number;
  vitals: Vitals;
  pos: Position;
  targetPos: Position | null;
  env: Environment;
  currentAction: Action | null;
  visitedTiles: Record<string, true>;
  recentAlerts: BodyAlert[];
  memory: Memory;
  lastDamageCause: DeathCause | null;
  livesHistory: LifeRecord[];
  thinking: string;
  restTicks: number;
  dailyStats: DailyStats;
  yesterdayStats: DailyStats | null;
  totalSteps: number;
}

export interface KnowledgeEntry {
  situation: string;
  action: Action;
  outcomeText: string;
  confidence: number;
  deltaHealth: number;
  deltaHunger: number;
  deltaThirst: number;
  deltaTemp: number;
  deltaEnergy: number;
  occurrences: number;
}

export type KnowledgeBase = Record<string, KnowledgeEntry>;

export interface EventLog {
  id: string;
  day: number;
  time: string;
  text: string;
  type: 'good' | 'bad' | 'neutral' | 'death';
}

export const WORLD_WIDTH = 80;
export const WORLD_HEIGHT = 55;
export const VIEWPORT_TILES_X = 22;
export const VIEWPORT_TILES_Y = 18;

export const CREATURE_INFO: Record<CreatureKind, {
  hostile: boolean;
  damagePerTick: number;
  attackRange: number;
  fleeRange: number;
  baseCooldown: number;
  huntRange: number;
  label: string;
}> = {
  tavşan: { hostile: false, damagePerTick: 0, attackRange: 0, fleeRange: 4, baseCooldown: 2, huntRange: 0, label: 'Tavşan' },
  geyik: { hostile: false, damagePerTick: 0, attackRange: 0, fleeRange: 3, baseCooldown: 4, huntRange: 0, label: 'Geyik' },
  kurt: { hostile: true, damagePerTick: 6, attackRange: 1, fleeRange: 0, baseCooldown: 2, huntRange: 7, label: 'Kurt' },
  ayı: { hostile: true, damagePerTick: 12, attackRange: 1, fleeRange: 0, baseCooldown: 5, huntRange: 4, label: 'Ayı' },
};

const SEASON_CYCLE_DAYS = 4;
const WEATHER_CHANGE_INTERVAL = 360;
const TICKS_PER_DAY = 240;
const SENSE_RADIUS = 5;

// Vital thresholds — ADEM only acts on a need below the urgent value, and stops when above the satisfied value
const URGENT = { thirst: 55, hunger: 55, temp: 50, energy: 35 };
const SATISFIED = { thirst: 80, hunger: 80, temp: 80, energy: 80 };

function rndInt(max: number) { return Math.floor(Math.random() * max); }
function clampN(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function dist(a: Position, b: Position) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

export function generateEnvironment(): Environment {
  const grid: TileType[][] = Array(WORLD_HEIGHT)
    .fill(null)
    .map(() => Array(WORLD_WIDTH).fill('empty' as TileType));

  for (let i = 0; i < 180; i++) {
    const cx = rndInt(WORLD_WIDTH);
    const cy = rndInt(WORLD_HEIGHT);
    const clusterSize = 3 + rndInt(5);
    for (let j = 0; j < clusterSize; j++) {
      const tx = clampN(cx + rndInt(5) - 2, 0, WORLD_WIDTH - 1);
      const ty = clampN(cy + rndInt(5) - 2, 0, WORLD_HEIGHT - 1);
      if (grid[ty][tx] === 'empty') grid[ty][tx] = 'tree';
    }
  }
  for (let i = 0; i < 80; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'safe_fruit';
  }
  for (let i = 0; i < 55; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'poison_fruit';
  }
  for (let i = 0; i < 70; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'stone';
  }
  // New plant types
  for (let i = 0; i < 28; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'mushroom';
  }
  for (let i = 0; i < 32; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'thorn_bush';
  }
  for (let i = 0; i < 20; i++) {
    const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
    if (grid[y][x] === 'empty') grid[y][x] = 'herb';
  }
  for (let lake = 0; lake < 6; lake++) {
    const cx = 8 + rndInt(WORLD_WIDTH - 16);
    const cy = 5 + rndInt(WORLD_HEIGHT - 10);
    const radius = 2 + rndInt(4);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const tx = cx + dx, ty = cy + dy;
          if (tx >= 0 && tx < WORLD_WIDTH && ty >= 0 && ty < WORLD_HEIGHT) grid[ty][tx] = 'water';
        }
      }
    }
  }
  for (let i = 0; i < 9; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
      if (grid[y][x] === 'empty') { grid[y][x] = 'shelter'; break; }
    }
  }
  for (let i = 0; i < 11; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
      if (grid[y][x] === 'empty') { grid[y][x] = 'fire'; break; }
    }
  }
  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
      if (grid[y][x] === 'empty') { grid[y][x] = 'predator'; break; }
    }
  }

  // Spawn creatures
  const creatures: Creature[] = [];
  const spawnCreature = (kind: CreatureKind, count: number) => {
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const x = rndInt(WORLD_WIDTH), y = rndInt(WORLD_HEIGHT);
        const t = grid[y][x];
        if (t === 'empty' || t === 'tree' || t === 'stone') {
          creatures.push({
            id: `${kind}_${i}_${Math.random().toString(36).slice(2, 7)}`,
            kind,
            pos: { x, y },
            moveCooldown: rndInt(CREATURE_INFO[kind].baseCooldown + 2),
          });
          break;
        }
      }
    }
  };
  spawnCreature('tavşan', 9);
  spawnCreature('geyik', 6);
  spawnCreature('kurt', 4);
  spawnCreature('ayı', 2);

  return {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    grid,
    weather: 'clear',
    nextWeather: 'clear',
    weatherProgress: 1,
    timeOfDay: 'day',
    timeCounter: 0,
    season: 'spring',
    ambientTemp: 18,
    creatures,
  };
}

function createDailyStats(day: number): DailyStats {
  return {
    day,
    steps: 0,
    restTicks: 0,
    sleepTicks: 0,
    thinkTicks: 0,
    decisionCount: 0,
    exploreTicks: 0,
    hostileEncounters: 0,
    meetsObserved: 0,
    totalTicks: 0,
  };
}

export function createInitialState(generation = 1, prevHistory: LifeRecord[] = []): SimulationState {
  const env = generateEnvironment();
  // Find a safe starting tile near map center (empty, not adjacent to predator/creature)
  let startX = Math.floor(WORLD_WIDTH / 2);
  let startY = Math.floor(WORLD_HEIGHT / 2);
  for (let attempt = 0; attempt < 40; attempt++) {
    const t = env.grid[startY][startX];
    if (t === 'empty') break;
    startX = clampN(Math.floor(WORLD_WIDTH / 2) + rndInt(9) - 4, 0, WORLD_WIDTH - 1);
    startY = clampN(Math.floor(WORLD_HEIGHT / 2) + rndInt(9) - 4, 0, WORLD_HEIGHT - 1);
  }
  return {
    generation,
    daysSurvived: 1,
    ticksSurvived: 0,
    vitals: { health: 100, hunger: 100, thirst: 100, temp: 100, energy: 100 },
    pos: { x: startX, y: startY },
    targetPos: null,
    env,
    currentAction: null,
    visitedTiles: { [`${startX},${startY}`]: true },
    recentAlerts: [],
    memory: {
      water: {}, safeFruit: {}, poisonFruit: {}, fire: {}, shelter: {}, predator: {},
      mushroom: {}, thorn: {}, herb: {}, creatures: {},
    },
    lastDamageCause: null,
    livesHistory: prevHistory,
    thinking: 'Etrafa bakıyor...',
    restTicks: 0,
    dailyStats: createDailyStats(1),
    yesterdayStats: null,
    totalSteps: 0,
  };
}

function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

function seasonBaseTemp(s: Season): number {
  return s === 'spring' ? 16 : s === 'summer' ? 28 : s === 'autumn' ? 12 : -3;
}
function weatherTempEffect(w: Weather): number {
  return w === 'clear' ? 0 : w === 'rain' ? -3 : w === 'snow' ? -8 : w === 'fog' ? -2 : -5;
}
function timeTempEffect(t: TimeOfDay): number {
  return t === 'day' ? 2 : t === 'dawn' ? -2 : t === 'dusk' ? -1 : -6;
}
function pickWeatherForSeason(season: Season): Weather {
  const r = Math.random();
  if (season === 'winter') {
    if (r < 0.4) return 'snow';
    if (r < 0.65) return 'clear';
    if (r < 0.85) return 'fog';
    return 'storm';
  }
  if (season === 'summer') {
    if (r < 0.65) return 'clear';
    if (r < 0.8) return 'rain';
    if (r < 0.95) return 'storm';
    return 'fog';
  }
  if (season === 'spring') {
    if (r < 0.5) return 'clear';
    if (r < 0.8) return 'rain';
    return 'fog';
  }
  if (r < 0.45) return 'clear';
  if (r < 0.75) return 'rain';
  if (r < 0.95) return 'fog';
  return 'storm';
}
function seasonOf(dayCount: number): Season {
  const s = Math.floor((dayCount - 1) / SEASON_CYCLE_DAYS) % 4;
  return (['spring', 'summer', 'autumn', 'winter'] as Season[])[s];
}

function senseEnvironment(st: SimulationState) {
  for (let dy = -SENSE_RADIUS; dy <= SENSE_RADIUS; dy++) {
    for (let dx = -SENSE_RADIUS; dx <= SENSE_RADIUS; dx++) {
      const x = st.pos.x + dx;
      const y = st.pos.y + dy;
      if (x < 0 || y < 0 || x >= WORLD_WIDTH || y >= WORLD_HEIGHT) continue;
      if (Math.abs(dx) + Math.abs(dy) > SENSE_RADIUS) continue;
      const tile = st.env.grid[y][x];
      const key = `${x},${y}`;
      if (tile === 'water') st.memory.water[key] = true;
      else if (tile === 'safe_fruit') st.memory.safeFruit[key] = true;
      else if (tile === 'poison_fruit') st.memory.poisonFruit[key] = true;
      else if (tile === 'fire') st.memory.fire[key] = true;
      else if (tile === 'shelter') st.memory.shelter[key] = true;
      else if (tile === 'predator') st.memory.predator[key] = true;
      else if (tile === 'mushroom') st.memory.mushroom[key] = true;
      else if (tile === 'thorn_bush') st.memory.thorn[key] = true;
      else if (tile === 'herb') st.memory.herb[key] = true;
    }
  }
  // Forget locations whose tile no longer exists (consumed fruits etc.)
  for (const key of Object.keys(st.memory.safeFruit)) {
    const [x, y] = key.split(',').map(Number);
    if (st.env.grid[y][x] !== 'safe_fruit') delete st.memory.safeFruit[key];
  }
  for (const key of Object.keys(st.memory.poisonFruit)) {
    const [x, y] = key.split(',').map(Number);
    if (st.env.grid[y][x] !== 'poison_fruit') delete st.memory.poisonFruit[key];
  }
  for (const key of Object.keys(st.memory.mushroom)) {
    const [x, y] = key.split(',').map(Number);
    if (st.env.grid[y][x] !== 'mushroom') delete st.memory.mushroom[key];
  }
  for (const key of Object.keys(st.memory.herb)) {
    const [x, y] = key.split(',').map(Number);
    if (st.env.grid[y][x] !== 'herb') delete st.memory.herb[key];
  }

  // Creature sensing — volatile per-tick (creatures move)
  st.memory.creatures = {};
  for (const c of st.env.creatures) {
    if (dist(c.pos, st.pos) <= SENSE_RADIUS) {
      st.memory.creatures[`${c.pos.x},${c.pos.y}`] = { kind: c.kind };
    }
  }
}

function moveCreatures(st: SimulationState) {
  for (const c of st.env.creatures) {
    c.moveCooldown--;
    if (c.moveCooldown > 0) continue;
    const info = CREATURE_INFO[c.kind];
    c.moveCooldown = info.baseCooldown + rndInt(2);

    let dx = 0, dy = 0;
    const d = dist(c.pos, st.pos);
    if (info.hostile && d <= info.huntRange) {
      // Hunt ADEM
      dx = Math.sign(st.pos.x - c.pos.x);
      dy = Math.sign(st.pos.y - c.pos.y);
      // pick the bigger axis
      if (Math.abs(st.pos.x - c.pos.x) < Math.abs(st.pos.y - c.pos.y)) dx = 0;
      else dy = 0;
    } else if (!info.hostile && info.fleeRange > 0 && d <= info.fleeRange) {
      // Flee ADEM
      dx = Math.sign(c.pos.x - st.pos.x);
      dy = Math.sign(c.pos.y - st.pos.y);
      if (Math.random() < 0.5) { dx = dx || (rndInt(3) - 1); }
      else { dy = dy || (rndInt(3) - 1); }
    } else {
      // Random wander
      const r = rndInt(5);
      if (r === 0) dx = 1; else if (r === 1) dx = -1;
      else if (r === 2) dy = 1; else if (r === 3) dy = -1;
    }

    const tx = clampN(c.pos.x + dx, 0, WORLD_WIDTH - 1);
    const ty = clampN(c.pos.y + dy, 0, WORLD_HEIGHT - 1);
    const targetTile = st.env.grid[ty][tx];
    if (targetTile !== 'water' && targetTile !== 'tree' && targetTile !== 'fire' && targetTile !== 'shelter') {
      // Avoid stacking creatures on same tile
      const occupied = st.env.creatures.some(other => other.id !== c.id && other.pos.x === tx && other.pos.y === ty);
      if (!occupied) c.pos = { x: tx, y: ty };
    }
  }
}

function nearestFromMemory(set: Record<string, true>, from: Position, avoid?: Record<string, true>): Position | null {
  let best: Position | null = null;
  let bestD = Infinity;
  for (const key of Object.keys(set)) {
    if (avoid && avoid[key]) continue;
    const [x, y] = key.split(',').map(Number);
    const d = Math.abs(x - from.x) + Math.abs(y - from.y);
    if (d < bestD) { bestD = d; best = { x, y }; }
  }
  return best;
}

function determineDeathCause(st: SimulationState): DeathCause {
  if (st.lastDamageCause) return st.lastDamageCause;
  const v = st.vitals;
  if (v.thirst < 10) return 'Susuzluk';
  if (v.hunger < 10) return 'Açlık';
  if (v.temp < 10) return 'Soğuk';
  if (v.energy < 5) return 'Yorgunluk';
  return 'Bilinmeyen';
}

export function tickSimulation(
  state: SimulationState,
  knowledge: KnowledgeBase,
  logs: EventLog[],
): { newState: SimulationState; newKnowledge: KnowledgeBase; newLogs: EventLog[] } {
  const st: SimulationState = {
    ...state,
    vitals: { ...state.vitals },
    env: {
      ...state.env,
      grid: state.env.grid.map((r) => [...r]),
      creatures: state.env.creatures.map((c) => ({ ...c, pos: { ...c.pos } })),
    },
    pos: { ...state.pos },
    visitedTiles: { ...state.visitedTiles },
    recentAlerts: [],
    memory: {
      water: { ...state.memory.water },
      safeFruit: { ...state.memory.safeFruit },
      poisonFruit: { ...state.memory.poisonFruit },
      fire: { ...state.memory.fire },
      shelter: { ...state.memory.shelter },
      predator: { ...state.memory.predator },
      mushroom: { ...state.memory.mushroom },
      thorn: { ...state.memory.thorn },
      herb: { ...state.memory.herb },
      creatures: { ...state.memory.creatures },
    },
    livesHistory: state.livesHistory,
    dailyStats: { ...state.dailyStats },
    yesterdayStats: state.yesterdayStats,
  };
  const kl = { ...knowledge };
  const lg = [...logs];

  const addLog = (text: string, type: EventLog['type']) => {
    const hours = Math.floor((st.env.timeCounter % TICKS_PER_DAY) / 10);
    const mins = Math.floor(((st.env.timeCounter % TICKS_PER_DAY) % 10) * 6);
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    lg.unshift({
      id: Math.random().toString(36).slice(2, 11),
      day: st.daysSurvived,
      time: timeStr,
      text,
      type,
    });
    if (lg.length > 100) lg.pop();
  };

  st.ticksSurvived++;
  st.env.timeCounter++;
  st.dailyStats.totalTicks++;

  // Day/season rollover
  if (st.env.timeCounter % TICKS_PER_DAY === 0) {
    // Snapshot stats for the just-completed day
    const prev: DailyStats = { ...st.dailyStats };
    addLog(
      `Gün ${st.daysSurvived} özeti: ${prev.steps} adım, ${prev.decisionCount} karar, ${prev.sleepTicks} uyku, ${prev.restTicks} dinlenme.`,
      'neutral',
    );
    st.daysSurvived++;
    st.yesterdayStats = prev;
    st.dailyStats = createDailyStats(st.daysSurvived);
    const newSeason = seasonOf(st.daysSurvived);
    if (newSeason !== st.env.season) {
      st.env.season = newSeason;
      const seasonNames: Record<Season, string> = {
        spring: 'İlkbahar', summer: 'Yaz', autumn: 'Sonbahar', winter: 'Kış',
      };
      addLog(`Mevsim değişti: ${seasonNames[newSeason]}`, 'neutral');
    }
  }

  // Time of day
  const timeMod = st.env.timeCounter % TICKS_PER_DAY;
  if (timeMod < 30) st.env.timeOfDay = 'dawn';
  else if (timeMod < 150) st.env.timeOfDay = 'day';
  else if (timeMod < 180) st.env.timeOfDay = 'dusk';
  else st.env.timeOfDay = 'night';

  // Weather smooth transition
  if (st.env.timeCounter % WEATHER_CHANGE_INTERVAL === 0) {
    const target = pickWeatherForSeason(st.env.season);
    if (target !== st.env.weather) {
      st.env.nextWeather = target;
      st.env.weatherProgress = 0;
    }
  }
  if (st.env.weatherProgress < 1) {
    st.env.weatherProgress = Math.min(1, st.env.weatherProgress + 1 / 60);
    if (st.env.weatherProgress >= 1) {
      st.env.weather = st.env.nextWeather;
      addLog(`Hava durumu: ${weatherLabel(st.env.weather)}`, 'neutral');
    }
  }

  // Ambient temperature
  const baseT = seasonBaseTemp(st.env.season);
  const wEffect = weatherTempEffect(st.env.weather) * (1 - st.env.weatherProgress) +
    weatherTempEffect(st.env.nextWeather) * st.env.weatherProgress;
  st.env.ambientTemp = Math.round((baseT + wEffect + timeTempEffect(st.env.timeOfDay)) * 10) / 10;

  // Move creatures (independent agents)
  moveCreatures(st);

  // Sense surroundings (memory)
  senseEnvironment(st);

  // === CREATURE INTERACTION (attack / observe) ===
  for (const c of st.env.creatures) {
    const info = CREATURE_INFO[c.kind];
    const d = dist(c.pos, st.pos);
    if (info.hostile && d <= info.attackRange) {
      const dmg = info.damagePerTick;
      st.vitals.health = clamp(st.vitals.health - dmg);
      st.lastDamageCause = 'Yırtıcı saldırısı';
      st.dailyStats.hostileEncounters++;
      st.memory.predator[`${c.pos.x},${c.pos.y}`] = true;
      addLog(`${info.label} saldırdı! Sağlık -${dmg}`, 'bad');
      const kk = `${c.kind}_flee`;
      const wasKnown = (kl[kk]?.confidence ?? 0) > 0;
      const before = kl[kk]?.confidence ?? 0;
      const updateKbAttack = () => {
        if (!kl[kk]) {
          kl[kk] = {
            situation: c.kind, action: 'flee',
            outcomeText: `${info.label} saldırgandır, kaçılmalı`,
            confidence: 0.3, deltaHealth: -dmg, deltaHunger: 0, deltaThirst: 0, deltaTemp: 0, deltaEnergy: 0,
            occurrences: 1,
          };
        } else {
          kl[kk].occurrences++;
          kl[kk].confidence = Math.min(1, kl[kk].confidence + 0.12);
        }
      };
      updateKbAttack();
      if (!wasKnown) addLog(`${info.label} hakkında yeni bilgi: tehlikeli!`, 'neutral');
      else if (before < 0.5) addLog(`${info.label} tehlikesi onaylandı.`, 'neutral');
    } else if (!info.hostile && d <= 2) {
      // Safe-observation chance
      if (Math.random() < 0.08) {
        const kk = `${c.kind}_observe`;
        const wasKnown = !!kl[kk];
        if (!kl[kk]) {
          kl[kk] = {
            situation: c.kind, action: 'observe',
            outcomeText: `${info.label} zararsız bir hayvandır`,
            confidence: 0.25, deltaHealth: 0, deltaHunger: 0, deltaThirst: 0, deltaTemp: 0, deltaEnergy: 0,
            occurrences: 1,
          };
        } else {
          kl[kk].occurrences++;
          kl[kk].confidence = Math.min(1, kl[kk].confidence + 0.06);
        }
        st.dailyStats.meetsObserved++;
        if (!wasKnown) addLog(`${info.label} gözlemlendi: zararsız görünüyor.`, 'good');
      }
    }
  }

  // Vitals decay
  st.vitals.hunger -= 0.32;
  st.vitals.thirst -= 0.5;
  st.vitals.energy -= 0.2;

  if (st.env.ambientTemp < 8) st.vitals.temp -= 0.95;
  else if (st.env.ambientTemp < 14) st.vitals.temp -= 0.4;
  else if (st.env.ambientTemp > 32) st.vitals.temp -= 0.55;
  else if (st.env.ambientTemp > 26) st.vitals.temp -= 0.18;
  else st.vitals.temp += 0.08;

  if (st.env.timeOfDay === 'night') st.vitals.temp -= 0.25;
  if (st.env.weather === 'rain') st.vitals.temp -= 0.15;
  if (st.env.weather === 'storm') st.vitals.temp -= 0.35;
  if (st.env.weather === 'snow') st.vitals.temp -= 0.55;

  // Health damage with cause tracking — most damaging source wins
  const damages: { cause: DeathCause; amount: number }[] = [];
  if (st.vitals.hunger < 18) damages.push({ cause: 'Açlık', amount: 0.55 });
  if (st.vitals.thirst < 18) damages.push({ cause: 'Susuzluk', amount: 0.85 });
  if (st.vitals.temp < 18) damages.push({ cause: 'Soğuk', amount: 0.7 });
  if (st.vitals.energy < 8) damages.push({ cause: 'Yorgunluk', amount: 0.18 });
  if (damages.length > 0) {
    let totalDmg = 0;
    let primary = damages[0];
    for (const d of damages) {
      totalDmg += d.amount;
      if (d.amount > primary.amount) primary = d;
    }
    st.vitals.health -= totalDmg;
    st.lastDamageCause = primary.cause;
  }

  // Update body alerts
  const alerts: BodyAlert[] = [];
  if (st.vitals.thirst < 35) alerts.push('thirst');
  if (st.vitals.hunger < 35) alerts.push('hunger');
  if (st.vitals.temp < 35) alerts.push('cold');
  if (st.env.ambientTemp > 30) alerts.push('hot');
  if (st.vitals.energy < 25) alerts.push('fatigue');
  if (st.vitals.health < 40) alerts.push('low_health');
  st.recentAlerts = alerts;

  st.vitals = {
    health: clamp(st.vitals.health),
    hunger: clamp(st.vitals.hunger),
    thirst: clamp(st.vitals.thirst),
    temp: clamp(st.vitals.temp),
    energy: clamp(st.vitals.energy),
  };

  // DEATH
  if (st.vitals.health <= 0) {
    const cause = determineDeathCause(st);
    const knowledgeCount = Object.keys(kl).length;
    const record: LifeRecord = {
      generation: st.generation,
      days: st.daysSurvived,
      cause,
      knowledgeAtDeath: knowledgeCount,
    };
    const newHistory = [...st.livesHistory, record];
    addLog(
      `ÖLÜM — Yaşam #${st.generation} ${st.daysSurvived} gün sürdü. Sebep: ${cause}. (${knowledgeCount} bilgi edinmişti)`,
      'death',
    );
    addLog(`Yaşam #${st.generation + 1} başladı. Yeni bir ADEM uyandı.`, 'neutral');
    return { newState: createInitialState(st.generation + 1, newHistory), newKnowledge: kl, newLogs: lg };
  }

  // === DECISION MAKING ===
  // If currently resting (in shelter at night/storm), keep resting until restored
  if (st.restTicks > 0) {
    st.restTicks--;
    st.vitals.energy = clamp(st.vitals.energy + 1.4);
    st.vitals.temp = clamp(st.vitals.temp + 0.4);
    const isNight = st.env.timeOfDay === 'night';
    if (isNight) {
      st.thinking = 'Uyuyor...';
      st.dailyStats.sleepTicks++;
    } else {
      st.thinking = 'Dinleniyor...';
      st.dailyStats.restTicks++;
    }
    if (st.restTicks === 0) {
      addLog(`Uyandı. Enerji ${st.vitals.energy.toFixed(0)}`, 'neutral');
    }
    st.vitals = {
      health: clamp(st.vitals.health), hunger: clamp(st.vitals.hunger),
      thirst: clamp(st.vitals.thirst), temp: clamp(st.vitals.temp), energy: clamp(st.vitals.energy),
    };
    return { newState: st, newKnowledge: kl, newLogs: lg };
  }

  if (!st.targetPos || (st.pos.x === st.targetPos.x && st.pos.y === st.targetPos.y)) {
    // Decide what to do
    type Need = 'thirst' | 'hunger' | 'temp' | 'energy' | 'shelter_night' | 'explore';
    const dangerousWeather = st.env.timeOfDay === 'night' || st.env.weather === 'storm' || st.env.weather === 'snow';
    const candidates: { n: Need; score: number }[] = [
      { n: 'thirst', score: URGENT.thirst - st.vitals.thirst },
      { n: 'hunger', score: URGENT.hunger - st.vitals.hunger },
      { n: 'temp', score: URGENT.temp - st.vitals.temp },
      { n: 'energy', score: URGENT.energy - st.vitals.energy },
    ];
    if (dangerousWeather && st.vitals.energy < SATISFIED.energy) {
      candidates.push({ n: 'shelter_night', score: 25 });
    }
    let need: Need = 'explore';
    let priority = -Infinity;
    for (const c of candidates) {
      if (c.score > priority) { priority = c.score; need = c.n; }
    }

    let target: Position | null = null;
    let thinking = '';

    const knownPoison = (kl['kırmızı_meyve_eat_poison']?.confidence ?? 0) > 0.4;
    const knownMushroomSafe = (kl['mantar_eat_safe']?.confidence ?? 0) > 0.4;

    if (need === 'thirst' && priority > 0) {
      target = nearestFromMemory(st.memory.water, st.pos);
      thinking = target ? 'Bildiğim su kaynağına gidiyorum.' : 'Su arıyorum.';
    } else if (need === 'hunger' && priority > 0) {
      target = nearestFromMemory(st.memory.safeFruit, st.pos);
      if (target) thinking = 'Güvenli meyveye gidiyorum.';
      else if (knownMushroomSafe && Object.keys(st.memory.mushroom).length > 0) {
        target = nearestFromMemory(st.memory.mushroom, st.pos);
        thinking = 'Bildiğim mantara gidiyorum.';
      } else if (!knownPoison && Object.keys(st.memory.poisonFruit).length > 0) {
        // Don't yet know it's bad — try one
        target = nearestFromMemory(st.memory.poisonFruit, st.pos);
        thinking = 'Yeni meyveyi denemeye gidiyorum.';
      } else if (!knownMushroomSafe && Object.keys(st.memory.mushroom).length > 0) {
        target = nearestFromMemory(st.memory.mushroom, st.pos);
        thinking = 'Yeni mantarı denemeye gidiyorum.';
      } else thinking = 'Yiyecek arıyorum.';
    } else if (need === 'temp' && priority > 0) {
      target = nearestFromMemory(st.memory.fire, st.pos) || nearestFromMemory(st.memory.shelter, st.pos);
      thinking = target ? 'Isınmaya gidiyorum.' : 'Sıcak bir yer arıyorum.';
    } else if (need === 'energy' && priority > 0) {
      target = nearestFromMemory(st.memory.shelter, st.pos);
      thinking = target ? 'Dinlenmeye gidiyorum.' : 'Barınak arıyorum.';
    } else if (need === 'shelter_night') {
      target = nearestFromMemory(st.memory.shelter, st.pos);
      thinking = target ? (st.env.timeOfDay === 'night' ? 'Geceyi geçirmek için barınağa gidiyorum.' : 'Fırtınadan kaçınıyorum.') : 'Sığınak arıyorum.';
    }

    if (!target) {
      // Explore — pick unvisited area, prefer toward less-explored direction
      let attempts = 0;
      while (attempts < 22) {
        const tx = clampN(st.pos.x + rndInt(21) - 10, 0, WORLD_WIDTH - 1);
        const ty = clampN(st.pos.y + rndInt(21) - 10, 0, WORLD_HEIGHT - 1);
        const k = `${tx},${ty}`;
        if (!st.visitedTiles[k] && !st.memory.predator[k]) { target = { x: tx, y: ty }; break; }
        attempts++;
      }
      if (!target) {
        target = {
          x: clampN(st.pos.x + rndInt(9) - 4, 0, WORLD_WIDTH - 1),
          y: clampN(st.pos.y + rndInt(9) - 4, 0, WORLD_HEIGHT - 1),
        };
      }
      if (!thinking) thinking = 'Çevreyi keşfediyorum.';
    }

    st.targetPos = target;
    st.thinking = thinking;
    st.currentAction = need === 'thirst' ? 'drink' :
      need === 'hunger' ? 'eat_safe' :
      need === 'temp' ? 'warm_up' :
      need === 'energy' || need === 'shelter_night' ? 'rest' :
      'explore';
    st.dailyStats.decisionCount++;
    st.dailyStats.thinkTicks++;
    if (need === 'explore') st.dailyStats.exploreTicks++;
  } else {
    // No new decision; ADEM is en route — count as thinking time
    st.dailyStats.thinkTicks++;
  }

  // === MOVEMENT ===
  // Try to step toward target, but avoid stepping onto known dangers (predator, known poison, hostile creature, known thorn)
  if (st.targetPos) {
    const stepCandidates: Position[] = [];
    const dx = Math.sign(st.targetPos.x - st.pos.x);
    const dy = Math.sign(st.targetPos.y - st.pos.y);
    if (dx !== 0) stepCandidates.push({ x: st.pos.x + dx, y: st.pos.y });
    if (dy !== 0) stepCandidates.push({ x: st.pos.x, y: st.pos.y + dy });
    // perpendicular fallbacks
    if (dx !== 0) {
      stepCandidates.push({ x: st.pos.x, y: st.pos.y + 1 });
      stepCandidates.push({ x: st.pos.x, y: st.pos.y - 1 });
    }
    if (dy !== 0) {
      stepCandidates.push({ x: st.pos.x + 1, y: st.pos.y });
      stepCandidates.push({ x: st.pos.x - 1, y: st.pos.y });
    }

    const knownPoison = (kl['kırmızı_meyve_eat_poison']?.confidence ?? 0) > 0.4;
    const knownThorn = (kl['dikenli_bitki_step_damage']?.confidence ?? 0) > 0.3;
    const goingToEat = st.currentAction === 'eat_safe' && st.targetPos;

    // Build set of tiles adjacent-or-on a known hostile creature
    const dangerTiles: Record<string, true> = {};
    for (const cr of st.env.creatures) {
      const info = CREATURE_INFO[cr.kind];
      const known = (kl[`${cr.kind}_flee`]?.confidence ?? 0) > 0.3;
      if (info.hostile && known) {
        for (let oy = -1; oy <= 1; oy++)
          for (let ox = -1; ox <= 1; ox++)
            dangerTiles[`${cr.pos.x + ox},${cr.pos.y + oy}`] = true;
      } else if (info.hostile) {
        // Even if unknown, the tile the creature is on is dangerous
        dangerTiles[`${cr.pos.x},${cr.pos.y}`] = true;
      }
    }

    const startPos = st.pos;
    for (const c of stepCandidates) {
      if (c.x < 0 || c.y < 0 || c.x >= WORLD_WIDTH || c.y >= WORLD_HEIGHT) continue;
      const k = `${c.x},${c.y}`;
      const cTile = st.env.grid[c.y][c.x];
      if (cTile === 'water') continue;
      // Avoid predator we know about
      if (st.memory.predator[k]) continue;
      // Avoid known hostile creatures
      if (dangerTiles[k]) continue;
      // Avoid known-poison tiles unless this IS the target we picked intentionally
      if (knownPoison && st.memory.poisonFruit[k] && !(goingToEat && st.targetPos && st.targetPos.x === c.x && st.targetPos.y === c.y)) continue;
      // Avoid known thorns
      if (knownThorn && st.memory.thorn[k]) continue;
      st.pos = c;
      break;
    }
    if (st.pos.x !== startPos.x || st.pos.y !== startPos.y) {
      st.dailyStats.steps++;
      st.totalSteps++;
    }
    st.visitedTiles[`${st.pos.x},${st.pos.y}`] = true;
  }

  // === INTERACTION ===
  const tile = st.env.grid[st.pos.y][st.pos.x];
  let outcome = '';
  let outcomeType: EventLog['type'] = 'neutral';
  let interacted = false;

  const updateKb = (
    situation: string, action: Action, text: string,
    dh: number, dhu: number, dt: number, dte: number, de: number,
  ) => {
    const key = `${situation}_${action}`;
    if (!kl[key]) {
      kl[key] = {
        situation, action, outcomeText: text,
        confidence: 0.18,
        deltaHealth: dh, deltaHunger: dhu, deltaThirst: dt, deltaTemp: dte, deltaEnergy: de,
        occurrences: 1,
      };
    } else {
      kl[key].occurrences++;
      kl[key].confidence = Math.min(1, kl[key].confidence + 0.07);
    }
  };

  if (tile === 'water' && st.vitals.thirst < SATISFIED.thirst) {
    const before = st.vitals.thirst;
    st.vitals.thirst = clamp(before + 38);
    const gained = Math.round(st.vitals.thirst - before);
    if (gained > 0) {
      outcome = `Su içti. Susuzluk +${gained}`;
      outcomeType = 'good';
      updateKb('su', 'drink', 'Su susuzluğu giderir', 0, 0, gained, 0, 0);
      interacted = true;
    }
    st.targetPos = null;
  } else if (tile === 'safe_fruit' && st.vitals.hunger < SATISFIED.hunger) {
    const before = st.vitals.hunger;
    st.vitals.hunger = clamp(before + 30);
    const gained = Math.round(st.vitals.hunger - before);
    st.vitals.health = clamp(st.vitals.health + 3);
    st.env.grid[st.pos.y][st.pos.x] = 'empty';
    delete st.memory.safeFruit[`${st.pos.x},${st.pos.y}`];
    outcome = `Yeşil meyve yedi. Açlık +${gained}, Sağlık +3`;
    outcomeType = 'good';
    updateKb('meyve', 'eat_safe', 'Yeşil meyve açlığı giderir', 3, gained, 0, 0, 0);
    interacted = true;
    st.targetPos = null;
  } else if (tile === 'poison_fruit') {
    // Only eat if we don't already know it's poison, AND we're hungry
    const knownPoison = (kl['kırmızı_meyve_eat_poison']?.confidence ?? 0) > 0.4;
    if (!knownPoison && st.vitals.hunger < SATISFIED.hunger) {
      st.vitals.hunger = clamp(st.vitals.hunger + 8);
      st.vitals.health = clamp(st.vitals.health - 22);
      st.env.grid[st.pos.y][st.pos.x] = 'empty';
      st.memory.poisonFruit[`${st.pos.x},${st.pos.y}`] = true;
      outcome = 'Kırmızı meyve yedi → zehirlendi! Sağlık -22';
      outcomeType = 'bad';
      updateKb('kırmızı_meyve', 'eat_poison', 'Kırmızı meyve zehirler', -22, 8, 0, 0, 0);
      st.lastDamageCause = 'Zehirlenme';
      interacted = true;
    }
    st.targetPos = null;
  } else if (tile === 'fire' && st.vitals.temp < SATISFIED.temp) {
    const before = st.vitals.temp;
    st.vitals.temp = clamp(before + 28);
    const gained = Math.round(st.vitals.temp - before);
    if (gained > 0) {
      outcome = `Ateşin yanında ısındı. Sıcaklık +${gained}`;
      outcomeType = 'good';
      updateKb('ateş', 'warm_up', 'Ateş ısıtır', 0, 0, 0, gained, 0);
      interacted = true;
    }
    st.targetPos = null;
  } else if (tile === 'shelter') {
    const tiredOrNight = st.vitals.energy < SATISFIED.energy ||
      st.env.timeOfDay === 'night' || st.env.weather === 'storm' || st.env.weather === 'snow';
    if (tiredOrNight) {
      st.restTicks = 12 + rndInt(10);
      st.vitals.energy = clamp(st.vitals.energy + 5);
      st.vitals.temp = clamp(st.vitals.temp + 4);
      outcome = 'Barınağa girip uyumaya başladı.';
      outcomeType = 'good';
      updateKb('barınak', 'rest', 'Barınak dinlendirir', 0, 0, 0, 4, 5);
      interacted = true;
      st.targetPos = null;
    }
  } else if (tile === 'predator') {
    st.vitals.health = clamp(st.vitals.health - 35);
    outcome = 'Yırtıcıya yakalandı. Sağlık -35';
    outcomeType = 'bad';
    updateKb('yırtıcı', 'flee', 'Yırtıcı zarar verir', -35, 0, 0, 0, 0);
    st.memory.predator[`${st.pos.x},${st.pos.y}`] = true;
    st.lastDamageCause = 'Yırtıcı saldırısı';
    interacted = true;
    st.targetPos = null;
  } else if (tile === 'mushroom' && st.vitals.hunger < SATISFIED.hunger) {
    const before = st.vitals.hunger;
    st.vitals.hunger = clamp(before + 22);
    const gained = Math.round(st.vitals.hunger - before);
    st.vitals.health = clamp(st.vitals.health + 2);
    st.env.grid[st.pos.y][st.pos.x] = 'empty';
    delete st.memory.mushroom[`${st.pos.x},${st.pos.y}`];
    outcome = `Mantar yedi. Açlık +${gained}, Sağlık +2`;
    outcomeType = 'good';
    updateKb('mantar', 'eat_safe', 'Mantar açlığı giderir', 2, gained, 0, 0, 0);
    interacted = true;
    st.targetPos = null;
  } else if (tile === 'herb' && (st.vitals.health < 75 || st.vitals.energy < 50)) {
    st.vitals.health = clamp(st.vitals.health + 14);
    st.vitals.energy = clamp(st.vitals.energy + 8);
    st.env.grid[st.pos.y][st.pos.x] = 'empty';
    delete st.memory.herb[`${st.pos.x},${st.pos.y}`];
    outcome = 'Şifalı bitki yedi. Sağlık +14, Enerji +8';
    outcomeType = 'good';
    updateKb('şifalı_bitki', 'eat_safe', 'Şifalı bitki yaraları iyileştirir', 14, 0, 0, 0, 8);
    interacted = true;
    st.targetPos = null;
  } else if (tile === 'thorn_bush') {
    const knownThorn = (kl['dikenli_bitki_step_damage']?.confidence ?? 0) > 0.3;
    if (!knownThorn) {
      st.vitals.health = clamp(st.vitals.health - 8);
      outcome = 'Dikenli çalıya bastı. Sağlık -8';
      outcomeType = 'bad';
      updateKb('dikenli_bitki', 'step_damage', 'Dikenli bitki bastıkça zarar verir', -8, 0, 0, 0, 0);
      st.memory.thorn[`${st.pos.x},${st.pos.y}`] = true;
      interacted = true;
    }
    st.targetPos = null;
  }

  if (interacted) addLog(outcome, outcomeType);

  // After death from interaction (poison/predator)
  if (st.vitals.health <= 0) {
    const cause = determineDeathCause(st);
    const knowledgeCount = Object.keys(kl).length;
    const record: LifeRecord = {
      generation: st.generation,
      days: st.daysSurvived,
      cause,
      knowledgeAtDeath: knowledgeCount,
    };
    const newHistory = [...st.livesHistory, record];
    addLog(
      `ÖLÜM — Yaşam #${st.generation} ${st.daysSurvived} gün sürdü. Sebep: ${cause}. (${knowledgeCount} bilgi edinmişti)`,
      'death',
    );
    addLog(`Yaşam #${st.generation + 1} başladı. Yeni bir ADEM uyandı.`, 'neutral');
    return { newState: createInitialState(st.generation + 1, newHistory), newKnowledge: kl, newLogs: lg };
  }

  st.vitals = {
    health: clamp(st.vitals.health),
    hunger: clamp(st.vitals.hunger),
    thirst: clamp(st.vitals.thirst),
    temp: clamp(st.vitals.temp),
    energy: clamp(st.vitals.energy),
  };

  return { newState: st, newKnowledge: kl, newLogs: lg };
}

export function weatherLabel(w: Weather): string {
  switch (w) {
    case 'clear': return 'Açık';
    case 'rain': return 'Yağmur';
    case 'snow': return 'Kar';
    case 'fog': return 'Sis';
    case 'storm': return 'Fırtına';
  }
}
export function seasonLabel(s: Season): string {
  switch (s) {
    case 'spring': return 'İlkbahar';
    case 'summer': return 'Yaz';
    case 'autumn': return 'Sonbahar';
    case 'winter': return 'Kış';
  }
}
export function timeOfDayLabel(t: TimeOfDay): string {
  switch (t) {
    case 'day': return 'Gündüz';
    case 'night': return 'Gece';
    case 'dawn': return 'Şafak';
    case 'dusk': return 'Alacakaranlık';
  }
}
