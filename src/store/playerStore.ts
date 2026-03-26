import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Players } from '@/entities';

/**
 * PLAYER STORE - Session Cache Only
 * 
 * This store ONLY caches the current player's session data.
 * It is NOT the source of truth - the database is.
 * 
 * Contains:
 * - Player identification (playerId, playerName)
 * - Player progression (level, progress, barracoLevel)
 * - Player finances (cleanMoney, dirtyMoney)
 * - Session state (spins, isGuest, profilePicture)
 * 
 * Does NOT contain:
 * - Visual/UI states (use uiStore)
 * - Multiplayer data (use multiplayerStore)
 * - Spin/game mechanics (use uiStore)
 * - Luxury items, investments, etc. (use specialized stores)
 */

interface PlayerData {
  playerId: string | null;
  playerName: string;
  level: number;
  progress: number;
  isGuest: boolean;
  profilePicture: string | null;
  barracoLevel: number;
  cleanMoney: number;
  dirtyMoney: number;
  spins: number;
}

interface PlayerState extends PlayerData {
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setLevel: (level: number) => void;
  setProgress: (progress: number) => void;
  setIsGuest: (isGuest: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  setBarracoLevel: (level: number) => void;
  
  // ⚠️ INTERNAL ONLY: Money sync methods (use playerEconomyService for all operations)
  _setCleanMoney: (money: number) => void;
  _setDirtyMoney: (money: number) => void;
  
  // Spins management
  setSpins: (spins: number) => void;
  addSpins: (amount: number) => void;
  subtractSpins: (amount: number) => void;
  
  loadPlayerData: (data: Partial<PlayerState>) => void;
  resetPlayer: () => void;
}

const initialState: PlayerData = {
  playerId: null,
  playerName: 'COMANDANTE',
  level: 1,
  progress: 0,
  isGuest: false,
  profilePicture: null,
  barracoLevel: 1,
  cleanMoney: 0,
  dirtyMoney: 0,
  spins: 0,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setPlayerId: (id: string) => set({ playerId: id }),
      setPlayerName: (name: string) => set({ playerName: name }),
      setLevel: (level: number) => set({ level: Math.min(100, Math.max(1, level)) }),
      setProgress: (progress: number) => set({ progress }),
      setIsGuest: (isGuest: boolean) => set({ isGuest }),
      setProfilePicture: (url: string | null) => set({ profilePicture: url }),
      setBarracoLevel: (level: number) => set({ barracoLevel: Math.max(1, level) }),
      
      // ⚠️ INTERNAL ONLY: Money sync methods (called by playerEconomyService)
      _setCleanMoney: (money: number) => set({ cleanMoney: Math.max(0, money) }),
      _setDirtyMoney: (money: number) => set({ dirtyMoney: Math.max(0, money) }),
      
      // Spins management
      setSpins: (spins) => set({ spins: Math.max(0, spins) }),
      addSpins: (amount: number) => set((state) => ({ spins: state.spins + amount })),
      subtractSpins: (amount: number) => set((state) => ({ spins: Math.max(0, state.spins - amount) })),
      
      loadPlayerData: (data: Partial<PlayerState>) => set(data),
      resetPlayer: () => set({
        ...initialState,
        level: 1,
      }),
    }),
    {
      name: 'player-store',
    }
  )
);
