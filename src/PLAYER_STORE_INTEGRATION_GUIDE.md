# Player Store Integration Guide

## Overview

This document outlines the centralized player data management system using `usePlayerStore()` across all game pages and essential code.

## Architecture

### Data Flow

```
Database (Players Collection)
    ↓
playerDataService (loadPlayerFromDatabase)
    ↓
usePlayerStore (Zustand - In-memory cache)
    ↓
Game Pages & Components
```

## Core Components

### 1. **usePlayerStore** (`/src/store/playerStore.ts`)

Centralized Zustand store managing all player state:

```typescript
// Player Data Fields
- playerId: string | null
- playerName: string
- level: number
- progress: number
- isGuest: boolean
- profilePicture: string | null
- barracoLevel: number
- cleanMoney: number
- dirtyMoney: number
- spins: number
- multiplier: number
- hasInitialized: boolean
- isSpinning: boolean
- lastResult: string[] | null
- players: Record<string, Players>
```

### 2. **playerDataService** (`/src/services/playerDataService.ts`)

Service layer for database operations:

```typescript
// Key Functions
- loadPlayerFromDatabase(playerId): Load and sync to store
- updatePlayerInDatabase(playerId, updates): Update DB and reload
- updatePlayerMoney(playerId, dirtyMoney): Update dirty money
- updateCleanMoney(playerId, cleanMoney): Update clean money
- updatePlayerProgress(playerId, level, progress): Update level/progress
- updateBarracoLevel(playerId, barracoLevel): Update house level
- syncPlayerToDatabase(playerId): Full sync to DB
- createNewPlayer(playerData): Create new player
- deletePlayerFromDatabase(playerId): Delete player
```

### 3. **usePlayerInitialization** (`/src/hooks/usePlayerInitialization.ts`)

Hook for initial player setup on app load:

```typescript
// Automatically:
- Checks if player exists in database
- Creates new player if needed
- Syncs to store
- Initializes commerce data
- Prevents duplicate initialization
```

### 4. **usePlayerDataSync** (`/src/hooks/usePlayerDataSync.ts`)

Hook for periodic data synchronization:

```typescript
// Automatically:
- Syncs player data every 30 seconds
- Saves on page unload
- Prevents data loss
```

## Implementation in Game Pages

### Pattern 1: Simple Data Display

**Example: Header Component**

```typescript
import { usePlayerStore } from '@/store/playerStore';

export default function Header() {
  const { 
    playerName, 
    level, 
    dirtyMoney, 
    cleanMoney, 
    barracoLevel 
  } = usePlayerStore();

  return (
    <header>
      <div>LVL: {level}</div>
      <div>💵 Sujo: ${dirtyMoney}</div>
      <div>💚 Limpo: ${cleanMoney}</div>
    </header>
  );
}
```

### Pattern 2: Loading Player Data

**Example: CommercialCenterPage**

```typescript
import { usePlayerStore } from '@/store/playerStore';
import { loadPlayerFromDatabase } from '@/services/playerDataService';

export default function CommercialCenterPage() {
  const { playerId, dirtyMoney, cleanMoney, setDirtyMoney, setCleanMoney } = usePlayerStore();
  const [playerData, setPlayerData] = useState<Players | null>(null);

  useEffect(() => {
    if (!member?._id) return;

    const loadData = async () => {
      // Load from database and sync to store
      await loadPlayerFromDatabase(member._id);
      
      // Get updated data from store
      const player = await BaseCrudService.getById<Players>('players', member._id);
      if (player) {
        setPlayerData(player);
        setDirtyMoney(player.dirtyMoney || 0);
        setCleanMoney(player.cleanMoney || 0);
      }
    };

    loadData();
  }, [member?._id]);

  // Use dirtyMoney and cleanMoney from store
  return (
    <div>
      <p>Dinheiro Sujo: ${dirtyMoney}</p>
      <p>Dinheiro Limpo: ${cleanMoney}</p>
    </div>
  );
}
```

### Pattern 3: Updating Player Data

**Example: MoneyLaunderingPage**

```typescript
import { loadPlayerFromDatabase } from '@/services/playerDataService';

export default function MoneyLaunderingPage() {
  const { dirtyMoney, cleanMoney } = usePlayerStore();

  const handleOperationComplete = async () => {
    try {
      // Perform operation
      await performLaunderingOperation();

      // Reload from database and sync to store
      await loadPlayerFromDatabase(member._id);

      // Store automatically updated
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <p>Dinheiro Sujo: ${dirtyMoney}</p>
      <button onClick={handleOperationComplete}>Completar</button>
    </div>
  );
}
```

## Pages Using usePlayerStore

### ✅ Implemented

1. **Header.tsx** - Displays player stats (level, money, house level)
2. **ProfilePage.tsx** - Shows player profile with game stats
3. **HomePage.tsx** - Displays player name
4. **GiroNoAsfaltoPage.tsx** - Uses barraco level
5. **LuxuryShowroomPage.tsx** - Uses player level and barraco level
6. **BarracoPage.tsx** - Uses level and barraco level
7. **BriberyPages** - All use dirtyMoney and level
8. **InvestmentSkillTreePage.tsx** - Uses dirtyMoney
9. **ResetLuxuryPage.tsx** - Uses dirtyMoney
10. **ResetAllPage.tsx** - Uses resetPlayer
11. **CommercialCenterPage.tsx** - Uses dirtyMoney, cleanMoney, setDirtyMoney, setCleanMoney
12. **MoneyLaunderingPage.tsx** - Uses playerId, dirtyMoney, cleanMoney
13. **SlotMachine.tsx** - Uses spins, multiplier, game state
14. **BriberyGuardPage.tsx** - Uses dirtyMoney, level, setLevel

## Best Practices

### ✅ DO

1. **Import from centralized store**
   ```typescript
   import { usePlayerStore } from '@/store/playerStore';
   ```

2. **Use loadPlayerFromDatabase for initial load**
   ```typescript
   await loadPlayerFromDatabase(playerId);
   ```

3. **Sync after operations**
   ```typescript
   await loadPlayerFromDatabase(playerId);
   ```

4. **Use store for display**
   ```typescript
   const { level, dirtyMoney } = usePlayerStore();
   ```

5. **Use playerDataService for updates**
   ```typescript
   await updatePlayerMoney(playerId, newAmount);
   ```

### ❌ DON'T

1. **Don't use separate stores**
   ```typescript
   // ❌ WRONG
   import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
   ```

2. **Don't access localStorage directly**
   ```typescript
   // ❌ WRONG
   const money = localStorage.getItem('dirtyMoney');
   ```

3. **Don't update store without syncing to DB**
   ```typescript
   // ❌ WRONG
   store.setDirtyMoney(1000); // Missing DB sync
   ```

4. **Don't fetch player data separately**
   ```typescript
   // ❌ WRONG
   const player = await BaseCrudService.getById('players', id);
   // Use loadPlayerFromDatabase instead
   ```

5. **Don't create duplicate initialization**
   ```typescript
   // ❌ WRONG - Multiple usePlayerInitialization calls
   ```

## Initialization Flow

### On App Load

1. **MemberProvider** checks authentication
2. **usePlayerInitialization** hook runs (in StarMapPage)
3. Checks if player exists in database
4. Creates new player if needed
5. Syncs to store
6. **usePlayerDataSync** starts periodic sync

### On Page Load

1. Load player from database: `await loadPlayerFromDatabase(playerId)`
2. Store automatically synced
3. Use store data in components
4. On operations, reload: `await loadPlayerFromDatabase(playerId)`

## Database Sync Strategy

### Optimistic Updates

For fast UI response:

```typescript
// 1. Update store immediately
store.setDirtyMoney(newAmount);

// 2. Sync to database
try {
  await updatePlayerInDatabase(playerId, { dirtyMoney: newAmount });
} catch (error) {
  // 3. Revert on error
  await loadPlayerFromDatabase(playerId);
}
```

### Periodic Sync

Every 30 seconds via `usePlayerDataSync`:

```typescript
setInterval(async () => {
  await syncPlayerToDatabase(playerId);
}, 30000);
```

### On Unload

Save before leaving page:

```typescript
window.addEventListener('beforeunload', async () => {
  await syncPlayerToDatabase(playerId);
});
```

## Troubleshooting

### Issue: Store not updating after operation

**Solution:** Call `loadPlayerFromDatabase()` after operation

```typescript
await performOperation();
await loadPlayerFromDatabase(playerId); // Reload and sync
```

### Issue: Stale data in components

**Solution:** Use store selectors, not local state

```typescript
// ✅ CORRECT
const { dirtyMoney } = usePlayerStore();

// ❌ WRONG
const [money, setMoney] = useState(0);
```

### Issue: Multiple initializations

**Solution:** Use `usePlayerInitialization` hook once in app

```typescript
// In StarMapPage or main layout
usePlayerInitialization();
```

## Migration Checklist

When updating a page to use `usePlayerStore`:

- [ ] Import `usePlayerStore` from `@/store/playerStore`
- [ ] Remove local player state if possible
- [ ] Use store selectors for data
- [ ] Call `loadPlayerFromDatabase()` on mount
- [ ] Call `loadPlayerFromDatabase()` after operations
- [ ] Remove separate money stores
- [ ] Test data persistence
- [ ] Verify sync on page unload

## Summary

The centralized player store system ensures:

✅ **Single source of truth** - All player data in one store
✅ **Automatic persistence** - Periodic sync to database
✅ **Optimistic updates** - Fast UI response
✅ **Consistency** - No duplicate data
✅ **Scalability** - Easy to add new fields
✅ **Maintainability** - Clear data flow

All game pages should use `usePlayerStore()` for player data access and `playerDataService` for database operations.
