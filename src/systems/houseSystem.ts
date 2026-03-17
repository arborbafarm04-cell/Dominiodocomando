export const HOUSE_CONFIG = {
  tilesOccupied: 4,
  maxHouseLevel: 10,
};

export function getHouseStage(level: number): number {
  return Math.floor(level / 10);
}
