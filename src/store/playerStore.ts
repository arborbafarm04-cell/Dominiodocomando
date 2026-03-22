import { create } from 'zustand';

interface PlayerState {
  playerId: string | null;
  playerName: string;
  level: number;
  progress: number;
  isGuest: boolean;
  profilePicture: string | null;
  barracoLevel: number;
  playerMoney: number;
  
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setLevel: (level: number) => void;
  setProgress: (progress: number) => void;
  setIsGuest: (isGuest: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  setBarracoLevel: (level: number) => void;
  setPlayerMoney: (money: number) => void;
  addPlayerMoney: (amount: number) => void;
  
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
  playerMoney: 50000,
  
  setPlayerId: (id: string) => set({ playerId: id }),
  setPlayerName: (name: string) => set({ playerName: name }),
  setLevel: (level: number) => set({ level: Math.min(100, Math.max(1, level)) }),
  setProgress: (progress: number) => set({ progress }),
  setIsGuest: (isGuest: boolean) => set({ isGuest }),
  setProfilePicture: (url: string | null) => set({ profilePicture: url }),
  setBarracoLevel: (level: number) => set({ barracoLevel: Math.max(1, level) }),
  setPlayerMoney: (money: number) => set({ playerMoney: Math.max(0, money) }),
  addPlayerMoney: (amount: number) => set((state) => ({ playerMoney: Math.max(0, state.playerMoney + amount) })),
  
  loadPlayerData: (data: Partial<PlayerState>) => set(data),
  resetPlayer: () => set({
    playerId: null,
    playerName: 'COMANDANTE',
    level: 1,
    progress: 0,
    isGuest: false,
    profilePicture: null,
    barracoLevel: 1,
    playerMoney: 50000,
  }),
}));
