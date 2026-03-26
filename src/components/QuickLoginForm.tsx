import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginLocalPlayer } from '@/services/playerService';
import { AlertCircle, CheckCircle, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickLoginForm() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const player = await loginLocalPlayer(email, password);
      setSuccess('Login realizado com sucesso!');
      
      localStorage.setItem('lastPlayerData', JSON.stringify({
        playerId: player._id,
        playerName: player.playerName,
        level: player.level,
        progress: player.progress,
      }));
      
      setTimeout(() => {
        navigate('/star-map');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  };

  return (
    <>
      {/* Quick Login Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="group flex items-center justify-between border border-cyan-500/50 bg-cyan-900/20 p-4 transition-all hover:bg-cyan-500 hover:text-black w-full"
      >
        <span className="flex items-center gap-3 font-bold uppercase tracking-tighter text-cyan-400">
          <LogIn size={20} /> Entrar com Email
        </span>
        <span className="opacity-0 transition-all group-hover:opacity-100">→</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-black/95 border-2 border-cyan-500/50 rounded-lg p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-black uppercase text-cyan-400 mb-2">
                  Entrar na Conta
                </h3>
                <p className="text-sm text-white/70">
                  Use seu email e senha para acessar
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded p-3"
                >
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded p-3"
                >
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-400">{success}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="text-sm text-white/80 mb-2 block font-bold uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="text-sm text-white/80 mb-2 block font-bold uppercase">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? '⏳ Entrando...' : '🔓 Entrar'}
                </motion.button>
              </form>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                disabled={isLoading}
                className="w-full mt-4 border border-white/20 text-white/70 hover:text-white hover:border-white/50 font-bold uppercase py-2 rounded transition-colors disabled:opacity-50"
              >
                Cancelar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
