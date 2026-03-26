# Player Data Consistency Guide

## Overview

This document explains how to ensure all code uses the same saved player data consistently across the application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Database (Players Collection)             │
│              Source of Truth - Persistent Storage            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (load/save)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              playerStore (Zustand)                          │
│         In-Memory Cache - Fast Access                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (read/write)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Components & Pages                              │
│         Use playerDataService to access data                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Principle

**Single Source of Truth**: Database is the source of truth. All data flows through `playerDataService.ts`.

## Key Services

### 1. `playerDataService.ts` (NEW - Use This!)

**Purpose**: Centralized service for all player data operations.

**Key Functions**:

```typescript
// Load player from database and sync to store
await loadPlayerFromDatabase(playerId: string): Promise<Players | null>

// Update player in database and sync to store
await updatePlayerInDatabase(playerId: string, updates: Partial<Players>): Promise<Players | null>

// Get current player from store (cached)
getCurrentPlayerFromStore(): PlayerState

// Update specific fields
await updatePlayerMoney(playerId: string, dirtyMoney: number): Promise<void>
await updateCleanMoney(playerId: string, cleanMoney: number): Promise<void>
await updatePlayerProgress(playerId: string, level: number, progress: number): Promise<void>
await updateBarracoLevel(playerId: string, barracoLevel: number): Promise<void>

// Sync all data to database
await syncPlayerToDatabase(playerId: string): Promise<void>

// Create/Delete
await createNewPlayer(playerData: Partial<Players>): Promise<Players | null>
await deletePlayerFromDatabase(playerId: string): Promise<void>
```

### 2. `playerStore.ts` (Zustand Store)

**Purpose**: In-memory cache of player data.

**Usage**:
```typescript
import { usePlayerStore } from '@/store/playerStore';

const { playerId, playerName, level, dirtyMoney, cleanMoney } = usePlayerStore();
```

**Important**: Never update store directly. Always use `playerDataService` functions.

### 3. `playerService.ts` (Legacy - Avoid)

**Status**: Legacy service. Use `playerDataService` instead.

**Still Used For**:
- Local authentication (login/logout)
- Player registration

## How to Use

### ✅ CORRECT - Using playerDataService

```typescript
import { updatePlayerMoney, getCurrentPlayerFromStore } from '@/services/playerDataService';

// Get current player data
const player = getCurrentPlayerFromStore();
console.log(player.dirtyMoney);

// Update player money
await updatePlayerMoney(playerId, newAmount);

// The store is automatically updated
// The database is automatically synced
```

### ❌ WRONG - Direct localStorage access

```typescript
// DON'T DO THIS
const money = localStorage.getItem('playerMoney');
localStorage.setItem('playerMoney', newAmount);
```

### ❌ WRONG - Separate money stores

```typescript
// DON'T DO THIS
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';

// These stores are NOT synced with database
const { dirtyMoney } = useDirtyMoneyStore();
```

### ❌ WRONG - Direct store updates

```typescript
// DON'T DO THIS
const store = usePlayerStore.getState();
store.setDirtyMoney(newAmount); // No database sync!
```

## Data Flow Examples

### Example 1: Update Player Money

```typescript
import { updatePlayerMoney } from '@/services/playerDataService';

// User earns money
const newAmount = 5000;

// This does:
// 1. Updates playerStore immediately (optimistic)
// 2. Saves to database
// 3. On error, reloads from database to revert
await updatePlayerMoney(playerId, newAmount);
```

### Example 2: Load Player on App Start

```typescript
import { loadPlayerFromDatabase } from '@/services/playerDataService';

// When user logs in
const player = await loadPlayerFromDatabase(playerId);

// This does:
// 1. Fetches from database
// 2. Syncs all data to playerStore
// 3. Returns the player object
```

### Example 3: Periodic Sync

```typescript
import { syncPlayerToDatabase } from '@/services/playerDataService';

// Every 30 seconds (in usePlayerDataSync hook)
await syncPlayerToDatabase(playerId);

// This does:
// 1. Takes all data from playerStore
// 2. Saves to database
// 3. Ensures database is always up-to-date
```

## Hooks Using Centralized Service

### `usePlayerDataSync.ts`
- Automatically syncs player data every 30 seconds
- Syncs on page unload
- Uses `syncPlayerToDatabase()`

### `usePlayerInitialization.ts`
- Loads player on app start
- Creates new player if needed
- Uses `loadPlayerFromDatabase()` and `createNewPlayer()`

### `usePlayerAuth.ts`
- Loads player after local authentication
- Uses `loadPlayerFromDatabase()`

## Migration Guide

If you have code using old patterns:

### Before (OLD)
```typescript
const { dirtyMoney } = useDirtyMoneyStore();
const { cleanMoney } = useCleanMoneyStore();

// Update directly
store.setDirtyMoney(newAmount);
```

### After (NEW)
```typescript
import { updatePlayerMoney, updateCleanMoney } from '@/services/playerDataService';

// Update through service
await updatePlayerMoney(playerId, newAmount);
await updateCleanMoney(playerId, newAmount);
```

## Best Practices

1. **Always use playerDataService** for any player data operation
2. **Never access localStorage directly** for player data
3. **Never update playerStore directly** without syncing to database
4. **Use optimistic updates** - update UI immediately, sync to DB in background
5. **Handle errors gracefully** - reload from database on sync failure
6. **Keep playerStore as cache** - it's for fast access, not source of truth

## Debugging

### Check Current Player Data
```typescript
import { getCurrentPlayerFromStore } from '@/services/playerDataService';

const player = getCurrentPlayerFromStore();
console.log('Current player:', player);
```

### Verify Database Sync
```typescript
import { syncPlayerToDatabase } from '@/services/playerDataService';

// Force sync to database
await syncPlayerToDatabase(playerId);
console.log('Synced to database');
```

### Reload from Database
```typescript
import { loadPlayerFromDatabase } from '@/services/playerDataService';

// Reload all data from database
const player = await loadPlayerFromDatabase(playerId);
console.log('Reloaded from database:', player);
```

## Deprecated Stores

The following stores are deprecated and should NOT be used:
- `dirtyMoneyStore.ts` - Use playerStore.dirtyMoney instead
- `cleanMoneyStore.ts` - Use playerStore.cleanMoney instead

These were separate stores that could get out of sync. All money data is now in playerStore and synced through playerDataService.

## Summary

| Operation | Use This | NOT This |
|-----------|----------|----------|
| Read player data | `getCurrentPlayerFromStore()` | localStorage, separate stores |
| Update money | `updatePlayerMoney()` | Direct store update |
| Update progress | `updatePlayerProgress()` | Direct store update |
| Load player | `loadPlayerFromDatabase()` | Manual fetch + store update |
| Sync to DB | `syncPlayerToDatabase()` | Manual update calls |
| Create player | `createNewPlayer()` | Direct BaseCrudService |
| Delete player | `deletePlayerFromDatabase()` | Direct BaseCrudService |

All data flows through `playerDataService.ts` → `playerStore` → Components.
