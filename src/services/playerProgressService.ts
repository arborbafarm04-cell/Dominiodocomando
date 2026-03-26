/**
 * PLAYER PROGRESS SERVICE
 * 
 * Handles all player progression-related operations:
 * - Level progression
 * - Experience/progress tracking
 * - Barraco level management
 * - Skill tree progression
 * 
 * This service is the single source of truth for player progression.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

const COLLECTION_ID = 'players';

/**
 * Get player progress data
 */
export async function getPlayerProgress(playerId: string) {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    return {
      level: player.level || 1,
      progress: player.progress || 0,
      barracoLevel: player.barracoLevel || 1,
    };
  } catch (error) {
    console.error('Failed to get player progress:', error);
    throw error;
  }
}

/**
 * Update player level
 */
export async function updatePlayerLevel(
  playerId: string,
  newLevel: number
): Promise<{ success: boolean; newLevel?: number; error?: string }> {
  try {
    if (newLevel < 1 || newLevel > 100) {
      return { success: false, error: 'Level must be between 1 and 100' };
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      level: newLevel,
    });

    const store = usePlayerStore.getState();
    store.setLevel(newLevel);

    return { success: true, newLevel };
  } catch (error) {
    console.error('Failed to update player level:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update player progress
 */
export async function updatePlayerProgress(
  playerId: string,
  newProgress: number
): Promise<{ success: boolean; newProgress?: number; error?: string }> {
  try {
    if (newProgress < 0 || newProgress > 100) {
      return { success: false, error: 'Progress must be between 0 and 100' };
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      progress: newProgress,
    });

    const store = usePlayerStore.getState();
    store.setProgress(newProgress);

    return { success: true, newProgress };
  } catch (error) {
    console.error('Failed to update player progress:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Add progress to player
 */
export async function addPlayerProgress(
  playerId: string,
  amount: number
): Promise<{ success: boolean; newProgress?: number; error?: string }> {
  try {
    const progress = await getPlayerProgress(playerId);
    const newProgress = Math.min(100, progress.progress + amount);

    return updatePlayerProgress(playerId, newProgress);
  } catch (error) {
    console.error('Failed to add player progress:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update barraco level
 */
export async function updateBarracoLevel(
  playerId: string,
  newLevel: number
): Promise<{ success: boolean; newLevel?: number; error?: string }> {
  try {
    if (newLevel < 1) {
      return { success: false, error: 'Barraco level must be at least 1' };
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      barracoLevel: newLevel,
    });

    const store = usePlayerStore.getState();
    store.setBarracoLevel(newLevel);

    return { success: true, newLevel };
  } catch (error) {
    console.error('Failed to update barraco level:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Increment barraco level
 */
export async function incrementBarracoLevel(
  playerId: string
): Promise<{ success: boolean; newLevel?: number; error?: string }> {
  try {
    const progress = await getPlayerProgress(playerId);
    const newLevel = progress.barracoLevel + 1;

    return updateBarracoLevel(playerId, newLevel);
  } catch (error) {
    console.error('Failed to increment barraco level:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sync player progress with store
 */
export async function syncPlayerProgress(playerId: string): Promise<void> {
  try {
    const progress = await getPlayerProgress(playerId);
    const store = usePlayerStore.getState();

    store.setLevel(progress.level);
    store.setProgress(progress.progress);
    store.setBarracoLevel(progress.barracoLevel);
  } catch (error) {
    console.error('Failed to sync player progress:', error);
    throw error;
  }
}
