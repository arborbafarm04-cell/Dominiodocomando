import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const BARRACO_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const BASE_EVOLUTION_COST = 500;
const COST_MULTIPLIER = 1.5;

export default function BarracoPage() {
  const [player, setPlayer] = useState<Players | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolving, setEvolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allItemsAtLevel, setAllItemsAtLevel] = useState(false);

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
      setPlayer(playerData);
      
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
    // Return the provided image for all levels
    // In a full implementation, you'd have different images for each milestone
    return 'https://static.wixstatic.com/media/50f4bf_99aa35fbb009493a96d4ede6c1af056b~mv2.png';
  };

  const handleEvolution = async () => {
    if (!player || !allItemsAtLevel) return;

    const nextLevel = (player.level || 1) + 1;
    if (nextLevel > 100) {
      setError('Barraco already at maximum level (100)');
      return;
    }

    try {
      setEvolving(true);
      setError(null);

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
            <p className="text-subtitle-neon-blue text-lg">
              Nível Global: <span className="font-bold">{currentLevel}</span>
            </p>
          </div>

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
                <Image
                  src={barraco_image}
                  alt={`Barraco Level ${currentLevel}`}
                  width={400}
                  height={400}
                  className="relative z-10 drop-shadow-2xl"
                />
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
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-green-200 text-center">
                  🎉 Parabéns! Seu Barraco atingiu o nível máximo!
                </div>
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
              {BARRACO_LEVELS.map((level) => (
                <div
                  key={level}
                  className={`p-3 rounded-lg text-center font-bold transition-all ${
                    currentLevel >= level
                      ? 'bg-primary/30 border border-primary text-primary'
                      : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                  }`}
                >
                  Nível {level}
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
