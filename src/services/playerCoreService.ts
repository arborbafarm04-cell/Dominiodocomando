/**
 * PLAYER CORE SERVICE - Central Player Data Management
 *
 * This is the SINGLE SOURCE OF TRUTH for all player operations.
 * All other services depend on this.
 *
 * CRITICAL: Never use BaseCrudService directly in components.
 * Always go through this service.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

const COLLECTION_ID = 'players';

/**
 * Get player by ID from database
 */
export async function getPlayer(playerId: string): Promise<Players | null> {
  try {
    return await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
  } catch (error) {
    console.error(`Failed to get player ${playerId}:`, error);
    return null;
  }
}

/**
 * Save/update player in database
 * Automatically updates timestamps
 */
export async function savePlayer(player: Players): Promise<Players> {
  const now = new Date().toISOString();

  const updated: Players = {
    ...player,
    updatedAt: now,
    lastUpdated: now,
  };

  return BaseCrudService.update<Players>(COLLECTION_ID, updated);
}

/**
 * Create new player in database
 */
export async function createPlayer(playerData: Partial<Players>): Promise<Players> {
  const now = new Date().toISOString();

  const newPlayer: Players = {
    _id: playerData._id || crypto.randomUUID(),

    email: playerData.email || '',
    playerId: playerData.playerId || playerData.email || '',
    externalPlayerId: playerData.externalPlayerId,

    playerName: playerData.playerName || 'Player',
    profilePicture: playerData.profilePicture || '',
    isGuest: playerData.isGuest ?? false,

    level: playerData.level ?? 1,
    progress: playerData.progress ?? 0,

    dirtyMoney: playerData.dirtyMoney ?? 0,
    cleanMoney: playerData.cleanMoney ?? 0,
    spins: playerData.spins ?? 10,

    barracoLevel: playerData.barracoLevel ?? 1,

    investments: playerData.investments ?? '{}',
    skillTrees:
      playerData.skillTrees ??
      JSON.stringify({
        attack: {},
        defense: {},
        intelligence: {},
        respeit: {},
      }),
    inventory: playerData.inventory ?? '[]',
    ownedLuxuryItems: playerData.ownedLuxuryItems ?? '[]',
    comercios: playerData.comercios ?? '{}',

    lastLoginAt: playerData.lastLoginAt ?? now,
    createdAt: playerData.createdAt ?? now,
    updatedAt: now,
    lastUpdated: now,

    _createdDate: playerData._createdDate,
    _updatedDate: playerData._updatedDate,
  };

  return BaseCrudService.create<Players>(COLLECTION_ID, newPlayer);
}

/**
 * Delete player from database
 */
export async function deletePlayer(playerId: string): Promise<void> {
  await BaseCrudService.delete(COLLECTION_ID, playerId);
}

/**
 * Get all players (for admin/multiplayer features)
 */
export async function getAllPlayers(): Promise<Players[]> {
  const result = await BaseCrudService.getAll<Players>(COLLECTION_ID);
  return result.items || [];
}