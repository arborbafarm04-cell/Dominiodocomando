/**
 * INVENTORY SERVICE
 * 
 * Handles all inventory-related operations:
 * - Loading inventory data
 * - Adding/removing items
 * - Inventory synchronization
 * 
 * This service is the single source of truth for inventory operations.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

const COLLECTION_ID = 'players';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

/**
 * Get player inventory
 */
export async function getPlayerInventory(playerId: string): Promise<InventoryItem[]> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player || !player.inventory) {
      return [];
    }

    try {
      return JSON.parse(player.inventory);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Failed to get player inventory:', error);
    throw error;
  }
}

/**
 * Add item to inventory
 */
export async function addInventoryItem(
  playerId: string,
  item: InventoryItem
): Promise<{ success: boolean; inventory?: InventoryItem[]; error?: string }> {
  try {
    const inventory = await getPlayerInventory(playerId);

    // Check if item already exists
    const existingItem = inventory.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      inventory.push(item);
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      inventory: JSON.stringify(inventory),
    });

    return { success: true, inventory };
  } catch (error) {
    console.error('Failed to add inventory item:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove item from inventory
 */
export async function removeInventoryItem(
  playerId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; inventory?: InventoryItem[]; error?: string }> {
  try {
    const inventory = await getPlayerInventory(playerId);

    const itemIndex = inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in inventory' };
    }

    const item = inventory[itemIndex];
    if (item.quantity < quantity) {
      return {
        success: false,
        error: `Insufficient quantity. Have: ${item.quantity}, Need: ${quantity}`,
      };
    }

    item.quantity -= quantity;
    if (item.quantity <= 0) {
      inventory.splice(itemIndex, 1);
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      inventory: JSON.stringify(inventory),
    });

    return { success: true, inventory };
  } catch (error) {
    console.error('Failed to remove inventory item:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Clear inventory
 */
export async function clearInventory(playerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      inventory: JSON.stringify([]),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to clear inventory:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get inventory item count
 */
export async function getInventoryItemCount(playerId: string, itemId: string): Promise<number> {
  try {
    const inventory = await getPlayerInventory(playerId);
    const item = inventory.find((i) => i.id === itemId);
    return item?.quantity || 0;
  } catch (error) {
    console.error('Failed to get inventory item count:', error);
    throw error;
  }
}
