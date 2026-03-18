/**
 * ObjectPositioner.ts
 * Sistema de posicionamento seguro de objetos 3D
 * Garante que objetos sejam posicionados corretamente no grid
 */

import { GridSystem, GridObject, GridPosition } from './GridSystem';
import { SpatialValidator, ValidationResult } from './SpatialValidator';

export interface PositioningOptions {
  validateBeforePlace: boolean; // Validar antes de colocar
  throwOnError: boolean; // Lançar erro se inválido
  autoCorrect: boolean; // Tentar corrigir automaticamente
}

/**
 * ObjectPositioner - Gerenciador de posicionamento seguro
 */
export class ObjectPositioner {
  private gridSystem: GridSystem;
  private validator: SpatialValidator;
  private defaultOptions: PositioningOptions = {
    validateBeforePlace: true,
    throwOnError: true,
    autoCorrect: false,
  };

  constructor(gridSystem: GridSystem, validator: SpatialValidator) {
    this.gridSystem = gridSystem;
    this.validator = validator;
  }

  /**
   * Calcular centro de um conjunto de tiles
   * Para um objeto 4x4, retorna o centro do conjunto
   */
  calculateTileSetCenter(
    startX: number,
    startZ: number,
    width: number,
    depth: number
  ): { x: number; z: number } {
    // Centro é calculado como: início + (tamanho - 1) / 2
    const centerX = startX + (width - 1) / 2;
    const centerZ = startZ + (depth - 1) / 2;

    return {
      x: Math.round(centerX),
      z: Math.round(centerZ),
    };
  }

  /**
   * Colocar objeto no grid
   * Retorna sucesso ou erro de validação
   */
  placeObject(
    obj: GridObject,
    options?: Partial<PositioningOptions>
  ): { success: boolean; validation: ValidationResult; object?: GridObject } {
    const opts = { ...this.defaultOptions, ...options };

    // Validar se solicitado
    if (opts.validateBeforePlace) {
      const validation = this.validator.validateObject(obj);

      if (!validation.isValid) {
        if (opts.throwOnError) {
          throw new Error(
            `Erro ao posicionar objeto ${obj.id}: ${validation.errors.join('; ')}`
          );
        }

        return {
          success: false,
          validation,
        };
      }
    }

    // Registrar no grid
    this.gridSystem.registerObject(obj);

    return {
      success: true,
      validation: { isValid: true, errors: [], warnings: [] },
      object: obj,
    };
  }

  /**
   * Mover objeto para nova posição
   */
  moveObject(
    objectId: string,
    newPosition: GridPosition,
    options?: Partial<PositioningOptions>
  ): { success: boolean; validation: ValidationResult } {
    const opts = { ...this.defaultOptions, ...options };

    // Validar nova posição
    if (opts.validateBeforePlace) {
      const validation = this.validator.validatePositionChange(
        objectId,
        newPosition
      );

      if (!validation.isValid) {
        if (opts.throwOnError) {
          throw new Error(
            `Erro ao mover objeto ${objectId}: ${validation.errors.join('; ')}`
          );
        }

        return {
          success: false,
          validation,
        };
      }
    }

    // Atualizar posição
    this.gridSystem.updateObjectPosition(objectId, newPosition);

    return {
      success: true,
      validation: { isValid: true, errors: [], warnings: [] },
    };
  }

  /**
   * Encontrar posição válida para objeto
   * Procura por espaço livre no grid
   */
  findValidPosition(
    width: number,
    depth: number,
    startSearchX: number = 0,
    startSearchZ: number = 0
  ): GridPosition | null {
    const config = this.gridSystem.getConfig();

    // Procurar por espaço livre
    for (let z = startSearchZ; z < config.platformDepth; z++) {
      for (let x = startSearchX; x < config.platformWidth; x++) {
        // Calcular centro para este tamanho
        const center = this.calculateTileSetCenter(x, z, width, depth);

        // Criar objeto teste
        const testObj: GridObject = {
          id: 'test',
          position: { x: center.x, z: center.z, y: 0 },
          width,
          depth,
          height: 1,
          type: 'test',
        };

        // Validar
        const validation = this.validator.validateObject(testObj);
        if (validation.isValid) {
          return { x: center.x, z: center.z, y: 0 };
        }
      }
    }

    return null;
  }

  /**
   * Posicionar objeto grande (ex: 4x4)
   * Garante alinhamento correto ao centro do conjunto de tiles
   */
  placeLargeObject(
    obj: GridObject,
    options?: Partial<PositioningOptions>
  ): { success: boolean; validation: ValidationResult; object?: GridObject } {
    // Garantir que Y = 0 (apoiado na plataforma)
    obj.position.y = 0;

    // Garantir que posição é inteira
    obj.position.x = Math.round(obj.position.x);
    obj.position.z = Math.round(obj.position.z);

    return this.placeObject(obj, options);
  }

  /**
   * Obter informações de ocupação de um objeto
   */
  getObjectOccupancyInfo(objectId: string): {
    object: GridObject | undefined;
    tiles: Array<{ x: number; z: number }>;
    totalTiles: number;
  } {
    const obj = this.gridSystem.getObject(objectId);
    if (!obj) {
      return {
        object: undefined,
        tiles: [],
        totalTiles: 0,
      };
    }

    const tiles = this.gridSystem.getOccupiedTiles(obj);
    return {
      object: obj,
      tiles: tiles.map((t) => ({ x: t.x, z: t.z })),
      totalTiles: tiles.length,
    };
  }

  /**
   * Visualizar grid (para debug)
   */
  visualizeGrid(width?: number, depth?: number): string {
    const config = this.gridSystem.getConfig();
    const w = width || config.platformWidth;
    const d = depth || config.platformDepth;

    let grid = '';

    for (let z = 0; z < d; z++) {
      for (let x = 0; x < w; x++) {
        const occupied = this.gridSystem.isTileOccupied(x, z);
        grid += occupied ? '█' : '·';
      }
      grid += '\n';
    }

    return grid;
  }

  /**
   * Gerar relatório de posicionamento
   */
  generatePositioningReport(): string {
    const config = this.gridSystem.getConfig();
    const objects = this.gridSystem.getAllObjects();

    let report = '=== RELATÓRIO DE POSICIONAMENTO ===\n\n';
    report += `Configuração da Plataforma:\n`;
    report += `  - Tamanho: ${config.platformWidth} x ${config.platformDepth} tiles\n`;
    report += `  - Tamanho do Tile: ${config.tileSize} unidades\n`;
    report += `  - Altura máxima: ${config.maxObjectHeight} unidades\n\n`;

    report += `Objetos Posicionados: ${objects.length}\n`;
    objects.forEach((obj) => {
      const occupancy = this.getObjectOccupancyInfo(obj.id);
      report += `\n  ${obj.type.toUpperCase()} - ${obj.id}\n`;
      report += `    Posição: (${obj.position.x}, ${obj.position.z}, ${obj.position.y})\n`;
      report += `    Dimensões: ${obj.width}x${obj.depth} tiles\n`;
      report += `    Altura: ${obj.height} unidades\n`;
      report += `    Tiles ocupados: ${occupancy.totalTiles}\n`;
    });

    return report;
  }
}

export default ObjectPositioner;
