# PHASE 8 - IMPLEMENTATION EXAMPLE

## Complete Example: Refactoring a Page

This document shows a complete before/after example of refactoring a page to use the new services architecture.

## Example: Money Laundering Page

### BEFORE (Old Pattern)

```typescript
// src/components/pages/MoneyLaunderingPage.tsx
import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { Players } from '@/entities';

export default function MoneyLaunderingPage() {
  const playerId = usePlayerStore((state) => state.playerId);
  const [launderingData, setLaunderingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const player = await BaseCrudService.getById<Players>('players', playerId);
        setLaunderingData({
          dirtyMoney: player?.dirtyMoney || 0,
          cleanMoney: player?.cleanMoney || 0,
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId) {
      loadData();
    }
  }, [playerId]);

  // Handle launder action - BUSINESS LOGIC IN COMPONENT
  const handleLaunder = async (dirtyAmount: number) => {
    try {
      // Get current player
      const player = await BaseCrudService.getById<Players>('players', playerId);
      
      // Check balance - BUSINESS LOGIC
      if (!player || player.dirtyMoney < dirtyAmount) {
        setError('Insufficient dirty money');
        return;
      }

      // Calculate clean amount - BUSINESS LOGIC
      const launderingRate = 0.8; // 80% conversion rate
      const cleanAmount = dirtyAmount * launderingRate;

      // Update database - DIRECT DB CALL
      const newDirtyBalance = player.dirtyMoney - dirtyAmount;
      const newCleanBalance = (player.cleanMoney || 0) + cleanAmount;

      await BaseCrudService.update('players', {
        _id: playerId,
        dirtyMoney: newDirtyBalance,
        cleanMoney: newCleanBalance,
      });

      // Update store - MANUAL SYNC
      const store = usePlayerStore.getState();
      store._setDirtyMoney(newDirtyBalance);
      store._setCleanMoney(newCleanBalance);

      // Reload data
      const updatedPlayer = await BaseCrudService.getById<Players>('players', playerId);
      setLaunderingData({
        dirtyMoney: updatedPlayer?.dirtyMoney || 0,
        cleanMoney: updatedPlayer?.cleanMoney || 0,
      });
    } catch (err) {
      setError(String(err));
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1>Money Laundering</h1>
      <div className="mt-4">
        <p>Dirty Money: ${launderingData?.dirtyMoney.toLocaleString()}</p>
        <p>Clean Money: ${launderingData?.cleanMoney.toLocaleString()}</p>
      </div>
      <div className="mt-6 space-y-2">
        <button onClick={() => handleLaunder(100000)}>Launder 100K</button>
        <button onClick={() => handleLaunder(1000000)}>Launder 1M</button>
        <button onClick={() => handleLaunder(10000000)}>Launder 10M</button>
      </div>
    </div>
  );
}
```

### AFTER (New Pattern)

```typescript
// src/components/pages/MoneyLaunderingPage.tsx
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { 
  launderMoney, 
  syncPlayerFinances 
} from '@/services/playerEconomyService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MoneyLaunderingPage() {
  // 1. Get playerId from store
  const playerId = usePlayerStore((state) => state.playerId);
  
  // 2. Local state for loading
  const [isLoading, setIsLoading] = useState(true);
  const [isLaundering, setIsLaundering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Load data on mount
  useEffect(() => {
    if (!playerId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Sync finances from database
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
  const dirtyMoney = usePlayerStore((state) => state.dirtyMoney);
  const cleanMoney = usePlayerStore((state) => state.cleanMoney);

  // 5. Handle launder action - NO BUSINESS LOGIC
  const handleLaunder = async (dirtyAmount: number) => {
    try {
      setIsLaundering(true);
      
      // Calculate clean amount (80% conversion rate)
      const cleanAmount = dirtyAmount * 0.8;
      
      // Call service - ALL BUSINESS LOGIC HERE
      const result = await launderMoney(
        playerId,
        dirtyAmount,
        cleanAmount,
        'Manual laundering'
      );
      
      if (result.success) {
        // Sync store after action
        await syncPlayerFinances(playerId);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLaundering(false);
    }
  };

  // 6. Render UI
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-8">
      <h1>Money Laundering</h1>
      <div className="mt-4">
        <p>Dirty Money: ${dirtyMoney.toLocaleString()}</p>
        <p>Clean Money: ${cleanMoney.toLocaleString()}</p>
      </div>
      <div className="mt-6 space-y-2">
        <button 
          onClick={() => handleLaunder(100000)}
          disabled={isLaundering || dirtyMoney < 100000}
        >
          {isLaundering ? 'Laundering...' : 'Launder 100K'}
        </button>
        <button 
          onClick={() => handleLaunder(1000000)}
          disabled={isLaundering || dirtyMoney < 1000000}
        >
          {isLaundering ? 'Laundering...' : 'Launder 1M'}
        </button>
        <button 
          onClick={() => handleLaunder(10000000)}
          disabled={isLaundering || dirtyMoney < 10000000}
        >
          {isLaundering ? 'Laundering...' : 'Launder 10M'}
        </button>
      </div>
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
}
```

## Key Improvements

### 1. **Separation of Concerns**
- **Before**: Business logic mixed with UI
- **After**: Business logic in service, UI in component

### 2. **Cleaner Component**
- **Before**: 80+ lines with complex logic
- **After**: 50 lines, focused on UI

### 3. **Reusability**
- **Before**: Logic only works in this component
- **After**: Service can be used by any component

### 4. **Testability**
- **Before**: Hard to test business logic
- **After**: Easy to test service independently

### 5. **Maintainability**
- **Before**: Change logic = change component
- **After**: Change logic = change service

### 6. **Consistency**
- **Before**: Each page does things differently
- **After**: All pages follow same pattern

## Comparison Table

| Aspect | Before | After |
|--------|--------|-------|
| **Business Logic Location** | Component | Service |
| **Database Calls** | Direct in component | Through service |
| **Store Updates** | Manual in component | Automatic in service |
| **Error Handling** | Try/catch in component | Service returns result |
| **Data Loading** | Custom logic | Standard pattern |
| **Code Reusability** | Low | High |
| **Testing** | Difficult | Easy |
| **Lines of Code** | 80+ | 50 |

## Step-by-Step Migration

### Step 1: Identify Services Needed
```typescript
// What does this page need?
// - Load player finances
// - Launder money
// - Update store

// Services needed:
import { launderMoney, syncPlayerFinances } from '@/services/playerEconomyService';
```

### Step 2: Extract Business Logic
```typescript
// OLD: Business logic in component
const newDirtyBalance = player.dirtyMoney - dirtyAmount;
const newCleanBalance = (player.cleanMoney || 0) + cleanAmount;

// NEW: Business logic in service
const result = await launderMoney(playerId, dirtyAmount, cleanAmount, reason);
```

### Step 3: Implement Standard Flow
```typescript
// 1. Get playerId from store
const playerId = usePlayerStore((state) => state.playerId);

// 2. Load data on mount
useEffect(() => {
  if (!playerId) return;
  const load = async () => {
    await syncPlayerFinances(playerId);
  };
  load();
}, [playerId]);

// 3. Get data from store
const dirtyMoney = usePlayerStore((state) => state.dirtyMoney);

// 4. Call service on action
const result = await launderMoney(playerId, amount, cleanAmount, reason);

// 5. Sync after action
await syncPlayerFinances(playerId);
```

### Step 4: Test
- Load page ✓
- Perform action ✓
- Check store updated ✓
- Check database updated ✓
- Reload page ✓
- Error cases ✓

## Common Patterns in Services

### Pattern 1: Get Data
```typescript
// Service
export async function getPlayerFinances(playerId: string) {
  const player = await BaseCrudService.getById('players', playerId);
  return {
    dirtyMoney: player?.dirtyMoney ?? 0,
    cleanMoney: player?.cleanMoney ?? 0,
  };
}

// Component
const finances = await getPlayerFinances(playerId);
```

### Pattern 2: Perform Action
```typescript
// Service
export async function launderMoney(playerId, dirtyAmount, cleanAmount, reason) {
  // Validate
  // Update database
  // Update store
  // Return result
  return { success: true, newDirtyBalance, newCleanBalance };
}

// Component
const result = await launderMoney(playerId, amount, cleanAmount, reason);
if (result.success) {
  // Success
} else {
  // Error
}
```

### Pattern 3: Sync Data
```typescript
// Service
export async function syncPlayerFinances(playerId: string) {
  const finances = await getPlayerFinances(playerId);
  const store = usePlayerStore.getState();
  store._setDirtyMoney(finances.dirtyMoney);
  store._setCleanMoney(finances.cleanMoney);
}

// Component
await syncPlayerFinances(playerId);
// Store is now in sync
```

## Benefits Summary

✅ **Cleaner Code** - Less logic in components
✅ **Better Organization** - Business logic in services
✅ **Reusability** - Services used by multiple pages
✅ **Testability** - Services tested independently
✅ **Maintainability** - Changes in one place
✅ **Consistency** - All pages follow same pattern
✅ **Scalability** - Easy to add new features
✅ **Performance** - Optimized service calls

## Next Steps

1. Refactor high-priority pages first
2. Follow the pattern shown above
3. Test thoroughly
4. Move to next page
5. Once complete, remove old code

## Questions?

Refer to:
- `SERVICES_ARCHITECTURE.md` - Service overview
- `REFACTORING_GUIDE.md` - Detailed refactoring steps
- Individual service files - Implementation details
