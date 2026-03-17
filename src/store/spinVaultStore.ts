import { create } from 'zustand';

interface SpinVaultState {
  spins: number;
  lastGainTime: number;
  hasInitialized: boolean;
  barracoLevel: number;
  setSpins: (spins: number) => void;
  addSpins: (amount: number) => void;
  deductSpins: (amount: number) => boolean;
  initializeVault: (barracoLevel: number) => void;
  updateLastGainTime: () => void;
  getTimeUntilNextGain: () => number;
  setBarracoLevel: (level: number) => void;
}

export const useSpinVaultStore = create<SpinVaultState>((set, get) => ({
  spins: 0,
  lastGainTime: 0,
  hasInitialized: false,
  barracoLevel: 1,

  setSpins: (spins: number) => set({ spins: Math.max(0, spins) }),

  addSpins: (amount: number) => {
    set((state) => ({
      spins: state.spins + amount,
      lastGainTime: Date.now(),
    }));
  },

  deductSpins: (amount: number) => {
    const state = get();
    if (state.spins >= amount) {
      set({ spins: state.spins - amount });
      return true;
    }
    return false;
  },

  initializeVault: (barracoLevel: number) => {
    const state = get();
    if (!state.hasInitialized) {
      set({
        spins: 1000,
        lastGainTime: Date.now(),
        hasInitialized: true,
        barracoLevel: barracoLevel || 1,
      });
    }
  },

  updateLastGainTime: () => {
    set({ lastGainTime: Date.now() });
  },

  getTimeUntilNextGain: () => {
    const state = get();
    const timeSinceLastGain = Date.now() - state.lastGainTime;
    const timeUntilNextGain = 60000 - (timeSinceLastGain % 60000);
    return Math.max(0, timeUntilNextGain);
  },

  setBarracoLevel: (level: number) => set({ barracoLevel: Math.max(1, level) }),
}));
