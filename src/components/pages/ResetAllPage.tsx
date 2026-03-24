import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useBriberyStore } from '@/store/briberyStore';

export default function ResetAllPage() {
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { setCleanMoney } = useCleanMoneyStore();
  const { setDirtyMoney } = useDirtyMoneyStore();
  const { reset: resetGameStore } = useGameStore();
  const { setLevel: setPlayerLevel } = usePlayerStore();
  const { reset: resetBriberyStore } = useBriberyStore();

  useEffect(() => {
    resetAll();
  }, []);

  const resetAll = async () => {
    try {
      setResetting(true);
      setMessage('Iniciando reset global...');

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

      setMessage('Resetando nível global para 1...');

      // Reset player level to 1 in database
      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        level: 1,
        lastUpdated: new Date().toISOString(),
      });

      setMessage('✓ Nível global resetado para 1');

      // Reset all stores
      setMessage('Resetando lojas...');
      setPlayerLevel(1);
      setCleanMoney(1000000000);
      setDirtyMoney(1000000000);
      resetGameStore();
      resetBriberyStore();

      setMessage('✓ Todos os níveis e lojas resetados para 1');
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/';
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
            {success ? '✓ Reset Global Concluído!' : 'Resetando Tudo...'}
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
              Redirecionando para a página inicial em 3 segundos...
            </p>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
