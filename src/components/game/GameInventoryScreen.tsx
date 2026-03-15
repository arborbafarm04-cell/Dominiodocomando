import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function GameInventoryScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);

  const inventoryItems = [
    { id: 1, name: 'Dinheiro Sujo', quantity: 5000, value: 5000, type: 'currency' },
    { id: 2, name: 'Dinheiro Limpo', quantity: 2000, value: 2000, type: 'currency' },
    { id: 3, name: 'Pistola 9mm', quantity: 1, value: 500, type: 'weapon' },
    { id: 4, name: 'Munição', quantity: 45, value: 100, type: 'ammo' },
    { id: 5, name: 'Informação Valiosa', quantity: 1, value: 1000, type: 'item' },
    { id: 6, name: 'Contato Policial', quantity: 1, value: 2000, type: 'contact' },
  ];

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.value * item.quantity), 0);

  const getItemColor = (type: string) => {
    switch (type) {
      case 'currency':
        return 'text-green-400';
      case 'weapon':
        return 'text-red-400';
      case 'ammo':
        return 'text-yellow-400';
      case 'contact':
        return 'text-purple-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <h1 className="font-heading text-5xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          INVENTÁRIO
        </h1>

        {/* Total value */}
        <div className="text-center mb-8 p-4 bg-gray-800/50 border-2 border-cyan-400 rounded-lg">
          <p className="font-paragraph text-gray-400 mb-2">Valor Total</p>
          <p className="font-heading text-3xl text-green-400 font-bold">R$ {totalValue.toLocaleString()}</p>
        </div>

        {/* Items list */}
        <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
          {inventoryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800/50 border-2 border-cyan-400/50 rounded-lg p-4 flex items-center justify-between hover:border-cyan-400 transition-all"
            >
              <div className="flex-1">
                <h3 className={`font-heading font-bold ${getItemColor(item.type)}`}>
                  {item.name}
                </h3>
                <p className="font-paragraph text-sm text-gray-400">
                  Qtd: {item.quantity} | Valor: R$ {(item.value * item.quantity).toLocaleString()}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded border border-red-400/50 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-heading rounded-lg border-2 border-green-400">
              Vender Itens
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-heading rounded-lg border-2 border-blue-400">
              Usar Item
            </Button>
          </motion.div>
        </div>

        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen('menu')}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-heading rounded-lg border-2 border-cyan-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </motion.button>
      </motion.div>
    </div>
  );
}
