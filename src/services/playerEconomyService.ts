/**
 * UNIFIED PLAYER ECONOMY SERVICE
 * 
 * Single source of truth for all financial operations.
 * All money transactions MUST go through this service.
 * 
 * Rules:
 * - Only dirtyMoney and cleanMoney are real balances (stored in Players collection)
 * - All operations are validated before execution
 * - All operations are persisted to database
 * - All operations sync the playerStore
 * - History is recorded for audit trail
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';

export interface TransactionRecord {
  id: string;
  timestamp: Date;
  type: 'add' | 'remove' | 'transfer' | 'launder' | 'invest' | 'bribe';
  moneyType: 'dirty' | 'clean';
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  playerId: string;
}

const COLLECTION_ID = 'players';
const MAX_TRANSACTION_HISTORY = 1000; // Keep last 1000 transactions in memory

// In-memory transaction history (could be persisted to a separate collection later)
let transactionHistory: TransactionRecord[] = [];

/**
 * Get current player's financial state from database
 */
export async function getPlayerFinances(playerId: string) {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    return {
      dirtyMoney: player?.dirtyMoney ?? 0,
      cleanMoney: player?.cleanMoney ?? 0,
      playerId: player?._id,
    };
  } catch (error) {
    console.error('Failed to get player finances:', error);
    throw error;
  }
}

/**
 * Validate that player has sufficient balance
 */
function validateBalance(currentBalance: number, amount: number): boolean {
  return currentBalance >= amount && amount > 0;
}

/**
 * Record transaction in history
 */
function recordTransaction(record: TransactionRecord) {
  transactionHistory.unshift(record);
  // Keep only last MAX_TRANSACTION_HISTORY
  if (transactionHistory.length > MAX_TRANSACTION_HISTORY) {
    transactionHistory = transactionHistory.slice(0, MAX_TRANSACTION_HISTORY);
  }
  console.log(`[ECONOMY] ${record.type.toUpperCase()}: ${record.amount} ${record.moneyType} - ${record.reason}`);
}

/**
 * Get transaction history
 */
export function getTransactionHistory(limit: number = 50): TransactionRecord[] {
  return transactionHistory.slice(0, limit);
}

/**
 * Clear transaction history (for testing/reset)
 */
export function clearTransactionHistory() {
  transactionHistory = [];
}

/**
 * ADD DIRTY MONEY
 * Used for: illegal operations, crimes, black market sales
 */
export async function addDirtyMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    // Get current state
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, newBalance: 0, error: 'Player not found' };
    }

    const currentDirty = player.dirtyMoney ?? 0;
    const newBalance = currentDirty + amount;

    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newBalance,
    });

    // Sync store
    const store = usePlayerStore.getState();
    store._setDirtyMoney(newBalance);

    // Record transaction
    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'add',
      moneyType: 'dirty',
      amount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newBalance,
      playerId,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Failed to add dirty money:', error);
    return { success: false, newBalance: 0, error: String(error) };
  }
}

/**
 * REMOVE DIRTY MONEY
 * Used for: spending, investments, bribes
 */
export async function removeDirtyMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    // Get current state
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, newBalance: 0, error: 'Player not found' };
    }

    const currentDirty = player.dirtyMoney ?? 0;

    // Validate balance
    if (!validateBalance(currentDirty, amount)) {
      return {
        success: false,
        newBalance: currentDirty,
        error: `Insufficient dirty money. Have: ${currentDirty}, Need: ${amount}`,
      };
    }

    const newBalance = currentDirty - amount;

    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newBalance,
    });

    // Sync store
    const store = usePlayerStore.getState();
    store._setDirtyMoney(newBalance);

    // Record transaction
    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'dirty',
      amount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newBalance,
      playerId,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Failed to remove dirty money:', error);
    return { success: false, newBalance: 0, error: String(error) };
  }
}

/**
 * ADD CLEAN MONEY
 * Used for: legitimate earnings, money laundering completion, rewards
 */
export async function addCleanMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    // Get current state
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, newBalance: 0, error: 'Player not found' };
    }

    const currentClean = player.cleanMoney ?? 0;
    const newBalance = currentClean + amount;

    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      cleanMoney: newBalance,
    });

    // Sync store
    const store = usePlayerStore.getState();
    store._setCleanMoney(newBalance);

    // Record transaction
    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'add',
      moneyType: 'clean',
      amount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newBalance,
      playerId,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Failed to add clean money:', error);
    return { success: false, newBalance: 0, error: String(error) };
  }
}

/**
 * REMOVE CLEAN MONEY
 * Used for: spending clean money, investments
 */
export async function removeCleanMoney(
  playerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Amount must be positive' };
    }

    // Get current state
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, newBalance: 0, error: 'Player not found' };
    }

    const currentClean = player.cleanMoney ?? 0;

    // Validate balance
    if (!validateBalance(currentClean, amount)) {
      return {
        success: false,
        newBalance: currentClean,
        error: `Insufficient clean money. Have: ${currentClean}, Need: ${amount}`,
      };
    }

    const newBalance = currentClean - amount;

    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      cleanMoney: newBalance,
    });

    // Sync store
    const store = usePlayerStore.getState();
    store._setCleanMoney(newBalance);

    // Record transaction
    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'clean',
      amount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newBalance,
      playerId,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Failed to remove clean money:', error);
    return { success: false, newBalance: 0, error: String(error) };
  }
}

/**
 * TRANSFER MONEY
 * Convert dirty money to clean money (money laundering)
 */
export async function launderMoney(
  playerId: string,
  dirtyAmount: number,
  cleanAmount: number,
  reason: string
): Promise<{ success: boolean; error?: string; newDirtyBalance?: number; newCleanBalance?: number }> {
  try {
    if (dirtyAmount <= 0 || cleanAmount <= 0) {
      return { success: false, error: 'Amounts must be positive' };
    }

    // Get current state
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const currentDirty = player.dirtyMoney ?? 0;
    const currentClean = player.cleanMoney ?? 0;

    // Validate dirty money balance
    if (!validateBalance(currentDirty, dirtyAmount)) {
      return {
        success: false,
        error: `Insufficient dirty money. Have: ${currentDirty}, Need: ${dirtyAmount}`,
      };
    }

    const newDirtyBalance = currentDirty - dirtyAmount;
    const newCleanBalance = currentClean + cleanAmount;

    // Update database
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney: newDirtyBalance,
      cleanMoney: newCleanBalance,
    });

    // Sync store
    const store = usePlayerStore.getState();
    store._setDirtyMoney(newDirtyBalance);
    store._setCleanMoney(newCleanBalance);

    // Record transactions
    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'launder',
      moneyType: 'dirty',
      amount: dirtyAmount,
      reason,
      balanceBefore: currentDirty,
      balanceAfter: newDirtyBalance,
      playerId,
    });

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'launder',
      moneyType: 'clean',
      amount: cleanAmount,
      reason,
      balanceBefore: currentClean,
      balanceAfter: newCleanBalance,
      playerId,
    });

    return {
      success: true,
      newDirtyBalance,
      newCleanBalance,
    };
  } catch (error) {
    console.error('Failed to launder money:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * SYNC PLAYER FINANCES WITH STORE
 * Call this when loading player data to ensure store is in sync
 */
export async function syncPlayerFinances(playerId: string): Promise<void> {
  try {
    const finances = await getPlayerFinances(playerId);
    const store = usePlayerStore.getState();
    store._setDirtyMoney(finances.dirtyMoney);
    store._setCleanMoney(finances.cleanMoney);
  } catch (error) {
    console.error('Failed to sync player finances:', error);
  }
}

/**
 * RESET PLAYER FINANCES (for testing/reset only)
 */
export async function resetPlayerFinances(
  playerId: string,
  dirtyMoney: number = 0,
  cleanMoney: number = 0
): Promise<{ success: boolean; error?: string }> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      dirtyMoney,
      cleanMoney,
    });

    const store = usePlayerStore.getState();
    store._setDirtyMoney(dirtyMoney);
    store._setCleanMoney(cleanMoney);

    recordTransaction({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'remove',
      moneyType: 'dirty',
      amount: 0,
      reason: 'RESET',
      balanceBefore: 0,
      balanceAfter: dirtyMoney,
      playerId,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to reset player finances:', error);
    return { success: false, error: String(error) };
  }
}
