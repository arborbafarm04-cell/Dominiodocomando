import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usePlayerStore } from '@/store/playerStore';

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const setStoredPlayerName = usePlayerStore((state) => state.setPlayerName);

  // Check if user is already logged in on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('playerLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/game', { replace: true });
    }
    
    // Load saved player name
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [navigate]);

  const handleSavePlayerName = () => {
    if (playerName.trim()) {
      const name = playerName.trim().toUpperCase();
      localStorage.setItem('playerName', name);
      setStoredPlayerName(name);
      setShowNameInput(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate Google login
      localStorage.setItem('playerLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'google');
      localStorage.setItem('loginTimestamp', new Date().toISOString());
      navigate('/game');
    } catch (error) {
      console.error('Google login failed:', error);
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate Facebook login
      localStorage.setItem('playerLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'facebook');
      localStorage.setItem('loginTimestamp', new Date().toISOString());
      navigate('/game');
    } catch (error) {
      console.error('Facebook login failed:', error);
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    setIsLoading(true);
    try {
      // Simulate anonymous login
      localStorage.setItem('playerLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'anonymous');
      localStorage.setItem('loginTimestamp', new Date().toISOString());
      navigate('/game');
    } catch (error) {
      console.error('Anonymous login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden bg-[#0a0d14] relative flex flex-col" style={{
      backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_1e5ca7c3774d48e6b010a1a723fd4c9f~mv2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Logo Section */}
      <div className="w-full flex-shrink-0 py-8 flex items-center justify-center bg-gradient-to-b from-black/40 to-transparent">
        <button
          onClick={handleAnonymousLogin}
          className="hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Jogar Anônimo"
        >
          <Image
            src="https://static.wixstatic.com/media/50f4bf_f2a8c161a4404b8a90919814997ac5b2~mv2.png"
            alt="Dominio do Comando Logo"
            width={200}
            height={200}
            className="object-contain"
          />
        </button>
      </div>
      {/* Login Section */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 px-6 pb-8">
        <div className="text-center mb-4">
          <button
            onClick={handleAnonymousLogin}
            className="hover:brightness-110 transition-all duration-300 w-full"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 cursor-pointer" style={{
              textShadow: '0 0 20px rgba(255,69,0,0.8)'
            }}>
              DOMÍNIO DO COMANDO
            </h1>
          </button>
          <p className="text-lg text-subtitle-neon-blue font-paragraph" style={{
            textShadow: '0 0 10px rgba(0,234,255,0.6)'
          }}>
            Escolha sua forma de entrada
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-sm shadow-[inset_0px_0px_4px_0px_#bfbfbf]">
            {/* Player Name Setup Section */}
            {!showNameInput ? (
              <div className="text-center mb-4">
                <p className="text-subtitle-neon-blue font-paragraph text-sm mb-2">
                  {playerName ? `Bem-vindo, ${playerName}!` : 'Configure seu nome de jogador'}
                </p>
                <button
                  onClick={() => setShowNameInput(true)}
                  className="px-4 py-2 rounded-lg border-2 border-logo-gradient-start text-logo-gradient-start font-heading font-bold text-sm hover:bg-logo-gradient-start/10 transition-all duration-300"
                  style={{
                    textShadow: '0 0 8px rgba(255,69,0,0.6)'
                  }}
                >
                  {playerName ? 'Alterar Nome' : 'Definir Nome'}
                </button>
              </div>
            ) : (
              <div className="mb-4 flex flex-col gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome de jogador..."
                  className="w-full px-4 py-2 rounded-lg bg-black/50 border-2 border-logo-gradient-start text-white font-paragraph placeholder-white/50 focus:outline-none focus:border-subtitle-neon-blue"
                  maxLength={30}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePlayerName}
                    className="flex-1 px-4 py-2 rounded-lg bg-logo-gradient-start text-white font-heading font-bold text-sm hover:bg-logo-gradient-start/80 transition-all duration-300"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setShowNameInput(false)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-white/50 text-white font-heading font-bold text-sm hover:border-white transition-all duration-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-lg font-heading font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white hover:border-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                textShadow: '0 0 10px rgba(255,255,255,0.6)'
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-white">Entrar com Google</span>
            </button>

            {/* Facebook Login Button */}
            <button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-lg font-heading font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white hover:border-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                textShadow: '0 0 10px rgba(255,255,255,0.6)'
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              <span className="text-white">Entrar com Facebook</span>
            </button>

            {/* Anonymous Login Button */}
            <button
              onClick={handleAnonymousLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-lg font-heading font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 border-2 border-2 border-logo-gradient-start hover:border-logo-gradient-start/80 hover:bg-logo-gradient-start/10 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,69,0,0.1)',
                textShadow: '0 0 10px rgba(255,69,0,0.6)',
                color: '#FF4500'
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Jogar Anônimo</span>
            </button>
          </div>
        )}

        <p className="text-xs text-white/50 font-paragraph text-center mt-4 max-w-sm">
          Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
