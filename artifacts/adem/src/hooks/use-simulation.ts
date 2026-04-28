import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationState, KnowledgeBase, EventLog, createInitialState, tickSimulation } from "../lib/simulation";

export function useSimulation(tickRate: number = 800) {
  const [state, setState] = useState<SimulationState>(createInitialState());
  const [knowledge, setKnowledge] = useState<KnowledgeBase>({});
  const [logs, setLogs] = useState<EventLog[]>([]);
  
  const stateRef = useRef(state);
  const knowledgeRef = useRef(knowledge);
  const logsRef = useRef(logs);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(performance.now());
  const tickRateRef = useRef(tickRate);

  useEffect(() => {
    stateRef.current = state;
    knowledgeRef.current = knowledge;
    logsRef.current = logs;
  }, [state, knowledge, logs]);
  
  useEffect(() => {
     tickRateRef.current = tickRate;
  }, [tickRate]);

  const loop = useCallback((time: number) => {
    if (time - lastTickRef.current >= tickRateRef.current) {
      const { newState, newKnowledge, newLogs } = tickSimulation(
        stateRef.current,
        knowledgeRef.current,
        logsRef.current
      );
      
      setState(newState);
      setKnowledge(newKnowledge);
      setLogs(newLogs);
      
      lastTickRef.current = time;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const forceInteract = useCallback((actionType: 'feed' | 'heal' | 'scare_predators') => {
    setState(prev => {
       const next = {...prev, vitals: {...prev.vitals}};
       if (actionType === 'feed') {
          next.vitals.hunger = 100;
          next.vitals.thirst = 100;
       } else if (actionType === 'heal') {
          next.vitals.health = 100;
       } else if (actionType === 'scare_predators') {
          // move creatures away
          next.env = {...next.env, creatures: next.env.creatures.map(c => {
             return {...c, pos: {x: 0, y: 0}}; // or something safe
          })};
       }
       return next;
    });
  }, []);

  const forceSpawnFood = useCallback(() => {
    setState(prev => {
       const next = {...prev, env: {...prev.env, grid: prev.env.grid.map(r => [...r])}};
       // spawn apple near player
       let spawned = false;
       for(let dy=-1; dy<=1 && !spawned; dy++){
         for(let dx=-1; dx<=1 && !spawned; dx++){
            if(dx===0 && dy===0) continue;
            const tx = next.pos.x+dx;
            const ty = next.pos.y+dy;
            if(tx>=0 && tx<next.env.width && ty>=0 && ty<next.env.height) {
              if (next.env.grid[ty][tx]==='empty') {
                 next.env.grid[ty][tx] = 'safe_fruit';
                 spawned = true;
              }
            }
         }
       }
       return next;
    });
  }, []);

  useEffect(() => {
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return { state, knowledge, logs, forceInteract, forceSpawnFood };
}
