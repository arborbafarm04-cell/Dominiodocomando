import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { MoneyLaunderingBusinesses } from '@/entities';
import { usePlayerStore } from '@/store/playerStore';
import { getPlayer } from '@/services/playerCoreService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoneyLaunderingBusiness from '@/components/MoneyLaunderingBusiness';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MoneyLaunderingPage() {
  const navigate = useNavigate();

  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [businesses, setBusinesses] = useState<MoneyLaunderingBusinesses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initRef = useRef(false);

  useEffect(() => {
    if (!player?._id) {
      navigate('/login');
    }
  }, [player?._id, navigate]);

  useEffect(() => {
    if (initRef.current || !player?._id) return;

    initRef.current = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const freshPlayer = await getPlayer(player._id);
        if (!freshPlayer) {
          setError('Erro ao carregar jogador');
          return;
        }

        setPlayer(freshPlayer);

        const result =
          await BaseCrudService.getAll<MoneyLaunderingBusinesses>('moneylaunderingbusinesses');
        setBusinesses(result.items || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados de operações. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [player?._id, setPlayer]);

  const reloadPlayer = async () => {
    if (!player?._id) return;

    try {
      const freshPlayer = await getPlayer(player._id);
      if (freshPlayer) {
        setPlayer(freshPlayer);
      }
    } catch (err) {
      console.error('Erro ao recarregar dados do jogador:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <LoadingSpinner />
        <p className="text-foreground mt-4 text-sm sm:text-base">Carregando operações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-destructive mb-4">Erro</h1>
          <p className="text-base sm:text-lg text-foreground mb-8">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/80 text-sm sm:text-base">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="fixed top-20 left-3 sm:left-6 z-20 flex gap-2 sm:gap-3">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="bg-[#FF4500]/20 border-[#FF4500] text-white hover:bg-[#FF4500]/40 text-xs sm:text-sm"
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="bg-[#00eaff]/20 border-[#00eaff] text-white hover:bg-[#00eaff]/40 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
      </div>

      <main className="flex-1 w-full max-w-full mx-auto px-3 sm:px-4 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-2">
              💧 Operações de Lavagem
            </h1>
            <p className="text-base sm:text-lg text-secondary">
              Jogador:{' '}
              <span className="font-bold">
                {player?.playerName || member?.profile?.nickname || 'Desconhecido'}
              </span>
            </p>
            <p className="text-base sm:text-lg text-secondary">
              Dinheiro Sujo:{' '}
              <span className="font-bold text-orange-400">
                ${(player?.dirtyMoney ?? 0).toLocaleString()}
              </span>
            </p>
            <p className="text-base sm:text-lg text-secondary">
              Dinheiro Limpo:{' '}
              <span className="font-bold text-green-400">
                ${(player?.cleanMoney ?? 0).toLocaleString()}
              </span>
            </p>
          </div>

          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {businesses.map((business) => (
                <MoneyLaunderingBusiness
                  key={business._id}
                  businessId={business._id}
                  businessName={business.businessName || 'Negócio'}
                  initialValue={business.initialValue || 1000}
                  initialRate={business.initialRate || 10}
                  baseTime={business.baseTime || 1}
                  businessImage={business.businessImage || ''}
                  currentRate={business.initialRate || 10}
                  currentMaxValue={player?.dirtyMoney || 0}
                  currentTimeMultiplier={1}
                  onOperationComplete={reloadPlayer}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-base sm:text-lg text-foreground/70">
                Nenhuma operação de lavagem disponível no momento.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}