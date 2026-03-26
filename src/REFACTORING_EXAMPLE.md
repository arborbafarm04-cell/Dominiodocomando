# Refactoring Example: Separating Permanent from Real-Time State

This document shows a before/after example of refactoring a component to properly separate permanent and real-time state.

---

## Example: Spin Vault Component

### BEFORE (Mixed State - ❌ WRONG)

```typescript
// ❌ WRONG: Mixing permanent and real-time state
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';

function SpinVault() {
  const playerStore = usePlayerStore();
  const uiStore = useUIStore();
  
  // ❌ Real-time state stored in permanent store
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [spinPosition, setSpinPosition] = useState({ x: 0, y: 0 });
  
  // ❌ Saving real-time state to database
  const handleSpin = async () => {
    setIsSpinning(true);
    setCurrentAnimation('spin');
    
    // Simulate spin
    await new Promise(r => setTimeout(r, 3000));
    
    // ❌ Updating permanent store with real-time data
    playerStore.subtractSpins(1);
    playerStore._setDirtyMoney(playerStore.dirtyMoney + 100);
    
    // ❌ Saving to database on every spin (should only save on completion)
    await updatePlayerInDatabase(playerStore.playerId, {
      spins: playerStore.spins,
      dirtyMoney: playerStore.dirtyMoney,
      isSpinning: false,  // ❌ Real-time state in database!
      currentAnimation: null,  // ❌ Real-time state in database!
      spinPosition: { x: 0, y: 0 },  // ❌ Real-time state in database!
    });
    
    setIsSpinning(false);
    setCurrentAnimation(null);
  };

  return (
    <div>
      <button onClick={handleSpin} disabled={isSpinning}>
        Spin ({playerStore.spins})
      </button>
      {isSpinning && <div className="spinning-animation">{currentAnimation}</div>}
    </div>
  );
}
```

**Problems:**
- Real-time state (isSpinning, animation, position) mixed with permanent state
- Real-time state saved to database
- Multiplayer conflicts: other players see your animation state
- Page reload loads old animation state
- Database bloated with ephemeral data

---

### AFTER (Separated State - ✅ CORRECT)

```typescript
// ✅ CORRECT: Permanent and real-time state separated
import { usePlayerStore } from '@/store/playerStore';
import { useRealTimeStateStore } from '@/store/realTimeStateStore';
import { saveAfterSpin } from '@/services/criticalActionService';
import { useEffect } from 'react';

function SpinVault() {
  const playerId = usePlayerStore((s) => s.playerId);
  const spins = usePlayerStore((s) => s.spins);
  const dirtyMoney = usePlayerStore((s) => s.dirtyMoney);
  
  // ✅ Real-time state in real-time store
  const isSpinning = useRealTimeStateStore((s) => s.isAnimating);
  const currentAnimation = useRealTimeStateStore((s) => s.currentAnimation);
  const setIsAnimating = useRealTimeStateStore((s) => s.setIsAnimating);
  const setCurrentAnimation = useRealTimeStateStore((s) => s.setCurrentAnimation);

  const handleSpin = async () => {
    try {
      // 1. Check if player has spins
      if (spins <= 0) {
        showError('No spins available');
        return;
      }

      // 2. Update real-time state (NOT saved to database)
      setIsAnimating(true);
      setCurrentAnimation('spin');

      // 3. Simulate spin
      await new Promise((r) => setTimeout(r, 3000));

      // 4. Optimistic update of permanent state
      usePlayerStore.getState().subtractSpins(1);
      usePlayerStore.getState()._setDirtyMoney(dirtyMoney + 100);

      // 5. Update real-time state
      setCurrentAnimation('reward');
      await new Promise((r) => setTimeout(r, 1000));

      // 6. CRITICAL SAVE (only permanent data)
      if (playerId) {
        await saveAfterSpin(playerId);
      }

      // 7. Clear real-time state
      setIsAnimating(false);
      setCurrentAnimation(null);
    } catch (error) {
      console.error('Spin failed:', error);
      // Revert permanent state on error
      if (playerId) {
        await loadPlayerFromDatabase(playerId);
      }
      // Real-time state will be cleared on next render
      setIsAnimating(false);
      setCurrentAnimation(null);
    }
  };

  return (
    <div>
      <button onClick={handleSpin} disabled={isSpinning}>
        Spin ({spins})
      </button>
      {isSpinning && (
        <div className="spinning-animation">
          {currentAnimation === 'spin' && <SpinAnimation />}
          {currentAnimation === 'reward' && <RewardAnimation />}
        </div>
      )}
    </div>
  );
}
```

**Improvements:**
- ✅ Real-time state in realTimeStateStore
- ✅ Only permanent data saved to database
- ✅ No multiplayer conflicts
- ✅ Page reload clears animation state
- ✅ Database clean and efficient
- ✅ Clear separation of concerns

---

## Example: Player Movement

### BEFORE (❌ WRONG)

```typescript
// ❌ WRONG: Saving position to database
function GameMap() {
  const playerStore = usePlayerStore();
  
  const handleMove = async (x: number, y: number) => {
    // ❌ Saving position to database on every move
    await updatePlayerInDatabase(playerStore.playerId, {
      currentPosition: { x, y },
      lastMoveTime: Date.now(),
    });
  };

  return <div onClick={(e) => handleMove(e.clientX, e.clientY)}>Map</div>;
}
```

**Problems:**
- Position saved on every pixel movement
- Database flooded with position updates
- Multiplayer sees your exact position history
- Page reload loads old position

---

### AFTER (✅ CORRECT)

```typescript
// ✅ CORRECT: Position in real-time store only
function GameMap() {
  const setMapPosition = useRealTimeStateStore((s) => s.setMapPosition);

  const handleMove = (x: number, y: number) => {
    // ✅ Update real-time state only (NOT saved)
    setMapPosition({ x, y });
    
    // Optional: Send to multiplayer server via WebSocket/Firebase
    // NOT to permanent database
    multiplayerSync.updatePosition({ x, y });
  };

  return <div onClick={(e) => handleMove(e.clientX, e.clientY)}>Map</div>;
}
```

**Improvements:**
- ✅ Position in realTimeStateStore
- ✅ Not saved to database
- ✅ Can sync to multiplayer server separately
- ✅ Page reload clears position
- ✅ Database clean

---

## Example: Inventory Management

### BEFORE (❌ WRONG)

```typescript
// ❌ WRONG: Mixing permanent and real-time inventory
function Inventory() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  
  // ❌ Saving UI state to database
  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    
    // ❌ Saving UI state to database
    await updatePlayerInDatabase(playerId, {
      selectedItem: item._id,
      inventoryOpen: true,
      sortBy: 'name',
    });
  };

  return (
    // ... inventory UI
  );
}
```

**Problems:**
- UI state (selectedItem, isOpen, sortBy) saved to database
- Multiplayer sees your UI state
- Page reload loads old UI state
- Database bloated with ephemeral data

---

### AFTER (✅ CORRECT)

```typescript
// ✅ CORRECT: Permanent inventory in uiStore, UI state in realTimeStateStore
function Inventory() {
  // ✅ Permanent inventory data
  const inventory = useUIStore((s) => s.inventory);
  
  // ✅ Real-time UI state
  const selectedItem = useRealTimeStateStore((s) => s.currentAnimation); // or custom field
  const isOpen = useRealTimeStateStore((s) => s.openScreen === 'inventory');
  const [sortBy, setSortBy] = useState('name'); // Local component state is fine for UI
  
  const handleSelectItem = (item) => {
    // ✅ Update real-time state only
    useRealTimeStateStore.getState().setCurrentAnimation(item._id);
    // NOT saved to database
  };

  const handleAddItem = async (item) => {
    try {
      // 1. Optimistic update of permanent inventory
      const newInventory = { ...inventory, [item._id]: item };
      useUIStore.getState().setInventory(newInventory);
      
      // 2. CRITICAL SAVE (only permanent data)
      if (playerId) {
        await saveAfterPurchase(playerId, item.name, item.price);
      }
    } catch (error) {
      // Revert on error
      await loadPlayerFromDatabase(playerId);
    }
  };

  return (
    // ... inventory UI
  );
}
```

**Improvements:**
- ✅ Permanent inventory in uiStore
- ✅ UI state (selectedItem, isOpen) in realTimeStateStore
- ✅ Only permanent data saved to database
- ✅ No multiplayer conflicts
- ✅ Page reload clears UI state but keeps inventory

---

## Example: Combat System

### BEFORE (❌ WRONG)

```typescript
// ❌ WRONG: Combat state mixed with permanent data
function Combat() {
  const playerStore = usePlayerStore();
  
  const handleAttack = async (target) => {
    // ❌ Saving combat state to database
    await updatePlayerInDatabase(playerStore.playerId, {
      isInCombat: true,
      currentCombatTarget: target._id,
      combatStartTime: Date.now(),
      currentHP: 80,
      targetHP: 60,
    });
    
    // Simulate combat
    await simulateCombat();
    
    // ❌ Saving combat result to database
    await updatePlayerInDatabase(playerStore.playerId, {
      isInCombat: false,
      currentCombatTarget: null,
      combatEndTime: Date.now(),
      currentHP: 50,
      targetHP: 0,
    });
  };

  return (
    // ... combat UI
  );
}
```

**Problems:**
- Combat state saved to database
- Multiplayer sees your combat state
- Database flooded with combat updates
- Page reload loads old combat state

---

### AFTER (✅ CORRECT)

```typescript
// ✅ CORRECT: Combat state in realTimeStateStore only
function Combat() {
  const playerId = usePlayerStore((s) => s.playerId);
  const cleanMoney = usePlayerStore((s) => s.cleanMoney);
  
  // ✅ Real-time combat state
  const isInCombat = useRealTimeStateStore((s) => s.isInCombat);
  const currentCombatTarget = useRealTimeStateStore((s) => s.currentCombatTarget);
  const setIsInCombat = useRealTimeStateStore((s) => s.setIsInCombat);
  const setCurrentCombatTarget = useRealTimeStateStore((s) => s.setCurrentCombatTarget);
  
  // Local state for combat mechanics
  const [currentHP, setCurrentHP] = useState(100);
  const [targetHP, setTargetHP] = useState(100);

  const handleAttack = async (target) => {
    try {
      // 1. Update real-time combat state
      setIsInCombat(true);
      setCurrentCombatTarget(target._id);

      // 2. Simulate combat (all real-time)
      while (targetHP > 0 && currentHP > 0) {
        const damage = calculateDamage();
        setTargetHP((hp) => Math.max(0, hp - damage));
        await new Promise((r) => setTimeout(r, 500));
      }

      // 3. Combat complete - handle rewards
      if (targetHP <= 0) {
        // ✅ Only save permanent reward data
        const reward = calculateReward(target);
        usePlayerStore.getState()._setCleanMoney(cleanMoney + reward);
        
        if (playerId) {
          await saveAfterReward(playerId, 'combat', reward);
        }
      }

      // 4. Clear real-time combat state
      setIsInCombat(false);
      setCurrentCombatTarget(null);
    } catch (error) {
      console.error('Combat failed:', error);
      setIsInCombat(false);
      setCurrentCombatTarget(null);
    }
  };

  return (
    // ... combat UI
  );
}
```

**Improvements:**
- ✅ Combat state in realTimeStateStore
- ✅ HP tracking in local component state
- ✅ Only permanent rewards saved to database
- ✅ No multiplayer conflicts
- ✅ Page reload clears combat state

---

## Refactoring Checklist

When refactoring a component:

### 1. Identify State Types
- [ ] What data is permanent? (progression, money, items)
- [ ] What data is real-time? (position, animation, UI state)
- [ ] What data is local? (form inputs, temporary calculations)

### 2. Move to Correct Store
- [ ] Permanent → playerStore or specialized permanent store
- [ ] Real-time → realTimeStateStore
- [ ] Local → component useState

### 3. Update Database Saves
- [ ] Remove saves from real-time state changes
- [ ] Add critical action saves for permanent changes
- [ ] Verify only permanent data is saved

### 4. Test
- [ ] Permanent data persists on reload
- [ ] Real-time state clears on reload
- [ ] No multiplayer conflicts
- [ ] Error recovery works
- [ ] Emergency save on unload works

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Saving Animation State
```typescript
// WRONG
await updatePlayerInDatabase(playerId, {
  currentAnimation: 'spin',
});

// CORRECT
useRealTimeStateStore.getState().setCurrentAnimation('spin');
```

### ❌ Mistake 2: Saving Position
```typescript
// WRONG
await updatePlayerInDatabase(playerId, {
  currentPosition: { x, y },
});

// CORRECT
useRealTimeStateStore.getState().setMapPosition({ x, y });
```

### ❌ Mistake 3: Saving UI State
```typescript
// WRONG
await updatePlayerInDatabase(playerId, {
  selectedItem: itemId,
  isInventoryOpen: true,
});

// CORRECT
useRealTimeStateStore.getState().setCurrentAnimation(itemId);
useRealTimeStateStore.getState().setOpenScreen('inventory');
```

### ❌ Mistake 4: Saving on Every Change
```typescript
// WRONG
const handleMove = async (x, y) => {
  await updatePlayerInDatabase(playerId, { x, y }); // Every pixel!
};

// CORRECT
const handleMove = (x, y) => {
  useRealTimeStateStore.getState().setMapPosition({ x, y });
  // Save only on critical actions
};
```

### ❌ Mistake 5: Not Reverting on Error
```typescript
// WRONG
const handlePurchase = async () => {
  playerStore._setCleanMoney(cleanMoney - cost);
  await updatePlayerInDatabase(playerId, { cleanMoney: cleanMoney - cost });
  // If error, money is lost!
};

// CORRECT
const handlePurchase = async () => {
  try {
    playerStore._setCleanMoney(cleanMoney - cost);
    await saveAfterPurchase(playerId, item, cost);
  } catch (error) {
    await loadPlayerFromDatabase(playerId); // Revert!
  }
};
```

---

## Summary

| Aspect | Permanent | Real-Time |
|--------|-----------|-----------|
| **Store** | playerStore, uiStore, etc. | realTimeStateStore |
| **Saved to DB** | YES | NO |
| **Persists on Reload** | YES | NO |
| **Multiplayer Shared** | YES | NO |
| **Examples** | Money, level, items | Position, animation, UI |
| **Save Trigger** | Critical actions | Never |
| **Error Recovery** | Reload from DB | Clear state |
