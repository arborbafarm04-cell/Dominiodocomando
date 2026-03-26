/**
 * PLAYER PROFILE SERVICE
 * 
 * Handles all player profile-related operations:
 * - Loading player profile data
 * - Updating player profile information
 * - Syncing profile data with store
 * 
 * This service is the single source of truth for player profile operations.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

const COLLECTION_ID = 'players';

/**
 * Load player profile from database
 */
export async function loadPlayerProfile(playerId: string): Promise<Players | null> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return player || null;
  } catch (error) {
    console.error('Failed to load player profile:', error);
    throw error;
  }
}

/**
 * Sync player profile with store
 */
export async function syncPlayerProfile(playerId: string): Promise<void> {
  try {
    const player = await loadPlayerProfile(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const store = usePlayerStore.getState();
    store.loadPlayerData({
      playerId: player.playerId || playerId,
      playerName: player.playerName || 'COMANDANTE',
      level: player.level || 1,
      progress: player.progress || 0,
      barracoLevel: player.barracoLevel || 1,
      profilePicture: player.profilePicture || null,
      isGuest: player.isGuest || false,
      spins: player.spins || 0,
      cleanMoney: player.cleanMoney || 0,
      dirtyMoney: player.dirtyMoney || 0,
    });
  } catch (error) {
    console.error('Failed to sync player profile:', error);
    throw error;
  }
}

/**
 * Update player profile information
 */
export async function updatePlayerProfile(
  playerId: string,
  updates: Partial<Players>
): Promise<void> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      ...updates,
    });

    // Sync store with updated data
    const store = usePlayerStore.getState();
    if (updates.playerName) store.setPlayerName(updates.playerName);
    if (updates.level !== undefined) store.setLevel(updates.level);
    if (updates.progress !== undefined) store.setProgress(updates.progress);
    if (updates.barracoLevel !== undefined) store.setBarracoLevel(updates.barracoLevel);
    if (updates.profilePicture !== undefined) store.setProfilePicture(updates.profilePicture);
  } catch (error) {
    console.error('Failed to update player profile:', error);
    throw error;
  }
}

/**
 * Get player profile from store (cached)
 */
export function getPlayerProfileFromStore() {
  const store = usePlayerStore.getState();
  return {
    playerId: store.playerId,
    playerName: store.playerName,
    level: store.level,
    progress: store.progress,
    barracoLevel: store.barracoLevel,
    profilePicture: store.profilePicture,
    isGuest: store.isGuest,
  };
}
