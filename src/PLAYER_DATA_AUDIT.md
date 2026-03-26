# Player Data Consistency Audit

## Status: ✅ CENTRALIZED SERVICE IMPLEMENTED

A new centralized `playerDataService.ts` has been created to ensure all player data uses the same source of truth.

## What Changed

### New Files Created
- ✅ `/src/services/playerDataService.ts` - Centralized player data service
- ✅ `/src/PLAYER_DATA_CONSISTENCY_GUIDE.md` - Implementation guide

### Files Updated
- ✅ `/src/hooks/usePlayerDataSync.ts` - Now uses centralized service
- ✅ `/src/hooks/usePlayerInitialization.ts` - Now uses centralized service
- ✅ `/src/hooks/usePlayerAuth.ts` - Now uses centralized service
- ✅ `/src/services/authService.ts` - Marked as deprecated

## Architecture

```
Database (Players Collection)
         ↓
playerDataService.ts (CENTRALIZED)
         ↓
playerStore (Zustand Cache)
         ↓
Components & Pages
```

## Data Flow

1. **Load**: Database → playerDataService → playerStore → Components
2. **Update**: Components → playerDataService → playerStore + Database
3. **Sync**: playerStore → playerDataService → Database (periodic)

## Key Principles

✅ **Single Source of Truth**: Database is authoritative
✅ **Optimistic Updates**: UI updates immediately, DB syncs in background
✅ **Error Recovery**: On sync failure, reload from database
✅ **Centralized Access**: All operations through playerDataService
✅ **No Direct localStorage**: All player data through service

## Files That Need Review/Update

### High Priority (Direct Player Data Access)

1. **Components using dirtyMoneyStore/cleanMoneyStore**
   - Status: ⚠️ Should migrate to playerStore
   - Files: Header.tsx, various pages
   - Action: Replace separate store usage with playerStore

2. **Components with localStorage access**
   - Status: ⚠️ Should use playerDataService
   - Files: Header.tsx, PlayerRegistration.tsx
   - Action: Use playerDataService functions instead

3. **Pages with direct money updates**
   - Status: ⚠️ Should use playerDataService functions
   - Files: LuxuryShowroomPage.tsx, BarracoPage.tsx, etc.
   - Action: Use updatePlayerMoney(), updateCleanMoney()

### Medium Priority (Indirect Access)

4. **Game components**
   - Status: ⚠️ May access player data indirectly
   - Files: game/InteractiveTileGrid.tsx, SlotMachine.tsx
   - Action: Verify they use playerStore, not separate stores

5. **Skill tree pages**
   - Status: ⚠️ May update player progress
   - Files: AgilitySkillTreePage.tsx, AttackSkillTreePage.tsx, etc.
   - Action: Use updatePlayerProgress() for consistency

### Low Priority (Already Correct)

6. **Hooks**
   - Status: ✅ Already updated
   - Files: usePlayerDataSync.ts, usePlayerInitialization.ts, usePlayerAuth.ts

7. **Services**
   - Status: ✅ playerDataService.ts is new centralized service
   - Status: ⚠️ playerService.ts is legacy but still used for auth

## Migration Checklist

### For Each Component/Page:

- [ ] Identify all player data access patterns
- [ ] Replace `localStorage.getItem('player*')` with `playerDataService` functions
- [ ] Replace `useDirtyMoneyStore()` with `usePlayerStore()`
- [ ] Replace `useCleanMoneyStore()` with `usePlayerStore()`
- [ ] Replace direct store updates with `playerDataService` functions
- [ ] Verify all updates go through `playerDataService`
- [ ] Test that data persists across page reloads
- [ ] Test that data syncs correctly to database

## Example Migrations

### Before (OLD - Multiple Sources)
```typescript
// Using separate stores
const { dirtyMoney } = useDirtyMoneyStore();
const { cleanMoney } = useCleanMoneyStore();

// Direct localStorage
const savedName = localStorage.getItem('playerName');

// Direct store update
store.setDirtyMoney(newAmount);
```

### After (NEW - Centralized)
```typescript
// Using playerStore
const { dirtyMoney, cleanMoney, playerName } = usePlayerStore();

// Update through service
await updatePlayerMoney(playerId, newAmount);
await updateCleanMoney(playerId, newAmount);

// Data automatically synced to database
```

## Verification Steps

1. **Check Store Consistency**
   ```typescript
   import { getCurrentPlayerFromStore } from '@/services/playerDataService';
   const player = getCurrentPlayerFromStore();
   console.log('Player data:', player);
   ```

2. **Force Sync**
   ```typescript
   import { syncPlayerToDatabase } from '@/services/playerDataService';
   await syncPlayerToDatabase(playerId);
   ```

3. **Reload from Database**
   ```typescript
   import { loadPlayerFromDatabase } from '@/services/playerDataService';
   const player = await loadPlayerFromDatabase(playerId);
   ```

## Files to Review Next

Priority order for review/update:

1. `/src/components/Header.tsx` - Uses localStorage and separate stores
2. `/src/components/pages/LuxuryShowroomPage.tsx` - Updates player money
3. `/src/components/pages/BarracoPage.tsx` - Updates player money
4. `/src/components/pages/GiroNoAsfaltoPage.tsx` - Updates player money
5. `/src/components/SlotMachine.tsx` - Updates player money
6. `/src/components/game/InteractiveTileGrid.tsx` - Game logic with money
7. All bribery pages - Update player money
8. All skill tree pages - Update player progress

## Testing Checklist

- [ ] Player data loads correctly on app start
- [ ] Player data persists across page reloads
- [ ] Money updates sync to database
- [ ] Progress updates sync to database
- [ ] Multiple tabs/windows stay in sync
- [ ] Offline changes sync when back online
- [ ] No data loss on network errors
- [ ] No duplicate data in database

## Notes

- The centralized service uses optimistic updates for better UX
- All database operations are wrapped with error handling
- On sync failure, data is reloaded from database to ensure consistency
- The playerStore acts as a cache for fast access
- Periodic sync ensures database is always up-to-date

## Next Steps

1. Review components listed in "Files to Review Next"
2. Migrate each component to use playerDataService
3. Test thoroughly after each migration
4. Remove deprecated stores (dirtyMoneyStore, cleanMoneyStore) after migration
5. Update components to use centralized playerStore for all player data
