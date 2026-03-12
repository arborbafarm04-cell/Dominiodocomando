import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { usePlayerStore } from '@/store/playerStore';
import RoyalGreeting from '@/components/RoyalGreeting';

const BARRACO_LEVELS = [
  { level: 10, milestone: 'Casa de Alvenaria' },
  { level: 20, milestone: 'Sobrado' },
  { level: 30, milestone: 'Sobrado com Piscina' },
  { level: 40, milestone: 'Sobrado de Luxo' },
  { level: 50, milestone: 'Triplex alto padrão' },
  { level: 60, milestone: 'Triplex com piscina borda infinita no rooftop' },
  { level: 70, milestone: 'Mansão do Complexo' },
  { level: 80, milestone: 'Mansão Luxuosa Blindada' },
  { level: 90, milestone: 'Mansão Blindada com Heliporto' },
  { level: 100, milestone: null },
];
const BASE_EVOLUTION_COST = 500;
const COST_MULTIPLIER = 1.1;

export default function BarracoPage() {
  const [player, setPlayer] = useState<Players | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allItemsAtLevel, setAllItemsAtLevel] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const { cleanMoney, removeCleanMoney } = useCleanMoneyStore();
  const { setLevel } = usePlayerStore();

  // Get player ID from localStorage or URL
  const getPlayerId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('playerId');
    if (idFromUrl) return idFromUrl;
    return localStorage.getItem('currentPlayerId') || '';
  };

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      let playerId = getPlayerId();
      
      // If no player ID, try to get the first player from the collection
      if (!playerId) {
        const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
        if (result.items && result.items.length > 0) {
          playerId = result.items[0]._id;
          localStorage.setItem('currentPlayerId', playerId);
        } else {
          setError('Nenhum jogador encontrado');
          return;
        }
      }

      const playerData = await BaseCrudService.getById<Players>('players', playerId);
      
      // Check if level increased and trigger level up animation
      if (previousLevel !== null && playerData?.level && playerData.level > previousLevel) {
        setLevelUpAnimation(true);
        setTimeout(() => setLevelUpAnimation(false), 1500);
      }
      
      setPreviousLevel(playerData?.level || 1);
      setPlayer(playerData);
      setImageKey(prev => prev + 1); // Trigger image change animation
      
      // Update the player store with the level from database
      if (playerData?.level) {
        setLevel(playerData.level);
      }
      
      // Check if all items are at the same level
      checkAllItemsAtLevel(playerData?.level || 1);
    } catch (err) {
      setError('Falha ao carregar dados do jogador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllItemsAtLevel = (level: number) => {
    // This checks if all game items are at the same level as the barraco
    // For now, we'll assume all items are at the same level
    // In a full implementation, you'd fetch all game items and verify their levels
    setAllItemsAtLevel(true);
  };

  const calculateEvolutionCost = (currentLevel: number): number => {
    // Cost = 500 * 1.5^(level-1)
    return Math.round(BASE_EVOLUTION_COST * Math.pow(COST_MULTIPLIER, currentLevel - 1));
  };

  const getBarracoImage = (level: number): string => {
    // Return the level 100 image for level 100
    if (level >= 100) {
      return 'https://static.wixstatic.com/media/50f4bf_9683cd5787de47bf883c2453384fd2ae~mv2.png';
    }
    // Return the Mansão Blindada com Heliporto image for level 90 and above
    if (level >= 90) {
      return 'https://static.wixstatic.com/media/50f4bf_dacc94520dfa449384a529f15de074f6~mv2.png';
    }
    // Return the Mansão Luxuosa Blindada image for level 80 and above
    if (level >= 80) {
      return 'https://static.wixstatic.com/media/50f4bf_b57bffd9299941ae84ea8d7589a9eda8~mv2.png';
    }
    // Return the Mansão do Complexo image for level 70 and above
    if (level >= 70) {
      return 'https://static.wixstatic.com/media/50f4bf_9b7bbc6679924b529acd7428f28e817d~mv2.png';
    }
    // Return the Triplex com piscina borda infinita no rooftop image for level 60 and above
    if (level >= 60) {
      return 'https://static.wixstatic.com/media/50f4bf_f36ccf79521242ab8518cf871e9f6a16~mv2.png';
    }
    // Return the Triplex alto padrão image for level 50 and above
    if (level >= 50) {
      return 'https://static.wixstatic.com/media/50f4bf_f363ec9d5ca846c4990f7730c5bf479c~mv2.png';
    }
    // Return the Sobrado de Luxo image for level 40 and above
    if (level >= 40) {
      return 'https://static.wixstatic.com/media/50f4bf_86c3183c0550490fab41c5a8a8f6184b~mv2.png';
    }
    // Return the Sobrado com Piscina image for level 30 and above
    if (level >= 30) {
      return 'https://static.wixstatic.com/media/50f4bf_b538b42955634d7190d28507d4b05023~mv2.png';
    }
    // Return the Sobrado image for level 20 and above
    if (level >= 20) {
      return 'https://static.wixstatic.com/media/50f4bf_b23aee963b00465fa534f7705505b5b9~mv2.png';
    }
    // Return the Casa de alvenaria image for level 10 and above
    if (level >= 10) {
      return 'https://static.wixstatic.com/media/50f4bf_6527240d26e94ca782357743f0ddddd7~mv2.png';
    }
    // Return the default barraco image for levels below 10
    return 'https://static.wixstatic.com/media/50f4bf_99aa35fbb009493a96d4ede6c1af056b~mv2.png';
  };

  const handleEvolution = async () => {
    if (!player || !allItemsAtLevel) return;

    const nextLevel = (player.level || 1) + 1;
    if (nextLevel > 100) {
      setError('Barraco already at maximum level (100)');
      return;
    }

    const evolutionCost = calculateEvolutionCost(player.level || 1);

    // Check if player has enough clean money
    if (cleanMoney < evolutionCost) {
      setError(`Dinheiro limpo insuficiente. Necessário: R$ ${evolutionCost.toLocaleString('pt-BR')}, Disponível: R$ ${cleanMoney.toLocaleString('pt-BR')}`);
      return;
    }

    try {
      setEvolving(true);
      setError(null);

      // Deduct the cost from clean money vault
      removeCleanMoney(evolutionCost);

      // Update player level
      await BaseCrudService.update<Players>('players', {
        _id: player._id,
        level: nextLevel,
        lastUpdated: new Date().toISOString(),
      });

      // Reload player data
      await loadPlayerData();
    } catch (err) {
      setError('Failed to evolve barraco');
      console.error(err);
    } finally {
      setEvolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando Barraco...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-foreground text-xl mb-4">{error || 'Jogador não encontrado'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-logo-gradient-end transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentLevel = player.level || 1;
  const nextLevel = currentLevel + 1;
  const evolutionCost = calculateEvolutionCost(currentLevel);
  const canEvolve = allItemsAtLevel && nextLevel <= 100;
  const barraco_image = getBarracoImage(currentLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {showGreeting && (
        <RoyalGreeting
          playerName={player?.playerName || 'Rei do Comando'}
          onComplete={() => setShowGreeting(false)}
        />
      )}
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center">
            <h1 className="font-heading text-6xl font-bold text-primary mb-2">
              BARRACO
            </h1>
            <motion.p 
              className="text-subtitle-neon-blue text-lg"
              animate={levelUpAnimation ? { scale: [1, 1.3, 1], color: ['#00eaff', '#FFD700', '#00eaff'] } : {}}
              transition={{ duration: 1.5 }}
            >
              Nível Global: <span className="font-bold">{currentLevel}</span>
            </motion.p>
          </div>

          {/* Level Up Celebration Effect */}
          {levelUpAnimation && (
            <>
              <motion.div
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.5 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              >
                <div className="text-6xl font-bold text-yellow-400 drop-shadow-lg">
                  ⭐ LEVEL UP! ⭐
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5 }}
                className="fixed top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
              >
                <div className="text-4xl">✨</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5, delay: 0.1 }}
                className="fixed top-1/3 right-1/4 pointer-events-none z-50"
              >
                <div className="text-4xl">✨</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="fixed top-1/3 left-1/4 pointer-events-none z-50"
              >
                <div className="text-4xl">✨</div>
              </motion.div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Barraco Image and Info Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-logo-gradient-end opacity-20 blur-2xl rounded-full"></div>
                <motion.div
                  key={imageKey}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative z-10"
                  style={{ perspective: "1000px" }}
                >
                  <Image
                    src={barraco_image}
                    alt={`Barraco Level ${currentLevel}`}
                    width={484}
                    height={484}
                    className="drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Level Progress */}
              <div className="bg-slate-800/50 border border-subtitle-neon-blue/30 rounded-lg p-6">
                <h2 className="font-heading text-2xl text-subtitle-neon-blue mb-4">
                  Progresso
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span>Nível Atual:</span>
                    <span className="font-bold text-primary">{currentLevel}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentLevel / 100) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-logo-gradient-end"
                    ></motion.div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {currentLevel === 100 ? 'Nível máximo atingido!' : `${100 - currentLevel} níveis restantes`}
                  </p>
                </div>
              </div>

              {/* Evolution Info */}
              <div className="bg-slate-800/50 border border-subtitle-neon-blue/30 rounded-lg p-6">
                <h2 className="font-heading text-2xl text-subtitle-neon-blue mb-4">
                  Próxima Evolução
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span>Novo Nível:</span>
                    <span className="font-bold text-primary">{nextLevel}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Custo:</span>
                    <span className="font-bold text-logo-gradient-end">
                      R$ {evolutionCost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Dinheiro Limpo Disponível:</span>
                    <span className={`font-bold ${cleanMoney >= evolutionCost ? 'text-green-400' : 'text-red-400'}`}>
                      R$ {cleanMoney.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {!allItemsAtLevel && (
                    <p className="text-sm text-yellow-400 mt-2">
                      ⚠️ Todos os itens do jogo precisam estar no nível {currentLevel} para evoluir
                    </p>
                  )}
                </div>
              </div>

              {/* Evolution Button */}
              <motion.button
                whileHover={{ scale: canEvolve ? 1.05 : 1 }}
                whileTap={{ scale: canEvolve ? 0.95 : 1 }}
                onClick={handleEvolution}
                disabled={!canEvolve || evolving}
                className={`w-full py-4 px-6 rounded-lg font-heading text-xl font-bold transition-all ${
                  canEvolve
                    ? 'bg-gradient-to-r from-primary to-logo-gradient-end text-white hover:shadow-lg hover:shadow-primary/50 cursor-pointer'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                {evolving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Evoluindo...
                  </span>
                ) : (
                  `EVOLUIR NÍVEL (${nextLevel})`
                )}
              </motion.button>

              {currentLevel === 100 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGreeting(true)}
                  className="w-full py-4 px-6 rounded-lg font-heading text-xl font-bold bg-gradient-to-r from-primary to-logo-gradient-end text-white hover:shadow-lg hover:shadow-primary/50 cursor-pointer transition-all"
                >
                  👑 HOMENAGEM REAL
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Level Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-800/50 border border-subtitle-neon-blue/30 rounded-lg p-6"
          >
            <h2 className="font-heading text-2xl text-subtitle-neon-blue mb-4">
              Marcos de Evolução
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {BARRACO_LEVELS.map(({ level, milestone }) => (
                <div
                  key={level}
                  className={`p-3 rounded-lg text-center font-bold transition-all ${
                    currentLevel >= level
                      ? 'bg-primary/30 border border-primary text-primary'
                      : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                  }`}
                >
                  <div>Nível {level}</div>
                  {milestone && (
                    <div className="text-xs mt-1 text-subtitle-neon-blue">
                      {milestone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
