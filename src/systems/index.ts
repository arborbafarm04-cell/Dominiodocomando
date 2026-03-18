/**
 * Systems Index
 * Exporta todos os sistemas de grid e posicionamento
 */

export { GridSystem, type GridConfig, type GridPosition, type GridObject, type OccupiedTile } from './GridSystem';
export { SpatialValidator, type ValidationResult } from './SpatialValidator';
export { ObjectPositioner, type PositioningOptions } from './ObjectPositioner';
export { PLATFORM_RULES, calculateTileSetCenter, getOccupiedTiles, isWithinPlatformBounds } from './PlatformRules';
export { default as briberyZoneSystem } from './briberyZoneSystem';
export { default as factionSystem } from './factionSystem';
export { default as houseSystem } from './houseSystem';
