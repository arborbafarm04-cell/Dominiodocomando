import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Players } from '@/entities';

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
  // Game state fields (migrated from useGameStore)
  spins: number;
  multiplier: number;
  hasInitialized: boolean;
  isSpinning: boolean;
  lastResult: string[] | null;
  // Player records for multiplayer
  players: Record<string, Players>;
  // Spin Vault fields (consolidated from spinVaultStore)
  lastGainTime: number;
  // Luxury items (consolidated from localStorage)
  ownedLuxuryItemIds: string[];
  // Additional player data loaded from database
  inventory?: Record<string, any>;
  investments?: Record<string, any>;
  cooldowns?: Record<string, number>;
  passiveBonuses?: Record<string, number>;
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
  // These are called by playerEconomyService to sync state after DB updates
  _setCleanMoney: (money: number) => void;
  _setDirtyMoney: (money: number) => void;
  
  // Game state methods (migrated from useGameStore)
  setSpins: (spins: number) => void;
  addSpins: (amount: number) => void;
  subtractSpins: (amount: number) => void;
  setMultiplier: (multiplier: number) => void;
  setHasInitialized: (initialized: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  setLastResult: (result: string[] | null) => void;
  setPlayers: (players: Record<string, Players>) => void;
  addPlayer: (player: Players) => void;
  updatePlayer: (playerId: string, updates: Partial<Players>) => void;
  
  // Spin Vault methods (consolidated from spinVaultStore)
  setLastGainTime: (time: number) => void;
  updateLastGainTime: () => void;
  getTimeUntilNextGain: () => number;
  
  // Luxury items methods (consolidated from localStorage)
  setOwnedLuxuryItems: (itemIds: string[]) => void;
  addOwnedLuxuryItem: (itemId: string) => void;
  isLuxuryItemOwned: (itemId: string) => boolean;
  
  loadPlayerData: (data: Partial<PlayerState>) => void;
  resetPlayer: () => void;
}

const initialState = {
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
  multiplier: 1,
  hasInitialized: false,
  isSpinning: false,
  lastResult: null,
  players: {},
  lastGainTime: 0,
  ownedLuxuryItemIds: [],
  inventory: {},
  investments: {},
  cooldowns: {},
  passiveBonuses: {},
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
       
       // Game state methods
       setSpins: (spins) => set({ spins }),
       addSpins: (amount: number) => set((state) => ({ spins: state.spins + amount })),
       subtractSpins: (amount: number) => set((state) => ({ spins: Math.max(0, state.spins - amount) })),
       setMultiplier: (multiplier) => set({ multiplier }),
       setHasInitialized: (initialized) => set({ hasInitialized: initialized }),
       setIsSpinning: (spinning) => set({ isSpinning: spinning }),
       setLastResult: (result) => set({ lastResult: result }),
       setPlayers: (players) => set({ players }),
       addPlayer: (player) => set((state) => ({
         players: { ...state.players, [player.playerId || player._id]: player }
       })),
       updatePlayer: (playerId, updates) => set((state) => ({
         players: {
           ...state.players,
           [playerId]: { ...state.players[playerId], ...updates }
         }
       })),
       
       // Spin Vault methods (consolidated from spinVaultStore)
       setLastGainTime: (time: number) => set({ lastGainTime: time }),
       updateLastGainTime: () => set({ lastGainTime: Date.now() }),
       getTimeUntilNextGain: () => {
         const state = usePlayerStore.getState();
         const timeSinceLastGain = Date.now() - state.lastGainTime;
         const timeUntilNextGain = 60000 - (timeSinceLastGain % 60000);
         return Math.max(0, timeUntilNextGain);
       },
       
       // Luxury items methods (consolidated from localStorage)
       setOwnedLuxuryItems: (itemIds: string[]) => set({ ownedLuxuryItemIds: itemIds }),
       addOwnedLuxuryItem: (itemId: string) => set((state) => {
         if (!state.ownedLuxuryItemIds.includes(itemId)) {
           return { ownedLuxuryItemIds: [...state.ownedLuxuryItemIds, itemId] };
         }
         return state;
       }),
       isLuxuryItemOwned: (itemId: string) => {
         const state = usePlayerStore.getState();
         return state.ownedLuxuryItemIds.includes(itemId);
       },
       
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
