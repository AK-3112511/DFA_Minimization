'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlgorithmStep } from '@/types/dfa';
import { getPairKey } from '@/lib/myhillNerode';
import { useDfaStore } from '@/store/dfaStore';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface TableVisualizerProps {
  states: string[];
  step: AlgorithmStep;
}

export default function TableVisualizer({ states, step }: TableVisualizerProps) {
  const algorithmSteps = useDfaStore(state => state.algorithmSteps);
  const setStoreStep = useDfaStore(state => state.setStep);
  const isPlaying = useDfaStore(state => state.isPlaying);
  const togglePlay = useDfaStore(state => state.togglePlay);

  const handleCellClick = (p: string, q: string) => {
    // 1. Try to find the step where this cell was formally marked
    let targetIndex = algorithmSteps.findIndex(s => 
      s.newlyMarkedPairs?.some(pair => (pair.p === p && pair.q === q) || (pair.p === q && pair.q === p))
    );
    
    // 2. If it was never marked, find the step where it was first evaluated
    if (targetIndex === -1) {
      targetIndex = algorithmSteps.findIndex(s => 
        s.highlightedPairs?.some(pair => (pair.p === p && pair.q === q) || (pair.p === q && pair.q === p))
      );
    }

    if (targetIndex !== -1) {
      setStoreStep(targetIndex);
      if (isPlaying) togglePlay();
    }
  };

  const sortedStates = [...states].sort();
  
  if (sortedStates.length < 2) return null;

  const rows = sortedStates.slice(1);
  const cols = sortedStates.slice(0, sortedStates.length - 1);

  return (
    <div className="w-full flex justify-center py-10">
      <div className="inline-flex flex-col gap-1.5">
        {rows.map((rowState, rIdx) => (
          <div key={`row-${rowState}`} className="flex gap-1.5">
            {/* Row Header */}
            <div className="w-12 h-12 flex items-center justify-center font-bold text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
              {rowState}
            </div>
            
            {/* Cells */}
            {cols.slice(0, rIdx + 1).map((colState) => {
              const key = getPairKey(rowState, colState);
              const entry = step.table[key];
              
              const isNewlyMarked = step.newlyMarkedPairs?.some(
                p => (p.p === rowState && p.q === colState) || (p.p === colState && p.q === rowState)
              );
              const isHighlighted = step.highlightedPairs?.some(
                p => (p.p === rowState && p.q === colState) || (p.p === colState && p.q === rowState)
              );
              
              return (
                <div
                  key={key}
                  onClick={() => handleCellClick(rowState, colState)}
                  className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-lg border-2 relative overflow-hidden text-lg cursor-pointer transition-all hover:scale-105",
                    isHighlighted ? "z-10 shadow-lg shadow-blue-500/20" : "z-0 hover:z-10",
                    entry?.marked 
                      ? "bg-rose-500/10 border-rose-500/50 text-rose-500" 
                      : isHighlighted
                        ? "bg-blue-500/10 border-blue-500 text-blue-400"
                        : "bg-slate-900/50 border-slate-800"
                  )}
                  title={entry?.reason || `Pair (${colState}, ${rowState})`}
                >
                  {entry?.marked && <X size={24} strokeWidth={3.5} />}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Column Headers */}
        <div className="flex gap-1.5 pl-[54px] pt-1.5">
          {cols.map((colState) => (
            <div key={`col-${colState}`} className="w-12 h-12 flex items-center justify-center font-bold text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
              {colState}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
