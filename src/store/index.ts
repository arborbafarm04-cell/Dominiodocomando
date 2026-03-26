/**
 * Store Index - Central Export Point
 * 
 * This file exports all stores for easy importing.
 * 
 * PERMANENT STORES (saved to database):
 * - playerStore: Core player progression data
 * - uiStore: Extended permanent data (skills, items, etc.)
 * - luxuryShopStore: Owned luxury items
 * - comerciosStore: Money laundering businesses
 * - skillTreeStore: Skill progression
 * 
 * REAL-TIME STORES (NOT saved):
 * - realTimeStateStore: Current session game state
 * - multiplayerStore: Other players data
 * 
 * EPHEMERAL STORES (session-specific):
 * - gameStore: Game mechanics
 * - mapStateStore: Map state
 * - etc.
 */

// Permanent stores
export { usePlayerStore } from './playerStore';
export { useUIStore } from './uiStore';
export { useLuxuryShopStore } from './luxuryShopStore';
export { useComerciosStore } from './comerciosStore';
export { useSkillTreeStore } from './skillTreeStore';

// Real-time stores
export { useRealTimeStateStore } from './realTimeStateStore';
export { useMultiplayerStore } from './multiplayerStore';

// Ephemeral stores
export { useGameStore } from './gameStore';
export { useMapStateStore } from './mapStateStore';
export { useUIStore as useGameScreenStore } from './gameScreenStore';
export { useHotspotStore } from './hotspotStore';
export { useBriberyStore } from './briberyStore';
export { useBusinessInvestmentStore } from './businessInvestmentStore';
export { useComerciosStore as useComerciosUpgradeStore } from './comerciosStore';
export { useCommercialCenterStore } from './commercialCenterStore';
export { useDragCustomizationStore } from './dragCustomizationStore';
export { useDrawingStore } from './drawingStore';
export { useFactionStore } from './factionStore';
export { useIntelligenceSkillTreeStore } from './intelligenceSkillTreeStore';
export { useInvestmentSkillTreeStore } from './investmentSkillTreeStore';
export { useMoneyLaunderingStore } from './moneyLaunderingStore';
export { useRespeitSkillTreeStore } from './respeitSkillTreeStore';
export { useSelectedTilesStore } from './selectedTilesStore';
export { useSpinVaultStore } from './spinVaultStore';
export { useAgilitySkillTreeStore } from './agilitySkillTreeStore';
export { useAttackSkillTreeStore } from './attackSkillTreeStore';
export { useDefenseSkillTreeStore } from './defenseSkillTreeStore';
export { useVigorSkillTreeStore } from './vigorSkillTreeStore';
export { useMapButtonsStore } from './mapButtonsStore';
