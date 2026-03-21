/**
 * BlockedTilesManager.ts
 * Manages blocked tiles in the grid system
 * Prevents objects from being placed on tiles occupied by other objects
 */

export interface BlockedTile {
  x: number;
  z: number;
  objectId: string;
  objectType: string;
}

export class BlockedTilesManager {
  private blockedTiles: Map<string, BlockedTile> = new Map();

  /**
   * Register blocked tiles for an object
   */
  registerBlockedTiles(
    objectId: string,
    objectType: string,
    tiles: Array<{ x: number; z: number }>
  ): void {
    tiles.forEach((tile) => {
      const key = `${tile.x},${tile.z}`;
      this.blockedTiles.set(key, {
        x: tile.x,
        z: tile.z,
        objectId,
        objectType,
      });
    });

    console.log(`Registered ${tiles.length} blocked tiles for ${objectType} (${objectId})`);
  }

  /**
   * Unregister blocked tiles for an object
   */
  unregisterBlockedTiles(objectId: string): void {
    const tilesToRemove: string[] = [];

    this.blockedTiles.forEach((tile, key) => {
      if (tile.objectId === objectId) {
        tilesToRemove.push(key);
      }
    });

    tilesToRemove.forEach((key) => {
      this.blockedTiles.delete(key);
    });

    console.log(`Unregistered ${tilesToRemove.length} blocked tiles for object ${objectId}`);
  }

  /**
   * Check if a tile is blocked
   */
  isTileBlocked(gridX: number, gridZ: number): boolean {
    const key = `${gridX},${gridZ}`;
    return this.blockedTiles.has(key);
  }

  /**
   * Get the object occupying a tile
   */
  getBlockingObject(gridX: number, gridZ: number): BlockedTile | undefined {
    const key = `${gridX},${gridZ}`;
    return this.blockedTiles.get(key);
  }

  /**
   * Check if a rectangular area is available
   */
  isAreaAvailable(
    gridX: number,
    gridZ: number,
    width: number,
    depth: number
  ): boolean {
    for (let x = gridX; x < gridX + width; x++) {
      for (let z = gridZ; z < gridZ + depth; z++) {
        if (this.isTileBlocked(x, z)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get all blocked tiles
   */
  getAllBlockedTiles(): BlockedTile[] {
    return Array.from(this.blockedTiles.values());
  }

  /**
   * Get all blocked tiles for a specific object
   */
  getObjectBlockedTiles(objectId: string): BlockedTile[] {
    return Array.from(this.blockedTiles.values()).filter(
      (tile) => tile.objectId === objectId
    );
  }

  /**
   * Clear all blocked tiles
   */
  clear(): void {
    this.blockedTiles.clear();
  }
}

export default BlockedTilesManager;
