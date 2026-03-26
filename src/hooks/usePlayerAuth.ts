import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { getPlayer } from '@/services/playerCoreService';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const reset = usePlayerStore((state) => state.reset);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Sempre limpa a sessão visual antes de reidratar
        reset();

        const isAuth = await isPlayerAuthenticated();

        if (!isAuth) {
          setIsAuthenticated(false);
          return;
        }

        const localPlayer = await getCurrentLocalPlayer();

        if (!localPlayer?._id) {
          setIsAuthenticated(false);
          reset();
          return;
        }

        // Carrega o player completo e atualizado do banco
        const fullPlayer = await getPlayer(localPlayer._id);

        if (!fullPlayer) {
          setIsAuthenticated(false);
          reset();
          return;
        }

        setPlayer(fullPlayer);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing player auth:', error);
        reset();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setPlayer, reset]);

  return {
    isAuthenticated,
    isLoading,
  };
}