import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';
import {
  registerCredentials,
  validateCredentials,
  createSession,
  destroySession,
  getAuthSession,
} from './authService';
import { resetPlayerSession } from './sessionResetService';
import {
  createPlayer as createPlayerInDatabase,
  getPlayer as getPlayerFromDatabase,
  savePlayer as savePlayerInDatabase,
  deletePlayer as deletePlayerFromDatabase,
  getAllPlayers,
} from './playerCoreService';

function buildNewPlayerData(playerId: string, email: string, playerName: string): Partial<Players> {
  const now = new Date().toISOString();
  const comercios = getInitialComercioData();

  return {
    _id: playerId,
    email,
    playerId: email,
    playerName: playerName || 'Player',

    cleanMoney: 0,
    dirtyMoney: 0,
    spins: 10,

    level: 1,
    progress: 0,
    xp: 0,
    power: 0,
    barracoLevel: 1,

    comercios: JSON.stringify(comercios),
    inventory: JSON.stringify([]),
    skillTrees: JSON.stringify({}),
    ownedLuxuryItems: JSON.stringify([]),
    investments: JSON.stringify({}),

    isGuest: false,
    profilePicture: '',

    createdAt: now,
    updatedAt: now,
    lastUpdated: now,
    lastLoginAt: now,
  };
}

export async function savePlayer(player: Partial<Players>) {
  if (!player._id) {
    return createPlayerInDatabase({
      ...player,
      _id: crypto.randomUUID(),
    });
  }

  const existingPlayer = await getPlayerFromDatabase(player._id);

  if (!existingPlayer) {
    return createPlayerInDatabase({
      ...player,
      _id: player._id,
    });
  }

  return savePlayerInDatabase({
    ...existingPlayer,
    ...player,
  });
}

export async function updatePlayer(playerId: string, updates: Partial<Players>) {
  const existingPlayer = await getPlayerFromDatabase(playerId);

  if (!existingPlayer) {
    throw new Error(`Player ${playerId} not found`);
  }

  return savePlayerInDatabase({
    ...existingPlayer,
    ...updates,
  });
}

export async function loadPlayers() {
  return getAllPlayers();
}

export async function getPlayerById(playerId: string) {
  return getPlayerFromDatabase(playerId);
}

export async function deletePlayer(playerId: string) {
  return deletePlayerFromDatabase(playerId);
}

export async function registerPlayer(email: string, playerName: string, _nickname: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const playerId = crypto.randomUUID();
  const newPlayer = buildNewPlayerData(playerId, normalizedEmail, playerName.trim());

  return createPlayerInDatabase(newPlayer);
}

/**
 * Register new player with email/password
 * Step 1: Create player in database with fixed _id
 * Step 2: Register credentials in auth system
 * Step 3: Create authenticated session
 */
export async function registerLocalPlayer(email: string, password: string, playerName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const tempPlayerId = crypto.randomUUID();
  const newPlayer = buildNewPlayerData(tempPlayerId, normalizedEmail, playerName.trim());

  const createdPlayer = await createPlayerInDatabase(newPlayer);

  if (!createdPlayer?._id) {
    throw new Error('Falha ao criar jogador no banco de dados');
  }

  await registerCredentials(normalizedEmail, password, createdPlayer._id);
  await createSession(createdPlayer._id, normalizedEmail);

  return createdPlayer;
}

/**
 * Login player with email/password
 *
 * Step 1: Reset old session
 * Step 2: Validate email and password
 * Step 3: Load player data from database (with fallback)
 * Step 4: Create authenticated session
 * Step 5: Update last login timestamp
 * Step 6: Return player data
 */
export async function loginLocalPlayer(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  await resetPlayerSession();

  const playerId = await validateCredentials(normalizedEmail, password);
  let player = await getPlayerFromDatabase(playerId);

  // Fallback: se não encontrar por playerId, buscar por email normalizado
  if (!player) {
    const allPlayers = await getAllPlayers();
    const playerByEmail = allPlayers.items?.find(
      (p) => p.email?.toLowerCase() === normalizedEmail
    );

    if (playerByEmail) {
      player = playerByEmail;
    } else {
      throw new Error('Jogador não encontrado no banco de dados');
    }
  }

  // Usar o _id real do player encontrado
  await createSession(player._id, normalizedEmail);

  const now = new Date().toISOString();
  const updatedPlayer = await savePlayerInDatabase({
    ...player,
    lastLoginAt: now,
  });

  return updatedPlayer;
}

export async function logoutLocalPlayer() {
  await destroySession();
}

export async function getCurrentLocalPlayer() {
  const session = await getAuthSession();
  if (!session) return null;

  return getPlayerFromDatabase(session.playerId);
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session) return false;

  try {
    const player = await getPlayerFromDatabase(session.playerId);
    return !!player;
  } catch {
    return false;
  }
}