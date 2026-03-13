import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Luxo7Page() {
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [editLevelValue, setEditLevelValue] = useState('');
  const playerName = useGameStore((state) => state.playerName);
  const playerLevel = useGameStore((state) => state.playerLevel);
  const setPlayerLevel = useGameStore((state) => state.setPlayerLevel);

  const luxo7Price = 1901.45;

  const handleBuyClick = () => {
    setShowPaymentAnimation(true);
    setPaymentComplete(false);
  };

  useEffect(() => {
    if (showPaymentAnimation) {
      const timer = setTimeout(() => {
        setPaymentComplete(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showPaymentAnimation]);

  const handleCloseAnimation = () => {
    setShowPaymentAnimation(false);
    setPaymentComplete(false);
  };

  const handleEditLevel = () => {
    setEditLevelValue(playerLevel.toString());
    setIsEditingLevel(true);
  };

  const handleSaveLevel = () => {
    const newLevel = parseInt(editLevelValue, 10);
    if (!isNaN(newLevel) && newLevel > 0) {
      setPlayerLevel(newLevel);
      setIsEditingLevel(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingLevel(false);
    setEditLevelValue('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="relative w-full flex-1 overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_7d8907b7077048ed9ad8fe121f50dd93~mv2.png"
          alt="Luxo 7 Background"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-paragraph text-xl md:text-2xl text-secondary mb-12">
              Adquira este item exclusivo
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Buy Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyClick}
                disabled={showPaymentAnimation}
                className="px-8 py-4 bg-primary hover:bg-orange-600 text-white font-heading text-xl md:text-2xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comprar por R${luxo7Price.toFixed(2)}
              </motion.button>

              {/* Player Level Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="px-6 py-4 bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-secondary rounded-lg backdrop-blur-sm cursor-pointer hover:border-secondary/80 transition-colors"
                onClick={handleEditLevel}
              >
                <div className="flex flex-col items-center">
                  <span className="font-paragraph text-sm text-secondary/80 uppercase tracking-wide mb-1">
                    Nível do Jogador
                  </span>
                  <span className="font-heading text-4xl text-secondary font-bold">
                    {playerLevel}
                  </span>
                  <span className="font-paragraph text-xs text-secondary/60 mt-2">
                    Clique para editar
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Payment Animation Overlay */}
        <AnimatePresence>
          {showPaymentAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
              onClick={handleCloseAnimation}
            >
              <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Card Machine */}
                <motion.div
                  initial={{ x: -200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-1/4 transform -translate-x-1/2"
                >
                  <div className="w-32 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl border-4 border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-secondary text-sm font-bold mb-2">MÁQUINA</div>
                      <div className="w-20 h-12 bg-black rounded border-2 border-secondary flex items-center justify-center">
                        <span className="text-secondary text-xs">CARTÃO</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Animated Card */}
                <motion.div
                  initial={{ x: 200, rotateY: 0, opacity: 0 }}
                  animate={{
                    x: -50,
                    rotateY: [0, 15, 0],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                  className="absolute right-1/4 transform translate-x-1/2"
                >
                  <div className="w-32 h-52 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                    style={{
                      perspective: '1000px',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Card Chip */}
                    <div className="w-12 h-10 bg-yellow-400 rounded-lg shadow-lg" />

                    {/* Player Name */}
                    <div className="text-white font-heading text-sm uppercase tracking-wider">
                      {playerName || 'JOGADOR'}
                    </div>

                    {/* Card Number */}
                    <div className="text-white font-mono text-lg tracking-widest">
                      •••• •••• •••• 4242
                    </div>

                    {/* Hologram Effect */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full blur-xl"
                    />
                  </div>
                </motion.div>

                {/* Completion Message */}
                <AnimatePresence>
                  {paymentComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: 2,
                        }}
                        className="text-center"
                      >
                        <div className="text-6xl mb-4">✓</div>
                        <h2 className="font-heading text-4xl text-secondary mb-2">
                          Compra Realizada!
                        </h2>
                        <p className="font-paragraph text-white text-lg">
                          Bem-vindo ao Luxo 7, {playerName || 'Jogador'}!
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close Button */}
                {paymentComplete && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleCloseAnimation}
                    className="absolute bottom-8 px-6 py-3 bg-primary hover:bg-orange-600 text-white font-heading rounded-lg transition-all"
                  >
                    Fechar
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Edit Modal */}
        <AnimatePresence>
          {isEditingLevel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
              onClick={handleCancelEdit}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-secondary rounded-lg p-8 max-w-sm w-full mx-4"
              >
                <h2 className="font-heading text-2xl text-secondary mb-6 text-center">
                  Editar Nível
                </h2>
                <input
                  type="number"
                  value={editLevelValue}
                  onChange={(e) => setEditLevelValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-secondary rounded-lg text-white font-heading text-xl text-center mb-6 focus:outline-none focus:border-secondary/80"
                  placeholder="Digite o novo nível"
                  autoFocus
                  min="1"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveLevel}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-orange-600 text-white font-heading rounded-lg transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-heading rounded-lg transition-all border border-secondary/30"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
