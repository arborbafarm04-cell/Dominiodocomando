/**
 * CRITICAL ACTION SERVICE
 * 
 * Handles automatic database saves for critical player actions.
 * This service ensures permanent player data is saved at the right moments,
 * without saving on every small change.
 * 
 * Critical actions that trigger saves:
 * - Login/Logout
 * - Spin completion
 * - Purchase/Trade
 * - Upgrade (barraco, skills, etc.)
 * - Money laundering operation
 * - Reward gain
 * - Profile change (name/photo)
 * - Barraco evolution
 */

import { syncPlayerToDatabase } from './playerDataService';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import { useSkillTreeStore } from '@/store/skillTreeStore';
import { useLuxuryShopStore } from '@/store/luxuryShopStore';
import { useComerciosStore } from '@/store/comerciosStore';

/**
 * Save player data after login
 * Called when player successfully authenticates
 */
export async function saveAfterLogin(playerId: string): Promise<void> {
  console.log('💾 [CRITICAL] Saving after login:', playerId);
  try {
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after login:', error);
  }
}

/**
 * Save player data before logout
 * Called when player is about to leave the game
 */
export async function saveBeforeLogout(playerId: string): Promise<void> {
  console.log('💾 [CRITICAL] Saving before logout:', playerId);
  try {
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving before logout:', error);
  }
}

/**
 * Save player data after spin completion
 * Called when spin vault completes and rewards are given
 */
export async function saveAfterSpin(playerId: string): Promise<void> {
  console.log('💾 [CRITICAL] Saving after spin:', playerId);
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Spins:', playerStore.spins);
    console.log('  - Dirty Money:', playerStore.dirtyMoney);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after spin:', error);
  }
}

/**
 * Save player data after purchase/trade
 * Called when player buys or trades items
 */
export async function saveAfterPurchase(
  playerId: string,
  itemName: string,
  cost: number
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after purchase:', { playerId, itemName, cost });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Clean Money:', playerStore.cleanMoney);
    console.log('  - Dirty Money:', playerStore.dirtyMoney);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after purchase:', error);
  }
}

/**
 * Save player data after upgrade
 * Called when player upgrades barraco, skills, or businesses
 */
export async function saveAfterUpgrade(
  playerId: string,
  upgradeType: string,
  upgradeName: string
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after upgrade:', { playerId, upgradeType, upgradeName });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Barraco Level:', playerStore.barracoLevel);
    console.log('  - Level:', playerStore.level);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after upgrade:', error);
  }
}

/**
 * Save player data after money laundering operation
 * Called when player completes a laundering cycle
 */
export async function saveAfterLaundering(
  playerId: string,
  businessName: string,
  amountLaundered: number
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after laundering:', {
    playerId,
    businessName,
    amountLaundered,
  });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Dirty Money:', playerStore.dirtyMoney);
    console.log('  - Clean Money:', playerStore.cleanMoney);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after laundering:', error);
  }
}

/**
 * Save player data after reward gain
 * Called when player receives rewards (bribery, quest, etc.)
 */
export async function saveAfterReward(
  playerId: string,
  rewardType: string,
  rewardAmount: number
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after reward:', {
    playerId,
    rewardType,
    rewardAmount,
  });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Clean Money:', playerStore.cleanMoney);
    console.log('  - Level:', playerStore.level);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after reward:', error);
  }
}

/**
 * Save player data after profile change
 * Called when player changes name or profile picture
 */
export async function saveAfterProfileChange(
  playerId: string,
  changeType: 'name' | 'photo',
  newValue: string
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after profile change:', {
    playerId,
    changeType,
    newValue,
  });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Player Name:', playerStore.playerName);
    console.log('  - Profile Picture:', playerStore.profilePicture);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after profile change:', error);
  }
}

/**
 * Save player data after barraco evolution
 * Called when player upgrades their barraco
 */
export async function saveAfterBarracoEvolution(
  playerId: string,
  newLevel: number
): Promise<void> {
  console.log('💾 [CRITICAL] Saving after barraco evolution:', { playerId, newLevel });
  try {
    const playerStore = usePlayerStore.getState();
    console.log('  - Barraco Level:', playerStore.barracoLevel);
    console.log('  - Dirty Money:', playerStore.dirtyMoney);
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error saving after barraco evolution:', error);
  }
}

/**
 * Emergency save - called on page unload
 * Ensures all data is saved before player leaves
 */
export async function emergencySave(playerId: string): Promise<void> {
  console.log('💾 [EMERGENCY] Saving all data before unload:', playerId);
  try {
    await syncPlayerToDatabase(playerId);
  } catch (error) {
    console.error('Error in emergency save:', error);
  }
}

/**
 * Setup page unload listener for emergency save
 * Call this once when app initializes
 */
export function setupEmergencySaveListener(playerId: string): void {
  const handleBeforeUnload = () => {
    emergencySave(playerId).catch(console.error);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
