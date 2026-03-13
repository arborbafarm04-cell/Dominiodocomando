import { create } from 'zustand';

export type BriberyConsequence = 
  | 'x9_title' 
  | 'business_closed' 
  | 'weapon_seized' 
  | 'gang_detained' 
  | 'car_towed';

interface BriberyState {
  // Bribery costs per level (level 1-9)
  briberyLevels: number[];
  
  // Consequences tracking
  activeConsequences: {
    type: BriberyConsequence;
    expiresAt: number;
  }[];
  
  // Methods
  getBriberyAmount: (level: number) => number;
  getNextBriberyAmount: (level: number) => number;
  addConsequence: (type: BriberyConsequence, durationMs: number) => void;
  removeConsequence: (type: BriberyConsequence) => void;
  hasConsequence: (type: BriberyConsequence) => boolean;
  getActiveConsequences: () => BriberyConsequence[];
  clearExpiredConsequences: () => void;
}

export const useBriberyStore = create<BriberyState>((set, get) => {
  // Calculate bribery amounts for levels 1-9
  // Level 1: 100, Level 2: 111, Level 3: 123, etc.
  const calculateBriberyLevels = (): number[] => {
    const levels: number[] = [];
    let amount = 100;
    for (let i = 0; i < 9; i++) {
      levels.push(Math.floor(amount));
      amount = (amount * 1.1) + 1;
    }
    return levels;
  };

  return {
    briberyLevels: calculateBriberyLevels(),
    activeConsequences: [],

    getBriberyAmount: (level: number) => {
      const state = get();
      const index = Math.min(Math.max(level - 1, 0), 8);
      return state.briberyLevels[index];
    },

    getNextBriberyAmount: (level: number) => {
      const state = get();
      const index = Math.min(Math.max(level, 0), 8);
      return state.briberyLevels[index];
    },

    addConsequence: (type: BriberyConsequence, durationMs: number) => {
      set((state) => ({
        activeConsequences: [
          ...state.activeConsequences.filter(c => c.type !== type),
          {
            type,
            expiresAt: Date.now() + durationMs,
          },
        ],
      }));
    },

    removeConsequence: (type: BriberyConsequence) => {
      set((state) => ({
        activeConsequences: state.activeConsequences.filter(c => c.type !== type),
      }));
    },

    hasConsequence: (type: BriberyConsequence) => {
      const state = get();
      return state.activeConsequences.some(
        (c) => c.type === type && c.expiresAt > Date.now()
      );
    },

    getActiveConsequences: () => {
      const state = get();
      return state.activeConsequences
        .filter((c) => c.expiresAt > Date.now())
        .map((c) => c.type);
    },

    clearExpiredConsequences: () => {
      set((state) => ({
        activeConsequences: state.activeConsequences.filter(
          (c) => c.expiresAt > Date.now()
        ),
      }));
    },
  };
});
