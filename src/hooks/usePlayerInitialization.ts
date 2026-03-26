import { useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getInitialComercioData } from '@/types/comercios';
import { usePlayerStore } from '@/store/playerStore';

export const usePlayerInitialization = () => {
  const { member } = useMember();
  const { setPlayerName, setLevel, setProgress, setProfilePicture, loadPlayerData } = usePlayerStore();

  useEffect(() => {
    const initializePlayer = async () => {
      if (!member?._id) return;

      try {
        let player = await BaseCrudService.getById<Players>('players', member._id);

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
          await BaseCrudService.create('players', newPlayer);
          console.log('✅ Jogador criado com sucesso');
          
          // Atualizar store com dados do novo jogador
          setPlayerName(playerName);
          setLevel(1);
          setProgress(0);
          setProfilePicture(member.profile?.photo?.url || null);
          return;
        }

        // Se o jogador existe, carregar dados no store
        if (player) {
          console.log('📝 Carregando dados do jogador existente');
          loadPlayerData({
            playerId: player._id,
            playerName: player.playerName || 'Jogador',
            level: player.level || 1,
            progress: player.progress || 0,
            profilePicture: player.profilePicture || null,
            isGuest: player.isGuest || false,
          });
          
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
        }
      } catch (error) {
        console.error('Erro ao inicializar jogador:', error);
      }
    };

    initializePlayer();
  }, [member?._id, setPlayerName, setLevel, setProgress, setProfilePicture, loadPlayerData]);
};
