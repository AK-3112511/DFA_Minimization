import { DFA, AlgorithmStep, TableEntry, Pair, MinimizedDFA } from '@/types/dfa';

export function getPairKey(p: string, q: string): string {
  return p < q ? `${p},${q}` : `${q},${p}`;
}

export function parsePairKey(key: string): Pair {
  const [p, q] = key.split(',');
  return { p, q };
}

function getReachableStates(dfa: DFA): string[] {
  const reachable = new Set<string>();
  const queue = [dfa.startState];
  reachable.add(dfa.startState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const symbol of dfa.alphabet) {
      if (dfa.transitions[current] && dfa.transitions[current][symbol]) {
        const next = dfa.transitions[current][symbol];
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }
  }

  return Array.from(reachable);
}

export function runMyhillNerode(originalDfa: DFA): { steps: AlgorithmStep[], minimized: MinimizedDFA } {
  const steps: AlgorithmStep[] = [];
  const table: Record<string, TableEntry> = {};
  
  const reachableStates = getReachableStates(originalDfa);
  const states = [...originalDfa.states.filter(s => reachableStates.includes(s))].sort();
  
  const isFinal = (state: string) => originalDfa.finalStates.includes(state);

  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      table[getPairKey(states[i], states[j])] = { marked: false };
    }
  }

  steps.push({
    description: "Initialize the equivalence table with all valid pairs of reachable states.",
    table: JSON.parse(JSON.stringify(table)),
    newlyMarkedPairs: [],
    iterationPhase: 0
  });

  steps.push({
    description: "Phase 1: Evaluating pairs distinguishing Final vs Non-Final states.",
    table: JSON.parse(JSON.stringify(table)),
    newlyMarkedPairs: [],
    iterationPhase: 0
  });

  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const p = states[i];
      const q = states[j];
      const key = getPairKey(p, q);
      const pFinal = isFinal(p);
      const qFinal = isFinal(q);
      
      let desc = `Evaluating (${p}, ${q}). `;
      let markedNow = false;

      if (pFinal !== qFinal) {
        desc += pFinal ? `${p} is a final state but ${q} is not.` : `${q} is a final state but ${p} is not.`;
        desc += ` Thus, they are distinguishable. Marked X.`;
        table[key] = { 
          marked: true, 
          reason: desc
        };
        markedNow = true;
      } else {
        desc += `Both states are ${pFinal ? 'final' : 'non-final'}. Cannot mark yet.`;
      }

      steps.push({
        description: desc,
        table: JSON.parse(JSON.stringify(table)),
        newlyMarkedPairs: markedNow ? [{ p, q }] : [],
        highlightedPairs: [{ p, q }],
        iterationPhase: 0
      });
    }
  }

  let changed = true;
  let iteration = 1;

  steps.push({
    description: `Phase 2: Transition evaluations. Beginning iteration ${iteration}.`,
    table: JSON.parse(JSON.stringify(table)),
    newlyMarkedPairs: [],
    iterationPhase: iteration
  });

  while (changed) {
    changed = false;
    let iterationHadNewMarks = false;

    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const p = states[i];
        const q = states[j];
        const currentKey = getPairKey(p, q);

        if (!table[currentKey].marked) {
          let markedInThisCell = false;
          let evalLog = `Evaluating pair (${p}, ${q}) on iteration ${iteration}.\n`;

          for (const symbol of originalDfa.alphabet) {
            const nextP = originalDfa.transitions[p]?.[symbol];
            const nextQ = originalDfa.transitions[q]?.[symbol];

            if (nextP && nextQ && nextP !== nextQ) {
              const nextKey = getPairKey(nextP, nextQ);
              
              if (table[nextKey]?.marked) {
                evalLog += `On input '${symbol}', it transitions to (${nextP}, ${nextQ}), which is marked. Therefore, (${p}, ${q}) is distinguishable. Marked X.`;
                table[currentKey] = {
                  marked: true,
                  markedBy: { symbol, nextP, nextQ },
                  reason: evalLog
                };
                markedInThisCell = true;
                changed = true;
                iterationHadNewMarks = true;
                break;
              } else {
                evalLog += `On input '${symbol}', it transitions to (${nextP}, ${nextQ}) (unmarked). `;
              }
            } else if (nextP === nextQ) {
              evalLog += `On input '${symbol}', both transition to same state ${nextP}. `;
            }
          }

          if (!markedInThisCell) {
            evalLog += "No transitions lead to a marked pair yet. Not marked.";
          }

          steps.push({
            description: evalLog,
            table: JSON.parse(JSON.stringify(table)),
            newlyMarkedPairs: markedInThisCell ? [{ p, q }] : [],
            highlightedPairs: [{ p, q }],
            iterationPhase: iteration
          });
        }
      }
    }

    if (!iterationHadNewMarks) {
      changed = false;
    }
    
    if (changed) {
      iteration++;
      steps.push({
        description: `Moving to iteration ${iteration}. Checking unmarked pairs again.`,
        table: JSON.parse(JSON.stringify(table)),
        newlyMarkedPairs: [],
        iterationPhase: iteration
      });
    }
  }

  steps.push({
    description: "Algorithm terminated. No new marks were made in the last full pass. Unmarked pairs are equivalent.",
    table: JSON.parse(JSON.stringify(table)),
    newlyMarkedPairs: [],
    iterationPhase: iteration
  });

  const equivalenceClasses: string[][] = [];
  const visited = new Set<string>();

  for (const state of states) {
    if (!visited.has(state)) {
      const currentClass = [state];
      visited.add(state);

      for (const otherState of states) {
        if (!visited.has(otherState) && state !== otherState) {
          const key = getPairKey(state, otherState);
          if (!table[key].marked) {
            currentClass.push(otherState);
            visited.add(otherState);
          }
        }
      }
      equivalenceClasses.push(currentClass);
    }
  }

  const stateMapping: Record<string, string> = {};
  equivalenceClasses.forEach(cls => {
    const newName = cls.length > 1 ? `{${cls.join(',')}}` : cls[0];
    cls.forEach(state => {
      stateMapping[state] = newName;
    });
  });

  const minStates = Array.from(new Set(Object.values(stateMapping)));
  const minStartState = stateMapping[originalDfa.startState];
  const minFinalStates = Array.from(new Set(
    originalDfa.finalStates
      .filter(s => reachableStates.includes(s))
      .map(s => stateMapping[s])
  ));

  const minTransitions: Record<string, Record<string, string>> = {};
  
  for (const newName of minStates) {
    minTransitions[newName] = {};
    const repState = Object.keys(stateMapping).find(k => stateMapping[k] === newName)!;
    
    for (const symbol of originalDfa.alphabet) {
      const dest = originalDfa.transitions[repState]?.[symbol];
      if (dest) {
        minTransitions[newName][symbol] = stateMapping[dest];
      }
    }
  }

  const minimized: MinimizedDFA = {
    dfa: {
      states: minStates,
      alphabet: originalDfa.alphabet,
      startState: minStartState,
      finalStates: minFinalStates,
      transitions: minTransitions
    },
    equivalenceClasses,
    stateMapping
  };

  return { steps, minimized };
}
