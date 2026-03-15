import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function GameMenuScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <h1 className="font-heading text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          CRIME CITY
        </h1>
        <p className="font-paragraph text-xl text-cyan-400 mb-12 tracking-widest">
          RISE FROM THE STREETS
        </p>

        <div className="flex flex-col gap-4 items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setScreen('map')}
              className="px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-heading text-lg rounded-lg border-2 border-cyan-400 shadow-lg shadow-orange-500/50"
            >
              INICIAR JOGO
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setScreen('status')}
              className="px-12 py-6 bg-transparent hover:bg-gray-800 text-cyan-400 font-heading text-lg rounded-lg border-2 border-cyan-400"
            >
              STATUS
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setScreen('inventory')}
              className="px-12 py-6 bg-transparent hover:bg-gray-800 text-cyan-400 font-heading text-lg rounded-lg border-2 border-cyan-400"
            >
              INVENTÁRIO
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Neon lines decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
    </div>
  );
}
