import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkAndRestoreSession } from '@/hooks/usePlayerAuth';
import { usePlayerStore } from '@/store/playerStore';
import LocalLoginForm from '@/components/LocalLoginForm';

const VIDEO_BG =
  'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4';

export default function HomePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'login'>('intro');
  const [textIndex, setTextIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const phrases = [
    'COORDENADAS: 22.9068° S, 43.1729° W',
    'ESTADO DE EMERGÊNCIA DECLARADO',
    'SISTEMA DE MONITORAMENTO ATIVO',
    'BEM-VINDO AO COMPLEXO',
  ];

  // 🔥 CRÍTICO: Verificar e restaurar sessão persistida ao carregar a página
  // Isso permite que o usuário não precise fazer login novamente
  useEffect(() => {
    const restoreSession = async () => {
      try {
        console.log('🔄 Verificando sessão persistida...');
        const restoredPlayer = await checkAndRestoreSession();
        if (restoredPlayer) {
          console.log('✅ Sessão restaurada! Carregando dados do jogador:', restoredPlayer.playerName);
          setPlayer(restoredPlayer);
          // Auto-redirect para o mapa do jogo
          navigate('/star-map');
        } else {
          console.log('ℹ️ Nenhuma sessão anterior encontrada. Mostrando tela de login.');
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, [navigate, setPlayer]);

  useEffect(() => {
    if (stage !== 'intro' || isCheckingSession) return;

    const interval = setInterval(() => {
      setTextIndex((prev) => {
        if (prev < phrases.length - 1) {
          return prev + 1;
        }

        setAutoAdvance(true);
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [stage, phrases.length, isCheckingSession]);

  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setTimeout(() => {
      setStage('login');
      setAutoAdvance(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoAdvance]);

  // 🔥 Mostrar loading enquanto verifica sessão
  if (isCheckingSession) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white select-none flex items-center justify-center px-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="text-2xl sm:text-4xl font-black uppercase tracking-widest mb-4">
            INICIANDO SISTEMA
          </div>
          <div className="text-xs sm:text-sm text-cyan-400 font-mono">
            Verificando credenciais...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-white select-none">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover scale-110 opacity-50 grayscale-[0.3]"
        >
          <source src={VIDEO_BG} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_110%)]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <AnimatePresence mode="wait">
        {stage === 'intro' ? (
          <motion.div
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 py-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="mb-8 sm:mb-12 text-center"
            >
              <h1 className="mb-2 text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase tracking-widest text-white">
                DOMÍNIO DO
              </h1>
              <h1 className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase tracking-widest text-transparent">
                COMANDO
              </h1>
            </motion.div>

            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 sm:mb-8 font-mono text-xs sm:text-sm tracking-[0.5em] text-red-600"
            >
              {phrases[textIndex]}
            </motion.p>

            <motion.div className="mb-8 sm:mb-12 flex gap-2">
              {phrases.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-1 rounded-full bg-white/30"
                  animate={{
                    width: idx <= textIndex ? 24 : 8,
                    backgroundColor: idx <= textIndex ? '#ef4444' : 'rgba(255,255,255,0.3)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('login')}
              className="flex items-center gap-2 sm:gap-4 border-2 border-white px-6 sm:px-10 py-2 sm:py-4 text-sm sm:text-xl font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black"
            >
              TOMAR CONTROLE <Play fill="currentColor" size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-30 flex min-h-screen items-center justify-center p-4 sm:p-6"
          >
            <div className="grid w-full max-w-5xl grid-cols-1 gap-0 border border-white/10 bg-black/90 shadow-[0_0_100px_rgba(0,0,0,1)] md:grid-cols-2">
              <div className="hidden flex-col justify-between bg-red-700 p-6 sm:p-10 md:flex">
                <div className="space-y-2">
                  <AlertTriangle size={40} className="sm:w-12 sm:h-12 text-black" />
                  <h2 className="text-3xl sm:text-5xl font-black uppercase leading-none text-black">
                    Acesso
                    <br />
                    Restrito
                  </h2>
                </div>

                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/60">
                  Aviso: Todas as ações estão sendo registradas pelo comando central.
                </p>
              </div>

              <div className="flex flex-col justify-center space-y-4 sm:space-y-6 p-6 sm:p-10">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black uppercase italic">Autenticação</h3>
                  <div className="h-1 w-20 bg-red-700" />
                </div>

                <div className="grid gap-3 sm:gap-4">
                  <LocalLoginForm />

                  <div className="relative py-3 sm:py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>

                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 text-zinc-500">Infiltração</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/star-map')}
                    className="group flex items-center justify-between border border-white/20 p-3 sm:p-4 transition-all hover:bg-white hover:text-black text-sm sm:text-base"
                  >
                    <span className="flex items-center gap-2 sm:gap-3 font-bold uppercase tracking-tighter">
                      <Eye size={16} className="sm:w-5 sm:h-5" /> Entrar como Anônimo
                    </span>
                    <span className="opacity-0 transition-all group-hover:opacity-100">→</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-6 z-40 hidden md:block"
      >
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
            Server: BR_SUL_01
          </div>
          <div>Lat: -23.5505 | Lon: -46.6333</div>
        </div>
      </motion.div>
    </div>
  );
}
