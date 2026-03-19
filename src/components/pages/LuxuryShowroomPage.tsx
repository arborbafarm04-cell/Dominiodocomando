import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
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

const ITEM_IMAGES: Record<string, string> = {
  'Relógio de Diamante': 'https://static.wixstatic.com/media/50f4bf_240ffc04130b4deb99d8a14840897118~mv2.png',
  'Ferrari Vermelha': 'https://static.wixstatic.com/media/50f4bf_7ee6da0068db4e4191e21400acb9984a~mv2.png',
  'Iate de Luxo': 'https://static.wixstatic.com/media/50f4bf_93f09e967d4f4c4db900d9876ee5087e~mv2.png',
  'Mansão Moderna': 'https://static.wixstatic.com/media/50f4bf_1df730f827be4d71b6cd1c56f63e0a76~mv2.png',
  'Jato Privado': 'https://static.wixstatic.com/media/50f4bf_8d02291479f34649b24e980fed29d0b3~mv2.png',
  'Bolsa de Designer': 'https://static.wixstatic.com/media/50f4bf_464f314b3f8b4d60b8d8515e819d9c94~mv2.png',
  'Penthouse': 'https://static.wixstatic.com/media/50f4bf_1dc245e81a194f79b407a4dea784a607~mv2.png',
  'Anel de Diamante': 'https://static.wixstatic.com/media/50f4bf_a6ac5cb2595b4dc99786be0f95b01ece~mv2.png',
  'Coleção de Vinhos': 'https://static.wixstatic.com/media/50f4bf_418839f4cd9b4af2b86797282987e07c~mv2.png',
  'Obra de Arte': 'https://static.wixstatic.com/media/50f4bf_08bb23ec84844157a768ac928f672477~mv2.png',
  'Resort de Luxo': 'https://static.wixstatic.com/media/50f4bf_8c311613443d4afa9eecbb3a9f3cacae~mv2.png',
  'Helicóptero Privado': 'https://static.wixstatic.com/media/50f4bf_34d1d5644f294cdead3ac5176fc93753~mv2.png',
  'Spa Resort': 'https://static.wixstatic.com/media/50f4bf_b4bbeea18b00456594c4bc4bca1907b3~mv2.png',
  'Ilha Privada': 'https://static.wixstatic.com/media/50f4bf_f50d241f7ba642fb93fed7d9a6b16cbd~mv2.png',
  'Experiência Espacial': 'https://static.wixstatic.com/media/50f4bf_6c9153225f6444ac91d680bb112c9ff1~mv2.png',
};

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
          // Assign generated images to items
          const itemsWithImages = sortedItems.map(item => ({
            ...item,
            imageUrl: ITEM_IMAGES[item.itemName || ''] || item.imageUrl
          }));
          setLuxuryItems(itemsWithImages);
          if (itemsWithImages.length > 0) {
            setSelectedItem(itemsWithImages[0]);
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
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Cinematographic background with gradient and spotlight effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-slate-950" />
        
        {/* Spotlight effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl opacity-25" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-12">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
              <h1 className="font-heading text-6xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                Showroom de Luxo
              </h1>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </div>
            <p className="font-paragraph text-lg text-amber-200/60">
              Coleção exclusiva de itens premium com apresentação cinematográfica
            </p>
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Sidebar - Items List */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <div className="relative">
                  {/* Spotlight glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-xl blur-xl opacity-50" />
                  
                  <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-amber-500/40 rounded-xl p-6 backdrop-blur-md max-h-[700px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      <h2 className="font-heading text-xl text-amber-100">Coleção</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {luxuryItems.map((item, index) => {
                        const isLocked = playerLevel < (item.level || 0);
                        const isPurchased = purchasedItems.has(item._id);
                        const isSelected = selectedItem?._id === item._id;
                        
                        return (
                          <motion.button
                            key={item._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-4 rounded-lg transition-all border group relative overflow-hidden ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-600/50 to-amber-500/30 border-amber-300 shadow-lg shadow-amber-500/40'
                                : 'bg-slate-800/30 border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-800/50'
                            } ${isLocked ? 'opacity-50' : ''}`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selectedBg"
                                className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"
                                initial={false}
                              />
                            )}
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-heading text-sm text-amber-300 font-bold">
                                  Nível {item.level}
                                </p>
                                <p className="font-paragraph text-xs text-amber-200/70 truncate">
                                  {item.itemName}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {isLocked && <Lock className="w-4 h-4 text-red-400" />}
                                {isPurchased && <Check className="w-4 h-4 text-green-400" />}
                                {isSelected && <ChevronRight className="w-4 h-4 text-amber-400" />}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Item Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4"
            >
              {selectedItem ? (
                <div className="relative">
                  {/* Cinematographic spotlight background */}
                  <div className="absolute -inset-4 bg-gradient-to-b from-amber-500/30 via-amber-600/10 to-transparent rounded-2xl blur-2xl opacity-40" />
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl opacity-30" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-black/95 border-2 border-amber-500/50 rounded-2xl overflow-hidden backdrop-blur-xl">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    
                    {/* Header Section */}
                    <div className="relative bg-gradient-to-r from-amber-950/60 to-amber-900/40 px-8 py-8 border-b border-amber-600/30">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-4"
                      >
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-paragraph text-sm text-amber-300/70">Apresentação Exclusiva</p>
                          <h2 className="font-heading text-3xl text-amber-100">Item Premium</h2>
                        </div>
                      </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">
                      {/* Image Showcase with Spotlight Effect */}
                      {selectedItem.imageUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="relative group"
                        >
                          {/* Spotlight glow around image */}
                          <div className="absolute -inset-4 bg-gradient-to-b from-amber-500/40 via-amber-600/20 to-transparent rounded-xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
                          
                          <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-2xl">
                            <Image
                              src={selectedItem.imageUrl}
                              alt={selectedItem.itemName || 'Luxury Item'}
                              className="w-full h-96 object-cover"
                              width={700}
                            />
                            {/* Overlay gradient for cinematic effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>
                        </motion.div>
                      )}

                      {/* Title and Description */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                      >
                        <h3 className="font-heading text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                          {selectedItem.itemName}
                        </h3>
                        {selectedItem.description && (
                          <p className="font-paragraph text-base text-amber-200/80 leading-relaxed">
                            {selectedItem.description}
                          </p>
                        )}
                      </motion.div>

                      {/* Stats Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-amber-500/20 rounded-lg"
                      >
                        <div className="space-y-2">
                          <p className="font-paragraph text-xs text-amber-200/60 uppercase tracking-wider">Preço</p>
                          <p className="font-heading text-2xl text-amber-300 font-bold">
                            R$ {(selectedItem.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-paragraph text-xs text-amber-200/60 uppercase tracking-wider">Nível Mínimo</p>
                          <p className={`font-heading text-2xl font-bold ${meetsLevel ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedItem.level}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-paragraph text-xs text-amber-200/60 uppercase tracking-wider">Seu Nível</p>
                          <p className="font-heading text-2xl text-cyan-400 font-bold">{playerLevel}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-paragraph text-xs text-amber-200/60 uppercase tracking-wider">Dinheiro Sujo</p>
                          <p className={`font-heading text-2xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {dirtMoney.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </motion.div>

                      {/* Purchase Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePurchase}
                        disabled={!canAfford || !meetsLevel || alreadyPurchased}
                        className={`w-full py-5 rounded-lg font-heading text-lg font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                          alreadyPurchased
                            ? 'bg-gradient-to-r from-green-600/50 to-green-700/50 text-green-200 cursor-not-allowed border border-green-500/30'
                            : canAfford && meetsLevel
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border border-amber-400/50 cursor-pointer shadow-lg shadow-amber-500/50'
                              : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 cursor-not-allowed border border-slate-500/30'
                        }`}
                      >
                        {!alreadyPurchased && !canAfford && !meetsLevel && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500" />
                        )}
                        <div className="relative flex items-center gap-3">
                          {alreadyPurchased ? (
                            <>
                              <Check className="w-6 h-6" />
                              <span>Comprado com Sucesso</span>
                            </>
                          ) : canAfford && meetsLevel ? (
                            <>
                              <ShoppingBag className="w-6 h-6" />
                              <span>Comprar Agora</span>
                            </>
                          ) : (
                            <span>Indisponível</span>
                          )}
                        </div>
                      </motion.button>

                      {/* Error Messages */}
                      {!canAfford && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-paragraph text-sm text-red-400 text-center bg-red-500/10 border border-red-500/30 rounded-lg py-3"
                        >
                          ⚠️ Dinheiro sujo insuficiente para esta compra
                        </motion.p>
                      )}
                      {!meetsLevel && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-paragraph text-sm text-red-400 text-center bg-red-500/10 border border-red-500/30 rounded-lg py-3"
                        >
                          ⚠️ Nível insuficiente para desbloquear este item
                        </motion.p>
                      )}
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-b from-amber-500/20 to-transparent rounded-2xl blur-2xl opacity-30" />
                  <div className="relative bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500/40 rounded-2xl px-8 py-16 text-center backdrop-blur-xl">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="flex justify-center mb-6"
                    >
                      <Sparkles className="w-12 h-12 text-amber-400" />
                    </motion.div>
                    <h3 className="font-heading text-3xl text-amber-100 mb-4">Carregando Coleção...</h3>
                    <p className="font-paragraph text-amber-200/70">
                      Preparando a apresentação cinematográfica dos itens premium
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
