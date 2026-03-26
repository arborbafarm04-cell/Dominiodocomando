# Integration Guide: Critical Action Saves

This guide shows how to integrate critical action saves into existing components.

---

## 1. Login/Logout Integration

### In LoginPage.tsx or Authentication Component

```typescript
import { saveAfterLogin, saveBeforeLogout } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function LoginPage() {
  const handleLogin = async (playerId: string) => {
    try {
      // 1. Load player from database
      await loadPlayerFromDatabase(playerId);
      
      // 2. Save after login
      await saveAfterLogin(playerId);
      
      // 3. Navigate to game
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    const playerId = usePlayerStore.getState().playerId;
    
    try {
      // 1. Save before logout
      if (playerId) {
        await saveBeforeLogout(playerId);
      }
      
      // 2. Clear player data
      usePlayerStore.getState().resetPlayer();
      
      // 3. Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 2. Spin Completion Integration

### In SpinVaultNotification.tsx or Spin Component

```typescript
import { saveAfterSpin } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function SpinVault() {
  const playerId = usePlayerStore((s) => s.playerId);
  const spins = usePlayerStore((s) => s.spins);

  const handleSpinComplete = async (result: string[]) => {
    try {
      // 1. Update store with results
      uiStore.setLastResult(result);
      
      // 2. Calculate and apply rewards
      const reward = calculateReward(result);
      playerStore._setDirtyMoney(playerStore.dirtyMoney + reward);
      playerStore.subtractSpins(1);
      
      // 3. CRITICAL SAVE
      if (playerId) {
        await saveAfterSpin(playerId);
      }
      
      // 4. Show reward animation
      showRewardAnimation(reward);
    } catch (error) {
      console.error('Spin completion failed:', error);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 3. Purchase Integration

### In LuxuryShop.tsx or Shop Component

```typescript
import { saveAfterPurchase } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';
import { useLuxuryShopStore } from '@/store/luxuryShopStore';

function LuxuryShop() {
  const playerId = usePlayerStore((s) => s.playerId);
  const cleanMoney = usePlayerStore((s) => s.cleanMoney);
  const luxuryStore = useLuxuryShopStore();

  const handlePurchase = async (item: ItensdeLuxo) => {
    try {
      // 1. Check if player has enough money
      if (cleanMoney < item.price) {
        showError('Insufficient funds');
        return;
      }
      
      // 2. Optimistic update
      usePlayerStore.getState()._setCleanMoney(cleanMoney - item.price);
      luxuryStore.purchasedItems.push(item._id);
      
      // 3. CRITICAL SAVE
      if (playerId) {
        await saveAfterPurchase(playerId, item.itemName, item.price);
      }
      
      // 4. Show success
      showSuccess(`Purchased ${item.itemName}`);
    } catch (error) {
      console.error('Purchase failed:', error);
      // Reload from database to revert
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 4. Upgrade Integration

### In BarracoPage.tsx or Upgrade Component

```typescript
import { saveAfterUpgrade, saveAfterBarracoEvolution } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function BarracoPage() {
  const playerId = usePlayerStore((s) => s.playerId);
  const barracoLevel = usePlayerStore((s) => s.barracoLevel);
  const dirtyMoney = usePlayerStore((s) => s.dirtyMoney);

  const handleUpgradeBarraco = async () => {
    try {
      const upgradeCost = calculateUpgradeCost(barracoLevel);
      
      // 1. Check if player has enough money
      if (dirtyMoney < upgradeCost) {
        showError('Insufficient funds');
        return;
      }
      
      // 2. Optimistic update
      const newLevel = barracoLevel + 1;
      usePlayerStore.getState().setBarracoLevel(newLevel);
      usePlayerStore.getState()._setDirtyMoney(dirtyMoney - upgradeCost);
      
      // 3. CRITICAL SAVE (use specific barraco save)
      if (playerId) {
        await saveAfterBarracoEvolution(playerId, newLevel);
      }
      
      // 4. Show animation
      showUpgradeAnimation();
    } catch (error) {
      console.error('Upgrade failed:', error);
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 5. Money Laundering Integration

### In MoneyLaunderingPage.tsx or Comercios Component

```typescript
import { saveAfterLaundering } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';
import { useComerciosStore } from '@/store/comerciosStore';

function MoneyLaundering() {
  const playerId = usePlayerStore((s) => s.playerId);
  const dirtyMoney = usePlayerStore((s) => s.dirtyMoney);
  const cleanMoney = usePlayerStore((s) => s.cleanMoney);
  const comerciosStore = useComerciosStore();

  const handleLaunderingComplete = async (business: MoneyLaunderingBusinesses) => {
    try {
      // 1. Calculate laundered amount
      const launderedAmount = calculateLaunderedAmount(business);
      
      // 2. Optimistic update
      usePlayerStore.getState()._setDirtyMoney(dirtyMoney - launderedAmount);
      usePlayerStore.getState()._setCleanMoney(cleanMoney + launderedAmount);
      
      // 3. Update business state
      comerciosStore.updateComercio(business._id, {
        lastLaunderedAt: Date.now(),
        totalLaundered: (business.totalLaundered || 0) + launderedAmount,
      });
      
      // 4. CRITICAL SAVE
      if (playerId) {
        await saveAfterLaundering(playerId, business.businessName, launderedAmount);
      }
      
      // 5. Show success
      showSuccess(`Laundered ${launderedAmount} credits`);
    } catch (error) {
      console.error('Laundering failed:', error);
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 6. Reward Integration

### In BriberyPage.tsx or Reward Component

```typescript
import { saveAfterReward } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function BriberyPage() {
  const playerId = usePlayerStore((s) => s.playerId);
  const cleanMoney = usePlayerStore((s) => s.cleanMoney);

  const handleBriberyReward = async (character: Characters, reward: number) => {
    try {
      // 1. Optimistic update
      usePlayerStore.getState()._setCleanMoney(cleanMoney + reward);
      
      // 2. CRITICAL SAVE
      if (playerId) {
        await saveAfterReward(playerId, 'bribery', reward);
      }
      
      // 3. Show reward animation
      showRewardAnimation(reward);
    } catch (error) {
      console.error('Reward failed:', error);
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 7. Profile Change Integration

### In ProfilePage.tsx or Profile Component

```typescript
import { saveAfterProfileChange } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function ProfilePage() {
  const playerId = usePlayerStore((s) => s.playerId);
  const playerName = usePlayerStore((s) => s.playerName);

  const handleNameChange = async (newName: string) => {
    try {
      // 1. Validate name
      if (!newName || newName.length < 3) {
        showError('Name must be at least 3 characters');
        return;
      }
      
      // 2. Optimistic update
      usePlayerStore.getState().setPlayerName(newName);
      
      // 3. CRITICAL SAVE
      if (playerId) {
        await saveAfterProfileChange(playerId, 'name', newName);
      }
      
      // 4. Show success
      showSuccess('Name updated');
    } catch (error) {
      console.error('Name change failed:', error);
      await loadPlayerFromDatabase(playerId);
    }
  };

  const handlePhotoChange = async (photoUrl: string) => {
    try {
      // 1. Optimistic update
      usePlayerStore.getState().setProfilePicture(photoUrl);
      
      // 2. CRITICAL SAVE
      if (playerId) {
        await saveAfterProfileChange(playerId, 'photo', photoUrl);
      }
      
      // 3. Show success
      showSuccess('Photo updated');
    } catch (error) {
      console.error('Photo change failed:', error);
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... component JSX
  );
}
```

---

## 8. App Initialization with Emergency Save

### In HomePage.tsx or Main Layout

```typescript
import { useEffect } from 'react';
import { setupEmergencySaveListener } from '@/services/criticalActionService';
import { usePlayerStore } from '@/store/playerStore';

function HomePage() {
  useEffect(() => {
    const playerId = usePlayerStore.getState().playerId;
    
    if (playerId) {
      // Setup emergency save on page unload
      const cleanup = setupEmergencySaveListener(playerId);
      
      return cleanup;
    }
  }, []);

  return (
    // ... component JSX
  );
}
```

---

## 9. Common Patterns

### Pattern 1: Simple Action with Save
```typescript
const handleAction = async () => {
  try {
    // 1. Optimistic update
    updateStore();
    
    // 2. Critical save
    if (playerId) {
      await saveAfterAction(playerId);
    }
  } catch (error) {
    // 3. Revert on error
    await loadPlayerFromDatabase(playerId);
  }
};
```

### Pattern 2: Complex Action with Multiple Updates
```typescript
const handleComplexAction = async () => {
  try {
    // 1. Multiple optimistic updates
    updateStore1();
    updateStore2();
    updateStore3();
    
    // 2. Single critical save
    if (playerId) {
      await saveAfterComplexAction(playerId);
    }
  } catch (error) {
    // 3. Revert all changes
    await loadPlayerFromDatabase(playerId);
  }
};
```

### Pattern 3: Conditional Save
```typescript
const handleConditionalAction = async () => {
  try {
    const shouldSave = await performAction();
    
    if (shouldSave && playerId) {
      await saveAfterAction(playerId);
    }
  } catch (error) {
    if (playerId) {
      await loadPlayerFromDatabase(playerId);
    }
  }
};
```

---

## 10. Testing Checklist

- [ ] Login saves player data
- [ ] Logout saves before clearing
- [ ] Spin completion saves spins and money
- [ ] Purchase saves money and items
- [ ] Upgrade saves level and money
- [ ] Laundering saves both money types
- [ ] Reward saves money
- [ ] Profile change saves name/photo
- [ ] Barraco evolution saves level
- [ ] Emergency save on page unload
- [ ] Error recovery reloads from database
- [ ] No real-time state is saved
- [ ] Multiplayer doesn't conflict

---

## 11. Debugging

### Check if data is saved
```typescript
// In browser console
const player = await BaseCrudService.getById('players', 'playerId');
console.log(player);
```

### Check store state
```typescript
// In browser console
import { usePlayerStore } from '@/store/playerStore';
console.log(usePlayerStore.getState());
```

### Check real-time state (should NOT be in database)
```typescript
// In browser console
import { useRealTimeStateStore } from '@/store/realTimeStateStore';
console.log(useRealTimeStateStore.getState());
```

### Enable debug logging
```typescript
// In criticalActionService.ts, logs show:
// 💾 [CRITICAL] Saving after [action]: [data]
// 💾 [EMERGENCY] Saving all data before unload
```

---

## 12. Migration Checklist

For each component that modifies player data:

- [ ] Identify all permanent data changes
- [ ] Add appropriate critical action save
- [ ] Test optimistic update
- [ ] Test error recovery
- [ ] Verify no real-time state is saved
- [ ] Add emergency save listener if needed
- [ ] Document the critical action
- [ ] Test multiplayer synchronization
