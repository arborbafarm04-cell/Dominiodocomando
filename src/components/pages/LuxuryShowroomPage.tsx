import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlingModal from '@/components/BlingModal';
import LuxuryNPCDialog from '@/components/LuxuryNPCDialog';
import { usePlayerStore } from '@/store/playerStore';

// sistema da loja
import { getLuxurySystem } from '../../data/luxoItems';

export default function LuxuryShowroomPage() {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // 🔥 STORE
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);
  const playerLevel = usePlayerStore((state) => state.level);

  // 🔥 garante que nunca quebra
  const level = barracoLevel ?? 1;

  // 🔥 sistema dinâmico baseado no nível
  const system = getLuxurySystem(level);

  // 🔥 itens seguros
  const items = (system?.items || []).map((item, index) => ({
    id: index,
    name: item.name,
    price: item.price,
    image: item.image,
  }));

  // 🔥 diálogo inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialDialog(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

        {/* NPC */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png"
          alt="NPC"
          onClick={() => setShowItemsModal(true)}
          className="absolute right-10 bottom-0 h-[80%] cursor-pointer transition-transform hover:scale-105"
          width={400}
          height={800}
        />

        {/* DIALOGO INICIAL */}
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
          message="Bem-vindo… Aqui não é sobre comprar. É sobre se posicionar. Cada coleção revela o seu nível."
        />

        {/* COLEÇÃO */}
        <BlingModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          onOk={() => {
            setShowCollectionModal(false);
            setShowItemsModal(true);
          }}
          onCancel={() => setShowCollectionModal(false)}
          onHelp={() => alert('Coleção de luxo baseada no seu nível')}
          title={`Coleção Nível ${level} 💎`}
        >
          <div className="text-center text-white/80 mb-6">
            <p>Itens liberados conforme seu nível de barraco</p>
          </div>

          {/* ITENS */}
          <div className="grid gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.id * 0.1 }}
                className="flex gap-4 p-4 bg-white/10 rounded-lg backdrop-blur hover:bg-white/20 transition-colors"
              >
                {/* IMAGEM DO ITEM */}
                {item.image && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-black/50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                    />
                  </div>
                )}

                {/* INFO DO ITEM */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-white font-bold text-lg">{item.name}</p>
                  <p className="text-yellow-400 font-heading text-xl">
                    R$ {item.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </BlingModal>

      </div>

      <Footer />
    </div>
  );
}
