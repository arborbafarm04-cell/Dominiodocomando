import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://static.wixstatic.com/media/50f4bf_fda705d9cabd430cb14b2281f9cfe089~mv2.png";

export default function HomePage() {
  const navigate = useNavigate();
  const { setPlayerId, setPlayerName, setLevel, setIsGuest, setProgress } = usePlayerStore();
  const [playerName, setInputPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if already logged in
    const savedPlayerId = localStorage.getItem('playerId');
    if (savedPlayerId) {
      navigate('/game');
    }
  }, [navigate]);

  const handleLogin = async (loginType: 'guest' | 'google' | 'facebook') => {
    if (loginType === 'guest' && !playerName.trim()) {
      setError('Por favor, digite um nome para continuar como visitante');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let playerId: string;
      let displayName: string;
      let isGuest: boolean;

      if (loginType === 'guest') {
        playerId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        displayName = playerName.trim().toUpperCase();
        isGuest = true;
      } else if (loginType === 'google') {
        playerId = `google_${Date.now()}`;
        displayName = 'JOGADOR_GOOGLE';
        isGuest = false;
      } else {
        playerId = `facebook_${Date.now()}`;
        displayName = 'JOGADOR_FACEBOOK';
        isGuest = false;
      }

      // Create player in database
      await BaseCrudService.create('players', {
        _id: playerId,
        playerName: displayName,
        level: 1,
        progress: 0,
        isGuest: isGuest,
        externalPlayerId: loginType !== 'guest' ? playerId : null,
        lastUpdated: new Date().toISOString(),
        profilePicture: null,
      });

      // Update store
      setPlayerId(playerId);
      setPlayerName(displayName);
      setLevel(1);
      setProgress(0);
      setIsGuest(isGuest);

      // Save to localStorage
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', displayName);
      localStorage.setItem('isGuest', isGuest.toString());

      // Navigate to game
      navigate('/game');
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white overflow-x-hidden font-paragraph selection:bg-[#00eaff] selection:text-black flex items-center justify-center">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4500]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00eaff]/5 rounded-full blur-[150px]" />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-auto px-4 py-8"
      >
        <div className="text-center mb-12">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <Image 
              src={LOGO_URL} 
              alt="Domínio do Comando Logo" 
              className="w-48 h-auto object-contain"
              width={192}
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading font-black text-4xl md:text-5xl tracking-[2px] uppercase mb-2"
            style={{
              background: 'linear-gradient(90deg, #FF4500 0%, #FF0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0px 0px 8px rgba(255,69,0,0.6))'
            }}
          >
            Domine o Comando
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-heading font-bold text-2xl md:text-3xl tracking-[1px] uppercase text-[#00eaff] drop-shadow-[0_0_5px_rgba(0,234,255,0.8)]"
          >
            Seja o Rei do Crime
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-b from-[rgba(15,20,30,0.95)] to-[rgba(15,20,30,0.85)] border-2 border-[#00eaff] rounded-lg p-8 shadow-[0_0_30px_rgba(0,234,255,0.3)]"
          style={{
            backdropFilter: 'blur(10px)',
          }}
        >
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
              onClick={() => handleLogin('guest')}
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
            onClick={() => handleLogin('google')}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#FF4500]/20 to-[#FF0000]/20 border-2 border-[#FF4500] rounded font-heading font-bold text-[#FF4500] tracking-wider uppercase hover:from-[#FF4500]/30 hover:to-[#FF0000]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.3))'
            }}
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Conectando...' : 'Login com Google'}
          </button>

          {/* Facebook Login */}
          <button
            onClick={() => handleLogin('facebook')}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-2 border-blue-600 rounded font-heading font-bold text-blue-400 tracking-wider uppercase hover:from-blue-600/30 hover:to-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.3))'
            }}
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Conectando...' : 'Login com Facebook'}
          </button>

          {/* Info Text */}
          <p className="mt-6 text-center text-white/60 font-paragraph text-xs leading-relaxed">
            O login é necessário apenas uma vez. Seu progresso será salvo automaticamente no servidor multiplayer.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
