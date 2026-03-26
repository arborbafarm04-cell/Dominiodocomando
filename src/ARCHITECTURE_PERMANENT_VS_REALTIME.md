# Architecture: Permanent vs Real-Time State

## Overview

This document defines the separation between **permanent player progression** and **real-time game state** to prevent multiplayer synchronization issues.

---

## 1. PERMANENT STATE (Saved to Database)

These are player progression values that must be persisted and synchronized across sessions.

### Core Permanent Data (playerStore)
```
- playerId: string
- playerName: string
- level: number
- progress: number
- barracoLevel: number
- cleanMoney: number
- dirtyMoney: number
- spins: number
- profilePicture: string | null
- isGuest: boolean
```

### Extended Permanent Data (specialized stores)
```
- skillTrees: Record<string, any> (uiStore)
- ownedLuxuryItems: string[] (luxuryShopStore)
- investments: Record<string, any> (uiStore)
- inventory: Record<string, any> (uiStore)
- comercios: Record<string, any> (comerciosStore)
- cooldowns: Record<string, number> (uiStore)
- passiveBonuses: Record<string, number> (uiStore)
```

### Database Location
- **Collection**: `players`
- **Fields**: All fields in the Players entity
- **Sync Method**: `syncPlayerToDatabase()` in playerDataService.ts

---

## 2. REAL-TIME STATE (NOT Saved)

These are ephemeral game states that should NEVER be saved to database.

### Real-Time State (realTimeStateStore)
```
- currentMapPosition: { x: number; y: number } | null
- currentLocation: string | null
- currentAnimation: string | null
- isAnimating: boolean
- openScreen: string | null (e.g., 'inventory', 'skills')
- openModal: string | null (e.g., 'dialog', 'shop')
- isInCombat: boolean
- currentCombatTarget: string | null
- activeEffects: Record<string, { startTime: number; duration: number }>
```

### Why NOT Save Real-Time State?
1. **Session-specific**: Only relevant to current play session
2. **Multiplayer conflicts**: Causes desync if saved/loaded
3. **Rapid changes**: Position/animation change every frame
4. **No persistence needed**: Player doesn't care about last position on reload
5. **Privacy**: Other players shouldn't know exact position on server

---

## 3. Store Architecture

### playerStore (Permanent)
- **Purpose**: Session cache of permanent player data
- **Persistence**: YES (localStorage via zustand persist)
- **Database Sync**: YES (via playerDataService)
- **Multiplayer**: YES (shared with other players)
- **Reset on Reload**: NO (persisted)

### uiStore (Permanent + Ephemeral)
- **Purpose**: Game mechanics and additional permanent data
- **Persistence**: PARTIAL (only permanent data)
- **Database Sync**: YES (via playerDataService)
- **Multiplayer**: YES (for permanent data only)
- **Reset on Reload**: YES (ephemeral parts)

### realTimeStateStore (Real-Time Only)
- **Purpose**: Current session game state
- **Persistence**: NO (never saved)
- **Database Sync**: NO
- **Multiplayer**: NO (local only)
- **Reset on Reload**: YES (always)

### multiplayerStore (Other Players)
- **Purpose**: Data about other players
- **Persistence**: NO (ephemeral)
- **Database Sync**: NO (read-only from server)
- **Multiplayer**: YES (synced from server)
- **Reset on Reload**: YES (always)

---

## 4. Critical Actions That Trigger Saves

Use `criticalActionService.ts` for these actions:

### Login/Logout
```typescript
import { saveAfterLogin, saveBeforeLogout } from '@/services/criticalActionService';

// On login
await saveAfterLogin(playerId);

// Before logout
await saveBeforeLogout(playerId);
```

### Spin Completion
```typescript
import { saveAfterSpin } from '@/services/criticalActionService';

// After spin completes and rewards given
await saveAfterSpin(playerId);
```

### Purchase/Trade
```typescript
import { saveAfterPurchase } from '@/services/criticalActionService';

// After player buys item
await saveAfterPurchase(playerId, 'Diamond Ring', 5000);
```

### Upgrade (Barraco, Skills, Businesses)
```typescript
import { saveAfterUpgrade } from '@/services/criticalActionService';

// After upgrade completes
await saveAfterUpgrade(playerId, 'barraco', 'Level 5');
```

### Money Laundering
```typescript
import { saveAfterLaundering } from '@/services/criticalActionService';

// After laundering cycle completes
await saveAfterLaundering(playerId, 'Pizzaria', 10000);
```

### Reward Gain
```typescript
import { saveAfterReward } from '@/services/criticalActionService';

// After player receives reward
await saveAfterReward(playerId, 'bribery', 5000);
```

### Profile Change
```typescript
import { saveAfterProfileChange } from '@/services/criticalActionService';

// After player changes name
await saveAfterProfileChange(playerId, 'name', 'NewName');

// After player changes photo
await saveAfterProfileChange(playerId, 'photo', 'photoUrl');
```

### Barraco Evolution
```typescript
import { saveAfterBarracoEvolution } from '@/services/criticalActionService';

// After barraco levels up
await saveAfterBarracoEvolution(playerId, 5);
```

---

## 5. Emergency Save on Page Unload

Setup once in your app initialization:

```typescript
import { setupEmergencySaveListener } from '@/services/criticalActionService';

// In your app init (e.g., HomePage or main layout)
useEffect(() => {
  const playerId = usePlayerStore.getState().playerId;
  if (playerId) {
    const cleanup = setupEmergencySaveListener(playerId);
    return cleanup;
  }
}, []);
```

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Source of Truth)               │
│                    players collection                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ loadPlayerFromDatabase()
                           │ syncPlayerToDatabase()
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PERMANENT STATE (Session Cache)                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  playerStore     │  │  uiStore         │                │
│  │  (basic data)    │  │  (extended data) │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ luxuryShopStore  │  │ comerciosStore   │                │
│  │ (luxury items)   │  │ (businesses)     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (NOT saved to DB)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              REAL-TIME STATE (Ephemeral)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  realTimeStateStore                                  │  │
│  │  - currentMapPosition                                │  │
│  │  - currentAnimation                                  │  │
│  │  - openScreen/openModal                              │  │
│  │  - isInCombat                                        │  │
│  │  - activeEffects                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  multiplayerStore (other players - read-only)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Best Practices

### ✅ DO
- Use `playerStore` for permanent player data
- Use `realTimeStateStore` for current session state
- Call critical action services after important events
- Setup emergency save on app init
- Reload from database on error to revert changes

### ❌ DON'T
- Save real-time state to database
- Mix permanent and real-time state in same store
- Update database on every small change
- Access localStorage directly for player data
- Use separate stores for money (use playerStore only)

### 🔄 Sync Pattern
```typescript
// 1. Update store immediately (optimistic)
playerStore._setDirtyMoney(newAmount);

// 2. Sync to database
try {
  await updatePlayerInDatabase(playerId, { dirtyMoney: newAmount });
} catch (error) {
  // 3. On error, reload from database to revert
  await loadPlayerFromDatabase(playerId);
}
```

---

## 8. Multiplayer Implications

### Permanent State
- **Shared**: All players see same permanent data
- **Authoritative**: Database is source of truth
- **Conflict Resolution**: Last write wins (with timestamps)

### Real-Time State
- **Local Only**: Each player has their own real-time state
- **Not Shared**: Other players don't see your position/animation
- **No Conflicts**: No synchronization needed

### Example: Player Movement
```typescript
// ❌ WRONG: Saving position to database
await updatePlayerInDatabase(playerId, { 
  currentPosition: { x: 100, y: 200 } 
});

// ✅ CORRECT: Using real-time store only
realTimeStateStore.setMapPosition({ x: 100, y: 200 });

// For multiplayer, use separate real-time sync (Firebase, WebSocket)
// NOT the permanent database
```

---

## 9. Migration Checklist

When refactoring existing code:

- [ ] Identify all permanent player data
- [ ] Move to playerStore or appropriate permanent store
- [ ] Identify all real-time game state
- [ ] Move to realTimeStateStore
- [ ] Replace all direct database writes with critical action services
- [ ] Setup emergency save listener
- [ ] Test multiplayer synchronization
- [ ] Verify no real-time state is saved
- [ ] Document any custom stores

---

## 10. File References

- **Permanent State**: `/src/store/playerStore.ts`, `/src/store/uiStore.ts`
- **Real-Time State**: `/src/store/realTimeStateStore.ts`
- **Data Service**: `/src/services/playerDataService.ts`
- **Critical Actions**: `/src/services/criticalActionService.ts`
- **Multiplayer**: `/src/store/multiplayerStore.ts`
