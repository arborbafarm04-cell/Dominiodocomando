import { motion, AnimatePresence } from 'framer-motion';
import { useLuxuryShopStore, luxuryItems } from '@/store/luxuryShopStore';
import { useGameStore } from '@/store/gameStore';
import { X, ShoppingBag, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useNavigate } from 'react-router-dom';

export default function LuxuryShop() {
  const navigate = useNavigate();
  const { isOpen, closeShop, selectedItem, selectItem, purchaseItem, isPurchased } = useLuxuryShopStore();
  const { dirtMoney, playerLevel, setDirtMoney } = useGameStore();

  const handleClose = () => {
    closeShop();
    navigate('/luxury-showroom');
  };

  const handlePurchase = (item: typeof luxuryItems[0]) => {
    if (dirtMoney >= item.price && playerLevel >= item.level) {
      purchaseItem(item.id);
      setDirtMoney(dirtMoney - item.price);
      selectItem(null);
    }
  };

  const canAfford = selectedItem ? dirtMoney >= selectedItem.price : false;
  const meetsLevel = selectedItem ? playerLevel >= selectedItem.level : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Shop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              {/* Content */}
              <div className="flex-1 overflow-y-auto flex gap-6 p-6">
                {/* Items Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {luxuryItems.map((item) => {
                      const purchased = isPurchased(item.id);
                      const canBuy = playerLevel >= item.level;

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => selectItem(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            selectedItem?.id === item.id
                              ? 'border-cyan-400 shadow-lg shadow-cyan-400/50'
                              : 'border-amber-600 hover:border-amber-400'
                          } ${purchased ? 'opacity-60' : ''}`}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="w-full h-32 object-cover"
                            width={200}
                          />
                          <div className="bg-slate-800 p-3">
                            <h3 className="font-heading text-sm text-amber-100 truncate">{item.name}</h3>
                            <p className="font-paragraph text-xs text-amber-200/70">
                              ${item.price.toLocaleString()}
                            </p>
                            <p className="font-paragraph text-xs text-cyan-400 mt-1">Nível {item.level}</p>
                          </div>

                          {/* Badges */}
                          {purchased && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {!canBuy && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="font-paragraph text-xs text-red-400">Nível insuficiente</span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Panel */}
                {selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full md:w-80 bg-slate-800 rounded-lg border border-amber-600 p-6 flex flex-col gap-4"
                  >
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-48 object-cover rounded-lg border border-amber-500"
                      width={300}
                    />

                    <div>
                      <h3 className="font-heading text-xl text-amber-100 mb-2">{selectedItem.name}</h3>
                      <p className="font-paragraph text-sm text-amber-200/80">{selectedItem.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-amber-600 pt-4">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-sm text-amber-200/70">Preço:</span>
                        <span className="font-heading text-lg text-amber-300">
                          ${selectedItem.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-sm text-amber-200/70">Nível Mínimo:</span>
                        <span className={`font-heading text-sm ${meetsLevel ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedItem.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-sm text-amber-200/70">Seu Nível:</span>
                        <span className="font-heading text-sm text-cyan-400">{playerLevel}</span>
                      </div>
                    </div>

                    {selectedItem.bonus && (
                      <div className="bg-slate-700 rounded-lg p-4 border border-cyan-500/30">
                        <h4 className="font-heading text-sm text-cyan-400 mb-2">Bônus:</h4>
                        <div className="space-y-1">
                          {selectedItem.bonus.moneyMultiplier && (
                            <p className="font-paragraph text-xs text-cyan-300">
                              💰 Multiplicador: x{selectedItem.bonus.moneyMultiplier}
                            </p>
                          )}
                          {selectedItem.bonus.spinsBonus && (
                            <p className="font-paragraph text-xs text-cyan-300">
                              🎰 Bônus de Spins: +{selectedItem.bonus.spinsBonus}
                            </p>
                          )}
                          {selectedItem.bonus.levelBonus && (
                            <p className="font-paragraph text-xs text-cyan-300">
                              ⬆️ Bônus de Nível: +{selectedItem.bonus.levelBonus}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-amber-600">
                      <button
                        onClick={() => selectItem(null)}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-amber-100 rounded-lg font-paragraph text-sm transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handlePurchase(selectedItem)}
                        disabled={!canAfford || !meetsLevel || isPurchased(selectedItem.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-heading text-sm font-bold transition-all ${
                          isPurchased(selectedItem.id)
                            ? 'bg-green-600/50 text-green-200 cursor-not-allowed'
                            : canAfford && meetsLevel
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/50'
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isPurchased(selectedItem.id) ? 'Comprado' : canAfford && meetsLevel ? 'Comprar' : 'Indisponível'}
                      </button>
                    </div>

                    {!canAfford && (
                      <p className="font-paragraph text-xs text-red-400 text-center">
                        Dinheiro sujo insuficiente
                      </p>
                    )}
                    {!meetsLevel && (
                      <p className="font-paragraph text-xs text-red-400 text-center">
                        Nível insuficiente
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-6 py-4 flex items-center justify-between border-b border-amber-700">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-amber-300" />
                  <h2 className="font-heading text-2xl text-amber-100">Loja de Luxo</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-amber-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-amber-100" />
                </button>
              </div>


            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
