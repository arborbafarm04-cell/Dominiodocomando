import { create } from 'zustand';

/**
 * REAL-TIME STATE STORE - Ephemeral Game State
 * 
 * This store manages ONLY real-time, ephemeral game states that:
 * - Should NOT be saved to database
 * - Reset on page reload
 * - Are specific to current session
 * - Should NOT affect multiplayer synchronization
 * 
 * Contains:
 * - Current map position
 * - Current animation state
 * - Currently open screen/modal
 * - Active combat state
 * - Current UI focus
 * - Temporary visual effects
 * 
 * Does NOT contain:
 * - Player progression (use playerStore)
 * - Permanent inventory (use uiStore/specialized stores)
 * - Other players data (use multiplayerStore)
 */

interface RealTimeState {
  // Map and position
  currentMapPosition: { x: number; y: number } | null;
  currentLocation: string | null;
  
  // Animation and visual state
  currentAnimation: string | null;
  isAnimating: boolean;
  
  // UI state
  openScreen: string | null; // 'inventory', 'skills', 'map', etc.
  openModal: string | null; // 'dialog', 'shop', 'trade', etc.
  
  // Combat state
  isInCombat: boolean;
  currentCombatTarget: string | null;
  
  // Temporary effects
  activeEffects: Record<string, { startTime: number; duration: number }>;
  
  // Actions
  setMapPosition: (position: { x: number; y: number } | null) => void;
  setCurrentLocation: (location: string | null) => void;
  setCurrentAnimation: (animation: string | null) => void;
  setIsAnimating: (animating: boolean) => void;
  setOpenScreen: (screen: string | null) => void;
  setOpenModal: (modal: string | null) => void;
  setIsInCombat: (inCombat: boolean) => void;
  setCurrentCombatTarget: (target: string | null) => void;
  addEffect: (effectId: string, duration: number) => void;
  removeEffect: (effectId: string) => void;
  clearAllEffects: () => void;
  reset: () => void;
}

const initialState = {
  currentMapPosition: null,
  currentLocation: null,
  currentAnimation: null,
  isAnimating: false,
  openScreen: null,
  openModal: null,
  isInCombat: false,
  currentCombatTarget: null,
  activeEffects: {},
};

export const useRealTimeStateStore = create<RealTimeState>((set, get) => ({
  ...initialState,
  
  setMapPosition: (position) => set({ currentMapPosition: position }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setCurrentAnimation: (animation) => set({ currentAnimation: animation }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setOpenScreen: (screen) => set({ openScreen: screen }),
  setOpenModal: (modal) => set({ openModal: modal }),
  setIsInCombat: (inCombat) => set({ isInCombat: inCombat }),
  setCurrentCombatTarget: (target) => set({ currentCombatTarget: target }),
  
  addEffect: (effectId, duration) => set((state) => ({
    activeEffects: {
      ...state.activeEffects,
      [effectId]: { startTime: Date.now(), duration },
    },
  })),
  
  removeEffect: (effectId) => set((state) => {
    const newEffects = { ...state.activeEffects };
    delete newEffects[effectId];
    return { activeEffects: newEffects };
  }),
  
  clearAllEffects: () => set({ activeEffects: {} }),
  
  reset: () => set(initialState),
}));
