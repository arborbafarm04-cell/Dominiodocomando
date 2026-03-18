/**
 * SpatialValidator.ts
 * Sistema de validação de regras espaciais e estruturais
 * Garante que objetos estejam sempre corretos no grid
 */

import { GridSystem, GridObject, GridPosition } from './GridSystem';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * SpatialValidator - Validador de regras espaciais
 */
export class SpatialValidator {
  private gridSystem: GridSystem;

  constructor(gridSystem: GridSystem) {
    this.gridSystem = gridSystem;
  }

  /**
   * REGRA 1: Validar altura (Y)
   * - Nenhum objeto pode ter Y < 0 (enterrado)
   * - Base do objeto deve estar em Y = 0 (apoiado na plataforma)
   */
  private validateHeight(obj: GridObject): string[] {
    const errors: string[] = [];

    // Base do objeto deve estar no chão (Y = 0)
    if (obj.position.y !== 0) {
      errors.push(
        `Objeto ${obj.id}: Base deve estar em Y = 0 (chão). Atual: Y = ${obj.position.y}`
      );
    }

    // Altura não pode ser negativa
    if (obj.height < 0) {
      errors.push(
        `Objeto ${obj.id}: Altura não pode ser negativa. Atual: ${obj.height}`
      );
    }

    // Altura não pode exceder limite
    const config = this.gridSystem.getConfig();
    if (obj.height > config.maxObjectHeight) {
      errors.push(
        `Objeto ${obj.id}: Altura excede limite (${config.maxObjectHeight}). Atual: ${obj.height}`
      );
    }

    return errors;
  }

  /**
   * REGRA 2: Validar alinhamento ao grid
   * - Posição X e Z devem ser números inteiros (tiles inteiros)
   * - Não pode ocupar "meio tile"
   */
  private validateGridAlignment(obj: GridObject): string[] {
    const errors: string[] = [];

    if (!Number.isInteger(obj.position.x)) {
      errors.push(
        `Objeto ${obj.id}: Posição X deve ser inteira (tile inteiro). Atual: ${obj.position.x}`
      );
    }

    if (!Number.isInteger(obj.position.z)) {
      errors.push(
        `Objeto ${obj.id}: Posição Z deve ser inteira (tile inteiro). Atual: ${obj.position.z}`
      );
    }

    if (!Number.isInteger(obj.width) || obj.width <= 0) {
      errors.push(
        `Objeto ${obj.id}: Largura deve ser inteira e positiva. Atual: ${obj.width}`
      );
    }

    if (!Number.isInteger(obj.depth) || obj.depth <= 0) {
      errors.push(
        `Objeto ${obj.id}: Profundidade deve ser inteira e positiva. Atual: ${obj.depth}`
      );
    }

    return errors;
  }

  /**
   * REGRA 3: Validar limites da plataforma
   * - Objeto não pode sair dos limites da plataforma
   */
  private validatePlatformBounds(obj: GridObject): string[] {
    const errors: string[] = [];
    const config = this.gridSystem.getConfig();

    const startX = obj.position.x - Math.floor(obj.width / 2);
    const endX = startX + obj.width - 1;
    const startZ = obj.position.z - Math.floor(obj.depth / 2);
    const endZ = startZ + obj.depth - 1;

    if (startX < 0) {
      errors.push(
        `Objeto ${obj.id}: Sai dos limites da plataforma (X mínimo). Posição: ${obj.position.x}, Largura: ${obj.width}`
      );
    }

    if (endX >= config.platformWidth) {
      errors.push(
        `Objeto ${obj.id}: Sai dos limites da plataforma (X máximo). Posição: ${obj.position.x}, Largura: ${obj.width}`
      );
    }

    if (startZ < 0) {
      errors.push(
        `Objeto ${obj.id}: Sai dos limites da plataforma (Z mínimo). Posição: ${obj.position.z}, Profundidade: ${obj.depth}`
      );
    }

    if (endZ >= config.platformDepth) {
      errors.push(
        `Objeto ${obj.id}: Sai dos limites da plataforma (Z máximo). Posição: ${obj.position.z}, Profundidade: ${obj.depth}`
      );
    }

    return errors;
  }

  /**
   * REGRA 4: Validar sobreposição
   * - Objeto não pode sobrepor outro objeto
   */
  private validateNoOverlap(
    obj: GridObject,
    excludeObjectId?: string
  ): string[] {
    const errors: string[] = [];
    const tiles = this.gridSystem.getOccupiedTiles(obj);

    for (const tile of tiles) {
      const occupyingObj = this.gridSystem.getObjectAtTile(tile.x, tile.z);
      if (
        occupyingObj &&
        occupyingObj.id !== obj.id &&
        occupyingObj.id !== excludeObjectId
      ) {
        errors.push(
          `Objeto ${obj.id}: Sobrepõe objeto ${occupyingObj.id} no tile (${tile.x}, ${tile.z})`
        );
        break; // Reportar apenas uma sobreposição
      }
    }

    return errors;
  }

  /**
   * REGRA 5: Validar dimensões de ocupação
   * - Objeto 4x4 deve ocupar exatamente 16 tiles
   * - Dimensões devem ser positivas
   */
  private validateOccupancy(obj: GridObject): string[] {
    const errors: string[] = [];

    const totalTiles = obj.width * obj.depth;
    if (totalTiles === 0) {
      errors.push(
        `Objeto ${obj.id}: Dimensões resultam em 0 tiles. Width: ${obj.width}, Depth: ${obj.depth}`
      );
    }

    return errors;
  }

  /**
   * Validar objeto completo
   */
  validateObject(obj: GridObject, excludeObjectId?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Aplicar todas as regras
    errors.push(...this.validateHeight(obj));
    errors.push(...this.validateGridAlignment(obj));
    errors.push(...this.validatePlatformBounds(obj));
    errors.push(...this.validateNoOverlap(obj, excludeObjectId));
    errors.push(...this.validateOccupancy(obj));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validar posição proposta antes de mover
   */
  validatePositionChange(
    objectId: string,
    newPosition: GridPosition
  ): ValidationResult {
    const obj = this.gridSystem.getObject(objectId);
    if (!obj) {
      return {
        isValid: false,
        errors: [`Objeto ${objectId} não encontrado`],
        warnings: [],
      };
    }

    const testObj: GridObject = {
      ...obj,
      position: newPosition,
    };

    return this.validateObject(testObj, objectId);
  }

  /**
   * Validar todos os objetos no grid
   */
  validateAllObjects(): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const objects = this.gridSystem.getAllObjects();
    for (const obj of objects) {
      const result = this.validateObject(obj);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Gerar relatório detalhado de validação
   */
  generateReport(): string {
    const validation = this.validateAllObjects();
    let report = '=== RELATÓRIO DE VALIDAÇÃO ESPACIAL ===\n\n';

    if (validation.isValid) {
      report += '✓ Todos os objetos estão em posições válidas\n';
    } else {
      report += `✗ ${validation.errors.length} erro(s) encontrado(s):\n`;
      validation.errors.forEach((error) => {
        report += `  - ${error}\n`;
      });
    }

    if (validation.warnings.length > 0) {
      report += `\n⚠ ${validation.warnings.length} aviso(s):\n`;
      validation.warnings.forEach((warning) => {
        report += `  - ${warning}\n`;
      });
    }

    report += `\nTotal de objetos: ${this.gridSystem.getAllObjects().length}\n`;

    return report;
  }
}

export default SpatialValidator;
