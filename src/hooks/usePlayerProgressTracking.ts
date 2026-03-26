import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { updatePlayer } from '@/services/playerService';

/**
 * Hook to track and save specific player progress events
 * Saves immediately when important milestones are reached
 */
export function usePlayerProgressTracking() {
  const playerId = usePlayerStore((state) => state.playerId);
  const level = usePlayerStore((state) => state.level);
  const progress = usePlayerStore((state) => state.progress);
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);

  // Save level changes immediately
  useEffect(() => {
    if (!playerId || level === 1) return; // Don't save on initial load

    const saveLevel = async () => {
      try {
        await updatePlayer(playerId, {
          level,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving level:', error);
      }
    };

    saveLevel();
  }, [playerId, level]);

  // Save progress changes immediately
  useEffect(() => {
    if (!playerId || progress === 0) return; // Don't save on initial load

    const saveProgress = async () => {
      try {
        await updatePlayer(playerId, {
          progress,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    saveProgress();
  }, [playerId, progress]);

  // Save barraco level changes immediately
  useEffect(() => {
    if (!playerId || barracoLevel === 1) return; // Don't save on initial load

    const saveBarracoLevel = async () => {
      try {
        await updatePlayer(playerId, {
          level: barracoLevel,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving barraco level:', error);
      }
    };

    saveBarracoLevel();
  }, [playerId, barracoLevel]);
}
