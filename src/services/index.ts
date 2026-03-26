/**
 * SERVICES INDEX
 * 
 * Central export point for all services.
 * Import services from here instead of individual files.
 * 
 * Usage:
 * import { 
 *   playerEconomyService,
 *   playerProfileService,
 *   slotService,
 * } from '@/services';
 */

// Authentication
export * from './authService';

// Player Profile
export * from './playerProfileService';

// Player Economy (Money)
export * from './playerEconomyService';

// Player Progress (Level, Progression)
export * from './playerProgressService';

// Slot Machine
export * from './slotService';

// Inventory
export * from './inventoryService';

// Luxury Items
export * from './luxuryService';

// Investments
export * from './investmentService';

// Multiplayer Presence
export * from './multiplayerPresenceService';

// Legacy Services (to be refactored)
export * from './playerService';
export * from './playerDataService';
export * from './playerEconomyService';
export * from './playerPresenceService';
export * from './spinEconomyService';
export * from './comerciosService';
export * from './financialHistoryService';
export * from './sessionResetService';
export * from './criticalActionService';
export * from './backgroundService';
export * from './indexedDBService';
