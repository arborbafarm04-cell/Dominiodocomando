import { useEffect, useState } from 'react';
import { getAuthSession } from '@/services/authService';
import { getPlayer, getAllPlayers } from '@/services/playerCoreService';
import { usePlayerStore } from '@/store/playerStore';

export async function checkAndRestoreSession() {
  const setPlayer = usePlayerStore.getState().setPlayer;
  const reset = usePlayerStore.getState().reset;

  try {
    const session = await getAuthSession();

    if (!session) {
      reset();
      return null;
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
      reset();
      return null;
    }

    setPlayer(player);
    return player;
  } catch (error) {
    console.error('Auth restore error:', error);
    reset();
    return null;
  }
}

export function usePlayerAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      const player = await checkAndRestoreSession();

      if (!mounted) return;

      setIsAuthenticated(!!player?._id);
      setIsLoading(false);
    };

    restore();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isLoading,
    isAuthenticated,
  };
}