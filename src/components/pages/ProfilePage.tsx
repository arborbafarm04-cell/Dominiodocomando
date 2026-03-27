import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Mail, Calendar, LogOut, Gamepad2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/playerStore';
import { destroySession } from '@/services/authService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const player = usePlayerStore((state) => state.player);
  const reset = usePlayerStore((state) => state.reset);
  const { level, barracoLevel, dirtyMoney, cleanMoney } = usePlayerStore();

  useEffect(() => {
    if (!player?._id) {
      navigate('/login');
    }
  }, [player?._id, navigate]);

  if (!player) {
    return null;
  }

  const playerName = player?.playerName || 'Jogador';
  const playerEmail = player?.email || 'jogador@complexo.com';
  const playerPhoto = player?.profilePicture || 'https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png?originWidth=128&originHeight=128';
  const createdDate = player?._createdDate ? new Date(player._createdDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-background/50 backdrop-blur-sm border-2 border-secondary/30 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-secondary relative" style={{
                  boxShadow: '0 0 30px rgba(0,234,255,0.8), inset 0 0 15px rgba(0,234,255,0.3)'
                }}>
                  <Image
                    src={playerPhoto}
                    alt={playerName}
                    width={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                  {playerName}
                </h1>
                <p className="font-paragraph text-lg text-secondary mb-4">
                  Jogador Multiplayer
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-5 h-5 text-secondary" />
                    <span className="font-paragraph">{playerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span className="font-paragraph">Membro desde {createdDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Member Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
            >
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-secondary" />
                Estatísticas do Jogo
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Nível:</span>
                  <span className="font-heading text-sm font-bold text-secondary">
                    {level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Casa:</span>
                  <span className="font-heading text-sm font-bold text-secondary">
                    Nível {barracoLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Dinheiro Sujo:</span>
                  <span className="font-heading text-sm font-bold text-orange-400">
                    ${dirtyMoney?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Dinheiro Limpo:</span>
                  <span className="font-heading text-sm font-bold text-green-400">
                    ${cleanMoney?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Informações da Conta
            </h2>
            <div className="space-y-3 font-paragraph text-foreground/70">
              <p>
                Acesso irrestrito ao sistema de jogo multiplayer.
              </p>
              <p>
                Todos os seus dados de progresso e estatísticas são salvos automaticamente.
              </p>
              <p className="text-xs">
                Status: <span className="text-foreground/50 font-mono">Ativo e Irrestrito</span>
              </p>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              onClick={async () => {
                await destroySession();
                reset();
                navigate('/');
              }}
              className="bg-destructive hover:bg-destructive/90 text-white font-heading font-bold px-8 py-2 rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
