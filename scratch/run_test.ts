import { runMyhillNerode, getPairKey } from '../src/lib/myhillNerode';
import { DFA } from '../src/types/dfa';

const dfa: DFA = {
  states: ['A', 'B', 'C', 'D', 'E', 'F'],
  alphabet: ['0', '1'],
  startState: 'A',
  finalStates: ['C', 'D', 'E'],
  transitions: {
    A: { '0': 'B', '1': 'C' },
    B: { '0': 'A', '1': 'D' },
    C: { '0': 'E', '1': 'A' },
    D: { '0': 'E', '1': 'F' },
    E: { '0': 'E', '1': 'F' },
    F: { '0': 'F', '1': 'F' }
  }
};

const result = runMyhillNerode(dfa);
console.log(JSON.stringify(result.minimized.equivalenceClasses));
console.log(JSON.stringify(result.minimized.dfa));
