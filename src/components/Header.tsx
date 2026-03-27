import { usePlayerStore } from '@/store/playerStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { destroySession } from '@/services/authService';

export default function Header() {
  const navigate = useNavigate();
  
  // Get player data from centralized store
  const { 
    playerName, 
    level, 
    dirtyMoney, 
    cleanMoney, 
    barracoLevel,
    player,
    reset
  } = usePlayerStore();

  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-sm border-b border-secondary/30 sticky top-0 z-50">
      <div className="w-full max-w-[120rem] mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end bg-clip-text text-transparent">
            COMPLEXO
          </div>
          <div className="text-xs text-secondary">v1.0</div>
        </motion.div>

        {/* Player Stats - Center */}
        {player && playerName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-secondary">LVL:</span>
              <span className="font-bold text-white">{level}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary">🏠:</span>
              <span className="font-bold text-white">{barracoLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-logo-gradient-start">💵:</span>
              <span className="font-bold text-logo-gradient-start">{formatMoney(dirtyMoney)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">💚:</span>
              <span className="font-bold text-green-400">{formatMoney(cleanMoney)}</span>
            </div>
          </motion.div>
        )}

        {/* Navigation - Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {player ? (
            <>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="text-secondary hover:text-white hover:bg-secondary/10"
              >
                <span className="hidden sm:inline">{playerName || 'Perfil'}</span>
              </Button>
              <Button
                onClick={async () => {
                  await destroySession();
                  reset();
                  navigate('/');
                }}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-secondary hover:text-white hover:bg-secondary/10"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Início</span>
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="bg-primary hover:bg-primary/80 text-white"
              >
                Entrar
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </header>
  );
}