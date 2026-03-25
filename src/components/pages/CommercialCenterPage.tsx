
import { Image } from '@/components/ui/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMember } from '@/integrations';
import { comerciosService } from '@/services/comerciosService';
import { Comercios, COMERCIOS_KEYS, ComercioKey } from '@/types/comercios';
import ComercioCard from '@/components/ComercioCard';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import CommercialCenterHotspots from '@/components/CommercialCenterHotspots';
import CommerceOperationModal from '@/components/CommerceOperationModal';

interface CommerceOperation {
  id: string;
  name: string;
  value: number;
  tax: number;
  duration: number; // in seconds
  startTime?: number;
  isActive: boolean;
  timeLeft?: number;
  progress?: number;
}

interface CompletedOperation {
  id: string;
  name: string;
  cleanValue: number;
  profit: number;
  date: string;
}

export default function CommercialCenterPage() {
  const { member } = useMember();
  const [comercios, setComercios] = useState<Comercios | null>(null);
  const [playerData, setPlayerData] = useState<Players | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operations, setOperations] = useState<CommerceOperation[]>([
    {
      id: 'commerce2',
      name: 'Administradora de Bens',
      value: 5000,
      tax: 50,
      duration: 18000, // 5 hours
      isActive: false,
    },
  ]);

  const [completedOps, setCompletedOps] = useState<CompletedOperation[]>([]);

  // Modal state
  const [activeCommerceModal, setActiveCommerceModal] = useState<ComercioKey | null>(null);

  // Carregar dados do jogador
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!member?._id) return;
      try {
        let player = await BaseCrudService.getById<Players>('players', member._id);
        
        // Se o jogador não existe, criar um novo
        if (!player) {
          console.log('📝 Criando novo jogador para:', member._id);
          const initialComerciosData = {
            pizzaria: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
            admBens: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
            lavanderia: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
            academia: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
            templo: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
          };
          
          const newPlayer: Players = {
            _id: member._id,
            playerName: member.profile?.nickname || 'Jogador',
            cleanMoney: 0,
            dirtyMoney: 1000,
            level: 1,
            progress: 0,
            comercios: JSON.stringify(initialComerciosData),
            isGuest: false,
            profilePicture: member.profile?.photo?.url,
          };
          
          await BaseCrudService.create('players', newPlayer);
          setPlayerData(newPlayer);
          setComercios(initialComerciosData);
          console.log('✅ Jogador criado com sucesso');
        } else {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          if (!comerciosData) {
            console.warn('⚠️ Comercios não encontrados, inicializando...');
            const initialComerciosData = {
              pizzaria: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
              admBens: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
              lavanderia: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
              academia: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
              templo: { nivelNegocio: 0, nivelTaxa: 0, ultimaDataUso: null, emAndamento: false, horarioFim: null, valorAtual: 0, taxaAplicada: 0 },
            };
            setComercios(initialComerciosData);
            // Salvar no banco de dados
            await BaseCrudService.update<Players>('players', {
              _id: member._id,
              comercios: JSON.stringify(initialComerciosData),
            });
          } else {
            setComercios(comerciosData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do jogador:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlayerData();
  }, [member?._id]);

  // Atualizar dados periodicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!member?._id) return;
      try {
        const player = await BaseCrudService.getById<Players>('players', member._id);
        if (player) {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          setComercios(comerciosData);
        }
      } catch (error) {
        console.error('Erro ao atualizar dados:', error);
      }
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [member?._id]);

  const handleIniciarLavagem = async (comercioKey: ComercioKey) => {
    if (!member?._id || !playerData) return;
    try {
      const resultado = await comerciosService.iniciarLavagem(
        member._id,
        comercioKey,
        playerData.dirtyMoney || 0
      );
      if (resultado.sucesso) {
        const player = await BaseCrudService.getById<Players>('players', member._id);
        if (player) {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          setComercios(comerciosData);
        }
      } else {
        alert(resultado.mensagem);
      }
    } catch (error) {
      console.error('Erro ao iniciar lavagem:', error);
      alert('Erro ao iniciar lavagem');
    }
  };

  const handleFinalizarLavagem = async (comercioKey: ComercioKey) => {
    if (!member?._id) return;
    try {
      const resultado = await comerciosService.finalizarLavagem(member._id, comercioKey);
      if (resultado.sucesso) {
        const player = await BaseCrudService.getById<Players>('players', member._id);
        if (player) {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          setComercios(comerciosData);
        }
      } else {
        alert(resultado.mensagem);
      }
    } catch (error) {
      console.error('Erro ao finalizar lavagem:', error);
      alert('Erro ao finalizar lavagem');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const openCommerceModal = (commerceId: string) => {
    console.log('RECEBIDO DO HOTSPOT:', commerceId);

    // Map commerce IDs to ComercioKey
    const commerceKeyMap: { [key: string]: ComercioKey } = {
      pizzaria: 'pizzaria',
      admBens: 'admBens',
      templo: 'templo',
      academia: 'academia',
      lavanderia: 'lavanderia',
    };

    const comercioKey = commerceKeyMap[commerceId];
    console.log('MAPEADO PARA:', comercioKey);

    if (comercioKey) {
      setActiveCommerceModal(comercioKey);
    }
  };

  const closeCommerceModal = () => {
    setActiveCommerceModal(null);
  };

  const handleStartOperation = async (comercioKey: ComercioKey) => {
    if (!playerData || !member?._id) {
      throw new Error('Dados do jogador não disponíveis');
    }
    try {
      console.log('🚀 Iniciando lavagem para:', comercioKey);
      console.log('💰 Dinheiro sujo disponível:', playerData.dirtyMoney);
      
      const resultado = await comerciosService.iniciarLavagem(
        member._id,
        comercioKey,
        playerData.dirtyMoney || 0
      );
      
      console.log('📊 Resultado da operação:', resultado);
      
      if (resultado.sucesso) {
        console.log('✅ Lavagem iniciada com sucesso');
        // Atualizar dados do jogador
        const player = await BaseCrudService.getById<Players>('players', member._id);
        if (player) {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          setComercios(comerciosData);
          closeCommerceModal();
        }
      } else {
        console.error('❌ Erro ao iniciar lavagem:', resultado.mensagem);
        throw new Error(resultado.mensagem);
      }
    } catch (error) {
      console.error('💥 Erro na operação:', error);
      throw error;
    }
  };

  const handleCompleteOperation = async (comercioKey: ComercioKey) => {
    if (!playerData || !member?._id) {
      throw new Error('Dados do jogador não disponíveis');
    }
    try {
      console.log('🏁 Finalizando lavagem para:', comercioKey);
      
      const resultado = await comerciosService.finalizarLavagem(member._id, comercioKey);
      
      console.log('📊 Resultado da finalização:', resultado);
      
      if (resultado.sucesso) {
        console.log('✅ Lavagem finalizada com sucesso. Dinheiro limpo ganho:', resultado.cleanMoneyGanho);
        // Atualizar dados do jogador
        const player = await BaseCrudService.getById<Players>('players', member._id);
        if (player) {
          setPlayerData(player);
          const comerciosData = player.comercios ? JSON.parse(player.comercios) : null;
          setComercios(comerciosData);
          closeCommerceModal();
        }
      } else {
        console.error('❌ Erro ao finalizar lavagem:', resultado.mensagem);
        throw new Error(resultado.mensagem);
      }
    } catch (error) {
      console.error('💥 Erro na operação:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Inject custom CSS for neon effects and animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gridMove {
        from { background-position: 0 0; }
        to { background-position: 100px 100px; }
      }

      @keyframes pulse {
        from {
          text-shadow:
            0 0 10px #00f0ff,
            0 0 20px #00f0ff,
            0 0 30px #00f0ff;
          opacity: 0.9;
        }
        to {
          text-shadow:
            0 0 20px #00f0ff,
            0 0 40px #00f0ff,
            0 0 80px #00f0ff,
            0 0 120px #00f0ff;
          opacity: 1;
        }
      }

      @keyframes neonBorder {
        0%, 100% {
          border-color: #00f0ff;
          box-shadow: 0 0 10px #00f0ff, inset 0 0 10px rgba(0, 240, 255, 0.1);
        }
        50% {
          border-color: #9d00ff;
          box-shadow: 0 0 20px #9d00ff, inset 0 0 15px rgba(157, 0, 255, 0.15);
        }
      }

      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }

      .neon-sign {
        color: #00f0ff;
        text-shadow:
          0 0 5px #00f0ff,
          0 0 10px #00f0ff,
          0 0 20px #00f0ff,
          0 0 40px #00f0ff,
          0 0 80px #00f0ff;
        animation: pulse 3s infinite alternate;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .commercial-grid {
        background: linear-gradient(to bottom, #0a0015, #000814);
        position: relative;
        overflow: hidden;
      }

      .commercial-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 240, 255, 0.03) 10px,
          rgba(0, 240, 255, 0.03) 20px
        );
        animation: gridMove 60s linear infinite;
        pointer-events: none;
      }

      .container-neon {
        border: 2px solid #00f0ff;
        background: rgba(10, 0, 30, 0.6);
        backdrop-filter: blur(10px);
        animation: neonBorder 4s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .container-neon::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(0, 240, 255, 0.1),
          transparent
        );
        animation: shimmer 3s infinite;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      .banner-container {
        position: relative;
        overflow: hidden;
        border-bottom: 3px solid #00f0ff;
        box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1);
        min-height: 600px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .banner-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: none;
        pointer-events: none;
      }

      .commerce-card {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 0;
        transition: all 0.3s ease;
        min-height: 280px;
      }

      .commerce-card:hover {
        box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
      }

      .commerce-card.active {
        border-color: #00ff00;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }

      .commerce-card.completed {
        border-color: #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }

      .commerce-image {
        width: 100%;
        height: 100%;
        border-right: 3px solid #00f0ff;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
      }

      .commerce-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .commerce-content {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(0, 240, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f0ff, #00ff00);
        transition: width 0.1s linear;
        box-shadow: 0 0 10px #00f0ff;
      }

      .timer-display {
        font-family: 'Courier New', monospace;
        font-size: 1.25rem;
        font-weight: bold;
        color: #00f0ff;
        text-shadow: 0 0 10px #00f0ff;
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      .history-table th,
      .history-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #00f0ff;
        color: #00f0ff;
      }

      .history-table th {
        background: rgba(0, 240, 255, 0.1);
        font-weight: bold;
      }

      .history-table tr:hover {
        background: rgba(0, 240, 255, 0.05);
      }

      @media (max-width: 768px) {
        .commerce-card {
          grid-template-columns: 150px 1fr;
          min-height: 220px;
        }

        .commerce-content {
          padding: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="commercial-grid min-h-screen flex flex-col">
      <Header />
      
      {/* WELCOME TITLE */}
      <div className="w-full pt-[120px] px-4 relative z-10">
        <div className="max-w-[100rem] mx-auto mb-8">
          <h1 className="neon-sign text-4xl md:text-5xl text-center">Bem-vindo ao Complexo</h1>
        </div>
      </div>

      {/* BANNER */}
      <div className="w-full relative z-10">
        <div className="banner-container w-full flex items-center justify-center relative px-4">
          <div className="relative w-full max-w-[1100px] mx-auto z-0">
            <Image
              src="https://static.wixstatic.com/media/50f4bf_fd64ac461d5d41c2a6bc7639af7590ac~mv2.png"
              alt="Centro Comercial"
              className="block h-auto w-full max-h-[600px] object-contain border-none"
            />
            <CommercialCenterHotspots onCommerceClick={openCommerceModal} />
          </div>
        </div>
      </div>

      {/* PLAYER INFO */}
      {playerData && (
        <div className="w-full px-4 py-6 relative z-10 border-b border-cyan-500/30">
          <div className="max-w-[100rem] mx-auto flex justify-between items-center">
            <div className="text-cyan-300">
              <span className="text-sm text-gray-400">Dinheiro Sujo:</span>
              <span className="ml-2 font-bold text-green-400">${playerData.dirtyMoney || 0}</span>
            </div>
            <div className="text-cyan-300">
              <span className="text-sm text-gray-400">Dinheiro Limpo:</span>
              <span className="ml-2 font-bold text-yellow-400">${playerData.cleanMoney || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* OPERATIONS */}
      <div className="w-full px-4 py-12 relative z-10">
        <div className="max-w-[100rem] mx-auto">
          {isLoading ? (
            <div className="text-center text-cyan-300">Carregando comércios...</div>
          ) : comercios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMERCIOS_KEYS.map((key) => (
                <ComercioCard
                  key={key}
                  comercioKey={key}
                  data={comercios[key]}
                  onIniciar={() => handleIniciarLavagem(key)}
                  onFinalizar={() => handleFinalizarLavagem(key)}
                  dirtyMoney={playerData?.dirtyMoney || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-cyan-300">Erro ao carregar comércios</div>
          )}
        </div>
      </div>

      {/* HISTORY */}
      {completedOps.length > 0 && (
        <div className="w-full px-4 py-12 relative z-10 border-t border-cyan-500">
          <div className="max-w-[100rem] mx-auto">
            <h2 className="neon-sign text-2xl mb-6">Histórico de Operações</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Comércio</th>
                  <th>Data</th>
                  <th>Valor Lavado</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                {completedOps.map((op) => (
                  <tr key={op.id}>
                    <td>{op.name}</td>
                    <td>{op.date}</td>
                    <td>{formatCurrency(op.cleanValue)}</td>
                    <td className="text-green-400 font-bold">
                      {formatCurrency(op.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commerce Operation Modal */}
      {activeCommerceModal && (
        <CommerceOperationModal
          isOpen={true}
          commerceId={activeCommerceModal}
          commerceData={
            comercios?.[activeCommerceModal] || {
              nivelNegocio: 1,
              nivelTaxa: 1,
              emAndamento: false,
              ultimaDataUso: '',
              horarioFim: null,
            }
          }
          dirtyMoney={playerData?.dirtyMoney || 0}
          cleanMoney={playerData?.cleanMoney || 0}
          onClose={closeCommerceModal}
          onStartOperation={handleStartOperation}
          onCompleteOperation={handleCompleteOperation}
        />
      )}

      {/* TEMPORARY TEST BUTTON */}
      <Button
        onClick={() => setActiveCommerceModal('pizzaria')}
        className="fixed bottom-10 right-10 z-[9999] bg-orange-500 hover:bg-orange-600 text-white font-bold"
      >
        TESTAR MODAL
      </Button>

      <Footer />
    </div>
  );
}
