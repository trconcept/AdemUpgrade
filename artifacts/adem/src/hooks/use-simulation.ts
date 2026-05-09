import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationState, KnowledgeBase, EventLog, createInitialState, tickSimulation } from "../lib/simulation";
import { inventNewSkill } from "../lib/agent-invention";

export function useSimulation(tickRate: number = 800) {
  const [state, setState] = useState<SimulationState>(createInitialState());
  const [logs, setLogs] = useState<EventLog[]>([]);
  const isInventingActive = useRef(false);
  
  const stateRef = useRef(state);
  const logsRef = useRef(logs);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(performance.now());
  const tickRateRef = useRef(tickRate);

  useEffect(() => {
    (window as any).toggleGodMode = () => {
      setState(prev => ({ ...prev, godMode: !prev.godMode }));
    };
    return () => { delete (window as any).toggleGodMode; };
  }, []);

  useEffect(() => {
    stateRef.current = state;
    logsRef.current = logs;
  }, [state, logs]);
  
  useEffect(() => {
     tickRateRef.current = tickRate;
  }, [tickRate]);

  useEffect(() => {
    if (state.isInventing && !isInventingActive.current) {
      isInventingActive.current = true;
      const cachedLogs = logs.map(l => l.text);
      // For now invent for adem or split based on who is tracking? 
      // Let's assume shared pool or just adem for now as it was
      inventNewSkill(state, state.adem.knowledge, cachedLogs).then(result => {
        if (result) {
          const key = result.skillName.toLowerCase();
          const invention = {
            situation: result.category,
            action: 'explore',
            outcomeText: result.outcomeText,
            confidence: result.isSuccessful ? 0.8 : 0.4,
            deltaHealth: 0,
            deltaHunger: 0,
            deltaThirst: 0,
            deltaTemp: 0,
            deltaEnergy: 0,
            occurrences: 1
          };

          setLogs(prev => [
            { id: Math.random().toString(), day: state.daysSurvived, time: '', text: `Evrim [AI İcat]: ${result.insight}`, type: result.isSuccessful ? 'good' : 'neutral' },
            ...prev
          ]);
          setState(prev => ({
            ...prev,
            isInventing: false,
            adem: { ...prev.adem, knowledge: { ...prev.adem.knowledge, [key]: invention } },
            havva: { ...prev.havva, knowledge: { ...prev.havva.knowledge, [key]: invention } }, // sync both if intended
            thinking: result.isSuccessful ? `[Başarılı İcat] ${result.skillName}` : `[Başarısız İcat] ${result.skillName}`,
            cognitiveArchitecture: 'Metacognition (Reflection)'
          }));
        } else {
          setState(prev => ({...prev, isInventing: false}));
        }
        isInventingActive.current = false;
      });
    }
  }, [state.isInventing]);

  const loop = useCallback((time: number) => {
    if (time - lastTickRef.current >= tickRateRef.current) {
      // Create a shallow clone of the state to ensure mutation is detected by React
      // For deeper changes, we would need a deep clone, but since we are updating 
      // the root state object and some nested objects, a shallow clone at the top 
      // followed by mutations inside tickSimulation might still be problematic 
      // if those nested objects are the same reference.
      // tickSimulation mutates the state, so we must clone it BEFORE passing.
      const stateClone = JSON.parse(JSON.stringify(stateRef.current));
      const { newState, newLogs } = tickSimulation(stateClone);
      
      setState(newState);
      if (newLogs.length > 0) {
        setLogs(prev => [...newLogs, ...prev].slice(0, 100));
      }
      
      lastTickRef.current = time;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const forceInteract = useCallback((actionType: 'feed' | 'heal' | 'scare_predators', agentId: 'adem' | 'havva' = 'adem') => {
    setState(prev => {
       const next = {...prev};
       const person = agentId === 'adem' ? {...next.adem} : {...next.havva};
       person.vitals = {...person.vitals};
       
       if (actionType === 'feed') {
          person.vitals.hunger = 100;
          person.vitals.thirst = 100;
       } else if (actionType === 'heal') {
          person.vitals.health = 100;
       }
       
       if (agentId === 'adem') next.adem = person;
       else next.havva = person;

       if (actionType === 'scare_predators') {
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
       // spawn apple near player (using adem as reference or middle of them)
       let spawned = false;
       const refPos = next.adem.pos;
       for(let dy=-1; dy<=1 && !spawned; dy++){
         for(let dx=-1; dx<=1 && !spawned; dx++){
            if(dx===0 && dy===0) continue;
            const tx = refPos.x+dx;
            const ty = refPos.y+dy;
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

  return { state, logs, forceInteract, forceSpawnFood };
}
