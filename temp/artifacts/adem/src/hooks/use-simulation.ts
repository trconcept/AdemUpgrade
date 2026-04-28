import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationState, KnowledgeBase, EventLog, createInitialState, tickSimulation } from "../lib/simulation";

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState());
  const [knowledge, setKnowledge] = useState<KnowledgeBase>({});
  const [logs, setLogs] = useState<EventLog[]>([]);
  
  const stateRef = useRef(state);
  const knowledgeRef = useRef(knowledge);
  const logsRef = useRef(logs);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(performance.now());
  const tickRate = 800; // ms per tick

  useEffect(() => {
    stateRef.current = state;
    knowledgeRef.current = knowledge;
    logsRef.current = logs;
  }, [state, knowledge, logs]);

  const loop = useCallback((time: number) => {
    if (time - lastTickRef.current >= tickRate) {
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

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return { state, knowledge, logs };
}
