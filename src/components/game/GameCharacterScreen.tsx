import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function GameCharacterScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);

  const characters = [
    {
      id: 1,
      name: 'Sgt. Rocha',
      role: 'Policial Corrupto',
      level: 45,
      image: 'https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png',
    },
    {
      id: 2,
      name: 'Zé Pequeno',
      role: 'Rival do Tráfico',
      level: 50,
      image: 'https://static.wixstatic.com/media/50f4bf_b23aee963b00465fa534f7705505b5b9~mv2.png',
    },
    {
      id: 3,
      name: 'Dona Maria',
      role: 'Informante',
      level: 30,
      image: 'https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png',
    },
  ];

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
        <h1 className="font-heading text-5xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          PERSONAGENS
        </h1>

        {/* Characters grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 border-2 border-cyan-400 rounded-lg overflow-hidden shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/60 transition-all"
            >
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${character.image})` }}>
                <div className="w-full h-full bg-gradient-to-t from-black to-transparent flex items-end p-4">
                  <div className="w-full">
                    <h3 className="font-heading text-xl font-bold text-cyan-400">{character.name}</h3>
                    <p className="font-paragraph text-sm text-gray-300">{character.role}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-cyan-400/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-paragraph text-gray-400">Nível:</span>
                  <span className="font-heading text-orange-500 font-bold">{character.level}</span>
                </div>
                <Button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-heading text-sm rounded border border-cyan-400">
                  Interagir
                </Button>
              </div>
            </motion.div>
          ))}
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
