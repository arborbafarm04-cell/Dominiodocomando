/**
 * Bribery Zone System
 * Defines distinct areas on the map for different NPC bribery locations
 */

export interface BriberyZone {
  id: string;
  name: string;
  npcType: 'guard' | 'delegado' | 'investigador' | 'vereador' | 'prefeito' | 'promotor' | 'juiz' | 'secretario' | 'governador' | 'ministro' | 'presidente';
  centerX: number;
  centerZ: number;
  width: number;
  height: number;
  color: number;
  baseBribeValue: number;
}

// Grid dimensions (from Multiplayer3DMap)
const GRID_SIZE = 32;
const GRID_HEIGHT = 25;

// QG dimensions
const QG_SIZE = 8;
const QG_START_X = (GRID_SIZE - QG_SIZE) / 2;
const QG_START_Z = (GRID_HEIGHT - QG_SIZE) / 2;

// Define bribery zones - distributed around the map
export const BRIBERY_ZONES: BriberyZone[] = [
  {
    id: 'guard',
    name: 'Guarda de Rua',
    npcType: 'guard',
    centerX: 4,
    centerZ: 4,
    width: 5,
    height: 5,
    color: 0x4169E1, // Royal Blue
    baseBribeValue: 100,
  },
  {
    id: 'delegado',
    name: 'Delegacia',
    npcType: 'delegado',
    centerX: 27,
    centerZ: 4,
    width: 5,
    height: 5,
    color: 0xFF6347, // Tomato Red
    baseBribeValue: 500,
  },
  {
    id: 'investigador',
    name: 'Investigador',
    npcType: 'investigador',
    centerX: 4,
    centerZ: 20,
    width: 5,
    height: 5,
    color: 0x9932CC, // Dark Orchid
    baseBribeValue: 300,
  },
  {
    id: 'vereador',
    name: 'Vereador',
    npcType: 'vereador',
    centerX: 27,
    centerZ: 20,
    width: 5,
    height: 5,
    color: 0xFFD700, // Gold
    baseBribeValue: 400,
  },
  {
    id: 'prefeito',
    name: 'Prefeitura',
    npcType: 'prefeito',
    centerX: 2,
    centerZ: 12,
    width: 4,
    height: 4,
    color: 0x20B2AA, // Light Sea Green
    baseBribeValue: 600,
  },
  {
    id: 'promotor',
    name: 'Promotor',
    npcType: 'promotor',
    centerX: 29,
    centerZ: 12,
    width: 4,
    height: 4,
    color: 0xFF1493, // Deep Pink
    baseBribeValue: 550,
  },
  {
    id: 'juiz',
    name: 'Tribunal',
    npcType: 'juiz',
    centerX: 14,
    centerZ: 2,
    width: 4,
    height: 4,
    color: 0x8B4513, // Saddle Brown
    baseBribeValue: 700,
  },
  {
    id: 'secretario',
    name: 'Secretaria',
    npcType: 'secretario',
    centerX: 14,
    centerZ: 22,
    width: 4,
    height: 4,
    color: 0x00CED1, // Dark Turquoise
    baseBribeValue: 450,
  },
  {
    id: 'governador',
    name: 'Governo Estadual',
    npcType: 'governador',
    centerX: 6,
    centerZ: 6,
    width: 3,
    height: 3,
    color: 0x32CD32, // Lime Green
    baseBribeValue: 800,
  },
  {
    id: 'ministro',
    name: 'Ministério',
    npcType: 'ministro',
    centerX: 25,
    centerZ: 6,
    width: 3,
    height: 3,
    color: 0xFF4500, // Orange Red
    baseBribeValue: 900,
  },
  {
    id: 'presidente',
    name: 'Palácio do Governo',
    npcType: 'presidente',
    centerX: 15,
    centerZ: 12,
    width: 3,
    height: 3,
    color: 0xDC143C, // Crimson
    baseBribeValue: 1000,
  },
];

/**
 * Check if a tile position is within any bribery zone
 */
export function isInBriberyZone(x: number, z: number): BriberyZone | null {
  for (const zone of BRIBERY_ZONES) {
    const minX = zone.centerX - zone.width / 2;
    const maxX = zone.centerX + zone.width / 2;
    const minZ = zone.centerZ - zone.height / 2;
    const maxZ = zone.centerZ + zone.height / 2;

    if (x >= minX && x < maxX && z >= minZ && z < maxZ) {
      return zone;
    }
  }
  return null;
}

/**
 * Check if a tile position is in the QG area
 */
export function isInQGArea(x: number, z: number): boolean {
  return (
    x >= QG_START_X &&
    x < QG_START_X + QG_SIZE &&
    z >= QG_START_Z &&
    z < QG_START_Z + QG_SIZE
  );
}

/**
 * Check if a position is valid for barraco placement
 * (not in QG, not in bribery zones, not occupied)
 */
export function isValidBarracoPosition(
  x: number,
  z: number,
  width: number = 2,
  height: number = 2
): boolean {
  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < height; dz++) {
      const checkX = x + dx;
      const checkZ = z + dz;

      // Check bounds
      if (checkX >= GRID_SIZE || checkZ >= GRID_HEIGHT) {
        return false;
      }

      // Check QG area
      if (isInQGArea(checkX, checkZ)) {
        return false;
      }

      // Check bribery zones
      if (isInBriberyZone(checkX, checkZ)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get all bribery zones as a list for UI display
 */
export function getBriberyZonesList(): BriberyZone[] {
  return BRIBERY_ZONES;
}

/**
 * Get a specific bribery zone by ID
 */
export function getBriberyZoneById(id: string): BriberyZone | undefined {
  return BRIBERY_ZONES.find((zone) => zone.id === id);
}

/**
 * Get a specific bribery zone by NPC type
 */
export function getBriberyZoneByNpcType(
  npcType: BriberyZone['npcType']
): BriberyZone | undefined {
  return BRIBERY_ZONES.find((zone) => zone.npcType === npcType);
}
