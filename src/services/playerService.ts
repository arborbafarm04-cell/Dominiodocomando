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
import { multiplayerAuthService } from './multiplayerAuthService';

function buildNewPlayerData(playerId: string, email: string, playerName: string): Partial<Players> {
  const now = new Date().toISOString();
  const comercios = getInitialComercioData();

  return {
    _id: playerId,
    email,
    playerId, // 🔥 corrigido

    playerName: playerName || 'Player',

    cleanMoney: 0,
    dirtyMoney: 0,
    spins: 10,

    level: 1,
    progress: 0,
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

  const savedPlayer = await savePlayerInDatabase({
    ...existingPlayer,
    ...player,
  });

  // Sincronizar dados do jogador com multiplayerAuthService
  try {
    await multiplayerAuthService.syncPlayerData({
      playerId: savedPlayer._id,
      playerData: savedPlayer,
    });
  } catch (error) {
    console.warn('Falha ao sincronizar dados do jogador em multiplayer:', error);
  }

  return savedPlayer;
}

export async function updatePlayer(playerId: string, updates: Partial<Players>) {
  const existingPlayer = await getPlayerFromDatabase(playerId);

  if (!existingPlayer) {
    throw new Error(`Player ${playerId} not found`);
  }

  const updatedPlayer = await savePlayerInDatabase({
    ...existingPlayer,
    ...updates,
  });

  // Sincronizar dados do jogador com multiplayerAuthService
  try {
    await multiplayerAuthService.syncPlayerData({
      playerId: updatedPlayer._id,
      playerData: updatedPlayer,
    });
  } catch (error) {
    console.warn('Falha ao sincronizar dados do jogador em multiplayer:', error);
  }

  return updatedPlayer;
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

  // Integração com multiplayerAuthService
  try {
    await multiplayerAuthService.registerMultiplayerSession({
      playerId: createdPlayer._id,
      playerName: playerName.trim(),
      email: normalizedEmail,
    });
  } catch (error) {
    console.warn('Falha ao registrar sessão de multiplayer:', error);
  }

  return createdPlayer;
}

export async function loginLocalPlayer(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  await resetPlayerSession();

  const playerId = await validateCredentials(normalizedEmail, password);

  let player = await getPlayerFromDatabase(playerId);

  if (!player) {
    const result = await getAllPlayers();
    const allPlayers = result.items || [];

    const playerByEmail = allPlayers.find(
      (p) => p.email?.toLowerCase() === normalizedEmail
    );

    if (playerByEmail) {
      player = playerByEmail;
    } else {
      throw new Error('Jogador não encontrado no banco de dados');
    }
  }

  if (!player || !player._id) {
    throw new Error('Dados do jogador inválidos');
  }

  await createSession(player._id, normalizedEmail);

  const now = new Date().toISOString();

  const updatedPlayer = await savePlayerInDatabase({
    ...player,
    lastLoginAt: now,
  });

  // Integração com multiplayerAuthService
  try {
    await multiplayerAuthService.authenticateMultiplayerSession({
      playerId: updatedPlayer._id,
      playerName: updatedPlayer.playerName || 'Player',
      email: normalizedEmail,
    });
  } catch (error) {
    console.warn('Falha ao autenticar sessão de multiplayer:', error);
  }

  return updatedPlayer;
}

export async function logoutLocalPlayer() {
  await destroySession();

  // Integração com multiplayerAuthService
  try {
    await multiplayerAuthService.terminateMultiplayerSession();
  } catch (error) {
    console.warn('Falha ao encerrar sessão de multiplayer:', error);
  }
}

export async function getCurrentLocalPlayer() {
  const session = await getAuthSession();
  if (!session) return null;

  let player = await getPlayerFromDatabase(session.playerId);

  if (!player) {
    const result = await getAllPlayers();
    const allPlayers = result.items || [];

    const fallback = allPlayers.find(
      (p) => p.email?.toLowerCase() === session.email?.toLowerCase()
    );

    if (fallback) {
      player = fallback;
    }
  }

  return player || null;
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session) return false;

  let player = await getPlayerFromDatabase(session.playerId);

  if (!player) {
    const result = await getAllPlayers();
    const allPlayers = result.items || [];

    player = allPlayers.find(
      (p) => p.email?.toLowerCase() === session.email?.toLowerCase()
    );
  }

  return !!player;
}