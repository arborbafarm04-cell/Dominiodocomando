/**
 * LUXURY SERVICE
 * 
 * Handles all luxury items related operations:
 * - Loading luxury items
 * - Purchasing luxury items
 * - Managing owned luxury items
 * - Calculating bonuses from luxury items
 * 
 * This service is the single source of truth for luxury operations.
 */

import { BaseCrudService } from '@/integrations';
import { Players, ItensdeLuxo } from '@/entities';

const PLAYERS_COLLECTION = 'players';
const LUXURY_COLLECTION = 'itensdeluxo';

export interface OwnedLuxuryItem {
  itemId: string;
  purchaseDate: Date;
  level: number;
}

/**
 * Load all luxury items from database
 */
export async function loadLuxuryItems(): Promise<ItensdeLuxo[]> {
  try {
    const result = await BaseCrudService.getAll<ItensdeLuxo>(LUXURY_COLLECTION);
    return result.items || [];
  } catch (error) {
    console.error('Failed to load luxury items:', error);
    throw error;
  }
}

/**
 * Get luxury item by ID
 */
export async function getLuxuryItem(itemId: string): Promise<ItensdeLuxo | null> {
  try {
    const item = await BaseCrudService.getById<ItensdeLuxo>(LUXURY_COLLECTION, itemId);
    return item || null;
  } catch (error) {
    console.error('Failed to get luxury item:', error);
    throw error;
  }
}

/**
 * Get player's owned luxury items
 */
export async function getOwnedLuxuryItems(playerId: string): Promise<OwnedLuxuryItem[]> {
  try {
    const player = await BaseCrudService.getById<Players>(PLAYERS_COLLECTION, playerId);
    if (!player || !player.ownedLuxuryItems) {
      return [];
    }

    try {
      return JSON.parse(player.ownedLuxuryItems);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Failed to get owned luxury items:', error);
    throw error;
  }
}

/**
 * Purchase luxury item
 */
export async function purchaseLuxuryItem(
  playerId: string,
  itemId: string,
  cost: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if player already owns this item
    const ownedItems = await getOwnedLuxuryItems(playerId);
    if (ownedItems.some((item) => item.itemId === itemId)) {
      return { success: false, error: 'You already own this item' };
    }

    // Get luxury item details
    const luxuryItem = await getLuxuryItem(itemId);
    if (!luxuryItem) {
      return { success: false, error: 'Luxury item not found' };
    }

    // Add to owned items
    const newOwnedItem: OwnedLuxuryItem = {
      itemId,
      purchaseDate: new Date(),
      level: luxuryItem.level || 1,
    };

    ownedItems.push(newOwnedItem);

    // Update player
    await BaseCrudService.update(PLAYERS_COLLECTION, {
      _id: playerId,
      ownedLuxuryItems: JSON.stringify(ownedItems),
    });

    console.log(`[LUXURY] Purchased item: ${luxuryItem.itemName} for ${cost}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to purchase luxury item:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if player owns luxury item
 */
export async function ownsLuxuryItem(playerId: string, itemId: string): Promise<boolean> {
  try {
    const ownedItems = await getOwnedLuxuryItems(playerId);
    return ownedItems.some((item) => item.itemId === itemId);
  } catch (error) {
    console.error('Failed to check luxury item ownership:', error);
    return false;
  }
}

/**
 * Get total bonus from owned luxury items
 */
export async function calculateLuxuryBonus(playerId: string): Promise<{
  moneyMultiplier: number;
  spinsBonus: number;
  levelBonus: number;
}> {
  try {
    const ownedItems = await getOwnedLuxuryItems(playerId);
    let moneyMultiplier = 1;
    let spinsBonus = 0;
    let levelBonus = 0;

    for (const ownedItem of ownedItems) {
      const luxuryItem = await getLuxuryItem(ownedItem.itemId);
      if (luxuryItem) {
        // Apply bonuses (these would be stored in luxury items)
        // For now, using default values
        moneyMultiplier += 0.1; // 10% per item
        spinsBonus += 10; // 10 spins per item
      }
    }

    return { moneyMultiplier, spinsBonus, levelBonus };
  } catch (error) {
    console.error('Failed to calculate luxury bonus:', error);
    return { moneyMultiplier: 1, spinsBonus: 0, levelBonus: 0 };
  }
}

/**
 * Remove luxury item from owned items
 */
export async function removeLuxuryItem(
  playerId: string,
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ownedItems = await getOwnedLuxuryItems(playerId);
    const filteredItems = ownedItems.filter((item) => item.itemId !== itemId);

    if (filteredItems.length === ownedItems.length) {
      return { success: false, error: 'Item not found in owned items' };
    }

    await BaseCrudService.update(PLAYERS_COLLECTION, {
      _id: playerId,
      ownedLuxuryItems: JSON.stringify(filteredItems),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove luxury item:', error);
    return { success: false, error: String(error) };
  }
}
