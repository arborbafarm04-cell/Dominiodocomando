import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { setPlayerId, setPlayerName, setLevel, setIsGuest, setProgress } = usePlayerStore();
  const [playerName, setInputPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestLogin = async () => {
    if (!playerName.trim()) {
      setError('Por favor, digite um nome para continuar como visitante');
      return;
    }

    setIsLoading(true);
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create guest player in database
      const newPlayer = await BaseCrudService.create('players', {
        _id: guestId,
        playerName: playerName.trim().toUpperCase(),
        level: 1,
        progress: 0,
        isGuest: true,
        externalPlayerId: null,
        lastUpdated: new Date().toISOString(),
        profilePicture: null,
      });

      // Update store
      setPlayerId(guestId);
      setPlayerName(playerName.trim().toUpperCase());
      setLevel(1);
      setProgress(0);
      setIsGuest(true);

      // Save to localStorage
      localStorage.setItem('playerId', guestId);
      localStorage.setItem('playerName', playerName.trim().toUpperCase());
      localStorage.setItem('isGuest', 'true');

      onClose();
    } catch (err) {
      setError('Erro ao criar conta de visitante. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // This would typically integrate with Google OAuth
      // For now, we'll create a mock authenticated player
      const googleId = `google_${Date.now()}`;
      
      const newPlayer = await BaseCrudService.create('players', {
        _id: googleId,
        playerName: 'JOGADOR_GOOGLE',
        level: 1,
        progress: 0,
        isGuest: false,
        externalPlayerId: googleId,
        lastUpdated: new Date().toISOString(),
        profilePicture: null,
      });

      setPlayerId(googleId);
      setPlayerName('JOGADOR_GOOGLE');
      setLevel(1);
      setProgress(0);
      setIsGuest(false);

      localStorage.setItem('playerId', googleId);
      localStorage.setItem('playerName', 'JOGADOR_GOOGLE');
      localStorage.setItem('isGuest', 'false');

      onClose();
    } catch (err) {
      setError('Erro ao fazer login com Google. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div
              className="relative bg-gradient-to-b from-[rgba(15,20,30,0.95)] to-[rgba(15,20,30,0.85)] border-2 border-[#00eaff] rounded-lg p-8 shadow-[0_0_30px_rgba(0,234,255,0.3)]"
              style={{
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="font-heading text-3xl font-black tracking-[2px] uppercase mb-2" style={{
                  background: 'linear-gradient(to right, #FF4500, #FF0000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  DOMÍNIO DO COMANDO
                </h2>
                <p className="text-[#00eaff] font-paragraph text-sm tracking-wide">
                  Escolha como deseja entrar no jogo
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm font-paragraph"
                >
                  {error}
                </motion.div>
              )}

              {/* Guest Login Section */}
              <div className="mb-6">
                <label className="block text-[#00eaff] font-heading text-sm tracking-wider uppercase mb-3">
                  Entrar como Visitante
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setInputPlayerName(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite seu nome de jogador..."
                  maxLength={20}
                  className="w-full bg-black/40 border-2 border-[#00eaff]/30 rounded px-4 py-3 text-white font-paragraph placeholder-white/40 focus:outline-none focus:border-[#00eaff] transition-colors mb-3"
                />
                <button
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#00eaff]/20 to-[#00eaff]/10 border-2 border-[#00eaff] rounded font-heading font-bold text-[#00eaff] tracking-wider uppercase hover:from-[#00eaff]/30 hover:to-[#00eaff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0,234,255,0.3))'
                  }}
                >
                  {isLoading ? 'Carregando...' : 'Entrar como Visitante'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00eaff]/30 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[rgba(15,20,30,0.95)] text-[#00eaff]/60 text-xs font-heading tracking-wider uppercase">
                    OU
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FF4500]/20 to-[#FF0000]/20 border-2 border-[#FF4500] rounded font-heading font-bold text-[#FF4500] tracking-wider uppercase hover:from-[#FF4500]/30 hover:to-[#FF0000]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.3))'
                }}
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? 'Conectando...' : 'Login com Google'}
              </button>

              {/* Info Text */}
              <p className="mt-6 text-center text-white/60 font-paragraph text-xs leading-relaxed">
                O login é necessário apenas uma vez. Seu progresso será salvo automaticamente no servidor multiplayer.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
