'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useDfaStore } from '@/store/dfaStore';
import InputSection from './InputSection';
import DFACanvas from './DFACanvas';
import TableVisualizer from './TableVisualizer';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { 
    originalDFA, 
    minimizedDFA, 
    algorithmSteps, 
    currentStepIndex, 
    setStep,
    nextStep, 
    prevStep, 
    reset,
    isPlaying,
    playSpeed,
    togglePlay,
    setSpeed,
    showMinimalDFA,
    setShowMinimalDFA
  } = useDfaStore();

  const isConfigured = algorithmSteps.length > 0;
  const isFinished = isConfigured && currentStepIndex === algorithmSteps.length - 1;

  // Auto-play logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isFinished && !showMinimalDFA) {
      const delay = playSpeed === 'slow' ? 2500 : playSpeed === 'normal' ? 1200 : 500;
      interval = setInterval(() => {
        nextStep();
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFinished, playSpeed, nextStep, showMinimalDFA]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      const activeEl = logContainerRef.current.querySelector('.active-log-item') as HTMLElement;
      if (activeEl) {
        logContainerRef.current.scrollTo({
          top: activeEl.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    }
  }, [currentStepIndex, showMinimalDFA]);

  // Compute the latest table state for each iteration phase up to currentStepIndex
  const tablesToRender = useMemo(() => {
    if (!isConfigured) return [];
    
    const visibleSteps = algorithmSteps.slice(0, currentStepIndex + 1);
    const phases = [...new Set(visibleSteps.map(s => s.iterationPhase))].sort((a, b) => a - b);
    
    return phases.map(phase => {
      // Find the last step in this phase from the visible steps
      const stepsInPhase = visibleSteps.filter(s => s.iterationPhase === phase);
      const lastStepInPhase = stepsInPhase[stepsInPhase.length - 1];
      
      let title = "Initialization (Phase 1)";
      if (phase > 0) title = `Phase 2 - Iteration ${phase}`;
      
      return { phase, title, step: lastStepInPhase };
    });
  }, [algorithmSteps, currentStepIndex, isConfigured]);

  const endOfTablesRef = useRef<HTMLDivElement>(null);
  // Optional: only scroll if a NEW table is added, not for every cell evaluation.
  useEffect(() => {
    if (endOfTablesRef.current && !showMinimalDFA) {
      endOfTablesRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [tablesToRender.length, isFinished, showMinimalDFA]);

  return (
    <div className="h-screen max-h-screen bg-[#0f0e13] font-sans antialiased text-slate-200 flex flex-col overflow-hidden w-full">
      
      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-[#25252d] bg-[#141419] flex justify-center items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded border border-blue-500/50 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-white flex items-center gap-3" style={{ fontFamily: "'Roboto Flex', system-ui, sans-serif", textShadow: "0 2px 4px rgba(0,0,0,0.5)"}}>
            DFA Minimization Simulator
          </h1>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE: Input Form OR Original DFA */}
        <div className={clsx("transition-all duration-300 ease-in-out border-r border-[#25252d] bg-[#1a1a21]", isConfigured ? "w-1/4 max-w-[350px] min-w-[250px]" : "w-[400px]")}>
          {!isConfigured ? (
            <InputSection />
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-[#25252d] bg-[#1e1e26] flex justify-between items-center shrink-0">
                 <h2 className="text-sm uppercase tracking-widest font-bold text-slate-300">Initial DFA</h2>
                 <button onClick={reset} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                   Reset
                 </button>
              </div>
              <div className="flex-1 min-h-0 bg-[#0f0e13] p-4 relative">
                <div className="absolute inset-0 m-4 rounded-xl shadow-inner border border-slate-800 bg-white overflow-hidden">
                   {originalDFA && <DFACanvas dfa={originalDFA} />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE PANE: Active Table(s) & Controls OR Minimal DFA */}
        <div className="flex-1 relative flex flex-col bg-[#0f0e13] min-w-0 min-h-0">
          {!isConfigured ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M8 6v12M16 6v12M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /></svg>
              <p>Define transition table and click run</p>
            </div>
          ) : (
             <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
                <div className="p-4 border-b border-[#25252d] bg-[#1e1e26] flex items-center justify-between z-10 shrink-0">
                  <h2 className="text-sm uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2">
                     {showMinimalDFA ? 'Minimized Result' : 'Equivalence Table Progress'}
                  </h2>
                </div>
                
                {/* Visualizer Area */}
                <div className="flex-1 relative w-full overflow-y-auto hide-scrollbar px-8 pt-8 pb-[140px] min-h-0">
                  <AnimatePresence mode="wait">
                      {showMinimalDFA ? (
                        <motion.div 
                          key="minimal-dfa"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          className="absolute inset-0 m-6 flex flex-col"
                        >
                           <div className="mb-4">
                             <button
                               onClick={() => setShowMinimalDFA(false)}
                               className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
                             >
                               <ArrowLeft size={16} /> Go Back to Tables
                             </button>
                           </div>
                           <div className="flex-1 min-h-[400px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                             {minimizedDFA && <DFACanvas dfa={minimizedDFA.dfa} />}
                             <div className="absolute bottom-6 right-6 z-10 bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-2xl backdrop-blur-md max-w-sm">
                                <h4 className="text-emerald-400 font-bold mb-3 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                                   Equivalence Classes Validated
                                </h4>
                                <ul className="text-slate-300 text-sm space-y-2 font-mono">
                                  {minimizedDFA?.equivalenceClasses.map((cls, i) => (
                                    <li key={i} className="flex gap-3"><span className="text-slate-500">Q{i}:</span> {'{'} <span className="text-emerald-300">{cls.join(', ')}</span> {'}'}</li>
                                  ))}
                                </ul>
                              </div>
                           </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="table-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full flex flex-col items-center pt-8 space-y-16"
                        >
                          {tablesToRender.map((stage) => (
                            <div key={stage.phase} className="w-full flex flex-col items-center">
                              <h3 className="text-slate-400 uppercase tracking-widest font-semibold text-xs mb-8 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-800">{stage.title}</h3>
                              {originalDFA && <TableVisualizer states={originalDFA.states} step={stage.step} />}
                            </div>
                          ))}

                          {/* Inline Algorithm Complete Prompt */}
                          {isFinished && (
                            <motion.div 
                               initial={{ opacity: 0, y: 30 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="mt-8 mb-12 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex flex-col items-center max-w-xl text-center"
                            >
                               <h3 className="text-xl font-bold text-emerald-400 mb-3">Minimization Complete</h3>
                               <p className="text-slate-400 mb-6 text-sm">All distinguishable pairs have been marked across all iterations. The remaining unmarked pairs are equivalent states.</p>
                               <button
                                 onClick={() => setShowMinimalDFA(true)}
                                 className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/50 transition-all font-mono"
                               >
                                 Visualize Minimal DFA
                               </button>
                            </motion.div>
                          )}
                          
                          <div ref={endOfTablesRef} className="h-8 w-full" />
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>

                {/* BOTTOM PLAYBACK BAR */}
                {!showMinimalDFA && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[#1a1a21]/95 border border-[#25252d] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 flex items-center gap-8 backdrop-blur-xl">
                      <div className="flex items-center gap-3 text-slate-300">
                        <button onClick={prevStep} disabled={currentStepIndex === 0} className="p-2.5 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                          <SkipBack size={18} />
                        </button>
                        <button onClick={togglePlay} disabled={isFinished} className="p-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
                          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                        </button>
                        <button onClick={nextStep} disabled={isFinished} className="p-2.5 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                          <SkipForward size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center min-w-[120px]">
                         <div className="w-12 h-1 bg-slate-700/50 rounded-full mb-1.5" />
                         <span className="text-xs text-slate-500 font-medium text-center leading-tight">
                           {isFinished ? "Algorithm Complete" : isPlaying ? "Running Simulation" : "Step to trace"}
                         </span>
                      </div>

                    </div>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* RIGHT PANE: Trace Log */}
        {isConfigured && (
          <div className="w-[350px] border-l border-[#25252d] bg-[#1a1a21] flex flex-col shrink-0 overflow-hidden relative">
            <div className="p-4 border-b border-[#25252d] bg-[#1e1e26] shrink-0 absolute top-0 w-full z-10">
               <h2 className="text-sm uppercase tracking-widest font-bold text-slate-300">Execution Progress</h2>
            </div>
            {/* Dark gradient mask below header for smooth scroll effect */}
            <div className="absolute top-[53px] left-0 right-0 h-6 bg-gradient-to-b from-[#1a1a21] to-transparent z-10" />
            
            <div ref={logContainerRef} className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-32 pt-20 space-y-6">
              {showMinimalDFA ? (
                <div className="text-slate-500 text-xs text-center mt-10">Viewing minimized automaton.</div>
              ) : (
                <>
                  {(() => {
                    // Group visible steps by iterationPhase, maintaining insertion order
                    const visibleSteps = algorithmSteps
                      .slice(0, currentStepIndex + 1)
                      .map((step, idx) => ({ step, idx }));

                    const groups: { phase: number; label: string; entries: { step: typeof algorithmSteps[0]; idx: number }[] }[] = [];
                    for (const { step, idx } of visibleSteps) {
                      const last = groups[groups.length - 1];
                      if (!last || last.phase !== step.iterationPhase) {
                        const label = step.iterationPhase === 0
                          ? 'Initialization & Phase 1'
                          : `Iteration ${step.iterationPhase}`;
                        groups.push({ phase: step.iterationPhase, label, entries: [{ step, idx }] });
                      } else {
                        last.entries.push({ step, idx });
                      }
                    }

                    return groups.map((group) => (
                      <div key={group.phase} className="flex flex-col gap-3">
                        {/* Iteration header */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={clsx(
                            "text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                            group.phase === 0
                              ? "bg-slate-800 text-slate-300 border border-slate-700"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          )}>
                            {group.label}
                          </span>
                          <div className="flex-1 h-px bg-slate-800" />
                        </div>

                        {/* Steps within this group */}
                        {group.entries.map(({ step, idx }, stepNum) => {
                          const isActive = idx === currentStepIndex;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setStep(idx);
                                if (isPlaying) togglePlay();
                              }}
                              className={clsx(
                                "pl-3 border-l-2 transition-all duration-200 cursor-pointer",
                                isActive
                                  ? "border-purple-500 opacity-100 active-log-item"
                                  : "border-slate-800 opacity-45 hover:opacity-70"
                              )}
                            >
                              <div className="text-[9px] font-bold tracking-widest uppercase mb-1 text-slate-500">
                                Step {stepNum + 1}
                              </div>
                              <div className={clsx(
                                "text-xs leading-relaxed whitespace-pre-wrap",
                                isActive ? "text-slate-100 font-medium" : "text-slate-500"
                              )}>
                                {step.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()}
                  
                  {isFinished && (
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                      <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <h4 className="text-emerald-400 font-bold mb-2">Algorithm Terminated</h4>
                      <p className="text-slate-400 text-sm">No further distinguishable pairs found.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Bottom gradient mask */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1a21] to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure icon imported correctly for Dashboard top area
import { X } from 'lucide-react';
