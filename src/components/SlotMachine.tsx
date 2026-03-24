import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useSpinVaultStore } from '@/store/spinVaultStore';
import { usePlayerStore } from '@/store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SLOT_ITEMS = [
  {
    id: 'pistol',
    name: 'Pistola',
    emoji: '🔫',
    image:
      'https://static.wixstatic.com/media/50f4bf_7ceb0938617b41bbb7a55bb15b81510b~mv2.png?originWidth=384&originHeight=384',
  },
  {
    id: 'money',
    name: 'Dinheiro',
    emoji: '💰',
    image:
      'https://static.wixstatic.com/media/50f4bf_c9d630f7a9084448858f4688d5fd2422~mv2.png?originWidth=384&originHeight=384',
  },
  {
    id: 'bank',
    name: 'Prédio de Banco',
    emoji: '🏢',
    image:
      'https://static.wixstatic.com/media/50f4bf_cdd14c9f000248668e089d213a781cc9~mv2.png?originWidth=384&originHeight=384',
  },
  {
    id: 'diamond',
    name: 'Diamante',
    emoji: '💎',
    image:
      'https://static.wixstatic.com/media/50f4bf_6def4b759743405d9569d1492b237a35~mv2.png?originWidth=384&originHeight=384',
  },
  {
    id: 'police',
    name: 'Viatura de Polícia',
    emoji: '🚔',
    image:
      'https://static.wixstatic.com/media/50f4bf_c23536e6564e4839a021f9beee0bf22c~mv2.png?originWidth=384&originHeight=384',
  },
];

const MULTIPLIER_OPTIONS = [1, 2, 5, 10];
const REEL_STOP_TIMES = [1600, 2200, 2800];

const TIER_STYLES = {
  dead: 'text-white/70',
  low: 'text-green-400',
  medium: 'text-yellow-300',
  high: 'text-orange-400',
  mega: 'text-fuchsia-400',
  prison: 'text-red-400',
};

type ResultTier = 'dead' | 'low' | 'medium' | 'high' | 'mega' | 'prison';

type SpinOutcome = {
  finalSlots: number[];
  moneyReward: number;
  multiplierReward: number;
  prison: boolean;
  resultMessage: string;
  tier: ResultTier;
};

interface AnimatedMoneyProps {
  amount: number;
  id: string;
  tier: ResultTier;
}

const rand = (max: number) => Math.floor(Math.random() * max);

function makeAnimatedId() {
  return `money-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function twoOf(kind: string, odd: string) {
  const ids = [kind, kind, odd];
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = rand(i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.map((id) => SLOT_ITEMS.findIndex((item) => item.id === id));
}

function generateOutcome(selectedMultiplier: number, currentMultiplier: number): SpinOutcome {
  const roll = Math.random();
  const effectiveMultiplier = Math.max(1, selectedMultiplier * currentMultiplier);

  if (roll < 0.02) {
    const reward = 5000 * effectiveMultiplier;
    return {
      finalSlots: [3, 3, 3],
      moneyReward: reward,
      multiplierReward: 2,
      prison: false,
      resultMessage: `💎 JACKPOT! +R$ ${reward.toLocaleString('pt-BR')} e +2x multiplicador`,
      tier: 'mega',
    };
  }

  if (roll < 0.07) {
    const reward = 2500 * effectiveMultiplier;
    return {
      finalSlots: [2, 2, 2],
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `🏢 GOLPE GRANDE! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: 'high',
    };
  }

  if (roll < 0.13) {
    const reward = 1800 * effectiveMultiplier;
    return {
      finalSlots: [0, 0, 0],
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `🔫 PRESSÃO ARMADA! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: 'high',
    };
  }

  if (roll < 0.19) {
    const reward = 1200 * effectiveMultiplier;
    return {
      finalSlots: [1, 1, 1],
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `💰 CAIXA CHEIA! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: 'high',
    };
  }

  if (roll < 0.24) {
    return {
      finalSlots: [4, 4, 4],
      moneyReward: 0,
      multiplierReward: 0,
      prison: true,
      resultMessage: '🚔 ENQUADRO! Você perdeu 30% do dinheiro sujo',
      tier: 'prison',
    };
  }

  if (roll < 0.34) {
    const reward = 600 * effectiveMultiplier;
    return {
      finalSlots: twoOf('money', 'diamond'),
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `💰 QUASE ESTOURO! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: 'medium',
    };
  }

  if (roll < 0.44) {
    const reward = 450 * effectiveMultiplier;
    return {
      finalSlots: twoOf('bank', 'money'),
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `🏢 CAIU BEM! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: 'medium',
    };
  }

  if (roll < 0.53) {
    return {
      finalSlots: twoOf('diamond', 'money'),
      moneyReward: 0,
      multiplierReward: 1,
      prison: false,
      resultMessage: '💎 MARÉ QUENTE! +1x multiplicador',
      tier: 'medium',
    };
  }

  if (roll < 0.7) {
    const moneyCount = 1 + rand(2);
    const reward = 100 * effectiveMultiplier * moneyCount;
    const base = Array.from({ length: 3 }, () => rand(SLOT_ITEMS.length));
    for (let i = 0; i < moneyCount; i += 1) base[i] = 1;
    return {
      finalSlots: base,
      moneyReward: reward,
      multiplierReward: 0,
      prison: false,
      resultMessage: `💵 CORRE NO ASFALTO! +R$ ${reward.toLocaleString('pt-BR')}`,
      tier: moneyCount === 2 ? 'medium' : 'low',
    };
  }

  if (roll < 0.82) {
    return {
      finalSlots: twoOf('police', 'money'),
      moneyReward: 0,
      multiplierReward: 0,
      prison: false,
      resultMessage: '🚔 Quase deu ruim... respira e gira de novo',
      tier: 'dead',
    };
  }

  return {
    finalSlots: [rand(SLOT_ITEMS.length), rand(SLOT_ITEMS.length), rand(SLOT_ITEMS.length)],
    moneyReward: 0,
    multiplierReward: 0,
    prison: false,
    resultMessage: 'Nada de prêmio... mas essa máquina tá quente',
    tier: 'dead',
  };
}

const AnimatedMoney: React.FC<AnimatedMoneyProps> = ({ amount, id, tier }) => {
  const size =
    tier === 'mega'
      ? 'text-5xl md:text-6xl'
      : tier === 'high'
        ? 'text-4xl md:text-5xl'
        : 'text-3xl md:text-4xl';

  const glow =
    tier === 'mega'
      ? '0 0 20px rgba(255,215,0,0.95),0 0 40px rgba(255,255,255,0.65)'
      : tier === 'high'
        ? '0 0 16px rgba(255,140,0,0.9)'
        : '0 0 12px rgba(76,175,80,0.85)';

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: -130, scale: 1.15 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      className={`fixed pointer-events-none font-heading font-black ${size}`}
      style={{
        left: '50%',
        top: '52%',
        transform: 'translate(-50%, -50%)',
        color: tier === 'mega' ? '#FFE082' : tier === 'high' ? '#FFA726' : '#4CAF50',
        textShadow: glow,
        zIndex: 1000,
      }}
    >
      +{amount.toLocaleString('pt-BR')}
    </motion.div>
  );
};

function SpinButton() {
  const { isSpinning, setIsSpinning } = useGameStore();
  const { spins, deductSpins } = useSpinVaultStore();
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);

  const handleSpin = () => {
    if (spins <= 0 || isSpinning) return;
    if (!deductSpins(selectedMultiplier)) return;
    setIsSpinning(true);
    window.dispatchEvent(
      new CustomEvent('spinSlots', { detail: { multiplier: selectedMultiplier } }),
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <div className="flex w-full flex-col items-center gap-3">
        <div className="text-secondary font-heading text-sm md:text-base">
          Multiplicador:{' '}
          <span className="font-bold text-lg text-logo-gradient-start">
            x{selectedMultiplier}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {MULTIPLIER_OPTIONS.map((mult) => (
            <button
              key={mult}
              onClick={() => setSelectedMultiplier(mult)}
              disabled={isSpinning}
              className={`rounded-lg px-4 py-2 font-heading font-bold transition-all duration-300 ${
                selectedMultiplier === mult
                  ? 'bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end text-white shadow-lg shadow-logo-gradient-start/50'
                  : 'border border-secondary/50 bg-white/10 text-secondary hover:bg-white/20'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              x{mult}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleSpin}
        disabled={isSpinning || spins <= 0}
        whileHover={isSpinning || spins <= 0 ? {} : { scale: 1.02, y: -2 }}
        whileTap={isSpinning || spins <= 0 ? {} : { scale: 0.98 }}
        className="w-full max-w-sm rounded-full bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end px-12 py-6 font-heading text-2xl font-black text-white shadow-xl shadow-logo-gradient-start/40 transition-all duration-500 md:max-w-lg md:text-3xl disabled:cursor-not-allowed disabled:opacity-40"
        style={{ filter: 'drop-shadow(0 0 22px rgba(255,69,0,0.85))' }}
      >
        {isSpinning ? 'GIRANDO...' : 'GIRAR'}
      </motion.button>

      {spins <= 0 && (
        <div className="animate-pulse text-center font-heading text-lg font-bold text-red-500 md:text-xl">
          SEM GIROS DISPONÍVEIS
        </div>
      )}
    </div>
  );
}

function SlotsDisplay() {
  const {
    dirtMoney,
    multiplier,
    setDirtMoney,
    setMultiplier,
    setIsSpinning,
  } = useGameStore();

  const { dirtyMoney, setDirtyMoney } = useDirtyMoneyStore();
  const [slots, setSlots] = useState([0, 1, 2]);
  const [spinningIndices, setSpinningIndices] = useState([false, false, false]);
  const [resultMessage, setResultMessage] = useState('');
  const [resultTier, setResultTier] = useState<ResultTier>('dead');
  const [showPrisonModal, setShowPrisonModal] = useState(false);
  const [animatedMoneys, setAnimatedMoneys] = useState<
    { id: string; amount: number; tier: ResultTier }[]
  >([]);
  const [machinePulse, setMachinePulse] = useState<ResultTier>('dead');

  const intervalsRef = useRef<Array<ReturnType<typeof setInterval> | null>>([
    null,
    null,
    null,
  ]);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout> | null>>([]);

  const currentFrameGlow = useMemo(() => {
    if (machinePulse === 'mega')
      return 'shadow-[0_0_45px_rgba(255,215,0,0.55)] border-yellow-300';
    if (machinePulse === 'high')
      return 'shadow-[0_0_35px_rgba(255,140,0,0.45)] border-orange-400';
    if (machinePulse === 'medium')
      return 'shadow-[0_0_28px_rgba(255,105,180,0.32)] border-fuchsia-400';
    if (machinePulse === 'prison')
      return 'shadow-[0_0_28px_rgba(255,0,0,0.4)] border-red-500';
    return 'shadow-[0_0_18px_rgba(255,255,255,0.12)] border-secondary';
  }, [machinePulse]);

  useEffect(() => {
    const stopAllTimers = () => {
      intervalsRef.current.forEach((interval) => interval && clearInterval(interval));
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      intervalsRef.current = [null, null, null];
      timeoutsRef.current = [];
    };

    const showMoney = (amount: number, tier: ResultTier) => {
      const id = makeAnimatedId();
      setAnimatedMoneys((prev) => [...prev, { id, amount, tier }]);
      const timeout = setTimeout(() => {
        setAnimatedMoneys((prev) => prev.filter((m) => m.id !== id));
      }, 1800);
      timeoutsRef.current.push(timeout);
    };

    const handleSpinEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const selectedMultiplier = customEvent.detail?.multiplier || 1;
      const outcome = generateOutcome(selectedMultiplier, multiplier);
      const tempSlots = [0, 1, 2];

      setResultMessage('');
      setResultTier('dead');
      setMachinePulse('dead');
      setSpinningIndices([true, true, true]);

      stopAllTimers();

      intervalsRef.current = [0, 1, 2].map((index) =>
        setInterval(() => {
          tempSlots[index] = rand(SLOT_ITEMS.length);
          setSlots([...tempSlots]);
        }, 70 + index * 18),
      );

      REEL_STOP_TIMES.forEach((time, index) => {
        const timeout = setTimeout(() => {
          const interval = intervalsRef.current[index];
          if (interval) {
            clearInterval(interval);
            intervalsRef.current[index] = null;
          }

          tempSlots[index] = outcome.finalSlots[index];
          setSlots([...tempSlots]);
          setSpinningIndices((prev) => prev.map((value, i) => (i === index ? false : value)));

          if (index === 2) {
            setResultMessage(outcome.resultMessage);
            setResultTier(outcome.tier);
            setMachinePulse(outcome.tier);

            const currentDirty = Math.max(dirtMoney, dirtyMoney);

            if (outcome.prison) {
              const lostMoney = Math.floor(currentDirty * 0.3);
              const nextDirty = Math.max(0, currentDirty - lostMoney);
              setDirtMoney(nextDirty);
              setDirtyMoney(nextDirty);
              setShowPrisonModal(true);
            } else {
              if (outcome.moneyReward > 0) {
                const nextDirty = currentDirty + outcome.moneyReward;
                setDirtMoney(nextDirty);
                setDirtyMoney(nextDirty);
                showMoney(outcome.moneyReward, outcome.tier);
              }

              if (outcome.multiplierReward > 0) {
                setMultiplier(multiplier + outcome.multiplierReward);
              }
            }

            const finishTimeout = setTimeout(() => {
              setIsSpinning(false);
            }, 350);
            timeoutsRef.current.push(finishTimeout);
          }
        }, time);

        timeoutsRef.current.push(timeout);
      });
    };

    window.addEventListener('spinSlots', handleSpinEvent);
    return () => {
      stopAllTimers();
      window.removeEventListener('spinSlots', handleSpinEvent);
    };
  }, [
    multiplier,
    dirtMoney,
    dirtyMoney,
    setDirtMoney,
    setDirtyMoney,
    setMultiplier,
    setIsSpinning,
  ]);

  return (
    <motion.div
      animate={
        machinePulse === 'mega'
          ? { scale: [1, 1.02, 1], rotate: [0, 0.4, -0.4, 0] }
          : machinePulse === 'high'
            ? { scale: [1, 1.01, 1], x: [0, 2, -2, 0] }
            : machinePulse === 'prison'
              ? { x: [0, 4, -4, 2, -2, 0] }
              : {}
      }
      transition={{ duration: 0.45 }}
      className={`relative rounded-[26px] border-2 bg-gradient-to-b from-gray-950 via-black to-black p-4 shadow-2xl ${currentFrameGlow}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(255,69,0,0.08),transparent_40%)]" />

      <AnimatePresence>
        {animatedMoneys.map((money) => (
          <AnimatedMoney
            key={money.id}
            amount={money.amount}
            id={money.id}
            tier={money.tier}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 mb-3 flex items-center justify-between px-2">
        <div className="font-heading text-xs uppercase tracking-[0.35em] text-white/65 md:text-sm">
          Giro no Asfalto
        </div>
        <div className="font-heading text-xs uppercase tracking-[0.28em] text-logo-gradient-start md:text-sm">
          x{multiplier} ativo
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
        {slots.map((slotIndex, position) => (
          <motion.div
            key={position}
            className="relative flex h-40 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-b from-gray-800 to-black shadow-inner md:h-48 md:w-36"
            animate={
              spinningIndices[position]
                ? { y: [0, -8, 0], filter: ['brightness(1)', 'brightness(1.18)', 'brightness(1)'] }
                : {}
            }
            transition={spinningIndices[position] ? { duration: 0.12, repeat: Infinity } : {}}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,69,0,0.08),transparent_45%)]" />
            <Image
              src={SLOT_ITEMS[slotIndex].image}
              alt={SLOT_ITEMS[slotIndex].name}
              width={108}
              height={108}
              className="relative z-10 object-contain brightness-125 contrast-125 drop-shadow-[0_0_14px_rgba(255,255,255,0.28)]"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mt-4 flex justify-center gap-3 font-heading text-secondary md:gap-4">
        {slots.map((slotIndex, position) => (
          <div
            key={position}
            className="w-28 truncate text-center text-[11px] uppercase tracking-[0.14em] md:w-36 md:text-xs"
          >
            {SLOT_ITEMS[slotIndex].name}
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-5 min-h-[28px] text-center font-heading text-sm md:text-base">
        <span className={TIER_STYLES[resultTier]}>{resultMessage}</span>
      </div>

      {showPrisonModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPrisonModal(false)}
        >
          <motion.div
            className="max-w-md rounded-[24px] border-4 border-red-500 bg-gradient-to-b from-red-900 via-black to-black p-8 text-center"
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180 }}
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,0,0,0.8))' }}
          >
            <div className="mb-4 text-6xl animate-pulse">🚔</div>
            <h2 className="mb-2 font-heading text-3xl font-black text-red-400">
              ENQUADRO
            </h2>
            <p className="mb-4 font-paragraph text-white">A polícia te pegou no corre.</p>
            <p className="mb-6 font-paragraph text-red-200">
              30% do dinheiro sujo foi embora.
            </p>
            <button
              onClick={() => setShowPrisonModal(false)}
              className="rounded-xl bg-red-600 px-6 py-3 font-heading font-black text-white transition-all hover:bg-red-700"
            >
              FECHAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default
