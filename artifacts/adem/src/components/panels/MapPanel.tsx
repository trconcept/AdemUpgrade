import { useEffect, useRef, useState } from 'react';
import {
  SimulationState,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  weatherLabel,
  CREATURE_INFO,
} from '../../lib/simulation';

const TILE_SIZE = 32;

function clampN(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function MapPanel({ state }: { state: SimulationState }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const camRef = useRef<{ x: number; y: number }>({ x: state.pos.x, y: state.pos.y });
  const rafRef = useRef<number | undefined>(undefined);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.w;
    canvas.height = size.h;

    const tilesX = Math.ceil(size.w / TILE_SIZE);
    const tilesY = Math.ceil(size.h / TILE_SIZE);

    const draw = () => {
      // Smoothly interpolate camera toward ADEM
      const targetCamX = clampN(state.pos.x - tilesX / 2 + 0.5, 0, Math.max(0, WORLD_WIDTH - tilesX));
      const targetCamY = clampN(state.pos.y - tilesY / 2 + 0.5, 0, Math.max(0, WORLD_HEIGHT - tilesY));
      camRef.current.x += (targetCamX - camRef.current.x) * 0.12;
      camRef.current.y += (targetCamY - camRef.current.y) * 0.12;

      const camX = camRef.current.x;
      const camY = camRef.current.y;

      // Background tinted by season + time of day
      let bgBase = '#131b1d';
      if (state.env.season === 'winter') bgBase = '#171f24';
      else if (state.env.season === 'summer') bgBase = '#161b18';
      else if (state.env.season === 'autumn') bgBase = '#1a1814';
      ctx.fillStyle = bgBase;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tileStartX = Math.floor(camX);
      const tileStartY = Math.floor(camY);
      const offsetX = -(camX - tileStartX) * TILE_SIZE;
      const offsetY = -(camY - tileStartY) * TILE_SIZE;

      // Draw visible tile range with one-tile border for smooth edges
      for (let dy = -1; dy <= tilesY + 1; dy++) {
        for (let dx = -1; dx <= tilesX + 1; dx++) {
          const wx = tileStartX + dx;
          const wy = tileStartY + dy;
          if (wx < 0 || wy < 0 || wx >= WORLD_WIDTH || wy >= WORLD_HEIGHT) continue;
          const tile = state.env.grid[wy][wx];
          const px = dx * TILE_SIZE + offsetX;
          const py = dy * TILE_SIZE + offsetY;

          // Base tile (slight seasonal tint)
          let baseFill = '#172023';
          if (state.env.season === 'autumn') baseFill = '#1d1a16';
          else if (state.env.season === 'winter') baseFill = '#1c2228';
          else if (state.env.season === 'summer') baseFill = '#161e1a';
          ctx.fillStyle = baseFill;
          ctx.fillRect(px, py, TILE_SIZE - 1, TILE_SIZE - 1);

          // Visited cell hint
          const visited = state.visitedTiles[`${wx},${wy}`];
          if (visited) {
            ctx.fillStyle = 'rgba(180, 200, 220, 0.04)';
            ctx.fillRect(px, py, TILE_SIZE - 1, TILE_SIZE - 1);
          }

          if (tile === 'water') {
            ctx.fillStyle = '#2b6b7a';
            ctx.fillRect(px, py, TILE_SIZE - 1, TILE_SIZE - 1);
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(px + 4, py + 4, TILE_SIZE - 9, 1);
          } else if (tile === 'tree') {
            ctx.fillStyle = state.env.season === 'autumn' ? '#7a5a2a' :
              state.env.season === 'winter' ? '#3a4a45' : '#2a4a35';
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
          } else if (tile === 'stone') {
            ctx.fillStyle = '#5a6b70';
            ctx.fillRect(px + 8, py + 10, TILE_SIZE - 16, TILE_SIZE - 18);
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
            ctx.fillRect(px, py, TILE_SIZE - 1, TILE_SIZE - 1);
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
      for (const cr of state.env.creatures) {
        const cpx = (cr.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
        const cpy = (cr.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
        if (cpx < -TILE_SIZE || cpx > canvas.width + TILE_SIZE || cpy < -TILE_SIZE || cpy > canvas.height + TILE_SIZE) continue;
        drawCreature(ctx, cr, cpx, cpy);
      }

      // Time overlay
      let overlayColor = 'rgba(0,0,0,0)';
      if (state.env.timeOfDay === 'night') overlayColor = 'rgba(8, 14, 28, 0.55)';
      else if (state.env.timeOfDay === 'dusk') overlayColor = 'rgba(40, 14, 14, 0.25)';
      else if (state.env.timeOfDay === 'dawn') overlayColor = 'rgba(20, 30, 50, 0.22)';
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

      drawWeather(state.env.weather, 1 - state.env.weatherProgress);
      drawWeather(state.env.nextWeather, state.env.weatherProgress);

      // Target line (intent)
      if (state.targetPos) {
        const tpx = (state.targetPos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
        const tpy = (state.targetPos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
        const apx = (state.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
        const apy = (state.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(apx, apy);
        ctx.lineTo(tpx, tpy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(tpx, tpy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw ADEM
      const apx = (state.pos.x - camX) * TILE_SIZE + TILE_SIZE / 2;
      const apy = (state.pos.y - camY) * TILE_SIZE + TILE_SIZE / 2;
      const pulse = 6 + Math.sin(Date.now() / 300) * 0.6;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.fillStyle = '#e8edf0';
      ctx.beginPath();
      ctx.arc(apx, apy, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3a4a55';
      ctx.beginPath();
      ctx.arc(apx, apy, 2, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [state, size]);

  return (
    <div ref={containerRef} className="flex-1 min-w-0 relative overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="absolute inset-0 block"
        style={{ width: size.w, height: size.h }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top-right weather pill */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground/90 uppercase tracking-wider bg-background/70 backdrop-blur-sm px-2.5 py-1 rounded border border-border/40 z-10">
        {weatherLabel(state.env.weather)}{state.env.weatherProgress < 1 ? ` → ${weatherLabel(state.env.nextWeather)}` : ''}
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-2 left-2 right-2 mx-auto max-w-[640px] px-3 py-1.5 rounded bg-background/70 backdrop-blur-sm border border-border/40 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] font-mono text-muted-foreground/80 uppercase z-10">
        <Legend color="#4a7c59" label="Güvenli" />
        <Legend color="#c54b5c" label="Zehirli" />
        <Legend color="#bf8c5f" label="Mantar" />
        <Legend color="#7fbe6f" label="Şifa" />
        <Legend color="#5a4a35" label="Diken" />
        <Legend color="#2b6b7a" label="Su" />
        <Legend color="#d48a4c" label="Ateş" />
        <Legend color="#8a7a6c" label="Barınak" />
        <Legend color="#d4b475" label="Tavşan" />
        <Legend color="#b8956a" label="Geyik" />
        <Legend color="#888a90" label="Kurt" />
        <Legend color="#5a3e2a" label="Ayı" />
      </div>
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
