# PHASE 8 - SERVICES ARCHITECTURE

## Overview

This document describes the refactored services architecture that separates business logic from UI components. All pages now follow a standardized flow pattern.

## Service Organization by Responsibility

### 1. **authService** - Authentication
- `validateCredentials(email, password)` - Validate login
- `registerCredentials(email, password, playerId)` - Register new account
- `createSession(playerId, email)` - Create authenticated session
- `getAuthSession()` - Get current session
- `destroySession()` - Logout
- `isAuthenticated()` - Check if user is logged in

### 2. **playerProfileService** - Player Profile
- `loadPlayerProfile(playerId)` - Load player profile from database
- `syncPlayerProfile(playerId)` - Sync profile with store
- `updatePlayerProfile(playerId, updates)` - Update profile information
- `getPlayerProfileFromStore()` - Get cached profile from store

### 3. **playerEconomyService** - Financial Operations
- `getPlayerFinances(playerId)` - Get current balances
- `addDirtyMoney(playerId, amount, reason)` - Add dirty money
- `removeDirtyMoney(playerId, amount, reason)` - Remove dirty money
- `addCleanMoney(playerId, amount, reason)` - Add clean money
- `removeCleanMoney(playerId, amount, reason)` - Remove clean money
- `launderMoney(playerId, dirtyAmount, cleanAmount, reason)` - Convert dirty to clean
- `syncPlayerFinances(playerId)` - Sync finances with store

### 4. **playerProgressService** - Progression
- `getPlayerProgress(playerId)` - Get level, progress, barraco level
- `updatePlayerLevel(playerId, newLevel)` - Update level
- `updatePlayerProgress(playerId, newProgress)` - Update progress
- `addPlayerProgress(playerId, amount)` - Add progress
- `updateBarracoLevel(playerId, newLevel)` - Update barraco level
- `incrementBarracoLevel(playerId)` - Increment barraco level
- `syncPlayerProgress(playerId)` - Sync progress with store

### 5. **slotService** - Slot Machine
- `getPlayerSpins(playerId)` - Get spin count
- `addSpins(playerId, amount, reason)` - Add spins
- `removeSpins(playerId, amount, reason)` - Remove spins
- `executeSpin(playerId, spinsToUse)` - Execute spin and calculate reward
- `syncPlayerSpins(playerId)` - Sync spins with store

### 6. **inventoryService** - Inventory Management
- `getPlayerInventory(playerId)` - Get inventory items
- `addInventoryItem(playerId, item)` - Add item to inventory
- `removeInventoryItem(playerId, itemId, quantity)` - Remove item
- `clearInventory(playerId)` - Clear all items
- `getInventoryItemCount(playerId, itemId)` - Get item quantity

### 7. **luxuryService** - Luxury Items
- `loadLuxuryItems()` - Load all luxury items from database
- `getLuxuryItem(itemId)` - Get specific luxury item
- `getOwnedLuxuryItems(playerId)` - Get player's owned items
- `purchaseLuxuryItem(playerId, itemId, cost)` - Purchase item
- `ownsLuxuryItem(playerId, itemId)` - Check ownership
- `calculateLuxuryBonus(playerId)` - Calculate bonuses from owned items
- `removeLuxuryItem(playerId, itemId)` - Remove item

### 8. **investmentService** - Investments
- `getPlayerInvestments(playerId)` - Get all investments
- `createInvestment(playerId, investment)` - Create new investment
- `completeInvestment(playerId, investmentId)` - Complete investment
- `calculateInvestmentReturn(investment)` - Calculate returns
- `getTotalInvestmentReturns(playerId)` - Get total returns
- `cancelInvestment(playerId, investmentId)` - Cancel investment
- `getActiveInvestments(playerId)` - Get active investments

### 9. **multiplayerPresenceService** - Multiplayer
- `updatePlayerPresence(playerId, mapPosition, status)` - Update presence
- `getPlayerPresence(playerId)` - Get player presence
- `getOnlinePlayers()` - Get all online players
- `getPlayersInLocation(mapPosition)` - Get players in location
- `setPlayerOffline(playerId)` - Set player offline
- `getPlayerCountInLocation(mapPosition)` - Get player count
- `getTotalOnlinePlayersCount()` - Get total online count

## Standardized Page Flow Pattern

Every important page should follow this pattern:

```typescript
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { 
  loadPlayerProfile, 
  syncPlayerProfile 
} from '@/services/playerProfileService';
import { 
  getPlayerFinances, 
  syncPlayerFinances 
} from '@/services/playerEconomyService';

export default function MyPage() {
  // 1. Get playerId from session/store
  const playerId = usePlayerStore((state) => state.playerId);
  
  // 2. Local state for loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Load data on mount
  useEffect(() => {
    if (!playerId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load from services (database)
        await syncPlayerProfile(playerId);
        await syncPlayerFinances(playerId);
        
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [playerId]);

  // 4. Get data from store (cached)
  const playerName = usePlayerStore((state) => state.playerName);
  const dirtyMoney = usePlayerStore((state) => state.dirtyMoney);
  const cleanMoney = usePlayerStore((state) => state.cleanMoney);

  // 5. Handle user actions
  const handleAction = async () => {
    try {
      // Call service to perform action
      const result = await someService.doSomething(playerId);
      
      if (result.success) {
        // Reload/sync store after action
        await syncPlayerProfile(playerId);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  // 6. Render UI
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{playerName}</h1>
      <p>Dirty Money: {dirtyMoney}</p>
      <p>Clean Money: {cleanMoney}</p>
      <button onClick={handleAction}>Do Action</button>
    </div>
  );
}
```

## Key Rules

### 1. **Pages Don't Contain Business Logic**
- ❌ DON'T: `const newBalance = dirtyMoney - amount;`
- ✅ DO: `const result = await removeDirtyMoney(playerId, amount, reason);`

### 2. **All Data Operations Go Through Services**
- ❌ DON'T: `await BaseCrudService.update(...)`
- ✅ DO: `await playerEconomyService.addDirtyMoney(...)`

### 3. **Store is Cache Only**
- ❌ DON'T: `store.setDirtyMoney(newBalance)` in page
- ✅ DO: Service updates store, page reads from store

### 4. **Standardized Flow**
1. Get playerId from store
2. Load data via services (sync with database)
3. Display data from store (cached)
4. On user action, call service
5. Reload/sync store after action

### 5. **Error Handling**
- All services return `{ success, error?, data? }`
- Pages handle errors gracefully
- Show error messages to user

## Migration Checklist

For each page, ensure:
- [ ] Uses playerId from store
- [ ] Loads data via services on mount
- [ ] Displays data from store
- [ ] Calls services on user actions
- [ ] Syncs store after actions
- [ ] Has error handling
- [ ] Has loading state
- [ ] No direct database calls
- [ ] No business logic in component

## Example: Money Laundering Page

```typescript
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { 
  launderMoney, 
  syncPlayerFinances 
} from '@/services/playerEconomyService';

export default function MoneyLaunderingPage() {
  const playerId = usePlayerStore((state) => state.playerId);
  const dirtyMoney = usePlayerStore((state) => state.dirtyMoney);
  const cleanMoney = usePlayerStore((state) => state.cleanMoney);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLaundering, setIsLaundering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load finances on mount
  useEffect(() => {
    if (!playerId) return;
    
    const load = async () => {
      try {
        await syncPlayerFinances(playerId);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [playerId]);

  // Handle launder action
  const handleLaunder = async (dirtyAmount: number) => {
    try {
      setIsLaundering(true);
      
      // Calculate clean amount (e.g., 80% of dirty)
      const cleanAmount = dirtyAmount * 0.8;
      
      // Call service
      const result = await launderMoney(
        playerId,
        dirtyAmount,
        cleanAmount,
        'Manual laundering'
      );
      
      if (result.success) {
        // Sync store
        await syncPlayerFinances(playerId);
      } else {
        setError(result.error);
      }
    } finally {
      setIsLaundering(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Money Laundering</h1>
      <p>Dirty Money: {dirtyMoney}</p>
      <p>Clean Money: {cleanMoney}</p>
      <button 
        onClick={() => handleLaunder(1000000)}
        disabled={isLaundering}
      >
        {isLaundering ? 'Laundering...' : 'Launder 1M'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Benefits

1. **Separation of Concerns** - Business logic in services, UI in pages
2. **Reusability** - Services can be used by multiple pages
3. **Testability** - Services can be tested independently
4. **Maintainability** - Changes to business logic only affect services
5. **Consistency** - All pages follow same pattern
6. **Scalability** - Easy to add new features
