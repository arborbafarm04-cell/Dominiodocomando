import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { useLuxuryShopStore, luxuryItems } from '@/store/luxuryShopStore';
import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';

export default function LuxuryShowroomPage() {
  const { playerLevel, dirtMoney, setDirtMoney } = useGameStore();
  const { purchaseItem, isPurchased } = useLuxuryShopStore();

  // Find the item that matches the player's level
  const matchingItem = luxuryItems.find(item => item.level === playerLevel);

  const handlePurchase = () => {
    if (matchingItem && dirtMoney >= matchingItem.price && playerLevel >= matchingItem.level) {
      purchaseItem(matchingItem.id);
      setDirtMoney(dirtMoney - matchingItem.price);
    }
  };

  const canAfford = matchingItem ? dirtMoney >= matchingItem.price : false;
  const meetsLevel = matchingItem ? playerLevel >= matchingItem.level : false;
  const alreadyPurchased = matchingItem ? isPurchased(matchingItem.id) : false;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      
      {/* Background Section - Full Screen */}
      <div className="flex-1 w-full h-full relative">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8787d9f97cfa4afe99b4bdd843fde7da~mv2.png"
          alt="Luxury Showroom Background"
          className="w-full h-full object-cover"
          width={1600}
        />

        {/* Luxury Item Display */}
        {matchingItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-8 py-6 border-b border-amber-700">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-amber-300" />
                  <h2 className="font-heading text-3xl text-amber-100">Item de Luxo</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex-shrink-0 w-full md:w-64"
                >
                  <Image
                    src={matchingItem.image}
                    alt={matchingItem.name}
                    className="w-full h-64 object-cover rounded-lg border-2 border-amber-500 shadow-lg shadow-amber-500/30"
                    width={300}
                  />
                </motion.div>

                {/* Details */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex-1 space-y-6"
                >
                  {/* Title */}
                  <div>
                    <h3 className="font-heading text-3xl text-amber-100 mb-2">{matchingItem.name}</h3>
                    <p className="font-paragraph text-base text-amber-200/80">{matchingItem.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 border-t border-b border-amber-600 py-4">
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Preço:</span>
                      <span className="font-heading text-2xl text-amber-300">
                        ${matchingItem.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Nível Mínimo:</span>
                      <span className={`font-heading text-lg ${meetsLevel ? 'text-green-400' : 'text-red-400'}`}>
                        {matchingItem.level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Seu Nível:</span>
                      <span className="font-heading text-lg text-cyan-400">{playerLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-paragraph text-sm text-amber-200/70">Dinheiro Sujo:</span>
                      <span className={`font-heading text-lg ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        ${dirtMoney.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bonus */}
                  {matchingItem.bonus && (
                    <div className="bg-slate-700 rounded-lg p-4 border border-cyan-500/30">
                      <h4 className="font-heading text-sm text-cyan-400 mb-3">Bônus:</h4>
                      <div className="space-y-2">
                        {matchingItem.bonus.moneyMultiplier && (
                          <p className="font-paragraph text-sm text-cyan-300">
                            💰 Multiplicador: x{matchingItem.bonus.moneyMultiplier}
                          </p>
                        )}
                        {matchingItem.bonus.spinsBonus && (
                          <p className="font-paragraph text-sm text-cyan-300">
                            🎰 Bônus de Spins: +{matchingItem.bonus.spinsBonus}
                          </p>
                        )}
                        {matchingItem.bonus.levelBonus && (
                          <p className="font-paragraph text-sm text-cyan-300">
                            ⬆️ Bônus de Nível: +{matchingItem.bonus.levelBonus}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

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
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Item Available */}
        {!matchingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-amber-500 rounded-xl px-8 py-12 text-center">
              <h3 className="font-heading text-2xl text-amber-100 mb-4">Nenhum item disponível</h3>
              <p className="font-paragraph text-amber-200/70">
                Aumente seu nível para desbloquear itens de luxo
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
