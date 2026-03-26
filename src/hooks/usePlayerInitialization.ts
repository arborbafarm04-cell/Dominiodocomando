import { useEffect, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';
import { usePlayerStore } from '@/store/playerStore';
import { loadPlayerFromDatabase, createNewPlayer } from '@/services/playerDataService';

// Global flag to prevent multiple initializations across all component instances
let globalInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const usePlayerInitialization = () => {
  const { member, isLoading } = useMember();
  const initRef = useRef(false);

  useEffect(() => {
    // Skip if already initialized, still loading member data, or no member
    if (globalInitialized || initRef.current || isLoading || !member?._id) return;
    
    initRef.current = true;

    const initializePlayer = async () => {
      // If initialization is already in progress, wait for it
      if (initializationPromise) {
        await initializationPromise;
        return;
      }

      // Create the initialization promise
      initializationPromise = (async () => {
        try {
          // Use centralized service to load player
          let player = await loadPlayerFromDatabase(member._id);

          // Se o jogador não existe, criar um novo
          if (!player) {
            console.log('📝 Criando novo jogador para:', member._id);
            const comercios = getInitialComercioData();
            const playerName = member.profile?.nickname || 'Jogador';
            
            const newPlayer: Players = {
              _id: member._id,
              playerName,
              cleanMoney: 0,
              dirtyMoney: 1000,
              level: 1,
              progress: 0,
              comercios: JSON.stringify(comercios),
              isGuest: false,
              profilePicture: member.profile?.photo?.url,
            };
            
            await createNewPlayer(newPlayer);
            console.log('✅ Jogador criado com sucesso');
            globalInitialized = true;
            return;
          }

          // Se o jogador existe, dados já foram carregados via loadPlayerFromDatabase
          if (player) {
            console.log('📝 Carregando dados do jogador existente');
            
            // Se não tem dados de comércios, inicializar
            if (!player.comercios) {
              console.log('📝 Inicializando comércios para jogador existente');
              const comercios = getInitialComercioData();
              await BaseCrudService.update<Players>('players', {
                _id: member._id,
                comercios: JSON.stringify(comercios),
              });
              console.log('✅ Comércios inicializados');
            }
            globalInitialized = true;
          }
        } catch (error) {
          console.error('Erro ao inicializar jogador:', error);
          // Reset on error to allow retry
          globalInitialized = false;
          initRef.current = false;
        } finally {
          initializationPromise = null;
        }
      })();

      await initializationPromise;
    };

    initializePlayer();
  }, [member?._id, isLoading]);
};
