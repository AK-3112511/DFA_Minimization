'use client';

import React, { useState, useEffect } from 'react';
import { useDfaStore } from '@/store/dfaStore';
import { Play } from 'lucide-react';
import { DFA } from '@/types/dfa';

export default function InputSection() {
  const { originalDFA, setOriginalDFA, runAlgorithm } = useDfaStore();
  
  const [states, setStates] = useState(originalDFA?.states.join(', ') || '');
  const [alphabet, setAlphabet] = useState(originalDFA?.alphabet.join(', ') || '');
  const [startState, setStartState] = useState(originalDFA?.startState || '');
  const [finalStates, setFinalStates] = useState(originalDFA?.finalStates.join(', ') || '');
  
  const [transitions, setTransitions] = useState<Record<string, Record<string, string>>>(
    originalDFA?.transitions || {}
  );

  const stateArray = [...new Set(states.split(',').map(s => s.trim()).filter(Boolean))];
  const alphaArray = [...new Set(alphabet.split(',').map(s => s.trim()).filter(Boolean))];

  useEffect(() => {
    // Only update transitions structurally, don't overwrite user selection if valid
    const newTrans: Record<string, Record<string, string>> = {};
    if (stateArray.length > 0 && alphaArray.length > 0) {
      stateArray.forEach(state => {
        newTrans[state] = {};
        alphaArray.forEach(sym => {
          newTrans[state][sym] = transitions[state]?.[sym] || '';
        });
      });
      setTransitions(newTrans);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, alphabet]);

  const handleUpdate = () => {
    const newDfa: DFA = {
      states: stateArray,
      alphabet: alphaArray,
      startState: startState.trim(),
      finalStates: finalStates.split(',').map(s => s.trim()).filter(Boolean),
      transitions
    };
    setOriginalDFA(newDfa);
    runAlgorithm();
  };

  const isConfigValid = 
    stateArray.length > 0 && 
    alphaArray.length > 0 && 
    startState.trim() !== '' &&
    stateArray.every(state => alphaArray.every(sym => transitions[state]?.[sym] !== ''));

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col h-full overflow-y-auto hide-scrollbar">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-mono tracking-tighter">MN</span>
           DFA Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">Define your Deterministic Finite Automaton below.</p>
      </div>
      
      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">States</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm placeholder:text-slate-600"
            value={states}
            onChange={(e) => setStates(e.target.value)}
            placeholder="e.g., A, B, C, D, E, F"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Alphabet</label>
          <input
            type="text"
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm placeholder:text-slate-600"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            placeholder="e.g., 0, 1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Start State</label>
            <input
              type="text"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm placeholder:text-slate-600"
              value={startState}
              onChange={(e) => setStartState(e.target.value)}
              placeholder="e.g., A"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Final States</label>
            <input
              type="text"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm placeholder:text-slate-600"
              value={finalStates}
              onChange={(e) => setFinalStates(e.target.value)}
              placeholder="e.g., C, D, E"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Transition Table</label>
        
        {stateArray.length === 0 || alphaArray.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <p className="text-slate-500 text-sm">Define states and alphabet first.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-slate-400 font-semibold border-b border-slate-800 bg-slate-900/50">State</th>
                  {alphaArray.map(sym => (
                    <th key={sym} className="p-3 text-slate-400 font-semibold border-b border-slate-800 bg-slate-900/50 text-center">
                      On &apos;{sym}&apos;
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stateArray.map((state, idx) => (
                  <tr key={state} className={idx !== stateArray.length - 1 ? "border-b border-slate-800/50" : ""}>
                    <td className="p-3 text-slate-300 font-mono flex items-center gap-2">
                      <div className="w-4 flex items-center justify-center">
                        {state === startState && <span className="text-blue-400 text-lg leading-none">→</span>}
                        {finalStates.split(',').map(s=>s.trim()).includes(state) && <span className="text-green-400 text-lg leading-none">*</span>}
                      </div>
                      <span className="font-semibold">{state}</span>
                    </td>
                    {alphaArray.map(sym => (
                      <td key={`${state}-${sym}`} className="p-2">
                        <select
                          className="w-full bg-slate-900 border border-slate-700/50 rounded-md px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs appearance-none cursor-pointer"
                          value={transitions[state]?.[sym] || ''}
                          onChange={(e) => {
                            setTransitions({
                              ...transitions,
                              [state]: { ...transitions[state], [sym]: e.target.value }
                            });
                          }}
                        >
                          <option value="" disabled>-</option>
                          {stateArray.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800">
        <button
          onClick={handleUpdate}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          disabled={!isConfigValid}
        >
          <Play size={18} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          Run Myhill-Nerode
        </button>
      </div>
    </div>
  );
}
