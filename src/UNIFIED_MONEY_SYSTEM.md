# FASE 3: UNIFIED MONEY SYSTEM DOCUMENTATION

## Overview

The unified money system establishes a **single source of truth** for all player finances. Only two real balances exist:
- **dirtyMoney**: Illegal earnings (crimes, black market, etc.)
- **cleanMoney**: Legitimate earnings (money laundering completion, rewards, etc.)

Both are stored in the **Players collection** in the database.

---

## Architecture

### Single Source of Truth
```
Database (Players Collection)
    ↓
playerEconomyService (Central Hub)
    ↓
playerStore (Zustand - Read-Only Mirror)
    ↓
UI Components (Display Only)
```

### Key Principle
**ALL financial operations MUST go through `playerEconomyService`**

---

## playerEconomyService API

Located at: `/src/services/playerEconomyService.ts`

### Core Functions

#### 1. **addDirtyMoney(playerId, amount, reason)**
Add illegal earnings to player's dirty money balance.

```typescript
const result = await addDirtyMoney(playerId, 5000, 'Crime completed');
if (result.success) {
  console.log('New balance:', result.newBalance);
}
```

#### 2. **removeDirtyMoney(playerId, amount, reason)**
Deduct dirty money (spending, investments, bribes).

```typescript
const result = await removeDirtyMoney(playerId, 1000, 'Bribe payment');
if (!result.success) {
  console.log('Error:', result.error); // Insufficient funds
}
```

#### 3. **addCleanMoney(playerId, amount, reason)**
Add legitimate earnings to clean money balance.

```typescript
const result = await addCleanMoney(playerId, 2000, 'Money laundering completed');
```

#### 4. **removeCleanMoney(playerId, amount, reason)**
Deduct clean money (spending, investments).

```typescript
const result = await removeCleanMoney(playerId, 500, 'Luxury item purchase');
```

#### 5. **launderMoney(playerId, dirtyAmount, cleanAmount, reason)**
Convert dirty money to clean money (atomic transaction).

```typescript
const result = await launderMoney(playerId, 1000, 900, 'Money laundering operation');
if (result.success) {
  console.log('Dirty:', result.newDirtyBalance);
  console.log('Clean:', result.newCleanBalance);
}
```

#### 6. **syncPlayerFinances(playerId)**
Sync database finances to playerStore (call after loading player data).

```typescript
await syncPlayerFinances(playerId);
```

#### 7. **getPlayerFinances(playerId)**
Get current financial state from database.

```typescript
const finances = await getPlayerFinances(playerId);
console.log('Dirty:', finances.dirtyMoney);
console.log('Clean:', finances.cleanMoney);
```

#### 8. **resetPlayerFinances(playerId, dirtyMoney, cleanMoney)**
Reset finances (testing/reset only).

```typescript
await resetPlayerFinances(playerId, 0, 0);
```

---

## playerStore Updates

Located at: `/src/store/playerStore.ts`

### Internal Methods (DO NOT USE DIRECTLY)
```typescript
_setCleanMoney(amount)   // Called by playerEconomyService
_setDirtyMoney(amount)   // Called by playerEconomyService
```

### Why Renamed?
The underscore prefix (`_`) indicates these are **internal-only** methods. This prevents accidental direct manipulation from UI components.

### Reading Money (OK)
```typescript
const { cleanMoney, dirtyMoney } = usePlayerStore();
console.log('Current balance:', cleanMoney, dirtyMoney);
```

### Writing Money (NOT OK - WILL FAIL)
```typescript
// ❌ WRONG - These methods no longer exist
setCleanMoney(1000);
addDirtyMoney(500);
removeDirtyMoney(100);

// ✅ CORRECT - Use playerEconomyService instead
await addDirtyMoney(playerId, 500, 'reason');
```

---

## Migration Guide: Updating Existing Pages

### Before (Old Pattern)
```typescript
import { usePlayerStore } from '@/store/playerStore';

function MyPage() {
  const { dirtyMoney, setDirtyMoney, addDirtyMoney } = usePlayerStore();
  
  const handleSpend = () => {
    setDirtyMoney(dirtyMoney - 100); // ❌ WRONG
  };
}
```

### After (New Pattern)
```typescript
import { usePlayerStore } from '@/store/playerStore';
import { removeDirtyMoney } from '@/services/playerEconomyService';

function MyPage() {
  const { playerId, dirtyMoney } = usePlayerStore();
  
  const handleSpend = async () => {
    const result = await removeDirtyMoney(playerId, 100, 'Item purchase');
    if (result.success) {
      console.log('New balance:', result.newBalance);
    } else {
      console.error('Insufficient funds:', result.error);
    }
  };
}
```

---

## Transaction History

The service maintains an in-memory transaction history for audit trails.

```typescript
import { getTransactionHistory } from '@/services/playerEconomyService';

// Get last 50 transactions
const history = getTransactionHistory(50);

history.forEach(tx => {
  console.log(`${tx.type}: ${tx.amount} ${tx.moneyType} - ${tx.reason}`);
  console.log(`  Before: ${tx.balanceBefore}, After: ${tx.balanceAfter}`);
});
```

---

## Error Handling

All functions return a result object with success status and error messages:

```typescript
const result = await removeDirtyMoney(playerId, 5000, 'reason');

if (result.success) {
  console.log('Operation succeeded:', result.newBalance);
} else {
  console.error('Operation failed:', result.error);
  // Possible errors:
  // - "Amount must be positive"
  // - "Player not found"
  // - "Insufficient dirty money. Have: X, Need: Y"
}
```

---

## Database Persistence

Every operation:
1. ✅ Validates the operation
2. ✅ Updates the database (Players collection)
3. ✅ Syncs the playerStore
4. ✅ Records transaction history
5. ✅ Returns success/error status

---

## What Was Removed

### Old Money Stores (DEPRECATED)
- ❌ `investmentSkillTreeStore.dirtyMoney` - Use playerEconomyService
- ❌ Direct localStorage reads/writes - Use playerEconomyService
- ❌ Local page-level money state - Use playerEconomyService

### Old Patterns (DEPRECATED)
- ❌ `setCleanMoney()` / `setDirtyMoney()` - Use playerEconomyService
- ❌ `addCleanMoney()` / `addDirtyMoney()` - Use playerEconomyService
- ❌ `removeCleanMoney()` / `removeDirtyMoney()` - Use playerEconomyService
- ❌ Direct store manipulation - Use playerEconomyService

---

## Pages Updated

### ✅ ResetLuxuryPage.tsx
- Changed from: `setDirtyMoney(0)`
- Changed to: `resetPlayerFinances(playerId, 0, 0)`

### ✅ CommercialCenterPage.tsx
- Removed: `setDirtyMoney()` / `setCleanMoney()` calls
- Added: `syncPlayerFinances()` after loading player data
- Uses: `usePlayerStore.getState().dirtyMoney` for reading

---

## Best Practices

### ✅ DO
```typescript
// 1. Import the service
import { addDirtyMoney, removeDirtyMoney } from '@/services/playerEconomyService';

// 2. Get playerId from store
const { playerId } = usePlayerStore();

// 3. Call service functions with playerId
const result = await addDirtyMoney(playerId, 1000, 'Crime completed');

// 4. Handle result
if (result.success) {
  // UI will automatically update via store sync
}
```

### ❌ DON'T
```typescript
// 1. Don't manipulate store directly
const { setDirtyMoney } = usePlayerStore();
setDirtyMoney(1000); // ❌ WRONG

// 2. Don't use localStorage
localStorage.setItem('money', '1000'); // ❌ WRONG

// 3. Don't create local state
const [money, setMoney] = useState(0); // ❌ WRONG

// 4. Don't call old store methods
addDirtyMoney(500); // ❌ WRONG - doesn't exist anymore
```

---

## Testing

### Manual Testing
```typescript
// In browser console
import { addDirtyMoney, getTransactionHistory } from '@/services/playerEconomyService';

const playerId = 'test-player-id';
await addDirtyMoney(playerId, 1000, 'Test transaction');
console.log(getTransactionHistory());
```

### Unit Testing
```typescript
import { addDirtyMoney, resetPlayerFinances } from '@/services/playerEconomyService';

test('should add dirty money', async () => {
  const result = await addDirtyMoney(playerId, 1000, 'test');
  expect(result.success).toBe(true);
  expect(result.newBalance).toBe(1000);
});
```

---

## Future Enhancements

1. **Persistent Transaction History**: Store transactions in a separate CMS collection
2. **Transaction Limits**: Add daily/weekly spending limits
3. **Money Laundering Rates**: Dynamic conversion rates based on player level
4. **Audit Logs**: Track all financial operations with timestamps
5. **Rollback Functionality**: Undo transactions within a time window

---

## Support

For issues or questions about the unified money system:
1. Check transaction history: `getTransactionHistory()`
2. Verify player finances: `getPlayerFinances(playerId)`
3. Check console logs for [ECONOMY] prefix messages
4. Review error messages from service functions

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Money Source | Multiple stores + localStorage | Single database (Players collection) |
| Operations | Direct store manipulation | playerEconomyService functions |
| Validation | None | Full validation + error handling |
| History | None | Transaction history tracking |
| Sync | Manual | Automatic after each operation |
| Consistency | Fragmented | Single source of truth |

