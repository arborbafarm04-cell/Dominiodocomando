/**
 * SLOT SERVICE
 * 
 * Handles all slot machine related operations:
 * - Spin management
 * - Spin rewards calculation
 * - Spin history tracking
 * 
 * This service is the single source of truth for slot operations.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

const COLLECTION_ID = 'players';

export interface SpinResult {
  spinsUsed: number;
  reward: number;
  multiplier: number;
  timestamp: Date;
}

/**
 * Get player spins count
 */
export async function getPlayerSpins(playerId: string): Promise<number> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return player?.spins || 0;
  } catch (error) {
    console.error('Failed to get player spins:', error);
    throw error;
  }
}

/**
 * Add spins to player
 */
export async function addSpins(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newSpins?: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const currentSpins = await getPlayerSpins(playerId);
    const newSpins = currentSpins + amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    const store = usePlayerStore.getState();
    store.setSpins(newSpins);

    console.log(`[SLOTS] Added ${amount} spins (${reason}) - Total: ${newSpins}`);

    return { success: true, newSpins };
  } catch (error) {
    console.error('Failed to add spins:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove spins from player
 */
export async function removeSpins(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newSpins?: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const currentSpins = await getPlayerSpins(playerId);

    if (currentSpins < amount) {
      return {
        success: false,
        error: `Insufficient spins. Have: ${currentSpins}, Need: ${amount}`,
      };
    }

    const newSpins = currentSpins - amount;

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins: newSpins,
    });

    const store = usePlayerStore.getState();
    store.setSpins(newSpins);

    console.log(`[SLOTS] Removed ${amount} spins (${reason}) - Total: ${newSpins}`);

    return { success: true, newSpins };
  } catch (error) {
    console.error('Failed to remove spins:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Execute spin and calculate reward
 */
export async function executeSpin(
  playerId: string,
  spinsToUse: number = 1
): Promise<{
  success: boolean;
  result?: SpinResult;
  newSpins?: number;
  error?: string;
}> {
  try {
    // Check if player has enough spins
    const currentSpins = await getPlayerSpins(playerId);
    if (currentSpins < spinsToUse) {
      return {
        success: false,
        error: `Insufficient spins. Have: ${currentSpins}, Need: ${spinsToUse}`,
      };
    }

    // Remove spins
    const removeResult = await removeSpins(playerId, spinsToUse, 'SPIN_EXECUTION');
    if (!removeResult.success) {
      return { success: false, error: removeResult.error };
    }

    // Calculate reward (random multiplier between 1x and 10x)
    const multiplier = Math.floor(Math.random() * 10) + 1;
    const baseReward = 1000; // Base reward per spin
    const reward = baseReward * multiplier;

    const result: SpinResult = {
      spinsUsed: spinsToUse,
      reward,
      multiplier,
      timestamp: new Date(),
    };

    console.log(`[SLOTS] Spin result: ${multiplier}x multiplier, ${reward} reward`);

    return {
      success: true,
      result,
      newSpins: removeResult.newSpins,
    };
  } catch (error) {
    console.error('Failed to execute spin:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sync player spins with store
 */
export async function syncPlayerSpins(playerId: string): Promise<void> {
  try {
    const spins = await getPlayerSpins(playerId);
    const store = usePlayerStore.getState();
    store.setSpins(spins);
  } catch (error) {
    console.error('Failed to sync player spins:', error);
    throw error;
  }
}

/**
 * Reset player spins (for testing/reset only)
 */
export async function resetPlayerSpins(
  playerId: string,
  spins: number = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      spins,
    });

    const store = usePlayerStore.getState();
    store.setSpins(spins);

    return { success: true };
  } catch (error) {
    console.error('Failed to reset player spins:', error);
    return { success: false, error: String(error) };
  }
}
