import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Gamepad2, Users, Trophy, Zap } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const LOGO_URL = "https://static.wixstatic.com/media/50f4bf_fda705d9cabd430cb14b2281f9cfe089~mv2.png";

export default function HomePage() {
  const navigate = useNavigate();
  const { setPlayerId, setPlayerName, setLevel, setIsGuest, setProgress } = usePlayerStore();
  const [playerName, setInputPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      // Update store immediately for instant UI feedback
      setPlayerId(playerId);
      setPlayerName(displayName);
      setLevel(1);
      setProgress(0);
      setIsGuest(isGuest);

      // Save to localStorage immediately
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', displayName);
      localStorage.setItem('isGuest', isGuest.toString());

      // Close modal and navigate
      setShowLoginForm(false);
      navigate('/game');

      // Create player in database in background
      BaseCrudService.create('players', {
        _id: playerId,
        playerName: displayName,
        level: 1,
        progress: 0,
        isGuest: isGuest,
        externalPlayerId: loginType !== 'guest' ? playerId : null,
        lastUpdated: new Date().toISOString(),
        profilePicture: null,
      }).catch((err) => {
        console.error('Error saving player to database:', err);
      });
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white overflow-x-hidden font-paragraph flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-3 md:px-6 py-8 md:py-16 mt-[110px] md:mt-0">
        {/* Hero Section */}
        <section className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="mb-6 flex justify-center">
              <Image 
                src={LOGO_URL} 
                alt="Domínio do Comando Logo" 
                className="w-24 h-auto md:w-32 md:h-auto object-contain"
                width={128}
              />
            </div>
            
            <h1 className="font-heading font-black text-4xl md:text-6xl tracking-[2px] uppercase mb-4"
              style={{
                background: 'linear-gradient(90deg, #FF4500 0%, #FF0000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0px 0px 8px rgba(255,69,0,0.6))'
              }}
            >
              Domine o Comando
            </h1>
            
            <p className="font-heading font-bold text-2xl md:text-4xl tracking-[1px] uppercase text-[#00eaff] drop-shadow-[0_0_5px_rgba(0,234,255,0.8)] mb-6">
              Seja o Rei do Crime
            </p>
            
            <p className="font-paragraph text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Bem-vindo ao jogo multiplayer onde você constrói seu império criminal, gerencia recursos e compete com outros jogadores em tempo real.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <button
              onClick={() => setShowLoginForm(true)}
              className="px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-[#FF4500] to-[#FF0000] text-white font-heading font-bold text-lg md:text-xl tracking-wider uppercase rounded-lg hover:shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 flex items-center gap-3"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255,69,0,0.5))'
              }}
            >
              <Gamepad2 className="w-6 h-6" />
              Começar a Jogar
            </button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading text-3xl md:text-4xl font-bold text-center mb-12 text-white"
          >
            Por que jogar?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gamepad2, title: 'Gameplay Imersivo', desc: 'Experiência de jogo envolvente e estratégica' },
              { icon: Users, title: 'Multiplayer', desc: 'Jogue com amigos e outros jogadores' },
              { icon: Trophy, title: 'Ranking', desc: 'Suba no ranking e ganhe recompensas' },
              { icon: Zap, title: 'Progressão', desc: 'Aumente seu nível e desbloqueie novos recursos' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                className="bg-gradient-to-br from-[rgba(0,234,255,0.1)] to-[rgba(255,69,0,0.1)] border border-[#00eaff]/30 rounded-lg p-6 hover:border-[#00eaff]/60 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-[#00eaff] mb-4" />
                <h3 className="font-heading font-bold text-lg text-white mb-2">{feature.title}</h3>
                <p className="font-paragraph text-sm text-white/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Login Form Modal */}
        {showLoginForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLoginForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-b from-[rgba(15,20,30,0.95)] to-[rgba(15,20,30,0.85)] border-2 border-[#00eaff] rounded-lg p-6 md:p-8 shadow-[0_0_30px_rgba(0,234,255,0.3)] max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              style={{
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                Começar a Jogar
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm font-paragraph"
                >
                  {error}
                </motion.div>
              )}

              <div className="mb-6">
                <label className="block text-[#00eaff] font-heading text-sm tracking-wider uppercase mb-3">
                  Seu Nome de Jogador
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setInputPlayerName(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite seu nome..."
                  maxLength={20}
                  className="w-full bg-black/40 border-2 border-[#00eaff]/30 rounded px-4 py-3 text-white font-paragraph placeholder-white/40 focus:outline-none focus:border-[#00eaff] transition-colors text-base"
                />
              </div>

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

              <button
                onClick={() => setShowLoginForm(false)}
                className="w-full mt-3 py-3 bg-transparent border-2 border-white/30 rounded font-heading font-bold text-white tracking-wider uppercase hover:border-white/60 transition-all duration-300"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
