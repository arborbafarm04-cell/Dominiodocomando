import { create } from 'zustand';
import { Players } from '@/entities';

/**
 * MULTIPLAYER STORE - Other Players Data
 * 
 * This store manages data about other players in the game world.
 * It is ephemeral and resets on page reload.
 * 
 * Contains:
 * - List of other players (players record)
 * - Online status tracking
 * 
 * Does NOT contain:
 * - Current player data (use playerStore)
 * - Visual states (use uiStore)
 */

interface MultiplayerState {
  // Record of other players by playerId
  players: Record<string, Players>;
  
  // Actions
  setPlayers: (players: Record<string, Players>) => void;
  addPlayer: (player: Players) => void;
  updatePlayer: (playerId: string, updates: Partial<Players>) => void;
  removePlayer: (playerId: string) => void;
  getPlayer: (playerId: string) => Players | undefined;
  getAllPlayers: () => Players[];
  reset: () => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  players: {},
  
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
  
  removePlayer: (playerId) => set((state) => {
    const newPlayers = { ...state.players };
    delete newPlayers[playerId];
    return { players: newPlayers };
  }),
  
  getPlayer: (playerId) => {
    const state = get();
    return state.players[playerId];
  },
  
  getAllPlayers: () => {
    const state = get();
    return Object.values(state.players);
  },
  
  reset: () => set({ players: {} }),
}));
