// HPI 1.7-V
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { motion } from 'framer-motion';
import { Chrome, Crosshair, Facebook, RotateCcw, ShieldAlert, Terminal, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { actions } = useMember();
  const navigate = useNavigate();
  const { playerLevel, setPlayerLevel } = useGameStore();
  const { setLevel } = usePlayerStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} BRT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (provider: string) => {
    setIsLoading(provider);
    try {
      if (provider === 'visitor') {
        // For visitor access, navigate directly to the game without authentication
        navigate('/game');
      } else {
        // Trigger actual authentication via Wix Members SDK for other providers
        await actions.login();
      }
    } catch (error) {
      console.error(`Login failed for ${provider}:`, error);
      setIsLoading(null);
    }
  };

  const handleResetBribery = () => {
    setPlayerLevel(1);
    setLevel(1);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen relative bg-background overflow-clip selection:bg-primary selection:text-primary-foreground">
      <style>
        {`
          .crt-scanlines {
            background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15));
            background-size: 100% 4px;
            pointer-events: none;
          }
          .vignette-heavy {
            background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 90%, #000 100%);
          }
          .glitch-hover:hover {
            animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
          }
          @keyframes glitch-skew {
            0% { transform: skew(0deg); }
            20% { transform: skew(-2deg); }
            40% { transform: skew(2deg); }
            60% { transform: skew(-1deg); }
            80% { transform: skew(1deg); }
            100% { transform: skew(0deg); }
          }
          .hud-corner {
            position: absolute;
            width: 20px;
            height: 20px;
            border-color: rgba(0, 255, 255, 0.3);
            border-style: solid;
          }
        `}
      </style>

      {/* --- LAYER 0: ATMOSPHERE & ENVIRONMENT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="https://static.wixstatic.com/media/50f4bf_6d38f59b693c45f78b1d3c8d16ab413b~mv2.png"
            alt="Favela noturna cinematográfica"
            className="w-full h-full object-cover object-center"
            width={1920}
          />
        </motion.div>

        {/* Environmental Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 vignette-heavy" />
        <div className="absolute inset-0 crt-scanlines opacity-50" />
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
      </div>

      {/* --- LAYER 1: TACTICAL HUD (Heads Up Display) --- */}
      <div className="fixed inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        {/* Top HUD */}
        <div className="flex justify-between items-start font-paragraph text-xs text-secondary/70 tracking-widest uppercase">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2"><Terminal className="w-3 h-3" /> SYS.OP // SECURE</span>
            <span>LOC // RIO_DE_JANEIRO</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span>{systemTime}</span>
            <span className="text-primary animate-pulse">REC // ACTIVE</span>
          </div>
        </div>

        {/* Corner Brackets */}
        <div className="hud-corner top-6 left-6 border-t-2 border-l-2" />
        <div className="hud-corner top-6 right-6 border-t-2 border-r-2" />
        <div className="hud-corner bottom-6 left-6 border-b-2 border-l-2" />
        <div className="hud-corner bottom-6 right-6 border-b-2 border-r-2" />

        {/* Bottom HUD */}
        <div className="flex justify-between items-end font-paragraph text-[10px] text-foreground/30 tracking-widest">
          <span>V 2.4.1 // BUILD_8992</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> ENCRYPTED CONNECTION</span>
        </div>
      </div>

      {/* --- LAYER 2: MAIN INTERFACE --- */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-20 pt-24">
          <div className="w-full max-w-[500px] mx-auto relative">

            {/* Decorative background glow for the whole block */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            {/* --- LOGO REVEAL --- */}
            <motion.div
              initial={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 sm:mb-12 flex justify-center relative z-30"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-logo-gold/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Image
                  src="https://static.wixstatic.com/media/50f4bf_7c2f3e2a62cb49d19eb52f4920c201b6~mv2.png"
                  alt="DOMÍNIO DO COMANDO Logo"
                  className="w-full max-w-[400px] sm:max-w-[480px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10"
                  width={500}
                />
              </div>
            </motion.div>

            {/* --- LOGIN DOSSIER (The Box) --- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative z-20"
            >
              {/* Box Styling: Glassmorphism + Tactical Borders */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

                {/* Corner Accents inside the box */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50" />

                {/* Header Texts */}
                <div className="text-center mb-10">
                  <h1 className="font-heading text-3xl sm:text-4xl text-white uppercase tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    Acesso Restrito
                  </h1>
                  <div className="flex items-center justify-center gap-2 font-paragraph text-xs text-secondary uppercase tracking-widest">
                    <Crosshair className="w-3 h-3" />
                    <span>Identifique-se para prosseguir</span>
                    <Crosshair className="w-3 h-3" />
                  </div>
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="space-y-4">

                  {/* Google Login */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                    <Button
                      onClick={() => handleLogin('google')}
                      disabled={isLoading !== null}
                      className="relative w-full h-14 bg-white hover:bg-gray-100 text-black font-heading text-base uppercase tracking-widest rounded-none border-0 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                      {isLoading === 'google' ? (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Autenticando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <Chrome className="w-5 h-5" />
                          Entrar com Google
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Facebook Login */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-secondary rounded opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                    <Button
                      onClick={() => handleLogin('facebook')}
                      disabled={isLoading !== null}
                      className="relative w-full h-14 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-heading text-base uppercase tracking-widest rounded-none border-0 transition-all duration-300"
                    >
                      {isLoading === 'facebook' ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Autenticando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Facebook className="w-5 h-5" />
                          Entrar com Facebook
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative py-6 flex items-center justify-center">
                    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative bg-black px-4 font-paragraph text-[10px] text-white/40 uppercase tracking-widest border border-white/10">
                      Protocolo Alternativo
                    </span>
                  </div>

                  {/* Visitor Login */}
                  <Button
                    onClick={() => handleLogin('visitor')}
                    disabled={isLoading !== null}
                    variant="outline"
                    className="w-full h-14 bg-transparent hover:bg-secondary/10 text-secondary border border-secondary/50 hover:border-secondary font-heading text-base uppercase tracking-widest rounded-none transition-all duration-300 glitch-hover"
                  >
                    {isLoading === 'visitor' ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                        Iniciando Sessão...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <UserCircle className="w-5 h-5" />
                        Acesso Visitante
                      </span>
                    )}
                  </Button>

                  {/* Reset Bribery Level Button */}
                  {playerLevel > 1 && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-destructive to-orange-600 rounded opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                      <Button
                        onClick={() => setShowResetConfirm(true)}
                        className="relative w-full h-14 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50 hover:border-destructive font-heading text-base uppercase tracking-widest rounded-none transition-all duration-300"
                      >
                        <span className="flex items-center justify-center gap-3">
                          <RotateCcw className="w-5 h-5" />
                          Reiniciar Suborno (Nível {playerLevel})
                        </span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Warning message */}
                <div className="mt-8 p-4 border border-destructive/30 bg-destructive/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                  <p className="font-paragraph text-[10px] sm:text-xs text-foreground/70 leading-relaxed uppercase tracking-wider">
                    <span className="text-destructive font-bold mr-2">AVISO:</span>
                    Modo visitante não garante retenção de dados. Para salvar progresso e status no submundo, utilize autenticação oficial.
                  </p>
                </div>

              </div>
            </motion.div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setShowResetConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-destructive rounded-lg p-8 max-w-md w-full shadow-[0_0_40px_rgba(255,0,0,0.5)]"
                >
                  <h2 className="font-heading text-2xl text-destructive mb-4 text-center uppercase">
                    Confirmar Reset
                  </h2>
                  <p className="font-paragraph text-white/90 mb-6 text-center">
                    Tem certeza que deseja reiniciar o sistema de suborno para o nível 1? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50 font-heading uppercase"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleResetBribery}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-heading uppercase"
                    >
                      Confirmar Reset
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-8 text-center relative z-20"
            >
              <p className="font-paragraph text-[10px] text-foreground/40 uppercase tracking-widest hover:text-foreground/80 transition-colors cursor-pointer">
                Termos de Serviço // Política de Privacidade
              </p>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
