import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Faction {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: string[]; // Array of player IDs
  memberNames: string[]; // Array of player names
  createdAt: Date;
  color: number;
  description?: string;
}

export interface FactionInvite {
  id: string;
  factionId: string;
  playerId: string;
  playerName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface FactionState {
  factions: Record<string, Faction>;
  invites: Record<string, FactionInvite>;
  playerFactionId: string | null; // Current player's faction ID
  
  // Faction management
  createFaction: (name: string, leaderId: string, leaderName: string, color: number, description?: string) => Faction;
  deleteFaction: (factionId: string) => void;
  updateFaction: (factionId: string, updates: Partial<Faction>) => void;
  
  // Member management
  addMember: (factionId: string, playerId: string, playerName: string) => void;
  removeMember: (factionId: string, playerId: string) => void;
  
  // Invite management
  createInvite: (factionId: string, playerId: string, playerName: string) => FactionInvite;
  acceptInvite: (inviteId: string, factionId: string, playerId: string, playerName: string) => void;
  rejectInvite: (inviteId: string) => void;
  
  // Player faction
  setPlayerFaction: (factionId: string | null) => void;
  getFaction: (factionId: string) => Faction | undefined;
  getPlayerFaction: () => Faction | undefined;
  
  // Utilities
  reset: () => void;
}

const initialState = {
  factions: {},
  invites: {},
  playerFactionId: null,
};

export const useFactionStore = create<FactionState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      createFaction: (name, leaderId, leaderName, color, description) => {
        const faction: Faction = {
          id: crypto.randomUUID(),
          name,
          leaderId,
          leaderName,
          members: [leaderId],
          memberNames: [leaderName],
          createdAt: new Date(),
          color,
          description,
        };
        
        set((state) => ({
          factions: {
            ...state.factions,
            [faction.id]: faction,
          },
          playerFactionId: faction.id,
        }));
        
        return faction;
      },
      
      deleteFaction: (factionId) => {
        set((state) => {
          const newFactions = { ...state.factions };
          delete newFactions[factionId];
          
          return {
            factions: newFactions,
            playerFactionId: state.playerFactionId === factionId ? null : state.playerFactionId,
          };
        });
      },
      
      updateFaction: (factionId, updates) => {
        set((state) => ({
          factions: {
            ...state.factions,
            [factionId]: {
              ...state.factions[factionId],
              ...updates,
            },
          },
        }));
      },
      
      addMember: (factionId, playerId, playerName) => {
        set((state) => {
          const faction = state.factions[factionId];
          if (!faction) return state;
          
          // Check if already a member
          if (faction.members.includes(playerId)) return state;
          
          return {
            factions: {
              ...state.factions,
              [factionId]: {
                ...faction,
                members: [...faction.members, playerId],
                memberNames: [...faction.memberNames, playerName],
              },
            },
          };
        });
      },
      
      removeMember: (factionId, playerId) => {
        set((state) => {
          const faction = state.factions[factionId];
          if (!faction) return state;
          
          const memberIndex = faction.members.indexOf(playerId);
          if (memberIndex === -1) return state;
          
          const newMembers = faction.members.filter((id) => id !== playerId);
          const newMemberNames = faction.memberNames.filter((_, i) => i !== memberIndex);
          
          return {
            factions: {
              ...state.factions,
              [factionId]: {
                ...faction,
                members: newMembers,
                memberNames: newMemberNames,
              },
            },
            playerFactionId: state.playerFactionId === factionId && playerId === state.playerFactionId ? null : state.playerFactionId,
          };
        });
      },
      
      createInvite: (factionId, playerId, playerName) => {
        const invite: FactionInvite = {
          id: crypto.randomUUID(),
          factionId,
          playerId,
          playerName,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set((state) => ({
          invites: {
            ...state.invites,
            [invite.id]: invite,
          },
        }));
        
        return invite;
      },
      
      acceptInvite: (inviteId, factionId, playerId, playerName) => {
        set((state) => {
          const newInvites = { ...state.invites };
          if (newInvites[inviteId]) {
            newInvites[inviteId].status = 'accepted';
          }
          
          const faction = state.factions[factionId];
          if (!faction) return state;
          
          return {
            invites: newInvites,
            factions: {
              ...state.factions,
              [factionId]: {
                ...faction,
                members: [...faction.members, playerId],
                memberNames: [...faction.memberNames, playerName],
              },
            },
            playerFactionId: playerId === playerId ? factionId : state.playerFactionId,
          };
        });
      },
      
      rejectInvite: (inviteId) => {
        set((state) => {
          const newInvites = { ...state.invites };
          if (newInvites[inviteId]) {
            newInvites[inviteId].status = 'rejected';
          }
          return { invites: newInvites };
        });
      },
      
      setPlayerFaction: (factionId) => {
        set({ playerFactionId: factionId });
      },
      
      getFaction: (factionId) => {
        return get().factions[factionId];
      },
      
      getPlayerFaction: () => {
        const state = get();
        if (!state.playerFactionId) return undefined;
        return state.factions[state.playerFactionId];
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'faction-store',
    }
  )
);
