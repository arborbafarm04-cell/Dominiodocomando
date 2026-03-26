import { useState, useEffect } from 'react';
import { X, Clock3, DollarSign, TrendingUp, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ComercioKey,
  COMERCIOS_CONFIG,
  calcularValorLavagem,
  calcularTempoLavagem,
  calcularTaxaAplicada,
} from '@/types/comercios';
import { ComercioData } from '@/types/comercios';
import { Players } from '@/entities';

interface CommerceOperationModalProps {
  isOpen: boolean;
  commerceId: ComercioKey | null;
  commerceData: ComercioData | null;
  playerData?: Players;
  dirtyMoney: number;
  cleanMoney: number;
  onClose: () => void;
  onStartOperation: (commerceId: ComercioKey) => Promise<void>;
  onCompleteOperation: (commerceId: ComercioKey) => Promise<void>;
}

// Componente de partículas de dinheiro
const MoneyParticles = ({ isActive }: { isActive: boolean }) => {
  const particles = Array.from({ length: 12 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            opacity: 0,
          }}
          animate={
            isActive
              ? {
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 300 - 150,
                  opacity: [0, 1, 0],
                  rotate: Math.random() * 360,
                }
              : {
                  x: 0,
                  y: 0,
                  opacity: 0,
                }
          }
          transition={{
            duration: 2 + Math.random() * 1,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
          }}
          className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-sm"
        />
      ))}
    </div>
  );
};

// Componente de máquina de lavar animada (para lavanderia)
const WashingMachineAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Tambor externo */}
      <motion.div
        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 3, repeat: isActive ? Infinity : 0, ease: 'linear' }}
        className="absolute inset-0 border-4 border-cyan-400/40 rounded-full"
      />

      {/* Tambor interno com dinheiro */}
      <motion.div
        animate={isActive ? { rotate: -360 } : { rotate: 0 }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: 'linear' }}
        className="absolute inset-2 border-2 border-cyan-300/30 rounded-full flex items-center justify-center"
      >
        <DollarSign className="w-8 h-8 text-emerald-400 opacity-60" />
      </motion.div>

      {/* Bolhas */}
      {isActive &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -80, opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute left-1/2 bottom-0 w-2 h-2 bg-cyan-300/40 rounded-full"
          />
        ))}

      {/* Espuma */}
      <motion.div
        animate={isActive ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/10"
      />
    </div>
  );
};

// Barra de progresso animada
const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="relative h-3 rounded-full bg-slate-900/50 border border-cyan-400/20 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)]"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </div>
  );
};

export default function CommerceOperationModal({
  isOpen,
  commerceId,
  commerceData,
  playerData,
  dirtyMoney: propDirtyMoney,
  cleanMoney: propCleanMoney,
  onClose,
  onStartOperation,
  onCompleteOperation,
}: CommerceOperationModalProps) {
  // Use playerData if available, otherwise use props
  const dirtyMoney = playerData?.dirtyMoney ?? propDirtyMoney;
  const cleanMoney = playerData?.cleanMoney ?? propCleanMoney;
  
  // Check if player data is available
  const playerNotFound = !playerData || !playerData._id;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !commerceData?.emAndamento || !commerceData?.horarioFim) return;

    const updateTimer = () => {
      const remaining = Math.max(0, commerceData.horarioFim! - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [isOpen, commerceData?.emAndamento, commerceData?.horarioFim]);

  if (!isOpen || !commerceId || !commerceData) return null;

  // Show error if player data not found
  if (playerNotFound) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-red-400/30 bg-[linear-gradient(180deg,rgba(6,12,24,0.98)_0%,rgba(12,20,36,0.98)_100%)] shadow-[0_0_60px_rgba(255,0,0,0.18)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.08),transparent_35%)]" />

            <div className="relative border-b border-red-400/20 bg-black/20 px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-red-400/70">
                    Erro
                  </p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-wide text-red-200">
                    Jogador Não Encontrado
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full border border-red-400/20 bg-slate-900/70 p-2 text-red-300 transition hover:bg-slate-800 hover:text-red-100"
                  aria-label="Fechar modal"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="relative px-5 py-5 md:px-8 md:py-7">
              <div className="rounded-2xl border border-red-400/20 bg-slate-950/60 p-6 text-center">
                <p className="text-sm text-red-300 mb-4">
                  Não foi possível carregar os dados do jogador. Por favor, recarregue a página e tente novamente.
                </p>
              </div>
            </div>

            <div className="relative flex justify-end gap-3 border-t border-red-400/20 bg-black/20 px-5 py-4 md:px-8">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-black uppercase tracking-wide hover:from-red-400 hover:to-red-500"
              >
                Fechar
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  const config = COMERCIOS_CONFIG[commerceId];
  const valorLavagem = calcularValorLavagem(commerceId, commerceData.nivelNegocio);
  const tempoLavagem = calcularTempoLavagem(commerceId, commerceData.nivelNegocio);
  const taxaAplicada = calcularTaxaAplicada(commerceId, commerceData.nivelTaxa);
  const cleanMoneyGanho = Math.floor(valorLavagem * (taxaAplicada / 100));

  const hoje = new Date().toDateString();
  const jaUsouHoje = commerceData.ultimaDataUso === hoje;

  let status = 'Disponível';
  let statusColor = 'text-emerald-400';
  let statusBg = 'from-emerald-500/20 to-emerald-300/10 border-emerald-400/40';

  if (commerceData.emAndamento) {
    status = 'Lavagem em andamento';
    statusColor = 'text-amber-300';
    statusBg = 'from-amber-500/20 to-orange-300/10 border-amber-400/40';
  } else if (jaUsouHoje && !commerceData.emAndamento) {
    status = 'Limite diário atingido';
    statusColor = 'text-red-300';
    statusBg = 'from-red-500/20 to-red-300/10 border-red-400/40';
  }

  const canStart =
    !commerceData.emAndamento &&
    !jaUsouHoje &&
    dirtyMoney >= valorLavagem;

  const canComplete =
    !!commerceData.emAndamento &&
    !!commerceData.horarioFim &&
    Date.now() >= commerceData.horarioFim;

  const handleStartClick = async () => {
    setError('');
    setIsStarting(true);
    try {
      await onStartOperation(commerceId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao iniciar lavagem';
      setError(errorMsg);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteClick = async () => {
    setError('');
    setIsCompleting(true);
    try {
      await onCompleteOperation(commerceId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao finalizar lavagem';
      setError(errorMsg);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const StatCard = ({
    icon,
    title,
    value,
    valueClass = 'text-cyan-200',
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    valueClass?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {icon}
        <span>{title}</span>
      </div>
      <div className={`mt-3 text-lg md:text-xl font-black ${valueClass}`}>
        {value}
      </div>
    </motion.div>
  );

  const progress = commerceData.emAndamento
    ? Math.max(0, Math.min(100, 100 - (timeLeft / (tempoLavagem / 1000)) * 100))
    : 0;

  const isLavanderia = commerceId === 'lavanderia';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      >
        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,12,24,0.98)_0%,rgba(12,20,36,0.98)_100%)] shadow-[0_0_60px_rgba(0,240,255,0.18)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(157,0,255,0.08),transparent_35%)]" />

          {/* Partículas de dinheiro */}
          <MoneyParticles isActive={commerceData.emAndamento} />

          <div className="relative border-b border-cyan-400/20 bg-black/20 px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
                  Operação de lavagem
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-wide text-cyan-200">
                  {config.nome}
                </h2>

                <div
                  className={`mt-3 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBg} ${statusColor}`}
                >
                  {commerceData.emAndamento ? (
                    <Clock3 className="h-4 w-4" />
                  ) : jaUsouHoje ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{status}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full border border-cyan-400/20 bg-slate-900/70 p-2 text-cyan-300 transition hover:bg-slate-800 hover:text-cyan-100"
                aria-label="Fechar modal"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="relative px-5 py-5 md:px-8 md:py-7">
            {commerceData.emAndamento ? (
              // Estado: EM ANDAMENTO
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Animação especial para lavanderia */}
                {isLavanderia && (
                  <div className="flex justify-center py-8">
                    <WashingMachineAnimation isActive={true} />
                  </div>
                )}

                {/* Barra de progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Progresso da operação
                    </span>
                    <span className="text-sm font-bold text-cyan-300">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <ProgressBar progress={progress} />
                </div>

                {/* Contagem regressiva */}
                <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
                    Tempo restante
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                </div>

                {/* Valor em operação */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    title="Dinheiro em operação"
                    value={formatCurrency(commerceData.valorAtual)}
                    valueClass="text-red-400"
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="Taxa aplicada"
                    value={`${commerceData.taxaAplicada.toFixed(1)}%`}
                    valueClass="text-emerald-400"
                  />
                </div>
              </motion.div>
            ) : canComplete ? (
              // Estado: FINALIZADO - Pronto para coletar
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-black text-emerald-300 mb-2">
                    Operação Concluída!
                  </h3>
                  <p className="text-sm text-slate-400">
                    Sua lavagem foi finalizada com sucesso
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    title="Valor lavado"
                    value={formatCurrency(commerceData.valorAtual)}
                    valueClass="text-red-400"
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="Taxa aplicada"
                    value={`${commerceData.taxaAplicada.toFixed(1)}%`}
                    valueClass="text-amber-400"
                  />
                </div>

                <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/10 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-2">
                    Dinheiro limpo a receber
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-3xl md:text-4xl font-black text-emerald-300"
                  >
                    {formatCurrency(cleanMoneyGanho)}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              // Estado: DISPONÍVEL
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    title="Valor de lavagem"
                    value={formatCurrency(valorLavagem)}
                    valueClass="text-cyan-200"
                  />
                  <StatCard
                    icon={<Clock3 className="h-4 w-4" />}
                    title="Tempo da operação"
                    value={formatTime(Math.ceil(tempoLavagem / 1000))}
                    valueClass="text-amber-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<Zap className="h-4 w-4" />}
                    title="Taxa base"
                    value={`${COMERCIOS_CONFIG[commerceId].taxaBase}%`}
                    valueClass="text-orange-300"
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="Taxa final"
                    value={`${taxaAplicada.toFixed(1)}%`}
                    valueClass="text-emerald-400"
                  />
                </div>

                <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/10 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-2">
                    Dinheiro limpo a receber
                  </p>
                  <div className="text-3xl md:text-4xl font-black text-emerald-300">
                    {formatCurrency(cleanMoneyGanho)}
                  </div>
                </div>

                {/* Informações de requisitos */}
                <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Dinheiro sujo disponível:</span>
                    <span
                      className={
                        dirtyMoney >= valorLavagem
                          ? 'text-emerald-400 font-bold'
                          : 'text-red-400 font-bold'
                      }
                    >
                      {formatCurrency(dirtyMoney)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Dinheiro sujo necessário:</span>
                    <span className="text-cyan-300 font-bold">
                      {formatCurrency(valorLavagem)}
                    </span>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          <div className="relative flex flex-col-reverse gap-3 border-t border-cyan-400/20 bg-black/20 px-5 py-4 md:flex-row md:justify-end md:px-8">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-cyan-400/40 bg-transparent text-cyan-200 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              Fechar
            </Button>

            {commerceData.emAndamento && timeLeft === 0 && canComplete ? (
              <Button
                onClick={handleCompleteClick}
                disabled={isCompleting}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black uppercase tracking-wide hover:from-emerald-400 hover:to-emerald-500"
              >
                {isCompleting ? 'Coletando...' : 'Coletar Dinheiro Limpo'}
              </Button>
            ) : canStart ? (
              <Button
                onClick={handleStartClick}
                disabled={isStarting}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-wide hover:from-cyan-400 hover:to-blue-500"
              >
                {isStarting ? 'Iniciando...' : 'Iniciar Lavagem'}
              </Button>
            ) : (
              <Button
                disabled
                className="bg-slate-700 text-slate-300 cursor-not-allowed font-bold uppercase tracking-wide"
              >
                {jaUsouHoje ? 'Limite Diário Atingido' : 'Indisponível'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
