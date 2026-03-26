import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { registerPlayer, getPlayerById } from '@/services/playerService';
import { resetPlayerSession } from '@/services/sessionResetService';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GoogleLoginButton() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [isLoading, setIsLoading] = useState(false);
  const [hasHandled, setHasHandled] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await actions.login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (!member || !member.loginEmail || hasHandled) return;

      try {
        setHasHandled(true);

        // 🔥 RESET TOTAL (obrigatório pra multiplayer)
        await resetPlayerSession();

        const email = member.loginEmail.trim().toLowerCase();

        // 🔥 TENTA BUSCAR PLAYER EXISTENTE
        let player = await getPlayerById(email);

        // 🔥 SE NÃO EXISTIR → CRIA
        if (!player) {
          const playerName =
            member.contact?.firstName || member.profile?.nickname || 'Player';

          player = await registerPlayer(email, playerName, playerName);
        }

        if (!player) {
          throw new Error('Falha ao carregar jogador');
        }

        // 🔥 SETA PLAYER GLOBAL
        setPlayer(player);

        navigate('/star-map');
      } catch (error) {
        console.error('Error in Google auth:', error);
        setHasHandled(false);
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleAuth();
  }, [member, hasHandled, navigate, setPlayer]);

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-primary hover:bg-orange-600 text-white font-heading text-lg py-6 rounded-lg transition-colors"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span>Conectando...</span>
        </div>
      ) : (
        <span>🔐 Login com Google</span>
      )}
    </Button>
  );
}