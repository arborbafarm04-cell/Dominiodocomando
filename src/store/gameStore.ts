import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameState {
  spins: number;
  dirtMoney: number;
  multiplier: number;
  playerLevel: number;
  hasInitialized: boolean;
  isSpinning: boolean;
  lastResult: string[] | null;
  setSpins: (spins: number) => void;
  setDirtMoney: (money: number) => void;
  setMultiplier: (multiplier: number) => void;
  setPlayerLevel: (level: number) => void;
  setHasInitialized: (initialized: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setLastResult: (result: string[] | null) => void;
  addDirtMoney: (amount: number) => void;
  addSpins: (amount: number) => void;
  subtractSpins: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  spins: 0,
  dirtMoney: 0,
  multiplier: 1,
  playerLevel: 1,
  hasInitialized: false,
  isSpinning: false,
  lastResult: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      setSpins: (spins) => set({ spins }),
      setDirtMoney: (money) => set({ dirtMoney: money }),
      setMultiplier: (multiplier) => set({ multiplier }),
      setPlayerLevel: (level) => set({ playerLevel: level }),
      setHasInitialized: (initialized) => set({ hasInitialized: initialized }),
      setIsSpinning: (spinning) => set({ isSpinning: spinning }),
      setLastResult: (result) => set({ lastResult: result }),
      addDirtMoney: (amount) => set((state) => ({ dirtMoney: state.dirtMoney + amount })),
      addSpins: (amount) => set((state) => ({ spins: state.spins + amount })),
      subtractSpins: (amount) => set((state) => ({ spins: Math.max(0, state.spins - amount) })),
      reset: () => set(initialState),
    }),
    {
      name: 'game-store',
    }
  )
);
