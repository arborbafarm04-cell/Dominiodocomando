import { useState, useEffect, useRef } from 'react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const BASE_EVOLUTION_COST = 500;
const COST_MULTIPLIER = 1.1;

export default function ResetBarracoPage() {
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const initRef = useRef(false); // Prevent double initialization

  useEffect(() => {
    // Skip if already initialized
    if (initRef.current) return;
    initRef.current = true;

    resetBarraco();
  }, []);

  const calculateEvolutionCost = (currentLevel: number): number => {
    return Math.round(BASE_EVOLUTION_COST * Math.pow(COST_MULTIPLIER, currentLevel - 1));
  };

  const resetBarraco = async () => {
    try {
      setResetting(true);
      setMessage('Iniciando reset do Barraco...');

      // Get player ID
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('playerId');
      let playerId = idFromUrl || localStorage.getItem('currentPlayerId') || '';

      if (!playerId) {
        const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
        if (result.items && result.items.length > 0) {
          playerId = result.items[0]._id;
        } else {
          setMessage('Erro: Nenhum jogador encontrado');
          setLoading(false);
          return;
        }
      }

      // Get current player data
      const playerData = await BaseCrudService.getById<Players>('players', playerId);
      
      if (!playerData) {
        setMessage('Erro: Jogador não encontrado');
        setLoading(false);
        return;
      }

      const currentLevel = playerData.level || 1;
      setMessage(`Barraco atual: Nível ${currentLevel}`);

      // Calculate the cost that was spent to reach level 100 from level 99
      const costToLevel100 = calculateEvolutionCost(99);
      
      setMessage(`Custo do nível 99→100: R$ ${costToLevel100.toLocaleString('pt-BR')}`);

      // Reset player level to 1 and restore cleanMoney
      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        level: 1,
        cleanMoney: (playerData.cleanMoney || 0) + costToLevel100,
        lastUpdated: new Date().toISOString(),
      });

      setMessage(`✓ Barraco resetado para nível 1`);
      
      setMessage(`✓ Dinheiro limpo restaurado: R$ ${costToLevel100.toLocaleString('pt-BR')}`);
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/barraco';
      }, 3000);
    } catch (err) {
      setMessage(`Erro ao resetar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setLoading(false);
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">

      
      <main className="max-w-[100rem] mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="font-heading text-4xl font-bold text-primary">
            {success ? '✓ Reset Concluído!' : 'Resetando Barraco...'}
          </h1>
          
          <div className={`p-6 rounded-lg border ${
            success 
              ? 'bg-green-500/20 border-green-500' 
              : 'bg-blue-500/20 border-blue-500'
          }`}>
            <p className={`text-lg ${success ? 'text-green-200' : 'text-blue-200'}`}>
              {message}
            </p>
          </div>

          {!success && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {success && (
            <p className="text-slate-400">
              Redirecionando para o Barraco em 3 segundos...
            </p>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
