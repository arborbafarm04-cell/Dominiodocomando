import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { registerPlayer } from '@/services/playerService';
import { resetPlayerSession } from '@/services/sessionResetService';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GoogleLoginButton() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { loadPlayerData } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Trigger Wix login (redirects to Google OAuth)
      await actions.login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  // Register player when member data is available after login
  useEffect(() => {
    const handlePlayerRegistration = async () => {
      if (member && member.loginEmail && !hasRegistered) {
        try {
          setHasRegistered(true);
          
          // Reset old session before registering new player
          console.log('🔄 Resetting session before Google login registration...');
          await resetPlayerSession();
          
          const playerName = member.contact?.firstName || member.profile?.nickname || 'Player';
          const nickname = member.profile?.nickname || member.contact?.firstName || 'Anonymous';

          const player = await registerPlayer(member.loginEmail, playerName, nickname);
          
          // Load player data into store for UI synchronization
          loadPlayerData({
            playerId: player._id,
            playerName: player.playerName || 'Player',
            level: player.level || 1,
            progress: player.progress || 0,
            isGuest: player.isGuest || false,
            profilePicture: player.profilePicture || null,
            barracoLevel: player.barracoLevel || 1,
            cleanMoney: player.cleanMoney || 0,
            dirtyMoney: player.dirtyMoney || 0,
            hasInitialized: true,
          });
          
          // Redirect to game page after successful registration
          navigate('/star-map');
        } catch (error) {
          console.error('Error registering player:', error);
          setHasRegistered(false);
        }
      }
    };

    handlePlayerRegistration();
  }, [member, hasRegistered, navigate, loadPlayerData]);

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
