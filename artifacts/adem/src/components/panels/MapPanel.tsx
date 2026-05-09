import { useEffect, useRef, useState } from 'react';
import {
  SimulationState,
  KnowledgeBase,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  weatherLabel,
  CREATURE_INFO,
  getCoordinates,
  BiomeType
} from '../../lib/simulation';
import { HelpCircle, X, Package, Brain, ShieldCheck, Compass } from 'lucide-react';

const BASE_TILE_SIZE = 32;

const SURVIVAL_TIPS = [
  "Donmamak için ateş yak.",
  "Zehirli (kırmızı) meyvelerden kaçın.",
  "Su kenarında dinlenmek susuzluğu giderir.",
  "Kayalıklardan inerken dikkatli ol, düşebilirsin.",
  "Barınak inşa etmek fırtınalarda hayatta kalmanı sağlar.",
  "Mantar yemek risklidir ama bazen tek seçenektir.",
  "Alet yapmak (Krok-Vara) verimliliği artırır.",
  "Vücut ısın 30°C altına düşerse hipotermi başlar.",
  "Şifalı bitkiler zehirlenme etkisini azaltır."
];

function clampN(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const seasonLabel = (season: string) => {
  const map: Record<string, string> = { spring: 'İlkbahar', summer: 'Yaz', autumn: 'Sonbahar', winter: 'Kış' };
  return map[season] || season;
};

const getNextSeason = (season: string) => {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const next = seasons[(seasons.indexOf(season) + 1) % 4];
  return seasonLabel(next);
};

const timeOfDayLabel = (time: string) => {
  const map: Record<string, string> = { dawn: 'GÜN DOĞUMU', day: 'GÜNDÜZ', dusk: 'GÜN BATIMI', night: 'GECE' };
  return map[time] || time;
};

export function MapPanel({ state, knowledge }: { state: SimulationState, knowledge: KnowledgeBase }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [zoom, setZoom] = useState(1);
  const camRef = useRef<{ x: number; y: number }>({ x: state.adem.pos.x, y: state.adem.pos.y });
  const rafRef = useRef<number | undefined>(undefined);
  
  const TILE_SIZE = BASE_TILE_SIZE * zoom;

  const [currentTip, setCurrentTip] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<{ x: number, y: number, tile: string } | null>(null);

  const [clickedTile, setClickedTile] = useState<{ x: number, y: number, tile: string } | null>(null);

  const distBetween = Math.sqrt(
    Math.pow(state.adem.pos.x - state.havva.pos.x, 2) + 
    Math.pow(state.adem.pos.y - state.havva.pos.y, 2)
  ).toFixed(1);

  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => clampN(prev - e.deltaY * 0.001, 0.5, 3.0));
  };

  const handleMouseClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const camX = camRef.current.x;
    const camY = camRef.current.y;
    const tileStartX = Math.floor(camX);
    const tileStartY = Math.floor(camY);
    const offsetX = -(camX - tileStartX) * TILE_SIZE;
    const offsetY = -(camY - tileStartY) * TILE_SIZE;

    const dx = Math.floor((x - offsetX) / TILE_SIZE);
    const dy = Math.floor((y - offsetY) / TILE_SIZE);
    const wx = tileStartX + dx;
    const wy = tileStartY + dy;

    if (wx >= 0 && wy >= 0 && wx < WORLD_WIDTH && wy < WORLD_HEIGHT) {
      setClickedTile({ x: wx, y: wy, tile: state.env.grid[wy][wx] });
    } else {
      setClickedTile(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tilesX = Math.ceil(size.w / TILE_SIZE);
    const tilesY = Math.ceil(size.h / TILE_SIZE);
    
    // Reverse calculation of wx/wy
    const camX = camRef.current.x;
    const camY = camRef.current.y;
    const tileStartX = Math.floor(camX);
    const tileStartY = Math.floor(camY);
    const offsetX = -(camX - tileStartX) * TILE_SIZE;
    const offsetY = -(camY - tileStartY) * TILE_SIZE;

    const dx = Math.floor((x - offsetX) / TILE_SIZE);
    const dy = Math.floor((y - offsetY) / TILE_SIZE);
    const wx = tileStartX + dx;
    const wy = tileStartY + dy;

    if (wx >= 0 && wy >= 0 && wx < WORLD_WIDTH && wy < WORLD_HEIGHT) {
      setHoveredTile({ x: wx, y: wy, tile: state.env.grid[wy][wx] });
    } else {
      setHoveredTile(null);
    }
  };

  useEffect(() => {
    // Show a tip every now and then
    const interval = setInterval(() => {
      if (Math.random() < 0.15 && !showTip && state.daysSurvived === 1) {
        setCurrentTip(SURVIVAL_TIPS[Math.floor(Math.random() * SURVIVAL_TIPS.length)]);
        setShowTip(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [showTip, state.daysSurvived]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const r = e.contentRect;
        setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: disable alpha if possible, but map has overlays, maybe keep default or don't specify
    if (!ctx) return;


    canvas.width = size.w;
    canvas.height = size.h;

    const tilesX = Math.ceil(size.w / TILE_SIZE);
    const tilesY = Math.ceil(size.h / TILE_SIZE);

    const draw = () => {
      // Smoothly interpolate camera toward ADEM
      const targetCamX = clampN(state.adem.pos.x - tilesX / 2 + 0.5, 0, Math.max(0, WORLD_WIDTH - tilesX));
      const targetCamY = clampN(state.adem.pos.y - tilesY / 2 + 0.5, 0, Math.max(0, WORLD_HEIGHT - tilesY));
      camRef.current.x += (targetCamX - camRef.current.x) * 0.12;
      camRef.current.y += (targetCamY - camRef.current.y) * 0.12;

      const camX = camRef.current.x;
      const camY = camRef.current.y;

      const tileStartX = Math.floor(camX);
      const tileStartY = Math.floor(camY);
      const offsetX = -(camX - tileStartX) * TILE_SIZE;
      const offsetY = -(camY - tileStartY) * TILE_SIZE;

      // Draw Biomes first
      for (let dy = -1; dy <= tilesY + 1; dy++) {
        for (let dx = -1; dx <= tilesX + 1; dx++) {
          const wx = tileStartX + dx;
          const wy = tileStartY + dy;
          if (wx < 0 || wy < 0 || wx >= WORLD_WIDTH || wy >= WORLD_HEIGHT) continue;
          const biome = stateRef.current.env.biomes[wy][wx];
          const px = dx * TILE_SIZE + offsetX;
          const py = dy * TILE_SIZE + offsetY;

          let biomeFill = '#172023';
          if (biome === 'tundra') biomeFill = '#1c262b';
          else if (biome === 'desert') biomeFill = '#2b261c';
          else if (biome === 'jungle') biomeFill = '#1c2b1e';
          else if (biome === 'volcanic') biomeFill = '#2b1c1c';
          
          ctx.fillStyle = biomeFill;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          
          // Apply Height Shading (Topography)
          const h = stateRef.current.env.heights[wy][wx];
          if (h > 5) {
             const hAlpha = Math.min(0.4, (h - 5) / 40);
             ctx.fillStyle = `rgba(255, 255, 255, ${hAlpha})`;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          } else if (h < 5) {
             const hAlpha = Math.min(0.3, (5 - h) / 10);
             ctx.fillStyle = `rgba(0, 0, 0, ${hAlpha})`;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // Draw visible tile range
      for (let dy = -1; dy <= tilesY + 1; dy++) {
        for (let dx = -1; dx <= tilesX + 1; dx++) {
          const wx = tileStartX + dx;
          const wy = tileStartY + dy;
          if (wx < 0 || wy < 0 || wx >= WORLD_WIDTH || wy >= WORLD_HEIGHT) continue;
          const tile = stateRef.current.env.grid[wy][wx];
          const px = dx * TILE_SIZE + offsetX;
          const py = dy * TILE_SIZE + offsetY;

          // Base tile (slight seasonal tint)
          let baseFill = '#172023';
          if (stateRef.current.env.season === 'autumn') baseFill = '#1d1a16';
          else if (stateRef.current.env.season === 'winter') baseFill = '#1c2228';
          else if (stateRef.current.env.season === 'summer') baseFill = '#161e1a';
          ctx.fillStyle = baseFill;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Visited cell hint
          const visited = stateRef.current.adem.visitedTiles[`${wx},${wy}`] || stateRef.current.havva.visitedTiles[`${wx},${wy}`];
          if (visited) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
          
          if (tile === 'volcano') {
            ctx.fillStyle = '#3a1a1a';
            ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 4 + Math.sin(Date.now()/200)*2, 0, Math.PI*2);
            ctx.fill();
          } else if (tile === 'cave') {
            ctx.fillStyle = '#0f0f0f';
            ctx.beginPath();
            ctx.ellipse(px + TILE_SIZE/2, py + TILE_SIZE/2 + 2, 8, 5, 0, 0, Math.PI*2);
            ctx.fill();
          } else if (tile === 'water') {
            ctx.fillStyle = '#2b6b7a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(px + 4, py + 4, TILE_SIZE - 9, 1);
          } else if (tile === 'tree') {
            ctx.fillStyle = stateRef.current.env.season === 'autumn' ? '#7a5a2a' :
              stateRef.current.env.season === 'winter' ? '#3a4a45' : '#2a4a35';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 + 6, 2, 4);
          } else if (tile === 'safe_fruit') {
            ctx.fillStyle = '#4a7c59';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 1, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 'poison_fruit') {
            ctx.fillStyle = '#c54b5c';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 1, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 'cooked_meat') {
            ctx.fillStyle = '#8b4513'; // Saddle brown for cooked meat
            ctx.beginPath();
            ctx.ellipse(px + TILE_SIZE/2, py + TILE_SIZE/2, 6, 4, 0, 0, Math.PI*2);
            ctx.fill();
            // A small bone detail
            ctx.fillStyle = '#eaddcf';
            ctx.fillRect(px + TILE_SIZE/2 - 7, py + TILE_SIZE/2 - 1, 14, 2);
          } else if (tile === 'stone') {
            // Mountain/Peak visual
            ctx.fillStyle = '#5a6b70';
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 4);
            ctx.lineTo(px + TILE_SIZE - 4, py + TILE_SIZE - 4);
            ctx.lineTo(px + 4, py + TILE_SIZE - 4);
            ctx.closePath();
            ctx.fill();
            // Snow/Light on peak
            ctx.fillStyle = '#a0acb0';
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 4);
            ctx.lineTo(px + TILE_SIZE / 2 + 3, py + 8);
            ctx.lineTo(px + TILE_SIZE / 2 - 3, py + 8);
            ctx.closePath();
            ctx.fill();
          } else if (tile === 'toxic_swamp') {
            // Animated swamp look
            const pulse = Math.sin(Date.now() / 400 + wx + wy) * 0.1;
            ctx.fillStyle = `rgba(130, 80, 180, ${0.4 + pulse})`;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            
            ctx.fillStyle = 'rgba(70, 255, 90, 0.4)'; // glowing toxic spores
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2 + Math.sin(Date.now()/500)*3, py + TILE_SIZE / 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 4, py + TILE_SIZE / 1.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 'fire') {
            ctx.fillStyle = '#d48a4c';
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 7);
            ctx.lineTo(px + TILE_SIZE - 7, py + TILE_SIZE - 7);
            ctx.lineTo(px + 7, py + TILE_SIZE - 7);
            ctx.fill();
            ctx.fillStyle = '#f0c878';
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 14);
            ctx.lineTo(px + TILE_SIZE - 11, py + TILE_SIZE - 9);
            ctx.lineTo(px + 11, py + TILE_SIZE - 9);
            ctx.fill();
          } else if (tile === 'shelter') {
            ctx.fillStyle = '#8a7a6c';
            ctx.fillRect(px + 4, py + 10, TILE_SIZE - 8, TILE_SIZE - 14);
            ctx.fillStyle = '#a09080';
            ctx.beginPath();
            ctx.moveTo(px + 2, py + 11);
            ctx.lineTo(px + TILE_SIZE / 2, py + 4);
            ctx.lineTo(px + TILE_SIZE - 2, py + 11);
            ctx.fill();
          } else if (tile === 'predator') {
            ctx.strokeStyle = '#a03040';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + 6, py + 6);
            ctx.lineTo(px + TILE_SIZE - 6, py + TILE_SIZE - 6);
            ctx.moveTo(px + TILE_SIZE - 6, py + 6);
            ctx.lineTo(px + 6, py + TILE_SIZE - 6);
            ctx.stroke();
            ctx.fillStyle = 'rgba(160,48,64,0.2)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          } else if (tile === 'mushroom') {
            // Mushroom: cap + stem
            ctx.fillStyle = '#bf8c5f';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + 13, 6, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#e2cda7';
            ctx.fillRect(px + TILE_SIZE / 2 - 2, py + 13, 4, 7);
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2 - 2, py + 11, 1, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 'thorn_bush') {
            // Thorn bush: spiky shape
            ctx.fillStyle = '#5a4a35';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8a7050';
            ctx.lineWidth = 1.2;
            for (let s = 0; s < 6; s++) {
              const a = (s / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(px + TILE_SIZE / 2 + Math.cos(a) * 4, py + TILE_SIZE / 2 + Math.sin(a) * 4);
              ctx.lineTo(px + TILE_SIZE / 2 + Math.cos(a) * 10, py + TILE_SIZE / 2 + Math.sin(a) * 10);
              ctx.stroke();
            }
          } else if (tile === 'havva') {
            // Havva character rendering
            ctx.fillStyle = '#d475b4'; 
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f0a5d4';
            ctx.fillRect(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 1, 2, 2);
          } else if (tile === 'herb') {
            // Healing herb: small green leaves
            ctx.fillStyle = '#7fbe6f';
            ctx.beginPath();
            ctx.ellipse(px + TILE_SIZE / 2 - 3, py + TILE_SIZE / 2, 3, 5, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + TILE_SIZE / 2 + 3, py + TILE_SIZE / 2, 3, 5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw creatures
      for (const cr of stateRef.current.env.creatures) {
        const cpx = (cr.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
        const cpy = (cr.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
        if (cpx < -TILE_SIZE || cpx > canvas.width + TILE_SIZE || cpy < -TILE_SIZE || cpy > canvas.height + TILE_SIZE) continue;
        drawCreature(ctx, cr, cpx, cpy);
      }

      // Time overlay
      let overlayColor = 'rgba(0,0,0,0)';
      if (stateRef.current.env.timeOfDay === 'night') overlayColor = 'rgba(8, 14, 28, 0.55)';
      else if (stateRef.current.env.timeOfDay === 'dusk') overlayColor = 'rgba(40, 14, 14, 0.25)';
      else if (stateRef.current.env.timeOfDay === 'dawn') overlayColor = 'rgba(20, 30, 50, 0.22)';
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Weather overlays — interpolated between current and next
      const drawWeather = (w: string, alpha: number) => {
        if (alpha <= 0) return;
        if (w === 'rain') {
          ctx.fillStyle = `rgba(80, 130, 180, ${0.18 * alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = `rgba(170, 210, 240, ${0.45 * alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 80; i++) {
            const rx = ((Date.now() / 18 + i * 53) % canvas.width);
            const ry = ((Date.now() / 12 + i * 41) % canvas.height);
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 2, ry + 8);
          }
          ctx.stroke();
        } else if (w === 'snow') {
          ctx.fillStyle = `rgba(180, 200, 220, ${0.15 * alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = `rgba(230, 240, 250, ${0.7 * alpha})`;
          for (let i = 0; i < 70; i++) {
            const rx = ((Date.now() / 30 + i * 67) % canvas.width);
            const ry = ((Date.now() / 22 + i * 53) % canvas.height);
            ctx.beginPath();
            ctx.arc(rx, ry, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (w === 'fog') {
          ctx.fillStyle = `rgba(150, 160, 175, ${0.22 * alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (w === 'storm') {
          ctx.fillStyle = `rgba(40, 50, 70, ${0.35 * alpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (Math.random() < 0.02) {
            ctx.fillStyle = `rgba(220, 230, 255, ${0.5 * alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.strokeStyle = `rgba(170, 210, 240, ${0.5 * alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 100; i++) {
            const rx = ((Date.now() / 14 + i * 47) % canvas.width);
            const ry = ((Date.now() / 9 + i * 37) % canvas.height);
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 3, ry + 10);
          }
          ctx.stroke();
        }
      };

      drawWeather(stateRef.current.env.weather, 1 - stateRef.current.env.weatherProgress);
      drawWeather(stateRef.current.env.nextWeather, stateRef.current.env.weatherProgress);

      // Draw Line Between Adem & Havva
      const ademPx = (stateRef.current.adem.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
      const ademPy = (stateRef.current.adem.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
      const havvaPx = (stateRef.current.havva.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
      const havvaPy = (stateRef.current.havva.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(ademPx, ademPy);
      ctx.lineTo(havvaPx, havvaPy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${distBetween} birim`, (ademPx + havvaPx) / 2, (ademPy + havvaPy) / 2 - 5);

      // Target line (intent) for Adem
      if (stateRef.current.adem.targetPos) {
        const tpx = (stateRef.current.adem.targetPos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
        const tpy = (stateRef.current.adem.targetPos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ademPx, ademPy);
        ctx.lineTo(tpx, tpy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw ADEM
      const aPulse = 6 + Math.sin(Date.now() / 300) * 0.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
      ctx.fillStyle = '#e8edf0';
      ctx.beginPath();
      ctx.arc(ademPx, ademPy, aPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(ademPx, ademPy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw HAVVA
      const hPulse = 6 + Math.sin(Date.now() / 310) * 0.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 150, 200, 0.6)';
      ctx.fillStyle = '#fce7f3';
      ctx.beginPath();
      ctx.arc(havvaPx, havvaPy, hPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(havvaPx, havvaPy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // System Status text over Adem
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      
      let conditionText = '';
      if (stateRef.current.adem.vitals.bodyParts.legs < 40) {
        conditionText = '⚠️ YORGUNLUK';
        ctx.fillStyle = '#f59e0b';
      } else if (stateRef.current.adem.vitals.temp < 30) {
        conditionText = '❄️ SOĞUK';
        ctx.fillStyle = '#3b82f6';
      }

      if (conditionText) {
         ctx.fillText(conditionText, ademPx, ademPy - 12);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [size, zoom]);

  return (
    <div ref={containerRef} className="flex-1 min-w-0 relative overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        onMouseLeave={() => { setHoveredTile(null); setClickedTile(null); }}
        className="absolute inset-0 block cursor-crosshair"
        style={{ width: size.w, height: size.h }}
      />

      {/* Removed subtle grid overlay */}

      {/* Top-right weather pill */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
        <div className="flex gap-2">
          <div className="text-[10px] font-mono text-amber-500 uppercase tracking-wider bg-background/70 backdrop-blur-sm px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1.5 grayscale-[0.5] shadow-md">
            <Package size={12} />
            <span>Arşiv: {state.inventions.length}</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-background/70 backdrop-blur-sm px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5 grayscale-[0.5] shadow-md">
            <Brain size={12} />
            <span>Bilgi: {Object.keys(knowledge || {}).length}</span>
          </div>
          <button 
            onClick={() => {
              (window as any).toggleGodMode?.();
            }}
            className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border transition-colors shadow-md ${state.godMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-background/80 text-muted-foreground border-border/40 hover:bg-muted'}`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} />
              <span>GOD MODE: {state.godMode ? 'ON' : 'OFF'}</span>
            </div>
          </button>
        </div>
        
        <div className="flex bg-background/80 backdrop-blur-md rounded border border-border/40 shadow-lg divide-x divide-border/30 text-[10px] font-mono uppercase tracking-wider">
           <div className="px-3 py-1.5 flex flex-col items-center">
             <span className="text-muted-foreground/60 text-[8px] mb-0.5">Zaman</span>
             <span className="text-cyan-400/90 font-bold">{timeOfDayLabel(state.env.timeOfDay)}</span>
           </div>
           <div className="px-3 py-1.5 flex flex-col items-center">
             <span className="text-muted-foreground/60 text-[8px] mb-0.5">Mevsim</span>
             <div>
               <span className="text-emerald-400/90">{seasonLabel(state.env.season)}</span>
               <span className="text-emerald-400/40 opacity-70"> → {getNextSeason(state.env.season)}</span>
             </div>
           </div>
           <div className="px-3 py-1.5 flex flex-col items-center">
             <span className="text-muted-foreground/60 text-[8px] mb-0.5">Hava</span>
             <div className="text-muted-foreground/90 font-medium">
               {weatherLabel(state.env.weather)}
               {state.env.weatherProgress < 1 && <span className="opacity-60 ml-1">→ {weatherLabel(state.env.nextWeather)}</span>}
             </div>
           </div>
        </div>
      </div>

      {/* Floating Survival Tip Tooltip near Adem */}
      {showTip && (
        <div 
          className="absolute z-30 animate-in zoom-in-50 fade-in duration-300 pointer-events-none"
          style={{
            left: `${(state.adem.pos.x - camRef.current.x) * TILE_SIZE + TILE_SIZE / 2 + 10}px`,
            top: `${(state.adem.pos.y - camRef.current.y) * TILE_SIZE + TILE_SIZE / 2 - 50}px`,
            transform: 'translateX(10px)'
          }}
        >
          <div className="bg-primary/95 text-primary-foreground text-[11px] px-3 py-2 rounded-lg shadow-xl border border-primary/20 max-w-[180px] relative pointer-events-auto backdrop-blur-md">
            <div className="flex items-start gap-2">
              <HelpCircle size={14} className="mt-0.5 shrink-0" />
              <p className="leading-tight font-medium">{currentTip}</p>
              <button 
                onClick={() => setShowTip(false)}
                className="hover:bg-primary-foreground/20 rounded p-0.5 ml-1 -mr-1"
              >
                <X size={10} />
              </button>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-primary/95" />
          </div>
        </div>
      )}

      {/* Coordinate Overlay */}
      <div className="absolute bottom-12 left-3 flex flex-col gap-0.5 pointer-events-none z-10 transition-opacity duration-500">
        <div className="mb-1 text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest px-1">
          Planetary Simulation Grid // Sector {Math.floor(state.adem.pos.x/10)}-{Math.floor(state.adem.pos.y/10)}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-cyan-500/10">
          <span className="opacity-50">LAT:</span>
          <span>{getCoordinates(state.adem.pos.x, state.adem.pos.y).lat}°</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-cyan-500/10">
          <span className="opacity-50">LON:</span>
          <span>{getCoordinates(state.adem.pos.x, state.adem.pos.y).lon}°</span>
        </div>
        <div className="text-[8px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-tighter px-1">
          Substrate: {state.env.biomes[state.adem.pos.y][state.adem.pos.x]} // Distance: {distBetween} units
        </div>
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-2 left-2 right-2 mx-auto max-w-[640px] px-3 py-1.5 rounded bg-background/70 backdrop-blur-sm border border-border/40 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] font-mono text-muted-foreground/80 uppercase z-10">
        <Legend color="#4a7c59" label="Meyve" />
        <Legend color="#2d5a27" label="Ağaç" />
        <Legend color="#c54b5c" label="Zehirli" />
        <Legend color="#5a6b70" label="Yükselti" />
        <Legend color="#bf8c5f" label="Mantar" />
        <Legend color="#7fbe6f" label="Şifa" />
        <Legend color="#5a4a35" label="Diken" />
        <Legend color="#2b6b7a" label="Su" />
        <Legend color="#d48a4c" label="Ateş" />
        <Legend color="#8a7a6c" label="Barınak" />
      </div>

      {/* Hover Info (Creatures) */}
      {hoveredTile && !state.godMode && (
        <div 
          className="absolute z-40 bg-background/90 backdrop-blur-md border border-border/50 p-2 rounded text-[10px] shadow-lg pointer-events-none"
          style={{
            left: `${(hoveredTile.x - camRef.current.x) * TILE_SIZE + TILE_SIZE + 10}px`,
            top: `${(hoveredTile.y - camRef.current.y) * TILE_SIZE + 10}px`,
          }}
        >
          {state.env.creatures.filter(c => Math.floor(c.pos.x) === hoveredTile.x && Math.floor(c.pos.y) === hoveredTile.y).length > 0 ? (
            <div className="flex flex-col gap-1">
               {state.env.creatures.filter(c => Math.floor(c.pos.x) === hoveredTile.x && Math.floor(c.pos.y) === hoveredTile.y).map((cr, idx) => (
                 <div key={idx} className="flex flex-col border-b border-border/30 last:border-0 pb-1 last:pb-0">
                    <span className="font-bold text-rose-400 capitalize">{cr.kind}</span>
                    <span className="text-muted-foreground">Durum: {cr.isAttacking ? 'Saldırgan' : cr.isFleeing ? 'Kaçıyor' : 'Sakin'}</span>
                 </div>
               ))}
            </div>
          ) : (
             <div className="text-muted-foreground opacity-70 italic">Canlı Yok</div>
          )}
        </div>
      )}

      {/* OFF-SCREEN INDICATORS */}
      {(() => {
        const ademPx = (state.adem.pos.x - camRef.current.x) * TILE_SIZE + TILE_SIZE / 2;
        const ademPy = (state.adem.pos.y - camRef.current.y) * TILE_SIZE + TILE_SIZE / 2;
        const havvaPx = (state.havva.pos.x - camRef.current.x) * TILE_SIZE + TILE_SIZE / 2;
        const havvaPy = (state.havva.pos.y - camRef.current.y) * TILE_SIZE + TILE_SIZE / 2;

        const margin = 40;
        const indicators = [];

        // Adem indicator
        if (ademPx < 0 || ademPx > size.w || ademPy < 0 || ademPy > size.h) {
          const edgeX = clampN(ademPx, margin, size.w - margin);
          const edgeY = clampN(ademPy, margin, size.h - margin);
          indicators.push({ x: edgeX, y: edgeY, color: 'text-blue-400', label: 'ADEM', dist: distBetween });
        }

        // Havva indicator
        if (havvaPx < 0 || havvaPx > size.w || havvaPy < 0 || havvaPy > size.h) {
          const edgeX = clampN(havvaPx, margin, size.w - margin);
          const edgeY = clampN(havvaPy, margin, size.h - margin);
          indicators.push({ x: edgeX, y: edgeY, color: 'text-pink-400', label: 'HAVVA', dist: distBetween });
        }

        return indicators.map((ind, i) => (
          <div 
            key={i}
            className={`absolute z-30 flex flex-col items-center gap-0.5 animate-in fade-in zoom-in duration-300 pointer-events-none`}
            style={{ left: ind.x, top: ind.y, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`p-1.5 rounded-full bg-background/90 border border-border/50 shadow-xl ${ind.color}`}>
               <Compass size={16} className="animate-pulse" />
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-[8px] font-bold tracking-tighter bg-black/60 px-1 rounded ${ind.color}`}>{ind.label}</span>
              <span className="text-[7px] text-white/50 font-mono">{ind.dist}u</span>
            </div>
          </div>
        ));
      })()}

      {/* Clicked Info (Biome & Height) */}
      {clickedTile && (
        <div 
          className="absolute z-50 bg-indigo-950/90 border border-indigo-500/50 p-3 rounded-lg text-[11px] font-mono text-indigo-200 pointer-events-none backdrop-blur-md shadow-2xl"
          style={{
            left: `${(clickedTile.x - camRef.current.x) * TILE_SIZE + TILE_SIZE + 15}px`,
            top: `${(clickedTile.y - camRef.current.y) * TILE_SIZE + 15}px`,
          }}
        >
          <div className="font-bold text-white border-b border-indigo-500/30 mb-2 pb-1 flex justify-between items-center gap-4">
             <span>KONUM BİLGİSİ</span>
          </div>
          <div className="flex flex-col gap-1">
             <div><span className="opacity-60">KOORDİNAT:</span> {clickedTile.x}, {clickedTile.y}</div>
             <div><span className="opacity-60">BİYOM:</span> {state.env.biomes[clickedTile.y][clickedTile.x].toUpperCase()}</div>
             <div><span className="opacity-60">RAKIM:</span> {Math.max(0, state.env.heights[clickedTile.y][clickedTile.x])}m</div>
             <div><span className="opacity-60">ZEMİN:</span> {clickedTile.tile.toUpperCase()}</div>
          </div>
        </div>
      )}

      {/* God Mode Hover Inspector */}
      {state.godMode && hoveredTile && (
        <div 
          className="absolute z-50 bg-rose-950/90 border border-rose-500/50 p-2 rounded text-[10px] font-mono text-rose-200 pointer-events-none backdrop-blur-md shadow-2xl"
          style={{
            left: `${(hoveredTile.x - camRef.current.x) * TILE_SIZE + TILE_SIZE + 5}px`,
            top: `${(hoveredTile.y - camRef.current.y) * TILE_SIZE + 5}px`,
          }}
        >
          <div className="font-bold border-b border-rose-500/30 mb-1 pb-1">GOD MODE INSPECTOR</div>
          <div>BİRİMLER: {hoveredTile.x}, {hoveredTile.y}</div>
          <div>OBJECT: {hoveredTile.tile.toUpperCase()}</div>
          <div>BIOME: {state.env.biomes[hoveredTile.y][hoveredTile.x].toUpperCase()}</div>
          <div>ALTITUDE: {state.env.heights[hoveredTile.y][hoveredTile.x]}m</div>
        </div>
      )}
    </div>
  );
}

function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: any,
  cx: number,
  cy: number,
) {
  const kind = creature.kind;
  
  if (creature.isAttacking) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    // sharp teeth visual
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 8); ctx.lineTo(cx + 5, cy + 8);
    ctx.moveTo(cx + 5, cy - 8); ctx.lineTo(cx - 5, cy + 8);
    ctx.stroke();
  } else if (creature.isFleeing) {
    ctx.fillStyle = '#8bd1e5';
    ctx.beginPath();
    ctx.arc(cx + 6, cy - 8, 2, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (kind === 'tavşan') {
    // Light beige body
    ctx.fillStyle = '#d4b475';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Long ears
    ctx.fillRect(cx - 2, cy - 7, 1.5, 5);
    ctx.fillRect(cx + 0.5, cy - 7, 1.5, 5);
    // Eye dot
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx + 1.5, cy - 1, 1, 1);
  } else if (kind === 'geyik') {
    // Brown body
    ctx.fillStyle = '#b8956a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Antlers
    ctx.strokeStyle = '#8a7050';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 4);
    ctx.lineTo(cx - 4, cy - 10);
    ctx.moveTo(cx - 3, cy - 7);
    ctx.lineTo(cx - 5, cy - 9);
    ctx.moveTo(cx + 2, cy - 4);
    ctx.lineTo(cx + 4, cy - 10);
    ctx.moveTo(cx + 3, cy - 7);
    ctx.lineTo(cx + 5, cy - 9);
    ctx.stroke();
  } else if (kind === 'kurt') {
    // Gray wolf
    ctx.fillStyle = '#888a90';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pointed ears
    ctx.fillStyle = '#666870';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 4);
    ctx.lineTo(cx - 2, cy - 7);
    ctx.lineTo(cx - 1, cy - 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy - 4);
    ctx.lineTo(cx + 2, cy - 7);
    ctx.lineTo(cx + 4, cy - 4);
    ctx.fill();
    // Red glowing eyes
    ctx.fillStyle = '#e3636f';
    ctx.fillRect(cx - 2, cy - 1, 1.2, 1.2);
    ctx.fillRect(cx + 1, cy - 1, 1.2, 1.2);
  } else if (kind === 'ayı') {
    // Big brown bear body
    ctx.fillStyle = '#5a3e2a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Round ears
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#e3636f';
    ctx.fillRect(cx - 3, cy - 2, 1.2, 1.2);
    ctx.fillRect(cx + 2, cy - 2, 1.2, 1.2);
  }
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
