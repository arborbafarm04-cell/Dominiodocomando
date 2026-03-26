import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { loadPlayerFromDatabase } from '@/services/playerDataService';
import { Players } from '@/entities';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState<Players | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isPlayerAuthenticated();
        
        if (isAuth) {
          const player = await getCurrentLocalPlayer();
          
          if (player) {
            setPlayerData(player);
            setIsAuthenticated(true);
            
            // Use centralized service to load player data
            await loadPlayerFromDatabase(player._id);
          }
        }
      } catch (error) {
        console.error('Error initializing player auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    playerData,
  };
}
