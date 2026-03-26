import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, ShieldCheck, Eye, Play, AlertTriangle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayerAuth } from '@/hooks/usePlayerAuth';
import PlayerRegistration from '@/components/PlayerRegistration';
import QuickLoginForm from '@/components/QuickLoginForm';

const VIDEO_BG = 'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4';

export default function HomePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'login'>('intro');
  const [textIndex, setTextIndex] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  
  // Check for existing authentication
  const { isAuthenticated, isLoading } = usePlayerAuth();
  
  const playerName = usePlayerStore((state) => state.playerName);
  
  // Redirect to star-map if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/star-map');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const phrases = [
    "COORDENADAS: 22.9068° S, 43.1729° W",
    "ESTADO DE EMERGÊNCIA DECLARADO",
    "SISTEMA DE MONITORAMENTO ATIVO",
    "BEM-VINDO AO COMPLEXO"
  ];

  // Auto-advance intro after showing all phrases
  useEffect(() => {
    if (stage !== 'intro') return;
    
    const interval = setInterval(() => {
      setTextIndex((prev) => {
        if (prev < phrases.length - 1) {
          return prev + 1;
        } else {
          // After last phrase, auto-advance to login after 2 seconds
          setAutoAdvance(true);
          return prev;
        }
      });
    }, 1200);
    
    return () => clearInterval(interval);
  }, [stage, phrases.length]);

  // Auto-advance to login stage
  useEffect(() => {
    if (autoAdvance) {
      const timer = setTimeout(() => {
        setStage('login');
        setAutoAdvance(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans text-white select-none">
      {/* BACKGROUND VIDEO COM EFEITOS */}
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
        
        {/* Vinheta Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_110%)]" />
        
        {/* Overlay Escuro */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Linhas de Interferência de TV */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <AnimatePresence mode="wait">
        {stage === 'intro' ? (
          // ESTÁGIO 1: INTRO CINEMÁTICO
          <motion.div 
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            className="relative z-20 flex h-full flex-col items-center justify-center px-4"
          >
            {/* Logo/Título */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="mb-12 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-widest text-white mb-2">
                DOMÍNIO DO
              </h1>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-widest bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                COMANDO
              </h1>
            </motion.div>

            {/* Texto de Boot Sequencial */}
            <motion.p 
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 font-mono text-xs tracking-[0.5em] text-red-600 md:text-sm"
            >
              {phrases[textIndex]}
            </motion.p>

            {/* Indicador de Progresso */}
            <motion.div className="flex gap-2 mb-12">
              {phrases.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-1 bg-white/30 rounded-full"
                  animate={{
                    width: idx <= textIndex ? 24 : 8,
                    backgroundColor: idx <= textIndex ? '#ef4444' : 'rgba(255,255,255,0.3)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </motion.div>

            {/* Botão para Avançar */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#000" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('login')}
              className="flex items-center gap-4 border-2 border-white px-10 py-4 text-xl font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black"
            >
              TOMAR CONTROLE <Play fill="currentColor" size={20} />
            </motion.button>
          </motion.div>
        ) : (
          // ESTÁGIO 2: AUTENTICAÇÃO
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-30 flex h-full items-center justify-center p-6"
          >
            <div className="grid w-full max-w-5xl grid-cols-1 gap-0 border border-white/10 bg-black/90 md:grid-cols-2 shadow-[0_0_100px_rgba(0,0,0,1)]">
              {/* Lado Esquerdo: Identidade Visual */}
              <div className="hidden flex-col justify-between bg-red-700 p-10 md:flex">
                <div className="space-y-2">
                  <AlertTriangle size={48} className="text-black" />
                  <h2 className="text-5xl font-black uppercase leading-none text-black">
                    Acesso<br/>Restrito
                  </h2>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-black/60">
                  Aviso: Todas as ações estão sendo registradas pelo comando central.
                </p>
              </div>

              {/* Lado Direito: Formulários de Autenticação */}
              <div className="p-10 flex flex-col justify-center space-y-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase italic">Autenticação</h3>
                  <div className="h-1 w-20 bg-red-700" />
                </div>

                <div className="grid gap-4">
                  {/* Botão Criar Perfil */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRegistration(true)}
                    className="bg-cyan-600 text-white flex items-center gap-4 p-4 font-black uppercase tracking-tighter transition-transform hover:bg-cyan-500"
                  >
                    <UserPlus size={20} /> Criar Perfil
                  </motion.button>

                  {/* Formulário de Login Rápido */}
                  <QuickLoginForm />

                  {/* Botão Google */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.location.href = '/api/auth/login';
                    }}
                    className="bg-white text-black flex items-center gap-4 p-4 font-black uppercase tracking-tighter transition-transform hover:bg-gray-200"
                  >
                    <Chrome size={20} /> Google Access
                  </motion.button>

                  {/* Botão Facebook */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log('Facebook login clicked');
                    }}
                    className="bg-[#1877F2] text-white flex items-center gap-4 p-4 font-black uppercase tracking-tighter transition-transform hover:bg-[#165ec7]"
                  >
                    <ShieldCheck size={20} /> Facebook Secure
                  </motion.button>
                  
                  {/* Divisor */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 text-zinc-500">Infiltração</span>
                    </div>
                  </div>

                  {/* Botão Anônimo */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/star-map')}
                    className="group flex items-center justify-between border border-white/20 p-4 transition-all hover:bg-white hover:text-black"
                  >
                    <span className="flex items-center gap-3 font-bold uppercase tracking-tighter">
                      <Eye size={20} /> Entrar como Anônimo
                    </span>
                    <span className="opacity-0 transition-all group-hover:opacity-100">→</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER COM INFORMAÇÕES DO SERVIDOR */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-6 z-40 hidden md:block"
      >
        <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" /> 
            Server: BR_SUL_01
          </div>
          <div>Lat: -23.5505 | Lon: -46.6333</div>
        </div>
      </motion.div>

      {/* MODAL DE REGISTRO */}
      <AnimatePresence>
        {showRegistration && (
          <PlayerRegistration
            onClose={() => setShowRegistration(false)}
            onSuccess={() => {
              setShowRegistration(false);
              navigate('/star-map');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
