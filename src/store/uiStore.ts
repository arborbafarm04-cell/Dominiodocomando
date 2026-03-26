import { create } from 'zustand';

/**
 * UI STORE - Visual and Game State
 * 
 * This store manages all visual and game mechanics states.
 * It is ephemeral and resets on page reload.
 * 
 * Contains:
 * - Spin mechanics (isSpinning, lastResult, multiplier)
 * - Game initialization (hasInitialized)
 * - Spin Vault timing (lastGainTime)
 * - Luxury items ownership (ownedLuxuryItemIds)
 * - Additional player data (inventory, investments, cooldowns, passiveBonuses)
 */

interface UIState {
  // Spin mechanics
  isSpinning: boolean;
  lastResult: string[] | null;
  multiplier: number;
  
  // Game initialization
  hasInitialized: boolean;
  
  // Spin Vault timing
  lastGainTime: number;
  
  // Luxury items (ephemeral - loaded from playerStore)
  ownedLuxuryItemIds: string[];
  
  // Additional player data (loaded from playerStore)
  inventory?: Record<string, any>;
  investments?: Record<string, any>;
  cooldowns?: Record<string, number>;
  passiveBonuses?: Record<string, number>;
  
  // Actions
  setIsSpinning: (spinning: boolean) => void;
  setLastResult: (result: string[] | null) => void;
  setMultiplier: (multiplier: number) => void;
  setHasInitialized: (initialized: boolean) => void;
  setLastGainTime: (time: number) => void;
  updateLastGainTime: () => void;
  getTimeUntilNextGain: () => number;
  setOwnedLuxuryItems: (itemIds: string[]) => void;
  addOwnedLuxuryItem: (itemId: string) => void;
  isLuxuryItemOwned: (itemId: string) => boolean;
  setInventory: (inventory: Record<string, any>) => void;
  setInvestments: (investments: Record<string, any>) => void;
  setCooldowns: (cooldowns: Record<string, number>) => void;
  setPassiveBonuses: (bonuses: Record<string, number>) => void;
  reset: () => void;
}

const initialState = {
  isSpinning: false,
  lastResult: null,
  multiplier: 1,
  hasInitialized: false,
  lastGainTime: 0,
  ownedLuxuryItemIds: [],
  inventory: {},
  investments: {},
  cooldowns: {},
  passiveBonuses: {},
};

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,
  
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  setLastResult: (result) => set({ lastResult: result }),
  setMultiplier: (multiplier) => set({ multiplier }),
  setHasInitialized: (initialized) => set({ hasInitialized: initialized }),
  setLastGainTime: (time) => set({ lastGainTime: time }),
  updateLastGainTime: () => set({ lastGainTime: Date.now() }),
  getTimeUntilNextGain: () => {
    const state = get();
    const timeSinceLastGain = Date.now() - state.lastGainTime;
    const timeUntilNextGain = 60000 - (timeSinceLastGain % 60000);
    return Math.max(0, timeUntilNextGain);
  },
  
  setOwnedLuxuryItems: (itemIds) => set({ ownedLuxuryItemIds: itemIds }),
  addOwnedLuxuryItem: (itemId) => set((state) => {
    if (!state.ownedLuxuryItemIds.includes(itemId)) {
      return { ownedLuxuryItemIds: [...state.ownedLuxuryItemIds, itemId] };
    }
    return state;
  }),
  isLuxuryItemOwned: (itemId) => {
    const state = get();
    return state.ownedLuxuryItemIds.includes(itemId);
  },
  
  setInventory: (inventory) => set({ inventory }),
  setInvestments: (investments) => set({ investments }),
  setCooldowns: (cooldowns) => set({ cooldowns }),
  setPassiveBonuses: (bonuses) => set({ passiveBonuses: bonuses }),
  
  reset: () => set(initialState),
}));
