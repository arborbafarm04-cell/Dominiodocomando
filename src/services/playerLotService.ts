import { BaseCrudService } from '@/integrations';
import { PlayerLots } from '@/entities';

const COLLECTION_ID = 'playerlots';

interface LotArea {
  gridX: number;
  gridZ: number;
  sizeX: number;
  sizeZ: number;
}

function overlaps(a: LotArea, b: LotArea) {
  return (
    a.gridX < b.gridX + b.sizeX &&
    a.gridX + a.sizeX > b.gridX &&
    a.gridZ < b.gridZ + b.sizeZ &&
    a.gridZ + a.sizeZ > b.gridZ
  );
}

/**
 * Pega todos os lotes existentes
 */
export async function getAllPlayerLots(): Promise<PlayerLots[]> {
  const result = await BaseCrudService.getAll<PlayerLots>(COLLECTION_ID);
  return result.items || [];
}

/**
 * Pega lote de um jogador
 */
export async function getPlayerLot(playerId: string): Promise<PlayerLots | null> {
  const lots = await getAllPlayerLots();
  return lots.find((lot) => lot.playerId === playerId) || null;
}

/**
 * Cria lote inicial automaticamente (2x2 = 4 tiles)
 */
export async function createInitialPlayerLot(
  playerId: string,
  playerName: string,
  gridWidth: number,
  gridHeight: number
): Promise<PlayerLots> {
  const existing = await getPlayerLot(playerId);
  if (existing) return existing;

  const allLots = await getAllPlayerLots();

  const sizeX = 2;
  const sizeZ = 2;

  const possiblePositions: { gridX: number; gridZ: number }[] = [];

  for (let z = 0; z <= gridHeight - sizeZ; z++) {
    for (let x = 0; x <= gridWidth - sizeX; x++) {
      const candidate = { gridX: x, gridZ: z, sizeX, sizeZ };

      const isBlocked = allLots.some((lot) =>
        overlaps(candidate, {
          gridX: lot.gridX || 0,
          gridZ: lot.gridZ || 0,
          sizeX: lot.sizeX || 2,
          sizeZ: lot.sizeZ || 2,
        })
      );

      if (!isBlocked) {
        possiblePositions.push({ gridX: x, gridZ: z });
      }
    }
  }

  if (possiblePositions.length === 0) {
    throw new Error('Mapa cheio, sem espaço para novo jogador.');
  }

  const chosen =
    possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

  const now = new Date().toISOString();

  const newLot: PlayerLots = {
    _id: crypto.randomUUID(),
    playerId,
    playerName,
    gridX: chosen.gridX,
    gridZ: chosen.gridZ,
    sizeX,
    sizeZ,
    rotation: 0,
    complexo: 'principal',
    area: 'lobby',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  return BaseCrudService.create<PlayerLots>(COLLECTION_ID, newLot);
}