import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Loader } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { registerLocalPlayer } from '@/services/playerService';

interface PlayerRegistrationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlayerRegistration({ onClose, onSuccess }: PlayerRegistrationProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gamerName, setGamerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setPlayerName = usePlayerStore((state) => state.setPlayerName);
  const setPlayerId = usePlayerStore((state) => state.setPlayerId);

  const validateForm = () => {
    setError('');

    if (!email.trim()) {
      setError('E-mail é obrigatório');
      return false;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido');
      return false;
    }

    if (!password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (!gamerName.trim()) {
      setError('Nome gamer é obrigatório');
      return false;
    }

    if (gamerName.length < 3) {
      setError('Nome gamer deve ter no mínimo 3 caracteres');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Register player with authentication
      const player = await registerLocalPlayer(email, password, gamerName);

      // Update player store
      setPlayerId(player._id);
      setPlayerName(gamerName);

      // Store player data in localStorage for quick access
      localStorage.setItem('lastPlayerData', JSON.stringify({
        playerId: player._id,
        playerName: player.playerName,
        level: player.level,
        progress: player.progress,
      }));

      setLoading(false);
      onSuccess();
    } catch (err) {
      setError('Erro ao criar perfil. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-white/10 bg-black/95 shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {/* Header */}
        <div className="border-b border-white/10 bg-red-700 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={32} className="text-black" />
            <div>
              <h2 className="text-2xl font-black uppercase text-black">Criar Perfil</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-black/60">
                Novo Agente
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 p-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-red-500/50 bg-red-900/20 p-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Gamer Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Nome Gamer
            </label>
            <input
              type="text"
              value={gamerName}
              onChange={(e) => setGamerName(e.target.value)}
              placeholder="Seu nome de agente"
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-zinc-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-zinc-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border border-white/20 px-4 py-3 font-bold uppercase tracking-tighter transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-700 px-4 py-3 font-bold uppercase tracking-tighter text-black transition-all hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Perfil'
              )}
            </button>
          </div>

          {/* Info */}
          <p className="text-center text-xs text-zinc-500 pt-2">
            Seus dados estão protegidos pelo sistema de segurança central.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
