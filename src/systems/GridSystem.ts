/**
 * GridSystem.ts
 * Sistema de grid para posicionamento de objetos 3D
 * Define a plataforma, tiles e validações espaciais
 */

export interface GridConfig {
  tileSize: number; // Tamanho de cada tile em unidades
  platformWidth: number; // Largura total da plataforma em tiles
  platformDepth: number; // Profundidade total da plataforma em tiles
  platformY: number; // Altura do plano da plataforma (sempre 0)
  maxObjectHeight: number; // Altura máxima permitida para objetos
}

export interface GridPosition {
  x: number; // Posição no eixo X (em tiles)
  z: number; // Posição no eixo Z (em tiles)
  y: number; // Altura (Y = 0 é o chão)
}

export interface GridObject {
  id: string;
  position: GridPosition; // Centro do objeto
  width: number; // Largura em tiles (eixo X)
  depth: number; // Profundidade em tiles (eixo Z)
  height: number; // Altura em unidades
  type: string; // Tipo de objeto (building, tree, etc)
}

export interface OccupiedTile {
  x: number;
  z: number;
  objectId: string;
}

/**
 * GridSystem - Gerenciador principal do grid
 */
export class GridSystem {
  private config: GridConfig;
  private occupiedTiles: Map<string, OccupiedTile> = new Map();
  private objects: Map<string, GridObject> = new Map();

  constructor(config: GridConfig) {
    this.config = {
      tileSize: 1,
      platformWidth: 100,
      platformDepth: 100,
      platformY: 0,
      maxObjectHeight: 50,
      ...config,
    };
  }

  /**
   * Obter configuração do grid
   */
  getConfig(): GridConfig {
    return { ...this.config };
  }

  /**
   * Converter posição do mundo (unidades) para posição do grid (tiles)
   */
  worldToGrid(worldX: number, worldZ: number): { x: number; z: number } {
    return {
      x: Math.round(worldX / this.config.tileSize),
      z: Math.round(worldZ / this.config.tileSize),
    };
  }

  /**
   * Converter posição do grid (tiles) para posição do mundo (unidades)
   */
  gridToWorld(gridX: number, gridZ: number): { x: number; z: number } {
    return {
      x: gridX * this.config.tileSize,
      z: gridZ * this.config.tileSize,
    };
  }

  /**
   * Obter tiles ocupados por um objeto
   */
  getOccupiedTiles(obj: GridObject): OccupiedTile[] {
    const tiles: OccupiedTile[] = [];
    const startX = obj.position.x - Math.floor(obj.width / 2);
    const startZ = obj.position.z - Math.floor(obj.depth / 2);

    for (let x = startX; x < startX + obj.width; x++) {
      for (let z = startZ; z < startZ + obj.depth; z++) {
        tiles.push({ x, z, objectId: obj.id });
      }
    }

    return tiles;
  }

  /**
   * Registrar objeto no grid
   */
  registerObject(obj: GridObject): void {
    if (this.objects.has(obj.id)) {
      throw new Error(`Objeto ${obj.id} já está registrado`);
    }

    const tiles = this.getOccupiedTiles(obj);
    const tileKey = (x: number, z: number) => `${x},${z}`;

    tiles.forEach((tile) => {
      this.occupiedTiles.set(tileKey(tile.x, tile.z), tile);
    });

    this.objects.set(obj.id, { ...obj });
  }

  /**
   * Remover objeto do grid
   */
  unregisterObject(objectId: string): void {
    const obj = this.objects.get(objectId);
    if (!obj) return;

    const tiles = this.getOccupiedTiles(obj);
    const tileKey = (x: number, z: number) => `${x},${z}`;

    tiles.forEach((tile) => {
      this.occupiedTiles.delete(tileKey(tile.x, tile.z));
    });

    this.objects.delete(objectId);
  }

  /**
   * Atualizar posição de um objeto
   */
  updateObjectPosition(objectId: string, newPosition: GridPosition): void {
    const obj = this.objects.get(objectId);
    if (!obj) throw new Error(`Objeto ${objectId} não encontrado`);

    // Remover ocupação anterior
    this.unregisterObject(objectId);

    // Atualizar posição
    obj.position = newPosition;

    // Registrar nova ocupação
    this.registerObject(obj);
  }

  /**
   * Obter objeto pelo ID
   */
  getObject(objectId: string): GridObject | undefined {
    return this.objects.get(objectId);
  }

  /**
   * Listar todos os objetos
   */
  getAllObjects(): GridObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Verificar se um tile está ocupado
   */
  isTileOccupied(gridX: number, gridZ: number): boolean {
    const tileKey = `${gridX},${gridZ}`;
    return this.occupiedTiles.has(tileKey);
  }

  /**
   * Obter objeto que ocupa um tile específico
   */
  getObjectAtTile(gridX: number, gridZ: number): GridObject | undefined {
    const tileKey = `${gridX},${gridZ}`;
    const tile = this.occupiedTiles.get(tileKey);
    return tile ? this.objects.get(tile.objectId) : undefined;
  }

  /**
   * Limpar todos os objetos
   */
  clear(): void {
    this.objects.clear();
    this.occupiedTiles.clear();
  }
}

export default GridSystem;
