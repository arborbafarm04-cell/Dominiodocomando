import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerLocalPlayer, loginLocalPlayer } from '@/services/playerService';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function LocalLoginForm() {
  const navigate = useNavigate();
  const { loadPlayerData, resetPlayer } = usePlayerStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !playerName || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Senhas não conferem');
      return;
    }

    try {
      setIsLoading(true);
      // Step 1: Register player (creates in DB, registers credentials, creates session)
      const player = await registerLocalPlayer(email, password, playerName);
      
      // Step 2: Clear any previous session data
      resetPlayer();
      
      // Step 3: Load player data into playerStore
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
      
      setSuccess('Conta criada com sucesso! Fazendo login...');
      
      setTimeout(() => {
        navigate('/star-map');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      
      // loginLocalPlayer now handles complete session reset internally:
      // 1. Resets all stores
      // 2. Validates credentials
      // 3. Loads player from database
      // 4. Creates authenticated session
      const player = await loginLocalPlayer(email, password);
      
      // Load player data into playerStore for UI synchronization
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
      
      setSuccess('Login realizado com sucesso!');
      
      setTimeout(() => {
        navigate('/star-map');
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-background/50 backdrop-blur-sm border-2 border-secondary/30 rounded-lg p-8 shadow-2xl">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <p className="font-paragraph text-sm text-secondary">
            {mode === 'login' ? 'Acesso local sem Google' : 'Jogue sem autenticação externa'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded p-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <p className="font-paragraph text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded p-3">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
            <p className="font-paragraph text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label className="font-paragraph text-sm text-foreground mb-2 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
              className="w-full bg-background/50 border-secondary/30 text-foreground placeholder:text-foreground/50"
            />
          </div>

          {/* Player Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="font-paragraph text-sm text-foreground mb-2 block">
                Nome do Jogador
              </label>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Seu nome no jogo"
                disabled={isLoading}
                className="w-full bg-background/50 border-secondary/30 text-foreground placeholder:text-foreground/50"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="font-paragraph text-sm text-foreground mb-2 block">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
              className="w-full bg-background/50 border-secondary/30 text-foreground placeholder:text-foreground/50"
            />
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="font-paragraph text-sm text-foreground mb-2 block">
                Confirmar Senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                disabled={isLoading}
                className="w-full bg-background/50 border-secondary/30 text-foreground placeholder:text-foreground/50"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-orange-600 text-white font-heading text-lg py-6 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span>{mode === 'login' ? 'Entrando...' : 'Criando conta...'}</span>
              </div>
            ) : (
              <span>{mode === 'login' ? '🔓 Entrar' : '✨ Criar Conta'}</span>
            )}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="font-paragraph text-sm text-foreground/70 mb-3">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
              setSuccess('');
              setEmail('');
              setPassword('');
              setPlayerName('');
              setConfirmPassword('');
            }}
            disabled={isLoading}
            className="font-paragraph text-sm text-secondary hover:text-secondary/80 transition-colors underline"
          >
            {mode === 'login' ? 'Criar nova conta' : 'Voltar ao login'}
          </button>
        </div>
      </div>
    </div>
  );
}
