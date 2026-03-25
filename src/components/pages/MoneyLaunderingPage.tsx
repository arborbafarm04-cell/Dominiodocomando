import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Players, MoneyLaunderingBusinesses } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoneyLaunderingBusiness from '@/components/MoneyLaunderingBusiness';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MoneyLaunderingPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [player, setPlayer] = useState<Players | null>(null);
  const [businesses, setBusinesses] = useState<MoneyLaunderingBusinesses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!member?._id) {
          setError('Você precisa estar autenticado para acessar operações de lavagem');
          setIsLoading(false);
          return;
        }

        // Load player data
        const playerData = await BaseCrudService.getById<Players>('players', member._id);
        
        if (!playerData) {
          setError('Dados do jogador não encontrados. Por favor, faça login novamente.');
          setIsLoading(false);
          return;
        }

        setPlayer(playerData);

        // Load money laundering businesses
        const result = await BaseCrudService.getAll<MoneyLaunderingBusinesses>('moneylaunderingbusinesses');
        setBusinesses(result.items || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados de operações. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [member?._id]);

  if (!member?._id) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Acesso Restrito</h1>
          <p className="text-lg text-secondary mb-8">Você precisa estar autenticado para acessar operações de lavagem</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/80">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-foreground mt-4">Carregando operações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-destructive mb-4">Erro</h1>
          <p className="text-lg text-foreground mb-8">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/80">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Navigation Buttons */}
      <div className="fixed top-24 left-6 z-20 flex gap-3">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="bg-[#FF4500]/20 border-[#FF4500] text-white hover:bg-[#FF4500]/40"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="bg-[#00eaff]/20 border-[#00eaff] text-white hover:bg-[#00eaff]/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-2">
              💧 Operações de Lavagem
            </h1>
            <p className="text-lg text-secondary">
              Jogador: <span className="font-bold">{player?.playerName || 'Desconhecido'}</span>
            </p>
            <p className="text-lg text-secondary">
              Dinheiro Sujo: <span className="font-bold text-orange-400">${player?.dirtyMoney?.toLocaleString() || 0}</span>
            </p>
            <p className="text-lg text-secondary">
              Dinheiro Limpo: <span className="font-bold text-green-400">${player?.cleanMoney?.toLocaleString() || 0}</span>
            </p>
          </div>

          {/* Businesses Grid */}
          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/70">Nenhuma operação de lavagem disponível no momento.</p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
