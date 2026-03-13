import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useBriberyStore, type BriberyConsequence } from '@/store/briberyStore';
import { useGameStore } from '@/store/gameStore';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type DialogState = 'initial' | 'accepting' | 'denying' | 'consequence';

export default function BriberyGuardPage() {
  const navigate = useNavigate();
  const { dirtyMoney, removeDirtyMoney } = useDirtyMoneyStore();
  const { playerLevel, setPlayerLevel } = useGameStore();
  const { getBriberyAmount, getNextBriberyAmount, addConsequence, hasConsequence } = useBriberyStore();
  
  const [dialogState, setDialogState] = useState<DialogState>('initial');
  const [consequence, setConsequence] = useState<BriberyConsequence | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const briberyAmount = getBriberyAmount(playerLevel);
  const nextBriberyAmount = getNextBriberyAmount(playerLevel);

  const getRandomConsequence = (): BriberyConsequence => {
    const consequences: BriberyConsequence[] = [
      'x9_title',
      'business_closed',
      'weapon_seized',
      'gang_detained',
      'car_towed',
    ];
    return consequences[Math.floor(Math.random() * consequences.length)];
  };

  const getConsequenceText = (type: BriberyConsequence): string => {
    const texts: Record<BriberyConsequence, string> = {
      x9_title: 'Você recebeu o título de X9. Não pode rodar o slot por 24h.',
      business_closed: 'Seus negócios foram fechados. Não pode lavar dinheiro por 24h.',
      weapon_seized: 'Sua última arma comprada foi apreendida. Pode comprar outra em 24h.',
      gang_detained: 'Sua quadrilha foi detida. Não pode evoluir o Barraco por 24h.',
      car_towed: 'Seu último carro de fuga foi rebocado. Pague multa e taxa do guincho com dinheiro limpo.',
    };
    return texts[type];
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    
    if (dirtyMoney < briberyAmount) {
      setIsProcessing(false);
      alert('Você não tem dinheiro sujo suficiente!');
      return;
    }

    // Debit dirty money
    removeDirtyMoney(briberyAmount);

    // Update level if not at max
    if (playerLevel < 9) {
      setPlayerLevel(playerLevel + 1);
    }

    setDialogState('accepting');
    
    setTimeout(() => {
      setIsProcessing(false);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 2000);
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    const randomConsequence = getRandomConsequence();
    setConsequence(randomConsequence);
    
    // Add consequence for 24 hours
    addConsequence(randomConsequence, 24 * 60 * 60 * 1000);
    
    setDialogState('denying');
    
    setTimeout(() => {
      setDialogState('consequence');
      setIsProcessing(false);
    }, 2000);
  };

  const handleCloseConsequence = () => {
    navigate('/');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a1f2e] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {dialogState === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <div className="relative bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-[#FF4500] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(255,69,0,0.5)]">
                {/* Background accent */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF4500]/20 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                  {/* Guard Image */}
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className="relative w-48 h-48 mx-auto md:mx-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/30 to-[#00eaff]/30 rounded-lg blur-xl" />
                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_d7566da71ac74a66b1cc396cffeedfde~mv2.png?originWidth=192&originHeight=192"
                        alt="Guarda da Polícia"
                        width={192}
                        className="relative w-full h-full object-cover rounded-lg border-2 border-[#FF4500]"
                      />
                    </div>
                  </div>

                  {/* Dialog Text */}
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#FF4500] mb-4">
                        Proposta do Guarda
                      </h2>

                      <p className="font-paragraph text-base md:text-lg text-white/90 mb-8 leading-relaxed">
                        "Olha só… achei meio suspeito esse movimento aí no seu território. Mas relaxa… a rua é cheia de buracos e eu posso acabar olhando pro lado errado se alguém ajudar a lubrificar a engrenagem."
                      </p>

                      {/* Bribery Info */}
                      <div className="mb-8 p-4 bg-[#FF4500]/10 border border-[#FF4500]/50 rounded-lg">
                        <p className="font-paragraph text-sm text-white/80 mb-2">
                          <span className="text-[#00eaff] font-bold">Nível {playerLevel}</span> de <span className="text-[#00eaff] font-bold">9</span>
                        </p>
                        <p className="font-paragraph text-lg text-white/90">
                          Valor do Suborno: <span className="text-[#FF4500] font-bold">R$ {briberyAmount.toLocaleString('pt-BR')}</span>
                        </p>
                        <p className="font-paragraph text-sm text-white/70 mt-2">
                          Próximo nível: R$ {nextBriberyAmount.toLocaleString('pt-BR')}
                        </p>
                        <p className="font-paragraph text-sm text-white/70 mt-2">
                          Dinheiro Sujo Disponível: <span className="text-[#00eaff]">R$ {dirtyMoney.toLocaleString('pt-BR')}</span>
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAccept}
                          disabled={isProcessing || dirtyMoney < briberyAmount}
                          className="flex-1 px-8 py-3 bg-gradient-to-r from-[#FF4500] to-[#FF0000] text-white font-heading font-bold text-lg tracking-wider rounded-lg border-2 border-[#FF4500] hover:shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processando...' : 'Aceitar Suborno'}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeny}
                          disabled={isProcessing}
                          className="flex-1 px-8 py-3 bg-gradient-to-r from-[#00eaff] to-[#0099cc] text-black font-heading font-bold text-lg tracking-wider rounded-lg border-2 border-[#00eaff] hover:shadow-[0_0_20px_rgba(0,234,255,0.8)] transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processando...' : 'Denunciar'}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {dialogState === 'accepting' && (
            <motion.div
              key="accepting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <div className="relative bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-[#00eaff] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,234,255,0.5)]">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#00eaff]/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#00eaff] mb-6">
                      Suborno Aceito!
                    </h2>

                    <p className="font-paragraph text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                      "Boa decisão. A rua continua tranquila… e eu continuo distraído. ...nos veremos em breve."
                    </p>

                    <div className="space-y-4 mb-8">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-[#FF4500]/10 border border-[#FF4500]/50 rounded-lg"
                      >
                        <p className="font-paragraph text-white/90">
                          <span className="text-[#FF4500] font-bold">-R$ {briberyAmount.toLocaleString('pt-BR')}</span> de Dinheiro Sujo
                        </p>
                      </motion.div>

                      {playerLevel < 9 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 bg-[#00eaff]/10 border border-[#00eaff]/50 rounded-lg"
                        >
                          <p className="font-paragraph text-white/90">
                            <span className="text-[#00eaff] font-bold">Nível Aumentado</span> para {playerLevel + 1}/9
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <p className="font-paragraph text-sm text-white/60">
                      Retornando ao menu principal...
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {dialogState === 'denying' && (
            <motion.div
              key="denying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <div className="relative bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-[#FF0000] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(255,0,0,0.5)]">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF0000]/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#FF0000] mb-6">
                      Denúncia Registrada!
                    </h2>

                    <p className="font-paragraph text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                      "Interessante… resolveu bancar o cidadão exemplar? Vamos ver se a cidade gosta de gente assim."
                    </p>

                    <p className="font-paragraph text-sm text-white/60">
                      Processando consequências...
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {dialogState === 'consequence' && consequence && (
            <motion.div
              key="consequence"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <div className="relative bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] border-2 border-[#FF0000] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(255,0,0,0.5)]">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF0000]/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-8 md:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#FF0000] mb-8 text-center">
                      Consequência Aplicada
                    </h2>

                    <div className="mb-8 p-6 bg-[#FF0000]/10 border-2 border-[#FF0000]/50 rounded-lg">
                      <p className="font-paragraph text-lg text-white/90 text-center">
                        {getConsequenceText(consequence)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="font-paragraph text-sm text-white/60 mb-6">
                        Duração: 24 horas
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCloseConsequence}
                        className="px-8 py-3 bg-gradient-to-r from-[#FF4500] to-[#FF0000] text-white font-heading font-bold text-lg tracking-wider rounded-lg border-2 border-[#FF4500] hover:shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 uppercase"
                      >
                        Voltar ao Menu
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
