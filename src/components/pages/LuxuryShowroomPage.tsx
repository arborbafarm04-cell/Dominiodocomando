import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlingModal from '@/components/BlingModal';

export default function LuxuryShowroomPage() {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Simulação do nível do jogador
  const playerLevel = 1;

  // Show initial dialog after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialDialog(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Gerador de itens por nível
  const generateItems = (level: number) => {
    const basePrice = 120;
    return Array.from({ length: 5 }).map((_, i) => {
      const price = basePrice * Math.pow(1.1, level + i);
      return {
        id: i,
        name: `Item de Luxo Nível ${level} - ${i + 1}`,
        price: price.toFixed(2),
      };
    });
  };

  const items = generateItems(playerLevel);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 relative w-full overflow-hidden bg-black">
        {/* BACKGROUND */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_e591cecf171a471cbfa4c0d91653f072~mv2.png"
          alt="Luxury Showroom Background"
          className="absolute w-full h-full object-cover"
          width={1920}
          height={1080}
        />

        {/* NPC 2D */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png"
          alt="NPC"
          onClick={() => setShowItemsModal(true)}
          className="absolute right-10 bottom-0 h-[80%] cursor-pointer transition-transform hover:scale-105"
          width={400}
          height={800}
        />

        {/* INITIAL DIALOG */}
        {showInitialDialog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute right-32 top-1/3 w-80 pointer-events-auto"
          >
            {/* Dialog Box */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>

              {/* Main dialog */}
              <div className="relative bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                {/* Text */}
                <p className="text-white text-sm leading-relaxed font-paragraph text-center mb-6">
                  Bem-vindo… Aqui não é sobre comprar. É sobre se posicionar. Cada coleção revela o seu nível. Escolha com cuidado… porque aqui, status é tudo.
                </p>

                {/* Button */}
                <button
                  onClick={() => {
                    setShowInitialDialog(false);
                    setShowCollectionModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-heading font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ver Coleção
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* BLING COLLECTION MODAL */}
        <BlingModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          onOk={() => {
            setShowCollectionModal(false);
            setShowItemsModal(true);
          }}
          onCancel={() => setShowCollectionModal(false)}
          onHelp={() => alert('Bem-vindo à coleção exclusiva de luxo!')}
          title={`Coleção Nível ${playerLevel} 💎`}
        >
          <div className="text-center text-white/80 font-paragraph mb-6">
            <p>Selecione os itens que deseja adquirir para elevar seu status...</p>
          </div>
        </BlingModal>

        {/* ITEMS MODAL */}
        <BlingModal
          isOpen={showItemsModal}
          onClose={() => setShowItemsModal(false)}
          onOk={() => setShowItemsModal(false)}
          onCancel={() => setShowItemsModal(false)}
          onHelp={() => alert('Explore nossa coleção exclusiva de itens de luxo!')}
          title={`Seleção Exclusiva Nível ${playerLevel} 💎`}
        >
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-b from-yellow-500/10 to-purple-500/10 border border-yellow-500/30 p-4 rounded-lg text-center hover:border-yellow-500/60 transition-all"
              >
                <div className="h-20 bg-gradient-to-b from-yellow-400/20 to-purple-400/20 mb-2 rounded-lg border border-yellow-500/20 flex items-center justify-center">
                  <div className="text-2xl">💎</div>
                </div>

                <p className="text-sm text-white/80 font-paragraph">{item.name}</p>
                <p className="text-yellow-400 font-bold font-heading">
                  R$ {item.price}
                </p>

                <button className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-3 py-2 rounded-lg font-heading font-bold transition-all shadow-lg hover:shadow-xl text-sm">
                  Comprar
                </button>
              </motion.div>
            ))}
          </div>
        </BlingModal>
      </div>
      <Footer />
    </div>
  );
}
