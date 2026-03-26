/**
 * CENTRALIZED PLAYER DATA SERVICE
 *
 * Source of truth:
 * - Database = players collection
 * - playerStore = current session cache only
 *
 * This service ONLY:
 * - loads player from DB
 * - updates player through playerCoreService
 * - syncs playerStore
 *
 * Multiplayer-safe rule:
 * - NEVER save the whole store blindly back to DB
 * - ALWAYS fetch current player from DB first, then merge updates
 */

import { Players } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';
import { getPlayer, savePlayer, createPlayer, deletePlayer } from './playerCoreService';
import { getInitialComercioData } from '@/types/comercios';

/**
 * Load player from database and sync to playerStore
 */
export async function loadPlayerFromDatabase(playerId: string): Promise<Players | null> {
  try {
    const player = await getPlayer(playerId);

    if (!player) return null;

    usePlayerStore.getState().setPlayer(player);
    return player;
  } catch (error) {
    console.error('Error loading player from database:', error);
    return null;
  }
}

/**
 * Update player in database and sync to playerStore
 * Multiplayer-safe: always re-read current DB state first
 */
export async function updatePlayerInDatabase(
  playerId: string,
  updates: Partial<Players>
): Promise<Players | null> {
  try {
    const currentPlayer = await getPlayer(playerId);

    if (!currentPlayer) {
      console.error('Player not found');
      return null;
    }

    const updatedPlayer = await savePlayer({
      ...currentPlayer,
      ...updates,
    });

    usePlayerStore.getState().setPlayer(updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error('Error updating player in database:', error);
    return null;
  }
}

/**
 * Get current player from store
 */
export function getCurrentPlayerFromStore(): Players | null {
  return usePlayerStore.getState().player;
}

/**
 * Update dirty money
 */
export async function updatePlayerMoney(
  playerId: string,
  dirtyMoney: number
): Promise<void> {
  try {
    await updatePlayerInDatabase(playerId, {
      dirtyMoney: Math.max(0, dirtyMoney),
    });
  } catch (error) {
    console.error('Error updating player money:', error);
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
  try {
    await updatePlayerInDatabase(playerId, {
      cleanMoney: Math.max(0, cleanMoney),
    });
  } catch (error) {
    console.error('Error updating clean money:', error);
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
  try {
    await updatePlayerInDatabase(playerId, {
      level,
      progress,
    });
  } catch (error) {
    console.error('Error updating player progress:', error);
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
  try {
    await updatePlayerInDatabase(playerId, {
      barracoLevel,
    });
  } catch (error) {
    console.error('Error updating barraco level:', error);
    await loadPlayerFromDatabase(playerId);
  }
}

/**
 * Create new player in database
 */
export async function createNewPlayer(playerData: Partial<Players>): Promise<Players | null> {
  try {
    const now = new Date().toISOString();

    const newPlayer: Partial<Players> = {
      _id: playerData._id || crypto.randomUUID(),
      email: playerData.email || '',
      playerId: playerData.playerId || playerData.email || '',
      playerName: playerData.playerName || 'COMANDANTE',

      level: playerData.level ?? 1,
      progress: playerData.progress ?? 0,
      xp: playerData.xp ?? 0,
      power: playerData.power ?? 0,
      barracoLevel: playerData.barracoLevel ?? 1,

      dirtyMoney: playerData.dirtyMoney ?? 0,
      cleanMoney: playerData.cleanMoney ?? 0,
      spins: playerData.spins ?? 10,

      isGuest: playerData.isGuest ?? false,
      profilePicture: playerData.profilePicture || '',

      skillTrees:
        playerData.skillTrees ??
        JSON.stringify({
          skills: {},
          playerMoney: 0,
          cooldowns: {},
          passiveBonuses: {},
        }),
      ownedLuxuryItems: playerData.ownedLuxuryItems ?? JSON.stringify([]),
      investments: playerData.investments ?? JSON.stringify({}),
      inventory: playerData.inventory ?? JSON.stringify({}),
      comercios: playerData.comercios ?? JSON.stringify(getInitialComercioData()),

      createdAt: playerData.createdAt ?? now,
      updatedAt: now,
      lastUpdated: now,
      lastLoginAt: playerData.lastLoginAt ?? now,
    };

    const createdPlayer = await createPlayer(newPlayer);
    usePlayerStore.getState().setPlayer(createdPlayer);

    return createdPlayer;
  } catch (error) {
    console.error('Error creating new player:', error);
    return null;
  }
}

/**
 * Delete player from database and reset playerStore
 */
export async function deletePlayerFromDatabase(playerId: string): Promise<void> {
  try {
    await deletePlayer(playerId);
    usePlayerStore.getState().reset();
  } catch (error) {
    console.error('Error deleting player:', error);
  }
}