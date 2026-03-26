/**
 * CENTRALIZED PLAYER DATA SERVICE
 * 
 * This service is the SINGLE SOURCE OF TRUTH for all player data.
 * All components must use this service to read/write player data.
 * 
 * Data Flow:
 * 1. Database (Players collection) = Source of Truth
 * 2. playerStore (Zustand) = In-memory cache
 * 3. Components = Read from playerStore, write through this service
 * 
 * NEVER:
 * - Access localStorage directly for player data
 * - Use separate stores (dirtyMoneyStore, cleanMoneyStore)
 * - Update playerStore directly without syncing to DB
 */

import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";
import { usePlayerStore } from "@/store/playerStore";

const COLLECTION_ID = "players";

/**
 * Load player from database and sync to store
 */
export async function loadPlayerFromDatabase(playerId: string): Promise<Players | null> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    
    if (player) {
      // Sync to store
      const store = usePlayerStore.getState();
      store.loadPlayerData({
        playerId: player._id,
        playerName: player.playerName || 'COMANDANTE',
        level: player.level || 1,
        progress: player.progress || 0,
        isGuest: player.isGuest || false,
        profilePicture: player.profilePicture || null,
        barracoLevel: player.barracoLevel || 1,
        cleanMoney: player.cleanMoney || 0,
        dirtyMoney: player.dirtyMoney || 0,
        playerMoney: player.dirtyMoney || 0, // playerMoney = dirtyMoney
      });
    }
    
    return player;
  } catch (error) {
    console.error('Error loading player from database:', error);
    return null;
  }
}

/**
 * Update player in database and sync to store
 */
export async function updatePlayerInDatabase(
  playerId: string,
  updates: Partial<Players>
): Promise<Players | null> {
  try {
    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      ...updates,
      lastUpdated: new Date().toISOString(),
    });

    // Reload from database to ensure consistency
    return await loadPlayerFromDatabase(playerId);
  } catch (error) {
    console.error('Error updating player in database:', error);
    return null;
  }
}

/**
 * Get current player from store (cached in-memory)
 */
export function getCurrentPlayerFromStore(): ReturnType<typeof usePlayerStore.getState> {
  return usePlayerStore.getState();
}

/**
 * Update money (dirty money = playerMoney)
 */
export async function updatePlayerMoney(
  playerId: string,
  dirtyMoney: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setDirtyMoney(Math.max(0, dirtyMoney));
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      dirtyMoney: Math.max(0, dirtyMoney),
    });
  } catch (error) {
    console.error('Error updating player money:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update clean money
 */
export async function updateCleanMoney(
  playerId: string,
  cleanMoney: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setCleanMoney(Math.max(0, cleanMoney));
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      cleanMoney: Math.max(0, cleanMoney),
    });
  } catch (error) {
    console.error('Error updating clean money:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update level and progress
 */
export async function updatePlayerProgress(
  playerId: string,
  level: number,
  progress: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setLevel(level);
  store.setProgress(progress);
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      level,
      progress,
    });
  } catch (error) {
    console.error('Error updating player progress:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Update barraco level
 */
export async function updateBarracoLevel(
  playerId: string,
  barracoLevel: number
): Promise<void> {
  const store = usePlayerStore.getState();
  
  // Update store immediately (optimistic)
  store.setBarracoLevel(barracoLevel);
  
  // Sync to database
  try {
    await updatePlayerInDatabase(playerId, {
      barracoLevel,
    });
  } catch (error) {
    console.error('Error updating barraco level:', error);
    // On error, reload from database to revert
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Sync all player data to database
 * Call this periodically or on page unload
 */
export async function syncPlayerToDatabase(playerId: string): Promise<void> {
  try {
    const store = usePlayerStore.getState();
    
    await updatePlayerInDatabase(playerId, {
      playerName: store.playerName,
      level: store.level,
      progress: store.progress,
      dirtyMoney: store.dirtyMoney,
      cleanMoney: store.cleanMoney,
      barracoLevel: store.barracoLevel,
      isGuest: store.isGuest,
      profilePicture: store.profilePicture,
    });
  } catch (error) {
    console.error('Error syncing player to database:', error);
  }
}

/**
 * Create new player in database
 */
export async function createNewPlayer(playerData: Partial<Players>): Promise<Players | null> {
  try {
    if (!playerData._id) {
      playerData._id = crypto.randomUUID();
    }

    const newPlayer: Players = {
      _id: playerData._id,
      playerName: playerData.playerName || 'COMANDANTE',
      level: playerData.level || 1,
      progress: playerData.progress || 0,
      dirtyMoney: playerData.dirtyMoney || 0,
      cleanMoney: playerData.cleanMoney || 0,
      barracoLevel: playerData.barracoLevel || 1,
      isGuest: playerData.isGuest || false,
      profilePicture: playerData.profilePicture || null,
    };

    await BaseCrudService.create(COLLECTION_ID, newPlayer);
    
    // Sync to store
    await loadPlayerFromDatabase(newPlayer._id);
    
    return newPlayer;
  } catch (error) {
    console.error('Error creating new player:', error);
    return null;
  }
}

/**
 * Delete player from database
 */
export async function deletePlayerFromDatabase(playerId: string): Promise<void> {
  try {
    await BaseCrudService.delete(COLLECTION_ID, playerId);
    
    // Reset store
    const store = usePlayerStore.getState();
    store.resetPlayer();
  } catch (error) {
    console.error('Error deleting player:', error);
  }
}
