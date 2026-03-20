import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Image } from '@/components/ui/image';

export default function CharacterDialog() {
  const navigate = useNavigate();
  const { playerLevel } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedCustomName = localStorage.getItem('customPlayerName');
    if (savedCustomName) {
      setCustomPlayerName(savedCustomName);
    }
    // Auto-open dialog on first visit
    const hasVisited = localStorage.getItem('characterDialogVisited');
    if (!hasVisited) {
      setIsOpen(true);
      localStorage.setItem('characterDialogVisited', 'true');
    }
  }, []);

  const handleViewLuxury = () => {
    setIsOpen(false);
    navigate('/luxury-showroom');
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Signboard below header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed top-[110px] left-0 right-0 z-40 flex justify-center pointer-events-none"
      >
        <div className="relative px-8 py-3 bg-gradient-to-r from-[#FF4500]/30 to-[#FF0000]/30 border-2 border-[#FF4500] rounded-lg shadow-[0_0_20px_rgba(255,69,0,0.6)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF4500] rounded-full animate-pulse" />
            <span className="font-heading text-sm md:text-base font-bold tracking-[2px] uppercase text-[#FF4500]" style={{
              textShadow: '0 0 10px rgba(255,69,0,0.8)'
            }}>
              Bem-vindo ao Luxo
            </span>
            <div className="w-2 h-2 bg-[#FF4500] rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Character Dialog Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-[#FF4500] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(255,69,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background accent */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF4500]/20 rounded-full blur-3xl" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 flex gap-8 items-center">
                {/* Character Image */}
                <div className="hidden md:block flex-shrink-0">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/30 to-[#00eaff]/30 rounded-lg blur-xl" />
                    <Image
                      src="https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png?originWidth=128&originHeight=128"
                      alt="Personagem do Luxo"
                      width={192}
                      className="relative w-full h-full object-cover rounded-lg border-2 border-[#FF4500]"
                    />
                  </div>
                </div>

                {/* Dialog Text */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#FF4500] mb-4" style={{
                      textShadow: '0 0 10px rgba(255,69,0,0.6)'
                    }}>
                      Bem-vindo, {customPlayerName || 'Comandante'}!
                    </h2>

                    <p className="font-paragraph text-base md:text-lg text-white/90 mb-6 leading-relaxed">
                      Eu estava ansiosa pela sua visita... Tenho algo exclusivo para você.
                    </p>

                    {/* Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleViewLuxury}
                      className="px-8 py-3 bg-gradient-to-r from-[#FF4500] to-[#FF0000] text-white font-heading font-bold text-lg tracking-wider rounded-lg border-2 border-[#FF4500] hover:shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 uppercase"
                    >
                      Quero ver Luxo {playerLevel}
                    </motion.button>
                  </motion.div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors z-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button to reopen dialog */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 px-6 py-3 bg-gradient-to-r from-[#FF4500] to-[#FF0000] text-white font-heading font-bold text-sm tracking-wider rounded-lg border-2 border-[#FF4500] hover:shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 uppercase"
      >
        Falar com Personagem
      </motion.button>
    </>
  );
}
