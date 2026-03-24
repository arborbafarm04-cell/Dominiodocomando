import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, Facebook, UserCircle2, ShieldAlert, Radio, Siren, CircleAlert } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';
import { useNavigate } from 'react-router-dom';

type IntroStage = 0 | 1 | 2 | 3;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [stage, setStage] = useState<IntroStage>(0);
  const [systemTime, setSystemTime] = useState('');
  const [glitchKey, setGlitchKey] = useState(0);

  const { actions, member } = useMember();
  const navigate = useNavigate();
  const { setPlayerId, setPlayerName, setIsGuest, setLevel } = usePlayerStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} BRT`,
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alreadyLogged = localStorage.getItem('playerLoggedIn') === 'true';
    const seenIntro = localStorage.getItem('hasSeenHomeIntro') === 'true';

    if (alreadyLogged) {
      navigate('/star-map');
      return;
    }

    if (seenIntro) {
      setIntroFinished(true);
      setShowIntro(false);
    } else {
      setShowIntro(true);
      setIntroFinished(false);
      setStage(0);
    }
  }, [navigate]);

  useEffect(() => {
    if (!showIntro) return;

    const t1 = setTimeout(() => setStage(1), 900);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4700);
    const glitchLoop = setInterval(() => setGlitchKey((k) => k + 1), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(glitchLoop);
    };
  }, [showIntro]);

  useEffect(() => {
    if (!member) return;

    const memberNickname =
      member.profile?.nickname ||
      member.contact?.firstName ||
      member.loginEmail?.split('@')[0] ||
      'COMANDANTE';

    setPlayerName(memberNickname);
    setPlayerId(member._id || '');
    setIsGuest(false);
    setLevel(1);

    localStorage.setItem('playerLoggedIn', 'true');
    localStorage.setItem('playerName', memberNickname);
    localStorage.setItem('memberId', member._id || '');
    localStorage.setItem('isGuest', 'false');

    savePlayerData(member._id || '', memberNickname, false).finally(() => {
      navigate('/star-map');
    });
  }, [member, navigate, setIsGuest, setLevel, setPlayerId, setPlayerName]);

  const savePlayerData = async (memberId: string, playerNameValue: string, isGuest = false) => {
    try {
      const existingPlayers = await BaseCrudService.getAll<any>('players');
      const existingPlayer = existingPlayers.items?.find((p: any) => p.memberId === memberId);

      if (existingPlayer) {
        await BaseCrudService.update('players', {
          _id: existingPlayer._id,
          memberId,
          playerName: playerNameValue,
          lastSeen: new Date().toISOString(),
          isOnline: true,
          isGuest,
        });
      } else {
        await BaseCrudService.create('players', {
          _id: crypto.randomUUID(),
          memberId,
          playerName: playerNameValue,
          cleanMoney: 0,
          dirtyMoney: 0,
          level: 1,
          progress: 0,
          isGuest,
          isOnline: true,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
    }
  };

  const finishIntro = () => {
    localStorage.setItem('hasSeenHomeIntro', 'true');
    setShowIntro(false);
    setTimeout(() => setIntroFinished(true), 250);
  };

  const handleMemberLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(provider);
      await actions.login();
    } catch (error) {
      console.error(`Falha no login ${provider}:`, error);
      setIsLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading('guest');

      const guestName = `CONVIDADO_${Math.floor(Math.random() * 999999)}`;
      const guestId = `guest_${crypto.randomUUID()}`;

      setPlayerName(guestName);
      setPlayerId(guestId);
      setIsGuest(true);
      setLevel(1);

      localStorage.setItem('playerLoggedIn', 'true');
      localStorage.setItem('playerName', guestName);
      localStorage.setItem('memberId', guestId);
      localStorage.setItem('isGuest', 'true');

      await savePlayerData(guestId, guestName, true);
      navigate('/star-map');
    } catch (error) {
      console.error('Falha no login visitante:', error);
      setIsLoading(null);
    }
  };

  const stageText = useMemo(() => {
    if (stage === 0) return 'SINAL INTERCEPTADO';
    if (stage === 1) return 'RIO DE JANEIRO // SÃO PAULO';
    if (stage === 2) return 'OSTENTAÇÃO, GUERRA, DOMÍNIO';
    return 'O COMANDO ESTÁ ABERTO';
  }, [stage]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-yellow-500 selection:text-black">
      <style>{`
        .crt-lines {
          background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.18) 100%);
          background-size: 100% 4px;
        }
        .gold-edge {
          box-shadow:
            0 0 0 1px rgba(212,175,55,0.14),
            0 0 28px rgba(212,175,55,0.14),
            inset 0 0 18px rgba(212,175,55,0.06);
        }
        .glass-heavy {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .logo-shadow {
          text-shadow:
            0 0 12px rgba(212,175,55,0.25),
            0 0 30px rgba(212,175,55,0.55),
            0 0 60px rgba(255,60,0,0.18);
        }
        .red-shadow {
          text-shadow:
            0 0 14px rgba(255,0,0,0.35),
            0 0 30px rgba(255,70,0,0.5);
        }
      `}</style>

      <div className="fixed inset-0 z-0">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_6d38f59b693c45f78b1d3c8d16ab413b~mv2.png"
          alt="Cidade criminosa"
          className="h-full w-full object-cover object-center"
          width={1920}
        />

        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,0,0,0.14),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(255,190,0,0.14),transparent_24%),radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.04),transparent_26%)]" />
        <div className="absolute inset-0 crt-lines opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        <motion.div
          className="absolute -left-1/4 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
          animate={{ x: ['-10%', '220%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            background:
              'radial-gradient(circle at 10% 70%, rgba(255,0,0,0.2), transparent 20%), radial-gradient(circle at 82% 16%, rgba(255,215,0,0.16), transparent 18%)',
          }}
        />
      </div>

      <div className="fixed inset-0 z-10 pointer-events-none p-5 md:p-7 flex flex-col justify-between">
        <div className="flex items-start justify-between text-[10px] md:text-xs uppercase tracking-[0.24em] text-white/55">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-red-500" />
              Sistema monitorado
            </div>
            <div>Origem // Brasil // Rio_SP</div>
          </div>
          <div className="space-y-1 text-right">
            <div>{systemTime}</div>
            <div className="flex items-center justify-end gap-2 text-red-500">
              <Siren className="h-3.5 w-3.5" />
              Vigilância ativa
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between text-[10px] md:text-xs uppercase tracking-[0.24em] text-white/28">
          <span>Domcomando // acesso multiplayer</span>
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            sessão persistente
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.06),transparent_35%)]" />
              <motion.div
                key={glitchKey}
                initial={{ opacity: 0.05 }}
                animate={{ opacity: [0.04, 0.1, 0.03] }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"
              />
            </div>

            <div className="relative max-w-5xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.p
                  className="mb-6 text-[11px] md:text-sm uppercase tracking-[0.5em] text-white/45"
                  key={stageText}
                  initial={{ opacity: 0, letterSpacing: '0.8em' }}
                  animate={{ opacity: 1, letterSpacing: '0.45em' }}
                  transition={{ duration: 0.6 }}
                >
                  {stageText}
                </motion.p>

                <motion.h1
                  className="logo-shadow text-5xl md:text-8xl font-black uppercase tracking-[0.22em] text-yellow-400"
                  animate={{
                    textShadow: [
                      '0 0 14px rgba(212,175,55,0.24),0 0 30px rgba(212,175,55,0.55)',
                      '0 0 18px rgba(212,175,55,0.45),0 0 48px rgba(212,175,55,0.9)',
                      '0 0 14px rgba(212,175,55,0.24),0 0 30px rgba(212,175,55,0.55)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  DOMÍNIO
                </motion.h1>

                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.8 }}
                  className="red-shadow mt-3 text-3xl md:text-6xl font-black uppercase tracking-[0.26em] text-red-500"
                >
                  DO COMANDO
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.9 }}
                  className="mx-auto mt-10 max-w-3xl"
                >
                  <p className="text-sm md:text-lg uppercase tracking-[0.26em] text-white/70">
                    Favela. Ostentação. Carros. Tiros. Polícia. Perseguição.
                  </p>
                  <p className="mt-4 text-xs md:text-sm uppercase tracking-[0.28em] text-white/38">
                    Quem controla o complexo, controla a cidade.
                  </p>
                </motion.div>

                <motion.button
                  onClick={finishIntro}
                  whileHover={{ scale: 1.035, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="gold-edge mt-14 rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-700 via-yellow-500 to-orange-600 px-10 py-4 md:px-14 md:py-5 text-sm md:text-base font-black uppercase tracking-[0.26em] text-black"
                >
                  Acessar operação
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {introFinished && (
        <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[680px]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-yellow-500/10 blur-[120px]" />

            <div className="glass-heavy gold-edge relative overflow-hidden rounded-[32px] border border-yellow-500/28 bg-black/62 p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.08),transparent_35%),radial-gradient(circle_at_100%_40%,rgba(255,0,0,0.06),transparent_28%)]" />

              <div className="relative z-10">
                <div className="text-center">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-white/42">
                    Acesso ao sistema
                  </p>
                  <h1 className="logo-shadow mt-4 text-3xl md:text-5xl font-black uppercase tracking-[0.18em] text-yellow-400">
                    DOMÍNIO DO COMANDO
                  </h1>
                  <p className="mt-5 text-xs md:text-sm uppercase tracking-[0.24em] text-white/50">
                    Escolha sua entrada. O complexo está esperando.
                  </p>
                </div>

                <div className="mt-10 grid gap-4">
                  <motion.button
                    whileHover={{ scale: 1.012, x: 2 }}
                    whileTap={{ scale: 0.988 }}
                    onClick={() => handleMemberLogin('google')}
                    disabled={!!isLoading}
                    className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-white transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />
                    <Chrome className="h-5 w-5" />
                    <span className="font-black uppercase tracking-[0.18em]">
                      {isLoading === 'google' ? 'Conectando...' : 'Entrar com Google'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.012, x: 2 }}
                    whileTap={{ scale: 0.988 }}
                    onClick={() => handleMemberLogin('facebook')}
                    disabled={!!isLoading}
                    className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-blue-500/25 bg-blue-500/10 px-6 py-5 text-white transition-all hover:bg-blue-500/18 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />
                    <Facebook className="h-5 w-5" />
                    <span className="font-black uppercase tracking-[0.18em]">
                      {isLoading === 'facebook' ? 'Conectando...' : 'Entrar com Facebook'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.012, x: 2 }}
                    whileTap={{ scale: 0.988 }}
                    onClick={handleGuestLogin}
                    disabled={!!isLoading}
                    className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-red-500/25 bg-red-500/10 px-6 py-5 text-white transition-all hover:bg-red-500/18 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />
                    <UserCircle2 className="h-5 w-5" />
                    <span className="font-black uppercase tracking-[0.18em]">
                      {isLoading === 'guest' ? 'Entrando...' : 'Entrar como Visitante'}
                    </span>
                  </motion.button>
                </div>

                <div className="mt-8 rounded-2xl border border-yellow-500/18 bg-yellow-500/6 px-5 py-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-400/90">
                    <CircleAlert className="h-4 w-4" />
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] text-center">
                      Sessão salva no dispositivo. Depois do primeiro acesso, entra direto no jogo até logout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
            }
