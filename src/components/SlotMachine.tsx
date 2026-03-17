import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SLOT_ITEMS = [
  {
    id: 'pistol',
    name: 'Pistola',
    emoji: '🔫',
    image: 'https://static.wixstatic.com/media/50f4bf_7ceb0938617b41bbb7a55bb15b81510b~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'money',
    name: 'Dinheiro',
    emoji: '💰',
    image: 'https://static.wixstatic.com/media/50f4bf_c9d630f7a9084448858f4688d5fd2422~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'bank',
    name: 'Prédio de Banco',
    emoji: '🏢',
    image: 'https://static.wixstatic.com/media/50f4bf_cdd14c9f000248668e089d213a781cc9~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'diamond',
    name: 'Diamante',
    emoji: '💎',
    image: 'https://static.wixstatic.com/media/50f4bf_6def4b759743405d9569d1492b237a35~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'police',
    name: 'Viatura de Polícia',
    emoji: '🚔',
    image: 'https://static.wixstatic.com/media/50f4bf_c23536e6564e4839a021f9beee0bf22c~mv2.png?originWidth=384&originHeight=384'
  }
];

const MULTIPLIER_OPTIONS = [1, 2, 5, 10];

// Animated Money Display Component
interface AnimatedMoneyProps {
  amount: number;
  id: string;
}

const AnimatedMoney: React.FC<AnimatedMoneyProps> = ({ amount, id }) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -150, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="fixed pointer-events-none font-heading font-bold text-3xl md:text-4xl"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#4CAF50',
        textShadow: '0 0 10px rgba(76, 175, 80, 0.8)',
        zIndex: 1000,
      }}
    >
      +{amount}
    </motion.div>
  );
};

// Spin Button Component - Independent
function SpinButton() {
  const { spins, isSpinning, setIsSpinning, subtractSpins } = useGameStore();
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  const handleSpin = async () => {
    if (spins <= 0 || isSpinning) return;

    setIsSpinning(true);
    subtractSpins(1);

    // Emit custom event for slots to spin
    window.dispatchEvent(new CustomEvent('spinSlots', { detail: { multiplier: selectedMultiplier } }));

    // Reset spinning state after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {/* Multiplier Controls */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="text-secondary font-heading text-sm md:text-base">Multiplicador: <span className="text-logo-gradient-start font-bold text-lg">x{selectedMultiplier}</span></div>
        <div className="flex gap-2 flex-wrap justify-center">
          {MULTIPLIER_OPTIONS.map((mult) => (
            <button
              key={mult}
              onClick={() => setSelectedMultiplier(mult)}
              disabled={isSpinning}
              className={`px-4 py-2 font-heading font-bold rounded-lg transition-all duration-300 ${
                selectedMultiplier === mult
                  ? 'bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end text-white shadow-lg shadow-logo-gradient-start/50'
                  : 'bg-white/10 text-secondary hover:bg-white/20 border border-secondary/50'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              x{mult}
            </button>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || spins <= 0}
        className="w-full max-w-sm md:max-w-lg px-12 py-6 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end text-white font-heading text-2xl md:text-3xl font-bold rounded-full hover:brightness-125 transition-all duration-500 ease-out disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-logo-gradient-start/40 transform hover:-translate-y-1 active:translate-y-0"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255,69,0,0.8))'
        }}
      >
        {isSpinning ? 'GIRANDO...' : 'GIRAR'}
      </button>

      {spins <= 0 && (
        <div className="text-center text-red-500 font-heading font-bold text-lg md:text-xl animate-pulse">
          SEM GIROS DISPONÍVEIS
        </div>
      )}
    </div>
  );
}

// Slots Display Component - Independent
function SlotsDisplay() {
  const { dirtMoney, multiplier, setDirtMoney, setMultiplier, addDirtMoney } = useGameStore();
  const { addDirtyMoney } = useDirtyMoneyStore();
  const [slots, setSlots] = useState<number[]>([0, 1, 2]);
  const [spinningIndices, setSpinningIndices] = useState<boolean[]>([false, false, false]);
  const [resultMessage, setResultMessage] = useState('');
  const [showPrisonModal, setShowPrisonModal] = useState(false);
  const [animatedMoneys, setAnimatedMoneys] = useState<{ id: string; amount: number }[]>([]);

  useEffect(() => {
    const handleSpinEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const multiplierValue = customEvent.detail?.multiplier || 1;

      setSpinningIndices([true, true, true]);
      setResultMessage('');

      // Animate spinning
      const spinDuration = 0.5;
      const spinInterval = setInterval(() => {
        setSlots([
          Math.floor(Math.random() * SLOT_ITEMS.length),
          Math.floor(Math.random() * SLOT_ITEMS.length),
          Math.floor(Math.random() * SLOT_ITEMS.length)
        ]);
      }, 50);

      setTimeout(() => {
        clearInterval(spinInterval);

        // Generate final result
        const finalSlots = [
          Math.floor(Math.random() * SLOT_ITEMS.length),
          Math.floor(Math.random() * SLOT_ITEMS.length),
          Math.floor(Math.random() * SLOT_ITEMS.length)
        ];
        setSlots(finalSlots);
        setSpinningIndices([false, false, false]);

        // Check results
        const slotIds = finalSlots.map(i => SLOT_ITEMS[i].id);
        const allSame = slotIds[0] === slotIds[1] && slotIds[1] === slotIds[2];

        if (allSame && slotIds[0] === 'police') {
          // Prison - lose 30% of money
          const lostMoney = Math.floor(dirtMoney * 0.3);
          setDirtMoney(Math.max(0, dirtMoney - lostMoney));
          setShowPrisonModal(true);
          setResultMessage(`🚔 PRESO! Perdeu R$ ${lostMoney}`);
        } else if (allSame) {
          // Three of a kind bonus
          if (slotIds[0] === 'diamond') {
            setMultiplier(multiplier + 1);
            setResultMessage(`💎 BÔNUS! +1x multiplicador (agora ${multiplier + 1}x)`);
          } else if (slotIds[0] === 'pistol') {
            const bonus = 1000 * multiplierValue;
            addDirtMoney(bonus);
            addDirtyMoney(bonus);
            setResultMessage(`🔫 BÔNUS! +R$ ${bonus}`);
            // Add animated money
            const moneyId = `money-${Date.now()}`;
            setAnimatedMoneys(prev => [...prev, { id: moneyId, amount: bonus }]);
            setTimeout(() => {
              setAnimatedMoneys(prev => prev.filter(m => m.id !== moneyId));
            }, 2000);
          } else if (slotIds[0] === 'bank') {
            const bonus = 500;
            addDirtMoney(bonus);
            addDirtyMoney(bonus);
            setResultMessage(`🏢 BÔNUS! +R$ ${bonus}`);
            // Add animated money
            const moneyId = `money-${Date.now()}`;
            setAnimatedMoneys(prev => [...prev, { id: moneyId, amount: bonus }]);
            setTimeout(() => {
              setAnimatedMoneys(prev => prev.filter(m => m.id !== moneyId));
            }, 2000);
          }
        } else {
          // Regular money from 💰
          const moneyCount = slotIds.filter(id => id === 'money').length;
          if (moneyCount > 0) {
            const earned = 100 * multiplierValue * moneyCount;
            addDirtMoney(earned);
            addDirtyMoney(earned);
            setResultMessage(`💰 Ganhou R$ ${earned}`);
            // Add animated money
            const moneyId = `money-${Date.now()}`;
            setAnimatedMoneys(prev => [...prev, { id: moneyId, amount: earned }]);
            setTimeout(() => {
              setAnimatedMoneys(prev => prev.filter(m => m.id !== moneyId));
            }, 2000);
          } else {
            setResultMessage('Nenhum prêmio');
          }
        }
      }, spinDuration * 1000);
    };

    window.addEventListener('spinSlots', handleSpinEvent);
    return () => window.removeEventListener('spinSlots', handleSpinEvent);
  }, [dirtMoney, multiplier, setDirtMoney, setMultiplier, addDirtMoney]);

  return (
    <div className="from-gray-900 to-black border-secondary rounded-lg p-3 shadow-2xl border border-none bg-transparent relative">
      {/* Animated Money Display */}
      <AnimatePresence>
        {animatedMoneys.map(money => (
          <AnimatedMoney key={money.id} amount={money.amount} id={money.id} />
        ))}
      </AnimatePresence>

      {/* Slot Item Labels */}
      {/* Slot Display */}
      <div className="flex gap-3 justify-center items-center">
        {slots.map((slotIndex, position) => (
          <motion.div
            key={position}
            className="w-32 h-40 bg-gradient-to-b from-gray-800 to-black border-2 border-secondary rounded-lg flex items-center justify-center overflow-hidden shadow-inner"
            animate={spinningIndices[position] ? { y: [0, -10, 0] } : {}}
            transition={spinningIndices[position] ? { duration: 0.1, repeat: Infinity } : {}}
          >
            <Image
              src={SLOT_ITEMS[slotIndex].image}
              alt={SLOT_ITEMS[slotIndex].name}
              width={100}
              height={100}
              className="object-contain brightness-125 contrast-125 shadow-[inset_10px_10px_4px_0px_#bfbfbf] opacity-[1] border-[#0f141ed9] rounded-none border border-none m-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-4 text-secondary text-sm font-heading">
        {slots.map((slotIndex, position) => (
          <div key={position} className="w-28 text-center truncate text-xs">
            {SLOT_ITEMS[slotIndex].name}
          </div>
        ))}
      </div>
      {/* Result Message */}
      {resultMessage && (
        <div className="text-center mt-4 text-secondary font-heading text-sm">
          {resultMessage}
        </div>
      )}
      {/* Prison Modal */}
      {showPrisonModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPrisonModal(false)}
        >
          <motion.div
            className="bg-gradient-to-b from-red-900 to-black border-4 border-red-500 rounded-lg p-8 text-center max-w-md"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255,0,0,0.8))'
            }}
          >
            <div className="text-6xl mb-4 animate-pulse">🚔</div>
            <h2 className="text-3xl font-heading font-bold text-red-500 mb-2">PRESO!</h2>
            <p className="text-white font-paragraph mb-4">Você foi preso pela polícia!</p>
            <p className="text-red-300 font-paragraph mb-6">Perdeu 30% do seu dinheiro sujo</p>
            <button
              onClick={() => setShowPrisonModal(false)}
              className="px-6 py-2 bg-red-600 text-white font-heading font-bold rounded hover:bg-red-700 transition-all"
            >
              FECHAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function SlotMachine() {
  const { hasInitialized, setSpins, setDirtMoney, setMultiplier, setHasInitialized } = useGameStore();

  // Initialize game on first load
  useEffect(() => {
    if (!hasInitialized) {
      setSpins(1000);
      setDirtMoney(0);
      setMultiplier(1);
      setHasInitialized(true);
    }
  }, [hasInitialized, setSpins, setDirtMoney, setMultiplier, setHasInitialized]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Spin Button - Independent */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 translate-y-[62.5%] w-full max-w-3xl pt-8 px-6 md:px-12 flex flex-col items-center from-gray-900/70 to-black/70 border-secondary rounded-3xl shadow-2xl overflow-hidden relative group transition-all duration-500 hover:scale-[1.01] hover:shadow-secondary/50 border border-none justify-start bg-[#000000ff] z-50 cursor-move" draggable="true">
        <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 w-full text-center">
          <SpinButton />
        </div>
      </div>
      {/* Slots Display - Independent */}
      <SlotsDisplay />
    </div>
  );
}
