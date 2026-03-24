import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '@/components/Footer';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { usePlayerStore } from '@/store/playerStore';
import { useBriberyStore, type BriberyConsequence } from '@/store/briberyStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const CONSEQUENCE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const consequences: BriberyConsequence[] = [
  'x9_title',
  'business_closed',
  'weapon_seized',
  'gang_detained',
  'car_towed',
];

const consequenceMessages: Record<BriberyConsequence, string> = {
  x9_title: 'Você recebeu o título de X9! Não pode rodar o slot por 24h.',
  business_closed: 'Seus negócios foram fechados! Não pode lavar dinheiro por 24h.',
  weapon_seized: 'Sua última arma foi apreendida! Pode comprar outra em 24h.',
  gang_detained: 'Sua quadrilha foi detida! Não pode evoluir o Barraco por 24h.',
  car_towed: 'Seu último carro foi rebocado! Pague multa e taxa do guincho com dinheiro limpo.',
};

export default function BriberyPage() {
  const navigate = useNavigate();
  const { dirtyMoney, removeDirtyMoney } = useDirtyMoneyStore();
  const { level } = usePlayerStore();
  const {
    getBriberyAmount,
    addConsequence,
    hasConsequence,
    getActiveConsequences,
  } = useBriberyStore();

  const [dialogStage, setDialogStage] = useState<'initial' | 'accepted' | 'reported' | 'consequence'>('initial');
  const [selectedConsequence, setSelectedConsequence] = useState<BriberyConsequence | null>(null);
  const [showConsequenceMessage, setShowConsequenceMessage] = useState(false);

  const briberyAmount = getBriberyAmount(level);
  const canAfford = dirtyMoney >= briberyAmount;

  // Check if player is within valid level range (1-9)
  useEffect(() => {
    if (level < 1 || level > 9) {
      navigate('/game');
    }
  }, [level, navigate]);

  const handleAccept = () => {
    if (!canAfford) return;

    removeDirtyMoney(briberyAmount);
    setDialogStage('accepted');

    // Auto-return to game after 3 seconds
    setTimeout(() => {
      navigate('/game');
    }, 3000);
  };

  const handleReport = () => {
    // Select a random consequence
    const randomConsequence = consequences[Math.floor(Math.random() * consequences.length)];
    setSelectedConsequence(randomConsequence);
    addConsequence(randomConsequence, CONSEQUENCE_DURATION);
    setDialogStage('reported');
    setShowConsequenceMessage(true);

    // Auto-return to game after 4 seconds
    setTimeout(() => {
      navigate('/game');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">


      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8 pt-32 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Guard Character */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-logo-gradient-end rounded-lg flex items-center justify-center border-2 border-secondary">
                <span className="text-6xl">👮</span>
              </div>
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
              Policial
            </h2>
            <p className="font-paragraph text-secondary text-sm">Nível {level}</p>
          </motion.div>

          {/* Dialog Box */}
          <AnimatePresence mode="wait">
            {dialogStage === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-secondary rounded-lg p-8 mb-8 shadow-lg shadow-secondary/20"
              >
                <p className="font-paragraph text-foreground text-lg leading-relaxed mb-6">
                  "Olha só… achei meio suspeito esse movimento aí no seu território. Mas relaxa… a rua é cheia de buracos e eu posso acabar olhando pro lado errado se alguém ajudar a lubrificar a engrenagem."
                </p>

                <div className="bg-slate-800/50 border border-secondary/30 rounded p-4 mb-6">
                  <p className="font-paragraph text-secondary text-sm mb-2">
                    Custo do suborno:
                  </p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    R$ {briberyAmount.toLocaleString('pt-BR')}
                  </p>
                  <p className="font-paragraph text-xs text-foreground/60 mt-2">
                    Seu dinheiro sujo: R$ {dirtyMoney.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Active Consequences Warning */}
                {getActiveConsequences().length > 0 && (
                  <div className="bg-destructive/10 border border-destructive rounded p-4 mb-6">
                    <p className="font-paragraph text-destructive text-sm font-bold mb-2">
                      ⚠️ Consequências Ativas:
                    </p>
                    {getActiveConsequences().map((consequence) => (
                      <p key={consequence} className="font-paragraph text-destructive text-xs">
                        • {consequenceMessages[consequence]}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleAccept}
                    disabled={!canAfford}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading text-lg h-12 rounded-lg"
                  >
                    {canAfford ? 'Aceitar Suborno' : 'Sem Dinheiro Suficiente'}
                  </Button>
                  <Button
                    onClick={handleReport}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-heading text-lg h-12 rounded-lg"
                  >
                    Denunciar
                  </Button>
                </div>
              </motion.div>
            )}

            {dialogStage === 'accepted' && (
              <motion.div
                key="accepted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-secondary rounded-lg p-8 mb-8 shadow-lg shadow-secondary/20"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mb-4"
                  >
                    <span className="text-5xl">💰</span>
                  </motion.div>
                </div>

                <p className="font-paragraph text-foreground text-lg leading-relaxed text-center mb-6">
                  "Boa decisão. A rua continua tranquila… e eu continuo distraído. ...nos veremos em breve."
                </p>

                <div className="bg-primary/20 border border-primary rounded p-4 text-center">
                  <p className="font-heading text-primary text-xl font-bold">
                    -R$ {briberyAmount.toLocaleString('pt-BR')} (Dinheiro Sujo)
                  </p>
                </div>

                <p className="font-paragraph text-secondary text-sm text-center mt-6">
                  Retornando ao mapa...
                </p>
              </motion.div>
            )}

            {dialogStage === 'reported' && (
              <motion.div
                key="reported"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-destructive rounded-lg p-8 mb-8 shadow-lg shadow-destructive/20"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mb-4"
                  >
                    <span className="text-5xl">⚠️</span>
                  </motion.div>
                </div>

                <p className="font-paragraph text-foreground text-lg leading-relaxed text-center mb-6">
                  "Interessante… resolveu bancar o cidadão exemplar? Vamos ver se a cidade gosta de gente assim."
                </p>

                {showConsequenceMessage && selectedConsequence && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/20 border border-destructive rounded p-4 text-center"
                  >
                    <p className="font-heading text-destructive text-lg font-bold mb-2">
                      Consequência Aplicada!
                    </p>
                    <p className="font-paragraph text-destructive text-sm">
                      {consequenceMessages[selectedConsequence]}
                    </p>
                  </motion.div>
                )}

                <p className="font-paragraph text-secondary text-sm text-center mt-6">
                  Retornando ao mapa...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-foreground/60 font-paragraph text-sm"
          >
            <p>Operação de Suborno - Nível {level} de 9</p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
