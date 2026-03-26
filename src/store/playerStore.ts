import { create } from 'zustand';

interface PlayerData {
  playerId: string | null; // Unique permanent identifier from players collection (_id)
  playerName: string;
  level: number;
  progress: number;
  isGuest: boolean;
  profilePicture: string | null;
  barracoLevel: number;
  cleanMoney: number; // Unified money system - clean money from legitimate sources
  dirtyMoney: number; // Unified money system - dirty money from illegal sources
}

interface PlayerState extends PlayerData {
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setLevel: (level: number) => void;
  setProgress: (progress: number) => void;
  setIsGuest: (isGuest: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  setBarracoLevel: (level: number) => void;
  
  // Unified money system methods
  setCleanMoney: (money: number) => void;
  addCleanMoney: (amount: number) => void;
  removeCleanMoney: (amount: number) => void;
  
  setDirtyMoney: (money: number) => void;
  addDirtyMoney: (amount: number) => void;
  removeDirtyMoney: (amount: number) => void;
  
  loadPlayerData: (data: Partial<PlayerState>) => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerId: null,
  playerName: 'COMANDANTE',
  level: 10,
  progress: 0,
  isGuest: false,
  profilePicture: null,
  barracoLevel: 1,
  cleanMoney: 1000000000, // Unified: clean money
  dirtyMoney: 0, // Unified: dirty money
  
  setPlayerId: (id: string) => set({ playerId: id }),
  setPlayerName: (name: string) => set({ playerName: name }),
  setLevel: (level: number) => set({ level: Math.min(100, Math.max(1, level)) }),
  setProgress: (progress: number) => set({ progress }),
  setIsGuest: (isGuest: boolean) => set({ isGuest }),
  setProfilePicture: (url: string | null) => set({ profilePicture: url }),
  setBarracoLevel: (level: number) => set({ barracoLevel: Math.max(1, level) }),
  
  // Unified clean money methods
  setCleanMoney: (money: number) => set({ cleanMoney: Math.max(0, money) }),
  addCleanMoney: (amount: number) => set((state) => ({ cleanMoney: Math.max(0, state.cleanMoney + amount) })),
  removeCleanMoney: (amount: number) => set((state) => ({ cleanMoney: Math.max(0, state.cleanMoney - amount) })),
  
  // Unified dirty money methods
  setDirtyMoney: (money: number) => set({ dirtyMoney: Math.max(0, money) }),
  addDirtyMoney: (amount: number) => set((state) => ({ dirtyMoney: Math.max(0, state.dirtyMoney + amount) })),
  removeDirtyMoney: (amount: number) => set((state) => ({ dirtyMoney: Math.max(0, state.dirtyMoney - amount) })),
  
  loadPlayerData: (data: Partial<PlayerState>) => set(data),
  resetPlayer: () => set({
    playerId: null,
    playerName: 'COMANDANTE',
    level: 1,
    progress: 0,
    isGuest: false,
    profilePicture: null,
    barracoLevel: 1,
    cleanMoney: 1000000000,
    dirtyMoney: 0,
  }),
}));
