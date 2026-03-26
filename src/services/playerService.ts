import { BaseCrudService } from "@/integrations";
import { Players } from "@/entities";
import { getInitialComercioData } from "@/types/comercios";

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
    dirtyMoney: 1000,
    level: 1,
    progress: 0,
    comercios: JSON.stringify(comercios),
    isGuest: false,
  };
  
  return BaseCrudService.create(COLLECTION_ID, newPlayer);
}

// Local authentication - store hashed passwords in localStorage
export async function registerLocalPlayer(email: string, password: string, playerName: string) {
  const playerId = crypto.randomUUID();
  const comercios = getInitialComercioData();
  
  // Hash password (simple hash for demo - use proper hashing in production)
  const hashedPassword = btoa(password);
  
  // Store credentials in localStorage
  const credentials = JSON.parse(localStorage.getItem('playerCredentials') || '{}');
  credentials[email] = {
    password: hashedPassword,
    playerId,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('playerCredentials', JSON.stringify(credentials));
  
  // Create player in database
  const newPlayer: Players = {
    _id: playerId,
    playerName: playerName || 'Player',
    playerId: email,
    cleanMoney: 0,
    dirtyMoney: 1000,
    level: 1,
    progress: 0,
    comercios: JSON.stringify(comercios),
    isGuest: false,
  };
  
  const createdPlayer = await BaseCrudService.create(COLLECTION_ID, newPlayer);
  
  // Store current session immediately after registration
  localStorage.setItem('currentPlayerId', playerId);
  localStorage.setItem('currentPlayerEmail', email);
  localStorage.setItem('playerAuthToken', JSON.stringify({
    playerId,
    email,
    timestamp: new Date().toISOString(),
  }));
  
  return createdPlayer;
}

export async function loginLocalPlayer(email: string, password: string) {
  const credentials = JSON.parse(localStorage.getItem('playerCredentials') || '{}');
  
  if (!credentials[email]) {
    throw new Error('Email não encontrado');
  }
  
  const hashedPassword = btoa(password);
  if (credentials[email].password !== hashedPassword) {
    throw new Error('Senha incorreta');
  }
  
  const playerId = credentials[email].playerId;
  const player = await getPlayerById(playerId);
  
  if (!player) {
    throw new Error('Jogador não encontrado');
  }
  
  // Store current session
  localStorage.setItem('currentPlayerId', playerId);
  localStorage.setItem('currentPlayerEmail', email);
  localStorage.setItem('playerAuthToken', JSON.stringify({
    playerId,
    email,
    timestamp: new Date().toISOString(),
  }));
  
  return player;
}

export async function logoutLocalPlayer() {
  localStorage.removeItem('currentPlayerId');
  localStorage.removeItem('currentPlayerEmail');
  localStorage.removeItem('playerAuthToken');
}

export async function getCurrentLocalPlayer() {
  const playerId = localStorage.getItem('currentPlayerId');
  if (!playerId) return null;
  return getPlayerById(playerId);
}

export async function isPlayerAuthenticated(): Promise<boolean> {
  const token = localStorage.getItem('playerAuthToken');
  if (!token) return false;
  
  try {
    const auth = JSON.parse(token);
    const player = await getPlayerById(auth.playerId);
    return !!player;
  } catch {
    return false;
  }
}
