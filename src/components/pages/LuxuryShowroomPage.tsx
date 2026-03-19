import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

interface LuxuryItem {
  _id: string;
  level?: number;
  itemName?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export default function LuxuryShowroomPage() {
  const { dirtMoney, setDirtMoney } = useGameStore();
  const [barraco, setBarraco] = useState<Players | null>(null);
  const [luxuryItems, setLuxuryItems] = useState<LuxuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());

  // Load barraco level and luxury items from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let playerId = urlParams.get('playerId') || localStorage.getItem('currentPlayerId') || '';
        
        if (!playerId) {
          const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
          if (result.items && result.items.length > 0) {
            playerId = result.items[0]._id;
            localStorage.setItem('currentPlayerId', playerId);
          }
        }

        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          setBarraco(playerData);
        }

        // Load luxury items from CMS
        const itemsResult = await BaseCrudService.getAll<LuxuryItem>('itensdeluxo', [], { limit: 100 });
        if (itemsResult.items) {
          const sortedItems = itemsResult.items.sort((a, b) => (a.level || 0) - (b.level || 0));
          setLuxuryItems(sortedItems);
          if (sortedItems.length > 0) {
            setSelectedItem(sortedItems[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const playerLevel = barraco?.level || 1;

  const handlePurchase = () => {
    if (selectedItem && dirtMoney >= (selectedItem.price || 0) && playerLevel >= (selectedItem.level || 0)) {
      setDirtMoney(dirtMoney - (selectedItem.price || 0));
      setPurchasedItems(prev => new Set([...prev, selectedItem._id]));
    }
  };

  const canAfford = selectedItem ? dirtMoney >= (selectedItem.price || 0) : false;
  const meetsLevel = selectedItem ? playerLevel >= (selectedItem.level || 0) : false;
  const alreadyPurchased = selectedItem ? purchasedItems.has(selectedItem._id) : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      
      <div className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-heading text-5xl text-amber-100 mb-2">Showroom de Luxo</h1>
          <p className="font-paragraph text-amber-200/70">Explore nossa coleção exclusiva de itens premium</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Items List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <h2 className="font-heading text-xl text-amber-100 mb-4">Itens Disponíveis</h2>
              <div className="space-y-2">
                {luxuryItems.map((item) => {
                  const isLocked = playerLevel < (item.level || 0);
                  const isPurchased = purchasedItems.has(item._id);
                  
                  return (
                    <motion.button
                      key={item._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-3 rounded-lg transition-all border ${
                        selectedItem?._id === item._id
                          ? 'bg-amber-600/40 border-amber-400 shadow-lg shadow-amber-500/30'
                          : 'bg-slate-800/30 border-amber-500/20 hover:border-amber-500/50'
                      } ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-heading text-sm text-amber-100">
                            Nível {item.level}
                          </p>
                          <p className="font-paragraph text-xs text-amber-200/70 truncate">
                            {item.itemName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                          {isPurchased && <Check className="w-4 h-4 text-green-400" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Item Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {selectedItem ? (
              <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-8 py-6 border-b border-amber-700">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-amber-300" />
                    <h2 className="font-heading text-3xl text-amber-100">Item de Luxo</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Image */}
                  {selectedItem.imageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.itemName || 'Luxury Item'}
                        className="w-full h-80 object-cover rounded-lg border-2 border-amber-500 shadow-lg shadow-amber-500/30"
                        width={600}
                      />
                    </motion.div>
                  )}

                  {/* Title and Description */}
                  <div>
                    <h3 className="font-heading text-3xl text-amber-100 mb-2">{selectedItem.itemName}</h3>
                    {selectedItem.description && (
                      <p className="font-paragraph text-base text-amber-200/80">{selectedItem.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 border-t border-b border-amber-600 py-4">
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Preço:</span>
                      <span className="font-heading text-2xl text-amber-300">
                        R$ {(selectedItem.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Nível Mínimo:</span>
                      <span className={`font-heading text-lg ${meetsLevel ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedItem.level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Seu Nível:</span>
                      <span className="font-heading text-lg text-cyan-400">{playerLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Dinheiro Sujo:</span>
                      <span className={`font-heading text-lg ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {dirtMoney.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchase}
                    disabled={!canAfford || !meetsLevel || alreadyPurchased}
                    className={`w-full py-4 rounded-lg font-heading text-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      alreadyPurchased
                        ? 'bg-green-600/50 text-green-200 cursor-not-allowed'
                        : canAfford && meetsLevel
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/50 cursor-pointer'
                          : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {alreadyPurchased ? (
                      <>
                        <Check className="w-5 h-5" />
                        Comprado
                      </>
                    ) : canAfford && meetsLevel ? (
                      'Comprar Agora'
                    ) : (
                      'Indisponível'
                    )}
                  </motion.button>

                  {/* Error Messages */}
                  {!canAfford && (
                    <p className="font-paragraph text-sm text-red-400 text-center">
                      ⚠️ Dinheiro sujo insuficiente
                    </p>
                  )}
                  {!meetsLevel && (
                    <p className="font-paragraph text-sm text-red-400 text-center">
                      ⚠️ Nível insuficiente
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 rounded-xl px-8 py-12 text-center"
              >
                <h3 className="font-heading text-2xl text-amber-100 mb-4">Carregando itens...</h3>
                <p className="font-paragraph text-amber-200/70">
                  Aguarde enquanto carregamos a coleção de luxo
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
