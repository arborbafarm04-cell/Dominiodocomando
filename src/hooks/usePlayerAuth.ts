import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getCurrentLocalPlayer, isPlayerAuthenticated } from '@/services/playerService';
import { Players } from '@/entities';

export function usePlayerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState<Players | null>(null);
  
  const setPlayerId = usePlayerStore((state) => state.setPlayerId);
  const setPlayerName = usePlayerStore((state) => state.setPlayerName);
  const setLevel = usePlayerStore((state) => state.setLevel);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setProfilePicture = usePlayerStore((state) => state.setProfilePicture);
  const loadPlayerData = usePlayerStore((state) => state.loadPlayerData);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isPlayerAuthenticated();
        
        if (isAuth) {
          const player = await getCurrentLocalPlayer();
          
          if (player) {
            setPlayerData(player);
            setIsAuthenticated(true);
            
            // Load player data into store
            loadPlayerData({
              playerId: player._id,
              playerName: player.playerName || 'COMANDANTE',
              level: player.level || 1,
              progress: player.progress || 0,
              isGuest: player.isGuest || false,
              profilePicture: player.profilePicture || null,
            });
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
  }, [setPlayerId, setPlayerName, setLevel, setProgress, setProfilePicture, loadPlayerData]);

  return {
    isAuthenticated,
    isLoading,
    playerData,
  };
}
