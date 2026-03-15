import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function GameStatusScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);

  const playerStats = {
    name: 'Seu Personagem',
    level: 40,
    experience: 7500,
    maxExperience: 10000,
    health: 85,
    maxHealth: 100,
    reputation: 65,
    maxReputation: 100,
    influence: 45,
    maxInfluence: 100,
    money: 7000,
  };

  const StatBar = ({ label, current, max, color }: any) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="font-paragraph text-gray-300">{label}</span>
        <span className={`font-heading font-bold ${color}`}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-cyan-400/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(current / max) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.replace('text', 'bg')}`}
        ></motion.div>
      </div>
    </div>
  );

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
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            {playerStats.name}
          </h1>
          <p className="font-heading text-2xl text-cyan-400">Nível {playerStats.level}</p>
        </div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 border-2 border-cyan-400 rounded-lg p-8 mb-8"
        >
          {/* Experience */}
          <StatBar
            label="Experiência"
            current={playerStats.experience}
            max={playerStats.maxExperience}
            color="text-blue-400"
          />

          {/* Health */}
          <StatBar
            label="Saúde"
            current={playerStats.health}
            max={playerStats.maxHealth}
            color="text-red-400"
          />

          {/* Reputation */}
          <StatBar
            label="Reputação"
            current={playerStats.reputation}
            max={playerStats.maxReputation}
            color="text-purple-400"
          />

          {/* Influence */}
          <StatBar
            label="Influência"
            current={playerStats.influence}
            max={playerStats.maxInfluence}
            color="text-orange-400"
          />

          {/* Money */}
          <div className="mt-6 pt-6 border-t border-cyan-400/30">
            <div className="flex justify-between items-center">
              <span className="font-paragraph text-gray-300">Dinheiro Total</span>
              <span className="font-heading text-2xl font-bold text-green-400">
                R$ {playerStats.money.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border-2 border-cyan-400/50 rounded-lg p-4 text-center"
          >
            <p className="font-paragraph text-gray-400 mb-2">Missões Completas</p>
            <p className="font-heading text-3xl font-bold text-cyan-400">12</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border-2 border-cyan-400/50 rounded-lg p-4 text-center"
          >
            <p className="font-paragraph text-gray-400 mb-2">Inimigos Derrotados</p>
            <p className="font-heading text-3xl font-bold text-red-400">8</p>
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
