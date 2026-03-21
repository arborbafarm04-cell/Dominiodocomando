import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlingModal from '@/components/BlingModal';
import LuxuryNPCDialog from '@/components/LuxuryNPCDialog';
import Luxury3DShowroom from '@/components/Luxury3DShowroom';
import { usePlayerStore } from '@/store/playerStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

// sistema da loja
import { getLuxurySystem, getBackgroundColorByLevel } from '../../data/luxoItems';

export default function LuxuryShowroomPage() {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasedItems, setPurchasedItems] = useState<Set<number>>(new Set());

  // 🔥 STORE
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);
  const playerLevel = usePlayerStore((state) => state.level);
  const cleanMoney = useCleanMoneyStore((state) => state.cleanMoney);
  const removeCleanMoney = useCleanMoneyStore((state) => state.removeCleanMoney);
  const { setBarracoLevel } = usePlayerStore();

  // 🔥 Carregar dados do jogador ao montar o componente
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let playerId = urlParams.get('playerId') || localStorage.getItem('currentPlayerId');
        
        if (!playerId) {
          const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
          if (result.items && result.items.length > 0) {
            playerId = result.items[0]._id;
            localStorage.setItem('currentPlayerId', playerId);
          }
        }

        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          if (playerData?.level) {
            setBarracoLevel(playerData.level);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do jogador:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [setBarracoLevel]);

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

  // 🔥 função para comprar item
  const handleBuyItem = (item: any, itemIndex: number) => {
    // Verifica se o item já foi comprado
    if (purchasedItems.has(itemIndex)) {
      setPurchaseMessage(`❌ Este item já foi comprado!`);
      setTimeout(() => setPurchaseMessage(''), 3000);
      return;
    }

    if (cleanMoney >= item.price) {
      removeCleanMoney(item.price);
      setPurchasedItems(new Set(purchasedItems).add(itemIndex));
      setPurchaseMessage(`✅ ${item.name} comprado com sucesso!`);
      setTimeout(() => setPurchaseMessage(''), 3000);
    } else {
      setPurchaseMessage(`❌ Dinheiro insuficiente! Faltam R$ ${(item.price - cleanMoney).toLocaleString('pt-BR')}`);
      setTimeout(() => setPurchaseMessage(''), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 relative w-full overflow-hidden bg-black">

        {/* 3D SHOWROOM */}
        <div className="absolute inset-0 w-full h-full">
          <Luxury3DShowroom />
        </div>

        {/* BACKGROUND */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_e591cecf171a471cbfa4c0d91653f072~mv2.png"
          alt="Luxury Showroom Background"
          className="absolute w-full h-full object-cover opacity-30"
          width={1920}
          height={1080}
        />

        {/* NPC */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png"
          alt="NPC"
          onClick={() => setShowItemsModal(true)}
          className="absolute right-10 bottom-0 h-[80%] cursor-pointer transition-transform hover:scale-105 z-20"
          width={400}
          height={800}
        />

        {/* DIALOGO INICIAL */}
        <div className="relative z-30">
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
        </div>

        {/* COLEÇÃO */}
        <div className="relative z-30">
          <BlingModal
            isOpen={showCollectionModal}
            onClose={() => setShowCollectionModal(false)}
            onOk={() => {
              setShowCollectionModal(false);
              setShowItemsModal(true);
            }}
            onCancel={() => setShowCollectionModal(false)}
            onHelp={() => alert('Coleção de luxo baseada no seu nível')}
            title={`Coleção ${system.collectionName} 💎`}
          >
            <div className="text-center text-white/80 mb-6">
              <p>Itens liberados conforme seu nível de barraco</p>
              <p className="text-yellow-400 font-bold mt-2">Saldo: R$ {cleanMoney.toLocaleString('pt-BR')}</p>
            </div>

            {/* MENSAGEM DE COMPRA */}
            {purchaseMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-white/20 rounded-lg text-center text-white font-bold"
              >
                {purchaseMessage}
              </motion.div>
            )}

            {/* ITENS */}
            <div className="grid gap-6">
              {items.map((item, itemIndex) => {
                const isBought = purchasedItems.has(itemIndex);
                const bgColor = getBackgroundColorByLevel(level);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.id * 0.1 }}
                    className={`flex gap-4 p-4 rounded-lg backdrop-blur transition-all ${
                      isBought ? 'opacity-60 bg-white/5' : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={
                      !isBought
                        ? {
                            background: `linear-gradient(135deg, ${bgColor}30, ${bgColor}10)`,
                            border: `2px solid ${bgColor}80`,
                          }
                        : undefined
                    }
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

                    {/* BOTÃO DE COMPRA */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleBuyItem(item, itemIndex)}
                        disabled={cleanMoney < item.price || isBought}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          isBought
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : cleanMoney >= item.price
                              ? 'bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer'
                              : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {isBought ? '✓ Comprado' : 'Comprar'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </BlingModal>
        </div>

      </div>

      <Footer />
    </div>
  );
}
