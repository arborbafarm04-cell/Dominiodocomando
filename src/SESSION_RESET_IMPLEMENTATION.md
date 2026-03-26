# Session Reset Implementation Guide

## Overview
This document describes the robust session reset mechanism implemented to prevent state contamination when switching between players. The system ensures a clean slate before loading a new player's data.

## Problem Solved
Previously, when a player logged out and another player logged in, leftover state from the previous session could contaminate the new player's experience. This included:
- Stale player data in stores
- Cached game state (spins, money, level)
- Luxury items and purchases from previous player
- Skill tree progress
- Map and location state
- Business and investment data
- All other game-related stores

## Solution Architecture

### Core Service: `sessionResetService.ts`

Located at: `/src/services/sessionResetService.ts`

This service provides two main functions:

#### 1. `resetPlayerSession()` - Complete Session Reset
Performs a comprehensive cleanup in the correct order:

```typescript
await resetPlayerSession();
```

**Order of Operations:**
1. ✅ Reset main player store (`usePlayerStore`)
2. ✅ Reset legacy game stores (`useGameStore`, `useSpinVaultStore`)
3. ✅ Reset luxury shop store
4. ✅ Reset game screen store
5. ✅ Reset business-related stores (bribery, comercios, investments, etc.)
6. ✅ Reset map and location stores
7. ✅ Reset faction and social stores
8. ✅ Reset all skill tree stores (attack, agility, defense, etc.)
9. ✅ Reset UI and customization stores
10. ✅ Clear IndexedDB session data
11. ✅ Clear localStorage (preserving only non-player data)
12. ✅ Clear sessionStorage

#### 2. `resetSpecificStores(storeNames)` - Selective Reset
For testing or specific use cases:

```typescript
resetSpecificStores(['player', 'game', 'luxuryShop']);
```

## Integration Points

### 1. Local Player Login (`loginLocalPlayer`)
**File:** `/src/services/playerService.ts`

```typescript
export async function loginLocalPlayer(email: string, password: string) {
  // Step 1: RESET OLD SESSION - Clear all player-related state
  await resetPlayerSession();
  
  // Step 2: Validate credentials
  const playerId = await validateCredentials(email, password);
  
  // Step 3: Load player from database
  const player = await getPlayerById(playerId);
  
  // Step 4: Create authenticated session
  await createSession(playerId, email);
  
  return player;
}
```

**Flow:**
```
User submits login form
    ↓
loginLocalPlayer() called
    ↓
resetPlayerSession() - Complete cleanup
    ↓
Validate credentials
    ↓
Load player from database
    ↓
Create session
    ↓
Return to UI component
    ↓
UI loads player data into playerStore
    ↓
Navigate to /star-map
```

### 2. Local Login Form Component
**File:** `/src/components/LocalLoginForm.tsx`

```typescript
const handleLogin = async (e: React.FormEvent) => {
  // loginLocalPlayer now handles complete session reset internally
  const player = await loginLocalPlayer(email, password);
  
  // Load player data into playerStore for UI synchronization
  loadPlayerData({
    playerId: player._id,
    playerName: player.playerName || 'Player',
    level: player.level || 1,
    // ... other fields
  });
  
  navigate('/star-map');
};
```

### 3. Google Login Component
**File:** `/src/components/GoogleLoginButton.tsx`

```typescript
useEffect(() => {
  const handlePlayerRegistration = async () => {
    if (member && member.loginEmail && !hasRegistered) {
      // Reset old session before registering new player
      await resetPlayerSession();
      
      const player = await registerPlayer(email, playerName, nickname);
      
      // Load player data into store
      loadPlayerData({...});
      
      navigate('/star-map');
    }
  };
}, [member, hasRegistered, navigate, loadPlayerData]);
```

## Stores Managed

The session reset clears the following stores:

### Core Player Store
- `usePlayerStore` - Main player data (money, level, progress, etc.)

### Game State Stores
- `useGameStore` - Game state (spins, multiplier, fluxo events)
- `useSpinVaultStore` - Spin vault data
- `useGameScreenStore` - Current screen state

### Business Stores
- `useBriberyStore` - Bribed officials
- `useComerciosStore` - Commerce data
- `useCommercialCenterStore` - Commercial center upgrades
- `useBusinessInvestmentStore` - Business investments
- `useMoneyLaunderingStore` - Money laundering businesses

### Map & Location Stores
- `useMapStateStore` - Map position and zoom
- `useMapButtonsStore` - Map button visibility
- `useHotspotStore` - Hotspot data

### Social & Faction Stores
- `useFactionStore` - Faction data

### Skill Tree Stores
- `useSkillTreeStore` - General skills
- `useAttackSkillTreeStore` - Attack skills
- `useAgilitySkillTreeStore` - Agility skills
- `useDefenseSkillTreeStore` - Defense skills
- `useIntelligenceSkillTreeStore` - Intelligence skills
- `useInvestmentSkillTreeStore` - Investment skills
- `useRespeitSkillTreeStore` - Respect skills
- `useVigorSkillTreeStore` - Vigor skills

### UI & Customization Stores
- `useLuxuryShopStore` - Luxury items and purchases
- `useDrawingStore` - Drawing data
- `useDragCustomizationStore` - Drag customization
- `useSelectedTilesStore` - Selected tiles

### Storage Cleanup
- **IndexedDB:** Session data cleared via `clearSession()`
- **localStorage:** All player-related keys removed (preserves theme, language, settings)
- **sessionStorage:** Completely cleared

## Console Logging

The session reset provides detailed console logging for debugging:

```
🔄 Starting complete session reset...
  1️⃣ Resetting player store...
  2️⃣ Resetting legacy game stores...
  3️⃣ Resetting luxury shop store...
  ...
  1️⃣2️⃣ Clearing sessionStorage...
✅ Session reset complete!
```

## Error Handling

If any error occurs during session reset:

```typescript
try {
  await resetPlayerSession();
} catch (error) {
  console.error('❌ Error during session reset:', error);
  throw error; // Re-throw for caller to handle
}
```

The error is logged and re-thrown so the login process can fail gracefully.

## Testing

### Test Complete Reset
```typescript
import { resetPlayerSession } from '@/services/sessionResetService';

// In your test
await resetPlayerSession();
// Verify all stores are cleared
```

### Test Specific Stores
```typescript
import { resetSpecificStores } from '@/services/sessionResetService';

resetSpecificStores(['player', 'game', 'luxuryShop']);
```

## Performance Considerations

- **Async Operations:** IndexedDB clear is async, properly awaited
- **Batch Updates:** All store resets happen synchronously after async operations
- **Memory:** Clearing localStorage/sessionStorage frees memory
- **No Network Calls:** All operations are local (no API calls)

## Security Implications

✅ **Prevents Data Leakage:** Old player data completely cleared
✅ **No Cross-Player Contamination:** Fresh state for each login
✅ **Secure Logout:** Session data destroyed in IndexedDB
✅ **Local Storage Cleanup:** No sensitive data persists

## Future Enhancements

1. **Selective Reset:** Allow resetting only specific game areas
2. **Reset History:** Log what was reset for debugging
3. **Validation:** Verify all stores are actually empty after reset
4. **Performance Metrics:** Measure reset time
5. **Backup/Restore:** Allow reverting to previous state (for testing)

## Troubleshooting

### Issue: Old player data still visible after login
**Solution:** Ensure `resetPlayerSession()` is called BEFORE loading new player data

### Issue: Some stores not resetting
**Solution:** Check if store is using persist middleware and has custom reset logic

### Issue: localStorage still has old data
**Solution:** Verify the key is not in the `keysToPreserve` list

## Related Files

- `/src/services/playerService.ts` - Login/register functions
- `/src/services/indexedDBService.ts` - IndexedDB operations
- `/src/components/LocalLoginForm.tsx` - Local login UI
- `/src/components/GoogleLoginButton.tsx` - Google login UI
- `/src/store/playerStore.ts` - Main player store
