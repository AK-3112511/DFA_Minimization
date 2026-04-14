import { create } from 'zustand';
import { DFA, AlgorithmStep, MinimizedDFA } from '@/types/dfa';
import { runMyhillNerode } from '@/lib/myhillNerode';

interface DFAState {
  originalDFA: DFA | null;
  minimizedDFA: MinimizedDFA | null;
  algorithmSteps: AlgorithmStep[];
  currentStepIndex: number;
  
  // Playback state
  isPlaying: boolean;
  playSpeed: 'slow' | 'normal' | 'fast';
  
  // UI State
  showMinimalDFA: boolean;

  // Actions
  setOriginalDFA: (dfa: DFA) => void;
  runAlgorithm: () => void;
  setStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  
  // Playback Control Actions
  togglePlay: () => void;
  setSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setShowMinimalDFA: (show: boolean) => void;
}

export const useDfaStore = create<DFAState>((set, get) => ({
  originalDFA: null,
  minimizedDFA: null,
  algorithmSteps: [],
  currentStepIndex: 0,
  
  isPlaying: false,
  playSpeed: 'normal',
  showMinimalDFA: false,

  setOriginalDFA: (dfa: DFA) => set({ 
    originalDFA: dfa, 
    minimizedDFA: null, 
    algorithmSteps: [], 
    currentStepIndex: 0,
    isPlaying: false,
    showMinimalDFA: false
  }),
  
  runAlgorithm: () => {
    const { originalDFA } = get();
    if (!originalDFA) return;
    
    const { steps, minimized } = runMyhillNerode(originalDFA);
    set({ 
      algorithmSteps: steps, 
      minimizedDFA: minimized, 
      currentStepIndex: 0,
      isPlaying: false,
      showMinimalDFA: false
    });
  },

  setStep: (index: number) => set((state) => ({
    currentStepIndex: Math.max(0, Math.min(index, state.algorithmSteps.length - 1))
  })),

  nextStep: () => set((state) => {
    const nextIdx = Math.min(state.currentStepIndex + 1, state.algorithmSteps.length - 1);
    const didFinish = nextIdx === state.algorithmSteps.length - 1;
    return {
      currentStepIndex: nextIdx,
      isPlaying: didFinish ? false : state.isPlaying
    };
  }),

  prevStep: () => set((state) => ({
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
  })),

  reset: () => set({ 
    originalDFA: null,
    minimizedDFA: null, 
    algorithmSteps: [], 
    currentStepIndex: 0,
    isPlaying: false,
    showMinimalDFA: false
  }),

  togglePlay: () => set((state) => {
    const isFinished = state.currentStepIndex === state.algorithmSteps.length - 1;
    if (isFinished && !state.isPlaying) {
      // Replay from beginning
      return { isPlaying: true, currentStepIndex: 0 };
    }
    return { isPlaying: !state.isPlaying };
  }),

  setSpeed: (speed: 'slow' | 'normal' | 'fast') => set({ playSpeed: speed }),
  setShowMinimalDFA: (show: boolean) => set({ showMinimalDFA: show })
}));
