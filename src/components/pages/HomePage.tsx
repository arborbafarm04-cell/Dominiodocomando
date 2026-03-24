import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, ShieldCheck, Eye, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VIDEO_BG = 'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4';

export default function CinemaIntro() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'login'>('intro');
  const [textIndex, setTextIndex] = useState(0);

  const phrases = [
    "COORDENADAS: 22.9068° S, 43.1729° W",
    "ESTADO DE EMERGÊNCIA DECLARADO",
    "SISTEMA DE MONITORAMENTO ATIVO",
    "BEM-VINDO AO COMPLEXO"
  ];

  useEffect(() => {
    if (stage !== 'intro') return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev < phrases.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">

      {/* 🎥 VIDEO LIMPO (SEM NEBLINA PESADA) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover scale-105 brightness-100 contrast-110"
        >
          <source src={VIDEO_BG} type="video/mp4" />
        </video>

        {/* leve vinheta só nas bordas (não escurece o centro) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* 🧠 HUD (TEXTOS NAS EXTREMIDADES) */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6 text-[10px] md:text-xs font-mono uppercase tracking-widest text-white/70">

        {/* TOPO */}
        <div className="flex justify-between">
          <span>{phrases[textIndex]}</span>
          <span className="text-red-500 animate-pulse">● REC</span>
        </div>

        {/* BASE */}
        <div className="flex justify-between text-white/40">
          <span>BR_SUL_01</span>
          <span>-23.5505 / -46.6333</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'intro' ? (
          <motion.div
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-20 flex h-full items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#000" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('login')}
              className="flex items-center gap-4 border-2 border-white px-8 py-4 text-lg md:text-xl font-black uppercase tracking-widest transition-all"
            >
              TOMAR CONTROLE <Play fill="currentColor" size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-30 flex h-full items-center justify-center p-4 md:p-6"
          >

            {/* 🔥 LOGIN RESPONSIVO */}
            <div className="grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 border border-white/10 bg-black/80">

              {/* ESQUERDA */}
              <div className="hidden md:flex flex-col justify-between bg-red-700 p-8">
                <div>
                  <AlertTriangle size={40} className="text-black mb-4" />
                  <h2 className="text-4xl font-black uppercase text-black">
                    Acesso Restrito
                  </h2>
                </div>

                <p className="text-xs font-bold uppercase text-black/60">
                  Todas as ações estão sendo monitoradas.
                </p>
              </div>

              {/* DIREITA */}
              <div className="p-6 md:p-8 flex flex-col justify-center space-y-5">

                <h3 className="text-xl md:text-2xl font-black uppercase">
                  Autenticação
                </h3>

                <div className="grid gap-3">
                  <LoginBtn icon={<Chrome />} label="Google Access" />
                  <LoginBtn icon={<ShieldCheck />} label="Facebook Secure" color="bg-[#1877F2]" />

                  <button
                    onClick={() => navigate('/star-map')}
                    className="flex items-center justify-between border border-white/20 p-4 hover:bg-white hover:text-black transition"
                  >
                    <span className="flex items-center gap-2 font-bold uppercase">
                      <Eye size={18} /> Anônimo
                    </span>
                    →
                  </button>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginBtn({ icon, label, color = "bg-white text-black" }: any) {
  return (
    <button className={`${color} flex items-center gap-3 p-4 font-black uppercase transition hover:brightness-90`}>
      {icon} {label}
    </button>
  );
}
