// 🔥 SLOT MACHINE AAA - GIRO NO ASFALTO

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { executeSpinOperation } from '@/services/spinService';
import { Players } from '@/entities';

// =======================
// 🎯 CONFIG
// =======================

type SymbolType = '💎' | '💵' | '🔫' | '🚔';

const SYMBOLS: SymbolType[] = ['💎', '💵', '🔫', '🚔'];

const MULTIPLIERS = [1, 2, 5, 10, 50, 100];

const getRandomSymbol = (): SymbolType =>
  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const generateOutcome = (): SymbolType[] => {
  const r = Math.random();

  if (r < 0.04) return ['💎', '💎', '💎']; // JACKPOT
  if (r < 0.12) return ['🚔', '🚔', '🚔']; // PRISÃO
  if (r < 0.30) return ['💵', '💵', '💵'];
  if (r < 0.50) return ['🔫', '🔫', '🔫'];

  return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
};

interface SpinResponse {
  type: 'jackpot' | 'money' | 'attack' | 'prison' | 'none';
  amount: number;
  updatedPlayer: Players;
}

// =======================
// 🎰 COMPONENT
// =======================

export default function SlotMachine() {
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [reels, setReels] = useState<SymbolType[]>(['💎', '💎', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [jackpot, setJackpot] = useState(10000);
  const [history, setHistory] = useState<string[]>([]);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [particles, setParticles] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particlesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerId = player?._id;
  const spins = player?.spins ?? 0;
  const dirtyMoney = player?.dirtyMoney ?? 0;

  // =======================
  // 🧹 CLEANUP
  // =======================

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (particlesTimeoutRef.current) clearTimeout(particlesTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  // =======================
  // 🎯 SPIN
  // =======================

  const spin = async () => {
    if (spinning) return;

    if (!playerId) {
      setError('Jogador não carregado.');
      return;
    }

    if (spins <= 0) {
      setError('Sem giros disponíveis.');
      return;
    }

    setError('');
    setSpinning(true);
    setMessage('');
    setShowWin(false);

    const speed = turbo ? 50 : 100;
    const duration = turbo ? 1000 : 2000;

    intervalRef.current = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, speed);

    timeoutRef.current = setTimeout(async () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      const outcome = generateOutcome();
      setReels(outcome);

      try {
        const res = (await executeSpinOperation(
          playerId,
          outcome,
          multiplier
        )) as SpinResponse;

        setError('');

        let msg = '';

        if (res.type === 'jackpot') {
          msg = `💎 JACKPOT +${res.amount.toLocaleString('pt-BR')}`;
          setJackpot((j) => j + 500);
          setParticles(true);
          setShake(true);
        } else if (res.type === 'money') {
          msg = `💵 +${res.amount.toLocaleString('pt-BR')}`;
        } else if (res.type === 'attack') {
          msg = `🔫 Ataque +${res.amount.toLocaleString('pt-BR')}`;
        } else if (res.type === 'prison') {
          msg = '🚔 ENQUADROU';
          setShake(true);
        } else {
          msg = 'Nada dessa vez...';
        }

        if (res.updatedPlayer) {
          setPlayer(res.updatedPlayer);
        }

        setHistory((h) => [msg, ...h.slice(0, 9)]);
        setMessage(msg);
        setShowWin(true);

        if (particlesTimeoutRef.current) clearTimeout(particlesTimeoutRef.current);
        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);

        particlesTimeoutRef.current = setTimeout(() => setParticles(false), 1000);
        shakeTimeoutRef.current = setTimeout(() => setShake(false), 500);
      } catch (err: any) {
        console.error('Erro no spin:', err);
        setError(err?.message || 'Erro ao girar a máquina.');
        setMessage('');
      } finally {
        setSpinning(false);
      }
    }, duration);
  };

  // =======================
  // 🔁 AUTO SPIN
  // =======================

  useEffect(() => {
    if (!autoSpin) return;
    if (spinning) return;
    if (!playerId) return;
    if (spins <= 0) return;

    const t = setTimeout(() => {
      spin();
    }, 300);

    return () => clearTimeout(t);
  }, [autoSpin, spinning, playerId, spins]);

  // =======================
  // 🎨 UI
  // =======================

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-black rounded-2xl border border-yellow-500 shadow-[0_0_40px_rgba(255,215,0,0.4)] relative overflow-hidden">
      <div className="text-center text-yellow-300 text-xl font-bold mb-2 animate-pulse">
        💰 JACKPOT: {jackpot.toLocaleString('pt-BR')}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-yellow-700 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400 uppercase">Giros</div>
          <div className="text-cyan-400 font-bold text-xl">{spins}</div>
        </div>
        <div className="bg-zinc-900 border border-yellow-700 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400 uppercase">Dinheiro Sujo</div>
          <div className="text-green-400 font-bold text-xl">
            {dirtyMoney.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      <motion.div
        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
        className="flex justify-center gap-3 mb-6"
      >
        {reels.map((s, i) => (
          <motion.div
            key={i}
            animate={{ y: spinning ? [0, -30, 30, 0] : 0 }}
            transition={{ repeat: spinning ? Infinity : 0, duration: 0.2 }}
            className="w-20 h-20 flex items-center justify-center text-4xl bg-gray-900 border-2 border-yellow-400 rounded-lg shadow-[0_0_15px_gold]"
          >
            {s}
          </motion.div>
        ))}
      </motion.div>

      <div className="mb-4">
        <div className="text-yellow-300 text-sm mb-2 text-center">Multiplicador</div>
        <div className="flex flex-wrap justify-center gap-2">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => setMultiplier(m)}
              disabled={spinning}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                multiplier === m
                  ? 'bg-yellow-500 text-black'
                  : 'bg-zinc-800 text-white border border-yellow-700'
              } disabled:opacity-50`}
            >
              x{m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={spin}
          disabled={spinning || spins <= 0 || !playerId}
          className="py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
        >
          {spinning ? 'GIRANDO...' : '🎰 GIRAR'}
        </button>

        <button
          onClick={() => setAutoSpin(!autoSpin)}
          className="py-2 bg-purple-600 text-white rounded-lg"
        >
          {autoSpin ? '⛔ AUTO OFF' : '🔁 AUTO SPIN'}
        </button>

        <button
          onClick={() => setTurbo(!turbo)}
          className="py-2 bg-red-600 text-white rounded-lg"
        >
          {turbo ? '🐢 TURBO OFF' : '⚡ TURBO'}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-red-400 text-sm font-bold"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: showWin ? 1.1 : 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-white text-lg font-bold"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {particles && (
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center text-yellow-400 text-3xl animate-ping">
          ✨✨✨
        </div>
      )}

      <div className="mt-6 bg-black/70 p-3 rounded-lg border border-yellow-700">
        <div className="text-yellow-300 text-sm mb-2">Histórico</div>
        {history.length === 0 ? (
          <div className="text-zinc-500 text-xs">Nenhum giro ainda.</div>
        ) : (
          history.map((h, i) => (
            <div key={i} className="text-white text-xs">
              {h}
            </div>
          ))
        )}
      </div>
    </div>
  );
}