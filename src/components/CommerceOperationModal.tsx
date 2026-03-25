import { useState, useEffect } from 'react';
import { X, Clock3, DollarSign, Landmark, BadgeDollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import {
  ComercioKey,
  COMERCIOS_CONFIG,
  calcularValorLavagem,
  calcularTempoLavagem,
  calcularTaxaAplicada,
} from '@/types/comercios';
import { ComercioData } from '@/types/comercios';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';

interface CommerceOperationModalProps {
  isOpen: boolean;
  commerceId: ComercioKey | null;
  commerceData: ComercioData | null;
  dirtyMoney: number;
  cleanMoney: number;
  onClose: () => void;
  onStartOperation: (commerceId: ComercioKey) => Promise<void>;
  onCompleteOperation: (commerceId: ComercioKey) => Promise<void>;
}

export default function CommerceOperationModal({
  isOpen,
  commerceId,
  commerceData,
  dirtyMoney: propDirtyMoney,
  cleanMoney: propCleanMoney,
  onClose,
  onStartOperation,
  onCompleteOperation,
}: CommerceOperationModalProps) {
  const { dirtyMoney: storeDirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney: storeCleanMoney } = useCleanMoneyStore();

  const dirtyMoney = propDirtyMoney ?? storeDirtyMoney;
  const cleanMoney = propCleanMoney ?? storeCleanMoney;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !commerceData?.emAndamento || !commerceData?.horarioFim) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Number(commerceData.horarioFim) - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);

    return () => clearInterval(interval);
  }, [isOpen, commerceData?.emAndamento, commerceData?.horarioFim]);

  if (!isOpen || !commerceId || !commerceData) return null;

  const config = COMERCIOS_CONFIG[commerceId];
  const valorLavagem = calcularValorLavagem(commerceId, commerceData.nivelNegocio);
  const tempoLavagem = calcularTempoLavagem(commerceId, commerceData.nivelNegocio);
  const taxaAplicada = calcularTaxaAplicada(commerceId, commerceData.nivelTaxa);
  const descontoEfetivo = COMERCIOS_CONFIG[commerceId].taxaBase - taxaAplicada;
  const cleanMoneyGanho = Math.floor(valorLavagem * (1 - taxaAplicada / 100));

  const hoje = new Date().toDateString();
  const jaUsouHoje = commerceData.ultimaDataUso === hoje;

  let status = 'Disponível';
  let statusColor = 'text-emerald-400';
  let statusBg = 'from-emerald-500/20 to-emerald-300/10 border-emerald-400/40';

  if (commerceData.emAndamento && timeLeft > 0) {
    status = 'Lavagem em andamento';
    statusColor = 'text-amber-300';
    statusBg = 'from-amber-500/20 to-orange-300/10 border-amber-400/40';
  } else if (commerceData.emAndamento && timeLeft === 0) {
    status = 'Pronto para finalizar';
    statusColor = 'text-emerald-300';
    statusBg = 'from-emerald-500/20 to-cyan-300/10 border-emerald-400/40';
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
    Date.now() >= Number(commerceData.horarioFim);

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
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

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
        <div
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,12,24,0.98)_0%,rgba(12,20,36,0.98)_100%)] shadow-[0_0_60px_rgba(0,240,255,0.18)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,240,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(157,0,255,0.08),transparent_35%)]" />

          <div className="relative border-b border-cyan-400/20 bg-black/20 px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
                  Operação de lavagem
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-wide text-cyan-200">
                  {config.nome}
                </h2>

                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBg} ${statusColor}`}>
                  {commerceData.emAndamento && timeLeft > 0 ? (
                    <Clock3 className="h-4 w-4" />
                  ) : jaUsouHoje && !commerceData.emAndamento ? (
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
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-200"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Valor de lavagem"
                value={formatCurrency(valorLavagem)}
                valueClass="text-cyan-200"
              />

              <StatCard
                icon={<Clock3 className="h-4 w-4" />}
                title="Tempo da operação"
                value={formatTime(Math.floor(tempoLavagem / 1000))}
                valueClass="text-sky-200"
              />

              <StatCard
                icon={<DollarSign className="h-4 w-4" />}
                title="Taxa base"
                value={`${COMERCIOS_CONFIG[commerceId].taxaBase}%`}
                valueClass="text-orange-300"
              />

              <StatCard
                icon={<Landmark className="h-4 w-4" />}
                title="Desconto de eficiência"
                value={`-${descontoEfetivo.toFixed(1)}%`}
                valueClass="text-emerald-300"
              />

              <StatCard
                icon={<DollarSign className="h-4 w-4" />}
                title="Taxa final"
                value={`${taxaAplicada.toFixed(1)}%`}
                valueClass="text-yellow-300"
              />

              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro limpo recebido"
                value={formatCurrency(cleanMoneyGanho)}
                valueClass="text-emerald-400"
              />
            </div>
{commerceData.emAndamento && timeLeft > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6"
              >
                <div className="absolute inset-0 pointer-events-none bubble-layer" />

                <div className="mx-auto flex max-w-xl flex-col items-center">
                  <div className="mb-4 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                      Lavagem em andamento
                    </p>
                    <p className="mt-2 text-2xl font-black text-cyan-100">
                      {config.nome}
                    </p>
                  </div>

                  <div className="washing-machine-shell relative">
                    <div className="washing-machine-top" />
                    <div className="washing-machine-door">
                      <div className="washing-water" />
                      <div className="washing-foam" />

                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_52816f04141f4a9da4968c9fc0d195ed~mv2.png?originWidth=320&originHeight=320"
                        className="money money-1"
                        alt="Nota de dinheiro"
                        width={54}
                      />
                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_06991c44a73240d98831b7c9698471dd~mv2.png?originWidth=320&originHeight=320"
                        className="money money-2"
                        alt="Nota de dinheiro"
                        width={54}
                      />
                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_42b96a0c285f49ccb4e4eb3f40b00d37~mv2.png?originWidth=320&originHeight=320"
                        className="money money-3"
                        alt="Nota de dinheiro"
                        width={54}
                      />
                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_4351298730eb4cd091262ebb334ccb3b~mv2.png?originWidth=320&originHeight=320"
                        className="money money-4"
                        alt="Nota de dinheiro"
                        width={54}
                      />
                      <Image
                        src="https://static.wixstatic.com/media/50f4bf_518b74c8e93e496c96c526e535527e70~mv2.png?originWidth=320&originHeight=320"
                        className="money money-5"
                        alt="Nota de dinheiro"
                        width={54}
                      />
                    </div>
                  </div>

                  <div className="mt-6 w-full rounded-2xl border border-cyan-400/20 bg-black/30 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Tempo restante
                    </p>
                    <p className="mt-2 text-3xl font-black text-cyan-200 font-mono">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                <style>{`
                  .washing-machine-shell {
                    position: relative;
                    width: 320px;
                    height: 360px;
                    border-radius: 32px;
                    background: linear-gradient(180deg, #dfe7ef 0%, #bfcad6 100%);
                    box-shadow:
                      0 20px 60px rgba(0, 0, 0, 0.45),
                      inset 0 2px 0 rgba(255, 255, 255, 0.6);
                    border: 4px solid rgba(255, 255, 255, 0.6);
                  }

                  .washing-machine-top {
                    position: absolute;
                    top: 18px;
                    left: 24px;
                    right: 24px;
                    height: 34px;
                    border-radius: 18px;
                    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
                  }

                  .washing-machine-door {
                    position: absolute;
                    left: 50%;
                    top: 88px;
                    transform: translateX(-50%);
                    width: 220px;
                    height: 220px;
                    border-radius: 9999px;
                    overflow: hidden;
                    background:
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 30%),
                      radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1), transparent 40%),
                      linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%);
                    border: 12px solid #94a3b8;
                    box-shadow:
                      inset 0 0 40px rgba(255,255,255,0.08),
                      0 0 30px rgba(34,211,238,0.18);
                  }

                  .washing-water {
                    position: absolute;
                    inset: 30% 0 0 0;
                    background: linear-gradient(180deg, rgba(59,130,246,0.15), rgba(14,165,233,0.6));
                    animation: slosh 3s ease-in-out infinite;
                  }

                  .washing-foam {
                    position: absolute;
                    inset: 18% 0 0 0;
                    background:
                      radial-gradient(circle at 20% 60%, rgba(255,255,255,0.9) 0 8px, transparent 9px),
                      radial-gradient(circle at 40% 40%, rgba(255,255,255,0.8) 0 10px, transparent 11px),
                      radial-gradient(circle at 65% 55%, rgba(255,255,255,0.85) 0 12px, transparent 13px),
                      radial-gradient(circle at 80% 35%, rgba(255,255,255,0.75) 0 9px, transparent 10px);
                    opacity: 0.9;
                    animation: foamMove 4s linear infinite;
                  }

                  .money {
                    position: absolute;
                    width: 54px;
                    height: auto;
                    filter: drop-shadow(0 0 8px rgba(34,197,94,0.25));
                    user-select: none;
                  }

                  .money-1 {
                    left: 20%;
                    top: 48%;
                    animation: spinMoney1 3.2s ease-in-out infinite;
                  }
                  .money-2 {
                    left: 58%;
                    top: 38%;
                    animation: spinMoney2 3.8s ease-in-out infinite;
                  }
                  .money-3 {
                    left: 42%;
                    top: 62%;
                    animation: spinMoney3 4.1s ease-in-out infinite;
                  }
                  .money-4 {
                    left: 66%;
                    top: 58%;
                    animation: spinMoney4 3.4s ease-in-out infinite;
                  }
                  .money-5 {
                    left: 26%;
                    top: 34%;
                    animation: spinMoney5 4.4s ease-in-out infinite;
                  }

                  .bubble-layer::before,
                  .bubble-layer::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background:
                      radial-gradient(circle at 8% 90%, rgba(255,255,255,0.35) 0 8px, transparent 9px),
                      radial-gradient(circle at 20% 80%, rgba(255,255,255,0.25) 0 6px, transparent 7px),
                      radial-gradient(circle at 35% 92%, rgba(255,255,255,0.3) 0 10px, transparent 11px),
                      radial-gradient(circle at 52% 86%, rgba(255,255,255,0.28) 0 7px, transparent 8px),
                      radial-gradient(circle at 68% 94%, rgba(255,255,255,0.22) 0 9px, transparent 10px),
                      radial-gradient(circle at 82% 88%, rgba(255,255,255,0.3) 0 8px, transparent 9px),
                      radial-gradient(circle at 94% 90%, rgba(255,255,255,0.24) 0 6px, transparent 7px);
                    animation: bubblesUp 7s linear infinite;
                    pointer-events: none;
                  }

                  .bubble-layer::after {
                    animation-duration: 9s;
                    opacity: 0.7;
                  }

                  @keyframes slosh {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-4px) rotate(-2deg); }
                    50% { transform: translateY(2px) rotate(2deg); }
                    75% { transform: translateY(-3px) rotate(-1deg); }
                  }

                  @keyframes foamMove {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(8px); }
                    100% { transform: translateX(0); }
                  }

                  @keyframes bubblesUp {
                    0% { transform: translateY(24px); opacity: 0; }
                    15% { opacity: 1; }
                    100% { transform: translateY(-120px); opacity: 0; }
                  }

                  @keyframes spinMoney1 {
                    0%, 100% { transform: translate(0,0) rotate(0deg) scale(1); }
                    50% { transform: translate(18px,-12px) rotate(180deg) scale(1.08); }
                  }
                  @keyframes spinMoney2 {
                    0%, 100% { transform: translate(0,0) rotate(8deg) scale(1); }
                    50% { transform: translate(-14px,16px) rotate(-160deg) scale(0.95); }
                  }
                  @keyframes spinMoney3 {
                    0%, 100% { transform: translate(0,0) rotate(-10deg) scale(1); }
                    50% { transform: translate(12px,-18px) rotate(170deg) scale(1.1); }
                  }
                  @keyframes spinMoney4 {
                    0%, 100% { transform: translate(0,0) rotate(0deg) scale(1); }
                    50% { transform: translate(-18px,-10px) rotate(220deg) scale(0.96); }
                  }
                  @keyframes spinMoney5 {
                    0%, 100% { transform: translate(0,0) rotate(12deg) scale(1); }
                    50% { transform: translate(16px,12px) rotate(-200deg) scale(1.05); }
                  }
                `}</style>
              </motion.div>
            )}

            {commerceData.emAndamento && timeLeft === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-6 rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.12)]"
              >
                <p className="text-xl font-black uppercase text-emerald-300">
                  Operação concluída
                </p>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Clique em <strong>Finalizar Lavagem</strong> para receber o dinheiro limpo.
                </p>
              </motion.div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro sujo disponível"
                value={formatCurrency(dirtyMoney)}
                valueClass="text-red-300"
              />

              <StatCard
                icon={<BadgeDollarSign className="h-4 w-4" />}
                title="Dinheiro limpo total"
                value={formatCurrency(cleanMoney)}
                valueClass="text-emerald-400"
              />
            </div>
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
                {isCompleting ? 'Finalizando...' : 'Finalizar Lavagem'}
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
