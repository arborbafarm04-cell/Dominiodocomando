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

  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const reset = usePlayerStore((state) => state.reset);

  const validateForm = () => {
    setError('');

    if (!email.trim()) return setError('E-mail é obrigatório'), false;
    if (!email.includes('@')) return setError('E-mail inválido'), false;
    if (!password.trim()) return setError('Senha é obrigatória'), false;
    if (password.length < 6) return setError('Senha deve ter no mínimo 6 caracteres'), false;
    if (password !== confirmPassword) return setError('As senhas não coincidem'), false;
    if (!gamerName.trim()) return setError('Nome gamer é obrigatório'), false;
    if (gamerName.length < 3) return setError('Nome gamer deve ter no mínimo 3 caracteres'), false;

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // 🔥 LIMPA QUALQUER SESSÃO ANTIGA
      reset();

      // 🔥 CRIA PLAYER NO BANCO
      const player = await registerLocalPlayer(email, password, gamerName);

      // 🔥 SINCRONIZA STORE COM PLAYER REAL
      setPlayer(player);

      setLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Erro ao criar perfil. Tente novamente.');
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

        <form onSubmit={handleRegister} className="space-y-4 p-6">
          {error && (
            <div className="border border-red-500/50 bg-red-900/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <input
            type="text"
            value={gamerName}
            onChange={(e) => setGamerName(e.target.value)}
            placeholder="Nome Gamer"
            disabled={loading}
            className="w-full p-3 bg-white/5 border border-white/10 text-white"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            className="w-full p-3 bg-white/5 border border-white/10 text-white"
          />

          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            disabled={loading}
            className="w-full p-3 bg-white/5 border border-white/10 text-white"
          />

          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar senha"
            disabled={loading}
            className="w-full p-3 bg-white/5 border border-white/10 text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 p-3 text-black font-bold"
          >
            {loading ? 'Criando...' : 'Criar Perfil'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}