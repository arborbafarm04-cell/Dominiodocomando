/**
 * Session Reset Service
 * Handles complete cleanup of player session state before loading a new player
 * 
 * Order of operations:
 * 1. resetPlayer() - Clear main player store
 * 2. Clear all legacy stores
 * 3. Clear local prototype states
 * 4. Clear IndexedDB session data
 */

import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useSpinVaultStore } from '@/store/spinVaultStore';
import { useLuxuryShopStore } from '@/store/luxuryShopStore';
import { useGameScreenStore } from '@/store/gameScreenStore';
import { useBriberyStore } from '@/store/briberyStore';
import { useComerciosStore } from '@/store/comerciosStore';
import { useCommercialCenterStore } from '@/store/commercialCenterStore';
import { useBusinessInvestmentStore } from '@/store/businessInvestmentStore';
import { useMoneyLaunderingStore } from '@/store/moneyLaunderingStore';
import { useMapStateStore } from '@/store/mapStateStore';
import { useMapButtonsStore } from '@/store/mapButtonsStore';
import { useHotspotStore } from '@/store/hotspotStore';
import { useFactionStore } from '@/store/factionStore';
import { useSkillTreeStore } from '@/store/skillTreeStore';
import { useAttackSkillTreeStore } from '@/store/attackSkillTreeStore';
import { useAgilitySkillTreeStore } from '@/store/agilitySkillTreeStore';
import { useDefenseSkillTreeStore } from '@/store/defenseSkillTreeStore';
import { useIntelligenceSkillTreeStore } from '@/store/intelligenceSkillTreeStore';
import { useInvestmentSkillTreeStore } from '@/store/investmentSkillTreeStore';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { useVigorSkillTreeStore } from '@/store/vigorSkillTreeStore';
import { useDrawingStore } from '@/store/drawingStore';
import { useDragCustomizationStore } from '@/store/dragCustomizationStore';
import { useSelectedTilesStore } from '@/store/selectedTilesStore';
import { clearSession } from './indexedDBService';

/**
 * Complete session reset - clears all player-related state
 * Call this BEFORE loading a new player
 */
export async function resetPlayerSession() {
  console.log('🔄 Starting complete session reset...');

  try {
    // Step 1: Reset main player store
    console.log('  1️⃣ Resetting player store...');
    usePlayerStore.getState().resetPlayer();

    // Step 2: Reset all legacy game stores
    console.log('  2️⃣ Resetting legacy game stores...');
    useGameStore.getState().reset();
    useSpinVaultStore.setState({
      spins: 0,
      lastGainTime: 0,
      hasInitialized: false,
      barracoLevel: 1,
    });

    // Step 3: Reset luxury shop store
    console.log('  3️⃣ Resetting luxury shop store...');
    useLuxuryShopStore.setState({
      isOpen: false,
      selectedItem: null,
      purchasedItems: [],
    });

    // Step 4: Reset game screen store
    console.log('  4️⃣ Resetting game screen store...');
    useGameScreenStore.setState({
      currentScreen: 'menu',
    });

    // Step 5: Reset business-related stores
    console.log('  5️⃣ Resetting business stores...');
    useBriberyStore.setState({
      bribedOfficials: {},
      totalBribesPaid: 0,
    });
    useComerciosStore.setState({
      comercios: {},
      selectedComercio: null,
    });
    useCommercialCenterStore.setState({
      upgrades: {},
      selectedUpgrade: null,
    });
    useBusinessInvestmentStore.setState({
      investments: {},
      selectedInvestment: null,
    });
    useMoneyLaunderingStore.setState({
      businesses: {},
      selectedBusiness: null,
    });

    // Step 6: Reset map and location stores
    console.log('  6️⃣ Resetting map stores...');
    useMapStateStore.setState({
      currentLocation: 'home',
      mapZoom: 1,
      mapPosition: { x: 0, y: 0 },
    });
    useMapButtonsStore.setState({
      visibleButtons: [],
      selectedButton: null,
    });
    useHotspotStore.setState({
      hotspots: [],
      selectedHotspot: null,
    });

    // Step 7: Reset faction and social stores
    console.log('  7️⃣ Resetting faction stores...');
    useFactionStore.setState({
      factions: {},
      selectedFaction: null,
    });

    // Step 8: Reset all skill tree stores
    console.log('  8️⃣ Resetting skill tree stores...');
    useSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useAttackSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useAgilitySkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useDefenseSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useIntelligenceSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useInvestmentSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useRespeitSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });
    useVigorSkillTreeStore.setState({
      skills: {},
      selectedSkill: null,
    });

    // Step 9: Reset UI and customization stores
    console.log('  9️⃣ Resetting UI stores...');
    useDrawingStore.setState({
      drawings: [],
      selectedDrawing: null,
    });
    useDragCustomizationStore.setState({
      customizations: {},
      selectedCustomization: null,
    });
    useSelectedTilesStore.setState({
      selectedTiles: [],
    });

    // Step 10: Clear IndexedDB session data
    console.log('  🔟 Clearing IndexedDB session data...');
    await clearSession();

    // Step 11: Clear localStorage prototype states
    console.log('  1️⃣1️⃣ Clearing localStorage...');
    const keysToPreserve = ['theme', 'language', 'settings']; // Keep non-player data
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Step 12: Clear sessionStorage
    console.log('  1️⃣2️⃣ Clearing sessionStorage...');
    sessionStorage.clear();

    console.log('✅ Session reset complete!');
    return true;
  } catch (error) {
    console.error('❌ Error during session reset:', error);
    throw error;
  }
}

/**
 * Partial reset - only clears specific stores
 * Useful for testing or selective resets
 */
export function resetSpecificStores(storeNames: string[]) {
  console.log(`🔄 Resetting specific stores: ${storeNames.join(', ')}`);

  const storeMap: Record<string, () => void> = {
    player: () => usePlayerStore.getState().resetPlayer(),
    game: () => useGameStore.getState().reset(),
    spinVault: () =>
      useSpinVaultStore.setState({
        spins: 0,
        lastGainTime: 0,
        hasInitialized: false,
        barracoLevel: 1,
      }),
    luxuryShop: () =>
      useLuxuryShopStore.setState({
        isOpen: false,
        selectedItem: null,
        purchasedItems: [],
      }),
    gameScreen: () =>
      useGameScreenStore.setState({
        currentScreen: 'menu',
      }),
    bribery: () =>
      useBriberyStore.setState({
        bribedOfficials: {},
        totalBribesPaid: 0,
      }),
    comercios: () =>
      useComerciosStore.setState({
        comercios: {},
        selectedComercio: null,
      }),
    commercialCenter: () =>
      useCommercialCenterStore.setState({
        upgrades: {},
        selectedUpgrade: null,
      }),
    businessInvestment: () =>
      useBusinessInvestmentStore.setState({
        investments: {},
        selectedInvestment: null,
      }),
    moneyLaundering: () =>
      useMoneyLaunderingStore.setState({
        businesses: {},
        selectedBusiness: null,
      }),
    mapState: () =>
      useMapStateStore.setState({
        currentLocation: 'home',
        mapZoom: 1,
        mapPosition: { x: 0, y: 0 },
      }),
    mapButtons: () =>
      useMapButtonsStore.setState({
        visibleButtons: [],
        selectedButton: null,
      }),
    hotspot: () =>
      useHotspotStore.setState({
        hotspots: [],
        selectedHotspot: null,
      }),
    faction: () =>
      useFactionStore.setState({
        factions: {},
        selectedFaction: null,
      }),
    skillTree: () =>
      useSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    attackSkillTree: () =>
      useAttackSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    agilitySkillTree: () =>
      useAgilitySkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    defenseSkillTree: () =>
      useDefenseSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    intelligenceSkillTree: () =>
      useIntelligenceSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    investmentSkillTree: () =>
      useInvestmentSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    respeitSkillTree: () =>
      useRespeitSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    vigorSkillTree: () =>
      useVigorSkillTreeStore.setState({
        skills: {},
        selectedSkill: null,
      }),
    drawing: () =>
      useDrawingStore.setState({
        drawings: [],
        selectedDrawing: null,
      }),
    dragCustomization: () =>
      useDragCustomizationStore.setState({
        customizations: {},
        selectedCustomization: null,
      }),
    selectedTiles: () =>
      useSelectedTilesStore.setState({
        selectedTiles: [],
      }),
  };

  storeNames.forEach((storeName) => {
    const resetFn = storeMap[storeName];
    if (resetFn) {
      resetFn();
      console.log(`  ✓ Reset ${storeName}`);
    } else {
      console.warn(`  ⚠️ Unknown store: ${storeName}`);
    }
  });
}
