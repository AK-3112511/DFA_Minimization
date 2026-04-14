export interface DFA {
  states: string[];
  alphabet: string[];
  startState: string;
  finalStates: string[];
  transitions: Record<string, Record<string, string>>;
}

export interface Pair {
  p: string;
  q: string;
}

export interface TableEntry {
  marked: boolean;
  markedBy?: {
    symbol: string;
    nextP: string;
    nextQ: string;
  };
  reason?: string;
  stepIdx?: number;
}

export interface AlgorithmStep {
  description: string;
  table: Record<string, TableEntry>; // Key format: `${p},${q}` where p < q
  highlightedPairs?: Pair[];
  newlyMarkedPairs?: Pair[];
  iterationPhase: number; // Groups steps by iteration: 0 = Init/Phase1, 1+ = Phase 2 loops
}

export interface MinimizedDFA {
  dfa: DFA;
  equivalenceClasses: string[][];
  stateMapping: Record<string, string>; // original -> merged state name
}
