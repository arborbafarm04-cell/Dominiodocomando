/**
 * MULTIPLAYER PRESENCE SERVICE
 * 
 * Handles all multiplayer presence-related operations:
 * - Updating player presence
 * - Loading online players
 * - Managing player status
 * - Tracking player location
 * 
 * This service is the single source of truth for multiplayer presence.
 */

import { BaseCrudService } from '@/integrations';
import { PlayerPresence } from '@/entities';

const COLLECTION_ID = 'playerpresence';

export interface PlayerStatus {
  playerId: string;
  mapPosition: string;
  status: 'online' | 'offline' | 'away';
  lastSeenAt: Date;
  isOnline: boolean;
}

/**
 * Update player presence
 */
export async function updatePlayerPresence(
  playerId: string,
  mapPosition: string,
  status: 'online' | 'offline' | 'away' = 'online'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if presence record exists
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const existingPresence = result.items?.find((p) => p.playerId === playerId);

    const presenceData: PlayerPresence = {
      _id: existingPresence?._id || crypto.randomUUID(),
      playerId,
      mapPosition,
      status,
      lastSeenAt: new Date(),
      isOnline: status === 'online',
      complexStatus: `${status}:${mapPosition}`,
    };

    if (existingPresence) {
      await BaseCrudService.update(COLLECTION_ID, presenceData);
    } else {
      await BaseCrudService.create(COLLECTION_ID, presenceData);
    }

    console.log(`[PRESENCE] Updated ${playerId} - ${status} at ${mapPosition}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update player presence:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get player presence
 */
export async function getPlayerPresence(playerId: string): Promise<PlayerStatus | null> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const presence = result.items?.find((p) => p.playerId === playerId);

    if (!presence) {
      return null;
    }

    return {
      playerId: presence.playerId || playerId,
      mapPosition: presence.mapPosition || 'unknown',
      status: (presence.status as 'online' | 'offline' | 'away') || 'offline',
      lastSeenAt: new Date(presence.lastSeenAt || new Date()),
      isOnline: presence.isOnline || false,
    };
  } catch (error) {
    console.error('Failed to get player presence:', error);
    return null;
  }
}

/**
 * Get all online players
 */
export async function getOnlinePlayers(): Promise<PlayerStatus[]> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const onlinePlayers = result.items?.filter((p) => p.isOnline) || [];

    return onlinePlayers.map((p) => ({
      playerId: p.playerId || '',
      mapPosition: p.mapPosition || 'unknown',
      status: 'online' as const,
      lastSeenAt: new Date(p.lastSeenAt || new Date()),
      isOnline: true,
    }));
  } catch (error) {
    console.error('Failed to get online players:', error);
    return [];
  }
}

/**
 * Get players in specific location
 */
export async function getPlayersInLocation(mapPosition: string): Promise<PlayerStatus[]> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const playersInLocation = result.items?.filter(
      (p) => p.mapPosition === mapPosition && p.isOnline
    ) || [];

    return playersInLocation.map((p) => ({
      playerId: p.playerId || '',
      mapPosition: p.mapPosition || mapPosition,
      status: 'online' as const,
      lastSeenAt: new Date(p.lastSeenAt || new Date()),
      isOnline: true,
    }));
  } catch (error) {
    console.error('Failed to get players in location:', error);
    return [];
  }
}

/**
 * Set player offline
 */
export async function setPlayerOffline(playerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await BaseCrudService.getAll<PlayerPresence>(COLLECTION_ID);
    const presence = result.items?.find((p) => p.playerId === playerId);

    if (!presence) {
      return { success: false, error: 'Player presence not found' };
    }

    await BaseCrudService.update(COLLECTION_ID, {
      _id: presence._id,
      status: 'offline',
      isOnline: false,
      lastSeenAt: new Date(),
    });

    console.log(`[PRESENCE] Set ${playerId} offline`);

    return { success: true };
  } catch (error) {
    console.error('Failed to set player offline:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get player count in location
 */
export async function getPlayerCountInLocation(mapPosition: string): Promise<number> {
  try {
    const players = await getPlayersInLocation(mapPosition);
    return players.length;
  } catch (error) {
    console.error('Failed to get player count in location:', error);
    return 0;
  }
}

/**
 * Get total online players count
 */
export async function getTotalOnlinePlayersCount(): Promise<number> {
  try {
    const players = await getOnlinePlayers();
    return players.length;
  } catch (error) {
    console.error('Failed to get total online players count:', error);
    return 0;
  }
}
