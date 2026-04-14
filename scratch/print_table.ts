import { runMyhillNerode } from '../src/lib/myhillNerode';
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
const lastStep = result.steps[result.steps.length - 1];
const table = lastStep.table;

console.log('Unmarked Pairs equivalent:');
for (const key in table) {
  if (!table[key].marked) {
    console.log(key);
  }
}
