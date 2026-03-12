import { create } from 'zustand';

interface CleanMoneyStore {
  cleanMoney: number;
  addCleanMoney: (amount: number) => void;
  removeCleanMoney: (amount: number) => void;
  resetCleanMoney: () => void;
  setCleanMoney: (amount: number) => void;
}

export const useCleanMoneyStore = create<CleanMoneyStore>((set) => ({
  cleanMoney: 100000000,
  addCleanMoney: (amount: number) => set((state) => ({ cleanMoney: state.cleanMoney + amount })),
  removeCleanMoney: (amount: number) => set((state) => ({ cleanMoney: Math.max(0, state.cleanMoney - amount) })),
  resetCleanMoney: () => set({ cleanMoney: 0 }),
  setCleanMoney: (amount: number) => set({ cleanMoney: amount }),
}));
