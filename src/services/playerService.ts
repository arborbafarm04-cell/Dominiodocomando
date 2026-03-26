import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";
import { getInitialComercioData } from "@/types/comercios";
import {
  storeSession,
  getSession,
  clearSession,
} from "./indexedDBService";
import {
  registerCredentials,
  validateCredentials,
  createSession,
  destroySession,
  getAuthSession,
} from "./authService";
import { resetPlayerSession } from "./sessionResetService";

const COLLECTION_ID = "players";

export async function savePlayer(player: Partial<Players>) {
  if (!player._id) {
    player._id = crypto.randomUUID();
  }
  return BaseCrudService.create(COLLECTION_ID, player as Players);
}

export async function updatePlayer(playerId: string, updates: Partial<Players>) {
  return BaseCrudService.update(COLLECTION_ID, { _id: playerId, ...updates });
}

export async function loadPlayers() {
  const result = await BaseCrudService.getAll<Players>(COLLECTION_ID);
  return result.items || [];
}

export async function getPlayerById(playerId: string) {
  return BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
}

export async function deletePlayer(playerId: string) {
  return BaseCrudService.delete(COLLECTION_ID, playerId);
}

export async function registerPlayer(email: string, playerName: string, nickname: string) {
  const playerId = crypto.randomUUID();
  const comercios = getInitialComercioData();
  
  const newPlayer: Players = {
    _id: playerId,
    playerName: playerName || 'Player',
    playerId: email,
    cleanMoney: 0,
    dirtyMoney: 10000000000,
    level: 1,
    progress: 0,
    comercios: JSON.stringify(comercios),
    isGuest: false,
  };
  
  return BaseCrudService.create(COLLECTION_ID, newPlayer);
}

/**
 * REFACTORED: Register new player with email/password
 * Step 1: Create player in database with fixed _id
 * Step 2: Register credentials in auth system
 * Step 3: Create authenticated session
 */
export async function registerLocalPlayer(email: string, password: string, playerName: string) {
  // Step 1: Create player in database with fixed _id
  const playerId = crypto.randomUUID();
  const comercios = getInitialComercioData();
  
  const newPlayer: Players = {
    _id: playerId,
    playerName: playerName || 'Player',
    playerId: email,
    cleanMoney: 0,
    dirtyMoney: 10000000000,
    level: 1,
    progress: 0,
    comercios: JSON.stringify(comercios),
    isGuest: false,
  };
  
  const createdPlayer = await BaseCrudService.create(COLLECTION_ID, newPlayer);
  
  // Step 2: Register credentials in auth system
  await registerCredentials(email, password, playerId);
  
  // Step 3: Create authenticated session
  await createSession(playerId, email);
  
  return createdPlayer;
}

/**
 * REFACTORED: Login player with email/password
 * 
 * CRITICAL SESSION RESET ORDER:
 * Step 1: Reset old session (clear all stores, localStorage, IndexedDB)
 * Step 2: Validate email and password (returns player _id)
 * Step 3: Load player data from database
 * Step 4: Create authenticated session
 * Step 5: Sync screen state
 */
export async function loginLocalPlayer(email: string, password: string) {
  // Step 1: RESET OLD SESSION - Clear all player-related state
  // This prevents leftover state from previous player from contaminating new session
  console.log('🔄 Resetting old session before login...');
  await resetPlayerSession();
  
  // Step 2: Validate email and password (returns player _id)
  console.log('🔐 Validating credentials...');
  const playerId = await validateCredentials(email, password);
  
  // Step 3: Load player data from database
  console.log('📥 Loading player data from database...');
  const player = await getPlayerById(playerId);
  
  if (!player) {
    throw new Error('Jogador não encontrado no banco de dados');
  }
  
  // Step 4: Create authenticated session
  console.log('🔑 Creating authenticated session...');
  await createSession(playerId, email);
  
  // Step 5: Return player data (caller will sync screen state)
  console.log('✅ Login successful - player session ready');
  return player;
}

export async function logoutLocalPlayer() {
  await destroySession();
}

export async function getCurrentLocalPlayer() {
  const session = await getAuthSession();
  if (!session) return null;
  return getPlayerById(session.playerId);
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session) return false;
  
  try {
    const player = await getPlayerById(session.playerId);
    return !!player;
  } catch {
    return false;
  }
}
