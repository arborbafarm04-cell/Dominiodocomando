import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { updatePlayer } from '@/services/playerService';

/**
 * Hook to automatically sync player data to the database
 * Saves player progress, level, and other data periodically
 */
export function usePlayerDataSync() {
  const playerId = usePlayerStore((state) => state.playerId);
  const playerName = usePlayerStore((state) => state.playerName);
  const level = usePlayerStore((state) => state.level);
  const progress = usePlayerStore((state) => state.progress);
  const playerMoney = usePlayerStore((state) => state.playerMoney);
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);

  // Auto-save player data every 30 seconds
  useEffect(() => {
    if (!playerId) return;

    const syncInterval = setInterval(async () => {
      try {
        await updatePlayer(playerId, {
          playerName,
          level,
          progress,
          dirtyMoney: playerMoney,
          barracoLevel,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error syncing player data:', error);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [playerId, playerName, level, progress, playerMoney, barracoLevel]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!playerId) return;

      try {
        await updatePlayer(playerId, {
          playerName,
          level,
          progress,
          dirtyMoney: playerMoney,
          barracoLevel,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving player data on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [playerId, playerName, level, progress, playerMoney, barracoLevel]);
}
