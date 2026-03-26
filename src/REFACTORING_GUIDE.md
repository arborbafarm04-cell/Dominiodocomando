# PHASE 8 - PAGE REFACTORING GUIDE

## How to Refactor Existing Pages

This guide shows how to refactor pages to follow the new services architecture.

## Step-by-Step Refactoring Process

### Step 1: Identify Current Pattern

Look for pages that:
- Call `BaseCrudService` directly
- Have business logic in component
- Don't use services
- Have mixed concerns

### Step 2: Extract Business Logic to Service

**Before:**
```typescript
const handleBribe = async () => {
  const player = await BaseCrudService.getById('players', playerId);
  const newBalance = player.dirtyMoney - bribeAmount;
  
  if (newBalance < 0) {
    setError('Insufficient money');
    return;
  }
  
  await BaseCrudService.update('players', {
    _id: playerId,
    dirtyMoney: newBalance,
  });
  
  store._setDirtyMoney(newBalance);
};
```

**After:**
```typescript
const handleBribe = async () => {
  const result = await removeDirtyMoney(playerId, bribeAmount, 'Bribe');
  
  if (!result.success) {
    setError(result.error);
    return;
  }
};
```

### Step 3: Implement Standardized Flow

**Template:**
```typescript
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { 
  syncPlayerProfile,
  syncPlayerFinances,
  syncPlayerProgress,
} from '@/services/playerProfileService';

export default function MyPage() {
  // 1. Get playerId from store
  const playerId = usePlayerStore((state) => state.playerId);
  
  // 2. Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Load data on mount
  useEffect(() => {
    if (!playerId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Sync all needed data from database
        await syncPlayerProfile(playerId);
        await syncPlayerFinances(playerId);
        await syncPlayerProgress(playerId);
        
        setError(null);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [playerId]);

  // 4. Get data from store
  const playerName = usePlayerStore((state) => state.playerName);
  const dirtyMoney = usePlayerStore((state) => state.dirtyMoney);
  const level = usePlayerStore((state) => state.level);

  // 5. Handle actions
  const handleAction = async () => {
    try {
      // Call service
      const result = await someService.doSomething(playerId);
      
      if (result.success) {
        // Reload data
        await syncPlayerProfile(playerId);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  // 6. Render
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* UI here */}
    </div>
  );
}
```

## Common Refactoring Patterns

### Pattern 1: Money Operations

**Before:**
```typescript
const handleSpend = async (amount: number) => {
  const player = await BaseCrudService.getById('players', playerId);
  const newBalance = player.dirtyMoney - amount;
  
  if (newBalance < 0) {
    setError('Insufficient funds');
    return;
  }
  
  await BaseCrudService.update('players', {
    _id: playerId,
    dirtyMoney: newBalance,
  });
  
  store._setDirtyMoney(newBalance);
};
```

**After:**
```typescript
import { removeDirtyMoney, syncPlayerFinances } from '@/services/playerEconomyService';

const handleSpend = async (amount: number) => {
  const result = await removeDirtyMoney(playerId, amount, 'Purchase');
  
  if (!result.success) {
    setError(result.error);
    return;
  }
  
  // Store already synced by service
};
```

### Pattern 2: Level Progression

**Before:**
```typescript
const handleLevelUp = async () => {
  const player = await BaseCrudService.getById('players', playerId);
  const newLevel = player.level + 1;
  
  await BaseCrudService.update('players', {
    _id: playerId,
    level: newLevel,
  });
  
  store.setLevel(newLevel);
};
```

**After:**
```typescript
import { incrementPlayerLevel } from '@/services/playerProgressService';

const handleLevelUp = async () => {
  const result = await updatePlayerLevel(playerId, currentLevel + 1);
  
  if (!result.success) {
    setError(result.error);
  }
  // Store already synced by service
};
```

### Pattern 3: Item Management

**Before:**
```typescript
const handlePurchaseItem = async (itemId: string, cost: number) => {
  const player = await BaseCrudService.getById('players', playerId);
  
  if (player.dirtyMoney < cost) {
    setError('Insufficient funds');
    return;
  }
  
  const items = JSON.parse(player.ownedLuxuryItems || '[]');
  items.push({ itemId, purchaseDate: new Date() });
  
  await BaseCrudService.update('players', {
    _id: playerId,
    dirtyMoney: player.dirtyMoney - cost,
    ownedLuxuryItems: JSON.stringify(items),
  });
  
  store._setDirtyMoney(player.dirtyMoney - cost);
};
```

**After:**
```typescript
import { purchaseLuxuryItem } from '@/services/luxuryService';
import { removeDirtyMoney, syncPlayerFinances } from '@/services/playerEconomyService';

const handlePurchaseItem = async (itemId: string, cost: number) => {
  // Remove money
  const moneyResult = await removeDirtyMoney(playerId, cost, 'Luxury purchase');
  if (!moneyResult.success) {
    setError(moneyResult.error);
    return;
  }
  
  // Purchase item
  const itemResult = await purchaseLuxuryItem(playerId, itemId, cost);
  if (!itemResult.success) {
    setError(itemResult.error);
    // Refund money if purchase fails
    await addDirtyMoney(playerId, cost, 'Purchase refund');
    return;
  }
};
```

### Pattern 4: Data Loading

**Before:**
```typescript
useEffect(() => {
  const loadData = async () => {
    const player = await BaseCrudService.getById('players', playerId);
    const items = JSON.parse(player.ownedLuxuryItems || '[]');
    
    setPlayerData(player);
    setItems(items);
  };
  
  loadData();
}, [playerId]);
```

**After:**
```typescript
useEffect(() => {
  if (!playerId) return;
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Sync from database
      await syncPlayerProfile(playerId);
      
      // Get from store
      const items = await getOwnedLuxuryItems(playerId);
      setItems(items);
      
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  loadData();
}, [playerId]);
```

## Pages to Refactor (Priority Order)

### High Priority (Core Gameplay)
1. **HomePage** - Main hub
2. **GiroNoAsfaltoPage** - Money making
3. **LuxuryShowroomPage** - Luxury purchases
4. **BarracoPage** - Barraco upgrades
5. **MoneyLaunderingPage** - Money laundering

### Medium Priority (Features)
6. **BriberyPages** - All bribery pages
7. **InvestmentSkillTreePage** - Investments
8. **CommercialCenterPage** - Commerce

### Low Priority (Secondary)
9. **ProfilePage** - Profile display
10. **FinancialHistoryPage** - History view

## Validation Checklist

For each refactored page, verify:

- [ ] No direct `BaseCrudService` calls in component
- [ ] All business logic in services
- [ ] Uses `playerId` from store
- [ ] Loads data on mount via services
- [ ] Displays data from store
- [ ] Calls services on user actions
- [ ] Syncs store after actions
- [ ] Has error handling
- [ ] Has loading state
- [ ] No hardcoded business rules
- [ ] Follows standardized flow pattern

## Testing Refactored Pages

1. **Load Page** - Verify data loads correctly
2. **Perform Action** - Verify action works
3. **Check Store** - Verify store is updated
4. **Check Database** - Verify database is updated
5. **Reload Page** - Verify data persists
6. **Error Cases** - Verify error handling

## Common Mistakes to Avoid

### ❌ Mistake 1: Calling BaseCrudService in Page
```typescript
// DON'T DO THIS
const player = await BaseCrudService.getById('players', playerId);
```

### ✅ Correct: Use Service
```typescript
// DO THIS
await syncPlayerProfile(playerId);
const playerName = usePlayerStore((state) => state.playerName);
```

### ❌ Mistake 2: Updating Store Directly
```typescript
// DON'T DO THIS
store._setDirtyMoney(newBalance);
```

### ✅ Correct: Service Updates Store
```typescript
// DO THIS
const result = await removeDirtyMoney(playerId, amount, reason);
// Service already updated store
```

### ❌ Mistake 3: Business Logic in Component
```typescript
// DON'T DO THIS
const newBalance = dirtyMoney - amount;
if (newBalance < 0) {
  setError('Insufficient funds');
}
```

### ✅ Correct: Business Logic in Service
```typescript
// DO THIS
const result = await removeDirtyMoney(playerId, amount, reason);
if (!result.success) {
  setError(result.error);
}
```

### ❌ Mistake 4: Not Syncing After Action
```typescript
// DON'T DO THIS
const result = await someService.doSomething(playerId);
// Forgot to sync!
```

### ✅ Correct: Sync After Action
```typescript
// DO THIS
const result = await someService.doSomething(playerId);
if (result.success) {
  await syncPlayerProfile(playerId);
}
```

## Performance Tips

1. **Batch Syncs** - Sync multiple things at once
   ```typescript
   await Promise.all([
     syncPlayerProfile(playerId),
     syncPlayerFinances(playerId),
     syncPlayerProgress(playerId),
   ]);
   ```

2. **Conditional Syncs** - Only sync what changed
   ```typescript
   if (actionAffectsFinances) {
     await syncPlayerFinances(playerId);
   }
   ```

3. **Cache Data** - Don't reload unnecessarily
   ```typescript
   const playerName = usePlayerStore((state) => state.playerName);
   // Use cached value, don't reload
   ```

## Next Steps

1. Start with high-priority pages
2. Follow the refactoring pattern
3. Test thoroughly
4. Move to next page
5. Once all pages refactored, remove old services
