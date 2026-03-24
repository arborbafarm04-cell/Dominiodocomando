import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('isLogged');
    const intro = localStorage.getItem('hasSeenIntro');

    if (logged === 'true') {
      window.location.href = '/star-map';
      return;
    }

    if (!intro) {
      setShowIntro(true);
    } else {
      setReady(true);
    }
  }, []);

  const finishIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
    setTimeout(() => setReady(true), 300);
  };

  const login = () => {
    const player = name || 'Anônimo';
    localStorage.setItem('playerName', player);
    localStorage.setItem('isLogged', 'true');
    window.location.href = '/star-map';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* 🔥 FUNDO CINEMÁTICO */}
      <div className="absolute inset-0">
        {/* cidade + favela vibe */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544985361-b420d7a77043')] bg-cover bg-center opacity-30"></div>

        {/* escurecimento pesado */}
        <div className="absolute inset-0 bg-black/80"></div>

        {/* glow urbano */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,140,0,0.25),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,0,0,0.2),transparent_50%)]"></div>
      </div>

      {/* 🔥 INTRO */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="text-center">
              
              <motion.h1
                className="text-6xl md:text-7xl font-black text-yellow-400 tracking-wide"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{
                  textShadow: '0 0 25px rgba(255,215,0,0.8)'
                }}
              >
                DOMÍNIO
              </motion.h1>

              <motion.h2
                className="text-4xl md:text-5xl font-bold text-red-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                DO COMANDO
              </motion.h2>

              <motion.p
                className="text-gray-400 mt-6 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Quem controla o morro… controla tudo.
              </motion.p>

              <motion.button
                onClick={finishIntro}
                className="mt-10 px-10 py-4 bg-gradient-to-r from-yellow-600 to-orange-500 font-bold rounded shadow-[0_0_30px_rgba(255,140,0,0.8)]"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                ENTRAR
              </motion.button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 LOGIN (IMERSIVO) */}
      {ready && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">

          {/* LETREIRO */}
          <motion.h1
            className="text-5xl font-black text-yellow-400 mb-10"
            animate={{
              textShadow: [
                '0 0 10px rgba(255,215,0,0.5)',
                '0 0 35px rgba(255,215,0,1)',
                '0 0 10px rgba(255,215,0,0.5)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            DOMÍNIO DO COMANDO
          </motion.h1>

          {/* CARD TRANSPARENTE */}
          <div className="bg-black/70 backdrop-blur-md border border-yellow-500/30 rounded-xl p-8 shadow-[0_0_40px_rgba(255,140,0,0.2)]">

            <p className="text-gray-400 mb-4 text-center text-sm">
              Escolha seu nome no sistema
            </p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome no comando"
              className="w-64 px-4 py-3 text-black rounded mb-4 text-center font-bold"
            />

            <motion.button
              onClick={login}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 font-bold rounded shadow-[0_0_25px_rgba(255,0,0,0.7)]"
            >
              ENTRAR NO SISTEMA
            </motion.button>

          </div>

          {/* FRASE */}
          <p className="mt-6 text-gray-500 text-xs">
            Favela não perdoa. Só respeita poder.
          </p>

        </div>
      )}
    </div>
  );
}
