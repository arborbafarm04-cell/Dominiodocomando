import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlingModal from '@/components/BlingModal';
import LuxuryNPCDialog from '@/components/LuxuryNPCDialog';
import { usePlayerStore } from '@/store/playerStore';
import { luxuryItems } from '@/data/luxoItems';

export default function LuxuryShowroomPage() {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Get player's barraco level and player level from store
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);
  const playerLevel = usePlayerStore((state) => state.level);

  // Show initial dialog after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialDialog(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get items for the player's barraco level
  const items = (luxuryItems[barracoLevel] || []).map((item, index) => ({
    id: index,
    name: item.name,
    price: item.price.toFixed(2),
  }));

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

        {/* LUXURY NPC DIALOG - 48% WIDTH LEFT SIDE */}
        <LuxuryNPCDialog
          isOpen={showInitialDialog}
          onClose={() => setShowInitialDialog(false)}
          onViewCollection={() => {
            setShowInitialDialog(false);
            setShowCollectionModal(true);
          }}
          onAccept={() => {
            setShowInitialDialog(false);
            setShowCollectionModal(true);
          }}
          onDenounce={() => {
            setShowInitialDialog(false);
          }}
          title="Bem-vindo ao Showroom"
          message="Bem-vindo… Aqui não é sobre comprar. É sobre se posicionar. Cada coleção revela o seu nível. Escolha com cuidado… porque aqui, status é tudo."
        />

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
