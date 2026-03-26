import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { syncPlayerToDatabase } from '@/services/playerDataService';

/**
 * Hook to automatically sync player data to the database
 * Saves player progress, level, and other data periodically
 * Uses centralized playerDataService for consistency
 */
export function usePlayerDataSync() {
  const playerId = usePlayerStore((state) => state.playerId);

  // Auto-save player data every 30 seconds
  useEffect(() => {
    if (!playerId) return;

    const syncInterval = setInterval(async () => {
      try {
        await syncPlayerToDatabase(playerId);
      } catch (error) {
        console.error('Error syncing player data:', error);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [playerId]);

  // Save on page unload
  useEffect(() => {
    if (!playerId) return;

    const handleBeforeUnload = async () => {
      try {
        await syncPlayerToDatabase(playerId);
      } catch (error) {
        console.error('Error saving player data on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [playerId]);
}
