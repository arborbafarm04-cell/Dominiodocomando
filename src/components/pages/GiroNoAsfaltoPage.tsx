import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Slot Machine Screen Component
function SlotMachineScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([0, 0, 0]);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<string | null>(null);

  const symbols = ['🍒', '🍊', '🍋', '🍌', '💎', '👑'];

  const handleSpin = () => {
    if (isSpinning || balance < bet) return;

    setIsSpinning(true);
    setResult(null);
    setBalance(balance - bet);

    // Simulate spinning
    const spinDuration = 1000;
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < spinDuration) {
        setReels([
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length),
        ]);
      } else {
        clearInterval(spinInterval);
        const finalReels = [
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length),
          Math.floor(Math.random() * symbols.length),
        ];
        setReels(finalReels);

        // Check for win
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          const winAmount = bet * 10;
          setBalance(balance - bet + winAmount);
          setResult('JACKPOT! 🎉');
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
          const winAmount = bet * 2;
          setBalance(balance - bet + winAmount);
          setResult('VITÓRIA! 🎊');
        } else {
          setResult('TENTE NOVAMENTE');
        }

        setIsSpinning(false);
      }
    }, 50);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Screen Frame */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-8 border-yellow-500 rounded-lg p-8 shadow-2xl shadow-yellow-500/50">
        
        {/* Display Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-heading font-bold text-yellow-400 tracking-widest uppercase mb-2">
            MÁQUINA CAÇA-NÍQUEIS
          </h3>
          <div className="h-1 w-32 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-black/80 border border-yellow-500/50 rounded p-4 text-center">
            <p className="text-yellow-400/70 text-xs font-heading uppercase tracking-widest mb-2">Saldo</p>
            <p className="text-2xl font-bold text-yellow-400 font-heading">R$ {balance.toLocaleString()}</p>
          </div>
          <div className="bg-black/80 border border-yellow-500/50 rounded p-4 text-center">
            <p className="text-yellow-400/70 text-xs font-heading uppercase tracking-widest mb-2">Aposta</p>
            <p className="text-2xl font-bold text-yellow-400 font-heading">R$ {bet.toLocaleString()}</p>
          </div>
          <div className="bg-black/80 border border-yellow-500/50 rounded p-4 text-center">
            <p className="text-yellow-400/70 text-xs font-heading uppercase tracking-widest mb-2">Prêmio</p>
            <p className="text-2xl font-bold text-yellow-400 font-heading">R$ {(bet * 10).toLocaleString()}</p>
          </div>
        </div>

        {/* Reels */}
        <div className="bg-black/60 border-4 border-yellow-500 rounded-lg p-8 mb-8">
          <div className="flex justify-center gap-6 mb-6">
            {reels.map((reel, idx) => (
              <motion.div
                key={idx}
                animate={isSpinning ? { y: [0, -20, 0] } : {}}
                transition={isSpinning ? { duration: 0.1, repeat: Infinity } : {}}
                className="w-24 h-24 bg-gradient-to-b from-yellow-600 to-yellow-800 border-4 border-yellow-400 rounded-lg flex items-center justify-center text-6xl shadow-lg shadow-yellow-500/50"
              >
                {symbols[reel]}
              </motion.div>
            ))}
          </div>

          {/* Result Message */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center text-2xl font-heading font-bold tracking-widest uppercase py-4 rounded ${
                result.includes('JACKPOT') || result.includes('VITÓRIA')
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : 'bg-red-500/20 text-red-400 border border-red-500'
              }`}
            >
              {result}
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Bet Adjustment */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBet(Math.max(10, bet - 50))}
              disabled={isSpinning}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-heading font-bold rounded transition-colors"
            >
              - APOSTA
            </button>
            <span className="text-yellow-400 font-heading font-bold text-lg">R$ {bet}</span>
            <button
              onClick={() => setBet(Math.min(balance, bet + 50))}
              disabled={isSpinning}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-heading font-bold rounded transition-colors"
            >
              + APOSTA
            </button>
          </div>

          {/* Spin Button */}
          <motion.button
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleSpin}
            disabled={isSpinning || balance < bet}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-heading font-black text-2xl tracking-widest uppercase rounded-lg transition-all shadow-lg shadow-yellow-500/50 disabled:shadow-none"
          >
            {isSpinning ? '⚙️ GIRANDO...' : '🎰 GIRAR'}
          </motion.button>

          {/* Info */}
          {balance < bet && (
            <p className="text-center text-red-400 font-heading text-sm uppercase tracking-widest">
              ⚠️ Saldo insuficiente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* First cinematic illustration */}
      <section className="relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_253301667c0f429c8b664cf3c859950b~mv2.png"
          alt="Luxurious Brazilian casino with crime elements - cinematic background"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </section>

      {/* Second cinematic illustration - Slot Machine */}
      <section className="relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_6ae61b811ca7476295ad2671cf3c098b~mv2.png"
          alt="Ultra-realistic slot machine with empty screen, Brazilian organized crime theme, money scattered around"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>

        {/* Interactive Slot Machine Screen Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SlotMachineScreen />
        </div>
      </section>

      <Footer />
    </div>
  );
}
