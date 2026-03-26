import {
  updatePlayerPresence as updateMultiplayerPresence,
  getPlayerPresence as getMultiplayerPlayerPresence,
  getOnlinePlayers,
  getPlayersInLocation,
  setPlayerOffline as setMultiplayerPlayerOffline,
  getTotalOnlinePlayersCount,
} from '@/services/multiplayerPresenceService';

export interface MapPosition {
  x: number;
  y: number;
  complexo: string;
  area?: string;
}

export interface PlayerPresenceData {
  playerId: string;
  mapPosition: MapPosition;
  status: 'active' | 'idle' | 'in_combat' | 'offline';
  complexStatus?: string;
}

type PresenceStatus = 'online' | 'offline' | 'away';

function toPresenceStatus(
  status: PlayerPresenceData['status'] | 'online' | 'offline' | 'away'
): PresenceStatus {
  if (status === 'offline') return 'offline';
  if (status === 'idle') return 'away';
  return 'online';
}

function serializeMapPosition(position: MapPosition): string {
  return `${position.complexo}:${position.area || 'default'}:${position.x},${position.y}`;
}

function parseMapPositionString(mapPosition: string): MapPosition {
  const [complexo = 'unknown', area = 'default', coords = '0,0'] = mapPosition.split(':');
  const [xRaw = '0', yRaw = '0'] = coords.split(',');

  return {
    x: Number(xRaw) || 0,
    y: Number(yRaw) || 0,
    complexo,
    area,
  };
}

function fromMultiplayerPresence(presence: any) {
  return {
    ...presence,
    mapPosition: parseMapPositionString(presence.mapPosition || 'unknown:default:0,0'),
  };
}

/**
 * Atualizar presença de um jogador no mapa
 */
export async function updatePlayerPresence(
  playerId: string,
  position: MapPosition,
  status: 'active' | 'idle' | 'in_combat' = 'active',
  complexStatus?: string,
  playerName?: string
) {
  const mapPosition = serializeMapPosition(position);

  const result = await updateMultiplayerPresence(
    playerId,
    mapPosition,
    toPresenceStatus(status),
    playerName
  );

  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar presença do jogador');
  }

  return {
    success: true,
    playerId,
    mapPosition: position,
    status,
    complexStatus: complexStatus || '',
    isOnline: status !== 'offline',
    lastSeenAt: new Date(),
  };
}

/**
 * Obter jogadores online próximos a uma posição
 */
export async function getOnlinePlayersNearby(position: MapPosition, radius: number = 500) {
  try {
    const players = await getOnlinePlayers();

    return players
      .map(fromMultiplayerPresence)
      .filter((player: any) => {
        if (!player.isOnline || player.status === 'offline') return false;
        if (player.mapPosition.complexo !== position.complexo) return false;

        const distance = Math.sqrt(
          Math.pow(player.mapPosition.x - position.x, 2) +
            Math.pow(player.mapPosition.y - position.y, 2)
        );

        return distance <= radius;
      });
  } catch (error) {
    console.error('Erro ao obter jogadores próximos:', error);
    return [];
  }
}

/**
 * Obter todos os jogadores online em um complexo
 */
export async function getOnlinePlayersInComplex(complexo: string) {
  try {
    const players = await getOnlinePlayers();

    return players
      .map(fromMultiplayerPresence)
      .filter((player: any) => {
        if (!player.isOnline || player.status === 'offline') return false;
        return player.mapPosition.complexo === complexo;
      });
  } catch (error) {
    console.error('Erro ao obter jogadores no complexo:', error);
    return [];
  }
}

/**
 * Definir jogador como offline
 */
export async function setPlayerOffline(playerId: string) {
  const result = await setMultiplayerPlayerOffline(playerId);

  if (!result.success) {
    throw new Error(result.error || 'Erro ao definir jogador como offline');
  }
}

/**
 * Obter presença de um jogador específico
 */
export async function getPlayerPresence(playerId: string) {
  try {
    const presence = await getMultiplayerPlayerPresence(playerId);

    if (!presence) {
      return null;
    }

    return fromMultiplayerPresence(presence);
  } catch (error) {
    console.error('Erro ao obter presença do jogador:', error);
    return null;
  }
}

/**
 * Limpar jogadores offline
 * No modelo atual, não removemos registros automaticamente.
 * Mantemos histórico de presença e apenas reportamos zero removidos.
 */
export async function cleanupOfflinePlayers(_minutesThreshold: number = 5) {
  return 0;
}

/**
 * Obter estatísticas de jogadores online
 */
export async function getOnlinePlayersStats() {
  try {
    const players = await getOnlinePlayers();
    const complexStats: Record<string, number> = {};

    players
      .map(fromMultiplayerPresence)
      .forEach((player: any) => {
        const complexo = player.mapPosition.complexo || 'unknown';
        complexStats[complexo] = (complexStats[complexo] || 0) + 1;
      });

    return {
      totalOnline: await getTotalOnlinePlayersCount(),
      totalPlayers: players.length,
      complexStats,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalOnline: 0,
      totalPlayers: 0,
      complexStats: {},
      timestamp: new Date(),
    };
  }
}

/**
 * Compat helper: obter jogadores numa localização textual já serializada
 */
export async function getPlayersBySerializedLocation(mapPosition: string) {
  try {
    const players = await getPlayersInLocation(mapPosition);
    return players.map(fromMultiplayerPresence);
  } catch (error) {
    console.error('Erro ao obter jogadores por localização serializada:', error);
    return [];
  }
}