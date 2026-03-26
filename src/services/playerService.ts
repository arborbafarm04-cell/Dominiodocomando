import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";
import { getInitialComercioData } from "@/types/comercios";
import {
  storeCredential,
  getCredential,
  storeSession,
  getSession,
  clearSession,
  credentialExists,
} from "./indexedDBService";

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

// Local authentication - store hashed passwords in IndexedDB
export async function registerLocalPlayer(email: string, password: string, playerName: string) {
  const playerId = crypto.randomUUID();
  const comercios = getInitialComercioData();
  
  // Check if email already exists
  const exists = await credentialExists(email);
  if (exists) {
    throw new Error('Email já registrado');
  }
  
  // Hash password (simple hash for demo - use proper hashing in production)
  const hashedPassword = btoa(password);
  
  // Store credentials in IndexedDB (persistent)
  await storeCredential(email, hashedPassword, playerId);
  
  // Create player in database
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
  
  // Store current session in IndexedDB (persistent)
  await storeSession(playerId, email);
  
  return createdPlayer;
}

export async function loginLocalPlayer(email: string, password: string) {
  const credential = await getCredential(email);
  
  if (!credential) {
    throw new Error('Email não encontrado');
  }
  
  const hashedPassword = btoa(password);
  if (credential.password !== hashedPassword) {
    throw new Error('Senha incorreta');
  }
  
  const playerId = credential.playerId;
  const player = await getPlayerById(playerId);
  
  if (!player) {
    throw new Error('Jogador não encontrado');
  }
  
  // Store current session in IndexedDB (persistent)
  await storeSession(playerId, email);
  
  return player;
}

export async function logoutLocalPlayer() {
  await clearSession();
}

export async function getCurrentLocalPlayer() {
  const session = await getSession();
  if (!session) return null;
  return getPlayerById(session.playerId);
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  
  try {
    const player = await getPlayerById(session.playerId);
    return !!player;
  } catch {
    return false;
  }
}
