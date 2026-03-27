import { useEffect, useState } from 'react';
import { getAuthSession } from '@/services/authService';
import { getPlayer, getAllPlayers } from '@/services/playerCoreService';
import { usePlayerStore } from '@/store/playerStore';

export function usePlayerAuth() {
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const reset = usePlayerStore((state) => state.reset);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const session = await getAuthSession();

        if (!session) {
          if (!mounted) return;
          reset();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        let player = await getPlayer(session.playerId);

        if (!player) {
          const result = await getAllPlayers();
          const allPlayers = result.items || [];

          player =
            allPlayers.find(
              (p) => p.email?.toLowerCase() === session.email?.toLowerCase()
            ) || null;
        }

        if (!player || !player._id) {
          if (!mounted) return;
          reset();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!mounted) return;

        setPlayer(player);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Auth restore error:', err);

        if (!mounted) return;

        reset();
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setPlayer, reset]);

  return {
    isLoading,
    isAuthenticated,
  };
}